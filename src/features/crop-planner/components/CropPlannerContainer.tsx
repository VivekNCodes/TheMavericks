"use client";

import React, { useState, useEffect } from "react";
import { CropPlannerForm } from "./CropPlannerForm";
import { CropPlanView } from "./CropPlanView";
import { SavedPlansModal, SavedPlanItem } from "./SavedPlansModal";
import { CropPlanInput, GrowingPlan } from "../types";
import { generateCropGrowingPlan } from "../engine/knowledge-engine";
import { fetchWeatherOutlook } from "../services/weather-service";
import { generateDeterministicExplanation } from "../engine/ai-explainer";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle } from "lucide-react";

export const CropPlannerContainer: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [activePlan, setActivePlan] = useState<GrowingPlan | null>(null);
  const [draftInput, setDraftInput] = useState<CropPlanInput | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSavingPlan, setIsSavingPlan] = useState<boolean>(false);
  const [isPlanSaved, setIsPlanSaved] = useState<boolean>(false);
  const [savedPlansCount, setSavedPlansCount] = useState<number>(0);
  const [isSavedPlansOpen, setIsSavedPlansOpen] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Sync saved plans count from localStorage / API
  useEffect(() => {
    try {
      const local = localStorage.getItem("krishisetu_crop_plans");
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) {
          setSavedPlansCount(parsed.length);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleGeneratePlan = async (input: CropPlanInput) => {
    setIsLoading(true);
    setGlobalError(null);
    setDraftInput(input);
    setIsPlanSaved(false);

    try {
      // 1. Try server API route
      const res = await fetch("/api/crop-planner/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, lang: language }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setActivePlan(json.data);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }

      // 2. Resilient client-side fallback (if server API unavailable)
      const weather = await fetchWeatherOutlook(
        input.location.latitude,
        input.location.longitude,
        input.location.name
      );
      const plan = generateCropGrowingPlan(input, weather);
      plan.aiExplanation = generateDeterministicExplanation(plan, language);
      setActivePlan(plan);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.warn("Server plan generation failed, falling back to client-side engine:", err);
      try {
        const weather = await fetchWeatherOutlook(
          input.location.latitude,
          input.location.longitude,
          input.location.name
        );
        const plan = generateCropGrowingPlan(input, weather);
        plan.aiExplanation = generateDeterministicExplanation(plan, language);
        setActivePlan(plan);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch (fallbackErr) {
        setGlobalError("Unable to calculate crop plan. Please check inputs and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePlan = async () => {
    if (!activePlan) return;
    setIsSavingPlan(true);

    const record: SavedPlanItem = {
      id: activePlan.id,
      farmerName: user?.name || "Guest Farmer",
      cropName: activePlan.crop.name,
      cropId: activePlan.crop.id,
      locationName: activePlan.weatherOutlook.resolvedLocation,
      sowingDate: activePlan.input.sowingDate,
      landArea: activePlan.input.landArea,
      areaUnit: activePlan.input.areaUnit,
      createdAt: new Date().toISOString(),
      plan: activePlan,
    };

    // Save to localStorage immediately
    try {
      const local = localStorage.getItem("krishisetu_crop_plans");
      const list: SavedPlanItem[] = local ? JSON.parse(local) : [];
      const updated = [record, ...list.filter((p) => p.id !== activePlan.id)];
      localStorage.setItem("krishisetu_crop_plans", JSON.stringify(updated));
      setSavedPlansCount(updated.length);
    } catch (e) {
      console.warn("LocalStorage save error:", e);
    }

    // Attempt server persistence to Neon PostgreSQL
    try {
      await fetch("/api/crop-planner/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: activePlan,
          userId: user?.id,
          farmerName: user?.name || "Guest Farmer",
        }),
      });
    } catch (e) {
      console.warn("Remote save skipped or failed, saved locally:", e);
    } finally {
      setIsSavingPlan(false);
      setIsPlanSaved(true);
    }
  };

  const handleSelectSavedPlan = (plan: GrowingPlan) => {
    setActivePlan(plan);
    setDraftInput(plan.input);
    setIsPlanSaved(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {globalError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs font-semibold text-red-800">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      {activePlan ? (
        <CropPlanView
          plan={activePlan}
          onEditInputs={() => setActivePlan(null)}
          onSavePlan={handleSavePlan}
          isSavingPlan={isSavingPlan}
          isPlanSaved={isPlanSaved}
          onOpenSavedPlans={() => setIsSavedPlansOpen(true)}
        />
      ) : (
        <CropPlannerForm
          initialInput={draftInput}
          onSubmit={handleGeneratePlan}
          isLoading={isLoading}
          onOpenSavedPlans={() => setIsSavedPlansOpen(true)}
          savedPlansCount={savedPlansCount}
        />
      )}

      <SavedPlansModal
        isOpen={isSavedPlansOpen}
        onClose={() => setIsSavedPlansOpen(false)}
        onSelectPlan={handleSelectSavedPlan}
      />
    </div>
  );
};
