import express from "express";
import { pool } from "../db.js";
import { generateTripCode } from "../utils/tripCode.js";
import multer from "multer";
import fs from "fs";
import path from "path";
import { supabase } from "../utils/supabaseClient.js";

const router = express.Router();

/* ================================
   POD UPLOAD (CLOUDINARY)
================================ */

router.post("/:id/pod", async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: "No Cloudinary URL provided" });
  }

  try {
    // CRITICAL: Use FOR UPDATE to prevent race conditions from multiple frontends
    const tripResult = await pool.query(
      "SELECT pod_path FROM trips WHERE id=$1 FOR UPDATE",
      [req.params.id]
    );

    if (tripResult.rows.length === 0) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Step 1: Normalize existing pod_path to array
    let currentPods = [];
    const rawPath = tripResult.rows[0].pod_path;

    if (rawPath) {
      if (typeof rawPath === 'string') {
        try {
          const parsed = JSON.parse(rawPath);
          if (Array.isArray(parsed)) {
            currentPods = parsed;
          } else if (parsed) {
            currentPods = [parsed];
          }
        } catch (e) {
          // Robust split for legacy comma-separated strings
          currentPods = rawPath.split(',')
            .map(u => u.trim())
            .filter(Boolean);
        }
      } else if (Array.isArray(rawPath)) {
        currentPods = rawPath;
      }
    }

    // Step 2: Normalize incoming URL(s) - handle both single URL and array
    let newUrls = [];
    if (Array.isArray(url)) {
      newUrls = url;
    } else if (typeof url === 'string') {
      newUrls = [url];
    }

    // Step 3: Append new URLs, preventing duplicates
    for (const newUrl of newUrls) {
      if (newUrl && !currentPods.includes(newUrl)) {
        currentPods.push(newUrl);
      }
    }

    // Step 4: Save merged result
    const newPodPath = JSON.stringify(currentPods);

    const result = await pool.query(
      `
      UPDATE trips SET
        pod_status='RECEIVED',
        pod_path=$1,
        updated_at=now()
      WHERE id=$2
      RETURNING *
      `,
      [newPodPath, req.params.id]
    );

    console.log(`POD APPEND SUCCESS: Trip ${req.params.id} now has ${currentPods.length} POD(s)`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error("POD UPDATE ERROR:", err);
    res.status(500).json({ message: "Internal server error during POD update" });
  }
});

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

    const isOwn = await isOwnVehicle(t.vehicle_number);

    let gaadi_freight = Number(t.gaadi_freight || 0);
    let gaadi_advance = Number(t.gaadi_advance || 0);
    const party_freight = Number(t.party_freight || 0);
    const party_advance = Number(t.party_advance || 0);
    const tds = Number(t.tds || 0);
    let himmali = Number(t.himmali || 0);

    // ADMIN OWN VEHICLE LOGIC
    if (isOwn) {
      gaadi_freight = 0;
      gaadi_advance = 0;
      himmali = 0; // As per rules, ignore fields logically
    }

    const gaadi_balance = gaadi_freight - gaadi_advance;
    const profit = isOwn ? party_freight - tds : party_freight - gaadi_freight;
    const party_balance = party_freight - party_advance - tds - himmali;

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
    const { deleted, own } = req.query;

    let query = `
      SELECT t.*, 
        CASE WHEN ov.vehicle_number IS NOT NULL THEN true ELSE false END as is_admin_own
      FROM trips t
      LEFT JOIN own_vehicles ov ON LOWER(t.vehicle_number) = LOWER(ov.vehicle_number)
      WHERE t.is_deleted = $1
    `;

    const params = [deleted === "true"];
    let paramIndex = 2;

    if (own === "true") {
      query += ` AND ov.vehicle_number IS NOT NULL`;
    }

    query += ` ORDER BY t.loading_date DESC`;

    const result = await pool.query(query, params);

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

    const isOwn = await isOwnVehicle(t.vehicle_number);

    let gaadi_freight = Number(t.gaadi_freight || 0);
    let gaadi_advance = Number(t.gaadi_advance || 0);
    const party_freight = Number(t.party_freight || 0);
    const party_advance = Number(t.party_advance || 0);
    const tds = Number(t.tds || 0);
    let himmali = Number(t.himmali || 0);

    // ADMIN OWN VEHICLE LOGIC
    if (isOwn) {
      gaadi_freight = 0;
      gaadi_advance = 0;
      himmali = 0;
    }

    const gaadi_balance = gaadi_freight - gaadi_advance;
    const party_balance = party_freight - party_advance - tds - himmali;
    const profit = isOwn ? party_freight - tds : party_freight - gaadi_freight;

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
        pod_status=$24,
        updated_at=now()
      WHERE id=$25 AND is_deleted=false
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
        oldTrip.pod_status, // Preserve existing pod_status
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
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Get the trip to be deleted
    const targetRes = await client.query(
      "SELECT id, trip_code FROM trips WHERE id=$1 AND is_deleted=false FOR UPDATE",
      [req.params.id]
    );

    if (targetRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Trip not found or already deleted" });
    }

    // 2. Rename the deleted trip to get it out of the way
    // trip_code becomes: 2025_01_012_DEL_<timestamp>
    await client.query(
      `UPDATE trips 
       SET is_deleted=true, 
           trip_code=trip_code || '_DEL_' || $2::text 
       WHERE id=$1`,
      [req.params.id, Date.now()]
    );

    // Also mark payment history as deleted for this trip
    await client.query(`UPDATE payment_history SET is_deleted=true WHERE trip_id=$1`, [req.params.id]);

    // NOTE: Simplified logic - NO shifting of subsequent trips.

    await client.query("COMMIT");
    res.json({ message: "Trip deleted" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("SOFT DELETE ERROR:", err);
    res.status(500).json({ message: "Failed to delete trip", error: err.message });
  } finally {
    client.release();
  }
});

