import React from 'react';
import {
  TrendingDown,
  PieChart,
  Repeat,
  IndianRupee,
  Calendar,
  Target,
  AlertTriangle,
} from 'lucide-react';
import { Expense, BudgetSettings, TimeHorizon } from '../types';
import { formatCurrency } from '../utils/formatters';

interface OverviewMetricsProps {
  expenses: Expense[];
  timeRange: TimeHorizon;
  onTimeRangeChange: (range: TimeHorizon) => void;
  budgetSettings?: BudgetSettings;
  onOpenBudgetModal?: () => void;
}

export const OverviewMetrics: React.FC<OverviewMetricsProps> = ({
  expenses,
  timeRange,
  onTimeRangeChange,
  budgetSettings,
  onOpenBudgetModal,
}) => {
  const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const needs = expenses
    .filter((e) => e.necessity === 'need')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const wants = expenses
    .filter((e) => e.necessity === 'want')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const savings = expenses
    .filter((e) => e.necessity === 'savings_investment')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const needsPct = total > 0 ? Math.round((needs / total) * 100) : 0;
  const wantsPct = total > 0 ? Math.round((wants / total) * 100) : 0;
  const savingsPct = total > 0 ? Math.round((savings / total) * 100) : 0;

  // Compute daily spending velocity based on unique dates in set
  const uniqueDates = new Set(expenses.map((e) => e.date).filter(Boolean));
  const daysCount = Math.max(1, uniqueDates.size);
  const dailyAverage = total / daysCount;

  // Top category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (Number(e.amount) || 0);
  });
  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
  const topCategory = sortedCategories[0] || ['None', 0];
  const topCategoryPct = total > 0 ? Math.round((topCategory[1] / total) * 100) : 0;

  // Recurring subscription count & total
  const recurringExpenses = expenses.filter((e) => e.isRecurring);
  const recurringTotal = recurringExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Budget calculations
  const monthlyLimit = budgetSettings?.overallMonthlyBudget || 60000;
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = Math.max(1, daysInMonth - now.getDate());
  const budgetSpentPct = monthlyLimit > 0 ? Math.round((total / monthlyLimit) * 100) : 0;
  const remainingBudget = monthlyLimit - total;
  const safeDailySpend = Math.max(0, Math.round(remainingBudget / daysLeft));
  const isOverBudget = total > monthlyLimit;

  return (
    <div className="space-y-4">
      {/* Time filter selector bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
            Spending Horizon
          </span>
        </div>
        <div className="inline-flex p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-medium flex-wrap gap-1">
          <button
            id="btn-range-all"
            onClick={() => onTimeRangeChange('all')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              timeRange === 'all'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            All Activity
          </button>
          <button
            id="btn-range-this-month"
            onClick={() => onTimeRangeChange('thisMonth')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              timeRange === 'thisMonth'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            This Month
          </button>
          <button
            id="btn-range-last-month"
            onClick={() => onTimeRangeChange('lastMonth')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              timeRange === 'lastMonth'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Previous Month
          </button>
          <button
            id="btn-range-30days"
            onClick={() => onTimeRangeChange('30days')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              timeRange === '30days'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Last 30 Days
          </button>
          <button
            id="btn-range-ytd"
            onClick={() => onTimeRangeChange('ytd')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
              timeRange === 'ytd'
                ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-xs font-semibold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            This Year (FY)
          </button>
        </div>
      </div>

      {/* Budget Status Banner if applicable */}
      {budgetSettings && onOpenBudgetModal && (
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-850/80 border border-zinc-200 dark:border-zinc-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isOverBudget
                  ? 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {isOverBudget ? <AlertTriangle className="w-5 h-5" /> : <Target className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Monthly Budget Target: {formatCurrency(monthlyLimit)}
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    isOverBudget
                      ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                      : budgetSpentPct > 80
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {budgetSpentPct}% utilized
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                {isOverBudget ? (
                  <span className="text-red-600 dark:text-red-400 font-semibold">
                    Exceeded monthly limit by {formatCurrency(total - monthlyLimit)}!
                  </span>
                ) : (
                  <span>
                    {formatCurrency(remainingBudget)} remaining safe spend ({formatCurrency(safeDailySpend)}/day for next {daysLeft} days)
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenBudgetModal}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer shadow-2xs"
          >
            Adjust Budget Caps
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Total Outlay
            </span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {formatCurrency(total)}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">({expenses.length} records)</span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Avg. {formatCurrency(dailyAverage)} / active day across {daysCount} days
          </p>
        </div>

        {/* 50/30/20 Ratio */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              50/30/20 Split
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1.5 font-semibold text-xs">
            <span className="text-sky-700 dark:text-sky-400">{needsPct}% Needs</span>
            <span className="text-zinc-300 dark:text-zinc-600">•</span>
            <span className="text-amber-700 dark:text-amber-400">{wantsPct}% Wants</span>
            <span className="text-zinc-300 dark:text-zinc-600">•</span>
            <span className="text-emerald-700 dark:text-emerald-400">{savingsPct}% Save</span>
          </div>
          {/* Segmented mini progress bar */}
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden flex mt-2">
            <div
              style={{ width: `${needsPct}%` }}
              className="bg-sky-500 h-full transition-all duration-300"
              title={`Needs: ${needsPct}%`}
            />
            <div
              style={{ width: `${wantsPct}%` }}
              className="bg-amber-500 h-full transition-all duration-300"
              title={`Wants: ${wantsPct}%`}
            />
            <div
              style={{ width: `${savingsPct}%` }}
              className="bg-emerald-500 h-full transition-all duration-300"
              title={`Savings: ${savingsPct}%`}
            />
          </div>
          <p className="mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            Target: 50% Essentials, 30% Lifestyle, 20% Savings
          </p>
        </div>

        {/* Top Category */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Lead Expense Driver
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-base font-bold text-zinc-900 dark:text-zinc-100 truncate block">
              {topCategory[0]}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {formatCurrency(topCategory[1])}
              </span>
              <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded">
                {topCategoryPct}% of total
              </span>
            </div>
          </div>
        </div>

        {/* Recurring Subscriptions */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
              Recurring Outlays
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              {formatCurrency(recurringTotal)}
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              ({recurringExpenses.length} recurring)
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Detected subscriptions, rent, utilities &amp; deposits
          </p>
        </div>
      </div>
    </div>
  );
};

