import React, { useState } from 'react';
import {
  PieChart as PieIcon,
  TrendingUp,
  Layers,
  Store,
  Info,
} from 'lucide-react';
import { Expense } from '../types';
import { getCategoryMeta } from '../data/categories';
import { formatCurrency, formatDate } from '../utils/formatters';

interface SpendingPatternsViewProps {
  expenses: Expense[];
  onSelectCategory?: (category: string) => void;
}

export const SpendingPatternsView: React.FC<SpendingPatternsViewProps> = ({
  expenses,
  onSelectCategory,
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState<{
    date: string;
    amount: number;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // 1. Category aggregation
  const categoryMap: Record<string, { total: number; count: number; items: Expense[] }> = {};
  expenses.forEach((e) => {
    if (!categoryMap[e.category]) {
      categoryMap[e.category] = { total: 0, count: 0, items: [] };
    }
    categoryMap[e.category].total += Number(e.amount) || 0;
    categoryMap[e.category].count += 1;
    categoryMap[e.category].items.push(e);
  });

  const categoriesSorted = Object.entries(categoryMap)
    .map(([catName, data]) => ({
      name: catName,
      total: data.total,
      count: data.count,
      pct: totalSpent > 0 ? (data.total / totalSpent) * 100 : 0,
      meta: getCategoryMeta(catName),
    }))
    .sort((a, b) => b.total - a.total);

  // 2. 50/30/20 breakdown
  const needsTotal = expenses
    .filter((e) => e.necessity === 'need')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const wantsTotal = expenses
    .filter((e) => e.necessity === 'want')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const savingsTotal = expenses
    .filter((e) => e.necessity === 'savings_investment')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const needsPct = totalSpent > 0 ? (needsTotal / totalSpent) * 100 : 0;
  const wantsPct = totalSpent > 0 ? (wantsTotal / totalSpent) * 100 : 0;
  const savingsPct = totalSpent > 0 ? (savingsTotal / totalSpent) * 100 : 0;

  // 3. Top Merchants
  const merchantMap: Record<string, { total: number; count: number; category: string }> = {};
  expenses.forEach((e) => {
    const key = e.merchant || 'Unknown';
    if (!merchantMap[key]) {
      merchantMap[key] = { total: 0, count: 0, category: e.category };
    }
    merchantMap[key].total += Number(e.amount) || 0;
    merchantMap[key].count += 1;
  });
  const topMerchants = Object.entries(merchantMap)
    .map(([merchant, data]) => ({
      merchant,
      total: data.total,
      count: data.count,
      category: data.category,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  // 4. Timeline trend aggregation (sorted chronologically)
  const dateMap: Record<string, { total: number; count: number }> = {};
  expenses.forEach((e) => {
    if (e.date) {
      if (!dateMap[e.date]) dateMap[e.date] = { total: 0, count: 0 };
      dateMap[e.date].total += Number(e.amount) || 0;
      dateMap[e.date].count += 1;
    }
  });

  const timelineData = Object.entries(dateMap)
    .map(([date, d]) => ({
      date,
      total: d.total,
      count: d.count,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Compute Donut SVG paths
  const donutSize = 220;
  const strokeWidth = 34;
  const radius = (donutSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Category Breakdown Donut + List (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Category Spending Distribution
              </h2>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {categoriesSorted.length} Active Categories
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Donut Chart SVG */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
              <svg width={donutSize} height={donutSize} className="transform -rotate-90">
                <circle
                  cx={donutSize / 2}
                  cy={donutSize / 2}
                  r={radius}
                  fill="transparent"
                  className="stroke-zinc-100 dark:stroke-zinc-800"
                  strokeWidth={strokeWidth}
                />
                {categoriesSorted.map((cat) => {
                  const strokeDasharray = `${(cat.pct / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -accumulatedOffset;
                  accumulatedOffset += (cat.pct / 100) * circumference;

                  const isHovered = hoveredCategory === cat.name;

                  return (
                    <circle
                      key={cat.name}
                      cx={donutSize / 2}
                      cy={donutSize / 2}
                      r={radius}
                      fill="transparent"
                      stroke={cat.meta.color}
                      strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="butt"
                      className="transition-all duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredCategory(cat.name)}
                      onMouseLeave={() => setHoveredCategory(null)}
                      onClick={() => onSelectCategory && onSelectCategory(cat.name)}
                    />
                  );
                })}
              </svg>

              {/* Center Overlay Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                {hoveredCategory ? (
                  <>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate max-w-[130px]">
                      {hoveredCategory}
                    </span>
                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                      {formatCurrency(categoryMap[hoveredCategory]?.total || 0)}
                    </span>
                    <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                      {totalSpent > 0
                        ? `${(((categoryMap[hoveredCategory]?.total || 0) / totalSpent) * 100).toFixed(1)}%`
                        : '0%'}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium">
                      Total
                    </span>
                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
                      {formatCurrency(totalSpent)}
                    </span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      {expenses.length} expenses
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Category Ranking List */}
            <div className="sm:col-span-7 space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {categoriesSorted.map((cat) => (
                <div
                  key={cat.name}
                  onMouseEnter={() => setHoveredCategory(cat.name)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  onClick={() => onSelectCategory && onSelectCategory(cat.name)}
                  className={`p-2 rounded-xl transition-all cursor-pointer border ${
                    hoveredCategory === cat.name
                      ? 'bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600'
                      : 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.meta.color }}
                      />
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                        {cat.name}
                      </span>
                      <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">({cat.count})</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium text-zinc-900 dark:text-zinc-100 shrink-0">
                      <span>{formatCurrency(cat.total)}</span>
                      <span className="text-zinc-500 dark:text-zinc-400 text-[11px] w-9 text-right font-normal">
                        {cat.pct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {/* Category percentage bar */}
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, cat.pct)}%`,
                        backgroundColor: cat.meta.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: 50/30/20 Framework & Health (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  50 / 30 / 20 Budget Health
                </h2>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                Rule Check
              </span>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 leading-relaxed">
              Standard financial planning allocates up to 50% to essential Needs, 30% to discretionary Wants, and at least 20% to Savings &amp; Investments.
            </p>

            <div className="space-y-4">
              {/* Needs bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-sky-800 dark:text-sky-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    Needs (Essentials): {needsPct.toFixed(1)}%
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {formatCurrency(needsTotal)} <span className="text-zinc-500 dark:text-zinc-400 font-normal">/ 50% target</span>
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (needsPct / 50) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  <span>Rent, groceries, utilities, basic transit</span>
                  <span>{needsPct <= 50 ? 'Within budget' : `+${(needsPct - 50).toFixed(1)}% over`}</span>
                </div>
              </div>

              {/* Wants bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Wants (Lifestyle): {wantsPct.toFixed(1)}%
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {formatCurrency(wantsTotal)} <span className="text-zinc-500 dark:text-zinc-400 font-normal">/ 30% target</span>
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (wantsPct / 30) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  <span>Dining out, shopping, subscriptions, trips</span>
                  <span>{wantsPct <= 30 ? 'Optimal' : `+${(wantsPct - 30).toFixed(1)}% stretch`}</span>
                </div>
              </div>

              {/* Savings bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Savings &amp; Wealth: {savingsPct.toFixed(1)}%
                  </span>
                  <span className="text-zinc-700 dark:text-zinc-300">
                    {formatCurrency(savingsTotal)} <span className="text-zinc-500 dark:text-zinc-400 font-normal">/ 20% target</span>
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (savingsPct / 20) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                  <span>Index funds, HYSA, emergency cushion</span>
                  <span>{savingsPct >= 20 ? 'Goal exceeded' : `${(20 - savingsPct).toFixed(1)}% gap`}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300 flex items-start gap-2">
            <Info className="w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0 mt-0.5" />
            <span>
              {wantsPct > 35
                ? 'Recommendation: Discretionary expenses exceed 35%. Review recurring subscriptions and restaurant orders to redirect capital to investments.'
                : savingsPct >= 18
                ? 'Strong financial discipline: Savings and investments capture a healthy share of overall expenditures.'
                : 'Balanced spending profile with consistent essential allocations.'}
            </span>
          </div>
        </div>
      </div>

      {/* Temporal Spending Timeline Chart & Top Merchants */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Daily Outlay Pacing &amp; Spikes
              </h2>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {timelineData.length} Active Expense Days
            </span>
          </div>

          {timelineData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-zinc-500 dark:text-zinc-400">
              No timeline data available for selected filter.
            </div>
          ) : (
            <div className="relative">
              {/* SVG Timeline Bar / Trend Chart */}
              {(() => {
                const maxAmount = Math.max(...timelineData.map((d) => d.total), 100);
                const chartHeight = 180;
                const chartWidth = 700;
                const barWidth = Math.max(8, Math.min(28, (chartWidth / timelineData.length) * 0.7));
                const gap = chartWidth / timelineData.length;

                return (
                  <div className="w-full overflow-x-auto pb-2">
                    <div className="min-w-[600px] h-[210px] relative">
                      <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`} className="w-full h-full">
                        {/* Grid lines */}
                        <line x1="0" y1={chartHeight * 0.25} x2={chartWidth} y2={chartHeight * 0.25} className="stroke-zinc-100 dark:stroke-zinc-800" strokeDasharray="4 4" />
                        <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} className="stroke-zinc-100 dark:stroke-zinc-800" strokeDasharray="4 4" />
                        <line x1="0" y1={chartHeight * 0.75} x2={chartWidth} y2={chartHeight * 0.75} className="stroke-zinc-100 dark:stroke-zinc-800" strokeDasharray="4 4" />
                        <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} className="stroke-zinc-200 dark:stroke-zinc-700" />

                        {/* Bars */}
                        {timelineData.map((point, idx) => {
                          const barHeight = (point.total / maxAmount) * (chartHeight - 20);
                          const x = idx * gap + gap / 2 - barWidth / 2;
                          const y = chartHeight - barHeight;
                          const isSpike = point.total > maxAmount * 0.65;

                          return (
                            <g key={point.date} className="cursor-pointer">
                              {/* Hover trigger zone */}
                              <rect
                                x={idx * gap}
                                y="0"
                                width={gap}
                                height={chartHeight}
                                fill="transparent"
                                onMouseEnter={(e) => {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setHoveredTrendPoint({
                                    date: point.date,
                                    amount: point.total,
                                    count: point.count,
                                    x: rect.left + rect.width / 2,
                                    y: rect.top,
                                  });
                                }}
                                onMouseLeave={() => setHoveredTrendPoint(null)}
                              />
                              <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={barHeight}
                                rx="4"
                                className={`transition-all duration-150 hover:opacity-80 ${
                                  isSpike
                                    ? 'fill-sky-600 dark:fill-sky-500'
                                    : 'fill-zinc-900 dark:fill-zinc-200'
                                }`}
                              />
                              {/* Date label at bottom */}
                              {idx % Math.ceil(timelineData.length / 8) === 0 && (
                                <text
                                  x={x + barWidth / 2}
                                  y={chartHeight + 18}
                                  textAnchor="middle"
                                  fontSize="10"
                                  className="fill-zinc-500 dark:fill-zinc-400"
                                >
                                  {point.date.slice(5)}
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </svg>

                      {/* Tooltip */}
                      {hoveredTrendPoint && (
                        <div className="absolute top-2 right-2 bg-zinc-900 dark:bg-zinc-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none z-10 border border-zinc-700">
                          <div className="font-semibold text-zinc-200">
                            {formatDate(hoveredTrendPoint.date)}
                          </div>
                          <div className="text-emerald-400 font-bold text-sm">
                            {formatCurrency(hoveredTrendPoint.amount)}
                          </div>
                          <div className="text-zinc-400 text-[11px]">
                            {hoveredTrendPoint.count} transaction{hoveredTrendPoint.count > 1 ? 's' : ''}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Top Merchants Ranking (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Top Merchants
              </h2>
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">By Total Outlay</span>
          </div>

          <div className="space-y-3">
            {topMerchants.map((m, idx) => (
              <div
                key={m.merchant}
                className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-[11px] flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                      {m.merchant}
                    </p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {m.category} • {m.count} order{m.count > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(m.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
