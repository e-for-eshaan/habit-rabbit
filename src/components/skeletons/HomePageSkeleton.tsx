import { NavbarSkeleton } from "@/components/skeletons/NavbarSkeleton";
import { SectionCardSkeleton } from "@/components/skeletons/SectionCardSkeleton";
import { SkeletonBlock } from "@/components/skeletons/SkeletonBlock";

const CARD_COUNT = 4;

export function HomePageSkeleton() {
  return (
    <div className="min-h-screen font-sans">
      <NavbarSkeleton />
      <main className="mx-auto max-w-7xl px-page py-section">
        <div className="flex flex-nowrap gap-stack overflow-x-auto pb-2">
          {Array.from({ length: CARD_COUNT }, (_, i) => (
            <SectionCardSkeleton key={i} />
          ))}
        </div>
      </main>
      <div className="fixed bottom-fab right-fab z-20" aria-hidden>
        <SkeletonBlock className="h-14 w-14 rounded-full shadow-lg" />
      </div>
    </div>
  );
}
