'use client';

import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Transaction } from '../types';
import { formatCurrency } from '../utils';

interface CategoryChartsProps {
  transactions: Transaction[];
}

const INCOME_COLORS: Record<string, [string, string]> = {
  Salary: ['#34d399', '#059669'],      // Emerald 400 -> Emerald 600
  Freelance: ['#2dd4bf', '#0d9488'],   // Teal 400 -> Teal 600
  Investments: ['#60a5fa', '#2563eb'], // Blue 400 -> Blue 600
  Gifts: ['#a78bfa', '#7c3aed'],       // Violet 400 -> Violet 600
  Other: ['#94a3b8', '#475569'],       // Slate 400 -> Slate 600
};

const EXPENSE_COLORS: Record<string, [string, string]> = {
  'Food & Dining': ['#fb7185', '#e11d48'],   // Rose 400 -> Rose 600
  'Rent & Utilities': ['#fbbf24', '#d97706'], // Amber 400 -> Amber 600
  Transport: ['#38bdf8', '#0284c7'],          // Sky 400 -> Sky 600
  Shopping: ['#818cf8', '#4f46e5'],           // Indigo 400 -> Indigo 600
  Entertainment: ['#a78bfa', '#7c3aed'],      // Violet 400 -> Violet 600
  Groceries: ['#2dd4bf', '#0d9488'],          // Teal 400 -> Teal 600
  Healthcare: ['#34d399', '#059669'],         // Emerald 400 -> Emerald 600
  Other: ['#94a3b8', '#475569'],              // Slate 400 -> Slate 600
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
      colors: INCOME_COLORS[name] || ['#94a3b8', '#475569'],
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
      colors: EXPENSE_COLORS[name] || ['#94a3b8', '#475569'],
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const renderChartCard = (
    title: string,
    data: Array<{ name: string; value: number; percentage: number; colors: [string, string] }>,
    emptyMessage: string,
    gradientIdPrefix: string
  ) => {
    const hasData = data.length > 0;

    return (
      <div className="bg-white border border-slate-200 p-6 rounded-lg flex flex-col justify-between h-auto sm:h-[360px]">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">{title}</h3>
        
        {hasData ? (
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-4 items-center flex-grow h-auto sm:h-[260px]">
            {/* Chart Graphic Area */}
            <div className="sm:col-span-3 h-[200px] sm:h-full relative min-h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {data.map((entry, index) => (
                      <linearGradient key={`grad-${index}`} id={`${gradientIdPrefix}-${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={entry.colors[0]} stopOpacity={1}/>
                        <stop offset="100%" stopColor={entry.colors[1]} stopOpacity={1}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#${gradientIdPrefix}-${index})`} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            <div className="sm:col-span-2 overflow-y-auto max-h-[180px] sm:max-h-[240px] pr-1 space-y-2.5">
              {data.map((item) => (
                <div key={item.name} className="flex items-start justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ background: `linear-gradient(135deg, ${item.colors[0]} 0%, ${item.colors[1]} 100%)` }} 
                    />
                    <span className="font-medium text-slate-700 truncate max-w-[120px] sm:max-w-[90px]">{item.name}</span>
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
          <div className="flex flex-col items-center justify-center flex-grow py-12 text-slate-400 text-xs">
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
      {renderChartCard('Income Distribution', incomeData, 'No income data registered yet.', 'income-grad')}
      {renderChartCard('Expense Distribution', expenseData, 'No expense data registered yet.', 'expense-grad')}
    </div>
  );
}

