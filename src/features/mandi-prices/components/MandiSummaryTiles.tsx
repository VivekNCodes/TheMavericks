"use client";

import React from "react";
import {
  TrendingUp,
  Sparkles,
  Database,
  Globe2,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface MandiSummaryTilesProps {
  minPrice: number;
  modalPrice: number;
  maxPrice: number;
  highestPriceMarket: string | null;
  totalRecords: number;
  latestReportingDate: string | null;
  dataSource: string;
  isLiveApi: boolean;
  isDatabaseBacked: boolean;
  cropName: string;
}

export const MandiSummaryTiles: React.FC<MandiSummaryTilesProps> = ({
  minPrice,
  modalPrice,
  maxPrice,
  highestPriceMarket,
  totalRecords,
  latestReportingDate,
  dataSource,
  isLiveApi,
  isDatabaseBacked,
  cropName,
}) => {
  const formattedDate = latestReportingDate
    ? new Date(latestReportingDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-3">
      {/* 4 Summary Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Min Price */}
        <Card className="p-4 bg-white border-slate-200">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Lowest Min Price
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-800">
              ₹{minPrice > 0 ? minPrice.toLocaleString("en-IN") : "—"}
            </span>
            <span className="text-xs font-semibold text-slate-400">/Quintal</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Base wholesale floor
          </span>
        </Card>

        {/* Modal Price (Benchmark) */}
        <Card className="p-4 bg-emerald-50/70 border-emerald-200">
          <div className="flex items-center justify-between">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Benchmark Modal Rate
            </span>
            <Badge variant="green" size="sm">
              Prevailing
            </Badge>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-900">
              ₹{modalPrice > 0 ? modalPrice.toLocaleString("en-IN") : "—"}
            </span>
            <span className="text-xs font-semibold text-emerald-700">/Quintal</span>
          </div>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">
            Most frequent trading price
          </span>
        </Card>

        {/* Max Price */}
        <Card className="p-4 bg-white border-slate-200">
          <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Highest Ceiling Price
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-800">
              ₹{maxPrice > 0 ? maxPrice.toLocaleString("en-IN") : "—"}
            </span>
            <span className="text-xs font-semibold text-slate-400">/Quintal</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Top grade maximum quote
          </span>
        </Card>

        {/* Highest Price Market */}
        <Card className="p-4 bg-gradient-to-br from-amber-50/60 to-white border-amber-200/80">
          <div className="flex items-center justify-between">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Top Value Market
            </span>
            <Sparkles className="h-4 w-4 text-amber-600" />
          </div>
          <span className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 block truncate">
            {highestPriceMarket || "No records"}
          </span>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
            Maximum modal return for {cropName || "produce"}
          </span>
        </Card>
      </div>

      {/* Transparency & Data Source Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            {isLiveApi ? (
              <Globe2 className="h-3.5 w-3.5 text-emerald-600" />
            ) : (
              <Database className="h-3.5 w-3.5 text-blue-600" />
            )}
            Source: {dataSource}
          </span>
          {formattedDate && (
            <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-medium text-slate-700">
              <Calendar className="h-3 w-3 text-slate-500" />
              Reported: {formattedDate}
            </span>
          )}
          {isDatabaseBacked && (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
              <CheckCircle2 className="h-3 w-3" />
              Historical DB Connected
            </span>
          )}
        </div>

        <div className="text-[11px] text-slate-500">
          Total {totalRecords} APMC records • Rates in INR per Quintal (100 kg)
        </div>
      </div>
    </div>
  );
};
