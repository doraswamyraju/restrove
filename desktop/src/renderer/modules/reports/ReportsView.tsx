import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  TrendingUp, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Wallet,
  Coffee,
  DollarSign
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState('Today');

  // Daily Cafeteria Sales Figures
  const summary = {
    grossSales: 6420.00,
    ordersCount: 86,
    avgOrderValue: 74.65,
    cashInDrawer: 2840.00,
    upiSales: 2780.00,
    walletDeducted: 800.00,
  };

  const topSellingSnacks = [
    { name: 'Irani Dum Chai', count: 124, revenue: 2480 },
    { name: 'Classic Maska Bun', count: 48, revenue: 1680 },
    { name: 'Crispy Aloo Samosa (2 pcs)', count: 32, revenue: 1280 },
    { name: 'Ginger Elaichi Chai', count: 26, revenue: 650 },
    { name: 'Filter Coffee', count: 18, revenue: 540 },
    { name: 'Osmania Biscuits (Pkts)', count: 16, revenue: 400 },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F9] overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Reports &amp; Daily Sales Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daily cafeteria sales breakdown, cash reconciliation, and top item performance.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
            {['Today', 'Yesterday', 'Last 7 Days', 'This Month'].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRange(r)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedRange === r ? 'bg-white shadow text-[#1C3F32]' : 'hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <button className="px-3.5 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase">Total Net Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">₹{summary.grossSales.toFixed(2)}</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">
              +14% compared to yesterday
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase">Token Orders Billed</span>
              <Coffee className="w-4 h-4 text-[#1C3F32]" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">{summary.ordersCount} Tokens</div>
            <div className="text-[11px] text-slate-500 font-semibold mt-1">
              Avg ticket: ₹{summary.avgOrderValue.toFixed(2)}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase">Cash in Drawer Closing</span>
              <Banknote className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-[#1C3F32] mt-2">₹{summary.cashInDrawer.toFixed(2)}</div>
            <div className="text-[11px] text-emerald-700 font-semibold mt-1">
              Closing Session Reconciled
            </div>
          </div>
        </div>

        {/* Payment Split & Top Items */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Payment Tender Split */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm mb-4">Payment Method Breakdown</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center space-x-2.5">
                    <QrCode className="w-4 h-4 text-[#2E7D32]" />
                    <span className="text-xs font-bold text-slate-800">UPI QR Payments</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">₹{summary.upiSales.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center space-x-2.5">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">Physical Cash</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">₹{summary.cashInDrawer.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center space-x-2.5">
                    <Wallet className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-800">Customer Advance Wallet</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">₹{summary.walletDeducted.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
              Shift Closing Session Active
            </div>
          </div>

          {/* Top Selling Snacks (2 cols) */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-sm mb-4">Top-Selling Items</h3>
            <div className="divide-y divide-slate-100">
              {topSellingSnacks.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="w-5 text-slate-400 font-extrabold">#{idx + 1}</span>
                    <span className="font-bold text-slate-800">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-6">
                    <span className="text-slate-500 font-medium">{item.count} sold</span>
                    <span className="font-extrabold text-slate-900 w-16 text-right">₹{item.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

