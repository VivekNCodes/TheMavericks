# AGENTS.md - Farmer Marketplace Module

**Owner**: Member 4 (Agri-Commerce Specialist)  
**Directory Scope**: `src/features/marketplace/`  
**Route**: `/marketplace`

---

## 1. Module Scope

The Farmer Marketplace module enables farmers to list freshly harvested produce directly for trade with wholesale distributors, retail vendors, and institutional buyers, cutting out predatory middlemen and increasing profit margins.

### Key Visual & Functional Elements (from Master Reference):
- **Header Actions**: `+ Create Listing` primary button.
- **Tabbed Views**: `Browse Produce | My Listings | My Offers`.
- **Search & Filter Strip**: Search bar ("Search crops, location..."), Crop Type, Location, Price Range, Sort By (Latest, Price Low to High, etc.).
- **Produce Card Grid**:
  - Image thumbnail of harvested produce.
  - Crop Title & Available Quantity (e.g., `Tomato - 580 kg`, `Potato - 1,000 kg`, `Onion - 750 kg`, `Wheat - 2,000 kg`).
  - Unit Price (e.g., `₹1,800/Quintal`).
  - Location and Farmer Name (e.g., `Jaipur, Rajasthan • Ramesh Kumar`).
  - Interactive Wishlist/Heart and `View Details` action button.
- **Listing Detail Page (`/marketplace/[id]`)**:
  - Multi-image gallery.
  - Farmer profile card (Verified Farmer badge, location, member tenure, "View Profile").
  - Specification grid (Price, Quantity, Grade, Harvest Date, Post Type).
  - Buyer Interest section with incoming inquiries from verified traders.

---

## 2. Boundaries & Rules

- **Allowed Changes**: Files strictly within `src/features/marketplace/`.
- **Prohibited Changes**: Do NOT edit `src/app/layout.tsx`, `src/components/layout/`, or other feature directories.
- **Transactional Honesty**: No real monetary charges or fabricated transaction guarantees.
