import React, { useState } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Loader2,
  FileSpreadsheet,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { Expense, ExpenseNecessity } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (expenses: Expense[]) => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [csvText, setCsvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const sampleCsv = `Date,Merchant,Amount,Notes
2026-09-10,Whole Foods Market,84.20,Produce & cheese
2026-09-11,Shell Gasoline,45.00,Vehicle gas fill-up
2026-09-12,Netflix,19.99,Monthly streaming
2026-09-13,Chipotle,14.50,Lunch burrito
2026-09-14,Fidelity Investments,250.00,Monthly ETF investment`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content || '');
    };
    reader.readAsText(file);
  };

  const handleProcessCsv = async () => {
    if (!csvText.trim() || isProcessing) return;
    setIsProcessing(true);
    setError(null);

    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must have a header row and at least 1 transaction line.');
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/["']/g, ''));
      const dateIdx = headers.findIndex((h) => h.includes('date'));
      const merchantIdx = headers.findIndex((h) => h.includes('merchant') || h.includes('description') || h.includes('payee'));
      const amountIdx = headers.findIndex((h) => h.includes('amount') || h.includes('total') || h.includes('debit'));
      const notesIdx = headers.findIndex((h) => h.includes('note') || h.includes('memo'));

      if (merchantIdx === -1 || amountIdx === -1) {
        throw new Error('Could not identify Merchant and Amount columns. Check CSV headers.');
      }

      const rawItems: Array<{
        id: string;
        date: string;
        merchant: string;
        amount: number;
        notes?: string;
      }> = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Split respecting simple commas
        const cols = line.split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
        const merchant = cols[merchantIdx] || `Expense ${i}`;
        const rawAmount = cols[amountIdx] || '0';
        const cleanAmount = Math.abs(parseFloat(rawAmount.replace(/[^0-9.-]/g, '')) || 0);

        if (cleanAmount > 0) {
          rawItems.push({
            id: `csv-${Date.now()}-${i}`,
            date: dateIdx !== -1 && cols[dateIdx] ? cols[dateIdx] : new Date().toISOString().split('T')[0],
            merchant,
            amount: cleanAmount,
            notes: notesIdx !== -1 ? cols[notesIdx] : undefined,
          });
        }
      }

      if (rawItems.length === 0) {
        throw new Error('No valid transactions with amounts greater than ₹0 found.');
      }

      // Call AI Categorizer for the items
      const res = await fetch('/api/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: rawItems }),
      });

      const data = await res.json();
      const aiResults = data.results || [];

      const finalizedExpenses: Expense[] = rawItems.map((item, idx) => {
        const match = aiResults[idx] || {};
        return {
          id: item.id,
          date: item.date,
          merchant: item.merchant,
          amount: item.amount,
          category: match.category || 'Shopping & Retail',
          subcategory: match.subcategory || 'General',
          necessity: (match.necessity as ExpenseNecessity) || 'want',
          notes: item.notes,
          isRecurring: match.isRecurring ?? false,
          isTaxDeductible: match.isTaxDeductible ?? false,
          confidence: match.confidence ?? 0.88,
          aiReasoning: match.aiReasoning || 'Imported via CSV feed and categorized with Gemini.',
        };
      });

      onImport(finalizedExpenses);
      onClose();
    } catch (err: any) {
      console.error('CSV import error:', err);
      setError(err.message || 'Failed to process CSV file.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Import CSV Statement
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Upload or paste bank export and let Gemini auto-categorize
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
        <div className="p-6 space-y-4">
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-center hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors">
            <Upload className="w-6 h-6 text-zinc-400 dark:text-zinc-500 mx-auto mb-1" />
            <label className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:underline cursor-pointer block">
              <span>Choose a .CSV file</span>
              <input
                id="input-csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
              Exports from Chase, Amex, Bank of America, or custom CSV
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Or Paste CSV Data Below
            </span>
            <button
              type="button"
              onClick={() => setCsvText(sampleCsv)}
              className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-medium cursor-pointer"
            >
              Load Sample CSV Template
            </button>
          </div>

          <textarea
            id="textarea-csv-content"
            rows={6}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Date,Merchant,Amount,Notes..."
            className="w-full p-3 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 font-mono"
          />

          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
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

          <button
            id="btn-confirm-csv-import"
            onClick={handleProcessCsv}
            disabled={isProcessing || !csvText.trim()}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Auto-Categorizing Rows with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Import &amp; Auto-Categorize</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
