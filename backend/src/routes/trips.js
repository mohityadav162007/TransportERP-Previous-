import express from "express";
import { pool } from "../db.js";
import { generateTripCode } from "../utils/tripCode.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { supabase } from "../utils/supabaseClient.js";

const router = express.Router();

/* ================================
   POD STORAGE
================================ */

const storage = multer.memoryStorage();
const upload = multer({ storage });
const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || 'PODs';

/* ================================
   CREATE TRIP  ✅ FIXED
================================ */

router.post("/", async (req, res) => {
  try {
    const t = req.body;

    const trip_code = await generateTripCode(t.loading_date);

    // AUTO-MANAGE MASTERS
    await ensureMasters(
      t.party_name,
      t.party_number,
      t.motor_owner_name,
      t.motor_owner_number
    );

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

    const createdTrip = result.rows[0];

    // Create payment history entries for advances if present
    if (gaadi_advance > 0) {
      await pool.query(
        `INSERT INTO payment_history 
         (trip_id, trip_code, transaction_type, payment_type, amount, vehicle_number, loading_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          createdTrip.id,
          createdTrip.trip_code,
          'DEBIT',
          'Gaadi Advance Paid',
          gaadi_advance,
          createdTrip.vehicle_number,
          createdTrip.loading_date
        ]
      );
    }

    if (party_advance > 0) {
      await pool.query(
        `INSERT INTO payment_history 
         (trip_id, trip_code, transaction_type, payment_type, amount, vehicle_number, loading_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          createdTrip.id,
          createdTrip.trip_code,
          'CREDIT',
          'Party Advance Received',
          party_advance,
          createdTrip.vehicle_number,
          createdTrip.loading_date
        ]
      );
    }

    res.status(201).json(createdTrip);
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

    // AUTO-MANAGE MASTERS
    await ensureMasters(
      t.party_name,
      t.party_number,
      t.motor_owner_name,
      t.motor_owner_number
    );

    // First, get the old trip data to compare
    const oldTripResult = await pool.query(
      "SELECT * FROM trips WHERE id=$1 AND is_deleted=false",
      [req.params.id]
    );

    if (oldTripResult.rows.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const oldTrip = oldTripResult.rows[0];

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
        gaadi_balance_status=$20,
        profit=$21,
        weight=$22,
        remark=$23,
        updated_at=now()
      WHERE id=$24 AND is_deleted=false
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
        t.gaadi_balance_status || "UNPAID",
        profit,
        t.weight || null,
        t.remark || null,
        req.params.id
      ]
    );

    // Create payment history entries
    const updatedTrip = result.rows[0];

    // --- GAADI ADVANCE ---
    if (gaadi_advance > 0) {
      const existing = await pool.query(
        "SELECT id FROM payment_history WHERE trip_id=$1 AND payment_type='Gaadi Advance Paid' AND is_deleted=false",
        [updatedTrip.id]
      );
      if (existing.rows.length > 0) {
        await pool.query(
          "UPDATE payment_history SET amount=$1, loading_date=$2, vehicle_number=$3, trip_code=$4 WHERE id=$5",
          [gaadi_advance, updatedTrip.loading_date, updatedTrip.vehicle_number, updatedTrip.trip_code, existing.rows[0].id]
        );
      } else {
        await pool.query(
          "INSERT INTO payment_history (trip_id, trip_code, transaction_type, payment_type, amount, vehicle_number, loading_date) VALUES ($1,$2,$3,$4,$5,$6,$7)",
          [updatedTrip.id, updatedTrip.trip_code, 'DEBIT', 'Gaadi Advance Paid', gaadi_advance, updatedTrip.vehicle_number, updatedTrip.loading_date]
        );
      }
    } else {
      await pool.query("UPDATE payment_history SET is_deleted=true WHERE trip_id=$1 AND payment_type='Gaadi Advance Paid'", [updatedTrip.id]);
    }

    // --- GAADI BALANCE ---
    if (t.gaadi_balance_status === 'PAID') {
      const existing = await pool.query(
        "SELECT id FROM payment_history WHERE trip_id=$1 AND payment_type='Gaadi Balance Paid' AND is_deleted=false",
        [updatedTrip.id]
      );
      if (existing.rows.length > 0) {
        await pool.query(
          "UPDATE payment_history SET amount=$1, loading_date=$2, vehicle_number=$3, trip_code=$4 WHERE id=$5",
          [gaadi_balance, updatedTrip.loading_date, updatedTrip.vehicle_number, updatedTrip.trip_code, existing.rows[0].id]
        );
      } else {
        await pool.query(
          "INSERT INTO payment_history (trip_id, trip_code, transaction_type, payment_type, amount, vehicle_number, loading_date) VALUES ($1,$2,$3,$4,$5,$6,$7)",
          [updatedTrip.id, updatedTrip.trip_code, 'DEBIT', 'Gaadi Balance Paid', gaadi_balance, updatedTrip.vehicle_number, updatedTrip.loading_date]
        );
      }
    } else {
      await pool.query("UPDATE payment_history SET is_deleted=true WHERE trip_id=$1 AND payment_type='Gaadi Balance Paid'", [updatedTrip.id]);
    }

    // --- PARTY ADVANCE ---
    if (party_advance > 0) {
      const existing = await pool.query(
        "SELECT id FROM payment_history WHERE trip_id=$1 AND payment_type='Party Advance Received' AND is_deleted=false",
        [updatedTrip.id]
      );
      if (existing.rows.length > 0) {
        await pool.query(
          "UPDATE payment_history SET amount=$1, loading_date=$2, vehicle_number=$3, trip_code=$4 WHERE id=$5",
          [party_advance, updatedTrip.loading_date, updatedTrip.vehicle_number, updatedTrip.trip_code, existing.rows[0].id]
        );
      } else {
        await pool.query(
          "INSERT INTO payment_history (trip_id, trip_code, transaction_type, payment_type, amount, vehicle_number, loading_date) VALUES ($1,$2,$3,$4,$5,$6,$7)",
          [updatedTrip.id, updatedTrip.trip_code, 'CREDIT', 'Party Advance Received', party_advance, updatedTrip.vehicle_number, updatedTrip.loading_date]
        );
      }
    } else {
      await pool.query("UPDATE payment_history SET is_deleted=true WHERE trip_id=$1 AND payment_type='Party Advance Received'", [updatedTrip.id]);
    }

    // --- PARTY BALANCE ---
    if (t.payment_status === 'PAID') {
      const existing = await pool.query(
        "SELECT id FROM payment_history WHERE trip_id=$1 AND payment_type='Party Balance Received' AND is_deleted=false",
        [updatedTrip.id]
      );
      if (existing.rows.length > 0) {
        await pool.query(
          "UPDATE payment_history SET amount=$1, loading_date=$2, vehicle_number=$3, trip_code=$4 WHERE id=$5",
          [party_balance, updatedTrip.loading_date, updatedTrip.vehicle_number, updatedTrip.trip_code, existing.rows[0].id]
        );
      } else {
        await pool.query(
          "INSERT INTO payment_history (trip_id, trip_code, transaction_type, payment_type, amount, vehicle_number, loading_date) VALUES ($1,$2,$3,$4,$5,$6,$7)",
          [updatedTrip.id, updatedTrip.trip_code, 'CREDIT', 'Party Balance Received', party_balance, updatedTrip.vehicle_number, updatedTrip.loading_date]
        );
      }
    } else {
      await pool.query("UPDATE payment_history SET is_deleted=true WHERE trip_id=$1 AND payment_type='Party Balance Received'", [updatedTrip.id]);
    }

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
  // Sync soft delete with payment history
  await pool.query(`UPDATE payment_history SET is_deleted=true WHERE trip_id=$1`, [
    req.params.id
  ]);
  res.json({ message: "Trip deleted" });
});

