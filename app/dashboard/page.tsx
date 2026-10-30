'use client';

import Link from 'next/link';
import { useBanking } from '@/context/BankingContext';
import { formatCurrency, formatDate, maskAccountNumber, getCategoryLabel } from '@/lib/utils';
import { mockSpendingCategories } from '@/lib/mock-data';
import { Account, TransactionCategory } from '@/types/banking';
import { CategoryIcon } from '@/components/ui/CategoryIcon';
import {
  CreditCard,
  PiggyBank,
  TrendingUp,
  Landmark,
  Send,
  CalendarCheck,
  ArrowDownToLine,
  ArrowLeftRight,
  PieChart,
  User,
  CheckCircle2,
  Bot,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Utensils,
  ShoppingBag,
  Car,
  Zap,
  Film,
  HeartPulse,
  Plane,
} from 'lucide-react';

const spendingLucideIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Food & Dining': Utensils,
  'Shopping': ShoppingBag,
  'Transportation': Car,
  'Utilities': Zap,
  'Entertainment': Film,
  'Health': HeartPulse,
  'Travel': Plane,
};

function getAccountIcon(type: string) {
  switch (type) {
    case 'checking':
      return <CreditCard className="w-5 h-5 text-white/80" />;
    case 'savings':
      return <PiggyBank className="w-5 h-5 text-white/80" />;
    case 'credit':
      return <CreditCard className="w-5 h-5 text-white/80" />;
    case 'investment':
    default:
      return <TrendingUp className="w-5 h-5 text-white/80" />;
  }
}

