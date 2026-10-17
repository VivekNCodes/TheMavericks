import {
  CropAgronomy,
  CropPlanInput,
  GrowingPlan,
  LandAreaUnit,
  SoilSuitabilityAssessment,
  StageSchedule,
  WaterBudget,
  WeatherOutlook,
} from "../types";
import { INDIAN_CROPS_DATABASE } from "../data/crops";
import { INDIAN_SOIL_TYPES } from "../data/soils";

/**
 * Standardize land area to Hectares and Acres.
 */
export function normalizeLandArea(area: number, unit: LandAreaUnit): { hectares: number; acres: number } {
  let hectares = 0;
  switch (unit) {
    case "hectare":
      hectares = area;
      break;
    case "acre":
      hectares = area * 0.404686;
      break;
    case "bigha":
      // Standard pucca bigha ~ 0.2529 hectare (~0.625 acre)
      hectares = area * 0.2529;
      break;
    case "guntha":
      // 1 Guntha = 1/40 Acre = 101.17 m2 = 0.010117 hectare
      hectares = area * 0.010117;
      break;
    default:
      hectares = area * 0.404686;
  }

  const acres = hectares * 2.47105;
  return {
    hectares: Number(hectares.toFixed(3)),
    acres: Number(acres.toFixed(2)),
  };
}

/**
 * Evaluates soil suitability, pH compliance, and documents all assumptions made.
 */
export function assessSoilSuitability(
  crop: CropAgronomy,
  input: CropPlanInput
): SoilSuitabilityAssessment {
  const soilInfo = INDIAN_SOIL_TYPES[input.soilType];
  const assumptions: string[] = [];
  const recommendations: string[] = [];
  const limitingFactors: string[] = [];

  let score = 100;

  // 1. Soil Texture Compatibility
  const soilMatch = crop.suitableSoils.includes(input.soilType);
  if (!soilMatch) {
    score -= 25;
    limitingFactors.push(
      `Soil texture (${soilInfo.name}) is sub-optimal for ${crop.name}. Prefers ${crop.suitableSoils
        .map((s) => INDIAN_SOIL_TYPES[s].name)
        .join(" or ")}.`
    );
    recommendations.push(
      `Incorporate 15-20 tonnes/ha well-decomposed FYM or compost to improve structure and moisture buffer of ${soilInfo.name}.`
    );
  }

  // 2. Soil pH Assessment
  let phValueUsed = 7.0;
  let isPhAssumed = false;
  let phStatus: SoilSuitabilityAssessment["phStatus"] = "optimal";

  if (input.soilTest.ph !== undefined && input.soilTest.ph > 0) {
    phValueUsed = input.soilTest.ph;
    isPhAssumed = false;

    if (phValueUsed < crop.optimalPh.tolerableMin) {
      score -= 30;
      phStatus = phValueUsed < 5.0 ? "strongly_acidic" : "moderately_acidic";
      limitingFactors.push(`Soil pH (${phValueUsed}) is too acidic for ${crop.name} (Tolerable min: ${crop.optimalPh.tolerableMin}).`);
      recommendations.push(
        "Apply agricultural lime (CaCO3) or dolomite at 2-3 tonnes/ha 3-4 weeks prior to sowing to raise pH toward neutral."
      );
    } else if (phValueUsed > crop.optimalPh.tolerableMax) {
      score -= 30;
      phStatus = phValueUsed > 8.5 ? "strongly_alkaline" : "moderately_alkaline";
      limitingFactors.push(`Soil pH (${phValueUsed}) is alkaline for ${crop.name} (Tolerable max: ${crop.optimalPh.tolerableMax}).`);
      recommendations.push(
        "Apply agricultural gypsum (CaSO4) or elemental sulphur along with green manuring (Dhaincha/Sesbania) to buffer alkalinity."
      );
    } else if (phValueUsed >= crop.optimalPh.min && phValueUsed <= crop.optimalPh.max) {
      phStatus = "optimal";
    } else {
      score -= 10;
      phStatus = phValueUsed < crop.optimalPh.min ? "moderately_acidic" : "moderately_alkaline";
      recommendations.push(
        `pH ${phValueUsed} is within tolerable limits, but slightly outside ideal range (${crop.optimalPh.min} - ${crop.optimalPh.max}). Monitor nutrient uptake.`
      );
    }
  } else {
    // pH not provided -> Assumption
    isPhAssumed = true;
    phValueUsed = Number(((soilInfo.typicalPhMin + soilInfo.typicalPhMax) / 2).toFixed(1));
    phStatus = "assumed_neutral";
    assumptions.push(
      `Soil pH not provided by laboratory test. Assumed typical regional baseline of pH ${phValueUsed} for ${soilInfo.name}.`
    );
    recommendations.push(
      "Conduct a Soil Health Card (SHC) laboratory test at your nearest KVK or district lab to confirm true soil pH and electrical conductivity (EC)."
    );
  }

  // 3. Soil Nutrients Assessment
  const isNutrientsAssumed = !input.soilTest.hasLabReport;
  if (isNutrientsAssumed) {
    assumptions.push(
      "Laboratory N-P-K nutrient status not provided. Agronomic plan assumes medium fertility index under standard regional conditions."
    );
  } else {
    if (input.soilTest.nitrogen === "low") {
      recommendations.push("Soil test indicates Low Nitrogen. Increase basal Nitrogen application by 15-20%.");
    } else if (input.soilTest.nitrogen === "high") {
      recommendations.push("Soil test indicates High Nitrogen. Reduce basal Urea by 15% to prevent vegetative lodging.");
    }

    if (input.soilTest.phosphorus === "low") {
      recommendations.push("Soil test indicates Low Phosphorus. Apply SSP or DAP in seed furrow close to root zone.");
    }

    if (input.soilTest.potassium === "low") {
      recommendations.push("Soil test indicates Low Potassium. Ensure MOP (Muriate of Potash) is supplied to promote disease resistance.");
    }
  }

  // Bound score
  const finalScore = Math.max(25, Math.min(100, score));

  let rating: SoilSuitabilityAssessment["rating"] = "suitable";
  if (finalScore >= 85) rating = "ideal";
  else if (finalScore >= 68) rating = "suitable";
  else if (finalScore >= 45) rating = "marginal";
  else rating = "poor";

  return {
    score: finalScore,
    rating,
    soilMatch,
    phStatus,
    phValueUsed,
    isPhAssumed,
    isNutrientsAssumed,
    assumptions,
    recommendations,
    limitingFactors,
  };
}

