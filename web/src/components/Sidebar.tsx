import { 
  Receipt, 
  ClipboardList, 
  Coffee, 
  Package, 
  Users, 
  Wallet, 
  BarChart3, 
  Settings
} from 'lucide-react';
import chaiWalaLogo from '../assets/chai-wala-dark.svg';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'pos', label: 'POS (Billing)', icon: Receipt },
    { id: 'orders', label: 'Orders', icon: ClipboardList, badge: '86' },
    { id: 'wallet', label: 'Customer Wallet', icon: Wallet },
    { id: 'menu', label: 'Chai & Snacks Menu', icon: Coffee },
    { id: 'inventory', label: 'Milk & Stock Inventory', icon: Package },
    { id: 'customers', label: 'Regular Customers', icon: Users },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Cafeteria Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#142E25] text-white flex flex-col justify-between h-screen select-none shrink-0 border-r border-[#1E4336]">
      <div>
        {/* Brand Header with Exact Chai Wala Original Branding */}
        <div className="p-3.5 border-b border-[#214B3C] bg-[#11271F] flex items-center justify-center">
          <img src={chaiWalaLogo} alt="Chai Wala Original" className="h-12 w-auto object-contain" />
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#2E7D32] text-white shadow-lg shadow-[#2E7D32]/30'
                    : 'text-slate-300 hover:bg-[#1C3E32] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#244E40] text-emerald-200'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Outlet Details & Cafeteria Plan */}
      <div className="p-4 m-3 bg-[#1C3E32] rounded-xl border border-[#2B5E4C]">
        <div className="flex items-center space-x-2 text-emerald-300 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider">☕ Cafeteria Outlet</span>
        </div>
        <div className="text-xs font-bold text-white">Chai Wala Original</div>
        <div className="text-[11px] text-emerald-200/70">Main Branch • Fresh Chai &amp; Buns</div>
      </div>
    </aside>
  );
};
