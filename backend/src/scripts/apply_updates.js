import { pool } from "../db.js";

const update = async () => {
  try {
    console.log("Applying updates...");

    // 1. Create Parties
    console.log("Creating parties table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS parties (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        mobile VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create Motor Owners
    console.log("Creating motor_owners table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS motor_owners (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        mobile VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create Daily Expenses
    console.log("Creating daily_expenses table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS daily_expenses (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        category VARCHAR(100) NOT NULL,
        amount NUMERIC(12, 2) NOT NULL,
        vehicle_number VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Update Payment History
    console.log("Updating payment_history table...");
    try {
      await pool.query(`ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;`);
    } catch (e) {
      console.log("Note on payment_history alter:", e.message);
    }

    // 5. Expand pod_path size to TEXT
    console.log("Expanding pod_path to TEXT...");
    try {
      await pool.query(`ALTER TABLE trips ALTER COLUMN pod_path TYPE TEXT;`);
    } catch (e) {
      console.log("Note on trips pod_path alter:", e.message);
    }

    console.log("Database updated successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Update failed:", err);
    process.exit(1);
  }
};

update();
