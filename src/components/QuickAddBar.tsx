import React, { useState } from 'react';
import { Sparkles, Loader2, Plus, Camera } from 'lucide-react';
import { Expense, ExpenseNecessity } from '../types';

interface QuickAddBarProps {
  onAddExpense: (expense: Expense) => void;
  onOpenScanModal?: () => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ onAddExpense, onOpenScanModal }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleQuickAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input.trim() }),
      });

      const data = await res.json();
      if (data.expenses && data.expenses.length > 0) {
        const item = data.expenses[0];
        onAddExpense(item);
        setInput('');
      } else {
        // Fallback simple parsing if no structured object returned
        const amountMatch = input.match(/(?:[₹\$]|rs\.?|inr)?\s*(\d+(\.\d{1,2})?)/i);
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 500;
        const merchant = input.replace(/(?:[₹\$]|rs\.?|inr)?\s*(\d+(\.\d{1,2})?)/i, '').trim() || 'New Expense';

        onAddExpense({
          id: `quick-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          merchant,
          amount,
          category: 'Shopping & Retail',
          necessity: 'want',
          confidence: 0.85,
          aiReasoning: 'Added via quick input.',
        });
        setInput('');
      }
    } catch (err) {
      console.error('Quick add error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form
      onSubmit={handleQuickAdd}
      className="p-3 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xs flex items-center gap-2 transition-colors duration-200"
    >
      <div className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 shrink-0">
        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
      </div>

      <input
        id="input-quick-add"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Natural Language Quick Log: e.g. 'Paid ₹1,450 at Nature's Basket for weekly groceries' or 'Uber ride ₹340'..."
        className="flex-1 text-xs bg-transparent border-none focus:outline-hidden text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-medium"
      />

      {onOpenScanModal && (
        <button
          type="button"
          onClick={onOpenScanModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium text-xs transition-colors cursor-pointer shrink-0"
          title="Scan Receipt with Camera or Upload"
        >
          <Camera className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Scan Bill</span>
        </button>
      )}

      <button
        id="btn-quick-add-submit"
        type="submit"
        disabled={isProcessing || !input.trim()}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 text-white font-semibold text-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-xs"
      >
        {isProcessing ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Plus className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">AI Categorize &amp; Log</span>
        <span className="sm:hidden">Log</span>
      </button>
    </form>
  );
};

