import { PerformanceStatus } from '@/types';

/**
 * Format number to Indonesian Rupiah (Rp)
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format currency to concise Millions/Billions for executive summary cards
 */
export function formatCurrencyShort(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `Rp ${(amount / 1_000_000_000).toFixed(2)} M`;
  }
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)} Jt`;
  }
  return formatRupiah(amount);
}

/**
 * Calculate Achievement Percentage
 */
export function calculateAchievement(realisation: number, target: number): number {
  if (!target || target === 0) return 0;
  const percentage = (realisation / target) * 100;
  return Number(percentage.toFixed(2));
}

/**
 * Determine Status Color based on Achievement Percentage
 * Green: >= 100%
 * Yellow: 80% - 99.9%
 * Red: < 80%
 */
export function getPerformanceStatus(achievementPercent: number): PerformanceStatus {
  if (achievementPercent >= 100) return 'GREEN';
  if (achievementPercent >= 80) return 'YELLOW';
  return 'RED';
}

/**
 * Format NPL Ratio display string
 */
export function formatPercentage(val: number): string {
  return `${val.toFixed(2)}%`;
}

/**
 * Format ISO Date string to localized Indonesian Date
 */
export function formatDateIndo(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}