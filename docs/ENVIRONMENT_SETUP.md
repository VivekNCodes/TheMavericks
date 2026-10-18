# AgroSaathi - Environment Setup Guide

## 1. Prerequisites

- **Node.js**: Version 18.17.0+ or 20.x (verified working with Node 20 / 24).
- **Package Manager**: `npm` (v9+) or `pnpm` (v8+).
- **Git**: Installed and authenticated with GitHub.
- **PostgreSQL Client (Optional)**: If connecting directly to Neon via psql.

---

## 2. Fast Setup (Zero External Credentials Required)

The AgroSaathi foundation has been architected to run immediately in offline/mock mode without requiring active third-party API keys or live cloud database connections.

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env.local

# 3. Start the Next.js development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the AgroSaathi Dashboard.

---

## 3. Connecting to Neon PostgreSQL (Optional)

When ready to provision live database tables:

1. Sign in to your [Neon Console](https://console.neon.tech).
2. Create a project: `agrosaathi-db`.
3. In the project dashboard, copy the pooled connection string:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[endpoint]-pooler.us-east-2.aws.neon.tech/agrosaathi?sslmode=require&pgbouncer=true"
   DIRECT_URL="postgresql://[user]:[password]@[endpoint].us-east-2.aws.neon.tech/agrosaathi?sslmode=require"
   ```
4. Push schema to database:
   ```bash
   npx prisma db push
   ```
5. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

---

## 4. Verification Checklist

Run these local checks before pushing to your feature branch:
```bash
npm run lint          # Validates ESLint rules
npx tsc --noEmit      # Validates TypeScript types strictly
npm run build         # Validates production Next.js build
```
