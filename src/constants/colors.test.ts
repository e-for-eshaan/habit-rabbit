import { describe, expect, it } from "vitest";

import { getPastelAccentVar, getPastelStyle, PASTEL_ACCENT_VARS, PASTEL_COLORS } from "./colors";

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

  describe("PASTEL_ACCENT_VARS", () => {
    it("has 6 CSS var entries", () => {
      expect(PASTEL_ACCENT_VARS).toHaveLength(6);
    });
  });

  describe("getPastelAccentVar", () => {
    it("returns var for key 0", () => {
      expect(getPastelAccentVar(0)).toBe(PASTEL_ACCENT_VARS[0]);
    });

    it("wraps index with modulo", () => {
      expect(getPastelAccentVar(6)).toBe(PASTEL_ACCENT_VARS[0]);
    });
  });
});
