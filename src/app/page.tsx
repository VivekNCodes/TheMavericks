import React from "react";
import { WelcomeSection } from "@/components/dashboard/WelcomeSection";
import { ModuleCard } from "@/components/dashboard/ModuleCard";
import { YourCropsSection } from "@/components/dashboard/YourCropsSection";
import { QuickInsightsSection } from "@/components/dashboard/QuickInsightsSection";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { AdvisoriesSection } from "@/components/dashboard/AdvisoriesSection";
import { CommunitySection } from "@/components/dashboard/CommunitySection";
import { SAMPLE_MODULE_CARDS } from "@/constants/sample-data";

export default function DashboardPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Quick Action Shortcuts Strip */}
      <QuickActions />

      {/* Hero Welcome Section */}
      <WelcomeSection />

      {/* 4 Core Action / Module Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {SAMPLE_MODULE_CARDS.map((card) => (
          <ModuleCard key={card.id} card={card} />
        ))}
      </div>

      {/* 2-Column Grid: Your Crops + Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7-8 cols): Your Crops */}
        <div className="lg:col-span-7 xl:col-span-8">
          <YourCropsSection />
        </div>

        {/* Right Column (4-5 cols): Quick Insights */}
        <div className="lg:col-span-5 xl:col-span-4">
          <QuickInsightsSection />
        </div>
      </div>

      {/* Agricultural Advisories & Alerts Section */}
      <AdvisoriesSection />

      {/* Farmer Community & Discussions Section */}
      <CommunitySection />
    </div>
  );
}
