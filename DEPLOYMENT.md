# Deploying to Render.com

This application is configured for deployment on **Render.com** as a Node.js Web Service running both the React frontend and Express backend.

---

## Quick Steps to Deploy on Render

1. **Push your code to GitHub / GitLab**:
   - Push your project repository to GitHub or GitLab.

2. **Create a New Web Service on Render**:
   - Log into [Render Dashboard](https://dashboard.render.com/).
   - Click **New +** and select **Web Service**.
   - Connect your GitHub / GitLab repository.

3. **Configure the Service Settings**:
   - **Name**: `enterprise-hospital-system` (or your preferred name)
   - **Language**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

4. **Add Environment Variables**:
   Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API Key for AI clinical assistant features.

5. **Deploy**:
   - Click **Create Web Service**. Render will automatically build the React assets and run the Express server on its assigned port.

---

## Removed Vercel Configuration
- Deleted `vercel.json` and `/api/index.ts`.
- The application now uses standard Node.js server execution (`npm start`) suitable for Render, Railway, Cloud Run, or Heroku.
