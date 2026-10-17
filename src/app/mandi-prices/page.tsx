import React from "react";
import type { Metadata } from "next";
import { ModulePlaceholder } from "@/components/shared/ModulePlaceholder";
import { MandiPricesPreview } from "@/features/mandi-prices/components/MandiPricesPreview";
import { moduleRegistry } from "@/config/modules";

export const metadata: Metadata = {
  title: "Mandi Price Intelligence",
  description:
    "Multi-market price discovery, historical modal trends, and arrival volumes across regional APMC mandis.",
};

export default function MandiPricesPage() {
  const moduleMeta = moduleRegistry["mandi-prices"];

  return (
    <ModulePlaceholder module={moduleMeta}>
      <MandiPricesPreview />
    </ModulePlaceholder>
  );
}
