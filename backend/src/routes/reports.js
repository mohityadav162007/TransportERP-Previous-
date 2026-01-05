import express from "express";
import { pool } from "../db.js";
import XLSX from "xlsx";
import fs from "fs";
import path from "path";

const router = express.Router();

const EXPORT_DIR = "D:/TransportERP/backend/exports";

// ensure export directory exists
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR, { recursive: true });
}

/**
 * EXPORT TRIPS (MONTHLY)
 * Profit = party_freight - gaadi_freight
 *
 * ?year=2025&month=01
 */
router.get("/trips", async (req, res) => {
  try {
    const { startDate, endDate, party } = req.query;

    let query = `
      SELECT
        trip_code                    AS "Trip ID",
        loading_date                 AS "Loading Date",
        unloading_date               AS "Unloading Date",
        from_location                AS "From",
        to_location                  AS "To",
        vehicle_number               AS "Vehicle number",
        driver_number                AS "Driver number",
        motor_owner_name             AS "Motor Owner Name",
        motor_owner_number           AS "Motor Owner Number",

        gaadi_freight                AS "Gaadi freight",
        gaadi_advance                AS "Gaadi advance",
        gaadi_balance                AS "Gaadi Balance",

        party_name                   AS "Party Name",
        party_number                 AS "Party Number",
        party_freight                AS "Party freight",
        party_advance                AS "Party advance",
        party_balance                AS "Party Balance",

        tds                          AS "TDS",
        himmali                      AS "Himmali",

        payment_status               AS "Party Payment Status",
        gaadi_balance_status         AS "Gaadi Payment Status",
        pod_status                   AS "POD status",

        (party_freight - gaadi_freight) AS "Profit"

      FROM trips
      WHERE is_deleted = false
    `;

    const params = [];
    if (startDate) {
      query += ` AND loading_date >= $${params.length + 1}`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND loading_date <= $${params.length + 1}`;
      params.push(endDate);
    }
    if (party) {
      query += ` AND party_name ILIKE $${params.length + 1}`;
      params.push(`%${party}%`);
    }

    query += ` ORDER BY loading_date`;

    const result = await pool.query(query, params);

    const worksheet = XLSX.utils.json_to_sheet(result.rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Trips"
    );

    const filename = `Trips_Export_${Date.now()}.xlsx`;
    const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (err) {
    console.error("EXPORT ERROR:", err);
    res.status(500).json({ message: "Failed to export trips" });
  }
});

export default router;
