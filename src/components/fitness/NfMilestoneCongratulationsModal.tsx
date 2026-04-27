"use client";

import { Button, Modal } from "antd";
import confetti from "canvas-confetti";
import { PartyPopper, Sparkles } from "lucide-react";
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
      title={null}
      footer={null}
      onCancel={onClose}
      closable
      destroyOnHidden
      centered
      width="min(440px, calc(100vw - 24px))"
      classNames={{ content: styles.modalContent }}
      styles={{
        mask: {
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          background: "rgba(0, 0, 0, 0.72)",
        },
      }}
    >
      {payload && (
        <div className={styles.popIn}>
          <CelebrationCard label={payload.label} message={payload.message} onContinue={onClose} />
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
            color: s.color,
            background: s.color,
          }}
        />
      ))}
    </div>
  );
}

function CelebrationCard({
  label,
  message,
  onContinue,
}: {
  label: string;
  message: string;
  onContinue: () => void;
}) {
  return (
    <div className={styles.card}>
      <div className={styles.topGlow} aria-hidden />
      <div className={styles.mesh} aria-hidden />
      <SparkleLayer />
      <div className={styles.inner}>
        <div className={styles.badge} aria-hidden>
          <span className={styles.badgeDot} />
          <Sparkles className="size-3 text-violet-200/90" aria-hidden />
          <span>Milestone</span>
        </div>
        <br />
        <br />
        <div className={styles.headerRow}>
          <div className={styles.iconWrap}>
            <span className={styles.iconOrbit} aria-hidden />
            <div className={`${styles.iconRing} ${styles.iconGlow}`}>
              <PartyPopper className="size-7 text-white drop-shadow-sm" aria-hidden />
            </div>
          </div>
          <div className={styles.titleBlock}>
            <p className={styles.subLine}>You reached</p>
            <h2 className={styles.titleLine}>{label}</h2>
          </div>
        </div>
        <div className={styles.messageCard}>
          <p className={styles.message}>{message}</p>
        </div>
        <div className={styles.footer}>
          <Button type="primary" className={styles.celebrateOk} onClick={onContinue}>
            Continue
          </Button>
        </div>
      </div>
    </div>
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
