import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart as PieIcon,
  Receipt,
  Sparkles,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { Expense, SpendingPatternReport, BudgetSettings, TimeHorizon } from './types';
import { INITIAL_EXPENSES } from './data/initialExpenses';
import { Navbar } from './components/Navbar';
import { OverviewMetrics } from './components/OverviewMetrics';
import { QuickAddBar } from './components/QuickAddBar';
import { SpendingPatternsView } from './components/SpendingPatternsView';
import { AIInsightsPanel } from './components/AIInsightsPanel';
import { ExpenseList } from './components/ExpenseList';
import { AddExpenseModal } from './components/AddExpenseModal';
import { TextParserModal } from './components/TextParserModal';
import { CsvImportModal } from './components/CsvImportModal';
import { BatchCategorizeModal } from './components/BatchCategorizeModal';
import { ScanReceiptModal } from './components/ScanReceiptModal';
import { BudgetPlannerModal } from './components/BudgetPlannerModal';
import { TaxSummaryModal } from './components/TaxSummaryModal';
import { DataManagementModal } from './components/DataManagementModal';
import { exportToCSV, filterExpensesByHorizon } from './utils/formatters';
import { ThemeProvider } from './context/ThemeContext';

const STORAGE_KEY = 'ai_finance_categorizer_expenses_inr_v1';
const REPORT_STORAGE_KEY = 'ai_finance_pattern_report_inr_v1';
const BUDGET_STORAGE_KEY = 'ai_finance_budget_settings_inr_v1';

const DEFAULT_BUDGET: BudgetSettings = {
  overallMonthlyBudget: 60000,
  categoryBudgets: {
    'Housing & Rent': 20000,
    'Groceries & Essentials': 12000,
    'Dining & Food Delivery': 6000,
    'Transportation': 5000,
    'Utilities & Bills': 4000,
    'Healthcare & Wellness': 3000,
    'Shopping & Retail': 5000,
    'Entertainment & Leisure': 3000,
  },
};

