import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";

export function LoginCardSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center px-page py-section">
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-xl shadow-black/30"
        aria-hidden
      >
        <div className="border-b border-border-subtle px-section py-card">
          <SkeletonBlock className="h-6 w-32" />
        </div>
        <div className="flex flex-col gap-stack p-section">
          <div className="space-y-tight">
            <SkeletonBlock className="h-4 w-16" />
            <SkeletonBlock className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-tight">
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="h-10 w-full rounded-xl" />
          </div>
          <SkeletonBlock className="h-touch w-full rounded-xl" />
          <SkeletonBlock className="h-touch w-full rounded-xl" />
          <SkeletonBlock className="mx-auto h-4 w-48" />
        </div>
      </div>
    </div>
  );
}
