export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  return dateString;
}

export function exportToCSV(expenses: any[], filename = 'expenses.csv') {
  const headers = ['Date', 'Merchant', 'Amount (INR)', 'Category', 'Subcategory', 'Necessity', 'Payment Method', 'Notes', 'Is Recurring', 'Tax Deductible'];
  const rows = expenses.map(e => [
    e.date,
    `"${(e.merchant || '').replace(/"/g, '""')}"`,
    e.amount,
    `"${(e.category || '').replace(/"/g, '""')}"`,
    `"${(e.subcategory || '').replace(/"/g, '""')}"`,
    e.necessity,
    `"${(e.paymentMethod || '').replace(/"/g, '""')}"`,
    `"${(e.notes || '').replace(/"/g, '""')}"`,
    e.isRecurring ? 'Yes' : 'No',
    e.isTaxDeductible ? 'Yes' : 'No',
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(data: any, filename = 'finance_ledger_backup.json') {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportTaxReportCSV(expenses: any[], filename = 'tax_deductions_report.csv') {
  const deductible = expenses.filter(e => e.isTaxDeductible);
  const headers = ['Date', 'Merchant', 'Amount (INR)', 'Category', 'Subcategory', 'Deduction Type / Notes'];
  const rows = deductible.map(e => [
    e.date,
    `"${(e.merchant || '').replace(/"/g, '""')}"`,
    e.amount,
    `"${(e.category || '').replace(/"/g, '""')}"`,
    `"${(e.subcategory || '').replace(/"/g, '""')}"`,
    `"${(e.notes || 'Tax deductible expenditure').replace(/"/g, '""')}"`,
  ]);

  const total = deductible.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  rows.push(['', 'TOTAL TAX DEDUCTIBLE CLAIM', total, '', '', '']);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function filterExpensesByHorizon(expenses: any[], horizon: string) {
  if (horizon === 'all') return expenses;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  return expenses.filter(e => {
    if (!e.date) return false;
    const [yStr, mStr, dStr] = e.date.split('-');
    const expYear = parseInt(yStr, 10);
    const expMonth = parseInt(mStr, 10) - 1;
    const expDay = parseInt(dStr, 10);
    const expDate = new Date(expYear, expMonth, expDay);

    if (horizon === 'thisMonth') {
      return expYear === currentYear && expMonth === currentMonth;
    }
    if (horizon === 'lastMonth') {
      const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
      return expYear === lastMonthDate.getFullYear() && expMonth === lastMonthDate.getMonth();
    }
    if (horizon === '30days') {
      const diffTime = Math.abs(now.getTime() - expDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 30;
    }
    if (horizon === 'ytd') {
      return expYear === currentYear;
    }
    return true;
  });
}

