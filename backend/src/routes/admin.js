import express from "express";
import bcrypt from "bcryptjs";
import { pool } from "../db.js";
import { supabaseAdmin } from "../utils/supabaseClient.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

// Draft an email using Google Gemini
router.post("/email/draft", adminOnly, async (req, res) => {
    const { trip_id, reason, lr_number } = req.body;

    if (!trip_id || !reason) {
        return res.status(400).json({ error: "Trip ID and Reason are required." });
    }

    if (!process.env.GOOGLE_API_KEY) {
        return res.status(500).json({ error: "Google API Key not configured." });
    }

    try {
        // 1. Fetch Trip Details
        const tripResult = await pool.query(
            "SELECT trip_code, loading_date, from_location, to_location, vehicle_number FROM trips WHERE id = $1",
            [trip_id]
        );

        if (tripResult.rows.length === 0) {
            return res.status(404).json({ error: "Trip not found." });
        }

        const trip = tripResult.rows[0];

        // 2. Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 3. Construct Prompt
        const systemPrompt = `You are a professional assistant for a Transport Company. Your goal is to draft a formal, professional business email based on the provided trip details and a user-provided reason.
        
        RULES:
        - The tone must be strictly professional and formal. No slang, no emojis.
        - You MUST use the provided Trip Details exactly as they are. Do not invent details.
        - The user reason might be in Hinglish or broken English. You must translate/refine it into professional English.
        - Structure the email clearly: Subject, Salutation, Body (Context + Trip Details), Closing.
        - Output MUST be a strictly valid JSON object with keys "subject" and "body". Do not wrap it in markdown code blocks.
        `;

        const userPrompt = JSON.stringify({
            reason_text: reason,
            trip_code: trip.trip_code,
            loading_date: new Date(trip.loading_date).toLocaleDateString('en-IN'),
            from: trip.from_location,
            to: trip.to_location,
            vehicle_number: trip.vehicle_number,
            lr_number: lr_number || "N/A"
        });

        const fullPrompt = `${systemPrompt}\n\nRequest Data:\n${userPrompt}`;

        // 4. Generate Content
        const result = await model.generateContent(fullPrompt);
        const text = result.response.text();

        // 5. Parse JSON (Handle potential markdown wrapping)
        const jsonStr = text.replace(/```json|```/g, '').trim();
        const content = JSON.parse(jsonStr);

        res.json(content);

    } catch (err) {
        console.error("Error generating email with Gemini:", err);
        res.status(500).json({ error: "Failed to generate email." });
    }
});

export default router;
