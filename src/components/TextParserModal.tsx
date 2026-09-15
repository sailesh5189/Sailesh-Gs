import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  FileText,
  CheckSquare,
  Square,
  Check,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Expense } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { getCategoryMeta } from '../data/categories';

interface TextParserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportParsed: (expenses: Expense[]) => void;
}

export const TextParserModal: React.FC<TextParserModalProps> = ({
  isOpen,
  onClose,
  onImportParsed,
}) => {
  const [rawText, setRawText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedExpenses, setParsedExpenses] = useState<Expense[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [parseError, setParseError] = useState<string | null>(null);

  if (!isOpen) return null;

  const presets = [
    {
      title: 'Weekend Outing & Essentials',
      text: `09/12/2026 Nature's Basket Organic Groceries ₹2,450.00
09/12/2026 Third Wave Coffee & Pastries ₹480.00
09/13/2026 Indian Oil Fuel Station ₹2,800.00
09/13/2026 Haldiram's Family Dinner ₹1,250.00
09/14/2026 Apollo Pharmacy medicine ₹640.00`,
    },
    {
      title: 'Bank Statement Feed Dump',
      text: `UPI DEBIT - 09/10/2026 - BLINKIT COMMERCE - ₹1,120.00
ACH WITHDRAWAL - 09/11/2026 - TATA POWER UTILITY - ₹3,450.00
UPI DEBIT - 09/11/2026 - UBER INDIA - ₹380.00
RECURRING - 09/12/2026 - NETFLIX INDIA - ₹649.00
UPI DEBIT - 09/13/2026 - SWIGGY GOURMET - ₹840.00`,
    },
    {
      title: 'Casual Message / Voice Memo',
      text: `Spent ₹2,500 on dinner at Barbeque Nation with friends, then took an Uber ride home for ₹350. Also paid ₹2,200 for the monthly Cult.fit gym membership.`,
    },
  ];

  const handleParse = async (textToParse?: string) => {
    const text = textToParse || rawText;
    if (!text.trim() || isParsing) return;

    setIsParsing(true);
    setParseError(null);
    setParsedExpenses([]);

    try {
      const res = await fetch('/api/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        throw new Error(`Server returned error ${res.status}`);
      }

      const data = await res.json();
      if (data.expenses && Array.isArray(data.expenses)) {
        setParsedExpenses(data.expenses);
        setSelectedIndices(new Set(data.expenses.map((_: any, idx: number) => idx)));
      } else {
        throw new Error('No transactions detected in input text.');
      }
    } catch (err: any) {
      console.error('Parse error:', err);
      setParseError(err.message || 'Failed to parse text.');
    } finally {
      setIsParsing(false);
    }
  };

  const toggleSelectIndex = (idx: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const handleConfirmImport = () => {
    const toImport = parsedExpenses.filter((_, idx) => selectedIndices.has(idx));
    if (toImport.length > 0) {
      onImportParsed(toImport);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center">
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Parse Unstructured Financial Text
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Paste receipt OCR, bank feeds, or conversational notes
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Quick Preset Buttons */}
          <div>
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
              Quick Test Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setRawText(preset.text);
                    handleParse(preset.text);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
                >
                  ⚡ {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wide mb-1">
              Raw Text to Extract &amp; Categorize
            </label>
            <textarea
              id="textarea-parse-input"
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw bank statement rows, receipt itemizations, or sentences like 'Paid ₹1,850 for groceries at Nature's Basket'..."
              className="w-full p-3 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-mono"
            />
          </div>

          {/* Parse Button */}
          <div className="flex justify-end">
            <button
              id="btn-trigger-text-parse"
              onClick={() => handleParse()}
              disabled={isParsing || !rawText.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
            >
              {isParsing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Gemini AI is Extracting &amp; Classifying...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Parse &amp; Auto-Categorize</span>
                </>
              )}
            </button>
          </div>

          {parseError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {parsedExpenses.length > 0 && (
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Extracted {parsedExpenses.length} Transactions
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {selectedIndices.size} selected for ledger
                </span>
              </div>

              <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                {parsedExpenses.map((item, idx) => {
                  const meta = getCategoryMeta(item.category);
                  const isSelected = selectedIndices.has(idx);

                  return (
                    <div
                      key={idx}
                      onClick={() => toggleSelectIndex(idx)}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-zinc-50 dark:bg-zinc-800/80 border-zinc-300 dark:border-zinc-600'
                          : 'bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800/80 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <button
                          type="button"
                          className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-zinc-900 dark:text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                            {item.merchant}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                            <span>{formatDate(item.date)}</span>
                            <span>•</span>
                            <span
                              className="inline-block w-2 h-2 rounded-full"
                              style={{ backgroundColor: meta.color }}
                            />
                            <span>{item.category}</span>
                            <span>•</span>
                            <span className="capitalize font-medium text-zinc-700 dark:text-zinc-300">
                              {item.necessity}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-zinc-900 dark:text-zinc-100">
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          >
            Cancel
          </button>

          <button
            id="btn-import-parsed-confirm"
            onClick={handleConfirmImport}
            disabled={selectedIndices.size === 0}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <span>Import {selectedIndices.size} Expense(s)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
