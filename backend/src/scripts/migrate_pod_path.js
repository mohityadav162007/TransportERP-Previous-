import { pool } from "../db.js";

const migrate = async () => {
    try {
        console.log("Starting POD path migration...");

        // Change pod_path from VARCHAR(500) to TEXT
        await pool.query(`
      ALTER TABLE trips 
      ALTER COLUMN pod_path TYPE TEXT;
    `);

        console.log("✓ Successfully changed pod_path to TEXT");
        console.log("Migration completed successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Migration failed:", err);
        process.exit(1);
    }
};

migrate();
