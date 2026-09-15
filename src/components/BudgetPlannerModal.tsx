import React, { useState } from 'react';
import {
  Target,
  X,
  Sparkles,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { BudgetSettings, Expense } from '../types';
import { CATEGORIES, getCategoryMeta } from '../data/categories';
import { formatCurrency } from '../utils/formatters';

interface BudgetPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  budgetSettings: BudgetSettings;
  onSaveBudgetSettings: (settings: BudgetSettings) => void;
  currentMonthExpenses: Expense[];
}

export const BudgetPlannerModal: React.FC<BudgetPlannerModalProps> = ({
  isOpen,
  onClose,
  budgetSettings,
  onSaveBudgetSettings,
  currentMonthExpenses,
}) => {
  const [overallLimit, setOverallLimit] = useState<number>(budgetSettings.overallMonthlyBudget || 60000);
  const [categoryLimits, setCategoryLimits] = useState<Record<string, number>>({
    ...budgetSettings.categoryBudgets,
  });

  if (!isOpen) return null;

  // Calculate actual current month spending per category
  const actualSpentByCategory: Record<string, number> = {};
  let totalCurrentMonthSpent = 0;

  currentMonthExpenses.forEach((e) => {
    const amt = Number(e.amount) || 0;
    actualSpentByCategory[e.category] = (actualSpentByCategory[e.category] || 0) + amt;
    totalCurrentMonthSpent += amt;
  });

  const handleCategoryLimitChange = (categoryName: string, value: string) => {
    const num = parseFloat(value) || 0;
    setCategoryLimits((prev) => ({
      ...prev,
      [categoryName]: num,
    }));
  };

  const handleAutoSuggest = () => {
    // Set overall budget to rounded actual spent + 15% buffer
    const suggestedOverall = Math.max(25000, Math.round((totalCurrentMonthSpent * 1.15) / 1000) * 1000);
    setOverallLimit(suggestedOverall);

    const newCatLimits: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      const spent = actualSpentByCategory[cat.name] || 0;
      if (spent > 0) {
        newCatLimits[cat.name] = Math.round((spent * 1.15) / 500) * 500;
      } else {
        // Defaults based on typical budget allocations
        if (cat.name === 'Housing & Rent') newCatLimits[cat.name] = 20000;
        else if (cat.name === 'Groceries & Essentials') newCatLimits[cat.name] = 12000;
        else if (cat.name === 'Dining & Food Delivery') newCatLimits[cat.name] = 6000;
        else if (cat.name === 'Transportation') newCatLimits[cat.name] = 5000;
        else if (cat.name === 'Utilities & Bills') newCatLimits[cat.name] = 4000;
        else newCatLimits[cat.name] = 3000;
      }
    });

    setCategoryLimits(newCatLimits);
  };

  const handleSave = () => {
    onSaveBudgetSettings({
      overallMonthlyBudget: overallLimit,
      categoryBudgets: categoryLimits,
    });
    onClose();
  };

  // Sum of category allocations
  const sumOfCategories: number = (Object.values(categoryLimits) as number[]).reduce(
    (a: number, b: number) => a + (Number(b) || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Monthly Budget &amp; Spending Caps
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Set monthly financial ceilings to monitor overspending in real time
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
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Quick Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
            <div>
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                Smart Auto-Suggest
              </span>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Calculates category caps automatically based on your tracked spending (+15% cushion)
              </span>
            </div>
            <button
              type="button"
              onClick={handleAutoSuggest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-xs font-semibold text-zinc-800 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-600 shadow-2xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
              <span>Auto-Fill Recommendations</span>
            </button>
          </div>

          {/* Overall Monthly Budget */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
              Overall Monthly Spending Limit (₹ INR)
            </label>
            <div className="relative max-w-xs">
              <span className="absolute left-3 top-2.5 text-xs text-zinc-500 dark:text-zinc-400 font-bold">
                ₹
              </span>
              <input
                type="number"
                step="1000"
                value={overallLimit}
                onChange={(e) => setOverallLimit(parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mt-1.5">
              <span>This month's tracked total: {formatCurrency(totalCurrentMonthSpent)}</span>
              <span>
                {totalCurrentMonthSpent > overallLimit ? (
                  <span className="text-red-600 dark:text-red-400 font-medium">
                    Over budget by {formatCurrency(totalCurrentMonthSpent - overallLimit)}
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    {formatCurrency(overallLimit - totalCurrentMonthSpent)} remaining safe spend
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Category Budgets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Category Monthly Ceilings
              </label>
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Sum of caps: {formatCurrency(sumOfCategories)}
              </span>
            </div>

            <div className="space-y-3">
              {CATEGORIES.map((cat) => {
                const limit = categoryLimits[cat.name] || 0;
                const spent = actualSpentByCategory[cat.name] || 0;
                const percent = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
                const isOver = limit > 0 && spent > limit;

                return (
                  <div
                    key={cat.id}
                    className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {cat.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Spent: {formatCurrency(spent)}
                        </span>
                        <div className="relative w-28">
                          <span className="absolute left-2.5 top-1 text-xs text-zinc-400 font-medium">
                            ₹
                          </span>
                          <input
                            type="number"
                            step="500"
                            value={limit || ''}
                            placeholder="No limit"
                            onChange={(e) => handleCategoryLimitChange(cat.name, e.target.value)}
                            className="w-full pl-6 pr-2 py-1 text-xs bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>
                      </div>
                    </div>

                    {limit > 0 && (
                      <div>
                        <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isOver
                                ? 'bg-red-500'
                                : percent > 80
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">
                          <span>{percent}% used</span>
                          {isOver ? (
                            <span className="text-red-600 dark:text-red-400 font-semibold">
                              Exceeded by {formatCurrency(spent - limit)}
                            </span>
                          ) : (
                            <span>{formatCurrency(limit - spent)} left</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs cursor-pointer transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Budget Limits</span>
          </button>
        </div>
      </div>
    </div>
  );
};
