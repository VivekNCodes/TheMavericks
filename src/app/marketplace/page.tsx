import React from "react";
import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { MarketplacePreview } from "@/features/marketplace/components/MarketplacePreview";
import { moduleRegistry } from "@/config/modules";

export const metadata: Metadata = {
  title: "Farmer Marketplace",
  description:
    "Direct agri-commerce gateway for farmers to list produce directly for wholesale and retail buyers.",
};

export default function MarketplacePage() {
  const moduleMeta = moduleRegistry["marketplace"];

  return (
    <ModulePlaceholder module={moduleMeta}>
      <MarketplacePreview />
    </ModulePlaceholder>
  );
}
