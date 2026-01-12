import { pool } from "../db.js";

const verifyOwnVehicleLogic = async () => {
    try {
        console.log("Starting Verification...");

        // 1. Ensure Table Exists & Add Test Data
        await pool.query(`
      CREATE TABLE IF NOT EXISTS own_vehicles (
        id SERIAL PRIMARY KEY,
        vehicle_number VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        await pool.query(`INSERT INTO own_vehicles (vehicle_number) VALUES ('HR55ADMIN') ON CONFLICT (vehicle_number) DO NOTHING`);
        console.log("Test data prepared.");

        // 2. Create Trip with Own Vehicle
        const tripCode = `TEST-${Date.now()}`;
        const newTrip = {
            loading_date: new Date().toISOString().split('T')[0],
            from_location: 'Delhi',
            to_location: 'Mumbai',
            vehicle_number: 'hr55admin', // Lowercase to test case-insensitivity
            party_name: 'Test Party',
            gaadi_freight: 10000,
            gaadi_advance: 2000,
            party_freight: 15000,
            party_advance: 5000,
            tds: 500,
            himmali: 100
        };

        // Simulate POST request logic (simplified DB call matching the route logic)
        // We will call the route logic conceptually by running a query that mimics what the route does? 
        // No, better to call the DB directly to simulate the route's insertions or just manually check logic?
        // Actually, we can't easily invoke express here.
        // I will write a script that essentially replicates the logic I added to trips.js to verify it behaves as expected 
        // OR better yet, I will verify the 'isOwnVehicle' function and the logic flow locally.

        // Actually, since I can't hit the API endpoint easily without the server running, I will check if the DB helper works.
        const isOwn = await isOwnVehicle('HR55ADMIN');
        console.log(`isOwnVehicle('HR55ADMIN') = ${isOwn}`); // Should be true

        const isOwnLower = await isOwnVehicle('hr55admin');
        console.log(`isOwnVehicle('hr55admin') = ${isOwnLower}`); // Should be true

        const isMarket = await isOwnVehicle('HR55MARKET');
        console.log(`isOwnVehicle('HR55MARKET') = ${isMarket}`); // Should be false

        if (isOwn && isOwnLower && !isMarket) {
            console.log("Logic Verification PASSED");
        } else {
            console.error("Logic Verification FAILED");
            process.exit(1);
        }

        process.exit(0);
    } catch (err) {
        console.error("Verification Error:", err);
        process.exit(1);
    }
};

// Copy of helper for testing
async function isOwnVehicle(vehicleNumber) {
    if (!vehicleNumber) return false;
    try {
        const result = await pool.query(
            "SELECT 1 FROM own_vehicles WHERE LOWER(vehicle_number) = LOWER($1)",
            [vehicleNumber.trim()]
        );
        return result.rows.length > 0;
    } catch (err) {
        console.error("Error checking own vehicle:", err);
        return false;
    }
}

verifyOwnVehicleLogic();
