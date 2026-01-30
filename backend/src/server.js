import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
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
import printRouter from "./routes/print.js";

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // Frontend URL
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Public routes
app.use("/api/auth", authRouter);

// Protected routes
app.use("/api/trips", authenticateToken, tripsRouter);
app.use("/api/analytics", authenticateToken, analyticsRouter);
app.use("/api/dashboard", authenticateToken, dashboardRouter);
app.use("/api/reports", authenticateToken, reportsRouter);
app.use("/api/payment-history", authenticateToken, paymentHistoryRouter);
app.use("/api/masters", authenticateToken, mastersRouter);
app.use("/api/expenses", authenticateToken, expensesRouter);
app.use("/api/admin", authenticateToken, adminRouter);
app.use("/api/print", authenticateToken, printRouter);

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
