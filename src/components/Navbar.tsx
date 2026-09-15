import React from 'react';
import {
  Wallet,
  Plus,
  FileText,
  Upload,
  Download,
  RotateCcw,
  Sparkles,
  Camera,
  Target,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { ThemeSwitcher } from './ThemeSwitcher';

interface NavbarProps {
  totalSpent: number;
  transactionCount: number;
  onOpenAddModal: () => void;
  onOpenParserModal: () => void;
  onOpenCsvModal: () => void;
  onOpenScanModal: () => void;
  onOpenBudgetModal: () => void;
  onOpenTaxModal: () => void;
  onOpenDataModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalSpent,
  transactionCount,
  onOpenAddModal,
  onOpenParserModal,
  onOpenCsvModal,
  onOpenScanModal,
  onOpenBudgetModal,
  onOpenTaxModal,
  onOpenDataModal,
}) => {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-30 shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Title */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-800 border border-zinc-800 dark:border-zinc-700 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none truncate">
                  AI Personal Finance Categorizer
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/80">
                  <Sparkles className="w-3 h-3" /> Gemini 3.8
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:block mt-0.5">
                Intelligent categorization &amp; deep spending pattern discovery
              </p>
            </div>
          </div>

          {/* Right Action buttons & Theme Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Quick stats pill */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Tracked:</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">{formatCurrency(totalSpent)}</span>
              <span className="text-zinc-400 dark:text-zinc-600">•</span>
              <span className="text-zinc-600 dark:text-zinc-400">{transactionCount} items</span>
            </div>

            {/* AI Scan Receipt / Bill Button */}
            <button
              id="btn-nav-scan-receipt"
              onClick={onOpenScanModal}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/80 rounded-lg transition-colors cursor-pointer"
              title="Scan Receipt or Bill with Gemini AI Vision"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Scan Bill</span>
            </button>

            {/* Budget Planner */}
            <button
              id="btn-nav-budget"
              onClick={onOpenBudgetModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              title="Monthly Budget Limits & Targets"
            >
              <Target className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span className="hidden lg:inline">Budget</span>
            </button>

            {/* Tax Deductions */}
            <button
              id="btn-nav-tax"
              onClick={onOpenTaxModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              title="Tax Deductions & FY Report"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span className="hidden lg:inline">Tax</span>
            </button>

            {/* Parse Text / Statements Button */}
            <button
              id="btn-nav-parse-text"
              onClick={onOpenParserModal}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors cursor-pointer"
              title="Parse unstructured text, statements, or notes"
            >
              <FileText className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
              <span className="hidden sm:inline">Parse Text</span>
            </button>

            {/* CSV Import */}
            <button
              id="btn-nav-csv-modal"
              onClick={onOpenCsvModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors border border-zinc-200 dark:border-zinc-700 cursor-pointer"
              title="Import or Export CSV"
            >
              <Upload className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span>CSV</span>
            </button>

            {/* Data & Backup Tools */}
            <button
              id="btn-nav-data-manage"
              onClick={onOpenDataModal}
              className="p-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
              title="Data Backups, Export & Restore"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Primary Add Button */}
            <button
              id="btn-nav-add-expense"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 dark:bg-emerald-600 hover:bg-zinc-800 dark:hover:bg-emerald-500 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Expense</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

