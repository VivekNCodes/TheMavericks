import type {
  CropSummary,
  FarmerUser,
  ModuleActionCard,
  QuickInsightsData,
} from "@/types/dashboard";
import type {
  DiseaseDetectionResult,
  IrrigationRecommendationResult,
  MandiPriceResult,
  MarketplaceProduceItem,
} from "@/types/api";

export const SAMPLE_FARMER: FarmerUser = {
  id: "farmer-ramesh",
  name: "Ramesh Kumar",
  role: "Farmer",
  location: "Jaipur, Rajasthan",
  avatarUrl: "/images/ramesh-avatar.webp",
};

export const SAMPLE_MODULE_CARDS: ModuleActionCard[] = [
  {
    id: "crop-health",
    title: "Check Crop Health",
    description: "Detect plant diseases using AI",
    href: "/crop-disease",
    buttonText: "Scan Crop",
    iconType: "crop-health",
    liveBadge: true,
  },
  {
    id: "mandi-price",
    title: "Mandi Price Intelligence",
    description: "Compare prices across nearby mandis",
    href: "/mandi-prices",
    buttonText: "View Prices",
    iconType: "mandi-price",
  },
  {
    id: "irrigation-advisor",
    title: "Irrigation Advisor",
    description: "Get crop-specific irrigation guidance",
    href: "/irrigation",
    buttonText: "Get Advice",
    iconType: "irrigation",
  },
  {
    id: "farmer-marketplace",
    title: "Farmer Marketplace",
    description: "Sell your produce directly to buyers",
    href: "/marketplace",
    buttonText: "Browse Market",
    iconType: "marketplace",
  },
];

export const SAMPLE_CROPS: CropSummary[] = [
  {
    id: "crop-tomato",
    name: "Tomato",
    acreage: 1.2,
    stage: "Vegetative Stage",
    imageUrl: "/images/crop-tomato.webp",
  },
  {
    id: "crop-wheat",
    name: "Wheat",
    acreage: 2.0,
    stage: "Grain Filling",
    imageUrl: "/images/crop-wheat.webp",
  },
  {
    id: "crop-chili",
    name: "Chili",
    acreage: 0.5,
    stage: "Flowering",
    imageUrl: "/images/crop-chili.webp",
  },
];

export const SAMPLE_QUICK_INSIGHTS: QuickInsightsData = {
  marketPrice: {
    crop: "Tomato",
    mandi: "Jaipur",
    pricePerQuintal: 1850,
    trendPercent: 12,
    isPositive: true,
    historyPoints: [1500, 1550, 1620, 1680, 1720, 1800, 1850],
  },
  rainfall: {
    amountMm: 5,
    timeline: "Tomorrow",
  },
  irrigation: {
    status: "Check in 2 days",
    targetCrop: "Tomato (Your Field)",
  },
};

export const SAMPLE_DISEASE_RESULT: DiseaseDetectionResult = {
  diagnosis: "Tomato - Early Blight",
  scientificName: "Alternaria solani",
  confidence: 0.92,
  severity: "moderate",
  summary:
    "Early blight is a common fungal disease that affects tomato leaves, stems and sometimes fruits. It usually appears as dark brown spots with concentric rings.",
  recommendedActions: [
    "Remove and destroy infected leaves promptly to prevent spore spread",
    "Use recommended fungicides (e.g., Mancozeb 75 WP or Chlorothalonil)",
    "Avoid overhead irrigation; switch to drip irrigation to keep foliage dry",
    "Maintain proper plant spacing (60 cm) for adequate air circulation",
  ],
  disclaimer:
    "Disclaimer: This is an AI-assisted prediction. For critical decisions, consult a local agricultural expert.",
};

