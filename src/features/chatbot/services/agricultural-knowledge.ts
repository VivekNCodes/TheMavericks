import { INDIAN_CROPS_DATABASE } from "@/features/crop-planner/data/crops";
import { INDIAN_SOIL_TYPES } from "@/features/crop-planner/data/soils";
import { fetchWeatherOutlook, searchLocations } from "@/features/crop-planner/services/weather-service";
import { CropAgronomy, SoilCharacteristics, WeatherOutlook } from "@/features/crop-planner/types";

export interface GroundingContextResult {
  groundedText: string;
  citations: string[];
  matchedCrop?: CropAgronomy;
  matchedSoil?: SoilCharacteristics;
  weatherOutlook?: WeatherOutlook;
}

// Multilingual crop keyword mapping
const CROP_KEYWORD_MAP: Record<string, string> = {
  wheat: "wheat",
  गेहूं: "wheat",
  गेहू: "wheat",
  गहू: "wheat",
  ਕਣਕ: "wheat",
  gehu: "wheat",

  paddy: "paddy",
  rice: "paddy",
  धान: "paddy",
  चावल: "paddy",
  भात: "paddy",
  ਝੋਨਾ: "paddy",
  chawal: "paddy",

  tomato: "tomato",
  टमाटर: "tomato",
  टोमॅटो: "tomato",
  ਟਮਾਟਰ: "tomato",
  tamatar: "tomato",

  potato: "potato",
  आलू: "potato",
  बटाटा: "potato",
  ਆਲੂ: "potato",
  aaloo: "potato",
  alu: "potato",

  mustard: "mustard",
  सरसों: "mustard",
  राई: "mustard",
  मोहरी: "mustard",
  ਸਰ੍ਹੋਂ: "mustard",
  sarson: "mustard",

  cotton: "cotton",
  कपास: "cotton",
  कापूस: "cotton",
  ਨਰਮਾ: "cotton",
  kapas: "cotton",
  narma: "cotton",

  chickpea: "chickpea",
  chana: "chickpea",
  चना: "chickpea",
  हरभरा: "chickpea",
  ਛੋਲੇ: "chickpea",
  gram: "chickpea",

  maize: "maize",
  corn: "maize",
  मक्का: "maize",
  मका: "maize",
  ਮੱਕੀ: "maize",
  makka: "maize",

  soybean: "soybean",
  सोयाबीन: "soybean",
  ਸੋਇਆਬੀਨ: "soybean",

  onion: "onion",
  प्याज: "onion",
  कांदा: "onion",
  ਪਿਆਜ਼: "onion",
  pyaz: "onion",
};

// Common Indian disease symptom keywords
const DISEASE_DATABASE = [
  {
    keywords: ["early blight", "concentric", "dark spots", "छल्लेदार", "काले धब्बे", "अगेती झुलसा", "काळे डाग"],
    disease: "Early Blight (Alternaria solani)",
    crop: "Tomato & Potato",
    symptoms: "Target-board or concentric dark brown ring spots on mature lower leaves, leaf yellowing, stem lesions.",
    actions: [
      "Remove and destroy infected lower foliage to reduce spore load",
      "Avoid overhead sprinkler watering; switch to drip or furrow irrigation to keep leaves dry",
      "Ensure plant spacing (60 cm) for air flow",
      "Preventive bio-control: Trichoderma viride or approved copper oxychloride spray",
    ],
    citation: "ICAR-IIHR Tomato Pathology Guide",
  },
  {
    keywords: ["late blight", "water soaked", "purplish", "पिछेती झुलसा", "पांढरी बुरशी"],
    disease: "Late Blight (Phytophthora infestans)",
    crop: "Potato & Tomato",
    symptoms: "Rapidly spreading water-soaked brown lesions on leaf tips turning purplish black with white cottony mildew under high humidity (>90%) and cool nights.",
    actions: [
      "Immediately rogue out severely infected plants",
      "Ensure field drainage; avoid water stagnation",
      "Harvest potatoes only in sunny dry weather and cure tubers in shade",
      "Apply protective contact sprays like Mancozeb 75 WP before disease spreads",
    ],
    citation: "ICAR-CPRI Potato Disease Bulletin",
  },
  {
    keywords: ["yellow rust", "stripe rust", "पीला रतुआ", "हळद्या रोग", "ਪੀਲੀ ਕੁੰਗੀ"],
    disease: "Yellow / Stripe Rust (Puccinia striiformis)",
    crop: "Wheat",
    symptoms: "Bright yellow pustules arranged in parallel linear stripes on leaf blades, which wipe off on fingers as yellow powder.",
    actions: [
      "Grow rust-resistant certified varieties (e.g., HD-2967, DBW-187, PBW-550)",
      "Avoid excessive late nitrogen fertilization which makes foliage soft and susceptible",
      "Consult local KVK immediately for localized spray alert",
    ],
    citation: "ICAR-IIWBR Wheat Pathology Bulletin",
  },
  {
    keywords: ["whitefly", "leaf curl", "मरोड़", "चुरड़ा", "पाने मुरडणे", "ਚਿੱਟੀ ਮੱਖੀ"],
    disease: "Leaf Curl Virus (transmitted by Whitefly / Bemisia tabaci)",
    crop: "Chili, Tomato & Cotton",
    symptoms: "Upward curling and puckering of leaves, vein thickening, stunted bushy plant growth with flower drop.",
    actions: [
      "Install yellow sticky traps (10-15 per acre) to monitor and trap whiteflies",
      "Spray 5% Neem Seed Kernel Extract (NSKE) or Neem oil (3-5 ml/L) during early vegetative growth",
      "Use reflective silver mulch in nursery to deter vector landing",
    ],
    citation: "ICAR-IARI Integrated Pest Management (IPM) Guide",
  },
];

