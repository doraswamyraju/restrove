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
  QrCode,
  UserPlus,
  X
} from 'lucide-react';
import { getCustomerWallet, depositCustomerWallet, getCustomers, saveCustomer } from '../../services/api';

export const CustomerWallet: React.FC = () => {
  const [searchPhone, setSearchPhone] = useState('');
  const [customer, setCustomer] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [allCustomers, setAllCustomers] = useState<any[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Deposit Form
  const [depositAmount, setDepositAmount] = useState('');
  const [depositMode, setDepositMode] = useState('UPI');
  const [depositNotes, setDepositNotes] = useState('');
  const [isDeposited, setIsDeposited] = useState(false);

  // Add Customer Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAdvance, setNewCustAdvance] = useState('');
  const [newCustNotes, setNewCustNotes] = useState('');

  // Load customer directory on start
  useEffect(() => {
    loadCustomersList();
  }, []);

  const loadCustomersList = async (preferredPhone?: string) => {
    try {
      const list = await getCustomers();
      setAllCustomers(list || []);

      if (list && list.length > 0) {
        const target = preferredPhone 
          ? list.find((c: any) => c.phone === preferredPhone) || list[0]
          : searchPhone
          ? list.find((c: any) => c.phone === searchPhone) || list[0]
          : list[0];

        setSearchPhone(target.phone);
        fetchWallet(target.phone);
      }
    } catch (e) {
      console.error('Failed to load customers:', e);
    }
  };

  const fetchWallet = async (phone: string) => {
    if (!phone) return;
    setLoading(true);
    try {
      const data = await getCustomerWallet(phone.trim());
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
        await loadCustomersList(searchPhone);
        setTimeout(() => setIsDeposited(false), 2500);
      } else {
        alert(res.error || 'Failed to deposit advance');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) {
      alert('Please enter customer name and phone');
      return;
    }

    try {
      const res = await saveCustomer({
        name: newCustName,
        phone: newCustPhone,
        initialAdvance: parseFloat(newCustAdvance) || 0,
        notes: newCustNotes
      });

      if (res.success) {
        setIsAddModalOpen(false);
        setNewCustName('');
        const phone = newCustPhone;
        setNewCustPhone('');
        setNewCustAdvance('');
        setNewCustNotes('');
        await loadCustomersList(phone);
      } else {
        alert(res.error || 'Failed to add customer');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const filteredCustomers = allCustomers.filter((c) => {
    const q = filterQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F9] overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Customer Wallet &amp; Advance Ledger</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Accept advance deposits, view real-time balances, and track audited deductions in SQLite database.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Quick Add Customer */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-1.5 rounded-xl border border-emerald-600 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold flex items-center space-x-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>

          {/* Live Phone Search */}
          <div className="relative w-64">
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

      {/* Main 3-Column Layout */}
      <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Customer Directory List (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-3 flex flex-col overflow-hidden max-h-[85vh]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Regular Customers ({allCustomers.length})
            </span>
          </div>

          {/* Filter list search */}
          <div className="mb-2">
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter by name/phone..."
              className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No matching customers found
              </div>
            ) : (
              filteredCustomers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => { setSearchPhone(c.phone); fetchWallet(c.phone); }}
                  className={`p-2.5 rounded-xl cursor-pointer border transition-all ${
                    customer && customer.phone === c.phone
                      ? 'border-[#2E7D32] bg-emerald-50/70 shadow-sm'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-slate-900 text-xs truncate max-w-[130px]">{c.name}</h5>
                    <span className="text-xs font-extrabold text-emerald-700">₹{c.wallet_balance?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>{c.phone}</span>
                    <span>{c.visit_count || 0} visits</span>
                  </div>
                </div>
              ))
            )}
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
                <div className="font-bold text-white">{customer ? customer.phone : searchPhone || '—'}</div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Lifetime Spend</span>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                ₹{customer ? customer.total_spent?.toFixed(2) : '0.00'}
              </div>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Completed Orders</span>
              <div className="text-base font-extrabold text-slate-900 mt-0.5">
                {customer ? `${customer.visit_count || 0} tokens` : '0 tokens'}
              </div>
            </div>
          </div>

          {/* Deposit Advance Action Form */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-[#2E7D32]" /> Deposit Advance to Wallet
            </h4>

            <form onSubmit={handleDepositSubmit} className="space-y-3">
              {/* Quick Amount Chips */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Quick Amount Chip</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[200, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt.toString())}
                      className="py-1 px-2 text-xs font-bold rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    >
                      +₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <input
                  type="number"
                  placeholder="Enter amount (₹)"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#2E7D32]"
                />
              </div>

              {/* Payment Rail */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Payment Rail</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI', icon: QrCode },
                    { id: 'Cash', icon: Banknote },
                    { id: 'Card', icon: CreditCard },
                  ].map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setDepositMode(p.id)}
                        className={`py-1.5 text-xs font-bold rounded-xl border flex items-center justify-center space-x-1 ${
                          depositMode === p.id
                            ? 'border-[#2E7D32] bg-emerald-50 text-[#2E7D32]'
                            : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{p.id}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Notes */}
              <div>
                <input
                  type="text"
                  placeholder="Note (e.g. Counter deposit)"
                  value={depositNotes}
                  onChange={(e) => setDepositNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#2E7D32]"
                />
              </div>

              <button
                type="submit"
                disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                className={`w-full py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center space-x-1.5 transition-all shadow-md ${
                  isDeposited
                    ? 'bg-emerald-600 text-white'
                    : !depositAmount || parseFloat(depositAmount) <= 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-[#2E7D32] hover:bg-[#256629] text-white shadow-[#2E7D32]/20'
                }`}
              >
                {isDeposited ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Advance Deposited!</span>
                  </>
                ) : (
                  <span>Submit Advance Deposit</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right: Live Wallet Ledger & Deductions (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col overflow-hidden max-h-[85vh]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-slate-500" /> Live Wallet Ledger &amp; Deductions
            </h4>
            <span className="text-[11px] font-bold text-slate-400">{transactions.length} entries</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 pr-1 mt-2">
            {transactions.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
                <History className="w-6 h-6 mb-1 opacity-40" />
                <span>No transactions recorded for this customer yet.</span>
              </div>
            ) : (
              transactions.map((tx) => {
                const isCredit = tx.amount > 0;
                return (
                  <div key={tx.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </span>
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{tx.notes || tx.type}</div>
                        <div className="text-[10px] text-slate-400">{new Date(tx.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-extrabold text-xs ${isCredit ? 'text-emerald-700' : 'text-red-600'}`}>
                        {isCredit ? '+' : ''}₹{Math.abs(tx.amount).toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-400">Bal: ₹{tx.balance_after?.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add New Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">Add New Regular Customer</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Doraswamy Raju"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Initial Advance Amount (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={newCustAdvance}
                  onChange={(e) => setNewCustAdvance(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Notes / Preferences</label>
                <input
                  type="text"
                  placeholder="e.g. Prefers Zafrani Chai with less sugar"
                  value={newCustNotes}
                  onChange={(e) => setNewCustNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white font-bold shadow-md shadow-[#2E7D32]/20"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
