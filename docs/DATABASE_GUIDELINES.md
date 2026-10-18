# AgroSaathi - Database Guidelines & Neon PostgreSQL

## 1. Database Architecture & Technology

- **Database Engine**: PostgreSQL 16 (Hosted on **Neon** serverless).
- **ORM / Client**: **Prisma ORM** with `@prisma/client`.
- **Connection Strategy**:
  - **Serverless / Next.js API Routes**: Connect via Neon Connection Pooler (`pgbouncer=true` on port 5432 or 6543) via `DATABASE_URL`.
  - **Prisma Migrations & CLI**: Direct non-pooled connection via `DIRECT_URL`.

---

## 2. Environment Variables

Define the following in your `.env.local` (see `.env.example`):
```env
# Serverless connection with connection pooler
DATABASE_URL="postgresql://[user]:[password]@[neon-endpoint]-pooler.us-east-2.aws.neon.tech/agrosaathi?sslmode=require&pgbouncer=true"

# Direct connection for migrations
DIRECT_URL="postgresql://[user]:[password]@[neon-endpoint].us-east-2.aws.neon.tech/agrosaathi?sslmode=require"
```

> **Data Honesty Notice**: In local development, the application operates in offline/mock fallback mode if database credentials are not yet configured. Do not claim Neon is connected unless verified with a real query.

---

## 3. Core Schema Entities

The schema defines models tailored for the 4 core pillars:

1. **User / Farmer**:
   - `id`, `name`, `phone`, `role` (`FARMER`, `BUYER`, `AGRONOMIST`, `ADMIN`), `district`, `state`, `avatarUrl`, `isVerified`, `createdAt`.
2. **CropProfile** (`Your Crops`):
   - `id`, `farmerId`, `cropName` (Tomato, Wheat, Chili, etc.), `acreage` (Float), `growthStage` (Vegetative, Flowering, Grain Filling, Maturity), `sowingDate`.
3. **DiseaseLog** (Crop Disease Detection):
   - `id`, `cropProfileId`, `imageUrl`, `detectedDisease`, `confidence` (Float), `severity`, `symptoms`, `treatmentPlan`, `status`.
4. **MandiRecord** (Price Intelligence):
   - `id`, `mandiName`, `state`, `district`, `cropName`, `minPrice`, `modalPrice`, `maxPrice`, `arrivalsTonnes`, `recordDate`.
5. **IrrigationLog** (Smart Irrigation):
   - `id`, `cropProfileId`, `soilType`, `growthStage`, `recommendationLevel` (`LOW`, `MODERATE`, `URGENT`), `nextIrrigationDate`, `weatherJson`.
6. **MarketplaceListing** (Direct Trade):
   - `id`, `farmerId`, `cropName`, `variety`, `quantityKg`, `pricePerQuintal`, `grade`, `location`, `harvestDate`, `status` (`ACTIVE`, `SOLD`, `RESERVED`), `images`.
7. **MarketplaceInquiry** (Buyer Interest):
   - `id`, `listingId`, `buyerName`, `buyerOrganization`, `requestedQuantityKg`, `status` (`PENDING`, `ACCEPTED`, `REJECTED`).

---

## 4. Prisma Migration Workflow

1. Modify `prisma/schema.prisma`.
2. Create a migration in development:
   ```bash
   npx prisma migrate dev --name <descriptive_name>
   ```
3. Generate updated TypeScript client:
   ```bash
   npx prisma generate
   ```
4. Only the **Integration Lead** is permitted to merge database schema migrations into `main`.
