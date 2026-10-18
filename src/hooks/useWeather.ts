"use client";

import { useState, useEffect, useCallback } from "react";

export interface WeatherForecastItem {
  date?: string;
  day: string;
  tempMax: number;
  tempMin: number;
  rainMm: number;
  rainProbability?: number;
  etoMm?: number;
  condition: string;
  weatherCode?: number;
  source?: string;
}

export interface WeatherData {
  source: string;
  isLive?: boolean;
  location: string;
  lat?: number;
  lon?: number;
  temp: number;
  humidity: number;
  precipitationMm?: number;
  windSpeedKmh: number;
  weatherCode?: number;
  condition: string;
  tomorrowRainMm: number;
  updatedAtIso?: string;
  updatedAtIst?: string;
  forecast: WeatherForecastItem[];
}

export interface UseWeatherOptions {
  location?: string;
  lat?: number;
  lon?: number;
}

export function useWeather(
  locationOrOptions: string | UseWeatherOptions = "Jaipur, Rajasthan",
  maybeCoords?: { lat: number; lon: number }
) {
  // Normalize parameters
  let location = "Jaipur, Rajasthan";
  let lat: number | undefined;
  let lon: number | undefined;

  if (typeof locationOrOptions === "string") {
    location = locationOrOptions;
    if (maybeCoords) {
      lat = maybeCoords.lat;
      lon = maybeCoords.lon;
    }
  } else if (locationOrOptions) {
    location = locationOrOptions.location || "Jaipur, Rajasthan";
    lat = locationOrOptions.lat;
    lon = locationOrOptions.lon;
  }

  const [weather, setWeather] = useState<WeatherData>({
    source: "default",
    isLive: false,
    location,
    lat: lat ?? 26.9124,
    lon: lon ?? 75.7873,
    temp: 28,
    humidity: 45,
    precipitationMm: 0,
    windSpeedKmh: 12,
    weatherCode: 0,
    condition: "Sunny",
    tomorrowRainMm: 0,
    updatedAtIst: "Pending initial load...",
    forecast: [
      { date: "Day 1", day: "Today", tempMax: 29, tempMin: 18, rainMm: 0, rainProbability: 5, etoMm: 4.1, condition: "Sunny", weatherCode: 0 },
      { date: "Day 2", day: "Tomorrow", tempMax: 30, tempMin: 19, rainMm: 0, rainProbability: 10, etoMm: 4.2, condition: "Clear", weatherCode: 0 },
      { date: "Day 3", day: "Day 3", tempMax: 31, tempMin: 20, rainMm: 0, rainProbability: 15, etoMm: 4.4, condition: "Clear", weatherCode: 0 },
      { date: "Day 4", day: "Day 4", tempMax: 32, tempMin: 21, rainMm: 0, rainProbability: 20, etoMm: 4.5, condition: "Partly Cloudy", weatherCode: 2 },
      { date: "Day 5", day: "Day 5", tempMax: 30, tempMin: 19, rainMm: 0, rainProbability: 10, etoMm: 4.0, condition: "Sunny", weatherCode: 0 },
    ],
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchWeather = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();
      if (lat !== undefined && lon !== undefined) {
        params.set("lat", lat.toString());
        params.set("lon", lon.toString());
        if (location) params.set("location", location);
      } else {
        params.set("location", location);
      }
      params.set("timezone", "Asia/Kolkata");

      const res = await fetch(`/api/weather?${params.toString()}`);
      if (!res.ok) {
        const errorJson = await res.json().catch(() => null);
        throw new Error(errorJson?.error || `HTTP error ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setWeather(json.data);
      } else {
        throw new Error(json.error || "Malformed weather response");
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Could not fetch weather updates";
      console.warn("Weather fetch notice:", msg);
      setIsError(true);
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }, [location, lat, lon]);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const lastUpdatedText = weather.updatedAtIst || "Just now";

  return {
    weather,
    isLoading,
    isError,
    errorMessage,
    lastUpdatedText,
    refetch: fetchWeather,
  };
}
