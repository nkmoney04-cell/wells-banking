'use client';

import { useState, useMemo } from 'react';
import { useBanking } from '@/context/BankingContext';
import { formatCurrency, formatDate, getCategoryLabel } from '@/lib/utils';
import { TransactionCategory } from '@/types/banking';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import {
  Search,
  Download,
  Filter,
  SearchX,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';

const CATEGORIES: TransactionCategory[] = [
  'food_dining', 'shopping', 'transportation', 'entertainment',
  'health', 'utilities', 'transfer', 'deposit', 'withdrawal',
  'payment', 'income', 'investment', 'travel', 'other'
];

export default function TransactionsPage() {
  const { transactions, accounts, selectedAccountId, setSelectedAccountId } = useBanking();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TransactionCategory | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7d' | '30d' | '90d'>('30d');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  const filteredTransactions = useMemo(() => {
    let result = transactions.filter(t => {
      if (selectedAccountId !== 'all' && t.accountId !== selectedAccountId) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!t.description.toLowerCase().includes(q) && !t.merchant?.toLowerCase().includes(q)) return false;
      }
      if (dateFilter !== 'all') {
        const days = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : 90;
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        if (new Date(t.date) < cutoff) return false;
      }
      return true;
    });

    return result.sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortOrder === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortOrder === 'highest') return b.amount - a.amount;
      return a.amount - b.amount;
    });
  }, [transactions, selectedAccountId, typeFilter, categoryFilter, searchQuery, dateFilter, sortOrder]);

  const totalCredits = filteredTransactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalDebits = filteredTransactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transaction History</h1>
          <p className="text-gray-500 text-sm mt-0.5">Search and filter your checking, savings, and credit activity</p>
        </div>
        <button
          type="button"
          onClick={() => alert('Statement download initiated (PDF/CSV).')}
          className="btn-secondary text-xs py-2 px-3.5 inline-flex items-center gap-1.5 w-fit"
        >
          <Download className="w-4 h-4" /> Download Statement
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Total Entries</div>
          <div className="text-xl font-bold text-gray-900">{filteredTransactions.length} Activity Items</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Total Money In</div>
          <div className="text-xl font-bold text-emerald-600 flex items-center gap-1">
            <ArrowDownLeft className="w-4 h-4" /> +{formatCurrency(totalCredits)}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Total Money Out</div>
          <div className="text-xl font-bold text-gray-900 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4 text-red-500" /> -{formatCurrency(totalDebits)}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Account selector */}
          <select
            value={selectedAccountId}
            onChange={e => setSelectedAccountId(e.target.value)}
            className="input-field shrink-0 w-auto text-xs py-2 font-medium"
          >
            <option value="all">All Accounts</option>
            {accounts.map(a => (
              <option key={a.id} value={a.id}>{a.name.split(' ').slice(0, 2).join(' ')}</option>
            ))}
          </select>

          {/* Date filter */}
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value as typeof dateFilter)}
            className="input-field shrink-0 w-auto text-xs py-2 font-medium"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>

          {/* Type filter */}
          <div className="flex rounded-md border border-gray-200 overflow-hidden text-xs font-semibold">
            {(['all', 'credit', 'debit'] as const).map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-2 capitalize transition-colors ${typeFilter === type ? 'bg-[#0053c2] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                {type === 'all' ? 'All' : type === 'credit' ? 'Money In' : 'Money Out'}
              </button>
            ))}
          </div>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as typeof categoryFilter)}
            className="input-field shrink-0 w-auto text-xs py-2 font-medium"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{getCategoryLabel(cat)}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value as typeof sortOrder)}
            className="input-field shrink-0 w-auto text-xs py-2 font-medium"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>

          {/* Search box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description, merchant, ref..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="input-field pl-9 text-xs py-2"
            />
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <SearchX className="w-6 h-6" />
            </div>
            <div className="text-gray-700 font-semibold text-sm">No transactions found</div>
            <div className="text-gray-400 text-xs mt-1">Try adjusting your filters or search terms</div>
          </div>
        ) : (
          <>
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-12 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <span className="col-span-6 sm:col-span-5">Description</span>
              <span className="hidden sm:block sm:col-span-2">Category</span>
              <span className="col-span-3 sm:col-span-2">Date</span>
              <span className="hidden sm:block sm:col-span-1">Status</span>
              <span className="col-span-3 sm:col-span-2 text-right">Amount</span>
            </div>
            <div className="divide-y divide-gray-50">
              {filteredTransactions.map((txn, i) => (
                <div
                  key={txn.id}
                  className="px-5 py-3.5 grid grid-cols-12 items-center hover:bg-gray-50/80 transition-colors"
                >
                  <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0 pr-2">
                    <CategoryIcon category={txn.category} size="md" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-gray-800 truncate">{txn.description}</div>
                      {txn.merchant && (
                        <div className="text-xs text-gray-400 truncate">{txn.merchant}</div>
                      )}
                      {txn.reference && (
                        <div className="text-[11px] text-gray-400 font-mono">Ref: {txn.reference}</div>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:block sm:col-span-2">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-medium">
                      {getCategoryLabel(txn.category)}
                    </span>
                  </div>
                  <div className="col-span-3 sm:col-span-2 text-xs text-gray-500 font-medium">
                    {formatDate(txn.date, 'short')}
                  </div>
                  <div className="hidden sm:block sm:col-span-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider badge-${txn.status}`}>
                      {txn.status}
                    </span>
                  </div>
                  <div className={`col-span-3 sm:col-span-2 text-right text-sm font-bold tracking-tight ${txn.type === 'credit' ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                  </div>
                </div>
              ))}
            </div>
            <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Showing {filteredTransactions.length} of {transactions.length} records</span>
              <span className="text-[#0053c2]">Bank of America Verified Statement</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
