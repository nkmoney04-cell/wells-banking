'use client';

import { useEffect, useState } from 'react';
import { useBanking } from '@/context/BankingContext';
import { formatDate, maskAccountNumber } from '@/lib/utils';
import {
  User,
  Shield,
  Bell,
  Sliders,
  Key,
  Smartphone,
  Lock,
  Laptop,
  Fingerprint,
  LogOut,
  Edit3,
  Save,
  Check,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { firebaseAuth } from '@/lib/firebase/client';

export default function ProfilePage() {
  const { user, accounts, logout } = useBanking();
  const [activeTab, setActiveTab] = useState<'personal' | 'security' | 'alerts' | 'preferences'>('personal');
  const [editMode, setEditMode] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  const [pinError, setPinError] = useState('');
  const [savingPin, setSavingPin] = useState(false);

  useEffect(() => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName || '');
    setEmail(user?.email || '');
  }, [user]);

  const handlePinSetup = async (event: React.FormEvent) => {
    event.preventDefault();
    setPinError('');
    setPinMessage('');
    setSavingPin(true);

    try {
      const idToken = await firebaseAuth?.currentUser?.getIdToken();
      if (!idToken) throw new Error('Please sign in again.');

      const response = await fetch('/api/pin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ pin: newPin, confirmation: confirmPin }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to set PIN.');

      setNewPin('');
      setConfirmPin('');
      setPinMessage('Transaction PIN created successfully.');
    } catch (error) {
      setPinError(error instanceof Error ? error.message : 'Unable to set PIN.');
    } finally {
      setSavingPin(false);
    }
  };

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 600));
    setEditMode(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const tabs = [
    { key: 'personal', label: 'Personal Profile', icon: User },
    { key: 'security', label: 'Security & Access', icon: Shield },
    { key: 'alerts', label: 'Alert Preferences', icon: Bell },
    { key: 'preferences', label: 'System Settings', icon: Sliders },
  ] as const;

  return (
    <div className="max-w-3xl mx-auto animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Profile & Preferences</h1>
        <p className="text-gray-500 text-sm mt-0.5">Manage your credentials, multi-factor security, and banking notifications</p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-slide-in-right">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-emerald-800 font-bold text-xs">Profile records updated successfully.</span>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#0053c2] flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-sm">
            {user?.firstName[0]}{user?.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xl font-bold text-gray-900 tracking-tight">{user?.firstName} {user?.lastName}</div>
            <div className="text-gray-500 text-xs mt-0.5">{user?.email}</div>
            <div className="text-[11px] text-gray-400 mt-1 font-medium">
              Member since {user?.memberSince ? formatDate(user.memberSince, 'short') : 'N/A'} ·
              Last authenticated {user?.lastLogin ? formatDate(user.lastLogin, 'relative') : 'N/A'}
            </div>
          </div>
          <div className="sm:self-start">
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 w-fit">
              <Check className="w-3.5 h-3.5" /> Identity Verified
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-100 shadow-xs p-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer
                ${activeTab === tab.key ? 'bg-[#0053c2] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs">
        {/* Personal Info */}
        {activeTab === 'personal' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-sm tracking-tight">Primary Contact Information</h3>
              <button
                type="button"
                onClick={() => editMode ? handleSave() : setEditMode(true)}
                className={editMode ? 'btn-primary py-1.5 px-3.5 text-xs inline-flex items-center gap-1.5' : 'btn-secondary py-1.5 px-3.5 text-xs inline-flex items-center gap-1.5'}
              >
                {editMode ? <><Save className="w-3.5 h-3.5" /> Save Records</> : <><Edit3 className="w-3.5 h-3.5" /> Edit Profile</>}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">First Legal Name</label>
                {editMode ? (
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="input-field text-xs py-2"
                  />
                ) : (
                  <div className="text-gray-900 font-semibold text-sm">{firstName}</div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Last Legal Name</label>
                {editMode ? (
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="input-field text-xs py-2"
                  />
                ) : (
                  <div className="text-gray-900 font-semibold text-sm">{lastName}</div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Primary Email Address</label>
                {editMode ? (
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field text-xs py-2"
                  />
                ) : (
                  <div className="text-gray-900 font-semibold text-sm">{email}</div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Mobile Phone Number</label>
                {editMode ? (
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="input-field text-xs py-2"
                  />
                ) : (
                  <div className="text-gray-900 font-semibold text-sm">{phone}</div>
                )}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="font-bold text-gray-800 text-xs uppercase tracking-wider mb-3">Linked Accounts Overview</h4>
              <div className="space-y-2.5">
                {accounts.map(acc => (
                  <div key={acc.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/60 border border-gray-100">
                    <div
                      className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: acc.color }}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-gray-800 truncate">{acc.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">{maskAccountNumber(acc.accountNumber)}</div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === 'security' && (
          <div className="p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-sm tracking-tight mb-2">Security & Identity Controls</h3>

            <form onSubmit={handlePinSetup} className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 space-y-3 mb-4">
              <div>
                <div className="font-bold text-gray-800 text-xs">Transaction PIN</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Create or replace the 4-digit PIN used to authorize transfers and payments.</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  value={newPin}
                  onChange={event => setNewPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="New 4-digit PIN"
                  className="input-field text-xs py-2"
                  aria-label="New transaction PIN"
                />
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]{4}"
                  maxLength={4}
                  value={confirmPin}
                  onChange={event => setConfirmPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Confirm PIN"
                  className="input-field text-xs py-2"
                  aria-label="Confirm transaction PIN"
                />
              </div>
              {pinError && <div className="text-xs font-semibold text-red-600">{pinError}</div>}
              {pinMessage && <div className="text-xs font-semibold text-emerald-700">{pinMessage}</div>}
              <button type="submit" disabled={savingPin || newPin.length !== 4 || confirmPin.length !== 4} className="btn-primary py-2 px-3 text-xs">
                {savingPin ? 'Saving...' : 'Save Transaction PIN'}
              </button>
            </form>

            {[
              { icon: Key, title: 'Change Online Passcode', desc: 'Update your alphanumeric banking passcode regularly', action: 'Change' },
              { icon: Smartphone, title: 'Two-Factor Authentication (2FA)', desc: 'Mobile SMS & authenticator push confirmation active', action: 'Configured', actionColor: 'text-emerald-600' },
              { icon: Lock, title: 'Security Questions', desc: 'Three backup challenges set for account recovery', action: 'Update' },
              { icon: Laptop, title: 'Authorized Device Sessions', desc: '1 active web session in Chicago, IL (Current device)', action: 'View All' },
              { icon: Fingerprint, title: 'Biometric Recognition', desc: 'Enable Windows Hello / Touch ID rapid authorization', action: 'Enable' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex items-center gap-4 py-3 border-b border-gray-50 last:border-0">
                  <div className="w-10 h-10 bg-blue-50 text-[#0053c2] rounded-xl flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 text-xs">{item.title}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{item.desc}</div>
                  </div>
                  <button
                    type="button"
                    className={`text-xs font-bold ${item.actionColor || 'text-[#0053c2]'} hover:underline shrink-0`}
                  >
                    {item.action}
                  </button>
                </div>
              );
            })}

            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 text-xs font-bold"
              >
                <LogOut className="w-4 h-4" /> Terminate All Active Banking Sessions
              </button>
            </div>
          </div>
        )}

        {/* Alerts */}
        {activeTab === 'alerts' && (
          <div className="p-6">
            <h3 className="font-bold text-gray-800 text-sm tracking-tight mb-4">Notification & Monitoring Triggers</h3>
            <div className="space-y-4">
              {[
                { title: 'Low Balance Warning', desc: 'Notify instantly when checking balance falls under $500.00', enabled: true },
                { title: 'High-Value Transaction Alert', desc: 'Immediate SMS confirmation for any charge over $500.00', enabled: true },
                { title: 'Unusual Geographical Activity', desc: 'Security alert for sign-in or transaction from unexpected city', enabled: true },
                { title: 'Direct Deposit Notice', desc: 'Push alert as soon as payroll direct deposits are posted', enabled: true },
                { title: 'Scheduled Bill Due Reminders', desc: 'Alert 3 business days before invoice due dates', enabled: false },
                { title: 'Monthly Statement Published', desc: 'Email statement notification at end of billing cycle', enabled: false },
              ].map(alertItem => (
                <div key={alertItem.title} className="flex items-center gap-4 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-800 text-xs">{alertItem.title}</div>
                    <div className="text-[11px] text-gray-400 mt-0.5">{alertItem.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={alertItem.enabled} className="sr-only peer" />
                    <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#0053c2]"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preferences */}
        {activeTab === 'preferences' && (
          <div className="p-6 space-y-4">
            <h3 className="font-bold text-gray-800 text-sm tracking-tight mb-2">Display & Localization Preferences</h3>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Portal Language</label>
              <select className="input-field text-xs py-2 font-medium">
                <option>English (United States)</option>
                <option>Español (Estados Unidos)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Currency Base Display</label>
              <select className="input-field text-xs py-2 font-medium">
                <option>USD — United States Dollar ($)</option>
                <option>EUR — Euro (€)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => alert('Preferences saved')}
                className="btn-primary w-full text-xs py-2.5"
              >
                Save Portal Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