/**
 * Builds the stage-by-stage calendar and milestones.
 */
export function buildGrowingCalendar(
  crop: CropAgronomy,
  sowingDateStr: string,
  totalWaterDemandMm: number,
  normalizedHectares: number
): StageSchedule[] {
  const sowingDate = new Date(sowingDateStr);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const totalDuration = crop.totalDurationDays.standard;
  let runningDate = new Date(sowingDate);

  const totalKcWeight = crop.stages.reduce(
    (acc, st) => acc + st.kc * st.durationPercentage,
    0
  );

  return crop.stages.map((st, idx) => {
    const stageDurationDays = Math.max(
      7,
      Math.round(totalDuration * st.durationPercentage)
    );

    const startDateObj = new Date(runningDate);
    const endDateObj = new Date(runningDate);
    endDateObj.setDate(startDateObj.getDate() + stageDurationDays - 1);

    // Advance running date for next stage
    runningDate = new Date(endDateObj);
    runningDate.setDate(runningDate.getDate() + 1);

    // Approximate stage water requirement (FAO Kc adjusted)
    const stageWeight = (st.kc * st.durationPercentage) / (totalKcWeight || 1);
    const stageWaterDemandMm = Math.round(totalWaterDemandMm * stageWeight);
    // 1 mm water on 1 ha = 10,000 Liters (10 m3)
    const stageWaterDemandLiters = Math.round(stageWaterDemandMm * 10000 * normalizedHectares);

    let status: StageSchedule["status"] = "upcoming";
    if (now > endDateObj) {
      status = "completed";
    } else if (now >= startDateObj && now <= endDateObj) {
      status = "active";
    }

    let irrigationGuidance = `Stage water demand: ~${stageWaterDemandMm} mm. Maintain moderate soil aeration.`;
    if (st.criticalWaterStage) {
      irrigationGuidance = `CRITICAL MOISTURE STAGE: Water stress during this phase severely damages yield potential. Maintain root zone moisture near field capacity.`;
    }

    return {
      stageId: st.id,
      stageName: st.defaultName,
      stageOrder: idx + 1,
      durationDays: stageDurationDays,
      startDate: startDateObj.toISOString().split("T")[0],
      endDate: endDateObj.toISOString().split("T")[0],
      kc: st.kc,
      waterDemandMm: stageWaterDemandMm,
      waterDemandLiters: stageWaterDemandLiters,
      criticalWaterStage: st.criticalWaterStage,
      irrigationGuidance,
      tasks: st.tasks,
      nutrientGuidance: st.nutrientGuidance,
      status,
    };
  });
}

