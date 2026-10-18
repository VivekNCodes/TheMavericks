"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  GraduationCap,
  Sparkles,
  Bot,
  UserCheck,
  FileText,
  PhoneCall,
  History,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
} from "lucide-react";
import {
  ConsultationCase,
  ConsultationDraftInput,
  ExpertProfile,
} from "../types";
import { DEMONSTRATION_EXPERTS } from "../data/demonstration-experts";
import { ConsultationWizard } from "./ConsultationWizard";
import { ExpertDirectory } from "./ExpertDirectory";
import { CaseDetailView } from "./CaseDetailView";
import { ExpertReviewPortal } from "./ExpertReviewPortal";
import { ConsultationHistoryList } from "./ConsultationHistoryList";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export const ExpertConnectContainer: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Mode: "farmer" or "expert"
  const [activeRole, setActiveRole] = useState<"farmer" | "expert">("farmer");

  // Farmer Tabs: "new-consultation" | "history" | "directory"
  const [activeTab, setActiveTab] = useState<"new-consultation" | "history" | "directory">(
    "new-consultation"
  );

  // Active case being viewed
  const [activeCase, setActiveCase] = useState<ConsultationCase | null>(null);

  // All cases list
  const [cases, setCases] = useState<ConsultationCase[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(false);

  // Pre-filled draft state from URL or sessionStorage
  const [initialDraft, setInitialDraft] = useState<Partial<ConsultationDraftInput> | undefined>(
    undefined
  );
  const [draftBannerMessage, setDraftBannerMessage] = useState<string | null>(null);

  // 1. Initial Load: Check URL parameters & sessionStorage
  useEffect(() => {
    // Check if view parameter requests expert portal
    const viewParam = searchParams.get("view");
    if (viewParam === "expert") {
      setActiveRole("expert");
    }

    // Check if specific caseId requested
    const caseIdParam = searchParams.get("caseId");

    // Load any draft saved in sessionStorage
    if (typeof window !== "undefined") {
      try {
        const storedDraft = sessionStorage.getItem("agrosaathi_expert_draft");
        if (storedDraft) {
          const parsed = JSON.parse(storedDraft);
          setInitialDraft(parsed);
          setActiveTab("new-consultation");

          if (parsed.aiSnapshot?.source === "crop-disease") {
            setDraftBannerMessage(
              `Context imported from Crop Disease Diagnostic: ${parsed.cropName} (${parsed.aiSnapshot.diseaseName || ""})`
            );
          } else if (parsed.aiSnapshot?.source === "assistant") {
            setDraftBannerMessage(
              `Context imported from AI Sahayak conversation regarding: ${parsed.cropName || "Crop health"}`
            );
          }
          sessionStorage.removeItem("agrosaathi_expert_draft");
        }
      } catch (e) {
        console.warn("Error reading draft:", e);
      }
    }

    // Fetch user cases
    fetchCases(caseIdParam || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchCases = async (targetCaseId?: string) => {
    setIsLoadingCases(true);
    try {
      const res = await fetch("/api/expert-connect");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.cases) {
          setCases(json.data.cases);

          if (targetCaseId) {
            const found = json.data.cases.find((c: ConsultationCase) => c.id === targetCaseId);
            if (found) {
              setActiveCase(found);
            }
          }
        }
      }
    } catch (e) {
      console.warn("Failed to fetch cases:", e);
    } finally {
      setIsLoadingCases(false);
    }
  };

  // Callback when a new case is created
  const handleCaseCreated = (newCase: ConsultationCase) => {
    setCases((prev) => [newCase, ...prev]);
    setActiveCase(newCase);
    setActiveTab("history");
  };

  // Callback when case is updated
  const handleCaseUpdated = (updatedCase: ConsultationCase) => {
    setCases((prev) => prev.map((c) => (c.id === updatedCase.id ? updatedCase : c)));
    if (activeCase?.id === updatedCase.id) {
      setActiveCase(updatedCase);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header with Role Switcher (Farmer vs Expert) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-krishi-100 text-krishi-700 border border-krishi-200 flex items-center justify-center shrink-0 shadow-xs">
            <GraduationCap className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Mavericks Expert Connect
              </h1>
              <Badge variant="success" size="sm" className="hidden sm:inline-flex">
                Free Service
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Context-Aware AI-to-Human Agricultural Advisory & Second Opinion
            </p>
          </div>
        </div>

        {/* Dual Role Switcher Toggle for Demonstration & Evaluation */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200 w-full md:w-auto">
          <button
            type="button"
            onClick={() => {
              setActiveRole("farmer");
              setActiveCase(null);
            }}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeRole === "farmer"
                ? "bg-white text-krishi-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Farmer View</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-krishi-50 text-krishi-800 font-normal">
              Ramesh Kumar
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveRole("expert");
              setActiveCase(null);
            }}
            className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              activeRole === "expert"
                ? "bg-krishi-700 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Expert Review Portal</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-krishi-800 text-krishi-100 font-normal">
              ICAR Reviewer
            </span>
          </button>
        </div>
      </div>

      {/* 2. Draft Imported Notification Banner (if any) */}
      {draftBannerMessage && activeRole === "farmer" && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-krishi-50 to-teal-50 border border-krishi-300 text-krishi-950 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-krishi-700 shrink-0" />
            <span className="font-semibold">{draftBannerMessage}</span>
          </div>
          <button
            onClick={() => setDraftBannerMessage(null)}
            className="text-xs font-bold text-krishi-800 hover:text-krishi-950 underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* FARMER VIEW CONTENT                                                 */}
      {/* =================================================================== */}
      {activeRole === "farmer" && (
        <div className="space-y-6">
          {/* Active Case View (if a case is opened) */}
          {activeCase ? (
            <CaseDetailView
              consultationCase={activeCase}
              onBack={() => setActiveCase(null)}
              onCaseUpdated={handleCaseUpdated}
              onSwitchToExpertView={() => setActiveRole("expert")}
            />
          ) : (
            <>
              {/* Navigation Tabs for Farmer */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
                {[
                  {
                    id: "new-consultation" as const,
                    label: "New Consultation Request",
                    icon: Sparkles,
                  },
                  {
                    id: "history" as const,
                    label: `My Consultation Cases (${cases.length})`,
                    icon: History,
                  },
                  {
                    id: "directory" as const,
                    label: "Verified Expert Directory",
                    icon: Users,
                  },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all -mb-1 ${
                        active
                          ? "border-krishi-700 text-krishi-900 bg-krishi-50/50 rounded-t-xl"
                          : "border-transparent text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? "text-krishi-700" : "text-slate-400"}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab 1: New Consultation Wizard */}
              {activeTab === "new-consultation" && (
                <ConsultationWizard
                  initialDraft={initialDraft}
                  onCaseCreated={handleCaseCreated}
                  onCancel={() => setActiveTab("history")}
                />
              )}

              {/* Tab 2: Consultation History List */}
              {activeTab === "history" && (
                <ConsultationHistoryList
                  cases={cases}
                  onSelectCase={(c) => setActiveCase(c)}
                  onNewConsultation={() => setActiveTab("new-consultation")}
                />
              )}

              {/* Tab 3: Expert Directory */}
              {activeTab === "directory" && (
                <ExpertDirectory
                  onSelectExpert={(exp) => {
                    setInitialDraft((prev) => ({
                      ...prev,
                      expertId: exp.id,
                      cropName: prev?.cropName || "Tomato",
                      consultationReason: prev?.consultationReason || "I need a second opinion",
                    }));
                    setActiveTab("new-consultation");
                  }}
                />
              )}
            </>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* EXPERT REVIEW PORTAL CONTENT                                        */}
      {/* =================================================================== */}
      {activeRole === "expert" && (
        <ExpertReviewPortal
          onCaseUpdated={handleCaseUpdated}
          onViewCaseAsFarmer={(caseId) => {
            const found = cases.find((c) => c.id === caseId);
            if (found) {
              setActiveCase(found);
              setActiveRole("farmer");
            }
          }}
        />
      )}
    </div>
  );
};
