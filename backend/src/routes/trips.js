import express from "express";
import { pool } from "../db.js";
import { generateTripCode } from "../utils/tripCode.js";
import multer from "multer";
import fs from "fs";
import path from "path";

const router = express.Router();

/* ================================
   POD STORAGE
================================ */

const POD_DIR = "uploads/pod";

if (!fs.existsSync(POD_DIR)) {
  fs.mkdirSync(POD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: POD_DIR,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `pod_${req.params.id}${ext}`);
  }
});

const upload = multer({ storage });

/* ================================
   CREATE TRIP  ✅ FIXED
================================ */

router.post("/", async (req, res) => {
  try {
    const t = req.body;

    const trip_code = await generateTripCode(t.loading_date);

    const gaadi_freight = Number(t.gaadi_freight || 0);
    const gaadi_advance = Number(t.gaadi_advance || 0);
    const party_freight = Number(t.party_freight || 0);
    const party_advance = Number(t.party_advance || 0);
    const tds = Number(t.tds || 0);
    const himmali = Number(t.himmali || 0);

    const gaadi_balance = gaadi_freight - gaadi_advance;
    const party_balance = party_freight - party_advance - tds - himmali;
    const profit = party_freight - gaadi_freight;

    const result = await pool.query(
      `
      INSERT INTO trips (
        trip_code,
        loading_date,
        unloading_date,
        from_location,
        to_location,
        vehicle_number,
        driver_number,
        motor_owner_name,
        motor_owner_number,
        gaadi_freight,
        gaadi_advance,
        gaadi_balance,
        party_name,
        party_number,
        party_freight,
        party_advance,
        party_balance,
        tds,
        himmali,
        payment_status,
        profit,
        weight,
        remark,
        pod_status
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,
        $10,$11,$12,$13,$14,$15,$16,
        $17,$18,$19,$20,$21,$22,$23,$24
      )
      RETURNING *
      `,
      [
        trip_code,
        t.loading_date,
        t.unloading_date || null,
        t.from_location,
        t.to_location,
        t.vehicle_number,
        t.driver_number || null,
        t.motor_owner_name || null,
        t.motor_owner_number || null,
        gaadi_freight,
        gaadi_advance,
        gaadi_balance,
        t.party_name,
        t.party_number || null,
        party_freight,
        party_advance,
        party_balance,
        tds,
        himmali,
        t.payment_status || "UNPAID",
        profit,
        t.weight || null,
        t.remark || null,
        "PENDING"
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("CREATE TRIP ERROR:", err);
    res.status(500).json({
      message: "Failed to create trip",
      error: err.hint || err.detail || err.message
    });
  }
});

/* ================================
   GET TRIPS
================================ */

router.get("/", async (req, res) => {
  try {
    const { deleted } = req.query;

    const result = await pool.query(
      `
      SELECT *
      FROM trips
      WHERE is_deleted = $1
      ORDER BY loading_date DESC
      `,
      [deleted === "true"]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("FETCH TRIPS ERROR:", err);
    res.status(500).json({
      message: "Failed to fetch trips",
      error: err.message
    });
  }
});

/* ================================
   UPDATE TRIP
================================ */

router.put("/:id", async (req, res) => {
  try {
    const t = req.body;

    const gaadi_freight = Number(t.gaadi_freight || 0);
    const gaadi_advance = Number(t.gaadi_advance || 0);
    const party_freight = Number(t.party_freight || 0);
    const party_advance = Number(t.party_advance || 0);
    const tds = Number(t.tds || 0);
    const himmali = Number(t.himmali || 0);

    const gaadi_balance = gaadi_freight - gaadi_advance;
    const party_balance = party_freight - party_advance - tds - himmali;
    const profit = party_freight - gaadi_freight;

    const result = await pool.query(
      `
      UPDATE trips SET
        loading_date=$1,
        unloading_date=$2,
        from_location=$3,
        to_location=$4,
        vehicle_number=$5,
        driver_number=$6,
        motor_owner_name=$7,
        motor_owner_number=$8,
        gaadi_freight=$9,
        gaadi_advance=$10,
        gaadi_balance=$11,
        party_name=$12,
        party_number=$13,
        party_freight=$14,
        party_advance=$15,
        party_balance=$16,
        tds=$17,
        himmali=$18,
        payment_status=$19,
        profit=$20,
        weight=$21,
        remark=$22,
        updated_at=now()
      WHERE id=$23 AND is_deleted=false
      RETURNING *
      `,
      [
        t.loading_date,
        t.unloading_date || null,
        t.from_location,
        t.to_location,
        t.vehicle_number,
        t.driver_number || null,
        t.motor_owner_name || null,
        t.motor_owner_number || null,
        gaadi_freight,
        gaadi_advance,
        gaadi_balance,
        t.party_name,
        t.party_number || null,
        party_freight,
        party_advance,
        party_balance,
        tds,
        himmali,
        t.payment_status || "UNPAID",
        profit,
        t.weight || null,
        t.remark || null,
        req.params.id
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE TRIP ERROR:", err);
    res.status(500).json({
      message: "Failed to update trip",
      error: err.message
    });
  }
});

/* ================================
   DELETE / RESTORE
================================ */

router.delete("/:id", async (req, res) => {
  await pool.query(`UPDATE trips SET is_deleted=true WHERE id=$1`, [
    req.params.id
  ]);
  res.json({ message: "Trip deleted" });
});

router.post("/:id/restore", async (req, res) => {
  await pool.query(
    `UPDATE trips SET is_deleted=false, updated_at=now() WHERE id=$1`,
    [req.params.id]
  );
  res.json({ message: "Trip restored" });
});

/* ================================
   POD UPLOAD
================================ */

router.post("/:id/pod", upload.single("pod"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No POD uploaded" });
  }

  const podPath = `${POD_DIR}/${req.file.filename}`;

  const result = await pool.query(
    `
    UPDATE trips SET
      pod_status='UPLOADED',
      pod_path=$1,
      updated_at=now()
    WHERE id=$2
    RETURNING *
    `,
    [podPath, req.params.id]
  );

  res.json(result.rows[0]);
});

/* ================================
   SERVE POD
================================ */

router.get("/:id/pod/file", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pod_path FROM trips WHERE id=$1`,
      [req.params.id]
    );

    if (!result.rows.length || !result.rows[0].pod_path) {
      return res.status(404).send("POD not found");
    }

    res.sendFile(path.resolve(result.rows[0].pod_path));
  } catch (err) {
    res.status(500).send("Failed to open POD");
  }
});

export default router;
