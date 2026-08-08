# Deploying to Render.com

This application is configured for deployment on **Render.com** as a Node.js Web Service running both the React frontend and Express backend.

- **Live Render Application**: [https://smart-hospital-management-system-svbi.onrender.com/](https://smart-hospital-management-system-svbi.onrender.com/)

---

## Quick Steps to Deploy on Render

1. **Push your code to GitHub / GitLab**:
   - Commit and push these updated changes (`package.json`, `render.yaml`) to your GitHub repository.

2. **Create a New Web Service on Render**:
   - Log into [Render Dashboard](https://dashboard.render.com/).
   - Click **New +** and select **Web Service**.
   - Connect your GitHub repository (`Balu143865/Smart-Hospital-Management-System`).

3. **Configure Service Settings**:
   - **Name**: `enterprise-hospital-system`
   - **Language**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

4. **Environment Variables**:
   Add the following environment variable under **Environment Variables**:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API Key for AI features.

5. **Deploy**:
   - Click **Create Web Service**. All build tools (`vite`, `esbuild`) are included in `dependencies` so `npm install && npm run build` will succeed cleanly.
