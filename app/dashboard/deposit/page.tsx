'use client';

import { useState, useRef } from 'react';
import { useBanking } from '@/context/BankingContext';
import { formatCurrency, maskAccountNumber } from '@/lib/utils';
import Link from 'next/link';
import {
  CreditCard,
  Landmark,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  FileCheck,
  RotateCcw,
  ShieldCheck,
  Check,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

type Step = 'select' | 'capture' | 'review' | 'success';

export default function DepositPage() {
  const { accounts, addTransaction } = useBanking();
  const [step, setStep] = useState<Step>('select');
  const [accountId, setAccountId] = useState(accounts.find(a => a.type === 'checking')?.id || accounts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const account = accounts.find(a => a.id === accountId);
  const parsedAmount = parseFloat(amount) || 0;

  const handleImageCapture = (side: 'front' | 'back', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      if (side === 'front') setFrontImage(ev.target?.result as string);
      else setBackImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleMockCapture = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontImage('/check-front-placeholder');
    } else {
      setBackImage('/check-back-placeholder');
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!accountId) errs.account = 'Please select a receiving account';
    if (!amount || parsedAmount <= 0) errs.amount = 'Please enter a valid check dollar amount';
    if (parsedAmount > 10000) errs.amount = 'Daily mobile check deposit limit is $10,000.00';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirmDeposit = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    addTransaction({
      accountId,
      date: new Date().toISOString(),
      description: 'Mobile Check Deposit',
      category: 'deposit',
      amount: parsedAmount,
      type: 'credit',
      status: 'pending',
      reference: `MCK${Date.now()}`,
    });
    setIsLoading(false);
    setStep('success');
  };

  if (step === 'success') {
    return (
      <div className="max-w-lg mx-auto animate-scale-in">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Deposit Submitted!</h2>
          <p className="text-gray-600 mb-1">
            Check for <strong>{formatCurrency(parsedAmount)}</strong> is in verification.
          </p>
          <p className="text-xs text-gray-400 mb-4">Standard availability: Next business banking day.</p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex items-start gap-2 text-left mb-8">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>Retain the physical paper check securely for 30 calendar days until deposit clearance completes, then shred.</span>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setStep('select'); setAmount(''); setFrontImage(null); setBackImage(null); }}
              className="btn-secondary flex-1 text-xs py-2.5"
            >
              Deposit Another
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
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mobile Check Deposit</h1>
        <p className="text-gray-500 text-sm mt-0.5">Securely deposit personal and business checks using camera scan</p>
      </div>

      {/* Steps Pill */}
      <div className="flex bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        {(['select', 'capture', 'review'] as Step[]).map((s, i) => (
          <div
            key={s}
            className={`flex-1 py-3 text-center text-xs font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5
              ${step === s ? 'border-[#0053c2] text-[#0053c2] bg-blue-50/50' :
                ['select', 'capture', 'review'].indexOf(step) > i ? 'border-emerald-500 text-emerald-600' :
                'border-transparent text-gray-400'}`}
          >
            <span>{i + 1}.</span>
            <span>{s === 'select' ? 'Account & Amount' : s === 'capture' ? 'Check Images' : 'Verification'}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="p-6 space-y-5">
          {/* STEP 1: SELECT */}
          {step === 'select' && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Deposit Destination</label>
                <div className="space-y-2.5">
                  {accounts.filter(a => a.type !== 'credit' && a.type !== 'investment').map(acc => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setAccountId(acc.id)}
                      className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border-2 transition-all text-left cursor-pointer
                        ${accountId === acc.id ? 'border-[#0053c2] bg-blue-50/50 shadow-xs' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                        style={{ backgroundColor: acc.color }}
                      >
                        {acc.type === 'checking' ? <CreditCard className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-800 text-sm truncate">{acc.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{maskAccountNumber(acc.accountNumber)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900 text-sm">{formatCurrency(acc.availableBalance)}</div>
                        <div className="text-[11px] text-gray-400">Available</div>
                      </div>
                      {accountId === acc.id && (
                        <div className="w-6 h-6 rounded-full bg-[#0053c2] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Check Amount</label>
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
                  />
                </div>
                {errors.amount && <p className="text-red-500 text-xs mt-1.5 font-medium">{errors.amount}</p>}
                <p className="text-xs text-gray-400 mt-1.5 font-medium">Daily mobile deposit limit: $10,000.00</p>
              </div>

              {/* Security info box */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs">
                <div className="font-bold text-[#1a3a6b] mb-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Wells Banking Deposit Guidelines
                </div>
                <ul className="text-blue-900/80 space-y-1 font-medium">
                  <li>• Ensure the check is made payable exactly to your legal account name</li>
                  <li>• Endorse the back with signature and "For Wells Banking Mobile Deposit Only"</li>
                  <li>• Photograph in a well-lit area against a dark, non-reflective background</li>
                </ul>
              </div>
            </>
          )}

          {/* STEP 2: CAPTURE */}
          {step === 'capture' && (
            <div className="space-y-6">
              <div className="text-xs text-blue-900 bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#0053c2] shrink-0 mt-0.5" />
                <span>Align all four corners of the check inside the guide boundary. Ensure the MICR numbers at the bottom are sharp.</span>
              </div>

              {/* Front of Check */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Front Side of Check</label>
                <div
                  onClick={() => frontImage ? null : frontInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl h-44 flex flex-col items-center justify-center cursor-pointer transition-all
                    ${frontImage ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-300 hover:border-[#0053c2] hover:bg-blue-50/30'}`}
                >
                  {frontImage && frontImage !== '/check-front-placeholder' ? (
                    <img src={frontImage} alt="Front of check" className="h-full w-full object-contain rounded-xl p-2" />
                  ) : frontImage === '/check-front-placeholder' ? (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-emerald-800">Front Check Image Captured & Validated</div>
                      <button
                        type="button"
                        onClick={() => setFrontImage(null)}
                        className="text-xs text-red-600 mt-2 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Retake Photo
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-blue-50 text-[#0053c2] rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-gray-700">Click to Snap or Upload Front of Check</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">JPEG, PNG supported</div>
                    </div>
                  )}
                </div>
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={e => handleImageCapture('front', e)}
                />
                {!frontImage && (
                  <button
                    type="button"
                    onClick={() => handleMockCapture('front')}
                    className="mt-2 text-xs text-[#0053c2] font-semibold hover:underline w-full text-center"
                  >
                    Simulate Camera Capture (Demo Mode)
                  </button>
                )}
              </div>

              {/* Back of Check */}
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Back Side of Check (Endorsement)</label>
                <div
                  onClick={() => backImage ? null : backInputRef.current?.click()}
                  className={`relative border-2 border-dashed rounded-xl h-44 flex flex-col items-center justify-center cursor-pointer transition-all
                    ${backImage ? 'border-emerald-500 bg-emerald-50/30' : 'border-gray-300 hover:border-[#0053c2] hover:bg-blue-50/30'}`}
                >
                  {backImage && backImage !== '/check-back-placeholder' ? (
                    <img src={backImage} alt="Back of check" className="h-full w-full object-contain rounded-xl p-2" />
                  ) : backImage === '/check-back-placeholder' ? (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-emerald-800">Back Endorsement Captured & Validated</div>
                      <button
                        type="button"
                        onClick={() => setBackImage(null)}
                        className="text-xs text-red-600 mt-2 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Retake Photo
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-blue-50 text-[#0053c2] rounded-xl flex items-center justify-center mx-auto mb-2">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <div className="text-xs font-bold text-gray-700">Click to Snap or Upload Back of Check</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">Ensure endorsement signature is visible</div>
                    </div>
                  )}
                </div>
                <input
                  ref={backInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={e => handleImageCapture('back', e)}
                />
                {!backImage && (
                  <button
                    type="button"
                    onClick={() => handleMockCapture('back')}
                    className="mt-2 text-xs text-[#0053c2] font-semibold hover:underline w-full text-center"
                  >
                    Simulate Camera Capture (Demo Mode)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 'review' && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-5 space-y-3.5 border border-gray-100">
                <h3 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-2">Deposit Verification</h3>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Destination Account</span>
                  <span className="font-semibold text-gray-800">
                    {account?.name} ({maskAccountNumber(account?.accountNumber || '')})
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Check Amount</span>
                  <span className="font-bold text-xl text-[#0053c2]">{formatCurrency(parsedAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Funds Availability</span>
                  <span className="font-semibold text-gray-800">Next Business Banking Day</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Front Check Image</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> High Quality Scan
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 font-medium">Back Endorsement</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Signature Detected
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-xs text-gray-500 bg-blue-50/60 border border-blue-100 rounded-xl p-3.5">
                <ShieldCheck className="w-4 h-4 text-[#1a3a6b] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  By clicking Submit Deposit, you certify that this item is a genuine negotiable check, has not been deposited elsewhere, and meets Wells Banking mobile banking deposit requirements.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          {step !== 'select' && (
            <button
              type="button"
              onClick={() => {
                const steps: Step[] = ['select', 'capture', 'review'];
                const prev = steps[steps.indexOf(step) - 1];
                setStep(prev);
              }}
              className="btn-secondary flex-1 text-xs py-2.5 inline-flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          {step === 'select' && (
            <button
              type="button"
              onClick={() => { if (validate()) setStep('capture'); }}
              className="btn-primary flex-1 text-xs py-2.5 inline-flex items-center justify-center gap-1.5"
            >
              Continue to Scan <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {step === 'capture' && (
            <button
              type="button"
              onClick={() => setStep('review')}
              disabled={!frontImage}
              className="btn-primary flex-1 text-xs py-2.5 inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              Review Deposit <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {step === 'review' && (
            <button
              type="button"
              onClick={handleConfirmDeposit}
              disabled={isLoading}
              className="btn-primary flex-1 bg-emerald-600 hover:bg-emerald-700 text-xs py-2.5 inline-flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Check...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Submit Mobile Deposit
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
