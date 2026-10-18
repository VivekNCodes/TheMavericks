"use client";

import React, { useState, useMemo } from "react";
import {
  Building2,
  TrendingUp,
  ArrowUpDown,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { NormalizedMandiRecord } from "../types";

interface MandiPriceTableProps {
  records: NormalizedMandiRecord[];
  isLoading: boolean;
  onSelectMandiForComparison?: (record: NormalizedMandiRecord) => void;
}

type SortField = "modalPrice" | "minPrice" | "maxPrice" | "mandiName" | "recordDate";
type SortOrder = "asc" | "desc";

export const MandiPriceTable: React.FC<MandiPriceTableProps> = ({
  records,
  isLoading,
  onSelectMandiForComparison,
}) => {
  const [sortField, setSortField] = useState<SortField>("modalPrice");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Determine highest modal price to highlight
  const highestModalPrice = useMemo(() => {
    if (records.length === 0) return 0;
    return Math.max(...records.map((r) => r.modalPrice));
  }, [records]);

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      let comparison = 0;
      if (sortField === "modalPrice") {
        comparison = a.modalPrice - b.modalPrice;
      } else if (sortField === "minPrice") {
        comparison = a.minPrice - b.minPrice;
      } else if (sortField === "maxPrice") {
        comparison = a.maxPrice - b.maxPrice;
      } else if (sortField === "mandiName") {
        comparison = a.mandiName.localeCompare(b.mandiName);
      } else if (sortField === "recordDate") {
        comparison =
          new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime();
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [records, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder(field === "mandiName" ? "asc" : "desc");
    }
  };

  if (isLoading) {
    return (
      <Card className="p-12 text-center bg-white border-slate-200">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3 animate-pulse">
          <Building2 className="h-6 w-6" />
        </div>
        <h4 className="text-base font-bold text-slate-800">
          Loading Agmarknet Mandi Prices...
        </h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Querying official wholesale market arrivals and prevailing modal rates.
        </p>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card className="p-10 text-center bg-white border-slate-200">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-3">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h4 className="text-base font-bold text-slate-800">
          No Mandi Price Records Found
        </h4>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          No market arrivals matched your current filter selection. Try selecting
          another district, choosing &quot;All Crops&quot;, or resetting filters.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden bg-white border-slate-200 shadow-sm rounded-2xl">
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Market Price Discovery</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {records.length} {records.length === 1 ? "Mandi" : "Mandis"}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ranked by prevailing modal rate. Green highlight indicates top market quote.
          </p>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Sort by:</span>
          <button
            onClick={() => handleSort("modalPrice")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              sortField === "modalPrice"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Modal Rate {sortField === "modalPrice" ? (sortOrder === "desc" ? "↓" : "↑") : ""}
          </button>
          <button
            onClick={() => handleSort("mandiName")}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
              sortField === "mandiName"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Mandi Name {sortField === "mandiName" ? (sortOrder === "desc" ? "↓" : "↑") : ""}
          </button>
        </div>
      </div>

      {/* Table responsive container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-4">
                <button
                  onClick={() => handleSort("mandiName")}
                  className="flex items-center gap-1 hover:text-slate-900"
                >
                  Mandi / District
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="py-3 px-4">Crop / Variety</th>
              <th className="py-3 px-4 text-right">
                <button
                  onClick={() => handleSort("minPrice")}
                  className="flex items-center gap-1 ml-auto hover:text-slate-900"
                >
                  Min Price
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="py-3 px-4 text-right">
                <button
                  onClick={() => handleSort("modalPrice")}
                  className="flex items-center gap-1 ml-auto hover:text-slate-900"
                >
                  Modal Price (₹/q)
                  <ArrowUpDown className="h-3 w-3 text-emerald-700" />
                </button>
              </th>
              <th className="py-3 px-4 text-right">
                <button
                  onClick={() => handleSort("maxPrice")}
                  className="flex items-center gap-1 ml-auto hover:text-slate-900"
                >
                  Max Price
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="py-3 px-4">
                <button
                  onClick={() => handleSort("recordDate")}
                  className="flex items-center gap-1 hover:text-slate-900"
                >
                  Reported Date
                  <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="py-3 px-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRecords.map((r, index) => {
              const isHighest = r.modalPrice === highestModalPrice && r.modalPrice > 0;
              const dateStr = new Date(r.recordDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <tr
                  key={r.recordHash || `${r.mandiName}_${r.cropName}_${index}`}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    isHighest ? "bg-emerald-50/30 font-medium" : ""
                  }`}
                >
                  {/* Mandi & District */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
                          isHighest
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">{r.mandiName}</span>
                          {isHighest && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold bg-emerald-600 text-white px-1.5 py-0.2 rounded-md">
                              <Sparkles className="h-2.5 w-2.5" /> Highest
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          {r.district}, {r.state}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Crop & Variety */}
                  <td className="py-3.5 px-4">
                    <span className="block font-semibold text-slate-800">
                      {r.cropName}
                    </span>
                    <span className="text-xs text-slate-400">
                      {r.variety || "Common"} {r.grade ? `• ${r.grade}` : ""}
                    </span>
                  </td>

                  {/* Min Price */}
                  <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                    ₹{r.minPrice.toLocaleString("en-IN")}
                  </td>

                  {/* Modal Price (Benchmark Highlight) */}
                  <td className="py-3.5 px-4 text-right">
                    <span
                      className={`inline-block font-extrabold text-base ${
                        isHighest ? "text-emerald-700 scale-105" : "text-slate-900"
                      }`}
                    >
                      ₹{r.modalPrice.toLocaleString("en-IN")}
                    </span>
                    <span className="block text-[10px] text-slate-400 font-normal">
                      per Quintal
                    </span>
                  </td>

                  {/* Max Price */}
                  <td className="py-3.5 px-4 text-right font-medium text-slate-600">
                    ₹{r.maxPrice.toLocaleString("en-IN")}
                  </td>

                  {/* Reporting Date */}
                  <td className="py-3.5 px-4">
                    <span className="block text-slate-700 font-medium">
                      {dateStr}
                    </span>
                    {r.isStale && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                        <Clock className="h-2.5 w-2.5" /> {r.daysAgo}d ago
                      </span>
                    )}
                  </td>

                  {/* Status / Comparison CTA */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {r.source.includes("Live") ? (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ) : null}
                      Verified
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-400">
        Prices reflect APMC wholesale auction rates reported by the Directorate of Marketing &amp; Inspection (DMI). 1 Quintal = 100 Kilograms.
      </div>
    </Card>
  );
};
