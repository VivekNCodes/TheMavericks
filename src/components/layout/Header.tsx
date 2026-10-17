"use client";

import React, { useState } from "react";
import {
  MapPin,
  Sun,
  CloudRain,
  Globe,
  Bell,
  ChevronDown,
  Menu,
  Check,
  ShieldCheck,
  LogIn,
} from "lucide-react";
import { siteConfig } from "@/config/site";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useWeather } from "@/hooks/useWeather";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  onMenuToggle?: () => void;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuToggle, className }) => {
  const { language, setLanguage, languages, t } = useLanguage();
  const { user, openAuthModal } = useAuth();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(siteConfig.defaultLocation);

  // Live weather hook wired to /api/weather
  const { weather, isLoading: isWeatherLoading } = useWeather(selectedLocation);

  const locations = [
    "Jaipur, Rajasthan",
    "Sanganer, Rajasthan",
    "Chomu, Rajasthan",
    "Phagi, Rajasthan",
    "Ludhiana, Punjab",
    "Nashik, Maharashtra",
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between h-20 px-4 md:px-8 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all",
        className
      )}
    >
      {/* Left: Mobile Toggle & Context Badges */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Mobile menu trigger */}
        <button
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Location Dropdown Pill */}
        <div className="relative">
          <button
            onClick={() => setIsLocationOpen(!isLocationOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-full transition-colors"
          >
            <MapPin className="h-3.5 w-3.5 text-krishi-700 shrink-0" />
            <span className="truncate max-w-[120px] sm:max-w-none">
              {selectedLocation}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
          </button>

          {isLocationOpen && (
            <div className="absolute left-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-dropdown py-1 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {t("selectLocation")}
              </div>
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setIsLocationOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors",
                    loc === selectedLocation
                      ? "text-krishi-700 font-semibold bg-krishi-50"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <span>{loc}</span>
                  {loc === selectedLocation && (
                    <Check className="h-3 w-3 text-krishi-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Weather Indicator (From Weather API) */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs bg-amber-50/80 border border-amber-200/60 rounded-full">
          {weather.condition.toLowerCase().includes("rain") ? (
            <CloudRain className="h-4 w-4 text-sky-500 shrink-0 animate-bounce" />
          ) : (
            <Sun className="h-4 w-4 text-amber-500 shrink-0 animate-pulse" />
          )}
          <div className="flex items-baseline gap-1">
            <span className="font-extrabold text-amber-950">
              {weather.temp}°C
            </span>
            <span className="text-[11px] font-medium text-amber-800">
              {weather.condition}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Language Selector, Notifications, and Google Farmer Auth */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Language Selector Dropdown (English, Hindi, Marathi, Punjabi) */}
        <div className="relative">
          <button
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-xs"
            aria-label="Change language"
          >
            <Globe className="h-3.5 w-3.5 text-krishi-700" />
            <span className="font-bold">{currentLangObj.nativeName}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-dropdown py-1.5 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Language
              </div>
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguage(l.code);
                    setIsLangOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3.5 py-2 text-xs text-left transition-colors",
                    l.code === language
                      ? "text-krishi-800 font-bold bg-krishi-50"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span>{l.flag}</span>
                    <span>{l.nativeName}</span>
                    <span className="text-[11px] text-slate-400">({l.name})</span>
                  </span>
                  {l.code === language && (
                    <Check className="h-3.5 w-3.5 text-krishi-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <button
          aria-label="Notifications"
          className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
        >
          <Bell className="h-5 w-5 stroke-[1.8]" />
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </button>

        {/* Farmer Google Authentication Section */}
        {user ? (
          <button
            onClick={openAuthModal}
            className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200 hover:opacity-80 transition-opacity text-left group"
            title="Click to manage farmer Google Account"
          >
            <div className="relative h-9 w-9 rounded-full overflow-hidden border border-krishi-300 bg-krishi-100 shrink-0">
              <div className="flex h-full w-full items-center justify-center text-xs font-bold text-krishi-900 bg-gradient-to-br from-krishi-200 to-emerald-300">
                {user.name.slice(0, 2).toUpperCase()}
              </div>
            </div>

            <div className="hidden md:flex flex-col text-left">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {user.name}
                </span>
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 leading-tight">
                {t("farmerRole")} • {user.acres} ac
              </span>
            </div>
          </button>
        ) : (
          <button
            onClick={openAuthModal}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors"
          >
            {/* Google Logo SVG */}
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="hidden sm:inline">{t("signInWithGoogle")}</span>
            <span className="sm:hidden">Login</span>
          </button>
        )}
      </div>
    </header>
  );
};
