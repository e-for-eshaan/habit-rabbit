import type { CalendarRange, FreqRange, LayoutMode, ViewMode } from "@/store/useSectionsStore";

export const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: "list", label: "List" },
  { value: "calendar", label: "Calendar" },
  { value: "freq", label: "Frequency" },
];

export const CALENDAR_RANGES: { value: CalendarRange; label: string }[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
];

export const CALENDAR_RANGE_LABELS: Record<CalendarRange, string> = {
  week: "Week",
  month: "Month",
  last7: "Last 7 days",
  last30: "Last 30 days",
};

export const FREQ_RANGES: { value: FreqRange; label: string }[] = [
  { value: "1m", label: "1 month" },
  { value: "3m", label: "3 months" },
  { value: "6m", label: "6 months" },
  { value: "1y", label: "1 year" },
];

export const LAYOUT_MODES: { value: LayoutMode; label: string }[] = [
  { value: "horizontal", label: "Horizontal" },
  { value: "grid", label: "Grid" },
];
