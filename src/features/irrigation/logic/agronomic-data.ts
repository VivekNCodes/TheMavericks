import {
  DemonstrationPreset,
  IrrigationMethodType,
  LandAreaUnit,
} from "../types";

export interface CropStageDetail {
  kc: number;
  rootDepthMeters: number;
  isCriticalStage: boolean;
  yieldSensitivityKy: number; // FAO-33 yield response factor Ky
  stageDescription: string;
}

export interface CropAgronomicProfile {
  id: string;
  name: string;
  stages: Record<string, CropStageDetail>;
  defaultStage: string;
}

export interface SoilHydrologyProfile {
  id: string;
  name: string;
  awcMmPerMeter: number; // Available Water Capacity (mm of water per meter soil depth)
  typicalMadFraction: number; // Management Allowed Depletion fraction (0.4 - 0.5)
  infiltrationRateMmPerHour: number;
  textureDescription: string;
}

export const CROP_AGRONOMIC_PROFILES: Record<string, CropAgronomicProfile> = {
  Tomato: {
    id: "Tomato",
    name: "Tomato (टमाटर)",
    stages: {
      Flowering: {
        kc: 1.15,
        rootDepthMeters: 0.6,
        isCriticalStage: true,
        yieldSensitivityKy: 1.1, // Highly sensitive: water stress causes blossom drop
        stageDescription: "Flower cluster formation and anthesis. Water stress causes heavy flower drop and poor fruit set.",
      },
      Vegetative: {
        kc: 0.7,
        rootDepthMeters: 0.35,
        isCriticalStage: false,
        yieldSensitivityKy: 0.4,
        stageDescription: "Active canopy expansion and branch initiation. Moderate water requirement.",
      },
      "Fruit Formation": {
        kc: 1.15,
        rootDepthMeters: 0.7,
        isCriticalStage: true,
        yieldSensitivityKy: 1.05,
        stageDescription: "Fruit cell division and expansion. Water deficit reduces fruit sizing and causes blossom end rot.",
      },
      "Grain Filling": {
        // Fallback mapping for stage selector consistency
        kc: 0.9,
        rootDepthMeters: 0.65,
        isCriticalStage: false,
        yieldSensitivityKy: 0.5,
        stageDescription: "Fruit ripening phase. Controlled dry-down enhances sugar content.",
      },
    },
    defaultStage: "Flowering",
  },
  Wheat: {
    id: "Wheat",
    name: "Wheat (गेहूं)",
    stages: {
      Flowering: {
        kc: 1.15,
        rootDepthMeters: 0.8,
        isCriticalStage: true,
        yieldSensitivityKy: 1.15,
        stageDescription: "Heading and anthesis. Moisture stress directly causes floret sterility.",
      },
      Vegetative: {
        kc: 0.8,
        rootDepthMeters: 0.45,
        isCriticalStage: true, // Crown root initiation is critical
        yieldSensitivityKy: 0.85,
        stageDescription: "Tillering and jointing. Crown root initiation requires adequate topsoil moisture.",
      },
      "Fruit Formation": {
        kc: 1.05,
        rootDepthMeters: 0.9,
        isCriticalStage: true,
        yieldSensitivityKy: 1.0,
        stageDescription: "Milking and grain development. Moisture stress decreases test weight (1000-grain weight).",
      },
      "Grain Filling": {
        kc: 0.95,
        rootDepthMeters: 0.9,
        isCriticalStage: true,
        yieldSensitivityKy: 0.95,
        stageDescription: "Dough stage. Grain starch accumulation. Avoid excessive waterlogging.",
      },
    },
    defaultStage: "Flowering",
  },
  Chili: {
    id: "Chili",
    name: "Chili (मिर्च)",
    stages: {
      Flowering: {
        kc: 1.05,
        rootDepthMeters: 0.5,
        isCriticalStage: true,
        yieldSensitivityKy: 1.05,
        stageDescription: "Abundant flower bud opening. Highly sensitive to soil water tension.",
      },
      Vegetative: {
        kc: 0.65,
        rootDepthMeters: 0.3,
        isCriticalStage: false,
        yieldSensitivityKy: 0.45,
        stageDescription: "Early vegetative growth and lateral branch establishment.",
      },
      "Fruit Formation": {
        kc: 1.1,
        rootDepthMeters: 0.6,
        isCriticalStage: true,
        yieldSensitivityKy: 0.9,
        stageDescription: "Pod elongation and fruit filling. Regular moisture prevents pod cracking.",
      },
      "Grain Filling": {
        kc: 0.8,
        rootDepthMeters: 0.55,
        isCriticalStage: false,
        yieldSensitivityKy: 0.4,
        stageDescription: "Ripening and drying phase before picking.",
      },
    },
    defaultStage: "Flowering",
  },
  Potato: {
    id: "Potato",
    name: "Potato (आलू)",
    stages: {
      Flowering: {
        kc: 1.15,
        rootDepthMeters: 0.5,
        isCriticalStage: true,
        yieldSensitivityKy: 1.1,
        stageDescription: "Tuber bulking and flowering. Soil moisture must remain above 65% available capacity.",
      },
      Vegetative: {
        kc: 0.65,
        rootDepthMeters: 0.3,
        isCriticalStage: false,
        yieldSensitivityKy: 0.5,
        stageDescription: "Emergence and stolon initiation. Moderate moisture required.",
      },
      "Fruit Formation": {
        kc: 1.1,
        rootDepthMeters: 0.55,
        isCriticalStage: true,
        yieldSensitivityKy: 1.05,
        stageDescription: "Rapid tuber sizing. Moisture fluctuations cause misshapen tubers and hollow heart.",
      },
      "Grain Filling": {
        kc: 0.75,
        rootDepthMeters: 0.5,
        isCriticalStage: false,
        yieldSensitivityKy: 0.35,
        stageDescription: "Skin hardening and haulm senescing prior to harvest.",
      },
    },
    defaultStage: "Fruit Formation",
  },
};

