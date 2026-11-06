'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBanking } from '@/context/BankingContext';
import { Building2 } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useBanking();
  const router = useRouter();

  // Always land on the login screen first when unauthenticated, or dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-[#1a3a6b] flex flex-col items-center justify-center text-white">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
          <Building2 className="w-9 h-9 text-[#1a3a6b]" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Wells Banking</h1>
          <p className="text-blue-200 text-xs mt-1">Connecting to Secure Online Portal...</p>
        </div>
        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin mt-2"></div>
      </div>
    </div>
  );
}
