import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Wallet as WalletIcon, 
  CheckCircle2, 
  Percent,
  User,
  ShoppingBag
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
}

export const PosBilling: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceType, setServiceType] = useState<'Takeaway' | 'Delivery' | 'Dine In'>('Takeaway');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [walletBalance, setWalletBalance] = useState<number | null>(450.00);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Card' | 'Wallet'>('UPI');
  const [isSuccess, setIsSuccess] = useState(false);

  // Sample catalog items
  const categories = ['All', 'Starters', 'Main Course', 'Biryani', 'Breads', 'Beverages'];
  const [menuItems] = useState([
    { id: '1', name: 'Paneer Tikka', category: 'Starters', price: 280, isVeg: true, image: '🍢' },
    { id: '2', name: 'Chicken Tikka', category: 'Starters', price: 320, isVeg: false, image: '🍗' },
    { id: '3', name: 'Veg Biryani', category: 'Biryani', price: 260, isVeg: true, image: '🍚' },
    { id: '4', name: 'Chicken Biryani', category: 'Biryani', price: 320, isVeg: false, image: '🍲' },
    { id: '5', name: 'Butter Naan', category: 'Breads', price: 60, isVeg: true, image: '🫓' },
    { id: '6', name: 'Chicken Curry', category: 'Main Course', price: 330, isVeg: false, image: '🍛' },
    { id: '7', name: 'Paneer Butter Masala', category: 'Main Course', price: 290, isVeg: true, image: '🥘' },
    { id: '8', name: 'Mango Lassi', category: 'Beverages', price: 110, isVeg: true, image: '🥭' },
  ]);

  const [cart, setCart] = useState<CartItem[]>([
    { id: '1', name: 'Paneer Tikka', price: 280, quantity: 1, isVeg: true },
    { id: '3', name: 'Veg Biryani', price: 260, quantity: 1, isVeg: true },
    { id: '5', name: 'Butter Naan', price: 60, quantity: 2, isVeg: true },
    { id: '6', name: 'Chicken Curry', price: 330, quantity: 1, isVeg: false },
  ]);

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, isVeg: item.isVeg }];
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
  const gst = Math.round(subtotal * 0.05 * 100) / 100;
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const total = Math.max(0, subtotal + gst - discountAmount);

  const handleCheckout = () => {
    if (!cart.length) return;
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setCart([]);
    }, 2200);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex h-full w-full bg-[#F4F6F9] overflow-hidden">
      {/* Left/Middle: POS Catalog & Item Picker */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-slate-200">
        {/* Top Filter Bar */}
        <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes or items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FF7A00]/20 focus:border-[#FF7A00]"
            />
          </div>

          {/* Service Mode Selector */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['Takeaway', 'Delivery', 'Dine In'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setServiceType(mode)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  serviceType === mode
                    ? 'bg-[#0B2D5B] text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-2 px-4 py-3 bg-white border-b border-slate-100 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat
                  ? 'bg-[#6C47FF] text-white shadow-md shadow-[#6C47FF]/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#FF7A00]/40 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="w-full h-24 bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl flex items-center justify-center text-4xl mb-2.5">
                  {item.image}
                </div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <h4 className="font-bold text-slate-900 text-sm leading-tight group-hover:text-[#FF7A00] transition-colors">
                    {item.name}
                  </h4>
                  <span className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    item.isVeg ? 'border-emerald-600' : 'border-red-600'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-red-600'}`} />
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                <span className="font-extrabold text-slate-900 text-sm">₹{item.price}</span>
                <span className="w-7 h-7 rounded-lg bg-orange-50 text-[#FF7A00] group-hover:bg-[#FF7A00] group-hover:text-white flex items-center justify-center transition-colors">
                  <Plus className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Active Cart, Customer Wallet & Billing */}
      <div className="w-96 bg-white flex flex-col h-full shadow-xl shrink-0">
        {/* Cart Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-[#6C47FF]" />
            <h3 className="font-extrabold text-slate-900 text-base">Active Order</h3>
          </div>
          <span className="text-xs bg-purple-100 text-[#6C47FF] font-bold px-2.5 py-0.5 rounded-full">
            {cart.reduce((a, b) => a + b.quantity, 0)} Items
          </span>
        </div>

        {/* Customer Wallet Quick Attach */}
        <div className="p-3.5 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Customer Info &amp; Wallet
            </span>
            {walletBalance !== null && (
              <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <WalletIcon className="w-3 h-3" /> Bal: ₹{walletBalance}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Phone (9876543210)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#6C47FF]"
            />
            <input
              type="text"
              placeholder="Name (Optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#6C47FF]"
            />
          </div>
        </div>

        {/* Cart Line Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingBag className="w-12 h-12 mb-2 stroke-[1.5]" />
              <p className="text-xs font-medium">Cart is empty. Select items to bill.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex-1 pr-2">
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="font-bold text-slate-800 text-xs">{item.name}</span>
                  </div>
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

        {/* Bill Breakdown & Payment Selector */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2.5">
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span className="font-semibold text-slate-800">₹{gst.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Discount</span>
                <span>-₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Payable</span>
              <span className="text-[#0B2D5B]">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-2">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
              Select Payment Method
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'UPI', icon: QrCode },
                { id: 'Cash', icon: Banknote },
                { id: 'Card', icon: CreditCard },
                { id: 'Wallet', icon: WalletIcon },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`py-2 flex flex-col items-center justify-center rounded-xl border text-xs font-bold transition-all ${
                      isSelected
                        ? 'border-[#FF7A00] bg-orange-50 text-[#FF7A00] shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
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
                : 'bg-[#6C47FF] hover:bg-[#5835E5] text-white shadow-[#6C47FF]/25'
            }`}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-5 h-5 animate-bounce" />
                <span>Order Paid &amp; Invoiced!</span>
              </>
            ) : (
              <>
                <span>Complete Bill &amp; Pay (₹{total.toFixed(2)})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

