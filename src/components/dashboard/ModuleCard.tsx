"use client";

import React from "react";
import Link from "next/link";
import {
  Sprout,
  BarChart3,
  Droplets,
  Store,
  ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import type { ModuleActionCard } from "@/types/dashboard";

export interface ModuleCardProps {
  card: ModuleActionCard;
  className?: string;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ card, className }) => {
  const { t } = useLanguage();

  const getCardDetails = () => {
    switch (card.iconType) {
      case "crop-health":
        return {
          icon: Sprout,
          bgColor: "bg-emerald-100",
          textColor: "text-emerald-700",
          borderColor: "border-emerald-200",
          title: t("mcCropHealthTitle"),
          desc: t("mcCropHealthDesc"),
          btnText: t("mcCropHealthBtn"),
        };
      case "mandi-price":
        return {
          icon: BarChart3,
          bgColor: "bg-amber-100",
          textColor: "text-amber-700",
          borderColor: "border-amber-200",
          title: t("mcMandiTitle"),
          desc: t("mcMandiDesc"),
          btnText: t("mcMandiBtn"),
        };
      case "irrigation":
        return {
          icon: Droplets,
          bgColor: "bg-sky-100",
          textColor: "text-sky-700",
          borderColor: "border-sky-200",
          title: t("mcIrrigationTitle"),
          desc: t("mcIrrigationDesc"),
          btnText: t("mcIrrigationBtn"),
        };
      case "marketplace":
        return {
          icon: Store,
          bgColor: "bg-emerald-100",
          textColor: "text-emerald-700",
          borderColor: "border-emerald-200",
          title: t("mcMarketplaceTitle"),
          desc: t("mcMarketplaceDesc"),
          btnText: t("mcMarketplaceBtn"),
        };
    }
  };

  const { icon: Icon, bgColor, textColor, borderColor, title, desc, btnText } =
    getCardDetails();

  return (
    <Card
      hoverable
      className={cn(
        "flex flex-col justify-between p-5 sm:p-6 transition-all duration-200 border-slate-200/90 relative group",
        className
      )}
    >
      <div>
        {/* Top Header: Icon & Optional Live Badge */}
        <div className="flex items-center justify-between mb-4">
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm transition-transform duration-200 group-hover:scale-105",
              bgColor,
              textColor,
              borderColor
            )}
          >
            <Icon className="h-6 w-6 stroke-[2.2]" />
          </div>

          {card.liveBadge && (
            <Badge variant="live" size="sm" dot>
              {t("mcLiveBadge")}
            </Badge>
          )}
        </div>

        {/* Text Content */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-krishi-700 transition-colors">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
          {desc}
        </p>
      </div>

      {/* Action Button */}
      <div className="pt-6">
        <Link href={card.href} className="block w-full">
          <Button
            variant="primary"
            size="sm"
            className="w-full justify-center group/btn"
            rightIcon={
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-150 group-hover/btn:translate-x-1" />
            }
          >
            {btnText}
          </Button>
        </Link>
      </div>
    </Card>
  );
};
