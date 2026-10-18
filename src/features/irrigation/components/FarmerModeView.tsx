"use client";

import React, { useState } from "react";
import {
  Droplets,
  Clock,
  Sun,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Sprout,
  ShieldCheck,
  Info,
  Calendar,
  Check,
  Edit3,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FarmerWeatherCard } from "./FarmerWeatherCard";
import { WeatherData } from "@/hooks/useWeather";
import {
  AppLanguage,
  IRRIGATION_TRANSLATIONS,
} from "../logic/irrigation-translations";
import {
  FeasibleSchedule,
  IrrigationMethodType,
  IrrigationSchedulePlan,
  LandAreaUnit,
} from "../types";

interface FarmerModeViewProps {
  plan: IrrigationSchedulePlan;
  activeSchedule: FeasibleSchedule;
  weather: WeatherData;
  weatherLoading: boolean;
  weatherError: boolean;
  weatherErrorMessage: string | null;
  weatherLastUpdated: string;
  onRefreshWeather: () => void;
  // Field details & setters for easy inline editing
  location: string;
  crop: string;
  growthStage: string;
  fieldArea: number;
  areaUnit: LandAreaUnit;
  soilType: string;
  irrigationMethod: IrrigationMethodType;
  waterBudgetLiters: number;
  flowRateLitersPerHour: number;
  pumpingCalculation: {
    hours: number;
    minutes: number;
    timeFormatted: string;
    timeFormattedHindi: string;
  };
  onUpdateField: (updates: {
    location?: string;
    crop?: string;
    growthStage?: string;
    fieldArea?: number;
    areaUnit?: LandAreaUnit;
    soilType?: string;
    irrigationMethod?: IrrigationMethodType;
    waterBudgetLiters?: number;
    flowRateLitersPerHour?: number;
  }) => void;
  onSelectLocation: (loc: string, coords?: { lat: number; lon: number }) => void;
  language: AppLanguage;
}

