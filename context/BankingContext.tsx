'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User, Account, Transaction, Bill, Notification } from '@/types/banking';
import {
  mockUser,
  mockAccounts,
  mockTransactions,
  mockBills,
  mockNotifications,
} from '@/lib/mock-data';
import { generateId } from '@/lib/utils';

interface BankingContextType {
  user: User | null;
  accounts: Account[];
  transactions: Transaction[];
  bills: Bill[];
  notifications: Notification[];
  isAuthenticated: boolean;
  selectedAccountId: string;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setSelectedAccountId: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  unreadNotificationCount: number;
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

export function BankingProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bofa_user');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore error
        }
      }
    }
    return mockUser; // default to logged in user for immediate seamless experience
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bofa_auth');
      if (saved !== null) {
        return saved === 'true';
      }
    }
    return true; // default to true so all subpages work seamlessly on direct load/refresh
  });

  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc_001');

  // Sync auth state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bofa_auth', isAuthenticated ? 'true' : 'false');
      if (user) {
        localStorage.setItem('bofa_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('bofa_user');
      }
    }
  }, [isAuthenticated, user]);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (email && password.length >= 6) {
      setUser(mockUser);
      setIsAuthenticated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('bofa_auth', 'true');
        localStorage.setItem('bofa_user', JSON.stringify(mockUser));
      }
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('bofa_auth', 'false');
      localStorage.removeItem('bofa_user');
    }
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = { ...transaction, id: generateId() };
    setTransactions(prev => [newTransaction, ...prev]);

    // Update account balance
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === transaction.accountId) {
          const balanceChange = transaction.type === 'credit' ? transaction.amount : -transaction.amount;
          return {
            ...acc,
            balance: acc.balance + balanceChange,
            availableBalance: acc.availableBalance + balanceChange,
          };
        }
        return acc;
      })
    );
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const unreadNotificationCount = notifications.filter(n => !n.read).length;

  return (
    <BankingContext.Provider
      value={{
        user,
        accounts,
        transactions,
        bills,
        notifications,
        isAuthenticated,
        selectedAccountId,
        login,
        logout,
        setSelectedAccountId,
        addTransaction,
        markNotificationRead,
        markAllNotificationsRead,
        unreadNotificationCount,
      }}
    >
      {children}
    </BankingContext.Provider>
  );
}

export function useBanking() {
  const context = useContext(BankingContext);
  if (!context) throw new Error('useBanking must be used within BankingProvider');
  return context;
}
