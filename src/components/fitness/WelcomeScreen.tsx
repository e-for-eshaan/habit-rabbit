"use client";

import { useState } from "react";
import type { SectionDef } from "@/lib/fitnessConstants";
import { SECTIONS } from "@/lib/fitnessConstants";
import { getPastelStyle } from "@/constants/colors";
import { FitnessCheckbox } from "./FitnessCheckbox";
import { getGroupIcon, GROUP_ICON_SIZE } from "./groupIcons";
import { cn } from "@/lib/utils";

type SectionRowProps = {
  section: SectionDef;
  sectionStyle: { border: string; light: string; bg: string };
  sectionIdx: number;
  selected: Set<string>;
  onToggleGroup: (group: string) => void;
  onStartSection: (groups: string[]) => void;
};

function SectionRow({
  section,
  sectionStyle,
  sectionIdx,
  selected,
  onToggleGroup,
  onStartSection,
}: SectionRowProps) {
  return (
    <div
      className={cn(
        "rounded-lg border-2 p-2 sm:rounded-xl sm:p-3",
        sectionStyle.border,
        sectionStyle.light
      )}
    >
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1.5 border-b border-stone-200/50 pb-1.5 dark:border-stone-600/50 sm:mb-2 sm:gap-2 sm:pb-2">
        <span className="text-sm font-medium text-stone-800 dark:text-stone-200 sm:text-base">
          {section.name}
        </span>
        <button
          type="button"
          onClick={() => onStartSection([...section.groups])}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-semibold transition-colors sm:rounded-lg sm:px-2.5 sm:py-1.5 sm:text-sm",
            "bg-stone-800 text-white hover:bg-stone-700 dark:bg-stone-200 dark:text-stone-800 dark:hover:bg-stone-300"
          )}
        >
          Start
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {section.groups.map((group, groupIdx) => {
          const style = getPastelStyle((sectionIdx * 3 + groupIdx) % 6);
          const GroupIcon = getGroupIcon(group);
          return (
            <div
              key={group}
              className={cn(
                "rounded-md border-2 px-2 py-1 sm:rounded-lg sm:px-2.5 sm:py-1.5",
                style.border,
                style.light,
                selected.has(group) &&
                  "ring-2 ring-offset-1 ring-stone-400 dark:ring-offset-stone-900"
              )}
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <GroupIcon
                  size={GROUP_ICON_SIZE}
                  className="shrink-0 text-stone-600 dark:text-stone-400"
                  aria-hidden
                />
                <FitnessCheckbox
                  id={`welcome-${group}`}
                  checked={selected.has(group)}
                  onChange={() => onToggleGroup(group)}
                  label={group}
                  labelClassName="text-xs font-medium text-stone-800 dark:text-stone-200 sm:text-sm"
                  accentClassName={cn(style.bg, style.border)}
                  checkIconClassName="text-stone-800 dark:text-stone-200"
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
        "rounded-xl border-2 border-stone-200 bg-stone-50/80 p-4 dark:border-stone-600 dark:bg-stone-800/80 sm:rounded-2xl sm:p-5 md:p-6",
        className
      )}
    >
      <h2 className="mb-1 text-lg font-semibold text-stone-800 dark:text-stone-200 sm:text-xl">
        Welcome back
      </h2>
      <p className="mb-4 text-xs text-stone-600 dark:text-stone-400 sm:mb-6 sm:text-sm">
        Start a section with one click, or pick individual groups below.
      </p>
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:gap-4">
        {SECTIONS.map((section, sectionIdx) => {
          const sectionStyle = getPastelStyle(sectionIdx % 6);
          return (
            <SectionRow
              key={section.name}
              section={section}
              sectionStyle={sectionStyle}
              sectionIdx={sectionIdx}
              selected={selected}
              onToggleGroup={toggleGroup}
              onStartSection={handleStartSection}
            />
          );
        })}
      </div>
      <button
        type="button"
        onClick={handleStart}
        disabled={selected.size === 0}
        className={cn(
          "w-full rounded-lg py-2.5 text-xs font-semibold transition-colors sm:rounded-xl sm:py-3 sm:text-sm",
          selected.size > 0
            ? "bg-stone-800 text-white hover:bg-stone-700 dark:bg-stone-200 dark:text-stone-800 dark:hover:bg-stone-300"
            : "cursor-not-allowed bg-stone-200 text-stone-500 dark:bg-stone-700 dark:text-stone-400"
        )}
      >
        Start — show {selected.size} group{selected.size !== 1 ? "s" : ""}
      </button>
    </div>
  );
}