export const SOIL_HYDROLOGY_PROFILES: Record<string, SoilHydrologyProfile> = {
  Loamy: {
    id: "Loamy",
    name: "Loamy Soil (दोमट मिट्टी)",
    awcMmPerMeter: 150, // 150 mm water / 1 meter depth
    typicalMadFraction: 0.45, // 45% depletion allowed before stress
    infiltrationRateMmPerHour: 15,
    textureDescription: "Balanced silt, sand, and clay with optimal aeration and water storage.",
  },
  Sandy: {
    id: "Sandy",
    name: "Sandy Soil (बलुई मिट्टी)",
    awcMmPerMeter: 70,
    typicalMadFraction: 0.5,
    infiltrationRateMmPerHour: 45,
    textureDescription: "High infiltration rate but low water-holding capacity. Prone to deep leaching.",
  },
  Clay: {
    id: "Clay",
    name: "Clayey Soil (चिकनी मिट्टी)",
    awcMmPerMeter: 180,
    typicalMadFraction: 0.4,
    infiltrationRateMmPerHour: 8,
    textureDescription: "High moisture retention with slow drainage. Susceptible to waterlogging if over-irrigated.",
  },
  "Black Soil": {
    id: "Black Soil",
    name: "Black Cotton Soil (काली मिट्टी)",
    awcMmPerMeter: 200,
    typicalMadFraction: 0.4,
    infiltrationRateMmPerHour: 5,
    textureDescription: "Deep montmorillonite clay with exceptional moisture storage, slow infiltration, and swelling.",
  },
};

export const IRRIGATION_METHOD_EFFICIENCIES: Record<
  IrrigationMethodType,
  { name: string; efficiency: number; description: string }
> = {
  drip: {
    name: "Drip Irrigation (टपक सिंचाई)",
    efficiency: 0.9,
    description: "High-precision root-zone emitter system with 90% application efficiency.",
  },
  sprinkler: {
    name: "Sprinkler Irrigation (फव्वारा सिंचाई)",
    efficiency: 0.75,
    description: "Overhead spray system with 75% efficiency. Affected by midday wind and evaporation.",
  },
  flood: {
    name: "Surface / Furrow / Flood (खुली नाली / क्यारी)",
    efficiency: 0.6,
    description: "Conventional surface furrow/basin flooding with 60% efficiency due to conveyance and deep percolation losses.",
  },
};

/**
 * Standard demonstration presets for one-click testing.
 * Explicitly labeled as simulation scenarios for demonstration.
 */
export const DEMONSTRATION_PRESETS: DemonstrationPreset[] = [
  {
    id: "jaipur-tomato-40k",
    label: "Jaipur Tomato (1 Acre, 40k L Budget)",
    description: "Flowering Tomato in Jaipur with a 40,000 L available water budget using drip irrigation.",
    isUserSpecifiedScenario: true,
    input: {
      crop: "Tomato",
      growthStage: "Flowering",
      soilType: "Loamy",
      lastIrrigatedDate: "2026-10-14",
      fieldLocation: "Jaipur, Rajasthan",
      fieldArea: 1.0,
      areaUnit: "acre",
      irrigationMethod: "drip",
      availableWaterBudgetLiters: 40000,
      flowRateLitersPerHour: 15000,
    },
  },
  {
    id: "jaipur-wheat-flood-90k",
    label: "Jaipur Wheat (2 Acres, 90k L Budget)",
    description: "Wheat at Vegetative/CRI stage in Black Soil under surface flood irrigation with 90,000 L water.",
    isUserSpecifiedScenario: false,
    input: {
      crop: "Wheat",
      growthStage: "Vegetative",
      soilType: "Black Soil",
      lastIrrigatedDate: "2026-10-12",
      fieldLocation: "Jaipur, Rajasthan",
      fieldArea: 2.0,
      areaUnit: "acre",
      irrigationMethod: "flood",
      availableWaterBudgetLiters: 90000,
      flowRateLitersPerHour: 20000,
    },
  },
  {
    id: "sanganer-chili-sprinkler-25k",
    label: "Sanganer Chili (0.5 Acre, 25k L Budget)",
    description: "Flowering Chili in Sandy Soil under sprinkler irrigation with 25,000 L water.",
    isUserSpecifiedScenario: false,
    input: {
      crop: "Chili",
      growthStage: "Flowering",
      soilType: "Sandy",
      lastIrrigatedDate: "2026-10-15",
      fieldLocation: "Sanganer, Rajasthan",
      fieldArea: 0.5,
      areaUnit: "acre",
      irrigationMethod: "sprinkler",
      availableWaterBudgetLiters: 25000,
      flowRateLitersPerHour: 12000,
    },
  },
];
