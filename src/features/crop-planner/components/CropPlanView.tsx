"use client";

import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Layers,
  Droplets,
  Ruler,
  AlertTriangle,
  CheckCircle2,
  Info,
  Thermometer,
  CloudRain,
  Share2,
  Bookmark,
  Printer,
  Edit3,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  Flame,
  Snowflake,
  ExternalLink,
  FlaskConical,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/context/LanguageContext";
import { GrowingPlan, WeatherRiskAlert } from "../types";
import { INDIAN_SOIL_TYPES } from "../data/soils";

export interface CropPlanViewProps {
  plan: GrowingPlan;
  onEditInputs: () => void;
  onSavePlan: () => void;
  isSavingPlan?: boolean;
  isPlanSaved?: boolean;
  onOpenSavedPlans?: () => void;
}

export const CropPlanView: React.FC<CropPlanViewProps> = ({
  plan,
  onEditInputs,
  onSavePlan,
  isSavingPlan = false,
  isPlanSaved = false,
  onOpenSavedPlans,
}) => {
  const { t } = useLanguage();
  const [expandedStageIndex, setExpandedStageIndex] = useState<number | null>(0);

  const toggleStage = (idx: number) => {
    setExpandedStageIndex(expandedStageIndex === idx ? null : idx);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const soilInfo = INDIAN_SOIL_TYPES[plan.input.soilType];

  const getSoilRatingVariant = (rating: string): "green" | "amber" | "blue" => {
    if (rating === "ideal") return "green";
    if (rating === "suitable") return "blue";
    return "amber";
  };

  const getRiskIcon = (type: WeatherRiskAlert["type"]) => {
    switch (type) {
      case "heatwave":
        return <Flame className="h-4 w-4 text-amber-600" />;
      case "frost":
        return <Snowflake className="h-4 w-4 text-sky-600" />;
      case "heavy_rain":
      case "waterlogging":
        return <CloudRain className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 print:space-y-4 print:pb-0">
      {/* 1. Header Toolbar & Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-krishi-700 uppercase tracking-wider">
              AgroSaathi Growing Plan
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500">
              Generated {new Date(plan.generatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {plan.crop.name} Growing Blueprint
          </h1>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEditInputs}
            leftIcon={<Edit3 className="h-3.5 w-3.5 text-slate-600" />}
            className="rounded-xl text-xs font-semibold"
          >
            {t("cpEditInputsBtn")}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="h-3.5 w-3.5 text-slate-600" />}
            className="rounded-xl text-xs font-semibold"
          >
            {t("cpPrintBtn")}
          </Button>

          <Button
            type="button"
            variant={isPlanSaved ? "outline" : "primary"}
            size="sm"
            onClick={onSavePlan}
            disabled={isSavingPlan}
            leftIcon={
              isPlanSaved ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              ) : (
                <Bookmark className="h-3.5 w-3.5" />
              )
            }
            className="rounded-xl text-xs font-semibold"
          >
            {isPlanSaved ? "Saved" : isSavingPlan ? "Saving..." : t("cpSavePlanBtn")}
          </Button>

          {onOpenSavedPlans && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenSavedPlans}
              className="rounded-xl text-xs font-semibold"
            >
              {t("cpSavedPlansBtn")}
            </Button>
          )}
        </div>
      </div>

      {/* 2. Executive Summary Hero Banner */}
      <Card className="p-5 sm:p-6 bg-gradient-to-br from-krishi-800 to-krishi-900 text-white rounded-2xl shadow-md border-0 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 pointer-events-none rounded-r-2xl transform skew-x-12 translate-x-10" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="green" size="sm" className="bg-emerald-400/20 text-emerald-200 border-emerald-400/30">
                {plan.crop.category.toUpperCase()} • {plan.crop.season.toUpperCase()}
              </Badge>
              <Badge variant="blue" size="sm" className="bg-sky-400/20 text-sky-200 border-sky-400/30">
                {plan.weatherOutlook.resolvedLocation}
              </Badge>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {plan.crop.name} ({plan.crop.scientificName})
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
                Full cultivation schedule from intended sowing on{" "}
                <span className="font-bold underline text-white">
                  {new Date(plan.input.sowingDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>{" "}
                across {plan.input.landArea} {plan.input.areaUnit} ({plan.normalizedAreaAcres} acres / {plan.normalizedAreaHectares} ha).
              </p>
            </div>
          </div>

          {/* Quick Stat Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <div className="p-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/10 text-center">
              <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                Cycle Duration
              </div>
              <div className="text-lg font-black text-white mt-0.5">
                {plan.crop.totalDurationDays.standard} Days
              </div>
            </div>

            <div className="p-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/10 text-center">
              <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                Total Water
              </div>
              <div className="text-lg font-black text-white mt-0.5">
                {plan.waterBudget.totalDemandMm} mm
              </div>
            </div>

            <div className="p-3 bg-white/10 backdrop-blur-xs rounded-xl border border-white/10 text-center col-span-2 sm:col-span-1">
              <div className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                Soil Match
              </div>
              <div className="text-lg font-black text-emerald-300 mt-0.5">
                {plan.soilAssessment.score}%
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Plain-Language Natural Language Advisory */}
      {plan.aiExplanation && (
        <Card className="p-4 sm:p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3.5 shadow-xs">
          <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              {t("cpAdvisoryTitle")}
            </div>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
              {plan.aiExplanation}
            </p>
          </div>
        </Card>
      )}

      {/* 4. Two-Column Grid: Soil Suitability & Weather Outlook */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (6 cols): Soil Suitability & Health */}
        <Card className="lg:col-span-6 p-5 sm:p-6 space-y-4 border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Layers className="h-4 w-4" />
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                {t("cpSoilSuitabilityTitle")}
              </h3>
            </div>
            <Badge variant={getSoilRatingVariant(plan.soilAssessment.rating)} size="sm">
              {plan.soilAssessment.rating.toUpperCase()} ({plan.soilAssessment.score}/100)
            </Badge>
          </div>

          {/* Texture & pH Summary */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 block">Soil Texture:</span>
              <span className="font-bold text-slate-800 text-xs sm:text-sm mt-0.5 block">
                {soilInfo.name}
              </span>
              <span className="text-[10px] text-slate-500">Group: {soilInfo.textureGroup}</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400 block">Soil Reaction (pH):</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                  pH {plan.soilAssessment.phValueUsed}
                </span>
                {plan.soilAssessment.isPhAssumed && (
                  <span className="text-[10px] text-amber-700 font-semibold">(Assumed)</span>
                )}
              </div>
              <span className="text-[10px] text-slate-500">
                Crop Optimal: {plan.crop.optimalPh.min} - {plan.crop.optimalPh.max}
              </span>
            </div>
          </div>

          {/* Explicit Data Transparency & Assumptions Box */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <Info className="h-4 w-4 text-amber-700 shrink-0" />
              <span>Assumptions &amp; Measured Data</span>
            </div>
            <ul className="text-[11px] text-amber-950/90 space-y-1 list-disc list-inside">
              {plan.soilAssessment.assumptions.map((assump, idx) => (
                <li key={idx} className="leading-tight">
                  {assump}
                </li>
              ))}
              {!plan.soilAssessment.isPhAssumed && (
                <li className="leading-tight text-emerald-800 font-semibold">
                  ✓ Soil pH measured and verified from farmer input.
                </li>
              )}
            </ul>
          </div>

          {/* Recommendations for Soil Management */}
          {plan.soilAssessment.recommendations.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-xs font-bold text-slate-800">
                Soil Conditioning Guidance:
              </span>
              <ul className="text-xs text-slate-600 space-y-1.5">
                {plan.soilAssessment.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-krishi-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Right Column (6 cols): 7-Day Weather Outlook & Risks */}
        <Card className="lg:col-span-6 p-5 sm:p-6 space-y-4 border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
                <CloudRain className="h-4 w-4" />
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                {t("cpWeatherOutlookTitle")}
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-semibold">
              Live Open-Meteo
            </span>
          </div>

          {/* 7-Day Forecast Micro Strip */}
          <div className="grid grid-cols-7 gap-1.5 overflow-x-auto pb-1">
            {plan.weatherOutlook.forecast7Day.map((day, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-xl text-center flex flex-col justify-between border ${
                  idx === 0
                    ? "bg-krishi-50 border-krishi-200"
                    : "bg-slate-50 border-slate-200/80"
                }`}
              >
                <div className="text-[10px] font-bold text-slate-600 truncate">
                  {day.dayLabel.split(",")[0]}
                </div>
                <div className="my-1.5">
                  <div className="text-xs font-extrabold text-slate-900">
                    {day.tempMax}°
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {day.tempMin}°
                  </div>
                </div>
                <div className="text-[9px] font-bold text-sky-700 bg-sky-50 rounded py-0.5">
                  {day.precipitationMm > 0 ? `${day.precipitationMm}m` : "0mm"}
                </div>
              </div>
            ))}
          </div>

          {/* Weather Risk Badges & Alerts */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-slate-800">
              Agrometeorological Risk Assessment:
            </div>
            {plan.weatherOutlook.risks.map((risk, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                  risk.severity === "high"
                    ? "bg-red-50 border-red-200 text-red-950"
                    : risk.severity === "medium"
                    ? "bg-amber-50 border-amber-200 text-amber-950"
                    : "bg-slate-50 border-slate-200 text-slate-800"
                }`}
              >
                <div className="shrink-0 mt-0.5">{getRiskIcon(risk.type)}</div>
                <div className="space-y-0.5 flex-1">
                  <div className="font-bold">{risk.title}</div>
                  <p className="text-[11px] opacity-90">{risk.description}</p>
                  <p className="text-[11px] font-semibold mt-1">
                    Action: {risk.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-[10px] text-slate-400 pt-1">
            {plan.weatherOutlook.attribution}
          </div>
        </Card>
      </div>

      {/* 5. Water Budget & Scientific Irrigation Schedule (FAO-56) */}
      <Card className="p-5 sm:p-6 space-y-5 border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <Droplets className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {t("cpWaterBudgetTitle")}
              </h3>
              <p className="text-xs text-slate-500">
                Calculated according to FAO Irrigation &amp; Drainage Paper 56 standards
              </p>
            </div>
          </div>

          <Badge variant="blue" size="md">
            Method: {plan.input.irrigationMethod.replace("_", " ").toUpperCase()} (
            {plan.waterBudget.irrigationMethodEfficiencyPercent}% Eff)
          </Badge>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Total Cycle Demand
            </div>
            <div className="text-lg font-black text-slate-900 mt-1">
              {plan.waterBudget.totalDemandMm} mm
            </div>
            <div className="text-[10px] text-slate-400">
              ~{(plan.waterBudget.totalDemandLitersForArea / 1000).toLocaleString()} kL across parcel
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Forecast Rain (7 Days)
            </div>
            <div className="text-lg font-black text-sky-700 mt-1">
              {plan.waterBudget.forecastRainMmNext7Days} mm
            </div>
            <div className="text-[10px] text-slate-400">
              Peff: ~{plan.waterBudget.estimatedEffectiveRainfallMm} mm effective
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Immediate Irrigation Need
            </div>
            <div className="text-lg font-black text-krishi-800 mt-1">
              {plan.waterBudget.grossIrrigationRequirementMm} mm
            </div>
            <div className="text-[10px] text-slate-400">
              Gross application depth
            </div>
          </div>

          <div className="p-3.5 bg-krishi-50 border border-krishi-200 rounded-xl">
            <div className="text-[11px] font-bold text-krishi-900 uppercase tracking-wide">
              Recommended Interval
            </div>
            <div className="text-lg font-black text-krishi-900 mt-1">
              Every {plan.waterBudget.estimatedIrrigationIntervalDays} Days
            </div>
            <div className="text-[10px] text-krishi-700 font-semibold">
              Tailored to {soilInfo.textureGroup}
            </div>
          </div>
        </div>

        {/* Guidance and Transparency Note */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-700">
          <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-slate-900">
              Irrigation Delivery Guidance:
            </div>
            <p>{plan.waterBudget.methodGuidance}</p>
            <p className="text-[11px] text-slate-500 italic">
              {plan.waterBudget.calculationMethodology} Note: AgroSaathi does not claim direct physical measurement of current soil moisture without field telemetry sensors.
            </p>
          </div>
        </div>
      </Card>

      {/* 6. Crop Growing Calendar & Milestones Timeline */}
      <Card className="p-5 sm:p-6 space-y-5 border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">
              {t("cpCalendarTitle")}
            </h3>
            <p className="text-xs text-slate-500">
              Chronological growth stages and critical operations for {plan.crop.name}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Active Stage</span>
            <span className="h-2 w-2 rounded-full bg-slate-300 ml-2" />
            <span>Upcoming</span>
          </div>
        </div>

        {/* Vertical Stage Milestones */}
        <div className="space-y-3">
          {plan.calendar.map((stage, idx) => {
            const isExpanded = expandedStageIndex === idx;

            return (
              <div
                key={stage.stageId}
                className={`border rounded-2xl transition-all overflow-hidden ${
                  stage.status === "active"
                    ? "border-emerald-300 bg-emerald-50/40 shadow-xs"
                    : "border-slate-200 bg-white"
                }`}
              >
                {/* Stage Header Button */}
                <button
                  type="button"
                  onClick={() => toggleStage(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        stage.status === "active"
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {stage.stageOrder}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {stage.stageName}
                        </span>
                        {stage.criticalWaterStage && (
                          <Badge variant="amber" size="sm" className="text-[10px] font-bold">
                            Critical Moisture
                          </Badge>
                        )}
                        {stage.status === "active" && (
                          <Badge variant="green" size="sm" className="text-[10px] font-bold">
                            Current Stage
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                        <span>
                          {new Date(stage.startDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}{" "}
                          –{" "}
                          {new Date(stage.endDate).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        <span>•</span>
                        <span>{stage.durationDays} days</span>
                        <span>•</span>
                        <span>FAO Kc: {stage.kc}</span>
                        <span>•</span>
                        <span className="text-sky-700 font-semibold">
                          ~{stage.waterDemandMm} mm
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {/* Expanded Stage Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100/80 space-y-3 bg-white">
                    <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl text-xs text-sky-950 flex items-start gap-2">
                      <Droplets className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Water Management: </span>
                        <span>{stage.irrigationGuidance}</span>
                      </div>
                    </div>

                    {stage.nutrientGuidance && (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-950 flex items-start gap-2">
                        <FlaskConical className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">Fertigation / Nutrition: </span>
                          <span>{stage.nutrientGuidance}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 pt-1">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                        Key Agronomic Tasks &amp; Cultural Operations:
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {stage.tasks.map((task, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-krishi-600 mt-1.5 shrink-0" />
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 7. Nutrition Management Plan (NPK) */}
      <Card className="p-5 sm:p-6 space-y-4 border-slate-200 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <FlaskConical className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {t("cpNutrientPlanTitle")}
              </h3>
              <p className="text-xs text-slate-500">
                Scaled for your {plan.input.landArea} {plan.input.areaUnit} ({plan.normalizedAreaAcres} acres)
              </p>
            </div>
          </div>
          <Badge variant="green" size="sm">
            ICAR Standard Doses
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="font-bold text-slate-900">Stage 1: Basal Application</div>
            <p className="text-slate-600 leading-relaxed">{plan.nutrientPlan.basalDose}</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="font-bold text-slate-900">Stage 2: Vegetative Top-Dress</div>
            <p className="text-slate-600 leading-relaxed">{plan.nutrientPlan.vegetativeTopDress}</p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="font-bold text-slate-900">Stage 3: Flowering / Reproductive</div>
            <p className="text-slate-600 leading-relaxed">{plan.nutrientPlan.floweringTopDress}</p>
          </div>
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950">
          <span className="font-bold">Organic Manure Requirement: </span>
          <span>{plan.nutrientPlan.organicManureFym}</span>
        </div>

        <div className="text-[11px] text-slate-500 italic">
          {plan.nutrientPlan.generalNote}
        </div>
      </Card>

      {/* 8. Field Reminders & Practical Next Steps */}
      <Card className="p-5 sm:p-6 space-y-3 border-slate-200 shadow-xs">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-krishi-700" />
          <span>Practical Next Steps &amp; Action Checklist</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
          {plan.fieldReminders.map((rem, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2"
            >
              <span className="h-5 w-5 rounded-full bg-krishi-100 text-krishi-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <span className="leading-tight">{rem}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 9. Scientific Sources, Citations & Transparency Disclaimer */}
      <div className="p-5 bg-slate-100/80 border border-slate-200 rounded-2xl space-y-3 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <BookOpen className="h-4 w-4 text-slate-600" />
          <span>{t("cpSourcesTitle")}</span>
        </div>
        <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-500">
          {plan.scientificSources.map((src, idx) => (
            <li key={idx}>{src}</li>
          ))}
        </ul>

        <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed">
          <span className="font-semibold text-slate-700">{t("cpDisclaimerTitle")}: </span>
          {plan.disclaimer}
        </div>
      </div>
    </div>
  );
};
