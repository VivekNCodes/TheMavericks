"use client";

import React, { useState } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SAMPLE_MANDI_RESULT } from "@/constants/sample-data";

export const MandiPricesPreview: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<"7D" | "1M" | "3M" | "6M">("7D");
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [selectedDistrict, setSelectedDistrict] = useState("Jaipur");

  const markets = SAMPLE_MANDI_RESULT.nearbyMarkets;
  const stats = SAMPLE_MANDI_RESULT.statistics;

  return (
    <div className="space-y-6">
      {/* Filter Bar matching Reference Screen 3 */}
      <Card className="p-4 sm:p-5 bg-white border-slate-200 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Crop
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-medium text-slate-800"
            >
              <option value="Tomato">Tomato</option>
              <option value="Wheat">Wheat</option>
              <option value="Potato">Potato</option>
              <option value="Onion">Onion</option>
              <option value="Mustard">Mustard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              State
            </label>
            <select
              defaultValue="Rajasthan"
              className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-medium text-slate-800"
            >
              <option value="Rajasthan">Rajasthan</option>
              <option value="Punjab">Punjab</option>
              <option value="Haryana">Haryana</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-medium text-slate-800"
            >
              <option value="Jaipur">Jaipur</option>
              <option value="Alwar">Alwar</option>
              <option value="Kota">Kota</option>
              <option value="Jodhpur">Jodhpur</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              View
            </label>
            <select
              defaultValue="Last 7 Days"
              className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-medium text-slate-800"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 1 Month">Last 1 Month</option>
              <option value="Last 3 Months">Last 3 Months</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <Button
              variant="primary"
              size="md"
              className="w-full justify-center"
              leftIcon={<Search className="h-4 w-4" />}
            >
              Search
            </Button>
          </div>
        </div>
      </Card>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Nearby Markets List */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-slate-900">
                Nearby Markets
              </h4>
              <span className="text-xs text-slate-400">Within 50 km</span>
            </div>

            <div className="space-y-2.5">
              {markets.map((market) => (
                <div
                  key={market.name}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-krishi-300 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 border border-slate-200/80 shadow-xs">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-800">
                        {market.name}
                      </h5>
                      <span className="text-xs text-slate-400">
                        {market.distanceKm} km • Jaipur
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="block text-sm font-extrabold text-slate-900">
                      ₹{market.price.toLocaleString("en-IN")}/Quintal
                    </span>
                    <span
                      className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                        market.trendPercent >= 0
                          ? "text-emerald-700"
                          : "text-red-600"
                      }`}
                    >
                      {market.trendPercent >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>
                        {market.trendPercent >= 0 ? "+" : ""}
                        {market.trendPercent}%
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (7 Cols): Price Trend Chart & Stat Metrics */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6">
            {/* Chart Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Price Trend - Jaipur Mandi ({selectedCrop})
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Modal rate movements over time (₹ / Quintal)
                </p>
              </div>

              {/* Timeframe Selector Pills */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
                {(["7D", "1M", "3M", "6M"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setSelectedRange(range)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      selectedRange === range
                        ? "bg-white text-krishi-800 shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Visual Price Trend Chart with Area Gradient Fill */}
            <div className="relative h-56 w-full pt-2">
              <svg
                viewBox="0 0 500 180"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="mandiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="0" y1="130" x2="500" y2="130" stroke="#E2E8F0" strokeDasharray="3 3" />

                {/* Y Axis labels */}
                <text x="5" y="26" fontSize="10" fill="#94A3B8">₹2,200</text>
                <text x="5" y="76" fontSize="10" fill="#94A3B8">₹1,800</text>
                <text x="5" y="126" fontSize="10" fill="#94A3B8">₹1,400</text>

                {/* Gradient area under curve */}
                <path
                  d="M 50 130 Q 115 110, 180 100 T 310 70 T 440 45 L 440 160 L 50 160 Z"
                  fill="url(#mandiGradient)"
                />

                {/* Trend line */}
                <path
                  d="M 50 130 Q 115 110, 180 100 T 310 70 T 440 45"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Data point dots */}
                {[
                  { cx: 50, cy: 130, label: "10 Oct" },
                  { cx: 115, cy: 110, label: "11 Oct" },
                  { cx: 180, cy: 100, label: "12 Oct" },
                  { cx: 245, cy: 85, label: "13 Oct" },
                  { cx: 310, cy: 70, label: "14 Oct" },
                  { cx: 375, cy: 60, label: "15 Oct" },
                  { cx: 440, cy: 45, label: "16 Oct" },
                ].map((pt, i) => (
                  <g key={i}>
                    <circle
                      cx={pt.cx}
                      cy={pt.cy}
                      r="4.5"
                      fill="#FFFFFF"
                      stroke="#16A34A"
                      strokeWidth="2.5"
                    />
                    <text
                      x={pt.cx}
                      y="175"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#64748B"
                      fontWeight="500"
                    >
                      {pt.label}
                    </text>
                  </g>
                ))}
              </svg>
            </div>

            {/* Bottom 4 Summary Stat Tiles matching Reference Image */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
              <div className="p-3 rounded-xl bg-slate-50 text-center">
                <span className="block text-[11px] font-semibold text-slate-400">
                  Minimum Price
                </span>
                <span className="block text-base font-extrabold text-slate-800 mt-0.5">
                  ₹{stats.minPrice.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 text-center border border-emerald-100">
                <span className="block text-[11px] font-semibold text-emerald-700">
                  Modal Price
                </span>
                <span className="block text-base font-extrabold text-krishi-800 mt-0.5">
                  ₹{stats.modalPrice.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 text-center">
                <span className="block text-[11px] font-semibold text-slate-400">
                  Maximum Price
                </span>
                <span className="block text-base font-extrabold text-slate-800 mt-0.5">
                  ₹{stats.maxPrice.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 text-center">
                <span className="block text-[11px] font-semibold text-slate-400">
                  Total Arrival
                </span>
                <span className="block text-base font-extrabold text-slate-800 mt-0.5">
                  {stats.totalArrival}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
