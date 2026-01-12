import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Search Parties
router.get("/parties", async (req, res) => {
    try {
        const { name } = req.query;
        let query = "SELECT * FROM parties";
        let params = [];

        if (name) {
            query += " WHERE name ILIKE $1";
            params.push(`%${name}%`);
        }

        query += " ORDER BY name LIMIT 10";

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error("SEARCH PARTIES ERROR:", err);
        res.status(500).json({ error: "Failed to search parties" });
    }
});

// Search Motor Owners
router.get("/motor-owners", async (req, res) => {
    try {
        const { name } = req.query;
        let query = "SELECT * FROM motor_owners";
        let params = [];

        if (name) {
            query += " WHERE name ILIKE $1";
            params.push(`%${name}%`);
        }

        query += " ORDER BY name LIMIT 10";

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error("SEARCH MOTOR OWNERS ERROR:", err);
        res.status(500).json({ error: "Failed to search motor owners" });
    }
});

// Get Single Party (for Details Page)
router.get("/parties/:id", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM parties WHERE id = $1", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Party not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch party" });
    }
});

// Get Single Motor Owner (for Details Page)
router.get("/motor-owners/:id", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM motor_owners WHERE id = $1", [req.params.id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Motor owner not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch motor owner" });
    }
});

// Get All Own Vehicles (for frontend validation)
router.get("/own-vehicles", async (req, res) => {
    try {
        const result = await pool.query("SELECT vehicle_number FROM own_vehicles");
        const vehicles = result.rows.map(row => row.vehicle_number);
        res.json(vehicles);
    } catch (err) {
        console.error("FETCH OWN VEHICLES ERROR:", err);
        res.status(500).json({ error: "Failed to fetch own vehicles" });
    }
});

export default router;
