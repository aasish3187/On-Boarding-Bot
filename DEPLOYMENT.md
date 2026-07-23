# OnboardBot Deployment Guide

This guide outlines how to deploy the **OnboardBot** full-stack application (FastAPI backend + React frontend) to production cloud environments.

---

## 1. Prerequisites & Environment Variables

Before deploying, ensure you have gathered the required credentials.

### Backend Environment Variables (`.env`)
You will need to set these on your backend hosting provider:
- `GROQ_API_KEY`: Your Groq API key for LLaMA 3.1 inference.
- `DATABASE_URL`: The SQLite database path (e.g., `sqlite:///onboardbot.db`) or PostgreSQL connection string if scaling.
- `JWT_SECRET`: A long secure random string for signing login tokens.
- `ALGORITHM`: `HS256`

### Frontend Environment Variables
Set these on your frontend hosting provider:
- `VITE_API_URL`: The URL of your deployed FastAPI backend (e.g., `https://onboardbot-backend.onrender.com`).

---

## 2. Deploying the FastAPI Backend (Options)

### Option A: Deploying on Render (Recommended & Free)
1. Sign up/log in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository (`aasish3187/On-Boarding-Bot`).
4. Set the following configuration:
   - **Name**: `onboardbot-backend`
   - **Environment**: `Python`
   - **Root Directory**: `onboardbot_v2`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Click **Advanced** and add your Environment Variables (`GROQ_API_KEY`, `JWT_SECRET`, etc.).
6. Click **Create Web Service**. Once deployed, copy your service URL (e.g., `https://onboardbot-backend.onrender.com`).

### Option B: Deploying on Railway
1. Log in to [Railway](https://railway.app/).
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Choose the `On-Boarding-Bot` repo.
4. Under variables, add your `.env` key-values.
5. Railway will automatically detect the Python environment and run the startup script.

---

## 3. Deploying the React Frontend (Vite)

### Deploying on Vercel (Fastest & Free)
1. Sign up/log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository (`aasish3187/On-Boarding-Bot`).
4. In the configuration page, set:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   - Key: `VITE_API_URL`
   - Value: (The URL of your deployed backend, e.g., `https://onboardbot-backend.onrender.com`)
6. Click **Deploy**. Vercel will build and host your frontend.

---

## 4. Database Setup & Migrations
OnboardBot uses SQLite by default. When deploying to a platform like Render or Railway:
- SQLite databases are ephemeral unless you mount a **persistent disk** volume.
- On Render, add a **Disk** under the Web Service settings and point your `DATABASE_URL` to the mounted volume path (e.g., `/data/onboardbot.db`).
- Alternatively, for production scale, update `DATABASE_URL` to point to a managed PostgreSQL instance.
