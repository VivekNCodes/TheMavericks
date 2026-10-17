# KrishiSetu AI - Deployment & Vercel Configuration Guide

## 1. Hosting Architecture

KrishiSetu AI is optimized for deployment on **Vercel** as a unified Next.js 14 App Router application.

- **Frontend & Server Components**: Vercel Edge / Serverless Functions.
- **Static Assets**: Vercel Global Edge Network (CDN).
- **Database**: Neon Serverless PostgreSQL (AWS region: us-east-2 or ap-south-1).
- **Build Target**: Standalone / Next.js default.

---

## 2. Vercel Project Setup Steps

1. **Import GitHub Repository**:
   - In the Vercel dashboard, click **Add New Project**.
   - Select `VivekNCodes/TheMavericks`.
   - Framework Preset: **Next.js**.
   - Root Directory: `./` (root of repository).

2. **Configure Build Settings**:
   - **Build Command**: `npm run build` (or `prisma generate && next build`)
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

3. **Configure Environment Variables**:
   Add the following in the Vercel Project Settings > Environment Variables:
   - `NEXT_PUBLIC_APP_NAME` = `KrishiSetu AI`
   - `NEXT_PUBLIC_APP_DESCRIPTION` = `Smart Farming, Brighter Futures`
   - `DATABASE_URL` = `(Your Neon connection string with pgbouncer=true)`
   - `DIRECT_URL` = `(Your Neon direct connection string)`

4. **Deploy**:
   - Trigger the initial deployment from `main`.
   - Verify health check route at: `https://<your-vercel-domain>/api/health`.

> **Deployment Honesty Rule**: Do not declare the site deployed until a real deployment URL is tested and returns HTTP 200.
