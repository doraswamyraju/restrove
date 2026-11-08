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
import { LicenseAdminView } from './modules/settings/LicenseAdminView';
import { DigitalMenuCard } from './modules/catalog/DigitalMenuCard';
import { Bell, Printer, Coffee, QrCode, X, ArrowRight } from 'lucide-react';
import { getOrders, API_URL } from './services/api';
import { playChime } from './utils/soundAlert';

export function App() {
  const [activeTab, setActiveTab] = useState('pos');
  const [isDigitalMenuRoute, setIsDigitalMenuRoute] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState(false);
  const [ordersBadgeCount, setOrdersBadgeCount] = useState<number | undefined>(undefined);
  const [incomingOrderAlert, setIncomingOrderAlert] = useState<any>(null);
  const [licenseStatus, setLicenseStatus] = useState<any>(null);

  useEffect(() => {
    // Validate vendor software license
    fetch(`${API_URL}/licenses/check/chaiwala-original`)
      .then((r) => r.json())
      .then((data) => {
        setLicenseStatus(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Check routes
    const hash = window.location.hash;
    const pathname = window.location.pathname;

    if (hash === '#/digital-menu' || pathname === '/digital-menu') {
      setIsDigitalMenuRoute(true);
    }
    if (hash === '#/admin' || pathname === '/admin') {
      setIsAdminRoute(true);
    }

    // Request notification permissions (both browser and native Android)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
    try {
      (window as any).Capacitor?.Plugins?.LocalNotifications?.requestPermissions?.().catch(() => {});
    } catch (e) {}
  }, []);

  // Real-time live order push listener (Server-Sent Events)
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource(`${API_URL}/orders/live-stream`);
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'new_order' && data.order) {
            // Update orders badge counter for all orders
            setOrdersBadgeCount((prev) => (prev !== undefined ? prev + 1 : 1));

            // Alert ONLY for orders placed via the Digital Menu Card (not internal cashier POS)
            const isFromDigitalMenu = data.order.source === 'digital_menu' || 
                                     data.order.details?.toLowerCase().includes('table') || 
                                     data.order.orderStatus === 'In Service';

            if (isFromDigitalMenu) {
              playChime();
              setIncomingOrderAlert(data.order);

              // Native Android status bar / tray notification (when running inside Capacitor app)
              try {
                (window as any).Capacitor?.Plugins?.LocalNotifications?.schedule?.({
                  notifications: [
                    {
                      title: `📱 Digital Menu Order: ${data.order.orderNumber}`,
                      body: `${data.order.serviceType} • ₹${data.order.amount} - ${data.order.customerName || 'Table Guest'}`,
                      id: Math.floor(Math.random() * 100000),
                      schedule: { at: new Date(Date.now() + 100) }
                    }
                  ]
                })?.catch?.(() => {});
              } catch (e) {}

              // Browser desktop notification banner
              if ('Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification(`📱 Digital Menu Order: ${data.order.orderNumber}`, {
                    body: `${data.order.serviceType} (${data.order.details || 'Table Order'}) • ₹${data.order.amount}`
                  });
                } catch (e) {}
              }

              // Auto-hide in-app toast after 8 seconds
              setTimeout(() => {
                setIncomingOrderAlert((curr: any) => (curr?.id === data.order.id ? null : curr));
              }, 8000);
            }
          }
        } catch (err) {}
      };
    } catch (e) {
      console.warn('SSE connection notice:', e);
    }

    return () => {
      es?.close();
    };
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

  if (licenseStatus && licenseStatus.available === false) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-white p-6 select-none">
        <div className="max-w-md w-full bg-slate-800 border border-rose-500/30 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
            <X className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-rose-300">Software Access Suspended</h2>
          <p className="text-sm text-slate-300 font-semibold leading-relaxed">
            {licenseStatus.error || 'The license for this Restrove outlet has expired or was suspended by platform administration.'}
          </p>
          <div className="p-3 bg-slate-900/80 rounded-xl text-xs font-mono text-slate-400">
            Outlet: Chai Wala Original • Status: {licenseStatus.status?.toUpperCase() || 'INACTIVE'}
          </div>
          <p className="text-xs text-slate-500">
            Please contact Restrove Administrator to renew or reactivate this terminal.
          </p>
        </div>
      </div>
    );
  }

  if (isDigitalMenuRoute) {
    return <DigitalMenuCard />;
  }

  if (isAdminRoute) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC]">
        <LicenseAdminView />
      </div>
    );
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
          {activeTab === 'license' && <LicenseAdminView />}
        </main>

        {/* Real-time Order Incoming Alert Floating Toast */}
        {incomingOrderAlert && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce duration-1000 max-w-md w-full bg-[#1C3F32] text-white p-4 rounded-2xl shadow-2xl border-2 border-emerald-400 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 animate-spin" />
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs uppercase tracking-wider font-bold bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full">
                    🔔 New Order
                  </span>
                  <span className="font-extrabold text-sm">{incomingOrderAlert.orderNumber}</span>
                </div>
                <p className="text-xs text-emerald-100 mt-1">
                  ₹{incomingOrderAlert.amount} • {incomingOrderAlert.serviceType || 'Dine-In'} • {incomingOrderAlert.customerName || 'Direct Customer'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setActiveTab('orders');
                  setIncomingOrderAlert(null);
                }}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1"
              >
                <span>View</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIncomingOrderAlert(null)}
                className="p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-700/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
