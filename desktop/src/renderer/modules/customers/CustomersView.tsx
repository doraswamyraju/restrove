import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Wallet, 
  Phone, 
  Plus,
  Trash2,
  Edit2,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  History,
  ShieldCheck,
  CreditCard,
  Banknote,
  QrCode,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  DollarSign
} from 'lucide-react';
import { 
  getCustomers, 
  saveCustomer, 
  updateCustomer, 
  deleteCustomer, 
  getCustomerDetails, 
  adjustCustomerWallet, 
  getCustomerStats 
} from '../../services/api';

export const CustomersView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'has_balance' | 'vip'>('all');
  const [sortBy, setSortBy] = useState('wallet');
  const [customers, setCustomers] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalWalletBalance: 0,
    totalLifetimeSpent: 0,
    avgVisits: 0
  });
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);

  // Form states
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerDetails, setCustomerDetails] = useState<any>(null);

  // Add / Edit form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [initialAdvance, setInitialAdvance] = useState('');

  // Wallet adjustment form
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'deposit' | 'deduction'>('deposit');
  const [adjustMode, setAdjustMode] = useState('UPI');
  const [adjustNote, setAdjustNote] = useState('');

  useEffect(() => {
    loadCustomers();
    loadStats();
  }, [search, activeFilter, sortBy]);

  const loadStats = async () => {
    try {
      const data = await getCustomerStats();
      if (data) setStats(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers(search || undefined, activeFilter === 'all' ? undefined : activeFilter, sortBy);
      setCustomers(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    setInitialAdvance('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setSelectedCustomer(c);
    setName(c.name || '');
    setPhone(c.phone || '');
    setEmail(c.email || '');
    setNotes(c.notes || '');
    setIsEditModalOpen(true);
  };

  const handleOpenDetails = async (c: any) => {
    setSelectedCustomer(c);
    setIsDetailsModalOpen(true);
    try {
      const data = await getCustomerDetails(c.id);
      setCustomerDetails(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenAdjust = (c: any) => {
    setSelectedCustomer(c);
    setAdjustAmount('');
    setAdjustType('deposit');
    setAdjustMode('UPI');
    setAdjustNote('');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    try {
      const res = await saveCustomer({
        name,
        phone,
        email,
        notes,
        initialAdvance: parseFloat(initialAdvance) || 0
      });

      if (res.success) {
        setIsAddModalOpen(false);
        await loadCustomers();
        await loadStats();
      } else {
        alert(res.error || 'Failed to save customer');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !name || !phone) return;

    try {
      const res = await updateCustomer(selectedCustomer.id, {
        name,
        phone,
        email,
        notes
      });

      if (res.success) {
        setIsEditModalOpen(false);
        await loadCustomers();
        await loadStats();
      } else {
        alert(res.error || 'Failed to update customer');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !adjustAmount) return;

    const num = parseFloat(adjustAmount);
    if (!num || num <= 0) return;

    try {
      const delta = adjustType === 'deposit' ? num : -num;
      const res = await adjustCustomerWallet(selectedCustomer.id, {
        amount: delta,
        type: adjustType,
        paymentMode: adjustMode,
        notes: adjustNote || 'Counter adjustment'
      });

      if (res.success) {
        setIsAdjustModalOpen(false);
        await loadCustomers();
        await loadStats();
        if (isDetailsModalOpen && selectedCustomer) {
          const data = await getCustomerDetails(selectedCustomer.id);
          setCustomerDetails(data);
        }
      } else {
        alert(res.error || 'Failed to adjust wallet');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, custName: string) => {
    if (!window.confirm(`Permanently delete customer "${custName}" and their ledger from database?`)) {
      return;
    }

    try {
      await deleteCustomer(id);
      await loadCustomers();
      await loadStats();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F9] overflow-hidden">
      {/* Top Header */}
      <div className="p-6 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Regular Customers &amp; CRM</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Full database CRUD: customer profiles, advance money ledgers, visits, and order history.
          </p>
        </div>

        <button 
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-extrabold flex items-center space-x-1.5 shadow-md shadow-[#2E7D32]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Customers</span>
          <div className="text-lg font-black text-slate-900 mt-0.5">{stats.totalCustomers}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Advance Held in Wallets</span>
          <div className="text-lg font-black text-emerald-700 mt-0.5">₹{stats.totalWalletBalance.toFixed(2)}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lifetime Spends Billed</span>
          <div className="text-lg font-black text-[#1C3F32] mt-0.5">₹{stats.totalLifetimeSpent.toFixed(2)}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Customer Visits</span>
          <div className="text-lg font-black text-slate-800 mt-0.5">{stats.avgVisits} visits</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {/* Search Box */}
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, phone, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            {[
              { id: 'all', label: 'All' },
              { id: 'has_balance', label: 'Advance Available (₹>0)' },
              { id: 'vip', label: 'VIP (≥10 visits)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id as any)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeFilter === f.id ? 'bg-white shadow text-[#1C3F32] font-black' : 'hover:text-slate-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort selector */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-bold">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600"
          >
            <option value="wallet">Advance Wallet Balance</option>
            <option value="spent">Total Lifetime Spent</option>
            <option value="visits">Most Visits</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Customer Cards Grid */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.length === 0 ? (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-slate-400 text-center">
            <Users className="w-10 h-10 mb-2 opacity-40 text-slate-400" />
            <h4 className="font-extrabold text-sm text-slate-700">No matching customers in database</h4>
            <p className="text-xs text-slate-400 mt-1">Click "Add New Customer" above to create one.</p>
          </div>
        ) : (
          customers.map((c) => (
            <div 
              key={c.id} 
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative group"
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">{c.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-emerald-600" /> {c.phone}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 border ${
                      c.wallet_balance > 0 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      <Wallet className="w-3 h-3" /> ₹{Number(c.wallet_balance || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>Total Visits</span>
                    <span className="font-extrabold text-slate-900">{c.visit_count || 0} times</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lifetime Spends</span>
                    <span className="font-extrabold text-emerald-700">₹{Number(c.total_spent || 0).toFixed(2)}</span>
                  </div>
                  {c.notes && (
                    <div className="flex justify-between text-[11px] pt-1">
                      <span className="text-slate-400">Notes</span>
                      <span className="font-medium text-slate-700 truncate max-w-[170px]">{c.notes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => handleOpenDetails(c)}
                  className="font-extrabold text-[#1C3F32] hover:text-[#2E7D32] flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ledger</span>
                </button>

                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => handleOpenAdjust(c)}
                    title="Add / Deduct Advance"
                    className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg font-bold text-[11px]"
                  >
                    ± Advance
                  </button>

                  <button
                    onClick={() => handleOpenEdit(c)}
                    title="Edit Customer Details"
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    title="Delete Customer from Database"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal 1: Add Customer */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">Add New Regular Customer</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Doraswamy Raju"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="customer@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Initial Advance Deposit (₹)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  value={initialAdvance}
                  onChange={(e) => setInitialAdvance(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-800 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Preferences &amp; Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Likes extra hot cutting chai"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  className="flex-1 py-2 px-3 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white font-extrabold shadow-sm"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Customer */}
      {isEditModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">Edit Customer Details</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white font-extrabold shadow-sm"
                >
                  Update Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: View Customer Details & Ledger */}
      {isDetailsModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-5 bg-[#1C3F32] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-300">Customer Profile &amp; Ledger</span>
                <h3 className="text-lg font-black">{selectedCustomer.name}</h3>
                <p className="text-xs text-emerald-200/80">{selectedCustomer.phone}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-300 block">Available Advance</span>
                <span className="text-2xl font-black text-white">₹{Number(selectedCustomer.wallet_balance || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Quick Top-up Button */}
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="text-xs text-emerald-900 font-bold">
                  Lifetime Total Billed: ₹{Number(selectedCustomer.total_spent || 0).toFixed(2)} ({selectedCustomer.visit_count} visits)
                </div>
                <button
                  onClick={() => {
                    handleOpenAdjust(selectedCustomer);
                  }}
                  className="px-3 py-1.5 bg-[#2E7D32] hover:bg-[#256629] text-white rounded-xl text-xs font-black shadow-sm"
                >
                  ± Top-up / Deduct
                </button>
              </div>

              {/* Transactions Ledger */}
              <div>
                <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-slate-500" /> Wallet Ledger Audit History
                </h4>
                {customerDetails?.transactions?.length > 0 ? (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                    {customerDetails.transactions.map((tx: any) => {
                      const isCredit = tx.amount > 0;
                      return (
                        <div key={tx.id} className="p-3 flex items-center justify-between text-xs bg-white">
                          <div className="flex items-center space-x-2.5">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                              isCredit ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900">{tx.notes || tx.type}</div>
                              <div className="text-[10px] text-slate-400">{new Date(tx.created_at).toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`font-black ${isCredit ? 'text-emerald-700' : 'text-red-600'}`}>
                              {isCredit ? '+' : ''}₹{Math.abs(tx.amount).toFixed(2)}
                            </span>
                            <div className="text-[10px] text-slate-400">Bal: ₹{tx.balance_after?.toFixed(2)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    No wallet transactions recorded
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Adjust Wallet Balance */}
      {isAdjustModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">Adjust Customer Advance Wallet</h3>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <span className="font-bold text-slate-700">{selectedCustomer.name}</span>
                <span className="font-black text-emerald-800">Current: ₹{Number(selectedCustomer.wallet_balance || 0).toFixed(2)}</span>
              </div>

              {/* Action type */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('deposit')}
                  className={`py-2 rounded-xl font-black text-xs border ${
                    adjustType === 'deposit'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  + Add Deposit
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('deduction')}
                  className={`py-2 rounded-xl font-black text-xs border ${
                    adjustType === 'deduction'
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  - Deduct Balance
                </button>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="Enter amount"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Payment Mode</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['UPI', 'Cash', 'Card'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setAdjustMode(m)}
                      className={`py-1.5 rounded-lg border text-xs font-bold ${
                        adjustMode === m ? 'border-emerald-600 bg-emerald-50 text-emerald-800' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Audit Note</label>
                <input
                  type="text"
                  placeholder="e.g. Counter cash deposit / manual correction"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white font-black shadow-sm"
                >
                  Apply to Wallet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
