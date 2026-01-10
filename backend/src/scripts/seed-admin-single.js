import "dotenv/config";
import pg from "pg";
import bcrypt from "bcryptjs";

const { Client } = pg;

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function seed() {
    const email = "admin@transport.com";
    const password = "password";
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    try {
        await client.connect();
        const result = await client.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            await client.query(
                "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)",
                [email, hash, "admin"]
            );
            console.log("SUCCESS: Admin created.");
        } else {
            console.log("EXIST: Admin exists.");
        }
    } catch (err) {
        console.error("FAIL:", err.message);
    } finally {
        await client.end();
    }
}

seed();