router.post("/:id/restore", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1. Get the deleted trip
    const targetRes = await client.query(
      "SELECT id, trip_code FROM trips WHERE id=$1 AND is_deleted=true FOR UPDATE",
      [req.params.id]
    );

    if (targetRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Trip not found or not deleted" });
    }

    const trip = targetRes.rows[0];
    const parts = trip.trip_code.split("_");

    // Support both new buffer style (parts=5) and old style (parts=4)
    if (parts.length < 4 || parts[3] !== "DEL") {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Invalid deleted trip format, cannot restore" });
    }

    const prefix = `${parts[0]}_${parts[1]}`;
    const originalNum = parseInt(parts[2]);

    if (isNaN(originalNum)) {
      throw new Error("Invalid original trip number");
    }

    const originalCode = `${prefix}_${String(originalNum).padStart(3, "0")}`;

    // 2. CHECK IF SLOT IS OCCUPIED
    const collisionRes = await client.query(
      "SELECT 1 FROM trips WHERE trip_code=$1 AND is_deleted=false",
      [originalCode]
    );

    if (collisionRes.rows.length > 0) {
      // Collision detected! Use original_code with suffix OR fail.
      const newCode = `${originalCode}_RES`;

      await client.query(
        `UPDATE trips SET is_deleted=false, trip_code=$1, updated_at=now() WHERE id=$2`,
        [newCode, req.params.id]
      );
      await client.query(
        `UPDATE payment_history SET is_deleted=false, trip_code=$1 WHERE trip_id=$2`,
        [newCode, req.params.id]
      );

      await client.query("COMMIT");
      return res.json({ message: "Trip restored with suffix (slot occupied)" });
    }

    // 3. Restore to original code (Slot is free)
    await client.query(
      `UPDATE trips SET is_deleted=false, trip_code=$1, updated_at=now() WHERE id=$2`,
      [originalCode, req.params.id]
    );

    await client.query(
      `UPDATE payment_history SET is_deleted=false, trip_code=$1 WHERE trip_id=$2`,
      [originalCode, req.params.id]
    );

    await client.query("COMMIT");
    res.json({ message: "Trip restored" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("RESTORE ERROR:", err);
    res.status(500).json({ message: "Failed to restore trip", error: err.message });
  } finally {
    client.release();
  }
});

