import { NavbarSkeleton } from "@/components/skeletons/NavbarSkeleton";
import { SectionCardSkeleton } from "@/components/skeletons/SectionCardSkeleton";
import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";

const CARD_COUNT = 4;

export function HomePageSkeleton() {
  return (
    <div className="min-h-screen font-sans">
      <NavbarSkeleton />
      <main className="mx-auto max-w-7xl p-4">
        <div className="flex flex-nowrap gap-4 overflow-x-auto pb-2">
          {Array.from({ length: CARD_COUNT }, (_, i) => (
            <SectionCardSkeleton key={i} />
          ))}
        </div>
      </main>
      <div className="fixed bottom-6 right-6 z-20 sm:bottom-8 sm:right-8" aria-hidden>
        <SkeletonBlock className="h-14 w-14 rounded-full shadow-lg" />
      </div>
    </div>
  );
}
