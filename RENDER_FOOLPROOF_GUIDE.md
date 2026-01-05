# 🚀 FOOLPROOF Render + Vercel Guide

The error you saw (`MODULE_NOT_FOUND`) happens because Render is looking in the wrong folder. Let's fix this with a simpler method that works every time.

## 1. Reset your Render Settings
Go to your **Render Dashboard** -> Select your **Backend Service** -> **Settings**.

Change these exact fields:

*   **Root Directory:** (Keep this **EMPTY** or `./`. Do not put "backend" here).
*   **Build Command:** `npm install --prefix backend`
*   **Start Command:** `node backend/src/server.js`

---

## 2. Update Environment Variables
Stay in **Settings** -> **Environment** and make sure you have:

| Key | Value |
| :--- | :--- |
| `DATABASE_URL` | `postgresql://...` (Your Supabase URL) |
| `JWT_SECRET` | `transport_erp_2026_secure_8842_v1_xyz` |

---

## 3. Redeploy
Click the blue **"Manual Deploy"** button at the top and select **"Clear Build Cache & Deploy"**.

---

## 4. Update Vercel (Frontend)
Once the Render backend is live (it will say "Live" in green):
1.  **Copy the Backend URL** from Render.
2.  Go to **Vercel** -> **Settings** -> **Environment Variables**.
3.  Update `VITE_API_URL` to: `YOUR_RENDER_URL/api` (Don't forget the `/api`).
4.  **Redeploy** the Vercel project.

### Why this works:
By pointing the commands directly to the `backend` folder (`--prefix backend` and `backend/src/server.js`), we don't have to worry about Render's "Root Directory" setting anymore. It will find the files exactly where they are.
