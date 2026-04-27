"use client";

import type { MilestoneBarMark, NfMilestoneBar } from "@/lib/nfMilestones";

import styles from "./NfMilestoneProgressBar.module.css";

type NfMilestoneProgressBarProps = {
  milestoneBar: NfMilestoneBar;
};

export function NfMilestoneProgressBar({ milestoneBar }: NfMilestoneProgressBarProps) {
  const pct = Math.round(milestoneBar.progress01 * 100);
  const marks = milestoneBar.marks;

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.nextLine}>
          Next milestone · <span className={styles.nextName}>{milestoneBar.nextLabel}</span>
        </span>
        <span className={styles.pct} aria-hidden="true">
          {pct}%
        </span>
      </div>
      <div
        className={styles.rail}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${pct}% progress toward ${milestoneBar.nextLabel}`}
      >
        <div className={styles.fill} style={{ width: `${milestoneBar.progress01 * 100}%` }} />
        {marks.map((mark, index) => (
          <MilestoneTick
            key={`${mark.totalSeconds}-${index}`}
            mark={mark}
            index={index}
            total={marks.length}
          />
        ))}
      </div>
    </div>
  );
}

function MilestoneTick({
  mark,
  index,
  total,
}: {
  mark: MilestoneBarMark;
  index: number;
  total: number;
}) {
  const alignStart = index === 0;
  const alignEnd = index === total - 1;
  const midLabel = !alignStart && !alignEnd;

  const wrapStyle = alignStart
    ? { left: 0 }
    : alignEnd
      ? { left: "calc(100% - 1px)" }
      : { left: `calc(${mark.position01 * 100}% - 0.5px)` };

  return (
    <div
      className={`${styles.tickWrap}${alignStart ? ` ${styles.tickWrapAlignStart}` : ""}${alignEnd ? ` ${styles.tickWrapAlignEnd}` : ""}`}
      style={wrapStyle}
    >
      <div className={styles.tick} aria-hidden />
      <span className={`${styles.tickLabel}${midLabel ? ` ${styles.tickLabelMid}` : ""}`}>
        {mark.label}
      </span>
    </div>
  );
}
