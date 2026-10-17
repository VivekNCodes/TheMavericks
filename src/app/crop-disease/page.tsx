import React from "react";
import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { CropDiseasePreview } from "@/features/crop-disease/components/CropDiseasePreview";
import { moduleRegistry } from "@/config/modules";

export const metadata: Metadata = {
  title: "Crop Disease Detection",
  description:
    "AI-powered foliar disease diagnosis, pathogen classification, and targeted agronomic remedies for Indian farmers.",
};

export default function CropDiseasePage() {
  const moduleMeta = moduleRegistry["crop-disease"];

  return (
    <ModulePlaceholder module={moduleMeta}>
      <CropDiseasePreview />
    </ModulePlaceholder>
  );
}
