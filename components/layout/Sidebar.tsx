'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBanking } from '@/context/BankingContext';
import {
  LayoutDashboard,
  Landmark,
  ArrowLeftRight,
  Send,
  CalendarCheck,
  ArrowDownToLine,
  User,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/accounts', label: 'Accounts', icon: Landmark },
  { href: '/dashboard/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { href: '/dashboard/transfer', label: 'Transfer Money', icon: Send },
  { href: '/dashboard/bill-pay', label: 'Bill Pay', icon: CalendarCheck },
  { href: '/dashboard/deposit', label: 'Deposit Checks', icon: ArrowDownToLine },
];

const secondaryItems = [
  { href: '/dashboard/profile', label: 'Profile & Settings', icon: User },
  { href: '#', label: 'Help & Support', icon: HelpCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, unreadNotificationCount } = useBanking();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${collapsed ? 'w-18' : 'w-64'} sidebar-transition bg-white border-r border-gray-200 flex flex-col h-full z-20 shrink-0 relative select-none`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 bg-[#1a3a6b] shrink-0 border-b border-blue-900/20">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-5 h-5 text-[#1a3a6b]" />
            </div>
            <div className="min-w-0">
              <div className="text-white font-bold text-sm leading-tight tracking-tight">Wells Banking</div>
              <div className="text-blue-200 text-xs font-normal">Online Banking</div>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center mx-auto shadow-sm">
            <Building2 className="w-5 h-5 text-[#1a3a6b]" />
          </div>
        )}
      </div>

      {/* Collapse Toggle Button */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-5 -right-3 w-6 h-6 bg-white border border-gray-300 rounded-full flex items-center justify-center text-gray-500 hover:text-[#0053c2] hover:border-[#0053c2] shadow-sm z-30 transition-all cursor-pointer"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* User Info Capsule */}
      {!collapsed && user && (
        <div className="px-4 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#0053c2] flex items-center justify-center text-white font-bold text-xs tracking-wider shrink-0 shadow-sm">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-800 text-sm truncate">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-xs text-gray-400 truncate">{user.email}</div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 py-4 overflow-y-auto px-2 space-y-1">
        {!collapsed && (
          <div className="px-3 mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Main Menu</span>
          </div>
        )}
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all relative font-medium
                ${isActive
                  ? 'bg-blue-50 text-[#0053c2] font-semibold border-l-3 border-[#0053c2]'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
                ${collapsed ? 'justify-center px-0' : ''}
              `}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-[#0053c2]' : 'text-gray-500'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.label === 'Transactions' && unreadNotificationCount > 0 && (
                <span className="ml-auto bg-[#C41230] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                  {unreadNotificationCount}
                </span>
              )}
            </Link>
          );
        })}

        <div className="my-4 border-t border-gray-100"></div>

        {!collapsed && (
          <div className="px-3 mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Account</span>
          </div>
        )}
        {secondaryItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all font-medium
                ${isActive
                  ? 'bg-blue-50 text-[#0053c2] font-semibold'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
                ${collapsed ? 'justify-center px-0' : ''}
              `}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-[#0053c2]' : 'text-gray-500'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout Action */}
      <div className="p-3 border-t border-gray-200 shrink-0">
        <button
          type="button"
          onClick={logout}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all w-full font-medium cursor-pointer ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? 'Sign Out' : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
