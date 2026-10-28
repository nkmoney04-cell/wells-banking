export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  memberSince: string;
  lastLogin: string;
}

export interface Account {
  id: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  name: string;
  accountNumber: string;
  routingNumber: string;
  balance: number;
  availableBalance: number;
  currency: string;
  interestRate?: number;
  creditLimit?: number;
  dueDate?: string;
  minPayment?: number;
  color: string;
  gradient: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  category: TransactionCategory;
  amount: number;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
  merchant?: string;
  icon?: string;
  balance?: number;
  reference?: string;
}

export type TransactionCategory =
  | 'food_dining'
  | 'shopping'
  | 'transportation'
  | 'entertainment'
  | 'health'
  | 'utilities'
  | 'transfer'
  | 'deposit'
  | 'withdrawal'
  | 'payment'
  | 'income'
  | 'investment'
  | 'travel'
  | 'other';

export interface Bill {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'upcoming' | 'overdue';
  autopay: boolean;
  accountNumber?: string;
  icon: string;
}

export interface Recipient {
  id: string;
  name: string;
  bank: string;
  accountNumber: string;
  routingNumber: string;
  email?: string;
  phone?: string;
  avatar?: string;
  recent: boolean;
}

export interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'warning';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface SpendingCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
  icon: string;
}
