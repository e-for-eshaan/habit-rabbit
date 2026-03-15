import { describe, it, expect } from "vitest";
import { groupUpdatesByDay } from "./groupUpdatesByDay";
import type { Update } from "@/types";

const update = (id: string, text: string, createdAt: string): Update => ({
  id,
  text,
  createdAt,
});

describe("groupUpdatesByDay", () => {
  it("returns empty array for no updates", () => {
    expect(groupUpdatesByDay([])).toEqual([]);
  });

  it("groups updates by date", () => {
    const updates: Update[] = [
      update("1", "a", "2025-01-15T10:00:00Z"),
      update("2", "b", "2025-01-15T14:00:00Z"),
      update("3", "c", "2025-01-16T09:00:00Z"),
    ];
    const result = groupUpdatesByDay(updates);
    expect(result).toHaveLength(2);
    const day1 = result.find((g) => g.dateKey === "2025-01-15");
    const day2 = result.find((g) => g.dateKey === "2025-01-16");
    expect(day1?.updates).toHaveLength(2);
    expect(day2?.updates).toHaveLength(1);
  });

  it("sorts groups by date descending", () => {
    const updates: Update[] = [
      update("1", "a", "2025-01-14T00:00:00Z"),
      update("2", "b", "2025-01-16T00:00:00Z"),
    ];
    const result = groupUpdatesByDay(updates);
    expect(result[0]!.dateKey).toBe("2025-01-16");
    expect(result[1]!.dateKey).toBe("2025-01-14");
  });
});
