import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";

interface Coordinates {
  lat: number;
  lon: number;
  name: string;
}

const REGION_COORDINATES: Record<string, Coordinates> = {
  "jaipur, rajasthan": { lat: 26.9124, lon: 75.7873, name: "Jaipur, Rajasthan" },
  "jaipur": { lat: 26.9124, lon: 75.7873, name: "Jaipur, Rajasthan" },
  "sanganer, rajasthan": { lat: 26.8197, lon: 75.7878, name: "Sanganer, Rajasthan" },
  "sanganer": { lat: 26.8197, lon: 75.7878, name: "Sanganer, Rajasthan" },
  "chomu, rajasthan": { lat: 27.1706, lon: 75.7226, name: "Chomu, Rajasthan" },
  "chomu": { lat: 27.1706, lon: 75.7226, name: "Chomu, Rajasthan" },
  "phagi, rajasthan": { lat: 26.5779, lon: 75.5708, name: "Phagi, Rajasthan" },
  "phagi": { lat: 26.5779, lon: 75.5708, name: "Phagi, Rajasthan" },
  "ludhiana, punjab": { lat: 30.9010, lon: 75.8573, name: "Ludhiana, Punjab" },
  "ludhiana": { lat: 30.9010, lon: 75.8573, name: "Ludhiana, Punjab" },
  "nashik, maharashtra": { lat: 19.9975, lon: 73.7898, name: "Nashik, Maharashtra" },
  "nashik": { lat: 19.9975, lon: 73.7898, name: "Nashik, Maharashtra" },
};

function decodeWmoWeather(code: number): { condition: string; isRain: boolean } {
  if (code === 0) return { condition: "Sunny", isRain: false };
  if (code === 1) return { condition: "Mainly Clear", isRain: false };
  if (code === 2) return { condition: "Partly Cloudy", isRain: false };
  if (code === 3) return { condition: "Overcast", isRain: false };
  if (code >= 45 && code <= 48) return { condition: "Foggy", isRain: false };
  if (code >= 51 && code <= 55) return { condition: "Drizzle", isRain: true };
  if (code >= 61 && code <= 65) return { condition: "Rain", isRain: true };
  if (code >= 80 && code <= 82) return { condition: "Rain Showers", isRain: true };
  if (code >= 95) return { condition: "Thunderstorm", isRain: true };
  return { condition: "Clear", isRain: false };
}

