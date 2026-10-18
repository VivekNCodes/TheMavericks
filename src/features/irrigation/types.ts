export type LandAreaUnit = "acre" | "hectare" | "bigha";
export type IrrigationMethodType = "drip" | "sprinkler" | "flood";
export type StressRiskLevel = "low" | "moderate" | "high";
export type IrrigationNeedLevel = "none" | "low" | "moderate" | "urgent";
export type ForecastDataSource = "live_open_meteo" | "climatological_fallback";

export interface IrrigationFieldInput {
  crop: string;
  growthStage: string;
  soilType: string;
  lastIrrigatedDate: string;
  fieldLocation: string;
  // Extended inputs for single-field water-budget scheduling
  fieldArea?: number;
  areaUnit?: LandAreaUnit;
  irrigationMethod?: IrrigationMethodType;
  availableWaterBudgetLiters?: number;
  flowRateLitersPerHour?: number; // Rated pump delivery (e.g. 15,000 L/hr)
}

export interface WeatherDayForecast {
  day: string;
  tempMax: number;
  tempMin?: number;
  rainMm: number;
  condition: string;
  etoMm?: number;
  rainProbability?: number;
  source?: ForecastDataSource;
}

export interface DailyWaterBalance {
  dayIndex: number;
  dayLabel: string;
  tempMax: number;
  tempMin: number;
  referenceEtoMm: number;
  cropKc: number;
  cropEtcMm: number;
  forecastRainMm: number;
  effectiveRainMm: number;
  netDemandMm: number;
  grossDemandLiters: number;
}

export interface WaterBudgetBreakdown {
  fieldAreaHectares: number;
  fieldAreaAcres: number;
  irrigationEfficiency: number; // e.g. 0.90 for drip, 0.60 for flood
  totalCropDemandMm: number;
  totalCropDemandLiters: number;
  totalForecastRainMm: number;
  totalEffectiveRainMm: number;
  totalEffectiveRainLiters: number;
  // Clear distinction between Net (at root zone) and Gross (at pump/source)
  netIrrigationNeedDepthMm: number;
  netIrrigationNeedLiters: number; // Net root-zone requirement (depth * 10,000 * ha)
  grossIrrigationRequirementLiters: number; // Gross pump-head requirement (netNeed / efficiency)
  availableWaterBudgetLiters: number;
  budgetDeficitSurplusLiters: number; // availableWaterBudget - grossIrrigationRequirement
  budgetStatus: "adequate" | "moderate_deficit" | "severe_deficit";
  estimatedRootZoneDepletionMm: number;
  readilyAvailableWaterMm: number;
  totalAvailableWaterMm: number;
  depletionStatus: "within_buffer" | "near_stress" | "moisture_stressed";
  initialSoilMoistureAssumption: string;
  weatherForecastSource: ForecastDataSource;
}

export interface DailyIrrigationEvent {
  dayIndex: number;
  dayLabel: string;
  waterToApplyLiters: number;
  waterDepthMm: number;
  pumpDurationHours: number;
  timingRecommendation: string;
  eventRationale: string;
}

export interface ScheduleScoreBreakdown {
  budgetCompliance: number; // 0 - 30 points
  stressProtection: number; // 0 - 35 points
  weatherAlignment: number; // 0 - 20 points
  efficiency: number; // 0 - 15 points
}

export interface FeasibleSchedule {
  id: "full_demand" | "critical_stage_deficit" | "split_pulse" | "rain_delayed";
  name: string;
  badge: string;
  description: string;
  totalWaterUsedLiters: number;
  budgetUtilizationPercent: number;
  isFeasibleWithinBudget: boolean;
  projectedStressRisk: StressRiskLevel;
  totalPumpHours: number;
  dailyEvents: DailyIrrigationEvent[];
  pros: string[];
  cons: string[];
  isRecommended: boolean;
  suitabilityScore: number;
  scoreBreakdown: ScheduleScoreBreakdown;
}

export interface ScheduleScoreAudit {
  scheduleId: FeasibleSchedule["id"];
  scheduleName: string;
  totalScore: number;
  isFeasible: boolean;
  justification: string;
}

export interface ExplainableDecision {
  recommendedScheduleId: FeasibleSchedule["id"];
  recommendedScheduleName: string;
  urgency: IrrigationNeedLevel;
  headline: string;
  summaryRationale: string;
  scientificExplanation: {
    phenologicalSensitivity: string;
    waterBalanceSummary: string;
    tradeOffJustification: string;
    meteorologicalAlignment: string;
  };
  operationalActionPlan: string[];
  fieldValidationTip: string;
  scoringAudit: ScheduleScoreAudit[];
  transparencyNotes: {
    measuredOrLiveInputs: string[];
    userSpecifiedInputs: string[];
    modeledAssumptions: string[];
    forecastLimitations: string[];
  };
}

export interface IrrigationSchedulePlan {
  input: Required<IrrigationFieldInput>;
  dailyBalances: DailyWaterBalance[];
  budget: WaterBudgetBreakdown;
  schedules: FeasibleSchedule[];
  recommendation: ExplainableDecision;
  generatedAt: string;
}

export interface DemonstrationPreset {
  id: string;
  label: string;
  description: string;
  isUserSpecifiedScenario?: boolean;
  input: Required<IrrigationFieldInput>;
}
