import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";

export function FitnessPageSkeleton() {
  return (
    <div className="min-h-screen font-sans">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 px-3 py-2 backdrop-blur dark:border-stone-700 dark:bg-stone-900/90 sm:px-4 sm:py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 sm:gap-4">
          <SkeletonBlock className="h-5 w-28 sm:h-6 sm:w-32" />
          <SkeletonBlock className="h-6 w-20 sm:h-7 sm:w-24" />
          <SkeletonBlock className="h-8 w-28 rounded-md sm:h-9 sm:w-36 sm:rounded-lg" />
        </div>
      </header>
      <main className="mx-auto max-w-5xl space-y-4 p-3 sm:space-y-6 sm:p-4 md:p-6">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <SkeletonBlock className="h-9 w-9 shrink-0 rounded-md sm:h-10 sm:w-10" />
          <SkeletonBlock className="h-10 min-w-[140px] flex-1 rounded-lg sm:min-w-[180px]" />
          <SkeletonBlock className="h-9 w-9 shrink-0 rounded-md sm:h-10 sm:w-10" />
        </div>
        <SkeletonBlock className="h-32 w-full rounded-xl sm:h-40" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <SkeletonBlock className="h-24 w-full rounded-lg" />
          <SkeletonBlock className="h-24 w-full rounded-lg" />
        </div>
        <SkeletonBlock className="h-56 w-full rounded-xl sm:h-64" />
      </main>
    </div>
  );
}
