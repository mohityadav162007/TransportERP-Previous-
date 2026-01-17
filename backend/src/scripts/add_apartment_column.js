
import { pool } from '../db.js';

async function migrate() {
    try {
        console.log('Adding "apartment" column to trips table...');
        await pool.query(`ALTER TABLE trips ADD COLUMN IF NOT EXISTS apartment TEXT;`);
        console.log('Migration successful.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrate();
