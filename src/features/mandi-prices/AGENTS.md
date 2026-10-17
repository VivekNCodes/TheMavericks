# AGENTS.md - Mandi Price Intelligence Module

**Owner**: Member 2 (Agronomic Market Specialist)  
**Directory Scope**: `src/features/mandi-prices/`  
**Route**: `/mandi-prices`

---

## 1. Module Scope

The Mandi Price Intelligence module equips farmers with price transparency across neighboring agricultural wholesale markets (APMCs), eliminating middleman exploitation through real-time modal prices and price trend visualizations.

### Key Visual & Functional Elements (from Master Reference):
- **Filter Bar**: Crop dropdown (Tomato, Wheat, Onion, Potato, Mustard), State selector, District selector, View Range (7D, 1M, 3M, 6M), and `Search` button.
- **Nearby Markets List**:
  - Distance and location tags (e.g., `Jaipur Mandi - 25 km`, `Sanganer Mandi - 32 km`, `Phagi Mandi - 45 km`, `Chomu Mandi - 48 km`).
  - Current modal rate per quintal (e.g., `₹1,850/Quintal`).
  - Trend badges (e.g., `+12%`, `+8%`, `-3%`, `-5%`).
- **Price Trend Visualizer**:
  - Timeframe switcher: `7D | 1M | 3M | 6M`.
  - Responsive trend curve with fill gradient.
  - Summary metric tiles:
    - Minimum Price (₹1,200)
    - Modal Price (₹1,850)
    - Maximum Price (₹2,300)
    - Total Arrival Volume (1,250 Tonnes)

---

## 2. Boundaries & Rules

- **Allowed Changes**: Files strictly within `src/features/mandi-prices/`.
- **Prohibited Changes**: Do NOT edit `src/app/layout.tsx`, `src/components/layout/`, or other feature directories.
- **Data Honesty**: Ensure mock or placeholder prices are clearly denoted until live government APMC API connections are integrated.
