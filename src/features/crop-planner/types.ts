export type SoilType =
  | "alluvial"
  | "black"
  | "red_yellow"
  | "laterite"
  | "sandy_arid"
  | "clay_loam";

export type SoilNutrientLevel = "low" | "medium" | "high";

export type LandAreaUnit = "acre" | "hectare" | "bigha" | "guntha";

export type IrrigationMethod = "drip" | "sprinkler" | "flood_furrow" | "rainfed";

export type WaterAvailability = "abundant" | "moderate" | "scant";

export interface LocationCoordinates {
  name: string;
  state?: string;
  district?: string;
  latitude: number;
  longitude: number;
  elevation?: number;
}

export interface SoilTestInfo {
  ph?: number;
  nitrogen?: SoilNutrientLevel;
  phosphorus?: SoilNutrientLevel;
  potassium?: SoilNutrientLevel;
  organicCarbon?: SoilNutrientLevel;
  hasLabReport: boolean;
}

export interface CropPlanInput {
  location: LocationCoordinates;
  cropId: string;
  sowingDate: string; // ISO date string YYYY-MM-DD
  soilType: SoilType;
  soilTest: SoilTestInfo;
  landArea: number;
  areaUnit: LandAreaUnit;
  irrigationMethod: IrrigationMethod;
  waterAvailability: WaterAvailability;
  variety?: string;
}

export interface SoilCharacteristics {
  id: SoilType;
  name: string;
  description: string;
  awcMmPerMeter: number; // Available Water Capacity in mm per meter depth
  infiltrationRateMmPerHour: number;
  typicalPhMin: number;
  typicalPhMax: number;
  drainageClass: "excessive" | "well" | "moderate" | "poor";
  textureGroup: string;
}

export interface CropGrowthStage {
  id: string;
  nameKey: string;
  defaultName: string;
  durationPercentage: number; // % of total growing cycle
  kc: number; // FAO-56 crop coefficient
  criticalWaterStage: boolean;
  tasks: string[];
  nutrientGuidance?: string;
}

export interface CropAgronomy {
  id: string;
  name: string;
  scientificName: string;
  category: "cereal" | "pulse" | "oilseed" | "vegetable" | "cash_crop";
  season: "kharif" | "rabi" | "zaid" | "all_season";
  totalDurationDays: { min: number; max: number; standard: number };
  suitableSoils: SoilType[];
  optimalPh: { min: number; max: number; tolerableMin: number; tolerableMax: number };
  tempRequirements: {
    germinationMin: number;
    germinationOptimal: number;
    growingOptimalMin: number;
    growingOptimalMax: number;
    maxTolerable: number;
    frostSensitive: boolean;
  };
  totalWaterDemandMm: { min: number; max: number; standard: number };
  standardRootDepthMeters: number;
  stages: CropGrowthStage[];
  recommendedSowingMonths: {
    northIndia: string[];
    centralIndia: string[];
    southIndia: string[];
  };
  standardNpkPerHectare: { n: number; p: number; k: number };
  fymTonnesPerHectare: number;
  citations: string[];
}

export interface SoilSuitabilityAssessment {
  score: number; // 0 - 100
  rating: "ideal" | "suitable" | "marginal" | "poor";
  soilMatch: boolean;
  phStatus: "optimal" | "moderately_acidic" | "strongly_acidic" | "moderately_alkaline" | "strongly_alkaline" | "assumed_neutral";
  phValueUsed: number;
  isPhAssumed: boolean;
  isNutrientsAssumed: boolean;
  assumptions: string[];
  recommendations: string[];
  limitingFactors: string[];
}

export interface WeatherDayForecast {
  date: string; // YYYY-MM-DD
  dayLabel: string; // e.g. "Tomorrow", "Mon, Oct 20"
  tempMax: number;
  tempMin: number;
  precipitationMm: number;
  precipitationProbability: number;
  weatherCode: number;
  condition: string;
  windSpeedKmh: number;
  relativeHumidity: number;
  estimatedEtoMm: number;
}

export interface WeatherRiskAlert {
  type: "frost" | "heatwave" | "heavy_rain" | "waterlogging" | "dry_spell" | "favorable";
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  recommendation: string;
}

export interface WeatherOutlook {
  source: string;
  resolvedLocation: string;
  latitude: number;
  longitude: number;
  currentTemp: number;
  currentHumidity: number;
  currentWindKmh: number;
  currentCondition: string;
  forecast7Day: WeatherDayForecast[];
  averageMaxTempNext7Days: number;
  totalForecastRainMmNext7Days: number;
  risks: WeatherRiskAlert[];
  attribution: string;
}

export interface StageSchedule {
  stageId: string;
  stageName: string;
  stageOrder: number;
  durationDays: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  kc: number;
  waterDemandMm: number;
  waterDemandLiters: number;
  criticalWaterStage: boolean;
  irrigationGuidance: string;
  tasks: string[];
  nutrientGuidance?: string;
  status: "upcoming" | "active" | "completed";
}

export interface WaterBudget {
  totalDemandMm: number;
  totalDemandM3PerHectare: number;
  totalDemandLitersForArea: number;
  forecastRainMmNext7Days: number;
  estimatedEffectiveRainfallMm: number;
  netIrrigationRequirementMm: number;
  netIrrigationRequirementLiters: number;
  irrigationApplicationEfficiency: number; // e.g. 0.90 for drip, 0.50 for flood
  grossIrrigationRequirementMm: number;
  estimatedIrrigationIntervalDays: number;
  irrigationMethodEfficiencyPercent: number;
  soilWaterHoldingCapacityMm: number;
  waterStressRisk: "none" | "low" | "medium" | "high";
  methodGuidance: string;
  calculationMethodology: string;
}

export interface GrowingPlan {
  id: string;
  generatedAt: string;
  input: CropPlanInput;
  crop: CropAgronomy;
  normalizedAreaHectares: number;
  normalizedAreaAcres: number;
  soilAssessment: SoilSuitabilityAssessment;
  weatherOutlook: WeatherOutlook;
  calendar: StageSchedule[];
  waterBudget: WaterBudget;
  nutrientPlan: {
    basalDose: string;
    vegetativeTopDress: string;
    floweringTopDress: string;
    organicManureFym: string;
    generalNote: string;
  };
  fieldReminders: string[];
  scientificSources: string[];
  disclaimer: string;
  aiExplanation?: string;
}

export interface SavedPlanRecord {
  id: string;
  userId?: string;
  farmerName: string;
  cropName: string;
  cropId: string;
  locationName: string;
  sowingDate: string;
  landArea: number;
  areaUnit: LandAreaUnit;
  soilType: SoilType;
  irrigationMethod: IrrigationMethod;
  createdAt: string;
  plan: GrowingPlan;
}
