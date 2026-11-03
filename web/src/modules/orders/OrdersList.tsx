import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Download, 
  Plus, 
  Printer, 
  RefreshCcw, 
  Trash2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { getOrders, deleteOrder, updateOrderStatus, getSettings } from '../../services/api';
import { ReceiptModal } from '../../components/ReceiptModal';

interface OrderItem {
  id?: string;
  name: string;
  qty: number;
  rate: number;
  amount?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  serviceType: string;
  details: string;
  amount: number;
  subtotal?: number;
  taxAmount?: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  customerName?: string;
  customerPhone?: string;
  time: string;
  createdAt?: string;
  items: OrderItem[];
}

export const OrdersList: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All Orders');
  const [searchQuery, setSearchQuery] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [counts, setCounts] = useState({
    all: 0,
    dineIn: 0,
    takeaway: 0,
    delivery: 0,
    online: 0,
    today: 0
  });
  const [loading, setLoading] = useState(true);

  // Receipt Printing State
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [activeFilter, searchQuery]);

  const loadSettings = async () => {
    try {
      const s = await getSettings();
      setSettings(s);
    } catch (e) {
      console.error(e);
    }
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await getOrders(
        undefined,
        activeFilter === 'All Orders' ? undefined : activeFilter,
        searchQuery || undefined
      );

      const loadedOrders: Order[] = res.orders || [];
      setOrders(loadedOrders);
      if (res.counts) {
        setCounts(res.counts);
      }

      // Update selected order
      if (loadedOrders.length > 0) {
        setSelectedOrder((prev) => {
          if (!prev) return loadedOrders[0];
          const exists = loadedOrders.find((o) => o.id === prev.id);
          return exists || loadedOrders[0];
        });
      } else {
        setSelectedOrder(null);
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId: string, orderNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete order ${orderNumber} from database?`)) {
      return;
    }

    try {
      await deleteOrder(orderId);
      await loadOrders();
    } catch (e: any) {
      alert('Failed to delete order: ' + e.message);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, orderStatus: newStatus } : null));
        }
      }
    } catch (e: any) {
      alert('Failed to update order status: ' + e.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'In Service':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Preparing':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Ready':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Dispatched':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const currentOrder = selectedOrder;

  return (
    <div className="flex h-full w-full bg-[#F4F6F9] overflow-hidden">
      {/* Left/Middle: Orders Table */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-200">
        {/* Orders Header */}
        <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Orders Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live SQLite Database orders: filter, reprint thermal slip, or manage.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={() => loadOrders()} 
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center space-x-1.5"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Service Filter Tabs with Real DB Counts */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'All Orders', count: counts.all },
              { id: 'Dine In', count: counts.dineIn },
              { id: 'Takeaway', count: counts.takeaway },
              { id: 'Delivery', count: counts.delivery },
              { id: 'Online', count: counts.online },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeFilter === f.id
                    ? 'bg-[#1C3F32] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{f.id}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeFilter === f.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Phone..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#1C3F32]"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="flex-1 overflow-y-auto">
          {orders.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-semibold">No orders found in database</p>
              <p className="text-xs text-slate-400 mt-1">Place orders via POS Billing to see them here.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0">
                <tr>
                  <th className="py-3 px-4">Order ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {orders.map((o) => {
                  const isSelected = currentOrder?.id === o.id;
                  return (
                    <tr
                      key={o.id}
                      onClick={() => setSelectedOrder(o)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3.5 px-4 font-extrabold text-[#1C3F32]">{o.orderNumber}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{o.serviceType}</td>
                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-[140px]">{o.details}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">₹{o.amount.toFixed(2)}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                          {o.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleStatusUpdate(o.id, e.target.value)}
                          className={`px-2 py-1 rounded-full border text-[11px] font-bold cursor-pointer focus:outline-none transition-all ${getStatusBadge(o.orderStatus)}`}
                        >
                          <option value="In Service">In Service</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready">Ready</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{o.time}</td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(o.id, o.orderNumber);
                          }}
                          title="Delete Order from Database"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right Column: Order Detail & Actions */}
      {currentOrder ? (
        <div className="w-96 bg-white flex flex-col h-full shadow-xl shrink-0 border-l border-slate-200">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Order Details</h3>
              <span className="text-xs text-slate-500">{currentOrder.orderNumber}</span>
            </div>
            <select
              value={currentOrder.orderStatus}
              onChange={(e) => handleStatusUpdate(currentOrder.id, e.target.value)}
              className={`px-2.5 py-1 rounded-full border text-xs font-bold cursor-pointer focus:outline-none transition-all ${getStatusBadge(currentOrder.orderStatus)}`}
            >
              <option value="In Service">In Service</option>
              <option value="Preparing">Preparing</option>
              <option value="Ready">Ready</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Quick Mark Completed action bar if not yet completed */}
          {currentOrder.orderStatus !== 'Completed' && (
            <div className="px-4 py-2.5 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Status: {currentOrder.orderStatus}</span>
              </span>
              <button
                onClick={() => handleStatusUpdate(currentOrder.id, 'Completed')}
                className="px-3 py-1 bg-[#2E7D32] hover:bg-[#256629] text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Completed</span>
              </button>
            </div>
          )}

          {/* Order Info Pills */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
            <div>Mode: <span className="text-slate-900 font-bold">{currentOrder.serviceType}</span></div>
            <div>Ref: <span className="text-slate-900 font-bold">{currentOrder.details}</span></div>
          </div>

          {currentOrder.customerName && (
            <div className="px-4 py-2 bg-emerald-50/50 border-b border-emerald-100/50 text-xs text-slate-700">
              <span className="text-slate-500">Customer:</span> <span className="font-bold">{currentOrder.customerName}</span>
              {currentOrder.customerPhone && <span className="text-slate-500 ml-1">({currentOrder.customerPhone})</span>}
            </div>
          )}

          {/* Items List from SQLite Database */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Items</div>
            {currentOrder.items && currentOrder.items.length > 0 ? (
              currentOrder.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
                  <div>
                    <div className="font-bold text-slate-800">{it.name}</div>
                    <div className="text-[11px] text-slate-400">Qty: {it.qty} × ₹{it.rate}</div>
                  </div>
                  <div className="font-extrabold text-slate-900">₹{(it.qty * it.rate).toFixed(2)}</div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 italic">No line items recorded</div>
            )}
          </div>

          {/* Financial Breakdown & Receipt Actions */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">
                  ₹{(currentOrder.subtotal || currentOrder.amount * 0.95).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span className="font-semibold text-slate-800">
                  ₹{(currentOrder.taxAmount || currentOrder.amount * 0.05).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Paid</span>
                <span className="text-[#1C3F32]">₹{currentOrder.amount.toFixed(2)}</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Payment: <span className="font-bold text-slate-700">{currentOrder.paymentMethod}</span> ({currentOrder.paymentStatus})
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button 
                onClick={() => setIsReceiptOpen(true)}
                className="py-2.5 px-3 rounded-xl border border-[#2E7D32] bg-[#2E7D32] hover:bg-[#256629] text-xs font-bold text-white flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Bill</span>
              </button>
              <button 
                onClick={() => setIsReceiptOpen(true)}
                className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5"
              >
                <RefreshCcw className="w-4 h-4 text-slate-500" />
                <span>Reprint Audit</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-96 bg-white flex flex-col items-center justify-center h-full text-slate-400 p-6 text-center border-l border-slate-200">
          <p className="text-xs">Select an order from the list to view details and print bill.</p>
        </div>
      )}

      {/* Thermal Bill Receipt Modal & Print */}
      <ReceiptModal
        order={currentOrder}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        settings={settings}
      />
    </div>
  );
};
