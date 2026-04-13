import { eachDayOfInterval, subDays } from "date-fns";
import { isString } from "lodash";

import { getCalendarGrid } from "@/lib/dateRange";

import { HEATMAP_DAYS } from "./constants";

export const getHeatmapGrid = (): (Date | null)[][] => {
  const end = new Date();
  const start = subDays(end, HEATMAP_DAYS - 1);
  const days = eachDayOfInterval({ start, end });
  return getCalendarGrid(days);
};

export const chartSeriesSentenceCase = (raw: string): string => {
  if (!isString(raw) || raw.length === 0) return raw;
  const lower = raw.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};
