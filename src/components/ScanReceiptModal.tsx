import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  Loader2,
  Check,
  AlertCircle,
  Receipt,
  FileImage,
  Calendar,
  IndianRupee,
  Tag,
  ShieldCheck,
} from 'lucide-react';
import { Expense, ExpenseNecessity, ReceiptScanResult } from '../types';
import { CATEGORIES } from '../data/categories';
import { formatCurrency } from '../utils/formatters';

interface ScanReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
}

// Sample receipt presets encoded as minimal realistic receipt canvas representations
const SAMPLE_PRESETS = [
  {
    title: 'Supermarket Bill',
    merchant: 'Nature\'s Basket Supermarket',
    amount: 1850,
    date: new Date().toISOString().split('T')[0],
    category: 'Groceries & Essentials',
    subcategory: 'Supermarket',
    necessity: 'need' as ExpenseNecessity,
    notes: 'Organic milk, sourdough bread, fresh veggies, olive oil',
    isTaxDeductible: false,
    reasoning: 'Essential household food provisions and groceries.',
  },
  {
    title: 'Dining / Restaurant Slip',
    merchant: 'Social Bar & Kitchen',
    amount: 2450,
    date: new Date().toISOString().split('T')[0],
    category: 'Dining & Food Delivery',
    subcategory: 'Restaurants',
    necessity: 'want' as ExpenseNecessity,
    notes: 'Dinner with colleagues, craft beverages, appetizers',
    isTaxDeductible: true,
    reasoning: 'Discretionary social dining with business meal deduction.',
  },
  {
    title: 'Pharmacy / Health Rx',
    merchant: 'Apollo Pharmacy',
    amount: 820,
    date: new Date().toISOString().split('T')[0],
    category: 'Healthcare & Wellness',
    subcategory: 'Pharmacy & Meds',
    necessity: 'need' as ExpenseNecessity,
    notes: 'Prescription antibiotics and daily multivitamins',
    isTaxDeductible: true,
    reasoning: 'Direct healthcare expense eligible for tax deduction.',
  },
];