function FinanceApp() {
  // Load expenses from localStorage or default to INITIAL_EXPENSES (with migration to INR)
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const savedInr = localStorage.getItem(STORAGE_KEY);
      if (savedInr) {
        const parsed = JSON.parse(savedInr);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      // Migrate old USD records if present by converting at ~85 rate
      const oldSaved = localStorage.getItem('ai_finance_categorizer_expenses_v2');
      if (oldSaved) {
        const parsedOld = JSON.parse(oldSaved);
        if (Array.isArray(parsedOld) && parsedOld.length > 0) {
          const converted = parsedOld.map((exp: Expense) => ({
            ...exp,
            amount: Math.round(Number(exp.amount || 0) * 85),
          }));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(converted));
          return converted;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved expenses:', e);
    }
    return INITIAL_EXPENSES;
  });

  // Budget settings state
  const [budgetSettings, setBudgetSettings] = useState<BudgetSettings>(() => {
    try {
      const saved = localStorage.getItem(BUDGET_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved budget settings:', e);
    }
    return DEFAULT_BUDGET;
  });

  // Pattern report cache
  const [patternReport, setPatternReport] = useState<SpendingPatternReport | null>(() => {
    try {
      const saved = localStorage.getItem(REPORT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved report:', e);
    }
    return null;
  });

  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  // Navigation: 'patterns' (Patterns & AI Insights) vs 'ledger' (All Expenses)
  const [activeTab, setActiveTab] = useState<'patterns' | 'ledger'>('patterns');

  // Time Horizon filter
  const [timeRange, setTimeRange] = useState<TimeHorizon>('all');

  // Category filter state
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  // Modal controls
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isParserModalOpen, setIsParserModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [batchTargetExpenses, setBatchTargetExpenses] = useState<Expense[] | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(BUDGET_STORAGE_KEY, JSON.stringify(budgetSettings));
    } catch (e) {
      console.error('Failed to save budget settings:', e);
    }
  }, [budgetSettings]);

  useEffect(() => {
    if (patternReport) {
      try {
        localStorage.setItem(REPORT_STORAGE_KEY, JSON.stringify(patternReport));
      } catch (e) {
        console.error('Failed to save report to localStorage:', e);
      }
    }
  }, [patternReport]);

  // Filter expenses by selected time range using utility
  const filteredExpenses = useMemo(() => {
    return filterExpensesByHorizon(expenses, timeRange);
  }, [expenses, timeRange]);

  // Current month expenses for budget calculations
  const currentMonthExpenses = useMemo(() => {
    return filterExpensesByHorizon(expenses, 'thisMonth');
  }, [expenses]);

  const totalFilteredSpend = filteredExpenses.reduce(
    (sum, e) => sum + (Number(e.amount) || 0),
    0
  );

  // Handler: Run AI Pattern Analysis
  const handleRunPatternAudit = async () => {
    if (filteredExpenses.length === 0 || isLoadingAnalysis) return;
    setIsLoadingAnalysis(true);

    try {
      const res = await fetch('/api/analyze-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expenses: filteredExpenses }),
      });

      const data = await res.json();
      if (data.report) {
        setPatternReport(data.report);
      }
    } catch (err) {
      console.error('Failed to run pattern audit:', err);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  // Automatically trigger pattern analysis once on initial load if no report exists
  useEffect(() => {
    if (!patternReport && filteredExpenses.length > 0) {
      handleRunPatternAudit();
    }
  }, []);

  // CRUD Handlers
  const handleSaveExpense = (newOrUpdated: Expense) => {
    setExpenses((prev) => {
      const exists = prev.some((e) => e.id === newOrUpdated.id);
      if (exists) {
        return prev.map((e) => (e.id === newOrUpdated.id ? newOrUpdated : e));
      }
      return [newOrUpdated, ...prev];
    });
  };

  const handleAddScannedExpense = (item: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...item,
      id: `receipt-${Date.now()}`,
    };
    handleSaveExpense(newExpense);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleBatchDelete = (ids: string[]) => {
    const idSet = new Set(ids);
    setExpenses((prev) => prev.filter((e) => !idSet.has(e.id)));
  };

  const handleApplyBatchResults = (updatedList: Expense[]) => {
    const updateMap = new Map(updatedList.map((e) => [e.id, e]));
    setExpenses((prev) =>
      prev.map((e) => (updateMap.has(e.id) ? updateMap.get(e.id)! : e))
    );
  };

  const handleImportExpenses = (incoming: Expense[]) => {
    setExpenses((prev) => [...incoming, ...prev]);
  };

  const handleResetToSampleData = () => {
    if (confirm('Reset your financial data back to the default sample transactions?')) {
      setExpenses(INITIAL_EXPENSES);
      setPatternReport(null);
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(REPORT_STORAGE_KEY);
    }
  };

  const handleExportCsv = () => {
    exportToCSV(filteredExpenses, `expenses-${timeRange}.csv`);
  };

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900 dark:selection:bg-emerald-950 dark:selection:text-emerald-200 transition-colors duration-200">
      {/* Sticky Header */}
      <Navbar
        totalSpent={totalFilteredSpend}
        transactionCount={filteredExpenses.length}
        onOpenAddModal={() => {
          setEditingExpense(null);
          setIsAddModalOpen(true);
        }}
        onOpenParserModal={() => setIsParserModalOpen(true)}
        onOpenCsvModal={() => setIsCsvModalOpen(true)}
        onOpenScanModal={() => setIsScanModalOpen(true)}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onOpenTaxModal={() => setIsTaxModalOpen(true)}
        onOpenDataModal={() => setIsDataModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Natural Language Quick Add bar */}
        <QuickAddBar
          onAddExpense={handleSaveExpense}
          onOpenScanModal={() => setIsScanModalOpen(true)}
        />

        {/* High-level Overview KPIs with Horizon Selector & Budget Tracker */}
        <OverviewMetrics
          expenses={filteredExpenses}
          timeRange={timeRange}
          onTimeRangeChange={setTimeRange}
          budgetSettings={budgetSettings}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              id="tab-btn-patterns"
              onClick={() => setActiveTab('patterns')}
              className={`inline-flex items-center gap-2 pb-3 px-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'patterns'
                  ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <PieIcon className="w-4 h-4" />
              <span>Spending Patterns &amp; AI Analysis</span>
            </button>

            <button
              id="tab-btn-ledger"
              onClick={() => setActiveTab('ledger')}
              className={`inline-flex items-center gap-2 pb-3 px-2 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === 'ledger'
                  ? 'border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                  : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Categorized Expense Ledger</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">
                {filteredExpenses.length}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Spending Patterns & AI Insights */}
        {activeTab === 'patterns' && (
          <div className="space-y-6">
            {/* Visual breakdown charts */}
            <SpendingPatternsView
              expenses={filteredExpenses}
              onSelectCategory={(cat) => {
                setSelectedCategoryFilter(cat);
                setActiveTab('ledger');
              }}
            />

            {/* AI Pattern Insights & Interactive Query Engine */}
            <AIInsightsPanel
              expenses={filteredExpenses}
              patternReport={patternReport}
              isLoadingAnalysis={isLoadingAnalysis}
              onRunAnalysis={handleRunPatternAudit}
            />
          </div>
        )}

        {/* Tab 2: Categorized Expense Ledger */}
        {activeTab === 'ledger' && (
          <ExpenseList
            expenses={filteredExpenses}
            selectedCategoryFilter={selectedCategoryFilter}
            onCategoryFilterChange={setSelectedCategoryFilter}
            onEditExpense={(expense) => {
              setEditingExpense(expense);
              setIsAddModalOpen(true);
            }}
            onDeleteExpense={handleDeleteExpense}
            onBatchDelete={handleBatchDelete}
            onBatchCategorize={(selected) => setBatchTargetExpenses(selected)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>AI Personal Finance Categorizer • Powered by Google Gemini 3.8</span>
          </div>
          <div className="text-zinc-400 dark:text-zinc-500 text-[11px]">
            Private &amp; Secure • Server-Side GenAI Evaluation
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        initialExpense={editingExpense}
      />

      <ScanReceiptModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onAddExpense={handleAddScannedExpense}
      />

      <BudgetPlannerModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        budgetSettings={budgetSettings}
        onSaveBudgetSettings={setBudgetSettings}
        currentMonthExpenses={currentMonthExpenses}
      />

      <TaxSummaryModal
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
        expenses={expenses}
      />

      <DataManagementModal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        expenses={expenses}
        onUpdateExpenses={setExpenses}
      />

      <TextParserModal
        isOpen={isParserModalOpen}
        onClose={() => setIsParserModalOpen(false)}
        onImportParsed={handleImportExpenses}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        onImport={handleImportExpenses}
      />

      {batchTargetExpenses && (
        <BatchCategorizeModal
          isOpen={Boolean(batchTargetExpenses)}
          onClose={() => setBatchTargetExpenses(null)}
          selectedExpenses={batchTargetExpenses}
          onApplyBatchResults={handleApplyBatchResults}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <FinanceApp />
    </ThemeProvider>
  );
}

