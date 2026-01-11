import { pool } from "../db.js";

/**
 * One-time migration script to fix existing POD status inconsistencies
 * 
 * This script finds all trips where:
 * - pod_path has content (files uploaded)
 * - but pod_status is still 'PENDING'
 * 
 * And updates them to pod_status = 'RECEIVED'
 */

const fixPodStatus = async () => {
    try {
        console.log("Starting POD status consistency fix...\n");

        // Find all trips with inconsistent pod_status
        const inconsistentTrips = await pool.query(`
      SELECT id, trip_code, pod_path, pod_status
      FROM trips
      WHERE pod_path IS NOT NULL 
        AND pod_path != '' 
        AND pod_path != '[]'
        AND pod_status != 'RECEIVED'
    `);

        console.log(`Found ${inconsistentTrips.rows.length} trips with inconsistent POD status.\n`);

        if (inconsistentTrips.rows.length === 0) {
            console.log("✓ No inconsistencies found. All trips are already consistent!");
            process.exit(0);
        }

        // Display trips that will be fixed
        console.log("Trips to be fixed:");
        inconsistentTrips.rows.forEach((trip, index) => {
            console.log(`  ${index + 1}. Trip ${trip.trip_code} (ID: ${trip.id}) - Status: ${trip.pod_status}`);
        });
        console.log("");

        // Fix the inconsistencies
        const updateResult = await pool.query(`
      UPDATE trips
      SET pod_status = 'RECEIVED'
      WHERE pod_path IS NOT NULL 
        AND pod_path != '' 
        AND pod_path != '[]'
        AND pod_status != 'RECEIVED'
      RETURNING id, trip_code
    `);

        console.log(`✓ Successfully updated ${updateResult.rows.length} trips to pod_status='RECEIVED'\n`);

        // Verify the fix
        const remainingInconsistent = await pool.query(`
      SELECT COUNT(*) as count
      FROM trips
      WHERE pod_path IS NOT NULL 
        AND pod_path != '' 
        AND pod_path != '[]'
        AND pod_status != 'RECEIVED'
    `);

        if (remainingInconsistent.rows[0].count === 0) {
            console.log("✓ Verification passed: All POD statuses are now consistent!");
        } else {
            console.warn(`⚠ Warning: ${remainingInconsistent.rows[0].count} trips still have inconsistent status`);
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Fix failed:", err.message);
        console.error(err);
        process.exit(1);
    }
};

fixPodStatus();
