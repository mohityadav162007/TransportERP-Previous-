import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { pool } from "./db.js";

import tripsRouter from "./routes/trips.js";
import analyticsRouter from "./routes/analytics.js";
import dashboardRouter from "./routes/dashboard.js";
import reportsRouter from "./routes/reports.js";
import authRouter from "./routes/auth.js";
import paymentHistoryRouter from "./routes/paymentHistory.js";
import mastersRouter from "./routes/masters.js";
import expensesRouter from "./routes/expenses.js";
import authenticateToken from "./middleware/authMiddleware.js";
import adminRouter from "./routes/admin.js";

const app = express();

app.use(cors());
app.use(express.json());

// Public routes
app.use("/api/auth", authRouter);

// TEMP: Resequence Route
app.post("/api/admin/resequence-force", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    console.log("STARTING RESEQUENCE...");
    const monthsRes = await client.query("SELECT DISTINCT SUBSTRING(trip_code FROM 1 FOR 7) as prefix FROM trips WHERE is_deleted=false AND length(trip_code) = 11");

    let report = [];
    for (const mRow of monthsRes.rows) {
      const prefix = mRow.prefix;
      const tripsRes = await client.query("SELECT id, trip_code FROM trips WHERE is_deleted=false AND trip_code LIKE $1 ORDER BY trip_code ASC FOR UPDATE", [`${prefix}_%`]);
      let expectedNum = 1;
      let count = 0;
      for (const trip of tripsRes.rows) {
        const parts = trip.trip_code.split('_');
        const currentNum = parseInt(parts[2]);
        if (currentNum !== expectedNum) {
          const newCode = `${prefix}_${String(expectedNum).padStart(3, '0')}`;
          await client.query("UPDATE trips SET trip_code=$1 WHERE id=$2", [newCode, trip.id]);
          await client.query("UPDATE payment_history SET trip_code=$1 WHERE trip_id=$2", [newCode, trip.id]);
          count++;
        }
        expectedNum++;
      }
      report.push({ month: prefix, updates: count });
    }
    await client.query("COMMIT");
    res.json({ message: "Resequenced", report });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Protected routes
app.use("/api/trips", authenticateToken, tripsRouter);
app.use("/api/analytics", authenticateToken, analyticsRouter);
app.use("/api/dashboard", authenticateToken, dashboardRouter);
app.use("/api/reports", authenticateToken, reportsRouter);
app.use("/api/payment-history", authenticateToken, paymentHistoryRouter);
app.use("/api/masters", authenticateToken, mastersRouter);
app.use("/api/expenses", authenticateToken, expensesRouter);
app.use("/api/admin", authenticateToken, adminRouter);

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "OK", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "ERROR", database: "disconnected", error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
// Render and local environments need app.listen. 
// Vercel handles the execution itself.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

export default app;
