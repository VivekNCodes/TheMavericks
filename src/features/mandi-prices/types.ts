export interface MandiMarketItem {
  id: string;
  name: string;
  distanceKm: number;
  district: string;
  pricePerQuintal: number;
  trendPercent: number;
}

export interface MandiPriceStatistics {
  minPrice: number;
  modalPrice: number;
  maxPrice: number;
  totalArrivalTonnes: number;
}
