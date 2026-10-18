"use client";

import React, { useState, useMemo } from "react";
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Scale,
  Warehouse,
  TrendingUp,
  TrendingDown,
  Info,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ForecastDataPoint, HistoricalDataPoint } from "../types";
import { calculateSellOrWaitDecision } from "../services/sell-or-wait";
import { useLanguage } from "@/context/LanguageContext";

interface SellOrWaitAdvisorProps {
  latestDay: HistoricalDataPoint | null;
  forecasts: ForecastDataPoint[];
  commodity: string;
  market: string;
}

export const SellOrWaitAdvisor: React.FC<SellOrWaitAdvisorProps> = ({
  latestDay,
  forecasts,
  commodity,
  market,
}) => {
  const { t } = useLanguage();
  const [quantity, setQuantity] = useState<number>(10);
  const [unit, setUnit] = useState<"quintal" | "kg">("quintal");
  const [selectedHorizon, setSelectedHorizon] = useState<number>(1); // Day T+1 default
  const [storageCostPerQDay, setStorageCostPerQDay] = useState<number>(5); // Default ₹5/q/day
  const [spoilagePercent, setSpoilagePercent] = useState<number>(1); // Default 1% shrinkage
  const [extraTransport, setExtraTransport] = useState<number>(0);
  const [otherHoldingCost, setOtherHoldingCost] = useState<number>(0);

  // Find target forecast
  const targetForecast = forecasts.find((f) => f.horizonDays === selectedHorizon) || forecasts[0];

  const currentPrice = latestDay?.modalPrice || 0;
  const futureForecastPrice = targetForecast?.forecastPrice || currentPrice;

  // Compute decision
  const decision = useMemo(() => {
    return calculateSellOrWaitDecision({
      commodity,
      market,
      quantity,
      unit,
      currentPrice,
      currentDate: latestDay?.date || new Date().toISOString().slice(0, 10),
      selectedHorizonDay: selectedHorizon,
      futureForecastPrice,
      futureDate: targetForecast?.date || "",
      storageCostPerQuintalPerDay: storageCostPerQDay,
      spoilagePercent,
      extraTransportCost: extraTransport,
      otherHoldingCosts: otherHoldingCost,
    });
  }, [
    commodity,
    market,
    quantity,
    unit,
    currentPrice,
    latestDay,
    selectedHorizon,
    futureForecastPrice,
    targetForecast,
    storageCostPerQDay,
    spoilagePercent,
    extraTransport,
    otherHoldingCost,
  ]);

  if (!latestDay || forecasts.length === 0) {
    return null;
  }

  const isWait = decision.recommendation === "Consider waiting";
  const localizedRecommendation =
    decision.recommendation === "Consider waiting"
      ? t("recConsiderWaiting") || "Consider waiting"
      : decision.recommendation === "Consider selling now"
      ? t("recConsiderSellingNow") || "Consider selling now"
      : decision.recommendation;

  return (
    <Card className="p-5 bg-white border-slate-200 shadow-sm rounded-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-xs ${
              isWait ? "bg-emerald-600" : "bg-amber-600"
            }`}
          >
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>{t("sellOrWaitTitle") || "Should I Sell Now or Wait?"}</span>
              <Badge variant={isWait ? "green" : "neutral"} size="sm">
                {t("decisionToolBadge") || "Decision Tool"}
              </Badge>
            </h3>
            <p className="text-xs text-slate-400">
              {t("sellOrWaitDesc") || "Evaluates projected modal price trajectory against storage hire, crop shrinkage, and holding costs"}
            </p>
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 self-start sm:self-auto bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span>{t("todaysBenchmark") || "Today's Benchmark:"}</span>
          <strong className="text-slate-900">₹{currentPrice.toLocaleString("en-IN")}/q</strong>
        </div>
      </div>

      {/* Decision Banner Result */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isWait
            ? "bg-gradient-to-r from-emerald-50 via-emerald-100/40 to-teal-50 border-emerald-300"
            : "bg-gradient-to-r from-amber-50 via-orange-50/50 to-white border-amber-300"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  isWait ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                }`}
              >
                {localizedRecommendation}
              </span>
              <span className="text-xs text-slate-500 font-semibold">
                {t("horizonLabel") || "Horizon"}: {selectedHorizon} {t("daysAhead") || "Days Ahead"}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed max-w-xl">
              {decision.recommendationReason}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-slate-200/80 text-right shrink-0 md:min-w-[190px]">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {t("netFinancialDiff") || "Net Financial Difference"}
            </span>
            <span
              className={`block text-xl sm:text-2xl font-black mt-0.5 ${
                decision.netGainLoss > 0
                  ? "text-emerald-700"
                  : decision.netGainLoss < 0
                  ? "text-red-600"
                  : "text-slate-700"
              }`}
            >
              {decision.netGainLoss > 0 ? "+" : ""}₹{decision.netGainLoss.toLocaleString("en-IN")}
            </span>
            <span className="block text-[11px] text-slate-500 font-medium">
              ({decision.netPerQuintal > 0 ? "+" : ""}₹{decision.netPerQuintal}/q net)
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 text-xs">
        {/* Quantity & Unit */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Lot Quantity</span>
            <span className="text-[10px] text-slate-400">1q = 100kg</span>
          </label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={quantity || ""}
              onChange={(e) => setQuantity(Math.max(0.1, parseFloat(e.target.value) || 1))}
              className="w-full h-9 px-2.5 font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
            />
            <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setUnit("quintal")}
                className={`px-2 py-1 rounded text-[11px] font-bold ${
                  unit === "quintal"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Quintal
              </button>
              <button
                type="button"
                onClick={() => setUnit("kg")}
                className={`px-2 py-1 rounded text-[11px] font-bold ${
                  unit === "kg"
                    ? "bg-emerald-600 text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Kg
              </button>
            </div>
          </div>
        </div>

        {/* Forecast Horizon Pills */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Target Selling Day
          </label>
          <div className="grid grid-cols-4 gap-1">
            {forecasts.map((f) => (
              <button
                key={f.horizonDays}
                type="button"
                onClick={() => setSelectedHorizon(f.horizonDays)}
                className={`p-1 text-center rounded-lg border text-[11px] font-bold transition-all ${
                  selectedHorizon === f.horizonDays
                    ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="block text-[10px] opacity-80">T+{f.horizonDays}</span>
                <span className="block">₹{f.forecastPrice}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Storage Rate */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Storage Hire Cost</span>
            <span className="text-[10px] text-slate-400">₹/q/day</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="1"
              value={storageCostPerQDay}
              onChange={(e) => setStorageCostPerQDay(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full h-9 pl-6 pr-2.5 font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
            />
            <span className="absolute left-2.5 top-2.5 text-xs text-slate-400 font-bold">₹</span>
          </div>
        </div>

        {/* Spoilage / Shrinkage */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span>Shrinkage / Spoilage</span>
            <span className="text-[10px] text-slate-400">% loss</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="30"
              step="0.5"
              value={spoilagePercent}
              onChange={(e) => setSpoilagePercent(Math.max(0, parseFloat(e.target.value) || 0))}
              className="w-full h-9 pl-2.5 pr-6 font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:border-emerald-500 focus:outline-none"
            />
            <span className="absolute right-2.5 top-2.5 text-xs text-slate-400 font-bold">%</span>
          </div>
        </div>
      </div>

      {/* Financial Comparison Summary Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            1. Selling Today
          </span>
          <span className="block text-base font-extrabold text-slate-800 mt-1">
            ₹{decision.saleValueToday.toLocaleString("en-IN")}
          </span>
          <span className="block text-[10px] text-slate-500 mt-0.5">
            {decision.quantityQuintals} q @ ₹{currentPrice}/q (Known)
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            2. Future Gross Value
          </span>
          <span className="block text-base font-extrabold text-indigo-900 mt-1">
            ₹{decision.futureGrossValue.toLocaleString("en-IN")}
          </span>
          <span className="block text-[10px] text-slate-500 mt-0.5">
            {decision.effectiveFutureQuantity} q @ ₹{futureForecastPrice}/q
          </span>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            3. Holding Expenses
          </span>
          <span className="block text-base font-extrabold text-red-600 mt-1">
            -₹{decision.holdingCostsTotal.toLocaleString("en-IN")}
          </span>
          <span className="block text-[10px] text-slate-500 mt-0.5">
            Storage (₹{decision.storageCostTotal}) + Decay ({decision.spoilageLossKg} kg)
          </span>
        </div>

        <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
          <span className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            4. Net Proceeds Waiting
          </span>
          <span className="block text-base font-black text-emerald-950 mt-1">
            ₹{decision.estimatedNetProceedsWaiting.toLocaleString("en-IN")}
          </span>
          <span className="block text-[10px] text-emerald-700 font-semibold mt-0.5">
            Net In-Hand After {decision.holdingDays} Day{decision.holdingDays === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Uncertainty & Advisory Note */}
      <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-[11px] leading-relaxed">
        <Info className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
        <p>{decision.riskNote}</p>
      </div>
    </Card>
  );
};
