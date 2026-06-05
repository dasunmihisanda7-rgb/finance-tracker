import React, { useState, useEffect } from 'react';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES, TransactionType } from '../types';
import { TransactionSchema } from '../lib/validations';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  editingTransaction: Transaction | null;
  onUpdateTransaction: (transaction: Transaction) => void;
  onCancelEdit: () => void;
}

export default function TransactionForm({
  onAddTransaction,
  editingTransaction,
  onUpdateTransaction,
  onCancelEdit,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [date, setDate] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Set default date to today's date in local time YYYY-MM-DD
  useEffect(() => {
    if (!editingTransaction) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);
    }
  }, [editingTransaction]);

  // Load transaction when editing
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setDate(editingTransaction.date);
      setCategory(editingTransaction.category);
      setAmount(String(editingTransaction.amount));
      setDescription(editingTransaction.description);
      setErrors({});
    } else {
      // Reset after edit cancelled or completed
      setType('expense');
      setCategory('');
      setAmount('');
      setDescription('');
      setErrors({});
    }
  }, [editingTransaction]);

  // Sync category list when type changes
  useEffect(() => {
    const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    // Only set default if currently selected category is not in the new type's categories list
    if (!categories.includes(category as any)) {
      setCategory(categories[0]);
    }
  }, [type, category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const parsedAmount = parseFloat(amount);
    
    // Validate using Zod schema
    const result = TransactionSchema.safeParse({
      type,
      category,
      amount: isNaN(parsedAmount) ? undefined : parsedAmount,
      date,
      description: description.trim(),
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    const validData = result.data;

    if (editingTransaction) {
      onUpdateTransaction({
        ...editingTransaction,
        ...validData,
      });
    } else {
      onAddTransaction(validData);
      // Reset inputs (except date)
      setAmount('');
      setDescription('');
    }
  };

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-lg">
      <h2 className="text-lg font-bold text-slate-900 mb-6">
        {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Transaction Type Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 border border-slate-200 rounded-lg">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Income
            </button>
          </div>
          {errors.type && (
            <p className="text-[11px] text-rose-600 mt-1 font-medium">{errors.type}</p>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Amount (Rs.)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-sm font-medium">
              Rs.
            </span>
            <input
              type="number"
              id="amount"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-1 transition-colors ${
                errors.amount
                  ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-slate-900 focus:border-slate-900'
              }`}
            />
          </div>
          {errors.amount && (
            <p className="text-[11px] text-rose-600 mt-1.5 font-medium">{errors.amount}</p>
          )}
        </div>

        {/* Date Input */}
        <div>
          <label htmlFor="date" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Date
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-1 transition-colors ${
              errors.date
                ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                : 'border-slate-200 focus:ring-slate-900 focus:border-slate-900'
            }`}
          />
          {errors.date && (
            <p className="text-[11px] text-rose-600 mt-1.5 font-medium">{errors.date}</p>
          )}
        </div>

        {/* Category Select */}
        <div>
          <label htmlFor="category" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-1 transition-colors ${
              errors.category
                ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                : 'border-slate-200 focus:ring-slate-900 focus:border-slate-900'
            }`}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-[11px] text-rose-600 mt-1.5 font-medium">{errors.category}</p>
          )}
        </div>

        {/* Description Input */}
        <div>
          <label htmlFor="description" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Description
          </label>
          <input
            type="text"
            id="description"
            placeholder="e.g., Weekly Groceries, Monthly Salary"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-1 transition-colors ${
              errors.description
                ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                : 'border-slate-200 focus:ring-slate-900 focus:border-slate-900'
            }`}
          />
          {errors.description && (
            <p className="text-[11px] text-rose-600 mt-1.5 font-medium">{errors.description}</p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-2">
          {editingTransaction && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 py-2 px-4 border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className={`flex-1 py-2 px-4 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
              type === 'expense'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {editingTransaction ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}