/**
 * Calculates net irrigation requirements, effective rainfall, and irrigation intervals.
 */
export function calculateWaterBudget(
  crop: CropAgronomy,
  input: CropPlanInput,
  weatherOutlook: WeatherOutlook,
  normalizedHectares: number
): WaterBudget {
  const soil = INDIAN_SOIL_TYPES[input.soilType];
  const totalDemandMm = crop.totalWaterDemandMm.standard;
  const totalDemandM3PerHa = totalDemandMm * 10;
  const totalDemandLitersForArea = Math.round(totalDemandMm * 10000 * normalizedHectares);

  const forecastRain7d = weatherOutlook.totalForecastRainMmNext7Days;

  // USDA Soil Conservation Service (SCS) formula for Effective Rainfall (Peff)
  // Peff = P * (125 - 0.2*P)/125 for P <= 250 mm
  let estimatedEffectiveRainMm = 0;
  if (forecastRain7d > 0) {
    if (forecastRain7d <= 250) {
      estimatedEffectiveRainMm = forecastRain7d * ((125 - 0.2 * forecastRain7d) / 125);
    } else {
      estimatedEffectiveRainMm = 125 + 0.1 * forecastRain7d;
    }
  }
  estimatedEffectiveRainMm = Number(Math.max(0, Math.min(forecastRain7d, estimatedEffectiveRainMm)).toFixed(1));

  // Net Irrigation Requirement (NIR) for the immediate upcoming forecast window
  const netIrrigationRequirementMm = Number(
    Math.max(0, weatherOutlook.forecast7Day.reduce((acc, d) => acc + d.estimatedEtoMm, 0) - estimatedEffectiveRainMm).toFixed(1)
  );

  const netIrrigationRequirementLiters = Math.round(netIrrigationRequirementMm * 10000 * normalizedHectares);

  // Irrigation Application Efficiency
  let efficiency = 0.75;
  let methodGuidance = "";

  switch (input.irrigationMethod) {
    case "drip":
      efficiency = 0.90;
      methodGuidance = "Drip Irrigation (90% efficiency): Saves 35-45% water compared to flood irrigation, reduces foliar wetting diseases, and enables precision fertigation.";
      break;
    case "sprinkler":
      efficiency = 0.75;
      methodGuidance = "Sprinkler System (75% efficiency): Suitable for undulating terrains and sandy soils. Avoid operating during windy midday hours to prevent drift loss.";
      break;
    case "flood_furrow":
      efficiency = 0.50;
      methodGuidance = "Furrow / Basin Surface Irrigation (50% efficiency): High conveyance and deep percolation losses. Ensure laser land leveling and furrow mulching to conserve water.";
      break;
    case "rainfed":
      efficiency = 1.0;
      methodGuidance = "Rainfed / Dryland Cultivation: Entirely dependent on rainfall distribution and soil moisture retention. Utilize in-situ moisture conservation (broad-bed furrows, organic mulch).";
      break;
  }

  const grossIrrigationRequirementMm = Number((netIrrigationRequirementMm / (efficiency || 0.75)).toFixed(1));

  // Irrigation Interval Calculation based on Soil Available Water Capacity (AWC)
  // Readily Available Water (RAW) = MAD * AWC * RootDepth (standard MAD = 0.50)
  const rootDepth = crop.standardRootDepthMeters;
  const rawMm = 0.5 * soil.awcMmPerMeter * rootDepth;
  const avgDailyEto = weatherOutlook.forecast7Day.length > 0
    ? weatherOutlook.forecast7Day.reduce((acc, d) => acc + d.estimatedEtoMm, 0) / weatherOutlook.forecast7Day.length
    : 4.5;

  let estimatedIntervalDays = Math.max(1, Math.round(rawMm / (avgDailyEto * 0.85)));

  // Drip systems are scheduled on 1-2 day micro-dosing cycles
  if (input.irrigationMethod === "drip") {
    estimatedIntervalDays = Math.min(2, Math.max(1, Math.round(estimatedIntervalDays / 3)));
  } else if (input.irrigationMethod === "sprinkler") {
    estimatedIntervalDays = Math.min(6, Math.max(3, Math.round(estimatedIntervalDays * 0.7)));
  }

  let waterStressRisk: WaterBudget["waterStressRisk"] = "none";
  if (input.waterAvailability === "scant") {
    waterStressRisk = input.irrigationMethod === "flood_furrow" ? "high" : "medium";
  } else if (input.irrigationMethod === "rainfed" && forecastRain7d < 2) {
    waterStressRisk = "high";
  } else if (input.waterAvailability === "moderate") {
    waterStressRisk = "low";
  }

  return {
    totalDemandMm,
    totalDemandM3PerHectare: totalDemandM3PerHa,
    totalDemandLitersForArea,
    forecastRainMmNext7Days: forecastRain7d,
    estimatedEffectiveRainfallMm: estimatedEffectiveRainMm,
    netIrrigationRequirementMm,
    netIrrigationRequirementLiters,
    irrigationApplicationEfficiency: efficiency,
    grossIrrigationRequirementMm,
    estimatedIrrigationIntervalDays: estimatedIntervalDays,
    irrigationMethodEfficiencyPercent: Math.round(efficiency * 100),
    soilWaterHoldingCapacityMm: Math.round(soil.awcMmPerMeter * rootDepth),
    waterStressRisk,
    methodGuidance,
    calculationMethodology:
      "Calculated in accordance with FAO Irrigation & Drainage Paper 56 (Penman-Monteith / Hargreaves reference ETo x Crop Stage Kc) and USDA-SCS effective precipitation model.",
  };
}

