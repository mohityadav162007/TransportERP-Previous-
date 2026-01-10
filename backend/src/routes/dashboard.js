import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/**
 * DASHBOARD SUMMARY
 */
router.get("/summary", async (req, res) => {
  try {
    const summary = await pool.query(`
      SELECT
        COUNT(*) AS total_trips,
        COALESCE(SUM(party_balance), 0) AS total_outstanding,
        COALESCE(SUM(profit), 0) AS total_profit,
        COUNT(*) FILTER (WHERE pod_status = 'PENDING') AS pod_pending,
        COUNT(*) FILTER (WHERE payment_status = 'UNPAID') AS payment_pending
      FROM trips
      WHERE is_deleted = false
    `);

    res.json(summary.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load dashboard summary" });
  }
});

/**
 * MONTHLY PROFIT TREND
 */
router.get("/profit-trend", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        DATE_TRUNC('month', loading_date) AS month,
        SUM(profit) AS profit
      FROM trips
      WHERE is_deleted = false
      GROUP BY month
      ORDER BY month
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load profit trend" });
  }
});

/**
 * MONTHLY TRIP VOLUME
 */
router.get("/trip-volume", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        DATE_TRUNC('month', loading_date) AS month,
        COUNT(*) AS trips
      FROM trips
      WHERE is_deleted = false
      GROUP BY month
      ORDER BY month
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load trip volume" });
  }
});

export default router;
