"use client";

import React, { useEffect, useState } from "react";
import { X, Calendar, MapPin, Trash2, ArrowRight, Bookmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GrowingPlan } from "../types";

export interface SavedPlanItem {
  id: string;
  farmerName: string;
  cropName: string;
  cropId: string;
  locationName: string;
  sowingDate: string;
  landArea: number;
  areaUnit: string;
  createdAt: string;
  plan: GrowingPlan;
}

export interface SavedPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: GrowingPlan) => void;
}

export const SavedPlansModal: React.FC<SavedPlansModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
}) => {
  const [plans, setPlans] = useState<SavedPlanItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function loadPlans() {
      setIsLoading(true);
      try {
        const res = await fetch("/api/crop-planner/save");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data?.plans)) {
            setPlans(json.data.plans);
            return;
          }
        }

        // LocalStorage fallback
        const local = localStorage.getItem("agrosaathi_crop_plans") || localStorage.getItem("krishisetu_crop_plans");
        if (local) {
          setPlans(JSON.parse(local));
        }
      } catch (e) {
        console.warn("Could not fetch saved plans from API, reading localStorage:", e);
        const local = localStorage.getItem("agrosaathi_crop_plans") || localStorage.getItem("krishisetu_crop_plans");
        if (local) {
          try {
            setPlans(JSON.parse(local));
          } catch {
            setPlans([]);
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadPlans();
  }, [isOpen]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await fetch(`/api/crop-planner/save?id=${id}`, { method: "DELETE" });
      const updated = plans.filter((p) => p.id !== id);
      setPlans(updated);
      localStorage.setItem("agrosaathi_crop_plans", JSON.stringify(updated));
    } catch (err) {
      console.warn("Delete failed:", err);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-krishi-100 text-krishi-700 flex items-center justify-center">
              <Bookmark className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Your Saved Crop Plans
              </h3>
              <p className="text-xs text-slate-500">
                Access previously calculated growing calendars &amp; water budgets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-krishi-600" />
              <span>Loading saved plans...</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Bookmark className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-700">No Saved Plans Found</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Generate a growing plan and click &quot;Save Plan&quot; to keep it here for quick reference during the season.
              </p>
            </div>
          ) : (
            plans.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectPlan(item.plan);
                  onClose();
                }}
                className="p-4 bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-krishi-300 rounded-2xl cursor-pointer transition-all flex items-center justify-between gap-4 group shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900 group-hover:text-krishi-700 transition-colors">
                      {item.cropName}
                    </span>
                    <Badge variant="green" size="sm">
                      {item.landArea} {item.areaUnit}
                    </Badge>
                  </div>

                  <div className="text-xs text-slate-500 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {item.locationName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      Sowing: {item.sowingDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, item.id)}
                    disabled={deletingId === item.id}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    title="Delete plan"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>

                  <div className="h-8 w-8 rounded-xl bg-slate-100 group-hover:bg-krishi-600 group-hover:text-white text-slate-500 flex items-center justify-center transition-colors">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="rounded-xl text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
