import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { fetchWeatherOutlook, searchLocations } from "@/features/crop-planner/services/weather-service";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  // Mode 1: Location geocoding search
  if (search) {
    try {
      const locations = await searchLocations(search);
      return successResponse({ locations });
    } catch (err) {
      return errorResponse("Failed to geocode location", "GEOCODE_ERROR", 500, err);
    }
  }

  // Mode 2: Weather forecast fetch
  const latStr = searchParams.get("lat");
  const lonStr = searchParams.get("lon");
  const name = searchParams.get("name") || "Farm Location";

  if (!latStr || !lonStr) {
    return errorResponse("Missing required parameters 'lat' and 'lon'", "BAD_REQUEST", 400);
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return errorResponse("Invalid coordinates provided", "BAD_REQUEST", 400);
  }

  try {
    const outlook = await fetchWeatherOutlook(lat, lon, name);
    return successResponse(outlook);
  } catch (err) {
    return errorResponse("Failed to fetch weather outlook", "WEATHER_ERROR", 500, err);
  }
}
