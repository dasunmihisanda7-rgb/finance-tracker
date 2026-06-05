import { z } from "zod";
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from "../types";

export const RegisterSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

export const TransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Category is required"),
  amount: z.number({ message: "Amount must be a valid number" }).positive("Amount must be a positive number"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  description: z.string().min(1, "Description is required").max(100, "Description cannot exceed 100 characters").trim(),
}).refine((data) => {
  const validCategories = data.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return (validCategories as readonly string[]).includes(data.category);
}, {
  message: "Invalid category for the selected transaction type",
  path: ["category"],
});
