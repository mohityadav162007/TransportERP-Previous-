# 🚀 Full Vercel Deployment Guide

Follow these steps to deploy both your **Frontend** and **Backend** to Vercel as a single project.

## Step 1: Push All Changes to GitHub
Make sure you are in the **root folder** (`d:\TransportERP`).

```bash
git add .
git commit -m "Final Vercel configuration"
git push
```

---

## Step 2: Vercel Project Configuration
Go to your **Vercel Project Settings > General**.

1.  **Framework Preset:** Select **Other**.
2.  **Root Directory:** Leave as **`./`** (the root of your project).
3.  **Build Command:** `npm run vercel-build-v2`
4.  **Output Directory:** `frontend/dist`
5.  **Install Command:** (Leave as default or blank)

---

## Step 3: Set Environment Variables
Go to **Settings > Environment Variables** and add these:

| Key | Value |
| :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres.mdtmgoxsqynwxtputyat:7748011413My@aws-1-ap-south-1.pooler.supabase.com:6543/postgres` |
| `JWT_SECRET` | `transport_erp_secure_secret_2026` |
| `VITE_API_URL` | `/api` |
| `NODE_ENV` | `production` |

---

## Step 4: Final Check
After you push the code and set the variables:
1.  Vercel will start a new build.
2.  Once complete, visit your URL (e.g., `https://transport-erp-nine.vercel.app/`).
3.  Log in using:
    *   **Email:** `shrisanwariyaroadlines@gmail.com`
    *   **Password:** `Sanwariya_1228`

---

### 💡 Why this works:
*   **Routing:** The `vercel.json` tells Vercel that anything starting with `/api` goes to your backend code. Everything else goes to your frontend.
*   **Build:** The root `package.json` coordinates the build so you don't have to build things manually.
