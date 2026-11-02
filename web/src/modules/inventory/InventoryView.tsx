import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  ArrowUpDown, 
  Search, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';

interface StockItem {
  id: string;
  name: string;
  unit: string;
  currentStock: number;
  minAlert: number;
  costPerUnit: number;
  category: string;
}

export const InventoryView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [adjustModalItem, setAdjustModalItem] = useState<StockItem | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Purchase / Refill');

  const [stockItems, setStockItems] = useState<StockItem[]>([
    { id: '1', name: 'Fresh Buffalo Milk', unit: 'Liters', currentStock: 45.0, minAlert: 15.0, costPerUnit: 58.0, category: 'Dairy' },
    { id: '2', name: 'Assam Tea Dust (Chai Patti)', unit: 'Kg', currentStock: 12.5, minAlert: 4.0, costPerUnit: 260.0, category: 'Raw Materials' },
    { id: '3', name: 'White Cane Sugar', unit: 'Kg', currentStock: 25.0, minAlert: 8.0, costPerUnit: 44.0, category: 'Raw Materials' },
    { id: '4', name: 'Fresh Bun Maska Buns', unit: 'Pcs', currentStock: 18.0, minAlert: 20.0, costPerUnit: 14.0, category: 'Bakery' },
    { id: '5', name: 'Amul Butter Block', unit: 'Kg', currentStock: 5.5, minAlert: 2.0, costPerUnit: 480.0, category: 'Dairy' },
    { id: '6', name: 'Fresh Aloo Samosas', unit: 'Pcs', currentStock: 12.0, minAlert: 15.0, costPerUnit: 12.0, category: 'Hot Snacks' },
    { id: '7', name: 'Osmania Biscuits (Pkt)', unit: 'Pkts', currentStock: 28.0, minAlert: 10.0, costPerUnit: 18.0, category: 'Bakery' },
    { id: '8', name: 'Cardamom & Fresh Ginger', unit: 'Kg', currentStock: 2.8, minAlert: 1.0, costPerUnit: 240.0, category: 'Spices' },
  ]);

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalItem || !adjustQty) return;

    const delta = parseFloat(adjustQty);
    setStockItems((prev) =>
      prev.map((item) =>
        item.id === adjustModalItem.id
          ? { ...item, currentStock: Math.max(0, item.currentStock + delta) }
          : item
      )
    );

    setAdjustModalItem(null);
    setAdjustQty('');
  };

  const filtered = stockItems.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F9] overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Milk, Tea &amp; Stock Inventory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time raw stock tracking, consumption, wastage logging, and low-inventory alerts.
          </p>
        </div>

        <button className="px-4 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-[#2E7D32]/20">
          <Plus className="w-4 h-4" />
          <span>New Stock Item</span>
        </button>
      </div>

      {/* Summary Chips */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 border-b border-slate-200">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Total Stock Items</span>
          <div className="text-lg font-extrabold text-slate-900 mt-0.5">{stockItems.length} items</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
          <span className="text-[11px] font-bold text-amber-700 uppercase flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Alerts
          </span>
          <div className="text-lg font-extrabold text-amber-800 mt-0.5">
            {stockItems.filter((i) => i.currentStock <= i.minAlert).length} Items Need Refill
          </div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Fresh Milk on Hand</span>
          <div className="text-lg font-extrabold text-[#1C3F32] mt-0.5">45.0 Liters</div>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Estimated Stock Value</span>
          <div className="text-lg font-extrabold text-emerald-700 mt-0.5">
            ₹{stockItems.reduce((acc, i) => acc + i.currentStock * i.costPerUnit, 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Search & Stock Table */}
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stock item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#2E7D32]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Min. Threshold</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filtered.map((item) => {
                const isLow = item.currentStock <= item.minAlert;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{item.name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{item.category}</td>
                    <td className="py-3.5 px-4">
                      <span className={`text-sm font-extrabold ${isLow ? 'text-amber-700' : 'text-slate-900'}`}>
                        {item.currentStock} {item.unit}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{item.minAlert} {item.unit}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">₹{item.costPerUnit} / {item.unit}</td>
                    <td className="py-3.5 px-4">
                      {isLow ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> Reorder Alert
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Sufficient
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setAdjustModalItem(item)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                      >
                        Adjust / Refill
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {adjustModalItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900">
              Adjust Stock: {adjustModalItem.name}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Current Stock: <span className="font-bold text-slate-800">{adjustModalItem.currentStock} {adjustModalItem.unit}</span>
            </p>

            <form onSubmit={handleAdjustStock} className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Quantity (+ to add, - for wastage/usage)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. +10 or -2.5"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-[#2E7D32]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Reason / Note</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#2E7D32]"
                >
                  <option>Fresh Purchase / Vendor Delivery</option>
                  <option>Spoilage / Milk Curdling Wastage</option>
                  <option>Damaged Bun / Samosa Expired</option>
                  <option>Staff Consumption</option>
                  <option>Inventory Audit Correction</option>
                </select>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalItem(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
