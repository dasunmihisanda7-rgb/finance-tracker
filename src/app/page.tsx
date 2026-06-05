'use client';

import React, { useState, useMemo } from 'react';
import { useSession, signOut } from 'next-auth/react';
import useSWR from 'swr';
import { Transaction } from '../types';
import DashboardStats from '../components/DashboardStats';
import TransactionForm from '../components/TransactionForm';
import TransactionHistory from '../components/TransactionHistory';
import CategoryCharts from '../components/CategoryCharts';
import AuthScreen from '../components/AuthScreen';

export default function Home() {
  const { data: session, status } = useSession();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // SWR Fetcher
  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Failed to fetch transactions');
    }
    return res.json();
  };

  // SWR Hook for transactions caching & revalidation
  const {
    data: transactions = [],
    error,
    mutate,
    isLoading: isSWRLoading,
  } = useSWR<Transaction[]>(status === 'authenticated' ? '/api/transactions' : null, fetcher);

  const isLoaded = !isSWRLoading && !error;

  // Compute stats
  const { totalIncome, totalExpenses } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    transactions.forEach((t) => {
      if (!t) return;
      const amt = t.amount || 0;
      if (t.type === 'income') {
        income += amt;
      } else {
        expenses += amt;
      }
    });
    return { totalIncome: income, totalExpenses: expenses };
  }, [transactions]);

  // CRUD Operations via SWR Optimistic Mutate
  const handleAddTransaction = async (newTxData: Omit<Transaction, 'id'>) => {
    const tempId = 'temp-id-' + Date.now();
    const optimisticTx: Transaction = {
      ...newTxData,
      id: tempId,
    };

    try {
      await mutate(
        async () => {
          const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTxData),
          });
          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Server error');
          }
          return response.json();
        },
        {
          optimisticData: [optimisticTx, ...transactions],
          rollbackOnError: true,
          populateCache: (newTx: Transaction, currentTxs: Transaction[] | undefined) => {
            return [newTx, ...(currentTxs || [])].filter((t) => t.id !== tempId);
          },
          revalidate: false,
        }
      );
    } catch (err: any) {
      console.error('Error adding transaction:', err);
      alert(`Failed to add transaction: ${err.message || 'Server error'}`);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await mutate(
        async () => {
          const response = await fetch(`/api/transactions/${id}`, {
            method: 'DELETE',
          });
          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Server error');
          }
          return transactions.filter((t) => t.id !== id);
        },
        {
          optimisticData: transactions.filter((t) => t.id !== id),
          rollbackOnError: true,
          revalidate: false,
        }
      );
      if (editingTransaction?.id === id) {
        setEditingTransaction(null);
      }
    } catch (err: any) {
      console.error('Error deleting transaction:', err);
      alert(`Failed to delete transaction: ${err.message || 'Server error'}`);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    const formElement = document.getElementById('transaction-form-container');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleUpdateTransaction = async (updatedTx: Transaction) => {
    try {
      await mutate(
        async () => {
          const response = await fetch(`/api/transactions/${updatedTx.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTx),
          });
          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Server error');
          }
          return response.json();
        },
        {
          optimisticData: transactions.map((t) => (t.id === updatedTx.id ? updatedTx : t)),
          rollbackOnError: true,
          populateCache: (updated: Transaction, currentTxs: Transaction[] | undefined) => {
            return (currentTxs || []).map((t) => (t.id === updated.id ? updated : t));
          },
          revalidate: false,
        }
      );
      setEditingTransaction(null);
    } catch (err: any) {
      console.error('Error updating transaction:', err);
      alert(`Failed to update transaction: ${err.message || 'Server error'}`);
    }
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
  };

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-sans">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-slate-900 mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <div className="text-sm font-semibold text-slate-500">
            Verifying session...
          </div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col flex-grow min-h-screen bg-slate-50 justify-center">
        <AuthScreen />
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-grow min-h-screen bg-slate-50">
      {/* Top clean header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Minimalist abstract Logo */}
            <div className="w-8 h-8 bg-slate-900 flex items-center justify-center rounded">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">FinanceTracker</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Minimalist Finance Manager</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-900">{session?.user?.email}</p>
              <p className="text-[10px] font-medium text-slate-400">Signed In</p>
            </div>
            <button
              onClick={() => signOut()}
              className="text-xs font-semibold px-3 py-1.5 border border-slate-200 rounded-md hover:bg-slate-50 transition-all text-slate-700 cursor-pointer shadow-sm active:scale-95 bg-white"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main dashboard content area */}
      <main className="max-w-6xl w-full mx-auto px-4 py-8 flex-grow">
        {isLoaded ? (
          <>
            {/* Dashboard Overview Cards */}
            <DashboardStats totalIncome={totalIncome} totalExpenses={totalExpenses} />

            {/* Category Breakdown Charts */}
            <CategoryCharts transactions={transactions} />

            {/* Split layout: Form on Left, History on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Form container */}
              <div id="transaction-form-container" className="lg:col-span-1">
                <TransactionForm
                  onAddTransaction={handleAddTransaction}
                  editingTransaction={editingTransaction}
                  onUpdateTransaction={handleUpdateTransaction}
                  onCancelEdit={handleCancelEdit}
                />
              </div>

              {/* History container */}
              <div className="lg:col-span-2">
                <TransactionHistory
                  transactions={transactions}
                  onDeleteTransaction={handleDeleteTransaction}
                  onEditTransaction={handleEditTransaction}
                  editingTransactionId={editingTransaction?.id}
                />
              </div>
            </div>
          </>
        ) : (
          /* Elegant flat loading state */
          <div className="py-24 text-center">
            <div className="inline-block animate-pulse text-sm font-semibold text-slate-400">
              Loading financial database...
            </div>
          </div>
        )}
      </main>

      {/* Flat minimalist footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 font-medium mt-auto">
        <div className="max-w-6xl mx-auto px-4">
          &copy; {new Date().getFullYear()} FinanceTracker. Flat UI Edition. Formatted in Rs. (Millions).
        </div>
      </footer>
    </div>
  );
}
