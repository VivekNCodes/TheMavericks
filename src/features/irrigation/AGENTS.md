# AGENTS.md - Smart Irrigation Advisor Module

**Owner**: Member 3 (IoT & Irrigation Specialist)  
**Directory Scope**: `src/features/irrigation/`  
**Route**: `/irrigation`

---

## 1. Module Scope

The Smart Irrigation Advisor module provides crop-specific, soil-conscious water management guidance synchronized with real-time hyper-local weather forecasts and crop phenological stages.

### Key Visual & Functional Elements (from Master Reference):
- **Progress Stepper Wizard**:
  - Step 1: Crop Details (Active)
  - Step 2: Weather Data
  - Step 3: AI Analysis
  - Step 4: Results
- **Field Information Form**:
  - Crop selection (e.g., Tomato)
  - Growth Stage (e.g., Flowering, Vegetative, Fruit Development)
  - Soil Type (e.g., Loamy, Sandy, Clay, Black Cotton)
  - Last Irrigation Date picker (e.g., 14-10-2026)
  - Field Location (e.g., Jaipur, Rajasthan with location pin)
  - `Get Irrigation Advice ->` primary action button
- **Irrigation Recommendation Panel**:
  - Urgency/Status Badge: `Moderate Need` (green/amber)
  - Headline: `Consider irrigation in the next 2-3 days`
  - Contextual explanation on evapotranspiration and crop stage demands.
  - 5-Day Weather Forecast Strip (Temperature high, rainfall volume mm, condition icon).
  - Practical soil moisture validation tip.

---

## 2. Boundaries & Rules

- **Allowed Changes**: Files strictly within `src/features/irrigation/`.
- **Prohibited Changes**: Do NOT edit `src/app/layout.tsx`, `src/components/layout/`, or other feature directories.
- **Meteorological Integrity**: Clearly denote sample weather indicators until live meteorological APIs are wired up.
