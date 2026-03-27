import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";

export function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-background/95 px-4 py-3 backdrop-blur dark:border-stone-700">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div className="min-w-0 max-w-md flex-1">
          <SkeletonBlock className="h-10 w-full max-w-md rounded-xl" />
        </div>
        <SkeletonBlock className="h-10 w-10 shrink-0 rounded-xl" />
      </div>
    </header>
  );
}
