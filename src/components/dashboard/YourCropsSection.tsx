"use client";

import React, { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/context/LanguageContext";
import { SAMPLE_CROPS } from "@/constants/sample-data";
import { cn } from "@/lib/utils";

export interface YourCropsSectionProps {
  className?: string;
}

export const YourCropsSection: React.FC<YourCropsSectionProps> = ({ className }) => {
  const { t } = useLanguage();
  const [crops, setCrops] = useState(SAMPLE_CROPS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCropName, setNewCropName] = useState("Mustard");
  const [newCropAcreage, setNewCropAcreage] = useState("1.5");
  const [newCropStage, setNewCropStage] = useState("Sowing");

  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropName || !newCropAcreage) return;

    setCrops((prev) => [
      ...prev,
      {
        id: `crop-${Date.now()}`,
        name: newCropName,
        acreage: parseFloat(newCropAcreage) || 1.0,
        stage: newCropStage,
        imageUrl: "/images/crop-wheat.webp",
      },
    ]);
    setIsAddModalOpen(false);
  };

  const getCropEmoji = (name: string) => {
    switch (name.toLowerCase()) {
      case "tomato":
        return "🍅";
      case "wheat":
        return "🌾";
      case "chili":
        return "🌶️";
      case "potato":
        return "🥔";
      case "onion":
        return "🧅";
      default:
        return "🌱";
    }
  };

  const getTranslatedCropName = (name: string): string => {
    switch (name.toLowerCase()) {
      case "tomato":
        return t("cropTomato");
      case "wheat":
        return t("cropWheat");
      case "chili":
        return t("cropChili");
      case "potato":
        return t("cropPotato");
      case "onion":
        return t("cropOnion");
      case "mustard":
        return t("cropMustard");
      default:
        return name;
    }
  };

  const getTranslatedStage = (stage: string): string => {
    if (stage.includes("Vegetative")) return t("stageVegetative");
    if (stage.includes("Flowering")) return t("stageFlowering");
    if (stage.includes("Grain")) return t("stageGrainFilling");
    if (stage.includes("Sowing")) return t("stageSowing");
    if (stage.includes("Maturity")) return t("stageMaturity");
    return stage;
  };

  return (
    <Card className={cn("p-5 sm:p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          {t("cropsTitle")}
        </h3>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-krishi-700 hover:text-krishi-800 transition-colors"
        >
          <span>{t("manageCrops")}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Grid of Crop Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {crops.map((crop) => (
          <div
            key={crop.id}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50/70 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-krishi-300 transition-all duration-150 text-center group cursor-pointer"
          >
            {/* Crop Thumbnail / Emoji representation */}
            <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-200/60 flex items-center justify-center text-3xl mb-2.5 group-hover:scale-105 transition-transform">
              {getCropEmoji(crop.name)}
            </div>

            <h4 className="text-sm font-bold text-slate-800 group-hover:text-krishi-800 transition-colors">
              {getTranslatedCropName(crop.name)}
            </h4>
            <span className="text-xs font-medium text-slate-500 mt-0.5">
              {crop.acreage} {t("acresUnit")}
            </span>
            <span className="text-[11px] font-medium text-slate-400 mt-0.5 truncate max-w-full">
              {getTranslatedStage(crop.stage)}
            </span>
          </div>
        ))}

        {/* Add Crop Card */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-krishi-500 hover:bg-emerald-50/30 transition-all duration-150 text-center group cursor-pointer min-h-[140px]"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 group-hover:bg-krishi-100 text-slate-400 group-hover:text-krishi-700 transition-colors mb-2">
            <Plus className="h-5 w-5 stroke-[2.2]" />
          </div>
          <span className="text-xs font-bold text-slate-700 group-hover:text-krishi-800 transition-colors">
            {t("addCrop")}
          </span>
        </button>
      </div>

      {/* Quick Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 animate-in fade-in-50 zoom-in-95">
            <h4 className="text-lg font-bold text-slate-900 mb-1">
              {t("addCrop")}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Monitor growth stages and receive crop-tailored advice.
            </p>

            <form onSubmit={handleAddCrop} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Crop Name
                </label>
                <select
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                >
                  <option value="Tomato">Tomato (टमाटर / टोमॅटो / ਟਮਾਟਰ)</option>
                  <option value="Wheat">Wheat (गेहूं / गहू / ਕਣਕ)</option>
                  <option value="Chili">Chili (मिर्च / मिरची / ਮਿਰਚ)</option>
                  <option value="Potato">Potato (आलू / बटाटा / ਆਲੂ)</option>
                  <option value="Onion">Onion (प्याज / कांदा / ਪਿਆਜ਼)</option>
                  <option value="Mustard">Mustard (सरसों / मोहरी / ਸਰ੍ਹੋਂ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Acreage ({t("acresUnit")})
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={newCropAcreage}
                  onChange={(e) => setNewCropAcreage(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                  placeholder="e.g. 1.5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Growth Stage
                </label>
                <select
                  value={newCropStage}
                  onChange={(e) => setNewCropStage(e.target.value)}
                  className="w-full h-10 px-3 text-sm bg-white border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                >
                  <option value="Sowing">{t("stageSowing")}</option>
                  <option value="Vegetative">{t("stageVegetative")}</option>
                  <option value="Flowering">{t("stageFlowering")}</option>
                  <option value="Grain Filling">{t("stageGrainFilling")}</option>
                  <option value="Maturity">{t("stageMaturity")}</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-krishi-700 hover:bg-krishi-800 rounded-xl transition-colors shadow-sm"
                >
                  Save Crop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};
