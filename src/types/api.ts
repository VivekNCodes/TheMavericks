export interface HealthCheckData {
  status: "healthy" | "degraded";
  timestamp: string;
  version: string;
  database: "connected" | "offline_mock";
  environment: string;
}

export interface DiseaseDetectionResult {
  diagnosis: string;
  scientificName: string;
  confidence: number; // e.g. 0.92
  severity: "low" | "moderate" | "high" | "critical";
  summary: string;
  recommendedActions: string[];
  disclaimer: string;
}

export interface MandiMarketQuote {
  name: string;
  distanceKm: number;
  price: number;
  trendPercent: number;
}

export interface MandiPriceResult {
  crop: string;
  state: string;
  district: string;
  selectedMarket: string;
  statistics: {
    minPrice: number;
    modalPrice: number;
    maxPrice: number;
    unit: string;
    totalArrival: string;
  };
  nearbyMarkets: MandiMarketQuote[];
  trends: Array<{
    date: string;
    price: number;
  }>;
}

export interface IrrigationRecommendationResult {
  needLevel: "none" | "low" | "moderate" | "urgent";
  headline: string;
  rationale: string;
  forecast: Array<{
    day: string;
    tempMax: number;
    rainMm: number;
    condition: string;
  }>;
  tip: string;
}

export interface MarketplaceProduceItem {
  id: string;
  title: string;
  crop: string;
  variety?: string;
  quantityKg: number;
  pricePerQuintal: number;
  grade: string;
  location: string;
  harvestDate: string;
  imageUrl: string;
  farmer: {
    name: string;
    verified: boolean;
    memberSince?: string;
  };
}
