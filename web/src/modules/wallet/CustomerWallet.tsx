import React, { useState, useEffect } from 'react';
import { 
  Wallet as WalletIcon, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  History,
  Phone,
  User,
  ShieldCheck,
  CreditCard,
  Banknote,
  QrCode
} from 'lucide-react';
import { getCustomerWallet, depositCustomerWallet, getCustomers } from '../../services/api';

export const CustomerWallet: React.FC = () => {
  const [searchPhone, setSearchPhone] = useState('9876543210');
  const [customer, setCustomer] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Deposit Form
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMode, setDepositMode] = useState('UPI');
  const [depositNotes, setDepositNotes] = useState('');
  const [isDeposited, setIsDeposited] = useState(false);

  // Load customer directory on start
  useEffect(() => {
    loadCustomersList();
    fetchWallet(searchPhone);
  }, []);

  const loadCustomersList = async () => {
    const list = await getCustomers();
    setRecentCustomers(list);
  };

  const fetchWallet = async (phone: string) => {
    if (!phone) return;
    setLoading(true);
    try {
      const data = await getCustomerWallet(phone);
      if (data && data.customer) {
        setCustomer(data.customer);
        setTransactions(data.transactions || []);
      } else {
        setCustomer(null);
        setTransactions([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(depositAmount);
    if (!amountNum || amountNum <= 0 || !searchPhone) return;

    try {
      const notes = `${depositMode} Advance Top-up: ${depositNotes || 'Counter'}`;
      const res = await depositCustomerWallet(
        searchPhone, 
        customer ? customer.name : 'Walk-in Guest', 
        amountNum, 
        notes
      );

      if (res.success) {
        setIsDeposited(true);
        setDepositAmount('');
        setDepositNotes('');
        await fetchWallet(searchPhone);
        await loadCustomersList();
        setTimeout(() => setIsDeposited(false), 2500);
      } else {
        alert(res.error || 'Failed to deposit advance');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F9] overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Customer Wallet &amp; Advance Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept advance deposits, view real-time balances, and track audited deductions.
          </p>
        </div>

        {/* Live Phone Search */}
        <div className="flex items-center space-x-2">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search phone number..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchWallet(searchPhone)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#2E7D32]"
            />
          </div>
          <button
            onClick={() => fetchWallet(searchPhone)}
            className="px-3 py-1.5 rounded-xl bg-[#2E7D32] text-white text-xs font-bold hover:bg-[#256629]"
          >
            Find
          </button>
        </div>
      </div>

      {/* Main 3-Column Redesigned Layout */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Customer Directory List (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-3 flex flex-col overflow-hidden">
          <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-2">
            Regular Customer Wallets ({recentCustomers.length})
          </span>
          <div className="flex-1 overflow-y-auto space-y-1.5">
            {recentCustomers.map((c) => (
              <div
                key={c.id}
                onClick={() => { setSearchPhone(c.phone); fetchWallet(c.phone); }}
                className={`p-2.5 rounded-xl cursor-pointer border transition-all ${
                  customer && customer.phone === c.phone
                    ? 'border-[#2E7D32] bg-emerald-50/70'
                    : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-slate-900 text-xs truncate">{c.name}</h5>
                  <span className="text-xs font-extrabold text-emerald-700">₹{c.wallet_balance?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>{c.phone}</span>
                  <span>{c.visit_count || 0} visits</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center: Selected Customer Balance & Deposit Action (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card */}
          <div className="bg-gradient-to-br from-[#1C3F32] to-[#0E251D] rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Active Advance Balance
              </span>
              <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] font-bold text-emerald-300">
                Single-Unit Outlet
              </span>
            </div>

            <div className="mb-4">
              <div className="text-3xl font-black tracking-tight">
                ₹{customer ? customer.wallet_balance.toFixed(2) : '0.00'}
              </div>
              <span className="text-xs text-emerald-200/80">Available for Token &amp; Chai deductions</span>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <div>
                <span className="text-emerald-300/70 text-[10px]">Customer</span>
                <div className="font-bold text-white">{customer ? customer.name : 'No Customer Selected'}</div>
              </div>
              <div className="text-right">
                <span className="text-emerald-300/70 text-[10px]">Mobile</span>
                <div className="font-bold text-white">{customer ? customer.phone : searchPhone}</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total Lifetime Spend</span>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                ₹{customer ? customer.total_spent?.toFixed(2) : '0.00'}
              </div>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Completed Orders</span>
              <div className="text-base font-extrabold text-[#2E7D32] mt-0.5">
                {customer ? customer.visit_count : 0} tokens
              </div>
            </div>
          </div>

          {/* Add Advance Deposit Form */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <PlusCircle className="w-4 h-4 text-[#2E7D32]" />
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                Deposit Advance to Wallet
              </h3>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Quick Amount Chip
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[200, 500, 1000, 2000].map((amt) => (
                    <button
                      type="button"
                      key={amt}
                      onClick={() => setDepositAmount(amt.toString())}
                      className="py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Enter amount (₹)"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-[#2E7D32]"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Payment Rail</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['UPI', 'Cash', 'Card'].map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setDepositMode(mode)}
                      className={`py-1 rounded-lg text-xs font-bold border transition-all ${
                        depositMode === mode
                          ? 'border-[#2E7D32] bg-emerald-50 text-[#2E7D32]'
                          : 'border-slate-200 bg-white text-slate-600'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Note</label>
                <input
                  type="text"
                  placeholder="e.g. Counter deposit"
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#2E7D32]"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center space-x-1.5 ${
                  isDeposited
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#2E7D32] hover:bg-[#256629] text-white shadow-md'
                }`}
              >
                {isDeposited ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-bounce" />
                    <span>Advance Added Successfully!</span>
                  </>
                ) : (
                  <span>Submit Advance Deposit</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Live Wallet Ledger History (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="w-4 h-4 text-slate-600" />
              <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">
                Live Wallet Ledger &amp; Deductions
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-bold">{transactions.length} entries</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {transactions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6">
                <History className="w-8 h-8 mb-2 stroke-[1.5]" />
                <p className="text-xs">No transactions recorded for this customer yet.</p>
              </div>
            ) : (
              transactions.map((tx) => {
                const isCredit = tx.amount > 0;
                return (
                  <div key={tx.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{tx.notes || tx.type}</h4>
                        <p className="text-[10px] text-slate-400">{tx.created_at}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`text-xs font-black ${isCredit ? 'text-emerald-700' : 'text-slate-900'}`}>
                        {isCredit ? `+₹${tx.amount.toFixed(2)}` : `-₹${Math.abs(tx.amount).toFixed(2)}`}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Bal: ₹{tx.balance_after?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
