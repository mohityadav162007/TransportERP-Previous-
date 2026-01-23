
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
    try {
        // 1. Add columns to trips table if they don't exist
        await pool.query(`
      ALTER TABLE trips 
      ADD COLUMN IF NOT EXISTS pay_slip_number INTEGER,
      ADD COLUMN IF NOT EXISTS loading_slip_number INTEGER;
    `);
        console.log("Added columns to trips table.");

        // 2. Create sequence table for slip numbers if it doesn't exist
        await pool.query(`
      CREATE TABLE IF NOT EXISTS slip_counters (
        type VARCHAR(50) PRIMARY KEY,
        current_value INTEGER DEFAULT 0
      );
    `);

        // Initialize counters if not present
        await pool.query(`
      INSERT INTO slip_counters (type, current_value)
      VALUES ('pay_slip', 0), ('loading_slip', 0)
      ON CONFLICT (type) DO NOTHING;
    `);
        console.log("Created/Verified slip_counters table.");

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await pool.end();
    }
}

migrate();
