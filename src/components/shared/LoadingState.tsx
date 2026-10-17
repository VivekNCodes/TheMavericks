import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LoadingStateProps {
  message?: string;
  className?: string;
  fullPage?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading agricultural intelligence...",
  className,
  fullPage = false,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        fullPage ? "min-h-[60vh]" : "min-h-[200px]",
        className
      )}
    >
      <div className="relative flex items-center justify-center mb-4">
        <div className="absolute h-14 w-14 rounded-full bg-krishi-100/60 animate-ping" />
        <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-krishi-50 border border-krishi-200 text-krishi-700 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-krishi-700" />
        </div>
      </div>
      <p className="text-sm font-semibold text-slate-700">{message}</p>
      <p className="text-xs text-slate-400 mt-1">Please wait a moment</p>
    </div>
  );
};
