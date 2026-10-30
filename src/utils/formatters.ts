/**
 * Formatting utilities for numbers, currencies, dates and labels in Persian
 */

export function formatNumber(num: number): string {
  if (num === undefined || num === null || isNaN(num)) return '۰';
  return new Intl.NumberFormat('fa-IR').format(num);
}

export function formatCurrency(amount: number): string {
  if (!amount) return '۰ تومان';
  return `${formatNumber(amount)} تومان`;
}

export function formatIsoDate(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatShortDate(isoString: string): string {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).format(d);
  } catch {
    return isoString;
  }
}
