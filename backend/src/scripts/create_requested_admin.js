import { pool } from "../db.js";
import bcrypt from "bcryptjs";

const createUser = async (email, password, role = 'admin') => {
    try {
        console.log(`Creating/Updating user: ${email}`);
        const passwordHash = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO users (email, password_hash, role)
            VALUES ($1, $2, $3)
            ON CONFLICT (email) DO UPDATE
            SET password_hash = EXCLUDED.password_hash,
                role = EXCLUDED.role
            RETURNING id, email, role;
        `;
        const values = [email, passwordHash, role];
        const result = await pool.query(query, values);
        console.log("User created/updated successfully:", result.rows[0]);
        process.exit(0);
    } catch (err) {
        console.error("Error creating user:", err);
        process.exit(1);
    }
};

const email = "mohityadav16.2009@gmail.com";
const password = "Sanwariya1228";
const role = "admin";

createUser(email, password, role);
