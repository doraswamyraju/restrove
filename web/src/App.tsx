import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { PosBilling } from './modules/billing/PosBilling';
import { OrdersList } from './modules/orders/OrdersList';
import { CustomerWallet } from './modules/wallet/CustomerWallet';
import { MenuEditor } from './modules/catalog/MenuEditor';
import { InventoryView } from './modules/inventory/InventoryView';
import { CustomersView } from './modules/customers/CustomersView';
import { ReportsView } from './modules/reports/ReportsView';
import { SettingsView } from './modules/settings/SettingsView';
import { DigitalMenuCard } from './modules/catalog/DigitalMenuCard';
import { Bell, Printer, Coffee, QrCode } from 'lucide-react';
import { getOrders } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [isDigitalMenuRoute, setIsDigitalMenuRoute] = useState(false);
  const [ordersBadgeCount, setOrdersBadgeCount] = useState<number | undefined>(undefined);

  useEffect(() => {
    // Check if customer scanned digital menu QR code (hash or path)
    if (window.location.hash === '#/digital-menu' || window.location.pathname === '/digital-menu') {
      setIsDigitalMenuRoute(true);
    }
  }, []);

  // Fetch real order count from SQLite database
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await getOrders();
        if (res && res.counts) {
          setOrdersBadgeCount(res.counts.all);
        } else if (res && res.orders) {
          setOrdersBadgeCount(res.orders.length);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCounts();
  }, [activeTab]);

  if (isDigitalMenuRoute) {
    return <DigitalMenuCard />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar Navigation with dynamic database order count */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} ordersBadge={ordersBadgeCount} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Universal Top Header */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="w-8 h-8 rounded-lg bg-[#1C3F32] text-white flex items-center justify-center font-bold text-xs">
                <Coffee className="w-4 h-4 text-emerald-300" />
              </span>
              <span className="font-extrabold text-slate-800 text-sm">
                CHAI WALA ORIGINAL (Main Branch)
              </span>
            </div>
            <span className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Online • SQLite Database</span>
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick Digital QR Menu Link */}
            <a
              href="#/digital-menu"
              target="_blank"
              rel="noreferrer"
              className="hidden md:flex items-center space-x-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>Open Digital Menu Card</span>
            </a>

            {/* Hardware Status Badges */}
            <div className="hidden md:flex items-center space-x-2 text-xs font-bold text-slate-600">
              <span className="flex items-center space-x-1 bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200">
                <Printer className="w-3.5 h-3.5 text-emerald-600" />
                <span>Thermal (3") Ready</span>
              </span>
            </div>

            {/* Notification & User profile */}
            <button className="p-2 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100 relative">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 bg-emerald-500 rounded-full absolute top-1.5 right-1.5" />
            </button>

            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-[#1C3F32] text-white flex items-center justify-center font-bold text-xs">
                CW
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 leading-tight">Cashier Counter</div>
                <div className="text-[10px] text-slate-400 font-medium">Single-Unit Mode</div>
              </div>
            </div>
          </div>
        </header>

        {/* View Router */}
        <main className="flex-1 overflow-hidden">
          {activeTab === 'pos' && <PosBilling />}
          {activeTab === 'orders' && <OrdersList />}
          {activeTab === 'wallet' && <CustomerWallet />}
          {activeTab === 'menu' && <MenuEditor />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'customers' && <CustomersView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>
    </div>
  );
}

export default App;
