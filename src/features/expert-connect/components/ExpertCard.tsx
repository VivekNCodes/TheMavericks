"use client";

import React from "react";
import {
  CheckCircle2,
  Award,
  Globe2,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Phone,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { ExpertProfile } from "../types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface ExpertCardProps {
  expert: ExpertProfile;
  isSelected?: boolean;
  onSelect?: (expert: ExpertProfile) => void;
  onViewProfile?: (expert: ExpertProfile) => void;
  isRecommended?: boolean;
  matchReasons?: string[];
  compact?: boolean;
}

export const ExpertCard: React.FC<ExpertCardProps> = ({
  expert,
  isSelected = false,
  onSelect,
  onViewProfile,
  isRecommended = false,
  matchReasons = [],
  compact = false,
}) => {
  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 border ${
        isSelected
          ? "border-krishi-600 bg-krishi-50/40 ring-2 ring-krishi-500 shadow-md"
          : "border-slate-200 hover:border-krishi-300 hover:shadow-card-hover bg-white"
      }`}
    >
      {/* Recommended Tag */}
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-gradient-to-l from-emerald-600 to-krishi-700 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-bl-xl shadow-xs flex items-center gap-1 z-10">
          <Sparkles className="h-3 w-3 text-amber-300" />
          <span>Recommended Match</span>
        </div>
      )}

      <div className="p-4 sm:p-5">
        {/* Top Header: Avatar + Designation */}
        <div className="flex items-start gap-3.5">
          <div className="relative shrink-0">
            <div className="h-14 w-14 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 flex items-center justify-center font-bold text-slate-600 text-lg shadow-xs">
              {expert.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={expert.avatarUrl}
                  alt={expert.fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                expert.fullName.charAt(0)
              )}
            </div>
            {expert.isVerified && (
              <span
                className="absolute -bottom-1 -right-1 bg-krishi-600 text-white p-0.5 rounded-full border-2 border-white shadow-xs"
                title="Verified Agricultural Specialist"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0 pr-16 sm:pr-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 truncate">
                {expert.fullName}
              </h3>
              <Badge variant="success" size="sm" className="text-[10px] py-0 px-1.5">
                Verified
              </Badge>
            </div>
            <p className="text-xs font-semibold text-krishi-800 line-clamp-1">
              {expert.designation}
            </p>
            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
              {expert.institution}
            </p>
          </div>
        </div>

        {/* Bio Preview */}
        {!compact && (
          <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {expert.bio}
          </p>
        )}

        {/* Match Reasons Pill (if available) */}
        {matchReasons && matchReasons.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {matchReasons.slice(0, 2).map((reason, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 rounded-md"
              >
                <ShieldCheck className="h-2.5 w-2.5 text-emerald-600" />
                {reason}
              </span>
            ))}
          </div>
        )}

        {/* Specialization Tags */}
        <div className="mt-3 flex flex-wrap gap-1">
          {expert.specializations.slice(0, compact ? 2 : 3).map((spec, idx) => (
            <span
              key={idx}
              className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60"
            >
              {spec}
            </span>
          ))}
          {expert.specializations.length > (compact ? 2 : 3) && (
            <span className="text-[10px] text-slate-400 self-center">
              +{expert.specializations.length - (compact ? 2 : 3)} more
            </span>
          )}
        </div>

        {/* Key Stats Strip */}
        <div className="mt-3.5 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-slate-50/70 p-1.5 rounded-lg border border-slate-100">
            <span className="block text-[10px] text-slate-400 font-medium">Experience</span>
            <span className="font-bold text-slate-800">{expert.experienceYears} Years</span>
          </div>
          <div className="bg-slate-50/70 p-1.5 rounded-lg border border-slate-100">
            <span className="block text-[10px] text-slate-400 font-medium">Rating</span>
            <span className="font-bold text-amber-700 flex items-center justify-center gap-0.5">
              ★ {expert.rating}
            </span>
          </div>
          <div className="bg-slate-50/70 p-1.5 rounded-lg border border-slate-100">
            <span className="block text-[10px] text-slate-400 font-medium">Cases Solved</span>
            <span className="font-bold text-krishi-800">{expert.totalCasesSolved}+</span>
          </div>
        </div>

        {/* Languages & Location */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1 truncate">
            <Globe2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{expert.languages.join(", ")}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 text-krishi-700 font-medium">
            <Clock className="h-3 w-3" />
            <span>{expert.availability}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          {onViewProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewProfile(expert)}
              className="text-xs flex-1 text-slate-600 hover:text-slate-900"
            >
              View Profile
            </Button>
          )}

          {onSelect && (
            <Button
              variant={isSelected ? "primary" : "outline"}
              size="sm"
              onClick={() => onSelect(expert)}
              className={`text-xs flex-1 font-bold ${
                isSelected
                  ? "bg-krishi-700 hover:bg-krishi-800 text-white"
                  : "border-krishi-600 text-krishi-700 hover:bg-krishi-50"
              }`}
              rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
            >
              {isSelected ? "Selected" : "Request Advice"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
