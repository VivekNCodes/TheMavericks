"use client";

import React from "react";
import { SunMedium, ShieldCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";

export interface WelcomeSectionProps {
  className?: string;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ className }) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const farmerName = user?.name ? user.name.split(" ")[0] : "Farmer";
  const farmerAcres = user?.acres ?? 3.7;

  return (
    <div
      className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#14532D] via-[#166534] to-[#15803D] text-white shadow-md p-6 sm:p-8 md:p-10"
    >
      {/* Decorative leaf / subtle agrarian background patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#86efac_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
      <div className="absolute right-1/3 -bottom-20 w-64 h-64 rounded-full bg-lime-300/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-xl space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-200 text-xs font-semibold">
            <SunMedium className="h-3.5 w-3.5 text-amber-300" />
            <span>{t("optimalConditions")}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            {t("greetingMorning")}, {farmerName}!
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal max-w-lg">
            {t("welcomeSubtitle")}
          </p>
        </div>

        {/* Farmer Status Badge */}
        <div className="hidden sm:flex items-center justify-end shrink-0">
          <div className="relative flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-tr from-amber-200 via-emerald-100 to-white flex items-center justify-center text-krishi-800 font-extrabold text-2xl shadow-inner border border-white/40">
              🌾
            </div>
            <div className="text-left pr-2">
              <span className="block text-xs uppercase tracking-wider text-emerald-200 font-bold">
                {t("farmerStatus")}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="block text-sm font-bold text-white">
                  {t("verifiedProducer")}
                </span>
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
              </div>
              <span className="block text-[11px] text-emerald-300 mt-0.5">
                {farmerAcres} {t("acresUnit")} {t("acresMonitored")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
