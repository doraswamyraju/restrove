import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Printer, 
  RefreshCcw, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  MoreVertical,
  Utensils
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  serviceType: string;
  details: string;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: 'Completed' | 'In Service' | 'Preparing' | 'Ready' | 'Dispatched';
  time: string;
  items: Array<{ name: string; qty: number; rate: number }>;
}

export const OrdersList: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('All Orders');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const orders: Order[] = [
    {
      id: '1',
      orderNumber: '#D-1482',
      serviceType: 'Dine In',
      details: 'Table T4 • 4 Guests',
      amount: 1039.50,
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      orderStatus: 'Completed',
      time: '12:42 PM',
      items: [
        { name: 'Paneer Tikka', qty: 1, rate: 280 },
        { name: 'Veg Biryani', qty: 1, rate: 260 },
        { name: 'Butter Naan', qty: 2, rate: 60 },
        { name: 'Chicken Curry', qty: 1, rate: 330 },
      ]
    },
    {
      id: '2',
      orderNumber: '#D-1481',
      serviceType: 'Dine In',
      details: 'Table T2 • 2 Guests',
      amount: 680.00,
      paymentMethod: 'Cash',
      paymentStatus: 'Paid',
      orderStatus: 'Completed',
      time: '12:25 PM',
      items: [
        { name: 'Chicken Biryani', qty: 2, rate: 320 },
        { name: 'Thums Up', qty: 1, rate: 40 },
      ]
    },
    {
      id: '3',
      orderNumber: '#T-1480',
      serviceType: 'Takeaway',
      details: 'Counter Pickup',
      amount: 420.00,
      paymentMethod: 'Wallet',
      paymentStatus: 'Paid',
      orderStatus: 'Completed',
      time: '12:10 PM',
      items: [
        { name: 'Paneer Butter Masala', qty: 1, rate: 290 },
        { name: 'Butter Naan', qty: 2, rate: 60 },
      ]
    },
    {
      id: '4',
      orderNumber: '#D-1479',
      serviceType: 'Dine In',
      details: 'Table T6 • 6 Guests',
      amount: 1860.00,
      paymentMethod: 'Card',
      paymentStatus: 'Paid',
      orderStatus: 'In Service',
      time: '12:05 PM',
      items: [
        { name: 'Tandoori Platter', qty: 1, rate: 650 },
        { name: 'Mutton Biryani', qty: 2, rate: 450 },
        { name: 'Garlic Naan', qty: 4, rate: 75 },
      ]
    },
    {
      id: '5',
      orderNumber: '#O-1478',
      serviceType: 'Online',
      details: 'Swiggy Web Order',
      amount: 540.00,
      paymentMethod: 'Razorpay',
      paymentStatus: 'Paid',
      orderStatus: 'Preparing',
      time: '11:50 AM',
      items: [
        { name: 'Chicken Fried Rice', qty: 1, rate: 260 },
        { name: 'Chilli Chicken', qty: 1, rate: 280 },
      ]
    }
  ];

  const currentOrder = selectedOrder || orders[0];

  const getStatusBadge = (status: Order['orderStatus']) => {
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

  return (
    <div className="flex h-full w-full bg-[#F4F6F9] overflow-hidden">
      {/* Left/Middle: Orders Table */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-200">
        {/* Orders Header */}
        <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Orders Management</h2>
            <p className="text-xs text-slate-500 mt-0.5">View, filter, reprint and audit all restaurant orders.</p>
          </div>

          <div className="flex items-center space-x-2">
            <button className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center space-x-1.5">
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button className="px-4 py-2 rounded-xl bg-[#6C47FF] hover:bg-[#5835E5] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-[#6C47FF]/20">
              <Plus className="w-4 h-4" />
              <span>New Order</span>
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          {/* Service Filter Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'All Orders', count: 142 },
              { id: 'Dine In', count: 56 },
              { id: 'Takeaway', count: 38 },
              { id: 'Delivery', count: 22 },
              { id: 'Online', count: 26 },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  activeFilter === f.id
                    ? 'bg-[#6C47FF] text-white shadow-sm'
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
              placeholder="Search by Order ID, Phone..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#6C47FF]"
            />
          </div>
        </div>

        {/* Orders Table */}
        <div className="flex-1 overflow-y-auto">
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
                const isSelected = currentOrder.id === o.id;
                return (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedOrder(o)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-purple-50/70 font-semibold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-extrabold text-[#6C47FF]">{o.orderNumber}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{o.serviceType}</td>
                    <td className="py-3.5 px-4 text-slate-600">{o.details}</td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">₹{o.amount.toFixed(2)}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {o.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full border text-[11px] font-bold ${getStatusBadge(o.orderStatus)}`}>
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{o.time}</td>
                    <td className="py-3.5 px-4 text-center text-slate-400 hover:text-slate-700">
                      <MoreVertical className="w-4 h-4 mx-auto" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column: Order Detail & Actions */}
      <div className="w-96 bg-white flex flex-col h-full shadow-xl shrink-0 border-l border-slate-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Order Details</h3>
            <span className="text-xs text-slate-500">{currentOrder.orderNumber}</span>
          </div>
          <span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${getStatusBadge(currentOrder.orderStatus)}`}>
            {currentOrder.orderStatus}
          </span>
        </div>

        {/* Order Info Pills */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
          <div>Mode: <span className="text-slate-900 font-bold">{currentOrder.serviceType}</span></div>
          <div>Ref: <span className="text-slate-900 font-bold">{currentOrder.details}</span></div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ordered Items</div>
          {currentOrder.items.map((it, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100">
              <div>
                <div className="font-bold text-slate-800">{it.name}</div>
                <div className="text-[11px] text-slate-400">Qty: {it.qty} × ₹{it.rate}</div>
              </div>
              <div className="font-extrabold text-slate-900">₹{it.qty * it.rate}</div>
            </div>
          ))}
        </div>

        {/* Financial Breakdown & Receipt Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">₹{(currentOrder.amount * 0.95).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span className="font-semibold text-slate-800">₹{(currentOrder.amount * 0.05).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Paid</span>
              <span className="text-[#0B2D5B]">₹{currentOrder.amount.toFixed(2)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5">
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print Bill</span>
            </button>
            <button className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center space-x-1.5">
              <RefreshCcw className="w-4 h-4 text-slate-500" />
              <span>Reprint Audit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
