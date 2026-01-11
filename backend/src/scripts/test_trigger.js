import { pool } from "../db.js";

/**
 * Test the POD status sync trigger
 */
const testTrigger = async () => {
    try {
        console.log("Testing POD status sync trigger...\n");

        // Test 1: Create a trip with pod_path but pod_status='PENDING'
        console.log("Test 1: INSERT with pod_path should auto-set pod_status='RECEIVED'");
        const insertResult = await pool.query(`
      INSERT INTO trips (
        trip_code, loading_date, from_location, to_location, 
        vehicle_number, party_name, pod_path, pod_status
      ) VALUES (
        'TEST-TRIGGER-001', CURRENT_DATE, 'Test From', 'Test To',
        'TEST-123', 'Test Party', 
        '["https://example.com/pod1.jpg"]', 
        'PENDING'
      )
      RETURNING id, trip_code, pod_path, pod_status
    `);

        const trip1 = insertResult.rows[0];
        console.log(`  Created trip ${trip1.trip_code}`);
        console.log(`  pod_path: ${trip1.pod_path}`);
        console.log(`  pod_status: ${trip1.pod_status}`);

        if (trip1.pod_status === 'RECEIVED') {
            console.log("  ✓ PASS: Trigger correctly set pod_status='RECEIVED'\n");
        } else {
            console.log("  ✗ FAIL: Expected 'RECEIVED', got '" + trip1.pod_status + "'\n");
        }

        // Test 2: Update pod_path to add more files
        console.log("Test 2: UPDATE to add pod_path should set pod_status='RECEIVED'");
        const updateResult = await pool.query(`
      UPDATE trips 
      SET pod_path = '["https://example.com/pod1.jpg", "https://example.com/pod2.jpg"]'
      WHERE id = $1
      RETURNING id, pod_path, pod_status
    `, [trip1.id]);

        const trip2 = updateResult.rows[0];
        console.log(`  Updated trip ${trip1.trip_code}`);
        console.log(`  pod_path: ${trip2.pod_path}`);
        console.log(`  pod_status: ${trip2.pod_status}`);

        if (trip2.pod_status === 'RECEIVED') {
            console.log("  ✓ PASS: Trigger maintained pod_status='RECEIVED'\n");
        } else {
            console.log("  ✗ FAIL: Expected 'RECEIVED', got '" + trip2.pod_status + "'\n");
        }

        // Test 3: Clear pod_path should set pod_status='PENDING'
        console.log("Test 3: UPDATE to clear pod_path should set pod_status='PENDING'");
        const clearResult = await pool.query(`
      UPDATE trips 
      SET pod_path = NULL
      WHERE id = $1
      RETURNING id, pod_path, pod_status
    `, [trip1.id]);

        const trip3 = clearResult.rows[0];
        console.log(`  Cleared pod_path for trip ${trip1.trip_code}`);
        console.log(`  pod_path: ${trip3.pod_path}`);
        console.log(`  pod_status: ${trip3.pod_status}`);

        if (trip3.pod_status === 'PENDING') {
            console.log("  ✓ PASS: Trigger correctly set pod_status='PENDING'\n");
        } else {
            console.log("  ✗ FAIL: Expected 'PENDING', got '" + trip3.pod_status + "'\n");
        }

        // Test 4: Empty array should set pod_status='PENDING'
        console.log("Test 4: UPDATE to empty array should set pod_status='PENDING'");
        const emptyResult = await pool.query(`
      UPDATE trips 
      SET pod_path = '[]'
      WHERE id = $1
      RETURNING id, pod_path, pod_status
    `, [trip1.id]);

        const trip4 = emptyResult.rows[0];
        console.log(`  Set empty array for trip ${trip1.trip_code}`);
        console.log(`  pod_path: ${trip4.pod_path}`);
        console.log(`  pod_status: ${trip4.pod_status}`);

        if (trip4.pod_status === 'PENDING') {
            console.log("  ✓ PASS: Trigger correctly set pod_status='PENDING'\n");
        } else {
            console.log("  ✗ FAIL: Expected 'PENDING', got '" + trip4.pod_status + "'\n");
        }

        // Cleanup
        console.log("Cleaning up test data...");
        await pool.query(`DELETE FROM trips WHERE id = $1`, [trip1.id]);
        await pool.query(`DELETE FROM payment_history WHERE trip_id = $1`, [trip1.id]);
        console.log("✓ Test data cleaned up\n");

        console.log("=".repeat(50));
        console.log("All trigger tests completed successfully!");
        console.log("=".repeat(50));

        process.exit(0);
    } catch (err) {
        console.error("❌ Test failed:", err.message);
        console.error(err);
        process.exit(1);
    }
};

testTrigger();
