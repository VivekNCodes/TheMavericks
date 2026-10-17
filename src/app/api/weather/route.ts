import { NextRequest, NextResponse } from "next/server";
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
  "nashik, maharashtra": { lat: 19.9975, lon: 73.7898, name: "Nashik, Maharashtra" },
};

function decodeWmoWeather(code: number): { condition: string; isRain: boolean } {
  if (code === 0) return { condition: "Sunny", isRain: false };
  if (code <= 3) return { condition: "Partly Cloudy", isRain: false };
  if (code >= 45 && code <= 48) return { condition: "Fog", isRain: false };
  if (code >= 51 && code <= 55) return { condition: "Drizzle", isRain: true };
  if (code >= 61 && code <= 65) return { condition: "Rain", isRain: true };
  if (code >= 80 && code <= 82) return { condition: "Rain Showers", isRain: true };
  if (code >= 95) return { condition: "Thunderstorm", isRain: true };
  return { condition: "Clear", isRain: false };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locationParam = (searchParams.get("location") || "Jaipur, Rajasthan").toLowerCase().trim();

  const coords = REGION_COORDINATES[locationParam] || {
    lat: parseFloat(searchParams.get("lat") || "26.9124"),
    lon: parseFloat(searchParams.get("lon") || "75.7873"),
    name: searchParams.get("location") || "Jaipur, Rajasthan",
  };

  try {
    // 1. Fetch live weather telemetry from Open-Meteo (Free, reliable, no key required)
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

    const apiKey = process.env.OPENWEATHER_API_KEY;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    let res: Response | null = null;

    if (apiKey) {
      const openWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`;
      res = await fetch(openWeatherUrl, { signal: controller.signal, next: { revalidate: 600 } });
    } else {
      res = await fetch(openMeteoUrl, {
        signal: controller.signal,
        headers: { "User-Agent": "KrishiSetu-AI/1.0" },
        next: { revalidate: 600 },
      });
    }
    clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json();
      const current = data.current;
      const daily = data.daily;

      const { condition } = decodeWmoWeather(current.weather_code ?? 0);
      const tomorrowRainMm = daily?.precipitation_sum?.[1] ?? 0;

      // Map daily forecast for 5 days
      const days = ["Today", "Tomorrow", "Day 3", "Day 4", "Day 5"];
      const forecast = (daily?.time || []).slice(0, 5).map((dateStr: string, idx: number) => {
        const wmo = decodeWmoWeather(daily.weather_code[idx] ?? 0);
        return {
          day: idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : dateStr,
          tempMax: Math.round(daily.temperature_2m_max[idx] ?? 30),
          tempMin: Math.round(daily.temperature_2m_min[idx] ?? 20),
          rainMm: Math.round(daily.precipitation_sum[idx] ?? 0),
          condition: wmo.condition,
        };
      });

      return successResponse({
        source: "open-meteo",
        location: coords.name,
        temp: Math.round(current.temperature_2m),
        humidity: current.relative_humidity_2m,
        windSpeedKmh: Math.round(current.wind_speed_10m),
        condition,
        tomorrowRainMm,
        forecast,
      });
    }
  } catch (err) {
    console.warn("Weather API live fetch timed out or offline, using fallback:", err);
  }

  // Graceful fallback weather response (e.g. if offline)
  return successResponse({
    source: "local-fallback",
    location: coords.name,
    temp: 28,
    humidity: 45,
    windSpeedKmh: 12,
    condition: "Sunny",
    tomorrowRainMm: 5,
    forecast: [
      { day: "Today", tempMax: 28, tempMin: 18, rainMm: 0, condition: "Sunny" },
      { day: "Tomorrow", tempMax: 30, tempMin: 19, rainMm: 5, condition: "Partly Cloudy" },
      { day: "Oct 19", tempMax: 31, tempMin: 20, rainMm: 0, condition: "Clear" },
      { day: "Oct 20", tempMax: 32, tempMin: 21, rainMm: 2, condition: "Rain" },
      { day: "Oct 21", tempMax: 30, tempMin: 19, rainMm: 0, condition: "Clear" },
    ],
  });
}
