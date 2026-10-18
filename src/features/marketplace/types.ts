export type ProduceUnit = "kg" | "quintal" | "tonne";

export type ProduceCategory =
  | "Vegetables"
  | "Grains & Cereals"
  | "Fruits"
  | "Pulses"
  | "Spices"
  | "Oilseeds";

export type QualityGrade =
  | "A Grade (Premium)"
  | "B Grade (Standard)"
  | "Organic Certified"
  | "FAQ Standard";

export type ListingStatus = "ACTIVE" | "PAUSED" | "SOLD_OUT" | "CANCELLED";

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";

export interface StatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface MarketplaceListingItem {
  id: string;
  userId: string;
  title: string;
  cropName: string;
  category: ProduceCategory | string;
  variety?: string;
  description?: string;
  unit: ProduceUnit;
  pricePerUnit: number; // in INR
  totalStock: number;
  availableStock: number;
  quantityKg: number;
  pricePerQuintal: number;
  grade: QualityGrade | string;
  state: string;
  district: string;
  village?: string;
  location: string;
  pickupDelivery: string;
  sellerName: string;
  sellerPhone: string;
  sellerWhatsapp: string;
  sellerEmail?: string;
  harvestDate?: string;
  status: ListingStatus;
  images: string[];
  isDemoSeed?: boolean; // Clearly marks sample seed listings
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceOrderItem {
  id: string;
  listingId: string;
  listingTitle: string;
  cropName: string;
  sellerId: string;
  sellerName: string;
  sellerWhatsapp: string;
  sellerEmail?: string;
  buyerId?: string;
  buyerName: string;
  buyerPhone: string;
  buyerWhatsapp: string;
  buyerEmail?: string;
  buyerAddress?: string;
  quantityRequested: number;
  unit: ProduceUnit;
  unitPrice: number;
  totalPrice: number;
  deliveryPreference: string;
  notes?: string;
  status: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceFilter {
  searchQuery?: string;
  category?: string;
  cropType?: string;
  state?: string;
  district?: string;
  grade?: string;
  priceRange?: string;
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  location?: string;
  sortBy?: "latest" | "price_asc" | "price_desc" | "stock_desc" | string;
}

export interface BuyerInquiryItem {
  id: string;
  buyerName: string;
  organization: string;
  quantityKg: number;
  contactNumber?: string;
}

export interface MandiBenchmarkPrice {
  cropName: string;
  mandiName: string;
  district: string;
  state: string;
  modalPriceQuintal: number;
  minPriceQuintal: number;
  maxPriceQuintal: number;
  pricePerKg: number;
  updatedDate: string;
}
