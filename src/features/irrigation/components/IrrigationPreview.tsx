"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Sprout,
  CheckCircle2,
  TestTube2,
  Sliders,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useWeather } from "@/hooks/useWeather";
import { useLanguage } from "@/context/LanguageContext";
import { DEMONSTRATION_PRESETS } from "../logic/agronomic-data";
import { generateIrrigationSchedulePlan } from "../logic/water-budget-engine";
import { runIrrigationEngineTests, TestCaseResult } from "../logic/water-budget-engine.test";
import { FarmerModeView } from "./FarmerModeView";
import {
  AppLanguage,
  IRRIGATION_TRANSLATIONS,
} from "../logic/irrigation-translations";
import {
  FeasibleSchedule,
  ForecastDataSource,
  IrrigationFieldInput,
  IrrigationMethodType,
  LandAreaUnit,
  WeatherDayForecast,
} from "../types";

export const IrrigationPreview: React.FC = () => {
  // Global app shell language context synchronization
  const { setLanguage: setContextLanguage } = useLanguage();

  // Language state: Default is "hinglish" (conversational wording) on both server and client initial render
  const [language, setLanguageState] = useState<AppLanguage>("hinglish");

  // After mount, safely load saved language preference from localStorage without causing hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem("krishisetu_language");
      if (saved === "hi" || saved === "en") {
        setLanguageState(saved);
      }
    } catch {
      // Handle private browsing storage blocks
    }
  }, []);

  // Handler for language button clicks: only 2 options (हिंदी and English)
  const handleSelectLanguage = (lang: "hi" | "en") => {
    setLanguageState(lang);
    try {
      localStorage.setItem("krishisetu_language", lang);
    } catch {
      // Handle private browsing storage blocks
    }
    setContextLanguage(lang);
  };

  const t = IRRIGATION_TRANSLATIONS[language] || IRRIGATION_TRANSLATIONS.hinglish;

  // Track active demonstration preset (Default: Jaipur 1 Acre Tomato 40,000 L)
  const [activePresetId, setActivePresetId] = useState<string | null>("jaipur-tomato-40k");

  // Field & Water Budget Form States
  const [crop, setCrop] = useState("Tomato");
  const [growthStage, setGrowthStage] = useState("Flowering");
  const [soilType, setSoilType] = useState("Loamy");
  const [lastDate, setLastDate] = useState("2026-10-14");
  const [location, setLocation] = useState("Jaipur, Rajasthan");
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number }>({
    lat: 26.9124,
    lon: 75.7873,
  });
  const [fieldArea, setFieldArea] = useState<number>(1.0);
  const [areaUnit, setAreaUnit] = useState<LandAreaUnit>("acre");
  const [irrigationMethod, setIrrigationMethod] = useState<IrrigationMethodType>("drip");
  const [waterBudgetLiters, setWaterBudgetLiters] = useState<number>(40000);
  const [flowRateLitersPerHour, setFlowRateLitersPerHour] = useState<number>(15000);

  // Active selected schedule override
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("critical_stage_deficit");

  // In-browser verification test results modal/drawer state
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);

  // Fetch live weather from Weather API based on field location and coordinates
  const {
    weather,
    isLoading: weatherLoading,
    isError: weatherError,
    errorMessage: weatherErrorMessage,
    lastUpdatedText: weatherLastUpdated,
    refetch: refetchWeather,
  } = useWeather(location, coordinates);

  const handleRefreshWeather = () => {
    refetchWeather();
  };

  const forecastSource: ForecastDataSource =
    weather.source === "open-meteo" ? "live_open_meteo" : "climatological_fallback";

  const forecastDays: WeatherDayForecast[] = useMemo(() => {
    return weather.forecast?.length
      ? weather.forecast.map((d) => ({
          day: d.day,
          tempMax: d.tempMax,
          tempMin: d.tempMin,
          rainMm: d.rainMm,
          rainProbability: d.rainProbability,
          etoMm: d.etoMm,
          condition: d.condition,
          source: forecastSource,
        }))
      : [];
  }, [weather.forecast, forecastSource]);

  // Execute real, deterministic water balance calculation & schedule optimizer in the background
  const plan = useMemo(() => {
    const rawInput: Partial<IrrigationFieldInput> = {
      crop,
      growthStage,
      soilType,
      lastIrrigatedDate: lastDate,
      fieldLocation: location,
      fieldArea: Math.max(0.01, fieldArea || 1.0),
      areaUnit,
      irrigationMethod,
      availableWaterBudgetLiters: Math.max(1000, waterBudgetLiters || 10000),
      flowRateLitersPerHour: Math.max(1000, flowRateLitersPerHour || 15000),
    };
    return generateIrrigationSchedulePlan(rawInput, forecastDays, forecastSource);
  }, [
    crop,
    growthStage,
    soilType,
    lastDate,
    location,
    fieldArea,
    areaUnit,
    irrigationMethod,
    waterBudgetLiters,
    flowRateLitersPerHour,
    forecastDays,
    forecastSource,
  ]);

  // Keep selectedScheduleId aligned if plan changes and current id is not found
  useEffect(() => {
    if (plan.recommendation?.recommendedScheduleId) {
      const exists = plan.schedules.some((s) => s.id === selectedScheduleId);
      if (!exists) {
        setSelectedScheduleId(plan.recommendation.recommendedScheduleId);
      }
    }
  }, [plan, selectedScheduleId]);

  // Active schedule object being displayed
  const activeSchedule: FeasibleSchedule = useMemo(() => {
    const found = plan.schedules.find((s) => s.id === selectedScheduleId);
    return (
      found ||
      plan.schedules.find((s) => s.id === plan.recommendation.recommendedScheduleId) ||
      plan.schedules[0]
    );
  }, [plan.schedules, plan.recommendation.recommendedScheduleId, selectedScheduleId]);

  // Pumping runtime calculation based on active schedule gross demand
  const pumpingCalculation = useMemo(() => {
    const rate = flowRateLitersPerHour > 0 ? flowRateLitersPerHour : 15000;
    const hoursDecimal = activeSchedule.totalWaterUsedLiters / rate;
    const hours = Math.floor(hoursDecimal);
    const minutes = Math.round((hoursDecimal - hours) * 60);

    const timeFormatted =
      hours > 0 ? `${hours} hr ${minutes > 0 ? `${minutes} min` : ""}` : `${minutes} min`;

    const timeFormattedHindi =
      hours > 0 ? `${hours} घंटे ${minutes > 0 ? `${minutes} मिनट` : ""}` : `${minutes} मिनट`;

    return {
      hoursDecimal,
      hours,
      minutes,
      timeFormatted: timeFormatted.trim(),
      timeFormattedHindi: timeFormattedHindi.trim(),
      rate,
    };
  }, [activeSchedule.totalWaterUsedLiters, flowRateLitersPerHour]);

  // Helper for field changes that clears active preset label
  const handleFieldChange = () => {
    if (activePresetId !== null) {
      setActivePresetId(null);
    }
  };

  // Load a demonstration preset scenario
  const applyPreset = (presetId: string) => {
    const preset = DEMONSTRATION_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setCrop(preset.input.crop);
    setGrowthStage(preset.input.growthStage);
    setSoilType(preset.input.soilType);
    setLastDate(preset.input.lastIrrigatedDate);
    setLocation(preset.input.fieldLocation);
    if (preset.input.fieldLocation.toLowerCase().includes("jaipur")) {
      setCoordinates({ lat: 26.9124, lon: 75.7873 });
    } else if (preset.input.fieldLocation.toLowerCase().includes("sanganer")) {
      setCoordinates({ lat: 26.8197, lon: 75.7878 });
    }
    setFieldArea(preset.input.fieldArea);
    setAreaUnit(preset.input.areaUnit);
    setIrrigationMethod(preset.input.irrigationMethod);
    setWaterBudgetLiters(preset.input.availableWaterBudgetLiters);
    setFlowRateLitersPerHour(preset.input.flowRateLitersPerHour);
    setActivePresetId(preset.id);
  };

  const handleLocationChange = (newLocation: string, newCoords?: { lat: number; lon: number }) => {
    setLocation(newLocation);
    if (newCoords) {
      setCoordinates(newCoords);
    } else {
      const locLower = newLocation.toLowerCase();
      if (locLower.includes("jaipur")) {
        setCoordinates({ lat: 26.9124, lon: 75.7873 });
      } else if (locLower.includes("sanganer")) {
        setCoordinates({ lat: 26.8197, lon: 75.7878 });
      } else if (locLower.includes("chomu")) {
        setCoordinates({ lat: 27.1706, lon: 75.7226 });
      } else if (locLower.includes("phagi")) {
        setCoordinates({ lat: 26.5779, lon: 75.5708 });
      } else if (locLower.includes("nashik")) {
        setCoordinates({ lat: 19.9975, lon: 73.7898 });
      } else if (locLower.includes("ludhiana")) {
        setCoordinates({ lat: 30.9010, lon: 75.8573 });
      }
    }
    handleFieldChange();
  };

  const handleRunTests = () => {
    const results = runIrrigationEngineTests();
    setTestResults(results);
  };

  // Generic updater for farmer mode quick edits
  const handleUpdateField = (updates: {
    location?: string;
    crop?: string;
    growthStage?: string;
    fieldArea?: number;
    areaUnit?: LandAreaUnit;
    soilType?: string;
    irrigationMethod?: IrrigationMethodType;
    waterBudgetLiters?: number;
    flowRateLitersPerHour?: number;
  }) => {
    if (updates.location !== undefined) handleLocationChange(updates.location);
    if (updates.crop !== undefined) setCrop(updates.crop);
    if (updates.growthStage !== undefined) setGrowthStage(updates.growthStage);
    if (updates.fieldArea !== undefined) setFieldArea(updates.fieldArea);
    if (updates.areaUnit !== undefined) setAreaUnit(updates.areaUnit);
    if (updates.soilType !== undefined) setSoilType(updates.soilType);
    if (updates.irrigationMethod !== undefined) setIrrigationMethod(updates.irrigationMethod);
    if (updates.waterBudgetLiters !== undefined) setWaterBudgetLiters(updates.waterBudgetLiters);
    if (updates.flowRateLitersPerHour !== undefined) setFlowRateLitersPerHour(updates.flowRateLitersPerHour);
    handleFieldChange();
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* ============================================================= */}
      {/* TOP HEADER: 2-OPTION LANGUAGE SELECTOR & PRESETS */}
      {/* ============================================================= */}
      <Card className="p-4 sm:p-5 bg-gradient-to-r from-emerald-50/90 via-white to-sky-50/80 border-krishi-300 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-krishi-700 text-white shadow-sm">
              <Sprout className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-slate-900">
                  {t.appTitle}
                </h1>
                <span className="text-[10px] bg-krishi-100 text-krishi-900 font-bold px-2 py-0.5 rounded-full border border-krishi-200">
                  {t.appTag}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Visible Language Selector with 2 options only: हिंदी and English */}
          <div className="flex items-center self-start lg:self-auto">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-2xs">
              <button
                type="button"
                onClick={() => handleSelectLanguage("hi")}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  language === "hi"
                    ? "bg-krishi-700 text-white font-black shadow-sm ring-2 ring-krishi-200"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
                title="हिंदी में बदलें (Switch to Hindi)"
                aria-label="हिंदी भाषा चुनें"
              >
                <span>🇮🇳</span>
                <span>हिंदी</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectLanguage("en")}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  language === "en"
                    ? "bg-krishi-700 text-white font-black shadow-sm ring-2 ring-krishi-200"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
                title="Switch to English"
                aria-label="Select English language"
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Benchmark Presets Row */}
        <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <Sliders className="h-3.5 w-3.5 text-krishi-700" />
              <span>{t.quickPresetsLabel}</span>
            </span>

            {DEMONSTRATION_PRESETS.map((p) => {
              const isActive = activePresetId === p.id;
              const presetLabel =
                p.id === "jaipur-tomato-40k"
                  ? t.presetJaipurTomato
                  : p.id === "jaipur-wheat-deficit"
                  ? t.presetJaipurWheat
                  : p.id === "sanganer-chili-rain"
                  ? t.presetSanganerChili
                  : p.label;

              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                    isActive
                      ? "bg-krishi-700 text-white border-krishi-800 shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200 hover:border-krishi-400 hover:bg-slate-50"
                  }`}
                >
                  {p.isUserSpecifiedScenario ? "★ " : ""}
                  {presetLabel}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleRunTests}
            className="min-h-[34px] px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 flex items-center gap-1.5 transition-all self-start sm:self-auto"
            title="Run calculation engine invariant tests"
          >
            <TestTube2 className="h-3.5 w-3.5 text-slate-600" />
            <span>{t.verifyEngineBtn}</span>
          </button>
        </div>

        {/* Engine Self-Verification Test Modal/Drawer */}
        {testResults && (
          <div className="pt-3 border-t border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                {t.testsPassedNotice}
              </span>
              <button
                type="button"
                onClick={() => setTestResults(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-md hover:bg-slate-100 transition-colors"
              >
                {t.dismissBtn}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs max-h-48 overflow-y-auto pr-1">
              {testResults.map((tCase, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border flex items-center gap-2 ${
                    tCase.passed
                      ? "bg-emerald-50/80 border-emerald-200 text-emerald-900"
                      : "bg-rose-50 border-rose-200 text-rose-900"
                  }`}
                >
                  <span className="shrink-0 font-bold">{tCase.passed ? "✓" : "✗"}</span>
                  <span className="truncate text-[11px]">{tCase.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* ============================================================= */}
      {/* FARMER DASHBOARD (SINGLE CLEAN VIEW POWERED BY FAO-56 ENGINE) */}
      {/* ============================================================= */}
      <FarmerModeView
        plan={plan}
        activeSchedule={activeSchedule}
        weather={weather}
        weatherLoading={weatherLoading}
        weatherError={weatherError}
        weatherErrorMessage={weatherErrorMessage}
        weatherLastUpdated={weatherLastUpdated}
        onRefreshWeather={handleRefreshWeather}
        location={location}
        crop={crop}
        growthStage={growthStage}
        fieldArea={fieldArea}
        areaUnit={areaUnit}
        soilType={soilType}
        irrigationMethod={irrigationMethod}
        waterBudgetLiters={waterBudgetLiters}
        flowRateLitersPerHour={flowRateLitersPerHour}
        pumpingCalculation={pumpingCalculation}
        onUpdateField={handleUpdateField}
        onSelectLocation={handleLocationChange}
        language={language}
      />
    </div>
  );
};
