"use client";

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  Award,
  Truck,
  Coins,
  Scale,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Calculator,
  ChevronDown,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { NormalizedMandiRecord } from "../types";
import { calculateMandiProfitComparison } from "../services/profit-calculator";

interface MandiProfitComparisonProps {
  records: NormalizedMandiRecord[];
  cropName: string;
  quantityQuintals: number;
}

export const MandiProfitComparison: React.FC<MandiProfitComparisonProps> = ({
  records,
  cropName,
  quantityQuintals,
}) => {
  // Allow custom transport & additional cost overrides per mandi
  const [transportOverrides, setTransportOverrides] = useState<Record<string, number>>({});
  const [additionalCostsOverrides, setAdditionalCostsOverrides] = useState<Record<string, number>>({});
  const [defaultTransportPerMandi, setDefaultTransportPerMandi] = useState(500);
  const [defaultAdditionalCosts, setDefaultAdditionalCosts] = useState(100);

  // Take top mandis from current records for the selected crop
  const eligibleMandis = useMemo(() => {
    // Deduplicate by mandiName
    const unique = new Map<string, NormalizedMandiRecord>();
    for (const r of records) {
      if (!unique.has(r.mandiName)) {
        unique.set(r.mandiName, r);
      }
    }
    return Array.from(unique.values()).slice(0, 6); // Top 6 mandis for comparison
  }, [records]);

  // Compute profit rankings
  const rankedItems = useMemo(() => {
    const mandisInput = eligibleMandis.map((m, idx) => {
      // Default freight estimation based on arbitrary 25-50km distance if not specified
      const transport =
        transportOverrides[m.mandiName] !== undefined
          ? transportOverrides[m.mandiName]
          : defaultTransportPerMandi + idx * 100;

      const additional =
        additionalCostsOverrides[m.mandiName] !== undefined
          ? additionalCostsOverrides[m.mandiName]
          : defaultAdditionalCosts;

      return {
        mandiName: m.mandiName,
        district: m.district,
        state: m.state,
        modalPrice: m.modalPrice,
        minPrice: m.minPrice,
        maxPrice: m.maxPrice,
        reportingDate: m.recordDate,
        distanceKm: 25 + idx * 15,
        transportCost: transport,
        additionalCosts: additional,
      };
    });

    return calculateMandiProfitComparison({
      cropName: cropName || "Produce",
      quantityQuintals: quantityQuintals > 0 ? quantityQuintals : 10,
      mandis: mandisInput,
    });
  }, [
    eligibleMandis,
    cropName,
    quantityQuintals,
    transportOverrides,
    additionalCostsOverrides,
    defaultTransportPerMandi,
    defaultAdditionalCosts,
  ]);

  if (rankedItems.length === 0) {
    return null;
  }

  const topMandi = rankedItems[0];

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>Where Should I Sell? — Net Profit Calculator</span>
              <Badge variant="green" size="sm">
                Estimate
              </Badge>
            </h3>
            <p className="text-xs text-slate-500">
              Accounts for modal rates, transport fuel/hire, and APMC cess for{" "}
              <strong className="text-emerald-700">{quantityQuintals} Quintals</strong> of{" "}
              <strong className="text-emerald-700">{cropName || "Crop"}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Top Recommendation Banner (The "Best Choice") */}
      {topMandi && (
        <Card className="p-5 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-md rounded-2xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider text-emerald-100">
                  <Award className="h-3.5 w-3.5 text-amber-300" />
                  Top Recommended Market
                </span>
                <span className="text-xs text-emerald-100">Rank #1</span>
              </div>

              <h4 className="text-xl sm:text-2xl font-black tracking-tight">
                Sell at {topMandi.mandiName} ({topMandi.district})
              </h4>

              <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed font-medium">
                {topMandi.rankingExplanation}
              </p>
            </div>

            {/* Quick figures pill */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shrink-0 text-right md:min-w-[200px]">
              <span className="block text-xs font-semibold text-emerald-200">
                Estimated Net In-Hand
              </span>
              <span className="block text-2xl sm:text-3xl font-black text-white mt-0.5">
                ₹{topMandi.estimatedNetEarnings.toLocaleString("en-IN")}
              </span>
              <span className="block text-[11px] text-emerald-100 font-medium mt-1">
                ≈ ₹{topMandi.estimatedNetPerQuintal.toLocaleString("en-IN")}/quintal net
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {rankedItems.map((item) => {
          const isTop = item.rank === 1;

          return (
            <Card
              key={item.mandiId}
              className={`p-4 rounded-2xl transition-all relative ${
                isTop
                  ? "bg-white border-2 border-emerald-500 shadow-sm"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black ${
                        isTop
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      #{item.rank}
                    </span>
                    <h5 className="font-bold text-slate-900 text-sm">
                      {item.mandiName}
                    </h5>
                  </div>
                  <span className="text-[11px] text-slate-400 ml-6 block">
                    {item.district}, {item.state}
                  </span>
                </div>

                <Badge
                  variant={isTop ? "green" : item.rank === 2 ? "neutral" : "neutral"}
                  size="sm"
                >
                  {item.rankBadge}
                </Badge>
              </div>

              {/* Financial Calculation Breakdown */}
              <div className="space-y-2 text-xs border-y border-slate-100 py-3 my-2">
                {/* Gross value */}
                <div className="flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1">
                    <Coins className="h-3 w-3 text-amber-500" />
                    Gross Sale Value:
                  </span>
                  <span className="font-bold text-slate-900">
                    ₹{item.grossSaleValue.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 pl-4">
                  ({quantityQuintals} q × ₹{item.modalPrice.toLocaleString("en-IN")}/q)
                </div>

                {/* Transport Cost (Editable) */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="flex items-center gap-1 text-slate-600 text-xs">
                    <Truck className="h-3 w-3 text-blue-500" />
                    Transport Cost:
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 text-xs">- ₹</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={item.transportCost}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setTransportOverrides((prev) => ({
                          ...prev,
                          [item.mandiName]: isNaN(val) || val < 0 ? 0 : val,
                        }));
                      }}
                      className="w-16 h-7 px-1.5 text-right font-semibold bg-slate-50 border border-slate-200 rounded-md text-slate-800 text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Additional costs (APMC fee, loading) */}
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 text-slate-600 text-xs">
                    <Scale className="h-3 w-3 text-purple-500" />
                    APMC Fee / Misc:
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-400 text-xs">- ₹</span>
                    <input
                      type="number"
                      min="0"
                      step="25"
                      value={item.additionalCosts}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setAdditionalCostsOverrides((prev) => ({
                          ...prev,
                          [item.mandiName]: isNaN(val) || val < 0 ? 0 : val,
                        }));
                      }}
                      className="w-16 h-7 px-1.5 text-right font-semibold bg-slate-50 border border-slate-200 rounded-md text-slate-800 text-xs focus:bg-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Line: Estimated Net Profit */}
              <div className="pt-1 flex items-center justify-between">
                <div>
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Est. Net Earnings
                  </span>
                  <span
                    className={`block text-lg font-black ${
                      isTop ? "text-emerald-700" : "text-slate-900"
                    }`}
                  >
                    ₹{item.estimatedNetEarnings.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[11px] text-slate-400 font-medium">
                    Net / Quintal
                  </span>
                  <span className="block text-xs font-bold text-slate-700">
                    ₹{item.estimatedNetPerQuintal.toLocaleString("en-IN")}/q
                  </span>
                </div>
              </div>

              {/* Explanation Note */}
              <div className="mt-2.5 pt-2 border-t border-slate-50 text-[11px] text-slate-500 leading-tight">
                {item.rankingExplanation}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Transparency Disclaimer */}
      <div className="flex items-start gap-2 p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-800">
        <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
        <p className="leading-relaxed">
          <strong>Important Farmer Advisory:</strong> All net proceeds are model estimates based on official wholesale modal rates reported by AGMARKNET. Actual auction returns may vary depending on moisture content, produce grade, daily arrivals, and negotiated vehicle freight.
        </p>
      </div>
    </div>
  );
};
