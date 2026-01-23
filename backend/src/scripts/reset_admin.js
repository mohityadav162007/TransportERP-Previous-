
import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function resetAdmin() {
    const email = 'admin@transport.com';
    const password = 'password123';
    const role = 'admin';

    try {
        const hash = await bcrypt.hash(password, 10);

        // Upsert user
        const query = `
      INSERT INTO users (email, password_hash, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (email) DO UPDATE
      SET password_hash = EXCLUDED.password_hash,
          role = EXCLUDED.role
      RETURNING id, email;
    `;

        const res = await pool.query(query, [email, hash, role]);
        console.log(`Admin user upserted: ${res.rows[0].email} with password: ${password}`);
    } catch (err) {
        console.error("Error resetting admin:", err);
    } finally {
        await pool.end();
    }
}

resetAdmin();
