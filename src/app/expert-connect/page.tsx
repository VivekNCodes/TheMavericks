import React, { Suspense } from "react";
import type { Metadata } from "next";
import { ExpertConnectContainer } from "@/features/expert-connect/components/ExpertConnectContainer";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Expert Connect | Mavericks Agricultural Second Opinion",
  description:
    "Context-aware AI-to-human agricultural consultation platform. Connect with verified ICAR plant pathologists, KVK scientists, and water resource engineers for second opinions on crop health and AI recommendations.",
};

export default function ExpertConnectPage() {
  return (
    <div className="py-2">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <Loader2 className="h-8 w-8 text-krishi-700 animate-spin" />
            <p className="text-xs text-slate-500 font-medium">
              Loading Mavericks Expert Connect...
            </p>
          </div>
        }
      >
        <ExpertConnectContainer />
      </Suspense>
    </div>
  );
}
