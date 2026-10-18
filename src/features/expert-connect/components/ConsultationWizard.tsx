"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Bot,
  Camera,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Lock,
  Globe,
  MapPin,
  Calendar,
  CloudSun,
  Droplets,
  Layers,
  HelpCircle,
  UserCheck,
  Eye,
  Info,
} from "lucide-react";
import {
  AISnapshot,
  ConsultationCase,
  ConsultationDraftInput,
  ExpertProfile,
  FarmerConsentSettings,
} from "../types";
import { DEMONSTRATION_EXPERTS } from "../data/demonstration-experts";
import { rankExpertsForCase } from "../services/expert-service";
import { ExpertCard } from "./ExpertCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export interface ConsultationWizardProps {
  initialDraft?: Partial<ConsultationDraftInput>;
  onCaseCreated: (createdCase: ConsultationCase) => void;
  onCancel?: () => void;
}

export const ConsultationWizard: React.FC<ConsultationWizardProps> = ({
  initialDraft,
  onCaseCreated,
  onCancel,
}) => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form State
  const [consultationReason, setConsultationReason] = useState<string>(
    initialDraft?.consultationReason || "Verify my AI recommendation"
  );
  const [cropName, setCropName] = useState<string>(
    initialDraft?.cropName || "Tomato"
  );
  const [growthStage, setGrowthStage] = useState<string>(
    initialDraft?.growthStage || "Flowering & Fruit Development"
  );
  const [symptomsDescription, setSymptomsDescription] = useState<string>(
    initialDraft?.symptomsDescription || ""
  );
  const [symptomDuration, setSymptomDuration] = useState<string>(
    initialDraft?.symptomDuration || "Past 2-3 days"
  );
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialDraft?.imageUrls || []
  );

  // AI Snapshot (if present from Assistant or Disease detection)
  const [aiSnapshot, setAiSnapshot] = useState<AISnapshot | undefined>(
    initialDraft?.aiSnapshot
  );

  // Farmer Consent & Privacy Settings
  const [consentSettings, setConsentSettings] = useState<FarmerConsentSettings>({
    shareLocation: true,
    shareWeather: true,
    shareSoilAndFarmSize: true,
    farmerApproved: true,
    approvedAt: new Date().toISOString(),
  });

  // Selected Expert
  const [selectedExpert, setSelectedExpert] = useState<ExpertProfile | null>(
    DEMONSTRATION_EXPERTS[0]
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reasons list per requirement
  const consultationReasons = [
    {
      id: "verify",
      title: "Verify my AI recommendation",
      desc: "Check if the AI dosage, chemicals, or diagnosis are safe for my crop stage.",
    },
    {
      id: "worse",
      title: "My crop condition is getting worse",
      desc: "Symptoms have spread or worsened after following initial steps.",
    },
    {
      id: "second-opinion",
      title: "I need a second opinion",
      desc: "Uncertain about disease identification or conflicting advice.",
    },
    {
      id: "new-problem",
      title: "I have a new agricultural problem",
      desc: "Encountered unexpected leaf damage, pest infestation, or wilt.",
    },
    {
      id: "clarification",
      title: "I need clarification about the next steps",
      desc: "Need specific spray timing, water budgeting, or harvest advice.",
    },
  ];

  const popularCrops = [
    "Tomato",
    "Potato",
    "Wheat",
    "Chili",
    "Mustard",
    "Onion",
    "Cotton",
    "Maize",
    "Gram / Chana",
    "Pomegranate",
  ];

  const growthStages = [
    "Sowing / Seedling Stage",
    "Vegetative Stage",
    "Flowering Stage",
    "Flowering & Fruit Development",
    "Grain Filling Stage",
    "Maturity & Pre-Harvest",
  ];

  const durationOptions = [
    "Just noticed today",
    "Past 2-3 days",
    "About 1 week ago",
    "More than 2 weeks",
  ];

  // Ranked experts based on current form inputs
  const rankedExperts = React.useMemo(() => {
    return rankExpertsForCase(DEMONSTRATION_EXPERTS, {
      cropName,
      reason: consultationReason,
      language,
      problemKeywords: symptomsDescription,
    });
  }, [cropName, consultationReason, language, symptomsDescription]);

  // Handle image upload from file or camera
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      setFormError("Uploaded photo exceeds 5 MB limit. Please select a smaller image.");
      return;
    }

    setFormError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrls((prev) => [...prev, event.target!.result as string]);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Validation before going to Step 2
  const handleGoToStep2 = () => {
    if (!symptomsDescription.trim()) {
      setFormError("Please describe your crop symptoms or the question you have for the expert.");
      return;
    }
    setFormError(null);
    setCurrentStep(2);
  };

  // Validation before going to Step 3
  const handleGoToStep3 = () => {
    if (!consentSettings.farmerApproved) {
      setFormError("Please check the consent box to authorize sharing this case with the expert.");
      return;
    }
    setFormError(null);
    setCurrentStep(3);
  };

  // Validation before final confirmation
  const handleGoToStep4 = () => {
    if (!selectedExpert) {
      setFormError("Please choose an agricultural specialist for consultation.");
      return;
    }
    setFormError(null);
    setCurrentStep(4);
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    if (!selectedExpert) return;
    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        userId: user?.id,
        farmerName: user?.name || "Ramesh Kumar",
        farmerPhone: "+91 98290 12345",
        farmerLocation: consentSettings.shareLocation
          ? user?.location || "Jaipur, Rajasthan"
          : "Rajasthan, India (Location withheld by farmer)",
        preferredLanguage: language,
        cropName,
        growthStage,
        consultationReason,
        symptomsDescription,
        symptomDuration,
        imageUrls,
        aiSnapshot,
        farmContext: {
          location: consentSettings.shareLocation ? user?.location || "Jaipur, Rajasthan" : "General Region",
          weatherTemp: consentSettings.shareWeather ? 30 : undefined,
          weatherCondition: consentSettings.shareWeather ? "Partly Cloudy" : undefined,
          humidity: consentSettings.shareWeather ? 58 : undefined,
          rainForecast: consentSettings.shareWeather ? "Dry conditions for next 3 days" : undefined,
          soilType: consentSettings.shareSoilAndFarmSize ? "Sandy Loam" : undefined,
          irrigationStatus: consentSettings.shareSoilAndFarmSize ? "Normal moisture" : undefined,
          acreage: consentSettings.shareSoilAndFarmSize ? user?.acres || 2.5 : undefined,
        },
        consentSettings,
        expertId: selectedExpert.id,
      };

      const res = await fetch("/api/expert-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data?.case) {
        // Also save to localStorage for client-side persistence
        try {
          const stored = localStorage.getItem("agrosaathi_cases") || "[]";
          const cases = JSON.parse(stored);
          cases.unshift(json.data.case);
          localStorage.setItem("agrosaathi_cases", JSON.stringify(cases));
        } catch {
          // ignore storage error
        }

        onCaseCreated(json.data.case);
      } else {
        throw new Error(json.error?.message || "Failed to create consultation case");
      }
    } catch (err: any) {
      console.error("Submission error:", err);
      setFormError(err.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Step Progress Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-3">
          <span>Step {currentStep} of 4</span>
          <span className="text-krishi-700 font-bold">
            {currentStep === 1 && "Problem & Context"}
            {currentStep === 2 && "Review Report & Privacy"}
            {currentStep === 3 && "Select Specialist"}
            {currentStep === 4 && "Confirm & Submit"}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-2 rounded-full transition-all duration-300 ${
                step <= currentStep
                  ? "bg-gradient-to-r from-emerald-500 to-krishi-700"
                  : "bg-slate-100"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {formError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">{formError}</div>
        </div>
      )}

      {/* =================================================================== */}
      {/* STEP 1: Understand Why Farmer Needs Help & Capture Details          */}
      {/* =================================================================== */}
      {currentStep === 1 && (
        <Card className="p-5 sm:p-7 border-slate-200 space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Describe Your Crop Situation
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Provide context so our verified agricultural specialist can assess your field conditions accurately.
            </p>
          </div>

          {/* AI Snapshot Card (if available from Assistant or Disease Detection) */}
          {aiSnapshot && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-krishi-50/60 border border-krishi-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-krishi-700 text-white flex items-center justify-center">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-krishi-900 uppercase tracking-wider">
                    Attached AI Telemetry & Recommendation
                  </span>
                </div>
                {aiSnapshot.confidence && (
                  <Badge variant="success" size="sm" className="text-[11px] font-bold">
                    {aiSnapshot.confidence}% Confidence
                  </Badge>
                )}
              </div>

              {aiSnapshot.diseaseName && (
                <div className="text-sm font-extrabold text-slate-900">
                  Detected Condition: {aiSnapshot.diseaseName}{" "}
                  {aiSnapshot.scientificName && (
                    <span className="text-xs font-normal text-slate-500 italic">
                      ({aiSnapshot.scientificName})
                    </span>
                  )}
                </div>
              )}

              <div className="p-3 bg-white/80 rounded-xl border border-krishi-100 text-xs text-slate-700 leading-relaxed">
                <p className="font-medium text-krishi-900 mb-1">Original AI Advice:</p>
                <p>{aiSnapshot.recommendation}</p>
              </div>

              {aiSnapshot.reasoning && (
                <p className="text-[11px] text-slate-500 italic">
                  Grounding: {aiSnapshot.reasoning}
                </p>
              )}
            </div>
          )}

          {/* Consultation Reason Selection */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Why do you need an expert consultation? *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {consultationReasons.map((r) => {
                const selected = consultationReason === r.title;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setConsultationReason(r.title)}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      selected
                        ? "border-krishi-600 bg-krishi-50/70 ring-1 ring-krishi-500 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-slate-50/40"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                          selected
                            ? "border-krishi-600 bg-krishi-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {selected && <CheckCircle2 className="h-3 w-3" />}
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {r.title}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 pl-6 leading-relaxed">
                      {r.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Crop & Growth Stage 2-Col Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Crop Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Crop Name *
              </label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-krishi-500"
              >
                {popularCrops.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Growth Stage */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Crop Growth Stage
              </label>
              <select
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-krishi-500"
              >
                {growthStages.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Symptoms Description & Duration */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Describe the problem or question *
              </label>
              <span className="text-[11px] text-slate-400">
                {symptomsDescription.length} characters
              </span>
            </div>
            <textarea
              rows={4}
              value={symptomsDescription}
              onChange={(e) => setSymptomsDescription(e.target.value)}
              placeholder="E.g., Leaves on lower stems show brown concentric spots with yellow halos. Watered yesterday via drip. Want to know if standard Mancozeb or systemic spray is safe at current 32°C temperature..."
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-krishi-500 focus:bg-white text-slate-800 leading-relaxed transition-all"
            />
          </div>

          {/* Problem Duration */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              When did the symptoms begin?
            </label>
            <div className="flex flex-wrap gap-2">
              {durationOptions.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => setSymptomDuration(dur)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition-colors ${
                    symptomDuration === dur
                      ? "bg-krishi-700 text-white border-krishi-700 font-bold shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>

          {/* Photograph Upload Area */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Attach Leaf / Crop Photographs (Optional)
            </label>
            <p className="text-[11px] text-slate-500">
              Clear close-up images of affected leaves, stems, or fruits significantly improve diagnostic accuracy.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {imageUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-xs"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Attachment ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 bg-red-600 text-white p-1 rounded-full shadow-md hover:bg-red-700 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {imageUrls.length < 4 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-krishi-500 hover:bg-krishi-50/50 flex flex-col items-center justify-center p-3 text-center transition-all group"
                >
                  <Camera className="h-6 w-6 text-slate-400 group-hover:text-krishi-600 mb-1" />
                  <span className="text-[11px] font-bold text-slate-600 group-hover:text-krishi-800">
                    Add Photo
                  </span>
                  <span className="text-[9px] text-slate-400 mt-0.5">Max 5MB</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {onCancel ? (
              <Button variant="outline" size="sm" onClick={onCancel}>
                Cancel
              </Button>
            ) : <div />}

            <Button
              variant="primary"
              size="md"
              onClick={handleGoToStep2}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Generate Structured Report
            </Button>
          </div>
        </Card>
      )}

      {/* =================================================================== */}
      {/* STEP 2: Structured Report Preview & Privacy Controls                 */}
      {/* =================================================================== */}
      {currentStep === 2 && (
        <Card className="p-5 sm:p-7 border-slate-200 space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-krishi-700" />
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Review Structured Consultation Case
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Here is the exact case dossier prepared for the specialist. Review what will be shared and adjust your privacy preferences.
            </p>
          </div>

          {/* Structured Dossier Preview */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 space-y-5 text-xs sm:text-sm">
            {/* Section A: Case & Farmer Info */}
            <div className="space-y-2 border-b border-slate-200/80 pb-4">
              <span className="text-[10px] font-bold text-krishi-800 uppercase tracking-wider block">
                Section A — Farmer & Case Identifier
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-[10px] text-slate-400">Case Reference</span>
                  <span className="font-mono font-bold text-slate-800">EXP-2026-DRAFT</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-[10px] text-slate-400">Farmer</span>
                  <span className="font-bold text-slate-800">{user?.name || "Ramesh Kumar"}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-[10px] text-slate-400">Language</span>
                  <span className="font-bold text-slate-800 uppercase">{language}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-[10px] text-slate-400">Farm Location</span>
                  <span className="font-bold text-slate-800 truncate">
                    {consentSettings.shareLocation
                      ? user?.location || "Jaipur, Rajasthan"
                      : "Withheld (Regional only)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Section B: Crop & Problem */}
            <div className="space-y-2 border-b border-slate-200/80 pb-4">
              <span className="text-[10px] font-bold text-krishi-800 uppercase tracking-wider block">
                Section B — Crop & Symptom Pathology
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-[10px] text-slate-400">Crop</span>
                  <span className="font-bold text-slate-800">{cropName}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-[10px] text-slate-400">Stage</span>
                  <span className="font-bold text-slate-800">{growthStage}</span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-100">
                  <span className="block text-[10px] text-slate-400">Duration</span>
                  <span className="font-bold text-slate-800">{symptomDuration}</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                <span className="block text-[10px] text-slate-400 font-bold uppercase">
                  Farmer Notes / Symptoms:
                </span>
                <p className="text-slate-700 leading-relaxed">{symptomsDescription}</p>
              </div>

              {imageUrls.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500">Photographs:</span>
                  <div className="flex gap-2">
                    {imageUrls.map((url, i) => (
                      <div
                        key={i}
                        className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="Crop" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Section C: AI Assessment */}
            <div className="space-y-2 border-b border-slate-200/80 pb-4">
              <span className="text-[10px] font-bold text-krishi-800 uppercase tracking-wider block">
                Section C — AI Model Assessment & Context
              </span>
              {aiSnapshot ? (
                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800">
                      Original AI Diagnosis: {aiSnapshot.diseaseName || "General Crop Guidance"}
                    </span>
                    {aiSnapshot.confidence && (
                      <span className="font-mono font-bold text-krishi-700">
                        {aiSnapshot.confidence}% Confidence
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {aiSnapshot.recommendation}
                  </p>
                  {aiSnapshot.reasoning && (
                    <div className="text-[10px] text-slate-500 font-medium pt-1 border-t border-slate-100">
                      Groundings: {aiSnapshot.reasoning}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white p-3 rounded-xl border border-slate-100 text-xs text-slate-500 italic">
                  Independent consultation request (No prior AI recommendation attached).
                </div>
              )}
            </div>

            {/* Section D: Supporting Farm Context */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-krishi-800 uppercase tracking-wider block">
                Section D — Supporting Farm Telemetry & Weather
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                  <CloudSun className="h-4 w-4 text-amber-500" />
                  <div>
                    <span className="block text-[10px] text-slate-400">Weather Context</span>
                    <span className="font-bold text-slate-800">
                      {consentSettings.shareWeather ? "30°C, 58% Humidity" : "Withheld"}
                    </span>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-sky-500" />
                  <div>
                    <span className="block text-[10px] text-slate-400">Soil & Irrigation</span>
                    <span className="font-bold text-slate-800">
                      {consentSettings.shareSoilAndFarmSize ? "Sandy Loam (Drip)" : "Withheld"}
                    </span>
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-500" />
                  <div>
                    <span className="block text-[10px] text-slate-400">Holding Size</span>
                    <span className="font-bold text-slate-800">
                      {consentSettings.shareSoilAndFarmSize ? `${user?.acres || 2.5} Acres` : "Withheld"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Consent Controls */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-krishi-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Farmer Privacy & Consent Settings
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentSettings.shareLocation}
                  onChange={(e) =>
                    setConsentSettings((prev) => ({
                      ...prev,
                      shareLocation: e.target.checked,
                    }))
                  }
                  className="rounded text-krishi-600 focus:ring-krishi-500 h-4 w-4"
                />
                <span>Share approximate farm location ({user?.location || "Jaipur, Rajasthan"}) for climate-accurate advice</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentSettings.shareWeather}
                  onChange={(e) =>
                    setConsentSettings((prev) => ({
                      ...prev,
                      shareWeather: e.target.checked,
                    }))
                  }
                  className="rounded text-krishi-600 focus:ring-krishi-500 h-4 w-4"
                />
                <span>Share synced weather forecast (temperature, humidity, rain alert)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentSettings.shareSoilAndFarmSize}
                  onChange={(e) =>
                    setConsentSettings((prev) => ({
                      ...prev,
                      shareSoilAndFarmSize: e.target.checked,
                    }))
                  }
                  className="rounded text-krishi-600 focus:ring-krishi-500 h-4 w-4"
                />
                <span>Share soil type and acreage to assist dosage calculation</span>
              </label>

              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer font-bold text-slate-900">
                  <input
                    type="checkbox"
                    checked={consentSettings.farmerApproved}
                    onChange={(e) =>
                      setConsentSettings((prev) => ({
                        ...prev,
                        farmerApproved: e.target.checked,
                      }))
                    }
                    className="rounded text-krishi-600 focus:ring-krishi-500 h-4 w-4 mt-0.5"
                  />
                  <span>
                    I confirm that the above information is accurate and I explicitly authorize sharing this report with the assigned agricultural expert for advisory purposes. *
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(1)}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Back to Edit
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleGoToStep3}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Select Agricultural Specialist
            </Button>
          </div>
        </Card>
      )}

      {/* =================================================================== */}
      {/* STEP 3: Match & Select Agricultural Specialist                      */}
      {/* =================================================================== */}
      {currentStep === 3 && (
        <Card className="p-5 sm:p-7 border-slate-200 space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Choose a Certified Agricultural Specialist
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  We automatically ranked the most qualified experts based on your crop (<strong>{cropName}</strong>) and problem category.
                </p>
              </div>
              <Badge variant="success" size="md">
                100% Free Advisory
              </Badge>
            </div>
          </div>

          {/* Expert Cards Ranked List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rankedExperts.map(({ expert, matchScore, matchReasons }, idx) => (
              <ExpertCard
                key={expert.id}
                expert={expert}
                isSelected={selectedExpert?.id === expert.id}
                isRecommended={idx === 0}
                matchReasons={matchReasons}
                onSelect={(exp) => setSelectedExpert(exp)}
              />
            ))}
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(2)}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Back to Report
            </Button>

            <Button
              variant="primary"
              size="md"
              onClick={handleGoToStep4}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Proceed to Confirmation
            </Button>
          </div>
        </Card>
      )}

      {/* =================================================================== */}
      {/* STEP 4: Review & Final Submission                                  */}
      {/* =================================================================== */}
      {currentStep === 4 && selectedExpert && (
        <Card className="p-5 sm:p-7 border-slate-200 space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Confirm Consultation Submission
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Your consultation case is ready to be delivered to the specialist.
            </p>
          </div>

          {/* Submission Summary Card */}
          <div className="p-5 rounded-2xl bg-krishi-50/70 border border-krishi-200 space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl overflow-hidden bg-white border border-krishi-200 shrink-0 shadow-xs">
                {selectedExpert.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedExpert.avatarUrl}
                    alt={selectedExpert.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  selectedExpert.fullName.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-bold text-krishi-800 uppercase tracking-wider block">
                  Assigned Specialist
                </span>
                <h3 className="text-base font-extrabold text-slate-900">
                  {selectedExpert.fullName}
                </h3>
                <p className="text-xs text-krishi-900 font-semibold">
                  {selectedExpert.designation}
                </p>
                <p className="text-[11px] text-slate-600">
                  {selectedExpert.institution}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-krishi-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="block text-[10px] text-slate-500 font-medium">Crop</span>
                <span className="font-bold text-slate-900">{cropName}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-medium">Stage</span>
                <span className="font-bold text-slate-900">{growthStage}</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-medium">Reason</span>
                <span className="font-bold text-slate-900 truncate block">
                  {consultationReason}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 font-medium">Fee</span>
                <span className="font-bold text-emerald-700">₹0 (Free Service)</span>
              </div>
            </div>
          </div>

          {/* Prototype Disclosure & Channel Honesty */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Info className="h-4 w-4 text-krishi-700" />
              <span>Demonstration Delivery Channel Note:</span>
            </div>
            <p>
              Upon submission, this case will be assigned to <strong>{selectedExpert.fullName}</strong> and persisted in the AgroSaathi case registry. You can immediately inspect and test the expert review experience in the <strong>Expert Review Portal</strong> tab.
            </p>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(3)}
              disabled={isSubmitting}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Change Specialist
            </Button>

            <Button
              variant="primary"
              size="lg"
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="bg-krishi-700 hover:bg-krishi-800 text-white font-bold"
              rightIcon={<CheckCircle2 className="h-4 w-4" />}
            >
              {isSubmitting ? "Submitting Case..." : "Submit Consultation Request"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
