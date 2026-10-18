"use client";

import React from "react";
import { Calendar, TrendingUp, TrendingDown, Clock, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { HistoricalDataPoint } from "../types";
import { useLanguage } from "@/context/LanguageContext";

interface LatestThreeDaysSummaryProps {
  latestDay: HistoricalDataPoint | null;
  prevDay1: HistoricalDataPoint | null; // T-1
  prevDay2: HistoricalDataPoint | null; // T-2
  commodity: string;
  market: string;
}

export const LatestThreeDaysSummary: React.FC<LatestThreeDaysSummaryProps> = ({
  latestDay,
  prevDay1,
  prevDay2,
  commodity,
  market,
}) => {
  const { t } = useLanguage();
  if (!latestDay) return null;

  const daysList = [
    { label: t("mandiDayT") || "Day T (Latest Available)", data: latestDay, isToday: true },
    { label: t("mandiDayT1") || "Day T-1 (Previous Day)", data: prevDay1, isToday: false },
    { label: t("mandiDayT2") || "Day T-2 (Two Days Prior)", data: prevDay2, isToday: false },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-emerald-600" />
          {t("mandiTrajectoryTitle") || "Actual Observed Price Trajectory (Latest 3 Calendar Days)"}
        </h4>
        <span className="text-[11px] text-slate-400">
          {commodity} • {market}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {daysList.map((item, idx) => {
          const d = item.data;
          if (!d) {
            return (
              <Card key={idx} className="p-3.5 bg-slate-50/60 border-dashed border-slate-200">
                <span className="text-xs font-bold text-slate-400">{item.label}</span>
                <span className="block text-xs text-slate-400 mt-2">
                  {t("mandiNoAuction") || "No market auction reported for this calendar day."}
                </span>
              </Card>
            );
          }

          const formattedDate = new Date(d.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });

          return (
            <Card
              key={idx}
              className={`p-3.5 rounded-xl transition-all ${
                item.isToday
                  ? "bg-gradient-to-br from-emerald-50/70 via-white to-white border-2 border-emerald-500 shadow-2xs"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span
                  className={`text-[11px] font-bold ${
                    item.isToday ? "text-emerald-800" : "text-slate-500"
                  }`}
                >
                  {item.label}
                </span>
                {item.isToday && (
                  <Badge variant="green" size="sm">
                    {t("mandiVerified") || "Verified"}
                  </Badge>
                )}
              </div>

              <div className="text-xs text-slate-400 font-medium mb-1 flex items-center gap-1">
                <Clock className="h-3 w-3 text-slate-400" />
                {formattedDate}
              </div>

              <div className="flex items-baseline gap-1 mt-1">
                <span
                  className={`text-xl font-black ${
                    item.isToday ? "text-emerald-900" : "text-slate-800"
                  }`}
                >
                  ₹{d.modalPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {t("quintalUnit") || "/Quintal"}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 mt-2 border-t border-slate-100">
                <span>{t("mandiMinLabel") || "Min"}: ₹{d.minPrice ? d.minPrice.toLocaleString("en-IN") : "—"}</span>
                <span>{t("mandiMaxLabel") || "Max"}: ₹{d.maxPrice ? d.maxPrice.toLocaleString("en-IN") : "—"}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
