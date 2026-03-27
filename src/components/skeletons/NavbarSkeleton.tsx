import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";

export function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-10 border-b border-border-subtle bg-surface/90 px-3 py-3 backdrop-blur-md sm:px-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 sm:gap-3">
        <div className="min-w-0 flex-1 md:max-w-md">
          <SkeletonBlock className="h-11 w-full rounded-xl" />
        </div>
        <SkeletonBlock className="size-11 shrink-0 rounded-xl" />
      </div>
    </header>
  );
}
