import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { formatNfElapsedFromStart, nfElapsedSecondsFromStart } from "@/lib/nfElapsed";
import {
  formatNfTimeRemainingToMilestone,
  getMilestonesCrossedInInterval,
  getNextNfMilestone,
  pickRandomNfMilestoneMessage,
} from "@/lib/nfMilestones";

export type NfMilestoneStatus =
  | { kind: "idle" }
  | { kind: "next"; timeToGo: string; milestoneName: string }
  | { kind: "all" };

export type NfMilestoneModalPayload = {
  key: string;
  label: string;
  totalSeconds: number;
  message: string;
};

type MilestoneCongratsOpts = {
  congratsShownKeys: string[] | undefined;
  onRecordCongrat: (milestoneKey: string) => void;
};

function mergeShown(fromProps: string[] | undefined, optimistic: ReadonlySet<string>): Set<string> {
  return new Set([...(fromProps ?? []), ...optimistic]);
}

export function useNfStreakMilestoneState(
  startedAtIso: string | undefined,
  personalBestSeconds: number,
  congrats: MilestoneCongratsOpts | null
) {
  const [now, setNow] = useState(() => Date.now());
  const [backlog, setBacklog] = useState<{ key: string; label: string; totalSeconds: number }[]>(
    []
  );
  const [activeModal, setActiveModal] = useState<NfMilestoneModalPayload | null>(null);
  const optimRef = useRef<Set<string>>(new Set());
  const prevMRef = useRef<number | null>(null);
  const mReadyRef = useRef(false);
  const shownFromPropsRef = useRef(congrats?.congratsShownKeys);
  const onRecordRef = useRef(congrats?.onRecordCongrat);
  const congratsRef = useRef(congrats);

  useLayoutEffect(() => {
    shownFromPropsRef.current = congrats?.congratsShownKeys;
    onRecordRef.current = congrats?.onRecordCongrat;
    congratsRef.current = congrats;
  });

  const appendToBacklog = useCallback(
    (crossed: { key: string; label: string; totalSeconds: number }[]) => {
      if (crossed.length === 0) return;
      setBacklog((b) => {
        const have = new Set(b.map((x) => x.key));
        const merged = [...b];
        const shown = mergeShown(shownFromPropsRef.current, optimRef.current);
        for (const c of crossed) {
          if (shown.has(c.key) || have.has(c.key)) continue;
          have.add(c.key);
          merged.push(c);
        }
        return merged;
      });
    },
    []
  );

  const closeMilestoneModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  useLayoutEffect(() => {
    if (!startedAtIso) return;
    queueMicrotask(() => {
      setNow(Date.now());
    });
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      if (!congratsRef.current) return;
      const elapsed = nfElapsedSecondsFromStart(startedAtIso, t);
      if (!mReadyRef.current) {
        mReadyRef.current = true;
        prevMRef.current = elapsed;
        return;
      }
      const prevE = prevMRef.current ?? 0;
      const crossed = getMilestonesCrossedInInterval(prevE, elapsed);
      prevMRef.current = elapsed;
      if (crossed.length > 0) {
        appendToBacklog(crossed);
      }
    }, 1000);
    return () => {
      window.clearInterval(id);
      mReadyRef.current = false;
      prevMRef.current = null;
    };
  }, [appendToBacklog, startedAtIso]);

  useEffect(() => {
    if (activeModal) return;
    if (backlog.length === 0) return;
    const next = backlog[0]!;
    const shown = mergeShown(shownFromPropsRef.current, optimRef.current);
    queueMicrotask(() => {
      if (shown.has(next.key)) {
        setBacklog((b) => b.slice(1));
        return;
      }
      const message = pickRandomNfMilestoneMessage();
      optimRef.current.add(next.key);
      onRecordRef.current?.(next.key);
      setActiveModal({ ...next, message });
      setBacklog((b) => b.slice(1));
    });
  }, [activeModal, backlog]);

  if (!startedAtIso) {
    return {
      liveLabel: "",
      isPr: false,
      milestoneStatus: { kind: "idle" } as NfMilestoneStatus,
      milestoneModal: null as NfMilestoneModalPayload | null,
      closeMilestoneModal,
    };
  }

  const liveLabel = formatNfElapsedFromStart(startedAtIso, now);
  const elapsed = nfElapsedSecondsFromStart(startedAtIso, now);
  const isPr = elapsed >= personalBestSeconds;
  const nextM = getNextNfMilestone(elapsed);
  const milestoneStatus: NfMilestoneStatus = nextM
    ? {
        kind: "next",
        timeToGo: formatNfTimeRemainingToMilestone(nextM.remainingSeconds),
        milestoneName: nextM.label,
      }
    : { kind: "all" };

  return {
    liveLabel,
    isPr,
    milestoneStatus,
    milestoneModal: activeModal,
    closeMilestoneModal,
  };
}
