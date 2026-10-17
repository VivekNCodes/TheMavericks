export interface MarketplaceFilter {
  searchQuery: string;
  cropType: string;
  location: string;
  priceRange: string;
  sortBy: string;
}

export interface BuyerInquiryItem {
  id: string;
  buyerName: string;
  organization: string;
  quantityKg: number;
  contactNumber?: string;
}
