"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Volume2,
  VolumeX,
  Star,
  Sparkles,
  Bot,
  UserCheck,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Info,
  Calendar,
  MapPin,
  Share2,
  FileCheck2,
} from "lucide-react";
import {
  ConsultationCase,
  ExpertResponsePayload,
  ExpertStance,
  FarmerFeedbackPayload,
} from "../types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface CaseDetailViewProps {
  consultationCase: ConsultationCase;
  onBack: () => void;
  onCaseUpdated?: (updatedCase: ConsultationCase) => void;
  onSwitchToExpertView?: () => void;
}

export const CaseDetailView: React.FC<CaseDetailViewProps> = ({
  consultationCase,
  onBack,
  onCaseUpdated,
  onSwitchToExpertView,
}) => {
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(
    consultationCase.feedback?.rating || 5
  );
  const [isHelpful, setIsHelpful] = useState<boolean>(
    consultationCase.feedback?.helpful ?? true
  );
  const [feedbackComment, setFeedbackComment] = useState<string>(
    consultationCase.feedback?.comment || ""
  );
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(
    Boolean(consultationCase.feedback)
  );

  const expertResponse = consultationCase.expertResponse;
  const aiSnapshot = consultationCase.aiSnapshot;

  // Web Speech API for voice playback of expert response
  const handleToggleVoice = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech voice playback is not supported in this browser.");
      return;
    }

    if (isPlayingVoice) {
      window.speechSynthesis.cancel();
      setIsPlayingVoice(false);
      return;
    }

    if (!expertResponse?.advice) return;

    const utterance = new SpeechSynthesisUtterance(
      `${expertResponse.expertName} says: ${expertResponse.advice}. Recommended actions: ${expertResponse.actionSteps.join(
        ". "
      )}`
    );
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingVoice(false);
    utterance.onerror = () => setIsPlayingVoice(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingVoice(true);
  };

  // Submit Feedback
  const handleFeedbackSubmit = async () => {
    setIsSubmittingFeedback(true);
    const payload: FarmerFeedbackPayload = {
      rating: feedbackRating,
      helpful: isHelpful,
      comment: feedbackComment,
      submittedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch(`/api/expert-connect/${consultationCase.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_feedback",
          feedback: payload,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.case) {
          setFeedbackSuccess(true);
          onCaseUpdated?.(json.data.case);
        }
      }
    } catch (e) {
      console.warn("Feedback error:", e);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Status Badge Helper
  const getStatusBadge = () => {
    switch (consultationCase.status) {
      case "PENDING":
        return <Badge variant="warning">Awaiting Expert Pickup</Badge>;
      case "ACCEPTED":
      case "IN_PROGRESS":
        return <Badge variant="info">Specialist Review In Progress</Badge>;
      case "RESPONDED":
        return <Badge variant="success">Advisory Delivered</Badge>;
      case "RESOLVED":
        return <Badge variant="success">Resolved & Verified</Badge>;
      case "DECLINED":
        return <Badge variant="danger">Declined by Specialist</Badge>;
      default:
        return <Badge variant="neutral">{consultationCase.status}</Badge>;
    }
  };

  // Stance Badge Helper
  const getStanceBadge = (stance: ExpertStance) => {
    switch (stance) {
      case "AGREES":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="h-4 w-4 text-emerald-700" />
            Specialist Agrees with AI Recommendation
          </span>
        );
      case "MODIFIES":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
            <Sparkles className="h-4 w-4 text-amber-700" />
            Specialist Modifies AI Recommendation (Adjusted Prescription)
          </span>
        );
      case "DISAGREES":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-900 border border-red-300">
            <AlertTriangle className="h-4 w-4 text-red-700" />
            Specialist Disagrees with AI Diagnosis (Alternative Pathology)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          leftIcon={<ChevronLeft className="h-4 w-4" />}
          className="text-xs"
        >
          Back to Consultation Cases
        </Button>

        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <span className="text-xs font-mono font-bold text-slate-500">
            {consultationCase.id}
          </span>
        </div>
      </div>

      {/* 2. Timeline Status Progression Strip */}
      <Card className="p-4 sm:p-5 border-slate-200 bg-white">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2">
          <span>Consultation Pipeline</span>
          <span className="text-krishi-700">
            Submitted: {new Date(consultationCase.submittedAt).toLocaleDateString()}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold">
          <div
            className={`p-2 rounded-xl border ${
              consultationCase.submittedAt
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-slate-50 text-slate-400 border-slate-100"
            }`}
          >
            1. Request Saved
          </div>
          <div
            className={`p-2 rounded-xl border ${
              consultationCase.acceptedAt || consultationCase.respondedAt
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-slate-50 text-slate-400 border-slate-100"
            }`}
          >
            2. Expert Accepted
          </div>
          <div
            className={`p-2 rounded-xl border ${
              consultationCase.respondedAt
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-slate-50 text-slate-400 border-slate-100"
            }`}
          >
            3. Advice Delivered
          </div>
          <div
            className={`p-2 rounded-xl border ${
              consultationCase.status === "RESOLVED"
                ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                : "bg-slate-50 text-slate-400 border-slate-100"
            }`}
          >
            4. Resolved
          </div>
        </div>
      </Card>

      {/* 3. EXPERT ADVISORY SECTION (When Responded) */}
      {expertResponse ? (
        <Card className="border-krishi-300 bg-gradient-to-br from-white via-krishi-50/20 to-emerald-50/30 p-5 sm:p-7 shadow-md space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-krishi-100 pb-4">
            <div className="flex items-start gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-krishi-700 text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-lg">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-extrabold text-slate-900">
                    {expertResponse.expertName}
                  </h2>
                  <Badge variant="success" size="sm">
                    Verified Advisory
                  </Badge>
                </div>
                <p className="text-xs font-semibold text-krishi-800">
                  {expertResponse.expertDesignation}
                </p>
                <p className="text-[11px] text-slate-500">
                  {expertResponse.expertInstitution} • Responded{" "}
                  {new Date(expertResponse.respondedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Listen Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleVoice}
              leftIcon={
                isPlayingVoice ? (
                  <VolumeX className="h-4 w-4 text-amber-600 animate-pulse" />
                ) : (
                  <Volume2 className="h-4 w-4 text-krishi-700" />
                )
              }
              className="text-xs shrink-0 font-bold border-krishi-300 text-krishi-800 hover:bg-krishi-100"
            >
              {isPlayingVoice ? "Stop Reading" : "Listen to Advice (आवाज़ सुनें)"}
            </Button>
          </div>

          {/* Stance Indicator Banner */}
          <div>{getStanceBadge(expertResponse.stance)}</div>

          {/* Agronomic Advice Text */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 space-y-2 shadow-xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Specialist Diagnostic Assessment & Guidance
            </h3>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
              {expertResponse.advice}
            </p>
          </div>

          {/* Action Steps Checklist */}
          {expertResponse.actionSteps && expertResponse.actionSteps.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-krishi-700" />
                <span>Recommended Action Steps for Farmer</span>
              </h3>
              <div className="space-y-2">
                {expertResponse.actionSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 shadow-2xs"
                  >
                    <span className="h-5 w-5 rounded-full bg-krishi-100 text-krishi-800 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Precautions & Warnings */}
          {expertResponse.precautions && expertResponse.precautions.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-700" />
                <span>Critical Spray & Environmental Precautions</span>
              </h4>
              <ul className="space-y-1.5 text-xs text-amber-950">
                {expertResponse.precautions.map((prec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{prec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Follow-up Note */}
          {expertResponse.followUpNote && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 italic">
              <strong>Follow-up Recommendation:</strong> {expertResponse.followUpNote}
            </div>
          )}

          {/* 4. Side-by-Side Comparison: Original AI vs Verified Human Advice */}
          <div className="pt-2 border-t border-krishi-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              AI Recommendation vs Human Specialist Comparison
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: AI */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Bot className="h-4 w-4 text-slate-500" />
                    Original AI Recommendation
                  </span>
                  {aiSnapshot?.confidence && (
                    <span className="font-mono text-[11px] text-slate-500 font-bold">
                      {aiSnapshot.confidence}% Confidence
                    </span>
                  )}
                </div>
                <p className="text-slate-600 leading-relaxed italic">
                  {aiSnapshot?.recommendation || "No prior AI recommendation attached."}
                </p>
                {aiSnapshot?.reasoning && (
                  <p className="text-[10px] text-slate-400">
                    Citations: {aiSnapshot.reasoning}
                  </p>
                )}
              </div>

              {/* Right Column: Expert Specialist */}
              <div className="p-4 rounded-2xl bg-krishi-50/70 border border-krishi-300 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-krishi-900 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-krishi-700" />
                    Verified Specialist Prescription
                  </span>
                  <Badge variant="success" size="sm" className="text-[10px]">
                    {expertResponse.stance}
                  </Badge>
                </div>
                <p className="text-slate-800 leading-relaxed font-medium">
                  {expertResponse.advice.slice(0, 220)}...
                </p>
                <p className="text-[10px] text-krishi-800 font-semibold">
                  Prescribed by {expertResponse.expertName} ({expertResponse.expertInstitution})
                </p>
              </div>
            </div>
          </div>

          {/* 5. Farmer Feedback Widget */}
          <div className="pt-4 border-t border-krishi-100">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Farmer Feedback on this Advisory
                  </h4>
                  <p className="text-xs text-slate-500">
                    Did this specialist advice help save your crop or clarify doubts?
                  </p>
                </div>
                {feedbackSuccess && (
                  <Badge variant="success" size="sm">
                    Feedback Saved
                  </Badge>
                )}
              </div>

              {!feedbackSuccess ? (
                <div className="space-y-3">
                  {/* Star Rating */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-600">
                      Overall Rating:
                    </span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFeedbackRating(star)}
                          className={`text-xl transition-transform hover:scale-110 ${
                            star <= feedbackRating
                              ? "text-amber-500"
                              : "text-slate-200"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Helpful Toggle */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold text-slate-600">Was it helpful?</span>
                    <button
                      type="button"
                      onClick={() => setIsHelpful(true)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg border font-semibold ${
                        isHelpful
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>Yes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsHelpful(false)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg border font-semibold ${
                        !isHelpful
                          ? "bg-red-50 border-red-300 text-red-800"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      <ThumbsDown className="h-3.5 w-3.5" />
                      <span>No</span>
                    </button>
                  </div>

                  {/* Comment input */}
                  <textarea
                    rows={2}
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Add brief comments for the specialist (e.g. spray performed, flowers saved)..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-500"
                  />

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleFeedbackSubmit}
                    disabled={isSubmittingFeedback}
                  >
                    {isSubmittingFeedback ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Thank you! Your rating ({feedbackRating}/5 stars) has been recorded in the case audit log.
                  </span>
                </div>
              )}
            </div>
          </div>
        </Card>
      ) : (
        /* PENDING CASE NOTIFICATION BANNER */
        <Card className="p-6 border-amber-200 bg-amber-50/50 space-y-4">
          <div className="flex items-start gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Case Delivered & Queued for Specialist Review
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                This case has been assigned to <strong>{consultationCase.expertName}</strong>. In this prototype environment, you can test the expert review and advisory response directly.
              </p>
            </div>
          </div>

          {onSwitchToExpertView && (
            <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Want to test the specialist response flow now?
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={onSwitchToExpertView}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="bg-krishi-700 hover:bg-krishi-800 text-white"
              >
                Switch to Expert Review Portal
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* 6. Farmer-Approved Consultation Report Snapshot */}
      <Card className="p-5 sm:p-6 border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5 text-krishi-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Submitted Consultation Dossier Snapshot
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Approved by {consultationCase.farmerName}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="block text-[10px] text-slate-400">Crop & Stage</span>
            <span className="font-bold text-slate-800">
              {consultationCase.cropName} ({consultationCase.growthStage})
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="block text-[10px] text-slate-400">Reason</span>
            <span className="font-bold text-slate-800 truncate block">
              {consultationCase.consultationReason}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="block text-[10px] text-slate-400">Duration</span>
            <span className="font-bold text-slate-800">
              {consultationCase.symptomDuration || "Recent"}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="block text-[10px] text-slate-400">Location Telemetry</span>
            <span className="font-bold text-slate-800 truncate block">
              {consultationCase.farmerLocation}
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
          <span className="font-bold block text-slate-900 mb-1">
            Farmer Problem Description:
          </span>
          <p>{consultationCase.symptomsDescription}</p>
        </div>

        {consultationCase.imageUrls && consultationCase.imageUrls.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Attached Photographs ({consultationCase.imageUrls.length})
            </span>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {consultationCase.imageUrls.map((url, i) => (
                <div
                  key={i}
                  className="h-20 w-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 shadow-2xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Attached leaf ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
