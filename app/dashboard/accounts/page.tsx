'use client';

import { useBanking } from '@/context/BankingContext';
import { formatCurrency, formatDate, maskAccountNumber } from '@/lib/utils';
import { Account } from '@/types/banking';
import Link from 'next/link';
import {
  CreditCard,
  PiggyBank,
  TrendingUp,
  Landmark,
  Plus,
  Send,
  CalendarCheck,
  ArrowDownToLine,
  ShieldCheck,
  Check,
} from 'lucide-react';

function getAccountIcon(type: string) {
  switch (type) {
    case 'checking':
      return <CreditCard className="w-5 h-5 text-white/90" />;
    case 'savings':
      return <PiggyBank className="w-5 h-5 text-white/90" />;
    case 'credit':
      return <CreditCard className="w-5 h-5 text-white/90" />;
    case 'investment':
    default:
      return <TrendingUp className="w-5 h-5 text-white/90" />;
  }
}

function AccountDetailCard({ account }: { account: Account }) {
  const isCredit = account.type === 'credit';
  const creditUsed = isCredit ? Math.abs(account.balance) : 0;
  const creditLimit = account.creditLimit || 0;
  const creditUsedPct = creditLimit > 0 ? (creditUsed / creditLimit) * 100 : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden hover:shadow-md transition-all">
      {/* Header */}
      <div className={`p-5 text-white bg-gradient-to-br ${account.gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white rounded-full"></div>
        </div>
        <div className="relative">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-white/75 text-[11px] uppercase tracking-wider font-bold">{account.type}</div>
              <div className="text-white font-bold text-base mt-0.5 tracking-tight">{account.name}</div>
            </div>
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              {getAccountIcon(account.type)}
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight">{formatCurrency(Math.abs(account.balance))}</div>
          <div className="text-white/70 text-xs mt-0.5 font-medium">
            {isCredit ? 'Current Balance' : 'Available Balance'}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Account Number</div>
            <div className="font-mono text-gray-800 text-xs font-medium">{maskAccountNumber(account.accountNumber)}</div>
          </div>
          {account.routingNumber ? (
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Routing Number</div>
              <div className="font-mono text-gray-800 text-xs font-medium">•••• {account.routingNumber.slice(-4)}</div>
            </div>
          ) : (
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Status</div>
              <div className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Active & Verified
              </div>
            </div>
          )}
          {account.interestRate && (
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Annual Percentage Yield</div>
              <div className="font-semibold text-gray-800 text-xs">{(account.interestRate * 100).toFixed(1)}% APY</div>
            </div>
          )}
          {isCredit && account.creditLimit && (
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Total Credit Limit</div>
              <div className="font-semibold text-gray-800 text-xs">{formatCurrency(account.creditLimit)}</div>
            </div>
          )}
          {isCredit && account.dueDate && (
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Payment Due Date</div>
              <div className="font-semibold text-gray-800 text-xs">{formatDate(account.dueDate, 'short')}</div>
            </div>
          )}
          {isCredit && account.minPayment && (
            <div>
              <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Minimum Payment</div>
              <div className="font-semibold text-gray-800 text-xs">{formatCurrency(account.minPayment)}</div>
            </div>
          )}
        </div>

        {isCredit && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
              <span>Credit Utilization</span>
              <span className={`font-semibold ${creditUsedPct > 30 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {creditUsedPct.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${creditUsedPct > 70 ? 'bg-red-500' : creditUsedPct > 30 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                style={{ width: `${creditUsedPct}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-medium">
              <span>{formatCurrency(creditUsed)} used</span>
              <span>{formatCurrency(account.availableBalance)} available</span>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Link
            href="/dashboard/transfer"
            className="btn-secondary flex-1 py-2 text-xs text-center flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" /> Transfer
          </Link>
          {isCredit ? (
            <Link
              href="/dashboard/bill-pay"
              className="btn-primary flex-1 py-2 text-xs text-center flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" /> Pay Balance
            </Link>
          ) : (
            <Link
              href="/dashboard/deposit"
              className="btn-primary flex-1 py-2 text-xs text-center flex items-center justify-center gap-1.5"
            >
              <ArrowDownToLine className="w-3.5 h-3.5" /> Deposit
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AccountsPage() {
  const { accounts } = useBanking();
  const totalAssets = accounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0);
  const totalDebt = accounts.filter(a => a.balance < 0).reduce((s, a) => s + Math.abs(a.balance), 0);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Accounts</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage and review all your Wells Banking deposit and credit accounts</p>
      </div>

      {/* Net Summary Banner */}
      <div className="bg-gradient-to-r from-[#0053c2] to-[#0041a8] rounded-xl p-6 text-white shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <div className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Total Assets</div>
            <div className="text-2xl font-bold tracking-tight">{formatCurrency(totalAssets)}</div>
          </div>
          <div>
            <div className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Total Outstanding Debt</div>
            <div className="text-2xl font-bold tracking-tight">{formatCurrency(totalDebt)}</div>
          </div>
          <div>
            <div className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">Total Net Worth</div>
            <div className="text-2xl font-bold tracking-tight">{formatCurrency(totalAssets - totalDebt)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {accounts.map(account => (
          <AccountDetailCard key={account.id} account={account} />
        ))}
      </div>

      {/* Open Account CTA */}
      <div className="bg-white border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#0053c2] transition-colors">
        <div className="w-12 h-12 bg-blue-50 text-[#0053c2] rounded-xl flex items-center justify-center mx-auto mb-3">
          <Plus className="w-6 h-6" />
        </div>
        <div className="font-bold text-gray-800 text-base mb-1">Open a New Account</div>
        <div className="text-xs text-gray-400 mb-4 max-w-sm mx-auto">
          Explore Advantage Checking, Customized Cash Rewards, or Merrill investment solutions.
        </div>
        <button
          type="button"
          className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5"
        >
          <Landmark className="w-4 h-4" /> Explore Accounts
        </button>
      </div>
    </div>
  );
}
