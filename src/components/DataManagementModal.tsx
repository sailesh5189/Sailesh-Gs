import React, { useRef, useState } from 'react';
import {
  Database,
  X,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  AlertTriangle,
  FileJson,
  FileSpreadsheet,
} from 'lucide-react';
import { Expense } from '../types';
import { exportToCSV, exportToJSON } from '../utils/formatters';
import { INITIAL_EXPENSES } from '../data/initialExpenses';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  onUpdateExpenses: (expenses: Expense[]) => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose,
  expenses,
  onUpdateExpenses,
}) => {
  const [confirmClear, setConfirmClear] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [importErrorMsg, setImportErrorMsg] = useState<string | null>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleJsonRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onUpdateExpenses(parsed);
          setImportSuccessMsg(`Successfully restored ${parsed.length} transactions from backup!`);
          setImportErrorMsg(null);
        } else {
          throw new Error('Invalid backup file format: Expected an array of expense records.');
        }
      } catch (err: any) {
        setImportErrorMsg(err.message || 'Failed to read JSON backup file.');
        setImportSuccessMsg(null);
      }
    };
    reader.readAsText(file);
  };

  const handleResetToSample = () => {
    onUpdateExpenses(INITIAL_EXPENSES);
    setImportSuccessMsg(`Reset ledger to ${INITIAL_EXPENSES.length} default sample transactions.`);
    setImportErrorMsg(null);
  };

  const handleClearAll = () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    onUpdateExpenses([]);
    setConfirmClear(false);
    setImportSuccessMsg('All transactions cleared from local storage.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white flex items-center justify-center shadow-xs">
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Data Management &amp; Backups
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Export, backup, or restore your financial records
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
        <div className="p-6 space-y-4">
          {importSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{importSuccessMsg}</span>
            </div>
          )}

          {importErrorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{importErrorMsg}</span>
            </div>
          )}

          {/* Export section */}
          <div>
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
              Backup &amp; Export
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => exportToCSV(expenses)}
                className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-zinc-50 dark:bg-zinc-800/60 text-left cursor-pointer transition-colors"
              >
                <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mb-1" />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Export CSV
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Excel &amp; Sheets readable
                </span>
              </button>

              <button
                type="button"
                onClick={() => exportToJSON(expenses)}
                className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-zinc-50 dark:bg-zinc-800/60 text-left cursor-pointer transition-colors"
              >
                <FileJson className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mb-1" />
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Full JSON Backup
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Lossless database copy
                </span>
              </button>
            </div>
          </div>

          {/* Import / Restore Section */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
              Restore &amp; Sample Data
            </span>

            <input
              ref={jsonInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleJsonRestore}
            />

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => jsonInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4 text-zinc-500" />
                <span>Restore from JSON Backup File</span>
              </button>

              <button
                type="button"
                onClick={handleResetToSample}
                className="w-full py-2.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-zinc-500" />
                <span>Reset to Sample INR Ledger</span>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <span className="text-[11px] font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider block mb-2">
              Danger Zone
            </span>

            <button
              type="button"
              onClick={handleClearAll}
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                confirmClear
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/30 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/50'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>
                {confirmClear ? 'Click again to confirm: Clear All Data' : 'Clear All Transactions'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
