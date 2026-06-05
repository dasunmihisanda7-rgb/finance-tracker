import React from 'react';
import { formatCurrency } from '../utils';

interface DashboardStatsProps {
  totalIncome: number;
  totalExpenses: number;
}

export default function DashboardStats({ totalIncome, totalExpenses }: DashboardStatsProps) {
  const netBalance = totalIncome - totalExpenses;
  const isPositive = netBalance >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Net Balance Card */}
      <div className="bg-white border border-slate-200 p-6 rounded-lg flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Balance</span>
          <h3 className={`text-2xl font-bold mt-2 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(netBalance)}
          </h3>
        </div>
        <div className="mt-4 flex items-center">
          {isPositive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
              <svg className="w-3 h-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Positive Balance
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-100">
              <svg className="w-3 h-3 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              Net Deficit
            </span>
          )}
        </div>
      </div>

      {/* Total Income Card */}
      <div className="bg-white border border-slate-200 p-6 rounded-lg flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Income</span>
          <h3 className="text-2xl font-bold mt-2 text-slate-900">
            {formatCurrency(totalIncome)}
          </h3>
        </div>
        <div className="mt-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
            <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
            Total Inflow
          </span>
        </div>
      </div>

      {/* Total Expenses Card */}
      <div className="bg-white border border-slate-200 p-6 rounded-lg flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Expenses</span>
          <h3 className="text-2xl font-bold mt-2 text-slate-900">
            {formatCurrency(totalExpenses)}
          </h3>
        </div>
        <div className="mt-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200">
            <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" transform="rotate(180 10 10)" />
            </svg>
            Total Outflow
          </span>
        </div>
      </div>
    </div>
  );
}