function formatIstDateTime(date: Date): string {
  try {
    return (
      new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(date) + " IST"
    );
  } catch {
    return date.toISOString().replace("T", " ").substring(0, 16) + " UTC";
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latParam = searchParams.get("lat");
  const lonParam = searchParams.get("lon");
  const locationParam = searchParams.get("location")?.toLowerCase().trim();

  let lat: number;
  let lon: number;
  let locationName: string;

  // 1. Coordinate parsing & validation
  if (latParam !== null || lonParam !== null) {
    if (latParam === null || lonParam === null) {
      return errorResponse(
        "Both lat and lon parameters must be provided if one is present",
        "MISSING_COORDINATES",
        400
      );
    }
    const parsedLat = parseFloat(latParam);
    const parsedLon = parseFloat(lonParam);

    if (
      isNaN(parsedLat) ||
      isNaN(parsedLon) ||
      parsedLat < -90 ||
      parsedLat > 90 ||
      parsedLon < -180 ||
      parsedLon > 180
    ) {
      return errorResponse(
        "Invalid coordinates: lat must be between -90 and 90, lon between -180 and 180",
        "INVALID_COORDINATES",
        400
      );
    }
    lat = parsedLat;
    lon = parsedLon;
    locationName =
      searchParams.get("location") ||
      (Math.abs(lat - 26.9124) < 0.01 && Math.abs(lon - 75.7873) < 0.01
        ? "Jaipur, Rajasthan"
        : `${lat.toFixed(4)}, ${lon.toFixed(4)}`);
  } else if (locationParam && REGION_COORDINATES[locationParam]) {
    const reg = REGION_COORDINATES[locationParam];
    lat = reg.lat;
    lon = reg.lon;
    locationName = reg.name;
  } else if (locationParam) {
    // Fallback to Jaipur preset coordinates if unknown string passed without lat/lon
    lat = 26.9124;
    lon = 75.7873;
    locationName = searchParams.get("location") || "Jaipur, Rajasthan";
  } else {
    // Default to Jaipur preset
    lat = 26.9124;
    lon = 75.7873;
    locationName = "Jaipur, Rajasthan";
  }

  const now = new Date();
  const updatedAtIso = now.toISOString();
  const updatedAtIst = formatIstDateTime(now);
  const timezone = searchParams.get("timezone") || "Asia/Kolkata";

  // 2. Query Open-Meteo for live telemetry and 5-day forecast
  try {
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,et0_fao_evapotranspiration&timezone=${encodeURIComponent(timezone)}`;

    const apiKey = process.env.OPENWEATHER_API_KEY;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    let res: Response;
    if (apiKey) {
      const openWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      res = await fetch(openWeatherUrl, { signal: controller.signal, next: { revalidate: 600 } });
    } else {
      res = await fetch(openMeteoUrl, {
        signal: controller.signal,
        headers: { "User-Agent": "AgroSaathi/1.0" },
        next: { revalidate: 600 },
      });
    }
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const current = data.current;
      const daily = data.daily;

      if (!current || !daily) {
        throw new Error("Missing current or daily weather payload from Open-Meteo");
      }

      const { condition } = decodeWmoWeather(current.weather_code ?? 0);
      const tomorrowRainMm = daily.precipitation_sum?.[1] ?? 0;

      // Map 5-day forecast
      const forecast = (daily.time || []).slice(0, 5).map((dateStr: string, idx: number) => {
        const wmo = decodeWmoWeather(daily.weather_code?.[idx] ?? 0);
        let dayLabel: string;
        if (idx === 0) {
          dayLabel = "Today";
        } else if (idx === 1) {
          dayLabel = "Tomorrow";
        } else {
          try {
            const parsed = new Date(dateStr);
            dayLabel = new Intl.DateTimeFormat("en-IN", {
              timeZone: "Asia/Kolkata",
              weekday: "short",
              month: "short",
              day: "numeric",
            }).format(parsed);
          } catch {
            dayLabel = dateStr;
          }
        }

        return {
          date: dateStr,
          day: dayLabel,
          tempMax: Math.round(daily.temperature_2m_max?.[idx] ?? 30),
          tempMin: Math.round(daily.temperature_2m_min?.[idx] ?? 20),
          rainMm: Number((daily.precipitation_sum?.[idx] ?? 0).toFixed(1)),
          rainProbability: Math.round(daily.precipitation_probability_max?.[idx] ?? 0),
          etoMm: Number((daily.et0_fao_evapotranspiration?.[idx] ?? 0).toFixed(2)),
          condition: wmo.condition,
          weatherCode: daily.weather_code?.[idx] ?? 0,
          source: "live_open_meteo",
        };
      });

      return successResponse({
        source: "open-meteo",
        isLive: true,
        location: locationName,
        lat,
        lon,
        temp: Math.round(current.temperature_2m),
        humidity: Math.round(current.relative_humidity_2m),
        precipitationMm: Number((current.precipitation ?? 0).toFixed(1)),
        windSpeedKmh: Math.round(current.wind_speed_10m),
        weatherCode: current.weather_code ?? 0,
        condition,
        tomorrowRainMm: Number(tomorrowRainMm.toFixed(1)),
        updatedAtIso,
        updatedAtIst,
        forecast,
      });
    } else {
      console.warn(`Open-Meteo HTTP error ${res.status}: ${res.statusText}`);
    }
  } catch (err) {
    console.warn("Open-Meteo fetch failed or timed out, returning honest fallback:", err);
  }

  // 3. Honest Agro-Climatic Fallback response (clearly tagged, never masquerading as live)
  return successResponse({
    source: "local-fallback",
    isLive: false,
    location: locationName,
    lat,
    lon,
    temp: 28,
    humidity: 45,
    precipitationMm: 0,
    windSpeedKmh: 12,
    weatherCode: 0,
    condition: "Sunny",
    tomorrowRainMm: 0,
    updatedAtIso,
    updatedAtIst: `${updatedAtIst} (Offline Fallback)`,
    forecast: [
      {
        date: new Date().toISOString().split("T")[0],
        day: "Today",
        tempMax: 29,
        tempMin: 18,
        rainMm: 0,
        rainProbability: 5,
        etoMm: 4.1,
        condition: "Sunny",
        weatherCode: 0,
        source: "climatological_fallback",
      },
      {
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        day: "Tomorrow",
        tempMax: 30,
        tempMin: 19,
        rainMm: 0,
        rainProbability: 10,
        etoMm: 4.2,
        condition: "Clear",
        weatherCode: 0,
        source: "climatological_fallback",
      },
      {
        date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
        day: "Day 3",
        tempMax: 31,
        tempMin: 20,
        rainMm: 0,
        rainProbability: 15,
        etoMm: 4.4,
        condition: "Clear",
        weatherCode: 0,
        source: "climatological_fallback",
      },
      {
        date: new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0],
        day: "Day 4",
        tempMax: 32,
        tempMin: 21,
        rainMm: 0,
        rainProbability: 20,
        etoMm: 4.5,
        condition: "Partly Cloudy",
        weatherCode: 2,
        source: "climatological_fallback",
      },
      {
        date: new Date(Date.now() + 4 * 86400000).toISOString().split("T")[0],
        day: "Day 5",
        tempMax: 30,
        tempMin: 19,
        rainMm: 0,
        rainProbability: 10,
        etoMm: 4.0,
        condition: "Sunny",
        weatherCode: 0,
        source: "climatological_fallback",
      },
    ],
  });
}
