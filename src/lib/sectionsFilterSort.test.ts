import { describe, it, expect } from "vitest";
import { filterSectionsBySearch, sortSections } from "./sectionsFilterSort";
import type { Section } from "@/types";

const section = (
  id: string,
  title: string,
  updates: { text: string; createdAt: string }[]
): Section => ({
  id,
  title,
  colorKey: 0,
  updates: updates.map((u, i) => ({
    id: `u-${id}-${i}`,
    text: u.text,
    createdAt: u.createdAt,
  })),
});

describe("filterSectionsBySearch", () => {
  it("returns all sections when query is empty", () => {
    const sections = [section("1", "Habit A", [])];
    expect(filterSectionsBySearch(sections, "")).toEqual(sections);
    expect(filterSectionsBySearch(sections, "   ")).toEqual(sections);
  });

  it("filters by section title", () => {
    const sections = [section("1", "Exercise", []), section("2", "Reading", [])];
    expect(filterSectionsBySearch(sections, "read")).toHaveLength(1);
    expect(filterSectionsBySearch(sections, "read")[0]!.title).toBe("Reading");
  });

  it("filters by update text", () => {
    const sections = [section("1", "Habit", [{ text: "done", createdAt: "2025-01-01T00:00:00Z" }])];
    expect(filterSectionsBySearch(sections, "done")).toHaveLength(1);
    expect(filterSectionsBySearch(sections, "none")).toHaveLength(0);
  });

  it("is case insensitive", () => {
    const sections = [section("1", "Exercise", [])];
    expect(filterSectionsBySearch(sections, "EXERCISE")).toHaveLength(1);
  });
});

describe("sortSections", () => {
  const sections: Section[] = [
    section("a", "Alpha", [
      { text: "u1", createdAt: "2025-01-03T00:00:00Z" },
      { text: "u2", createdAt: "2025-01-01T00:00:00Z" },
    ]),
    section("b", "Beta", [{ text: "u1", createdAt: "2025-01-02T00:00:00Z" }]),
    section("c", "Gamma", []),
  ];

  it("sorts by most-all-time desc", () => {
    const result = sortSections(sections, "most-all-time", "desc");
    expect(result.map((s) => s.id)).toEqual(["c", "b", "a"]);
  });

  it("sorts by most-all-time asc", () => {
    const result = sortSections(sections, "most-all-time", "asc");
    expect(result.map((s) => s.id)).toEqual(["a", "b", "c"]);
  });

  it("sorts by recently-updated desc", () => {
    const result = sortSections(sections, "recently-updated", "desc");
    expect(result.map((s) => s.id)).toContain("a");
    expect(result).toHaveLength(3);
  });

  it("sorts by name A-Z", () => {
    const result = sortSections(sections, "name-az", "asc");
    expect(result.map((s) => s.title)).toEqual(["Alpha", "Beta", "Gamma"]);
  });

  it("sorts by name Z-A", () => {
    const result = sortSections(sections, "name-za", "asc");
    expect(result.map((s) => s.title)).toEqual(["Gamma", "Beta", "Alpha"]);
  });
});
