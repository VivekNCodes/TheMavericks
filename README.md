# KrishiSetu AI (कृषि सेतु)

[![Next.js 14](https://img.shields.io/badge/Next.js-14-15803D.svg?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-5.21-2D3748.svg?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Neon Database](https://img.shields.io/badge/Neon-PostgreSQL-00E599.svg?style=flat-square&logo=postgresql)](https://neon.tech/)

> **Smart Farming, Brighter Futures**  
> An integrated agricultural intelligence and agri-commerce platform connecting Indian farmers with real-time agronomic insights, price discovery, and direct buyer access.

---

## 🌾 Core Modules

1. **🌿 Crop Disease Detection (`/crop-disease`)**  
   AI-powered instant leaf pathology diagnosis, confidence metrics, and localized treatment recommendations.
2. **📈 Mandi Price Intelligence (`/mandi-prices`)**  
   Multi-market modal rates (Jaipur, Sanganer, Phagi, Chomu), 7D/1M trend charts, and arrival volume transparency.
3. **💧 Smart Irrigation Advisor (`/irrigation`)**  
   Crop-stage and soil-tailored water advice combined with a 5-day hyper-local weather forecast strip.
4. **🏪 Farmer Marketplace (`/marketplace`)**  
   Direct farmer-to-buyer produce trading, verified farmer badges, and harvest inquiries.

---

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/VivekNCodes/TheMavericks.git
cd TheMavericks
npm install
```

### 2. Environment Configuration
```bash
cp .env.example .env.local
```
*(The dashboard runs completely out of the box with zero external API keys needed)*

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👥 Team Module Ownership

| Role | Contributor | Assigned Scope | Key Directory |
|---|---|---|---|
| **Integration Lead & Architect** | Lead | Global layout, AppShell, Shared UI, Prisma, Health API | `src/app/`, `src/components/`, `src/features/crop-disease/` |
| **Mandi Price Specialist** | Member 2 | Multi-mandi comparison, price trends, arrival analysis | `src/features/mandi-prices/` |
| **Smart Irrigation Specialist** | Member 3 | Field condition wizard, weather sync, water schedule | `src/features/irrigation/` |
| **Marketplace Specialist** | Member 4 | Produce listings, detail gallery, buyer inquiries | `src/features/marketplace/` |

For detailed rules and guidelines, see:
- [Architecture Guide](docs/ARCHITECTURE.md)
- [Team Development Rules](docs/PROJECT_RULES.md)
- [Module Ownership Matrix](docs/MODULE_OWNERSHIP.md)
- [API Contracts](docs/API_CONTRACTS.md)
- [Database & Neon Guidelines](docs/DATABASE_GUIDELINES.md)
- [Git Workflow](docs/GIT_WORKFLOW.md)
- [Test Plan](docs/TEST_PLAN.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

---

## 🛡️ License

Built by **The Mavericks** team for Indian agricultural empowerment.
