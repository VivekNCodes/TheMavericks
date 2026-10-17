"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Sparkles,
  RefreshCw,
  X,
  FileImage,
  Cpu,
  Layers,
  MessageSquare,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { ModelDiagnosisResult, DiagnosisApiResponse } from "../types";
import { AGRONOMIC_GUIDANCE_MAP } from "../data/treatment-guidance";

interface PresetSample {
  id: string;
  name: string;
  crop: string;
  condition: string;
  scientificName?: string;
  confidence: number;
  summary: string;
  actions: string[];
  emoji: string;
  isHealthy: boolean;
}

export const CropDiseasePreview: React.FC = () => {
  // Preset demo samples
  const samples: PresetSample[] = [
    {
      id: "sample-1",
      name: "Early Blight (Tomato)",
      crop: "Tomato",
      condition: "Early Blight",
      scientificName: "Alternaria solani",
      confidence: 92,
      summary:
        "Early blight is a common fungal disease that affects tomato leaves, stems and sometimes fruits. It usually appears as dark brown spots with concentric target rings.",
      actions: [
        "Remove and destroy infected leaves promptly",
        "Use recommended fungicides (e.g., Mancozeb 75 WP)",
        "Avoid overhead irrigation to keep foliage dry",
        "Maintain proper plant spacing (60 cm) for air flow",
      ],
      emoji: "🍃",
      isHealthy: false,
    },
    {
      id: "sample-2",
      name: "Late Blight (Potato)",
      crop: "Potato",
      condition: "Late Blight",
      scientificName: "Phytophthora infestans",
      confidence: 88,
      summary:
        "Water-soaked lesions on leaf tips turning purplish-black with white mildew underneath during high humidity.",
      actions: [
        "Apply protective copper-based sprays immediately",
        "Ensure raised-bed drainage to avoid water accumulation",
        "Harvest only in dry weather and store in cool ventilated crates",
      ],
      emoji: "🥔",
      isHealthy: false,
    },
    {
      id: "sample-3",
      name: "Healthy Foliage",
      crop: "Tomato",
      condition: "Healthy Foliage",
      confidence: 97,
      summary:
        "No active pathogen detected. Leaves show vibrant chlorophyll pigmentation and regular cell turgidity.",
      actions: [
        "Maintain balanced NPK fertigation schedule",
        "Continue preventive bio-pesticide neem sprays",
        "Monitor soil moisture before next irrigation cycle",
      ],
      emoji: "🌿",
      isHealthy: true,
    },
  ];

  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number | null>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [modelResult, setModelResult] = useState<ModelDiagnosisResult | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSupportedCropsOpen, setIsSupportedCropsOpen] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Grouped classes for the Supported Crops modal
  const supportedCropsList = [
    { name: "Tomato", classes: ["Bacterial spot", "Early blight", "Late blight", "Leaf Mold", "Septoria leaf spot", "Spider mites", "Target Spot", "Yellow Leaf Curl Virus", "Mosaic virus", "Healthy"] },
    { name: "Potato", classes: ["Early blight", "Late blight", "Healthy"] },
    { name: "Corn (Maize)", classes: ["Gray leaf spot", "Common rust", "Northern Leaf Blight", "Healthy"] },
    { name: "Apple", classes: ["Apple scab", "Black rot", "Cedar apple rust", "Healthy"] },
    { name: "Grape", classes: ["Black rot", "Esca (Black measles)", "Leaf blight (Isariopsis)", "Healthy"] },
    { name: "Bell Pepper", classes: ["Bacterial spot", "Healthy"] },
    { name: "Cherry", classes: ["Powdery mildew", "Healthy"] },
    { name: "Peach", classes: ["Bacterial spot", "Healthy"] },
    { name: "Strawberry", classes: ["Leaf scorch", "Healthy"] },
    { name: "Squash", classes: ["Powdery mildew"] },
    { name: "Orange / Citrus", classes: ["Citrus greening (Huanglongbing)"] },
    { name: "Soybean", classes: ["Healthy"] },
    { name: "Raspberry", classes: ["Healthy"] },
    { name: "Blueberry", classes: ["Healthy"] },
  ];

  const handleSelectSample = (index: number) => {
    setAnalysisError(null);
    setModelResult(null);
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
    setSelectedFileName(null);
    setSelectedSampleIndex(index);
  };

  const processFile = async (file: File) => {
    // 1. Validation checks
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setAnalysisError(
        `Selected file exceeds 5MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please select a smaller leaf image.`
      );
      return;
    }

    const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    if (!validExtensions.includes(ext)) {
      setAnalysisError(
        `Unsupported format '${ext}'. Please upload a valid JPG, PNG, or WEBP image.`
      );
      return;
    }

    // 2. Prepare state
    setAnalysisError(null);
    setSelectedSampleIndex(null);
    setSelectedFileName(file.name);

    if (previewImage) {
      URL.revokeObjectURL(previewImage);
    }
    const localUrl = URL.createObjectURL(file);
    setPreviewImage(localUrl);
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/crop-disease/diagnose", {
        method: "POST",
        body: formData,
      });

      const json: DiagnosisApiResponse = await res.json();

      if (!res.ok || !json.success || !json.data) {
        throw new Error(
          json.error?.message ||
            "Model inference failed. Ensure the Python backend is running."
        );
      }

      setModelResult(json.data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during leaf analysis.";
      setAnalysisError(msg);
      setModelResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const resetToPresets = () => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
    setSelectedFileName(null);
    setAnalysisError(null);
    setModelResult(null);
    setSelectedSampleIndex(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Resolve current active item (model result takes precedence over demo preset)
  const isModelActive = !!modelResult;
  const currentPreset =
    selectedSampleIndex !== null ? samples[selectedSampleIndex] : null;

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Banner Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Badge variant="green" size="md">
            <Sparkles className="h-3 w-3 mr-1" />
            ResNet50-DCBAM AI Vision
          </Badge>
          <span className="text-xs text-slate-500">
            Trained on 38 PlantVillage foliar classes with dual-channel attention
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsSupportedCropsOpen(true)}
          leftIcon={<BookOpen className="h-3.5 w-3.5 text-krishi-700" />}
        >
          Supported Crops (14)
        </Button>
      </div>

      {/* Two Column Layout matching Reference Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Upload & Sample Selector */}
        <div className="lg:col-span-5 space-y-5">
          {/* Upload Card */}
          <Card
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`p-6 border-dashed border-2 transition-all text-center cursor-pointer ${
              isDragging
                ? "border-krishi-600 bg-emerald-50/70 scale-[1.01]"
                : "border-slate-200 hover:border-krishi-400 bg-white"
            }`}
            onClick={() => {
              if (!isAnalyzing && fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
          >
            <div className="flex flex-col items-center justify-center space-y-3 py-2">
              {previewImage ? (
                <div className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewImage}
                    alt="Uploaded leaf specimen"
                    className="h-28 w-28 object-cover rounded-2xl border-2 border-krishi-500 shadow-md"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                    Change Photo
                  </div>
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-krishi-700 border border-emerald-100 shadow-sm">
                  <UploadCloud className="h-8 w-8 stroke-[1.8]" />
                </div>
              )}

              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {selectedFileName ? selectedFileName : "Upload Leaf Image"}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Drag and drop or click to upload
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  JPG, PNG, WEBP (Max 5MB)
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isAnalyzing}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  }}
                >
                  {isAnalyzing ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      Analyzing...
                    </span>
                  ) : previewImage ? (
                    "Upload Another Image"
                  ) : (
                    "Upload Image"
                  )}
                </Button>

                {previewImage && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      resetToPresets();
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Validation Error Banner */}
          {analysisError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                <span>Diagnosis Error</span>
              </div>
              <p className="leading-relaxed">{analysisError}</p>
              <div className="pt-1 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToPresets}
                  className="bg-white text-xs h-7 px-2.5"
                >
                  Switch to Demo Presets
                </Button>
                {selectedFileName && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (fileInputRef.current?.files?.[0]) {
                        processFile(fileInputRef.current.files[0]);
                      }
                    }}
                    className="text-xs h-7 px-2.5"
                  >
                    Retry Analysis
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Try Sample Images Strip */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Try Demo Samples
              </h5>
              <Badge variant="neutral" size="sm">
                Preset Previews
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {samples.map((s, idx) => {
                const isSelected =
                  !isModelActive && selectedSampleIndex === idx && !analysisError;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSample(idx)}
                    className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "border-krishi-500 bg-emerald-50/60 shadow-sm ring-1 ring-krishi-500"
                        : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-2xl mb-1">{s.emoji}</span>
                    <span className="text-[11px] font-semibold text-slate-700 line-clamp-1">
                      {s.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Right Column (7 Cols): Diagnosis Result Panel */}
        <div className="lg:col-span-7">
          <Card className="p-6 border-slate-200/90 shadow-sm relative">
            {isAnalyzing ? (
              <div className="min-h-[380px] flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-12 w-12 border-3 border-krishi-600 border-t-transparent rounded-full animate-spin" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">
                    Running ResNet50-DCBAM Neural Inference...
                  </p>
                  <p className="text-xs text-slate-500">
                    Extracting c5 spatial-channel attention features (224x224 RGB)
                  </p>
                </div>
              </div>
            ) : isModelActive && modelResult ? (
              /* REAL MODEL PREDICTION VIEW */
              <div className="space-y-6">
                {/* Mode Indicator Pill */}
                <div className="flex items-center justify-between">
                  <Badge variant="green" size="md">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Live PyTorch Model Prediction
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Device: {modelResult.device || "cpu"}
                  </span>
                </div>

                {/* Header Badge & Title */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      {modelResult.isHealthy ? (
                        <>
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <ShieldCheck className="h-4 w-4" />
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                            Healthy Crop Foliage
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <AlertTriangle className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                            Detected Foliar Condition
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {modelResult.crop} — {modelResult.condition}
                    </h3>
                    {modelResult.scientificName && (
                      <p className="text-xs text-slate-500 italic mt-0.5">
                        Pathogen taxonomy: {modelResult.scientificName}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-xs font-bold text-slate-500">
                      Model Confidence
                    </span>
                    <span className="text-2xl font-extrabold text-krishi-700">
                      {modelResult.confidence}%
                    </span>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="space-y-1">
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        modelResult.isHealthy
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                          : "bg-gradient-to-r from-amber-500 to-red-600"
                      }`}
                      style={{ width: `${modelResult.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Top Predictions Breakdown */}
                {modelResult.topPredictions && modelResult.topPredictions.length > 1 && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <Layers className="h-3.5 w-3.5 text-slate-400" />
                      <span>Top Candidate Predictions</span>
                    </div>
                    <div className="space-y-1.5">
                      {modelResult.topPredictions.map((cand) => (
                        <div
                          key={cand.rank}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-400 text-[10px]">
                              #{cand.rank}
                            </span>
                            <span className="font-semibold text-slate-800">
                              {cand.crop} — {cand.condition}
                            </span>
                            {cand.isHealthy && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                                healthy
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-slate-600">
                            {cand.confidence}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* About Disease Description */}
                <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Pathology & Symptom Description
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {modelResult.summary}
                  </p>
                </div>

                {/* Recommended Actions Checklist */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    ICAR Recommended Management Practices
                  </h4>
                  <div className="space-y-2">
                    {modelResult.recommendedActions.map((action, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700"
                      >
                        <CheckCircle2 className="h-4 w-4 text-krishi-600 shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    href={`/assistant?q=${encodeURIComponent(
                      `What are the best organic and chemical treatments for ${modelResult.crop} ${modelResult.condition}?`
                    )}`}
                  >
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<MessageSquare className="h-4 w-4" />}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Ask AI Sahayak About Remedies
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                    leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
                  >
                    Diagnose Another Leaf
                  </Button>
                </div>

                {/* Disclaimer */}
                <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-100">
                  {modelResult.disclaimer}
                </p>
              </div>
            ) : currentPreset ? (
              /* DEMO PRESET PREVIEW VIEW */
              <div className="space-y-6">
                {/* Preset Banner */}
                <div className="flex items-center justify-between pb-1">
                  <Badge variant="neutral" size="sm">
                    Demo Preset Preview
                  </Badge>
                  <span className="text-[11px] text-slate-400">
                    Upload image above for live model inference
                  </span>
                </div>

                {/* Header Badge & Title */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      {currentPreset.isHealthy ? (
                        <>
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <ShieldCheck className="h-4 w-4" />
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                            Healthy Specimen
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <AlertTriangle className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                            Detected Condition
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {currentPreset.crop} — {currentPreset.condition}
                    </h3>
                    {currentPreset.scientificName && (
                      <p className="text-xs text-slate-500 italic mt-0.5">
                        Pathogen taxonomy: {currentPreset.scientificName}
                      </p>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="block text-xs font-bold text-slate-500">
                      Sample Confidence
                    </span>
                    <span className="text-xl font-extrabold text-krishi-700">
                      {currentPreset.confidence}%
                    </span>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="space-y-1">
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-krishi-700 rounded-full transition-all duration-500"
                      style={{ width: `${currentPreset.confidence}%` }}
                    />
                  </div>
                </div>

                {/* About Disease Description */}
                <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    About this disease
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {currentPreset.summary}
                  </p>
                </div>

                {/* Recommended Actions Checklist */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Recommended Actions
                  </h4>
                  <div className="space-y-2">
                    {currentPreset.actions.map((action, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700"
                      >
                        <CheckCircle2 className="h-4 w-4 text-krishi-600 shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button Action */}
                <div className="pt-2">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }}
                    rightIcon={<ArrowRight className="h-4 w-4" />}
                  >
                    Upload Real Leaf Image for Inference
                  </Button>
                </div>

                {/* Disclaimer */}
                <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-100">
                  Disclaimer: This is demo reference data. For real model inference on your crop, upload a photograph. Always consult your local Krishi Vigyan Kendra (KVK) for critical field interventions.
                </p>
              </div>
            ) : null}
          </Card>
        </div>
      </div>

      {/* Supported Crops & Classes Modal */}
      {isSupportedCropsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-krishi-700" />
                <h3 className="font-bold text-slate-900 text-lg">
                  Supported Agricultural Crops & Conditions
                </h3>
              </div>
              <button
                onClick={() => setIsSupportedCropsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              <p className="text-xs text-slate-600">
                The trained <strong>ResNet50-DCBAM</strong> neural network classifies 38 distinct plant conditions across 14 crops. Upload a clear photograph of an individual affected or healthy leaf.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {supportedCropsList.map((crop) => (
                  <div
                    key={crop.name}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2"
                  >
                    <div className="font-bold text-sm text-slate-900 flex items-center justify-between">
                      <span>{crop.name}</span>
                      <span className="text-[11px] font-normal text-slate-400">
                        {crop.classes.length} {crop.classes.length === 1 ? "class" : "classes"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {crop.classes.map((cls) => (
                        <span
                          key={cls}
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            cls.toLowerCase().includes("healthy")
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsSupportedCropsOpen(false)}
              >
                Close Reference Guide
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
