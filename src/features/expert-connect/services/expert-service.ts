import {
  ConsultationCase,
  ConsultationDraftInput,
  ConsultationStatus,
  ExpertProfile,
  ExpertResponsePayload,
  FarmerFeedbackPayload,
} from "../types";
import { DEMONSTRATION_EXPERTS, SAMPLE_EXPERT_ADVISORIES } from "../data/demonstration-experts";

// In-memory persistent store for development & offline environments
const activeConsultationCases: Map<string, ConsultationCase> = new Map();

// Seed initial realistic demonstration case so the case list has sample data out of the box
const initialCase: ConsultationCase = {
  id: "EXP-2026-1042",
  userId: "google-10982348234",
  farmerName: "Ramesh Kumar",
  farmerPhone: "+91 98290 12345",
  farmerLocation: "Jaipur, Rajasthan",
  preferredLanguage: "hi",
  cropName: "Tomato",
  growthStage: "Flowering & Fruit Development",
  consultationReason: "Verify my AI recommendation",
  symptomsDescription:
    "Noticed small dark brown spots with yellow halos on lower leaves after recent evening dew. AI identified Early Blight (88% confidence) and suggested chemical fungicide, but I want a second opinion on spray safety during fruit set.",
  symptomDuration: "3-4 days",
  imageUrls: [
    "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=600&q=80",
  ],
  aiSnapshot: {
    source: "crop-disease",
    recommendation:
      "Apply protective copper-based sprays immediately (Mancozeb 75% WP @ 2g/L). Remove lower infected leaves and avoid overhead wetting.",
    reasoning: "Early Blight (Alternaria solani) pathogen symptom patterns with concentric ring target lesions.",
    confidence: 88,
    model: "ResNet50-DCBAM Plant Pathology Classifier",
    diseaseName: "Early Blight",
    scientificName: "Alternaria solani",
  },
  farmContext: {
    location: "Plot 2 - Jaipur North, Rajasthan",
    weatherTemp: 29,
    weatherCondition: "Partly Cloudy",
    humidity: 62,
    rainForecast: "No rain expected for next 4 days",
    soilType: "Sandy Loam",
    irrigationStatus: "Drip irrigated 2 days ago",
    acreage: 2.5,
  },
  consentSettings: {
    shareLocation: true,
    shareWeather: true,
    shareSoilAndFarmSize: true,
    farmerApproved: true,
    approvedAt: "2026-10-17T11:45:00.000Z",
  },
  expertId: "exp-sharma-rari",
  expertName: "Dr. Arvind Sharma",
  expert: DEMONSTRATION_EXPERTS[0],
  status: "RESPONDED",
  submittedAt: "2026-10-17T11:45:00.000Z",
  acceptedAt: "2026-10-17T13:20:00.000Z",
  respondedAt: "2026-10-17T15:10:00.000Z",
  expertResponse: {
    expertId: "exp-sharma-rari",
    expertName: "Dr. Arvind Sharma",
    expertDesignation: "Senior Plant Pathologist",
    expertInstitution: "ICAR - Rajasthan Agricultural Research Institute (RARI)",
    stance: "MODIFIES",
    advice:
      "I examined your tomato leaf images. The AI diagnosis of Early Blight (Alternaria solani) is verified correct. However, because your crop is currently in active flowering and early fruit set, avoid harsh copper oxychloride which can cause flower drop under high solar radiation. Use Azoxystrobin 18.2% + Difenoconazole 11.4% SC instead.",
    actionSteps: [
      "Prune the lower 3-4 affected leaves using clean shears; burn or bury them outside the plot boundary.",
      "Spray Azoxystrobin + Difenoconazole @ 1 ml per litre of clean water early morning (7:00 AM - 9:00 AM).",
      "Do not water plants with overhead sprinklers; maintain drip lines at soil surface.",
      "Observe 7-day waiting period (PHI) before harvesting ripe fruits.",
    ],
    precautions: [
      "Always wear gloves and mask during spray preparation.",
      "Check sprayer nozzle pressure to achieve uniform fine droplet mist.",
      "Do not spray if wind velocity exceeds 12 km/h.",
    ],
    followUpNote:
      "Check new growth tips in 4 days. Lesion centers should dry out and turn light grey without new margin expansion.",
    respondedAt: "2026-10-17T15:10:00.000Z",
  },
  feedback: {
    rating: 5,
    helpful: true,
    comment: "Very clear advice. Modifying the spray for flowering stage saved our tomato crop flowers!",
    submittedAt: "2026-10-17T18:00:00.000Z",
  },
};