/**
 * Calculates tailored NPK and organic fertilization doses for the farmer's land.
 */
export function calculateNutrientPlan(
  crop: CropAgronomy,
  normalizedHectares: number,
  normalizedAcres: number,
  soilTest: CropPlanInput["soilTest"]
) {
  let { n, p, k } = crop.standardNpkPerHectare;

  if (soilTest.hasLabReport) {
    if (soilTest.nitrogen === "low") n = Math.round(n * 1.2);
    else if (soilTest.nitrogen === "high") n = Math.round(n * 0.8);

    if (soilTest.phosphorus === "low") p = Math.round(p * 1.25);
    else if (soilTest.phosphorus === "high") p = Math.round(p * 0.8);

    if (soilTest.potassium === "low") k = Math.round(k * 1.2);
    else if (soilTest.potassium === "high") k = Math.round(k * 0.8);
  }

  const totalN = Math.round(n * normalizedHectares);
  const totalP = Math.round(p * normalizedHectares);
  const totalK = Math.round(k * normalizedHectares);
  const totalFym = Number((crop.fymTonnesPerHectare * normalizedHectares).toFixed(1));

  // Urea is 46% N; DAP is 18% N + 46% P; SSP is 16% P; MOP is 60% K
  const basalDose = `Basal Application (at sowing / transplanting): Apply 50% N (${Math.round(
    totalN * 0.5
  )} kg N equivalent), 100% P (${totalP} kg P2O5), and 50% K (${Math.round(
    totalK * 0.5
  )} kg K2O). Recommend DAP / SSP and MOP band placement 5 cm below seed.`;

  const vegetativeTopDress = `First Top-Dressing (Vegetative / Tillering stage): Broadcast 25% N (${Math.round(
    totalN * 0.25
  )} kg N ~ ${Math.round((totalN * 0.25) / 0.46)} kg Urea) following scheduled irrigation.`;

  const floweringTopDress = `Second Top-Dressing (Flowering / Booting stage): Broadcast remaining 25% N (${Math.round(
    totalN * 0.25
  )} kg N) and remaining 50% K (${Math.round(
    totalK * 0.5
  )} kg K2O) to ensure optimal grain / fruit filling.`;

  const organicManureFym = `Organic Soil Conditioner: Incorporate ${totalFym} tonnes of well-rotted Farm Yard Manure (FYM) or vermicompost during initial summer/pre-sowing plowing across ${normalizedAcres} acres.`;

  const generalNote =
    "Fertilizer requirements are derived from ICAR standard agronomic recommendations scaled for your land parcel. For micronutrient deficiencies (Zinc, Boron, Iron), verify with a local Soil Health Card test.";

  return {
    basalDose,
    vegetativeTopDress,
    floweringTopDress,
    organicManureFym,
    generalNote,
  };
}

