"use client";

import React, { useState } from "react";
import {
  BellRing,
  Bug,
  CloudRain,
  Landmark,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

export const AdvisoriesSection: React.FC = () => {
  const { t } = useLanguage();
  const [selectedAdvisory, setSelectedAdvisory] = useState<number | null>(null);

  const advisories = [
    {
      id: 1,
      type: "pest",
      icon: Bug,
      badgeColor: "amber" as const,
      badgeText: "Pest Warning",
      title: t("advisoryPestAlert"),
      desc: t("advisoryPestDesc"),
      source: "ICAR - Krishi Vigyan Kendra, Jaipur",
      time: "2 hours ago",
    },
    {
      id: 2,
      type: "weather",
      icon: CloudRain,
      badgeColor: "blue" as const,
      badgeText: "Weather Advisory",
      title: t("advisoryWeatherAlert"),
      desc: t("advisoryWeatherDesc"),
      source: "India Meteorological Dept (IMD)",
      time: "4 hours ago",
    },
    {
      id: 3,
      type: "scheme",
      icon: Landmark,
      badgeColor: "green" as const,
      badgeText: "Govt Scheme",
      title: t("advisorySchemeAlert"),
      desc: t("advisorySchemeDesc"),
      source: "Ministry of Agriculture & Farmers Welfare",
      time: "1 day ago",
    },
  ];

  return (
    <Card className="p-5 sm:p-6 border-slate-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <BellRing className="h-4 w-4" />
            </span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              {t("advisoriesTitle")}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("advisoriesSubtitle")}
          </p>
        </div>

        <button className="inline-flex items-center gap-1 text-xs font-semibold text-krishi-700 hover:text-krishi-800 transition-colors self-start sm:self-auto">
          <span>{t("viewAllAdvisories")}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Advisory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {advisories.map((adv) => {
          const Icon = adv.icon;
          return (
            <div
              key={adv.id}
              className={cn(
                "flex flex-col justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                adv.type === "pest"
                  ? "bg-amber-50/50 hover:bg-amber-50/90 border-amber-200/80 hover:border-amber-300"
                  : adv.type === "weather"
                  ? "bg-sky-50/50 hover:bg-sky-50/90 border-sky-200/80 hover:border-sky-300"
                  : "bg-emerald-50/50 hover:bg-emerald-50/90 border-emerald-200/80 hover:border-emerald-300"
              )}
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <Badge variant={adv.badgeColor} size="sm">
                    <Icon className="h-3 w-3" />
                    <span>{adv.badgeText}</span>
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {adv.time}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-krishi-900 leading-snug line-clamp-2">
                  {adv.title}
                </h4>

                <p className="text-xs text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                  {adv.desc}
                </p>
              </div>

              <div className="pt-3 mt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate max-w-[170px]">{adv.source}</span>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-700 shrink-0" />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
