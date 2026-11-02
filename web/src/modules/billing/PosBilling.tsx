import React, { useState, useEffect } from 'react';
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
  Coffee,
  Printer
} from 'lucide-react';
import { getCategories, getMenuItems, getCustomerWallet, createOrder } from '../../services/api';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category_id?: string;
}

export const PosBilling: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [serviceType, setServiceType] = useState<'Takeaway' | 'Dine In'>('Takeaway');
  
  // Real DB Items
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Customer & Wallet State
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // Cart & Payment
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Cash' | 'Card' | 'Wallet'>('UPI');
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastBilledOrder, setLastBilledOrder] = useState<any>(null);

  // Load live DB categories and items
  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const [cats, items] = await Promise.all([
        getCategories(),
        getMenuItems()
      ]);
      setCategories(cats);
      setMenuItems(items);
    } catch (e) {
      console.error('Error loading menu:', e);
    } finally {
      setLoading(false);
    }
  };

  // Live lookup customer wallet balance from database
  useEffect(() => {
    if (customerPhone.trim().length >= 10) {
      getCustomerWallet(customerPhone.trim()).then((res) => {
        if (res && res.customer) {
          setCustomerName(res.customer.name);
          setWalletBalance(res.customer.wallet_balance);
        } else {
          setWalletBalance(null);
        }
      });
    } else {
      setWalletBalance(null);
    }
  }, [customerPhone]);

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, category_id: item.category_id }];
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
  const total = subtotal + gst;

  // Real Database Order Submission
  const handleCheckout = async () => {
    if (!cart.length) return;

    try {
      const orderData = {
        customerPhone: customerPhone || null,
        customerName: customerName || 'Walk-in Guest',
        serviceType,
        items: cart.map(i => ({ itemId: i.id, name: i.name, rate: i.price, quantity: i.quantity })),
        discountAmount: 0,
        paymentMethod,
        status: 'Completed'
      };

      const result = await createOrder(orderData);
      if (result.success) {
        setLastBilledOrder(result);
        setIsSuccess(true);
        setCart([]);
        if (paymentMethod === 'Wallet' && walletBalance !== null) {
          setWalletBalance(Math.max(0, walletBalance - total));
        }
        setTimeout(() => setIsSuccess(false), 3000);
      } else {
        alert(result.error || 'Failed to place order');
      }
    } catch (err: any) {
      alert('Error creating order: ' + err.message);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCat = activeCategoryId === 'All' || item.category_id === activeCategoryId;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex h-full w-full bg-[#F3F6F4] overflow-hidden">
      {/* Left/Middle: Compact POS Catalog */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-[#E2E8F0]">
        {/* Top Search & Cafeteria Mode Bar */}
        <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Quick search chai, coffee, buns, snacks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#2E7D32]"
            />
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['Takeaway', 'Dine In'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setServiceType(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
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

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 px-3 py-2 bg-white border-b border-slate-100 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveCategoryId('All')}
            className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              activeCategoryId === 'All'
                ? 'bg-[#2E7D32] text-white shadow-sm'
                : 'bg-emerald-50 text-[#1C3F32] hover:bg-emerald-100'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                activeCategoryId === cat.id
                  ? 'bg-[#2E7D32] text-white shadow-sm'
                  : 'bg-emerald-50 text-[#1C3F32] hover:bg-emerald-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Compact Items Grid (Reduced Size Cards) */}
        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => addToCart(item)}
              className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-xs hover:shadow-md hover:border-[#2E7D32] transition-all cursor-pointer flex flex-col justify-between group h-28"
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-xl">{item.image_emoji || '☕'}</span>
                <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {item.tag || 'Fresh'}
                </span>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xs leading-tight line-clamp-2 group-hover:text-[#2E7D32] transition-colors">
                  {item.name}
                </h4>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-100">
                  <span className="font-black text-slate-900 text-xs">₹{item.price}</span>
                  <span className="w-5 h-5 rounded bg-emerald-50 text-[#2E7D32] group-hover:bg-[#2E7D32] group-hover:text-white flex items-center justify-center transition-colors">
                    <Plus className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Counter Token Order & Wallet */}
      <div className="w-80 lg:w-96 bg-white flex flex-col h-full shadow-xl shrink-0">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-[#1C3F32] text-white">
          <div className="flex items-center space-x-2">
            <Coffee className="w-4 h-4 text-emerald-400" />
            <h3 className="font-extrabold text-white text-sm">Counter Token Billing</h3>
          </div>
          <span className="text-xs bg-emerald-500/30 text-emerald-200 font-bold px-2 py-0.5 rounded-full">
            {cart.reduce((a, b) => a + b.quantity, 0)} Items
          </span>
        </div>

        {/* Customer Wallet Quick Attach */}
        <div className="p-3 bg-emerald-50/40 border-b border-emerald-100">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
              <User className="w-3 h-3 text-emerald-700" /> Customer Phone
            </span>
            {walletBalance !== null ? (
              <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <WalletIcon className="w-3 h-3" /> Bal: ₹{walletBalance.toFixed(2)}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">Lookup for advance</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Mobile Number"
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
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Coffee className="w-10 h-10 mb-2 stroke-[1.5] text-slate-300" />
              <p className="text-xs font-semibold">Select items to bill.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex-1 pr-2">
                  <div className="font-bold text-slate-800 text-xs">{item.name}</div>
                  <span className="text-[10px] text-slate-500">₹{item.price} each</span>
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
                  <span className="font-extrabold text-xs text-slate-900 w-12 text-right">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Breakdown & Pay */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2">
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-slate-800">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST (5%)</span>
              <span className="font-bold text-slate-800">₹{gst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1 border-t border-slate-200">
              <span>Total Payable</span>
              <span className="text-[#1C3F32]">₹{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="pt-1">
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
                    className={`py-1.5 flex flex-col items-center justify-center rounded-xl border text-[11px] font-bold transition-all ${
                      isSelected
                        ? 'border-[#2E7D32] bg-emerald-50 text-[#2E7D32] shadow-sm font-extrabold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mb-0.5" />
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
            className={`w-full py-3 rounded-xl font-extrabold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md ${
              isSuccess
                ? 'bg-emerald-600 text-white'
                : !cart.length
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-[#1C3F32] hover:bg-[#142E25] text-white shadow-emerald-900/20'
            }`}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 animate-bounce" />
                <span>Billed {lastBilledOrder?.orderNumber}!</span>
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
