"use client";

import { useState } from "react";

import { getPastelAccentVar, getPastelStyle } from "@/constants/colors";
import type { SectionDef } from "@/lib/fitnessConstants";
import { getGroupPastelKey, SECTIONS } from "@/lib/fitnessConstants";
import { cn } from "@/lib/utils";

import { FitnessCheckbox } from "./FitnessCheckbox";
import { getGroupIcon, GROUP_ICON_SIZE } from "./groupIcons";

type SectionRowProps = {
  section: SectionDef;
  accentVar: string;
  selected: Set<string>;
  onToggleGroup: (group: string) => void;
  onStartSection: (groups: string[]) => void;
};

function SectionRow({
  section,
  accentVar,
  selected,
  onToggleGroup,
  onStartSection,
}: SectionRowProps) {
  return (
    <div
      className="rounded-xl border border-border-subtle bg-surface-elevated/20 p-inline sm:p-card"
      style={{ borderLeftWidth: 3, borderLeftColor: accentVar }}
    >
      <div className="mb-inline flex flex-wrap items-center justify-between gap-inline border-b border-border-subtle pb-inline">
        <span className="text-body-sm font-medium text-foreground sm:text-body">
          {section.name}
        </span>
        <button
          type="button"
          onClick={() => onStartSection([...section.groups])}
          className="min-h-touch rounded-lg bg-lime-400 px-3 py-1.5 text-body-sm font-semibold text-zinc-950 hover:bg-lime-300"
        >
          Start
        </button>
      </div>
      <div className="flex flex-wrap gap-inline sm:gap-stack">
        {section.groups.map((group) => {
          const style = getPastelStyle(getGroupPastelKey(group));
          const GroupIcon = getGroupIcon(group);
          return (
            <div
              key={group}
              className={cn(
                "rounded-lg border border-border-subtle bg-surface/80 px-2 py-1.5 sm:px-2.5 sm:py-2",
                selected.has(group) && "ring-2 ring-lime-400/50 ring-offset-2 ring-offset-zinc-950"
              )}
            >
              <div className="flex items-center gap-inline">
                <GroupIcon size={GROUP_ICON_SIZE} className="shrink-0 text-muted" aria-hidden />
                <FitnessCheckbox
                  id={`welcome-${group}`}
                  checked={selected.has(group)}
                  onChange={() => onToggleGroup(group)}
                  label={group}
                  labelClassName="text-body-sm font-medium text-foreground sm:text-body"
                  accentClassName={cn(style.bg, style.border)}
                  checkIconClassName="text-foreground"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type WelcomeScreenProps = {
  selectedGroups: string[];
  onStart: (groups: string[]) => void;
  className?: string;
};

export function WelcomeScreen({ selectedGroups: initial, onStart, className }: WelcomeScreenProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initial));

  const toggleGroup = (group: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const handleStartSection = (groups: string[]) => {
    onStart(groups);
  };

  const handleStart = () => {
    onStart(Array.from(selected));
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-border-subtle bg-surface p-card sm:p-section md:p-section",
        className
      )}
    >
      <h2 className="mb-tight text-title font-semibold tracking-tight text-foreground sm:text-display">
        Welcome back
      </h2>
      <p className="mb-stack text-body-sm text-muted-fg sm:mb-section sm:text-body">
        Start a section with one tap, or pick individual groups below.
      </p>
      <div className="mb-stack flex flex-col gap-inline sm:mb-section sm:gap-stack">
        {SECTIONS.map((section, sectionIdx) => (
          <SectionRow
            key={section.name}
            section={section}
            accentVar={getPastelAccentVar(sectionIdx)}
            selected={selected}
            onToggleGroup={toggleGroup}
            onStartSection={handleStartSection}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={handleStart}
        disabled={selected.size === 0}
        className={cn(
          "min-h-touch w-full rounded-xl py-3 text-body-sm font-semibold transition-colors sm:py-3.5 sm:text-body",
          selected.size > 0
            ? "bg-lime-400 text-zinc-950 hover:bg-lime-300"
            : "cursor-not-allowed bg-zinc-800 text-muted-fg"
        )}
      >
        Start — {selected.size} group{selected.size !== 1 ? "s" : ""}
      </button>
    </div>
  );
}
