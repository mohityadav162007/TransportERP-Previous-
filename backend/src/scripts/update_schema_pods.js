
import { pool } from "../db.js";

async function updateSchema() {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        console.log("Adding columns to trips table...");

        await client.query(`
            ALTER TABLE trips 
            ADD COLUMN IF NOT EXISTS docket_no VARCHAR(255),
            ADD COLUMN IF NOT EXISTS courier_status VARCHAR(50) DEFAULT 'Pending',
            ADD COLUMN IF NOT EXISTS unloading_amount NUMERIC(10,2),
            ADD COLUMN IF NOT EXISTS unloading_date TIMESTAMP,
            ADD COLUMN IF NOT EXISTS pod_received_date TIMESTAMP;
        `);

        await client.query("COMMIT");
        console.log("Schema update completed successfully.");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("Schema update failed:", err);
    } finally {
        client.release();
        process.exit();
    }
}

updateSchema();
