import type { SortBy } from "@/store/useSectionsStore";

export type SortOption = {
  value: SortBy;
  label: string;
  hasDirection: boolean;
};

export const SORT_OPTIONS: SortOption[] = [
  { value: "most-all-time", label: "Most all time", hasDirection: true },
  { value: "most-today", label: "Most frequent today", hasDirection: true },
  { value: "recently-updated", label: "Recently updated", hasDirection: true },
  { value: "name-az", label: "Name A–Z", hasDirection: false },
  { value: "name-za", label: "Name Z–A", hasDirection: false },
];
