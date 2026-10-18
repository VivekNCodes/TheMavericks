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
  totalArrivalTonnes?: number;
  totalArrival?: string;
}

/**
 * Raw record format returned by data.gov.in (Resource ID: 9ef84268-d588-465a-a308-a864a43d0070)
 */
export interface GovMandiRecord {
  state?: string;
  district?: string;
  market?: string;
  commodity?: string;
  variety?: string;
  grade?: string;
  arrival_date?: string; // typically "DD/MM/YYYY" or "YYYY-MM-DD"
  min_price?: string | number;
  max_price?: string | number;
  modal_price?: string | number;
  [key: string]: unknown;
}

/**
 * Raw data.gov.in API envelope
 */
export interface GovMandiApiResponse {
  title?: string;
  desc?: string;
  source?: string;
  total?: number;
  count?: number;
  limit?: string | number;
  offset?: string | number;
  records?: GovMandiRecord[];
  status?: string;
  message?: string;
  error?: string;
}

/**
 * Normalized Internal Mandi Price Record
 */
export interface NormalizedMandiRecord {
  id?: string;
  state: string;
  district: string;
  mandiName: string;
  cropName: string;
  variety: string;
  grade: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  priceUnit: string;
  arrivalsTonnes?: number | null;
  trendPercent?: number | null;
  source: string;
  recordDate: string; // ISO date string for display / serialization
  fetchedAt: string; // ISO timestamp when fetched
  recordHash: string; // Deterministic deduplication key
  isStale?: boolean; // True if reporting date is older than 2 days
  daysAgo?: number; // Days since arrival date
}

/**
 * Filter parameters for querying mandi prices
 */
export interface MandiFilterParams {
  state?: string;
  district?: string;
  crop?: string;
  market?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Response payload for Mandi Prices API
 */
export interface MandiApiResponseData {
  records: NormalizedMandiRecord[];
  total: number;
  page: number;
  limit: number;
  availableStates: string[];
  availableDistricts: string[];
  availableCrops: string[];
  availableMarkets: string[];
  statistics: {
    minPrice: number;
    modalPrice: number;
    maxPrice: number;
    highestPriceMarket: string | null;
    totalRecords: number;
    latestReportingDate: string | null;
    dataSource: string;
    isLiveApi: boolean;
    isDatabaseBacked: boolean;
    coverageNotice?: string;
    isAllStatesSelected?: boolean;
    isAllDistrictsSelected?: boolean;
  };
  syncStatus?: {
    lastSyncTime?: string;
    status?: string;
    message?: string;
  };
}

/**
 * Net-Profit Calculation & Market Comparison
 */
export interface MandiComparisonItem {
  mandiId: string;
  mandiName: string;
  district: string;
  state: string;
  cropName: string;
  variety: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
  reportingDate: string;
  isStale: boolean;
  distanceKm: number;
  transportCost: number; // in INR
  additionalCosts: number; // in INR (APMC fee, loading, unloading, cess)
  quantityQuintals: number;
  grossSaleValue: number; // Quantity * modalPrice
  totalCosts: number; // transportCost + additionalCosts
  estimatedNetEarnings: number; // grossSaleValue - totalCosts
  estimatedNetPerQuintal: number; // estimatedNetEarnings / quantity
  rank: number;
  rankBadge: "Best Choice" | "Good Alternative" | "Lower Margin" | "Incomplete Costs";
  rankingExplanation: string;
}

/**
 * Comparison Calculation Input
 */
export interface ProfitCalculationInput {
  cropName: string;
  quantityQuintals: number;
  mandis: Array<{
    mandiName: string;
    district: string;
    state: string;
    modalPrice: number;
    minPrice?: number;
    maxPrice?: number;
    reportingDate?: string;
    distanceKm?: number;
    transportCost?: number;
    additionalCosts?: number;
  }>;
}

// ============================================================================
// Phase 2: Price Forecasting & "Should I Sell or Wait?" Types
// ============================================================================

/**
 * Historical observed data point
 */
export interface HistoricalDataPoint {
  date: string; // ISO date string (YYYY-MM-DD)
  displayDate: string; // e.g. "15 Oct"
  modalPrice: number; // in ₹/Quintal
  minPrice?: number;
  maxPrice?: number;
  isObserved: true;
  dataSource?: string;
}

/**
 * Future forecast data point (Day T+1 to T+4)
 */
export interface ForecastDataPoint {
  date: string; // ISO date string (YYYY-MM-DD)
  displayDate: string; // e.g. "18 Oct (T+1)"
  horizonDays: number; // 1, 2, 3, 4
  forecastPrice: number; // Predicted modal rate in ₹/Quintal
  lowerBound: number; // 90% confidence interval lower bound
  upperBound: number; // 90% confidence interval upper bound
  isObserved: false;
  modelUsed: string;
}

/**
 * Evaluation Metrics from Chronological Walk-Forward Backtesting
 */
export interface ForecastEvaluationMetrics {
  modelSelected: string;
  baselineModel: string;
  mae: number; // Mean Absolute Error on test fold
  rmse: number; // Root Mean Squared Error
  baselineMae: number; // Naive baseline MAE for comparison
  horizonMae: Record<number, number>; // MAE broken down by horizon (1d, 2d, 3d, 4d)
  historyDepth: number; // Total chronological observations available
  isExperimental: boolean; // True if history < 5 observations
  explanation: string;
}

/**
 * Complete 4-Day Mandi Forecast Result
 */
export interface MandiForecastResult {
  commodity: string;
  market: string;
  history: HistoricalDataPoint[];
  forecasts: ForecastDataPoint[];
  metrics: ForecastEvaluationMetrics;
  latestActualDay: HistoricalDataPoint | null;
  prevDay1: HistoricalDataPoint | null; // T-1
  prevDay2: HistoricalDataPoint | null; // T-2
}

/**
 * "Should I Sell Now or Wait?" Inputs
 */
export interface SellOrWaitInput {
  commodity: string;
  market: string;
  quantity: number;
  unit: "quintal" | "kg";
  currentPrice: number; // Today's observed modal price (₹/q)
  currentDate: string;
  selectedHorizonDay: number; // 1, 2, 3, 4 days ahead
  futureForecastPrice: number; // Forecasted price for selected horizon (₹/q)
  futureDate: string;
  storageCostPerQuintalPerDay: number; // in ₹ per quintal per day
  spoilagePercent: number; // e.g. 1.5% estimated shrinkage/decay
  extraTransportCost: number; // e.g. ₹0 or extra freight later
  otherHoldingCosts: number; // insurance, interest on capital, handling
}

/**
 * "Should I Sell Now or Wait?" Decision Output
 */
export interface SellOrWaitResult {
  quantityQuintals: number;
  unit: "quintal" | "kg";
  saleValueToday: number;
  effectiveFutureQuantity: number;
  spoilageLossKg: number;
  futureGrossValue: number;
  storageCostTotal: number;
  holdingCostsTotal: number;
  estimatedNetProceedsWaiting: number;
  netGainLoss: number; // Net Waiting - Sale Today
  netPerQuintal: number;
  recommendation: "Consider waiting" | "Consider selling now" | "Insufficient evidence";
  recommendationReason: string;
  holdingDays: number;
  riskNote: string;
}

/**
 * CSV Upload Parsing Result
 */
export interface CsvParseResult {
  success: boolean;
  records: HistoricalDataPoint[];
  error?: string;
  warnings: string[];
  detectedCommodity?: string;
  detectedMarket?: string;
  dateRange?: { start: string; end: string; totalDays: number };
}
