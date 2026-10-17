"use client";

import React, { useState } from "react";
import {
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SAMPLE_DISEASE_RESULT } from "@/constants/sample-data";

export const CropDiseasePreview: React.FC = () => {
  const [selectedSample, setSelectedSample] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  const samples = [
    {
      id: "sample-1",
      name: "Early Blight (Tomato)",
      diagnosis: "Tomato - Early Blight",
      confidence: 92,
      summary:
        "Early blight is a common fungal disease that affects tomato leaves, stems and sometimes fruits. It usually appears as dark brown spots with concentric rings.",
      actions: [
        "Remove and destroy infected leaves promptly",
        "Use recommended fungicides (e.g., Mancozeb 75 WP)",
        "Avoid overhead irrigation to keep foliage dry",
        "Maintain proper plant spacing (60 cm) for air flow",
      ],
      emoji: "🍃",
    },
    {
      id: "sample-2",
      name: "Late Blight (Potato)",
      diagnosis: "Potato - Late Blight",
      confidence: 88,
      summary:
        "Water-soaked lesions on leaf tips turning purplish-black with white mildew underneath during high humidity.",
      actions: [
        "Apply protective copper-based sprays immediately",
        "Ensure raised-bed drainage to avoid water accumulation",
        "Harvest only in dry weather and store in cool ventilated crates",
      ],
      emoji: "🥔",
    },
    {
      id: "sample-3",
      name: "Healthy Foliage",
      diagnosis: "Tomato - Healthy Foliage",
      confidence: 97,
      summary:
        "No active pathogen detected. Leaves show vibrant chlorophyll pigmentation and regular cell turgidity.",
      actions: [
        "Maintain balanced NPK fertigation schedule",
        "Continue preventive bio-pesticide neem sprays",
        "Monitor soil moisture before next irrigation cycle",
      ],
      emoji: "🌿",
    },
  ];

  const current = samples[selectedSample];

  const handleSelectSample = (index: number) => {
    setIsAnalyzing(true);
    setSelectedSample(index);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 400);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Action */}
      <div className="flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <Badge variant="green" size="md">
            AI Vision Diagnosis Engine
          </Badge>
          <span className="text-xs text-slate-500">
            Trained on 50,000+ Indian crop foliar specimens
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<BookOpen className="h-3.5 w-3.5 text-krishi-700" />}
        >
          Supported Crops (6)
        </Button>
      </div>

      {/* Two Column Layout matching Reference Screen 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Upload & Sample Selector */}
        <div className="lg:col-span-5 space-y-5">
          {/* Upload Card */}
          <Card className="p-6 border-dashed border-2 border-slate-200 hover:border-krishi-400 bg-white transition-colors text-center">
            <div className="flex flex-col items-center justify-center space-y-3 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-krishi-700 border border-emerald-100 shadow-sm">
                <UploadCloud className="h-8 w-8 stroke-[1.8]" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Upload Leaf Image
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Drag and drop or click to upload
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  JPG, PNG, WEBP (Max 5MB)
                </p>
              </div>

              <div className="pt-2">
                <Button variant="primary" size="sm">
                  Upload Image
                </Button>
              </div>
            </div>
          </Card>

          {/* Try Sample Images Strip */}
          <Card className="p-5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Try Sample Images
            </h5>
            <div className="grid grid-cols-3 gap-2.5">
              {samples.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => handleSelectSample(idx)}
                  className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                    idx === selectedSample
                      ? "border-krishi-500 bg-emerald-50/60 shadow-sm"
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-2xl mb-1">{s.emoji}</span>
                  <span className="text-[11px] font-semibold text-slate-700 line-clamp-1">
                    {s.name.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (7 Cols): Diagnosis Result Panel */}
        <div className="lg:col-span-7">
          <Card className="p-6 border-slate-200/90 shadow-sm">
            {isAnalyzing ? (
              <div className="min-h-[360px] flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-10 w-10 border-3 border-krishi-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-semibold text-slate-600">
                  Analyzing leaf cellular pathology...
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header Badge & Title */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <AlertTriangle className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                        Detected Condition
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {current.diagnosis}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="block text-xs font-bold text-slate-500">
                      Confidence
                    </span>
                    <span className="text-xl font-extrabold text-krishi-700">
                      {current.confidence}%
                    </span>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="space-y-1">
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-krishi-700 rounded-full transition-all duration-500"
                      style={{ width: `${current.confidence}%` }}
                    />
                  </div>
                </div>

                {/* About Disease Description */}
                <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    About this disease
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {current.summary}
                  </p>
                </div>

                {/* Recommended Actions Checklist */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Recommended Actions
                  </h4>
                  <div className="space-y-2">
                    {current.actions.map((action, i) => (
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
                  <Button variant="primary" size="md" rightIcon={<ArrowRight className="h-4 w-4" />}>
                    View Detailed Guide
                  </Button>
                </div>

                {/* Disclaimer */}
                <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-100">
                  {SAMPLE_DISEASE_RESULT.disclaimer}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
