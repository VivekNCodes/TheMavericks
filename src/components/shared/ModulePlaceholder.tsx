"use client";

import React from "react";
import Link from "next/link";
import {
  Code2,
  GitBranch,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import type { ModuleMeta } from "@/config/modules";
import { useLanguage } from "@/context/LanguageContext";

export interface ModulePlaceholderProps {
  module: ModuleMeta;
  children?: React.ReactNode;
  showDevBanner?: boolean;
}

export const ModulePlaceholder: React.FC<ModulePlaceholderProps> = ({
  module,
  children,
  showDevBanner,
}) => {
  const { t } = useLanguage();

  const isMandi = module.id === "mandi-prices";
  const shouldShowDevBanner = showDevBanner !== undefined ? showDevBanner : !isMandi;
  const localizedTitle = isMandi ? (t("moduleTitle_mandiPrices") || module.title) : module.title;
  const localizedDesc = isMandi ? (t("moduleDesc_mandiPrices") || module.description) : module.description;
  const localizedLeadRole = isMandi ? (t("leadRole_mandiPrices") || module.leadRole) : module.leadRole;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <PageHeader
        title={localizedTitle}
        description={localizedDesc}
        breadcrumbs={[
          { label: t("navDashboard") || "Dashboard", href: "/" },
          { label: localizedTitle },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
              >
                {t("backToDashboard") || "Back to Dashboard"}
              </Button>
            </Link>
          </div>
        }
      />

      {/* Under Active Development Status Card - only shown if shouldShowDevBanner is true */}
      {shouldShowDevBanner && (
        <>
          <Card className="border-krishi-200/80 bg-gradient-to-r from-krishi-50/70 via-white to-emerald-50/30 overflow-hidden">
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="green" size="md">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {localizedLeadRole}
                    </Badge>
                    <Badge variant="neutral" size="sm">
                      <Code2 className="h-3 w-3" />
                      src/features/{module.id}/
                    </Badge>
                    <span className="text-xs font-semibold text-krishi-800 bg-white px-2.5 py-0.5 rounded-full border border-krishi-200">
                      {t("foundationReady") || "Foundation Ready"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {t("statusCardDesc") || "This route is provisioned as an autonomous module. The UI below reflects the master design specification with sample reference content for the assigned owner."}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-mono">
                    <GitBranch className="h-3.5 w-3.5 text-krishi-600" />
                    <span>feat/{module.id}-feature</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reference Design Preview Header */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-krishi-600" />
              <h2 className="text-base font-bold text-slate-800">
                {t("designRefImpl") || "Design Reference Implementation"}
              </h2>
              <span className="text-xs text-slate-400">
                {t("interactiveUiSpec") || "(Interactive UI Component Spec)"}
              </span>
            </div>
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-md">
              {t("sampleRefData") || "Sample Reference Data"}
            </span>
          </div>
        </>
      )}

      {/* Feature Component / Preview Shell */}
      <div className="relative">{children}</div>
    </div>
  );
};
