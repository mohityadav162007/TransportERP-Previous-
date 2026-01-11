import { pool } from "../db.js";

const normalizePods = async () => {
    try {
        console.log("Starting POD path data normalization...");

        // Fetch all trips with non-null pod_path
        const result = await pool.query("SELECT id, pod_path FROM trips WHERE pod_path IS NOT NULL");
        console.log(`Found ${result.rows.length} trips with PODs to check.`);

        let updatedCount = 0;

        for (const row of result.rows) {
            const { id, pod_path } = row;
            let normalized = [];

            if (typeof pod_path === 'string') {
                try {
                    const parsed = JSON.parse(pod_path);
                    if (Array.isArray(parsed)) {
                        normalized = parsed;
                    } else if (parsed) {
                        normalized = [parsed];
                    }
                } catch (e) {
                    // Split by comma for non-JSON strings
                    normalized = pod_path.split(',')
                        .map(url => url.trim())
                        .filter(Boolean);
                }
            } else if (Array.isArray(pod_path)) {
                normalized = pod_path;
            }

            // Convert back to JSON string for storage
            const jsonValue = JSON.stringify(normalized);

            // Update only if changed or if it wasn't valid JSON before
            // We force update to ensure everything is a valid JSON array string
            await pool.query(
                "UPDATE trips SET pod_path = $1 WHERE id = $2",
                [jsonValue, id]
            );
            updatedCount++;
        }

        console.log(`✓ Successfully normalized ${updatedCount} trips.`);
        process.exit(0);
    } catch (err) {
        console.error("Normalization failed:", err);
        process.exit(1);
    }
};

normalizePods();
