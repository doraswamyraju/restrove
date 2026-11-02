import { 
  Receipt, 
  ClipboardList, 
  UtensilsCrossed, 
  Package, 
  Users, 
  Wallet, 
  BarChart3, 
  Settings
} from 'lucide-react';
import logoDark from '../assets/logo-dark.svg';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'pos', label: 'POS (Billing)', icon: Receipt },
    { id: 'orders', label: 'Orders', icon: ClipboardList, badge: '142' },
    { id: 'wallet', label: 'Customer Wallet', icon: Wallet },
    { id: 'menu', label: 'Menu & Modifiers', icon: UtensilsCrossed },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#091E3A] text-white flex flex-col justify-between h-screen select-none shrink-0 border-r border-[#152E52]">
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-[#1A3860] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={logoDark} alt="Restrove" className="h-10 w-auto object-contain" />
          </div>
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
                    ? 'bg-[#6C47FF] text-white shadow-lg shadow-[#6C47FF]/30'
                    : 'text-slate-300 hover:bg-[#132E54] hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#1E3A66] text-slate-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Outlet Details & Plan */}
      <div className="p-4 m-3 bg-[#102A4E] rounded-xl border border-[#1A3E6D]">
        <div className="flex items-center space-x-2 text-amber-400 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider">👑 Single-Unit Plan</span>
        </div>
        <div className="text-xs font-semibold text-white">Restaurant Bistro</div>
        <div className="text-[11px] text-slate-400">Main Outlet • Tirupati</div>
      </div>
    </aside>
  );
};
