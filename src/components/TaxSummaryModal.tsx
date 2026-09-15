import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  Download,
  IndianRupee,
  FileCheck,
  Receipt,
  Info,
} from 'lucide-react';
import { Expense } from '../types';
import { getCategoryMeta } from '../data/categories';
import { formatCurrency, formatDate, exportTaxReportCSV } from '../utils/formatters';

interface TaxSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
}

export const TaxSummaryModal: React.FC<TaxSummaryModalProps> = ({
  isOpen,
  onClose,
  expenses,
}) => {
  const [selectedSlab, setSelectedSlab] = useState<number>(20); // 10%, 20%, or 30% income tax slab

  if (!isOpen) return null;

  const deductibleExpenses = expenses.filter((e) => e.isTaxDeductible);
  const totalDeductible = deductibleExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const estimatedSavings = Math.round(totalDeductible * (selectedSlab / 100));

  // Category breakdown of deductible outlays
  const catBreakdown: Record<string, { total: number; count: number }> = {};
  deductibleExpenses.forEach((e) => {
    if (!catBreakdown[e.category]) {
      catBreakdown[e.category] = { total: 0, count: 0 };
    }
    catBreakdown[e.category].total += Number(e.amount) || 0;
    catBreakdown[e.category].count += 1;
  });

  const sortedCats = Object.entries(catBreakdown).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Tax Deductions &amp; FY Savings Report
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Track deductible expenses (Section 80D, business utilities, medical &amp; donations)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Total Deductible Spend
              </span>
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-1 block">
                {formatCurrency(totalDeductible)}
              </span>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                Across {deductibleExpenses.length} transactions
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                Est. Tax Savings ({selectedSlab}% Slab)
              </span>
              <span className="text-lg font-bold text-emerald-900 dark:text-emerald-300 mt-1 block">
                {formatCurrency(estimatedSavings)}
              </span>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5 block">
                Potential liability reduction
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1">
                Income Tax Slab
              </span>
              <div className="flex gap-1">
                {[10, 20, 30].map((slab) => (
                  <button
                    key={slab}
                    type="button"
                    onClick={() => setSelectedSlab(slab)}
                    className={`flex-1 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      selectedSlab === slab
                        ? 'bg-zinc-900 dark:bg-emerald-600 text-white'
                        : 'bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-600'
                    }`}
                  >
                    {slab}%
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 block">
                Select applicable tax bracket
              </span>
            </div>
          </div>

          {/* Category Breakdown */}
          {sortedCats.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider block mb-2">
                Deductions by Category
              </span>
              <div className="space-y-2">
                {sortedCats.map(([catName, data]) => {
                  const meta = getCategoryMeta(catName);
                  const pct = totalDeductible > 0 ? (data.total / totalDeductible) * 100 : 0;
                  return (
                    <div
                      key={catName}
                      className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40"
                    >
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: meta.color }}
                          />
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {catName}
                          </span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            ({data.count} items)
                          </span>
                        </div>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(data.total)}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Itemized Deductible Transactions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Eligible Items ({deductibleExpenses.length})
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Flagged in your ledger
              </span>
            </div>

            {deductibleExpenses.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700 text-center text-xs text-zinc-500 dark:text-zinc-400">
                No tax-deductible expenses flagged yet. You can check "Eligible for Tax Deduction" when adding or editing an expense.
              </div>
            ) : (
              <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                {deductibleExpenses.map((e) => (
                  <div
                    key={e.id}
                    className="p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                        {e.merchant}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        <span>{formatDate(e.date)}</span>
                        <span>•</span>
                        <span>{e.category}</span>
                        {e.notes && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[140px]">{e.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 shrink-0">
                      {formatCurrency(e.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            onClick={() => exportTaxReportCSV(expenses)}
            disabled={deductibleExpenses.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Tax Report (CSV)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
