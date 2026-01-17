
import { pool } from '../db.js';
import { generateTripCode } from '../utils/tripCode.js';

async function verify() {
    try {
        console.log("=== STARTING VERIFICATION ===");

        const suffix = Math.floor(Math.random() * 10000);
        const vehicle = `MH-TEST-${suffix}`;

        // 1. Create Trip A
        console.log("1. Creating Trip A...");
        const resA = await pool.query(`
      INSERT INTO trips (trip_code, loading_date, from_location, to_location, vehicle_number, party_name, apartment)
      VALUES ($1, $2, 'LocA', 'LocB', $3, 'PartyA', 'Apt 101')
      RETURNING *
    `, [await generateTripCode('2025-01-01'), '2025-01-01', vehicle]);

        const tripA = resA.rows[0];
        console.log(`   Trip A Created: ${tripA.trip_code}, Apartment: ${tripA.apartment}`);

        if (tripA.apartment !== 'Apt 101') throw new Error("Apartment field not saved correctly");

        // 2. Soft Delete Trip A
        console.log("2. Soft Deleting Trip A...");
        await pool.query(`UPDATE trips SET is_deleted=true, trip_code=trip_code || '_DEL' WHERE id=$1`, [tripA.id]);

        const tripA_del = (await pool.query(`SELECT trip_code, is_deleted FROM trips WHERE id=$1`, [tripA.id])).rows[0];
        console.log(`   Trip A Deleted Code: ${tripA_del.trip_code}`);

        if (!tripA_del.trip_code.endsWith('_DEL')) throw new Error("Trip code does not have _DEL suffix");

        // 3. Create Trip B (Should continue sequence)
        console.log("3. Creating Trip B...");
        const codeB = await generateTripCode('2025-01-01');
        const resB = await pool.query(`
      INSERT INTO trips (trip_code, loading_date, from_location, to_location, vehicle_number, party_name)
      VALUES ($1, $2, 'LocA', 'LocB', $3, 'PartyB')
      RETURNING *
    `, [codeB, '2025-01-01', vehicle]);

        const tripB = resB.rows[0];
        console.log(`   Trip B Created: ${tripB.trip_code}`);

        // Check sequence
        const numA = parseInt(tripA.trip_code.split('_')[2]);
        const numB = parseInt(tripB.trip_code.split('_')[2]);

        if (numB !== numA + 1) throw new Error(`Sequence broken! A: ${numA}, B: ${numB}`);
        console.log("   Sequence continued correctly!");

        // 4. Restore Trip A
        console.log("4. Restoring Trip A...");
        await pool.query(`UPDATE trips SET is_deleted=false, trip_code=REPLACE(trip_code, '_DEL', '') WHERE id=$1`, [tripA.id]);

        const tripA_restored = (await pool.query(`SELECT trip_code FROM trips WHERE id=$1`, [tripA.id])).rows[0];
        console.log(`   Trip A Restored Code: ${tripA_restored.trip_code}`);

        if (tripA_restored.trip_code !== tripA.trip_code) throw new Error("Trip A code not restored correctly");

        console.log("=== VERIFICATION SUCCESS ===");

    } catch (err) {
        console.error("VERIFICATION FAILED:", err);
    } finally {
        process.exit();
    }
}

verify();