activeConsultationCases.set(initialCase.id, initialCase);

/**
 * Expert relevance scoring algorithm based on crop, problem type, language, and location
 */
export function rankExpertsForCase(
  experts: ExpertProfile[],
  criteria: {
    cropName?: string;
    reason?: string;
    language?: string;
    problemKeywords?: string;
  }
): { expert: ExpertProfile; matchScore: number; matchReasons: string[] }[] {
  const cropLower = (criteria.cropName || "").toLowerCase();
  const reasonLower = (criteria.reason || "").toLowerCase();
  const langLower = (criteria.language || "en").toLowerCase();
  const kwLower = (criteria.problemKeywords || "").toLowerCase();

  return experts
    .map((expert) => {
      let score = 50; // base score
      const matchReasons: string[] = [];

      // Specialization match
      const specsJoined = expert.specializations.join(" ").toLowerCase();
      if (
        (cropLower.includes("tomato") || cropLower.includes("potato") || cropLower.includes("chili")) &&
        (specsJoined.includes("solanaceous") || specsJoined.includes("pathology") || specsJoined.includes("blight"))
      ) {
        score += 35;
        matchReasons.push("Specialist in Solanaceous vegetable pathologies");
      }

      if (
        (cropLower.includes("wheat") || cropLower.includes("mustard")) &&
        (specsJoined.includes("wheat") || specsJoined.includes("fertility") || specsJoined.includes("cereal"))
      ) {
        score += 30;
        matchReasons.push("Regional field crop & nutrition specialist");
      }

      if (reasonLower.includes("worse") || reasonLower.includes("disease") || kwLower.includes("blight") || kwLower.includes("rot")) {
        if (specsJoined.includes("pathology") || specsJoined.includes("disease")) {
          score += 25;
          matchReasons.push("Senior ICAR Plant Pathologist");
        }
      }

      if (kwLower.includes("water") || kwLower.includes("irrigation") || kwLower.includes("dry")) {
        if (specsJoined.includes("irrigation") || specsJoined.includes("water")) {
          score += 35;
          matchReasons.push("Arid zone irrigation & water management engineer");
        }
      }

      if (kwLower.includes("pest") || kwLower.includes("insect") || kwLower.includes("worm") || kwLower.includes("fly")) {
        if (specsJoined.includes("entomologist") || specsJoined.includes("pest")) {
          score += 35;
          matchReasons.push("Integrated Pest Management (IPM) specialist");
        }
      }

      // Language support
      const langsJoined = expert.languages.join(" ").toLowerCase();
      if (langLower === "hi" && langsJoined.includes("hindi")) {
        score += 15;
        matchReasons.push("Speaks fluent Hindi");
      } else if (langLower === "pa" && langsJoined.includes("punjabi")) {
        score += 20;
        matchReasons.push("Speaks fluent Punjabi");
      } else if (langLower === "mr" && langsJoined.includes("marathi")) {
        score += 20;
        matchReasons.push("Speaks fluent Marathi");
      }

      // High rating / verified
      if (expert.rating >= 4.8) {
        score += 10;
      }

      if (matchReasons.length === 0) {
        matchReasons.push("Verified ICAR agricultural extension specialist");
      }

      return { expert, matchScore: score, matchReasons };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Service API methods
 */
export const ExpertService = {
  getExperts(filter?: { specialization?: string; language?: string; query?: string }): ExpertProfile[] {
    let result = [...DEMONSTRATION_EXPERTS];

    if (filter?.specialization && filter.specialization !== "all") {
      const s = filter.specialization.toLowerCase();
      result = result.filter((e) =>
        e.specializations.some((spec) => spec.toLowerCase().includes(s))
      );
    }

    if (filter?.language && filter.language !== "all") {
      const l = filter.language.toLowerCase();
      result = result.filter((e) =>
        e.languages.some((lang) => lang.toLowerCase().includes(l))
      );
    }

    if (filter?.query) {
      const q = filter.query.toLowerCase();
      result = result.filter(
        (e) =>
          e.fullName.toLowerCase().includes(q) ||
          e.designation.toLowerCase().includes(q) ||
          e.institution.toLowerCase().includes(q) ||
          e.specializations.some((spec) => spec.toLowerCase().includes(q))
      );
    }

    return result;
  },

  getExpertById(id: string): ExpertProfile | undefined {
    return DEMONSTRATION_EXPERTS.find((e) => e.id === id);
  },

  getAllCases(userId?: string, expertId?: string): ConsultationCase[] {
    const all = Array.from(activeConsultationCases.values());
    let filtered = all;

    if (expertId) {
      filtered = filtered.filter((c) => c.expertId === expertId);
    } else if (userId && !userId.startsWith("google-")) {
      filtered = filtered.filter((c) => c.userId === userId || !c.userId);
    }

    // Sort by latest submitted
    return filtered.sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
  },

  getCaseById(id: string): ConsultationCase | undefined {
    return activeConsultationCases.get(id);
  },

  createCase(input: {
    userId?: string;
    farmerName: string;
    farmerPhone?: string;
    farmerLocation: string;
    preferredLanguage: string;
    cropName: string;
    growthStage?: string;
    consultationReason: string;
    symptomsDescription: string;
    symptomDuration?: string;
    imageUrls: string[];
    aiSnapshot?: ConsultationCase["aiSnapshot"];
    farmContext?: Partial<ConsultationCase["farmContext"]>;
    consentSettings: ConsultationCase["consentSettings"];
    expertId: string;
  }): ConsultationCase {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const caseId = `EXP-2026-${randomSuffix}`;

    const expert = DEMONSTRATION_EXPERTS.find((e) => e.id === input.expertId) || DEMONSTRATION_EXPERTS[0];

    const newCase: ConsultationCase = {
      id: caseId,
      userId: input.userId,
      farmerName: input.farmerName || "Ramesh Kumar",
      farmerPhone: input.farmerPhone || "+91 98290 12345",
      farmerLocation: input.farmerLocation || "Jaipur, Rajasthan",
      preferredLanguage: input.preferredLanguage || "en",
      cropName: input.cropName,
      growthStage: input.growthStage || "Vegetative Stage",
      consultationReason: input.consultationReason,
      symptomsDescription: input.symptomsDescription,
      symptomDuration: input.symptomDuration || "Recent (2-3 days)",
      imageUrls: input.imageUrls || [],
      aiSnapshot: input.aiSnapshot,
      farmContext: {
        location: input.farmerLocation || "Jaipur, Rajasthan",
        weatherTemp: input.farmContext?.weatherTemp ?? 31,
        weatherCondition: input.farmContext?.weatherCondition ?? "Partly Sunny",
        humidity: input.farmContext?.humidity ?? 58,
        rainForecast: input.farmContext?.rainForecast ?? "Dry spell for 3 days",
        soilType: input.farmContext?.soilType ?? "Sandy Loam",
        irrigationStatus: input.farmContext?.irrigationStatus ?? "Adequate",
        acreage: input.farmContext?.acreage ?? 2.5,
      },
      consentSettings: input.consentSettings,
      expertId: expert.id,
      expertName: expert.fullName,
      expert,
      status: "PENDING",
      submittedAt: new Date().toISOString(),
    };

    activeConsultationCases.set(caseId, newCase);
    return newCase;
  },

  updateCaseStatus(
    caseId: string,
    status: ConsultationStatus,
    extra?: Partial<ConsultationCase>
  ): ConsultationCase | null {
    const existing = activeConsultationCases.get(caseId);
    if (!existing) return null;

    const updated: ConsultationCase = {
      ...existing,
      ...extra,
      status,
      ...(status === "ACCEPTED" ? { acceptedAt: new Date().toISOString() } : {}),
      ...(status === "RESOLVED" ? { resolvedAt: new Date().toISOString() } : {}),
    };

    activeConsultationCases.set(caseId, updated);
    return updated;
  },

  submitExpertResponse(
    caseId: string,
    response: ExpertResponsePayload
  ): ConsultationCase | null {
    const existing = activeConsultationCases.get(caseId);
    if (!existing) return null;

    const updated: ConsultationCase = {
      ...existing,
      expertResponse: response,
      status: "RESPONDED",
      respondedAt: response.respondedAt || new Date().toISOString(),
    };

    activeConsultationCases.set(caseId, updated);
    return updated;
  },

  submitFarmerFeedback(
    caseId: string,
    feedback: FarmerFeedbackPayload
  ): ConsultationCase | null {
    const existing = activeConsultationCases.get(caseId);
    if (!existing) return null;

    const updated: ConsultationCase = {
      ...existing,
      feedback,
      status: "RESOLVED",
      resolvedAt: new Date().toISOString(),
    };

    activeConsultationCases.set(caseId, updated);
    return updated;
  },
};
