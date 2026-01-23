
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function checkUsers() {
    try {
        const res = await pool.query('SELECT id, email, role, password_hash FROM users');
        console.log("User count:", res.rows.length);
        res.rows.forEach(u => {
            console.log(`User: ${u.email}, Role: ${u.role}, Hash Length: ${u.password_hash ? u.password_hash.length : 'NULL'}`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkUsers();
