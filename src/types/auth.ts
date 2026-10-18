import type { SupportedLanguage } from "@/i18n/translations";

export interface FarmerUser {
  id: string;
  googleId?: string;
  name: string;
  email: string;
  role: string;
  location: string;
  avatarUrl: string;
  isVerified: boolean;
  acres: number;
  preferredName?: string;
  preferredLanguage?: SupportedLanguage;
  state?: string;
  district?: string;
  village?: string;
  farmSize?: number;
  farmSizeUnit?: string;
  soilType?: string;
  irrigationMethod?: string;
  farmingExperience?: number;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface FarmerCropRecord {
  id: string;
  userId: string;
  cropName: string;
  variety?: string | null;
  acreage: number;
  growthStage: string;
  sowingDate?: string | null;
  expectedHarvestDate?: string | null;
  fieldLocation?: string | null;
  soilType?: string | null;
  irrigationType?: string | null;
  fertilizerNotes?: string | null;
  notes?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAgriculturalContext {
  farmerName: string;
  email: string;
  location: string;
  preferredLanguage: string;
  farmSize: number;
  farmSizeUnit: string;
  soilType?: string;
  irrigationMethod?: string;
  farmingExperience?: number;
  crops: Array<{
    cropName: string;
    variety?: string | null;
    acreage: number;
    growthStage: string;
    sowingDate?: string | null;
    expectedHarvestDate?: string | null;
    fieldLocation?: string | null;
    soilType?: string | null;
    irrigationType?: string | null;
  }>;
  recentDiseases: Array<{
    detectedDisease: string;
    scientificName?: string | null;
    severity: string;
    createdAt: string;
  }>;
}
