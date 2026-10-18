import {
  CROP_AGRONOMIC_PROFILES,
  CropStageDetail,
  IRRIGATION_METHOD_EFFICIENCIES,
  SOIL_HYDROLOGY_PROFILES,
} from "./agronomic-data";
import {
  DailyIrrigationEvent,
  DailyWaterBalance,
  ExplainableDecision,
  FeasibleSchedule,
  ForecastDataSource,
  IrrigationFieldInput,
  IrrigationSchedulePlan,
  LandAreaUnit,
  ScheduleScoreAudit,
  ScheduleScoreBreakdown,
  StressRiskLevel,
  WaterBudgetBreakdown,
  WeatherDayForecast,
} from "../types";

/**
 * Standardize land area to Hectares and Acres.
 */
export function normalizeFieldArea(
  area: number | undefined,
  unit: LandAreaUnit | undefined
): { hectares: number; acres: number } {
  const safeArea = Math.max(0.01, area && !isNaN(area) ? area : 1.0);
  const safeUnit: LandAreaUnit = unit || "acre";

  let hectares = 0;
  switch (safeUnit) {
    case "hectare":
      hectares = safeArea;
      break;
    case "bigha":
      // Standard pucca bigha ~ 0.2529 hectare (~0.625 acre)
      hectares = safeArea * 0.2529;
      break;
    case "acre":
    default:
      hectares = safeArea * 0.404686;
      break;
  }

  const acres = hectares * 2.47105;
  return {
    hectares: Number(hectares.toFixed(4)),
    acres: Number(acres.toFixed(2)),
  };
}

/**
 * USDA Soil Conservation Service (SCS) formula for Effective Rainfall (Peff).
 * For P < 2 mm, canopy interception and surface evaporation consume 100%, so Peff = 0.
 */
export function calculateEffectiveRainfallMm(forecastRainMm: number): number {
  if (forecastRainMm < 2.0) return 0;

  if (forecastRainMm <= 250) {
    const peff = forecastRainMm * ((125 - 0.2 * forecastRainMm) / 125);
    return Number(Math.max(0, Math.min(forecastRainMm, peff)).toFixed(1));
  } else {
    const peff = 125 + 0.1 * forecastRainMm;
    return Number(Math.max(0, Math.min(forecastRainMm, peff)).toFixed(1));
  }
}

/**
 * Reference Crop Evapotranspiration (ETo) via Hargreaves-Samani method (FAO-56).
 * Ra equivalent for Indian latitudes ~ 13.5 - 16.0 mm/day equivalent.
 */
export function calculateHargreavesEtoMm(
  tMax: number,
  tMin: number,
  latitude = 26.9124
): number {
  const safeMax = Math.max(tMax, tMin + 1.0);
  const safeMin = Math.min(tMin, safeMax - 1.0);
  const tMean = (safeMax + safeMin) / 2;
  const tempDiff = Math.max(1.0, safeMax - safeMin);

  // Extraterrestrial radiation Ra equivalent in mm/day for Indian latitudes
  const raEquivMm = Math.max(12.0, 15.2 - Math.abs(latitude - 20) * 0.1);
  const eto = 0.0023 * (tMean + 17.8) * Math.sqrt(tempDiff) * raEquivMm;
  return Number(Math.min(8.5, Math.max(2.0, eto)).toFixed(2));
}

/**
 * Validates and sanitizes user field inputs, applying sensible fallback defaults.
 */
export function sanitizeIrrigationInput(
  rawInput: Partial<IrrigationFieldInput>
): Required<IrrigationFieldInput> {
  const crop =
    rawInput.crop && CROP_AGRONOMIC_PROFILES[rawInput.crop]
      ? rawInput.crop
      : "Tomato";

  const cropProfile = CROP_AGRONOMIC_PROFILES[crop];
  const growthStage =
    rawInput.growthStage && cropProfile.stages[rawInput.growthStage]
      ? rawInput.growthStage
      : cropProfile.defaultStage;

  const soilType =
    rawInput.soilType && SOIL_HYDROLOGY_PROFILES[rawInput.soilType]
      ? rawInput.soilType
      : "Loamy";

  const fieldLocation =
    rawInput.fieldLocation?.trim() || "Jaipur, Rajasthan";

  // Validate lastIrrigatedDate (default to 4 days ago if invalid or in future)
  let lastIrrigatedDate = rawInput.lastIrrigatedDate || "";
  const now = new Date();
  if (
    !lastIrrigatedDate ||
    isNaN(Date.parse(lastIrrigatedDate)) ||
    new Date(lastIrrigatedDate) > now
  ) {
    const d = new Date();
    d.setDate(d.getDate() - 4);
    lastIrrigatedDate = d.toISOString().split("T")[0];
  }

  const fieldArea =
    rawInput.fieldArea && !isNaN(rawInput.fieldArea) && rawInput.fieldArea > 0
      ? rawInput.fieldArea
      : 1.0;
  const areaUnit = rawInput.areaUnit || "acre";
  const irrigationMethod = rawInput.irrigationMethod || "drip";
  const availableWaterBudgetLiters = Math.max(
    1000,
    rawInput.availableWaterBudgetLiters &&
      !isNaN(rawInput.availableWaterBudgetLiters)
      ? rawInput.availableWaterBudgetLiters
      : 40000
  );
  const flowRateLitersPerHour = Math.max(
    1000,
    rawInput.flowRateLitersPerHour && !isNaN(rawInput.flowRateLitersPerHour)
      ? rawInput.flowRateLitersPerHour
      : 15000
  );

  return {
    crop,
    growthStage,
    soilType,
    lastIrrigatedDate,
    fieldLocation,
    fieldArea,
    areaUnit,
    irrigationMethod,
    availableWaterBudgetLiters,
    flowRateLitersPerHour,
  };
}

