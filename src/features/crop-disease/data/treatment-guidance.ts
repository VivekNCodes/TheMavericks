/**
 * Agronomic Treatment Guidance & Botanical Knowledge
 * ---------------------------------------------------
 * Verified ICAR-grounded symptom summaries and IPM remediation actions
 * mapped to the PlantVillage 38 classification targets.
 */

export interface AgronomicGuidance {
  crop: string;
  condition: string;
  scientificName?: string;
  severity: "healthy" | "low" | "moderate" | "high";
  summary: string;
  actions: string[];
}

export const AGRONOMIC_GUIDANCE_MAP: Record<string, AgronomicGuidance> = {
  // Apple
  Apple___Apple_scab: {
    crop: "Apple",
    condition: "Apple scab",
    scientificName: "Venturia inaequalis",
    severity: "high",
    summary:
      "Olive-green to velvety dark brown lesions appear on leaves and fruit surfaces, causing foliage distortion and premature fruit drop during cool, wet spring weather.",
    actions: [
      "Rake and destroy fallen leaves in autumn to eliminate primary overwintering pseudothecia",
      "Prune canopy branches to improve internal air circulation and accelerate drying of foliage",
      "Apply protective sulfur-based or captan preventive spray at green tip stage before rainfall",
      "Consult local Krishi Vigyan Kendra (KVK) for regional scab warning advisory schedule",
    ],
  },
  Apple___Black_rot: {
    crop: "Apple",
    condition: "Black rot",
    scientificName: "Botryosphaeria obtusa",
    severity: "high",
    summary:
      "Causes frog-eye leaf spots with purple margins and concentric zones, twig cankers, and dark mummified fruits remaining on tree branches.",
    actions: [
      "Prune out dead twigs, fire-blight cankers, and mummified fruits 15 cm below visible infection",
      "Disinfect pruning shears with 70% ethanol between successive cuts",
      "Apply protective copper or mancozeb sprays from petal fall through fruit maturation",
    ],
  },
  Apple___Cedar_apple_rust: {
    crop: "Apple",
    condition: "Cedar apple rust",
    scientificName: "Gymnosporangium juniperi-virginianae",
    severity: "moderate",
    summary:
      "Bright orange-yellow circular spots with raised centres on the upper leaf surface, producing tubular fungal structures on the lower surface.",
    actions: [
      "Eradicate eastern red cedar and wild juniper alternate hosts within a 500-meter radius if feasible",
      "Apply protective myclobutanil or sulfur spray when cedar galls form gelatinous orange horns in spring",
      "Choose rust-resistant apple cultivars (e.g., Liberty, Enterprise) for new orchard blocks",
    ],
  },
  Apple___healthy: {
    crop: "Apple",
    condition: "Healthy Foliage",
    severity: "healthy",
    summary:
      "Foliage demonstrates balanced chlorophyll absorption with no necrotic margins, rust spots, or fungal lesions.",
    actions: [
      "Maintain regular drip fertigation according to orchard tree age and soil testing results",
      "Monitor canopy microclimate and humidity during monsoon flush",
      "Continue routine seasonal foliar micronutrient applications (Zinc, Boron)",
    ],
  },

  // Blueberry
  Blueberry___healthy: {
    crop: "Blueberry",
    condition: "Healthy Foliage",
    severity: "healthy",
    summary:
      "Clean, turgid leaves with deep green pigmentation and no signs of bacterial blight or leaf scorch.",
    actions: [
      "Maintain acidic soil pH between 4.5 and 5.2 using pine needle mulch or sulfur pellets",
      "Ensure uniform root zone moisture without waterlogging",
    ],
  },

  // Cherry
  "Cherry_(including_sour)___Powdery_mildew": {
    crop: "Cherry",
    condition: "Powdery mildew",
    scientificName: "Podosphaera clandestina",
    severity: "moderate",
    summary:
      "White, talcum powder-like fungal mycelium covers the surface of young leaves, causing leaves to curl upward and shoots to become stunted.",
    actions: [
      "Apply wettable sulfur (0.2%) or neem oil (5 ml/L) at first sign of white fungal mycelium",
      "Avoid excess nitrogen fertilizer that promotes dense, succulent vegetative flushes",
      "Prune dense interior water sprouts to allow sunlight penetration",
    ],
  },
  "Cherry_(including_sour)___healthy": {
    crop: "Cherry",
    condition: "Healthy Foliage",
    severity: "healthy",
    summary: "Foliage exhibits vigorous vegetative growth with intact cuticle and zero powdery sporulation.",
    actions: [
      "Continue standard orchard post-harvest sanitation",
      "Ensure balanced potassium application for fruit bud development",
    ],
  },

  // Corn / Maize
  "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot": {
    crop: "Corn (Maize)",
    condition: "Gray leaf spot",
    scientificName: "Cercospora zeae-maydis",
    severity: "high",
    summary:
      "Rectangular, pale brown to gray necrotic lesions bordered by leaf veins, expanding under warm, overcast, and humid weather conditions.",
    actions: [
      "Rotate fields with non-host legume crops (e.g., Soybean, Chickpea) to break stubble carryover",
      "Incorporate previous crop residues deep into soil via moldboard plowing after harvest",
      "Apply triazole or strobilurin-based foliar fungicide if lesions appear before tasseling stage",
    ],
  },
  "Corn_(maize)___Common_rust_": {
    crop: "Corn (Maize)",
    condition: "Common rust",
    scientificName: "Puccinia sorghi",
    severity: "moderate",
    summary:
      "Cinnamon-brown circular to elongate pustules (uredinia) scattered abundantly over both leaf surfaces, rupturing the epidermis.",
    actions: [
      "Plant rust-resistant hybrid varieties suited for your agro-climatic zone",
      "Spray Mancozeb (2.5 g/L water) or Azoxystrobin upon initial pustule appearance",
      "Avoid late sowing to protect crop from peak airborne spore inoculum",
    ],
  },
  "Corn_(maize)___Northern_Leaf_Blight": {
    crop: "Corn (Maize)",
    condition: "Northern leaf blight",
    scientificName: "Exserohilum turcicum",
    severity: "high",
    summary:
      "Long, elliptical, grayish-green to tan lesions (cigar-shaped) expanding up to 15 cm along the leaf blade.",
    actions: [
      "Destroy and plow under infected crop residue promptly after grain harvest",
      "Apply foliar sprays of Propiconazole 25 EC (1 ml/L) or Mancozeb 75 WP at knee-high stage",
      "Ensure optimum plant density to prevent excessive relative humidity in the canopy",
    ],
  },
  "Corn_(maize)___healthy": {
    crop: "Corn (Maize)",
    condition: "Healthy Foliage",
    severity: "healthy",
    summary: "Broad, deep-green leaf blades with clear veins and zero pustules or blights.",
    actions: [
      "Apply split nitrogen doses at knee-high and tasseling stages",
      "Maintain adequate moisture during silking and grain filling",
    ],
  },

  // Grape
  Grape___Black_rot: {
    crop: "Grape",
    condition: "Black rot",
    scientificName: "Guignardia bidwellii",
    severity: "high",
    summary:
      "Small circular reddish-brown leaf spots with minute black pycnidia; later spreads to berries causing complete black shrivelling into hard mummies.",
    actions: [
      "Remove all overwintering mummified grape clusters and prunings from the vineyard",
      "Apply copper hydroxide or Dithianon sprays from early shoot growth through veraison",
      "Maintain open canopy trellis systems to facilitate rapid leaf drying",
    ],
  },
  "Grape___Esca_(Black_Measles)": {
    crop: "Grape",
    condition: "Esca (Black measles)",
    scientificName: "Phaeomoniella chlamydospora & Fomitiporia mediterranea",
    severity: "high",
    summary:
      "Characteristic 'tiger-stripe' interveinal chlorosis and necrosis on mature leaves accompanied by speckled dark spots on berries.",
    actions: [
      "Prune vineyards during late dormant period in dry weather to avoid spore entry into pruning wounds",
      "Protect large pruning wounds immediately with wound sealant pastes or Trichoderma pastes",
      "Mark and isolate affected vines for separate pruning and sanitary disposal",
    ],
  },
  "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)": {
    crop: "Grape",
    condition: "Leaf blight (Isariopsis)",
    scientificName: "Phaeoisariopsis clavispora",
    severity: "moderate",
    summary:
      "Irregular brown spots with dark margins on older leaves, coalescing and causing premature leaf desiccation and defoliation.",
    actions: [
      "Spray Mancozeb (2.5 g/L) or Carbendazim (1 g/L) when spots first appear on basal leaves",
      "Clear fallen infected leaf litter to reduce seasonal inoculum",
    ],
  },
  Grape___healthy: {
    crop: "Grape",
    condition: "Healthy Foliage",
    severity: "healthy",
    summary: "Intact palmate leaves with healthy vascular veins and balanced vegetative growth.",
    actions: [
      "Continue regular canopy management and shoot positioning",
      "Perform regular petiole nutrient analysis to guide fertigation",
    ],
  },

  // Orange
  "Orange___Haunglongbing_(Citrus_greening)": {
    crop: "Orange / Citrus",
    condition: "Citrus greening (Huanglongbing)",
    scientificName: "Candidatus Liberibacter asiaticus",
    severity: "high",
    summary:
      "Asymmetric blotchy mottling of leaf blades with yellow veins, zinc-like deficiency patterns, and small lopsided bitter fruits.",
    actions: [
      "Control Asian Citrus Psyllid (Diaphorina citri) vector using systemic imidacloprid or bio-agents",
      "Remove severely declining trees to prevent orchard-wide transmission",
      "Source only certified disease-free rootstocks from accredited tissue culture nurseries",
      "Report suspected tree symptoms to the District Horticulture Officer or nearest KVK",
    ],
  },

  // Peach
  Peach___Bacterial_spot: {
    crop: "Peach",
    condition: "Bacterial spot",
    scientificName: "Xanthomonas arboricola pv. pruni",
    severity: "high",
    summary:
      "Angular, purple-brown water-soaked lesions that drop out of the leaf blade, giving a ragged 'shot-hole' appearance.",
    actions: [
      "Apply protective copper-based bactericide sprays during dormant and bud break stages",
      "Avoid excessive nitrogen applications that delay hardening of young shoots",
      "Plant windbreaks around orchards to reduce sandblasting and natural wound entry points",
    ],
  },
  Peach___healthy: {
    crop: "Peach",
    condition: "Healthy Foliage",
    severity: "healthy",
    summary: "Glossy lanceolate leaves free of bacterial lesions and shot-hole perforations.",
    actions: [
      "Monitor for aphids and mites during peak vegetative expansion",
      "Maintain consistent soil moisture through organic mulching",
    ],
  },

  // Pepper Bell
  "Pepper,_bell___Bacterial_spot": {
    crop: "Bell Pepper",
    condition: "Bacterial spot",
    scientificName: "Xanthomonas euvesicatoria",
    severity: "high",
    summary:
      "Small, water-soaked, yellowish-green spots with greasy borders that turn dark brown with age, causing heavy lower leaf drop.",
    actions: [
      "Soak seeds in hot water (50°C for 25 minutes) or treat with Trichoderma before nursery sowing",
      "Avoid overhead sprinkler irrigation; switch to drip irrigation to keep foliage dry",
      "Spray copper hydroxide combined with streptomycin sulfate (50 ppm) at 10-day intervals",
    ],
  },
  "Pepper,_bell___healthy": {
    crop: "Bell Pepper",
    condition: "Healthy Foliage",
    severity: "healthy",
    summary: "Firm, vibrant emerald leaves without chlorotic margins or water-soaked lesions.",
    actions: [
      "Maintain calcium-rich fertigation to prevent blossom end rot in developing fruit",
      "Use yellow sticky traps around nursery beds to monitor thrips and aphids",
    ],
  },

  // Potato
  Potato___Early_blight: {
    crop: "Potato",
    condition: "Early blight",
    scientificName: "Alternaria solani",
    severity: "moderate",
    summary:
      "Dark brown circular spots with distinctive concentric target rings, surrounded by a narrow chlorotic halo on older foliage.",
    actions: [
      "Remove and destroy infected lower leaves showing target spots promptly",
      "Apply preventive contact fungicide (Mancozeb 75 WP @ 2.5 g/L) at early vegetative stage",
      "Avoid overhead sprinkler irrigation to keep leaf surfaces dry",
      "Maintain 2-3 year crop rotation with non-solanaceous crops",
    ],
  },
  Potato___Late_blight: {
    crop: "Potato",
    condition: "Late blight",
    scientificName: "Phytophthora infestans",
    severity: "high",
    summary:
      "Rapidly expanding water-soaked purplish-black lesions with pale halos; white cottony mildew forms on the lower leaf surface under cool, foggy conditions.",
    actions: [
      "Apply systemic fungicide (Cymoxanil + Mancozeb or Metalaxyl) immediately upon first symptom detection",
      "Ensure proper earthing up to prevent zoospores from washing down into potato tubers",
      "Destroy and burn haulms 10 days before harvest to avoid tuber contamination",
      "Consult local KVK for weather-based blight forecasting and alert advisories",
    ],
  },
  Potato___healthy: {
    crop: "Potato",
    condition: "Healthy Foliage",
    severity: "healthy",
    summary: "Robust compound leaves with full turgidity, healthy stomatal activity, and no foliar necrosis.",
    actions: [
      "Maintain balanced N-P-K fertigation with special focus on potassium during tuber initiation",
      "Ensure well-drained raised beds to protect roots from hypoxia",
    ],
  },

  // Raspberry
  Raspberry___healthy: {
    crop: "Raspberry",
    condition: "Healthy Foliage",
    severity: "healthy",
    summary: "Healthy pinnate leaves with vibrant green color and absence of rust or anthracnose lesions.",
    actions: [
      "Prune old fruiting canes at soil level after harvest",
      "Maintain adequate aeration through proper trellising",
    ],
  },

  // Soybean
  Soybean___healthy: {
    crop: "Soybean",
    condition: "Healthy Foliage",
    severity: "healthy",
    summary: "Trifoliate leaves exhibiting dense chlorophyll pigmentation and no mosaic or rust symptoms.",
    actions: [
      "Ensure Rhizobium inoculation at sowing for effective atmospheric nitrogen fixation",
      "Scout for pod borers and spodoptera during flowering and pod development stages",
    ],
  },

  // Squash
  Squash___Powdery_mildew: {
    crop: "Squash / Cucurbits",
    condition: "Powdery mildew",
    scientificName: "Podosphaera xanthii",
    severity: "moderate",
    summary:
      "Dense powdery white fungal spots on upper and lower leaf surfaces, causing premature senescence, leaf curling, and sunscald on fruits.",
    actions: [
      "Apply wettable sulfur (0.2%) or potassium bicarbonate foliar sprays",
      "Use bio-control agents such as Ampelomyces quisqualis or neem oil formulation",
      "Ensure drip irrigation to prevent high canopy humidity while keeping roots adequately hydrated",
    ],
  },

  // Strawberry
  Strawberry___Leaf_scorch: {
    crop: "Strawberry",
    condition: "Leaf scorch",
    scientificName: "Diplocarpon earlianum",
    severity: "moderate",
    summary:
      "Numerous small, irregular purple to dark brown spots without distinct white centres, causing the leaf margins to curl up and appear burned or scorched.",
    actions: [
      "Remove and burn older scorched leaves during renovation of strawberry beds",
      "Apply Captan (2 g/L) or Copper oxychloride before peak flowering flush",
      "Use drip tape under plastic mulch to prevent water splash onto foliage",
    ],
  },
  Strawberry___healthy: {
    crop: "Strawberry",
    condition: "Healthy Foliage",
    severity: "healthy",
    summary: "Vibrant trifoliate foliage with intact serrated margins and zero leaf scorch lesions.",
    actions: [
      "Maintain clean straw or plastic mulching to prevent direct soil-fruit contact",
      "Monitor electrical conductivity (EC) of fertigation solution",
    ],
  },

  // Tomato
  Tomato___Bacterial_spot: {
    crop: "Tomato",
    condition: "Bacterial spot",
    scientificName: "Xanthomonas perforans",
    severity: "high",
    summary:
      "Small, angular, dark brown to black water-soaked spots with yellow halos on foliage; spots may scab over and coalesce into severe blighted patches.",
    actions: [
      "Treat seeds with hot water (50°C for 25 min) or certified bactericide prior to sowing",
      "Apply copper hydroxide mixed with Mancozeb at 7 to 10-day intervals during wet weather",
      "Avoid handling or weeding in tomato fields while plants are wet with dew or rain",
    ],
  },
  Tomato___Early_blight: {
    crop: "Tomato",
    condition: "Early blight",
    scientificName: "Alternaria solani",
    severity: "moderate",
    summary:
      "Concentric circular target rings forming brown necrotic lesions on older leaves, surrounded by yellow chlorotic margins that eventually desiccate the leaf.",
    actions: [
      "Prune lower leaves (up to 30 cm from ground) to prevent soil-splash spore inoculation",
      "Apply Mancozeb 75 WP (2.5 g/L) or Chlorothalonil preventatively every 10-14 days",
      "Mulch soil bed with organic straw or reflective mulch to create a splash barrier",
      "Maintain strict 60x45 cm plant spacing for optimal canopy ventilation",
    ],
  },
  Tomato___Late_blight: {
    crop: "Tomato",
    condition: "Late blight",
    scientificName: "Phytophthora infestans",
    severity: "high",
    summary:
      "Large, irregular water-soaked spots that turn purplish-brown to black rapidly; white fungal growth appears on leaf undersides in high humidity and foggy weather.",
    actions: [
      "Spray systemic fungicides (Cymoxanil + Mancozeb or Dimethomorph) immediately on warning",
      "Avoid overhead irrigation entirely; irrigate early morning via drip lines",
      "Remove and safely burn severely infected plants; do not compost blighted material",
      "Confirm diagnostic confirmation at nearest Krishi Vigyan Kendra (KVK)",
    ],
  },
  Tomato___Leaf_Mold: {
    crop: "Tomato",
    condition: "Leaf mold",
    scientificName: "Passalora fulva",
    severity: "moderate",
    summary:
      "Pale green to yellow spots with indefinite margins on upper leaf surfaces, developing olive-green to brown velvety fungal mold on leaf undersides.",
    actions: [
      "Improve greenhouse and field air circulation by opening side curtains and pruning suckers",
      "Keep relative humidity below 85% through proper greenhouse ventilation",
      "Apply protective copper or difenoconazole spray when humidity spikes",
    ],
  },
  Tomato___Septoria_leaf_spot: {
    crop: "Tomato",
    condition: "Septoria leaf spot",
    scientificName: "Septoria lycopersici",
    severity: "moderate",
    summary:
      "Numerous small, circular spots (2-3 mm) with grayish-white centres and dark brown borders; tiny black specks (pycnidia) visible inside spots.",
    actions: [
      "Pick off affected lower leaves as soon as first spots appear",
      "Apply organic bio-fungicide (Trichoderma harzianum @ 5 g/L) as foliar spray",
      "Avoid working in field rows when foliage is wet from morning dew",
    ],
  },
  "Tomato___Spider_mites Two-spotted_spider_mite": {
    crop: "Tomato",
    condition: "Two-spotted spider mites",
    scientificName: "Tetranychus urticae",
    severity: "moderate",
    summary:
      "Fine yellow speckling (stippling) on upper leaf surfaces accompanied by delicate webbing on leaf undersides during hot, dry, dusty weather.",
    actions: [
      "Spray 5% Neem Seed Kernel Extract (NSKE) or commercial azadirachtin (3 ml/L)",
      "Release predatory mites (Phytoseiulus persimilis) for biological control in polyhouses",
      "Wash foliage with high-pressure water spray to disrupt webs and reduce dust deposits",
    ],
  },
  Tomato___Target_Spot: {
    crop: "Tomato",
    condition: "Target spot",
    scientificName: "Corynespora cassiicola",
    severity: "moderate",
    summary:
      "Brown circular lesions with faint concentric rings and yellow halos on leaves, stems, and ripening fruits, resembling early blight.",
    actions: [
      "Apply preventative Azoxystrobin or Mancozeb sprays during flowering stage",
      "Ensure adequate plant staking to lift vines off moist soil surface",
    ],
  },
  Tomato___Tomato_Yellow_Leaf_Curl_Virus: {
    crop: "Tomato",
    condition: "Tomato yellow leaf curl virus (TYLCV)",
    scientificName: "Geminiviridae (Vectored by Bemisia tabaci)",
    severity: "high",
    summary:
      "Severe stunting of tomato plants with upward leaf cupping, reduced leaf size, chlorotic leaf margins, and almost complete floral abortion.",
    actions: [
      "Install yellow sticky traps (20-25 traps/acre) to monitor and catch whitefly vectors",
      "Spray systemic insecticide (Acetamiprid or Thiamethoxam @ 0.5 g/L) or neem oil (5 ml/L)",
      "Eradicate and bag infected plants immediately to prevent vector spread to adjacent rows",
      "Use 40-mesh insect-proof net in nursery seedbeds",
    ],
  },
  Tomato___Tomato_mosaic_virus: {
    crop: "Tomato",
    condition: "Tomato mosaic virus (ToMV)",
    scientificName: "Tobamovirus",
    severity: "high",
    summary:
      "Light and dark green mottling on foliage, distorted 'shoestring' leaves, reduced plant vigor, and internal browning of tomato fruits.",
    actions: [
      "Wash hands and tools thoroughly with soap and 20% nonfat dry milk solution before pruning",
      "Prohibit tobacco smoking/chewing near tomato plants as virus is mechanically transmissible",
      "Remove and destroy infected plants promptly; do not touch healthy plants after touching infected ones",
    ],
  },
  Tomato___healthy: {
    crop: "Tomato",
    condition: "Healthy Foliage",
    severity: "healthy",
    summary:
      "Vigorous dark-green composite leaves showing balanced cellular turgidity, active stomatal respiration, and zero fungal or viral lesions.",
    actions: [
      "Continue balanced fertigation (19-19-19 NPK) with micronutrient booster",
      "Monitor soil moisture at 15 cm depth before next irrigation cycle",
      "Maintain preventive organic neem oil sprays (3 ml/L) every 14 days",
    ],
  },
};

