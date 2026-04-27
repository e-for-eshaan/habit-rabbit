import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { formatNfElapsedFromStart, nfElapsedSecondsFromStart } from "@/lib/nfElapsed";
import {
  formatNfTimeRemainingToMilestone,
  getNextNfMilestone,
  listMilestonesPassedWithoutCongrat,
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
  const shownFromPropsRef = useRef(congrats?.congratsShownKeys);
  const onRecordRef = useRef(congrats?.onRecordCongrat);
  const congratsRef = useRef(congrats);
  const activeModalRef = useRef<NfMilestoneModalPayload | null>(null);

  useLayoutEffect(() => {
    shownFromPropsRef.current = congrats?.congratsShownKeys;
    onRecordRef.current = congrats?.onRecordCongrat;
    congratsRef.current = congrats;
  });

  useLayoutEffect(() => {
    activeModalRef.current = activeModal;
  }, [activeModal]);

  const appendToBacklog = useCallback(
    (candidates: { key: string; label: string; totalSeconds: number }[]) => {
      if (candidates.length === 0) return;
      setBacklog((b) => {
        const have = new Set(b.map((x) => x.key));
        const merged = [...b];
        for (const c of candidates) {
          if (have.has(c.key)) continue;
          have.add(c.key);
          merged.push(c);
        }
        return merged;
      });
    },
    []
  );

  const closeMilestoneModal = useCallback(() => {
    const prev = activeModalRef.current;
    if (prev?.key) {
      optimRef.current.add(prev.key);
      onRecordRef.current?.(prev.key);
    }
    setActiveModal(null);
  }, []);

  useLayoutEffect(() => {
    if (!startedAtIso) return;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (!congratsRef.current) return;
      const elapsed = nfElapsedSecondsFromStart(startedAtIso, t);
      const celebrated = mergeShown(shownFromPropsRef.current, optimRef.current);
      const openKey = activeModalRef.current?.key ?? null;
      const missing = listMilestonesPassedWithoutCongrat(elapsed, celebrated).filter(
        (x) => x.key !== openKey
      );
      if (missing.length > 0) {
        appendToBacklog(missing);
      }
    };
    queueMicrotask(tick);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearInterval(id);
    };
  }, [appendToBacklog, startedAtIso]);

  useEffect(() => {
    if (activeModal) return;
    if (backlog.length === 0) return;
    const next = backlog[0]!;
    const celebrated = mergeShown(shownFromPropsRef.current, optimRef.current);
    queueMicrotask(() => {
      if (celebrated.has(next.key)) {
        setBacklog((b) => b.slice(1));
        return;
      }
      const message = pickRandomNfMilestoneMessage();
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
