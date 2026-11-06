'use client';

import { useState } from 'react';
import { useBanking } from '@/context/BankingContext';
import { formatCurrency, maskAccountNumber } from '@/lib/utils';
import { mockRecipients } from '@/lib/mock-data';
import { Recipient } from '@/types/banking';
import Link from 'next/link';
import PinModal from '@/components/ui/PinModal';
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
  CreditCard,
  User,
  Search,
  ChevronDown,
  Globe,
  Clock,
  Star,
} from 'lucide-react';

type Step = 'from' | 'to' | 'amount' | 'review' | 'success';
type TransferType = 'own' | 'external' | 'zelle';

const US_BANKS = [
  'Wells Banking',
  'Chase Bank',
  'Wells Fargo',
  'Citibank',
  'US Bank',
  'TD Bank',
  'PNC Bank',
  'Capital One',
  'Truist Bank',
  'Fifth Third Bank',
  'Regions Bank',
  'KeyBank',
  'Ally Bank',
  'SunTrust Bank',
  'BMO Harris Bank',
  'Huntington Bank',
  'M&T Bank',
  'Santander Bank',
  'First Republic Bank',
  'Silicon Valley Bank',
  'Other / International',
];

// Detect bank from account number prefix (demo logic)
function detectBankFromNumber(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 4) return '';
  const prefix = parseInt(accountNumber.slice(0, 2));
  if (prefix <= 20) return 'Chase Bank';
  if (prefix <= 35) return 'Wells Fargo';
  if (prefix <= 50) return 'Citibank';
  if (prefix <= 65) return 'Wells Banking';
  if (prefix <= 75) return 'US Bank';
  if (prefix <= 85) return 'TD Bank';
  return 'Capital One';
}

// Detect owner name from account number (demo)
function detectNameFromNumber(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 8) return '';
  const lastDigit = parseInt(accountNumber.slice(-1));
  const names = ['James Collins', 'Maria Santos', 'Robert Kim', 'Angela Davis', 'Christopher Lee', 'Jessica Brown', 'Daniel Wilson', 'Stephanie Clark', 'Nathan Harris', 'Laura Thompson'];
  return names[lastDigit] || '';
}

