# KrishiSetu AI - Module Ownership & Team Boundaries

## 1. Ownership Governance Overview

To allow seamless parallel work by multiple developers without git conflicts, KrishiSetu AI assigns strict domain ownership. Changes outside your assigned scope require review and sign-off by the Integration Lead.

---

## 2. Detailed Ownership Breakdown

### Integration Lead & Architect
- **Assigned Directories**:
  - `src/app/` (Root layout, page, globals.css, loading, error, not-found)
  - `src/components/layout/` (AppShell, Sidebar, Header, MobileNavigation)
  - `src/components/shared/` (PageHeader, LoadingState, EmptyState, ErrorState, ModulePlaceholder)
  - `src/components/ui/` (Atomic design tokens: Button, Badge, Card, Input)
  - `src/lib/` (Database client singleton, API response helper, utility functions)
  - `src/types/` (Global types and interfaces)
  - `src/config/` (Navigation, site, and module configs)
  - `prisma/` (PostgreSQL schema and migration management)
  - `docs/` (Architecture, guidelines, rules)
  - Root configuration (`package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.mjs`)
- **Assigned Feature**:
  - `src/features/crop-disease/` (Crop Disease Detection: Leaf upload UI, pathology guide, diagnosis models)
- **Responsibilities**:
  - Core shell maintenance, Vercel deployments, Neon DB schema reviews, code review for PRs into `main`.

---

### Member 2: Mandi Price Intelligence Specialist
- **Assigned Directory**: `src/features/mandi-prices/`
- **Assigned Route**: `/mandi-prices`
- **Scope**:
  - Multi-mandi price table and comparison cards (Jaipur, Sanganer, Phagi, Chomu).
  - Price trend charts (7D, 1M, 3M, 6M timeframes).
  - Arrival volume breakdown and filter bar (State, District, Crop).
  - Integration with future government APMC open APIs (`data.gov.in`).

---

### Member 3: Smart Irrigation Advisor Specialist
- **Assigned Directory**: `src/features/irrigation/`
- **Assigned Route**: `/irrigation`
- **Scope**:
  - Step wizard (Crop Details, Weather Data, AI Analysis, Results).
  - Field condition form (Soil type, crop growth stage, last irrigation date).
  - Recommendation engine display ("Moderate Need - Consider irrigation in next 2-3 days").
  - 5-day weather forecast forecast strip.

---

### Member 4: Farmer Marketplace Specialist
- **Assigned Directory**: `src/features/marketplace/`
- **Assigned Route**: `/marketplace`
- **Scope**:
  - Produce listings catalog (Tomato, Potato, Onion, Wheat).
  - Listing detail page (`/marketplace/[id]`) with image gallery, farmer verification badge, and buyer inquiries.
  - Create listing modal/form and direct trade matchmaking logic.

---

## 3. Communication Protocol

- **Proposing Schema Changes**: If a member needs additional database fields in `prisma/schema.prisma`, submit an issue or RFC in PR comments for the Lead to update the central schema.
- **Proposing Shared UI Components**: If a reusable button or input variant is required, request addition to `src/components/ui/`.
- **Pre-Merge Validation**: Every PR must demonstrate zero TypeScript errors (`npx tsc --noEmit`) and passing build.
