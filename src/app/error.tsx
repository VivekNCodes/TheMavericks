"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/ErrorState";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected client exceptions
    console.error("Dashboard caught error:", error);
  }, [error]);

  return (
    <div className="max-w-xl mx-auto py-12">
      <ErrorState
        title="Dashboard Error"
        message="An unexpected error occurred while rendering the dashboard. You can retry safely."
        error={error}
        onRetry={() => reset()}
      />
    </div>
  );
}
