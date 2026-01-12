import { pool } from "../db.js";

const createOwnVehiclesTable = async () => {
    try {
        console.log("Creating own_vehicles table...");
        await pool.query(`
      CREATE TABLE IF NOT EXISTS own_vehicles (
        id SERIAL PRIMARY KEY,
        vehicle_number VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
        console.log("Table 'own_vehicles' created successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Error creating table:", err);
        process.exit(1);
    }
};

createOwnVehiclesTable();
