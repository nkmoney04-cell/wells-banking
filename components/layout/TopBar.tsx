'use client';

import { useState, useRef, useEffect } from 'react';
import { useBanking } from '@/context/BankingContext';
import { formatDate } from '@/lib/utils';
import {
  Search,
  Bell,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  Building2,
} from 'lucide-react';

export default function TopBar() {
  const { user, notifications, markNotificationRead, markAllNotificationsRead, unreadNotificationCount } = useBanking();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getNotifBg = (type: string) => {
    switch (type) {
      case 'alert':
        return 'bg-red-50';
      case 'warning':
        return 'bg-amber-50';
      case 'success':
        return 'bg-emerald-50';
      case 'info':
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-4 shrink-0 z-10">
      {/* Breadcrumb / Page title */}
      <div className="flex-1">
        <div className="text-xs font-medium text-gray-400">Wells Banking Portal</div>
        <div className="font-bold text-gray-800 text-sm tracking-tight">Online Banking</div>
      </div>

      {/* Search Input popup or toggle */}
      {showSearch && (
        <div className="animate-scale-in relative">
          <input
            type="text"
            placeholder="Search accounts or transactions..."
            className="input-field w-64 py-1.5 pl-8 text-sm"
            autoFocus
            onBlur={() => setShowSearch(false)}
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      )}

      <div className="flex items-center gap-2.5">
        {/* Search button */}
        <button
          type="button"
          onClick={() => setShowSearch(!showSearch)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
          title="Search"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors relative"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#C41230] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {unreadNotificationCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-84 bg-white rounded-xl shadow-xl border border-gray-200 animate-scale-in z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <span className="font-bold text-gray-800 text-sm">Notifications</span>
                {unreadNotificationCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="text-xs text-[#0053c2] font-semibold hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-sm">No new notifications</div>
                ) : (
                  notifications.map(notif => (
                    <button
                      key={notif.id}
                      type="button"
                      onClick={() => markNotificationRead(notif.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${!notif.read ? 'bg-blue-50/40' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${getNotifBg(notif.type)}`}>
                          {getNotifIcon(notif.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                            {notif.title}
                            {!notif.read && <span className="w-2 h-2 bg-[#0053c2] rounded-full shrink-0"></span>}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</div>
                          <div className="text-[11px] text-gray-400 mt-1">{formatDate(notif.date, 'relative')}</div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 text-center">
                <span className="text-xs text-gray-400 font-medium">Wells Banking Security Center</span>
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-[#0053c2] flex items-center justify-center text-white font-bold text-xs shadow-sm">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-gray-800 leading-tight">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-[11px] text-gray-400">Personal Banking</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
