import { describe, it, expect } from "vitest";
import { SORT_OPTIONS } from "./sortOptions";

describe("SORT_OPTIONS", () => {
  it("has expected sort options", () => {
    expect(SORT_OPTIONS).toHaveLength(5);
    const values = SORT_OPTIONS.map((o) => o.value);
    expect(values).toContain("most-all-time");
    expect(values).toContain("recently-updated");
    expect(values).toContain("name-az");
    expect(values).toContain("name-za");
  });

  it("each option has value, label, hasDirection", () => {
    SORT_OPTIONS.forEach((opt) => {
      expect(opt).toHaveProperty("value");
      expect(opt).toHaveProperty("label");
      expect(opt).toHaveProperty("hasDirection");
      expect(typeof opt.hasDirection).toBe("boolean");
    });
  });
});
