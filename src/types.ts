export type ExpenseNecessity = 'need' | 'want' | 'savings_investment';

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  merchant: string;
  amount: number;
  category: string;
  subcategory?: string;
  necessity: ExpenseNecessity;
  paymentMethod?: string;
  notes?: string;
  isRecurring?: boolean;
  isTaxDeductible?: boolean;
  confidence?: number; // 0.0 to 1.0
  aiReasoning?: string;
}

export interface CategoryDefinition {
  id: string;
  name: string;
  icon: string;
  color: string;
  defaultNecessity: ExpenseNecessity;
  subcategories: string[];
}

export interface SpendingPatternReport {
  summary: string;
  budgetHealthScore: number; // 0 to 100
  budgetHealthLabel: 'Healthy' | 'Moderate' | 'Needs Attention' | 'Critical';
  fiftyThirtyTwenty: {
    needsPercent: number;
    wantsPercent: number;
    savingsPercent: number;
    targetNeeds: number;
    targetWants: number;
    targetSavings: number;
    verdict: string;
  };
  detectedRecurringSubscriptions: Array<{
    merchant: string;
    estimatedMonthly: number;
    category: string;
  }>;
  anomaliesOrSpikes: Array<{
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  savingsRecommendations: Array<{
    title: string;
    potentialSavings: string;
    action: string;
  }>;
  keyInsights: string[];
}

export interface CategorizeRequestItem {
  id?: string;
  merchant: string;
  amount?: number;
  date?: string;
  notes?: string;
}

export interface CategorizeResponseItem {
  id?: string;
  merchant: string;
  category: string;
  subcategory: string;
  necessity: ExpenseNecessity;
  confidence: number;
  aiReasoning: string;
  isRecurring?: boolean;
  isTaxDeductible?: boolean;
}

export interface BudgetSettings {
  overallMonthlyBudget: number;
  categoryBudgets: Record<string, number>;
}

export interface ReceiptScanResult {
  merchant: string;
  date: string;
  amount: number;
  category: string;
  subcategory?: string;
  necessity: ExpenseNecessity;
  paymentMethod?: string;
  notes?: string;
  isRecurring?: boolean;
  isTaxDeductible?: boolean;
  confidence?: number;
  aiReasoning?: string;
}

export type TimeHorizon = 'all' | 'thisMonth' | 'lastMonth' | '30days' | 'ytd';
