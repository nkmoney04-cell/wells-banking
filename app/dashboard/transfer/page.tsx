'use client';

import { useState } from 'react';
import { useBanking } from '@/context/BankingContext';
import { formatCurrency, maskAccountNumber } from '@/lib/utils';
import { mockRecipients } from '@/lib/mock-data';
import { Recipient } from '@/types/banking';
import Link from 'next/link';
import {
  Landmark,
  Building2,
  Zap,
  Check,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowLeft,
  ArrowRight,
  Send,
  Calendar,
  CreditCard,
  User,
  ShieldCheck,
} from 'lucide-react';

type Step = 'from' | 'to' | 'amount' | 'review' | 'success';
type TransferType = 'own' | 'external' | 'zelle';

export default function TransferPage() {
  const { accounts, addTransaction } = useBanking();
  const [step, setStep] = useState<Step>('from');
  const [transferType, setTransferType] = useState<TransferType>('own');
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fromAccount = accounts.find(a => a.id === fromAccountId);
  const toAccount = accounts.find(a => a.id === toAccountId);
  const parsedAmount = parseFloat(amount) || 0;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fromAccountId) errs.from = 'Please select a source account';
    if (step === 'to' && transferType === 'own' && !toAccountId) errs.to = 'Please select a destination account';
    if (step === 'to' && transferType !== 'own' && !selectedRecipient) errs.to = 'Please select a recipient';
    if (step === 'amount') {
      if (!amount || parsedAmount <= 0) errs.amount = 'Please enter a valid amount';
      if (fromAccount && parsedAmount > fromAccount.availableBalance) errs.amount = 'Insufficient available funds';
      if (parsedAmount > 25000) errs.amount = 'Transfer limit is $25,000.00 per transaction';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    const steps: Step[] = ['from', 'to', 'amount', 'review', 'success'];
    const nextIdx = steps.indexOf(step) + 1;
    if (nextIdx < steps.length) setStep(steps[nextIdx]);
  };

  const handleBack = () => {
    const steps: Step[] = ['from', 'to', 'amount', 'review', 'success'];
    const prevIdx = steps.indexOf(step) - 1;
    if (prevIdx >= 0) setStep(steps[prevIdx]);
  };

  const handleConfirmTransfer = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    addTransaction({
      accountId: fromAccountId,
      date: new Date().toISOString(),
      description: transferType === 'own'
        ? `Transfer to ${toAccount?.name || 'Account'}`
        : `Zelle Payment - ${selectedRecipient?.name || 'Recipient'}`,
      category: 'transfer',
      amount: parsedAmount,
      type: 'debit',
      status: 'completed',
      reference: `TRF${Date.now()}`,
    });
    setIsLoading(false);
    setStep('success');
  };

  const resetForm = () => {
    setStep('from');
    setAmount('');
    setMemo('');
    setSelectedRecipient(null);
    setToAccountId('');
    setErrors({});
  };

  const stepLabels = [
    { key: 'from', label: 'From' },
    { key: 'to', label: 'To' },
    { key: 'amount', label: 'Amount' },
    { key: 'review', label: 'Review' },
  ];
  const currentStepIdx = stepLabels.findIndex(s => s.key === step);

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto animate-scale-in">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Transfer Completed!</h2>
          <p className="text-gray-600 mb-1">
            <strong>{formatCurrency(parsedAmount)}</strong> has been successfully transferred.
          </p>
          <p className="text-xs text-gray-400 font-mono mb-8">
            Confirmation Reference: TRF{Date.now().toString().slice(-8)}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="btn-secondary flex-1 text-xs py-2.5"
            >
              Make Another Transfer
            </button>
            <Link
              href="/dashboard"
              className="btn-primary flex-1 text-xs py-2.5 text-center"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transfer Money</h1>
        <p className="text-gray-500 text-sm mt-0.5">Send money instantly between your accounts or via Zelle®</p>
      </div>

      {/* Progress Steps Indicator */}
      <div className="flex items-center gap-0 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
        {stepLabels.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs
                ${i < currentStepIdx ? 'bg-emerald-600 text-white' :
                  i === currentStepIdx ? 'bg-[#0053c2] text-white ring-4 ring-blue-100' :
                  'bg-gray-100 text-gray-400'}`}
              >
                {i < currentStepIdx ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[11px] mt-1 font-semibold ${i === currentStepIdx ? 'text-[#0053c2]' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
            {i < stepLabels.length - 1 && (
              <div className={`w-12 h-0.5 transition-colors ${i < currentStepIdx ? 'bg-emerald-500' : 'bg-gray-200'}`}></div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-[#e8f0fb]">
          <h2 className="font-bold text-[#0053c2] text-sm tracking-tight">
            {step === 'from' && '1. Select Source Account'}
            {step === 'to' && '2. Select Destination'}
            {step === 'amount' && '3. Enter Amount & Details'}
            {step === 'review' && '4. Review & Confirm Transfer'}
          </h2>
        </div>

        <div className="p-6 space-y-5">
          {/* STEP: FROM */}
          {step === 'from' && (
            <>
              <div className="flex gap-2.5 mb-2">
                {[
                  { id: 'own', label: 'Between My Accounts', icon: Landmark },
                  { id: 'external', label: 'Other Bank', icon: Building2 },
                  { id: 'zelle', label: 'Zelle® Transfer', icon: Zap },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTransferType(item.id as TransferType)}
                      className={`flex-1 py-2.5 px-3 rounded-lg border-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer
                        ${transferType === item.id ? 'border-[#0053c2] bg-blue-50/60 text-[#0053c2]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Transfer From</label>
                <div className="space-y-2.5">
                  {accounts.filter(a => a.type !== 'credit').map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setFromAccountId(acc.id)}
                      className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border-2 transition-all text-left cursor-pointer
                        ${fromAccountId === acc.id ? 'border-[#0053c2] bg-blue-50/50 shadow-xs' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: acc.color }}
                      >
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-sm truncate">{acc.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{maskAccountNumber(acc.accountNumber)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-sm">{formatCurrency(acc.availableBalance)}</div>
                        <div className="text-[11px] text-gray-400 font-medium">Available Balance</div>
                      </div>
                      {fromAccountId === acc.id && (
                        <div className="w-6 h-6 rounded-full bg-[#0053c2] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {errors.from && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.from}</p>}
              </div>
            </>
          )}

          {/* STEP: TO */}
          {step === 'to' && (
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                {transferType === 'own' ? 'Destination Account' : 'Choose Recipient'}
              </label>

              {transferType === 'own' ? (
                <div className="space-y-2.5">
                  {accounts.filter(a => a.id !== fromAccountId).map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setToAccountId(acc.id)}
                      className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border-2 transition-all text-left cursor-pointer
                        ${toAccountId === acc.id ? 'border-[#0053c2] bg-blue-50/50 shadow-xs' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: acc.color }}
                      >
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-sm truncate">{acc.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{maskAccountNumber(acc.accountNumber)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-sm">{formatCurrency(acc.balance)}</div>
                        <div className="text-[11px] text-gray-400 font-medium">Current Balance</div>
                      </div>
                      {toAccountId === acc.id && (
                        <div className="w-6 h-6 rounded-full bg-[#0053c2] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {mockRecipients.map(rec => (
                    <button
                      key={rec.id}
                      type="button"
                      onClick={() => setSelectedRecipient(rec)}
                      className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border-2 transition-all text-left cursor-pointer
                        ${selectedRecipient?.id === rec.id ? 'border-[#0053c2] bg-blue-50/50 shadow-xs' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-[#0053c2] flex items-center justify-center font-bold text-sm shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-sm">{rec.name}</div>
                        <div className="text-xs text-gray-400">{rec.bank} · {maskAccountNumber(rec.accountNumber)}</div>
                      </div>
                      {selectedRecipient?.id === rec.id && (
                        <div className="w-6 h-6 rounded-full bg-[#0053c2] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {errors.to && <p className="text-red-500 text-xs mt-2 font-medium">{errors.to}</p>}
            </div>
          )}

          {/* STEP: AMOUNT */}
          {step === 'amount' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Transfer Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-2xl font-bold">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    className="input-field pl-10 text-2xl font-bold h-16 text-gray-900"
                    autoFocus
                  />
                </div>
                {fromAccount && (
                  <p className="text-xs text-gray-400 mt-2 font-medium">
                    Available balance:{' '}
                    <span className="font-bold text-gray-700">{formatCurrency(fromAccount.availableBalance)}</span>
                    {' · '}
                    <button
                      type="button"
                      onClick={() => setAmount(fromAccount.availableBalance.toString())}
                      className="text-[#0053c2] font-semibold hover:underline"
                    >
                      Transfer maximum
                    </button>
                  </p>
                )}
                {errors.amount && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.amount}</p>}
              </div>

              {/* Quick preset chips */}
              <div className="flex gap-2 flex-wrap">
                {[50, 100, 250, 500, 1000].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAmount(val.toString())}
                    className="px-3.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-[#0053c2] hover:text-[#0053c2] hover:bg-blue-50 transition-colors"
                  >
                    ${val.toLocaleString()}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Memo / Note</label>
                <input
                  type="text"
                  value={memo}
                  onChange={e => setMemo(e.target.value)}
                  placeholder="e.g. Rent share, groceries, savings deposit"
                  className="input-field text-xs py-2.5"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Scheduled Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={e => setScheduleDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field text-xs py-2.5"
                />
                <p className="text-[11px] text-gray-400 mt-1 font-medium">Leave empty for instant transfer</p>
              </div>
            </div>
          )}

          {/* STEP: REVIEW */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-5 space-y-3.5 border border-gray-100">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Transfer Channel</span>
                  <span className="font-bold text-gray-800">
                    {transferType === 'own' ? 'Internal Account Transfer' : transferType === 'zelle' ? 'Zelle® Direct Pay' : 'External ACH Transfer'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Funding Account</span>
                  <span className="font-semibold text-gray-800">
                    {fromAccount?.name} ({maskAccountNumber(fromAccount?.accountNumber || '')})
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Recipient Account</span>
                  <span className="font-semibold text-gray-800">
                    {transferType === 'own'
                      ? `${toAccount?.name} (${maskAccountNumber(toAccount?.accountNumber || '')})`
                      : selectedRecipient?.name
                    }
                  </span>
                </div>
                {memo && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">Memo</span>
                    <span className="font-medium text-gray-800">{memo}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-800">Total Transfer Amount</span>
                  <span className="text-2xl font-bold text-[#0053c2] tracking-tight">{formatCurrency(parsedAmount)}</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Please verify all routing and account parameters before executing. Transfers are processed immediately under Bank of America security protocol.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          {step !== 'from' && (
            <button
              type="button"
              onClick={handleBack}
              className="btn-secondary flex-1 text-xs py-2.5 inline-flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {step !== 'review' ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary flex-1 text-xs py-2.5 inline-flex items-center justify-center gap-1.5"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmTransfer}
              disabled={isLoading}
              className="btn-primary flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs py-2.5 inline-flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing Transfer...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Authorize & Send Transfer
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
