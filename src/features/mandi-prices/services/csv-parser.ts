import { HistoricalDataPoint, CsvParseResult } from "../types";
import { parseArrivalDate } from "./mandi-api";

/**
 * Validates and parses a CSV text of historical mandi prices into chronological data points.
 *
 * Supported header variants:
 * - date / arrival_date / Date / Arrival_Date
 * - modal_price / modal / price / Modal_Price / Modal Price
 * - min_price / min / Min_Price
 * - max_price / max / Max_Price
 * - commodity / Commodity / crop
 * - market / Market / mandi
 */
export function parseHistoricalMandiCsv(csvText: string): CsvParseResult {
  const warnings: string[] = [];

  if (!csvText || typeof csvText !== "string" || csvText.trim().length === 0) {
    return {
      success: false,
      records: [],
      error: "CSV content is empty. Please provide comma-separated rows with headers.",
      warnings: [],
    };
  }

  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return {
      success: false,
      records: [],
      error: "CSV must contain a header row and at least one data row.",
      warnings: [],
    };
  }

  // Parse header
  const headerTokens = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^["']|["']$/g, "").toLowerCase());

  let dateColIdx = -1;
  let modalColIdx = -1;
  let minColIdx = -1;
  let maxColIdx = -1;
  let commodityColIdx = -1;
  let marketColIdx = -1;

  for (let i = 0; i < headerTokens.length; i++) {
    const col = headerTokens[i];
    if (col === "arrival_date" || col === "date" || col === "record_date") {
      dateColIdx = i;
    } else if (
      col === "modal_price" ||
      col === "modal" ||
      col === "price" ||
      col === "modal rate"
    ) {
      modalColIdx = i;
    } else if (col === "min_price" || col === "min") {
      minColIdx = i;
    } else if (col === "max_price" || col === "max") {
      maxColIdx = i;
    } else if (col === "commodity" || col === "crop" || col === "crop_name") {
      commodityColIdx = i;
    } else if (col === "market" || col === "mandi" || col === "mandi_name") {
      marketColIdx = i;
    }
  }

  if (dateColIdx === -1) {
    return {
      success: false,
      records: [],
      error: `Missing required 'arrival_date' (or 'date') column. Found headers: [${headerTokens.join(
        ", "
      )}].`,
      warnings,
    };
  }

  if (modalColIdx === -1) {
    return {
      success: false,
      records: [],
      error: `Missing required 'modal_price' (or 'price') column. Found headers: [${headerTokens.join(
        ", "
      )}].`,
      warnings,
    };
  }

  const dateMap = new Map<string, HistoricalDataPoint>();
  let detectedCommodity: string | undefined;
  let detectedMarket: string | undefined;

  for (let r = 1; r < lines.length; r++) {
    const line = lines[r];
    // Split by comma ignoring commas inside quotes
    const cells = line
      .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
      .map((c) => c.trim().replace(/^["']|["']$/g, ""));

    if (cells.length <= Math.max(dateColIdx, modalColIdx)) {
      warnings.push(`Row ${r + 1}: Skipped row with insufficient columns.`);
      continue;
    }

    const rawDateStr = cells[dateColIdx];
    const rawModalStr = cells[modalColIdx].replace(/[₹,Rs.]/g, "").trim();

    const parsedDate = parseArrivalDate(rawDateStr);
    if (isNaN(parsedDate.getTime())) {
      warnings.push(`Row ${r + 1}: Invalid date format "${rawDateStr}".`);
      continue;
    }

    const modalPrice = parseFloat(rawModalStr);
    if (isNaN(modalPrice) || modalPrice <= 0) {
      warnings.push(`Row ${r + 1}: Invalid modal price "${rawModalStr}". Must be positive number.`);
      continue;
    }

    let minPrice: number | undefined;
    if (minColIdx !== -1 && cells[minColIdx]) {
      const p = parseFloat(cells[minColIdx].replace(/[₹,Rs.]/g, ""));
      if (!isNaN(p) && p > 0) minPrice = p;
    }

    let maxPrice: number | undefined;
    if (maxColIdx !== -1 && cells[maxColIdx]) {
      const p = parseFloat(cells[maxColIdx].replace(/[₹,Rs.]/g, ""));
      if (!isNaN(p) && p > 0) maxPrice = p;
    }

    if (commodityColIdx !== -1 && cells[commodityColIdx] && !detectedCommodity) {
      detectedCommodity = cells[commodityColIdx];
    }
    if (marketColIdx !== -1 && cells[marketColIdx] && !detectedMarket) {
      detectedMarket = cells[marketColIdx];
    }

    const dateKey = parsedDate.toISOString().slice(0, 10);
    const displayDate = parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });

    // If duplicate date exists, keep latest row
    dateMap.set(dateKey, {
      date: dateKey,
      displayDate,
      modalPrice: Math.round(modalPrice),
      minPrice: minPrice ? Math.round(minPrice) : Math.round(modalPrice * 0.95),
      maxPrice: maxPrice ? Math.round(maxPrice) : Math.round(modalPrice * 1.05),
      isObserved: true,
      dataSource: "User CSV Upload",
    });
  }

  const records = Array.from(dateMap.values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (records.length === 0) {
    return {
      success: false,
      records: [],
      error: "No valid historical records could be parsed from the CSV file.",
      warnings,
    };
  }

  const dateRange = {
    start: records[0].date,
    end: records[records.length - 1].date,
    totalDays: records.length,
  };

  return {
    success: true,
    records,
    warnings,
    detectedCommodity,
    detectedMarket,
    dateRange,
  };
}

/**
 * Pre-built CSV template for testing different time-series conditions:
 * 1. Stable trend (balanced market)
 * 2. Rising trend (pre-festival / tightening arrivals)
 * 3. Falling trend (peak harvest glut)
 * 4. Sparse dates (missing calendar days)
 */
export const SAMPLE_HISTORICAL_SCENARIOS = {
  stable: `arrival_date,modal_price,min_price,max_price,commodity,market
2026-10-08,2520,2450,2580,Wheat,Agra Mandi
2026-10-09,2500,2420,2560,Wheat,Agra Mandi
2026-10-10,2510,2440,2570,Wheat,Agra Mandi
2026-10-11,2530,2460,2590,Wheat,Agra Mandi
2026-10-12,2525,2450,2580,Wheat,Agra Mandi
2026-10-13,2540,2470,2600,Wheat,Agra Mandi
2026-10-14,2535,2460,2590,Wheat,Agra Mandi
2026-10-15,2550,2480,2610,Wheat,Agra Mandi
2026-10-16,2545,2470,2600,Wheat,Agra Mandi
2026-10-17,2560,2490,2620,Wheat,Agra Mandi`,

  rising: `arrival_date,modal_price,min_price,max_price,commodity,market
2026-10-08,1850,1780,1920,Tomato,Jaipur Mandi
2026-10-09,1900,1820,1980,Tomato,Jaipur Mandi
2026-10-10,1980,1900,2050,Tomato,Jaipur Mandi
2026-10-11,2050,1970,2120,Tomato,Jaipur Mandi
2026-10-12,2120,2040,2200,Tomato,Jaipur Mandi
2026-10-13,2200,2110,2280,Tomato,Jaipur Mandi
2026-10-14,2280,2190,2360,Tomato,Jaipur Mandi
2026-10-15,2360,2270,2440,Tomato,Jaipur Mandi
2026-10-16,2450,2350,2530,Tomato,Jaipur Mandi
2026-10-17,2550,2450,2640,Tomato,Jaipur Mandi`,

  falling: `arrival_date,modal_price,min_price,max_price,commodity,market
2026-10-08,1680,1600,1750,Potato,Farukhabad Mandi
2026-10-09,1620,1540,1700,Potato,Farukhabad Mandi
2026-10-10,1560,1490,1630,Potato,Farukhabad Mandi
2026-10-11,1510,1440,1580,Potato,Farukhabad Mandi
2026-10-12,1450,1380,1520,Potato,Farukhabad Mandi
2026-10-13,1390,1320,1460,Potato,Farukhabad Mandi
2026-10-14,1330,1260,1400,Potato,Farukhabad Mandi
2026-10-15,1270,1200,1340,Potato,Farukhabad Mandi
2026-10-16,1200,1130,1270,Potato,Farukhabad Mandi
2026-10-17,1140,1070,1210,Potato,Farukhabad Mandi`,

  sparse: `arrival_date,modal_price,min_price,max_price,commodity,market
2026-10-05,5350,5200,5500,Mustard,Alwar Mandi
2026-10-08,5420,5280,5560,Mustard,Alwar Mandi
2026-10-12,5480,5340,5620,Mustard,Alwar Mandi
2026-10-17,5550,5400,5700,Mustard,Alwar Mandi`,
};
