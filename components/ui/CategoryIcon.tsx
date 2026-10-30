'use client';

import React from 'react';
import {
  Utensils,
  ShoppingBag,
  Car,
  Film,
  HeartPulse,
  Zap,
  ArrowRightLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  CreditCard,
  Briefcase,
  TrendingUp,
  Plane,
  Receipt,
  Wifi,
  Smartphone,
  ShieldCheck,
  Home,
  Dumbbell,
  Landmark,
  LucideIcon,
} from 'lucide-react';
import { TransactionCategory } from '@/types/banking';

const categoryIconMap: Record<TransactionCategory, LucideIcon> = {
  food_dining: Utensils,
  shopping: ShoppingBag,
  transportation: Car,
  entertainment: Film,
  health: HeartPulse,
  utilities: Zap,
  transfer: ArrowRightLeft,
  deposit: ArrowDownToLine,
  withdrawal: ArrowUpFromLine,
  payment: CreditCard,
  income: Briefcase,
  investment: TrendingUp,
  travel: Plane,
  other: Receipt,
};

const categoryColorMap: Record<TransactionCategory, { bg: string; text: string }> = {
  food_dining: { bg: 'bg-amber-100', text: 'text-amber-700' },
  shopping: { bg: 'bg-blue-100', text: 'text-blue-700' },
  transportation: { bg: 'bg-purple-100', text: 'text-purple-700' },
  entertainment: { bg: 'bg-pink-100', text: 'text-pink-700' },
  health: { bg: 'bg-rose-100', text: 'text-rose-700' },
  utilities: { bg: 'bg-amber-100', text: 'text-amber-800' },
  transfer: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  deposit: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  withdrawal: { bg: 'bg-orange-100', text: 'text-orange-700' },
  payment: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  income: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  investment: { bg: 'bg-violet-100', text: 'text-violet-700' },
  travel: { bg: 'bg-sky-100', text: 'text-sky-700' },
  other: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

export function CategoryIcon({
  category,
  size = 'md',
  className = '',
}: {
  category: TransactionCategory;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const Icon = categoryIconMap[category] || Receipt;
  const colors = categoryColorMap[category] || { bg: 'bg-gray-100', text: 'text-gray-700' };

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-lg flex items-center justify-center shrink-0 ${colors.bg} ${colors.text} ${className}`}
    >
      <Icon className={iconSizes[size]} />
    </div>
  );
}

const billIconMap: Record<string, LucideIcon> = {
  'Utilities': Zap,
  'Internet & Cable': Wifi,
  'Phone': Smartphone,
  'Insurance': ShieldCheck,
  'Mortgage': Home,
  'Health & Fitness': Dumbbell,
};

export function BillIcon({
  category,
  size = 'md',
  className = '',
}: {
  category: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const Icon = billIconMap[category] || Receipt;

  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-xl bg-blue-50 text-[#0053c2] flex items-center justify-center shrink-0 ${className}`}
    >
      <Icon className={iconSizes[size]} />
    </div>
  );
}
