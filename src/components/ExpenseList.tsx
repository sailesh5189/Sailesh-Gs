import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  Trash2,
  Edit2,
  CheckSquare,
  Square,
  Repeat,
  Receipt,
  FileCheck,
  Check,
} from 'lucide-react';
import { Expense } from '../types';
import { CATEGORIES, getCategoryMeta } from '../data/categories';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ExpenseListProps {
  expenses: Expense[];
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onBatchDelete: (ids: string[]) => void;
  onBatchCategorize: (selectedExpenses: Expense[]) => void;
  selectedCategoryFilter: string;
  onCategoryFilterChange: (cat: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  onEditExpense,
  onDeleteExpense,
  onBatchDelete,
  onBatchCategorize,
  selectedCategoryFilter,
  onCategoryFilterChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [necessityFilter, setNecessityFilter] = useState<'all' | 'need' | 'want' | 'savings_investment'>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeReasoningId, setActiveReasoningId] = useState<string | null>(null);

  // Filter & sort
  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((e) => {
        // Search
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchMerchant = e.merchant?.toLowerCase().includes(q);
          const matchNotes = e.notes?.toLowerCase().includes(q);
          const matchSubcat = e.subcategory?.toLowerCase().includes(q);
          if (!matchMerchant && !matchNotes && !matchSubcat) return false;
        }

        // Category filter
        if (selectedCategoryFilter && selectedCategoryFilter !== 'all') {
          if (e.category !== selectedCategoryFilter) return false;
        }

        // Necessity filter
        if (necessityFilter !== 'all') {
          if (e.necessity !== necessityFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') {
          return (b.date || '').localeCompare(a.date || '');
        }
        if (sortBy === 'date-asc') {
          return (a.date || '').localeCompare(b.date || '');
        }
        if (sortBy === 'amount-desc') {
          return (Number(b.amount) || 0) - (Number(a.amount) || 0);
        }
        if (sortBy === 'amount-asc') {
          return (Number(a.amount) || 0) - (Number(b.amount) || 0);
        }
        return 0;
      });
  }, [expenses, searchQuery, selectedCategoryFilter, necessityFilter, sortBy]);

  const allFilteredSelected =
    filteredExpenses.length > 0 &&
    filteredExpenses.every((e) => selectedIds.has(e.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredExpenses.map((e) => e.id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleRunBatchCategorize = () => {
    const selected = expenses.filter((e) => selectedIds.has(e.id));
    if (selected.length > 0) {
      onBatchCategorize(selected);
    }
  };

  const handleRunBatchDelete = () => {
    if (selectedIds.size === 0) return;
    if (confirm(`Delete ${selectedIds.size} selected transaction(s)?`)) {
      onBatchDelete(Array.from(selectedIds));
      setSelectedIds(new Set());
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden transition-colors duration-200">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Title & Count */}
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
              Categorized Expense Ledger
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium">
              {filteredExpenses.length} of {expenses.length}
            </span>
          </div>

          {/* Batch Actions Toolbar if any selected */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-800 border border-transparent dark:border-zinc-700 text-white px-3 py-1.5 rounded-xl text-xs">
              <span className="font-semibold">{selectedIds.size} selected</span>
              <button
                id="btn-batch-recategorize"
                onClick={handleRunBatchCategorize}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 rounded-md font-medium transition-colors cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>AI Re-Categorize</span>
              </button>
              <button
                id="btn-batch-delete"
                onClick={handleRunBatchDelete}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-600 hover:bg-red-500 rounded-md font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5 pt-1">
          {/* Search bar (5 cols) */}
          <div className="lg:col-span-5 relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              id="input-filter-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search merchant, notes, tags..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
            />
          </div>

          {/* Category Filter Dropdown (3 cols) */}
          <div className="lg:col-span-3">
            <select
              id="select-filter-category"
              value={selectedCategoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-emerald-500 text-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.name} className="dark:bg-zinc-900">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Necessity Filter (2 cols) */}
          <div className="lg:col-span-2">
            <select
              id="select-filter-necessity"
              value={necessityFilter}
              onChange={(e) => setNecessityFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-emerald-500 text-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              <option value="all" className="dark:bg-zinc-900">All Budget Types</option>
              <option value="need" className="dark:bg-zinc-900">Needs (Essential)</option>
              <option value="want" className="dark:bg-zinc-900">Wants (Discretionary)</option>
              <option value="savings_investment" className="dark:bg-zinc-900">Savings &amp; Wealth</option>
            </select>
          </div>

          {/* Sort By (2 cols) */}
          <div className="lg:col-span-2">
            <select
              id="select-sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-emerald-500 text-zinc-800 dark:text-zinc-200 cursor-pointer"
            >
              <option value="date-desc" className="dark:bg-zinc-900">Newest First</option>
              <option value="date-asc" className="dark:bg-zinc-900">Oldest First</option>
              <option value="amount-desc" className="dark:bg-zinc-900">Highest Spend</option>
              <option value="amount-asc" className="dark:bg-zinc-900">Lowest Spend</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table / List View */}
      {filteredExpenses.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-400 dark:text-zinc-500">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No matching expenses</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria, clearing category filters, or logging a new expense using AI.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50/80 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 pl-4 pr-2 w-10">
                  <button
                    onClick={toggleSelectAll}
                    className="cursor-pointer text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                    title="Select all"
                  >
                    {allFilteredSelected ? (
                      <CheckSquare className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Merchant / Description</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Budget Class</th>
                <th className="py-3 px-3">AI Confidence</th>
                <th className="py-3 px-3 text-right">Amount</th>
                <th className="py-3 pr-4 pl-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {filteredExpenses.map((expense) => {
                const meta = getCategoryMeta(expense.category);
                const isSelected = selectedIds.has(expense.id);

                return (
                  <tr
                    key={expense.id}
                    className={`hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors ${
                      isSelected ? 'bg-zinc-50 dark:bg-zinc-800/70' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 pl-4 pr-2">
                      <button
                        onClick={() => toggleSelectItem(expense.id)}
                        className="cursor-pointer text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 whitespace-nowrap text-zinc-600 dark:text-zinc-400 font-medium">
                      {formatDate(expense.date)}
                    </td>

                    {/* Merchant & Notes */}
                    <td className="py-3 px-3 max-w-[240px]">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {expense.merchant}
                        </span>
                        {expense.isRecurring && (
                          <span
                            title="Recurring subscription"
                            className="text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 p-0.5 rounded shrink-0"
                          >
                            <Repeat className="w-3 h-3" />
                          </span>
                        )}
                        {expense.isTaxDeductible && (
                          <span
                            title="Potential tax deduction"
                            className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 p-0.5 rounded shrink-0"
                          >
                            <FileCheck className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      {expense.notes && (
                        <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                          {expense.notes}
                        </p>
                      )}
                    </td>

                    {/* Category & Subcategory */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: meta.color }}
                        />
                        <span className="font-medium text-zinc-800 dark:text-zinc-200">
                          {expense.category}
                        </span>
                      </div>
                      {expense.subcategory && (
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 pl-3.5">
                          {expense.subcategory}
                        </p>
                      )}
                    </td>

                    {/* Budget Class (Need / Want / Savings) */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {expense.necessity === 'need' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                          Need (50%)
                        </span>
                      )}
                      {expense.necessity === 'want' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Want (30%)
                        </span>
                      )}
                      {expense.necessity === 'savings_investment' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Savings (20%)
                        </span>
                      )}
                    </td>

                    {/* AI Confidence & Reasoning */}
                    <td className="py-3 px-3 whitespace-nowrap relative">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-zinc-600 dark:text-zinc-400">
                          {Math.round((expense.confidence ?? 0.9) * 100)}%
                        </span>
                        {expense.aiReasoning && (
                          <button
                            onClick={() =>
                              setActiveReasoningId(
                                activeReasoningId === expense.id ? null : expense.id
                              )
                            }
                            className="p-1 rounded text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 cursor-pointer"
                            title="View AI Categorization Reasoning"
                          >
                            <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          </button>
                        )}
                      </div>

                      {/* AI Reasoning Popover */}
                      {activeReasoningId === expense.id && expense.aiReasoning && (
                        <div className="absolute left-0 top-10 w-64 p-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 border border-zinc-700 text-white text-[11px] shadow-xl z-20 space-y-1">
                          <div className="flex items-center justify-between font-semibold text-emerald-400">
                            <span>Gemini Reasoning</span>
                            <button
                              onClick={() => setActiveReasoningId(null)}
                              className="text-zinc-400 hover:text-white"
                            >
                              ✕
                            </button>
                          </div>
                          <p className="text-zinc-300 leading-normal">
                            {expense.aiReasoning}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 whitespace-nowrap text-right font-bold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(expense.amount)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 pr-4 pl-2 whitespace-nowrap text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onEditExpense(expense)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                          title="Edit expense"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteExpense(expense.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer"
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
