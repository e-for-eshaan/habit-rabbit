"use client";

import type { LucideIcon } from "lucide-react";
import { Arm, BicepsFlexed, Dumbbell, Footprints, Layers, Mountain, Target } from "lucide-react";

const GROUP_ICON_MAP: Record<string, LucideIcon> = {
  Shoulder: Mountain,
  Back: Layers,
  Chest: Dumbbell,
  "Arms Biceps": BicepsFlexed,
  "Arms Triceps": Arm,
  Legs: Footprints,
  Abs: Target,
};

export function getGroupIcon(group: string): LucideIcon {
  return GROUP_ICON_MAP[group] ?? Dumbbell;
}

export const GROUP_ICON_SIZE = 16;
