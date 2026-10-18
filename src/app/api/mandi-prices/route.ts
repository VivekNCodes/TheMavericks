import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { fetchFromDataGovIn } from "@/features/mandi-prices/services/mandi-api";
import { getReferenceRecords } from "@/features/mandi-prices/services/reference-records";
import {
  AUTHORITATIVE_INDIAN_STATES_AND_UTS,
  getDistrictsForState,
  isAllStates,
  isAllDistricts,
} from "@/features/mandi-prices/services/location-data";
import {
  MandiApiResponseData,
  NormalizedMandiRecord,
  MandiFilterParams,
} from "@/features/mandi-prices/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Read query parameters
    const stateRaw = searchParams.get("state") || "";
    const isStateAll = isAllStates(stateRaw);
    const stateParam = isStateAll ? undefined : stateRaw.trim();

    const districtRaw = searchParams.get("district") || "";
    const isDistrictAll = isAllDistricts(districtRaw);
    const districtParam = isDistrictAll ? undefined : districtRaw.trim();

    const cropRaw = searchParams.get("crop") || "";
    const isCropAll =
      !cropRaw ||
      cropRaw.trim() === "" ||
      cropRaw.toLowerCase() === "all" ||
      cropRaw.toLowerCase() === "all crops" ||
      cropRaw.toLowerCase() === "all commodities";
    const cropParam = isCropAll ? undefined : cropRaw.trim();

    const marketRaw = searchParams.get("market") || "";
    const isMarketAll =
      !marketRaw ||
      marketRaw.trim() === "" ||
      marketRaw.toLowerCase() === "all" ||
      marketRaw.toLowerCase() === "all mandis" ||
      marketRaw.toLowerCase() === "all markets";
    const marketParam = isMarketAll ? undefined : marketRaw.trim();

    const searchParam = searchParams.get("search") || undefined;
    const limitParam = parseInt(searchParams.get("limit") || "100", 10);
    const offsetParam = parseInt(searchParams.get("offset") || "0", 10);

    const filterParams: MandiFilterParams = {
      state: stateParam,
      district: districtParam,
      crop: cropParam,
      market: marketParam,
      search: searchParam,
      limit: limitParam,
      offset: offsetParam,
    };

    let records: NormalizedMandiRecord[] = [];
    let isLiveApi = false;
    let dataSource = "Official Agmarknet API (data.gov.in)";
    let liveCatalogRecords: NormalizedMandiRecord[] = [];

    const apiKey = process.env.DATA_GOV_IN_API_KEY;

    // 1. If DATA_GOV_IN_API_KEY is configured, fetch directly from data.gov.in
    if (apiKey && apiKey.trim() !== "") {
      try {
        // In All States mode: fetch up to 300 records across the country
        // In Specific State mode: fetch up to 150 records for that state
        const queryLimit = Math.max(limitParam, isStateAll ? 300 : 150);

        const liveResult = await fetchFromDataGovIn({
          state: stateParam,
          district: districtParam,
          crop: cropParam,
          market: marketParam,
          limit: queryLimit,
          offset: offsetParam,
        });

        if (liveResult.records && liveResult.records.length > 0) {
          records = liveResult.records;
          isLiveApi = true;
          dataSource = "Official Agmarknet API (data.gov.in)";
          liveCatalogRecords = liveResult.records;
        }

        // If specific district/crop was filtered and returned records, also get state catalog for filter options
        if (isLiveApi && stateParam && (districtParam || cropParam)) {
          const stateCatalogResult = await fetchFromDataGovIn({
            state: stateParam,
            limit: 200,
          });
          if (stateCatalogResult.records.length > 0) {
            liveCatalogRecords = stateCatalogResult.records;
          }
        }
      } catch (err) {
        console.warn("Live data.gov.in API request failed:", err);
      }
    }

    // 2. If free-text search is present, filter records in-memory
    if (searchParam && searchParam.trim() !== "") {
      const s = searchParam.toLowerCase().trim();
      records = records.filter(
        (r) =>
          r.mandiName.toLowerCase().includes(s) ||
          r.cropName.toLowerCase().includes(s) ||
          r.district.toLowerCase().includes(s) ||
          r.variety.toLowerCase().includes(s)
      );
    }

    // 3. Fallback to authentic Agmarknet reference records only if live API returned empty
    if (records.length === 0) {
      const allReference = getReferenceRecords();
      dataSource = isLiveApi
        ? "Official Agmarknet API (No records matching exact filters)"
        : "Agmarknet (data.gov.in Reference)";

      records = allReference.filter((r) => {
        // State restriction
        if (stateParam && r.state.toLowerCase() !== stateParam.toLowerCase()) {
          return false;
        }
        // District restriction
        if (districtParam && r.district.toLowerCase() !== districtParam.toLowerCase()) {
          return false;
        }
        // Crop restriction
        if (cropParam && r.cropName.toLowerCase() !== cropParam.toLowerCase()) {
          return false;
        }
        // Market restriction
        if (marketParam && !r.mandiName.toLowerCase().includes(marketParam.toLowerCase())) {
          return false;
        }
        // Search restriction
        if (searchParam) {
          const s = searchParam.toLowerCase().trim();
          const match =
            r.mandiName.toLowerCase().includes(s) ||
            r.cropName.toLowerCase().includes(s) ||
            r.district.toLowerCase().includes(s) ||
            r.variety.toLowerCase().includes(s);
          if (!match) return false;
        }
        return true;
      });

      if (liveCatalogRecords.length === 0) {
        liveCatalogRecords = stateParam
          ? allReference.filter((r) => r.state.toLowerCase() === stateParam.toLowerCase())
          : allReference;
      }
    }

    // 4. Sort records by modalPrice descending
    records.sort((a, b) => b.modalPrice - a.modalPrice);

    // 5. Extract available filter lists
    const filterSource = liveCatalogRecords.length > 0 ? liveCatalogRecords : records;

    // Available states: all 36 authoritative states & UTs
    const availableStates = [...AUTHORITATIVE_INDIAN_STATES_AND_UTS];

    // Available districts:
    // If a specific state is selected, combine authoritative districts for that state + any discovered in records
    // If All States is selected, combine all discovered districts across records
    let availableDistricts: string[] = [];
    if (stateParam) {
      const authoritativeDistricts = getDistrictsForState(stateParam);
      const recordDistricts = Array.from(
        new Set(
          filterSource
            .filter((r) => r.state.toLowerCase() === stateParam.toLowerCase())
            .map((r) => r.district)
            .filter(Boolean)
        )
      );
      availableDistricts = Array.from(
        new Set([...authoritativeDistricts, ...recordDistricts])
      ).sort();
    } else {
      availableDistricts = Array.from(
        new Set(filterSource.map((r) => r.district).filter(Boolean))
      ).sort();
    }

    const availableCrops = Array.from(
      new Set(filterSource.map((r) => r.cropName).filter(Boolean))
    ).sort();

    const availableMarkets = Array.from(
      new Set(
        filterSource
          .filter(
            (r) =>
              (!stateParam || r.state.toLowerCase() === stateParam.toLowerCase()) &&
              (!districtParam || r.district.toLowerCase() === districtParam.toLowerCase())
          )
          .map((r) => r.mandiName)
          .filter(Boolean)
      )
    ).sort();

    // 6. Compute statistics
    let minPrice = 0;
    let maxPrice = 0;
    let modalPrice = 0;
    let highestPriceMarket: string | null = null;
    let latestReportingDate: string | null = null;

    if (records.length > 0) {
      minPrice = Math.min(...records.map((r) => r.minPrice));
      maxPrice = Math.max(...records.map((r) => r.maxPrice));
      const totalModal = records.reduce((acc, r) => acc + r.modalPrice, 0);
      modalPrice = Math.round(totalModal / records.length);

      const highestRec = records.reduce((prev, curr) =>
        curr.modalPrice > prev.modalPrice ? curr : prev
      );
      highestPriceMarket = `${highestRec.mandiName} (₹${highestRec.modalPrice.toLocaleString("en-IN")}/q)`;

      const sortedDates = [...records].sort(
        (a, b) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime()
      );
      latestReportingDate = sortedDates[0]?.recordDate || null;
    }

    const coverageNotice = isStateAll
      ? "Nationwide APMC Coverage: Top wholesale auction arrivals across all supported states (up to 300 per query window)."
      : `Regional Coverage: Active APMC wholesale markets in ${stateParam}.`;

    const responsePayload: MandiApiResponseData = {
      records,
      total: records.length,
      page: Math.floor(offsetParam / limitParam) + 1,
      limit: limitParam,
      availableStates,
      availableDistricts,
      availableCrops,
      availableMarkets,
      statistics: {
        minPrice,
        modalPrice,
        maxPrice,
        highestPriceMarket,
        totalRecords: records.length,
        latestReportingDate,
        dataSource,
        isLiveApi,
        isDatabaseBacked: false,
        coverageNotice,
        isAllStatesSelected: isStateAll,
        isAllDistrictsSelected: isDistrictAll,
      },
    };

    return successResponse(responsePayload);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("GET /api/mandi-prices error:", errorMsg);
    return errorResponse("Failed to retrieve mandi prices", "INTERNAL_ERROR", 500, errorMsg);
  }
}
