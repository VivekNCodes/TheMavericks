import React from "react";
import type { Metadata } from "next";
import { CropPlannerContainer } from "@/features/crop-planner/components/CropPlannerContainer";

export const metadata: Metadata = {
  title: "Crop Growing Planner",
  description:
    "Scientific crop calendar, water budget, soil suitability, and tailored agronomic management for Indian farmers.",
};

export default function CropPlannerPage() {
  return (
    <div className="max-w-7xl mx-auto py-2">
      <CropPlannerContainer />
    </div>
  );
}
