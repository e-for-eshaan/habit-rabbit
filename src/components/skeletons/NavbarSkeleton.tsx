import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";

export function NavbarSkeleton() {
  return (
    <header className="sticky top-0 z-10 border-b border-border-subtle bg-surface/90 px-page py-inline backdrop-blur-md sm:py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-tight sm:gap-inline">
        <div className="min-w-0 flex-1 md:max-w-md">
          <SkeletonBlock className="h-touch w-full rounded-xl" />
        </div>
        <SkeletonBlock className="size-touch shrink-0 rounded-xl" />
      </div>
    </header>
  );
}
