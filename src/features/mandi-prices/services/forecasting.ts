import {
  HistoricalDataPoint,
  ForecastDataPoint,
  ForecastEvaluationMetrics,
  MandiForecastResult,
} from "../types";

/**
 * Chronological Walk-Forward Backtesting for 4-day forecast models
 * Strictly prevents future-data leakage.
 */
export function evaluateModelsWalkForward(
  history: HistoricalDataPoint[]
): {
  selectedModelName: "Naive Baseline" | "Moving Average" | "Holt's Linear Trend";
  metrics: ForecastEvaluationMetrics;
  bestModelType: "naive" | "moving_average" | "holt";
} {
  const n = history.length;

  // If history is insufficient (< 5 observations), declare experimental baseline
  if (n < 5) {
    const lastPrice = n > 0 ? history[n - 1].modalPrice : 0;
    return {
      selectedModelName: "Naive Baseline",
      bestModelType: "naive",
      metrics: {
        modelSelected: "Naive Baseline (Latest Observed Rate)",
        baselineModel: "Naive Baseline",
        mae: 0,
        rmse: 0,
        baselineMae: 0,
        horizonMae: { 1: 0, 2: 0, 3: 0, 4: 0 },
        historyDepth: n,
        isExperimental: true,
        explanation: `Insufficient historical depth (${n} day${n === 1 ? "" : "s"}). Models require at least 5 consecutive observations for reliable backtesting. Defaulting to latest observed benchmark of ₹${lastPrice.toLocaleString("en-IN")}/q.`,
      },
    };
  }

  // Walk-forward backtest setup:
  // Split into train window (minimum 3 days) and test steps.
  // For each test step t from index 3 up to n - 2:
  // Predict 1..min(4, n - 1 - t) days ahead and compare with ground truth.
  interface ModelLoss {
    errors: number[];
    squaredErrors: number[];
    horizonErrors: Record<number, number[]>;
  }

  const naiveLoss: ModelLoss = { errors: [], squaredErrors: [], horizonErrors: { 1: [], 2: [], 3: [], 4: [] } };
  const smaLoss: ModelLoss = { errors: [], squaredErrors: [], horizonErrors: { 1: [], 2: [], 3: [], 4: [] } };
  const holtLoss: ModelLoss = { errors: [], squaredErrors: [], horizonErrors: { 1: [], 2: [], 3: [], 4: [] } };

  const minTrain = Math.min(3, Math.floor(n / 2));

  for (let trainEnd = minTrain; trainEnd < n; trainEnd++) {
    // Training set strictly up to trainEnd (no future data leakage)
    const trainSlice = history.slice(0, trainEnd);
    const lastObs = trainSlice[trainSlice.length - 1].modalPrice;

    // Moving average of last 3 observations
    const smaWindow = Math.min(3, trainSlice.length);
    const smaForecast =
      trainSlice.slice(-smaWindow).reduce((acc, p) => acc + p.modalPrice, 0) / smaWindow;

    // Holt's linear trend on trainSlice
    const { level, trend } = fitHoltParameters(trainSlice.map((p) => p.modalPrice));

    // Test for horizons h = 1..4 where actual ground truth exists
    for (let h = 1; h <= 4; h++) {
      const testIdx = trainEnd + h - 1;
      if (testIdx >= n) break;

      const actual = history[testIdx].modalPrice;

      // Naive prediction: last known price
      const predNaive = lastObs;
      const errNaive = Math.abs(actual - predNaive);
      naiveLoss.errors.push(errNaive);
      naiveLoss.squaredErrors.push(errNaive * errNaive);
      naiveLoss.horizonErrors[h].push(errNaive);

      // SMA prediction
      const predSma = smaForecast;
      const errSma = Math.abs(actual - predSma);
      smaLoss.errors.push(errSma);
      smaLoss.squaredErrors.push(errSma * errSma);
      smaLoss.horizonErrors[h].push(errSma);

      // Holt prediction: L + h*b (damped trend to avoid extreme runaway)
      const predHolt = Math.max(lastObs * 0.5, level + h * trend * 0.85);
      const errHolt = Math.abs(actual - predHolt);
      holtLoss.errors.push(errHolt);
      holtLoss.squaredErrors.push(errHolt * errHolt);
      holtLoss.horizonErrors[h].push(errHolt);
    }
  }

  const computeMae = (loss: ModelLoss) =>
    loss.errors.length > 0 ? loss.errors.reduce((a, b) => a + b, 0) / loss.errors.length : 0;
  const computeRmse = (loss: ModelLoss) =>
    loss.squaredErrors.length > 0
      ? Math.sqrt(loss.squaredErrors.reduce((a, b) => a + b, 0) / loss.squaredErrors.length)
      : 0;

  const naiveMae = Math.round(computeMae(naiveLoss) * 10) / 10;
  const smaMae = Math.round(computeMae(smaLoss) * 10) / 10;
  const holtMae = Math.round(computeMae(holtLoss) * 10) / 10;

  // Select the model with lowest MAE, favoring Naive baseline if differences are negligible (< 2%)
  let selectedModelType: "naive" | "moving_average" | "holt" = "naive";
  let selectedModelName: "Naive Baseline" | "Moving Average" | "Holt's Linear Trend" = "Naive Baseline";
  let selectedLoss = naiveLoss;
  let finalMae = naiveMae;

  if (holtMae < naiveMae * 0.96 && holtMae <= smaMae) {
    selectedModelType = "holt";
    selectedModelName = "Holt's Linear Trend";
    selectedLoss = holtLoss;
    finalMae = holtMae;
  } else if (smaMae < naiveMae * 0.97) {
    selectedModelType = "moving_average";
    selectedModelName = "Moving Average";
    selectedLoss = smaLoss;
    finalMae = smaMae;
  }

  const finalRmse = Math.round(computeRmse(selectedLoss) * 10) / 10;

  const horizonMae: Record<number, number> = {};
  for (let h = 1; h <= 4; h++) {
    const arr = selectedLoss.horizonErrors[h];
    horizonMae[h] =
      arr && arr.length > 0 ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 10) / 10 : finalMae;
  }

  let explanation = "";
  if (selectedModelType === "naive") {
    explanation = `Selected Naive Baseline (MAE: ±₹${finalMae}/q). Agricultural market fluctuations in this window showed random walk behavior where recent price provides the most dependable forecast.`;
  } else if (selectedModelType === "moving_average") {
    explanation = `Selected 3-Day Moving Average (MAE: ±₹${finalMae}/q, outperforms Naive by ₹${Math.round(
      naiveMae - finalMae
    )}/q). Smooths short-term daily arrival volatility.`;
  } else {
    explanation = `Selected Holt's Linear Trend (MAE: ±₹${finalMae}/q, outperforms Naive baseline by ₹${Math.round(
      naiveMae - finalMae
    )}/q). Captured an active directional momentum in recent market arrivals.`;
  }

  return {
    selectedModelName,
    bestModelType: selectedModelType,
    metrics: {
      modelSelected: selectedModelName,
      baselineModel: "Naive Baseline",
      mae: finalMae,
      rmse: finalRmse,
      baselineMae: naiveMae,
      horizonMae,
      historyDepth: n,
      isExperimental: false,
      explanation,
    },
  };
}

