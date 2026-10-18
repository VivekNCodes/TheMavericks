import fs from "fs";
import path from "path";
import { prisma, isDbActive } from "@/lib/db";
import {
  MarketplaceListingItem,
  MarketplaceOrderItem,
  MarketplaceFilter,
  ProduceUnit,
  ProduceCategory,
  QualityGrade,
  OrderStatus,
  ListingStatus,
} from "../types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "marketplace-data.json");

interface MarketplaceDataStore {
  listings: MarketplaceListingItem[];
  orders: MarketplaceOrderItem[];
}

const INITIAL_DEMO_LISTINGS: MarketplaceListingItem[] = [
  {
    id: "list-tomato-01",
    userId: "google-10982348234",
    title: "Fresh Farmgate Hybrid Tomatoes",
    cropName: "Tomato",
    category: "Vegetables",
    variety: "Abhinav F1",
    description:
      "Grade-A uniform red tomatoes harvested at breaker stage. Cleaned and packed in ventilated 25kg crates. Farmgate pickup available immediately.",
    unit: "quintal",
    pricePerUnit: 1800,
    totalStock: 5.8,
    availableStock: 5.8,
    quantityKg: 580,
    pricePerQuintal: 1800,
    grade: "A Grade (Premium)",
    state: "Rajasthan",
    district: "Jaipur",
    village: "Amer Tehsil",
    location: "Amer, Jaipur, Rajasthan",
    pickupDelivery: "Farmgate Pickup & Seller Delivery Available",
    sellerName: "Ramesh Kumar",
    sellerPhone: "+91 98290 12345",
    sellerWhatsapp: "919829012345",
    sellerEmail: "ramesh.kumar.farmer@gmail.com",
    harvestDate: "16 Oct 2026",
    status: "ACTIVE",
    images: ["/icons/crop-tomato.svg"],
    isDemoSeed: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "list-wheat-02",
    userId: "farmer-arjan-002",
    title: "Premium Sharbati Golden Wheat",
    cropName: "Wheat",
    category: "Grains & Cereals",
    variety: "Sharbati C-306",
    description:
      "Cleaned, sun-dried, pesticide-free wheat grains with high gluten and golden luster. Moisture content below 11%. Tested and bagged in standard 50kg jute bags.",
    unit: "quintal",
    pricePerUnit: 2200,
    totalStock: 20,
    availableStock: 20,
    quantityKg: 2000,
    pricePerQuintal: 2200,
    grade: "Organic Certified",
    state: "Rajasthan",
    district: "Jaipur",
    village: "Chaksu",
    location: "Chaksu, Jaipur, Rajasthan",
    pickupDelivery: "Farmgate Pickup Only",
    sellerName: "Arjan Mehta",
    sellerPhone: "+91 98291 54321",
    sellerWhatsapp: "919829154321",
    sellerEmail: "arjan.wheat.farms@gmail.com",
    harvestDate: "14 Oct 2026",
    status: "ACTIVE",
    images: ["/icons/crop-wheat.svg"],
    isDemoSeed: true,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "list-potato-03",
    userId: "farmer-mohan-003",
    title: "Kufri Pukhraj Fresh Table Potatoes",
    cropName: "Potato",
    category: "Vegetables",
    variety: "Kufri Pukhraj",
    description:
      "Large-sized table potatoes with smooth skin and shallow eyes. Harvested from sandy loam soil. Excellent storage life and chipping quality.",
    unit: "quintal",
    pricePerUnit: 1200,
    totalStock: 10,
    availableStock: 10,
    quantityKg: 1000,
    pricePerQuintal: 1200,
    grade: "A Grade (Premium)",
    state: "Rajasthan",
    district: "Jaipur",
    village: "Sanganer Deoli",
    location: "Sanganer, Jaipur, Rajasthan",
    pickupDelivery: "Farmgate Pickup & Seller Delivery Available",
    sellerName: "Mohan Singh",
    sellerPhone: "+91 98292 67890",
    sellerWhatsapp: "919829267890",
    sellerEmail: "mohan.singh.farm@gmail.com",
    harvestDate: "15 Oct 2026",
    status: "ACTIVE",
    images: ["/icons/crop-potato.svg"],
    isDemoSeed: true,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "list-onion-04",
    userId: "farmer-sita-004",
    title: "Nashik Red Medium Bulb Onions",
    cropName: "Onion",
    category: "Vegetables",
    variety: "Nashik Red",
    description:
      "Pungent, cured medium to large red onions with dry outer papery skins. Cured under shed for 10 days for long transit durability.",
    unit: "quintal",
    pricePerUnit: 1600,
    totalStock: 7.5,
    availableStock: 7.5,
    quantityKg: 750,
    pricePerQuintal: 1600,
    grade: "FAQ Standard",
    state: "Rajasthan",
    district: "Jaipur",
    village: "Chomu Morija",
    location: "Chomu, Jaipur, Rajasthan",
    pickupDelivery: "Both Farmgate and Transport Delivery",
    sellerName: "Sita Devi",
    sellerPhone: "+91 98293 78901",
    sellerWhatsapp: "919829378901",
    sellerEmail: "sita.devi.krishi@gmail.com",
    harvestDate: "16 Oct 2026",
    status: "ACTIVE",
    images: ["/icons/crop-onion.svg"],
    isDemoSeed: true,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "list-mustard-05",
    userId: "farmer-harphool-005",
    title: "High Oil Content Pusa Mustard Seeds",
    cropName: "Mustard",
    category: "Oilseeds",
    variety: "Pusa Bold",
    description:
      "Certified bold mustard seeds tested with 41.5% oil content. Ideal for cold-pressed oil extraction plants and local expellers.",
    unit: "quintal",
    pricePerUnit: 5200,
    totalStock: 4,
    availableStock: 4,
    quantityKg: 400,
    pricePerQuintal: 5200,
    grade: "A Grade (Premium)",
    state: "Rajasthan",
    district: "Alwar",
    village: "Kishangarh Bas",
    location: "Alwar, Rajasthan",
    pickupDelivery: "Seller Delivery Available",
    sellerName: "Harphool Gurjar",
    sellerPhone: "+91 98294 89012",
    sellerWhatsapp: "919829489012",
    sellerEmail: "harphool.gurjar@gmail.com",
    harvestDate: "13 Oct 2026",
    status: "ACTIVE",
    images: ["/icons/crop-mustard.svg"],
    isDemoSeed: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "list-chili-06",
    userId: "google-10982348234",
    title: "Fiery G-4 Green Chilis - Hand Picked",
    cropName: "Chili",
    category: "Vegetables",
    variety: "G-4 Hot",
    description:
      "Freshly harvested spicy green chilis. Hand-picked with intact stalks to ensure maximum shelf freshness. Packed in breathable 10kg hampers.",
    unit: "kg",
    pricePerUnit: 68,
    totalStock: 250,
    availableStock: 250,
    quantityKg: 250,
    pricePerQuintal: 6800,
    grade: "A Grade (Premium)",
    state: "Rajasthan",
    district: "Jaipur",
    village: "Amer Tehsil",
    location: "Amer, Jaipur, Rajasthan",
    pickupDelivery: "Farmgate Pickup & Local Delivery",
    sellerName: "Ramesh Kumar",
    sellerPhone: "+91 98290 12345",
    sellerWhatsapp: "919829012345",
    sellerEmail: "ramesh.kumar.farmer@gmail.com",
    harvestDate: "17 Oct 2026",
    status: "ACTIVE",
    images: ["/icons/crop-chili.svg"],
    isDemoSeed: true,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

// Helper to calculate kg equivalent for any unit
export function normalizeToKg(quantity: number, unit: ProduceUnit): number {
  switch (unit) {
    case "tonne":
      return quantity * 1000;
    case "quintal":
      return quantity * 100;
    case "kg":
    default:
      return quantity;
  }
}

// Helper to normalize price to price-per-quintal for Mandi price comparison
export function normalizePricePerQuintal(pricePerUnit: number, unit: ProduceUnit): number {
  switch (unit) {
    case "tonne":
      return pricePerUnit / 10;
    case "quintal":
      return pricePerUnit;
    case "kg":
    default:
      return pricePerUnit * 100;
  }
}

// In-process lock to prevent race conditions during concurrent stock reservations
let storeLockPromise: Promise<void> = Promise.resolve();

async function withLock<T>(action: () => Promise<T>): Promise<T> {
  const currentLock = storeLockPromise;
  let release: () => void = () => {};
  storeLockPromise = new Promise<void>((resolve) => {
    release = resolve;
  });

  try {
    await currentLock;
    return await action();
  } finally {
    release();
  }
}

function ensureDataFile(): MarketplaceDataStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(STORE_FILE)) {
      const initial: MarketplaceDataStore = {
        listings: INITIAL_DEMO_LISTINGS,
        orders: [
          {
            id: "ord-demo-001",
            listingId: "list-tomato-01",
            listingTitle: "Fresh Farmgate Hybrid Tomatoes",
            cropName: "Tomato",
            sellerId: "google-10982348234",
            sellerName: "Ramesh Kumar",
            sellerWhatsapp: "919829012345",
            sellerEmail: "ramesh.kumar.farmer@gmail.com",
            buyerId: "buyer-trader-01",
            buyerName: "GreenFresh Traders Jaipur",
            buyerPhone: "+91 94140 99887",
            buyerWhatsapp: "919414099887",
            buyerEmail: "procurement@greenfresh.in",
            buyerAddress: "Shop 14, APMC Fruit & Veg Yard, Muhana Mandi, Jaipur",
            quantityRequested: 1.5,
            unit: "quintal",
            unitPrice: 1800,
            totalPrice: 2700,
            deliveryPreference: "Seller Delivery Available",
            notes: "Need 1.5 quintals delivered by tomorrow 9 AM for wholesale dispatch.",
            status: "PENDING",
            statusHistory: [
              {
                status: "PENDING",
                timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
                actor: "Buyer (GreenFresh Traders)",
                note: "Purchase request submitted.",
              },
            ],
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
          },
        ],
      };
      fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }

    const content = fs.readFileSync(STORE_FILE, "utf8");
    const parsed = JSON.parse(content) as MarketplaceDataStore;
    if (!parsed.listings || !Array.isArray(parsed.listings)) {
      parsed.listings = INITIAL_DEMO_LISTINGS;
    }
    if (!parsed.orders || !Array.isArray(parsed.orders)) {
      parsed.orders = [];
    }
    return parsed;
  } catch (err) {
    console.error("Failed to read marketplace data store:", err);
    return { listings: INITIAL_DEMO_LISTINGS, orders: [] };
  }
}

