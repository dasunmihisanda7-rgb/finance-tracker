import React, { useState } from 'react';
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
  const [type, setType] = useState<TransactionType>(editingTransaction?.type || 'expense');
  const [date, setDate] = useState<string>(() => {
    if (editingTransaction) return editingTransaction.date;
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [category, setCategory] = useState<string>(
    editingTransaction?.category || (editingTransaction?.type === 'income' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0])
  );
  const [amount, setAmount] = useState<string>(editingTransaction ? String(editingTransaction.amount) : '');
  const [description, setDescription] = useState<string>(editingTransaction?.description || '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const newCategories = newType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    if (!newCategories.some(c => c === category)) {
      setCategory(newCategories[0]);
    }
  };

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
    <div className="bg-card border border-border p-6 rounded-lg">
      <h2 className="text-lg font-bold text-slate-100 mb-6">
        {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Transaction Type Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Transaction Type
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-surface border border-border rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated'
              }`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-surface-elevated'
              }`}
            >
              Income
            </button>
          </div>
          {errors.type && (
            <p className="text-[11px] text-rose-400 mt-1 font-medium">{errors.type}</p>
          )}
        </div>

        {/* Amount Input */}
        <div>
          <label htmlFor="amount" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Amount (Rs.)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 text-sm font-medium">
              Rs.
            </span>
            <input
              type="number"
              id="amount"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full pl-10 pr-3 py-2 border rounded-lg text-base sm:text-sm bg-surface focus:outline-none focus:ring-1 transition-colors text-slate-200 placeholder:text-slate-600 ${
                errors.amount
                  ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500'
                  : 'border-border focus:ring-emerald-500 focus:border-emerald-500'
              }`}
            />
          </div>
          {errors.amount && (
            <p className="text-[11px] text-rose-400 mt-1.5 font-medium">{errors.amount}</p>
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
            suppressHydrationWarning={true}
            onChange={(e) => setDate(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg text-base sm:text-sm bg-surface focus:outline-none focus:ring-1 transition-colors text-slate-200 ${
              errors.date
                ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500'
                : 'border-border focus:ring-emerald-500 focus:border-emerald-500'
            }`}
          />
          {errors.date && (
            <p className="text-[11px] text-rose-400 mt-1.5 font-medium">{errors.date}</p>
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
            className={`w-full px-3 py-2 border rounded-lg text-base sm:text-sm bg-surface focus:outline-none focus:ring-1 transition-colors text-slate-200 ${
              errors.category
                ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500'
                : 'border-border focus:ring-emerald-500 focus:border-emerald-500'
            }`}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-[11px] text-rose-400 mt-1.5 font-medium">{errors.category}</p>
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
            className={`w-full px-3 py-2 border rounded-lg text-base sm:text-sm bg-surface focus:outline-none focus:ring-1 transition-colors text-slate-200 placeholder:text-slate-600 ${
              errors.description
                ? 'border-rose-500/50 focus:ring-rose-500 focus:border-rose-500'
                : 'border-border focus:ring-emerald-500 focus:border-emerald-500'
            }`}
          />
          {errors.description && (
            <p className="text-[11px] text-rose-400 mt-1.5 font-medium">{errors.description}</p>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-3 pt-2">
          {editingTransaction && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 py-2 px-4 border border-border text-slate-400 rounded-lg text-sm font-medium hover:bg-surface-elevated hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className={`flex-1 py-2 px-4 text-white rounded-lg text-sm font-semibold transition-all cursor-pointer active:scale-[0.98] ${
              type === 'expense'
                ? 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-500/20'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20'
            }`}
          >
            {editingTransaction ? 'Save Changes' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
}
