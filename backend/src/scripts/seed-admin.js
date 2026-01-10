import "dotenv/config";
import pg from "pg";
import bcrypt from "bcryptjs";

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function seed() {
    const email = "admin@transport.com";
    const password = "password";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            await pool.query(
                "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)",
                [email, hash, "admin"]
            );
            console.log("Admin user created successfully.");
        } else {
            console.log("Admin user already exists.");
        }
    } catch (err) {
        console.error("Error seeding admin:", err);
    } finally {
        await pool.end();
    }
}

seed();
