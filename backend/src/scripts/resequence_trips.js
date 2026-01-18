
import { pool } from '../db.js';

async function resequence() {
    const client = await pool.connect();
    console.log("=== STARTING RESEQUENCING FOR ALL MONTHS ===");

    try {
        await client.query("BEGIN");

        const monthsRes = await client.query(`
      SELECT DISTINCT SUBSTRING(trip_code FROM 1 FOR 7) as prefix 
      FROM trips 
      WHERE is_deleted=false AND length(trip_code) = 11
    `);

        for (const mRow of monthsRes.rows) {
            const prefix = mRow.prefix;
            console.log(`Processing Month: ${prefix}`);

            const tripsRes = await client.query(`
        SELECT id, trip_code 
        FROM trips 
        WHERE is_deleted=false AND trip_code LIKE $1
        ORDER BY trip_code ASC
        FOR UPDATE
      `, [`${prefix}_%`]);

            let expectedNum = 1;
            let updates = 0;

            for (const trip of tripsRes.rows) {
                const parts = trip.trip_code.split('_');
                const currentNum = parseInt(parts[2]);

                if (currentNum !== expectedNum) {
                    const newCode = `${prefix}_${String(expectedNum).padStart(3, '0')}`;
                    console.log(`   Fixing Trip ${trip.id}: ${trip.trip_code} -> ${newCode}`);

                    await client.query("UPDATE trips SET trip_code=$1 WHERE id=$2", [newCode, trip.id]);
                    await client.query("UPDATE payment_history SET trip_code=$1 WHERE trip_id=$2", [newCode, trip.id]);
                    updates++;
                }
                expectedNum++;
            }
            console.log(`   Updates for ${prefix}: ${updates}`);
        }

        await client.query("COMMIT");
        console.log("=== RESEQUENCING COMPLETE ===");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("RESEQUENCE FAILED:", err);
    } finally {
        client.release();
        // pool.end() not needed if we want to keep app alive, but this is a script.
        // However, importing from db.js implies we share the pool instance. 
        // If db.js pool is global, we should be fine. 
        // But script needs to exit.
        process.exit();
    }
}

resequence();
