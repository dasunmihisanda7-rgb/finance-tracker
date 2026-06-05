'use client';

import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Transaction } from '../types';
import { formatCurrency } from '../utils';

interface CategoryChartsProps {
  transactions: Transaction[];
}

const INCOME_COLORS: Record<string, string> = {
  Salary: '#10b981',      // Emerald 500
  Freelance: '#14b8a6',   // Teal 500
  Investments: '#3b82f6', // Blue 500
  Gifts: '#8b5cf6',       // Violet 500
  Other: '#94a3b8',       // Slate 400
};

const EXPENSE_COLORS: Record<string, string> = {
  'Food & Dining': '#f43f5e',   // Rose 500
  'Rent & Utilities': '#f59e0b', // Amber 500
  Transport: '#0ea5e9',          // Sky 500
  Shopping: '#6366f1',           // Indigo 500
  Entertainment: '#8b5cf6',      // Violet 500
  Groceries: '#14b8a6',          // Teal 500
  Healthcare: '#10b981',         // Emerald 500
  Other: '#94a3b8',              // Slate 400
};

export default function CategoryCharts({ transactions }: CategoryChartsProps) {
  // Aggregate Income by Category
  const incomeData = useMemo(() => {
    const categories: Record<string, number> = {};
    let total = 0;
    
    transactions.forEach((t) => {
      if (t.type === 'income') {
        const amt = t.amount || 0;
        categories[t.category] = (categories[t.category] || 0) + amt;
        total += amt;
      }
    });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
      color: INCOME_COLORS[name] || '#64748b',
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Aggregate Expense by Category
  const expenseData = useMemo(() => {
    const categories: Record<string, number> = {};
    let total = 0;
    
    transactions.forEach((t) => {
      if (t.type === 'expense') {
        const amt = t.amount || 0;
        categories[t.category] = (categories[t.category] || 0) + amt;
        total += amt;
      }
    });

    return Object.entries(categories).map(([name, value]) => ({
      name,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
      color: EXPENSE_COLORS[name] || '#64748b',
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const renderChartCard = (
    title: string,
    data: Array<{ name: string; value: number; percentage: number; color: string }>,
    emptyMessage: string
  ) => {
    const hasData = data.length > 0;

    return (
      <div className="bg-white border border-slate-200 p-6 rounded-lg flex flex-col justify-between h-[360px]">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{title}</h3>
        
        {hasData ? (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-center flex-grow h-[260px]">
            {/* Chart Graphic Area */}
            <div className="sm:col-span-3 h-full relative min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Amount']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '0.375rem',
                      boxShadow: 'none',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-geist-sans), sans-serif',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            {/* Text Legend Area */}
            <div className="sm:col-span-2 overflow-y-auto max-h-[240px] pr-1 space-y-2.5">
              {data.map((item) => (
                <div key={item.name} className="flex items-start justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: item.color }} 
                    />
                    <span className="font-medium text-slate-700 truncate max-w-[90px]">{item.name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-semibold text-slate-900">{item.percentage.toFixed(0)}%</span>
                    <p className="text-[10px] text-slate-400">{formatCurrency(item.value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-grow text-slate-400 text-xs">
            <svg className="w-8 h-8 text-slate-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
            <span>{emptyMessage}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {renderChartCard('Income Distribution', incomeData, 'No income data registered yet.')}
      {renderChartCard('Expense Distribution', expenseData, 'No expense data registered yet.')}
    </div>
  );
}
