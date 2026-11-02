import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Search, 
  CheckCircle2,
  TrendingDown,
  Layers,
  X
} from 'lucide-react';
import { getInventory, adjustInventory } from '../../services/api';

export const InventoryView: React.FC = () => {
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Adjust Modal
  const [adjustModalItem, setAdjustModalItem] = useState<any>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('Fresh Purchase / Vendor Delivery');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const items = await getInventory();
      setStockItems(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalItem || !adjustQty) return;

    try {
      const delta = parseFloat(adjustQty);
      const res = await adjustInventory(adjustModalItem.id, delta, adjustReason);
      if (res.success) {
        setAdjustModalItem(null);
        setAdjustQty('');
        await loadInventory();
      } else {
        alert(res.error || 'Failed to adjust stock');
      }
    } catch (err: any) {
      alert('Error adjusting stock: ' + err.message);
    }
  };

  const filtered = stockItems.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F9] overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Milk, Tea &amp; Stock Inventory (Live)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real SQLite stock movements: track dairy, tea dust, buns, butter, and wastage.
          </p>
        </div>

        <button 
          onClick={() => alert('New stock item creation modal')}
          className="px-4 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-[#2E7D32]/20"
        >
          <Plus className="w-4 h-4" />
          <span>New Inventory Item</span>
        </button>
      </div>

      {/* KPI Chips */}
      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 border-b border-slate-200">
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Tracked Raw Items</span>
          <div className="text-base font-extrabold text-slate-900 mt-0.5">{stockItems.length} items</div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-amber-200 bg-amber-50/50">
          <span className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Alerts
          </span>
          <div className="text-base font-extrabold text-amber-800 mt-0.5">
            {stockItems.filter((i) => i.current_stock <= i.min_stock_alert).length} items need refill
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Fresh Milk on Hand</span>
          <div className="text-base font-extrabold text-[#1C3F32] mt-0.5">
            {stockItems.find(i => i.name.includes('Milk'))?.current_stock || 0} Liters
          </div>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Total Stock Valuation</span>
          <div className="text-base font-extrabold text-emerald-700 mt-0.5">
            ₹{stockItems.reduce((acc, i) => acc + i.current_stock * i.cost_per_unit, 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Search & Stock Table */}
      <div className="p-3 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search stock item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Current Stock</th>
                <th className="py-2.5 px-3">Min. Threshold</th>
                <th className="py-2.5 px-3">Unit Cost</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {filtered.map((item) => {
                const isLow = item.current_stock <= item.min_stock_alert;
                return (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{item.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.category}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-xs font-black ${isLow ? 'text-amber-700' : 'text-slate-900'}`}>
                        {item.current_stock} {item.unit}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{item.min_stock_alert} {item.unit}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">₹{item.cost_per_unit} / {item.unit}</td>
                    <td className="py-2.5 px-3">
                      {isLow ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" /> Reorder Alert
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> In Stock
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => setAdjustModalItem(item)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#1C3F32] text-xs font-bold transition-colors"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">
                Adjust: {adjustModalItem.name}
              </h3>
              <button onClick={() => setAdjustModalItem(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Quantity (+ to add stock, - to record wastage)
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="+10 or -2.5"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-[#2E7D32]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Reason</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
                >
                  <option>Fresh Purchase / Vendor Delivery</option>
                  <option>Spoilage / Milk Curdling Wastage</option>
                  <option>Damaged Bun / Samosa Expired</option>
                  <option>Staff Consumption</option>
                  <option>Physical Inventory Count Correction</option>
                </select>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalItem(null)}
                  className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold"
                >
                  Save Stock Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
