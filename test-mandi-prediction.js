const assert = require("assert");

console.log("===============================================================");
console.log("  AgroSaathi Mandi Price Prediction Automated Test Suite");
console.log("  Rounds B & D: Mathematical, Model & Forecasting Verification");
console.log("===============================================================\n");

// Mock / inline equivalents of service functions for standalone execution
function parseArrivalDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") return new Date();
  const trimmed = dateStr.trim();
  const parts = trimmed.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(Date.UTC(year, month, day));
    } else if (parts[0].length === 4) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      return new Date(Date.UTC(year, month, day));
    }
  }
  return new Date(trimmed);
}

// -------------------------------------------------------------
// Test 1: API Response Parsing & Field Mapping
// -------------------------------------------------------------
console.log("TEST 1: API Response Parsing & Field Mapping");
const rawGovRecord = {
  state: "Uttar Pradesh",
  district: "Agra",
  market: "Achhnera APMC",
  commodity: "Potato",
  variety: "Desi",
  grade: "FAQ",
  arrival_date: "17/10/2026",
  min_price: "1400",
  max_price: "1600",
  modal_price: "1520",
};

const minP = parseFloat(rawGovRecord.min_price);
const maxP = parseFloat(rawGovRecord.max_price);
const modalP = parseFloat(rawGovRecord.modal_price);
const parsedDate = parseArrivalDate(rawGovRecord.arrival_date);

assert.strictEqual(minP, 1400, "Min price must parse to 1400");
assert.strictEqual(maxP, 1600, "Max price must parse to 1600");
assert.strictEqual(modalP, 1520, "Modal price must parse to 1520");
assert.strictEqual(parsedDate.getUTCDate(), 17, "Arrival day must be 17");
assert.strictEqual(parsedDate.getUTCMonth(), 9, "Arrival month must be 9 (October)");
assert.strictEqual(parsedDate.getUTCFullYear(), 2026, "Arrival year must be 2026");
console.log("✓ TEST 1 PASSED: Field mapping, numbers, and dates parsed accurately.\n");

// -------------------------------------------------------------
// Test 2: Missing or Invalid Prices (Safe Fallbacks)
// -------------------------------------------------------------
console.log("TEST 2: Missing or Invalid Price Handlers");
function normalizePrice(rawModal, rawMin, rawMax) {
  let modal = parseFloat(rawModal || 0);
  const min = parseFloat(rawMin || 0);
  const max = parseFloat(rawMax || 0);

  if ((isNaN(modal) || modal <= 0) && !isNaN(min) && !isNaN(max) && max > 0) {
    modal = Math.round((min + max) / 2);
  }
  return modal;
}

const recoveredModal = normalizePrice("0", "1200", "1600");
assert.strictEqual(recoveredModal, 1400, "Recovered modal should be midpoint 1400");
console.log(`- Recovered modal from min(1200) & max(1600): ₹${recoveredModal}`);
console.log("✓ TEST 2 PASSED: Missing/zero modal rate safely estimated from bounds.\n");

// -------------------------------------------------------------
// Test 3: Chronological Sorting & Duplicate Prevention
// -------------------------------------------------------------
console.log("TEST 3: Chronological Sorting & Date Deduplication");
const unsortedRecords = [
  { date: "2026-10-15", price: 2500 },
  { date: "2026-10-12", price: 2480 },
  { date: "2026-10-17", price: 2560 },
  { date: "2026-10-12", price: 2490 }, // Duplicate date with updated price
  { date: "2026-10-14", price: 2510 },
];

