import { isNumber, isObject } from "lodash";

import { updateViewSettings } from "@/lib/api";
import { auth } from "@/lib/firebase/client";
import type {
  CalendarRange,
  FitnessCardioDisplay,
  FreqRange,
  LayoutMode,
  SortBy,
  SortDir,
  StoredViewSettings,
  ViewMode,
} from "@/store/useSectionsStore";

export type { StoredViewSettings };

const LAYOUT_MODES: LayoutMode[] = ["horizontal", "grid"];
const VIEW_MODES: ViewMode[] = ["list", "calendar", "freq"];
const CALENDAR_RANGES: CalendarRange[] = ["week", "month", "last7", "last30"];
const FREQ_RANGES: FreqRange[] = ["1m", "3m", "6m", "1y"];
const SORT_BY_VALUES: SortBy[] = [
  "most-all-time",
  "most-today",
  "recently-updated",
  "name-az",
  "name-za",
];
const SORT_DIR_VALUES: SortDir[] = ["asc", "desc"];
const FITNESS_CARDIO_DISPLAY: FitnessCardioDisplay[] = ["combined", "split"];

const STORAGE_PREFIX = "habit-rabbit:viewSettings:";

export const VIEW_SETTINGS_DEFAULTS: StoredViewSettings = {
  layoutMode: "horizontal",
  viewMode: "list",
  calendarRange: "last7",
  freqRange: "1m",
  sortBy: "recently-updated",
  sortDir: "desc",
  collapsedBySectionId: {},
  fitnessCardioDisplay: "combined",
};

let activeUid: string | null = null;

export function setViewSettingsSyncUserId(uid: string | null) {
  activeUid = uid;
}

export function getViewSettingsSyncUserId(): string | null {
  return activeUid;
}

export function resolveViewSettingsPersistUid(): string | null {
  if (typeof window === "undefined") return null;
  if (activeUid) return activeUid;
  const uid = auth?.currentUser?.uid ?? null;
  if (uid) {
    setViewSettingsSyncUserId(uid);
  }
  return uid;
}

export type LocalViewSettingsBundle = {
  settings: StoredViewSettings;
  updatedAt: number;
};

function storageKey(uid: string) {
  return `${STORAGE_PREFIX}${uid}`;
}

function isLayoutMode(v: unknown): v is LayoutMode {
  return typeof v === "string" && LAYOUT_MODES.includes(v as LayoutMode);
}
function isViewMode(v: unknown): v is ViewMode {
  return typeof v === "string" && VIEW_MODES.includes(v as ViewMode);
}
function isCalendarRange(v: unknown): v is CalendarRange {
  return typeof v === "string" && CALENDAR_RANGES.includes(v as CalendarRange);
}
function isFreqRange(v: unknown): v is FreqRange {
  return typeof v === "string" && FREQ_RANGES.includes(v as FreqRange);
}
function isSortBy(v: unknown): v is SortBy {
  return typeof v === "string" && SORT_BY_VALUES.includes(v as SortBy);
}
function isSortDir(v: unknown): v is SortDir {
  return typeof v === "string" && SORT_DIR_VALUES.includes(v as SortDir);
}
function isFitnessCardioDisplay(v: unknown): v is FitnessCardioDisplay {
  return typeof v === "string" && FITNESS_CARDIO_DISPLAY.includes(v as FitnessCardioDisplay);
}
function isCollapsedMap(v: unknown): v is Record<string, boolean> {
  if (!isObject(v) || v === null) return false;
  const o = v as Record<string, unknown>;
  return Object.entries(o).every(([k, val]) => typeof k === "string" && typeof val === "boolean");
}

export function parseViewSettingsFromRecord(
  data: Record<string, unknown>
): Partial<StoredViewSettings> {
  const out: Partial<StoredViewSettings> = {};
  if (isLayoutMode(data.layoutMode)) out.layoutMode = data.layoutMode;
  if (isViewMode(data.viewMode)) out.viewMode = data.viewMode;
  if (isCalendarRange(data.calendarRange)) out.calendarRange = data.calendarRange;
  if (isFreqRange(data.freqRange)) out.freqRange = data.freqRange;
  if (isSortBy(data.sortBy)) out.sortBy = data.sortBy;
  if (isSortDir(data.sortDir)) out.sortDir = data.sortDir;
  if (isCollapsedMap(data.collapsedBySectionId))
    out.collapsedBySectionId = data.collapsedBySectionId;
  if (isFitnessCardioDisplay(data.fitnessCardioDisplay))
    out.fitnessCardioDisplay = data.fitnessCardioDisplay;
  return out;
}

export function getViewSettingsUpdatedAt(data: Record<string, unknown>): number {
  const v = data.updatedAt;
  if (isNumber(v) && Number.isFinite(v)) return v;
  return 0;
}

export function mergePartialWithDefaults(partial: Partial<StoredViewSettings>): StoredViewSettings {
  return { ...VIEW_SETTINGS_DEFAULTS, ...partial };
}

export function readLocalViewSettingsBundle(uid: string): LocalViewSettingsBundle | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(storageKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isObject(parsed) || parsed === null) return null;
    const o = parsed as Record<string, unknown>;
    const updatedAt = o.updatedAt;
    if (!isNumber(updatedAt) || !Number.isFinite(updatedAt)) return null;
    const settingsVal = o.settings;
    if (!isObject(settingsVal) || settingsVal === null) return null;
    const partial = parseViewSettingsFromRecord(settingsVal as Record<string, unknown>);
    const settings = mergePartialWithDefaults(partial);
    return { settings, updatedAt };
  } catch {
    return null;
  }
}

export function writeLocalViewSettingsBundle(uid: string, bundle: LocalViewSettingsBundle): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey(uid), JSON.stringify(bundle));
  } catch {
    // quota / private mode
  }
}

export function saveViewSettingsLocalImmediate(settings: StoredViewSettings): number {
  const uid = resolveViewSettingsPersistUid();
  if (!uid) return Date.now();
  const updatedAt = Date.now();
  writeLocalViewSettingsBundle(uid, { settings, updatedAt });
  return updatedAt;
}

export async function flushViewSettingsToApi(
  settings: StoredViewSettings,
  updatedAt: number
): Promise<void> {
  try {
    await updateViewSettings({ ...settings, updatedAt });
  } catch {
    // ignore network/API errors
  }
}

export async function syncViewSettingsWithRemote(
  remote: Record<string, unknown>,
  uid: string
): Promise<Partial<StoredViewSettings> | null> {
  const remoteUpdatedAt = getViewSettingsUpdatedAt(remote);
  const local = readLocalViewSettingsBundle(uid);

  if (local && local.updatedAt > remoteUpdatedAt) {
    try {
      await updateViewSettings({
        ...local.settings,
        updatedAt: local.updatedAt,
      });
    } catch {
      // offline: caller still hydrates from local
    }
    return { ...local.settings };
  }

  const remotePartial = parseViewSettingsFromRecord(remote);
  const remoteHasNoPayload = Object.keys(remotePartial).length === 0 && remoteUpdatedAt === 0;
  if (remoteHasNoPayload && !local) {
    return null;
  }

  const merged = mergePartialWithDefaults(remotePartial);
  writeLocalViewSettingsBundle(uid, { settings: merged, updatedAt: remoteUpdatedAt });

  if (Object.keys(remotePartial).length === 0) {
    return null;
  }
  return remotePartial;
}
