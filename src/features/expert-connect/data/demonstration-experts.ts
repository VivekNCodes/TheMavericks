import { ExpertProfile } from "../types";

export const KISAN_CALL_CENTRE = {
  tollFreeNumber: "1800-180-1551",
  timing: "6:00 AM to 10:00 PM (All 7 Days)",
  languagesSupported: "22 Regional Indian Languages",
  agency: "Ministry of Agriculture & Farmers Welfare, Govt. of India",
  description:
    "Free toll-free telephone advisory connecting farmers directly with agricultural graduates and Subject Matter Specialists at regional call centers across India.",
};

export const DEMONSTRATION_EXPERTS: ExpertProfile[] = [
  {
    id: "exp-sharma-rari",
    fullName: "Dr. Arvind Sharma",
    designation: "Senior Plant Pathologist",
    institution: "ICAR - Rajasthan Agricultural Research Institute (RARI), Durgapura",
    specializations: [
      "Crop Pathology",
      "Fungal Blights (Early & Late)",
      "Bacterial Wilt",
      "Solanaceous Crops (Tomato, Potato, Chili)",
    ],
    languages: ["Hindi", "English", "Rajasthani"],
    state: "Rajasthan",
    district: "Jaipur",
    experienceYears: 18,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    isVerified: true,
    rating: 4.9,
    totalCasesSolved: 482,
    availability: "Available Today",
    bio: "Specializing in leaf spot diagnosis, systemic fungicide resistance management, and IPM strategies across semi-arid cropping systems in Rajasthan and Northern India.",
    phoneContact: "+91-141-255-0211",
    isDemonstrationRecord: true,
  },
  {
    id: "exp-sundaram-kvk",
    fullName: "Dr. Meenakshi Sundaram",
    designation: "Principal Agronomist & Soil Chemist",
    institution: "Krishi Vigyan Kendra (KVK) Chomu, ICAR Ext.",
    specializations: [
      "Soil Fertility & Micro-nutrients",
      "Fertigation Scheduling",
      "Crop Growth Disorders",
      "Wheat & Mustard Management",
    ],
    languages: ["Hindi", "English", "Punjabi"],
    state: "Rajasthan",
    district: "Jaipur",
    experienceYears: 14,
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
    isVerified: true,
    rating: 4.8,
    totalCasesSolved: 395,
    availability: "Available Today",
    bio: "Focuses on saline-alkali soil amendments, zinc & boron deficiency remediation, and cost-effective organic-inorganic nutrient balancing for smallholders.",
    phoneContact: "+91-1423-221-140",
    isDemonstrationRecord: true,
  },
  {
    id: "exp-singh-cazri",
    fullName: "Er. Rajeshwar Singh",
    designation: "Senior Agricultural Engineer & Water Specialist",
    institution: "ICAR - Central Arid Zone Research Institute (CAZRI), Jodhpur",
    specializations: [
      "Drip & Micro-Irrigation",
      "Moisture Stress Mitigation",
      "Evapotranspiration Scheduling",
      "Protected Cultivation",
    ],
    languages: ["Hindi", "English", "Rajasthani"],
    state: "Rajasthan",
    district: "Jodhpur",
    experienceYears: 16,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    isVerified: true,
    rating: 4.9,
    totalCasesSolved: 310,
    availability: "Available Tomorrow",
    bio: "Expertise in hyper-local drip pressure management, water deficit indexing, and solar pump irrigation scheduling under extreme high-temperature arid stress.",
    phoneContact: "+91-291-278-6584",
    isDemonstrationRecord: true,
  },
  {
    id: "exp-dhillon-pau",
    fullName: "Dr. Gurpreet Singh Dhillon",
    designation: "Senior Entomologist & Extension Specialist",
    institution: "Punjab Agricultural University (PAU) / Extension Service",
    specializations: [
      "Integrated Pest Management (IPM)",
      "Sucking Pests (Whitefly, Thrips)",
      "Biological Bio-control Agents",
      "Cotton & Grain Cereals",
    ],
    languages: ["Punjabi", "Hindi", "English"],
    state: "Punjab",
    district: "Ludhiana",
    experienceYears: 15,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    isVerified: true,
    rating: 4.7,
    totalCasesSolved: 540,
    availability: "Available Today",
    bio: "Authority on ETL-based chemical threshold sprays, yellow sticky trap deployment, and parasitoid bio-agent conservation in field crops.",
    phoneContact: "+91-161-240-1960",
    isDemonstrationRecord: true,
  },
  {
    id: "exp-deshmukh-nrc",
    fullName: "Dr. Sunita Deshmukh",
    designation: "Horticultural Advisor & Crop Specialist",
    institution: "ICAR - National Research Centre on Pomegranate & Arid Crops",
    specializations: [
      "Fruit & Vegetable Pathology",
      "Canopy Pruning & Flowering Induction",
      "Onion & Garlic Storage Rot",
      "Organic Bio-stimulants",
    ],
    languages: ["Marathi", "Hindi", "English"],
    state: "Maharashtra",
    district: "Solapur",
    experienceYears: 12,
    avatarUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80",
    isVerified: true,
    rating: 4.9,
    totalCasesSolved: 275,
    availability: "Available Today",
    bio: "Provides precision advisory on post-harvest decay prevention, pre-monsoon blossom blight spraying, and micro-nutrient foliar sprays in horticultural tracts.",
    phoneContact: "+91-217-235-4330",
    isDemonstrationRecord: true,
  },
];

