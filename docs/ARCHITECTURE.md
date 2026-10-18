# AgroSaathi - System Architecture

## 1. Architectural Philosophy

AgroSaathi follows a **Modular Monolith** pattern built upon the **Next.js 14 App Router**. 
The repository is structured to enable independent feature development by different team members while enforcing centralized integration for shared layout, data access contracts, theme tokens, and authentication shells.

```
                    ┌───────────────────────────────────────────┐
                    │            Next.js App Router             │
                    │      (src/app/layout.tsx & page.tsx)      │
                    └─────────────────────┬─────────────────────┘
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
      ┌───────────────────────┐                       ┌───────────────────────┐
      │   Global AppShell     │                       │    Shared UI & Nav    │
      │   Sidebar & Header    │                       │  (Buttons, Cards,     │
      │   Mobile Navigation   │                       │   Badges, Modals)     │
      └───────────┬───────────┘                       └───────────┬───────────┘
                  │                                               │
      ┌───────────┴───────────────────────────────────────────────┴───────────┐
      ▼                               ▼                       ▼               ▼
┌───────────────┐              ┌───────────────┐      ┌───────────────┐ ┌───────────────┐
│ Crop Disease  │              │ Mandi Prices  │      │  Irrigation   │ │  Marketplace  │
│  (Lead Owner) │              │  (Member 2)   │      │  (Member 3)   │ │  (Member 4)   │
│ src/features/ │              │ src/features/ │      │ src/features/ │ │ src/features/ │
│ crop-disease/ │              │ mandi-prices/ │      │  irrigation/  │ │ marketplace/  │
└───────┬───────┘              └───────┬───────┘      └───────┬───────┘ └───────┬───────┘
        │                              │                      │                 │
        └──────────────────────────────┴──────────┬───────────┴─────────────────┘
                                                  ▼
                                      ┌───────────────────────┐
                                      │  Shared Services & DB │
                                      │  - src/lib/db.ts      │
                                      │  - src/lib/api-resp   │
                                      │  - prisma/schema      │
                                      └───────────┬───────────┘
                                                  ▼
                                      ┌───────────────────────┐
                                      │    Neon PostgreSQL    │
                                      │  (Serverless Pooled)  │
                                      └───────────────────────┘
```

---

## 2. Directory Separation & Responsibility Matrix

| Layer / Directory | Primary Responsibility | Ownership |
|---|---|---|
| `src/app/` | Top-level routing, root metadata, layout composition, API health route | Integration Lead |
| `src/components/layout/` | AppShell, Sidebar, Header, Mobile Drawer | Integration Lead |
| `src/components/shared/` | PageHeader, EmptyState, LoadingState, ErrorState | Integration Lead |
| `src/components/ui/` | Atomic design tokens: Button, Badge, Card, Input | Integration Lead |
| `src/features/crop-disease/` | Image upload, inference UI, pathology guide | Integration Lead |
| `src/features/mandi-prices/` | Price cards, APMC filter bar, trend analytics | Member 2 |
| `src/features/irrigation/` | Wizard flow, soil & weather inputs, schedule cards | Member 3 |
| `src/features/marketplace/` | Produce catalog, listing detail, buyer inquiries | Member 4 |
| `src/lib/` | Prisma client singleton, API response builders, utilities | Integration Lead |
| `src/types/` | Global TypeScript interfaces and domain models | Integration Lead |
| `prisma/` | PostgreSQL schema and migration scripts | Integration Lead |

---

## 3. Rendering Strategy

1. **Server Components by Default (`RSC`)**:
   - Layouts, static headers, page wrappers, and server data fetchers default to Server Components.
   - Reduces clientside JavaScript footprint, maximizing performance on rural mobile networks.
2. **Client Components (`'use client'`)**:
   - Only used where browser interactivity is strictly required:
     - Interactive sidebar toggle / mobile drawer state.
     - Form input state and image drag-and-drop file readers.
     - Interactive tab switches and dropdown triggers.
3. **Data Fetching & Fallbacks**:
   - Each module handles its own mock fallbacks so the app renders seamlessly without live external credentials during design verification.

---

## 4. Design System Tokens (Tailwind)

- **Forest Green (`#15803D`)**: Primary action, brand badges, active links, confidence indicators.
- **Deep Leaf (`#166534`)**: Top banner background, rich header cards.
- **Mint Tint (`#DCFCE7` / `#F0FDF4`)**: Active navigation highlights, chip badges.
- **Restrained Amber (`#F59E0B` / `#FEF3C7`)**: Market price indicators and alerts.
- **Soft Sky Blue (`#0284C7` / `#E0F2FE`)**: Water and irrigation indicators.
- **Neutral Surface (`#FFFFFF` / `#F8FAF8`)**: Clean card backgrounds and high contrast readability.
