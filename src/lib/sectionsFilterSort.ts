import type { Section } from "@/types";
import type { SortBy, SortDir } from "@/store/useSectionsStore";

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function countTodayUpdates(section: Section): number {
  return section.updates.filter((u) => isToday(u.createdAt)).length;
}

function mostRecentUpdateAt(section: Section): number {
  if (section.updates.length === 0) return 0;
  return Math.max(...section.updates.map((u) => new Date(u.createdAt).getTime()));
}

export function filterSectionsBySearch(sections: Section[], query: string): Section[] {
  const q = query.trim().toLowerCase();
  if (!q) return sections;
  return sections
    .map((s) => ({
      ...s,
      updates: s.updates.filter((u) => u.text.toLowerCase().includes(q)),
    }))
    .filter((s) => s.title.toLowerCase().includes(q) || s.updates.length > 0);
}

export function sortSections(sections: Section[], sortBy: SortBy, sortDir: SortDir): Section[] {
  const dir = sortDir === "asc" ? 1 : -1;
  const sorted = [...sections];

  switch (sortBy) {
    case "most-all-time":
      sorted.sort((a, b) => dir * (b.updates.length - a.updates.length));
      break;
    case "most-today":
      sorted.sort((a, b) => dir * (countTodayUpdates(b) - countTodayUpdates(a)));
      break;
    case "recently-updated":
      sorted.sort((a, b) => dir * (mostRecentUpdateAt(b) - mostRecentUpdateAt(a)));
      break;
    case "name-az":
      sorted.sort(
        (a, b) => dir * a.title.localeCompare(b.title, undefined, { sensitivity: "base" })
      );
      break;
    case "name-za":
      sorted.sort(
        (a, b) => dir * b.title.localeCompare(a.title, undefined, { sensitivity: "base" })
      );
      break;
    default:
      break;
  }
  return sorted;
}
