import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate } from "./utils";

describe("Formatting Helpers", () => {
  describe("formatCurrency", () => {
    it("should format positive amounts correctly with Rs. prefix", () => {
      expect(formatCurrency(1250000)).toBe("Rs. 1,250,000.00");
      expect(formatCurrency(0.55)).toBe("Rs. 0.55");
    });

    it("should format negative amounts correctly with -Rs. prefix", () => {
      expect(formatCurrency(-4500.5)).toBe("-Rs. 4,500.50");
      expect(formatCurrency(-12.3)).toBe("-Rs. 12.30");
    });

    it("should format zero correctly", () => {
      expect(formatCurrency(0)).toBe("Rs. 0.00");
    });
  });

  describe("formatDate", () => {
    it("should format valid date string in local format", () => {
      expect(formatDate("2026-06-05")).toBe("Jun 5, 2026");
      expect(formatDate("1999-12-31")).toBe("Dec 31, 1999");
    });

    it("should handle empty or malformed strings gracefully", () => {
      expect(formatDate("")).toBe("");
      expect(formatDate("invalid-date-format")).toBe("invalid-date-format");
    });
  });
});
