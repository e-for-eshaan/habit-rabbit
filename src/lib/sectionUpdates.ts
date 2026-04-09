import type { Update } from "@/types";

export const SECTION_UPDATES_PAGE_SIZE = 10;

export function sortUpdatesNewestFirst(updates: Update[]): Update[] {
  return [...updates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function sliceUpdatesPage(
  sortedNewestFirst: Update[],
  offset: number,
  limit: number
): Update[] {
  return sortedNewestFirst.slice(offset, offset + limit);
}
