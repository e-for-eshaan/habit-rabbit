import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";
import { cn } from "@/lib/utils";

type SectionCardSkeletonProps = {
  className?: string;
};

export function SectionCardSkeleton({ className }: SectionCardSkeletonProps) {
  return (
    <div
      className={cn(
        "flex min-w-[280px] max-w-[380px] shrink-0 flex-col overflow-hidden rounded-xl border-2 border-stone-200/80 bg-stone-100/50 shadow-sm dark:border-stone-600/80 dark:bg-stone-800/40",
        className
      )}
      aria-hidden
    >
      <SkeletonBlock className="h-14 w-full rounded-none rounded-t-[10px]" />
      <div className="flex flex-col gap-3 p-4">
        <SkeletonBlock className="h-4 w-[80%]" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-2/3" />
      </div>
    </div>
  );
}
