"use client";

import React, { useState } from "react";
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  X,
  Sparkles,
  HelpCircle,
  Download,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { parseHistoricalMandiCsv, SAMPLE_HISTORICAL_SCENARIOS } from "../services/csv-parser";
import { HistoricalDataPoint } from "../types";

interface HistoricalCsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyHistoricalRecords: (records: HistoricalDataPoint[], sourceName: string) => void;
}

export const HistoricalCsvUploadModal: React.FC<HistoricalCsvUploadModalProps> = ({
  isOpen,
  onClose,
  onApplyHistoricalRecords,
}) => {
  const [csvContent, setCsvContent] = useState<string>("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseWarnings, setParseWarnings] = useState<string[]>([]);
  const [previewRecords, setPreviewRecords] = useState<HistoricalDataPoint[]>([]);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTextChange = (text: string) => {
    setCsvContent(text);
    setActiveScenario(null);
    if (!text.trim()) {
      setPreviewRecords([]);
      setParseError(null);
      setParseWarnings([]);
      return;
    }

    const res = parseHistoricalMandiCsv(text);
    if (res.success) {
      setPreviewRecords(res.records);
      setParseError(null);
      setParseWarnings(res.warnings);
    } else {
      setPreviewRecords([]);
      setParseError(res.error || "Failed to parse CSV.");
      setParseWarnings(res.warnings);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        handleTextChange(content);
      }
    };
    reader.readAsText(file);
  };

  const handleLoadScenario = (key: keyof typeof SAMPLE_HISTORICAL_SCENARIOS, name: string) => {
    const text = SAMPLE_HISTORICAL_SCENARIOS[key];
    setActiveScenario(name);
    handleTextChange(text);
  };

  const handleApply = () => {
    if (previewRecords.length === 0) return;
    const sourceLabel = activeScenario ? `Scenario: ${activeScenario}` : "Custom CSV Dataset";
    onApplyHistoricalRecords(previewRecords, sourceLabel);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <Card className="w-full max-w-2xl bg-white border-slate-200 shadow-2xl rounded-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Load Historical Mandi Dataset for Backtesting
              </h3>
              <p className="text-xs text-slate-400">
                Upload your time-series CSV or select a benchmark market scenario
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Quick Scenario Buttons */}
          <div>
            <span className="block font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              1-Click Benchmark Test Scenarios:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleLoadScenario("stable", "Stable Trend (Wheat)")}
                className={`p-2 rounded-xl border text-center transition-all ${
                  activeScenario === "Stable Trend (Wheat)"
                    ? "bg-indigo-50 border-indigo-400 font-bold text-indigo-900"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="block font-semibold">Wheat (Stable)</span>
                <span className="text-[10px] text-slate-400">10-Day Series</span>
              </button>

              <button
                type="button"
                onClick={() => handleLoadScenario("rising", "Rising Trend (Tomato)")}
                className={`p-2 rounded-xl border text-center transition-all ${
                  activeScenario === "Rising Trend (Tomato)"
                    ? "bg-indigo-50 border-indigo-400 font-bold text-indigo-900"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="block font-semibold">Tomato (Rising)</span>
                <span className="text-[10px] text-slate-400">Tight Supply</span>
              </button>

              <button
                type="button"
                onClick={() => handleLoadScenario("falling", "Falling Trend (Potato)")}
                className={`p-2 rounded-xl border text-center transition-all ${
                  activeScenario === "Falling Trend (Potato)"
                    ? "bg-indigo-50 border-indigo-400 font-bold text-indigo-900"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="block font-semibold">Potato (Falling)</span>
                <span className="text-[10px] text-slate-400">Harvest Glut</span>
              </button>

              <button
                type="button"
                onClick={() => handleLoadScenario("sparse", "Sparse/Missing Days")}
                className={`p-2 rounded-xl border text-center transition-all ${
                  activeScenario === "Sparse/Missing Days"
                    ? "bg-indigo-50 border-indigo-400 font-bold text-indigo-900"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="block font-semibold">Sparse Data</span>
                <span className="text-[10px] text-slate-400">4 Data Points</span>
              </button>
            </div>
          </div>

          {/* File Picker or Paste */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-bold text-slate-700">
                Or Upload / Paste CSV Content:
              </label>
              <label className="cursor-pointer text-indigo-600 font-bold hover:underline flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Select .csv file
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            <textarea
              rows={6}
              value={csvContent}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="arrival_date,modal_price,min_price,max_price,commodity,market&#10;2026-10-10,2500,2420,2580,Wheat,Agra Mandi&#10;2026-10-11,2520,2440,2600,Wheat,Agra Mandi"
              className="w-full p-3 font-mono text-[11px] bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Required columns: <code className="font-bold text-slate-700">arrival_date</code> (DD/MM/YYYY or YYYY-MM-DD), <code className="font-bold text-slate-700">modal_price</code>. Optional: <code className="text-slate-600">min_price, max_price, commodity, market</code>.
            </p>
          </div>

          {/* Validation Feedback */}
          {parseError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{parseError}</span>
            </div>
          )}

          {previewRecords.length > 0 && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-emerald-800">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Successfully validated {previewRecords.length} chronological records
              </div>
              <div className="text-[11px] text-emerald-700">
                Date Span: {previewRecords[0].displayDate} to{" "}
                {previewRecords[previewRecords.length - 1].displayDate} • Price Range: ₹
                {Math.min(...previewRecords.map((r) => r.modalPrice))} – ₹
                {Math.max(...previewRecords.map((r) => r.modalPrice))}/q
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={previewRecords.length === 0}
            onClick={handleApply}
          >
            Apply to Dashboard &amp; Forecast
          </Button>
        </div>
      </Card>
    </div>
  );
};
