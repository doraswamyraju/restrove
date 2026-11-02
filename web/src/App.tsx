import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { PosBilling } from './modules/billing/PosBilling';
import { OrdersList } from './modules/orders/OrdersList';
import { CustomerWallet } from './modules/wallet/CustomerWallet';
import { Bell, Printer, Coffee } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState('pos');

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAFC]">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

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
              <span>Online • Cafeteria POS</span>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Hardware Status Badges */}
            <div className="hidden md:flex items-center space-x-2 text-xs font-bold text-slate-600">
              <span className="flex items-center space-x-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                <Printer className="w-3.5 h-3.5 text-emerald-600" />
                <span>Token Printer (3") Ready</span>
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
          {activeTab === 'menu' && (
            <div className="p-8 text-center text-slate-500">Chai &amp; Snacks Menu editor coming up next...</div>
          )}
          {activeTab === 'inventory' && (
            <div className="p-8 text-center text-slate-500">Milk, Tea Leaves &amp; Bakery Stock Inventory coming up next...</div>
          )}
          {activeTab === 'customers' && (
            <div className="p-8 text-center text-slate-500">Regular Customers directory coming up next...</div>
          )}
          {activeTab === 'reports' && (
            <div className="p-8 text-center text-slate-500">Daily Chai Sales &amp; Cash Closing reports coming up next...</div>
          )}
          {activeTab === 'settings' && (
            <div className="p-8 text-center text-slate-500">Cafeteria settings coming up next...</div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
