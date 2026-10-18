import {
  GovMandiApiResponse,
  GovMandiRecord,
  NormalizedMandiRecord,
  MandiFilterParams,
} from "../types";
import { isAllStates, isAllDistricts } from "./location-data";

const DATA_GOV_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070";
const DATA_GOV_BASE_URL = `https://api.data.gov.in/resource/${DATA_GOV_RESOURCE_ID}`;

// In-memory cache for API queries (5 minutes TTL)
interface CacheEntry {
  data: NormalizedMandiRecord[];
  total: number;
  timestamp: number;
}
const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a deterministic hash for idempotent deduplication.
 * Matches: State + District + Mandi + Commodity + Variety + Grade + Arrival Date
 */
export function generateRecordHash(record: {
  state: string;
  district: string;
  mandiName: string;
  cropName: string;
  variety?: string;
  grade?: string;
  recordDate: string | Date;
}): string {
  const dateStr =
    record.recordDate instanceof Date
      ? record.recordDate.toISOString().slice(0, 10)
      : String(record.recordDate).slice(0, 10);

  const key = [
    (record.state || "").trim().toLowerCase(),
    (record.district || "").trim().toLowerCase(),
    (record.mandiName || "").trim().toLowerCase(),
    (record.cropName || "").trim().toLowerCase(),
    (record.variety || "default").trim().toLowerCase(),
    (record.grade || "default").trim().toLowerCase(),
    dateStr,
  ].join("::");

  // Simple string hash for compact storage
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    const char = key.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `mandi_${Math.abs(hash).toString(36)}_${key.replace(/[^a-z0-9]/g, "").slice(0, 24)}`;
}

/**
 * Parse arrival date from Gov format (DD/MM/YYYY or YYYY-MM-DD) safely into a valid UTC Date
 */
export function parseArrivalDate(dateStr?: string): Date {
  if (!dateStr || typeof dateStr !== "string") {
    return new Date();
  }

  const trimmed = dateStr.trim();
  // Check DD/MM/YYYY
  const parts = trimmed.split(/[/.-]/);
  if (parts.length === 3) {
    if (parts[2].length === 4) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(Date.UTC(year, month, day));
      }
    } else if (parts[0].length === 4) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(Date.UTC(year, month, day));
      }
    }
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Normalize raw government record into internal structure
 */
export function normalizeGovRecord(raw: GovMandiRecord, fetchTime = new Date()): NormalizedMandiRecord | null {
  const state = String(raw.state || "").trim();
  const district = String(raw.district || "").trim();
  const mandiName = String(raw.market || raw.mandiName || "").trim();
  const cropName = String(raw.commodity || raw.cropName || "").trim();
  const variety = String(raw.variety || "Other").trim();
  const grade = String(raw.grade || "FAQ").trim();

  // Validate core identifiers
  if (!state || !district || !mandiName || !cropName) {
    return null;
  }

  const rawMin = parseFloat(String(raw.min_price || 0));
  const rawMax = parseFloat(String(raw.max_price || 0));
  let rawModal = parseFloat(String(raw.modal_price || 0));

  // If modal is 0 or NaN but min and max exist, estimate modal as midpoint
  if ((isNaN(rawModal) || rawModal <= 0) && !isNaN(rawMin) && !isNaN(rawMax) && rawMax > 0) {
    rawModal = Math.round((rawMin + rawMax) / 2);
  }

  if (isNaN(rawModal) || rawModal <= 0) {
    return null; // Skip invalid or zero price records
  }

  const minPrice = isNaN(rawMin) || rawMin <= 0 ? rawModal : rawMin;
  const maxPrice = isNaN(rawMax) || rawMax <= 0 ? rawModal : rawMax;

  const dateObj = parseArrivalDate(raw.arrival_date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - dateObj.getTime());
  const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const isStale = daysAgo > 2;

  const recordHash = generateRecordHash({
    state,
    district,
    mandiName,
    cropName,
    variety,
    grade,
    recordDate: dateObj,
  });

  return {
    state,
    district,
    mandiName,
    cropName,
    variety,
    grade,
    minPrice: Math.round(minPrice),
    maxPrice: Math.round(maxPrice),
    modalPrice: Math.round(rawModal),
    priceUnit: "INR/Quintal",
    source: "Agmarknet (data.gov.in)",
    recordDate: dateObj.toISOString(),
    fetchedAt: fetchTime.toISOString(),
    recordHash,
    isStale,
    daysAgo,
  };
}

