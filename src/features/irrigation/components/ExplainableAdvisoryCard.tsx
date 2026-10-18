"use client";

import React, { useState } from "react";
import {
  Sparkles,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Info,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Compass,
  CheckCircle2,
  XCircle,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ExplainableDecision } from "../types";

interface ExplainableAdvisoryCardProps {
  decision: ExplainableDecision;
}

export const ExplainableAdvisoryCard: React.FC<ExplainableAdvisoryCardProps> = ({
  decision,
}) => {
  const [showTransparency, setShowTransparency] = useState(false);

  const renderUrgencyBadge = (urgency: ExplainableDecision["urgency"]) => {
    switch (urgency) {
      case "urgent":
        return <Badge variant="red" size="md">Urgent Need</Badge>;
      case "moderate":
        return <Badge variant="amber" size="md">Moderate Need</Badge>;
      case "low":
        return <Badge variant="green" size="md">Low Need</Badge>;
      default:
        return <Badge variant="neutral" size="md">No Action Needed</Badge>;
    }
  };

  return (
    <Card className="p-4 sm:p-6 space-y-6 bg-white border-slate-200 shadow-sm">
      {/* Recommendation Top Banner */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-krishi-100 text-krishi-800 shrink-0">
              <Sparkles className="h-4 w-4" />
            </span>
            <h4 className="text-base font-bold text-slate-900">
              AI Irrigation Advisory & Recommendation
            </h4>
          </div>
          <div className="shrink-0">{renderUrgencyBadge(decision.urgency)}</div>
        </div>

        <div className="flex flex-col sm:flex-row items-start gap-3.5 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/40 border border-emerald-200/80 shadow-2xs">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm border border-emerald-200 text-2xl">
            🌱
          </div>
          <div className="space-y-1">
            <h5 className="text-base font-black text-krishi-900 leading-snug">
              {decision.headline}
            </h5>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {decision.summaryRationale}
            </p>
          </div>
        </div>
      </div>

      {/* Scientific Explanation & Justification */}
      <div className="space-y-3">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-krishi-600 shrink-0" />
          Why This Schedule Wins (Scientific Trade-Off Analysis)
        </h5>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 space-y-1.5 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-900 block mb-1">
                1. Phenological Sensitivity & Crop Demand
              </span>
              <p className="text-slate-600 leading-relaxed">
                {decision.scientificExplanation.phenologicalSensitivity}
              </p>
            </div>
            <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-200/60">
              FAO-56 Dual Kc Stage Dynamics
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50/90 border border-slate-200 space-y-1.5 flex flex-col justify-between">
            <div>
              <span className="font-bold text-slate-900 block mb-1">
                2. Water Budget & Allocation Decision
              </span>
              <p className="text-slate-600 leading-relaxed">
                {decision.scientificExplanation.tradeOffJustification}
              </p>
            </div>
            <span className="text-[10px] text-slate-400 block pt-1 border-t border-slate-200/60">
              Constrained Water Optimization
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Criteria Scoring Audit Trail */}
      {decision.scoringAudit && decision.scoringAudit.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-krishi-600 shrink-0" />
              Schedule Scoring Audit (Multi-Criteria Evaluation)
            </h5>
            <span className="text-[11px] text-slate-400">
              Weights: Budget (30) · Stress (35) · Rain (20) · Eff (15)
            </span>
          </div>

          <div className="space-y-2">
            {decision.scoringAudit.map((item) => {
              const isWinner = item.scheduleId === decision.recommendedScheduleId;

              return (
                <div
                  key={item.scheduleId}
                  className={`p-3.5 rounded-xl border text-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isWinner
                      ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-200 shadow-2xs"
                      : !item.isFeasible
                      ? "bg-slate-50/50 border-slate-200 text-slate-400 opacity-80"
                      : "bg-slate-50/70 border-slate-200 text-slate-700"
                  }`}
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-bold ${isWinner ? "text-emerald-950 font-black" : "text-slate-800"}`}>
                        {item.scheduleName}
                      </span>
                      {isWinner && (
                        <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full shadow-2xs">
                          AI Chosen Winner
                        </span>
                      )}
                      {!item.isFeasible && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                          <XCircle className="h-3 w-3 shrink-0" /> Infeasible (Exceeds Budget)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {item.justification}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                    <span className="text-[11px] text-slate-400 font-medium">Suitability:</span>
                    <span
                      className={`text-sm font-black px-3 py-1 rounded-lg ${
                        isWinner
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : !item.isFeasible
                          ? "bg-slate-200 text-slate-500"
                          : "bg-white text-slate-800 border border-slate-200"
                      }`}
                    >
                      {item.totalScore}/100
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actionable Field Operations Checklist */}
      <div className="space-y-3">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-krishi-600 shrink-0" />
          Farmer Action Plan (How & When to Operate)
        </h5>

        <div className="space-y-2">
          {decision.operationalActionPlan.map((action, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-800"
            >
              <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{action}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Practical Soil Moisture Touch-and-Feel Tip */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-sky-50/60 border border-sky-100 text-xs text-sky-900">
        <AlertCircle className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
        <span className="leading-relaxed">{decision.fieldValidationTip}</span>
      </div>

      {/* Data Honesty & Transparency Accordion */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          aria-expanded={showTransparency}
          onClick={() => setShowTransparency(!showTransparency)}
          className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-slate-900 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-krishi-500 rounded-lg px-1"
        >
          <span className="flex items-center gap-1.5 text-left">
            <Info className="h-4 w-4 text-krishi-600 shrink-0" />
            Data Transparency & Assumptions Breakdown (Measured vs User vs Model)
          </span>
          {showTransparency ? (
            <ChevronUp className="h-4 w-4 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
          )}
        </button>

        {showTransparency && (
          <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3.5 text-xs text-slate-700 animate-in fade-in duration-200">
            {/* Group 1: Measured / Live Telemetry */}
            <div>
              <span className="font-bold text-emerald-900 flex items-center gap-1.5 mb-1">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                Live / Measured Inputs (Telemetry)
              </span>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                {decision.transparencyNotes.measuredOrLiveInputs.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Group 2: User-Specified Parameters */}
            <div>
              <span className="font-bold text-sky-900 flex items-center gap-1.5 mb-1">
                <span className="inline-block h-2 w-2 rounded-full bg-sky-500 shrink-0" />
                User-Specified Field Parameters
              </span>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                {decision.transparencyNotes.userSpecifiedInputs.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Group 3: Model Assumptions */}
            <div>
              <span className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                <span className="inline-block h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                Mathematical & Agronomic Model Assumptions
              </span>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                {decision.transparencyNotes.modeledAssumptions.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Group 4: Forecast Limitations */}
            <div>
              <span className="font-bold text-rose-900 flex items-center gap-1.5 mb-1">
                <span className="inline-block h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                Forecast Limitations & Meteorological Caveats
              </span>
              <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                {decision.transparencyNotes.forecastLimitations.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
              <strong>Notice:</strong> This advisor provides a software-only decision support model based on scientific FAO-56 and ICAR guidelines. Local factors such as hardpan soil layers, water salinity (ECw), or pump mechanical degradation may require adjusting irrigation duration.
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