router.post("/:id/restore", async (req, res) => {
  await pool.query(
    `UPDATE trips SET is_deleted=false, updated_at=now() WHERE id=$1`,
    [req.params.id]
  );
  // Sync restore with payment history
  await pool.query(`UPDATE payment_history SET is_deleted=false WHERE trip_id=$1`, [
    req.params.id
  ]);
  res.json({ message: "Trip restored" });
});

/* ================================
   POD UPLOAD
================================ */

router.post("/:id/pod", upload.single("pod"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No POD uploaded" });
  }

  try {
    const ext = path.extname(req.file.originalname) || ".jpg";
    const fileName = `pod_${req.params.id}_${Date.now()}${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (error) {
      console.error("Supabase Storage Error:", error);
      return res.status(500).json({ message: "Failed to upload to Supabase Storage", error: error.message });
    }

    const podPath = fileName;

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
  } catch (err) {
    console.error("POD UPLOAD ERROR:", err);
    res.status(500).json({ message: "Internal server error during POD upload" });
  }
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

    const fileName = result.rows[0].pod_path;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(fileName, 3600); // 1 hour expiry

    if (error) {
      console.error("Supabase Signed URL Error:", error);
      return res.status(500).send("Failed to retrieve POD from storage");
    }

    res.redirect(data.signedUrl);
  } catch (err) {
    console.error("POD DOWNLOAD ERROR:", err);
    res.status(500).send("Failed to open POD");
  }
});

export default router;

/* ================================
   HELPER: MANAGE MASTERS
================================ */
async function ensureMasters(pName, pMobile, mName, mMobile) {
  try {
    if (pName) {
      await pool.query(
        `INSERT INTO parties (name, mobile) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
        [pName, pMobile || null]
      );
    }
    if (mName) {
      await pool.query(
        `INSERT INTO motor_owners (name, mobile) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
        [mName, mMobile || null]
      );
    }
  } catch (err) {
    console.error("Error auto-managing masters:", err.message);
    // Do not fail the trip creation/update if master creation fails
  }
}
