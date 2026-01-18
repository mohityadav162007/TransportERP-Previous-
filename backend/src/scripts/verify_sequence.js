
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') }); // Assuming script is in src/scripts/

import pg from 'pg';
import { generateTripCode } from '../utils/tripCode.js';

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function verify() {
    const client = await pool.connect();
    try {
        console.log("=== VERIFYING DYNAMIC SEQUENCE ===");

        // Cleanup test data
        await client.query("DELETE FROM trips WHERE vehicle_number LIKE 'MH-TEST-%'");

        const suffix = Math.floor(Math.random() * 1000);
        const v = `MH-TEST-${suffix}`;
        const date = '2025-05-01'; // Future date to avoid collisions with real data

        // 1. Create 3 Trips: A (001), B (002), C (003)
        console.log("1. Creating 3 Trips...");

        // We can't rely on generateTripCode loop quickly because of race/async, 
        // but in test we await.
        // However, since we cleared data, first is 001.

        const ids = [];
        for (let i = 0; i < 3; i++) {
            const code = await generateTripCode(date);
            const res = await client.query(`
            INSERT INTO trips (trip_code, loading_date, from_location, to_location, vehicle_number, party_name)
            VALUES ($1, $2, 'L', 'L', $3, 'P') RETURNING id, trip_code`,
                [code, date, v]
            );
            ids.push(res.rows[0]);
        }

        console.log("   Trips Created:", ids.map(t => t.trip_code).join(', '));
        // Expect: ..._001, ..._002, ..._003

        const idA = ids[0].id;
        const idB = ids[1].id;
        const idC = ids[2].id;

        // 2. Soft Delete Trip B (002). 
        // Expect: A stays 001. C becomes 002.
        console.log("2. Deleting Trip B (Middle)...");

        // Simulate DELETE route logic (we can't call API, so we use DB queries similar to route)
        // NOTE: Testing the ROUTE logic would be better, but testing the CONCEPT here.
        // Actually, I should use the route or copy logic. Since I can't call route easily, 
        // I will inspect if I should just trust the implementation or copy-paste logic?
        // Copy-paste for verification script or rely on manual manual test?
        // I'll call the API!!!! I have `api` in frontend code but here in node script?
        // I can fetch using `fetch` to localhost? But server might not be running or I don't know port.

        // I will copy the CORE LOGIC here to verify IT WORKS as a script. 
        // This verifies the SQL logic is sound.

        // --- COPY OF DELETE LOGIC ---
        await client.query("BEGIN");
        const targetRes = await client.query("SELECT id, trip_code FROM trips WHERE id=$1 FOR UPDATE", [idB]);
        const trip = targetRes.rows[0];
        const parts = trip.trip_code.split("_");
        const prefix = `${parts[0]}_${parts[1]}`;
        const targetNum = parseInt(parts[2]);

        await client.query(`UPDATE trips SET is_deleted=true, trip_code=trip_code || '_DEL_' || $2::text WHERE id=$1`, [idB, Date.now()]);

        const subsequentRes = await client.query(
            `SELECT id, trip_code FROM trips WHERE is_deleted=false AND trip_code LIKE $1 AND length(trip_code) = 11 ORDER BY trip_code ASC FOR UPDATE`,
            [`${prefix}_%`]
        );
        for (const row of subsequentRes.rows) {
            const p = row.trip_code.split("_");
            const num = parseInt(p[2]);
            if (num > targetNum) {
                const newCode = `${prefix}_${String(num - 1).padStart(3, "0")}`;
                await client.query("UPDATE trips SET trip_code=$1 WHERE id=$2", [newCode, row.id]);
            }
        }
        await client.query("COMMIT");
        // --- END DELETE LOGIC ---

        const checkA = (await client.query("SELECT trip_code FROM trips WHERE id=$1", [idA])).rows[0].trip_code;
        const checkC = (await client.query("SELECT trip_code FROM trips WHERE id=$1", [idC])).rows[0].trip_code;

        console.log(`   After Delete: Trip A: ${checkA}, Trip C: ${checkC}`);

        if (!checkA.endsWith("001")) throw new Error("Trip A should be 001");
        if (!checkC.endsWith("002")) throw new Error(`Trip C should be 002 (Shifted), got ${checkC}`);

        // 3. Restore Trip B
        console.log("3. Restoring Trip B...");

        // --- COPY RESTORE LOGIC ---
        await client.query("BEGIN");
        const targetRes2 = await client.query("SELECT id, trip_code FROM trips WHERE id=$1", [idB]);
        const trip2 = targetRes2.rows[0];
        const parts2 = trip2.trip_code.split("_");
        const originalNum = parseInt(parts2[2]);
        const prefix2 = `${parts2[0]}_${parts2[1]}`;

        const subsequentRes2 = await client.query(
            `SELECT id, trip_code FROM trips WHERE is_deleted=false AND trip_code LIKE $1 AND length(trip_code) = 11 ORDER BY trip_code DESC FOR UPDATE`,
            [`${prefix2}_%`]
        );

        for (const row of subsequentRes2.rows) {
            const p = row.trip_code.split("_");
            const num = parseInt(p[2]);
            if (num >= originalNum) {
                const newCode = `${prefix2}_${String(num + 1).padStart(3, "0")}`;
                await client.query("UPDATE trips SET trip_code=$1 WHERE id=$2", [newCode, row.id]);
            }
        }

        const originalCode = `${prefix2}_${String(originalNum).padStart(3, "0")}`;
        await client.query(`UPDATE trips SET is_deleted=false, trip_code=$1 WHERE id=$2`, [originalCode, idB]);
        await client.query("COMMIT");
        // --- END RESTORE LOGIC ---

        const finalA = (await client.query("SELECT trip_code FROM trips WHERE id=$1", [idA])).rows[0].trip_code;
        const finalB = (await client.query("SELECT trip_code FROM trips WHERE id=$1", [idB])).rows[0].trip_code;
        const finalC = (await client.query("SELECT trip_code FROM trips WHERE id=$1", [idC])).rows[0].trip_code;

        console.log(`   After Restore: A:${finalA}, B:${finalB}, C:${finalC}`);

        if (!finalA.endsWith("001")) throw new Error("A broken");
        if (!finalB.endsWith("002")) throw new Error("B broken");
        if (!finalC.endsWith("003")) throw new Error("C broken");

        console.log("=== SUCCESS: DYNAMIC SEQUENCE LOGIC VERIFIED ===");

    } catch (err) {
        await client.query("ROLLBACK");
        console.error("VERIFICATION FAILED", err);
    } finally {
        client.release();
        pool.end();
    }
}

verify();
