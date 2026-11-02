import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Wallet, 
  ShoppingBag, 
  Phone, 
  Calendar, 
  ArrowUpRight,
  Plus
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const [search, setSearch] = useState('');

  const [customers] = useState([
    {
      id: 'cust-1',
      name: 'Doraswamy Raju',
      phone: '9876543210',
      walletBalance: 380.00,
      totalSpent: 4850.00,
      totalVisits: 28,
      lastVisit: 'Today, 02 Nov 2026',
      favoriteItem: 'Irani Dum Chai & Classic Maska Bun'
    },
    {
      id: 'cust-2',
      name: 'Kiran Kumar',
      phone: '9848022338',
      walletBalance: 150.00,
      totalSpent: 1920.00,
      totalVisits: 14,
      lastVisit: 'Yesterday',
      favoriteItem: 'Ginger Elaichi Chai & Aloo Samosa'
    },
    {
      id: 'cust-3',
      name: 'Suresh Varma',
      phone: '9440112233',
      walletBalance: 620.00,
      totalSpent: 7120.00,
      totalVisits: 42,
      lastVisit: '30 Oct 2026',
      favoriteItem: 'Filter Coffee & Osmania Biscuits'
    },
    {
      id: 'cust-4',
      name: 'Ramesh Reddy',
      phone: '9988776655',
      walletBalance: 0.00,
      totalSpent: 840.00,
      totalVisits: 6,
      lastVisit: '26 Oct 2026',
      favoriteItem: 'Hot Badam Milk'
    }
  ]);

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F9] overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Regular Customers &amp; CRM</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Customer directory, advance wallet balances, visit frequency, and favorite snacks.
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-[#2E7D32]/20">
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* Customer List */}
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

      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{c.name}</h4>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-emerald-600" /> {c.phone}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-extrabold flex items-center gap-1 border border-emerald-200">
                  <Wallet className="w-3 h-3" /> ₹{c.walletBalance.toFixed(2)}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Total Visits</span>
                  <span className="font-extrabold text-slate-900">{c.totalVisits} times</span>
                </div>
                <div className="flex justify-between">
                  <span>Lifetime Spends</span>
                  <span className="font-extrabold text-emerald-700">₹{c.totalSpent.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] pt-1">
                  <span className="text-slate-400">Favorite</span>
                  <span className="font-bold text-slate-700 truncate max-w-[170px]">{c.favoriteItem}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Last visited: {c.lastVisit}</span>
              <button className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5">
                History <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

