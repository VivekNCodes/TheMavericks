export type ConsultationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "RESPONDED"
  | "RESOLVED"
  | "DECLINED"
  | "CANCELLED";

export type ExpertStance = "AGREES" | "MODIFIES" | "DISAGREES";

export interface ExpertProfile {
  id: string;
  fullName: string;
  designation: string;
  institution: string;
  specializations: string[];
  languages: string[];
  state: string;
  district: string;
  experienceYears: number;
  avatarUrl?: string;
  isVerified: boolean;
  rating: number;
  totalCasesSolved: number;
  availability: string;
  bio: string;
  phoneContact?: string;
  isDemonstrationRecord: boolean;
}

export interface AISnapshot {
  source: "assistant" | "crop-disease" | "none" | "custom";
  recommendation: string;
  reasoning?: string;
  confidence?: number; // e.g. 88 for 88%
  model?: string;
  diseaseName?: string;
  scientificName?: string;
  sampleImageUrl?: string;
}

export interface FarmContextSnapshot {
  location: string;
  weatherTemp?: number;
  weatherCondition?: string;
  humidity?: number;
  rainForecast?: string;
  soilType?: string;
  irrigationStatus?: string;
  acreage?: number;
}

export interface FarmerConsentSettings {
  shareLocation: boolean;
  shareWeather: boolean;
  shareSoilAndFarmSize: boolean;
  farmerApproved: boolean;
  approvedAt?: string;
}

export interface ExpertResponsePayload {
  expertId: string;
  expertName: string;
  expertDesignation: string;
  expertInstitution: string;
  stance: ExpertStance;
  advice: string;
  actionSteps: string[];
  precautions: string[];
  followUpNote?: string;
  respondedAt: string;
}

export interface FarmerFeedbackPayload {
  rating: number; // 1-5
  helpful: boolean;
  comment?: string;
  submittedAt: string;
}

export interface ConsultationCase {
  id: string; // EXP-2026-XXXX
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

  aiSnapshot?: AISnapshot;
  farmContext: FarmContextSnapshot;
  consentSettings: FarmerConsentSettings;

  expertId: string;
  expertName?: string;
  expert?: ExpertProfile;

  status: ConsultationStatus;
  submittedAt: string;
  acceptedAt?: string;
  respondedAt?: string;
  resolvedAt?: string;

  expertResponse?: ExpertResponsePayload;
  feedback?: FarmerFeedbackPayload;
}

export interface ConsultationDraftInput {
  cropName: string;
  growthStage?: string;
  consultationReason: string;
  symptomsDescription: string;
  symptomDuration?: string;
  imageUrls: string[];
  aiSnapshot?: AISnapshot;
  farmContext?: Partial<FarmContextSnapshot>;
  expertId?: string;
}