function writeDataFile(data: MarketplaceDataStore) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write marketplace data store:", err);
  }
}

export const MarketplaceStore = {
  async getListings(filter?: MarketplaceFilter, userId?: string): Promise<MarketplaceListingItem[]> {
    return withLock(async () => {
      const data = ensureDataFile();
      let result = [...data.listings];

      // If filtering by specific seller
      if (userId) {
        result = result.filter((l) => l.userId === userId);
      }

      // Keyword search
      if (filter?.searchQuery) {
        const q = filter.searchQuery.toLowerCase().trim();
        result = result.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            l.cropName.toLowerCase().includes(q) ||
            l.variety?.toLowerCase().includes(q) ||
            l.location.toLowerCase().includes(q) ||
            l.district.toLowerCase().includes(q) ||
            l.sellerName.toLowerCase().includes(q)
        );
      }

      // Category filter
      if (filter?.category && filter.category !== "All" && filter.category !== "all") {
        result = result.filter(
          (l) => l.category.toLowerCase() === filter.category!.toLowerCase()
        );
      }

      // Crop type filter
      if (filter?.cropType && filter.cropType !== "All Crops" && filter.cropType !== "all") {
        result = result.filter(
          (l) => l.cropName.toLowerCase() === filter.cropType!.toLowerCase()
        );
      }

      // State filter
      if (filter?.state && filter.state !== "All States" && filter.state !== "all") {
        result = result.filter(
          (l) => l.state.toLowerCase() === filter.state!.toLowerCase()
        );
      }

      // District filter
      if (filter?.district && filter.district !== "All Locations" && filter.district !== "all") {
        result = result.filter(
          (l) => l.district.toLowerCase() === filter.district!.toLowerCase()
        );
      }

      // Grade filter
      if (filter?.grade && filter.grade !== "All Grades" && filter.grade !== "all") {
        result = result.filter((l) => l.grade === filter.grade);
      }

      // Min/Max price filter
      if (typeof filter?.minPrice === "number" && !isNaN(filter.minPrice)) {
        result = result.filter((l) => l.pricePerUnit >= filter.minPrice!);
      }
      if (typeof filter?.maxPrice === "number" && !isNaN(filter.maxPrice)) {
        result = result.filter((l) => l.pricePerUnit <= filter.maxPrice!);
      }

      // Min quantity filter
      if (typeof filter?.minQuantity === "number" && !isNaN(filter.minQuantity)) {
        result = result.filter((l) => l.availableStock >= filter.minQuantity!);
      }

      // Sorting
      if (filter?.sortBy) {
        switch (filter.sortBy) {
          case "price_asc":
            result.sort((a, b) => a.pricePerQuintal - b.pricePerQuintal);
            break;
          case "price_desc":
            result.sort((a, b) => b.pricePerQuintal - a.pricePerQuintal);
            break;
          case "stock_desc":
            result.sort((a, b) => b.availableStock - a.availableStock);
            break;
          case "latest":
          default:
            result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            break;
        }
      } else {
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return result;
    });
  },

  async getListingById(id: string): Promise<MarketplaceListingItem | null> {
    return withLock(async () => {
      const data = ensureDataFile();
      return data.listings.find((l) => l.id === id) || null;
    });
  },

  async createListing(payload: Omit<MarketplaceListingItem, "id" | "createdAt" | "updatedAt" | "availableStock" | "quantityKg" | "pricePerQuintal">): Promise<MarketplaceListingItem> {
    return withLock(async () => {
      const data = ensureDataFile();
      const id = `list-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const quantityKg = normalizeToKg(payload.totalStock, payload.unit);
      const pricePerQuintal = normalizePricePerQuintal(payload.pricePerUnit, payload.unit);

      const newListing: MarketplaceListingItem = {
        ...payload,
        id,
        availableStock: payload.totalStock,
        quantityKg,
        pricePerQuintal,
        isDemoSeed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      data.listings.unshift(newListing);
      writeDataFile(data);

      return newListing;
    });
  },

  async updateListing(
    id: string,
    userId: string,
    updates: Partial<Omit<MarketplaceListingItem, "id" | "userId" | "createdAt">>
  ): Promise<{ success: boolean; listing?: MarketplaceListingItem; error?: string }> {
    return withLock(async () => {
      const data = ensureDataFile();
      const index = data.listings.findIndex((l) => l.id === id);

      if (index === -1) {
        return { success: false, error: "Listing not found" };
      }

      const listing = data.listings[index];
      // Permissions check: user can only edit their own listings
      if (listing.userId !== userId && !userId.startsWith("admin")) {
        return { success: false, error: "Unauthorized: You can only edit your own listings." };
      }

      // If unit or stock changed, recompute normalized metrics
      const newUnit = updates.unit || listing.unit;
      const newTotalStock = updates.totalStock !== undefined ? updates.totalStock : listing.totalStock;
      const newPricePerUnit = updates.pricePerUnit !== undefined ? updates.pricePerUnit : listing.pricePerUnit;

      const quantityKg = normalizeToKg(newTotalStock, newUnit);
      const pricePerQuintal = normalizePricePerQuintal(newPricePerUnit, newUnit);

      const updatedListing: MarketplaceListingItem = {
        ...listing,
        ...updates,
        quantityKg,
        pricePerQuintal,
        updatedAt: new Date().toISOString(),
      };

      // If available stock exceeds new total stock, cap it
      if (updatedListing.availableStock > updatedListing.totalStock) {
        updatedListing.availableStock = updatedListing.totalStock;
      }

      data.listings[index] = updatedListing;
      writeDataFile(data);

      return { success: true, listing: updatedListing };
    });
  },

  async toggleListingStatus(
    id: string,
    userId: string,
    status: ListingStatus
  ): Promise<{ success: boolean; listing?: MarketplaceListingItem; error?: string }> {
    return withLock(async () => {
      const data = ensureDataFile();
      const index = data.listings.findIndex((l) => l.id === id);

      if (index === -1) {
        return { success: false, error: "Listing not found" };
      }

      const listing = data.listings[index];
      if (listing.userId !== userId && !userId.startsWith("admin")) {
        return { success: false, error: "Unauthorized: You can only change status of your own listings." };
      }

      listing.status = status;
      listing.updatedAt = new Date().toISOString();
      data.listings[index] = listing;
      writeDataFile(data);

      return { success: true, listing };
    });
  },

  async deleteListing(
    id: string,
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    return withLock(async () => {
      const data = ensureDataFile();
      const index = data.listings.findIndex((l) => l.id === id);

      if (index === -1) {
        return { success: false, error: "Listing not found" };
      }

      const listing = data.listings[index];
      if (listing.userId !== userId && !userId.startsWith("admin")) {
        return { success: false, error: "Unauthorized: You can only remove your own listings." };
      }

      data.listings.splice(index, 1);
      writeDataFile(data);

      return { success: true };
    });
  },

  // --------------------------------------------------------------------------
  // ORDER WORKFLOW & SAFE INVENTORY TRANSACTIONS
  // --------------------------------------------------------------------------

  async createPurchaseRequest(payload: {
    listingId: string;
    buyerId?: string;
    buyerName: string;
    buyerPhone: string;
    buyerWhatsapp: string;
    buyerEmail?: string;
    buyerAddress?: string;
    quantityRequested: number;
    deliveryPreference: string;
    notes?: string;
  }): Promise<{ success: boolean; order?: MarketplaceOrderItem; error?: string }> {
    return withLock(async () => {
      const data = ensureDataFile();
      const listing = data.listings.find((l) => l.id === payload.listingId);

      if (!listing) {
        return { success: false, error: "Produce listing does not exist." };
      }

      if (listing.status !== "ACTIVE") {
        return { success: false, error: `This listing is currently ${listing.status.toLowerCase()} and cannot accept new orders.` };
      }

      if (payload.quantityRequested <= 0) {
        return { success: false, error: "Requested quantity must be greater than zero." };
      }

      // Safe stock validation: Prevent overselling
      if (payload.quantityRequested > listing.availableStock) {
        return {
          success: false,
          error: `Insufficient stock available. Requested: ${payload.quantityRequested} ${listing.unit}, Available: ${listing.availableStock} ${listing.unit}.`,
        };
      }

      const totalPrice = Math.round(payload.quantityRequested * listing.pricePerUnit);
      const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();

      const newOrder: MarketplaceOrderItem = {
        id: orderId,
        listingId: listing.id,
        listingTitle: listing.title,
        cropName: listing.cropName,
        sellerId: listing.userId,
        sellerName: listing.sellerName,
        sellerWhatsapp: listing.sellerWhatsapp,
        sellerEmail: listing.sellerEmail,
        buyerId: payload.buyerId || `buyer-${Date.now()}`,
        buyerName: payload.buyerName.trim(),
        buyerPhone: payload.buyerPhone.trim(),
        buyerWhatsapp: payload.buyerWhatsapp.trim(),
        buyerEmail: payload.buyerEmail?.trim() || undefined,
        buyerAddress: payload.buyerAddress?.trim() || undefined,
        quantityRequested: payload.quantityRequested,
        unit: listing.unit,
        unitPrice: listing.pricePerUnit,
        totalPrice,
        deliveryPreference: payload.deliveryPreference,
        notes: payload.notes?.trim() || undefined,
        status: "PENDING",
        statusHistory: [
          {
            status: "PENDING",
            timestamp: now,
            actor: `Buyer (${payload.buyerName})`,
            note: "Purchase request placed. Waiting for seller review.",
          },
        ],
        createdAt: now,
        updatedAt: now,
      };

      data.orders.unshift(newOrder);
      writeDataFile(data);

      return { success: true, order: newOrder };
    });
  },

  async getOrders(options: {
    userId?: string;
    role?: "seller" | "buyer";
    listingId?: string;
  }): Promise<MarketplaceOrderItem[]> {
    return withLock(async () => {
      const data = ensureDataFile();
      let orders = [...data.orders];

      if (options.listingId) {
        orders = orders.filter((o) => o.listingId === options.listingId);
      }

      if (options.userId) {
        if (options.role === "seller") {
          orders = orders.filter((o) => o.sellerId === options.userId);
        } else if (options.role === "buyer") {
          orders = orders.filter((o) => o.buyerId === options.userId);
        } else {
          orders = orders.filter(
            (o) => o.sellerId === options.userId || o.buyerId === options.userId
          );
        }
      }

      return orders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  },

  async updateOrderStatus(payload: {
    orderId: string;
    userId: string;
    newStatus: OrderStatus;
    actorRole: "seller" | "buyer";
    note?: string;
  }): Promise<{ success: boolean; order?: MarketplaceOrderItem; error?: string }> {
    return withLock(async () => {
      const data = ensureDataFile();
      const orderIndex = data.orders.findIndex((o) => o.id === payload.orderId);

      if (orderIndex === -1) {
        return { success: false, error: "Order not found" };
      }

      const order = data.orders[orderIndex];
      const listingIndex = data.listings.findIndex((l) => l.id === order.listingId);
      const listing = listingIndex !== -1 ? data.listings[listingIndex] : null;

      // Authorization checks
      if (payload.actorRole === "seller" && order.sellerId !== payload.userId && !payload.userId.startsWith("admin")) {
        return { success: false, error: "Unauthorized: You can only manage orders for your own listings." };
      }

      if (payload.actorRole === "buyer" && order.buyerId !== payload.userId && !payload.userId.startsWith("admin")) {
        return { success: false, error: "Unauthorized: You can only cancel your own purchase requests." };
      }

      const previousStatus = order.status;
      const now = new Date().toISOString();

      // State Transition logic & Inventory Atomic Management
      if (payload.newStatus === "ACCEPTED") {
        if (previousStatus !== "PENDING") {
          return { success: false, error: `Cannot accept order currently in ${previousStatus} state.` };
        }

        // Validate stock once more
        if (!listing) {
          return { success: false, error: "Associated produce listing no longer exists." };
        }

        if (order.quantityRequested > listing.availableStock) {
          return {
            success: false,
            error: `Cannot accept order: remaining stock (${listing.availableStock} ${listing.unit}) is less than requested quantity (${order.quantityRequested} ${listing.unit}).`,
          };
        }

        // Atomic inventory deduction
        listing.availableStock = Number((listing.availableStock - order.quantityRequested).toFixed(2));
        if (listing.availableStock <= 0) {
          listing.availableStock = 0;
          listing.status = "SOLD_OUT";
        }
        listing.updatedAt = now;
      } else if (payload.newStatus === "REJECTED" || payload.newStatus === "CANCELLED") {
        // If the order was previously ACCEPTED, restore inventory
        if (previousStatus === "ACCEPTED" && listing) {
          listing.availableStock = Number((listing.availableStock + order.quantityRequested).toFixed(2));
          if (listing.status === "SOLD_OUT" && listing.availableStock > 0) {
            listing.status = "ACTIVE";
          }
          listing.updatedAt = now;
        }
      }

      order.status = payload.newStatus;
      order.updatedAt = now;
      order.statusHistory.push({
        status: payload.newStatus,
        timestamp: now,
        actor: payload.actorRole === "seller" ? `Seller (${order.sellerName})` : `Buyer (${order.buyerName})`,
        note: payload.note || `Order status updated to ${payload.newStatus}`,
      });

      data.orders[orderIndex] = order;
      if (listingIndex !== -1 && listing) {
        data.listings[listingIndex] = listing;
      }

      writeDataFile(data);
      return { success: true, order };
    });
  },
};
