import { cn } from "@/lib/utils";

type SkeletonBlockProps = {
  className?: string;
};

export function SkeletonBlock({ className }: SkeletonBlockProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-stone-200/70 dark:bg-stone-700/50", className)}
      aria-hidden
    />
  );
}
