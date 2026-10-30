'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBanking } from '@/context/BankingContext';
import { formatCurrency } from '@/lib/utils';
import {
  ShieldCheck,
  Lock,
  Zap,
  CreditCard,
  ArrowRightLeft,
  Smartphone,
  Calendar,
  PieChart,
  Building2,
  TrendingUp,
  ArrowRight,
  Shield,
  Clock,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useBanking();
  const router = useRouter();

  // Fix: Move router.push into useEffect to avoid React render lifecycle warning
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#0053c2] text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-sm flex items-center justify-center shadow-sm">
                <Building2 className="w-5 h-5 text-[#0053c2]" />
              </div>
              <div>
                <div className="text-white font-bold text-lg leading-tight tracking-tight">Bank of America</div>
              </div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#" className="text-blue-200 hover:text-white transition-colors">Personal</a>
            <a href="#" className="text-blue-200 hover:text-white transition-colors">Small Business</a>
            <a href="#" className="text-blue-200 hover:text-white transition-colors">Wealth Management</a>
            <a href="#" className="text-blue-200 hover:text-white transition-colors">Investing</a>
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="bg-white text-[#0053c2] font-semibold px-4 py-2 rounded text-sm hover:bg-blue-50 transition-colors inline-flex items-center gap-1.5"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-white text-[#0053c2] font-semibold px-4 py-2 rounded text-sm hover:bg-blue-50 transition-colors"
              >
                Sign In
              </Link>
            )}
          </nav>
          {isAuthenticated ? (
            <Link href="/dashboard" className="md:hidden bg-white text-[#0053c2] font-semibold px-3 py-1.5 rounded text-sm">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="md:hidden bg-white text-[#0053c2] font-semibold px-4 py-1.5 rounded text-sm">
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Secondary nav */}
      <div className="bg-[#003a8c] text-white">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-6 text-xs overflow-x-auto py-2.5">
            {['Checking', 'Savings', 'Credit Cards', 'Home Loans', 'Auto Loans', 'Investing', 'Insurance'].map(item => (
              <a key={item} href="#" className="text-blue-200 hover:text-white whitespace-nowrap transition-colors">
                {item}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#0053c2] via-[#0041a8] to-[#002d75] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-300 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-20 md:py-28 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-sm mb-6 border border-white/10">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-xs font-medium tracking-wide">Secure Banking · FDIC Insured</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4 tracking-tight">
              Banking made<br />
              <span className="text-blue-200">simple and secure.</span>
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-lg leading-relaxed">
              Manage your money, pay bills, transfer funds, and grow your savings — all in one place. Trusted by millions of Americans.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="btn-primary bg-white text-[#0053c2] hover:bg-blue-50 px-8 py-3.5 text-base font-semibold rounded shadow-lg hover:shadow-xl transition-all"
              >
                Sign In to Online Banking
              </Link>
              <Link
                href="/dashboard"
                className="btn-secondary border-white text-white hover:bg-white/10 px-8 py-3.5 text-base rounded"
              >
                Explore Live Demo
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-blue-200">
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-300" /> 256-bit Encryption
              </span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-300" /> FDIC Insured
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-300" /> 24/7 Access
              </span>
            </div>
          </div>

          {/* Mock Dashboard Preview Card */}
          <div className="flex-1 max-w-md w-full animate-slide-in-right">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <span className="text-sm font-semibold text-blue-100">Account Overview</span>
                <span className="text-xs bg-white/20 px-2.5 py-1 rounded-full text-white font-medium">Live Demo</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Advantage Checking', amount: '$12,845.67', icon: CreditCard, color: 'bg-blue-400' },
                  { label: 'Advantage Savings', amount: '$38,920.14', icon: Building2, color: 'bg-emerald-400' },
                  { label: 'Merrill Investment', amount: '$85,632.45', icon: TrendingUp, color: 'bg-purple-400' },
                ].map((account, i) => {
                  const Icon = account.icon;
                  return (
                    <div key={i} className="flex items-center gap-3.5 p-3 rounded-xl bg-white/5 border border-white/10">
                      <div className={`w-9 h-9 rounded-lg ${account.color} bg-opacity-20 flex items-center justify-center text-white`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-blue-200">{account.label}</div>
                        <div className="text-lg font-bold text-white tracking-tight">{account.amount}</div>
                      </div>
                      <span className="text-emerald-300 text-xs font-semibold flex items-center gap-0.5">
                        <TrendingUp className="w-3.5 h-3.5" /> +2.4%
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-200">Total Net Worth</span>
                  <span className="font-bold text-white text-lg">{formatCurrency(137398.26)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">Everything you need, in one place</h2>
          <p className="text-gray-500 text-center mb-12 text-sm">Powerful banking tools designed for your everyday financial life</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: CreditCard, title: 'Account Management', desc: 'View balances, statements, and transaction history across all your accounts in real-time.' },
              { icon: ArrowRightLeft, title: 'Easy Transfers', desc: 'Send money instantly via Zelle®, or schedule transfers between your Bank of America accounts.' },
              { icon: Smartphone, title: 'Mobile Deposit', desc: 'Deposit checks from anywhere by simply taking a photo with your phone or camera.' },
              { icon: Calendar, title: 'Bill Pay', desc: 'Pay all your bills in one place. Set up autopay so you never miss an upcoming due date.' },
              { icon: PieChart, title: 'Spending Insights', desc: 'Get personalized spending reports and categorization tools to keep your budget on track.' },
              { icon: ShieldCheck, title: 'Advanced Security', desc: 'Multi-factor authentication, real-time alerts, and 256-bit encryption keep your money safe.' },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 card-hover">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-[#0053c2] mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-[#C41230] text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to experience seamless banking?</h2>
          <p className="text-red-100 mb-6 text-sm">Join millions of customers who trust Bank of America with their financial future.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-white text-[#C41230] font-bold px-8 py-3 rounded hover:bg-red-50 transition-colors shadow-lg"
          >
            Launch Online Banking <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-7 h-7 bg-white rounded-sm flex items-center justify-center">
              <Building2 className="w-4 h-4 text-[#0053c2]" />
            </div>
            <span className="text-white font-bold text-sm">Bank of America</span>
          </div>
          <div className="text-xs text-gray-500 border-t border-gray-800 pt-6">
            © 2026 Bank of America Corporation. All rights reserved. Member FDIC. Equal Housing Lender.
            This is an interactive banking interface demonstration.
          </div>
        </div>
      </footer>
    </div>
  );
}
