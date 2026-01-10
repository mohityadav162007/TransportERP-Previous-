import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
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

const app = express();

app.use(cors());
app.use(express.json());

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

app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

const PORT = process.env.PORT || 5000;
// Render and local environments need app.listen. 
// Vercel handles the execution itself.
if (!process.env.VERCEL) {
  app.listen(PORT, async () => {
    console.log(`Backend running on port ${PORT}`);

    // Temporary user creation
    const email = "shrisanwariyaroadlines@gmail.com";
    const password = "Sanwariya_1228";
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (result.rows.length === 0) {
        const hash = await bcrypt.hash(password, 10);
        await pool.query(
          "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, 'admin')",
          [email, hash]
        );
        console.log("Admin user created successfully");
      } else {
        console.log("Admin user already exists");
      }
    } catch (err) {
      console.error("Failed to ensure admin user:", err);
    }
  });
}

export default app;
