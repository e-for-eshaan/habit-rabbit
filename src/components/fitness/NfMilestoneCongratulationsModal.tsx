"use client";

import { Modal } from "antd";
import { PartyPopper } from "lucide-react";

import type { NfMilestoneModalPayload } from "@/components/fitness/useNfStreakMilestoneState";

type NfMilestoneCongratulationsModalProps = {
  payload: NfMilestoneModalPayload | null;
  onClose: () => void;
};

export function NfMilestoneCongratulationsModal({
  payload,
  onClose,
}: NfMilestoneCongratulationsModalProps) {
  return (
    <Modal
      open={Boolean(payload)}
      title={payload ? <MilestoneHeader label={payload.label} /> : null}
      onOk={onClose}
      onCancel={onClose}
      okText="Thanks"
      cancelButtonProps={{ style: { display: "none" } }}
      destroyOnClose
      centered
      classNames={{ body: "!pt-0" }}
    >
      {payload && <MilestoneBody message={payload.message} />}
    </Modal>
  );
}

function MilestoneHeader({ label }: { label: string }) {
  return (
    <div className="flex items-start gap-3 pr-2">
      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 ring-1 ring-violet-400/30">
        <PartyPopper className="size-4 text-violet-200" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="m-0 text-body-sm text-muted">Milestone</p>
        <p className="m-0 text-title font-semibold tracking-tight text-foreground">{label}</p>
      </div>
    </div>
  );
}

function MilestoneBody({ message }: { message: string }) {
  return <p className="m-0 text-body leading-relaxed text-foreground sm:text-body">{message}</p>;
}
