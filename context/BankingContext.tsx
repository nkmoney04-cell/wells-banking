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
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { firebaseAuth } from '@/lib/firebase/client';

interface BankingContextType {
  user: User | null;
  accounts: Account[];
  transactions: Transaction[];
  bills: Bill[];
  notifications: Notification[];
  isAuthenticated: boolean;
  isAuthLoading: boolean;
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
  // Always start unauthenticated — user must log in each session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [bills] = useState<Bill[]>(mockBills);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('acc_001');

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      if (!firebaseAuth) throw new Error('Firebase is not configured.');
      await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
      return true;
    } catch (error) {
      console.error('Firebase login failed', error);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    if (!firebaseAuth) {
      setUser(null);
      setIsAuthenticated(false);
      return;
    }
    await signOut(firebaseAuth);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  useEffect(() => {
    if (!firebaseAuth) {
      setIsAuthLoading(false);
      return;
    }
    return onAuthStateChanged(firebaseAuth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        setUser({
          ...mockUser,
          id: firebaseUser.uid,
          email: firebaseUser.email || mockUser.email,
          firstName: firebaseUser.displayName?.split(' ')[0] || mockUser.firstName,
          lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || mockUser.lastName,
        });
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsAuthLoading(false);
    });
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = { ...transaction, id: generateId() };
    setTransactions(prev => [newTransaction, ...prev]);

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
        isAuthLoading,
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
