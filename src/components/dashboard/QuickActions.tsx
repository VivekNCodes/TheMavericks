"use client";

import React from "react";
import Link from "next/link";
import {
  Camera,
  LineChart,
  CloudSun,
  ShoppingBag,
  PhoneCall,
  CalendarRange,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";

export const QuickActions: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
      <Link href="/assistant">
        <Button
          size="sm"
          variant="outline"
          className="rounded-full text-xs shrink-0 bg-gradient-to-r from-krishi-50 to-emerald-50 border-krishi-300 text-krishi-900 font-bold hover:bg-krishi-100 shadow-sm"
          leftIcon={<Bot className="h-3.5 w-3.5 text-krishi-700" />}
        >
          {t("qaAssistant")}
        </Button>
      </Link>

      <Link href="/crop-planner">
        <Button
          size="sm"
          variant="outline"
          className="rounded-full text-xs shrink-0 bg-krishi-50 border-krishi-300 text-krishi-800 font-bold hover:bg-krishi-100"
          leftIcon={<CalendarRange className="h-3.5 w-3.5 text-krishi-700" />}
        >
          {t("qaCropPlanner")}
        </Button>
      </Link>

      <Link href="/crop-disease">
        <Button
          size="sm"
          variant="outline"
          className="rounded-full text-xs shrink-0"
          leftIcon={<Camera className="h-3.5 w-3.5 text-krishi-700" />}
        >
          {t("qaLeafScan")}
        </Button>
      </Link>

      <Link href="/mandi-prices">
        <Button
          size="sm"
          variant="outline"
          className="rounded-full text-xs shrink-0"
          leftIcon={<LineChart className="h-3.5 w-3.5 text-amber-600" />}
        >
          {t("qaMandiRates")}
        </Button>
      </Link>

      <Link href="/irrigation">
        <Button
          size="sm"
          variant="outline"
          className="rounded-full text-xs shrink-0"
          leftIcon={<CloudSun className="h-3.5 w-3.5 text-sky-600" />}
        >
          {t("qaIrrigationForecast")}
        </Button>
      </Link>

      <Link href="/marketplace">
        <Button
          size="sm"
          variant="outline"
          className="rounded-full text-xs shrink-0"
          leftIcon={<ShoppingBag className="h-3.5 w-3.5 text-emerald-600" />}
        >
          {t("qaSellProduce")}
        </Button>
      </Link>

      <a
        href="tel:18001801551"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors shrink-0"
        title="Kisan Call Center (Toll Free 1800-180-1551)"
      >
        <PhoneCall className="h-3 w-3 text-krishi-600" />
        <span>{t("qaKisanHelpline")}</span>
      </a>
    </div>
  );
};
