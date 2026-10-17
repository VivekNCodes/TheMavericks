# KrishiSetu AI - Verification & Test Plan

## 1. Scope of Testing

This test plan defines verification gates for the KrishiSetu AI foundation, dashboard shell, module placeholders, and subsequent feature implementations.

---

## 2. Test Execution Matrix

| Test Level | Scope | Command / Tool | Acceptance Criteria |
|---|---|---|---|
| **Type Check** | Static types & interfaces | `npx tsc --noEmit` | Zero TypeScript errors across all files |
| **Linting** | Code style & Next.js rules | `npm run lint` | Zero ESLint warnings or errors |
| **Build Validation** | Production asset compilation | `npm run build` | Successful Next.js production build |
| **Route Integrity** | Main routes (`/`, `/crop-disease`, `/mandi-prices`, `/irrigation`, `/marketplace`) | HTTP GET / Dev Server | HTTP 200 on all pages; no hydration errors |
| **Health API** | Backend health status | `GET /api/health` | HTTP 200 with JSON payload `{"status":"healthy"}` |
| **Responsive UX** | 375px mobile, 768px tablet, 1280px+ desktop | Chrome DevTools viewport | Sidebar toggles to drawer on mobile, horizontal cards adapt gracefully |
| **A11y & Contrast** | Color contrast, alt texts, ARIA labels | DevTools / Manual | Minimum 4.5:1 contrast on text elements |

---

## 3. UI Component Test Checklist

- [ ] **Sidebar**:
  - Highlights active route with mint green pill (`#DCFCE7`) and green icon (`#15803D`).
  - Correct icon per item (Dashboard, Crop Health, Mandi Prices, Irrigation, Marketplace).
  - Collapses/toggles smoothly on mobile screens.
- [ ] **Header**:
  - Displays user profile (Ramesh Kumar, Farmer).
  - Displays location badge ("Jaipur, Rajasthan") and weather preview ("28°C Sunny").
  - Notification icon and language selector rendered cleanly.
- [ ] **Welcome Section**:
  - Forest green background with farmer imagery and friendly greeting.
- [ ] **Module Action Cards**:
  - 4 cards: Crop Health, Mandi Prices, Irrigation Advisor, Farmer Marketplace.
  - Buttons (`Scan Crop ->`, `View Prices ->`, `Get Advice ->`, `Browse Market ->`) navigate to assigned routes.
- [ ] **Your Crops Section**:
  - Displays Tomato (1.2 acres), Wheat (2 acres), Chili (0.5 acres), and "+ Add Crop" action.
- [ ] **Quick Insights Section**:
  - Displays Market Price trend (+12%), Rainfall forecast (5 mm tomorrow), and Irrigation reminder (Check in 2 days).
- [ ] **Module Route Placeholders**:
  - Renders designated ownership banner, reference preview breakdown, and implementation guidelines.
