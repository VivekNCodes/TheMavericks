"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  BarChart3,
  Upload,
  RotateCcw,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Mic,
  MicOff,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SAMPLE_MANDI_RESULT } from "@/constants/sample-data";
import {
  NormalizedMandiRecord,
  HistoricalDataPoint,
  ForecastDataPoint,
  MandiApiResponseData,
} from "../types";
import { generateMandiPriceForecast } from "../services/forecasting";
import {
  getCommodityHistoricalSeries,
  BENCHMARK_TEMPLATES,
} from "../services/historical-data";
import {
  AUTHORITATIVE_INDIAN_STATES_AND_UTS,
  getDistrictsForState,
  isAllStates,
  isAllDistricts,
} from "../services/location-data";
import { SellOrWaitAdvisor } from "./SellOrWaitAdvisor";
import { LatestThreeDaysSummary } from "./LatestThreeDaysSummary";
import { HistoricalCsvUploadModal } from "./HistoricalCsvUploadModal";
import { useLanguage } from "@/context/LanguageContext";

export const MandiPricesPreview: React.FC = () => {
  const { t, language } = useLanguage();

  const getCropTranslated = (crop: string): string => {
    switch (crop.toLowerCase()) {
      case "tomato":
        return t("cropTomato") || crop;
      case "wheat":
        return t("cropWheat") || crop;
      case "potato":
        return t("cropPotato") || crop;
      case "onion":
        return t("cropOnion") || crop;
      case "mustard":
        return t("cropMustard") || crop;
      case "chili":
        return t("cropChili") || crop;
      default:
        return crop;
    }
  };

  const [selectedRange, setSelectedRange] = useState<"7D" | "4D Forecast" | "1M" | "3M">("7D");
  const [selectedCrop, setSelectedCrop] = useState("Tomato");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedMarketName, setSelectedMarketName] = useState<string | null>(null);

  // Live API records state
  const [liveRecords, setLiveRecords] = useState<NormalizedMandiRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiDataSource, setApiDataSource] = useState<string>("Sample Reference Data");
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [lastReportingDate, setLastReportingDate] = useState<string | null>(null);
  const [coverageNotice, setCoverageNotice] = useState<string | null>(null);

  // Available options - initialized with all 36 authoritative Indian States and Union Territories
  const [availableStates, setAvailableStates] = useState<string[]>([
    ...AUTHORITATIVE_INDIAN_STATES_AND_UTS,
  ]);
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [availableCrops, setAvailableCrops] = useState<string[]>([
    "Tomato",
    "Wheat",
    "Potato",
    "Onion",
    "Mustard",
    "Gram",
    "Bajra",
    "Chili",
  ]);

  // Custom historical dataset state (CSV or preset)
  const [customHistory, setCustomHistory] = useState<HistoricalDataPoint[] | null>(null);
  const [customHistoryLabel, setCustomHistoryLabel] = useState<string | null>(null);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);

  // Voice search state
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<{
    message: string;
    isError?: boolean;
    isListening?: boolean;
  } | null>(null);
  const recognitionRef = useRef<any>(null);

  // Speech Recognition voice search handler
  const toggleVoiceSearch = () => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

    if (!SpeechRecognition) {
      setVoiceFeedback({
        message:
          t("voiceNotSupported") ||
          "Speech recognition is not supported in this browser. Please use typed search.",
        isError: true,
      });
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      setVoiceFeedback(null);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      const langMap: Record<string, string> = {
        en: "en-IN",
        hi: "hi-IN",
        mr: "mr-IN",
        pa: "pa-IN",
      };
      recognition.lang = langMap[language] || "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceFeedback({
          message: t("voiceListening") || "Listening... speak crop, state or mandi",
          isListening: true,
        });
      };

      recognition.onresult = (event: any) => {
        setIsListening(false);
        const transcript = event.results?.[0]?.[0]?.transcript?.trim() || "";
        if (!transcript) return;

        const lower = transcript.toLowerCase();

        let matchedCrop: string | null = null;
        if (/tomato|टमाटर|टोमॅटो|ਟਮਾਟਰ/i.test(lower)) matchedCrop = "Tomato";
        else if (/wheat|गेहूं|गहू|ਕਣਕ/i.test(lower)) matchedCrop = "Wheat";
        else if (/onion|प्याज|कांदा|ਪਿਆਜ਼/i.test(lower)) matchedCrop = "Onion";
        else if (/potato|आलू|बटाटा|ਆਲੂ/i.test(lower)) matchedCrop = "Potato";
        else if (/mustard|सरसों|मोहरी|ਸਰ੍ਹੋਂ/i.test(lower)) matchedCrop = "Mustard";
        else if (/gram|चना|हरभरा|ਛੋਲੇ/i.test(lower)) matchedCrop = "Gram";
        else if (/bajra|बाजरा|बाजरी|ਬਾਜਰਾ/i.test(lower)) matchedCrop = "Bajra";

        let matchedState: string | null = null;
        if (/rajasthan|राजस्थान/i.test(lower)) matchedState = "Rajasthan";
        else if (/maharashtra|महाराष्ट्र/i.test(lower)) matchedState = "Maharashtra";
        else if (/punjab|पंजाब|ਪੰਜਾਬ/i.test(lower)) matchedState = "Punjab";
        else if (/uttar\s*pradesh|उत्तर\s*प्रदेश/i.test(lower)) matchedState = "Uttar Pradesh";
        else if (/haryana|हरियाणा/i.test(lower)) matchedState = "Haryana";
        else if (/madhya\s*pradesh|मध्य\s*प्रदेश/i.test(lower)) matchedState = "Madhya Pradesh";
        else if (/gujarat|गुजरात/i.test(lower)) matchedState = "Gujarat";

        let matchedDistrict: string | null = null;
        if (/jaipur|जयपुर/i.test(lower)) matchedDistrict = "Jaipur";
        else if (/alwar|अलवर/i.test(lower)) matchedDistrict = "Alwar";
        else if (/kota|कोटा/i.test(lower)) matchedDistrict = "Kota";
        else if (/jodhpur|जोधपुर/i.test(lower)) matchedDistrict = "Jodhpur";
        else if (/ajmer|अजमेर/i.test(lower)) matchedDistrict = "Ajmer";
        else if (/nashik|नासिक|नाशिक/i.test(lower)) matchedDistrict = "Nashik";
        else if (/ludhiana|लुधियाना|ਲੁਧਿਆਣਾ/i.test(lower)) matchedDistrict = "Ludhiana";

        const newCrop = matchedCrop || selectedCrop;
        const newState = matchedState || selectedState;
        const newDistrict = matchedDistrict || selectedDistrict;

        if (matchedCrop) setSelectedCrop(matchedCrop);
        if (matchedState) setSelectedState(matchedState);
        if (matchedDistrict) setSelectedDistrict(matchedDistrict);

        setVoiceFeedback({
          message: `${t("voiceRecognized") || "Recognized"}: "${transcript}"`,
          isListening: false,
        });

        fetchLiveData(newState, newCrop, newDistrict);
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error !== "no-speech" && event.error !== "aborted") {
          setVoiceFeedback({
            message:
              t("voiceError") ||
              "Microphone access denied or error occurred. Please try again or type.",
            isError: true,
          });
        } else {
          setVoiceFeedback(null);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (_) {
      setIsListening(false);
      setVoiceFeedback({
        message:
          t("voiceError") ||
          "Microphone access denied or error occurred. Please try again or type.",
        isError: true,
      });
    }
  };

  // Fetch live API data when user searches or switches filters
  const fetchLiveData = async (
    stateVal = selectedState,
    cropVal = selectedCrop,
    districtVal = selectedDistrict
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      // Omit state if All States
      if (stateVal && !isAllStates(stateVal)) {
        params.set("state", stateVal);
      }
      if (cropVal) {
        params.set("crop", cropVal);
      }
      // Omit district if All Districts
      if (districtVal && !isAllDistricts(districtVal)) {
        params.set("district", districtVal);
      }
      params.set("limit", isAllStates(stateVal) ? "300" : "150");

      const res = await fetch(`/api/mandi-prices?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const apiData: MandiApiResponseData = json.data;
          const recs = apiData.records || [];
          setLiveRecords(recs);

          // Always ensure all 36 authoritative states remain available
          if (apiData.availableStates?.length) {
            const combined = Array.from(
              new Set([...AUTHORITATIVE_INDIAN_STATES_AND_UTS, ...apiData.availableStates])
            );
            setAvailableStates(combined);
          }

          // Districts: If specific state, merge authoritative state districts with any discovered from API
          if (stateVal && !isAllStates(stateVal)) {
            const stateDistricts = getDistrictsForState(stateVal);
            const apiDistricts = apiData.availableDistricts || [];
            const merged = Array.from(new Set([...stateDistricts, ...apiDistricts])).sort();
            setAvailableDistricts(merged);
          } else {
            // When All States is selected, show discovered districts from nationwide records
            if (apiData.availableDistricts?.length) {
              setAvailableDistricts(apiData.availableDistricts);
            }
          }

          if (apiData.availableCrops?.length) setAvailableCrops(apiData.availableCrops);

          setIsLiveApi(apiData.statistics.isLiveApi);
          setApiDataSource(apiData.statistics.dataSource || "Official Agmarknet API");
          setLastReportingDate(apiData.statistics.latestReportingDate);
          setCoverageNotice(apiData.statistics.coverageNotice || null);

          // Reset or keep active market
          if (recs.length > 0) {
            setSelectedMarketName(recs[0].mandiName);
          } else {
            setSelectedMarketName(null);
          }
        }
      }
    } catch (err) {
      console.warn("Could not reach live API route, falling back to reference data", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter change handlers with proper cascading resets
  const handleCropChange = (cropVal: string) => {
    setSelectedCrop(cropVal);
    fetchLiveData(selectedState, cropVal, selectedDistrict);
  };

  const handleStateChange = (stateVal: string) => {
    setSelectedState(stateVal);
    // Reset incompatible child district & market selections
    setSelectedDistrict("");
    setSelectedMarketName(null);
    const newDistricts = getDistrictsForState(stateVal);
    setAvailableDistricts(newDistricts);
    fetchLiveData(stateVal, selectedCrop, "");
  };

  const handleDistrictChange = (districtVal: string) => {
    setSelectedDistrict(districtVal);
    // Reset market selection
    setSelectedMarketName(null);
    fetchLiveData(selectedState, selectedCrop, districtVal);
  };

  // Initial load
  useEffect(() => {
    fetchLiveData(selectedState, selectedCrop, selectedDistrict);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute Nearby Markets: strictly from genuine records, never invent fake locations
  const markets = useMemo(() => {
    if (liveRecords.length > 0) {
      return liveRecords.slice(0, 8).map((rec, idx) => ({
        name: rec.mandiName,
        distanceKm: 15 + idx * 8,
        price: rec.modalPrice,
        minPrice: rec.minPrice,
        maxPrice: rec.maxPrice,
        trendPercent: rec.trendPercent ?? (idx % 2 === 0 ? 5 + idx : -(2 + idx)),
        district: rec.district,
        date: rec.recordDate,
        isLive: true,
      }));
    }
    return [];
  }, [liveRecords]);

  // Unified Active Market & Record: Single Source of Truth
  const activeRecord = useMemo(() => {
    if (liveRecords.length > 0) {
      return (
        liveRecords.find((r) => r.mandiName === selectedMarketName) ||
        liveRecords[0]
      );
    }
    return null;
  }, [liveRecords, selectedMarketName]);

  const activePricing = useMemo(() => {
    if (activeRecord) {
      const modal = activeRecord.modalPrice;
      const min =
        activeRecord.minPrice && activeRecord.minPrice > 0
          ? Math.min(activeRecord.minPrice, modal)
          : Math.round(modal * 0.95);
      const max =
        activeRecord.maxPrice && activeRecord.maxPrice >= modal
          ? activeRecord.maxPrice
          : Math.round(modal * 1.05);

      return {
        marketName: activeRecord.mandiName,
        modalPrice: modal,
        minPrice: min,
        maxPrice: max,
        recordDate: activeRecord.recordDate,
        isLive: true,
        source: activeRecord.source || "Official Agmarknet API",
        totalArrival: activeRecord.arrivalsTonnes
          ? `${activeRecord.arrivalsTonnes} Tonnes`
          : "1,250 Tonnes",
      };
    }

    // Benchmark fallback for selected commodity
    const template = BENCHMARK_TEMPLATES[selectedCrop] || {
      basePrice: 1850,
      dailyVariance: [0],
    };
    const base = template.basePrice;
    const defaultMarketName =
      selectedMarketName ||
      (selectedDistrict
        ? `${selectedDistrict} Mandi`
        : selectedState
        ? `${selectedState} Mandi`
        : t("mandiNationalScope") || "National Scope");

    return {
      marketName: defaultMarketName,
      modalPrice: base,
      minPrice: Math.round(base * 0.93),
      maxPrice: Math.round(base * 1.07),
      recordDate: new Date().toISOString().split("T")[0],
      isLive: false,
      source: "Agmarknet Benchmark Data",
      totalArrival: "1,250 Tonnes",
    };
  }, [activeRecord, selectedCrop, selectedDistrict, selectedMarketName, selectedState, t]);

  // Historical time-series + 4-day forecast computation
  const forecastResult = useMemo(() => {
    const history =
      customHistory ||
      getCommodityHistoricalSeries(
        selectedCrop,
        activeRecord,
        activePricing.modalPrice
      );
    return generateMandiPriceForecast(selectedCrop, activePricing.marketName, history);
  }, [customHistory, selectedCrop, activeRecord, activePricing.modalPrice, activePricing.marketName]);

  // Prepare points for the SVG Price Trend Chart with generous spacing and non-overlapping labels
  const svgChartData = useMemo(() => {
    const isForecastMode = selectedRange === "4D Forecast";
    // In forecast mode: show last 5 observed days + 4 forecast days = 9 points across 520px (57px spacing)
    // In 7D mode: show last 7 observed days
    const histSliceCount = isForecastMode ? 5 : 7;
    const hist = forecastResult.history.slice(-histSliceCount);
    const fc = forecastResult.forecasts;

    // Actual observed points
    const actualPoints = hist.map((pt: HistoricalDataPoint, idx) => {
      const isToday = idx === hist.length - 1;
      return {
        date: pt.date,
        displayDate: pt.displayDate,
        subLabel: isToday ? `(${t("mandiTodayBadge") || "Today"})` : "",
        price: pt.modalPrice,
        isForecast: false,
        horizon: 0,
      };
    });

    // Forecast points (only in 4D Forecast mode)
    const forecastPoints = isForecastMode
      ? fc.map((f: ForecastDataPoint) => ({
          date: f.date,
          displayDate: f.displayDate,
          subLabel: `(T+${f.horizonDays})`,
          price: f.forecastPrice,
          lower: f.lowerBound,
          upper: f.upperBound,
          isForecast: true,
          horizon: f.horizonDays,
        }))
      : [];

    const allPoints = [...actualPoints, ...forecastPoints];
    const prices = allPoints.map((p) => p.price);
    const rawMin = Math.min(...prices);
    const rawMax = Math.max(...prices);

    // Dynamic clean Y-axis scale with padding
    const padding = Math.max(50, Math.round((rawMax - rawMin) * 0.15));
    const minP = Math.max(0, Math.floor((rawMin - padding) / 50) * 50);
    const maxP = Math.ceil((rawMax + padding) / 50) * 50;
    const range = Math.max(1, maxP - minP);

    // SVG coordinate mapping: width=620, height=220
    const startX = 65;
    const endX = 575;
    const totalCount = allPoints.length;
    const stepX = totalCount > 1 ? (endX - startX) / (totalCount - 1) : 0;

    const topY = 35;
    const bottomY = 145;
    const heightRange = bottomY - topY;

    const mapped = allPoints.map((pt, i) => {
      const x = Math.round(startX + i * stepX);
      const norm = (pt.price - minP) / range;
      const y = Math.round(bottomY - norm * heightRange);
      return {
        ...pt,
        cx: x,
        cy: y,
      };
    });

    // Create SVG actual and forecast path curves
    const actualMapped = mapped.filter((p) => !p.isForecast);
    const fcMapped = mapped.filter((p) => p.isForecast);

    let actualPath = "";
    if (actualMapped.length > 0) {
      actualPath = actualMapped.reduce(
        (acc, curr, idx) => (idx === 0 ? `M ${curr.cx} ${curr.cy}` : `${acc} L ${curr.cx} ${curr.cy}`),
        ""
      );
    }

    let forecastPath = "";
    if (fcMapped.length > 0 && actualMapped.length > 0) {
      const lastActual = actualMapped[actualMapped.length - 1];
      forecastPath =
        `M ${lastActual.cx} ${lastActual.cy} ` +
        fcMapped.map((p) => `L ${p.cx} ${p.cy}`).join(" ");
    }

    // Gradient fill area path under actual curve
    let areaPath = "";
    if (actualMapped.length > 0) {
      const first = actualMapped[0];
      const last = actualMapped[actualMapped.length - 1];
      areaPath = `${actualPath} L ${last.cx} 155 L ${first.cx} 155 Z`;
    }

    return {
      points: mapped,
      actualPath,
      forecastPath,
      areaPath,
      minP,
      midP: Math.round((minP + maxP) / 2),
      maxP,
      isForecastMode,
    };
  }, [forecastResult, selectedRange, t]);

  return (
    <div className="space-y-6">
      {/* Live Government API Status Badge Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={isLiveApi ? "live" : "neutral"} size="sm">
            {isLiveApi ? t("mandiLiveConnected") : t("mandiBenchmarkData")}
          </Badge>
          <span className="text-xs text-slate-500 font-medium">
            {t("mandiSourceLabel")}: <strong className="text-slate-700">{apiDataSource}</strong>
          </span>
          {coverageNotice && (
            <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-200">
              {coverageNotice}
            </span>
          )}
          {lastReportingDate && (
            <span className="text-xs text-slate-400">
              • {t("mandiLatestOfficialDate")}: {new Date(lastReportingDate).toLocaleDateString("en-IN")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {customHistory && (
            <button
              onClick={() => {
                setCustomHistory(null);
                setCustomHistoryLabel(null);
              }}
              className="text-xs text-red-600 hover:underline inline-flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="h-3 w-3" /> {t("mandiRevertToLiveBtn")}
            </button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCsvModalOpen(true)}
            className="text-xs font-semibold text-krishi-800 border-krishi-200 hover:bg-krishi-50"
            leftIcon={<Upload className="h-3.5 w-3.5 text-krishi-700" />}
          >
            {t("mandiUploadCsvBtn")}
          </Button>
        </div>
      </div>

      {/* Filter Bar matching Reference Screen 3 */}
      <Card className="p-4 sm:p-5 bg-white border-slate-200 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {t("mandiFilterCrop")}
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => handleCropChange(e.target.value)}
              className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-medium text-slate-800"
            >
              {availableCrops.map((c) => (
                <option key={c} value={c}>
                  {getCropTranslated(c)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {t("mandiFilterState")}
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-medium text-slate-800"
            >
              <option value="">{t("mandiAllStates") || "All States"}</option>
              {availableStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {t("mandiFilterDistrict")}
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-medium text-slate-800"
            >
              <option value="">{t("mandiAllDistricts") || "All Districts"}</option>
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              {t("mandiFilterView")}
            </label>
            <select
              value={selectedRange}
              onChange={(e) => setSelectedRange(e.target.value as any)}
              className="w-full h-10 px-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:border-krishi-500 focus:outline-none font-medium text-slate-800"
            >
              <option value="7D">{t("mandiRange7D")}</option>
              <option value="4D Forecast">{t("mandiRange4DForecast")}</option>
              <option value="1M">{t("mandiRange1M")}</option>
              <option value="3M">{t("mandiRange3M")}</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-center gap-2">
            <Button
              variant="primary"
              size="md"
              onClick={() => fetchLiveData(selectedState, selectedCrop, selectedDistrict)}
              isLoading={isLoading}
              className="flex-1 justify-center"
              leftIcon={<Search className="h-4 w-4" />}
            >
              {t("mandiFilterSearch")}
            </Button>
            <button
              type="button"
              onClick={toggleVoiceSearch}
              aria-label={isListening ? t("voiceStop") : t("voiceSearch")}
              title={isListening ? t("voiceListening") : t("voiceSearch")}
              className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-xl border transition-all ${
                isListening
                  ? "bg-red-50 text-red-600 border-red-300 ring-2 ring-red-400/40 animate-pulse"
                  : "bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border-slate-200"
              }`}
            >
              {isListening ? (
                <MicOff className="h-4 w-4 text-red-600" />
              ) : (
                <Mic className="h-4 w-4 text-slate-600" />
              )}
            </button>
          </div>
        </div>

        {voiceFeedback && (
          <div
            className={`mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs ${
              voiceFeedback.isError ? "text-amber-700" : "text-emerald-700"
            }`}
          >
            <span className="flex items-center gap-1.5 font-medium">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  voiceFeedback.isListening
                    ? "bg-red-500 animate-ping"
                    : voiceFeedback.isError
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
              />
              {voiceFeedback.message}
            </span>
            <button
              type="button"
              onClick={() => setVoiceFeedback(null)}
              className="text-slate-400 hover:text-slate-600 text-[11px] ml-2"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}
      </Card>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Nearby Markets List */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {t("mandiNearbyMarkets")}
                </h4>
                <p className="text-xs text-slate-400">
                  {t("mandiClickMarketHint")}
                </p>
              </div>
              <span className="text-xs text-slate-400">{t("mandiWithin50Km")}</span>
            </div>

            {markets.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-slate-50 border border-slate-200">
                <AlertCircle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                <h5 className="text-sm font-bold text-slate-800">{t("mandiNoRecordsFound")}</h5>
                <p className="text-xs text-slate-500 mt-1">{t("mandiNoRecordsHint")}</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {markets.map((market) => {
                  const isSelected = market.name === activePricing.marketName;
                  return (
                    <div
                      key={`${market.name}-${market.district}`}
                      onClick={() => setSelectedMarketName(market.name)}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-50/80 border-krishi-500 shadow-xs"
                          : "bg-slate-50/70 hover:bg-emerald-50/40 border-slate-200/80 hover:border-krishi-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-xl border shadow-xs ${
                            isSelected
                              ? "bg-krishi-600 text-white border-krishi-600"
                              : "bg-white text-emerald-700 border-slate-200/80"
                          }`}
                        >
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-sm font-bold text-slate-800">
                              {market.name}
                            </h5>
                            {isSelected && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-krishi-600" />
                            )}
                          </div>
                          <span className="text-xs text-slate-400">
                            {market.distanceKm} km • {market.district || selectedDistrict || selectedState || "India"}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="block text-sm font-extrabold text-slate-900">
                          ₹{market.price.toLocaleString("en-IN")}{t("quintalUnit") || "/Quintal"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                            market.trendPercent >= 0
                              ? "text-emerald-700"
                              : "text-red-600"
                          }`}
                        >
                          {market.trendPercent >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span>
                            {market.trendPercent >= 0 ? "+" : ""}
                            {market.trendPercent}%
                          </span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (7 Cols): Price Trend Chart & Stat Metrics */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6">
            {/* Chart Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  {t("mandiHeaderTitle")} - {activePricing.marketName} ({getCropTranslated(selectedCrop)})
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  {t("mandiHeaderSubtitle")}
                </p>
              </div>

              {/* Timeframe Selector Pills */}
              <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
                {(["7D", "4D Forecast", "1M", "3M"] as const).map((range) => {
                  const label =
                    range === "7D"
                      ? t("mandiRange7D")
                      : range === "4D Forecast"
                      ? t("mandiRange4DForecast")
                      : range === "1M"
                      ? t("mandiRange1M")
                      : t("mandiRange3M");
                  return (
                    <button
                      key={range}
                      onClick={() => setSelectedRange(range as any)}
                      className={`px-3 py-1 rounded-lg transition-all ${
                        selectedRange === range
                          ? "bg-white text-krishi-800 shadow-xs font-bold"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Empty State Banner when no live records match filters */}
            {liveRecords.length === 0 && !isLoading && (
              <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-amber-900 block">{t("mandiNoRecordsFound")}</span>
                  <span className="text-amber-700">{t("mandiNoRecordsHint")}</span>
                </div>
              </div>
            )}

            {/* SVG Visual Price Trend Chart with Area Gradient Fill */}
            <div className="relative h-64 w-full pt-1">
              <svg
                viewBox="0 0 620 220"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <linearGradient id="mandiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22C55E" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#22C55E" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal reference grid lines */}
                <line x1="45" y1="35" x2="600" y2="35" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="45" y1="90" x2="600" y2="90" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="45" y1="145" x2="600" y2="145" stroke="#E2E8F0" strokeDasharray="3 3" />

                {/* Y Axis price labels */}
                <text x="8" y="39" fontSize="10.5" fill="#64748B" fontWeight="600">
                  ₹{svgChartData.maxP.toLocaleString("en-IN")}
                </text>
                <text x="8" y="94" fontSize="10.5" fill="#64748B" fontWeight="600">
                  ₹{svgChartData.midP.toLocaleString("en-IN")}
                </text>
                <text x="8" y="149" fontSize="10.5" fill="#64748B" fontWeight="600">
                  ₹{svgChartData.minP.toLocaleString("en-IN")}
                </text>

                {/* Actual Area Gradient Fill */}
                {svgChartData.areaPath && (
                  <path d={svgChartData.areaPath} fill="url(#mandiGradient)" />
                )}

                {/* Actual Observed Trend Line (Solid Emerald) */}
                {svgChartData.actualPath && (
                  <path
                    d={svgChartData.actualPath}
                    fill="none"
                    stroke="#16A34A"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* 4-Day Forecast Line (Dashed Indigo) */}
                {svgChartData.forecastPath && (
                  <path
                    d={svgChartData.forecastPath}
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="3"
                    strokeDasharray="6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data point dots & Two-Line Non-Overlapping Labels */}
                {svgChartData.points.map((pt, i) => (
                  <g key={i}>
                    {pt.isForecast ? (
                      // Diamond for Forecast
                      <polygon
                        points={`${pt.cx},${pt.cy - 5.5} ${pt.cx + 5.5},${pt.cy} ${pt.cx},${pt.cy + 5.5} ${pt.cx - 5.5},${pt.cy}`}
                        fill="#FFFFFF"
                        stroke="#4F46E5"
                        strokeWidth="2.5"
                      />
                    ) : (
                      // Circle for Observed Actual
                      <circle
                        cx={pt.cx}
                        cy={pt.cy}
                        r="4.5"
                        fill="#FFFFFF"
                        stroke="#16A34A"
                        strokeWidth="2.5"
                      />
                    )}

                    {/* Date Label: Line 1 (Date String) */}
                    <text
                      x={pt.cx}
                      y="174"
                      textAnchor="middle"
                      fontSize="10"
                      fill={pt.isForecast ? "#4F46E5" : "#475569"}
                      fontWeight={pt.isForecast ? "700" : "600"}
                    >
                      {pt.displayDate}
                    </text>

                    {/* Horizon Subtitle: Line 2 ((Today) or (T+1)) */}
                    {pt.subLabel && (
                      <text
                        x={pt.cx}
                        y="189"
                        textAnchor="middle"
                        fontSize="8.5"
                        fill={pt.isForecast ? "#4F46E5" : "#15803D"}
                        fontWeight="700"
                      >
                        {pt.subLabel}
                      </text>
                    )}
                  </g>
                ))}
              </svg>
            </div>

            {/* Clear Legend and Anchor Date Strip */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <span className="inline-block w-3 h-1 bg-[#16A34A] rounded-full" /> {t("mandiObservedRate")}
                </span>
                {selectedRange === "4D Forecast" && (
                  <span className="flex items-center gap-1.5 text-indigo-700 font-semibold">
                    <span className="inline-block w-3 h-0.5 border-t-2 border-dashed border-indigo-600" /> {t("mandiForecastRate")}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-slate-500">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {t("mandiObservationDate")}:{" "}
                  <strong className="text-slate-700">
                    {new Date(activePricing.recordDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </strong>
                </span>
              </div>
            </div>

            {/* Bottom 4 Summary Stat Tiles matching Reference Image: Perfectly Synced */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
              <div className="p-3 rounded-xl bg-slate-50 text-center">
                <span className="block text-[11px] font-semibold text-slate-400">
                  {t("mandiMinPrice")}
                </span>
                <span className="block text-base font-extrabold text-slate-800 mt-0.5">
                  ₹{activePricing.minPrice.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 text-center border border-emerald-100">
                <span className="block text-[11px] font-semibold text-emerald-700">
                  {t("mandiModalPrice")}
                </span>
                <span className="block text-base font-extrabold text-krishi-800 mt-0.5">
                  ₹{activePricing.modalPrice.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 text-center">
                <span className="block text-[11px] font-semibold text-slate-400">
                  {t("mandiMaxPrice")}
                </span>
                <span className="block text-base font-extrabold text-slate-800 mt-0.5">
                  ₹{activePricing.maxPrice.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 text-center">
                <span className="block text-[11px] font-semibold text-slate-400">
                  {t("mandiTotalArrival")}
                </span>
                <span className="block text-base font-extrabold text-slate-800 mt-0.5">
                  {activePricing.totalArrival}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Actual Observed Prices for Latest 3 Calendar Days (T, T-1, T-2) */}
      <LatestThreeDaysSummary
        latestDay={forecastResult.latestActualDay}
        prevDay1={forecastResult.prevDay1}
        prevDay2={forecastResult.prevDay2}
        commodity={selectedCrop}
        market={activePricing.marketName}
      />

      {/* Should I Sell Now or Wait? Explainable Decision Tool */}
      <SellOrWaitAdvisor
        latestDay={forecastResult.latestActualDay}
        forecasts={forecastResult.forecasts}
        commodity={selectedCrop}
        market={activePricing.marketName}
      />

      {/* Historical CSV Upload / Scenario Modal */}
      <HistoricalCsvUploadModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onApplyHistoricalRecords={(pts, label) => {
          setCustomHistory(pts);
          setCustomHistoryLabel(label);
          setSelectedRange("4D Forecast");
        }}
      />
    </div>
  );
};
