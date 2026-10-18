"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ArrowRight, Plus, Loader2, Trash2, Sprout, Calendar, MapPin, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { FarmerCropRecord } from "@/types/auth";
import { cn } from "@/lib/utils";

export interface YourCropsSectionProps {
  className?: string;
}

export const YourCropsSection: React.FC<YourCropsSectionProps> = ({ className }) => {
  const { t } = useLanguage();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [crops, setCrops] = useState<FarmerCropRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [newCropName, setNewCropName] = useState("Tomato");
  const [newVariety, setNewVariety] = useState("");
  const [newCropAcreage, setNewCropAcreage] = useState("1.5");
  const [newCropStage, setNewCropStage] = useState("VEGETATIVE");
  const [newSowingDate, setNewSowingDate] = useState("");
  const [newHarvestDate, setNewHarvestDate] = useState("");
  const [newFieldLocation, setNewFieldLocation] = useState("");

  const fetchCrops = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/crops");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setCrops(json.data.crops || []);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not load crops from API:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops, user]);

  const handleAddCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropName || !newCropAcreage) return;

    if (!user) {
      openAuthModal();
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropName: newCropName,
          variety: newVariety || undefined,
          acreage: parseFloat(newCropAcreage) || 1.0,
          growthStage: newCropStage,
          sowingDate: newSowingDate || undefined,
          expectedHarvestDate: newHarvestDate || undefined,
          fieldLocation: newFieldLocation || undefined,
        }),
      });

      if (res.ok) {
        await fetchCrops();
        setIsAddModalOpen(false);
        setNewVariety("");
        setNewFieldLocation("");
      }
    } catch (err) {
      console.error("Failed to persist new crop:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCrop = async (e: React.MouseEvent, cropId: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to remove this crop from your farm profile?")) return;

    setDeletingId(cropId);
    try {
      const res = await fetch(`/api/crops/${cropId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setCrops((prev) => prev.filter((c) => c.id !== cropId));
      }
    } catch (err) {
      console.error("Failed to delete crop:", err);
    } finally {
      setDeletingId(null);
    }
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
      case "mustard":
        return "🌼";
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
    const s = stage.toUpperCase();
    if (s.includes("VEGETATIVE")) return t("stageVegetative");
    if (s.includes("FLOWERING")) return t("stageFlowering");
    if (s.includes("GRAIN")) return t("stageGrainFilling");
    if (s.includes("SOWING")) return t("stageSowing");
    if (s.includes("MATURITY") || s.includes("HARVEST")) return t("stageMaturity");
    return stage;
  };

  return (
    <Card id="crops" className={cn("p-5 sm:p-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            {t("cropsTitle")}
          </h3>
          <p className="text-[11px] text-slate-400">
            {crops.length} {crops.length === 1 ? "crop" : "crops"} actively registered in your farm profile
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-krishi-800 bg-krishi-50 hover:bg-krishi-100 border border-krishi-200 rounded-xl transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{t("addCrop")}</span>
        </button>
      </div>

      {/* Grid of Crop Cards */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin text-krishi-600 mr-2" />
          <span className="text-xs font-semibold">Loading your registered crops...</span>
        </div>
      ) : crops.length === 0 ? (
        <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <div className="h-12 w-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
            <Sprout className="h-6 w-6 stroke-[2]" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">No crops added yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Add your active crops to receive growth-stage irrigation reminders, fertilizer schedules, and Gemini AI advice.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-krishi-700 hover:bg-krishi-800 rounded-xl transition-all shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Crop</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {crops.map((crop) => (
            <div
              key={crop.id}
              className="relative flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50/70 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-krishi-300 transition-all duration-150 text-center group cursor-pointer"
            >
              {/* Delete Button on Hover */}
              <button
                type="button"
                onClick={(e) => handleDeleteCrop(e, crop.id)}
                disabled={deletingId === crop.id}
                title="Remove crop"
                className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                {deletingId === crop.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>

              {/* Crop Thumbnail / Emoji representation */}
              <div className="h-14 w-14 rounded-2xl bg-white shadow-sm border border-slate-200/60 flex items-center justify-center text-3xl mb-2 group-hover:scale-105 transition-transform">
                {getCropEmoji(crop.cropName)}
              </div>

              <h4 className="text-sm font-bold text-slate-800 group-hover:text-krishi-800 transition-colors">
                {getTranslatedCropName(crop.cropName)}
              </h4>

              {crop.variety && (
                <span className="text-[10px] font-medium text-slate-400 truncate max-w-full">
                  {crop.variety}
                </span>
              )}

              <span className="text-xs font-semibold text-slate-600 mt-0.5">
                {crop.acreage} {t("acresUnit")}
              </span>

              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 truncate max-w-full">
                {getTranslatedStage(crop.growthStage)}
              </span>
            </div>
          ))}

          {/* Add Crop Card Shortcut */}
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
      )}

      {/* Add Crop Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            <h4 className="text-lg font-bold text-slate-900 mb-1">
              {t("addCrop")}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Registered crops are persistently saved to your farmer profile and referenced by the Gemini voice assistant.
            </p>

            <form onSubmit={handleAddCrop} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Crop Name
                </label>
                <select
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  className="w-full h-10 px-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                >
                  <option value="Tomato">Tomato (टमाटर / टोमॅटो / ਟਮਾਟਰ)</option>
                  <option value="Wheat">Wheat (गेहूं / गहू / ਕਣਕ)</option>
                  <option value="Chili">Chili (मिर्च / मिरची / ਮਿਰਚ)</option>
                  <option value="Potato">Potato (आलू / बटाटा / ਆਲੂ)</option>
                  <option value="Onion">Onion (प्याज / कांदा / ਪਿਆਜ਼)</option>
                  <option value="Mustard">Mustard (सरसों / मोहरी / ਸਰ੍ਹੋਂ)</option>
                  <option value="Cotton">Cotton (कपास / कापूस)</option>
                  <option value="Rice">Rice / Paddy (धान / भात / ਝੋਨਾ)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Acreage ({t("acresUnit")})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newCropAcreage}
                    onChange={(e) => setNewCropAcreage(e.target.value)}
                    className="w-full h-10 px-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                    placeholder="e.g. 1.5"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Variety (किस्म - Optional)
                  </label>
                  <input
                    type="text"
                    value={newVariety}
                    onChange={(e) => setNewVariety(e.target.value)}
                    className="w-full h-10 px-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                    placeholder="e.g. HD-2967 / Abhinav"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Growth Stage
                </label>
                <select
                  value={newCropStage}
                  onChange={(e) => setNewCropStage(e.target.value)}
                  className="w-full h-10 px-3 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                >
                  <option value="SOWING">{t("stageSowing")}</option>
                  <option value="VEGETATIVE">{t("stageVegetative")}</option>
                  <option value="FLOWERING">{t("stageFlowering")}</option>
                  <option value="GRAIN_FILLING">{t("stageGrainFilling")}</option>
                  <option value="MATURITY">{t("stageMaturity")}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sowing Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={newSowingDate}
                    onChange={(e) => setNewSowingDate(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Field Location / Plot (Optional)
                  </label>
                  <input
                    type="text"
                    value={newFieldLocation}
                    onChange={(e) => setNewFieldLocation(e.target.value)}
                    placeholder="e.g. North Plot"
                    className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-semibold text-white bg-krishi-700 hover:bg-krishi-800 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Crop to Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};
