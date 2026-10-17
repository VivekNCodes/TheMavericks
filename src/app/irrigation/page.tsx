import React from "react";
import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { IrrigationPreview } from "@/features/irrigation/components/IrrigationPreview";
import { moduleRegistry } from "@/config/modules";

export const metadata: Metadata = {
  title: "Smart Irrigation Advisor",
  description:
    "Crop-specific, phenological water scheduling integrated with 5-day hyper-local weather forecast.",
};

export default function IrrigationPage() {
  const moduleMeta = moduleRegistry["irrigation"];

  return (
    <ModulePlaceholder module={moduleMeta}>
      <IrrigationPreview />
    </ModulePlaceholder>
  );
}
