import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Wallet, 
  Phone, 
  Plus,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getCustomers, saveCustomer, deleteCustomer } from '../../services/api';

export const CustomersView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [initialAdvance, setInitialAdvance] = useState('');

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await getCustomers(search || undefined);
      setCustomers(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
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
        setIsModalOpen(false);
        setName('');
        setPhone('');
        setEmail('');
        setNotes('');
        setInitialAdvance('');
        await loadCustomers();
      } else {
        alert(res.error || 'Failed to save customer');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleDelete = async (id: string, custName: string) => {
    if (!window.confirm(`Delete customer "${custName}" from database?`)) return;

    try {
      await deleteCustomer(id);
      await loadCustomers();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F9] overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Regular Customers &amp; CRM</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer directory, advance wallet balances, visit frequency, and favorite snacks from SQLite database.
          </p>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-[#2E7D32]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Customer Filter Bar */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#2E7D32]"
          />
        </div>
        <span className="text-xs text-slate-500 font-bold">{customers.length} Regular Customers</span>
      </div>

      {/* Customers Cards Grid */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-slate-400">
            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
            <span className="text-sm font-semibold">No customers found in database</span>
          </div>
        ) : (
          customers.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">{c.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-emerald-600" /> {c.phone}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-extrabold flex items-center gap-1 border border-emerald-200">
                      <Wallet className="w-3 h-3" /> ₹{Number(c.wallet_balance || 0).toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDelete(c.id, c.name)}
                      title="Delete customer from database"
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

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

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Member since: {new Date(c.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">Add New Customer</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Doraswamy Raju"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Notes / Preferences</label>
                <input
                  type="text"
                  placeholder="e.g. VIP regular customer"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white font-bold"
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
