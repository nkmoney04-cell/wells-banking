'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBanking } from '@/context/BankingContext';
import {
  Lock,
  ShieldCheck,
  Building2,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useBanking();
  const router = useRouter();
  const [step, setStep] = useState<'id' | 'password'>('id');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleIdSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!userId.trim()) {
      setError('Please enter your Bank of America Online ID');
      return;
    }
    setStep('password');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password.trim()) {
      setError('Please enter your Passcode');
      return;
    }
    setIsLoading(true);
    const success = await login(userId, password);
    setIsLoading(false);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('The Online ID or Passcode you entered does not match our records. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
      {/* Top Banner Header */}
      <header className="bg-[#0053c2] text-white">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5 text-[#0053c2]" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Bank of America</span>
          </Link>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <a href="#" className="text-blue-200 hover:text-white transition-colors">Locations</a>
            <a href="#" className="text-blue-200 hover:text-white transition-colors">Help Center</a>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          {/* Main Login Card */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Card Brand Header */}
            <div className="bg-[#0053c2] px-8 py-5 text-white">
              <h1 className="text-lg font-bold tracking-tight">Sign In</h1>
              <p className="text-blue-200 text-xs mt-0.5">Bank of America Online Banking Portal</p>
            </div>

            {/* Card Form Body */}
            <div className="px-8 py-7">
              {/* Security Shield Indicator */}
              <div className="flex items-start gap-3 bg-blue-50/70 border border-blue-100 rounded-xl p-3 mb-6">
                <ShieldCheck className="w-5 h-5 text-[#0053c2] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-blue-950 block">Encrypted Connection</span>
                  <span className="text-blue-800/80 mt-0.5 block">Session protected with 256-bit TLS bank-grade encryption.</span>
                </div>
              </div>

              {step === 'id' ? (
                <form onSubmit={handleIdSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="userId" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Online ID
                    </label>
                    <input
                      id="userId"
                      type="text"
                      value={userId}
                      onChange={e => setUserId(e.target.value)}
                      placeholder="Enter your Online ID"
                      className="input-field text-sm"
                      autoFocus
                      autoComplete="username"
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      Hint: Enter any email or username (e.g. james.anderson@email.com)
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 accent-[#0053c2] rounded"
                    />
                    <label htmlFor="rememberMe" className="text-xs text-gray-600 font-medium">
                      Save this Online ID for future sign-ins
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5"
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs">
                    <User className="w-4 h-4 text-gray-500 shrink-0" />
                    <span className="text-gray-800 font-semibold flex-1 truncate">{userId}</span>
                    <button
                      type="button"
                      onClick={() => { setStep('id'); setError(''); setPassword(''); }}
                      className="text-[#0053c2] text-xs font-bold hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Passcode
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your Passcode"
                        className="input-field pr-10 text-sm"
                        autoFocus
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1.5">
                      Hint: Any passcode with 6+ characters will sign you in
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-3 text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      'Sign In Securely'
                    )}
                  </button>
                </form>
              )}

              <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col items-center gap-2 text-xs">
                <a href="#" className="text-[#0053c2] font-semibold hover:underline">Forgot your Online ID or Passcode?</a>
                <div className="flex items-center gap-3 text-gray-400 text-[11px] mt-1 font-medium">
                  <a href="#" className="hover:text-gray-600">Enroll Now</a>
                  <span>|</span>
                  <a href="#" className="hover:text-gray-600">Contact Us</a>
                  <span>|</span>
                  <a href="#" className="hover:text-gray-600">Security Center</a>
                </div>
              </div>
            </div>
          </div>

          {/* Security Credentials Badges */}
          <div className="mt-6 flex justify-center gap-6 text-xs text-gray-400 font-medium">
            <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> FDIC Insured</span>
            <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> 256-bit SSL</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Fraud Protected</span>
          </div>
        </div>
      </div>

      <footer className="py-4 text-center text-[11px] text-gray-400 bg-white border-t border-gray-200">
        © 2026 Bank of America Corporation · Member FDIC · Equal Housing Lender
      </footer>
    </div>
  );
}