/**
 * Fit Holt's Linear Trend parameters (level & trend) with smoothing factors alpha=0.4, beta=0.2
 */
function fitHoltParameters(series: number[]): { level: number; trend: number } {
  if (series.length === 0) return { level: 0, trend: 0 };
  if (series.length === 1) return { level: series[0], trend: 0 };

  const alpha = 0.4;
  const beta = 0.2;

  let level = series[0];
  let trend = series[1] - series[0];

  for (let i = 1; i < series.length; i++) {
    const prevLevel = level;
    level = alpha * series[i] + (1 - alpha) * (prevLevel + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
  }

  return { level, trend };
}

/**
 * Generate 4-Day Forecast (T+1 to T+4) from Historical Series
 */
export function generateMandiPriceForecast(
  commodity: string,
  market: string,
  history: HistoricalDataPoint[]
): MandiForecastResult {
  // Sort chronologically ascending
  const sortedHistory = [...history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const n = sortedHistory.length;
  const latestObs = n > 0 ? sortedHistory[n - 1] : null;

  // Identify T, T-1, T-2 actual days
  const latestActualDay = latestObs;
  const prevDay1 = n >= 2 ? sortedHistory[n - 2] : null;
  const prevDay2 = n >= 3 ? sortedHistory[n - 3] : null;

  // Run Walk-Forward Backtesting
  const { selectedModelName, bestModelType, metrics } = evaluateModelsWalkForward(sortedHistory);

  const forecasts: ForecastDataPoint[] = [];

  if (n === 0 || !latestObs) {
    return {
      commodity,
      market,
      history: [],
      forecasts: [],
      metrics,
      latestActualDay: null,
      prevDay1: null,
      prevDay2: null,
    };
  }

  // Anchor date (Day T) - safe date parsing
  const dateParts = latestObs.date.split("-").map(Number);
  const baseDate =
    dateParts.length === 3
      ? new Date(dateParts[0], dateParts[1] - 1, dateParts[2])
      : new Date(latestObs.date);

  // Model parameters
  const lastPrice = latestObs.modalPrice;
  const { level, trend } = fitHoltParameters(sortedHistory.map((p) => p.modalPrice));
  const smaWindow = Math.min(3, n);
  const smaPrice =
    sortedHistory.slice(-smaWindow).reduce((a, b) => a + b.modalPrice, 0) / smaWindow;

  // Standard error estimate for uncertainty bounds
  const stdError =
    metrics.rmse > 0
      ? metrics.rmse
      : metrics.mae > 0
      ? metrics.mae * 1.25
      : lastPrice * 0.03; // Fallback ~3% variance

  for (let h = 1; h <= 4; h++) {
    const futureDate = new Date(baseDate);
    futureDate.setDate(baseDate.getDate() + h);
    const year = futureDate.getFullYear();
    const month = String(futureDate.getMonth() + 1).padStart(2, "0");
    const day = String(futureDate.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;
    const displayDate = futureDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

    let rawPred = lastPrice;

    if (bestModelType === "holt") {
      // Damped trend: trend decays slightly with horizon
      const decay = Math.pow(0.85, h);
      rawPred = level + h * trend * decay;
    } else if (bestModelType === "moving_average") {
      rawPred = smaPrice;
    } else {
      rawPred = lastPrice;
    }

    // Safety checks: clamp to reasonable floor & ceiling to avoid absurd predictions
    const minHistorical = Math.min(...sortedHistory.map((p) => p.modalPrice));
    const maxHistorical = Math.max(...sortedHistory.map((p) => p.modalPrice));
    const floor = Math.max(200, Math.round(minHistorical * 0.6));
    const ceiling = Math.round(maxHistorical * 1.6);
    const forecastPrice = Math.max(floor, Math.min(ceiling, Math.round(rawPred)));

    // Uncertainty interval widens with horizon: sigma * sqrt(h)
    const margin = Math.round(1.645 * stdError * Math.sqrt(h)); // 90% confidence
    const lowerBound = Math.max(floor, forecastPrice - margin);
    const upperBound = forecastPrice + margin;

    forecasts.push({
      date: dateStr,
      displayDate,
      horizonDays: h,
      forecastPrice,
      lowerBound,
      upperBound,
      isObserved: false,
      modelUsed: selectedModelName,
    });
  }

  return {
    commodity,
    market,
    history: sortedHistory,
    forecasts,
    metrics,
    latestActualDay,
    prevDay1,
    prevDay2,
  };
}
