import { describe, it, expect } from "vitest";
import { RegisterSchema, LoginSchema, TransactionSchema } from "./validations";

describe("Validation Schemas", () => {
  describe("RegisterSchema", () => {
    it("should pass for valid email and password", () => {
      const result = RegisterSchema.safeParse({
        email: "user@example.com",
        password: "securepassword123",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@example.com");
      }
    });

    it("should reject invalid email formats", () => {
      const result1 = RegisterSchema.safeParse({ email: "invalid-email", password: "password" });
      const result2 = RegisterSchema.safeParse({ email: "user@", password: "password" });
      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });

    it("should reject short passwords less than 6 chars", () => {
      const result = RegisterSchema.safeParse({
        email: "user@example.com",
        password: "12345",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("LoginSchema", () => {
    it("should pass for non-empty fields", () => {
      const result = LoginSchema.safeParse({
        email: "user@example.com",
        password: "p",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty password", () => {
      const result = LoginSchema.safeParse({
        email: "user@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("TransactionSchema", () => {
    it("should pass for matching income category", () => {
      const result = TransactionSchema.safeParse({
        type: "income",
        category: "Salary",
        amount: 25000.5,
        date: "2026-06-05",
        description: "Monthly direct deposit",
      });
      expect(result.success).toBe(true);
    });

    it("should pass for matching expense category", () => {
      const result = TransactionSchema.safeParse({
        type: "expense",
        category: "Food & Dining",
        amount: 1500,
        date: "2026-06-05",
        description: "Dinner out",
      });
      expect(result.success).toBe(true);
    });

    it("should reject incorrect category mappings (e.g. food in income)", () => {
      const result = TransactionSchema.safeParse({
        type: "income",
        category: "Food & Dining",
        amount: 500,
        date: "2026-06-05",
        description: "Invalid",
      });
      expect(result.success).toBe(false);
    });

    it("should reject zero or negative amounts", () => {
      const result1 = TransactionSchema.safeParse({
        type: "expense",
        category: "Transport",
        amount: 0,
        date: "2026-06-05",
        description: "Bus",
      });
      const result2 = TransactionSchema.safeParse({
        type: "expense",
        category: "Transport",
        amount: -10.5,
        date: "2026-06-05",
        description: "Bus",
      });
      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });

    it("should reject invalid date format strings", () => {
      const result = TransactionSchema.safeParse({
        type: "expense",
        category: "Shopping",
        amount: 100,
        date: "06-05-2026",
        description: "Shoes",
      });
      expect(result.success).toBe(false);
    });
  });
});
