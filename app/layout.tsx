import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { BankingProvider } from '@/context/BankingContext';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Wells Banking - Online Banking',
  description: 'Secure online banking — manage your accounts, pay bills, transfer money, and more with Wells Banking.',
  keywords: 'banking, online banking, wells banking, checking, savings, transfer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <BankingProvider>{children}</BankingProvider>
      </body>
    </html>
  );
}
