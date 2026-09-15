import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  Calendar,
  IndianRupee,
  Tag,
  FileText,
  CreditCard,
  Check,
} from 'lucide-react';
import { Expense, ExpenseNecessity } from '../types';
import { CATEGORIES, getCategoryMeta } from '../data/categories';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Expense) => void;
  initialExpense?: Expense | null;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialExpense,
}) => {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState(CATEGORIES[1].name); // Groceries
  const [subcategory, setSubcategory] = useState('');
  const [necessity, setNecessity] = useState<ExpenseNecessity>('need');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isTaxDeductible, setIsTaxDeductible] = useState(false);
  const [confidence, setConfidence] = useState<number | undefined>(undefined);
  const [aiReasoning, setAiReasoning] = useState<string | undefined>(undefined);

  const [isCategorizing, setIsCategorizing] = useState(false);
  const [aiCategorized, setAiCategorized] = useState(false);

  useEffect(() => {
    if (initialExpense) {
      setMerchant(initialExpense.merchant);
      setAmount(initialExpense.amount.toString());
      setDate(initialExpense.date);
      setCategory(initialExpense.category);
      setSubcategory(initialExpense.subcategory || '');
      setNecessity(initialExpense.necessity);
      setPaymentMethod(initialExpense.paymentMethod || 'Credit Card');
      setNotes(initialExpense.notes || '');
      setIsRecurring(Boolean(initialExpense.isRecurring));
      setIsTaxDeductible(Boolean(initialExpense.isTaxDeductible));
      setConfidence(initialExpense.confidence);
      setAiReasoning(initialExpense.aiReasoning);
      setAiCategorized(true);
    } else {
      setMerchant('');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setCategory(CATEGORIES[1].name);
      setSubcategory('');
      setNecessity('need');
      setPaymentMethod('Credit Card');
      setNotes('');
      setIsRecurring(false);
      setIsTaxDeductible(false);
      setConfidence(undefined);
      setAiReasoning(undefined);
      setAiCategorized(false);
    }
  }, [initialExpense, isOpen]);

  if (!isOpen) return null;

  const handleAiAutoCategorize = async () => {
    if (!merchant.trim() || isCategorizing) return;
    setIsCategorizing(true);

    try {
      const res = await fetch('/api/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              merchant: merchant.trim(),
              amount: parseFloat(amount) || 0,
              notes: notes.trim(),
            },
          ],
        }),
      });

      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const match = data.results[0];
        if (match.category) setCategory(match.category);
        if (match.subcategory) setSubcategory(match.subcategory);
        if (match.necessity) setNecessity(match.necessity as ExpenseNecessity);
        if (typeof match.isRecurring === 'boolean') setIsRecurring(match.isRecurring);
        if (typeof match.isTaxDeductible === 'boolean') setIsTaxDeductible(match.isTaxDeductible);
        setConfidence(match.confidence ?? 0.95);
        setAiReasoning(match.aiReasoning);
        setAiCategorized(true);
      }
    } catch (err) {
      console.error('AI categorization error:', err);
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchant.trim() || !amount) return;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const expense: Expense = {
      id: initialExpense?.id || `exp-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      date: date || new Date().toISOString().split('T')[0],
      merchant: merchant.trim(),
      amount: numAmount,
      category,
      subcategory: subcategory.trim() || undefined,
      necessity,
      paymentMethod,
      notes: notes.trim() || undefined,
      isRecurring,
      isTaxDeductible,
      confidence: confidence ?? 0.9,
      aiReasoning: aiReasoning || 'User confirmed classification.',
    };

    onSave(expense);
    onClose();
  };

  const selectedCatMeta = getCategoryMeta(category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {initialExpense ? 'Edit Expense Record' : 'Log New Expense'}
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Auto-categorized by Gemini 3.8
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* Merchant / Description + AI Trigger */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-1">
              Merchant / Payee
            </label>
            <div className="flex gap-2">
              <input
                id="input-add-merchant"
                type="text"
                required
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                placeholder="e.g. Trader Joe's, Netflix, Shell Gas"
                className="flex-1 px-3.5 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
              <button
                id="btn-ai-auto-categorize"
                type="button"
                onClick={handleAiAutoCategorize}
                disabled={isCategorizing || !merchant.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 border border-transparent dark:border-zinc-700 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shrink-0 shadow-xs"
              >
                {isCategorizing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>AI Suggest</span>
              </button>
            </div>
            {aiCategorized && aiReasoning && (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg mt-1.5 border border-emerald-100 dark:border-emerald-800 flex items-start gap-1">
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <span>AI: {aiReasoning}</span>
              </p>
            )}
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-1">
                Amount (₹ INR)
              </label>
              <div className="relative">
                <IndianRupee className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 absolute left-3 top-2.5" />
                <input
                  id="input-add-amount"
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-1">
                Date
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  id="input-add-date"
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-1">
                Category
              </label>
              <select
                id="select-add-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  const meta = getCategoryMeta(e.target.value);
                  setNecessity(meta.defaultNecessity);
                }}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-emerald-500 text-zinc-900 dark:text-zinc-100 font-medium cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.name} className="dark:bg-zinc-900">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-1">
                Subcategory
              </label>
              <input
                id="input-add-subcategory"
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Supermarket, Coffee"
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
            </div>
          </div>

          {/* 50/30/20 Budget Class (Necessity) */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-1.5">
              Budget Classification (50/30/20 Rule)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setNecessity('need')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                  necessity === 'need'
                    ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 dark:border-sky-600 text-sky-800 dark:text-sky-300 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                Need (50%)
                <span className="block text-[10px] font-normal text-zinc-500 dark:text-zinc-400">Essential</span>
              </button>
              <button
                type="button"
                onClick={() => setNecessity('want')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                  necessity === 'want'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 dark:border-amber-600 text-amber-800 dark:text-amber-300 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                Want (30%)
                <span className="block text-[10px] font-normal text-zinc-500 dark:text-zinc-400">Lifestyle</span>
              </button>
              <button
                type="button"
                onClick={() => setNecessity('savings_investment')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer text-center ${
                  necessity === 'savings_investment'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-600 text-emerald-800 dark:text-emerald-300 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                Savings (20%)
                <span className="block text-[10px] font-normal text-zinc-500 dark:text-zinc-400">Investment</span>
              </button>
            </div>
          </div>

          {/* Payment Method & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-1">
                Payment Method
              </label>
              <select
                id="select-add-payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-emerald-500 text-zinc-800 dark:text-zinc-200 cursor-pointer"
              >
                <option value="Credit Card" className="dark:bg-zinc-900">Credit Card</option>
                <option value="Debit Card" className="dark:bg-zinc-900">Debit Card</option>
                <option value="Apple Pay" className="dark:bg-zinc-900">Apple Pay / Google Pay</option>
                <option value="ACH / Bank Transfer" className="dark:bg-zinc-900">ACH / Bank Transfer</option>
                <option value="Cash" className="dark:bg-zinc-900">Cash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-1">
                Notes
              </label>
              <input
                id="input-add-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional memo..."
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              />
            </div>
          </div>

          {/* Checkbox Toggles: Recurring & Tax Deductible */}
          <div className="flex items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="rounded text-zinc-900 dark:text-emerald-500 focus:ring-zinc-900 dark:focus:ring-emerald-500 cursor-pointer"
              />
              <span>Recurring monthly subscription / bill</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isTaxDeductible}
                onChange={(e) => setIsTaxDeductible(e.target.checked)}
                className="rounded text-zinc-900 dark:text-emerald-500 focus:ring-zinc-900 dark:focus:ring-emerald-500 cursor-pointer"
              />
              <span>Tax deductible</span>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="btn-save-expense"
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {initialExpense ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