export const SAMPLE_MANDI_RESULT: MandiPriceResult = {
  crop: "Tomato",
  state: "Rajasthan",
  district: "Jaipur",
  selectedMarket: "Jaipur Mandi",
  statistics: {
    minPrice: 1200,
    modalPrice: 1850,
    maxPrice: 2300,
    unit: "₹/Quintal",
    totalArrival: "1,250 Tonnes",
  },
  nearbyMarkets: [
    { name: "Jaipur Mandi", distanceKm: 25, price: 1850, trendPercent: 12 },
    { name: "Sanganer Mandi", distanceKm: 32, price: 1720, trendPercent: 8 },
    { name: "Phagi Mandi", distanceKm: 45, price: 1650, trendPercent: 3 },
    { name: "Chomu Mandi", distanceKm: 48, price: 1580, trendPercent: -5 },
  ],
  trends: [
    { date: "Oct 10", price: 1450 },
    { date: "Oct 11", price: 1580 },
    { date: "Oct 12", price: 1600 },
    { date: "Oct 13", price: 1720 },
    { date: "Oct 14", price: 1700 },
    { date: "Oct 15", price: 1810 },
    { date: "Oct 16", price: 1850 },
  ],
};

export const SAMPLE_IRRIGATION_RESULT: IrrigationRecommendationResult = {
  needLevel: "moderate",
  headline: "Consider irrigation in the next 2-3 days",
  rationale:
    "No significant rainfall is expected in the next 5 days. Soil moisture is likely to decrease due to rising temperatures. Your tomato crop at flowering stage typically needs regular moisture.",
  forecast: [
    { day: "Today", tempMax: 28, rainMm: 0, condition: "Sunny" },
    { day: "Tomorrow", tempMax: 30, rainMm: 0, condition: "Sunny" },
    { day: "Oct 19", tempMax: 31, rainMm: 0, condition: "Clear" },
    { day: "Oct 20", tempMax: 32, rainMm: 2, condition: "Light Rain" },
    { day: "Oct 21", tempMax: 30, rainMm: 0, condition: "Clear" },
  ],
  tip: "Tip: Check soil moisture before irrigating. Adjust based on actual field conditions.",
};

export const SAMPLE_MARKETPLACE_LISTINGS: MarketplaceProduceItem[] = [
  {
    id: "list-tomato",
    title: "Fresh Tomatoes - High Quality",
    crop: "Tomato",
    variety: "Abhinav F1",
    quantityKg: 580,
    pricePerQuintal: 1800,
    grade: "A Grade",
    location: "Jaipur, Rajasthan",
    harvestDate: "15 Oct 2026",
    imageUrl: "/images/crop-tomato.webp",
    farmer: {
      name: "Ramesh Kumar",
      verified: true,
      memberSince: "Oct 2024",
    },
  },
  {
    id: "list-potato",
    title: "Fresh Harvest Potatoes",
    crop: "Potato",
    variety: "Kufri Pukhraj",
    quantityKg: 1000,
    pricePerQuintal: 1200,
    grade: "A Grade",
    location: "Sanganer, Rajasthan",
    harvestDate: "14 Oct 2026",
    imageUrl: "/images/crop-potato.webp",
    farmer: {
      name: "Mohan Singh",
      verified: true,
      memberSince: "Aug 2024",
    },
  },
  {
    id: "list-onion",
    title: "Red Nasik Onions",
    crop: "Onion",
    variety: "Nashik Red",
    quantityKg: 750,
    pricePerQuintal: 1600,
    grade: "FAQ Grade",
    location: "Chomu, Rajasthan",
    harvestDate: "16 Oct 2026",
    imageUrl: "/images/crop-onion.webp",
    farmer: {
      name: "Sita Devi",
      verified: true,
      memberSince: "Sep 2024",
    },
  },
  {
    id: "list-wheat",
    title: "Premium Sharbati Wheat",
    crop: "Wheat",
    variety: "Sharbati",
    quantityKg: 2000,
    pricePerQuintal: 2100,
    grade: "Premium",
    location: "Jaipur, Rajasthan",
    harvestDate: "12 Oct 2026",
    imageUrl: "/images/crop-wheat.webp",
    farmer: {
      name: "Arjan Mehta",
      verified: true,
      memberSince: "Nov 2024",
    },
  },
];
