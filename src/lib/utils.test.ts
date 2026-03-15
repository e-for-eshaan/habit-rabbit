import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("filters out falsy values", () => {
    expect(cn("a", undefined, "b", false, "c")).toBe("a b c");
  });

  it("returns empty string when all falsy", () => {
    expect(cn(undefined, false)).toBe("");
  });
});
