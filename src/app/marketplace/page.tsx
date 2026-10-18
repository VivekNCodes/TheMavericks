import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { MarketplaceContainer } from "@/features/marketplace/components/MarketplaceContainer";

export const metadata: Metadata = {
  title: "Farmer Marketplace | AgroSaathi",
  description:
    "Direct farmer-to-buyer agri-commerce gateway for farmers to list produce with zero middlemen and transparent Mandi price benchmarking.",
};

export default function MarketplacePage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title="Farmer Marketplace"
        description="Direct agri-commerce gateway for farmers to list produce directly for wholesale and retail buyers with zero commission and APMC Mandi benchmark comparisons."
        breadcrumbs={[
          { label: "Dashboard", href: "/" },
          { label: "Farmer Marketplace" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="live" size="sm">
              <ShieldCheck className="h-3 w-3" />
              Direct Trade Active
            </Badge>
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
              >
                Back to Dashboard
              </Button>
            </Link>
          </div>
        }
      />

      {/* Main Interactive Marketplace Hub */}
      <MarketplaceContainer />
    </div>
  );
}