export const FarmerModeView: React.FC<FarmerModeViewProps> = ({
  plan,
  activeSchedule,
  weather,
  weatherLoading,
  weatherError,
  weatherErrorMessage,
  weatherLastUpdated,
  onRefreshWeather,
  location,
  crop,
  growthStage,
  fieldArea,
  areaUnit,
  soilType,
  irrigationMethod,
  waterBudgetLiters,
  flowRateLitersPerHour,
  pumpingCalculation,
  onUpdateField,
  onSelectLocation,
  language,
}) => {
  const t = IRRIGATION_TRANSLATIONS[language] || IRRIGATION_TRANSLATIONS.hinglish;
  const isHi = language === "hi";
  const [showExplanation, setShowExplanation] = useState(false);
  const [showEditDrawer, setShowEditDrawer] = useState(false);

  // Determine Today's Hero Advice
  const isRainDelayed = activeSchedule.id === "rain_delayed";
  const isWithinBuffer =
    plan.budget.depletionStatus === "within_buffer" && activeSchedule.totalWaterUsedLiters === 0;

  let adviceStatusType: "irrigate" | "rain_delay" | "check_soil" = "irrigate";
  let adviceHeadline = "";
  let adviceSubtitle = "";

  if (isRainDelayed) {
    adviceStatusType = "rain_delay";
    adviceHeadline = t.decisionRainDelayHeadline;
    adviceSubtitle = t.decisionRainDelaySubtitle;
  } else if (isWithinBuffer) {
    adviceStatusType = "check_soil";
    adviceHeadline = t.decisionCheckSoilHeadline;
    adviceSubtitle = t.decisionCheckSoilSubtitle;
  } else {
    adviceStatusType = "irrigate";
    adviceHeadline = t.decisionIrrigateHeadline;
    adviceSubtitle = t.decisionIrrigateSubtitle(crop, growthStage);
  }

  // Reconciled water metrics
  const allocatedWater = activeSchedule.totalWaterUsedLiters;
  const grossCropNeed = plan.budget.grossIrrigationRequirementLiters;

  // Bigha equivalent display (Rajasthan standard: 1 Bigha ~ 0.625 Acre)
  const areaInAcres =
    areaUnit === "acre" ? fieldArea : areaUnit === "bigha" ? fieldArea * 0.625 : fieldArea * 2.471;
  const areaInBigha =
    areaUnit === "bigha" ? fieldArea : areaUnit === "acre" ? fieldArea / 0.625 : fieldArea * 3.953;

  // Localized crop name display
  const getLocalizedCrop = (c: string) => {
    if (c === "Tomato") return t.cropTomato;
    if (c === "Wheat") return t.cropWheat;
    if (c === "Chili") return t.cropChili;
    if (c === "Potato") return t.cropPotato;
    return c;
  };

  // Localized stage name display
  const getLocalizedStage = (st: string) => {
    if (st === "Flowering") return t.stageFlowering;
    if (st === "Vegetative") return t.stageVegetative;
    if (st === "Fruit Formation") return t.stageFruitFormation;
    if (st === "Grain Filling") return t.stageGrainFilling;
    return st;
  };

  // Localized method name display
  const getLocalizedMethod = (m: string) => {
    if (m === "drip") return t.methodDrip;
    if (m === "sprinkler") return t.methodSprinkler;
    if (m === "flood") return t.methodFlood;
    return m;
  };

  // Localized unit name display
  const getLocalizedUnit = (u: LandAreaUnit) => {
    if (u === "acre") return t.unitAcre;
    if (u === "bigha") return t.unitBigha;
    return t.unitHectare;
  };

  // Localized soil name display
  const getLocalizedSoil = (s: string) => {
    const sLower = s.toLowerCase();
    if (language === "hi") {
      if (sLower.includes("loam") && sLower.includes("sand")) return "बलुई दोमट (Sandy Loam)";
      if (sLower.includes("loam") && sLower.includes("clay")) return "मटियार दोमट (Clay Loam)";
      if (sLower.includes("sand")) return "रेतीली (Sandy)";
      if (sLower.includes("clay")) return "चिकनी (Clayey)";
      if (sLower.includes("loam")) return "दोमट (Loamy)";
      return s;
    }
    if (language === "hinglish") {
      if (sLower.includes("loam") && sLower.includes("sand")) return "Sandy Loam (Balui Domat)";
      if (sLower.includes("loam") && sLower.includes("clay")) return "Clay Loam (Matiyar Domat)";
      if (sLower.includes("sand")) return "Sandy (Balui)";
      if (sLower.includes("clay")) return "Clayey (Chikni)";
      if (sLower.includes("loam")) return "Loamy (Domat)";
      return s;
    }
    return s;
  };

  // Localized schedule name display
  const getLocalizedScheduleName = (id: string, name: string) => {
    if (language === "hi") {
      if (id === "critical_stage_deficit") return "नाजुक अवस्था सुरक्षा योजना";
      if (id === "budget_optimized") return "बजट-अनुकूलित सिंचाई";
      if (id === "rain_delayed") return "वर्षा-विलंबित योजना";
      if (id === "standard_full") return "पूर्ण आवश्यकता सिंचाई";
      return name;
    }
    if (language === "hinglish") {
      if (id === "critical_stage_deficit") return "Critical Stage Deficit Plan";
      if (id === "budget_optimized") return "Budget-Optimized Plan";
      if (id === "rain_delayed") return "Rain-Delayed Plan";
      if (id === "standard_full") return "Full ETc Plan";
      return name;
    }
    return name;
  };

  // Localized schedule badge display
  const getLocalizedBadge = (badge: string) => {
    if (language === "hi") {
      if (badge.includes("ETc")) return "पूर्ण फसल आवश्यकता (100% ETc)";
      if (badge.includes("Rain")) return "वर्षा बचत सक्रिय (Rain Credit)";
      if (badge.includes("Budget")) return "बजट अनुसार सुरक्षित (Capped)";
      if (badge.includes("Micro-Dose")) return "किस्तों में सिंचाई (Micro-Dose)";
      if (badge.includes("Observation")) return "मौसम निगरानी (Observation Delay)";
      return badge;
    }
    if (language === "hinglish") {
      if (badge.includes("ETc")) return "100% Crop Need Covered";
      if (badge.includes("Rain")) return "Baarish Credit Active";
      if (badge.includes("Budget")) return "Budget Ke Anusar Safe";
      if (badge.includes("Micro-Dose")) return "Dose Distribution";
      if (badge.includes("Observation")) return "Mausam Check Delay";
      return badge;
    }
    return badge;
  };

  // Localized calendar day label display
  const getCalendarDayName = (dayLabel: string, idx: number) => {
    if (idx === 0) return isHi ? "आज (दिन 1)" : language === "en" ? "Today (Day 1)" : "Aaj (Day 1)";
    if (idx === 1) return isHi ? "कल (दिन 2)" : language === "en" ? "Tomorrow (Day 2)" : "Kal (Day 2)";
    if (isHi) {
      return dayLabel
        .replace("Mon", "सोमवार")
        .replace("Tue", "मंगलवार")
        .replace("Wed", "बुधवार")
        .replace("Thu", "गुरुवार")
        .replace("Fri", "शुक्रवार")
        .replace("Sat", "शनिवार")
        .replace("Sun", "रविवार")
        .replace("Day", "दिन");
    }
    return dayLabel;
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Fallback / Stale Weather Warning Banner */}
      {(!weather.isLive || weatherError) && (
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs sm:text-sm shadow-xs">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-extrabold block">{t.weatherWarningNotice}</span>
          </div>
          <button
            type="button"
            onClick={onRefreshWeather}
            disabled={weatherLoading}
            className="px-3 py-1.5 rounded-xl bg-amber-200/80 hover:bg-amber-300 font-bold text-xs text-amber-950 transition-colors shrink-0"
          >
            {t.retryBtn}
          </button>
        </div>
      )}

      {/* ============================================================= */}
      {/* SECTION 1: FARM DETAILS (खेत का विवरण) */}
      {/* ============================================================= */}
      <Card className="p-4 sm:p-5 bg-white border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-krishi-100 text-krishi-800">
              <Sprout className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">{t.farmDetailsTitle}</h3>
              <span className="text-[11px] text-slate-500 font-medium">{t.farmDetailsSub}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowEditDrawer(!showEditDrawer)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-krishi-800 bg-krishi-50 hover:bg-krishi-100 border border-krishi-200 flex items-center gap-1.5 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>{showEditDrawer ? t.closeEditorBtn : t.editDetailsBtn}</span>
          </button>
        </div>

        {/* High-Contrast Info Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">
              {t.fieldLocationLabel}
            </span>
            <span className="text-sm font-extrabold text-slate-900 flex items-center gap-1 truncate mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-krishi-700 shrink-0" />
              {location}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">
              {t.cropAndStageLabel}
            </span>
            <span className="text-sm font-extrabold text-slate-900 block truncate mt-0.5">
              {getLocalizedCrop(crop)} ({getLocalizedStage(growthStage)})
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">
              {t.fieldAreaLabel}
            </span>
            <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
              {fieldArea} {getLocalizedUnit(areaUnit)}
            </span>
            <span className="text-[10px] text-slate-500 block font-medium">
              ≈ {areaInAcres.toFixed(2)} {t.unitAcre} ({areaInBigha.toFixed(2)} {t.unitBigha})
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] font-bold uppercase text-slate-500 block">
              {t.methodAndWaterLabel}
            </span>
            <span className="text-sm font-extrabold text-slate-900 block truncate mt-0.5">
              {irrigationMethod === "drip" ? t.methodDrip.split("(")[0].trim() : irrigationMethod === "sprinkler" ? t.methodSprinkler.split("(")[0].trim() : t.methodFlood.split("(")[0].trim()}
            </span>
            <span className="text-[10px] text-emerald-800 block font-bold">
              {waterBudgetLiters.toLocaleString("en-IN")} L {t.availableWord}
            </span>
          </div>
        </div>

        {/* Bigha Conversion Reassurance Note */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 text-[11px] text-slate-600 font-medium">
          <Info className="h-3.5 w-3.5 text-slate-500 shrink-0" />
          <span>{t.bighaConversionNote}</span>
        </div>

        {/* Expandable Farm Editor Drawer for Quick Changes */}
        {showEditDrawer && (
          <div className="p-4 rounded-2xl bg-krishi-50/60 border border-krishi-200 space-y-4 pt-3">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              {t.editorTitle}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.selectCropLabel}</label>
                <select
                  value={crop}
                  onChange={(e) => onUpdateField({ crop: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:border-krishi-600 focus:outline-none"
                >
                  <option value="Tomato">{t.cropTomato}</option>
                  <option value="Wheat">{t.cropWheat}</option>
                  <option value="Chili">{t.cropChili}</option>
                  <option value="Potato">{t.cropPotato}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.selectStageLabel}</label>
                <select
                  value={growthStage}
                  onChange={(e) => onUpdateField({ growthStage: e.target.value })}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:border-krishi-600 focus:outline-none"
                >
                  <option value="Flowering">{t.stageFlowering}</option>
                  <option value="Vegetative">{t.stageVegetative}</option>
                  <option value="Fruit Formation">{t.stageFruitFormation}</option>
                  <option value="Grain Filling">{t.stageGrainFilling}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.enterAreaLabel}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={fieldArea}
                    onChange={(e) => onUpdateField({ fieldArea: Math.max(0.1, parseFloat(e.target.value) || 1) })}
                    className="w-24 h-10 px-3 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:border-krishi-600 focus:outline-none"
                  />
                  <select
                    value={areaUnit}
                    onChange={(e) => onUpdateField({ areaUnit: e.target.value as LandAreaUnit })}
                    className="flex-1 h-10 px-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:border-krishi-600 focus:outline-none"
                  >
                    <option value="acre">{t.unitAcre}</option>
                    <option value="bigha">{t.unitBigha}</option>
                    <option value="hectare">{t.unitHectare}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.selectMethodLabel}</label>
                <select
                  value={irrigationMethod}
                  onChange={(e) => onUpdateField({ irrigationMethod: e.target.value as IrrigationMethodType })}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:border-krishi-600 focus:outline-none"
                >
                  <option value="drip">{t.methodDrip}</option>
                  <option value="sprinkler">{t.methodSprinkler}</option>
                  <option value="flood">{t.methodFlood}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.waterBudgetLabel}</label>
                <input
                  type="number"
                  step="5000"
                  min="5000"
                  value={waterBudgetLiters}
                  onChange={(e) => onUpdateField({ waterBudgetLiters: Math.max(1000, parseInt(e.target.value) || 10000) })}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:border-krishi-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">{t.flowRateLabel}</label>
                <select
                  value={flowRateLitersPerHour}
                  onChange={(e) => onUpdateField({ flowRateLitersPerHour: parseInt(e.target.value) || 15000 })}
                  className="w-full h-10 px-3 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 focus:border-krishi-600 focus:outline-none"
                >
                  <option value="10000">1.5 HP (~10,000 L/hr)</option>
                  <option value="15000">2.0 HP (~15,000 L/hr)</option>
                  <option value="25000">3.0 HP (~25,000 L/hr)</option>
                  <option value="40000">5.0 HP (~40,000 L/hr)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowEditDrawer(false)}
                className="px-4 py-2 bg-krishi-700 hover:bg-krishi-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
              >
                {t.saveAndApplyBtn}
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ============================================================= */}
      {/* SECTION 2: TODAY'S ADVICE (आज की मुख्य सलाह - 5-SECOND HERO) */}
      {/* ============================================================= */}
      <Card
        className={`p-6 sm:p-8 rounded-3xl border-2 shadow-md transition-all ${
          adviceStatusType === "irrigate"
            ? "bg-gradient-to-br from-emerald-50 via-white to-emerald-50/60 border-emerald-500 ring-2 ring-emerald-200"
            : adviceStatusType === "rain_delay"
            ? "bg-gradient-to-br from-sky-50 via-white to-sky-50/60 border-sky-500 ring-2 ring-sky-200"
            : "bg-gradient-to-br from-amber-50 via-white to-amber-50/60 border-amber-500 ring-2 ring-amber-200"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <span
              className={`flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl shadow-sm text-white ${
                adviceStatusType === "irrigate"
                  ? "bg-emerald-600"
                  : adviceStatusType === "rain_delay"
                  ? "bg-sky-600"
                  : "bg-amber-600"
              }`}
            >
              {adviceStatusType === "irrigate" && <Droplets className="h-8 w-8" />}
              {adviceStatusType === "rain_delay" && <Sun className="h-8 w-8" />}
              {adviceStatusType === "check_soil" && <AlertTriangle className="h-8 w-8" />}
            </span>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 text-white">
                  {t.todaysAdviceTitle}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/90 border border-slate-300 text-slate-800">
                  {getLocalizedBadge(activeSchedule.badge)}
                </span>
              </div>

              {/* HUGE 5-SECOND DECISION HEADLINE */}
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                {adviceHeadline}
              </h2>

              <p className="text-sm sm:text-base font-semibold text-slate-700 leading-snug max-w-2xl">
                {adviceSubtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0 self-start md:self-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              {t.budgetFeasibleBadge}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {t.budgetFeasibleSub}
            </span>
          </div>
        </div>
      </Card>

      {/* ============================================================= */}
      {/* SECTION 3: WATER AND PUMP PLAN (पानी और पंप की योजना) */}
      {/* ============================================================= */}
      <Card className="p-5 sm:p-7 bg-white border-slate-200 shadow-sm space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-100 text-sky-800">
              <Droplets className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">{t.waterPlanTitle}</h3>
              <span className="text-xs text-slate-500 font-medium">{t.waterPlanSub}</span>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-500">{t.periodLabel}</span>
        </div>

        {/* 3 Main Big Number Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Recommended Water */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50/80 to-white border-2 border-sky-200 flex flex-col justify-between min-h-[140px]">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                <Droplets className="h-4 w-4 text-sky-600" />
                {t.recommendedWaterLabel}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                {allocatedWater.toLocaleString("en-IN")}{" "}
                <span className="text-base sm:text-lg font-bold text-slate-500">{t.litersUnit}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-sky-100 text-xs font-semibold text-sky-900 flex items-center justify-between">
              <span>{t.budgetUtilizationLabel}</span>
              <span className="font-bold">{activeSchedule.budgetUtilizationPercent}%</span>
            </div>
          </div>

          {/* Card 2: Estimated Pump Runtime */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/80 to-white border-2 border-emerald-200 flex flex-col justify-between min-h-[140px]">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-emerald-600" />
                {t.pumpRuntimeLabel}
              </span>
              <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
                {isHi ? pumpingCalculation.timeFormattedHindi : pumpingCalculation.timeFormatted}
              </div>
            </div>
            <div className="pt-2 border-t border-emerald-100 text-xs text-slate-600 font-medium">
              {t.deliveryRateLabel}
              {flowRateLitersPerHour.toLocaleString("en-IN")}
              {t.litersPerHourUnit}
            </div>
          </div>

          {/* Card 3: Best Time of Day */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-white border-2 border-amber-200 flex flex-col justify-between min-h-[140px]">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Sun className="h-4 w-4 text-amber-600" />
                {t.preferredTimingLabel}
              </span>
              <div className="text-lg sm:text-xl font-extrabold text-slate-900 mt-2 leading-snug">
                {t.preferredTimingValue}
              </div>
            </div>
            <div className="pt-2 border-t border-amber-100 text-[11px] font-bold text-amber-900">
              {t.middaySunWarning}
            </div>
          </div>
        </div>

        {/* Water Reconciliation & Budget Cap Reassurance Bar */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 flex-wrap gap-2">
            <span>{t.waterReconciliationTitle}</span>
            <span className="text-slate-500 font-medium">{t.waterReconciliationSub}</span>
          </div>

          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-600 h-full transition-all"
              style={{
                width: `${Math.min(100, Math.round((allocatedWater / Math.max(1, waterBudgetLiters)) * 100))}%`,
              }}
              title="Allocated Water"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
            <div className="flex items-center justify-between sm:block">
              <span className="text-slate-500 block">{t.estimatedNeedLabel}</span>
              <span className="font-extrabold text-slate-900">{grossCropNeed.toLocaleString("en-IN")} L</span>
            </div>
            <div className="flex items-center justify-between sm:block">
              <span className="text-slate-500 block">{t.allocatedWaterLabel}</span>
              <span className="font-black text-emerald-800">{allocatedWater.toLocaleString("en-IN")} L</span>
            </div>
            <div className="flex items-center justify-between sm:block">
              <span className="text-slate-500 block">{t.availableBudgetLabel}</span>
              <span className="font-extrabold text-slate-900">{waterBudgetLiters.toLocaleString("en-IN")} L</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 flex items-center gap-2 text-[11px] text-slate-600">
            <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{t.invariantGuaranteeText(waterBudgetLiters.toLocaleString("en-IN"))}</span>
          </div>
        </div>
      </Card>

      {/* ============================================================= */}
      {/* SECTION 4: 5-DAY IRRIGATION CALENDAR (Replaces old expert view) */}
      {/* ============================================================= */}
      <Card className="p-5 sm:p-6 bg-white border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
              <Calendar className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                {t.calendarSectionTitle}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {t.calendarSectionSub}
              </span>
            </div>
          </div>
        </div>

        {/* 5-Day Calendar Strip */}
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <div className="grid grid-cols-5 min-w-[560px] sm:min-w-0 gap-2.5">
            {plan.dailyBalances.map((dayBal, idx) => {
              const event = activeSchedule.dailyEvents.find((e) => e.dayIndex === dayBal.dayIndex);
              const waterLiters = event ? event.waterToApplyLiters : 0;
              const hasIrrigation = waterLiters > 0;
              const hoursDecimal = waterLiters / flowRateLitersPerHour;
              const hours = Math.floor(hoursDecimal);
              const mins = Math.round((hoursDecimal - hours) * 60);
              const pumpTimeText =
                hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ""}` : mins > 0 ? `${mins} min` : "—";

              return (
                <div
                  key={dayBal.dayIndex}
                  className={`p-3.5 rounded-2xl border text-center flex flex-col justify-between transition-all ${
                    idx === 0
                      ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-200"
                      : hasIrrigation
                      ? "bg-sky-50/80 border-sky-300"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div>
                    <span className="text-xs font-black text-slate-900 block truncate">
                      {getCalendarDayName(dayBal.dayLabel, idx)}
                    </span>

                    <span
                      className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hasIrrigation
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {hasIrrigation ? (idx === 0 ? t.actionIrrigateToday : t.actionIrrigateBooster) : t.actionRestNoWater}
                    </span>
                  </div>

                  <div className="my-2.5 py-2 border-y border-slate-200/60 space-y-1">
                    <span className="text-base sm:text-lg font-black text-slate-900 block">
                      {hasIrrigation ? `${waterLiters.toLocaleString("en-IN")} L` : "0 L"}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-600 block">
                      {hasIrrigation ? `⏱ ${pumpTimeText}` : t.colPumpHours + ": —"}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 font-medium">
                    {dayBal.forecastRainMm > 0 ? (
                      <span className="text-sky-700 font-bold block">
                        {t.rainForecastText(dayBal.forecastRainMm)}
                      </span>
                    ) : (
                      <span className="text-slate-400 block">{t.dryWeatherText}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* ============================================================= */}
      {/* SECTION 5: WEATHER (मौसम और वर्षा का पूर्वानुमान) */}
      {/* ============================================================= */}
      <div className="space-y-2">
        <FarmerWeatherCard
          weather={weather}
          isLoading={weatherLoading}
          isError={weatherError}
          errorMessage={weatherErrorMessage}
          lastUpdatedText={weatherLastUpdated}
          selectedLocation={location}
          onSelectLocation={onSelectLocation}
          onRefresh={onRefreshWeather}
          language={language}
        />
      </div>

      {/* ============================================================= */}
      {/* SECTION 6: NEXT STEPS (किसान के लिए जरूरी कदम) */}
      {/* ============================================================= */}
      <Card className="p-5 sm:p-6 bg-white border-slate-200 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
            <Check className="h-4 w-4" />
          </span>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
            {t.actionStepsTitle}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-krishi-700 text-white font-bold text-xs mt-0.5">
              1
            </span>
            <div>
              <span className="font-bold text-slate-900 block">{t.step1Title}</span>
              <p className="text-slate-600 text-xs mt-0.5">{t.step1Desc}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-krishi-700 text-white font-bold text-xs mt-0.5">
              2
            </span>
            <div>
              <span className="font-bold text-slate-900 block">{t.step2Title}</span>
              <p className="text-slate-600 text-xs mt-0.5">
                {t.step2Desc(isHi ? pumpingCalculation.timeFormattedHindi : pumpingCalculation.timeFormatted)}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-krishi-700 text-white font-bold text-xs mt-0.5">
              3
            </span>
            <div>
              <span className="font-bold text-slate-900 block">{t.step3Title}</span>
              <p className="text-slate-600 text-xs mt-0.5">{t.step3Desc}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-krishi-700 text-white font-bold text-xs mt-0.5">
              4
            </span>
            <div>
              <span className="font-bold text-slate-900 block">{t.step4Title}</span>
              <p className="text-slate-600 text-xs mt-0.5">{t.step4Desc}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* ============================================================= */}
      {/* SECTION 7: WHY THIS ADVICE? (यह सलाह क्यों दी गई है? - EXPANDABLE) */}
      {/* ============================================================= */}
      <Card className="p-4 sm:p-5 bg-white border-slate-200 shadow-sm">
        <button
          type="button"
          onClick={() => setShowExplanation(!showExplanation)}
          className="w-full flex items-center justify-between text-left focus:outline-none"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <HelpCircle className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">{t.whyAdviceTitle}</h3>
              <span className="text-xs text-slate-500 font-medium">{t.whyAdviceSub}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-krishi-800">
            <span>{showExplanation ? t.collapseBtn : t.readMoreBtn}</span>
            {showExplanation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </button>

        {showExplanation && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 text-xs sm:text-sm animate-fadeIn">
            {/* Agronomic Rationale */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="text-slate-700 leading-relaxed font-medium">
                {t.summaryRationaleText(
                  getLocalizedCrop(crop),
                  getLocalizedStage(growthStage),
                  getLocalizedSoil(soilType),
                  plan.budget.estimatedRootZoneDepletionMm,
                  plan.budget.readilyAvailableWaterMm,
                  waterBudgetLiters.toLocaleString("en-IN"),
                  getLocalizedScheduleName(activeSchedule.id, activeSchedule.name),
                  activeSchedule.suitabilityScore
                )}
              </p>
              <p className="text-slate-700 leading-relaxed">
                {t.phenologyReasonText(getLocalizedCrop(crop), getLocalizedStage(growthStage), waterBudgetLiters.toLocaleString("en-IN"))}
              </p>
            </div>

            {/* Scientific Transparency & Disclaimer */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1.5">
              <span className="font-extrabold flex items-center gap-1.5 text-amber-900">
                <Info className="h-4 w-4 text-amber-700" />
                {t.transparencyTitle}
              </span>
              <ul className="list-disc pl-5 space-y-1 text-amber-900">
                <li>{t.soilModelDisclaimer}</li>
                <li>{t.rainUncertaintyDisclaimer}</li>
                <li>{t.yieldDisclaimer}</li>
              </ul>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
