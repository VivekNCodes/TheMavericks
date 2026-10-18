"use client";

import React, { useState } from "react";
import {
  Calculator,
  TrendingUp,
  X,
  CheckCircle,
  ArrowRight,
  Info,
  DollarSign,
  Percent,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getMandiBenchmark } from "../data/mandi-benchmarks";

interface ProfitCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  cropName?: string;
  defaultPricePerQuintal?: number;
  defaultQuantityQuintal?: number;
}

export const ProfitCalculatorModal: React.FC<ProfitCalculatorModalProps> = ({
  isOpen,
  onClose,
  cropName = "Tomato",
  defaultPricePerQuintal = 1800,
  defaultQuantityQuintal = 10,
}) => {
  const [crop, setCrop] = useState(cropName);
  const [askingPrice, setAskingPrice] = useState(defaultPricePerQuintal);
  const [quantity, setQuantity] = useState(defaultQuantityQuintal);
  const [mandiCommissionPercent, setMandiCommissionPercent] = useState(6.5); // standard APMC commission + labor
  const [transportCostPerQ, setTransportCostPerQ] = useState(80); // ₹80/Q cartage to APMC

  if (!isOpen) return null;

  const benchmark = getMandiBenchmark(crop);
  const mandiModalRate = benchmark ? benchmark.modalPriceQuintal : 1850;

  // Selling via Mandi calculations
  const grossMandiRevenue = mandiModalRate * quantity;
  const mandiCommissionCost = Math.round(grossMandiRevenue * (mandiCommissionPercent / 100));
  const mandiTransportCost = transportCostPerQ * quantity;
  const netMandiEarnings = grossMandiRevenue - mandiCommissionCost - mandiTransportCost;

  // Selling directly on AgroSaathi Marketplace calculations
  // Direct farmgate or direct trade eliminates middleman commission and APMC cess
  const grossMarketplaceRevenue = askingPrice * quantity;
  const directPlatformFee = 0; // 0% commission on AgroSaathi
  const netMarketplaceEarnings = grossMarketplaceRevenue - directPlatformFee;

  // Comparative Gain
  const additionalProfit = netMarketplaceEarnings - netMandiEarnings;
  const percentGain = netMandiEarnings > 0 ? (additionalProfit / netMandiEarnings) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-krishi-700 to-krishi-900 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xs text-white">
              <Calculator className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                Farmer Profit & Mandi Comparison Calculator
              </h3>
              <p className="text-xs text-krishi-100">
                Compare direct marketplace earnings against APMC mandi intermediary deductions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Inputs Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Crop Selection
              </label>
              <select
                value={crop}
                onChange={(e) => {
                  const val = e.target.value;
                  setCrop(val);
                  const bm = getMandiBenchmark(val);
                  if (bm) setAskingPrice(bm.modalPriceQuintal);
                }}
                className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-medium text-slate-800"
              >
                <option value="Tomato">Tomato</option>
                <option value="Wheat">Wheat</option>
                <option value="Potato">Potato</option>
                <option value="Onion">Onion</option>
                <option value="Mustard">Mustard</option>
                <option value="Chili">Chili</option>
                <option value="Soybean">Soybean</option>
                <option value="Garlic">Garlic</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Listing Price (₹ / Quintal)
              </label>
              <input
                type="number"
                min="100"
                step="50"
                value={askingPrice}
                onChange={(e) => setAskingPrice(Number(e.target.value) || 0)}
                className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-bold text-krishi-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quantity (Quintals)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 0)}
                className="w-full h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-bold text-slate-800"
              />
            </div>
          </div>

          {/* Mandi Benchmark Reference Banner */}
          <div className="flex items-center justify-between p-3.5 bg-amber-50/80 border border-amber-200/90 rounded-2xl text-xs">
            <div className="flex items-center gap-2.5 text-amber-900 font-medium">
              <Info className="h-4 w-4 shrink-0 text-amber-700" />
              <span>
                <strong>Official Mandi Modal Benchmark:</strong>{" "}
                ₹{mandiModalRate.toLocaleString("en-IN")}/Quintal ({benchmark ? benchmark.mandiName : "APMC Mandi"} on {benchmark ? benchmark.updatedDate : "Recent"})
              </span>
            </div>
            <Badge variant="amber" size="sm">
              Mandi Reference
            </Badge>
          </div>

          {/* Side by Side Comparison Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Traditional Mandi Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Traditional APMC Mandi
                </span>
                <span className="text-xs text-red-600 font-semibold">Middlemen Cuts</span>
              </div>

              <div className="text-2xl font-black text-slate-800">
                ₹{netMandiEarnings.toLocaleString("en-IN")}
                <span className="text-xs font-medium text-slate-400 block">
                  Net in Hand after deductions
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200 pt-2.5">
                <div className="flex justify-between">
                  <span>Gross Mandi Value:</span>
                  <span className="font-semibold">₹{grossMandiRevenue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Trader Commission & Cess ({mandiCommissionPercent}%):</span>
                  <span>-₹{mandiCommissionCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Mandi Transport & Cartage:</span>
                  <span>-₹{mandiTransportCost.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Direct AgroSaathi Marketplace Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-krishi-300 space-y-3 relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <Badge variant="green" size="sm">
                  0% Commission
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-krishi-800">
                  AgroSaathi Direct Trade
                </span>
              </div>

              <div className="text-2xl font-black text-krishi-800">
                ₹{netMarketplaceEarnings.toLocaleString("en-IN")}
                <span className="text-xs font-medium text-emerald-600 block">
                  Direct Farmgate / Buyer payment
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-700 border-t border-krishi-200 pt-2.5">
                <div className="flex justify-between">
                  <span>Direct Sale Gross:</span>
                  <span className="font-semibold">₹{grossMarketplaceRevenue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Intermediary Commission:</span>
                  <span>₹0 (100% Retained)</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Pickup / Farmgate Cartage:</span>
                  <span>Coordinated Direct</span>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Net Gain Highlight Box */}
          <div className="p-4 bg-gradient-to-r from-krishi-100 to-emerald-50 rounded-2xl border border-krishi-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-krishi-700 text-white font-bold">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs text-krishi-800 font-bold block">
                  Estimated Extra Farmer Earnings
                </span>
                <span className="text-xl font-black text-krishi-900">
                  {additionalProfit >= 0 ? "+" : ""}₹{additionalProfit.toLocaleString("en-IN")}{" "}
                  <span className="text-xs font-extrabold text-krishi-700">
                    ({percentGain >= 0 ? "+" : ""}{percentGain.toFixed(1)}%)
                  </span>
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
              leftIcon={<CheckCircle className="h-4 w-4" />}
            >
              Apply to Listing
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Calculator
          </Button>
        </div>
      </div>
    </div>
  );
};