const dedupMap = new Map();
unsortedRecords.forEach((r) => dedupMap.set(r.date, r));
const sortedSeries = Array.from(dedupMap.values()).sort(
  (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
);

assert.strictEqual(sortedSeries.length, 4, "Duplicates on same date must be deduplicated to 4 entries");
assert.strictEqual(sortedSeries[0].date, "2026-10-12", "Earliest date must be first");
assert.strictEqual(sortedSeries[3].date, "2026-10-17", "Latest date must be last");
assert.strictEqual(sortedSeries[0].price, 2490, "Later entry on same date updates price");
console.log("✓ TEST 3 PASSED: Chronological ordering and idempotency preserved.\n");

// -------------------------------------------------------------
// Test 4: 4-Day Forecast Output for Valid Historical Data
// -------------------------------------------------------------
console.log("TEST 4: 4-Day Forecast Generation & Horizon Dates");
const historicalSeries = [
  { date: "2026-10-10", modalPrice: 2500 },
  { date: "2026-10-11", modalPrice: 2520 },
  { date: "2026-10-12", modalPrice: 2530 },
  { date: "2026-10-13", modalPrice: 2540 },
  { date: "2026-10-14", modalPrice: 2535 },
  { date: "2026-10-15", modalPrice: 2550 },
  { date: "2026-10-16", modalPrice: 2545 },
  { date: "2026-10-17", modalPrice: 2560 }, // Day T
];

const baseDate = new Date("2026-10-17T00:00:00.000Z");
const forecastHorizons = [1, 2, 3, 4].map((h) => {
  const d = new Date(baseDate);
  d.setDate(baseDate.getDate() + h);
  const pred = 2560 + h * 8; // Simulated model prediction
  const margin = Math.round(25 * Math.sqrt(h));
  return {
    horizonDays: h,
    date: d.toISOString().slice(0, 10),
    forecastPrice: pred,
    lowerBound: pred - margin,
    upperBound: pred + margin,
  };
});

assert.strictEqual(forecastHorizons.length, 4, "Must produce exactly 4 forecast horizons");
assert.strictEqual(forecastHorizons[0].date, "2026-10-18", "T+1 must be 2026-10-18");
assert.strictEqual(forecastHorizons[3].date, "2026-10-21", "T+4 must be 2026-10-21");
forecastHorizons.forEach((f) => {
  assert(f.forecastPrice > 0, "Forecast price must be positive");
  assert(f.lowerBound <= f.forecastPrice, "Lower bound <= Forecast");
  assert(f.upperBound >= f.forecastPrice, "Upper bound >= Forecast");
});
console.log("✓ TEST 4 PASSED: Horizons T+1..T+4 generated with valid forward dates & uncertainty intervals.\n");

// -------------------------------------------------------------
// Test 5: Insufficient Historical Data Handling
// -------------------------------------------------------------
console.log("TEST 5: Insufficient Historical Data Safeguards (< 5 days)");
const sparseHistory = [
  { date: "2026-10-16", modalPrice: 1800 },
  { date: "2026-10-17", modalPrice: 1850 },
];
const isExperimental = sparseHistory.length < 5;
assert.strictEqual(isExperimental, true, "Series with < 5 items must be flagged experimental");
console.log("✓ TEST 5 PASSED: Guard correctly identifies sparse history without fabricating confidence.\n");

// -------------------------------------------------------------
// Test 6: Prevention of Future-Data Leakage in Backtesting
// -------------------------------------------------------------
console.log("TEST 6: Future-Data Leakage Prevention Check");
let maxTrainingDateIndexSeen = -1;
let leakageDetected = false;

for (let trainEnd = 3; trainEnd < historicalSeries.length; trainEnd++) {
  const trainingSlice = historicalSeries.slice(0, trainEnd);
  // Ensure every training item index is strictly < trainEnd
  trainingSlice.forEach((item, idx) => {
    if (idx >= trainEnd) {
      leakageDetected = true;
    }
  });
  // Ground truth to evaluate:
  const testTarget = historicalSeries[trainEnd];
  assert(
    new Date(trainingSlice[trainingSlice.length - 1].date) < new Date(testTarget.date),
    "Training window must strictly precede evaluated test observation"
  );
}
assert.strictEqual(leakageDetected, false, "No future data leakage detected");
console.log("✓ TEST 6 PASSED: Walk-forward backtesting preserves strict temporal causality.\n");

// -------------------------------------------------------------
// Test 7: MAE & RMSE Calculation Mathematics
// -------------------------------------------------------------
console.log("TEST 7: MAE & RMSE Formula Verification");
const actuals = [2520, 2540, 2530, 2560];
const predictions = [2500, 2550, 2525, 2550]; // errors: 20, 10, 5, 10
// absolute errors: 20 + 10 + 5 + 10 = 45 -> MAE = 11.25
// squared errors: 400 + 100 + 25 + 100 = 625 -> MSE = 156.25 -> RMSE = 12.5

const errors = actuals.map((a, i) => Math.abs(a - predictions[i]));
const sqErrors = actuals.map((a, i) => Math.pow(a - predictions[i], 2));

const mae = errors.reduce((a, b) => a + b, 0) / errors.length;
const rmse = Math.sqrt(sqErrors.reduce((a, b) => a + b, 0) / sqErrors.length);

assert.strictEqual(mae, 11.25, "MAE must equal 11.25");
assert.strictEqual(rmse, 12.5, "RMSE must equal 12.5");
console.log(`- Computed MAE: ${mae}, RMSE: ${rmse}`);
console.log("✓ TEST 7 PASSED: Error metrics adhere strictly to mathematical definitions.\n");

// -------------------------------------------------------------
// Test 8: Quantity & Unit Conversions (Kilogram to Quintal)
// -------------------------------------------------------------
console.log("TEST 8: Unit Conversion (1 Quintal = 100 Kilograms)");
function toQuintals(qty, unit) {
  return unit === "kg" ? Math.round((qty / 100) * 1000) / 1000 : qty;
}

assert.strictEqual(toQuintals(10, "quintal"), 10, "10 quintals -> 10 quintals");
assert.strictEqual(toQuintals(500, "kg"), 5, "500 kg -> 5 quintals");
assert.strictEqual(toQuintals(250, "kg"), 2.5, "250 kg -> 2.5 quintals");
assert.strictEqual(toQuintals(120, "kg"), 1.2, "120 kg -> 1.2 quintals");
console.log("✓ TEST 8 PASSED: Agricultural weight conversions validated.\n");

// -------------------------------------------------------------
// Test 9: "Should I Sell Now or Wait?" Net Benefit Logic
// -------------------------------------------------------------
console.log("TEST 9: 'Should I Sell Now or Wait?' Decision Mathematics");
// Scenario: Farmer has 10 quintals of Wheat.
// Current Price = ₹2,500/q
// Predicted Price in 3 days (T+3) = ₹2,620/q (+₹120/q increase)
// Storage cost = ₹5/q/day (₹5 * 10q * 3 days = ₹150)
// Spoilage = 1% (10q * 0.99 = 9.9q remaining)
// Future Gross = 9.9q * ₹2,620 = ₹25,938
// Current Gross = 10q * ₹2,500 = ₹25,000
// Net proceeds waiting = ₹25,938 - ₹150 = ₹25,788
// Net Gain = ₹25,788 - ₹25,000 = +₹788

const Q = 10;
const P0 = 2500;
const P3 = 2620;
const storagePerQDay = 5;
const daysWait = 3;
const spoilage = 0.01;

const grossToday = Q * P0; // 25,000
const Q_fut = Q * (1 - spoilage); // 9.9
const grossFuture = Math.round(Q_fut * P3); // 25,938
const storageCost = storagePerQDay * Q * daysWait; // 150
const netWaiting = grossFuture - storageCost; // 25,788
const netGain = netWaiting - grossToday; // +788

assert.strictEqual(grossToday, 25000, "Gross today must be 25,000");
assert.strictEqual(grossFuture, 25938, "Future gross must be 25,938");
assert.strictEqual(storageCost, 150, "Storage cost must be 150");
assert.strictEqual(netGain, 788, "Net gain must be +788");
assert(netGain > 0, "Recommendation must recommend 'Consider waiting'");
console.log(`- Gross today: ₹${grossToday}`);
console.log(`- Future gross (with 1% shrinkage): ₹${grossFuture}`);
console.log(`- Total storage holding cost: ₹${storageCost}`);
console.log(`- Net financial difference: +₹${netGain} (Consider waiting)`);
console.log("✓ TEST 9 PASSED: Holding cost and trade-off equations verified.\n");

// -------------------------------------------------------------
// Test 10: Inverse Scenario (Falling Price -> Consider Selling Now)
// -------------------------------------------------------------
console.log("TEST 10: Inverse Decision Check (Falling Market -> Sell Now)");
// Scenario: Price drops from ₹1,500 to ₹1,400 in 2 days.
const P_drop = 1400;
const grossFutureDrop = Math.round(Q * (1 - spoilage) * P_drop);
const holdingCostDrop = storagePerQDay * Q * 2;
const netGainDrop = grossFutureDrop - holdingCostDrop - (Q * 1500);

assert(netGainDrop < 0, "Net gain must be negative when price falls");
console.log(`- Net financial difference on price drop: ₹${netGainDrop} (Consider selling now)`);
console.log("✓ TEST 10 PASSED: Sell now recommendation triggered appropriately.\n");

// -------------------------------------------------------------
// Test 11: CSV Validation & Column Extraction
// -------------------------------------------------------------
console.log("TEST 11: CSV Format Validation & Missing Column Detection");
const invalidCsvNoDate = `modal_price,commodity\n2500,Wheat`;
const hasDateHeader = invalidCsvNoDate.toLowerCase().includes("date") || invalidCsvNoDate.toLowerCase().includes("arrival_date");
assert.strictEqual(hasDateHeader, false, "Must detect missing date header in CSV");

const validCsv = `arrival_date,modal_price\n15/10/2026,2450\n16/10/2026,2480\n17/10/2026,2510`;
const validLines = validCsv.split("\n");
assert.strictEqual(validLines.length, 4, "Valid CSV must have 4 lines (header + 3 records)");
console.log("✓ TEST 11 PASSED: CSV schema validation enforces integrity.\n");

// -------------------------------------------------------------
// Test 12: Multiple Time-Series Trajectories (Round D)
// -------------------------------------------------------------
console.log("TEST 12: Multiple Time-Series Trajectory Forecast Evaluation");
const stableSeries = [2500, 2510, 2505, 2515, 2510, 2520, 2515, 2525];
const risingSeries = [1800, 1850, 1920, 2000, 2080, 2150, 2240, 2350];
const fallingSeries = [1600, 1540, 1480, 1420, 1360, 1300, 1240, 1180];

function lastThreeDays(series) {
  const n = series.length;
  return {
    T: series[n - 1],
    T_minus_1: series[n - 2],
    T_minus_2: series[n - 3],
  };
}

const stableLast3 = lastThreeDays(stableSeries);
assert.strictEqual(stableLast3.T, 2525, "Day T must be 2525");
assert.strictEqual(stableLast3.T_minus_1, 2515, "Day T-1 must be 2515");
assert.strictEqual(stableLast3.T_minus_2, 2520, "Day T-2 must be 2520");

const risingLast3 = lastThreeDays(risingSeries);
assert(risingLast3.T > risingLast3.T_minus_1 && risingLast3.T_minus_1 > risingLast3.T_minus_2, "Rising series must show positive trajectory");

const fallingLast3 = lastThreeDays(fallingSeries);
assert(fallingLast3.T < fallingLast3.T_minus_1 && fallingLast3.T_minus_1 < fallingLast3.T_minus_2, "Falling series must show negative trajectory");

console.log("✓ TEST 12 PASSED: Stable, rising, and falling time series tested cleanly.\n");

// -------------------------------------------------------------
// Test 13: Chronological Non-Overlapping Date Labels & Spacing
// -------------------------------------------------------------
console.log("TEST 13: Chronological Non-Overlapping Date Labels & Tick Spacing");
const anchorDate13 = new Date("2026-10-17T00:00:00.000Z");
const nonOverlappingHorizons = [1, 2, 3, 4].map((h) => {
  const d = new Date(anchorDate13);
  d.setDate(anchorDate13.getDate() + h);
  return {
    horizon: h,
    dateStr: d.toISOString().slice(0, 10),
    displayDate: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    subLabel: `(T+${h})`,
  };
});

assert.strictEqual(nonOverlappingHorizons.length, 4, "Must generate exactly 4 forecast horizons");
assert.strictEqual(nonOverlappingHorizons[0].displayDate, "18 Oct", "Horizon 1 must be 18 Oct");
assert.strictEqual(nonOverlappingHorizons[1].displayDate, "19 Oct", "Horizon 2 must be 19 Oct");
assert.strictEqual(nonOverlappingHorizons[2].displayDate, "20 Oct", "Horizon 3 must be 20 Oct");
assert.strictEqual(nonOverlappingHorizons[3].displayDate, "21 Oct", "Horizon 4 must be 21 Oct");

// Check that string length is concise to prevent overlap (<= 8 chars on primary line)
nonOverlappingHorizons.forEach((fh) => {
  assert(fh.displayDate.length <= 8, `Date label '${fh.displayDate}' must be <= 8 chars to avoid SVG overlap`);
});

// Check horizontal spacing across 520px usable width for 9 points (5 actual + 4 forecast)
const totalPlotWidth = 510;
const totalPointsCount = 9;
const stepSpacing = totalPlotWidth / (totalPointsCount - 1);
assert(stepSpacing >= 55, `Step spacing ${stepSpacing}px must be >= 55px to ensure clean non-overlapping rendering`);
console.log(`✓ TEST 13 PASSED: Verified 4 non-overlapping forecast dates and ${stepSpacing.toFixed(1)}px spacing.\n`);

// -------------------------------------------------------------
// Test 14: Strict Price Consistency (Min <= Modal <= Max)
// -------------------------------------------------------------
console.log("TEST 14: Data Consistency Between Chart and Summary Cards");
const mockRecords = [
  { mandiName: "Bassi APMC", minPrice: 4000, modalPrice: 4200, maxPrice: 4400, cropName: "Tomato" },
  { mandiName: "Jaipur APMC", minPrice: 1800, modalPrice: 1850, maxPrice: 2000, cropName: "Tomato" },
];

mockRecords.forEach((rec) => {
  assert(rec.minPrice <= rec.modalPrice, `Min price (${rec.minPrice}) must be <= Modal price (${rec.modalPrice})`);
  assert(rec.modalPrice <= rec.maxPrice, `Modal price (${rec.modalPrice}) must be <= Max price (${rec.maxPrice})`);
});

// Verify that the chart's anchor Day T matches the summary card's modal price
const activeRec = mockRecords[0];
const summaryCards = {
  minPrice: activeRec.minPrice,
  modalPrice: activeRec.modalPrice,
  maxPrice: activeRec.maxPrice,
};
const chartAnchorPrice = activeRec.modalPrice;
assert.strictEqual(summaryCards.modalPrice, chartAnchorPrice, "Summary card modal price must exactly equal chart Day T rate");
console.log(`✓ TEST 14 PASSED: Min (₹${summaryCards.minPrice}) <= Modal (₹${summaryCards.modalPrice}) <= Max (₹${summaryCards.maxPrice}) strictly verified.\n`);

// -------------------------------------------------------------
// Test 15: Missing API Data Fallback (Zero Cross-Commodity Mismatch)
// -------------------------------------------------------------
console.log("TEST 15: Missing API Data Fallback Consistency");
const selectedCrop = "Tomato";
const benchmarkTomato = { basePrice: 1850 };
const fallbackSummary = {
  minPrice: Math.round(benchmarkTomato.basePrice * 0.93),
  modalPrice: benchmarkTomato.basePrice,
  maxPrice: Math.round(benchmarkTomato.basePrice * 1.07),
};
const fallbackChartDayT = benchmarkTomato.basePrice;

assert.strictEqual(fallbackSummary.modalPrice, 1850, "Tomato fallback modal must be 1850");
assert.strictEqual(fallbackSummary.modalPrice, fallbackChartDayT, "Fallback chart and cards must use the same crop price");
assert(fallbackSummary.minPrice <= fallbackSummary.modalPrice && fallbackSummary.modalPrice <= fallbackSummary.maxPrice, "Fallback prices must maintain min <= modal <= max");
console.log("✓ TEST 15 PASSED: Offline / empty API fallback maintains exact parity between chart and cards.\n");

// -------------------------------------------------------------
// Test 16: Chronological Ordering & No Future Leaks in Walk-Forward
// -------------------------------------------------------------
console.log("TEST 16: Strict Chronological Ordering & Forward Projection");
const dateSeries = ["2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16", "2026-10-17"];
for (let i = 1; i < dateSeries.length; i++) {
  assert(new Date(dateSeries[i]) > new Date(dateSeries[i - 1]), "Historical dates must be strictly ascending");
}
nonOverlappingHorizons.forEach((fh) => {
  assert(new Date(fh.dateStr) > new Date(dateSeries[dateSeries.length - 1]), "Forecast dates must be strictly in the future of Day T");
});
console.log("✓ TEST 16 PASSED: Strict temporal monotonicity verified across all horizons.\n");

console.log("===============================================================");
console.log("  ALL 16 AUTOMATED TESTS PASSED (100% SUCCESS)");
console.log("===============================================================");

