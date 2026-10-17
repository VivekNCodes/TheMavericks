export interface LeafSample {
  id: string;
  name: string;
  crop: string;
  disease: string;
  confidence: number;
  thumbnailEmoji: string;
  description: string;
}

export interface DiseaseDiagnosis {
  id: string;
  crop: string;
  diseaseName: string;
  scientificName: string;
  confidencePercent: number;
  severity: "low" | "moderate" | "high";
  aboutText: string;
  recommendedActions: string[];
  disclaimer: string;
}

export interface PredictionCandidate {
  rank: number;
  classIndex: number;
  classLabel: string;
  crop: string;
  condition: string;
  isHealthy: boolean;
  confidence: number;
}

export interface ModelDiagnosisResult {
  id: string;
  source: "model" | "preset";
  crop: string;
  condition: string;
  classLabel: string;
  scientificName?: string;
  isHealthy: boolean;
  confidence: number;
  severity: "healthy" | "low" | "moderate" | "high";
  summary: string;
  recommendedActions: string[];
  topPredictions: PredictionCandidate[];
  device?: string;
  timestamp: string;
  disclaimer: string;
  imagePreviewUrl?: string;
}

export interface DiagnosisApiResponse {
  success: boolean;
  data?: ModelDiagnosisResult;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}
