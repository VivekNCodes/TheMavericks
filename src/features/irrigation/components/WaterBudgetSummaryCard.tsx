"use client";

import React from "react";
import {
  Droplets,
  CloudRain,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Sparkles,
  Info,
  Radio,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { WaterBudgetBreakdown } from "../types";

interface WaterBudgetSummaryCardProps {
  budget: WaterBudgetBreakdown;
  cropName: string;
  growthStage: string;
  soilType: string;
  irrigationMethod: string;
}

export const WaterBudgetSummaryCard: React.FC<WaterBudgetSummaryCardProps> = ({
  budget,
  cropName,
  growthStage,
  soilType,
  irrigationMethod,
}) => {
  const budgetUtilization = Math.round(
    (budget.grossIrrigationRequirementLiters / Math.max(1, budget.availableWaterBudgetLiters)) * 100
  );

  const isDeficit = budget.budgetDeficitSurplusLiters < 0;

  return (
    <Card className="p-4 sm:p-6 space-y-5 bg-white border-slate-200 shadow-sm">
      {/* Header with Title and Mode Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-100">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base font-bold text-slate-900">
                Single-Field Water Budget Balance
              </h4>
              {budget.weatherForecastSource === "live_open_meteo" ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <Radio className="h-3 w-3 text-emerald-600 shrink-0" />
                  Live Telemetry
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  <Info className="h-3 w-3 text-slate-500 shrink-0" />
                  Climatological Fallback
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              5-Day Demand vs. Farm Water Limit ({budget.fieldAreaAcres} Acre · {soilType} Soil · {growthStage})
            </p>
          </div>
        </div>

        <div className="shrink-0">
          {isDeficit ? (
            <Badge variant="amber" size="md">
              <AlertTriangle className="h-3.5 w-3.5 mr-1 shrink-0" />
              Budget Shortfall (उपलब्ध पानी की कमी): {Math.abs(budget.budgetDeficitSurplusLiters).toLocaleString("en-IN")} L
            </Badge>
          ) : (
            <Badge variant="green" size="md">
              <ShieldCheck className="h-3.5 w-3.5 mr-1 shrink-0" />
              Water Surplus (अतिरिक्त पानी): +{budget.budgetDeficitSurplusLiters.toLocaleString("en-IN")} L
            </Badge>
          )}
        </div>
      </div>

      {/* 4 Key Volumetric Metric Pillars - Equalized flex heights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1: Total Crop Demand */}
        <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200/80 flex flex-col justify-between min-h-[105px]">
          <div>
            <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5 mb-1.5">
              <Droplets className="h-3.5 w-3.5 text-sky-600 shrink-0" />
              Gross Crop Demand (फसल की कुल मांग)
            </span>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {budget.totalCropDemandLiters.toLocaleString("en-IN")}{" "}
              <span className="text-xs font-normal text-slate-500">L</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block border-t border-slate-200/60 pt-1.5 truncate">
            {budget.totalCropDemandMm} mm depth ({cropName})
          </span>
        </div>

        {/* Metric 2: Effective Rain Credit */}
        <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-between min-h-[105px]">
          <div>
            <span className="text-[11px] font-semibold text-emerald-800 flex items-center gap-1.5 mb-1.5">
              <CloudRain className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              Effective Rain Credit (प्रभावी बारिश)
            </span>
            <div className="text-xl font-black text-emerald-900 tracking-tight">
              -{budget.totalEffectiveRainLiters.toLocaleString("en-IN")}{" "}
              <span className="text-xs font-normal text-emerald-700">L</span>
            </div>
          </div>
          <span className="text-[10px] text-emerald-700 mt-2 block border-t border-emerald-200/50 pt-1.5 truncate">
            {budget.totalEffectiveRainMm} mm USDA-SCS model
          </span>
        </div>

        {/* Metric 3: Gross Irrigation Need (at pump) */}
        <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-100 flex flex-col justify-between min-h-[105px]">
          <div>
            <span className="text-[11px] font-semibold text-sky-800 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="h-3.5 w-3.5 text-sky-600 shrink-0" />
              अनुमानित सिंचाई की जरूरत (GIR)
            </span>
            <div className="text-xl font-black text-sky-950 tracking-tight">
              {budget.grossIrrigationRequirementLiters.toLocaleString("en-IN")}{" "}
              <span className="text-xs font-normal text-sky-700">L</span>
            </div>
          </div>
          <span className="text-[10px] text-sky-700 mt-2 block border-t border-sky-200/50 pt-1.5 truncate">
            Net root: {budget.netIrrigationNeedLiters.toLocaleString("en-IN")} L ({budget.netIrrigationNeedDepthMm} mm)
          </span>
        </div>

        {/* Metric 4: Available Water Budget */}
        <div className={`p-3.5 rounded-xl border flex flex-col justify-between min-h-[105px] ${
          isDeficit ? "bg-amber-50/70 border-amber-200" : "bg-krishi-50/60 border-krishi-200"
        }`}>
          <div>
            <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5 mb-1.5">
              <Scale className="h-3.5 w-3.5 text-krishi-700 shrink-0" />
              Available Water Budget
            </span>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {budget.availableWaterBudgetLiters.toLocaleString("en-IN")}{" "}
              <span className="text-xs font-normal text-slate-500">L</span>
            </div>
          </div>
          <span className="text-[10px] text-slate-500 mt-2 block border-t border-slate-200/60 pt-1.5 truncate">
            User Specified Budget Cap
          </span>
        </div>
      </div>

      {/* Budget Utilization Progress Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
          <span className="font-semibold text-slate-700">
            Water Budget Allocation Ratio:{" "}
            <span className={isDeficit ? "text-amber-700 font-bold" : "text-krishi-800 font-bold"}>
              {budgetUtilization}% of budget needed
            </span>
          </span>
          <span className="text-slate-500 text-[11px]">
            Application Method: <span className="font-semibold text-slate-700 capitalize">{irrigationMethod}</span> ({Math.round(budget.irrigationEfficiency * 100)}% efficiency)
          </span>
        </div>
        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              budgetUtilization > 100
                ? "bg-amber-500"
                : budgetUtilization > 75
                ? "bg-sky-500"
                : "bg-krishi-600"
            }`}
            style={{ width: `${Math.min(100, budgetUtilization)}%` }}
          />
        </div>
      </div>

      {/* Soil Moisture Depletion Status Strip (With Explicit Agronomic Assumption) */}
      <div className="space-y-2 p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-start sm:items-center gap-2 text-slate-700">
            <Info className="h-4 w-4 text-sky-600 shrink-0 mt-0.5 sm:mt-0" />
            <span className="leading-snug">
              <strong>Estimated Root-Zone Depletion (मिट्टी में बची नमी का अनुमान):</strong> {budget.estimatedRootZoneDepletionMm} mm{" "}
              <span className="text-slate-500">
                (RAW safe buffer: {budget.readilyAvailableWaterMm} mm · TAW: {budget.totalAvailableWaterMm} mm)
              </span>
            </span>
          </div>
          <div className="shrink-0 flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Depletion Status:</span>
            {budget.depletionStatus === "within_buffer" ? (
              <Badge variant="green" size="sm">Within Safe Buffer</Badge>
            ) : budget.depletionStatus === "near_stress" ? (
              <Badge variant="amber" size="sm">Approaching Stress Threshold</Badge>
            ) : (
              <Badge variant="red" size="sm">Moisture Stressed</Badge>
            )}
          </div>
        </div>

        <p className="text-[11px] text-slate-500 italic border-t border-slate-200/60 pt-1.5 leading-relaxed">
          {budget.initialSoilMoistureAssumption}
        </p>
      </div>
    </Card>
  );
};

