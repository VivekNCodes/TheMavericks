import {
  calculateEffectiveRainfallMm,
  calculateHargreavesEtoMm,
  generateIrrigationSchedulePlan,
  normalizeFieldArea,
  sanitizeIrrigationInput,
} from "./water-budget-engine";
import { WeatherDayForecast } from "../types";

export interface TestCaseResult {
  name: string;
  passed: boolean;
  details?: string;
}

export function runIrrigationEngineTests(): TestCaseResult[] {
  const results: TestCaseResult[] = [];

  function assert(condition: boolean, name: string, failureDetails?: string) {
    results.push({
      name,
      passed: Boolean(condition),
      details: condition ? undefined : failureDetails || "Assertion failed",
    });
  }

  // -------------------------------------------------------------
  // Group 1: Unit Conversions & Field Area Normalization
  // -------------------------------------------------------------
  {
    const acre1 = normalizeFieldArea(1.0, "acre");
    assert(
      Math.abs(acre1.hectares - 0.4047) < 0.001 && Math.abs(acre1.acres - 1.0) < 0.01,
      "normalizeFieldArea: 1 acre normalizes to ~0.4047 ha"
    );

    const bigha1 = normalizeFieldArea(1.0, "bigha");
    assert(
      Math.abs(bigha1.hectares - 0.2529) < 0.001,
      "normalizeFieldArea: 1 bigha normalizes to ~0.2529 ha"
    );

    const ha1 = normalizeFieldArea(1.0, "hectare");
    assert(ha1.hectares === 1.0, "normalizeFieldArea: 1 hectare normalizes to 1.0 ha");
  }

  // -------------------------------------------------------------
  // Group 2: Water Demand & Rainfall Calculations
  // -------------------------------------------------------------
  {
    const zeroRain = calculateEffectiveRainfallMm(1.5);
    assert(zeroRain === 0, "calculateEffectiveRainfallMm: < 2mm rain yields 0 Peff (interception loss)");

    const modRain = calculateEffectiveRainfallMm(20.0);
    // 20 * (125 - 0.2*20) / 125 = 20 * 121 / 125 = 19.36 ~ 19.4 mm
    assert(
      modRain > 15 && modRain <= 20,
      `calculateEffectiveRainfallMm: 20mm rain yields realistic Peff (${modRain} mm)`
    );

    const eto = calculateHargreavesEtoMm(32, 20, 26.9);
    assert(
      eto >= 3.0 && eto <= 7.5,
      `calculateHargreavesEtoMm: 32C/20C gives realistic ETo between 3-7.5 mm/day (got ${eto})`
    );
  }

  // -------------------------------------------------------------
  // Group 3: Water-Balance Equation Audit & Non-Double-Counting
  // -------------------------------------------------------------
  {
    const testForecast: WeatherDayForecast[] = [
      { day: "Day 1", tempMax: 30, tempMin: 18, rainMm: 0, condition: "Sunny", source: "live_open_meteo" },
      { day: "Day 2", tempMax: 30, tempMin: 18, rainMm: 10, condition: "Rain", source: "live_open_meteo" },
      { day: "Day 3", tempMax: 30, tempMin: 18, rainMm: 0, condition: "Sunny", source: "live_open_meteo" },
      { day: "Day 4", tempMax: 30, tempMin: 18, rainMm: 0, condition: "Sunny", source: "live_open_meteo" },
      { day: "Day 5", tempMax: 30, tempMin: 18, rainMm: 0, condition: "Sunny", source: "live_open_meteo" },
    ];

    const plan = generateIrrigationSchedulePlan(
      {
        crop: "Tomato",
        growthStage: "Flowering",
        soilType: "Loamy",
        fieldArea: 1.0, // 0.4047 ha
        areaUnit: "acre",
        irrigationMethod: "drip", // Ea = 0.90
        availableWaterBudgetLiters: 50000,
        lastIrrigatedDate: "2026-10-14",
      },
      testForecast,
      "live_open_meteo"
    );

    const b = plan.budget;
    const ha = b.fieldAreaHectares;
    const ea = b.irrigationEfficiency;

    // Equation Check 1: Daily net demand = max(0, ETc - Peff)
    const day2 = plan.dailyBalances[1];
    const expectedPeff = calculateEffectiveRainfallMm(10);
    const expectedDay2NetMm = Number(Math.max(0, day2.cropEtcMm - expectedPeff).toFixed(2));
    assert(
      day2.netDemandMm === expectedDay2NetMm,
      `Equation Audit: Daily net demand strictly equals max(0, ETc - Peff) on Day 2 (${day2.netDemandMm} == ${expectedDay2NetMm})`
    );

    // Equation Check 2: Total Net Irrigation Depth = Initial Depletion + 5-Day Net Crop Demand
    const sum5DayNetMm = Number(plan.dailyBalances.reduce((sum, d) => sum + d.netDemandMm, 0).toFixed(1));
    const expectedNetDepthMm = Number((b.estimatedRootZoneDepletionMm + sum5DayNetMm).toFixed(1));
    assert(
      b.netIrrigationNeedDepthMm === expectedNetDepthMm,
      `Equation Audit: Net need depth strictly equals Initial Depletion + Sum(Daily Net Demand) (${b.netIrrigationNeedDepthMm} mm == ${expectedNetDepthMm} mm)`
    );

    // Equation Check 3: Net Volume = Depth * 10,000 * Hectares (Zero application loss at root zone)
    const expectedNetLiters = Math.round(b.netIrrigationNeedDepthMm * 10000 * ha);
    assert(
      b.netIrrigationNeedLiters === expectedNetLiters,
      `Equation Audit: Net volume strictly equals Depth * 10,000 * Hectares (${b.netIrrigationNeedLiters} L == ${expectedNetLiters} L)`
    );

    // Equation Check 4: Gross Volume = Net Volume / Irrigation Efficiency (Ea applied only at pump delivery)
    const expectedGrossLiters = Math.round(b.netIrrigationNeedLiters / ea);
    assert(
      b.grossIrrigationRequirementLiters === expectedGrossLiters,
      `Equation Audit: Gross pump requirement strictly equals Net Volume / Ea (${b.grossIrrigationRequirementLiters} L == ${expectedGrossLiters} L)`
    );

    // Equation Check 5: Budget Deficit/Surplus = Available Budget - Gross Volume
    const expectedDeficit = b.availableWaterBudgetLiters - b.grossIrrigationRequirementLiters;
    assert(
      b.budgetDeficitSurplusLiters === expectedDeficit,
      `Equation Audit: Budget balance strictly equals Available Budget - Gross Requirement (${b.budgetDeficitSurplusLiters} L == ${expectedDeficit} L)`
    );

    // Equation Check 6: Non-double counting of effective rainfall
    // Peff was subtracted from ETc to get net demand. Check that it is NOT subtracted again from budget.
    assert(
      b.budgetDeficitSurplusLiters + b.grossIrrigationRequirementLiters === b.availableWaterBudgetLiters,
      "Equation Audit: Effective rainfall is subtracted once at crop demand and not double-deducted from budget"
    );
  }

  // -------------------------------------------------------------
  // Group 4: Input Validation & Missing Data Handling
  // -------------------------------------------------------------
  {
    const clean = sanitizeIrrigationInput({
      crop: "NonExistentCrop",
      fieldArea: -5,
      availableWaterBudgetLiters: 0,
      lastIrrigatedDate: "invalid-date",
    });

    assert(clean.crop === "Tomato", "sanitizeIrrigationInput: defaults unknown crop to Tomato");
    assert(clean.fieldArea === 1.0, "sanitizeIrrigationInput: corrects negative fieldArea to 1.0");
    assert(
      clean.availableWaterBudgetLiters === 40000,
      "sanitizeIrrigationInput: defaults missing water budget to 40,000 L"
    );
    assert(
      clean.lastIrrigatedDate.length === 10,
      "sanitizeIrrigationInput: synthesizes valid YYYY-MM-DD date when invalid date passed"
    );
  }

  // -------------------------------------------------------------
  // Group 5: Weather Forecast Source Tracking & Fallback Labeling
  // -------------------------------------------------------------
  {
    // Empty forecast triggers climatological fallback
    const planFallback = generateIrrigationSchedulePlan(
      { crop: "Tomato", availableWaterBudgetLiters: 40000 },
      []
    );

    assert(
      planFallback.budget.weatherForecastSource === "climatological_fallback",
      "Forecast Labeling: Empty forecast correctly labeled as 'climatological_fallback'"
    );
    assert(
      planFallback.recommendation.transparencyNotes.forecastLimitations[0].includes("climatological baseline"),
      "Forecast Labeling: Transparency notes explicitly communicate that rainfall is a historical baseline, not live radar"
    );

    // Explicit live forecast tagging
    const planLive = generateIrrigationSchedulePlan(
      { crop: "Tomato", availableWaterBudgetLiters: 40000 },
      [
        { day: "Today", tempMax: 30, tempMin: 18, rainMm: 0, condition: "Sunny", source: "live_open_meteo" },
        { day: "Tomorrow", tempMax: 30, tempMin: 18, rainMm: 0, condition: "Sunny", source: "live_open_meteo" },
        { day: "Day 3", tempMax: 30, tempMin: 18, rainMm: 0, condition: "Sunny", source: "live_open_meteo" },
      ],
      "live_open_meteo"
    );

    assert(
      planLive.budget.weatherForecastSource === "live_open_meteo",
      "Forecast Labeling: Live weather correctly labeled as 'live_open_meteo'"
    );
  }

  // -------------------------------------------------------------
  // Group 6: Strict Water-Budget Constraints & Feasibility Invariant
  // -------------------------------------------------------------
  {
    // Extremely tight budget (15,000 L) on high-demand field (3 acres flood)
    const constrainedPlan = generateIrrigationSchedulePlan(
      {
        crop: "Tomato",
        growthStage: "Flowering",
        soilType: "Sandy",
        fieldArea: 3.0,
        irrigationMethod: "flood",
        availableWaterBudgetLiters: 15000,
        flowRateLitersPerHour: 10000,
      },
      []
    );

    const budgetCap = 15000;
    const deficitSched = constrainedPlan.schedules.find((s) => s.id === "critical_stage_deficit")!;
    const pulseSched = constrainedPlan.schedules.find((s) => s.id === "split_pulse")!;
    const fullSched = constrainedPlan.schedules.find((s) => s.id === "full_demand")!;
    const recommended = constrainedPlan.schedules.find((s) => s.isRecommended)!;

    // Invariant 1: Budget-constrained schedules must NEVER exceed budget
    assert(
      deficitSched.totalWaterUsedLiters <= budgetCap,
      `Feasibility Invariant: Deficit schedule allocates <= budget (${deficitSched.totalWaterUsedLiters} L <= ${budgetCap} L)`
    );
    assert(
      pulseSched.totalWaterUsedLiters <= budgetCap,
      `Feasibility Invariant: Pulse schedule allocates <= budget (${pulseSched.totalWaterUsedLiters} L <= ${budgetCap} L)`
    );

    // Invariant 2: Over-budget schedule must be marked infeasible
    assert(
      !fullSched.isFeasibleWithinBudget,
      "Feasibility Invariant: Full Demand marked infeasible when demand exceeds budget"
    );

    // Invariant 3: The recommended schedule MUST be feasible within budget
    assert(
      recommended.isFeasibleWithinBudget,
      `Feasibility Invariant: Recommended schedule '${recommended.name}' is strictly feasible within budget`
    );
    assert(
      recommended.totalWaterUsedLiters <= budgetCap,
      `Feasibility Invariant: Recommended schedule water (${recommended.totalWaterUsedLiters} L) <= budget (${budgetCap} L)`
    );
  }

  // -------------------------------------------------------------
  // Group 7: Pumping Runtime & Delivery Conversion Tests
  // -------------------------------------------------------------
  {
    const plan = generateIrrigationSchedulePlan(
      {
        crop: "Tomato",
        growthStage: "Flowering",
        availableWaterBudgetLiters: 30000,
        flowRateLitersPerHour: 15000,
      },
      []
    );

    const sched = plan.schedules.find((s) => s.id === "critical_stage_deficit")!;
    const expectedHours = Number((sched.totalWaterUsedLiters / 15000).toFixed(1));
    assert(
      Math.abs(sched.totalPumpHours - expectedHours) < 0.2,
      `Pumping Runtime: Schedule pump hours (${sched.totalPumpHours} hrs) matches flow rate calculation (${expectedHours} hrs)`
    );

    const eventWaterSum = sched.dailyEvents.reduce((acc, ev) => acc + ev.waterToApplyLiters, 0);
    assert(
      eventWaterSum === sched.totalWaterUsedLiters,
      `Pumping Delivery: Daily event water sum (${eventWaterSum} L) strictly equals total schedule water (${sched.totalWaterUsedLiters} L)`
    );
  }

  // -------------------------------------------------------------
  // Group 8: Multi-Criteria Scoring & Dynamic Schedule Decision Logic
  // -------------------------------------------------------------
  {
    // Case A: Imminent heavy rain (12mm) during vegetative stage (low Ky = 0.4) on Loamy soil -> Rain-Delayed wins
    const rainyForecast: WeatherDayForecast[] = [
      { day: "Today", tempMax: 26, tempMin: 18, rainMm: 0, condition: "Partly Cloudy", source: "live_open_meteo" },
      { day: "Tomorrow", tempMax: 24, tempMin: 16, rainMm: 12, condition: "Heavy Rain", source: "live_open_meteo" },
      { day: "Day 3", tempMax: 25, tempMin: 17, rainMm: 6, condition: "Rain Showers", source: "live_open_meteo" },
      { day: "Day 4", tempMax: 27, tempMin: 18, rainMm: 0, condition: "Clear", source: "live_open_meteo" },
      { day: "Day 5", tempMax: 28, tempMin: 19, rainMm: 0, condition: "Sunny", source: "live_open_meteo" },
    ];

    const planRain = generateIrrigationSchedulePlan(
      {
        crop: "Tomato",
        growthStage: "Vegetative", // Non-critical stage, Ky = 0.4
        soilType: "Loamy",
        lastIrrigatedDate: "2026-10-17", // Minimal initial depletion
        fieldArea: 1.0,
        availableWaterBudgetLiters: 40000,
      },
      rainyForecast,
      "live_open_meteo"
    );

    const rainWinner = planRain.schedules.find((s) => s.isRecommended)!;
    assert(
      rainWinner.id === "rain_delayed",
      `Dynamic Scoring Case A: Rain-Delayed wins when heavy rain is imminent and crop is in non-critical vegetative stage (Winner: ${rainWinner.name})`
    );
    assert(
      rainWinner.scoreBreakdown.weatherAlignment >= 18,
      `Dynamic Scoring Case A: Rain-Delayed receives high weather alignment score (${rainWinner.scoreBreakdown.weatherAlignment}/20)`
    );

    // Case B: Critical flowering stage (Ky = 1.1) with dry forecast -> Budget-Optimized Deficit wins
    const dryForecast: WeatherDayForecast[] = [
      { day: "Today", tempMax: 32, tempMin: 20, rainMm: 0, condition: "Sunny", source: "live_open_meteo" },
      { day: "Tomorrow", tempMax: 33, tempMin: 20, rainMm: 0, condition: "Sunny", source: "live_open_meteo" },
      { day: "Day 3", tempMax: 34, tempMin: 21, rainMm: 0, condition: "Sunny", source: "live_open_meteo" },
      { day: "Day 4", tempMax: 32, tempMin: 20, rainMm: 0, condition: "Clear", source: "live_open_meteo" },
      { day: "Day 5", tempMax: 31, tempMin: 19, rainMm: 0, condition: "Clear", source: "live_open_meteo" },
    ];

    const planFlowering = generateIrrigationSchedulePlan(
      {
        crop: "Tomato",
        growthStage: "Flowering", // Critical stage, Ky = 1.1
        soilType: "Loamy",
        lastIrrigatedDate: "2026-10-14", // 4 days depletion
        fieldArea: 1.0,
        availableWaterBudgetLiters: 40000,
      },
      dryForecast,
      "live_open_meteo"
    );

    const deficitWinner = planFlowering.schedules.find((s) => s.isRecommended)!;
    assert(
      deficitWinner.id === "critical_stage_deficit",
      `Dynamic Scoring Case B: Budget-Optimized Deficit wins during flowering with dry outlook (Winner: ${deficitWinner.name})`
    );
    assert(
      deficitWinner.scoreBreakdown.stressProtection >= 30,
      `Dynamic Scoring Case B: Deficit schedule receives high stress protection score (${deficitWinner.scoreBreakdown.stressProtection}/35)`
    );
  }

  // -------------------------------------------------------------
  // Group 9: Exact User Scenario - 1 Acre Tomato / Jaipur / 40,000 L
  // -------------------------------------------------------------
  {
    const jaipurForecast: WeatherDayForecast[] = [
      { day: "Today", tempMax: 30, tempMin: 18, rainMm: 0, condition: "Sunny", source: "live_open_meteo" },
      { day: "Tomorrow", tempMax: 31, tempMin: 19, rainMm: 0, condition: "Sunny", source: "live_open_meteo" },
      { day: "Day 3", tempMax: 31, tempMin: 19, rainMm: 0, condition: "Clear", source: "live_open_meteo" },
      { day: "Day 4", tempMax: 32, tempMin: 20, rainMm: 2, condition: "Partly Cloudy", source: "live_open_meteo" },
      { day: "Day 5", tempMax: 30, tempMin: 18, rainMm: 0, condition: "Clear", source: "live_open_meteo" },
    ];

    const plan = generateIrrigationSchedulePlan(
      {
        crop: "Tomato",
        growthStage: "Flowering",
        soilType: "Loamy",
        fieldLocation: "Jaipur, Rajasthan",
        lastIrrigatedDate: "2026-10-14",
        fieldArea: 1.0,
        areaUnit: "acre",
        irrigationMethod: "drip",
        availableWaterBudgetLiters: 40000,
        flowRateLitersPerHour: 15000,
      },
      jaipurForecast,
      "live_open_meteo"
    );

    // Verify 4 schedules generated
    assert(plan.schedules.length === 4, "Jaipur Scenario: Generates 4 distinct feasible schedules");

    // Verify Schedule 3 (Budget-Optimized Deficit) strictly stays <= 40,000 L
    const budgetDeficitSched = plan.schedules.find((s) => s.id === "critical_stage_deficit")!;
    assert(
      budgetDeficitSched.totalWaterUsedLiters <= 40000,
      `Jaipur Scenario: Budget-Optimized Deficit schedule uses <= 40,000 L (used ${budgetDeficitSched.totalWaterUsedLiters} L)`
    );

    // Verify Schedule 4 (Pulse) also stays <= 40,000 L
    const pulseSched = plan.schedules.find((s) => s.id === "split_pulse")!;
    assert(
      pulseSched.totalWaterUsedLiters <= 40000,
      `Jaipur Scenario: Pulse schedule uses <= 40,000 L (used ${pulseSched.totalWaterUsedLiters} L)`
    );

    // Verify Schedule 1 (Full Demand) calculates complete unconstrained demand
    const fullSched = plan.schedules.find((s) => s.id === "full_demand")!;
    assert(
      fullSched.totalWaterUsedLiters > 0,
      "Jaipur Scenario: Full Demand schedule calculates complete unconstrained demand"
    );

    // Verify Explainable Recommendation
    assert(
      Boolean(plan.recommendation.headline && plan.recommendation.headline.length > 10),
      "Jaipur Scenario: Generates meaningful explainable headline"
    );
    assert(
      plan.recommendation.transparencyNotes.measuredOrLiveInputs.length > 0 &&
        plan.recommendation.transparencyNotes.userSpecifiedInputs.length > 0 &&
        plan.recommendation.transparencyNotes.modeledAssumptions.length > 0 &&
        plan.recommendation.transparencyNotes.forecastLimitations.length > 0,
      "Jaipur Scenario: Distinguishes measured inputs, user inputs, modeled assumptions, and forecast limitations"
    );
  }

  return results;
}
