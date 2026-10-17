"use client";

import { useState, useEffect } from "react";

export interface WeatherData {
  source: string;
  location: string;
  temp: number;
  humidity: number;
  windSpeedKmh: number;
  condition: string;
  tomorrowRainMm: number;
  forecast: Array<{
    day: string;
    tempMax: number;
    tempMin: number;
    rainMm: number;
    condition: string;
  }>;
}

export function useWeather(location = "Jaipur, Rajasthan") {
  const [weather, setWeather] = useState<WeatherData>({
    source: "default",
    location,
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchWeather() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/weather?location=${encodeURIComponent(location)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && isMounted) {
            setWeather(json.data);
          }
        }
      } catch (e) {
        console.warn("Could not fetch weather updates:", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchWeather();

    return () => {
      isMounted = false;
    };
  }, [location]);

  return { weather, isLoading };
}
