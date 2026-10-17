"use client";

import React, { useState } from "react";
import {
  Calendar,
  MapPin,
  Sprout,
  Sun,
  CloudRain,
  AlertCircle,
  ArrowRight,
  Droplets,
  Check,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useWeather } from "@/hooks/useWeather";
import { SAMPLE_IRRIGATION_RESULT } from "@/constants/sample-data";

export const IrrigationPreview: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [crop, setCrop] = useState("Tomato");
  const [growthStage, setGrowthStage] = useState("Flowering");
  const [soilType, setSoilType] = useState("Loamy");
  const [lastDate, setLastDate] = useState("2026-10-14");
  const [location, setLocation] = useState("Jaipur, Rajasthan");

  // Fetch live weather from Weather API based on field location
  const { weather } = useWeather(location);

  const steps = [
    { num: 1, title: "Crop Details", sub: "Select crop and field info" },
    { num: 2, title: "Weather Data", sub: "Fetch forecast" },
    { num: 3, title: "AI Analysis", sub: "Generate recommendation" },
    { num: 4, title: "Results", sub: "Irrigation advice" },
  ];

  const result = SAMPLE_IRRIGATION_RESULT;
  const forecastDays = weather.forecast?.length ? weather.forecast : result.forecast;

  return (
    <div className="space-y-6">
      {/* 4-Step Stepper Wizard matching Reference Screen 4 */}
      <Card className="p-4 sm:p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {steps.map((s) => {
            const isCompleted = s.num < activeStep;
            const isCurrent = s.num === activeStep;

            return (
              <div
                key={s.num}
                onClick={() => setActiveStep(s.num)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-krishi-700 text-white shadow-sm ring-4 ring-krishi-100"
                      : isCompleted
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-400 group-hover:bg-slate-200"
                  }`}
                >
                  {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : s.num}
                </div>
                <div className="min-w-0">
                  <span
                    className={`block text-xs font-bold truncate ${
                      isCurrent ? "text-krishi-800" : "text-slate-700"
                    }`}
                  >
                    {s.title}
                  </span>
                  <span className="block text-[11px] text-slate-400 truncate">
                    {s.sub}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Two Column Layout matching Reference Screen 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Field Information Form */}
        <div className="lg:col-span-5">
          <Card className="p-6 space-y-4">
            <h4 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Enter Field Information
            </h4>

            <div className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Crop
                  </label>
                  <select
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-medium text-slate-800"
                  >
                    <option value="Tomato">Tomato</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Chili">Chili</option>
                    <option value="Potato">Potato</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Growth Stage
                  </label>
                  <select
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value)}
                    className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-medium text-slate-800"
                  >
                    <option value="Flowering">Flowering</option>
                    <option value="Vegetative">Vegetative</option>
                    <option value="Fruit Formation">Fruit Formation</option>
                    <option value="Grain Filling">Grain Filling</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Soil Type
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-medium text-slate-800"
                  >
                    <option value="Loamy">Loamy</option>
                    <option value="Sandy">Sandy</option>
                    <option value="Clay">Clay</option>
                    <option value="Black Soil">Black Soil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Last Irrigation Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={lastDate}
                      onChange={(e) => setLastDate(e.target.value)}
                      className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-medium text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Field Location
                </label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-medium text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Get Irrigation Advice
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (7 Cols): Irrigation Recommendation Card */}
        <div className="lg:col-span-7">
          <Card className="p-6 space-y-5">
            {/* Recommendation Header */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-bold text-slate-900">
                  Irrigation Recommendation
                </h4>
                <Badge variant="green" size="md">
                  Moderate Need
                </Badge>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm border border-emerald-200 text-2xl">
                  🌱
                </div>
                <div className="space-y-1">
                  <h5 className="text-base font-black text-krishi-900 leading-tight">
                    {result.headline}
                  </h5>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {result.rationale}
                  </p>
                </div>
              </div>
            </div>

            {/* 5-Day Weather Forecast Strip */}
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                5-Day Local Weather Outlook
              </span>

              <div className="grid grid-cols-5 gap-2">
                {forecastDays.map((day, idx) => (
                  <div
                    key={day.day}
                    className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all ${
                      idx === 0
                        ? "bg-amber-50/70 border-amber-200"
                        : "bg-slate-50/60 border-slate-200/80"
                    }`}
                  >
                    <span className="text-[11px] font-bold text-slate-700">
                      {day.day}
                    </span>
                    <div className="my-1 text-amber-500">
                      {day.rainMm > 0 ? (
                        <CloudRain className="h-4 w-4 text-sky-500" />
                      ) : (
                        <Sun className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <span className="text-xs font-black text-slate-800">
                      {day.tempMax}°C
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {day.rainMm} mm
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Practical Tip */}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600">
              <AlertCircle className="h-4 w-4 text-krishi-600 shrink-0 mt-0.5" />
              <span>{result.tip}</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
