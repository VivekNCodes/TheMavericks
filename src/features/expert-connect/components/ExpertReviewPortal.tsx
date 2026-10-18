"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Bot,
  FileText,
  ShieldCheck,
  Send,
  X,
  Plus,
  Trash2,
  RefreshCw,
  Eye,
  Info,
  Calendar,
  Layers,
  CloudSun,
  Droplets,
  ArrowRight,
} from "lucide-react";
import {
  ConsultationCase,
  ExpertProfile,
  ExpertResponsePayload,
  ExpertStance,
} from "../types";
import {
  DEMONSTRATION_EXPERTS,
  SAMPLE_EXPERT_ADVISORIES,
} from "../data/demonstration-experts";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface ExpertReviewPortalProps {
  onCaseUpdated?: (updatedCase: ConsultationCase) => void;
  onViewCaseAsFarmer?: (caseId: string) => void;
}

export const ExpertReviewPortal: React.FC<ExpertReviewPortalProps> = ({
  onCaseUpdated,
  onViewCaseAsFarmer,
}) => {
  const [selectedExpertId, setSelectedExpertId] = useState<string>(
    DEMONSTRATION_EXPERTS[0].id
  );
  const [cases, setCases] = useState<ConsultationCase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCase, setActiveCase] = useState<ConsultationCase | null>(null);

  // Advisory Form State
  const [stance, setStance] = useState<ExpertStance>("MODIFIES");
  const [adviceText, setAdviceText] = useState("");
  const [actionSteps, setActionSteps] = useState<string[]>([
    "Prune lower infected leaves showing concentric spots and burn away from field.",
    "Spray recommended systemic fungicide early morning (before 9:00 AM).",
  ]);
  const [precautions, setPrecautions] = useState<string[]>([
    "Wear protective face mask and gloves during chemical mixing.",
    "Observe minimum 7-day pre-harvest waiting interval (PHI).",
  ]);
  const [followUpNote, setFollowUpNote] = useState(
    "Check new shoot growth in 4 days. Lesion borders should dry out."
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Decline Modal State
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");

  const currentExpert =
    DEMONSTRATION_EXPERTS.find((e) => e.id === selectedExpertId) ||
    DEMONSTRATION_EXPERTS[0];

  // Fetch cases assigned to this expert
  const fetchAssignedCases = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/expert-connect?expertId=${selectedExpertId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.cases) {
          setCases(json.data.cases);
          if (json.data.cases.length > 0 && !activeCase) {
            setActiveCase(json.data.cases[0]);
          }
        }
      }
    } catch (e) {
      console.warn("Failed to fetch expert cases:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedCases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedExpertId]);

  // Load sample template based on crop
  const handleLoadSampleTemplate = () => {
    const matched =
      SAMPLE_EXPERT_ADVISORIES.find(
        (t) =>
          t.cropName.toLowerCase() === (activeCase?.cropName || "").toLowerCase()
      ) || SAMPLE_EXPERT_ADVISORIES[0];

    setStance(matched.stance);
    setAdviceText(matched.advice);
    setActionSteps([...matched.actionSteps]);
    setPrecautions([...matched.precautions]);
    setFollowUpNote(matched.followUpNote || "");
  };

  // Accept case
  const handleAcceptCase = async () => {
    if (!activeCase) return;
    try {
      const res = await fetch(`/api/expert-connect/${activeCase.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "ACCEPTED" }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.case) {
          setActiveCase(json.data.case);
          setCases((prev) =>
            prev.map((c) => (c.id === json.data.case.id ? json.data.case : c))
          );
          onCaseUpdated?.(json.data.case);
        }
      }
    } catch (e) {
      console.warn("Accept error:", e);
    }
  };

  // Decline case
  const handleDeclineCase = async () => {
    if (!activeCase) return;
    try {
      const res = await fetch(`/api/expert-connect/${activeCase.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "DECLINED",
          extra: { followUpNote: `Declined: ${declineReason}` },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.case) {
          setActiveCase(json.data.case);
          setCases((prev) =>
            prev.map((c) => (c.id === json.data.case.id ? json.data.case : c))
          );
          setIsDeclineModalOpen(false);
          onCaseUpdated?.(json.data.case);
        }
      }
    } catch (e) {
      console.warn("Decline error:", e);
    }
  };

  // Submit official advice
  const handleSubmitAdvice = async () => {
    if (!activeCase || !adviceText.trim()) return;
    setIsSubmitting(true);
    setSubmitSuccess(false);

    const payload: ExpertResponsePayload = {
      expertId: currentExpert.id,
      expertName: currentExpert.fullName,
      expertDesignation: currentExpert.designation,
      expertInstitution: currentExpert.institution,
      stance,
      advice: adviceText,
      actionSteps: actionSteps.filter((s) => s.trim() !== ""),
      precautions: precautions.filter((p) => p.trim() !== ""),
      followUpNote,
      respondedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/expert-connect/${activeCase.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_response",
          response: payload,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.case) {
          setActiveCase(json.data.case);
          setCases((prev) =>
            prev.map((c) => (c.id === json.data.case.id ? json.data.case : c))
          );
          setSubmitSuccess(true);
          onCaseUpdated?.(json.data.case);
        }
      }
    } catch (e) {
      console.warn("Advice submission error:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Specialist Identity Switcher Bar */}
      <Card className="p-4 sm:p-5 border-krishi-300 bg-krishi-50/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-krishi-700 text-white flex items-center justify-center shrink-0 shadow-xs">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-krishi-800">
                  Expert Review Portal
                </span>
                <Badge variant="success" size="sm" className="text-[10px]">
                  Authorized Reviewer
                </Badge>
              </div>
              <h2 className="text-base font-extrabold text-slate-900">
                Logged in as: {currentExpert.fullName}
              </h2>
              <p className="text-xs text-slate-500">
                {currentExpert.designation} • {currentExpert.institution}
              </p>
            </div>
          </div>

          {/* Switch specialist for tester */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Switch Reviewer:
            </span>
            <select
              value={selectedExpertId}
              onChange={(e) => {
                setSelectedExpertId(e.target.value);
                setActiveCase(null);
                setSubmitSuccess(false);
              }}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-krishi-500 w-full sm:w-auto"
            >
              {DEMONSTRATION_EXPERTS.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.fullName} ({exp.designation.split(" ")[0]} - {exp.district})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* 2. Main 2-Column Interface: Cases List (Left) + Case Workspace (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Assigned Cases List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Assigned Inquiries ({cases.length})
            </h3>
            <button
              onClick={fetchAssignedCases}
              className="text-slate-400 hover:text-slate-600 p-1"
              title="Refresh"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {cases.length > 0 ? (
            <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
              {cases.map((c) => {
                const isSelected = activeCase?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveCase(c);
                      setSubmitSuccess(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-white border-krishi-600 shadow-md ring-1 ring-krishi-500"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        {c.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          c.status === "RESPONDED" || c.status === "RESOLVED"
                            ? "bg-emerald-100 text-emerald-800"
                            : c.status === "ACCEPTED"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-extrabold text-slate-900 truncate">
                      {c.cropName} — {c.farmerName}
                    </h4>

                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {c.consultationReason}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>{c.growthStage}</span>
                      <span>{new Date(c.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <Card className="p-6 text-center text-xs text-slate-500 border-dashed">
              No cases currently assigned to {currentExpert.fullName}.
            </Card>
          )}
        </div>

        {/* Right Column: Case Review Workspace & Advisory Response (8 Cols) */}
        <div className="lg:col-span-8">
          {activeCase ? (
            <div className="space-y-6">
              {/* Case Header Card */}
              <Card className="p-5 sm:p-6 border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-slate-900">
                        Case: {activeCase.id}
                      </h2>
                      <Badge variant="outline" size="sm">
                        {activeCase.cropName}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Submitted by <strong>{activeCase.farmerName}</strong> ({activeCase.farmerLocation}) on{" "}
                      {new Date(activeCase.submittedAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Accept / Decline / View actions */}
                  <div className="flex items-center gap-2">
                    {activeCase.status === "PENDING" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsDeclineModalOpen(true)}
                          className="text-xs text-red-600 hover:bg-red-50"
                        >
                          Decline
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleAcceptCase}
                          className="text-xs"
                        >
                          Accept Case
                        </Button>
                      </>
                    )}

                    {onViewCaseAsFarmer && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewCaseAsFarmer(activeCase.id)}
                        leftIcon={<Eye className="h-3.5 w-3.5" />}
                        className="text-xs"
                      >
                        Preview Farmer View
                      </Button>
                    )}
                  </div>
                </div>

                {/* Farmer Problem & Attached Context */}
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-800 leading-relaxed">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Farmer Reported Symptoms & Reason:
                    </span>
                    <p className="font-semibold text-slate-900 mb-1">
                      Reason: {activeCase.consultationReason} (Onset: {activeCase.symptomDuration})
                    </p>
                    <p>{activeCase.symptomsDescription}</p>
                  </div>

                  {/* Attached Leaf Photos */}
                  {activeCase.imageUrls && activeCase.imageUrls.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                        Farmer Attached Photos
                      </span>
                      <div className="flex gap-2.5 overflow-x-auto pb-1">
                        {activeCase.imageUrls.map((url, i) => (
                          <div
                            key={i}
                            className="h-28 w-28 rounded-2xl overflow-hidden border border-slate-200 shrink-0 shadow-xs"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={url}
                              alt="Crop leaf"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Recommendation Snapshot */}
                  {activeCase.aiSnapshot && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <Bot className="h-4 w-4 text-emerald-700" />
                          AI Recommendation Snapshot:
                        </span>
                        {activeCase.aiSnapshot.confidence && (
                          <span className="font-mono font-bold text-emerald-700">
                            {activeCase.aiSnapshot.confidence}% Confidence
                          </span>
                        )}
                      </div>
                      <p className="text-slate-700 italic">
                        {activeCase.aiSnapshot.recommendation}
                      </p>
                      {activeCase.aiSnapshot.reasoning && (
                        <p className="text-[10px] text-slate-500">
                          Groundings: {activeCase.aiSnapshot.reasoning}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Supporting Telemetry Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="block text-[10px] text-slate-400">Weather</span>
                      <span className="font-bold text-slate-800">
                        {activeCase.farmContext.weatherTemp
                          ? `${activeCase.farmContext.weatherTemp}°C, ${activeCase.farmContext.weatherCondition}`
                          : "Withheld"}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="block text-[10px] text-slate-400">Soil Type</span>
                      <span className="font-bold text-slate-800">
                        {activeCase.farmContext.soilType || "Not specified"}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="block text-[10px] text-slate-400">Irrigation</span>
                      <span className="font-bold text-slate-800">
                        {activeCase.farmContext.irrigationStatus || "Adequate"}
                      </span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="block text-[10px] text-slate-400">Farm Size</span>
                      <span className="font-bold text-slate-800">
                        {activeCase.farmContext.acreage
                          ? `${activeCase.farmContext.acreage} Acres`
                          : "Not disclosed"}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Advisory Response Form */}
              <Card className="p-5 sm:p-7 border-krishi-300 bg-white space-y-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Formulate Official Agricultural Advice
                    </h3>
                    <p className="text-xs text-slate-500">
                      Submit grounded diagnosis, actionable management checklist, and spray safety precautions.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadSampleTemplate}
                    leftIcon={<Sparkles className="h-3.5 w-3.5 text-krishi-600" />}
                    className="text-xs shrink-0 font-bold"
                  >
                    Auto-Fill ICAR Template
                  </Button>
                </div>

                {submitSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div className="flex-1">
                      <strong>Agricultural advice successfully submitted!</strong> Case status is updated to <strong>RESPONDED</strong>. The farmer can now view your advice and listen via voice.
                    </div>
                  </div>
                )}

                {/* Stance Radio Buttons */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Your Stance on the Original AI Recommendation: *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {[
                      {
                        val: "AGREES" as const,
                        title: "Agrees with AI",
                        desc: "AI diagnosis and chemical advice are accurate.",
                      },
                      {
                        val: "MODIFIES" as const,
                        title: "Modifies AI Advice",
                        desc: "Diagnosis valid, but adjust dosage, timing, or safer chemical.",
                      },
                      {
                        val: "DISAGREES" as const,
                        title: "Disagrees with AI",
                        desc: "Alternative disease or abiotic deficiency detected.",
                      },
                    ].map((item) => {
                      const isChecked = stance === item.val;
                      return (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setStance(item.val)}
                          className={`text-left p-3 rounded-xl border transition-all ${
                            isChecked
                              ? "bg-krishi-50 border-krishi-600 ring-1 ring-krishi-500"
                              : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                isChecked
                                  ? "border-krishi-600 bg-krishi-600"
                                  : "border-slate-300"
                              }`}
                            >
                              {isChecked && (
                                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                              )}
                            </span>
                            <span className="text-xs font-bold text-slate-900">
                              {item.title}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1 pl-5">
                            {item.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Detailed Advice Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Detailed Agronomic Advice & Clinical Assessment *
                  </label>
                  <textarea
                    rows={5}
                    value={adviceText}
                    onChange={(e) => setAdviceText(e.target.value)}
                    placeholder="Provide clear, scientifically grounded advice tailored to the farmer's crop stage and temperature conditions..."
                    className="w-full text-xs sm:text-sm p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-krishi-500 leading-relaxed font-medium"
                  />
                </div>

                {/* Action Steps Checklist */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Recommended Action Steps (Checklist for Farmer)
                    </label>
                    <button
                      type="button"
                      onClick={() => setActionSteps((prev) => [...prev, ""])}
                      className="text-xs font-bold text-krishi-700 hover:text-krishi-800 flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Step
                    </button>
                  </div>

                  <div className="space-y-2">
                    {actionSteps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 w-5 text-right shrink-0">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={step}
                          onChange={(e) => {
                            const val = e.target.value;
                            setActionSteps((prev) =>
                              prev.map((s, i) => (i === idx ? val : s))
                            );
                          }}
                          placeholder="Action step for farmer..."
                          className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-krishi-500"
                        />
                        {actionSteps.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setActionSteps((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Precautions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Safety Precautions & Warnings
                    </label>
                    <button
                      type="button"
                      onClick={() => setPrecautions((prev) => [...prev, ""])}
                      className="text-xs font-bold text-krishi-700 hover:text-krishi-800 flex items-center gap-1"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Precaution
                    </button>
                  </div>

                  <div className="space-y-2">
                    {precautions.map((prec, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={prec}
                          onChange={(e) => {
                            const val = e.target.value;
                            setPrecautions((prev) =>
                              prev.map((p, i) => (i === idx ? val : p))
                            );
                          }}
                          placeholder="Safety precaution..."
                          className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-krishi-500"
                        />
                        {precautions.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setPrecautions((prev) =>
                                prev.filter((_, i) => i !== idx)
                              )}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Follow-up Note */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Follow-up Recommendation
                  </label>
                  <input
                    type="text"
                    value={followUpNote}
                    onChange={(e) => setFollowUpNote(e.target.value)}
                    placeholder="When to inspect again (e.g., check in 4-5 days)..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-krishi-500"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleSubmitAdvice}
                    disabled={isSubmitting || !adviceText.trim()}
                    className="bg-krishi-700 hover:bg-krishi-800 text-white font-bold"
                    rightIcon={<Send className="h-4 w-4" />}
                  >
                    {isSubmitting ? "Submitting Advice..." : "Deliver Official Advice to Farmer"}
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center border-dashed border-slate-300">
              <div className="max-w-sm mx-auto space-y-2">
                <FileText className="h-10 w-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">
                  Select a Case to Review
                </h3>
                <p className="text-xs text-slate-500">
                  Choose an assigned consultation case from the list on the left to examine farmer symptoms, AI telemetry, and submit official guidance.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Decline Reason Modal */}
      {isDeclineModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Decline Consultation Case
            </h3>
            <p className="text-xs text-slate-500">
              Please provide a reason for declining this request (e.g., outside regional jurisdiction, invalid photo).
            </p>
            <textarea
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Reason for declining..."
              className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeclineModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDeclineCase}
                disabled={!declineReason.trim()}
              >
                Confirm Decline
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
