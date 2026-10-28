import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TransactionCategory } from '@/types/banking';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string, format: 'short' | 'long' | 'relative' = 'short'): string {
  const date = new Date(dateString);
  
  if (format === 'relative') {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function maskAccountNumber(accountNumber: string): string {
  return '•••• ' + accountNumber.slice(-4);
}

export function getCategoryLabel(category: TransactionCategory): string {
  const labels: Record<TransactionCategory, string> = {
    food_dining: 'Food & Dining',
    shopping: 'Shopping',
    transportation: 'Transportation',
    entertainment: 'Entertainment',
    health: 'Health & Medical',
    utilities: 'Utilities',
    transfer: 'Transfer',
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    payment: 'Payment',
    income: 'Income',
    investment: 'Investment',
    travel: 'Travel',
    other: 'Other',
  };
  return labels[category] || 'Other';
}

export function getCategoryIcon(category: TransactionCategory): string {
  const icons: Record<TransactionCategory, string> = {
    food_dining: '🍽️',
    shopping: '🛍️',
    transportation: '🚗',
    entertainment: '🎬',
    health: '🏥',
    utilities: '💡',
    transfer: '↔️',
    deposit: '💰',
    withdrawal: '💵',
    payment: '💳',
    income: '💼',
    investment: '📈',
    travel: '✈️',
    other: '•',
  };
  return icons[category] || '•';
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
