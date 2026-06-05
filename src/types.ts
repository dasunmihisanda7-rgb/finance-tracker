export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  date: string;
  description: string;
}

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Gifts',
  'Other'
] as const;

export const EXPENSE_CATEGORIES = [
  'Food & Dining',
  'Rent & Utilities',
  'Transport',
  'Shopping',
  'Entertainment',
  'Groceries',
  'Healthcare',
  'Other'
] as const;

export type IncomeCategory = typeof INCOME_CATEGORIES[number];
export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