/**
 * Complete, deterministic water balance calculation & schedule optimizer.
 */
export function generateIrrigationSchedulePlan(
  rawInput: Partial<IrrigationFieldInput>,
  forecastDays: WeatherDayForecast[],
  forecastSourceOverride?: ForecastDataSource
): IrrigationSchedulePlan {
  const input = sanitizeIrrigationInput(rawInput);
  const { hectares, acres } = normalizeFieldArea(input.fieldArea, input.areaUnit);

  const cropProfile = CROP_AGRONOMIC_PROFILES[input.crop];
  const stageInfo = cropProfile.stages[input.growthStage];
  const soilProfile = SOIL_HYDROLOGY_PROFILES[input.soilType];
  const methodEfficiency =
    IRRIGATION_METHOD_EFFICIENCIES[input.irrigationMethod]?.efficiency || 0.75;

  // 1. Root Zone Hydrology
  // TAW = AWC (mm/m) * Root Depth (m)
  const rootDepthMeters = stageInfo.rootDepthMeters;
  const totalAvailableWaterMm = Number(
    (soilProfile.awcMmPerMeter * rootDepthMeters).toFixed(1)
  );
  // RAW = TAW * MAD fraction
  const readilyAvailableWaterMm = Number(
    (totalAvailableWaterMm * soilProfile.typicalMadFraction).toFixed(1)
  );

  // 2. Weather Forecast & Source Tracking
  // Fallback climatological forecast used when external meteorology API is offline or empty
  const defaultClimatologicalForecast: WeatherDayForecast[] = [
    { day: "Today", tempMax: 29, tempMin: 18, rainMm: 0, condition: "Sunny", source: "climatological_fallback" },
    { day: "Tomorrow", tempMax: 30, tempMin: 19, rainMm: 0, condition: "Sunny", source: "climatological_fallback" },
    { day: "Day 3", tempMax: 31, tempMin: 20, rainMm: 0, condition: "Clear", source: "climatological_fallback" },
    { day: "Day 4", tempMax: 32, tempMin: 21, rainMm: 3, condition: "Partly Cloudy", source: "climatological_fallback" },
    { day: "Day 5", tempMax: 30, tempMin: 19, rainMm: 0, condition: "Clear", source: "climatological_fallback" },
  ];

  let weatherForecastSource: ForecastDataSource = "climatological_fallback";
  let activeForecast: WeatherDayForecast[] = [];

  if (forecastDays && forecastDays.length >= 3) {
    activeForecast = forecastDays.slice(0, 5);
    // If caller provided live source tag or override
    weatherForecastSource =
      forecastSourceOverride ||
      (forecastDays[0]?.source as ForecastDataSource) ||
      "live_open_meteo";
  } else {
    activeForecast = defaultClimatologicalForecast;
    weatherForecastSource = "climatological_fallback";
  }

  // 3. Daily Water Balance (Day 1 to 5)
  const dailyBalances: DailyWaterBalance[] = activeForecast.map((day, idx) => {
    const tMax = day.tempMax || 30;
    const tMin = day.tempMin || Math.max(12, tMax - 11);
    const eto =
      day.etoMm && day.etoMm > 0 ? day.etoMm : calculateHargreavesEtoMm(tMax, tMin);
    const cropKc = stageInfo.kc;
    const cropEtc = Number((eto * cropKc).toFixed(2));
    const effectiveRain = calculateEffectiveRainfallMm(day.rainMm || 0);
    // Net daily deficit depth (mm) after subtracting effective rainfall:
    const netDemandMm = Number(Math.max(0, cropEtc - effectiveRain).toFixed(2));
    // Gross demand (Liters) needed at pump head:
    const grossDemandLiters = Math.round(
      (netDemandMm * 10000 * hectares) / methodEfficiency
    );

    return {
      dayIndex: idx + 1,
      dayLabel: day.day,
      tempMax: tMax,
      tempMin: tMin,
      referenceEtoMm: eto,
      cropKc,
      cropEtcMm: cropEtc,
      forecastRainMm: day.rainMm || 0,
      effectiveRainMm: effectiveRain,
      netDemandMm,
      grossDemandLiters,
    };
  });

  // 4. Initial Root-Zone Depletion (Dr) Estimation
  // Audit requirement: Clearly document formula, units, and assumptions.
  // Formula: Dr = min(TAW, max(2.0, daysElapsed * avgDailyEtc))
  // Assumption: Field was refilled to field capacity at lastIrrigatedDate; subsequent depletion equals cumulative ETc.
  const lastIrrDateObj = new Date(input.lastIrrigatedDate);
  const todayObj = new Date();
  todayObj.setHours(0, 0, 0, 0);
  lastIrrDateObj.setHours(0, 0, 0, 0);

  const diffMs = Math.max(0, todayObj.getTime() - lastIrrDateObj.getTime());
  const daysSinceIrrigation = Math.min(14, Math.floor(diffMs / 86400000));

  const avgDailyEtc =
    dailyBalances.reduce((sum, d) => sum + d.cropEtcMm, 0) / dailyBalances.length;

  const estimatedRootZoneDepletionMm = Number(
    Math.min(
      totalAvailableWaterMm,
      Math.max(2.0, daysSinceIrrigation * avgDailyEtc)
    ).toFixed(1)
  );

  let depletionStatus: WaterBudgetBreakdown["depletionStatus"] = "within_buffer";
  if (estimatedRootZoneDepletionMm >= totalAvailableWaterMm * 0.85) {
    depletionStatus = "moisture_stressed";
  } else if (estimatedRootZoneDepletionMm >= readilyAvailableWaterMm) {
    depletionStatus = "near_stress";
  }

  const initialSoilMoistureAssumption =
    `Estimated initial depletion of ${estimatedRootZoneDepletionMm} mm assumes the field was refilled to field capacity on ${input.lastIrrigatedDate} (${daysSinceIrrigation} days ago), with root-zone water lost at ~${avgDailyEtc.toFixed(1)} mm/day ETc without measured rainfall. Physical in-situ sensor telemetry is not available.`;

  // 5. Total Net & Gross Water Balance Requirements
  // 5-Day Cumulative Net Crop Demand Depth (mm):
  const fiveDayNetDemandMm = dailyBalances.reduce((sum, d) => sum + d.netDemandMm, 0);

  // Total Net Irrigation Depth needed at root zone (mm) = Initial Depletion + 5-day net demand:
  const netIrrigationNeedDepthMm = Number(
    (estimatedRootZoneDepletionMm + fiveDayNetDemandMm).toFixed(1)
  );

  // Pure Net Root-Zone Requirement in Liters (1 mm over 1 ha = 10,000 Liters):
  const netIrrigationNeedLiters = Math.round(
    netIrrigationNeedDepthMm * 10000 * hectares
  );

  // Gross Pump Delivery Requirement in Liters (accounts for conveyance and application efficiency Ea):
  const grossIrrigationRequirementLiters = Math.round(
    netIrrigationNeedLiters / methodEfficiency
  );

  // Crop Demand Metrics (Theoretical reference without initial depletion):
  const totalCropDemandMm = Number(
    dailyBalances.reduce((sum, d) => sum + d.cropEtcMm, 0).toFixed(1)
  );
  const totalForecastRainMm = Number(
    dailyBalances.reduce((sum, d) => sum + d.forecastRainMm, 0).toFixed(1)
  );
  const totalEffectiveRainMm = Number(
    dailyBalances.reduce((sum, d) => sum + d.effectiveRainMm, 0).toFixed(1)
  );
  const totalEffectiveRainLiters = Math.round(
    totalEffectiveRainMm * 10000 * hectares
  );
  const totalCropDemandLiters = Math.round(
    (totalCropDemandMm * 10000 * hectares) / methodEfficiency
  );

  // Water Budget Balance:
  const availableWaterBudgetLiters = input.availableWaterBudgetLiters;
  const budgetDeficitSurplusLiters =
    availableWaterBudgetLiters - grossIrrigationRequirementLiters;

  let budgetStatus: WaterBudgetBreakdown["budgetStatus"] = "adequate";
  if (budgetDeficitSurplusLiters < -0.35 * grossIrrigationRequirementLiters) {
    budgetStatus = "severe_deficit";
  } else if (budgetDeficitSurplusLiters < 0) {
    budgetStatus = "moderate_deficit";
  }

  const budget: WaterBudgetBreakdown = {
    fieldAreaHectares: hectares,
    fieldAreaAcres: acres,
    irrigationEfficiency: methodEfficiency,
    totalCropDemandMm,
    totalCropDemandLiters,
    totalForecastRainMm,
    totalEffectiveRainMm,
    totalEffectiveRainLiters,
    netIrrigationNeedDepthMm,
    netIrrigationNeedLiters,
    grossIrrigationRequirementLiters,
    availableWaterBudgetLiters,
    budgetDeficitSurplusLiters,
    budgetStatus,
    estimatedRootZoneDepletionMm,
    readilyAvailableWaterMm,
    totalAvailableWaterMm,
    depletionStatus,
    initialSoilMoistureAssumption,
    weatherForecastSource,
  };

  // 6. Generate Feasible Schedules & Multi-Criteria Scoring
  const schedules = generateAndScoreSchedules(
    input,
    budget,
    dailyBalances,
    stageInfo,
    weatherForecastSource
  );

  // 7. Generate Explainable Decision
  const recommendation = generateExplainableDecision(
    input,
    budget,
    dailyBalances,
    schedules,
    stageInfo,
    weatherForecastSource
  );

  return {
    input,
    dailyBalances,
    budget,
    schedules,
    recommendation,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate and score 4 feasible schedules enforcing strict budget constraints and multi-criteria trade-offs.
 */
function generateAndScoreSchedules(
  input: Required<IrrigationFieldInput>,
  budget: WaterBudgetBreakdown,
  daily: DailyWaterBalance[],
  stageInfo: CropStageDetail,
  weatherSource: ForecastDataSource
): FeasibleSchedule[] {
  const flowRate = input.flowRateLitersPerHour;
  const budgetCap = budget.availableWaterBudgetLiters;
  const grossNeed = budget.grossIrrigationRequirementLiters;
  const hectares = budget.fieldAreaHectares;
  const efficiency = budget.irrigationEfficiency;
  const isCriticalStage = stageInfo.isCriticalStage;
  const ky = stageInfo.yieldSensitivityKy;

  const litersToMm = (l: number) =>
    Number(((l * efficiency) / (10000 * hectares)).toFixed(1));
  const litersToHours = (l: number) => Number((l / flowRate).toFixed(1));

  // Determine upcoming rain events (Days 2 to 5)
  const rainEvent = daily.find((d, idx) => idx >= 1 && d.forecastRainMm >= 3.0);
  const hasSubstantialRain = Boolean(rainEvent && rainEvent.forecastRainMm >= 5.0);
  const isRainFromLiveSource = weatherSource === "live_open_meteo";

  // -------------------------------------------------------------
  // Schedule 1: Full Demand Replacement (Unconstrained Benchmark)
  // -------------------------------------------------------------
  const fullWaterLiters = grossNeed;
  const fullEvents: DailyIrrigationEvent[] = [
    {
      dayIndex: 1,
      dayLabel: daily[0].dayLabel,
      waterToApplyLiters: Math.round(fullWaterLiters * 0.6),
      waterDepthMm: litersToMm(Math.round(fullWaterLiters * 0.6)),
      pumpDurationHours: litersToHours(Math.round(fullWaterLiters * 0.6)),
      timingRecommendation: "Early morning (06:00 - 09:00 AM)",
      eventRationale: "Full profile recharge: clears initial depletion and refuels root zone.",
    },
    {
      dayIndex: 3,
      dayLabel: daily[2]?.dayLabel || "Day 3",
      waterToApplyLiters: Math.round(fullWaterLiters * 0.4),
      waterDepthMm: litersToMm(Math.round(fullWaterLiters * 0.4)),
      pumpDurationHours: litersToHours(Math.round(fullWaterLiters * 0.4)),
      timingRecommendation: "Late afternoon (04:30 - 06:30 PM)",
      eventRationale: "Top-up evapotranspiration losses during peak daytime temperatures.",
    },
  ];

  const isFullFeasible = fullWaterLiters <= budgetCap;
  const schedFull: FeasibleSchedule = {
    id: "full_demand",
    name: "Full Demand Replacement",
    badge: "100% ETc Coverage",
    description:
      "Satisfies 100% of theoretical crop evapotranspiration and initial root depletion regardless of budget limits.",
    totalWaterUsedLiters: fullWaterLiters,
    budgetUtilizationPercent: Math.round((fullWaterLiters / budgetCap) * 100),
    isFeasibleWithinBudget: isFullFeasible,
    projectedStressRisk: "low",
    totalPumpHours: litersToHours(fullWaterLiters),
    dailyEvents: fullEvents,
    pros: [
      "Zero plant moisture stress; preserves 100% of theoretical yield potential",
      "Completely satisfies soil moisture deficit across the full root profile",
    ],
    cons: [
      isFullFeasible
        ? "Exhausts almost the entire available water budget, leaving minimal reserves"
        : `Exceeds available water budget by ${(fullWaterLiters - budgetCap).toLocaleString("en-IN")} Liters (Infeasible)`,
      "Higher risk of percolation and fertilizer leaching if unpredicted rain occurs",
    ],
    isRecommended: false,
    suitabilityScore: 0,
    scoreBreakdown: { budgetCompliance: 0, stressProtection: 0, weatherAlignment: 0, efficiency: 0 },
  };

  // -------------------------------------------------------------
  // Schedule 2: Rain-Delayed & Weather-Adaptive Schedule
  // -------------------------------------------------------------
  let rainDelayedWaterLiters = 0;
  const rainDelayedEvents: DailyIrrigationEvent[] = [];

  if (rainEvent) {
    // Provide a light protective buffer dose on Day 1 (capped at 25% of budget), deferring heavy pumping
    const lightBuffer = Math.min(Math.round(budgetCap * 0.25), 10000);
    rainDelayedWaterLiters = lightBuffer;
    rainDelayedEvents.push({
      dayIndex: 1,
      dayLabel: daily[0].dayLabel,
      waterToApplyLiters: lightBuffer,
      waterDepthMm: litersToMm(lightBuffer),
      pumpDurationHours: litersToHours(lightBuffer),
      timingRecommendation: "Early morning (06:00 - 08:00 AM)",
      eventRationale: `Light protective wetting. Defers heavy irrigation to capture predicted ${rainEvent.forecastRainMm} mm rain on ${rainEvent.dayLabel}.`,
    });
  } else {
    // No significant rain forecasted; postpones pumping by 48 hours to preserve budget
    const deferredDose = Math.min(budgetCap, Math.round(grossNeed * 0.7));
    rainDelayedWaterLiters = deferredDose;
    rainDelayedEvents.push({
      dayIndex: 3,
      dayLabel: daily[2]?.dayLabel || "Day 3",
      waterToApplyLiters: deferredDose,
      waterDepthMm: litersToMm(deferredDose),
      pumpDurationHours: litersToHours(deferredDose),
      timingRecommendation: "Early morning (06:00 - 09:30 AM)",
      eventRationale: "Delayed application: monitors soil tension before releasing water reserves.",
    });
  }

  const isRainDelayedFeasible = rainDelayedWaterLiters <= budgetCap;
  const schedRainDelayed: FeasibleSchedule = {
    id: "rain_delayed",
    name: "Rain-Delayed / Weather-Adaptive",
    badge: rainEvent ? "Rain Credit Active" : "Observation Delay",
    description: rainEvent
      ? `Defers heavy pumping to leverage forecasted ${rainEvent.forecastRainMm} mm rain on ${rainEvent.dayLabel}.`
      : "Delays irrigation by 48 hours to conserve water budget while monitoring field soil tension.",
    totalWaterUsedLiters: rainDelayedWaterLiters,
    budgetUtilizationPercent: Math.round((rainDelayedWaterLiters / budgetCap) * 100),
    isFeasibleWithinBudget: isRainDelayedFeasible,
    projectedStressRisk: rainEvent ? (hasSubstantialRain ? "low" : "moderate") : isCriticalStage ? "high" : "moderate",
    totalPumpHours: litersToHours(rainDelayedWaterLiters),
    dailyEvents: rainDelayedEvents,
    pros: [
      `Conserves ${(budgetCap - rainDelayedWaterLiters).toLocaleString("en-IN")} Liters of water budget`,
      rainEvent
        ? "Minimizes groundwater/fuel extraction by allowing natural precipitation to recharge the root zone"
        : "Preserves water for subsequent growth stages",
    ],
    cons: [
      rainEvent
        ? isRainFromLiveSource
          ? "Carries forecast uncertainty: if rain falls below expected volume, crop may experience mild stress"
          : "Based on climatological fallback estimates, not live radar. Risk of rain non-realization is elevated."
        : "Crop undergoes 48 hours of elevated soil water tension before receiving water",
    ],
    isRecommended: false,
    suitabilityScore: 0,
    scoreBreakdown: { budgetCompliance: 0, stressProtection: 0, weatherAlignment: 0, efficiency: 0 },
  };

  // -------------------------------------------------------------
  // Schedule 3: Budget-Optimized Deficit Irrigation
  // -------------------------------------------------------------
  // Invariant: Strictly capped at min(budgetCap, grossNeed)
  const cappedBudgetWaterLiters = Math.min(budgetCap, grossNeed);
  const dose1 = Math.round(cappedBudgetWaterLiters * 0.62);
  const dose2 = cappedBudgetWaterLiters - dose1;

  const deficitEvents: DailyIrrigationEvent[] = [
    {
      dayIndex: 1,
      dayLabel: daily[0].dayLabel,
      waterToApplyLiters: dose1,
      waterDepthMm: litersToMm(dose1),
      pumpDurationHours: litersToHours(dose1),
      timingRecommendation: "Early morning (06:00 - 08:30 AM)",
      eventRationale:
        isCriticalStage
          ? "Targeted root-zone recharge to protect flowering/fruit set from blossom abortion."
          : "Primary deficit wetting to relieve vegetative soil water tension.",
    },
    {
      dayIndex: 3,
      dayLabel: daily[2]?.dayLabel || "Day 3",
      waterToApplyLiters: dose2,
      waterDepthMm: litersToMm(dose2),
      pumpDurationHours: litersToHours(dose2),
      timingRecommendation: "Late afternoon (04:30 - 06:30 PM)",
      eventRationale: "Secondary booster application to keep depletion strictly within the allowable RAW buffer.",
    },
  ];

  let deficitStress: StressRiskLevel = "low";
  if (budget.budgetStatus === "severe_deficit") deficitStress = "moderate";

  const schedDeficit: FeasibleSchedule = {
    id: "critical_stage_deficit",
    name: "Budget-Optimized Deficit Irrigation",
    badge: "Strictly Capped to Budget",
    description:
      "Rations water precisely within the available budget, directing moisture to shield the critical growth stage.",
    totalWaterUsedLiters: cappedBudgetWaterLiters,
    budgetUtilizationPercent: Math.min(100, Math.round((cappedBudgetWaterLiters / budgetCap) * 100)),
    isFeasibleWithinBudget: true, // Always guaranteed <= budgetCap
    projectedStressRisk: deficitStress,
    totalPumpHours: litersToHours(cappedBudgetWaterLiters),
    dailyEvents: deficitEvents,
    pros: [
      `100% compliant with available water budget (${cappedBudgetWaterLiters.toLocaleString("en-IN")} L allocated)`,
      isCriticalStage
        ? "Concentrates scarce water during flowering/fruit set to prevent blossom drop"
        : "Maintains optimal soil moisture without overdrawing available water",
      "Leaves zero water budget shortfall",
    ],
    cons: [
      budget.budgetStatus !== "adequate"
        ? "Controlled deficit: soil profile will not reach full field capacity; mulching recommended"
        : "Requires punctual split pump operations to maximize absorption",
    ],
    isRecommended: false,
    suitabilityScore: 0,
    scoreBreakdown: { budgetCompliance: 0, stressProtection: 0, weatherAlignment: 0, efficiency: 0 },
  };

  // -------------------------------------------------------------
  // Schedule 4: Split-Cycle / Light-Pulse Rationing
  // -------------------------------------------------------------
  // Invariant: Strictly capped at min(budgetCap, grossNeed)
  const pulseTotalLiters = Math.min(budgetCap, Math.round(grossNeed * 0.9));
  const p1 = Math.round(pulseTotalLiters * 0.38);
  const p2 = Math.round(pulseTotalLiters * 0.34);
  const p3 = pulseTotalLiters - p1 - p2;

  const pulseEvents: DailyIrrigationEvent[] = [
    {
      dayIndex: 1,
      dayLabel: daily[0].dayLabel,
      waterToApplyLiters: p1,
      waterDepthMm: litersToMm(p1),
      pumpDurationHours: litersToHours(p1),
      timingRecommendation: "Early morning (06:00 - 07:30 AM)",
      eventRationale: "Pulse 1: Topsoil root-zone wetting to moderate daytime soil temperature.",
    },
    {
      dayIndex: 3,
      dayLabel: daily[2]?.dayLabel || "Day 3",
      waterToApplyLiters: p2,
      waterDepthMm: litersToMm(p2),
      pumpDurationHours: litersToHours(p2),
      timingRecommendation: "Early morning (06:00 - 07:30 AM)",
      eventRationale: "Pulse 2: Mid-interval maintenance dose to sustain leaf turgor pressure.",
    },
    {
      dayIndex: 5,
      dayLabel: daily[4]?.dayLabel || "Day 5",
      waterToApplyLiters: p3,
      waterDepthMm: litersToMm(p3),
      pumpDurationHours: litersToHours(p3),
      timingRecommendation: "Early morning (06:00 - 07:30 AM)",
      eventRationale: "Pulse 3: Final light ration to maintain root activity through the weekend.",
    },
  ];

  const schedPulse: FeasibleSchedule = {
    id: "split_pulse",
    name: "Split-Cycle / Light-Pulse Rationing",
    badge: "Micro-Dose Distribution",
    description:
      "Divides water into 3 lighter, frequent irrigations to minimize deep percolation losses on light/sandy soils.",
    totalWaterUsedLiters: pulseTotalLiters,
    budgetUtilizationPercent: Math.round((pulseTotalLiters / budgetCap) * 100),
    isFeasibleWithinBudget: pulseTotalLiters <= budgetCap,
    projectedStressRisk: "low",
    totalPumpHours: litersToHours(pulseTotalLiters),
    dailyEvents: pulseEvents,
    pros: [
      "Minimizes deep drainage and nutrient leaching below the root zone",
      "Maintains active topsoil moisture during midday heat",
      "Fits strictly within the water budget constraint",
    ],
    cons: [
      "Requires turning on pumps/valves across 3 separate days (higher labor involvement)",
      "Slightly higher total surface wetted evaporation loss",
    ],
    isRecommended: false,
    suitabilityScore: 0,
    scoreBreakdown: { budgetCompliance: 0, stressProtection: 0, weatherAlignment: 0, efficiency: 0 },
  };

  const allSchedules = [schedDeficit, schedPulse, schedRainDelayed, schedFull];

  // -------------------------------------------------------------
  // Multi-Criteria Objective Scoring Engine (100-Point Scale)
  // -------------------------------------------------------------
  // Criteria 1: Budget Compliance (0 - 30 pts)
  // Criteria 2: Crop Stage Stress Protection (0 - 35 pts)
  // Criteria 3: Weather Realism & Rain Probability (0 - 20 pts)
  // Criteria 4: Hydrological Efficiency & Texture Fit (0 - 15 pts)

  allSchedules.forEach((sched) => {
    let budgetScore = 0;
    let stressScore = 0;
    let weatherScore = 0;
    let efficiencyScore = 0;

    // 1. Budget Compliance (0 - 30 pts)
    if (!sched.isFeasibleWithinBudget) {
      budgetScore = 0; // Infeasible schedules receive 0 budget points
    } else {
      // Rewards 100% compliance while preserving an emergency buffer
      const utilization = sched.totalWaterUsedLiters / budgetCap;
      if (utilization <= 1.0) {
        budgetScore = Math.round(25 + 5 * (1 - utilization));
      }
    }

    // 2. Crop Stage Stress Protection (0 - 35 pts)
    const depletionRatio = budget.estimatedRootZoneDepletionMm / budget.readilyAvailableWaterMm;
    if (sched.id === "full_demand") {
      stressScore = 35; // Maximum stress relief
    } else if (sched.id === "critical_stage_deficit") {
      // Scores high when crop is in critical stage or already near depletion
      stressScore = isCriticalStage || depletionRatio >= 0.7 ? 33 : 28;
    } else if (sched.id === "split_pulse") {
      stressScore = input.soilType === "Sandy" ? 34 : 30;
    } else if (sched.id === "rain_delayed") {
      // Delaying irrigation carries high risk if crop is in critical stage or soil is already depleted
      if (isCriticalStage && depletionRatio >= 0.75) {
        stressScore = 12; // Heavy penalty: cannot gamble on rain when flowering is endangered
      } else if (!isCriticalStage && depletionRatio < 0.5) {
        stressScore = 32; // Safe to delay
      } else {
        stressScore = 22;
      }
    }

    // 3. Weather Realism & Rain Alignment (0 - 20 pts)
    if (sched.id === "rain_delayed") {
      if (hasSubstantialRain && isRainFromLiveSource) {
        weatherScore = 20; // Full credit for live substantial rain
      } else if (hasSubstantialRain && !isRainFromLiveSource) {
        weatherScore = 12; // Reduced credit for climatological fallback rain
      } else if (rainEvent) {
        weatherScore = 10;
      } else {
        weatherScore = 5; // Low score if delaying with zero rain in forecast
      }
    } else if (sched.id === "critical_stage_deficit") {
      // If severe rain is imminent, deficit schedule receives moderate weather score; else high
      weatherScore = hasSubstantialRain ? 14 : 19;
    } else {
      weatherScore = 15;
    }

    // 4. Hydrological Efficiency & Soil Texture Fit (0 - 15 pts)
    if (input.soilType === "Sandy") {
      efficiencyScore = sched.id === "split_pulse" ? 15 : sched.id === "full_demand" ? 6 : 11;
    } else {
      efficiencyScore = sched.id === "split_pulse" ? 12 : 14;
    }

    sched.scoreBreakdown = {
      budgetCompliance: budgetScore,
      stressProtection: stressScore,
      weatherAlignment: weatherScore,
      efficiency: efficiencyScore,
    };
    sched.suitabilityScore = budgetScore + stressScore + weatherScore + efficiencyScore;
  });

  // HARD INVARIANT: Only feasible schedules can be recommended
  const feasibleCandidates = allSchedules.filter((s) => s.isFeasibleWithinBudget);
  if (feasibleCandidates.length > 0) {
    // Sort descending by suitability score
    feasibleCandidates.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
    feasibleCandidates[0].isRecommended = true;
  } else {
    // Fallback: If no schedule is feasible (extreme low budget), schedule 3 is scaled to budget and marked recommended
    schedDeficit.isRecommended = true;
  }

  return allSchedules;
}

/**
 * Generate transparent, human-readable agronomic justification for the winning schedule.
 */
function generateExplainableDecision(
  input: Required<IrrigationFieldInput>,
  budget: WaterBudgetBreakdown,
  daily: DailyWaterBalance[],
  schedules: FeasibleSchedule[],
  stageInfo: CropStageDetail,
  weatherSource: ForecastDataSource
): ExplainableDecision {
  const winner = schedules.find((s) => s.isRecommended) || schedules[0];
  const isBudgetDeficit = budget.budgetStatus !== "adequate";
  const rainDay = daily.find((d) => d.forecastRainMm >= 3.0);

  let urgency: ExplainableDecision["urgency"] = "moderate";
  if (
    budget.depletionStatus === "moisture_stressed" ||
    (stageInfo.isCriticalStage && budget.depletionStatus === "near_stress")
  ) {
    urgency = "urgent";
  } else if (budget.depletionStatus === "within_buffer" && rainDay) {
    urgency = "low";
  }

  let headline = "";
  if (winner.id === "critical_stage_deficit") {
    headline = isBudgetDeficit
      ? `Apply Budget-Optimized Irrigation: ${winner.totalWaterUsedLiters.toLocaleString("en-IN")} L across 2 cycles`
      : `Irrigate ${winner.totalWaterUsedLiters.toLocaleString("en-IN")} L to preserve ${input.crop} ${input.growthStage} yield`;
  } else if (winner.id === "rain_delayed") {
    headline = `Conserve Budget: Delay heavy irrigation for forecasted rain on ${rainDay?.dayLabel || "Day 4"}`;
  } else if (winner.id === "split_pulse") {
    headline = `Apply Light-Pulse Irrigation: 3 micro-doses (${winner.totalWaterUsedLiters.toLocaleString("en-IN")} L total) to prevent percolation`;
  } else {
    headline = `Full Irrigation Recommended: ${winner.totalWaterUsedLiters.toLocaleString("en-IN")} L`;
  }

  const summaryRationale = `Your ${input.crop} crop is at the ${input.growthStage} stage on ${input.soilType} soil. Estimated root depletion has reached ${budget.estimatedRootZoneDepletionMm} mm (RAW buffer limit: ${budget.readilyAvailableWaterMm} mm). With an available water budget of ${budget.availableWaterBudgetLiters.toLocaleString("en-IN")} L, the "${winner.name}" schedule scored highest (${winner.suitabilityScore}/100) by delivering targeted moisture to critical flower/fruit nodes while strictly respecting your water budget.`;

  const tradeOffJustification =
    winner.id === "critical_stage_deficit"
      ? `Selected over "Full Demand Replacement" (Score: ${schedules.find((s) => s.id === "full_demand")?.suitabilityScore}/100) because Full Demand exceeds available water reserves (${budget.grossIrrigationRequirementLiters.toLocaleString("en-IN")} L gross need vs ${budget.availableWaterBudgetLiters.toLocaleString("en-IN")} L budget cap). Selected over "Rain Delayed" (Score: ${schedules.find((s) => s.id === "rain_delayed")?.suitabilityScore}/100) because ${input.growthStage} has high yield sensitivity (Ky = ${stageInfo.yieldSensitivityKy}); delaying irrigation when root depletion is at ${budget.estimatedRootZoneDepletionMm} mm risks irreversible flower drop before rain occurs.`
      : winner.id === "rain_delayed"
      ? `Selected over "Budget-Optimized" (Score: ${schedules.find((s) => s.id === "critical_stage_deficit")?.suitabilityScore}/100) because forecasted rain of ${rainDay?.forecastRainMm} mm will recharge the root zone, saving ${budget.availableWaterBudgetLiters.toLocaleString("en-IN")} L of pump fuel and groundwater.`
      : `Selected over single-application schedules because ${input.soilType} soil has low water retention; 3 micro-doses keep moisture in the upper root zone.`;

  const operationalActionPlan: string[] = [
    `Run pumps for ${winner.dailyEvents[0]?.pumpDurationHours || 2.5} hours (${winner.dailyEvents[0]?.waterToApplyLiters.toLocaleString("en-IN")} L) during ${winner.dailyEvents[0]?.timingRecommendation || "early morning"} on ${winner.dailyEvents[0]?.dayLabel || "Day 1"}.`,
    input.irrigationMethod === "drip"
      ? "Ensure line pressure is maintained at 1.0 - 1.2 kg/cm²; inspect drippers for salt clogging."
      : "Run irrigation before 09:00 AM to prevent 20-30% midday evaporation loss from wind and high solar radiation.",
    `Schedule next application of ${winner.dailyEvents[1]?.waterToApplyLiters.toLocaleString("en-IN") || "remaining"} L on ${winner.dailyEvents[1]?.dayLabel || "Day 3"} if unpredicted rain does not occur.`,
  ];

  const fieldValidationTip =
    "Practical Soil Check: Take a soil sample from 15-20 cm root depth. Squeeze into a ball in your hand. If it forms a firm ball that leaves a light moisture film on your fingers without crumbling, irrigation can be safely postponed by 24 hours.";

  // Scoring Audit Trail
  const scoringAudit: ScheduleScoreAudit[] = schedules.map((s) => ({
    scheduleId: s.id,
    scheduleName: s.name,
    totalScore: s.suitabilityScore,
    isFeasible: s.isFeasibleWithinBudget,
    justification: !s.isFeasibleWithinBudget
      ? `Infeasible: Requires ${s.totalWaterUsedLiters.toLocaleString("en-IN")} L, exceeding the ${budget.availableWaterBudgetLiters.toLocaleString("en-IN")} L budget constraint.`
      : `Feasible: Scored ${s.suitabilityScore}/100 (Budget: ${s.scoreBreakdown.budgetCompliance}/30, Stress Protection: ${s.scoreBreakdown.stressProtection}/35, Weather: ${s.scoreBreakdown.weatherAlignment}/20, Efficiency: ${s.scoreBreakdown.efficiency}/15).`,
  }));

  const lastIrrDateObj = new Date(input.lastIrrigatedDate);
  const todayObj = new Date();
  const daysElapsed = Math.max(
    0,
    Math.floor((todayObj.getTime() - lastIrrDateObj.getTime()) / 86400000)
  ) || 4;

  const weatherSourceDescription =
    weatherSource === "live_open_meteo"
      ? `Live meteorological telemetry for ${input.fieldLocation} from Open-Meteo API.`
      : `Regional climatological fallback dataset for ${input.fieldLocation} (external weather API offline or unconfigured).`;

  return {
    recommendedScheduleId: winner.id,
    recommendedScheduleName: winner.name,
    urgency,
    headline,
    summaryRationale,
    scientificExplanation: {
      phenologicalSensitivity: `${input.crop} at ${input.growthStage} has a crop coefficient Kc of ${stageInfo.kc} and yield sensitivity factor Ky of ${stageInfo.yieldSensitivityKy}. ${stageInfo.stageDescription}`,
      waterBalanceSummary: `5-day gross demand is ${budget.grossIrrigationRequirementLiters.toLocaleString("en-IN")} L at ${Math.round(budget.irrigationEfficiency * 100)}% application efficiency (net root demand: ${budget.netIrrigationNeedLiters.toLocaleString("en-IN")} L). Effective rainfall credit is ${budget.totalEffectiveRainLiters.toLocaleString("en-IN")} L.`,
      tradeOffJustification,
      meteorologicalAlignment: `Local outlook: max temp ${Math.max(...daily.map((d) => d.tempMax))}°C with ${budget.totalForecastRainMm} mm rain indicated over 5 days (${weatherSource === "live_open_meteo" ? "Live Telemetry" : "Climatological Fallback"}).`,
    },
    operationalActionPlan,
    fieldValidationTip,
    scoringAudit,
    transparencyNotes: {
      measuredOrLiveInputs: [
        weatherSourceDescription,
        `5-Day Max Temperature Horizon: ${Math.max(...daily.map((d) => d.tempMax))}°C, Min Temp: ${Math.min(...daily.map((d) => d.tempMin))}°C.`,
        `Precipitation Outlook: ${budget.totalForecastRainMm} mm indicated (${weatherSource === "live_open_meteo" ? "Live Forecast" : "Climatological Estimate"}).`,
      ],
      userSpecifiedInputs: [
        `Crop: ${input.crop}`,
        `Growth Stage: ${input.growthStage}`,
        `Soil Type: ${input.soilType}`,
        `Field Size: ${input.fieldArea} ${input.areaUnit} (${budget.fieldAreaHectares} ha)`,
        `Available Water Budget: ${input.availableWaterBudgetLiters.toLocaleString("en-IN")} Liters`,
        `Irrigation Method: ${input.irrigationMethod} (${Math.round(budget.irrigationEfficiency * 100)}% application efficiency)`,
        `Last Irrigated Date: ${input.lastIrrigatedDate}`,
      ],
      modeledAssumptions: [
        `Soil moisture depletion (${budget.estimatedRootZoneDepletionMm} mm) is an agronomic calculation based on ${daysElapsed} days elapsed since last watering and soil AWC (${SOIL_HYDROLOGY_PROFILES[input.soilType].awcMmPerMeter} mm/m). No physical in-situ sensor probe is present.`,
        `Reference ETo calculated via FAO Hargreaves-Samani equation calibrated for ${input.fieldLocation}.`,
        `Effective rainfall computed via USDA-SCS model accounting for run-off and canopy interception.`,
      ],
      forecastLimitations: [
        weatherSource === "live_open_meteo"
          ? "Numerical weather models carry spatial and precipitation timing uncertainty. Localized convective showers may vary from grid predictions."
          : "IMPORTANT: Weather data is derived from regional climatological baseline estimates because live API telemetry was unreachable. Rain values (e.g. 3.0 mm) should be treated as historical seasonal averages, NOT guaranteed rain.",
        "Unmeasured sub-surface soil characteristics (e.g. clay hardpan, salinity, gravel strata) may alter water retention and require local KVK verification.",
      ],
    },
  };
}
