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
