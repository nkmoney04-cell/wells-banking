'use client';

import { useState } from 'react';
import { useBanking } from '@/context/BankingContext';
import { mockBills } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Bill } from '@/types/banking';
import { BillIcon } from '@/components/ui/CategoryIcon';
import {
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Check,
  Clock,
  Loader2,
  Calendar,
  X,
  CreditCard,
  Building2,
} from 'lucide-react';
import PinModal from '@/components/ui/PinModal';

export default function BillPayPage() {
  const { accounts, addTransaction } = useBanking();
  const [bills, setBills] = useState<Bill[]>(mockBills);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paymentAccountId, setPaymentAccountId] = useState(accounts[0]?.id || '');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successBill, setSuccessBill] = useState<Bill | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);

  const handlePayBill = (bill: Bill) => {
    setSelectedBill(bill);
    setPaymentAmount(bill.amount.toString());
    setPaymentDate(new Date().toISOString().split('T')[0]);
  };

  const confirmPayment = async () => {
    if (!selectedBill) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));

    addTransaction({
      accountId: paymentAccountId,
      date: new Date().toISOString(),
      description: `Bill Payment - ${selectedBill.name}`,
      category: 'payment',
      amount: parseFloat(paymentAmount),
      type: 'debit',
      status: 'completed',
      reference: `BP${Date.now()}`,
    });

    setBills(prev =>
      prev.map(b => (b.id === selectedBill.id ? { ...b, status: 'paid' as const } : b))
    );

    setIsLoading(false);
    setSuccessBill(selectedBill);
    setSelectedBill(null);
  };

  const overdueCount = bills.filter(b => b.status === 'overdue').length;
  const upcomingCount = bills.filter(b => b.status === 'upcoming').length;
  const totalDue = bills.filter(b => b.status !== 'paid').reduce((s, b) => s + b.amount, 0);

  return (
    <>
      <PinModal
        isOpen={showPinModal}
        onSuccess={() => {
          setShowPinModal(false);
          confirmPayment();
        }}
        onCancel={() => setShowPinModal(false)}
        title="Authorize Bill Payment"
        subtitle={
          selectedBill
            ? `Enter your 4-digit Wells Banking PIN to authorize payment of ${formatCurrency(
                parseFloat(paymentAmount) || selectedBill.amount
              )} to ${selectedBill.name}.`
            : 'Enter your 4-digit Wells Banking PIN.'
        }
      />

      <div className="max-w-4xl mx-auto animate-fade-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bill Pay Center</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage, schedule, and pay recurring utility and service bills</p>
        </div>
        <button
          type="button"
          onClick={() => alert('New payee setup modal')}
          className="btn-primary text-xs py-2 px-3.5 inline-flex items-center gap-1.5 w-fit"
        >
          <Plus className="w-4 h-4" /> Add Payee
        </button>
      </div>

      {/* Success notification */}
      {successBill && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-slide-in-right">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1">
            <div className="font-bold text-emerald-800 text-sm">Payment Executed Successfully</div>
            <div className="text-xs text-emerald-700 mt-0.5">
              {formatCurrency(successBill.amount)} submitted to {successBill.name}. Reference BP{Date.now().toString().slice(-6)}.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSuccessBill(null)}
            className="text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Total Outstanding</div>
          <div className="text-xl font-bold text-gray-900">{formatCurrency(totalDue)}</div>
        </div>
        <div className={`bg-white rounded-xl p-4 border shadow-xs ${overdueCount > 0 ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Overdue Bills</div>
          <div className={`text-xl font-bold flex items-center gap-1.5 ${overdueCount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {overdueCount > 0 && <AlertTriangle className="w-4 h-4 text-red-600" />}
            {overdueCount} {overdueCount === 1 ? 'Action Required' : 'Actions Required'}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-xs">
          <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Scheduled / Upcoming</div>
          <div className="text-xl font-bold text-gray-900 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-blue-600" />
            {upcomingCount} Bills Due Soon
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bills List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Overdue Section */}
          {bills.filter(b => b.status === 'overdue').length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 uppercase tracking-wider mb-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Overdue Invoices
              </div>
              {bills.filter(b => b.status === 'overdue').map(bill => (
                <BillCardItem key={bill.id} bill={bill} onPay={handlePayBill} />
              ))}
            </div>
          )}

          {/* Upcoming Section */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5 text-gray-400" /> Upcoming Due Dates
            </div>
            {bills.filter(b => b.status === 'upcoming').map(bill => (
              <BillCardItem key={bill.id} bill={bill} onPay={handlePayBill} />
            ))}
          </div>

          {/* Paid Section */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Recently Settled
            </div>
            {bills.filter(b => b.status === 'paid').map(bill => (
              <BillCardItem key={bill.id} bill={bill} onPay={handlePayBill} />
            ))}
          </div>
        </div>

        {/* Payment Confirmation Form Panel */}
        <div className="lg:col-span-1">
          {selectedBill ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-4 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-[#e8f0fb] flex items-center justify-between">
                <h3 className="font-bold text-[#0053c2] text-xs uppercase tracking-wider">Execute Payment</h3>
                <button
                  type="button"
                  onClick={() => setSelectedBill(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <BillIcon category={selectedBill.category} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-gray-800 text-sm truncate">{selectedBill.name}</div>
                    <div className="text-xs text-gray-400">{selectedBill.category}</div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Funding Account</label>
                  <select
                    value={paymentAccountId}
                    onChange={e => setPaymentAccountId(e.target.value)}
                    className="input-field text-xs py-2 font-medium"
                  >
                    {accounts.filter(a => a.type !== 'credit').map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name.split(' ').slice(0, 2).join(' ')} — {formatCurrency(a.availableBalance)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Payment Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(e.target.value)}
                      className="input-field pl-7 font-bold text-sm"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Execution Date</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field text-xs py-2"
                  />
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setSelectedBill(null)}
                    className="btn-secondary flex-1 text-xs py-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPinModal(true)}
                    disabled={isLoading}
                    className="btn-primary flex-1 text-xs py-2 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Authorizing...
                      </span>
                    ) : (
                      'Authorize Pay'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-xs p-6 text-center sticky top-4">
              <div className="w-12 h-12 bg-blue-50 text-[#0053c2] rounded-xl flex items-center justify-center mx-auto mb-3">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div className="font-bold text-gray-800 text-sm mb-1">Select an Invoice</div>
              <div className="text-xs text-gray-400">
                Click "Pay Bill" on any scheduled payment to open the authorization panel.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

function BillCardItem({ bill, onPay }: { bill: Bill; onPay: (bill: Bill) => void }) {
  const isPaid = bill.status === 'paid';
  const isOverdue = bill.status === 'overdue';

  return (
    <div className={`bg-white rounded-xl border shadow-xs p-4 mb-3 flex items-center gap-4 card-hover transition-all
      ${isOverdue ? 'border-red-200 bg-red-50/10' : isPaid ? 'border-gray-100 opacity-80' : 'border-gray-100'}`}>
      <BillIcon category={bill.category} size="md" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-800 text-sm">{bill.name}</span>
          {bill.autopay && (
            <span className="text-[10px] bg-blue-50 text-[#0053c2] px-2 py-0.5 rounded-full font-bold">
              AutoPay Active
            </span>
          )}
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider badge-${bill.status}`}>
            {bill.status}
          </span>
        </div>
        <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
          <span>{bill.category}</span>
          <span>·</span>
          <span>Due {formatDate(bill.dueDate, 'short')}</span>
          {bill.accountNumber && (
            <>
              <span>·</span>
              <span className="font-mono">Acct: {bill.accountNumber}</span>
            </>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="font-bold text-gray-900 text-sm tracking-tight">{formatCurrency(bill.amount)}</div>
        {!isPaid ? (
          <button
            type="button"
            onClick={() => onPay(bill)}
            className={`mt-1.5 text-xs font-bold px-3 py-1.5 rounded-md transition-colors cursor-pointer
              ${isOverdue ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-[#0053c2] hover:bg-blue-900 text-white'}`}
          >
            Pay Bill
          </button>
        ) : (
          <div className="text-xs text-emerald-600 font-bold mt-1.5 flex items-center gap-1 justify-end">
            <CheckCircle2 className="w-3.5 h-3.5" /> Paid
          </div>
        )}
      </div>
    </div>
  );
}
