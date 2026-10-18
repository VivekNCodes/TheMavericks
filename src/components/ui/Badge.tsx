import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "green"
    | "amber"
    | "blue"
    | "red"
    | "neutral"
    | "live"
    | "success"
    | "warning"
    | "info"
    | "danger"
    | "outline";
  size?: "sm" | "md";
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "green",
  size = "md",
  dot = false,
  children,
  ...props
}) => {
  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium rounded-full",
    md: "px-2.5 py-1 text-xs font-semibold rounded-full",
  };

  const variantStyles = {
    green: "bg-krishi-100 text-krishi-800 border border-krishi-200",
    amber: "bg-amber-100 text-amber-800 border border-amber-200",
    blue: "bg-sky-100 text-sky-800 border border-sky-200",
    red: "bg-red-100 text-red-800 border border-red-200",
    neutral: "bg-slate-100 text-slate-700 border border-slate-200",
    live: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border border-amber-200",
    info: "bg-sky-50 text-sky-800 border border-sky-200",
    danger: "bg-red-50 text-red-700 border border-red-200",
    outline: "bg-transparent text-slate-700 border border-slate-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 transition-colors",
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {(dot || variant === "live") && (
        <span className="relative flex h-2 w-2">
          {variant === "live" && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              variant === "live" || variant === "green" || variant === "success"
                ? "bg-emerald-500"
                : variant === "amber" || variant === "warning"
                ? "bg-amber-500"
                : variant === "blue" || variant === "info"
                ? "bg-sky-500"
                : variant === "red" || variant === "danger"
                ? "bg-red-500"
                : "bg-slate-500"
            )}
          />
        </span>
      )}
      <span>{children}</span>
    </span>
  );
};
