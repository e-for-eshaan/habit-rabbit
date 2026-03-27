import { getViewSettings, updateViewSettings } from "@/lib/api";
import type {
  CalendarRange,
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
function isCollapsedMap(v: unknown): v is Record<string, boolean> {
  if (v === null || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return Object.entries(o).every(([k, val]) => typeof k === "string" && typeof val === "boolean");
}

function parseValidated(data: Record<string, unknown>): Partial<StoredViewSettings> {
  const out: Partial<StoredViewSettings> = {};
  if (isLayoutMode(data.layoutMode)) out.layoutMode = data.layoutMode;
  if (isViewMode(data.viewMode)) out.viewMode = data.viewMode;
  if (isCalendarRange(data.calendarRange)) out.calendarRange = data.calendarRange;
  if (isFreqRange(data.freqRange)) out.freqRange = data.freqRange;
  if (isSortBy(data.sortBy)) out.sortBy = data.sortBy;
  if (isSortDir(data.sortDir)) out.sortDir = data.sortDir;
  if (isCollapsedMap(data.collapsedBySectionId))
    out.collapsedBySectionId = data.collapsedBySectionId;
  return out;
}

export async function getStoredViewSettings(): Promise<Partial<StoredViewSettings> | null> {
  try {
    const data = await getViewSettings();
    const out = parseValidated(data);
    return Object.keys(out).length > 0 ? out : null;
  } catch {
    return null;
  }
}

export async function setStoredViewSettings(settings: StoredViewSettings): Promise<void> {
  try {
    await updateViewSettings(settings);
  } catch {
    // ignore network/API errors
  }
}
