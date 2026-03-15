import { describe, it, expect } from "vitest";
import { PASTEL_COLORS, getPastelStyle } from "./colors";

describe("colors", () => {
  describe("PASTEL_COLORS", () => {
    it("has 6 color entries", () => {
      expect(PASTEL_COLORS).toHaveLength(6);
    });

    it("each entry has bg, border, light", () => {
      PASTEL_COLORS.forEach((c) => {
        expect(c).toHaveProperty("bg");
        expect(c).toHaveProperty("border");
        expect(c).toHaveProperty("light");
      });
    });
  });

  describe("getPastelStyle", () => {
    it("returns style for key 0", () => {
      expect(getPastelStyle(0)).toEqual(PASTEL_COLORS[0]);
    });

    it("wraps index with modulo", () => {
      expect(getPastelStyle(6)).toEqual(PASTEL_COLORS[0]);
      expect(getPastelStyle(7)).toEqual(PASTEL_COLORS[1]);
    });
  });
});
