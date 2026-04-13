import { getPastelAccentVar } from "@/constants/colors";
import type { MissedExerciseItem } from "@/types/fitnessDashboard";

type MissedExercisesCardProps = {
  items: MissedExerciseItem[];
  pastelKey: number;
};

export function MissedExercisesCard({ items, pastelKey }: MissedExercisesCardProps) {
  const accent = getPastelAccentVar(pastelKey);
  return (
    <div
      className="min-w-0 rounded-xl border border-border-subtle bg-surface-elevated/30 p-card"
      style={{ borderLeftWidth: 3, borderLeftColor: accent }}
    >
      <h3 className="mb-tight text-body-sm font-medium text-muted sm:mb-inline sm:text-body">
        Haven’t done in 14+ days
      </h3>
      <div className="flex flex-wrap gap-px sm:gap-tight md:gap-inline">
        {items.map((item) => (
          <span
            key={item.id}
            className="inline-flex max-w-full items-center rounded-md border border-border-subtle bg-surface px-2 py-1 text-caption font-medium text-foreground sm:max-w-none sm:text-body-sm"
            title={`${item.label} (${item.group}) · ${item.daysSinceLastDone} days ago`}
          >
            <span className="max-w-[80px] truncate sm:max-w-[120px] md:max-w-[160px]">
              {item.label}
            </span>
            <span className="ml-1 shrink-0 text-muted-fg">{item.daysSinceLastDone}d</span>
          </span>
        ))}
      </div>
    </div>
  );
}
