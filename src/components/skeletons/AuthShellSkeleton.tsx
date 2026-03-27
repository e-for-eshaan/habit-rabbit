import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";

export function AuthShellSkeleton() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-section px-page py-section">
      <SkeletonBlock className="h-12 w-12 rounded-2xl" />
      <div className="flex w-full max-w-xs flex-col gap-inline">
        <SkeletonBlock className="h-4 w-[75%] self-center" />
        <SkeletonBlock className="h-10 w-full rounded-lg" />
        <SkeletonBlock className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}
