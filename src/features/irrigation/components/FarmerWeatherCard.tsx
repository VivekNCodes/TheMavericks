"use client";

import React from "react";
import {
  Sun,
  CloudRain,
  Cloud,
  Wind,
  MapPin,
  RefreshCw,
  Radio,
  AlertTriangle,
  Clock,
  Droplets,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { WeatherData } from "@/hooks/useWeather";
import { AppLanguage } from "../logic/irrigation-translations";

interface FarmerWeatherCardProps {
  weather: WeatherData;
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string | null;
  lastUpdatedText?: string;
  onRefresh?: () => void;
  onSelectLocation?: (locationName: string, coords?: { lat: number; lon: number }) => void;
  selectedLocation: string;
  language?: AppLanguage;
}

// Agricultural clusters with Open-Meteo coordinates
const POPULAR_LOCATIONS: Record<
  AppLanguage,
  Array<{ name: string; label: string; lat: number; lon: number }>
> = {
  hi: [
    { name: "Jaipur, Rajasthan", label: "जयपुर", lat: 26.9124, lon: 75.7873 },
    { name: "Sanganer, Rajasthan", label: "सांगानेर", lat: 26.8197, lon: 75.7878 },
    { name: "Chomu, Rajasthan", label: "चौमूं", lat: 27.1706, lon: 75.7226 },
    { name: "Phagi, Rajasthan", label: "फागी", lat: 26.5779, lon: 75.5708 },
    { name: "Nashik, Maharashtra", label: "नासिक", lat: 19.9975, lon: 73.7898 },
    { name: "Ludhiana, Punjab", label: "लुधियाना", lat: 30.9010, lon: 75.8573 },
  ],
  en: [
    { name: "Jaipur, Rajasthan", label: "Jaipur", lat: 26.9124, lon: 75.7873 },
    { name: "Sanganer, Rajasthan", label: "Sanganer", lat: 26.8197, lon: 75.7878 },
    { name: "Chomu, Rajasthan", label: "Chomu", lat: 27.1706, lon: 75.7226 },
    { name: "Phagi, Rajasthan", label: "Phagi", lat: 26.5779, lon: 75.5708 },
    { name: "Nashik, Maharashtra", label: "Nashik", lat: 19.9975, lon: 73.7898 },
    { name: "Ludhiana, Punjab", label: "Ludhiana", lat: 30.9010, lon: 75.8573 },
  ],
  hinglish: [
    { name: "Jaipur, Rajasthan", label: "Jaipur (जयपुर)", lat: 26.9124, lon: 75.7873 },
    { name: "Sanganer, Rajasthan", label: "Sanganer (सांगानेर)", lat: 26.8197, lon: 75.7878 },
    { name: "Chomu, Rajasthan", label: "Chomu (चौमूं)", lat: 27.1706, lon: 75.7226 },
    { name: "Phagi, Rajasthan", label: "Phagi (फागी)", lat: 26.5779, lon: 75.5708 },
    { name: "Nashik, Maharashtra", label: "Nashik (नासिक)", lat: 19.9975, lon: 73.7898 },
    { name: "Ludhiana, Punjab", label: "Ludhiana (लुधियाना)", lat: 30.9010, lon: 75.8573 },
  ],
};

export const FarmerWeatherCard: React.FC<FarmerWeatherCardProps> = ({
  weather,
  isLoading,
  isError = false,
  errorMessage = null,
  lastUpdatedText,
  onRefresh,
  onSelectLocation,
  selectedLocation,
  language = "hinglish",
}) => {
  const isLive = weather.source === "open-meteo" && weather.isLive !== false;
  const isHi = language === "hi";
  const isEn = language === "en";

  const getWeatherIcon = (condition: string, rainMm: number) => {
    const c = condition.toLowerCase();
    if (rainMm > 0 || c.includes("rain") || c.includes("drizzle") || c.includes("shower") || c.includes("thunder")) {
      return <CloudRain className="h-6 w-6 text-sky-500 shrink-0" />;
    }
    if (c.includes("cloud") || c.includes("overcast") || c.includes("fog")) {
      return <Cloud className="h-6 w-6 text-slate-400 shrink-0" />;
    }
    return <Sun className="h-6 w-6 text-amber-500 shrink-0" />;
  };

  const getRainProbabilityDisplay = (day: { rainProbability?: number; rainMm: number; condition: string }) => {
    if (day.rainProbability !== undefined && day.rainProbability !== null) {
      return day.rainProbability;
    }
    if (day.rainMm >= 10) return 85;
    if (day.rainMm >= 3) return 65;
    if (day.rainMm > 0) return 40;
    if (day.condition.toLowerCase().includes("cloud")) return 20;
    return 5;
  };

  const formattedUpdate =
    weather.updatedAtIst && weather.updatedAtIst !== "Pending initial load..."
      ? weather.updatedAtIst
      : isHi
      ? "अभी"
      : isEn
      ? "Just now"
      : "Abhi (Just now)";
  const locationsList = POPULAR_LOCATIONS[language] || POPULAR_LOCATIONS.hinglish;

  // Day label localization
  const formatDayName = (dayStr: string, idx: number) => {
    if (idx === 0) return isHi ? "आज" : isEn ? "Today" : "Aaj (Today)";
    if (idx === 1) return isHi ? "कल" : isEn ? "Tomorrow" : "Kal (Tomorrow)";
    if (isHi) {
      return dayStr.replace("Mon", "सोमवार").replace("Tue", "मंगलवार").replace("Wed", "बुधवार").replace("Thu", "गुरुवार").replace("Fri", "शुक्रवार").replace("Sat", "शनिवार").replace("Sun", "रविवार");
    }
    return dayStr;
  };

  return (
    <Card className="p-4 sm:p-6 space-y-4 bg-white border-slate-200 shadow-sm">
      {/* Header with Title and Telemetry Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
            <CloudRain className="h-5 w-5" />
          </span>
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2 flex-wrap">
              <span>
                {isHi
                  ? "स्थानीय मौसम और बारिश का पूर्वानुमान"
                  : isEn
                  ? "Local Weather & Rain Forecast"
                  : "Local Mausam Aur Baarish Ka Forecast"}
              </span>
            </h4>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-krishi-700" />
                {selectedLocation}
                {weather.lat !== undefined && weather.lon !== undefined && (
                  <span className="text-[10px] text-slate-400 font-normal ml-0.5">
                    ({weather.lat.toFixed(4)}°N, {weather.lon.toFixed(4)}°E)
                  </span>
                )}
              </span>
              <span className="text-slate-300">·</span>
              {isLive ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <Radio className="h-3 w-3 text-emerald-600 animate-pulse shrink-0" />
                  {isHi ? "लाइव उपग्रह फीड" : isEn ? "Live Satellite Feed" : "Live Satellite Feed"}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  <AlertTriangle className="h-3 w-3 text-amber-600 shrink-0" />
                  {isHi ? "जलवायु औसत (ऑफलाइन)" : isEn ? "Climatological Fallback (Offline)" : "Offline Climate Backup"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="Refresh weather data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>
                {isLoading
                  ? isHi
                    ? "अपडेट हो रहा है..."
                    : isEn
                    ? "Updating..."
                    : "Updating..."
                  : isHi
                  ? "रिफ्रेश करें"
                  : isEn
                  ? "Refresh"
                  : "Refresh Karein"}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Error Banner when live fetch failed */}
      {isError && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">
              {isHi ? "मौसम सेवा सूचना: " : isEn ? "Weather Notice: " : "Mausam Notice: "}
            </span>
            <span>
              {errorMessage ||
                (isHi
                  ? "ताज़ा उपग्रह डेटा उपलब्ध नहीं है। सुरक्षित जलवायु औसत का उपयोग किया जा रहा है।"
                  : isEn
                  ? "Live telemetry unavailable. Using calibrated fallback averages."
                  : "Live satellite connect nahi hua. Backup climate data active.")}
            </span>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="text-xs font-bold text-amber-800 underline hover:text-amber-900 shrink-0"
            >
              {isHi ? "दोबारा प्रयास करें" : isEn ? "Retry" : "Try Again"}
            </button>
          )}
        </div>
      )}

      {/* Quick Select Agricultural Locations */}
      {onSelectLocation && (
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            {isHi ? "क्षेत्र चुनें:" : isEn ? "Quick Select Area:" : "Kheti Ka Area Chunein:"}
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {locationsList.map((loc) => {
              const isSelected =
                selectedLocation.toLowerCase().includes(loc.name.split(",")[0].toLowerCase());
              return (
                <button
                  key={loc.name}
                  type="button"
                  onClick={() => onSelectLocation(loc.name, { lat: loc.lat, lon: loc.lon })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    isSelected
                      ? "bg-krishi-700 text-white border-krishi-800 shadow-2xs ring-2 ring-krishi-200"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  {loc.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Current Conditions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
        <div>
          <span className="text-slate-400 block text-[10px]">
            {isHi ? "तापमान" : isEn ? "Temperature" : "Temperature (Taapmaan)"}
          </span>
          <span className="text-base font-extrabold text-slate-900">{weather.temp}°C</span>
          <span className="text-[10px] text-slate-500 block truncate">{weather.condition}</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">
            {isHi ? "हवा में नमी" : isEn ? "Humidity" : "Humidity (Nami)"}
          </span>
          <span className="text-base font-extrabold text-slate-900">{weather.humidity}%</span>
          <span className="text-[10px] text-slate-500 block">Relative</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">
            {isHi ? "वर्तमान वर्षा" : isEn ? "Precipitation" : "Current Baarish"}
          </span>
          <span className="text-base font-extrabold text-slate-900">
            {weather.precipitationMm !== undefined ? weather.precipitationMm : 0} mm
          </span>
          <span className="text-[10px] text-slate-500 block">
            {isHi ? "तीव्रता" : isEn ? "Intensity" : "Intensity"}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">
            {isHi ? "हवा की गति" : isEn ? "Wind Speed" : "Wind Speed (Hawa)"}
          </span>
          <span className="text-base font-extrabold text-slate-900">{weather.windSpeedKmh} km/h</span>
          <span className="text-[10px] text-slate-500 block">Surface 10m</span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">
            {isHi ? "कल बारिश" : isEn ? "Rain Tomorrow" : "Kal Baarish"}
          </span>
          <span
            className={`text-base font-black ${
              weather.tomorrowRainMm > 0 ? "text-sky-700" : "text-slate-700"
            }`}
          >
            {weather.tomorrowRainMm} mm
          </span>
          <span className="text-[10px] text-slate-500 block">
            {weather.tomorrowRainMm > 0
              ? isHi
                ? "बारिश संभावित"
                : isEn
                ? "Rain expected"
                : "Rain expected"
              : isHi
              ? "मौसम साफ़"
              : isEn
              ? "Dry / Clear"
              : "Dry / Clear"}
          </span>
        </div>
      </div>

      {/* 5-Day Forecast Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs flex-wrap gap-2">
          <span className="font-bold text-slate-700">
            {isHi
              ? "अगले 5 दिनों की बारिश का पूर्वानुमान:"
              : isEn
              ? "5-Day Rainfall Outlook:"
              : "Agle 5 Dino Ki Baarish Ka Outlook:"}
          </span>
          <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
            <Clock className="h-3 w-3 text-slate-400" />{" "}
            {isHi ? "अंतिम अपडेट: " : isEn ? "Updated: " : "Last Update: "}
            {formattedUpdate}
          </span>
        </div>

        <div className="overflow-x-auto pb-1.5 sm:overflow-visible -mx-1 sm:mx-0">
          <div className="grid grid-cols-5 min-w-[560px] sm:min-w-0 gap-2.5">
            {weather.forecast.map((day, idx) => {
              const rainProbability = getRainProbabilityDisplay(day);
              const hasRain = day.rainMm > 0;
              const dayName = formatDayName(day.day, idx);

              return (
                <div
                  key={day.date || day.day || idx}
                  className={`p-3 rounded-xl border flex flex-col justify-between text-center transition-all min-h-[155px] ${
                    idx === 0
                      ? "bg-amber-50/70 border-amber-200 ring-1 ring-amber-100"
                      : hasRain
                      ? "bg-sky-50/80 border-sky-200"
                      : "bg-white border-slate-200"
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {dayName}
                    </span>
                    <div className="my-1.5 flex justify-center">
                      {getWeatherIcon(day.condition, day.rainMm)}
                    </div>
                    <span className="text-xs font-black text-slate-900 block">
                      {day.tempMax}°C{" "}
                      <span className="text-[10px] font-normal text-slate-400">/ {day.tempMin}°C</span>
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span
                      className={`text-xs font-extrabold block ${
                        hasRain ? "text-sky-700" : "text-slate-600"
                      }`}
                    >
                      {day.rainMm} mm {isHi ? "बारिश" : isEn ? "Rain" : "Rain"}
                    </span>
                    <span
                      className={`text-[10px] font-bold block rounded px-1 py-0.5 ${
                        hasRain ? "bg-sky-100 text-sky-800" : "text-slate-400"
                      }`}
                    >
                      {rainProbability}% {isHi ? "संभावना" : isEn ? "chance" : "chance"}
                    </span>
                    {day.etoMm !== undefined && day.etoMm > 0 && (
                      <span className="text-[10px] text-slate-500 block font-medium">
                        ET₀: {day.etoMm} mm
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
