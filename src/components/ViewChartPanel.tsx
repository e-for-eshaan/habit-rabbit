"use client";

import type { ReactNode } from "react";

import { getPastelAccentVar } from "@/constants/colors";
import { cn } from "@/lib/utils";

type ViewChartPanelProps = {
  title: string;
  colorKey: number;
  children: ReactNode;
  className?: string;
};

export function ViewChartPanel({ title, colorKey, children, className }: ViewChartPanelProps) {
  const accent = getPastelAccentVar(colorKey);
  return (
    <div
      className={cn(
        "rounded-2xl border border-border-subtle bg-surface p-card shadow-sm",
        className
      )}
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      <h2 className="mb-inline truncate text-title font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      {children}
    </div>
  );
}
