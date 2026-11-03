import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  TrendingUp, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Wallet,
  Coffee,
  RefreshCcw,
  AlertCircle
} from 'lucide-react';
import { getReportsSummary } from '../../services/api';

export const ReportsView: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState('Today');
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<{
    summary: {
      grossSales: number;
      ordersCount: number;
      avgOrderValue: number;
      cashInDrawer: number;
      upiSales: number;
      walletDeducted: number;
      cardSales: number;
      comparisonText: string;
      isPositive: boolean;
    };
    paymentBreakdown: any[];
    topItems: any[];
  }>({
    summary: {
      grossSales: 0,
      ordersCount: 0,
      avgOrderValue: 0,
      cashInDrawer: 0,
      upiSales: 0,
      walletDeducted: 0,
      cardSales: 0,
      comparisonText: '',
      isPositive: true
    },
    paymentBreakdown: [],
    topItems: []
  });

  useEffect(() => {
    fetchReport(selectedRange);
  }, [selectedRange]);

  const fetchReport = async (range: string) => {
    setLoading(true);
    try {
      const data = await getReportsSummary(range);
      if (data && data.summary) {
        setReportData(data);
      }
    } catch (e) {
      console.error('Error fetching reports summary:', e);
    } finally {
      setLoading(false);
    }
  };

  const { summary, topItems } = reportData;

  const exportCSV = () => {
    let csv = `Range,${selectedRange}\n`;
    csv += `Total Net Revenue,₹${summary.grossSales.toFixed(2)}\n`;
    csv += `Orders Billed,${summary.ordersCount}\n`;
    csv += `Cash In Drawer,₹${summary.cashInDrawer.toFixed(2)}\n`;
    csv += `UPI Payments,₹${summary.upiSales.toFixed(2)}\n`;
    csv += `Wallet Deductions,₹${summary.walletDeducted.toFixed(2)}\n\n`;
    csv += `Item Name,Sold Quantity,Revenue (₹)\n`;
    topItems.forEach((it) => {
      csv += `"${it.name}",${it.count},${it.revenue}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Reports_${selectedRange.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F6F9] overflow-hidden">
      {/* Header */}
      <div className="p-6 bg-white border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Reports &amp; Daily Sales Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real SQLite Database analytics: daily cafeteria breakdown, cash reconciliation, and live item performance.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
            {['Today', 'Yesterday', 'Last 7 Days', 'This Month'].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRange(r)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedRange === r ? 'bg-white shadow text-[#1C3F32] font-black' : 'hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchReport(selectedRange)}
            title="Refresh Report"
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-[#2E7D32] hover:bg-[#256629] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm"
          >
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
              <span className="text-xs font-bold uppercase tracking-wider">Total Net Revenue ({selectedRange})</span>
              <TrendingUp className={`w-4 h-4 ${summary.isPositive ? 'text-emerald-600' : 'text-amber-600'}`} />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              ₹{summary.grossSales.toFixed(2)}
            </div>
            <div className={`text-[11px] font-semibold mt-1 ${summary.isPositive ? 'text-emerald-700' : 'text-amber-700'}`}>
              {summary.comparisonText}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Token Orders Billed</span>
              <Coffee className="w-4 h-4 text-[#1C3F32]" />
            </div>
            <div className="text-2xl font-extrabold text-slate-900 mt-2">
              {summary.ordersCount} Tokens
            </div>
            <div className="text-[11px] text-slate-500 font-semibold mt-1">
              Avg ticket: ₹{summary.avgOrderValue.toFixed(2)}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Cash in Drawer Closing</span>
              <Banknote className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-[#1C3F32] mt-2">
              ₹{summary.cashInDrawer.toFixed(2)}
            </div>
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

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                  <div className="flex items-center space-x-2.5">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">Card &amp; Online Gateway</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">₹{summary.cardSales.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400">
              Shift Closing Session Active
            </div>
          </div>

          {/* Top Selling Snacks */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-extrabold text-slate-900 text-sm mb-4">Top-Selling Items ({selectedRange})</h3>
            {topItems.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <AlertCircle className="w-6 h-6 mb-1 opacity-50" />
                <span className="text-xs">No item sales recorded for {selectedRange.toLowerCase()}</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {topItems.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-3">
                      <span className="text-[11px] font-black text-slate-400 w-5">#{idx + 1}</span>
                      <span className="font-bold text-slate-900">{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-6">
                      <span className="text-slate-500 font-semibold">{item.count} sold</span>
                      <span className="font-extrabold text-slate-900 min-w-[70px] text-right">
                        ₹{Number(item.revenue || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