router.delete("/:id/permanent", async (req, res) => {
  try {
    const check = await pool.query("SELECT is_deleted FROM trips WHERE id=$1", [req.params.id]);
    if (check.rows.length === 0) return res.status(404).json({ message: "Trip not found" });

    if (!check.rows[0].is_deleted) {
      return res.status(400).json({ message: "Cannot permanently delete an active trip. Soft delete it first." });
    }

    await pool.query("DELETE FROM payment_history WHERE trip_id=$1", [req.params.id]);
    await pool.query("DELETE FROM trips WHERE id=$1", [req.params.id]);

    res.json({ message: "Trip permanently deleted" });
  } catch (err) {
    console.error("PERMANENT DELETE ERROR:", err);
    res.status(500).json({ message: "Failed to delete permanently" });
  }
});

/* ================================
   SERVE POD (LATEST)
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

    let pods = [];
    try {
      pods = JSON.parse(result.rows[0].pod_path);
    } catch (e) {
      pods = [result.rows[0].pod_path];
    }

    if (!Array.isArray(pods) || pods.length === 0) {
      return res.status(404).send("No POD URLs found");
    }

    // Redirect to the first/latest POD for legacy compatibility
    res.redirect(pods[pods.length - 1]);
  } catch (err) {
    console.error("POD REDIRECT ERROR:", err);
    res.status(500).send("Failed to open POD");
  }
});

/* ================================
   PRINT METADATA (SLIP NUMBERS)
================================ */

router.post("/:id/print-metadata", async (req, res) => {
  const client = await pool.connect();
  try {
    const { types } = req.body; // ['pay_slip', 'loading_slip']
    const tripId = req.params.id;
    const responseData = {};

    await client.query("BEGIN");

    // Lock the trip row
    const tripRes = await client.query(
      "SELECT pay_slip_number, loading_slip_number FROM trips WHERE id=$1 FOR UPDATE",
      [tripId]
    );

    if (tripRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Trip not found" });
    }

    const trip = tripRes.rows[0];
    let updatesNeeded = false;
    const updateFields = [];
    const updateValues = [];
    let paramIdx = 1;

    for (const type of types) {
      if (type === 'pay_slip') {
        if (trip.pay_slip_number) {
          responseData.pay_slip_number = trip.pay_slip_number;
        } else {
          // Generate new
          const seqRes = await client.query(
            "UPDATE slip_counters SET current_value = current_value + 1 WHERE type='pay_slip' RETURNING current_value"
          );
          const newNum = seqRes.rows[0].current_value;
          responseData.pay_slip_number = newNum;
          updateFields.push(`pay_slip_number=$${paramIdx++}`);
          updateValues.push(newNum);
          updatesNeeded = true;
        }
      } else if (type === 'loading_slip') {
        if (trip.loading_slip_number) {
          responseData.loading_slip_number = trip.loading_slip_number;
        } else {
          // Generate new
          const seqRes = await client.query(
            "UPDATE slip_counters SET current_value = current_value + 1 WHERE type='loading_slip' RETURNING current_value"
          );
          const newNum = seqRes.rows[0].current_value;
          responseData.loading_slip_number = newNum;
          updateFields.push(`loading_slip_number=$${paramIdx++}`);
          updateValues.push(newNum);
          updatesNeeded = true;
        }
      }
    }

    if (updatesNeeded) {
      updateValues.push(tripId);
      await client.query(
        `UPDATE trips SET ${updateFields.join(', ')} WHERE id=$${paramIdx}`,
        updateValues
      );
    }

    await client.query("COMMIT");
    res.json(responseData);

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("PRINT METADATA ERROR:", err);
    res.status(500).json({ message: "Failed to generate slip numbers" });
  } finally {
    client.release();
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

/* ================================
   HELPER: CHECK OWN VEHICLE
================================ */
async function isOwnVehicle(vehicleNumber) {
  if (!vehicleNumber) return false;
  try {
    const result = await pool.query(
      "SELECT 1 FROM own_vehicles WHERE LOWER(vehicle_number) = LOWER($1)",
      [vehicleNumber.trim()]
    );
    return result.rows.length > 0;
  } catch (err) {
    console.error("Error checking own vehicle:", err);
    return false; // Fail safe to normal behavior
  }
}
