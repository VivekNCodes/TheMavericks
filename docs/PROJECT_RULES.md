# KrishiSetu AI - Team Development Rules & Boundaries

## 1. Golden Rules of Collaboration

1. **Folder Ownership Principle**:
   - Every contributor has an assigned domain. Never commit edits inside another member's feature directory (`src/features/*`) without prior review and written agreement.
2. **Shared Foundation Protection**:
   - The Integration Lead owns shared core infrastructure (`src/app/`, `src/components/`, `src/lib/`, `src/types/`, `src/config/`, `prisma/`, and root configurations).
   - Feature developers must **never** independently modify global layouts, global CSS, database connection pools, or root routing without coordination.
3. **No Destructive Git Operations**:
   - `git push --force` or rewriting history on shared branches is strictly prohibited.
   - All feature work must occur on dedicated feature branches (e.g., `feat/mandi-prices-analytics`).
4. **Data Honesty & No Fabricated Telemetry**:
   - Never invent mock data and disguise it as live APMC data, certified meteorological feeds, or clinical pathology predictions.
   - Always clearly label placeholder or sample telemetry in UI headers or status badges.
5. **No Monolithic Large Blobs**:
   - Refactor large components into atomic sub-components (`PageHeader`, `ModuleCard`, `FilterBar`, etc.).
   - Maximize React Server Component usage; only add `'use client'` where event listeners, browser hooks, or state variables are indispensable.

---

## 2. Team Member Assignments

| Contributor | Role | Assigned Boundary | Key Deliverables |
|---|---|---|---|
| **Member 1 (Lead)** | Integration & Architecture | `src/app/`, `src/components/`, `src/lib/`, `src/types/`, `src/features/crop-disease/` | App shell, design system, Crop Disease AI module, Prisma schema |
| **Member 2** | Agronomic Market Specialist | `src/features/mandi-prices/` | Mandi rate comparison, 7D/1M trend charts, arrival volume breakdown |
| **Member 3** | IoT & Irrigation Specialist | `src/features/irrigation/` | Field parameters wizard, soil moisture recommendations, 5-day weather strip |
| **Member 4** | Agri-Commerce Specialist | `src/features/marketplace/` | Produce catalog, listing detail page, buyer inquiry management |

---

## 3. Pull Request Requirements

Every pull request submitted to `main` must include:
- [ ] Working branch named with convention: `feat/<module-name>-<short-description>`.
- [ ] Zero TypeScript errors (`npm run build` or `npx tsc --noEmit` passing).
- [ ] Responsive design verified on 375px mobile, 768px tablet, and 1280px+ desktop.
- [ ] No hardcoded database credentials or personal access tokens.
- [ ] Clear test plan and screenshots/video demonstrating component states (loading, empty, success, error).
