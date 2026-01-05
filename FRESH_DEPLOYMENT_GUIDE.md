# 🆕 Fresh Vercel Deployment Guide

Deleting and recreating the project is the best way to clear out old cache and start fresh. Follow these exact steps:

## Step 1: Delete the Old Project
1.  Go to your **Vercel Dashboard**.
2.  Select your project -> **Settings** -> **General**.
3.  Scroll to the bottom and click **Delete**.

---

## Step 2: Create a New Project
1.  Click **"Add New..."** -> **Project**.
2.  Select your GitHub repository (`TransportERP`).
3.  **DO NOT CLICK DEPLOY YET.**

---

## Step 3: Configure "Build & Development Settings"
This is the most critical part. Click the **"Build & Development Settings"** dropdown and set:

*   **Framework Preset:** `Other`
*   **Build Command:** `npm run build`
*   **Output Directory:** `frontend/dist`
*   **Install Command:** (Leave **OVERRIDE** turned **OFF**)

---

## Step 4: Add Environment Variables
Add these four variables:

| Key | Value |
| :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres.mdtmgoxsqynwxtputyat:7748011413My@aws-1-ap-south-1.pooler.supabase.com:6543/postgres` |
| `JWT_SECRET` | `transport_erp_secure_secret_2026` |
| `VITE_API_URL` | `/api` |
| `NODE_ENV` | `production` |

---

## Step 5: Click Deploy! 🚀
Once it finishes, the app will work perfectly:
1.  **/api requests** will hit your backend (via `vercel.json`).
2.  **frontend** will be built with all dependencies installed (via `package.json`).
3.  **Login** will work for `shrisanwariyaroadlines@gmail.com`.