/**
 * Helper to retrieve agronomic guidance for a given class label.
 * Returns default educational guidance if an exact match is not found.
 */
export function getAgronomicGuidance(classLabel: string): AgronomicGuidance {
  if (AGRONOMIC_GUIDANCE_MAP[classLabel]) {
    return AGRONOMIC_GUIDANCE_MAP[classLabel];
  }

  // Fallback parsing for unknown or generic label
  const isHealthy = classLabel.toLowerCase().includes("healthy");
  const parts = classLabel.split("___");
  const crop = parts[0]?.replace(/_/g, " ") || "Crop";
  const condition = parts[1]?.replace(/_/g, " ") || classLabel;

  if (isHealthy) {
    return {
      crop,
      condition: "Healthy Foliage",
      severity: "healthy",
      summary:
        "No active pathogen detected. The foliage shows intact cell structures, regular chlorophyll coloration, and normal physiological vigor.",
      actions: [
        "Maintain current balanced irrigation and nutrient regimen",
        "Perform regular scouting on lower leaf undersides for early pest presence",
        "Continue preventive bio-rational sprays during weather transitions",
      ],
    };
  }

  return {
    crop,
    condition,
    severity: "moderate",
    summary: `Foliar analysis suggests symptoms consistent with ${condition}. The plant exhibits localized tissue discoloration requiring proactive management.`,
    actions: [
      "Isolate affected plants or remove severely damaged foliage to limit spread",
      "Ensure proper irrigation timing to minimize surface leaf wetness duration",
      "Consult your local Krishi Vigyan Kendra (KVK) officer for laboratory diagnosis and precise spray schedules",
    ],
  };
}
