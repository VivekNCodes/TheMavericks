"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  PhoneCall,
  GraduationCap,
  ShieldAlert,
  Info,
  CheckCircle2,
  Users,
  Sparkles,
  X,
  Phone,
  Mail,
  Building,
} from "lucide-react";
import { ExpertProfile } from "../types";
import { DEMONSTRATION_EXPERTS, KISAN_CALL_CENTRE } from "../data/demonstration-experts";
import { ExpertCard } from "./ExpertCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

export interface ExpertDirectoryProps {
  onSelectExpert?: (expert: ExpertProfile) => void;
  selectedExpertId?: string;
}

export const ExpertDirectory: React.FC<ExpertDirectoryProps> = ({
  onSelectExpert,
  selectedExpertId,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [inspectedExpert, setInspectedExpert] = useState<ExpertProfile | null>(null);

  const specializations = [
    { id: "all", label: "All Specializations" },
    { id: "pathology", label: "Crop Disease & Pathology" },
    { id: "fertility", label: "Soil & Nutrient Management" },
    { id: "irrigation", label: "Irrigation & Water" },
    { id: "pest", label: "Pest Management (IPM)" },
    { id: "horticulture", label: "Horticulture & Fruits" },
  ];

  const languages = [
    { id: "all", label: "All Languages" },
    { id: "hindi", label: "Hindi (हिन्दी)" },
    { id: "english", label: "English" },
    { id: "punjabi", label: "Punjabi (ਪੰਜਾਬੀ)" },
    { id: "marathi", label: "Marathi (मराठी)" },
  ];

  const filteredExperts = useMemo(() => {
    return DEMONSTRATION_EXPERTS.filter((expert) => {
      // Search text
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          expert.fullName.toLowerCase().includes(q) ||
          expert.designation.toLowerCase().includes(q) ||
          expert.institution.toLowerCase().includes(q) ||
          expert.specializations.some((s) => s.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      // Specialization
      if (selectedSpecialization !== "all") {
        const specsJoined = expert.specializations.join(" ").toLowerCase();
        if (!specsJoined.includes(selectedSpecialization)) return false;
      }

      // Language
      if (selectedLanguage !== "all") {
        const langsJoined = expert.languages.join(" ").toLowerCase();
        if (!langsJoined.includes(selectedLanguage)) return false;
      }

      return true;
    });
  }, [searchQuery, selectedSpecialization, selectedLanguage]);

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Free Advisory Notice */}
      <div className="bg-gradient-to-br from-krishi-800 to-krishi-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-56 h-56 bg-krishi-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-krishi-700/80 border border-krishi-500/40 text-krishi-100 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <span>100% Free Agricultural Consultation for Indian Farmers</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Mavericks Expert Directory
          </h1>

          <p className="text-sm sm:text-base text-krishi-100/90 leading-relaxed">
            Connect with verified agricultural scientists, ICAR plant pathologists, and regional KVK extension officers for second opinions on your crop telemetry and AI recommendations.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-krishi-200">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-krishi-400" />
              Verified ICAR & State Extension Scientists
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-krishi-400" />
              Context-Aware AI-to-Human Handoff
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-krishi-400" />
              Zero Consultation Fees
            </span>
          </div>
        </div>
      </div>

      {/* 2. Official Kisan Call Centre Toll-Free Option */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-yellow-50/70 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Government Kisan Call Centre (KCC)
                </h3>
                <Badge variant="warning" size="sm" className="text-[10px]">
                  Official Govt. Helpline
                </Badge>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Toll-free telephonic advisory operated by Ministry of Agriculture & Farmers Welfare. Available in 22 regional languages.
              </p>
              <span className="text-[11px] font-semibold text-slate-500 mt-1 inline-block">
                Hours: {KISAN_CALL_CENTRE.timing}
              </span>
            </div>
          </div>

          <a
            href={`tel:${KISAN_CALL_CENTRE.tollFreeNumber}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition-all shrink-0"
          >
            <Phone className="h-4 w-4" />
            <span>Call Toll Free: {KISAN_CALL_CENTRE.tollFreeNumber}</span>
          </a>
        </div>
      </Card>

      {/* 3. Search & Filters Bar */}
      <Card className="p-4 sm:p-5 border-slate-200">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search experts by name, crop pathology, university, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                Language:
              </span>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-krishi-500"
              >
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Specialization Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            {specializations.map((spec) => {
              const active = selectedSpecialization === spec.id;
              return (
                <button
                  key={spec.id}
                  onClick={() => setSelectedSpecialization(spec.id)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                    active
                      ? "bg-krishi-700 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                  }`}
                >
                  {spec.label}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      {/* 4. Demonstration Disclaimer Notice */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div className="flex items-center gap-1.5">
          <Info className="h-4 w-4 text-krishi-700 shrink-0" />
          <span>
            Showing <strong>{filteredExperts.length}</strong> verified agricultural specialists available for consultation.
          </span>
        </div>
        <Badge variant="outline" size="sm" className="text-[10px] text-slate-500">
          Prototype Sample Profiles
        </Badge>
      </div>

      {/* 5. Expert Cards Grid */}
      {filteredExperts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredExperts.map((expert, idx) => (
            <ExpertCard
              key={expert.id}
              expert={expert}
              isSelected={selectedExpertId === expert.id}
              isRecommended={idx === 0}
              matchReasons={
                idx === 0
                  ? ["Lead Plant Pathology Scientist", "High response rating"]
                  : undefined
              }
              onSelect={onSelectExpert}
              onViewProfile={(exp) => setInspectedExpert(exp)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center border-dashed border-slate-300">
          <div className="max-w-md mx-auto space-y-3">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              No matching agricultural specialists found
            </h3>
            <p className="text-xs text-slate-500">
              Try adjusting your search query, specialization filters, or preferred language. Alternatively, you can contact the toll-free Kisan Call Centre (1800-180-1551).
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedSpecialization("all");
                setSelectedLanguage("all");
              }}
            >
              Reset All Filters
            </Button>
          </div>
        </Card>
      )}

      {/* 6. Profile Inspection Modal */}
      {inspectedExpert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-krishi-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Expert Credentials & Verification
                </h3>
              </div>
              <button
                onClick={() => setInspectedExpert(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="flex items-start gap-4">
                <div className="h-16 w-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  {inspectedExpert.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={inspectedExpert.avatarUrl}
                      alt={inspectedExpert.fullName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    inspectedExpert.fullName.charAt(0)
                  )}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    {inspectedExpert.fullName}
                  </h4>
                  <p className="text-xs font-semibold text-krishi-800">
                    {inspectedExpert.designation}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {inspectedExpert.institution}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="success" size="sm">
                      Verified Specialist
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {inspectedExpert.district}, {inspectedExpert.state}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Biography & Agronomic Scope
                </span>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {inspectedExpert.bio}
                </p>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Key Technical Specializations
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectedExpert.specializations.map((spec, i) => (
                    <span
                      key={i}
                      className="text-xs font-medium bg-krishi-50 text-krishi-900 border border-krishi-200 px-2.5 py-1 rounded-lg"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block font-medium">Languages</span>
                  <span className="text-xs font-bold text-slate-800">
                    {inspectedExpert.languages.join(", ")}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block font-medium">Availability</span>
                  <span className="text-xs font-bold text-krishi-700">
                    {inspectedExpert.availability}
                  </span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-400 italic">
                * Note: This is an authorized demonstration profile designed for the AgroSaathi platform prototype. Real farmer consultations connect to certified ICAR KVK SMS experts.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInspectedExpert(null)}
              >
                Close
              </Button>
              {onSelectExpert && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    onSelectExpert(inspectedExpert);
                    setInspectedExpert(null);
                  }}
                >
                  Select This Expert
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
