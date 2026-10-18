"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  Clock,
  Droplets,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  TableProperties,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { FeasibleSchedule, StressRiskLevel } from "../types";

interface ScheduleComparisonTableProps {
  schedules: FeasibleSchedule[];
  availableBudgetLiters: number;
  onSelectSchedule?: (scheduleId: FeasibleSchedule["id"]) => void;
  selectedScheduleId?: string;
}

export const ScheduleComparisonTable: React.FC<ScheduleComparisonTableProps> = ({
  schedules,
  availableBudgetLiters,
  onSelectSchedule,
  selectedScheduleId,
}) => {
  // Sync local tab state with selectedScheduleId prop, defaulting to the recommended schedule
  const defaultScheduleId =
    selectedScheduleId ||
    schedules.find((s) => s.isRecommended)?.id ||
    schedules[0]?.id ||
    "critical_stage_deficit";

  const [activeTab, setActiveTab] = useState<string>(defaultScheduleId);

  // Synchronize when parent prop selectedScheduleId updates (e.g. preset clicked)
  useEffect(() => {
    if (selectedScheduleId) {
      setActiveTab(selectedScheduleId);
    }
  }, [selectedScheduleId]);

  const handleSelect = (id: FeasibleSchedule["id"]) => {
    setActiveTab(id);
    if (onSelectSchedule) onSelectSchedule(id);
  };

  const activeSchedule = schedules.find((s) => s.id === activeTab) || schedules[0];

  const renderRiskBadge = (risk: StressRiskLevel) => {
    switch (risk) {
      case "low":
        return <Badge variant="green" size="sm">Low Stress Risk</Badge>;
      case "moderate":
        return <Badge variant="amber" size="sm">Moderate Risk</Badge>;
      case "high":
        return <Badge variant="red" size="sm">High Stress Hazard</Badge>;
    }
  };

  return (
    <div className="space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-krishi-600 shrink-0" />
            Comparison of Feasible Irrigation Schedules
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluating 4 agronomic water allocation strategies under your {availableBudgetLiters.toLocaleString("en-IN")} L budget constraint
          </p>
        </div>
      </div>

      {/* 4 Cards Selector Grid - Equal height cards with interactive buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {schedules.map((sched) => {
          const isSelected = sched.id === activeTab;
          const isOverBudget = !sched.isFeasibleWithinBudget;

          return (
            <div
              key={sched.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onClick={() => handleSelect(sched.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect(sched.id);
                }
              }}
              className={`p-4 rounded-2xl border transition-all text-left flex flex-col justify-between cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-krishi-500 min-h-[260px] ${
                isSelected
                  ? "bg-white border-krishi-600 shadow-md ring-2 ring-krishi-100"
                  : isOverBudget
                  ? "bg-slate-50/70 border-slate-200 hover:border-slate-300 opacity-90"
                  : "bg-white border-slate-200 hover:border-krishi-300 hover:shadow-sm"
              }`}
            >
              <div className="space-y-2.5">
                {/* Header row with badge and status */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">
                    {sched.badge}
                  </span>
                  {sched.isRecommended ? (
                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-krishi-700 text-white shrink-0 shadow-2xs">
                      <Sparkles className="h-2.5 w-2.5 text-amber-300" />
                      AI Pick
                    </span>
                  ) : isOverBudget ? (
                    <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-0.5 shrink-0">
                      <XCircle className="h-3 w-3" /> Exceeds Budget
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-0.5 shrink-0">
                      <CheckCircle2 className="h-3 w-3" /> Feasible
                    </span>
                  )}
                </div>

                <h5 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {sched.name}
                </h5>

                {/* Key Metrics */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Water Volume:</span>
                    <span className="font-extrabold text-slate-900">
                      {sched.totalWaterUsedLiters.toLocaleString("en-IN")} L
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Budget Cap:</span>
                    <span className={`font-bold ${isOverBudget ? "text-rose-600" : "text-slate-700"}`}>
                      {sched.budgetUtilizationPercent}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="text-slate-500">Crop Stress:</span>
                    {renderRiskBadge(sched.projectedStressRisk)}
                  </div>
                </div>
              </div>

              {/* Card Footer with Runtime and Selection Button */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 flex items-center gap-1 shrink-0">
                  <Clock className="h-3 w-3 text-slate-400" /> ~{sched.totalPumpHours} hrs
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(sched.id);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-krishi-700 text-white shadow-2xs"
                      : "bg-slate-100 text-slate-700 hover:bg-krishi-100 hover:text-krishi-900"
                  }`}
                >
                  {isSelected ? "Inspecting ✓" : "Select"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Comparison Matrix Table (Responsive with Horizontal Scroll) */}
      <Card className="p-4 sm:p-5 border-slate-200 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <TableProperties className="h-3.5 w-3.5 text-krishi-600" />
            Full Schedules Comparison Matrix
          </span>
          <span className="text-[11px] text-slate-400">
            Scroll horizontally on mobile
          </span>
        </div>

        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-left text-xs min-w-[620px]">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80">
                <th className="py-2.5 px-3 font-semibold">Agronomic Strategy</th>
                <th className="py-2.5 px-3 font-semibold">Water Allocated</th>
                <th className="py-2.5 px-3 font-semibold">Budget Cap %</th>
                <th className="py-2.5 px-3 font-semibold">Pump Hours</th>
                <th className="py-2.5 px-3 font-semibold">Stress Hazard (फसल को खतरा)</th>
                <th className="py-2.5 px-3 font-semibold">Feasibility</th>
                <th className="py-2.5 px-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedules.map((s) => {
                const isSelected = s.id === activeTab;
                return (
                  <tr
                    key={s.id}
                    className={`transition-colors ${
                      isSelected ? "bg-krishi-50/60 font-semibold" : "hover:bg-slate-50/60"
                    }`}
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-900 font-bold">{s.name}</span>
                        {s.isRecommended && (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            Winner
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block font-normal">{s.badge}</span>
                    </td>
                    <td className="py-2.5 px-3 font-extrabold text-slate-800">
                      {s.totalWaterUsedLiters.toLocaleString("en-IN")} L
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={s.isFeasibleWithinBudget ? "text-slate-700" : "text-rose-600 font-bold"}>
                        {s.budgetUtilizationPercent}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-700">~{s.totalPumpHours} hrs</td>
                    <td className="py-2.5 px-3">{renderRiskBadge(s.projectedStressRisk)}</td>
                    <td className="py-2.5 px-3">
                      {s.isFeasibleWithinBudget ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Feasible
                        </span>
                      ) : (
                        <span className="text-rose-600 font-semibold flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Exceeds Cap
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleSelect(s.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-krishi-700 text-white shadow-2xs"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        {isSelected ? "Inspecting" : "Select"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detailed Plan for the Active Selected Schedule */}
      {activeSchedule && (
        <Card className="p-4 sm:p-6 space-y-5 bg-gradient-to-br from-white to-slate-50/50 border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h5 className="text-base font-bold text-slate-900">
                  Daily Pumping Plan: {activeSchedule.name}
                </h5>
                {activeSchedule.isRecommended ? (
                  <Badge variant="green" size="sm">
                    AI Chosen Strategy
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm">
                    Alternative Schedule
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {activeSchedule.description}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-slate-500">Total Run Time:</span>
              <span className="text-xs font-black text-krishi-800 bg-krishi-50 px-2.5 py-1 rounded-lg border border-krishi-200">
                {activeSchedule.totalPumpHours} Hours Total
              </span>
            </div>
          </div>

          {/* Daily Pumping Events List */}
          <div className="space-y-3">
            <span className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Scheduled Irrigation Events (5-Day Horizon)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeSchedule.dailyEvents.map((evt, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-krishi-900 flex items-center gap-1.5">
                        <Droplets className="h-3.5 w-3.5 text-sky-600 shrink-0" />
                        {evt.dayLabel} (Day {evt.dayIndex})
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                        {evt.timingRecommendation}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Water to Apply</span>
                        <span className="text-sm font-extrabold text-slate-900">
                          {evt.waterToApplyLiters.toLocaleString("en-IN")} L{" "}
                          <span className="text-[11px] font-normal text-slate-400">({evt.waterDepthMm} mm)</span>
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Estimated Run Duration</span>
                        <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                          ~{evt.pumpDurationHours} hrs pump
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg leading-relaxed mt-2 border border-slate-100">
                    {evt.eventRationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Trade-off Breakdown (Pros & Cons) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
            <div className="space-y-1.5 p-3 rounded-xl bg-emerald-50/40 border border-emerald-100/80">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                Agronomic Advantages
              </span>
              <ul className="space-y-1 text-slate-600 pl-1">
                {activeSchedule.pros.map((pro, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-emerald-500 font-bold shrink-0">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-amber-50/40 border border-amber-100/80">
              <span className="font-bold text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                Trade-offs & Constraints
              </span>
              <ul className="space-y-1 text-slate-600 pl-1">
                {activeSchedule.cons.map((con, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="text-amber-500 font-bold shrink-0">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

