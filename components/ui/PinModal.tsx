'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Delete, Shield, Loader2 } from 'lucide-react';
import { firebaseAuth } from '@/lib/firebase/client';

interface PinModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  title?: string;
  subtitle?: string;
}

export default function PinModal({ isOpen, onSuccess, onCancel, title = 'Authorization Required', subtitle = 'Enter your 4-digit Wells Banking PIN to authorize this transaction.' }: PinModalProps) {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    if (isOpen) {
      setPin(['', '', '', '']);
      setError('');
      setIsVerifying(false);
      setTimeout(() => inputRefs[0].current?.focus(), 100);
    }
  }, [isOpen]);

  const handleDigitChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);
    setError('');

    if (digit && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all 4 digits filled
    if (digit && index === 3) {
      const fullPin = [...newPin.slice(0, 3), digit].join('');
      if (fullPin.length === 4) {
        setTimeout(() => submitPin(fullPin), 100);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        const newPin = [...pin];
        newPin[index - 1] = '';
        setPin(newPin);
        inputRefs[index - 1].current?.focus();
      } else {
        const newPin = [...pin];
        newPin[index] = '';
        setPin(newPin);
      }
    }
  };

  const handleNumpadPress = (digit: string) => {
    const emptyIndex = pin.findIndex(d => d === '');
    if (emptyIndex === -1) return;
    handleDigitChange(emptyIndex, digit);
  };

  const handleBackspace = () => {
    const lastFilledIndex = [...pin].reverse().findIndex(d => d !== '');
    if (lastFilledIndex === -1) return;
    const idx = 3 - lastFilledIndex;
    const newPin = [...pin];
    newPin[idx] = '';
    setPin(newPin);
  };

  const submitPin = async (fullPin: string) => {
    setIsVerifying(true);
    try {
      const idToken = await firebaseAuth?.currentUser?.getIdToken();
      if (!idToken) throw new Error('Authentication required');

      const response = await fetch('/api/pin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ pin: fullPin }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Incorrect PIN.');

      setIsVerifying(false);
      onSuccess();
    } catch (error) {
      setIsVerifying(false);
      setShake(true);
      setError(error instanceof Error ? error.message : 'Incorrect PIN. Try again.');
      setPin(['', '', '', '']);
      setTimeout(() => {
        setShake(false);
        inputRefs[0].current?.focus();
      }, 600);
    }
  };

  const handleSubmit = () => {
    const fullPin = pin.join('');
    if (fullPin.length < 4) {
      setError('Please enter all 4 digits of your PIN.');
      return;
    }
    submitPin(fullPin);
  };

  if (!isOpen) return null;

  const filledCount = pin.filter(d => d !== '').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden ${shake ? 'animate-shake' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#1a3a6b] to-[#0d2447] px-6 py-5 text-white text-center relative">
          <button
            type="button"
            onClick={onCancel}
            className="absolute right-4 top-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            aria-label="Cancel"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-3 border border-white/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-bold text-base tracking-tight">{title}</h2>
          <p className="text-blue-200 text-xs mt-1 leading-relaxed">{subtitle}</p>
        </div>

        <div className="px-6 py-6">
          {/* PIN dots display */}
          <div className="flex justify-center gap-4 mb-6">
            {pin.map((digit, i) => (
              <div
                key={i}
                className={`relative w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all
                  ${digit ? 'border-[#1a3a6b] bg-[#1a3a6b]/5' : 'border-gray-200 bg-gray-50'}
                  ${error ? 'border-red-400 bg-red-50' : ''}
                `}
              >
                {digit ? (
                  <div className="w-3 h-3 rounded-full bg-[#1a3a6b]"></div>
                ) : (
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                )}
                {/* Hidden input for keyboard */}
                <input
                  ref={inputRefs[i]}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleDigitChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                  autoComplete="off"
                />
              </div>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-600 text-xs text-center font-semibold mb-4 bg-red-50 border border-red-100 rounded-lg py-2 px-3">
              {error}
            </p>
          )}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((key, i) => {
              if (key === '') return <div key={i} />;
              if (key === 'del') {
                return (
                  <button
                    key="del"
                    type="button"
                    onClick={handleBackspace}
                    className="h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-all active:scale-95 font-semibold"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                );
              }
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleNumpadPress(key)}
                  className="h-12 rounded-xl bg-gray-50 hover:bg-blue-50 hover:text-[#1a3a6b] border border-gray-200 hover:border-[#1a3a6b]/30 text-gray-800 font-bold text-lg transition-all active:scale-95"
                >
                  {key}
                </button>
              );
            })}
          </div>

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={filledCount < 4 || isVerifying}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50
              bg-[#1a3a6b] hover:bg-[#0d2447] text-white flex items-center justify-center gap-2 shadow-sm"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying PIN...
              </>
            ) : (
              'Confirm & Authorize'
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
