import { type ReactNode } from "react";

import { getPastelAccentVar } from "@/constants/colors";
import { cn } from "@/lib/utils";

type ChartCardProps = {
  title: string;
  pastelKey: number;
  children: React.ReactNode;
  className?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function ChartCard({
  title,
  pastelKey,
  children,
  className,
  leading,
  trailing,
}: ChartCardProps) {
  const accent = getPastelAccentVar(pastelKey);
  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border border-border-subtle bg-surface-elevated/30 px-card pb-0 pt-card sm:pt-5",
        className
      )}
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      <div className="mb-tight flex min-w-0 shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 sm:mb-inline">
        {leading}
        <h3 className="text-body-sm font-medium text-muted sm:text-body">{title}</h3>
        {trailing}
      </div>
      <div className="min-h-0 w-full min-w-0 flex-1">{children}</div>
    </div>
  );
}
