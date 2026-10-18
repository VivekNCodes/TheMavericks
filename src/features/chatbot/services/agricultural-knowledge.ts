import { INDIAN_CROPS_DATABASE } from "@/features/crop-planner/data/crops";
import { INDIAN_SOIL_TYPES } from "@/features/crop-planner/data/soils";
import { fetchWeatherOutlook, searchLocations } from "@/features/crop-planner/services/weather-service";
import { CropAgronomy, SoilCharacteristics, WeatherOutlook } from "@/features/crop-planner/types";

export type AgronomicIntent =
  | "greeting"
  | "weather"
  | "scheme"
  | "disease"
  | "fertilizer"
  | "irrigation"
  | "soil"
  | "crop"
  | "general";

export interface GovernmentSchemeInfo {
  id: string;
  name: string;
  shortName: string;
  hindiName: string;
  benefit: string;
  eligibility: string;
  documents: string[];
  officialPortal: string;
  citation: string;
}

export interface DiseaseInfo {
  keywords: string[];
  disease: string;
  crop: string;
  symptoms: string;
  organicRemedies: string[];
  chemicalRemedies: string[];
  actions: string[];
  citation: string;
}

export interface GroundingContextResult {
  groundedText: string;
  citations: string[];
  intent: AgronomicIntent;
  matchedCrop?: CropAgronomy;
  matchedSoil?: SoilCharacteristics;
  matchedDisease?: DiseaseInfo;
  matchedScheme?: GovernmentSchemeInfo;
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

// Verified Indian Central Government Agricultural Schemes
export const GOVERNMENT_SCHEMES_DATABASE: GovernmentSchemeInfo[] = [
  {
    id: "pm-kisan",
    name: "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
    shortName: "PM-KISAN",
    hindiName: "प्रधानमंत्री किसान सम्मान निधि योजना",
    benefit: "Direct income support of ₹6,000 per year provided to all landholding farmer families in three equal 4-monthly installments of ₹2,000 transferred directly into Aadhaar-seeded bank accounts.",
    eligibility: "All landholding farmer families having cultivable landholding in their names. Excludes institutional landholders, constitutional post holders, serving/retired government employees, and income tax payees.",
    documents: ["Aadhaar Card", "Landholding Records / Khata-Khatauni (RoR)", "Active Bank Account linked with Aadhaar", "eKYC verification on portal"],
    officialPortal: "https://pmkisan.gov.in (Helpline: 155261 / 011-24300606)",
    citation: "Ministry of Agriculture & Farmers Welfare, GoI - PM-KISAN Operational Guidelines",
  },
  {
    id: "pmfby",
    name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
    shortName: "PMFBY",
    hindiName: "प्रधानमंत्री फसल बीमा योजना",
    benefit: "Comprehensive risk insurance covering yield losses due to non-preventable natural risks (drought, flood, pests, unseasonal rain, hailstorm, post-harvest cyclone damage). Farmers pay nominal premium: 1.5% for Rabi crops, 2.0% for Kharif food/oilseed crops, and 5.0% for annual commercial/horticultural crops; balance subsidized by GoI & State.",
    eligibility: "All farmers growing notified crops in notified areas (loanee and non-loanee farmers alike, including sharecroppers and tenant farmers with insurable interest).",
    documents: ["Aadhaar Card", "Land Record / Sowing Certificate", "Bank Passbook Copy", "Crop Sowing Declaration from Patwari/Gram Sewak"],
    officialPortal: "https://pmfby.gov.in (Toll-Free: 1800-180-1551)",
    citation: "PMFBY Revamped Operational Guidelines, Dept of Agriculture & Farmers Welfare",
  },
  {
    id: "kcc",
    name: "Kisan Credit Card (KCC)",
    shortName: "KCC",
    hindiName: "किसान क्रेडिट कार्ड योजना",
    benefit: "Single-window institutional credit for short-term crop loans up to ₹3,00,000 at a concessional interest rate of 7% per annum. Farmers who repay promptly within one year receive an additional 3% Interest Subvention, making the effective interest rate only 4% per annum. No collateral required for loans up to ₹1.60 lakh.",
    eligibility: "All farmers (individuals or joint cultivators), owner-cultivators, tenant farmers, oral lessees, sharecroppers, and Self-Help Groups (SHGs) of farmers.",
    documents: ["Application Form", "Aadhaar / Voter ID (Identity Proof)", "Land ownership documents / Tenancy proof", "Passport size photograph"],
    officialPortal: "Apply at any Commercial, Regional Rural (RRB), or Cooperative Bank branch, or via PM-KISAN portal.",
    citation: "Reserve Bank of India (RBI) Master Circular on Kisan Credit Card Scheme",
  },
  {
    id: "soil-health-card",
    name: "Soil Health Card Scheme (SHC)",
    shortName: "Soil Health Card",
    hindiName: "मृदा स्वास्थ्य कार्ड योजना",
    benefit: "Provides farmers with a printed card assessing the current fertility status of their soil across 12 vital parameters: 3 Macro-nutrients (N, P, K), 1 Secondary-nutrient (S), 5 Micro-nutrients (Zn, Fe, Cu, Mn, Bo), and 3 Physical/Chemical parameters (pH, EC, Organic Carbon). Includes customized, site-specific fertilizer dosage recommendations to reduce input costs.",
    eligibility: "All farmers across all States and Union Territories in India; soil testing conducted free or at nominal charge by district soil testing laboratories (STLs).",
    documents: ["Soil sample collected as per ICAR grid protocol", "Farmer ID / Aadhaar", "Field Khasra/Survey Number"],
    officialPortal: "https://soilhealth.dac.gov.in",
    citation: "ICAR & National Mission for Sustainable Agriculture (NMSA)",
  },
  {
    id: "pkvy",
    name: "Paramparagat Krishi Vikas Yojana (PKVY)",
    shortName: "PKVY",
    hindiName: "परम्परागत कृषि विकास योजना",
    benefit: "Financial assistance of ₹50,000 per hectare over 3 years for organic farming in cluster mode (50 or more farmers forming 50-acre clusters). ₹31,000/ha is directly transferred for organic inputs (bio-fertilizers, vermicompost, botanical extracts), and balance for PGS-India certification, packaging, and marketing.",
    eligibility: "Groups of farmers willing to adopt certified organic farming practices without synthetic fertilizers or pesticides under the Participatory Guarantee System for India (PGS-India).",
    documents: ["Cluster Formation Application", "Land Records of Cluster Farmers", "Bank Account Details", "PGS-India Farmer Pledge"],
    officialPortal: "https://pgsindia-ncof.gov.in / https://jaivikkheti.in",
    citation: "National Centre for Organic and Natural Farming (NCONF), Ministry of Agriculture",
  },
];

// Common Indian disease symptom & IPM database covering ResNet50-DCBAM foliar classes
export const DISEASE_DATABASE: DiseaseInfo[] = [
  {
    keywords: ["early blight", "concentric", "dark spots", "छल्लेदार", "काले धब्बे", "अगेती झुलसा", "काळे डाग"],
    disease: "Early Blight (Alternaria solani)",
    crop: "Tomato & Potato",
    symptoms: "Target-board or concentric dark brown ring spots on mature lower leaves, leaf yellowing, stem lesions, and fruit rot near stem end.",
    organicRemedies: [
      "Spray 5% Neem Seed Kernel Extract (NSKE) or pure cold-pressed Neem oil (4-5 ml/L) at early onset",
      "Apply bio-fungicide Trichoderma viride or Pseudomonas fluorescens @ 5g/L water on foliage",
      "Mulch soil around plants with dry straw to prevent soil-splash of fungal spores onto lower leaves",
    ],
    chemicalRemedies: [
      "Protective spray: Mancozeb 75% WP @ 2.0-2.5 g/L water",
      "Systemic spray on moderate spread: Azoxystrobin 23% SC @ 1 ml/L or Difenoconazole 25% EC @ 0.5 ml/L",
    ],
    actions: [
      "Remove and destroy infected lower foliage immediately to reduce spore load; never compost diseased leaves",
      "Avoid overhead sprinkler watering; switch strictly to drip or furrow irrigation to keep foliage dry",
      "Ensure proper plant spacing (60 cm x 45 cm) for cross-ventilation and sunlight penetration",
      "Practice 3-year crop rotation with non-solanaceous crops (maize, pulses, or brassicas)",
    ],
    citation: "ICAR-IIHR Tomato Pathology Guide & ICAR-CPRI Potato Disease Bulletin",
  },
  {
    keywords: ["late blight", "water soaked", "purplish", "पिछेती झुलसा", "पांढरी बुरशी", "late_blight"],
    disease: "Late Blight (Phytophthora infestans)",
    crop: "Potato & Tomato",
    symptoms: "Rapidly spreading water-soaked brown lesions on leaf tips turning purplish black with delicate white cottony downy mildew on leaf undersides under high humidity (>90%) and cool night temperatures (10-18°C).",
    organicRemedies: [
      "Preventive foliar application of Bordeaux mixture (1%) or Copper Oxychloride 50 WP @ 2.5 g/L",
      "Soil drenching and root dipping with Trichoderma harzianum @ 10g/L during planting",
    ],
    chemicalRemedies: [
      "Preventive: Mancozeb 75% WP @ 2.5 g/L before disease onset",
      "Curative systemic: Cymoxanil 8% + Mancozeb 64% WP @ 2.5 g/L or Dimethomorph 50% WP @ 1 g/L with thorough coverage",
    ],
    actions: [
      "Immediately rogue out and safely bury or burn severely blighted plants to stop catastrophic epidemic spread",
      "Ensure rapid field drainage; avoid any standing water or damp shaded stagnation",
      "Harvest potatoes only in sunny dry weather and cure tubers in shade; discard rotten tubers before storage",
      "Consult local Krishi Vigyan Kendra (KVK) for district-level weather-based late blight forewarning alerts",
    ],
    citation: "ICAR-CPRI Potato Late Blight Forewarning System & CIBRC Approved Fungicides List",
  },
  {
    keywords: ["yellow rust", "stripe rust", "पीला रतुआ", "हळद्या रोग", "ਪੀਲੀ ਕੁੰਗੀ", "stripe_rust"],
    disease: "Yellow / Stripe Rust (Puccinia striiformis)",
    crop: "Wheat",
    symptoms: "Bright yellow to orange pustules (uredinia) arranged in distinct linear parallel stripes on leaf blades, which easily wipe off on fingers as bright yellow powder.",
    organicRemedies: [
      "Grow certified rust-resistant varieties recommended for your agro-climatic zone (e.g. DBW-187, DBW-303, HD-3226, PBW-725)",
      "Avoid excess nitrogen fertilization; ensure balanced Potash (MOP) to enhance plant cell wall strength",
    ],
    chemicalRemedies: [
      "On initial stripe rust detection: Propiconazole 25% EC (Tilt) @ 1 ml/L or Tebuconazole 25.9% EC @ 1 ml/L (200 ml in 200 L water per acre)",
    ],
    actions: [
      "Inspect wheat fields weekly from January to March, especially in northern and northwestern plains",
      "Avoid late sowing; complete wheat sowing between Nov 5 - Nov 25 to escape peak rust infection windows",
      "Notify your nearest KVK or District Agriculture Office immediately if stripe rust appears before heading",
    ],
    citation: "ICAR-IIWBR Karnal Wheat Pathology Advisory Bulletin",
  },
  {
    keywords: ["whitefly", "leaf curl", "मरोड़", "चुरड़ा", "पाने मुरडणे", "ਚਿੱਟੀ ਮੱਖੀ", "leaf_curl"],
    disease: "Leaf Curl Virus (Begomovirus transmitted by Whitefly / Bemisia tabaci)",
    crop: "Chili, Tomato & Cotton",
    symptoms: "Upward curling, puckering, crinkling, and thickening of leaves with pronounced vein enation, stunted bushy plant stature, and severe flower drop.",
    organicRemedies: [
      "Install yellow sticky traps (15-20 traps per acre) at crop canopy level to monitor and mass-trap adult whiteflies",
      "Foliar spray of 5% Neem Seed Kernel Extract (NSKE) or Neem oil (3000 ppm) @ 4-5 ml/L at 10-day intervals",
      "Nursery bed management: Cover nursery with 40-mesh insect-proof nylon net to prevent vector infection",
    ],
    chemicalRemedies: [
      "To control vector whiteflies: Diafenthiuron 50% WP @ 1.2 g/L or Spiromesifen 22.9% SC @ 1 ml/L",
    ],
    actions: [
      "Rogue out and destroy viral-infected stunted plants during early vegetative growth to prevent field-wide vector spread",
      "Use reflective silver polyethylene mulch in tomato/chili beds to deter whitefly landings",
      "Maintain barrier crops of 2-3 rows of tall maize, sorghum, or pearl millet around the field perimeter",
    ],
    citation: "ICAR-IARI Integrated Pest Management (IPM) Package of Practices",
  },
  {
    keywords: ["apple scab", "scab", "venturia", "सेब स्कैब"],
    disease: "Apple Scab (Venturia inaequalis)",
    crop: "Apple",
    symptoms: "Dull olive-green to black velvety spots on young leaves and fruit surfaces, turning scabby, corky, and cracked as fruit expands.",
    organicRemedies: [
      "Shred or compost fallen autumn orchard leaves with 5% Urea spray to accelerate leaf decomposition and eliminate winter ascospore overwintering",
      "Apply protective sulfur wettable powder @ 3 g/L during pre-bloom stage",
    ],
    chemicalRemedies: [
      "Fungicide spray at silver tip to green tip stage: Captan 50% WP @ 2.5 g/L or Difenoconazole 25% EC @ 0.3 ml/L",
    ],
    actions: [
      "Prune apple canopy during dormancy to promote rapid leaf drying and sunlight penetration",
      "Follow localized orchard spray schedules coordinated by Dr YS Parmar UHF / SKUAST extension advisories",
    ],
    citation: "ICAR-CITH Srinagar Apple Pathology Bulletin",
  },
  {
    keywords: ["common rust", "corn rust", "maize rust", "मक्का रतुआ"],
    disease: "Common Rust (Puccinia sorghi)",
    crop: "Corn (Maize)",
    symptoms: "Golden brown to cinnamon-brown powdery pustules scattered across both upper and lower leaf surfaces, erupting as leaves mature.",
    organicRemedies: [
      "Plant rust-tolerant hybrid corn cultivars (e.g. PMH-1, HQPM-1, Bio-9681)",
      "Maintain balanced soil nutrition; avoid excessive single-dose nitrogen application",
    ],
    chemicalRemedies: [
      "If pustules appear on ear-leaf prior to silking: Mancozeb 75% WP @ 2 g/L or Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L",
    ],
    actions: [
      "Monitor lower leaves at V6 to V8 vegetative growth stages",
      "Plow under maize crop residues after harvest to reduce local fungal persistence",
    ],
    citation: "ICAR-IIMR Indian Institute of Maize Research Advisory",
  },
  {
    keywords: ["bacterial spot", "xanthomonas", "जीवाणु धब्बा"],
    disease: "Bacterial Spot (Xanthomonas campestris / vesicatoria)",
    crop: "Pepper Bell & Tomato",
    symptoms: "Small, circular, dark brown to black greasy water-soaked spots on leaves surrounded by yellow halos, causing heavy defoliation and blistered fruit spots.",
    organicRemedies: [
      "Treat seeds before sowing with hot water (50°C for 25 minutes) or soak in bio-agent Pseudomonas fluorescens @ 10g/kg seed",
      "Foliar spray with Copper Hydroxide @ 2 g/L during dry weather",
    ],
    chemicalRemedies: [
      "Spray Streptocycline (antibacterial) @ 100 ppm (1 g per 10 L water) mixed with Copper Oxychloride 50 WP @ 2 g/L at 12-15 day intervals",
    ],
    actions: [
      "Avoid overhead irrigation; handle plants only when foliage is completely dry to prevent mechanical bacterial transmission",
      "Strict 2-year crop rotation with corn, beans, or cole crops",
    ],
    citation: "ICAR-IIHR Bangalore Solanaceous Crop Pathology Manual",
  },
  {
    keywords: ["powdery mildew", "white powder", "छाछिया रोग", "पांढरी बुरशी", "भूरी"],
    disease: "Powdery Mildew (Erysiphe / Podosphaera)",
    crop: "Cherry, Squash, Tomato, Pea & Grape",
    symptoms: "White, talcum powder-like superficial fungal patches on leaf surfaces, petioles, and young green stems, causing leaf curling and premature drying.",
    organicRemedies: [
      "Spray 10% cow milk solution (1 part fresh raw milk in 9 parts water) under bright sunlight; produces natural antiseptic lactoferrins",
      "Potassium bicarbonate or baking soda spray (5 g/L) + 2 ml horticultural oil to alter leaf surface pH against spores",
    ],
    chemicalRemedies: [
      "Wettable Sulfur 80% WP @ 2.5-3.0 g/L water or Hexaconazole 5% EC @ 1 ml/L (do not apply sulfur during high heat >32°C)",
    ],
    actions: [
      "Maintain wide plant spacing and prune interior crowding for optimal air circulation",
      "Avoid excessive nitrogen that triggers rapid tender susceptible succulent vegetative shoots",
    ],
    citation: "ICAR Package of Practices for Vegetable & Fruit Crops",
  },
];

/**
 * Retrieves grounded agricultural context from AgroSaathi's verified data modules.
 */
export async function retrieveAgriculturalGrounding(
  query: string,
  userLocation = "Jaipur, Rajasthan",
  history?: Array<{ role: "user" | "assistant"; content: string }>
): Promise<GroundingContextResult> {
  const lower = query.toLowerCase();
  const contextParts: string[] = [];
  const citations: string[] = [];

  let matchedCrop: CropAgronomy | undefined;
  let matchedSoil: SoilCharacteristics | undefined;
  let matchedDisease: DiseaseInfo | undefined;
  let matchedScheme: GovernmentSchemeInfo | undefined;
  let weatherOutlook: WeatherOutlook | undefined;

  // 1. Identify Crop Mention (current query or context inheritance from last 3 messages)
  for (const [kw, cropId] of Object.entries(CROP_KEYWORD_MAP)) {
    if (lower.includes(kw)) {
      matchedCrop = INDIAN_CROPS_DATABASE.find((c) => c.id === cropId);
      break;
    }
  }

  // Follow-up context inheritance: if crop not in current prompt, search recent user messages
  if (!matchedCrop && history && history.length > 0) {
    const priorUserTexts = history
      .slice(-4)
      .map((m) => m.content.toLowerCase())
      .join(" ");

    for (const [kw, cropId] of Object.entries(CROP_KEYWORD_MAP)) {
      if (priorUserTexts.includes(kw)) {
        matchedCrop = INDIAN_CROPS_DATABASE.find((c) => c.id === cropId);
        break;
      }
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
- Typical pH Range: ${soil.typicalPhMin} - ${soil.typicalPhMax} (Acidic soils require agricultural lime/dolomite; alkaline soils require gypsum/elemental sulphur).`
      );
      break;
    }
  }

  // 3. Identify Disease Mention
  for (const d of DISEASE_DATABASE) {
    const hasMatch = d.keywords.some((kw) => lower.includes(kw));
    if (hasMatch) {
      matchedDisease = d;
      citations.push(d.citation);
      contextParts.push(
        `[VERIFIED PATHOLOGY & IPM GUIDE: ${d.disease}]
- Target Crops: ${d.crop}
- Diagnostic Symptoms: ${d.symptoms}
- Biological & Cultural Remedies:
${d.organicRemedies.map((r) => `  * ${r}`).join("\n")}
- Approved Chemical Interventions (CIBRC Label Claim):
${d.chemicalRemedies.map((c) => `  * ${c}`).join("\n")}
- Core IPM Management Steps:
${d.actions.map((act) => `  * ${act}`).join("\n")}
- Disclaimer: Chemical fungicides must strictly adhere to CIBRC (Central Insecticides Board & Registration Committee) label claims.`
      );
      break;
    }
  }

  // 4. Identify Government Scheme Mention
  const schemeKeywords: Record<string, string> = {
    "kisan": "pm-kisan",
    "pm-kisan": "pm-kisan",
    "pmkisan": "pm-kisan",
    "सम्मान निधि": "pm-kisan",
    "fasal bima": "pmfby",
    "pmfby": "pmfby",
    "crop insurance": "pmfby",
    "फसल बीमा": "pmfby",
    "बीमा": "pmfby",
    "kcc": "kcc",
    "kisan credit card": "kcc",
    "क्रेडिट कार्ड": "kcc",
    "loan": "kcc",
    "ऋण": "kcc",
    "soil health card": "soil-health-card",
    "मृदा स्वास्थ्य": "soil-health-card",
    "organic farming scheme": "pkvy",
    "pkvy": "pkvy",
    "परम्परागत कृषि": "pkvy",
    "योजना": "pm-kisan", // default scheme anchor
    "scheme": "pm-kisan",
    "subsidy": "pm-kisan",
    "सब्सिडी": "pm-kisan",
  };

  for (const [kw, schemeId] of Object.entries(schemeKeywords)) {
    if (lower.includes(kw)) {
      matchedScheme = GOVERNMENT_SCHEMES_DATABASE.find((s) => s.id === schemeId);
      if (matchedScheme) {
        citations.push(matchedScheme.citation);
        contextParts.push(
          `[VERIFIED GOVERNMENT SCHEME: ${matchedScheme.name} (${matchedScheme.shortName})]
- Hindi Name: ${matchedScheme.hindiName}
- Key Benefits: ${matchedScheme.benefit}
- Eligibility: ${matchedScheme.eligibility}
- Required Documentation: ${matchedScheme.documents.join(", ")}
- Official Registration & Verification Portal: ${matchedScheme.officialPortal}`
        );
        break;
      }
    }
  }

  // 5. Identify Weather Query: ONLY fetch live weather when user explicitly asks for weather!
  const isWeatherQuery =
    /\b(weather|rain|rainfall|temperature|frost|forecast|heatwave|heat stress|cold wave)\b/i.test(lower) ||
    lower.includes("मौसम") ||
    lower.includes("हवामान") ||
    lower.includes("ਮੌਸਮ") ||
    lower.includes("बारिश") ||
    lower.includes("पाऊस") ||
    lower.includes("ਮੀਂਹ") ||
    lower.includes("तापमान");

  if (isWeatherQuery) {
    try {
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

  // 6. Determine Primary User Intent
  let intent: AgronomicIntent = "general";

  const isGreeting =
    /^(hello|hi|hey|namaste|pranam|greetings|नमस्ते|नमस्कार|ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ|राम राम|प्रणाम|kem cho|vanakkam)\b/i.test(lower.trim());

  const isFertilizerQuery =
    /\b(fertilizer|fertiliser|khad|urea|dap|mop|npk|potash|manure|fym|compost|zinc|nutrient|dosage)\b/i.test(lower) ||
    lower.includes("खाद") ||
    lower.includes("यूरिया") ||
    lower.includes("पोटाश") ||
    lower.includes("गोबर") ||
    lower.includes("जिंक") ||
    lower.includes("पोषण");

  const isIrrigationQuery =
    /\b(irrigation|water demand|watering|sinchai|drip|sprinkler)\b/i.test(lower) ||
    lower.includes("सिंचाई") ||
    lower.includes("पानी") ||
    lower.includes("पाणी") ||
    lower.includes("ਸਿੰਚਾਈ") ||
    lower.includes("ड्रिप");

  const isDiseaseQuery =
    /\b(disease|pest|fungus|blight|rust|canker|mildew|scab|curling|spots|spray|treatment|cure|remedy)\b/i.test(lower) ||
    lower.includes("कीड़े") ||
    lower.includes("रोग") ||
    lower.includes("उपचार") ||
    lower.includes("दवा") ||
    lower.includes("छिड़काव") ||
    lower.includes("झुलसा") ||
    lower.includes("फफूंद") ||
    !!matchedDisease;

  if (isGreeting && !matchedCrop && !matchedDisease && !matchedScheme && !isWeatherQuery) {
    intent = "greeting";
  } else if (isWeatherQuery) {
    intent = "weather";
  } else if (matchedScheme && (lower.includes("scheme") || lower.includes("योजना") || lower.includes("bima") || lower.includes("kcc") || lower.includes("subsidy") || lower.includes("card") || lower.includes("कार्ड") || lower.includes("kisan") || lower.includes("किसान"))) {
    intent = "scheme";
  } else if (isDiseaseQuery) {
    intent = "disease";
  } else if (isFertilizerQuery) {
    intent = "fertilizer";
  } else if (isIrrigationQuery) {
    intent = "irrigation";
  } else if (matchedSoil && (lower.includes("soil") || lower.includes("मिट्टी") || lower.includes("माती"))) {
    intent = "soil";
  } else if (matchedCrop) {
    intent = "crop";
  } else {
    intent = "general";
  }

  if (contextParts.length === 0) {
    contextParts.push(
      `[GENERAL INDIAN AGRICULTURAL KNOWLEDGE BASE]
- AgroSaathi provides agronomic intelligence for Indian farmers across 10 major field crops and 38 foliar disease conditions.
- Core Pillars: Integrated Pest Management (IPM), soil testing (Soil Health Card), balanced NPK fertilization with organic FYM, water conservation through Micro-Irrigation (Drip/Sprinkler), and verification with local Krishi Vigyan Kendras (KVK).`
    );
    citations.push("ICAR General Agronomy Guidelines");
  }

  return {
    groundedText: contextParts.join("\n\n"),
    citations: Array.from(new Set(citations)),
    intent,
    matchedCrop,
    matchedSoil,
    matchedDisease,
    matchedScheme,
    weatherOutlook,
  };
}
