"use client";

import React from "react";
import { Search, RefreshCw, Filter, RotateCcw, Scale } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface MandiFilterBarProps {
  selectedState: string;
  onStateChange: (state: string) => void;
  selectedDistrict: string;
  onDistrictChange: (district: string) => void;
  selectedCrop: string;
  onCropChange: (crop: string) => void;
  selectedMarket: string;
  onMarketChange: (market: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  quantityQuintals: number;
  onQuantityChange: (qty: number) => void;
  availableStates: string[];
  availableDistricts: string[];
  availableCrops: string[];
  availableMarkets: string[];
  isLoading: boolean;
  onRefresh: () => void;
  onReset: () => void;
}

export const MandiFilterBar: React.FC<MandiFilterBarProps> = ({
  selectedState,
  onStateChange,
  selectedDistrict,
  onDistrictChange,
  selectedCrop,
  onCropChange,
  selectedMarket,
  onMarketChange,
  searchQuery,
  onSearchChange,
  quantityQuintals,
  onQuantityChange,
  availableStates,
  availableDistricts,
  availableCrops,
  availableMarkets,
  isLoading,
  onRefresh,
  onReset,
}) => {
  return (
    <Card className="p-4 sm:p-5 bg-white border-slate-200 shadow-sm rounded-2xl">
      <div className="flex flex-col gap-4">
        {/* Header row with quick title and actions */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Filter Mandi Rates & Net-Profit Calculator
              </h3>
              <p className="text-xs text-slate-400">
                Filter official Agmarknet wholesale prices by geography and crop
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="text-xs font-semibold"
              leftIcon={<RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />}
            >
              {isLoading ? "Fetching..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Primary Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
          {/* State */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              State <span className="text-emerald-600 font-bold">*</span>
            </label>
            <select
              value={selectedState}
              onChange={(e) => onStateChange(e.target.value)}
              className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-none font-medium text-slate-800 transition-colors"
            >
              <option value="">All States</option>
              {availableStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-none font-medium text-slate-800 transition-colors"
            >
              <option value="">All Districts</option>
              {availableDistricts.map((dst) => (
                <option key={dst} value={dst}>
                  {dst}
                </option>
              ))}
            </select>
          </div>

          {/* Commodity / Crop */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Crop / Commodity
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => onCropChange(e.target.value)}
              className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-none font-medium text-slate-800 transition-colors"
            >
              <option value="">All Crops</option>
              {availableCrops.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Mandi / Market */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Mandi / Market
            </label>
            <select
              value={selectedMarket}
              onChange={(e) => onMarketChange(e.target.value)}
              className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-none font-medium text-slate-800 transition-colors"
            >
              <option value="">All Mandis</option>
              {availableMarkets.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity in Quintals for Profit Calculation */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center justify-between">
              <span>Lot Size</span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                Profit Calc
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={quantityQuintals || ""}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  onQuantityChange(isNaN(val) || val <= 0 ? 1 : val);
                }}
                className="w-full h-10 pl-8 pr-12 text-xs sm:text-sm bg-emerald-50/40 border border-emerald-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-none font-bold text-slate-900 transition-colors"
              />
              <Scale className="absolute left-2.5 top-3 h-4 w-4 text-emerald-600" />
              <span className="absolute right-2.5 top-3 text-[11px] font-semibold text-slate-500 pointer-events-none">
                Quintals
              </span>
            </div>
          </div>

          {/* Search Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Quick Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search mandi, crop..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-10 pl-8 pr-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-emerald-500 focus:bg-white focus:outline-none font-medium text-slate-800 transition-colors"
              />
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
