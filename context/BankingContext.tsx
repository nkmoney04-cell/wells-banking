'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc_001');

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    if (email && password.length >= 6) {
      setUser(mockUser);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = { ...transaction, id: generateId() };
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Update account balance
    setAccounts(prev => prev.map(acc => {
      if (acc.id === transaction.accountId) {
        const balanceChange = transaction.type === 'credit' ? transaction.amount : -transaction.amount;
        return {
          ...acc,
          balance: acc.balance + balanceChange,
          availableBalance: acc.availableBalance + balanceChange,
        };
      }
      return acc;
    }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
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
