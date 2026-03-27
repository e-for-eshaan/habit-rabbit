import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";

export function FitnessPageSkeleton() {
  return (
    <div className="min-h-screen font-sans">
      <header className="sticky top-0 z-10 border-b border-border-subtle bg-surface/90 px-page py-2 backdrop-blur-md sm:py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-tight sm:gap-stack">
          <SkeletonBlock className="h-9 w-24 rounded-lg sm:w-28" />
          <SkeletonBlock className="h-7 w-20 sm:h-8 sm:w-24" />
          <SkeletonBlock className="h-9 w-24 rounded-lg sm:h-10 sm:w-28" />
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-stack px-page py-section sm:space-y-section">
        <div className="flex flex-wrap items-center gap-tight sm:gap-inline">
          <SkeletonBlock className="size-touch shrink-0 rounded-lg sm:size-10" />
          <SkeletonBlock className="h-touch min-w-[140px] flex-1 rounded-xl sm:min-w-[180px]" />
          <SkeletonBlock className="size-touch shrink-0 rounded-lg sm:size-10" />
        </div>
        <SkeletonBlock className="h-32 w-full rounded-2xl sm:h-40" />
        <div className="grid grid-cols-1 gap-inline sm:grid-cols-2 sm:gap-stack">
          <SkeletonBlock className="h-24 w-full rounded-xl" />
          <SkeletonBlock className="h-24 w-full rounded-xl" />
        </div>
        <SkeletonBlock className="h-56 w-full rounded-2xl sm:h-64" />
      </main>
    </div>
  );
}