export default function TransferPage() {
  const { accounts, addTransaction } = useBanking();
  const [step, setStep] = useState<Step>('from');
  const [transferType, setTransferType] = useState<TransferType>('own');
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);

  // External bank fields
  const [extAccountNumber, setExtAccountNumber] = useState('');
  const [extConfirmAccountNumber, setExtConfirmAccountNumber] = useState('');
  const [extBank, setExtBank] = useState('');
  const [extIban, setExtIban] = useState('');
  const [extDetectedName, setExtDetectedName] = useState('');
  const [extDetectedBank, setExtDetectedBank] = useState('');
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [isInternational, setIsInternational] = useState(false);

  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPinModal, setShowPinModal] = useState(false);

  const fromAccount = accounts.find(a => a.id === fromAccountId);
  const toAccount = accounts.find(a => a.id === toAccountId);
  const parsedAmount = parseFloat(amount) || 0;

  const handleAccountNumberChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 17);
    setExtAccountNumber(cleaned);
    setExtDetectedBank('');
    setExtDetectedName('');
    if (cleaned.length >= 8) {
      const bank = detectBankFromNumber(cleaned);
      const name = detectNameFromNumber(cleaned);
      setExtDetectedBank(bank);
      setExtDetectedName(name);
      if (!extBank) setExtBank(bank);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (step === 'from') {
      if (!fromAccountId) errs.from = 'Please select a source account';
    }
    if (step === 'to') {
      if (transferType === 'own' && !toAccountId) errs.to = 'Please select a destination account';
      if (transferType !== 'own') {
        if (!selectedRecipient) {
          if (!extAccountNumber || extAccountNumber.length < 8) errs.accountNumber = 'Enter a valid account number (8+ digits)';
          if (extAccountNumber !== extConfirmAccountNumber) errs.confirmAccount = 'Account numbers do not match';
          if (!extBank) errs.bank = 'Please select a bank';
          if (isInternational && !extIban) errs.iban = 'IBAN is required for international transfers';
        }
      }
    }
    if (step === 'amount') {
      if (!amount || parsedAmount <= 0) errs.amount = 'Please enter a valid amount';
      if (fromAccount && parsedAmount > fromAccount.availableBalance) errs.amount = 'Insufficient available balance';
      if (parsedAmount > 25000) errs.amount = 'Transfer limit is $25,000 per transaction';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const getRecipientLabel = () => {
    if (transferType === 'own') return toAccount?.name || '';
    if (selectedRecipient) return selectedRecipient.name;
    return extDetectedName || 'External Account';
  };

  const getBankLabel = () => {
    if (transferType === 'own') return '';
    if (selectedRecipient) return selectedRecipient.bank;
    return extBank || extDetectedBank || '';
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

  const handleConfirmTransfer = () => {
    setShowPinModal(true);
  };

  const handlePinSuccess = async () => {
    setShowPinModal(false);
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    addTransaction({
      accountId: fromAccountId,
      date: new Date().toISOString(),
      description:
        transferType === 'own'
          ? `Transfer to ${toAccount?.name || 'Account'}`
          : `${transferType === 'zelle' ? 'Zelle® Payment' : 'Bank Transfer'} — ${getRecipientLabel()}`,
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
    setExtAccountNumber('');
    setExtConfirmAccountNumber('');
    setExtBank('');
    setExtIban('');
    setExtDetectedName('');
    setExtDetectedBank('');
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
            <strong>{formatCurrency(parsedAmount)}</strong> has been successfully sent.
          </p>
          <p className="text-xs text-gray-400 font-mono mb-8">
            Reference: TRF{Date.now().toString().slice(-10)}
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={resetForm} className="btn-secondary flex-1 text-xs py-2.5">
              New Transfer
            </button>
            <Link href="/dashboard" className="btn-primary flex-1 text-xs py-2.5 text-center">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PinModal
        isOpen={showPinModal}
        onSuccess={handlePinSuccess}
        onCancel={() => setShowPinModal(false)}
        title="Authorize Transfer"
        subtitle={`Enter your 4-digit PIN to send ${formatCurrency(parsedAmount)} via Wells Banking.`}
      />

      <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Transfer Money</h1>
          <p className="text-gray-500 text-sm mt-0.5">Send funds between accounts or to external recipients</p>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-0 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          {stepLabels.map((s, i) => (
            <div key={s.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs
                    ${i < currentStepIdx ? 'bg-emerald-600 text-white' :
                      i === currentStepIdx ? 'bg-[#1a3a6b] text-white ring-4 ring-blue-100' :
                      'bg-gray-100 text-gray-400'}`}
                >
                  {i < currentStepIdx ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-[11px] mt-1 font-semibold ${i === currentStepIdx ? 'text-[#1a3a6b]' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < stepLabels.length - 1 && (
                <div className={`w-12 h-0.5 transition-colors ${i < currentStepIdx ? 'bg-emerald-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-[#e8f0fb]">
            <h2 className="font-bold text-[#1a3a6b] text-sm tracking-tight">
              {step === 'from' && '1. Select Source Account'}
              {step === 'to' && '2. Select Destination'}
              {step === 'amount' && '3. Enter Amount & Details'}
              {step === 'review' && '4. Review & Confirm Transfer'}
            </h2>
          </div>

          <div className="p-6 space-y-5">
            {/* ============ STEP FROM ============ */}
            {step === 'from' && (
              <>
                <div className="flex gap-2 mb-2">
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
                          ${transferType === item.id
                            ? 'border-[#1a3a6b] bg-blue-50/60 text-[#1a3a6b]'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">{item.label}</span>
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
                          ${fromAccountId === acc.id
                            ? 'border-[#1a3a6b] bg-blue-50/50 shadow-xs'
                            : 'border-gray-200 hover:border-gray-300'}`}
                      >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: acc.color }}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-800 text-sm truncate">{acc.name}</div>
                          <div className="text-xs text-gray-400 font-mono">{maskAccountNumber(acc.accountNumber)}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-gray-900 text-sm">{formatCurrency(acc.availableBalance)}</div>
                          <div className="text-[11px] text-gray-400">Available</div>
                        </div>
                        {fromAccountId === acc.id && (
                          <div className="w-6 h-6 rounded-full bg-[#1a3a6b] text-white flex items-center justify-center shrink-0">
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

            {/* ============ STEP TO ============ */}
            {step === 'to' && (
              <div className="space-y-5">
                {/* Own accounts */}
                {transferType === 'own' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Destination Account</label>
                    <div className="space-y-2.5">
                      {accounts.filter(a => a.id !== fromAccountId).map(acc => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => setToAccountId(acc.id)}
                          className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border-2 transition-all text-left cursor-pointer
                            ${toAccountId === acc.id
                              ? 'border-[#1a3a6b] bg-blue-50/50 shadow-xs'
                              : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: acc.color }}>
                            <Landmark className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 text-sm truncate">{acc.name}</div>
                            <div className="text-xs text-gray-400 font-mono">{maskAccountNumber(acc.accountNumber)}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-900 text-sm">{formatCurrency(acc.balance)}</div>
                            <div className="text-[11px] text-gray-400">Balance</div>
                          </div>
                          {toAccountId === acc.id && (
                            <div className="w-6 h-6 rounded-full bg-[#1a3a6b] text-white flex items-center justify-center shrink-0">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    {errors.to && <p className="text-red-500 text-xs mt-2 font-medium">{errors.to}</p>}
                  </div>
                )}

                {/* External bank / Zelle - manual entry */}
                {(transferType === 'external' || transferType === 'zelle') && !selectedRecipient && (
                  <div className="space-y-4">
                    {/* Account Number */}
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                        Recipient Account Number
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={extAccountNumber}
                        onChange={e => handleAccountNumberChange(e.target.value)}
                        placeholder="Enter 8–17 digit account number"
                        className="input-field text-sm font-mono tracking-wider"
                        maxLength={17}
                      />
                      {/* Auto-detected info */}
                      {extDetectedBank && (
                        <div className="mt-2 flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="text-xs">
                            <span className="text-emerald-800 font-bold">{extDetectedBank}</span>
                            {extDetectedName && (
                              <span className="text-emerald-700"> · Account holder: <strong>{extDetectedName}</strong></span>
                            )}
                          </div>
                        </div>
                      )}
                      {errors.accountNumber && <p className="text-red-500 text-xs mt-1 font-medium">{errors.accountNumber}</p>}
                    </div>

                    {/* Confirm Account Number */}
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                        Confirm Account Number
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={extConfirmAccountNumber}
                        onChange={e => setExtConfirmAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 17))}
                        placeholder="Re-enter account number to confirm"
                        className="input-field text-sm font-mono tracking-wider"
                        maxLength={17}
                      />
                      {errors.confirmAccount && <p className="text-red-500 text-xs mt-1 font-medium">{errors.confirmAccount}</p>}
                    </div>

                    {/* Bank selector */}
                    <div className="relative">
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                        Recipient's Bank
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowBankDropdown(!showBankDropdown)}
                        className="input-field flex items-center justify-between w-full text-sm cursor-pointer"
                      >
                        <span className={extBank ? 'text-gray-900 font-medium' : 'text-gray-400'}>
                          {extBank || 'Select a bank...'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showBankDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {showBankDropdown && (
                        <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-xl mt-1 max-h-56 overflow-y-auto animate-scale-in">
                          {US_BANKS.map(bank => (
                            <button
                              key={bank}
                              type="button"
                              onClick={() => { setExtBank(bank); setShowBankDropdown(false); }}
                              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors flex items-center gap-2
                                ${extBank === bank ? 'bg-blue-50 font-semibold text-[#1a3a6b]' : 'text-gray-700'}`}
                            >
                              <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              {bank}
                              {extBank === bank && <Check className="w-3.5 h-3.5 text-[#1a3a6b] ml-auto" />}
                            </button>
                          ))}
                        </div>
                      )}
                      {errors.bank && <p className="text-red-500 text-xs mt-1 font-medium">{errors.bank}</p>}
                    </div>

                    {/* International toggle + IBAN */}
                    <div>
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isInternational}
                          onChange={e => setIsInternational(e.target.checked)}
                          className="w-4 h-4 accent-[#1a3a6b] rounded"
                        />
                        <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-gray-500" />
                          International Wire Transfer (requires IBAN / SWIFT)
                        </span>
                      </label>
                    </div>

                    {isInternational && (
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                          IBAN / SWIFT Code
                        </label>
                        <input
                          type="text"
                          value={extIban}
                          onChange={e => setExtIban(e.target.value.toUpperCase())}
                          placeholder="e.g. GB29 NWBK 6016 1331 9268 19"
                          className="input-field text-sm font-mono tracking-wider"
                        />
                        <p className="text-[11px] text-gray-400 mt-1.5">
                          International transfers typically take 2–5 business days. Additional fees may apply.
                        </p>
                        {errors.iban && <p className="text-red-500 text-xs mt-1 font-medium">{errors.iban}</p>}
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-2" />
                  </div>
                )}

                {/* Zelle - frequent recipients */}
                {(transferType === 'external' || transferType === 'zelle') && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {selectedRecipient ? 'Selected Recipient' : 'Frequent Recipients'}
                      </span>
                      {selectedRecipient && (
                        <button
                          type="button"
                          onClick={() => setSelectedRecipient(null)}
                          className="ml-auto text-xs text-[#1a3a6b] font-semibold hover:underline"
                        >
                          Change
                        </button>
                      )}
                    </div>

                    {selectedRecipient ? (
                      <div className="flex items-center gap-3.5 p-3.5 rounded-xl border-2 border-[#1a3a6b] bg-blue-50/50 shadow-xs">
                        <div className="w-10 h-10 rounded-full bg-[#1a3a6b]/10 text-[#1a3a6b] flex items-center justify-center font-bold text-sm shrink-0">
                          {selectedRecipient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-800 text-sm">{selectedRecipient.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {selectedRecipient.bank} · {maskAccountNumber(selectedRecipient.accountNumber)}
                          </div>
                          {(selectedRecipient.email || selectedRecipient.phone) && (
                            <div className="text-[11px] text-gray-400 mt-0.5">
                              {selectedRecipient.email || selectedRecipient.phone}
                            </div>
                          )}
                        </div>
                        <div className="w-6 h-6 rounded-full bg-[#1a3a6b] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {mockRecipients.map(rec => (
                          <button
                            key={rec.id}
                            type="button"
                            onClick={() => {
                              setSelectedRecipient(rec);
                              setExtAccountNumber('');
                              setExtConfirmAccountNumber('');
                              setExtBank('');
                              setExtIban('');
                              setExtDetectedName('');
                              setExtDetectedBank('');
                              setErrors({});
                            }}
                            className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border-2 border-gray-200 hover:border-[#1a3a6b] hover:bg-blue-50/30 transition-all text-left cursor-pointer group"
                          >
                            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#1a3a6b] flex items-center justify-center font-bold text-sm shrink-0">
                              {rec.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-800 text-sm flex items-center gap-1.5">
                                {rec.name}
                                {rec.recent && (
                                  <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-bold inline-flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5" /> Recent
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 mt-0.5">
                                {rec.bank} · {maskAccountNumber(rec.accountNumber)}
                              </div>
                              {(rec.email || rec.phone) && (
                                <div className="text-[11px] text-gray-400">{rec.email || rec.phone}</div>
                              )}
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#1a3a6b] transition-colors shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                    {errors.to && <p className="text-red-500 text-xs mt-2 font-medium">{errors.to}</p>}
                  </div>
                )}
              </div>
            )}

            {/* ============ STEP AMOUNT ============ */}
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
                      Available:{' '}
                      <span className="font-bold text-gray-700">{formatCurrency(fromAccount.availableBalance)}</span>
                      {' · '}
                      <button
                        type="button"
                        onClick={() => setAmount(fromAccount.availableBalance.toFixed(2))}
                        className="text-[#1a3a6b] font-semibold hover:underline"
                      >
                        Transfer max
                      </button>
                    </p>
                  )}
                  {errors.amount && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.amount}</p>}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {[50, 100, 250, 500, 1000, 2500].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className="px-3.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:border-[#1a3a6b] hover:text-[#1a3a6b] hover:bg-blue-50 transition-colors"
                    >
                      ${val.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Memo</label>
                  <input
                    type="text"
                    value={memo}
                    onChange={e => setMemo(e.target.value)}
                    placeholder="e.g. Rent, groceries, savings"
                    className="input-field text-xs py-2.5"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Schedule Date (optional)</label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field text-xs py-2.5"
                  />
                  <p className="text-[11px] text-gray-400 mt-1 font-medium">Leave empty for immediate processing</p>
                </div>
              </div>
            )}

            {/* ============ STEP REVIEW ============ */}
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
                    <span className="text-gray-400 font-medium">From</span>
                    <span className="font-semibold text-gray-800">
                      {fromAccount?.name} ({maskAccountNumber(fromAccount?.accountNumber || '')})
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400 font-medium">To</span>
                    <span className="font-semibold text-gray-800">
                      {transferType === 'own'
                        ? `${toAccount?.name} (${maskAccountNumber(toAccount?.accountNumber || '')})`
                        : selectedRecipient
                          ? `${selectedRecipient.name} — ${selectedRecipient.bank}`
                          : `${extDetectedName || 'Recipient'} — ${extBank || extDetectedBank}`
                      }
                    </span>
                  </div>
                  {isInternational && extIban && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium">IBAN / SWIFT</span>
                      <span className="font-mono font-semibold text-gray-800">{extIban}</span>
                    </div>
                  )}
                  {memo && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium">Memo</span>
                      <span className="font-medium text-gray-800">{memo}</span>
                    </div>
                  )}
                  {scheduleDate && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400 font-medium">Scheduled For</span>
                      <span className="font-semibold text-gray-800">{scheduleDate}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-gray-800">Total Transfer Amount</span>
                    <span className="text-2xl font-bold text-[#1a3a6b] tracking-tight">{formatCurrency(parsedAmount)}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>You will be asked to enter your 4-digit PIN to authorize this transfer. Ensure all details above are correct before proceeding.</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
            {step !== 'from' && (
              <button type="button" onClick={handleBack} className="btn-secondary flex-1 text-xs py-2.5 inline-flex items-center justify-center gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            {step !== 'review' ? (
              <button type="button" onClick={handleNext} className="btn-primary flex-1 text-xs py-2.5 inline-flex items-center justify-center gap-1.5"
                style={{ backgroundColor: '#1a3a6b' }}>
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmTransfer}
                disabled={isLoading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-2.5 rounded font-bold inline-flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                ) : (
                  <><Check className="w-4 h-4" /> Authorize &amp; Send Transfer</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
