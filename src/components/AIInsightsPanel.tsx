import React, { useState } from 'react';
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Repeat,
  Send,
  Loader2,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { Expense, SpendingPatternReport } from '../types';
import { formatCurrency } from '../utils/formatters';

interface AIInsightsPanelProps {
  expenses: Expense[];
  patternReport: SpendingPatternReport | null;
  isLoadingAnalysis: boolean;
  onRunAnalysis: () => void;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  expenses,
  patternReport,
  isLoadingAnalysis,
  onRunAnalysis,
}) => {
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [qaHistory, setQaHistory] = useState<Array<{ q: string; a: string }>>([]);

  const promptSuggestions = [
    'Where did I spend the most money recently?',
    'Which recurring subscriptions could I cancel?',
    'How can I save ₹5,000 next month without impacting essentials?',
    'How does my Dining spend compare to my Grocery spend?',
  ];

  const handleAskQuestion = async (queryText?: string) => {
    const q = queryText || question;
    if (!q.trim() || isAsking) return;

    setIsAsking(true);
    setQuestion('');

    try {
      const res = await fetch('/api/ask-spending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          expenses: expenses,
        }),
      });

      const data = await res.json();
      if (data.answer) {
        setQaHistory((prev) => [...prev, { q, a: data.answer }]);
      } else {
        setQaHistory((prev) => [
          ...prev,
          { q, a: 'Unable to analyze spending query. Please try again.' },
        ]);
      }
    } catch (err: any) {
      setQaHistory((prev) => [
        ...prev,
        { q, a: `Error querying Gemini: ${err.message || 'Network issue'}` },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Action to Run AI Pattern Audit */}
      <div className="p-6 rounded-2xl bg-zinc-900 text-white shadow-md relative overflow-hidden border border-zinc-800">
        {/* Subtle decorative background glow */}
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Gemini Pattern Engine
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              AI Spending Pattern &amp; Behavior Audit
            </h2>
            <p className="mt-1 text-xs text-zinc-300 leading-relaxed">
              Deep evaluation of {expenses.length} transaction records to detect spending velocity, subscription leaks, 50/30/20 budget compliance, and tailored savings opportunities.
            </p>
          </div>

          <button
            id="btn-run-pattern-audit"
            onClick={onRunAnalysis}
            disabled={isLoadingAnalysis || expenses.length === 0}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white dark:bg-emerald-500 text-zinc-900 dark:text-white font-semibold text-xs hover:bg-zinc-100 dark:hover:bg-emerald-400 active:scale-98 transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            {isLoadingAnalysis ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-700 dark:text-zinc-200" />
                <span>Auditing Spending Patterns...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-600 dark:text-white" />
                <span>{patternReport ? 'Re-Analyze Patterns' : 'Run AI Spending Audit'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* AI Pattern Report Display */}
      {patternReport && (
        <div className="space-y-6">
          {/* Executive Summary & Health Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Score Card (4 cols) */}
            <div className="md:col-span-4 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col items-center justify-center text-center">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                Budget Health Score
              </span>
              <div className="relative flex items-center justify-center my-2">
                <div className="w-28 h-28 rounded-full border-8 border-zinc-100 dark:border-zinc-800 flex items-center justify-center">
                  <span className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    {patternReport.budgetHealthScore}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">/100</span>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold mt-2 ${
                  patternReport.budgetHealthLabel === 'Healthy'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : patternReport.budgetHealthLabel === 'Moderate'
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    : 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}
              >
                {patternReport.budgetHealthLabel}
              </span>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                Based on necessity ratios and recurring volatility
              </p>
            </div>

            {/* Summary & Verdict (8 cols) */}
            <div className="md:col-span-8 p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Executive Financial Summary
                  </h3>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                  {patternReport.summary}
                </p>

                <div className="mt-4 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                  <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                    50/30/20 Verdict: <span className="font-normal text-zinc-600 dark:text-zinc-400">{patternReport.fiftyThirtyTwenty?.verdict}</span>
                  </p>
                </div>
              </div>

              {/* Key Insights bullets */}
              {patternReport.keyInsights && patternReport.keyInsights.length > 0 && (
                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-2">
                    Key Pattern Takeaways:
                  </span>
                  <div className="space-y-1.5">
                    {patternReport.keyInsights.map((insight, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subscriptions, Anomalies & Savings Recommendations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Detected Subscriptions */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Repeat className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Detected Subscriptions
                </h3>
              </div>
              {patternReport.detectedRecurringSubscriptions?.length === 0 ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 py-4 text-center">
                  No active recurring subscriptions flagged.
                </p>
              ) : (
                <div className="space-y-2.5 flex-1">
                  {patternReport.detectedRecurringSubscriptions?.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-violet-50/50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {sub.merchant}
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{sub.category}</p>
                      </div>
                      <span className="text-xs font-bold text-violet-700 dark:text-violet-300">
                        {formatCurrency(sub.estimatedMonthly)}
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-normal">/mo</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Anomalies & Spikes */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Spikes &amp; Outliers
                </h3>
              </div>
              {patternReport.anomaliesOrSpikes?.length === 0 ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 py-4 text-center">
                  No atypical spikes or anomalies detected.
                </p>
              ) : (
                <div className="space-y-2.5 flex-1">
                  {patternReport.anomaliesOrSpikes?.map((anomaly, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {anomaly.title}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            anomaly.severity === 'high'
                              ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {anomaly.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
                        {anomaly.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Savings Recommendations */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                  Actionable Savings Levers
                </h3>
              </div>
              {patternReport.savingsRecommendations?.length === 0 ? (
                <p className="text-xs text-zinc-500 dark:text-zinc-400 py-4 text-center">
                  All categories are operating at lean efficiency.
                </p>
              ) : (
                <div className="space-y-2.5 flex-1">
                  {patternReport.savingsRecommendations?.map((rec, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{rec.title}</p>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          {rec.potentialSavings}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal">
                        {rec.action}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Ask AI Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Ask AI About Your Spending Patterns
          </h3>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
          Query your transaction data in plain English to uncover deep answers about specific merchants, categories, or habit changes.
        </p>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleAskQuestion(prompt)}
              className="text-xs px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors text-left cursor-pointer"
            >
              &ldquo;{prompt}&rdquo;
            </button>
          ))}
        </div>

        {/* Q&A Conversation Stream */}
        {qaHistory.length > 0 && (
          <div className="space-y-4 mb-4 max-h-[360px] overflow-y-auto pr-1">
            {qaHistory.map((item, idx) => (
              <div key={idx} className="space-y-2 text-xs">
                {/* User Query */}
                <div className="flex justify-end">
                  <div className="bg-zinc-900 dark:bg-zinc-800 border border-transparent dark:border-zinc-700 text-white px-3.5 py-2 rounded-xl max-w-md">
                    {item.q}
                  </div>
                </div>
                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 px-4 py-3 rounded-xl max-w-xl space-y-1.5 leading-relaxed whitespace-pre-line">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px] mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Gemini Financial Advisor
                    </div>
                    {item.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Query Input Box */}
        <div className="flex items-center gap-2">
          <input
            id="input-ask-ai"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAskQuestion();
            }}
            placeholder="e.g. How much did I spend on Uber or transit this month?"
            className="flex-1 px-4 py-2.5 text-xs bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-zinc-900 dark:focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-800 transition-all text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          />
          <button
            id="btn-submit-ask-ai"
            onClick={() => handleAskQuestion()}
            disabled={isAsking || !question.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 dark:bg-emerald-600 text-white font-semibold text-xs hover:bg-zinc-800 dark:hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {isAsking ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Ask</span>
          </button>
        </div>
      </div>
    </div>
  );
};
