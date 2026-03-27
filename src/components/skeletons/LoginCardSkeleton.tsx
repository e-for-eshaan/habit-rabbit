import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";

export function LoginCardSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-xl shadow-black/30"
        aria-hidden
      >
        <div className="border-b border-border-subtle px-6 py-4">
          <SkeletonBlock className="h-6 w-32" />
        </div>
        <div className="flex flex-col gap-4 p-6">
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-16" />
            <SkeletonBlock className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-10 w-full rounded-xl" />
          </div>
          <SkeletonBlock className="h-11 w-full rounded-xl" />
          <SkeletonBlock className="h-11 w-full rounded-xl" />
          <SkeletonBlock className="mx-auto h-4 w-48" />
        </div>
      </div>
    </div>
  );
}