function AccountCard({ account }: { account: Account }) {
  const isCredit = account.type === 'credit';
  const isNegative = account.balance < 0;

  return (
    <div className={`rounded-xl p-5 text-white card-hover cursor-pointer bg-gradient-to-br ${account.gradient} relative overflow-hidden shadow-sm hover:shadow-md transition-all`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-8 -right-8 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute -bottom-12 -left-4 w-40 h-40 bg-white rounded-full"></div>
      </div>

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-white/75 text-[11px] font-bold uppercase tracking-wider">
              {account.type === 'checking' ? 'Checking' :
               account.type === 'savings' ? 'Savings' :
               account.type === 'credit' ? 'Credit Card' : 'Investment'}
            </div>
            <div className="text-white text-sm font-semibold mt-0.5 max-w-[170px] leading-tight truncate">
              {account.name}
            </div>
          </div>
          <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
            {getAccountIcon(account.type)}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-xs text-white/70 mb-1 font-medium">
            {isCredit ? 'Current Balance' : 'Available Balance'}
          </div>
          <div className="text-2xl font-bold tracking-tight">
            {formatCurrency(Math.abs(account.balance))}
            {isCredit && isNegative && <span className="text-xs font-normal text-white/75 ml-1">owed</span>}
          </div>
          {isCredit && (
            <div className="text-xs text-white/70 mt-1 font-medium">
              {formatCurrency(account.availableBalance)} available of {formatCurrency(account.creditLimit!)} limit
            </div>
          )}
          {!isCredit && account.balance !== account.availableBalance && (
            <div className="text-xs text-white/70 mt-1 font-medium">
              {formatCurrency(account.balance)} total ledger balance
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-white/10">
          <div className="text-xs text-white/70 font-mono tracking-wider">
            {maskAccountNumber(account.accountNumber)}
          </div>
          {account.type === 'savings' && account.interestRate && (
            <div className="bg-white/20 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
              {(account.interestRate * 100).toFixed(1)}% APY
            </div>
          )}
          {isCredit && account.dueDate && (
            <div className="bg-white/20 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
              Due {formatDate(account.dueDate, 'short')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2.5 p-4 bg-white rounded-xl border border-gray-100 hover:border-[#0053c2] hover:bg-blue-50/50 transition-all group card-hover text-center shadow-xs"
    >
      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0053c2] flex items-center justify-center group-hover:scale-105 group-hover:bg-[#0053c2] group-hover:text-white transition-all shadow-xs">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-xs font-semibold text-gray-700 group-hover:text-[#0053c2] transition-colors">{label}</span>
    </Link>
  );
}

export default function DashboardPage() {
  const { accounts, transactions, user } = useBanking();
  const recentTransactions = transactions.slice(0, 6);
  const totalAssets = accounts.filter(a => a.type !== 'credit').reduce((s, a) => s + a.balance, 0);
  const totalDebt = accounts.filter(a => a.type === 'credit').reduce((s, a) => s + Math.abs(a.balance), 0);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {greeting}, {user?.firstName}!
          </h1>
          <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-gray-400" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3.5 py-1.5 rounded-full text-xs font-semibold w-fit">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>All banking systems operational</span>
        </div>
      </div>

      {/* Net Worth Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs">
          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Assets</div>
          <div className="text-2xl font-bold text-gray-900 tracking-tight">{formatCurrency(totalAssets)}</div>
          <div className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +2.4% past 30 days
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs">
          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Net Balance</div>
          <div className="text-2xl font-bold text-gray-900 tracking-tight">{formatCurrency(totalAssets - totalDebt)}</div>
          <div className="text-xs text-gray-400 mt-1.5 flex items-center gap-1 font-medium">
            <Landmark className="w-3.5 h-3.5" /> {accounts.length} active accounts linked
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-xs">
          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Credit Card Balance</div>
          <div className="text-2xl font-bold text-gray-900 tracking-tight">{formatCurrency(totalDebt)}</div>
          <div className="text-xs text-gray-500 mt-1.5 font-medium">Payment due Dec 15, 2024</div>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Your Accounts</h2>
          <Link href="/dashboard/accounts" className="text-sm text-[#0053c2] hover:underline font-semibold flex items-center gap-1">
            View all accounts <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map(account => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3 tracking-tight">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <QuickAction icon={Send} label="Transfer" href="/dashboard/transfer" />
          <QuickAction icon={CalendarCheck} label="Bill Pay" href="/dashboard/bill-pay" />
          <QuickAction icon={ArrowDownToLine} label="Deposit" href="/dashboard/deposit" />
          <QuickAction icon={ArrowLeftRight} label="Transactions" href="/dashboard/transactions" />
          <QuickAction icon={PieChart} label="Spending" href="/dashboard/transactions" />
          <QuickAction icon={User} label="Profile" href="/dashboard/profile" />
        </div>
      </div>

      {/* Lower section: Transactions + Spending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 tracking-tight">Recent Transactions</h2>
            <Link href="/dashboard/transactions" className="text-xs text-[#0053c2] hover:underline font-semibold flex items-center gap-1">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentTransactions.map(txn => (
              <div key={txn.id} className="flex items-center gap-3.5 px-5 py-3 hover:bg-gray-50/80 transition-colors">
                <CategoryIcon category={txn.category} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">{txn.description}</div>
                  <div className="text-xs text-gray-400 flex items-center gap-2 mt-0.5">
                    <span>{formatDate(txn.date, 'relative')}</span>
                    <span>·</span>
                    <span>{getCategoryLabel(txn.category)}</span>
                    {txn.status === 'pending' && (
                      <span className="badge-pending text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
                <div className={`text-sm font-bold tracking-tight ${txn.type === 'credit' ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {txn.type === 'credit' ? '+' : '-'}{formatCurrency(txn.amount)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spending Breakdown */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 tracking-tight">Monthly Spending</h2>
            <p className="text-xs text-gray-400 mt-0.5">Categorized expenditure</p>
          </div>
          <div className="p-5 space-y-3.5">
            {mockSpendingCategories.slice(0, 5).map(cat => {
              const Icon = spendingLucideIcons[cat.name] || PieChart;
              return (
                <div key={cat.name}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="flex items-center gap-2 text-gray-700 font-medium text-xs">
                      <Icon className="w-3.5 h-3.5 text-gray-500" />
                      <span>{cat.name}</span>
                    </span>
                    <span className="font-semibold text-gray-800 text-xs">{formatCurrency(cat.amount)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    ></div>
                  </div>
                </div>
              );
            })}
            <div className="pt-3 border-t border-gray-100 mt-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 font-medium text-xs">Total Spending</span>
                <span className="font-bold text-gray-900 text-sm">
                  {formatCurrency(mockSpendingCategories.reduce((s, c) => s + c.amount, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Erica Assistant Banner */}
      <div className="bg-gradient-to-r from-[#0053c2] to-[#0041a8] rounded-xl p-5 flex items-center gap-4 text-white shadow-sm">
        <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center shrink-0 border border-white/20">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm tracking-tight flex items-center gap-1.5">
            <span>Erica, your virtual financial assistant</span>
            <span className="bg-blue-400/30 text-blue-100 text-[10px] px-2 py-0.5 rounded-full font-semibold">AI Powered</span>
          </div>
          <div className="text-blue-100 text-xs mt-0.5 leading-relaxed">
            I noticed your electric bill is due in 5 days ($143.22). Would you like to schedule automatic payment?
          </div>
        </div>
        <Link
          href="/dashboard/bill-pay"
          className="bg-white text-[#0053c2] text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-blue-50 transition-colors shrink-0 shadow-sm"
        >
          Schedule Bill
        </Link>
      </div>
    </div>
  );
}
