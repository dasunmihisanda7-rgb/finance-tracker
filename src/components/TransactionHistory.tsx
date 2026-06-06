import React, { useState } from 'react';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';
import { formatCurrency, formatDate } from '../utils';

interface TransactionHistoryProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (transaction: Transaction) => void;
  editingTransactionId?: string;
}

export default function TransactionHistory({
  transactions,
  onDeleteTransaction,
  onEditTransaction,
  editingTransactionId,
}: TransactionHistoryProps) {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    if (!t) return false;
    const description = t.description || '';
    const category = t.category || '';
    const matchesSearch =
      description.toLowerCase().includes(search.toLowerCase()) ||
      category.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Sort transactions
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === 'date-asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortBy === 'amount-desc') {
      return b.amount - a.amount;
    }
    if (sortBy === 'amount-asc') {
      return a.amount - b.amount;
    }
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // If active page exceeds current total pages (due to filtering), jump back to page 1
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  // Determine selectable categories based on active type filter
  const activeCategories = 
    filterType === 'income' 
      ? INCOME_CATEGORIES 
      : filterType === 'expense' 
      ? EXPENSE_CATEGORIES 
      : [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  const handleTypeFilterChange = (val: 'all' | 'income' | 'expense') => {
    setFilterType(val);
    setFilterCategory('all');
    setCurrentPage(1);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-bold text-slate-900">Transaction History</h2>
        
        {/* Sorting controls */}
        <div className="flex items-center gap-2">
          <label htmlFor="sortBy" className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Sort by:
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc')}
            className="px-2 py-1.5 border border-slate-200 rounded-md text-xs bg-white text-slate-700 cursor-pointer"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Amount: High to Low</option>
            <option value="amount-asc">Amount: Low to High</option>
          </select>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Search */}
        <div>
          <input
            type="text"
            placeholder="Search description or category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-base sm:text-sm bg-white focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filter Type */}
        <div>
          <select
            value={filterType}
            onChange={(e) => handleTypeFilterChange(e.target.value as 'all' | 'income' | 'expense')}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-base sm:text-sm bg-white text-slate-700 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="income">Income Only</option>
            <option value="expense">Expense Only</option>
          </select>
        </div>

        {/* Filter Category */}
        <div>
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-base sm:text-sm bg-white text-slate-700 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {Array.from(new Set(activeCategories)).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Mobile List View (rendered on smaller screens) */}
      <div className="block sm:hidden space-y-3">
        {paginatedTransactions.length > 0 ? (
          paginatedTransactions.map((t) => (
            <div 
              key={t.id} 
              className={`p-4 border border-slate-200 rounded-lg flex flex-col gap-3 transition-colors ${
                editingTransactionId === t.id ? 'bg-blue-50/30 border-blue-300' : 'bg-slate-50/50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-900 text-sm truncate">{t.description}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-500">{formatDate(t.date)}</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {t.category}
                    </span>
                  </div>
                </div>
                <span className={`text-sm font-bold whitespace-nowrap text-right shrink-0 ${
                  t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount).replace(/^-/, '')}
                </span>
              </div>
              
              <div className="flex justify-end gap-4 border-t border-slate-200/50 pt-2">
                <button
                  onClick={() => onEditTransaction(t)}
                  className={`text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer ${
                    editingTransactionId === t.id ? 'underline' : ''
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this transaction?')) {
                      onDeleteTransaction(t.id);
                    }
                  }}
                  className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            <div className="flex flex-col items-center justify-center gap-2">
              <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>No transactions found.</span>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Tabular View (rendered on screens >= 640px) */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm text-slate-700">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Description</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedTransactions.length > 0 ? (
              paginatedTransactions.map((t) => (
                <tr 
                  key={t.id} 
                  className={`hover:bg-slate-50/50 transition-colors ${
                    editingTransactionId === t.id ? 'bg-blue-50/40' : ''
                  }`}
                >
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                    {formatDate(t.date)}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900 break-words max-w-[200px]">
                    {t.description}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                      {t.category}
                    </span>
                  </td>
                  <td className={`py-3.5 px-4 text-right font-semibold whitespace-nowrap ${
                    t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount).replace(/^-/, '')}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-center">
                    <div className="inline-flex items-center gap-3">
                      <button
                        onClick={() => onEditTransaction(t)}
                        className={`text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer ${
                          editingTransactionId === t.id ? 'underline' : ''
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this transaction?')) {
                            onDeleteTransaction(t.id);
                          }
                        }}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>No transactions found.</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination control panel */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-4 text-xs">
          <span className="text-slate-500">
            Showing Page <span className="font-semibold text-slate-900">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1.5 border border-slate-200 rounded text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
            >
              Prev
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1.5 border border-slate-200 rounded text-slate-600 font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
