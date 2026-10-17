"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Calendar,
  Layers,
  Droplets,
  Ruler,
  FlaskConical,
  Sparkles,
  Search,
  Check,
  AlertCircle,
  HelpCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useLanguage } from "@/context/LanguageContext";
import {
  CropPlanInput,
  IrrigationMethod,
  LandAreaUnit,
  LocationCoordinates,
  SoilNutrientLevel,
  SoilType,
  WaterAvailability,
} from "../types";
import { INDIAN_CROPS_DATABASE } from "../data/crops";
import { INDIAN_SOIL_TYPES } from "../data/soils";
import { POPULAR_INDIAN_FARMING_REGIONS } from "../services/weather-service";

export interface CropPlannerFormProps {
  initialInput?: CropPlanInput;
  onSubmit: (input: CropPlanInput) => void;
  isLoading: boolean;
  onOpenSavedPlans?: () => void;
  savedPlansCount?: number;
}

export const CropPlannerForm: React.FC<CropPlannerFormProps> = ({
  initialInput,
  onSubmit,
  isLoading,
  onOpenSavedPlans,
  savedPlansCount = 0,
}) => {
  const { t } = useLanguage();

  // Location search state
  const [locationSearch, setLocationSearch] = useState(
    initialInput?.location.name || "Jaipur, Rajasthan"
  );
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates>(
    initialInput?.location || POPULAR_INDIAN_FARMING_REGIONS[0]
  );
  const [searchResults, setSearchResults] = useState<LocationCoordinates[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Crop & agronomic state
  const [selectedCropId, setSelectedCropId] = useState<string>(
    initialInput?.cropId || "wheat"
  );
  const [sowingDate, setSowingDate] = useState<string>(
    initialInput?.sowingDate || new Date().toISOString().split("T")[0]
  );
  const [soilType, setSoilType] = useState<SoilType>(
    initialInput?.soilType || "alluvial"
  );

  // Soil test optional fields
  const [hasSoilTest, setHasSoilTest] = useState<boolean>(
    initialInput?.soilTest.hasLabReport || false
  );
  const [soilPh, setSoilPh] = useState<string>(
    initialInput?.soilTest.ph ? String(initialInput.soilTest.ph) : ""
  );
  const [nitrogen, setNitrogen] = useState<SoilNutrientLevel>(
    initialInput?.soilTest.nitrogen || "medium"
  );
  const [phosphorus, setPhosphorus] = useState<SoilNutrientLevel>(
    initialInput?.soilTest.phosphorus || "medium"
  );
  const [potassium, setPotassium] = useState<SoilNutrientLevel>(
    initialInput?.soilTest.potassium || "medium"
  );

  // Land area & irrigation
  const [landArea, setLandArea] = useState<string>(
    initialInput?.landArea ? String(initialInput.landArea) : "2.5"
  );
  const [areaUnit, setAreaUnit] = useState<LandAreaUnit>(
    initialInput?.areaUnit || "acre"
  );
  const [irrigationMethod, setIrrigationMethod] = useState<IrrigationMethod>(
    initialInput?.irrigationMethod || "drip"
  );
  const [waterAvailability, setWaterAvailability] = useState<WaterAvailability>(
    initialInput?.waterAvailability || "abundant"
  );

  // Error validation
  const [formError, setFormError] = useState<string | null>(null);

  // Debounced geocoding location search
  useEffect(() => {
    if (!locationSearch || locationSearch.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingLocation(true);
      try {
        const res = await fetch(
          `/api/crop-planner/weather?search=${encodeURIComponent(locationSearch)}`
        );
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data?.locations) {
            setSearchResults(json.data.locations);
            setShowLocationDropdown(true);
          }
        }
      } catch (e) {
        console.warn("Geocoding fetch error:", e);
      } finally {
        setIsSearchingLocation(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [locationSearch]);

  const handleSelectLocation = (loc: LocationCoordinates) => {
    setSelectedLocation(loc);
    setLocationSearch(loc.name);
    setShowLocationDropdown(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedArea = parseFloat(landArea);
    if (isNaN(parsedArea) || parsedArea <= 0) {
      setFormError("Please enter a valid positive land area.");
      return;
    }

    let parsedPh: number | undefined = undefined;
    if (soilPh.trim() !== "") {
      const phVal = parseFloat(soilPh);
      if (isNaN(phVal) || phVal < 3 || phVal > 11) {
        setFormError("Soil pH must be between 3.0 and 11.0, or left blank.");
        return;
      }
      parsedPh = phVal;
    }

    const payload: CropPlanInput = {
      location: selectedLocation,
      cropId: selectedCropId,
      sowingDate,
      soilType,
      soilTest: {
        hasLabReport: hasSoilTest,
        ph: parsedPh,
        nitrogen: hasSoilTest ? nitrogen : undefined,
        phosphorus: hasSoilTest ? phosphorus : undefined,
        potassium: hasSoilTest ? potassium : undefined,
      },
      landArea: parsedArea,
      areaUnit,
      irrigationMethod,
      waterAvailability,
    };

    onSubmit(payload);
  };

  const selectedCrop =
    INDIAN_CROPS_DATABASE.find((c) => c.id === selectedCropId) ||
    INDIAN_CROPS_DATABASE[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {t("cpTitle")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t("cpSubtitle")}
          </p>
        </div>

        {onOpenSavedPlans && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenSavedPlans}
            className="self-start sm:self-auto rounded-xl text-xs font-semibold"
          >
            {t("cpSavedPlansBtn")} {savedPlansCount > 0 ? `(${savedPlansCount})` : ""}
          </Button>
        )}
      </div>

      {formError && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs font-medium text-red-800">
          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      {/* Grid: Step 1 (Location & Crop) and Step 2 (Soil & Land Area) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Location & Crop Choice */}
        <div className="space-y-6">
          {/* Section 1: Farmer Location */}
          <Card className="p-5 space-y-4 border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <div className="h-7 w-7 rounded-lg bg-krishi-100 text-krishi-700 flex items-center justify-center">
                <MapPin className="h-4 w-4" />
              </div>
              <span>1. {t("cpLocationLabel")}</span>
            </div>

            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={locationSearch}
                  onChange={(e) => setLocationSearch(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowLocationDropdown(true);
                  }}
                  placeholder={t("cpLocationPlaceholder")}
                  className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-500/20 focus:border-krishi-600 transition-all placeholder:text-slate-400"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                {isSearchingLocation && (
                  <Loader2 className="absolute right-3 top-3 h-4 w-4 text-slate-400 animate-spin" />
                )}
              </div>

              {/* Autocomplete dropdown */}
              {showLocationDropdown && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-30 max-h-56 overflow-y-auto py-1">
                  {searchResults.map((loc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full px-3.5 py-2 text-left text-xs hover:bg-slate-50 flex items-center justify-between transition-colors border-b border-slate-100 last:border-0"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{loc.name}</span>
                        <span className="text-[11px] text-slate-400">
                          Lat: {loc.latitude.toFixed(2)}, Lon: {loc.longitude.toFixed(2)}
                        </span>
                      </div>
                      {selectedLocation.name === loc.name && (
                        <Check className="h-4 w-4 text-krishi-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Location Pill & Quick Hubs */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-500">Selected Coordinates:</span>
                <Badge variant="green" size="sm">
                  {selectedLocation.latitude.toFixed(3)}°N, {selectedLocation.longitude.toFixed(3)}°E
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Select:</span>
                {POPULAR_INDIAN_FARMING_REGIONS.slice(0, 5).map((hub) => (
                  <button
                    key={hub.name}
                    type="button"
                    onClick={() => handleSelectLocation(hub)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                      selectedLocation.name.includes(hub.name)
                        ? "bg-krishi-100 text-krishi-800 border-krishi-300"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {hub.name} ({hub.district})
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Section 2: Crop Selection */}
          <Card className="p-5 space-y-4 border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <div className="h-7 w-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Layers className="h-4 w-4" />
                </div>
                <span>2. {t("cpCropLabel")}</span>
              </div>
              <Badge variant="amber" size="sm" className="text-[10px] uppercase font-bold">
                {selectedCrop.season} Crop
              </Badge>
            </div>

            {/* Crop Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {INDIAN_CROPS_DATABASE.map((crop) => {
                const isSelected = crop.id === selectedCropId;
                return (
                  <button
                    key={crop.id}
                    type="button"
                    onClick={() => setSelectedCropId(crop.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-krishi-50 border-krishi-600 ring-2 ring-krishi-600/20 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                    }`}
                  >
                    <div className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                      {crop.name}
                    </div>
                    <div className="text-[11px] text-slate-500 italic mt-0.5 truncate">
                      {crop.scientificName}
                    </div>
                    <div className="text-[10px] font-medium text-krishi-700 mt-1.5 flex items-center gap-1">
                      <span>⏱ {crop.totalDurationDays.standard} days</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Sowing Date Picker */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                {t("cpSowingDateLabel")}
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="date"
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-500/20 focus:border-krishi-600 transition-all font-medium text-slate-800"
                  />
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSowingDate(new Date().toISOString().split("T")[0])}
                  className="rounded-xl text-xs whitespace-nowrap"
                >
                  Today
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Soil, Nutrients, Land Area, Irrigation */}
        <div className="space-y-6">
          {/* Section 3: Soil Characteristics */}
          <Card className="p-5 space-y-4 border-slate-200 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <div className="h-7 w-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <FlaskConical className="h-4 w-4" />
                </div>
                <span>3. {t("cpSoilTypeLabel")} &amp; Fertility</span>
              </div>
            </div>

            {/* Soil Type Select */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {t("cpSoilTypeLabel")}
              </label>
              <div className="relative">
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value as SoilType)}
                  className="w-full appearance-none pl-3.5 pr-9 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-500/20 focus:border-krishi-600 font-medium text-slate-800"
                >
                  {Object.values(INDIAN_SOIL_TYPES).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.textureGroup})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-[11px] text-slate-500 italic">
                {INDIAN_SOIL_TYPES[soilType].description}
              </p>
            </div>

            {/* Optional pH */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">
                  {t("cpSoilPhLabel")}
                </label>
                <span className="text-[10px] text-krishi-700 font-semibold bg-krishi-50 px-2 py-0.5 rounded-full">
                  Optional
                </span>
              </div>
              <input
                type="number"
                step="0.1"
                min="3.5"
                max="10.5"
                value={soilPh}
                onChange={(e) => setSoilPh(e.target.value)}
                placeholder="e.g. 6.8 (Leave blank if not tested)"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-500/20 focus:border-krishi-600 placeholder:text-slate-400 font-medium text-slate-800"
              />
              <p className="text-[11px] text-slate-400">{t("cpSoilPhHint")}</p>
            </div>

            {/* Optional Soil Test Health Card Accordion */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hasSoilTest}
                  onChange={(e) => setHasSoilTest(e.target.checked)}
                  className="rounded text-krishi-600 focus:ring-krishi-500 h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-700">
                  {t("cpSoilTestToggle")}
                </span>
              </label>

              {hasSoilTest && (
                <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in-50 duration-150">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                    Select Laboratory Rating:
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {/* N */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-700">
                        {t("cpNitrogenLabel")}
                      </span>
                      <select
                        value={nitrogen}
                        onChange={(e) => setNitrogen(e.target.value as SoilNutrientLevel)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5"
                      >
                        <option value="low">Low (&lt;280 kg/ha)</option>
                        <option value="medium">Medium (280-560)</option>
                        <option value="high">High (&gt;560 kg/ha)</option>
                      </select>
                    </div>

                    {/* P */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-700">
                        {t("cpPhosphorusLabel")}
                      </span>
                      <select
                        value={phosphorus}
                        onChange={(e) => setPhosphorus(e.target.value as SoilNutrientLevel)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5"
                      >
                        <option value="low">Low (&lt;10 kg/ha)</option>
                        <option value="medium">Medium (10-25)</option>
                        <option value="high">High (&gt;25 kg/ha)</option>
                      </select>
                    </div>

                    {/* K */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-slate-700">
                        {t("cpPotassiumLabel")}
                      </span>
                      <select
                        value={potassium}
                        onChange={(e) => setPotassium(e.target.value as SoilNutrientLevel)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-1.5"
                      >
                        <option value="low">Low (&lt;110 kg/ha)</option>
                        <option value="medium">Medium (110-280)</option>
                        <option value="high">High (&gt;280 kg/ha)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Section 4: Land Area & Irrigation Method */}
          <Card className="p-5 space-y-4 border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <div className="h-7 w-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
                <Droplets className="h-4 w-4" />
              </div>
              <span>4. Land Area &amp; Irrigation Method</span>
            </div>

            {/* Land Area and Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {t("cpLandAreaLabel")}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={landArea}
                    onChange={(e) => setLandArea(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-500/20 focus:border-krishi-600 font-semibold text-slate-800"
                  />
                  <Ruler className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {t("cpAreaUnitLabel")}
                </label>
                <select
                  value={areaUnit}
                  onChange={(e) => setAreaUnit(e.target.value as LandAreaUnit)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-500/20 focus:border-krishi-600 font-medium text-slate-800"
                >
                  <option value="acre">Acres (एकड़)</option>
                  <option value="bigha">Bigha (बीघा)</option>
                  <option value="hectare">Hectares (हेक्टेयर)</option>
                  <option value="guntha">Guntha (गुंठा)</option>
                </select>
              </div>
            </div>

            {/* Irrigation Method & Water Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {t("cpIrrigationMethodLabel")}
                </label>
                <select
                  value={irrigationMethod}
                  onChange={(e) => setIrrigationMethod(e.target.value as IrrigationMethod)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-500/20 focus:border-krishi-600 font-medium text-slate-800"
                >
                  <option value="drip">Drip Irrigation (90% eff)</option>
                  <option value="sprinkler">Sprinkler System (75% eff)</option>
                  <option value="flood_furrow">Furrow / Basin (50% eff)</option>
                  <option value="rainfed">Rainfed / Dryland (Natural)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  {t("cpWaterAvailabilityLabel")}
                </label>
                <select
                  value={waterAvailability}
                  onChange={(e) => setWaterAvailability(e.target.value as WaterAvailability)}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-krishi-500/20 focus:border-krishi-600 font-medium text-slate-800"
                >
                  <option value="abundant">Abundant (Canal / Tubewell)</option>
                  <option value="moderate">Moderate / Seasonal Supply</option>
                  <option value="scant">Scant / Water-Stressed</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Submit Action Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-krishi-50 border border-krishi-200/80 rounded-2xl">
        <div className="flex items-center gap-2.5 text-xs text-krishi-900 font-medium">
          <Sparkles className="h-4 w-4 text-krishi-700 shrink-0" />
          <span>
            {t("cpAssumptionNotice")}
          </span>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isLoading}
          className="w-full sm:w-auto rounded-xl text-sm font-bold shadow-md shadow-krishi-700/20 px-8"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating Plan...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>{t("cpSubmitBtn")}</span>
              <Sparkles className="h-4 w-4" />
            </div>
          )}
        </Button>
      </div>
    </form>
  );
};
