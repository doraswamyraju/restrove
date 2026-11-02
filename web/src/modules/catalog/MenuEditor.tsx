import React, { useState } from 'react';
import { 
  Coffee, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Filter,
  DollarSign
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  tag: string;
  isAvailable: boolean;
  isVeg: boolean;
  image: string;
}

export const MenuEditor: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const categories = ['All', 'Special Chai', 'Coffee & Milk', 'Maska Buns', 'Hot Snacks', 'Biscuits & Bakery'];

  const [items, setItems] = useState<MenuItem[]>([
    { id: '1', name: 'Irani Dum Chai', category: 'Special Chai', price: 20, tag: 'Bestseller', isAvailable: true, isVeg: true, image: '☕' },
    { id: '2', name: 'Ginger Elaichi Chai', category: 'Special Chai', price: 25, tag: 'Fresh Spiced', isAvailable: true, isVeg: true, image: '🫖' },
    { id: '3', name: 'Masala Chai', category: 'Special Chai', price: 25, tag: 'Traditional', isAvailable: true, isVeg: true, image: '☕' },
    { id: '4', name: 'Filter Coffee', category: 'Coffee & Milk', price: 30, tag: 'South Indian', isAvailable: true, isVeg: true, image: '☕' },
    { id: '5', name: 'Hot Badam Milk', category: 'Coffee & Milk', price: 40, tag: 'Rich & Creamy', isAvailable: true, isVeg: true, image: '🥛' },
    { id: '6', name: 'Turmeric Golden Milk', category: 'Coffee & Milk', price: 35, tag: 'Immunity', isAvailable: true, isVeg: true, image: '🥛' },
    { id: '7', name: 'Classic Maska Bun', category: 'Maska Buns', price: 35, tag: 'Amul Butter', isAvailable: true, isVeg: true, image: '🍞' },
    { id: '8', name: 'Bun Maska Jam', category: 'Maska Buns', price: 45, tag: 'Sweet & Salty', isAvailable: true, isVeg: true, image: '🍞' },
    { id: '9', name: 'Cheese Bun Maska', category: 'Maska Buns', price: 55, tag: 'Grilled', isAvailable: false, isVeg: true, image: '🧀' },
    { id: '10', name: 'Crispy Aloo Samosa (2 pcs)', category: 'Hot Snacks', price: 40, tag: 'Served Hot', isAvailable: true, isVeg: true, image: '🥟' },
    { id: '11', name: 'Onion Samosa (4 pcs)', category: 'Hot Snacks', price: 35, tag: 'Crispy Mini', isAvailable: true, isVeg: true, image: '🥟' },
    { id: '12', name: 'Osmania Biscuits (4 pcs)', category: 'Biscuits & Bakery', price: 25, tag: 'Chai Dip', isAvailable: true, isVeg: true, image: '🍪' },
    { id: '13', name: 'Butter Cookies (Plate)', category: 'Biscuits & Bakery', price: 30, tag: 'Fresh Baked', isAvailable: true, isVeg: true, image: '🍪' },
  ]);

  const toggleAvailability = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, isAvailable: !it.isAvailable } : it))
    );
  };

  const deleteItem = (id: string) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      setItems((prev) => prev.filter((it) => it.id !== id));
    }
  };

  const filteredItems = items.filter((it) => {
    const matchesCat = activeCategory === 'All' || it.category === activeCategory;
    const matchesSearch = it.name.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F9] overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Chai &amp; Snacks Menu Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure menu items, prices, out-of-stock toggles, and cafeteria categories.
          </p>
        </div>

        <button 
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="px-4 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-[#2E7D32]/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Snack / Chai</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-2 overflow-x-auto">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActiveCategory(c)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === c
                  ? 'bg-[#1C3F32] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#2E7D32]"
          />
        </div>
      </div>

      {/* Items Table Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Tag</th>
                <th className="py-3 px-4">Availability</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filteredItems.map((it) => (
                <tr key={it.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{it.image}</span>
                      <div>
                        <div className="font-extrabold text-slate-900">{it.name}</div>
                        <span className="text-[10px] text-emerald-700 font-bold">5% GST included</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-600">{it.category}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">₹{it.price}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      {it.tag}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => toggleAvailability(it.id)}
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1.5 transition-all ${
                        it.isAvailable
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-red-100 text-red-700 border border-red-200'
                      }`}
                    >
                      {it.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{it.isAvailable ? 'In Stock' : 'Out of Stock'}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => { setEditingItem(it); setIsModalOpen(true); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteItem(it.id)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
