# CI/CD Deployment Plan for LeaderBoard Web App

This document outlines a complete Continuous Integration and Continuous Deployment (CI/CD) strategy for the LeaderBoard web application, which consists of a React (Vite) frontend and a Node.js/Express (Socket.IO, MongoDB) backend.

## 1. Hosting Environment & Infrastructure
For a modern, scalable, and developer-friendly setup, we recommend the following stack:

*   **Version Control:** GitHub
*   **Database:** MongoDB Atlas (managed DB hosting)
*   **Frontend Hosting (Static/CDN):** Vercel or Netlify (Excellent integration with Vite/React, global edge CDN).
*   **Backend Hosting (Node.js & WebSockets):** Render or DigitalOcean App Platform (Great native support for Node.js and long-lived WebSocket connections required by Socket.IO).

---

## 2. Continuous Integration (CI) - GitHub Actions

The CI pipeline runs automatically on every Pull Request to the `main` branch to ensure code quality before merging.

### Workflow File: `.github/workflows/ci.yml`
**Triggers:** `pull_request` to `main` branch.

**Jobs:**
1.  **Frontend CI:**
    *   **Checkout Code:** Pulls the latest code.
    *   **Setup Node.js:** Installs Node.js (v20+).
    *   **Install Dependencies:** `cd frontend && npm ci`
    *   **Linting:** `npm run lint` (checks for code style issues).
    *   **Build Test:** `npm run build` (ensures the Vite build succeeds without errors).
2.  **Backend CI:**
    *   **Checkout Code:** Pulls the latest code.
    *   **Setup Node.js:** Installs Node.js (v20+).
    *   **Install Dependencies:** `cd backend && npm ci`
    *   **Security Audit:** (Optional) `npm audit` to check for dependency vulnerabilities.

---

## 3. Continuous Deployment (CD)

The CD pipeline triggers automatically when code is merged into the `main` branch. We separate the deployment of the frontend and backend.

### Frontend Deployment (Vercel/Netlify)
Vercel and Netlify have built-in GitHub Git integrations that serve as the CD pipeline.
*   **Trigger:** Push to `main`.
*   **Action:** Vercel automatically detects the push, runs the build command (`npm run build`), and deploys the `dist` folder to its global CDN.
*   **Environment Variables:** Configure `VITE_API_URL` in the Vercel dashboard to point to the production backend URL (e.g., `https://api.yourdomain.com/api`).

### Backend Deployment (Render / DigitalOcean)
*   **Trigger:** Push to `main`.
*   **Action:** The PaaS (Render/DigitalOcean) detects the push, spins up a build environment, runs `npm install`, and starts the server using the command defined in `package.json` (e.g., `npm start` which runs `node server.js`).
*   **Environment Variables Configured in Dashboard:**
    *   `PORT=5000` (or leave default for PaaS)
    *   `MONGO_URI` (Production MongoDB Atlas Connection String)
    *   `JWT_SECRET` (Secure random string for authentication)

---

## 4. Implementation Steps

### Step 1: Database Setup
1. Create a MongoDB Atlas account and a new cluster.
2. In the "Network Access" section, allow IP access (either `0.0.0.0/0` for PaaS or specific IPs if your PaaS provides static outbound IPs).
3. Copy the Connection String.

### Step 2: Backend Deployment
1. Create an account on Render or DigitalOcean.
2. Create a new "Web Service" and link your GitHub repository.
3. Configure settings:
   * **Root Directory:** `./backend`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
4. Add the `MONGO_URI` and `JWT_SECRET` to the environment variables.
5. Deploy and copy the resulting URL (e.g., `https://leaderboard-api.onrender.com`).

### Step 3: Frontend Deployment
1. Create an account on Vercel.
2. Add a new Project and import your GitHub repository.
3. Configure settings:
   * **Framework Preset:** Vite
   * **Root Directory:** `frontend`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
4. Add Environment Variable:
   * `VITE_API_URL` = `<Your Backend URL from Step 2>/api`
5. Deploy.

### Step 4: GitHub Actions Setup (Optional but Recommended)
Create `.github/workflows/ci.yml` in your repository root to enforce linting and build checks before any code reaches the deployment phase.

---

## 5. Post-Deployment Optimization & Monitoring
* **CORS Settings:** Once deployed, update the backend `cors` configuration in `server.js` to strictly allow only your Vercel frontend domain instead of `*`.
* **Logging/Monitoring:** Use a service like **Datadog**, **Sentry** or just **Render's built-in logs** to monitor active WebSocket connections and backend memory usage.
