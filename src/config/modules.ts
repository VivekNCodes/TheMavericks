export interface ModuleMeta {
  id: string;
  title: string;
  tagline: string;
  description: string;
  route: string;
  owner: string;
  leadRole: string;
  themeColor: "green" | "amber" | "blue" | "emerald";
  referenceTitle: string;
  keyFeatures: string[];
}

export const moduleRegistry: Record<string, ModuleMeta> = {
  "crop-disease": {
    id: "crop-disease",
    title: "Crop Disease Detection",
    tagline: "Detect plant diseases using AI",
    description:
      "Instant visual pathology diagnosis from leaf photographs. Delivers confidence metrics, pathogen classification, and actionable agronomic remedies.",
    route: "/crop-disease",
    owner: "Integration Lead & Architect",
    leadRole: "Member 1 (Lead)",
    themeColor: "green",
    referenceTitle: "Crop Health > Disease Detection",
    keyFeatures: [
      "Drag-and-drop leaf photo uploader (JPG, PNG, WEBP)",
      "Instant sample leaf testing gallery",
      "Confidence progress bar with pathogen identification (e.g. Tomato Early Blight - 92%)",
      "Targeted agronomic action checklist (fungicide, sanitation, spacing)",
      "Advisory disclaimer for expert verification",
    ],
  },
  "mandi-prices": {
    id: "mandi-prices",
    title: "Mandi Price Intelligence",
    tagline: "Compare prices across nearby mandis",
    description:
      "Real-time price discovery across regional agricultural wholesale markets (APMCs). Track modal prices, arrival volumes, and historical price fluctuations.",
    route: "/mandi-prices",
    owner: "Agronomic Market Specialist",
    leadRole: "Member 2",
    themeColor: "amber",
    referenceTitle: "Mandi Price Intelligence",
    keyFeatures: [
      "Multi-parameter filter bar (Crop, State, District, View Period)",
      "Nearby market price comparison list with km distance and percentage change",
      "Interactive 7D / 1M / 3M / 6M price trend chart with area gradient fill",
      "Key price stat cards (Minimum, Modal, Maximum, Total Arrival)",
    ],
  },
  irrigation: {
    id: "irrigation",
    title: "Smart Irrigation Advisor",
    tagline: "Get crop-specific irrigation guidance",
    description:
      "Scientific water scheduling tailored to crop phenology, soil hydrology, and hyper-local 5-day meteorological forecasts.",
    route: "/irrigation",
    owner: "IoT & Irrigation Specialist",
    leadRole: "Member 3",
    themeColor: "blue",
    referenceTitle: "Smart Irrigation Advisor",
    keyFeatures: [
      "4-Step guided workflow (Crop Details -> Weather Data -> AI Analysis -> Results)",
      "Field parameter configuration (Crop, Growth Stage, Soil Type, Last Watered)",
      "Contextual recommendation status ('Moderate Need: Consider irrigation in next 2-3 days')",
      "5-Day weather forecast strip with precipitation and max temperature",
      "Practical soil moisture validation tip",
    ],
  },
  marketplace: {
    id: "marketplace",
    title: "Farmer Marketplace",
    tagline: "Sell your produce directly to buyers",
    description:
      "Direct agri-commerce gateway enabling verified farmers to list harvested produce directly for retail and wholesale buyers without middleman cuts.",
    route: "/marketplace",
    owner: "Agri-Commerce Specialist",
    leadRole: "Member 4",
    themeColor: "emerald",
    referenceTitle: "Farmer Marketplace & Produce Detail",
    keyFeatures: [
      "Produce catalog grid with quantity, price per quintal, location, and farmer name",
      "Multi-tab view (Browse Produce, My Listings, My Offers)",
      "Produce search and filter strip (Crop Type, Location, Price Range, Sort)",
      "Detailed listing view with photo gallery and verified farmer badge",
      "Direct buyer inquiry queue with trade matching actions",
    ],
  },
  "crop-planner": {
    id: "crop-planner",
    title: "Crop Growing Planner",
    tagline: "Scientific crop calendar, water budget & soil guidance",
    description:
      "Personalized crop cultivation planning for Indian farmers. Integrates Open-Meteo weather intelligence, FAO-56 crop coefficients, soil suitability analysis, and stage-by-stage agronomic milestones.",
    route: "/crop-planner",
    owner: "Integration Lead & Agronomic Architect",
    leadRole: "Lead Integration",
    themeColor: "green",
    referenceTitle: "Crop Management > Growing Planner",
    keyFeatures: [
      "Dynamic location geocoding & live 7-day meteorological forecast via Open-Meteo",
      "Comprehensive crop agronomic models (Wheat, Rice, Tomato, Potato, Mustard, Cotton, Chickpea, Maize, Soybean, Onion)",
      "Soil suitability assessment with transparent assumptions for unmeasured pH and nutrients",
      "FAO-56 stage-based water requirements & USDA-SCS effective rainfall adjustment",
      "Net & gross irrigation scheduling calibrated to Drip, Sprinkler, and Surface methods",
      "Stage-by-stage timeline with field operations, NPK fertilizer guidance, and agrometeorological risk alerts",
      "Full multilingual support (English, Hindi, Marathi, Punjabi)",
      "Neon PostgreSQL & offline localStorage plan persistence",
    ],
  },
  assistant: {
    id: "assistant",
    title: "AI Sahayak (कृषि मित्र)",
    tagline: "Multilingual conversational agronomy advisor",
    description:
      "Context-aware agricultural AI assistant powered by Google Gemini and grounded in ICAR crop science, Indian soil hydrology, and hyper-local meteorological forecasts. Speaks English, Hindi, Marathi, and Punjabi.",
    route: "/assistant",
    owner: "Integration Lead & AI Agronomist",
    leadRole: "Lead Integration",
    themeColor: "green",
    referenceTitle: "Advisory > AI Sahayak",
    keyFeatures: [
      "Conversational question-answering powered by Google Gemini (gemini-1.5-flash)",
      "Native multilingual support in English, Hindi, Marathi, and Punjabi with script detection",
      "Grounded in ICAR crop guides, 6 Indian soil classifications, and foliar disease pathology",
      "Live weather integration via Open-Meteo with spray timing and thermal risk warnings",
      "Explanatory advisor role enforcing IPM, KVK consultation, and safety guardrails",
      "Desktop & mobile interface with quick prompts, character counter, and session persistence",
    ],
  },
};