/**
 * Retrieves grounded agricultural context from KrishiSetu's verified data modules.
 */
export async function retrieveAgriculturalGrounding(
  query: string,
  userLocation = "Jaipur, Rajasthan"
): Promise<GroundingContextResult> {
  const lower = query.toLowerCase();
  const contextParts: string[] = [];
  const citations: string[] = [];

  let matchedCrop: CropAgronomy | undefined;
  let matchedSoil: SoilCharacteristics | undefined;
  let weatherOutlook: WeatherOutlook | undefined;

  // 1. Identify Crop Mention
  for (const [kw, cropId] of Object.entries(CROP_KEYWORD_MAP)) {
    if (lower.includes(kw)) {
      matchedCrop = INDIAN_CROPS_DATABASE.find((c) => c.id === cropId);
      break;
    }
  }

  if (matchedCrop) {
    citations.push(`ICAR & FAO-56 Agronomic Package for ${matchedCrop.name}`);
    contextParts.push(
      `[VERIFIED CROP DATA: ${matchedCrop.name} (${matchedCrop.scientificName})]
- Season: ${matchedCrop.season.toUpperCase()} | Standard duration: ${matchedCrop.totalDurationDays.standard} days (Range: ${matchedCrop.totalDurationDays.min}-${matchedCrop.totalDurationDays.max} days)
- Optimal Soil: ${matchedCrop.suitableSoils.join(", ")} | Optimal pH range: ${matchedCrop.optimalPh.min} - ${matchedCrop.optimalPh.max}
- Temperature: Germination ${matchedCrop.tempRequirements.germinationOptimal}°C, Growing Optimal ${matchedCrop.tempRequirements.growingOptimalMin}-${matchedCrop.tempRequirements.growingOptimalMax}°C, Frost Sensitive: ${matchedCrop.tempRequirements.frostSensitive ? "YES" : "NO"}
- Total Water Demand: ${matchedCrop.totalWaterDemandMm.standard} mm (Range: ${matchedCrop.totalWaterDemandMm.min}-${matchedCrop.totalWaterDemandMm.max} mm)
- Critical Water & Growth Stages:
${matchedCrop.stages.map((st, i) => `  ${i + 1}. ${st.defaultName} (Kc: ${st.kc}, Water Critical: ${st.criticalWaterStage ? "CRITICAL" : "Moderate"}) - Tasks: ${st.tasks.slice(0, 2).join("; ")}`).join("\n")}
- Standard Fertilizer Recommendation (ICAR): N:P:K = ${matchedCrop.standardNpkPerHectare.n}:${matchedCrop.standardNpkPerHectare.p}:${matchedCrop.standardNpkPerHectare.k} kg/ha plus ${matchedCrop.fymTonnesPerHectare} t/ha well-rotted FYM.`
    );
  }

  // 2. Identify Soil Mention
  for (const [sKey, soil] of Object.entries(INDIAN_SOIL_TYPES)) {
    if (lower.includes(sKey) || lower.includes(soil.name.toLowerCase()) || lower.includes("soil") || lower.includes("मिट्टी") || lower.includes("माती") || lower.includes("ਮਿੱਟੀ")) {
      matchedSoil = soil;
      citations.push(`Indian Soil Hydrology Guide (${soil.name})`);
      contextParts.push(
        `[VERIFIED SOIL DATA: ${soil.name}]
- Description: ${soil.description}
- Texture Group: ${soil.textureGroup} | Drainage: ${soil.drainageClass}
- Available Water Capacity (AWC): ${soil.awcMmPerMeter} mm per meter soil depth
- Infiltration Rate: ${soil.infiltrationRateMmPerHour} mm/hr
- Typical pH Range: ${soil.typicalPhMin} - ${soil.typicalPhMax} (Acidic soils require lime/dolomite; alkaline soils require gypsum/sulphur).`
      );
      break;
    }
  }

  // 3. Identify Disease Mention
  for (const d of DISEASE_DATABASE) {
    const hasMatch = d.keywords.some((kw) => lower.includes(kw));
    if (hasMatch) {
      citations.push(d.citation);
      contextParts.push(
        `[VERIFIED PATHOLOGY & IPM GUIDE: ${d.disease}]
- Target Crops: ${d.crop}
- Diagnostic Symptoms: ${d.symptoms}
- Recommended IPM Actions:
${d.actions.map((act) => `  * ${act}`).join("\n")}
- Disclaimer: Chemical fungicides must strictly adhere to CIBRC (Central Insecticides Board & Registration Committee) label claims.`
      );
      break;
    }
  }

  // 4. Identify Weather Query / Provide live local weather context
  const isWeatherQuery =
    lower.includes("weather") ||
    lower.includes("rain") ||
    lower.includes("temperature") ||
    lower.includes("frost") ||
    lower.includes("heat") ||
    lower.includes("मौसम") ||
    lower.includes("हवामान") ||
    lower.includes("ਮੌਸਮ") ||
    lower.includes("बारिश") ||
    lower.includes("पाऊस") ||
    lower.includes("ਮੀਂਹ");

  if (isWeatherQuery || userLocation) {
    try {
      // Find coordinates for user's location
      const locResults = await searchLocations(userLocation);
      const targetLoc = locResults[0] || { name: userLocation, latitude: 26.9124, longitude: 75.7873 };

      weatherOutlook = await fetchWeatherOutlook(
        targetLoc.latitude,
        targetLoc.longitude,
        targetLoc.name
      );

      citations.push("Live Open-Meteo Weather Forecast (CC BY 4.0)");
      contextParts.push(
        `[LIVE REAL-TIME WEATHER: ${weatherOutlook.resolvedLocation}]
- Source: ${weatherOutlook.source} (CC BY 4.0)
- Current Condition: ${weatherOutlook.currentCondition}, Temperature: ${weatherOutlook.currentTemp}°C, Humidity: ${weatherOutlook.currentHumidity}%, Wind: ${weatherOutlook.currentWindKmh} km/h
- 7-Day Outlook: Average High ${weatherOutlook.averageMaxTempNext7Days}°C, Total Forecast Rain: ${weatherOutlook.totalForecastRainMmNext7Days} mm
- Agrometeorological Risks:
${weatherOutlook.risks.map((r) => `  * ${r.title} (${r.severity.toUpperCase()}): ${r.description} -> Action: ${r.recommendation}`).join("\n")}`
      );
    } catch (e) {
      console.warn("Weather context retrieval skipped or timed out:", e);
    }
  }

  if (contextParts.length === 0) {
    contextParts.push(
      `[GENERAL INDIAN AGRICULTURAL KNOWLEDGE BASE]
- KrishiSetu AI contains verified agronomic models for 10 crops (Wheat, Paddy, Tomato, Potato, Mustard, Cotton, Chickpea, Maize, Soybean, Onion).
- Principles: Always emphasize Integrated Pest Management (IPM), soil testing through the Soil Health Card scheme, seed treatment with bio-inoculants (Trichoderma, Rhizobium, PSB), water conservation through Drip/Sprinkler systems, and local KVK advisory verification.`
    );
    citations.push("ICAR General Agronomy Guidelines");
  }

  return {
    groundedText: contextParts.join("\n\n"),
    citations: Array.from(new Set(citations)),
    matchedCrop,
    matchedSoil,
    weatherOutlook,
  };
}
