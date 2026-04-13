import { getPastelAccentVar } from "@/constants/colors";

type KPICardProps = {
  label: string;
  value: string;
  sub?: string;
  pastelKey: number;
};

export function KPICard({ label, value, sub, pastelKey }: KPICardProps) {
  const accent = getPastelAccentVar(pastelKey);
  return (
    <div
      className="rounded-xl border border-border-subtle bg-surface-elevated/30 p-card"
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      <p className="text-caption font-medium uppercase tracking-wide text-muted-fg sm:text-body-sm">
        {label}
      </p>
      <p className="mt-0.5 text-body-sm font-semibold text-foreground sm:text-body md:text-title">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-caption text-muted sm:text-body-sm">{sub}</p>}
    </div>
  );
}
