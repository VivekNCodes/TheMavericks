"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  CloudRain,
  Droplet,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/hooks/useWeather";
import { SAMPLE_QUICK_INSIGHTS } from "@/constants/sample-data";
import { cn } from "@/lib/utils";

export interface QuickInsightsSectionProps {
  className?: string;
}

export const QuickInsightsSection: React.FC<QuickInsightsSectionProps> = ({
  className,
}) => {
  const { t } = useLanguage();
  const { weather } = useWeather("Jaipur, Rajasthan");
  const data = SAMPLE_QUICK_INSIGHTS;

  const rainMm = weather.tomorrowRainMm ?? data.rainfall.amountMm;

  return (
    <Card className={cn("p-5 sm:p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          {t("insightsTitle")}
        </h3>
        <Link
          href="/mandi-prices"
          className="inline-flex items-center gap-1 text-xs font-semibold text-krishi-700 hover:text-krishi-800 transition-colors"
        >
          <span>{t("viewAll")}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 3 Metric Rows / Tiles */}
      <div className="space-y-3.5">
        {/* Insight 1: Market Price */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-emerald-300 transition-colors">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-slate-500">
              {t("marketPrice")}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-slate-900">
                ₹{data.marketPrice.pricePerQuintal.toLocaleString("en-IN")}{t("quintalUnit")}
              </span>
            </div>
            <span className="block text-[11px] text-slate-400">
              {t("cropTomato")} ({data.marketPrice.mandi})
            </span>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {/* Trend Pill */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <TrendingUp className="h-3 w-3" />
              <span>+{data.marketPrice.trendPercent}%</span>
            </span>

            {/* Mini SVG Sparkline */}
            <svg
              className="w-16 h-6 stroke-emerald-600 fill-emerald-100/40"
              viewBox="0 0 60 20"
            >
              <path
                d="M 2 16 Q 15 14, 25 10 T 45 6 T 58 2"
                fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Insight 2: Rainfall Expected (Live API Synced) */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-sky-300 transition-colors">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-slate-500">
              {t("rainfallExpected")}
            </span>
            <div className="text-base font-extrabold text-slate-900">
              {rainMm} mm
            </div>
            <span className="block text-[11px] text-slate-400">
              {t("tomorrow")} • {weather.condition}
            </span>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 border border-sky-200 shadow-sm">
            <CloudRain className="h-6 w-6 stroke-[2]" />
          </div>
        </div>

        {/* Insight 3: Irrigation */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-sky-300 transition-colors">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-slate-500">
              {t("irrigationNeeded")}
            </span>
            <div className="text-base font-extrabold text-slate-900">
              {t("checkInDays")}
            </div>
            <span className="block text-[11px] text-slate-400">
              {t("cropTomato")} ({t("yourField")})
            </span>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 border border-sky-200 shadow-sm">
            <Droplet className="h-6 w-6 stroke-[2]" />
          </div>
        </div>
      </div>
    </Card>
  );
};
