"use client";

import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
  error?: Error;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "An error occurred while loading this section. Please try again or check your connection.",
  onRetry,
  className,
  error,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-red-200/80 bg-red-50/40",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mb-3.5 shadow-sm">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-bold text-red-950">{title}</h3>
      <p className="text-xs text-red-700/80 max-w-sm mt-1 mb-4 leading-relaxed">
        {message}
      </p>
      {error && process.env.NODE_ENV === "development" && (
        <pre className="text-[11px] text-left p-3 bg-red-100/70 border border-red-200 rounded-lg max-w-md overflow-x-auto text-red-900 mb-4 font-mono">
          {error.message}
        </pre>
      )}
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