/**
 * Fetch records from data.gov.in API with filters and pagination
 */
export async function fetchFromDataGovIn(params: MandiFilterParams = {}): Promise<{
  records: NormalizedMandiRecord[];
  total: number;
  isLiveApi: boolean;
  message?: string;
}> {
  const apiKey = process.env.DATA_GOV_IN_API_KEY;

  if (!apiKey || apiKey.trim() === "") {
    return {
      records: [],
      total: 0,
      isLiveApi: false,
      message: "DATA_GOV_IN_API_KEY is not configured in environment.",
    };
  }

  const limit = Math.min(params.limit || 100, 500);
  const offset = params.offset || 0;

  // Build query URL
  const queryParams = new URLSearchParams();
  queryParams.append("api-key", apiKey.trim());
  queryParams.append("format", "json");
  queryParams.append("offset", String(offset));
  queryParams.append("limit", String(limit));

  if (params.state && !isAllStates(params.state)) {
    queryParams.append("filters[state]", params.state.trim());
  }
  if (params.district && !isAllDistricts(params.district)) {
    queryParams.append("filters[district]", params.district.trim());
  }
  if (
    params.crop &&
    params.crop.trim() !== "" &&
    params.crop.toLowerCase() !== "all" &&
    params.crop.toLowerCase() !== "all crops" &&
    params.crop.toLowerCase() !== "all commodities"
  ) {
    queryParams.append("filters[commodity]", params.crop.trim());
  }
  if (
    params.market &&
    params.market.trim() !== "" &&
    params.market.toLowerCase() !== "all" &&
    params.market.toLowerCase() !== "all mandis" &&
    params.market.toLowerCase() !== "all markets"
  ) {
    queryParams.append("filters[market]", params.market.trim());
  }

  const cacheKey = queryParams.toString();
  const cached = apiCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return {
      records: cached.data,
      total: cached.total,
      isLiveApi: true,
      message: "Served from secure server memory cache",
    };
  }

  const url = `${DATA_GOV_BASE_URL}?${queryParams.toString()}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "AgroSaathi-KrishiSetu/1.0",
      },
      signal: controller.signal,
      next: { revalidate: 300 }, // Next.js cache 5 mins
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 400) {
        return {
          records: [],
          total: 0,
          isLiveApi: false,
          message: "data.gov.in returned 400 Bad Request. Check API key validity.",
        };
      }
      if (response.status === 403 || response.status === 401) {
        return {
          records: [],
          total: 0,
          isLiveApi: false,
          message: "data.gov.in authorization failed. Check DATA_GOV_IN_API_KEY.",
        };
      }
      if (response.status === 429) {
        return {
          records: [],
          total: 0,
          isLiveApi: false,
          message: "data.gov.in rate limit exceeded. Please retry in a few moments.",
        };
      }
      throw new Error(`Upstream error ${response.status}: ${response.statusText}`);
    }

    const json: GovMandiApiResponse = await response.json();
    const rawRecords = json.records || [];
    const fetchTime = new Date();

    const normalizedList: NormalizedMandiRecord[] = [];
    for (const raw of rawRecords) {
      const norm = normalizeGovRecord(raw, fetchTime);
      if (norm) {
        normalizedList.push(norm);
      }
    }

    const totalCount = typeof json.total === "number" ? json.total : normalizedList.length;

    // Cache results
    apiCache.set(cacheKey, {
      data: normalizedList,
      total: totalCount,
      timestamp: Date.now(),
    });

    return {
      records: normalizedList,
      total: totalCount,
      isLiveApi: true,
      message: `Retrieved ${normalizedList.length} genuine records from data.gov.in`,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("fetchFromDataGovIn error:", errorMsg);
    return {
      records: [],
      total: 0,
      isLiveApi: false,
      message: `Upstream government API request failed: ${errorMsg}`,
    };
  }
}
