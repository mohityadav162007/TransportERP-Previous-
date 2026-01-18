import { pool } from "../db.js";

export async function generateTripCode(loading_date) {
  if (!loading_date) {
    throw new Error("loading_date is required for generating trip code");
  }

  const date = new Date(loading_date);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid loading_date format");
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  // Format: YYYY_MM_XXX. We need to find the max XXX for this YYYY_MM
  const prefix = `${year}_${month}_%`;

  const result = await pool.query(
    `
    SELECT trip_code
    FROM trips
    WHERE trip_code LIKE $1 AND is_deleted=false
    ORDER BY trip_code DESC
    LIMIT 1
    `,
    [prefix]
  );

  let nextNum = 1;
  if (result.rows.length > 0) {
    const lastCode = result.rows[0].trip_code;
    const lastNum = parseInt(lastCode.split("_")[2]);
    if (!isNaN(lastNum)) {
      nextNum = lastNum + 1;
    }
  }

  const next = String(nextNum).padStart(3, "0");

  return `${year}_${month}_${next}`;
}
