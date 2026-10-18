"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  Sparkles,
  Layers,
  HelpCircle,
  Calendar,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { HistoricalDataPoint, ForecastDataPoint, ForecastEvaluationMetrics } from "../types";

interface PricePredictionChartProps {
  history: HistoricalDataPoint[];
  forecasts: ForecastDataPoint[];
  metrics: ForecastEvaluationMetrics;
  cropName: string;
  mandiName: string;
}

export const PricePredictionChart: React.FC<PricePredictionChartProps> = ({
  history,
  forecasts,
  metrics,
  cropName,
  mandiName,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    displayDate: string;
    price: number;
    isObserved: boolean;
    lowerBound?: number;
    upperBound?: number;
  } | null>(null);

  if (history.length === 0 && forecasts.length === 0) {
    return null;
  }

  // Combine points for layout
  const allPoints = [
    ...history.map((h) => ({
      date: h.date,
      displayDate: h.displayDate,
      price: h.modalPrice,
      isObserved: true as const,
      lowerBound: h.modalPrice,
      upperBound: h.modalPrice,
    })),
    ...forecasts.map((f) => ({
      date: f.date,
      displayDate: f.displayDate,
      price: f.forecastPrice,
      isObserved: false as const,
      lowerBound: f.lowerBound,
      upperBound: f.upperBound,
    })),
  ];

  // SVG dimensions
  const svgWidth = 720;
  const svgHeight = 260;
  const paddingLeft = 60;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 45;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Min and max for Y-axis
  const prices = allPoints.map((p) => p.price);
  const bounds = allPoints.flatMap((p) => [p.lowerBound || p.price, p.upperBound || p.price]);
  const minPrice = Math.min(...bounds);
  const maxPrice = Math.max(...bounds);

  const yMin = Math.max(0, Math.floor((minPrice * 0.92) / 50) * 50);
  const yMax = Math.ceil((maxPrice * 1.08) / 50) * 50;
  const yRange = yMax - yMin || 1;

  // X coordinate calculation
  const getX = (index: number) => {
    return paddingLeft + (index / (allPoints.length - 1)) * chartWidth;
  };

  // Y coordinate calculation
  const getY = (price: number) => {
    return paddingTop + chartHeight - ((price - yMin) / yRange) * chartHeight;
  };

  // Historical path (Solid Emerald)
  const historyIndices = history.map((_, i) => i);
  let historyPath = "";
  if (historyIndices.length > 0) {
    historyPath = historyIndices
      .map((idx, i) => {
        const x = getX(idx);
        const y = getY(history[idx].modalPrice);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(" ");
  }

  // Forecast path (Dashed Purple) connecting from Day T
  const lastHistoryIdx = history.length - 1;
  const forecastCoords = [
    { x: getX(lastHistoryIdx), y: getY(history[lastHistoryIdx].modalPrice) },
    ...forecasts.map((f, i) => ({
      x: getX(history.length + i),
      y: getY(f.forecastPrice),
    })),
  ];

  const forecastPath = forecastCoords
    .map((coord, i) => (i === 0 ? `M ${coord.x} ${coord.y}` : `L ${coord.x} ${coord.y}`))
    .join(" ");

  // Uncertainty polygon (Confidence Band)
  const bandTop = forecastCoords.map((c, i) => {
    if (i === 0) return { x: c.x, y: c.y };
    const f = forecasts[i - 1];
    return { x: c.x, y: getY(f.upperBound) };
  });

  const bandBottom = forecastCoords
    .map((c, i) => {
      if (i === 0) return { x: c.x, y: c.y };
      const f = forecasts[i - 1];
      return { x: c.x, y: getY(f.lowerBound) };
    })
    .reverse();

  const uncertaintyPath = [
    ...bandTop.map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`)),
    ...bandBottom.map((c) => `L ${c.x} ${c.y}`),
    "Z",
  ].join(" ");

  // Horizontal grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((pct) => {
    const val = Math.round(yMin + pct * yRange);
    const y = getY(val);
    return { y, val };
  });

  return (
    <Card className="p-5 bg-white border-slate-200 shadow-sm rounded-2xl space-y-4">
      {/* Header with Title and Model Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-base font-bold text-slate-900">
              4-Day Price Forecast — {cropName || "Produce"}
            </h4>
            <Badge variant="green" size="sm">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              {metrics.modelSelected}
            </Badge>
            {metrics.isExperimental && (
              <Badge variant="neutral" size="sm">
                Experimental
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Historical observed prices ({history.length} days) connected to 4-day walk-forward trend
            projection for {mandiName}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 self-start md:self-auto flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-emerald-600 inline-block shadow-2xs" />
            <span>Actual Observed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-b-2 border-dashed border-indigo-600 inline-block" />
            <span className="text-indigo-700 font-bold">4-Day Forecast (T+1..T+4)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-4 bg-indigo-100 rounded-sm inline-block" />
            <span className="text-slate-400 font-normal">90% Confidence Interval</span>
          </div>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto min-w-[580px] overflow-visible"
        >
          <defs>
            {/* Shaded gradient under historical curve */}
            <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>

            {/* Shaded gradient for forecast uncertainty */}
            <linearGradient id="uncertaintyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Grid lines and Y-axis labels */}
          {gridLines.map((line, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={line.y}
                x2={svgWidth - paddingRight}
                y2={line.y}
                stroke="#F1F5F9"
                strokeWidth="1.5"
                strokeDasharray={idx === 0 || idx === gridLines.length - 1 ? "" : "3 3"}
              />
              <text
                x={paddingLeft - 8}
                y={line.y + 4}
                textAnchor="end"
                fontSize="10"
                fill="#94A3B8"
                fontWeight="500"
              >
                ₹{line.val.toLocaleString("en-IN")}
              </text>
            </g>
          ))}

          {/* Forecast Uncertainty Envelope */}
          <path d={uncertaintyPath} fill="url(#uncertaintyGradient)" />

          {/* Historical Trend Curve */}
          <path
            d={historyPath}
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Forecast Trend Dashed Curve */}
          <path
            d={forecastPath}
            fill="none"
            stroke="#6366F1"
            strokeWidth="2.5"
            strokeDasharray="5 4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Vertical Separator at Day T (Today) */}
          <line
            x1={getX(lastHistoryIdx)}
            y1={paddingTop}
            x2={getX(lastHistoryIdx)}
            y2={svgHeight - paddingBottom}
            stroke="#CBD5E1"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />
          <text
            x={getX(lastHistoryIdx)}
            y={paddingTop - 10}
            textAnchor="middle"
            fontSize="10"
            fill="#0F172A"
            fontWeight="700"
          >
            Today (Day T)
          </text>

          {/* Historical Data Dots */}
          {history.map((pt, i) => {
            const cx = getX(i);
            const cy = getY(pt.modalPrice);
            const isLatest = i === lastHistoryIdx;

            return (
              <g
                key={`hist_${i}`}
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHoveredPoint({
                    date: pt.date,
                    displayDate: pt.displayDate,
                    price: pt.modalPrice,
                    isObserved: true,
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isLatest ? "5.5" : "4"}
                  fill={isLatest ? "#10B981" : "#FFFFFF"}
                  stroke="#10B981"
                  strokeWidth={isLatest ? "3" : "2"}
                />
                {/* Date label */}
                <text
                  x={cx}
                  y={svgHeight - paddingBottom + 18}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="#64748B"
                  fontWeight="500"
                >
                  {pt.displayDate.replace(" (Latest)", "")}
                </text>
              </g>
            );
          })}

          {/* Forecast Data Diamonds */}
          {forecasts.map((fc, i) => {
            const cx = getX(history.length + i);
            const cy = getY(fc.forecastPrice);

            return (
              <g
                key={`fc_${i}`}
                className="cursor-pointer"
                onMouseEnter={() =>
                  setHoveredPoint({
                    date: fc.date,
                    displayDate: fc.displayDate,
                    price: fc.forecastPrice,
                    isObserved: false,
                    lowerBound: fc.lowerBound,
                    upperBound: fc.upperBound,
                  })
                }
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Diamond shape */}
                <polygon
                  points={`${cx},${cy - 5.5} ${cx + 5.5},${cy} ${cx},${cy + 5.5} ${cx - 5.5},${cy}`}
                  fill="#6366F1"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                />
                {/* Forecast date label */}
                <text
                  x={cx}
                  y={svgHeight - paddingBottom + 18}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="#4F46E5"
                  fontWeight="600"
                >
                  {fc.displayDate}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Float */}
        {hoveredPoint && (
          <div className="absolute top-2 right-4 bg-slate-900/90 backdrop-blur-xs text-white p-2.5 rounded-xl text-xs shadow-lg pointer-events-none z-10 space-y-0.5 border border-slate-700">
            <div className="font-bold flex items-center gap-1.5">
              <span>{hoveredPoint.displayDate}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                  hoveredPoint.isObserved ? "bg-emerald-600 text-white" : "bg-indigo-600 text-white"
                }`}
              >
                {hoveredPoint.isObserved ? "Actual Observed" : "Predicted Modal Rate"}
              </span>
            </div>
            <div className="text-base font-black">
              ₹{hoveredPoint.price.toLocaleString("en-IN")}/q
            </div>
            {!hoveredPoint.isObserved && hoveredPoint.lowerBound && hoveredPoint.upperBound && (
              <div className="text-[11px] text-slate-300">
                90% Range: ₹{hoveredPoint.lowerBound.toLocaleString("en-IN")} – ₹
                {hoveredPoint.upperBound.toLocaleString("en-IN")}/q
              </div>
            )}
          </div>
        )}
      </div>

      {/* Model Backtesting & Performance Card */}
      <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Walk-Forward Backtesting Score:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
              MAE: <strong>±₹{metrics.mae}/q</strong>
            </span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700">
              RMSE: <strong>±₹{metrics.rmse}/q</strong>
            </span>
          </div>

          <div className="text-slate-500 font-medium">
            vs. Naive Baseline: <span className="font-bold">±₹{metrics.baselineMae}/q</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-600 leading-relaxed">{metrics.explanation}</p>
      </div>
    </Card>
  );
};
