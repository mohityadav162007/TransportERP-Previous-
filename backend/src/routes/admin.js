import express from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";
import { supabaseAdmin } from "../utils/supabaseClient.js";

const router = express.Router();

// Middleware to verify if the user is an admin
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: "Access denied. Admin only." });
    }
};

// List all users
router.get("/users", adminOnly, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, email, role, created_at FROM users ORDER BY created_at DESC"
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Server error" });
    }
});

// Create a new user
router.post("/users", adminOnly, async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ error: "Email, password, and role are required." });
    }

    if (!supabaseAdmin) {
        return res.status(500).json({ error: "Supabase Admin client not configured. Check SUPABASE_SERVICE_ROLE_KEY." });
    }

    try {
        // 1. Create user in Supabase Auth
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role }
        });

        if (authError) {
            console.error("Supabase Auth error:", authError);
            return res.status(authError.status || 500).json({ error: authError.message });
        }

        // 2. Hash password for local users table
        const passwordHash = await bcrypt.hash(password, 10);

        // 3. Create user in local users table for compatibility
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

        res.status(201).json({
            message: "User created successfully",
            user: result.rows[0]
        });
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ error: "Server error" });
    }
});

export default router;
