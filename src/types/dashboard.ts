export interface FarmerUser {
  id: string;
  name: string;
  role: string;
  location: string;
  avatarUrl: string;
}

export interface WeatherPreview {
  temp: number;
  condition: string;
  humidity?: number;
  rainfallExpected?: string;
  location: string;
}

export interface CropSummary {
  id: string;
  name: string;
  acreage: number;
  stage: string;
  imageUrl: string;
}

export interface ModuleActionCard {
  id: string;
  title: string;
  description: string;
  href: string;
  buttonText: string;
  iconType: "crop-health" | "mandi-price" | "irrigation" | "marketplace";
  liveBadge?: boolean;
}

export interface MarketInsight {
  crop: string;
  mandi: string;
  pricePerQuintal: number;
  trendPercent: number;
  isPositive: boolean;
  historyPoints: number[];
}

export interface QuickInsightsData {
  marketPrice: MarketInsight;
  rainfall: {
    amountMm: number;
    timeline: string;
  };
  irrigation: {
    status: string;
    targetCrop: string;
  };
}