export const ScanReceiptModal: React.FC<ScanReceiptModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  // Extracted / Editable fields
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState('Groceries & Essentials');
  const [subcategory, setSubcategory] = useState('Supermarket');
  const [necessity, setNecessity] = useState<ExpenseNecessity>('need');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [notes, setNotes] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isTaxDeductible, setIsTaxDeductible] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      scanReceiptWithGemini(result, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      scanReceiptWithGemini(result, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  const scanReceiptWithGemini = async (base64Data: string, type: string) => {
    setIsScanning(true);
    setScanError(null);

    try {
      const res = await fetch('/api/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: type,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const r: ReceiptScanResult = data.result;

      if (r) {
        setMerchant(r.merchant || 'Vendor');
        setDate(r.date || new Date().toISOString().split('T')[0]);
        setAmount(String(r.amount || ''));
        setCategory(r.category || 'Miscellaneous');
        setSubcategory(r.subcategory || 'General');
        setNecessity(r.necessity || 'need');
        setPaymentMethod(r.paymentMethod || 'UPI');
        setNotes(r.notes || '');
        setIsRecurring(Boolean(r.isRecurring));
        setIsTaxDeductible(Boolean(r.isTaxDeductible));
        setConfidence(r.confidence ?? 0.92);
        setAiReasoning(r.aiReasoning || 'Extracted receipt metadata using Gemini OCR.');
        setHasScanned(true);
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      setScanError(err.message || 'Failed to scan receipt. Please enter details manually.');
      // Auto fill fallback
      setMerchant('Scanned Receipt');
      setAmount('500');
      setHasScanned(true);
    } finally {
      setIsScanning(false);
    }
  };

  const applyPreset = (preset: typeof SAMPLE_PRESETS[0]) => {
    // Generate a simple simulated receipt card as preview
    setImagePreview('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400"><rect width="300" height="400" fill="%23f8fafc" stroke="%23cbd5e1" stroke-width="2"/><text x="150" y="50" font-family="monospace" font-size="14" font-weight="bold" text-anchor="middle" fill="%230f172a">TAX INVOICE</text><text x="150" y="80" font-family="sans-serif" font-size="13" text-anchor="middle" fill="%23334155">' + encodeURIComponent(preset.merchant) + '</text><line x1="20" y1="100" x2="280" y2="100" stroke="%2394a3b8" stroke-dasharray="4"/><text x="30" y="140" font-family="monospace" font-size="12" fill="%23475569">Itemization Total</text><text x="270" y="140" font-family="monospace" font-size="13" font-weight="bold" text-anchor="end" fill="%230f172a">INR ' + preset.amount + '</text><text x="30" y="180" font-family="monospace" font-size="11" fill="%2364748b">Date: ' + preset.date + '</text><text x="30" y="210" font-family="monospace" font-size="11" fill="%2364748b">Mode: UPI Verified</text><line x1="20" y1="240" x2="280" y2="240" stroke="%2394a3b8" stroke-dasharray="4"/><text x="150" y="280" font-family="monospace" font-size="11" text-anchor="middle" fill="%2364748b">THANK YOU FOR YOUR VISIT</text></svg>');
    setMerchant(preset.merchant);
    setDate(preset.date);
    setAmount(String(preset.amount));
    setCategory(preset.category);
    setSubcategory(preset.subcategory);
    setNecessity(preset.necessity);
    setPaymentMethod('UPI');
    setNotes(preset.notes);
    setIsTaxDeductible(preset.isTaxDeductible);
    setIsRecurring(false);
    setConfidence(0.96);
    setAiReasoning(preset.reasoning);
    setHasScanned(true);
    setScanError(null);
  };

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (!merchant.trim() || isNaN(numAmount) || numAmount <= 0) {
      setScanError('Please enter a valid merchant and positive amount in Rupees.');
      return;
    }

    onAddExpense({
      merchant: merchant.trim(),
      date,
      amount: numAmount,
      category,
      subcategory,
      necessity,
      paymentMethod,
      notes: notes.trim(),
      isRecurring,
      isTaxDeductible,
      confidence: confidence ?? 0.95,
      aiReasoning: aiReasoning ?? 'Scanned receipt entry.',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[92vh] transition-colors duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                AI Receipt &amp; Bill Scanner
                <span className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Multimodal Vision
                </span>
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Upload receipts, paper invoices, or UPI payment screenshots to extract details automatically
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Quick presets for immediate testing */}
          <div>
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
              Quick Test Presets (No upload required)
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Receipt className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{p.title} ({formatCurrency(p.amount)})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Area */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-5 text-center cursor-pointer transition-colors bg-zinc-50/50 dark:bg-zinc-800/30 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {imagePreview ? (
              <div className="flex items-center justify-center gap-4">
                <img
                  src={imagePreview}
                  alt="Receipt Preview"
                  className="w-20 h-24 object-cover rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-700"
                />
                <div className="text-left">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <Check className="w-4 h-4" />
                    <span>Receipt image loaded</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Click or drag another image to replace
                  </p>
                  {isScanning && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-zinc-600 dark:text-zinc-300">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                      <span>Gemini 3.8 Flash is analyzing receipt text &amp; totals...</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                    Drop your receipt or bill image here, or browse
                  </p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                    Supports PNG, JPG, JPEG, WebP, or PhonePe/GPay screenshots
                  </p>
                </div>
              </div>
            )}
          </div>

          {scanError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{scanError}</span>
            </div>
          )}

          {/* Scanned / Extracted Form Fields */}
          {hasScanned && (
            <div className="space-y-4 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                  Extracted Receipt Details
                </span>
                {confidence !== null && (
                  <span className="text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    AI Confidence: {Math.round(confidence * 100)}%
                  </span>
                )}
              </div>

              {aiReasoning && (
                <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300">
                  💡 {aiReasoning}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Merchant */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Merchant / Store Name
                  </label>
                  <input
                    type="text"
                    value={merchant}
                    onChange={(e) => setMerchant(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Starbucks, Apollo Pharmacy"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Total Amount (₹ INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs text-zinc-500 dark:text-zinc-400 font-semibold">
                      ₹
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 50/30/20 Necessity Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                  50/30/20 Budget Classification
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'need', label: 'Essential Need (50%)', desc: 'Rent, food, medicine' },
                    { id: 'want', label: 'Discretionary Want (30%)', desc: 'Dining, leisure, luxury' },
                    { id: 'savings_investment', label: 'Savings & SIP (20%)', desc: 'Investments, deposits' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setNecessity(item.id as ExpenseNecessity)}
                      className={`p-2 rounded-xl text-left border text-xs cursor-pointer transition-colors ${
                        necessity === item.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300'
                          : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      <span className="font-semibold block">{item.label}</span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                        {item.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes / Items */}
              <div>
                <label className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Itemized Notes / Summary
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Purchased items, invoice number, or memo"
                  className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={isTaxDeductible}
                    onChange={(e) => setIsTaxDeductible(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium">Eligible for Tax Deduction</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-zinc-700 dark:text-zinc-300">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium">Recurring Monthly Bill</span>
                </label>
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

          <button
            type="button"
            onClick={handleSave}
            disabled={!hasScanned || !merchant.trim() || !amount}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            <Check className="w-4 h-4" />
            <span>Add to Expense Ledger</span>
          </button>
        </div>
      </div>
    </div>
  );
};
