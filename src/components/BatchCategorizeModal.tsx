import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Expense, CategorizeResponseItem } from '../types';
import { formatCurrency } from '../utils/formatters';
import { getCategoryMeta } from '../data/categories';

interface BatchCategorizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedExpenses: Expense[];
  onApplyBatchResults: (updated: Expense[]) => void;
}

export const BatchCategorizeModal: React.FC<BatchCategorizeModalProps> = ({
  isOpen,
  onClose,
  selectedExpenses,
  onApplyBatchResults,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<CategorizeResponseItem[] | null>(null);

  if (!isOpen) return null;

  const handleRunBatchAI = async () => {
    setIsProcessing(true);
    try {
      const itemsPayload = selectedExpenses.map((e) => ({
        id: e.id,
        merchant: e.merchant,
        amount: e.amount,
        notes: e.notes,
      }));

      const res = await fetch('/api/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsPayload }),
      });

      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        setResults(data.results);
      }
    } catch (err) {
      console.error('Batch categorize error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (!results) return;

    const updatedExpenses = selectedExpenses.map((original) => {
      const match = results.find((r) => r.id === original.id || r.merchant === original.merchant);
      if (!match) return original;

      return {
        ...original,
        category: match.category || original.category,
        subcategory: match.subcategory || original.subcategory,
        necessity: match.necessity || original.necessity,
        confidence: match.confidence ?? 0.95,
        aiReasoning: match.aiReasoning || original.aiReasoning,
        isRecurring: match.isRecurring ?? original.isRecurring,
        isTaxDeductible: match.isTaxDeductible ?? original.isTaxDeductible,
      };
    });

    onApplyBatchResults(updatedExpenses);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Batch AI Categorization
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Re-classify {selectedExpenses.length} transaction(s) with Gemini 3.8
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!results ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
                <RefreshCw className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Ready to analyze {selectedExpenses.length} transaction(s)
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                Gemini will determine the precise Category, Subcategory, 50/30/20 budget classification (Need vs Want vs Savings), and tax deductibility.
              </p>
              <button
                id="btn-run-batch-ai-submit"
                onClick={handleRunBatchAI}
                disabled={isProcessing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Run Batch Categorization</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Classification Results ({results.length})
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Ready to Apply
                </span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {selectedExpenses.map((expense) => {
                  const match = results.find(
                    (r) => r.id === expense.id || r.merchant === expense.merchant
                  );
                  const meta = getCategoryMeta(match?.category || expense.category);

                  return (
                    <div
                      key={expense.id}
                      className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 text-xs flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {expense.merchant}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] mt-0.5">
                          <span className="text-zinc-400 dark:text-zinc-500 line-through">
                            {expense.category}
                          </span>
                          <span className="text-zinc-400 dark:text-zinc-500">→</span>
                          <span
                            className="font-semibold flex items-center gap-1"
                            style={{ color: meta.color }}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: meta.color }}
                            />
                            {match?.category || expense.category}
                          </span>
                          <span className="text-zinc-500 dark:text-zinc-400 font-medium capitalize">
                            ({match?.necessity})
                          </span>
                        </div>
                        {match?.aiReasoning && (
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 italic">
                            AI: {match.aiReasoning}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(expense.amount)}
                        </span>
                        <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                          {Math.round((match?.confidence ?? 0.95) * 100)}% conf
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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

          {results && (
            <button
              id="btn-apply-batch-changes"
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              <span>Apply All Updates</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
