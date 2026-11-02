import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Wallet as WalletIcon, 
  CheckCircle2, 
  User,
  Coffee
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

export const PosBilling: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceType, setServiceType] = useState<'Takeaway' | 'Dine In'>('Takeaway');
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  const [customerName, setCustomerName] = useState('Doraswamy Raju');
  const [walletBalance] = useState<number>(380.00);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Card' | 'Wallet'>('UPI');
  const [isSuccess, setIsSuccess] = useState(false);

  // Cafeteria specific menu: Milk, Chai varieties, Coffee, Maska Buns, Biscuits, Samosas
  const categories = ['All', 'Special Chai', 'Coffee & Milk', 'Maska Buns', 'Hot Snacks', 'Biscuits & Bakery'];

  const [menuItems] = useState([
    { id: '1', name: 'Irani Dum Chai', category: 'Special Chai', price: 20, image: '☕', tag: 'Bestseller' },
    { id: '2', name: 'Ginger Elaichi Chai', category: 'Special Chai', price: 25, image: '🫖', tag: 'Fresh Spiced' },
    { id: '3', name: 'Masala Chai', category: 'Special Chai', price: 25, image: '☕', tag: 'Traditional' },
    { id: '4', name: 'Filter Coffee', category: 'Coffee & Milk', price: 30, image: '☕', tag: 'South Indian' },
    { id: '5', name: 'Hot Badam Milk', category: 'Coffee & Milk', price: 40, image: '🥛', tag: 'Rich & Creamy' },
    { id: '6', name: 'Turmeric Golden Milk', category: 'Coffee & Milk', price: 35, image: '🥛', tag: 'Immunity' },
    { id: '7', name: 'Classic Maska Bun', category: 'Maska Buns', price: 35, image: '🍞', tag: 'Amul Butter' },
    { id: '8', name: 'Bun Maska Jam', category: 'Maska Buns', price: 45, image: '🍞', tag: 'Sweet & Salty' },
    { id: '9', name: 'Cheese Bun Maska', category: 'Maska Buns', price: 55, image: '🧀', tag: 'Grilled' },
    { id: '10', name: 'Crispy Aloo Samosa (2 pcs)', category: 'Hot Snacks', price: 40, image: '🥟', tag: 'Served Hot' },
    { id: '11', name: 'Onion Samosa (4 pcs)', category: 'Hot Snacks', price: 35, image: '🥟', tag: 'Crispy Mini' },
    { id: '12', name: 'Osmania Biscuits (4 pcs)', category: 'Biscuits & Bakery', price: 25, image: '🍪', tag: 'Chai Dip' },
    { id: '13', name: 'Butter Cookies (Plate)', category: 'Biscuits & Bakery', price: 30, image: '🍪', tag: 'Fresh Baked' },
  ]);

  const [cart, setCart] = useState<CartItem[]>([
    { id: '1', name: 'Irani Dum Chai', price: 20, quantity: 2, category: 'Special Chai' },
    { id: '7', name: 'Classic Maska Bun', price: 35, quantity: 2, category: 'Maska Buns' },
    { id: '10', name: 'Crispy Aloo Samosa (2 pcs)', price: 40, quantity: 1, category: 'Hot Snacks' },
  ]);

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, category: item.category }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const subtotal = cart.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const gst = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST on Cafeteria snacks
  const total = subtotal + gst;

  const handleCheckout = () => {
    if (!cart.length) return;
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setCart([]);
    }, 2000);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex h-full w-full bg-[#F3F6F4] overflow-hidden">
      {/* Left/Middle: Cafeteria Menu & Snacks Picker */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-[#E2E8F0]">
        {/* Top Search & Cafeteria Mode Bar */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Chai, Coffee, Samosa, Bun Maska..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
            />
          </div>

          {/* Service Mode Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['Takeaway', 'Dine In'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setServiceType(mode)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  serviceType === mode
                    ? 'bg-[#1C3F32] text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Cafeteria Category Pills */}
        <div className="flex items-center space-x-2 px-4 py-3 bg-white border-b border-slate-100 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-[#2E7D32] text-white shadow-md shadow-[#2E7D32]/20'
                  : 'bg-emerald-50 text-[#1C3F32] hover:bg-emerald-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cafeteria Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#2E7D32]/40 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-full h-24 bg-gradient-to-br from-emerald-50 to-amber-50 rounded-xl flex items-center justify-center text-4xl mb-2.5">
                  {item.image}
                </div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h4 className="font-extrabold text-slate-900 text-sm leading-tight group-hover:text-[#2E7D32] transition-colors">
                    {item.name}
                  </h4>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-600 flex items-center justify-center shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  </span>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  {item.tag}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2.5">
                <span className="font-extrabold text-slate-900 text-base">₹{item.price}</span>
                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-[#2E7D32] group-hover:bg-[#2E7D32] group-hover:text-white flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Cafeteria Token / Active Order & Wallet */}
      <div className="w-96 bg-white flex flex-col h-full shadow-xl shrink-0">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-[#1C3F32] text-white">
          <div className="flex items-center space-x-2">
            <Coffee className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-white text-base">Counter Token Order</h3>
          </div>
          <span className="text-xs bg-emerald-500/30 text-emerald-200 font-bold px-2.5 py-0.5 rounded-full">
            {cart.reduce((a, b) => a + b.quantity, 0)} Items
          </span>
        </div>

        {/* Customer Wallet Quick Attach for Advance top-up */}
        <div className="p-3.5 bg-emerald-50/50 border-b border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-emerald-700" /> Regular Customer
            </span>
            <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <WalletIcon className="w-3 h-3" /> Advance: ₹{walletBalance}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Customer Phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
            />
            <input
              type="text"
              placeholder="Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
            />
          </div>
        </div>

        {/* Cart Line Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Coffee className="w-12 h-12 mb-2 stroke-[1.5] text-slate-300" />
              <p className="text-xs font-semibold">Select Chai &amp; snacks to bill.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex-1 pr-2">
                  <div className="font-bold text-slate-800 text-xs">{item.name}</div>
                  <span className="text-[11px] text-slate-500">₹{item.price} each</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-extrabold text-xs text-slate-800 w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-200"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <span className="font-extrabold text-xs text-slate-900 w-14 text-right">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Breakdown & Multi-tender Selector */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2.5">
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span className="font-bold text-slate-800">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span className="font-bold text-slate-800">₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Amount</span>
              <span className="text-[#1C3F32]">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'UPI', icon: QrCode },
                { id: 'Cash', icon: Banknote },
                { id: 'Wallet', icon: WalletIcon },
                { id: 'Card', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`py-2 flex flex-col items-center justify-center rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-[#2E7D32] bg-emerald-50 text-[#2E7D32] shadow-sm font-extrabold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-0.5" />
                    <span>{m.id}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Button */}
          <button
            disabled={!cart.length || isSuccess}
            onClick={handleCheckout}
            className={`w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
              isSuccess
                ? 'bg-emerald-600 text-white'
                : !cart.length
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-[#1C3F32] hover:bg-[#142E25] text-white shadow-emerald-900/20'
            }`}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 animate-bounce" />
                <span>Token Billed &amp; Printed!</span>
              </>
            ) : (
              <span>Print Token &amp; Pay (₹{total.toFixed(2)})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
