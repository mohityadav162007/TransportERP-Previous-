import { pool } from "../db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Apply the POD status sync trigger to the database
 */
const applyTrigger = async () => {
    try {
        console.log("Applying POD status sync trigger...\n");

        // Read the SQL file
        const triggerSQL = fs.readFileSync(
            path.join(__dirname, "../sql/pod_status_sync_trigger.sql"),
            "utf8"
        );

        // Execute the SQL
        await pool.query(triggerSQL);

        console.log("✓ POD status sync trigger applied successfully!\n");

        // Test the trigger
        console.log("Testing trigger...");
        const testResult = await pool.query(`
      SELECT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'trigger_sync_pod_status'
      ) as trigger_exists
    `);

        if (testResult.rows[0].trigger_exists) {
            console.log("✓ Trigger verification passed: trigger_sync_pod_status exists\n");
        } else {
            console.warn("⚠ Warning: Trigger may not have been created properly\n");
        }

        process.exit(0);
    } catch (err) {
        console.error("❌ Failed to apply trigger:", err.message);
        console.error(err);
        process.exit(1);
    }
};

applyTrigger();