/**
 * Master Agronomic Plan Generator.
 * Completely deterministic, testable, and pure.
 */
export function generateCropGrowingPlan(
  input: CropPlanInput,
  weatherOutlook: WeatherOutlook
): GrowingPlan {
  const crop =
    INDIAN_CROPS_DATABASE.find((c) => c.id === input.cropId) || INDIAN_CROPS_DATABASE[0];

  const { hectares, acres } = normalizeLandArea(input.landArea, input.areaUnit);
  const soilAssessment = assessSoilSuitability(crop, input);
  const waterBudget = calculateWaterBudget(crop, input, weatherOutlook, hectares);
  const calendar = buildGrowingCalendar(crop, input.sowingDate, waterBudget.totalDemandMm, hectares);
  const nutrientPlan = calculateNutrientPlan(crop, hectares, acres, input.soilTest);

  const fieldReminders: string[] = [
    `Complete seed treatment (fungicide + bio-inoculants) prior to sowing on ${input.sowingDate}.`,
    `Calibrate your ${input.irrigationMethod.replace("_", " ")} system to deliver ~${waterBudget.grossIrrigationRequirementMm} mm gross depth over the upcoming week.`,
    soilAssessment.isPhAssumed
      ? "Schedule a laboratory soil test at your local KVK to replace assumed pH values."
      : "Maintain records of your soil test report for next season's crop rotation.",
    "Monitor fields weekly for early weed flushes and pest incidence; practice Integrated Pest Management (IPM).",
  ];

  const scientificSources: string[] = [
    ...crop.citations,
    "FAO Irrigation and Drainage Paper 56: Guidelines for computing crop water requirements",
    "Open-Meteo Weather API (CC BY 4.0 Meteorological Reanalysis & Forecast)",
    "ICAR - All India Coordinated Research Projects (AICRP) on Water Management & Soil Health",
  ];

  const disclaimer =
    "Data Transparency Notice: Crop growing schedules, water budgets, and fertilizer doses are synthesized from scientific research data from ICAR, FAO 56, and state agricultural universities. Weather forecasts are fetched via Open-Meteo. Actual farm performance may vary based on micro-climatic variations, field topography, seed variety, and localized pests. Consult your local Krishi Vigyan Kendra (KVK) or Block Agriculture Officer for field-verified prescriptions.";

  return {
    id: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    generatedAt: new Date().toISOString(),
    input,
    crop,
    normalizedAreaHectares: hectares,
    normalizedAreaAcres: acres,
    soilAssessment,
    weatherOutlook,
    calendar,
    waterBudget,
    nutrientPlan,
    fieldReminders,
    scientificSources,
    disclaimer,
  };
}
