import React, { useState } from 'react';
import { 
  Wallet as WalletIcon, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Search, 
  PlusCircle, 
  CheckCircle2, 
  History,
  User,
  ShieldCheck
} from 'lucide-react';

export const CustomerWallet: React.FC = () => {
  const [searchPhone, setSearchPhone] = useState('9876543210');
  const [depositAmount, setDepositAmount] = useState('');
  const [depositNotes, setDepositNotes] = useState('');
  const [isDeposited, setIsDeposited] = useState(false);

  // Sample Customer with Advance Wallet Balance
  const [customer, setCustomer] = useState({
    id: 'cust-101',
    name: 'Doraswamy Raju',
    phone: '9876543210',
    email: 'doraswamy@example.com',
    walletBalance: 1250.00,
    totalSpent: 8420.00,
    totalOrders: 14
  });

  const [ledger, setLedger] = useState([
    {
      id: 'tx-1',
      type: 'deposit',
      amount: 1000,
      balanceAfter: 1250,
      notes: 'UPI Advance Top-up by Customer',
      date: 'Today, 02 Nov 2026 • 02:15 PM'
    },
    {
      id: 'tx-2',
      type: 'order_payment',
      amount: -450,
      balanceAfter: 250,
      notes: 'Paid for Order #D-1478',
      date: '01 Nov 2026 • 08:30 PM'
    },
    {
      id: 'tx-3',
      type: 'deposit',
      amount: 700,
      balanceAfter: 700,
      notes: 'Cash advance deposit at counter',
      date: '28 Oct 2026 • 01:10 PM'
    }
  ]);

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(depositAmount);
    if (!amountNum || amountNum <= 0) return;

    const newBalance = customer.walletBalance + amountNum;
    setCustomer((prev) => ({ ...prev, walletBalance: newBalance }));
    setLedger((prev) => [
      {
        id: `tx-${Date.now()}`,
        type: 'deposit',
        amount: amountNum,
        balanceAfter: newBalance,
        notes: depositNotes || 'Counter Advance Top-up',
        date: 'Just now'
      },
      ...prev
    ]);

    setDepositAmount('');
    setDepositNotes('');
    setIsDeposited(true);
    setTimeout(() => setIsDeposited(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F9] overflow-hidden">
      {/* Module Header */}
      <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Customer Wallet &amp; Advance Deposits</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer advance payments, ledger transactions, and balance deductions.
          </p>
        </div>

        {/* Customer Search */}
        <div className="flex items-center space-x-2">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Customer by Phone..."
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#6C47FF]"
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Profile & Balance Summary */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#0B2D5B] to-[#103D78] rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold tracking-wider text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Active Customer Wallet
              </span>
              <span className="px-2.5 py-0.5 bg-white/10 rounded-full text-xs font-bold text-amber-300">
                Single Outlet
              </span>
            </div>

            <div className="mb-6">
              <span className="text-xs text-slate-300">Available Advance Balance</span>
              <div className="text-4xl font-extrabold tracking-tight mt-1">
                ₹{customer.walletBalance.toFixed(2)}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <div>
                <div className="text-slate-400">Customer Name</div>
                <div className="font-bold text-white mt-0.5">{customer.name}</div>
              </div>
              <div className="text-right">
                <div className="text-slate-400">Phone Number</div>
                <div className="font-bold text-white mt-0.5">{customer.phone}</div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Total Lifetime Spend</span>
              <div className="text-lg font-extrabold text-slate-900 mt-1">₹{customer.totalSpent.toFixed(2)}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 font-medium">Completed Orders</span>
              <div className="text-lg font-extrabold text-[#6C47FF] mt-1">{customer.totalOrders} visits</div>
            </div>
          </div>

          {/* Add Advance Deposit Form */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-4">
              <PlusCircle className="w-5 h-5 text-[#FF7A00]" />
              <h3 className="font-bold text-slate-900 text-sm">Add Advance Deposit</h3>
            </div>

            <form onSubmit={handleDeposit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Deposit Amount (₹)</label>
                <div className="flex space-x-2">
                  {[200, 500, 1000, 2000].map((quick) => (
                    <button
                      type="button"
                      key={quick}
                      onClick={() => setDepositAmount(quick.toString())}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                    >
                      +₹{quick}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Enter custom amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full mt-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-[#FF7A00]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Notes / Mode</label>
                <input
                  type="text"
                  placeholder="e.g. Received via Cash / UPI GPay"
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#FF7A00]"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center space-x-2 ${
                  isDeposited
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[#FF7A00] hover:bg-[#E65100] text-white shadow-md shadow-orange-500/20'
                }`}
              >
                {isDeposited ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-bounce" />
                    <span>Advance Added Successfully!</span>
                  </>
                ) : (
                  <span>Deposit Advance to Wallet</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Wallet Ledger & Transaction History (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-slate-600" />
              <h3 className="font-extrabold text-slate-900 text-sm">Wallet Ledger &amp; Audit Trail</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{ledger.length} entries recorded</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {ledger.map((tx) => {
              const isCredit = tx.amount > 0;
              return (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center space-x-3.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isCredit ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">{tx.notes}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">{tx.date}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-sm font-extrabold ${isCredit ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {isCredit ? `+₹${tx.amount.toFixed(2)}` : `-₹${Math.abs(tx.amount).toFixed(2)}`}
                    </div>
                    <div className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      Bal: ₹{tx.balanceAfter.toFixed(2)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

