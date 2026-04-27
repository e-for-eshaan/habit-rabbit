"use client";

import { Modal } from "antd";
import confetti from "canvas-confetti";
import { PartyPopper } from "lucide-react";
import { useEffect, useRef } from "react";

import type { NfMilestoneModalPayload } from "@/components/fitness/useNfStreakMilestoneState";

import styles from "./NfMilestoneCongratulationsModal.module.css";

type NfMilestoneCongratulationsModalProps = {
  payload: NfMilestoneModalPayload | null;
  onClose: () => void;
};

const SPARKLE_SPECS = [
  { left: "6%", top: "18%", delay: "0s", color: "var(--pastel-5)" },
  { left: "88%", top: "14%", delay: "0.25s", color: "var(--pastel-3)" },
  { left: "12%", top: "72%", delay: "0.5s", color: "var(--pastel-2)" },
  { left: "92%", top: "68%", delay: "0.15s", color: "var(--pastel-1)" },
  { left: "48%", top: "8%", delay: "0.35s", color: "var(--pastel-6)" },
  { left: "72%", top: "42%", delay: "0.6s", color: "var(--pastel-4)" },
  { left: "22%", top: "44%", delay: "0.8s", color: "var(--pastel-5)" },
  { left: "58%", top: "78%", delay: "0.45s", color: "var(--pastel-3)" },
  { left: "38%", top: "28%", delay: "1s", color: "var(--pastel-2)" },
  { left: "78%", top: "22%", delay: "0.7s", color: "var(--pastel-6)" },
] as const;

export function NfMilestoneCongratulationsModal({
  payload,
  onClose,
}: NfMilestoneCongratulationsModalProps) {
  const confettiCleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!payload) {
      confettiCleanupRef.current?.();
      confettiCleanupRef.current = null;
      return;
    }
    if (prefersReducedMotion()) {
      return;
    }
    confettiCleanupRef.current?.();
    confettiCleanupRef.current = runMilestoneConfettiSequence();
    return () => {
      confettiCleanupRef.current?.();
      confettiCleanupRef.current = null;
    };
  }, [payload?.key]);

  return (
    <Modal
      open={Boolean(payload)}
      title={
        payload ? (
          <div className={styles.popIn}>
            <MilestoneHeader label={payload.label} />
          </div>
        ) : null
      }
      onOk={onClose}
      onCancel={onClose}
      okText="Thanks"
      cancelButtonProps={{ style: { display: "none" } }}
      destroyOnClose
      centered
      classNames={{ body: "!pt-0", content: styles.modalContent }}
    >
      {payload && (
        <div className={styles.wrap}>
          <SparkleLayer />
          <div className={styles.content}>
            <MilestoneBody message={payload.message} />
          </div>
        </div>
      )}
    </Modal>
  );
}

function SparkleLayer() {
  return (
    <div className={styles.sparkleLayer} aria-hidden>
      {SPARKLE_SPECS.map((s, i) => (
        <span
          key={i}
          className={styles.sparkle}
          style={{
            left: s.left,
            top: s.top,
            animationDelay: s.delay,
            background: s.color,
          }}
        />
      ))}
    </div>
  );
}

function MilestoneHeader({ label }: { label: string }) {
  return (
    <div className="flex items-start gap-3 pr-2">
      <div
        className={`mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/25 ring-1 ring-violet-400/40 ${styles.iconRing} ${styles.iconGlow}`}
      >
        <PartyPopper className="size-5 text-violet-100" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className={`m-0 text-body-sm text-muted ${styles.subLine}`}>Milestone</p>
        <p
          className={`m-0 text-display font-semibold tracking-tight text-foreground ${styles.titleLine}`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

function MilestoneBody({ message }: { message: string }) {
  return (
    <p className={`m-0 text-body leading-relaxed text-foreground sm:text-body ${styles.message}`}>
      {message}
    </p>
  );
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function runMilestoneConfettiSequence(): () => void {
  const canvas = document.createElement("canvas");
  canvas.setAttribute(
    "style",
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:100000;top:0;left:0;"
  );
  document.body.appendChild(canvas);
  const fire = confetti.create(canvas, { resize: true, useWorker: true });
  const palette = ["#a78bfa", "#f472b6", "#34d399", "#facc15", "#38bdf8", "#fb7185"];

  const burst = () => {
    fire({
      particleCount: 90,
      spread: 78,
      origin: { y: 0.62 },
      colors: palette,
      ticks: 320,
      scalar: 1,
    });
  };

  burst();

  const t1 = window.setTimeout(() => {
    fire({
      particleCount: 55,
      angle: 60,
      spread: 58,
      origin: { x: 0, y: 0.78 },
      colors: palette,
      ticks: 280,
    });
    fire({
      particleCount: 55,
      angle: 120,
      spread: 58,
      origin: { x: 1, y: 0.78 },
      colors: palette,
      ticks: 280,
    });
  }, 160);

  const t2 = window.setTimeout(() => {
    fire({
      particleCount: 28,
      spread: 360,
      startVelocity: 12,
      ticks: 420,
      origin: { x: 0.5, y: 0.42 },
      shapes: ["star"],
      colors: ["#fde047", "#fcd34d", "#fbbf24"],
      scalar: 0.95,
    });
  }, 380);

  const t3 = window.setTimeout(() => {
    fire({
      particleCount: 40,
      spread: 100,
      origin: { x: 0.5, y: 0.35 },
      colors: palette,
      ticks: 260,
      gravity: 1.1,
    });
  }, 620);

  return () => {
    window.clearTimeout(t1);
    window.clearTimeout(t2);
    window.clearTimeout(t3);
    canvas.remove();
  };
}
