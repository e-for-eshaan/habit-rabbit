import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";
import { cn } from "@/lib/utils";

type SectionCardSkeletonProps = {
  className?: string;
};

export function SectionCardSkeleton({ className }: SectionCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex min-w-[280px] max-w-[380px] shrink-0 flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm",
        className
      )}
      style={{ borderLeftWidth: 4, borderLeftColor: "var(--pastel-2)" }}
      aria-hidden
    >
      <SkeletonBlock className="h-12 w-full rounded-none" />
      <div className="flex flex-col gap-3 p-4">
        <SkeletonBlock className="h-3 w-[80%]" />
        <SkeletonBlock className="h-3 w-full" />
        <SkeletonBlock className="h-3 w-2/3" />
      </div>
    </div>
  );
}