/**
 * Standard expert advice templates for demonstration reviews
 */
export const SAMPLE_EXPERT_ADVISORIES = [
  {
    cropName: "Tomato",
    condition: "Early Blight (Alternaria solani)",
    stance: "MODIFIES" as const,
    advice:
      "I have reviewed the leaf photographs and the original AI diagnosis. The diagnosis of Early Blight (Alternaria solani) is correct, but because daytime temperatures are exceeding 33°C in Jaipur, standard copper oxychloride sprays can cause chemical leaf burn (phytotoxicity). Instead, switch to Azoxystrobin 18.2% + Difenoconazole 11.4% SC or Mancozeb 75% WP early in the morning.",
    actionSteps: [
      "Immediately prune bottom infected leaves showing concentric 'bullseye' target rings and burn or bury away from field.",
      "Spray Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/Litre of water early morning (before 9:00 AM).",
      "Avoid overhead sprinkler irrigation; convert to drip or ground-level furrow to keep canopy foliage dry.",
      "Maintain a 7-day pre-harvest waiting interval (PHI) before picking tomatoes for mandi delivery.",
    ],
    precautions: [
      "Wear eye goggles and rubber gloves during chemical dilution.",
      "Do not mix fungicide with systemic insecticides in the same sprayer tank without jar testing.",
      "Spray on abaxial (underside) of leaves where fungal spores proliferate.",
    ],
    followUpNote:
      "Inspect new shoot growth 4 days after first spray. If lesions are brown and dry, fungal mycelium has arrested.",
  },
  {
    cropName: "Potato",
    condition: "Late Blight (Phytophthora infestans)",
    stance: "AGREES" as const,
    advice:
      "I fully agree with the AI recommendation. The purplish-black water-soaked margins with white downy growth underneath in current humid weather confirm Late Blight. Immediate community-level prophylactic spraying is essential to prevent rapid tuber rot.",
    actionSteps: [
      "Spray Cymoxanil 8% + Mancozeb 64% WP (Curzate) @ 2.5 g/Litre or Metalaxyl 8% + Mancozeb 64% WP.",
      "Create raised earthen ridges to prevent resting spores from washing down to potato tubers.",
      "Stop irrigation for the next 48 hours to break the free moisture cycle on leaf blades.",
    ],
    precautions: [
      "Ensure complete leaf coverage including middle and bottom foliage.",
      "Do not compost infected haulms near irrigation channels.",
    ],
    followUpNote:
      "Repeat spray after 6-7 days with a contact fungicide (Chlorothalonil) to prevent pathogen resistance.",
  },
  {
    cropName: "General",
    condition: "Nutrient Stress & Leaf Yellowing",
    stance: "MODIFIES" as const,
    advice:
      "The yellowing pattern described shows chlorosis between veins rather than a fungal pathogen. The root cause is mild iron/zinc deficiency aggravated by high soil pH and moisture stress.",
    actionSteps: [
      "Apply foliar spray of Chelated Zinc (Zn-EDTA 12%) @ 1.5 g/Litre plus Ferrous Sulphate @ 3 g/Litre.",
      "Add 1 kg of urea per 100 Litres of spray solution as a surfactant to enhance leaf cuticle absorption.",
      "Test soil electrical conductivity (EC) before next fertilizer application.",
    ],
    precautions: [
      "Do not apply foliar micronutrients during peak afternoon heat.",
      "Ensure sprayer tank is washed clean of any residual herbicides.",
    ],
    followUpNote:
      "Foliar greening should resume within 5 to 7 days on the youngest expanding leaves.",
  },
];
