"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { primaryNavItems, secondaryNavItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import { Sprout } from "lucide-react";

export interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ className, onNavigate }) => {
  const pathname = usePathname();
  const { t } = useLanguage();

  const isItemActive = (href: string, exact?: boolean) => {
    if (exact || href === "/") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const getTranslatedLabel = (id: string, defaultLabel: string): string => {
    switch (id) {
      case "dashboard":
        return t("navDashboard");
      case "assistant":
        return t("navAssistant");
      case "expert-connect":
        return t("navExpertConnect");
      case "crop-planner":
        return t("navCropPlanner");
      case "crop-health":
        return t("navCropHealth");
      case "mandi-prices":
        return t("navMandiPrices");
      case "irrigation":
        return t("navIrrigation");
      case "marketplace":
        return t("navMarketplace");
      case "settings":
        return t("navSettings");
      case "help-support":
        return t("navHelpSupport");
      default:
        return defaultLabel;
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full w-64 bg-white border-r border-slate-200/90 select-none",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-100">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-krishi-100 text-krishi-700 border border-krishi-200 shadow-sm">
          <Sprout className="h-6 w-6 stroke-[2.2]" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-extrabold tracking-tight text-slate-900 leading-none">
            {t("brandName")}
          </span>
          <span className="text-[11px] font-medium text-slate-400 mt-1 leading-none">
            {t("tagline")}
          </span>
        </div>
      </div>

      {/* Main Navigation List (Clean 5 Core Tabs) */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-thin">
        {primaryNavItems.map((item) => {
          const active = isItemActive(item.href, item.exact);
          const Icon = item.icon;
          const label = getTranslatedLabel(item.id, item.label);

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onNavigate}
              prefetch
              className={cn(
                "group flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-sm font-medium transition-all duration-150",
                active
                  ? "bg-krishi-100 text-krishi-900 font-bold shadow-[0_1px_2px_rgba(21,128,61,0.06)] border border-krishi-200/60"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  active
                    ? "text-krishi-700 stroke-[2.4]"
                    : "text-slate-400 group-hover:text-slate-700 stroke-[1.8]"
                )}
              />
              <span className="flex-1 truncate">{label}</span>
              {active && (
                <span className="h-2 w-2 rounded-full bg-krishi-600 shrink-0" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer Secondary Nav */}
      <div className="p-4 border-t border-slate-100 space-y-1">
        {secondaryNavItems.map((item) => {
          const Icon = item.icon;
          const label = getTranslatedLabel(item.id, item.label);

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Icon className="h-5 w-5 text-slate-400 stroke-[1.8]" />
              <span className="flex-1 truncate">{label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};
