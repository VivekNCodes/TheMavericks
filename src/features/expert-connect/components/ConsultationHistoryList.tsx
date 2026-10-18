"use client";

import React, { useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import { ConsultationCase } from "../types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface ConsultationHistoryListProps {
  cases: ConsultationCase[];
  onSelectCase: (c: ConsultationCase) => void;
  onNewConsultation: () => void;
}

export const ConsultationHistoryList: React.FC<ConsultationHistoryListProps> = ({
  cases,
  onSelectCase,
  onNewConsultation,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const filtered = cases.filter((c) => {
    if (statusFilter !== "all") {
      if (statusFilter === "active" && (c.status === "PENDING" || c.status === "ACCEPTED" || c.status === "IN_PROGRESS")) {
        // match
      } else if (statusFilter === "responded" && c.status === "RESPONDED") {
        // match
      } else if (statusFilter === "resolved" && c.status === "RESOLVED") {
        // match
      } else {
        return false;
      }
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.cropName.toLowerCase().includes(q) ||
        (c.expertName || "").toLowerCase().includes(q) ||
        c.symptomsDescription.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-5">
      {/* Top Header & New Consultation CTA */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Consultation Case History
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review your ongoing second-opinion requests, specialist responses, and treatment checklists.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onNewConsultation}
          leftIcon={<Plus className="h-4 w-4" />}
          className="bg-krishi-700 hover:bg-krishi-800 text-white font-bold text-xs shrink-0"
        >
          New Consultation
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <Card className="p-3.5 border-slate-200">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search cases by Case ID, crop, or specialist name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-500"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "All Cases" },
              { id: "active", label: "Active Review" },
              { id: "responded", label: "Advice Ready" },
              { id: "resolved", label: "Resolved" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? "bg-krishi-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Cases List */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((c) => {
            const hasResponse = Boolean(c.expertResponse);
            return (
              <Card
                key={c.id}
                className="p-4 sm:p-5 border-slate-200 hover:border-krishi-300 hover:shadow-card-hover transition-all cursor-pointer bg-white"
                onClick={() => onSelectCase(c)}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-krishi-800 shrink-0 text-sm">
                      {c.cropName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-400">
                          {c.id}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {c.cropName} — {c.consultationReason}
                        </h3>
                        {c.status === "RESPONDED" && (
                          <Badge variant="success" size="sm" className="text-[10px]">
                            Advice Ready
                          </Badge>
                        )}
                        {c.status === "RESOLVED" && (
                          <Badge variant="success" size="sm" className="text-[10px]">
                            Resolved
                          </Badge>
                        )}
                        {c.status === "PENDING" && (
                          <Badge variant="warning" size="sm" className="text-[10px]">
                            Pending
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-1 mt-1">
                        {c.symptomsDescription}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                        <span>Assigned: <strong>{c.expertName || "Specialist"}</strong></span>
                        <span>•</span>
                        <span>{new Date(c.submittedAt).toLocaleDateString()}</span>
                        {c.expertResponse?.stance && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-krishi-800">
                              Stance: {c.expertResponse.stance}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex items-center justify-end">
                    <Button
                      variant={hasResponse ? "primary" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCase(c);
                      }}
                      className="text-xs font-bold w-full sm:w-auto"
                      rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                    >
                      {hasResponse ? "View Specialist Advice" : "View Case Details"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center border-dashed border-slate-300">
          <div className="max-w-sm mx-auto space-y-3">
            <FileText className="h-10 w-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No consultation records found
            </h3>
            <p className="text-xs text-slate-500">
              When you submit a second-opinion request from the AI Assistant, Crop Disease scanner, or directly, your cases will be tracked here.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={onNewConsultation}
              className="bg-krishi-700 hover:bg-krishi-800 text-white font-bold"
            >
              Start Your First Consultation
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
