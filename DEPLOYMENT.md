# Deploying to Vercel

This application is fully configured for deployment on **Vercel** with both frontend (React + Vite) and backend (Express serverless API endpoints).

## Deployment Steps

1. **Push your code to GitHub / GitLab / Bitbucket**:
   - Export or push this repository to your GitHub account.

2. **Import into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New > Project**.
   - Select your repository.

3. **Project Configuration**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Environment Variables**:
   Add the following environment variable in Vercel Project Settings under **Environment Variables**:
   - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API key for AI symptom triage.

5. **Deploy**:
   - Click **Deploy**. Vercel will build the frontend assets and automatically create Serverless Functions for all `/api/*` routes.
