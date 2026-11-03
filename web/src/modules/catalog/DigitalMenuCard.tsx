import React, { useState, useEffect } from 'react';
import { 
  Coffee, 
  Search, 
  ShoppingBag, 
  Plus, 
  Minus, 
  CheckCircle2, 
  ArrowRight, 
  User, 
  Wallet, 
  Sparkles, 
  X, 
  ChevronRight, 
  QrCode, 
  Phone, 
  Clock, 
  RefreshCw, 
  Flame, 
  ShieldCheck,
  Check,
  LogOut
} from 'lucide-react';
import { getCategories, getMenuItems, createOrder, getCustomerDetails, API_URL } from '../../services/api';
import chaiWalaLogoImg from '../../assets/chai-wala-logo.jpg';
import { playChime } from '../../utils/soundAlert';

interface CustomerProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  wallet_balance: number;
}

export const DigitalMenuCard: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<'all' | 'veg' | 'bestseller' | 'immunity' | 'budget'>('all');
  
  // Cart & checkout
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [serviceType, setServiceType] = useState<'Dine In' | 'Takeaway'>('Dine In');
  const [tableNumber, setTableNumber] = useState('Table T1');
  const [paymentRail, setPaymentRail] = useState<'Wallet' | 'UPI' | 'Cash'>('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Customer Auth & Wallet
  const [loggedInUser, setLoggedInUser] = useState<CustomerProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInput, setAuthInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Placed Order Tracking
  const [activeOrder, setActiveOrder] = useState<any | null>(null);
  const [kitchenStatus, setKitchenStatus] = useState<string>('In Service');

  // Load initial catalog & check persisted customer session
  useEffect(() => {
    Promise.all([getCategories(), getMenuItems()]).then(([cats, its]) => {
      setCategories(cats);
      setItems(its.filter((i: any) => i.is_available === 1));
    });

    const savedUser = localStorage.getItem('chaiwala_customer');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Refresh live balance from database
        getCustomerDetails(parsed.phone || parsed.id)
          .then((res) => {
            if (res && res.customer) {
              setLoggedInUser(res.customer);
              localStorage.setItem('chaiwala_customer', JSON.stringify(res.customer));
            } else {
              setLoggedInUser(parsed);
            }
          })
          .catch(() => setLoggedInUser(parsed));
      } catch (e) {}
    }
  }, []);

  // Listen for real-time status updates via SSE for the active placed order
  useEffect(() => {
    if (!activeOrder?.orderNumber) return;

    let es: EventSource | null = null;
    try {
      es = new EventSource(`${API_URL}/orders/live-stream`);
      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (
            data.type === 'order_status_update' && 
            (data.orderNumber === activeOrder.orderNumber || data.orderId === activeOrder.orderId)
          ) {
            setKitchenStatus(data.status);
            playChime();
          }
        } catch (err) {}
      };
    } catch (e) {}

    return () => {
      es?.close();
    };
  }, [activeOrder]);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!authInput.trim()) {
      setAuthError('Please enter phone number or email');
      return;
    }

    setIsAuthLoading(true);
    setAuthError('');
    try {
      const res = await getCustomerDetails(authInput.trim());
      if (res && res.customer) {
        setLoggedInUser(res.customer);
        localStorage.setItem('chaiwala_customer', JSON.stringify(res.customer));
        setIsAuthModalOpen(false);
        setAuthInput('');
        if (res.customer.wallet_balance > 0) {
          setPaymentRail('Wallet');
        }
      } else {
        setAuthError('No customer record found with this phone/email. Check with counter or place order as Guest.');
      }
    } catch (err: any) {
      setAuthError('Could not verify customer account. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleSignInDemo = async () => {
    // Quick demo login using primary admin/registered account
    setIsAuthLoading(true);
    try {
      const res = await getCustomerDetails('9876543210');
      if (res && res.customer) {
        setLoggedInUser(res.customer);
        localStorage.setItem('chaiwala_customer', JSON.stringify(res.customer));
        setIsAuthModalOpen(false);
        setPaymentRail('Wallet');
      }
    } catch (e) {
      setAuthError('Failed to sign in with Google demo profile.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    localStorage.removeItem('chaiwala_customer');
    if (paymentRail === 'Wallet') setPaymentRail('UPI');
  };

  // Cart operations
  const addToCart = (it: any) => {
    setCart((prev) => {
      const exist = prev.find(i => i.id === it.id);
      if (exist) return prev.map(i => i.id === it.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...it, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map(i => {
      if (i.id === id) {
        const q = i.qty + delta;
        return q > 0 ? { ...i, qty: q } : null;
      }
      return i;
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
  const gstAmount = Math.round(subtotal * 0.05 * 100) / 100;
  const totalAmount = Math.round((subtotal + gstAmount) * 100) / 100;
  const totalItemsCount = cart.reduce((acc, i) => acc + i.qty, 0);

  // Dynamic UPI URL for direct payments & QR
  const upiPayUrl = `upi://pay?pa=chaiwalaoriginal@upi&pn=Chai%20Wala%20Original&am=${totalAmount}&cu=INR&tn=Table%20Order`;
  const upiQrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiPayUrl)}`;

  const handlePlaceOrder = async () => {
    if (!cart.length) return;

    if (paymentRail === 'Wallet') {
      if (!loggedInUser) {
        setIsAuthModalOpen(true);
        return;
      }
      if (loggedInUser.wallet_balance < totalAmount) {
        alert(`Insufficient advance wallet balance (₹${loggedInUser.wallet_balance}). Please pay via UPI or at the counter.`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const orderRef = serviceType === 'Dine In' ? tableNumber : 'Counter Takeaway';
      const payload = {
        customerPhone: loggedInUser?.phone || (authInput ? authInput : '9999900000'),
        customerName: loggedInUser?.name || 'Table Guest',
        serviceType,
        details: orderRef,
        items: cart.map(i => ({ itemId: i.id, name: i.name, rate: i.price, quantity: i.qty })),
        paymentMethod: paymentRail,
        status: 'In Service'
      };

      const res = await createOrder(payload);
      if (res.success) {
        setActiveOrder({
          orderNumber: res.orderNumber,
          orderId: res.orderId,
          amount: totalAmount,
          serviceType,
          details: orderRef,
          items: [...cart],
          paymentRail
        });
        setKitchenStatus('In Service');
        setCart([]);
        setIsCartOpen(false);
        playChime();

        // Refresh logged in user wallet balance
        if (loggedInUser) {
          const refreshed = await getCustomerDetails(loggedInUser.phone);
          if (refreshed?.customer) {
            setLoggedInUser(refreshed.customer);
            localStorage.setItem('chaiwala_customer', JSON.stringify(refreshed.customer));
          }
        }
      } else {
        alert(res.error || 'Failed to place order.');
      }
    } catch (err: any) {
      alert('Error placing order: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter items based on category, search text, and tags
  const filteredItems = items.filter((item) => {
    const matchesCat = activeCat === 'All' || item.category_id === activeCat;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesTag = true;
    if (selectedTagFilter === 'veg') matchesTag = item.is_veg === 1;
    if (selectedTagFilter === 'bestseller') matchesTag = item.tag?.toLowerCase().includes('bestseller') || item.tag?.toLowerCase().includes('special');
    if (selectedTagFilter === 'immunity') matchesTag = item.tag?.toLowerCase().includes('immunity') || item.tag?.toLowerCase().includes('antioxidant');
    if (selectedTagFilter === 'budget') matchesTag = item.price <= 50;

    return matchesCat && matchesSearch && matchesTag;
  });

  return (
    <div className="min-h-screen bg-[#FDFCF7] text-[#2C241E] font-sans antialiased selection:bg-[#E8D8B8]">
      {/* 1. Luxurious Cafe Header */}
      <header className="bg-[#1C3F32] text-white shadow-xl sticky top-0 z-40 border-b border-[#2D5A48]">
        {/* Top Announcement & Customer Wallet Strip */}
        <div className="bg-[#142E25] px-4 py-1.5 text-[11px] font-semibold text-emerald-100 flex items-center justify-between border-b border-emerald-900/50">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Chai Wala Original • Table Ordering Active</span>
          </div>

          {loggedInUser ? (
            <div className="flex items-center space-x-2">
              <span className="text-emerald-300 flex items-center space-x-1">
                <Wallet className="w-3.5 h-3.5" />
                <span className="font-extrabold text-white">₹{loggedInUser.wallet_balance.toFixed(2)}</span>
                <span className="hidden sm:inline text-emerald-200">Balance</span>
              </span>
              <span className="text-emerald-500">|</span>
              <span className="font-bold truncate max-w-[100px]">{loggedInUser.name}</span>
              <button onClick={handleLogout} title="Sign Out" className="text-emerald-300 hover:text-white">
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-amber-200 hover:text-white flex items-center space-x-1 font-bold underline decoration-amber-400/50 hover:decoration-white"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Have Advance Wallet? Sign In</span>
            </button>
          )}
        </div>

        {/* Brand Banner */}
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src={chaiWalaLogoImg} 
              alt="Chai Wala Original" 
              className="h-12 w-12 rounded-2xl object-cover bg-white p-0.5 border border-amber-300/30 shadow-md"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif font-black text-lg tracking-wider text-amber-100 uppercase">
                  CHAI WALA
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#1C3F32] bg-amber-300 px-1.5 py-0.5 rounded">
                  Original
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 font-medium italic">
                India's Favourite • Authentic Dum Chai &amp; Fresh Buns
              </p>
            </div>
          </div>

          {/* Cart Icon Pill */}
          {cart.length > 0 && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-[#1C3F32] font-black px-3.5 py-2 rounded-2xl shadow-lg flex items-center space-x-2 text-xs transition-transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{totalItemsCount}</span>
              <span className="hidden sm:inline">• ₹{totalAmount.toFixed(0)}</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Placed Order Live Status Tracker (Shown after order placement) */}
      {activeOrder ? (
        <main className="max-w-md mx-auto p-4 pt-6 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-xl border-2 border-emerald-500/20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 via-amber-400 to-[#1C3F32]" />
            
            <div className="w-14 h-14 bg-emerald-50 text-[#1C3F32] rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-emerald-200 shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-pulse" />
            </div>

            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Digital Token</span>
            <h2 className="text-3xl font-black text-[#1C3F32] mt-0.5 tracking-tight">
              {activeOrder.orderNumber}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {activeOrder.serviceType} • <span className="font-bold text-slate-700">{activeOrder.details}</span>
            </p>

            {/* Live Kitchen Status Progress Bar */}
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="text-xs font-extrabold text-slate-700 mb-3 flex items-center justify-between">
                <span>Live Kitchen Status</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  kitchenStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                }`}>
                  {kitchenStatus === 'Completed' ? 'Ready for Pickup / Served' : 'Brewing & Preparing'}
                </span>
              </div>

              {/* 3-Step Timeline */}
              <div className="grid grid-cols-3 gap-2 relative">
                {/* Step 1 */}
                <div className="text-center space-y-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto text-xs font-bold shadow">
                    ✓
                  </div>
                  <div className="text-[10px] font-bold text-slate-800">Received</div>
                </div>

                {/* Step 2 */}
                <div className="text-center space-y-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold shadow ${
                    kitchenStatus !== 'Cancelled' ? 'bg-[#1C3F32] text-white animate-bounce' : 'bg-slate-200 text-slate-400'
                  }`}>
                    ☕
                  </div>
                  <div className="text-[10px] font-bold text-slate-800">Brewing</div>
                </div>

                {/* Step 3 */}
                <div className="text-center space-y-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold shadow ${
                    kitchenStatus === 'Completed' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400 border'
                  }`}>
                    🍽️
                  </div>
                  <div className="text-[10px] font-bold text-slate-800">Served</div>
                </div>
              </div>
            </div>

            {/* Ordered Items Breakdown */}
            <div className="mt-6 bg-[#FDFCF7] p-4 rounded-2xl border border-amber-200/60 text-left space-y-2">
              <div className="text-[11px] font-black text-amber-900 uppercase tracking-wider">Items in Order</div>
              {activeOrder.items.map((it: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <span className="text-slate-800 font-semibold">{it.qty} × {it.name}</span>
                  <span className="font-bold text-slate-900">₹{(it.price * it.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-amber-200/60 flex justify-between items-center text-sm font-extrabold text-[#1C3F32]">
                <span>Total Paid ({activeOrder.paymentRail})</span>
                <span>₹{activeOrder.amount.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveOrder(null)}
              className="mt-6 w-full py-3 bg-[#1C3F32] hover:bg-[#142E25] text-white text-xs font-bold rounded-2xl shadow-lg transition-transform active:scale-95"
            >
              Order More Items
            </button>
          </div>
        </main>
      ) : (
        /* 3. Main Digital Menu Content */
        <main className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-28">
          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Irani Chai, Bun Maska, Samosa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5DECF] rounded-2xl text-xs font-semibold placeholder-[#A89887] text-[#2C241E] focus:outline-none focus:border-[#1C3F32] shadow-xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Dietary & Highlight Filters */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {[
              { id: 'all', label: 'All Specials' },
              { id: 'veg', label: '🌱 Pure Veg' },
              { id: 'bestseller', label: '🔥 Bestsellers' },
              { id: 'immunity', label: '🌿 Immunity Booster' },
              { id: 'budget', label: '⚡ Under ₹50' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedTagFilter(f.id as any)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                  selectedTagFilter === f.id
                    ? 'bg-[#1C3F32] text-white shadow-sm'
                    : 'bg-white text-[#5C4D3C] border border-[#E5DECF] hover:bg-amber-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center space-x-2 overflow-x-auto py-1 border-b border-[#EADFCB]">
            <button
              onClick={() => setActiveCat('All')}
              className={`pb-2 text-xs font-extrabold whitespace-nowrap border-b-2 transition-all ${
                activeCat === 'All'
                  ? 'border-[#1C3F32] text-[#1C3F32]'
                  : 'border-transparent text-[#8C7A6B] hover:text-[#2C241E]'
              }`}
            >
              All Items ({items.length})
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`pb-2 text-xs font-extrabold whitespace-nowrap border-b-2 transition-all ${
                  activeCat === c.id
                    ? 'border-[#1C3F32] text-[#1C3F32]'
                    : 'border-transparent text-[#8C7A6B] hover:text-[#2C241E]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Items Menu Listing with Traditional Editorial Aesthetics */}
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const inCart = cart.find(i => i.id === item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-[#E8DFD1] shadow-xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left: Dish Info */}
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        {/* Veg / Non-Veg Indicator */}
                        <span className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                          item.is_veg === 1 ? 'border-emerald-600' : 'border-red-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            item.is_veg === 1 ? 'bg-emerald-600' : 'bg-red-600'
                          }`} />
                        </span>

                        <h3 className="font-serif font-black text-sm tracking-wide text-[#1C3F32] uppercase group-hover:text-amber-800 transition-colors">
                          {item.name}
                        </h3>

                        {item.tag && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/60">
                            {item.tag}
                          </span>
                        )}
                      </div>

                      {/* Culinary Description */}
                      {item.description && (
                        <p className="text-[11px] text-[#7A6B5D] leading-relaxed line-clamp-2 italic font-serif">
                          "{item.description}"
                        </p>
                      )}

                      <div className="pt-1 flex items-center space-x-2">
                        <span className="text-base font-black text-[#1C3F32]">
                          ₹{item.price.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">GST inc</span>
                      </div>
                    </div>

                    {/* Right: Dish Photo/Emoji and Add Controller */}
                    <div className="flex flex-col items-end space-y-2 shrink-0">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name} 
                          className="w-16 h-16 rounded-xl object-cover border border-[#E5DECF] shadow-xs" 
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-amber-50/80 border border-amber-200/50 flex items-center justify-center text-2xl shadow-xs">
                          {item.image_emoji || '☕'}
                        </div>
                      )}

                      {/* Add Button or Quantity Controller */}
                      {inCart ? (
                        <div className="flex items-center bg-[#1C3F32] text-white rounded-xl shadow-xs px-1.5 py-1 space-x-2 text-xs font-extrabold">
                          <button 
                            onClick={() => updateQty(item.id, -1)} 
                            className="p-1 hover:text-amber-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span>{inCart.qty}</span>
                          <button 
                            onClick={() => updateQty(item.id, 1)} 
                            className="p-1 hover:text-amber-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="px-3.5 py-1.5 bg-amber-50 hover:bg-[#1C3F32] text-[#1C3F32] hover:text-white border border-amber-300 rounded-xl text-xs font-extrabold transition-all shadow-2xs flex items-center space-x-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>ADD</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredItems.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center space-y-2 border border-[#E8DFD1]">
                <Coffee className="w-10 h-10 text-amber-300 mx-auto" />
                <h4 className="font-serif font-bold text-sm text-[#5C4D3C]">No matching items found</h4>
                <p className="text-xs text-slate-400">Try clearing your search or filter tags.</p>
              </div>
            )}
          </div>
        </main>
      )}

      {/* 4. Bottom Sticky Cart Drawer Bar */}
      {cart.length > 0 && !activeOrder && (
        <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto bg-white border-t border-[#E5DECF] p-3 shadow-2xl z-30 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-500">
              {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in order
            </div>
            <div className="text-base font-black text-[#1C3F32]">
              ₹{totalAmount.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">(inc GST)</span>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(true)}
            className="px-6 py-2.5 bg-[#1C3F32] hover:bg-[#142E25] text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center space-x-2 transition-transform active:scale-95"
          >
            <span>Review Order &amp; Pay</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      )}

      {/* 5. Comprehensive Checkout & Multi-Rail Payment Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-[#1C3F32]" />
                <h3 className="font-serif font-black text-base text-[#1C3F32]">Review Order</h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Service Mode & Table Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700">Dining Mode &amp; Table</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setServiceType('Dine In')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    serviceType === 'Dine In'
                      ? 'bg-[#1C3F32] text-white border-[#1C3F32] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  🍽️ Dine In Table
                </button>
                <button
                  onClick={() => setServiceType('Takeaway')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    serviceType === 'Takeaway'
                      ? 'bg-[#1C3F32] text-white border-[#1C3F32] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  🥡 Counter Takeaway
                </button>
              </div>

              {serviceType === 'Dine In' && (
                <div className="grid grid-cols-6 gap-1.5 pt-1">
                  {['Table T1', 'Table T2', 'Table T3', 'Table T4', 'Table T5', 'Table T6'].map((tbl) => (
                    <button
                      key={tbl}
                      onClick={() => setTableNumber(tbl)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        tableNumber === tbl 
                          ? 'bg-amber-400 text-[#1C3F32] border-amber-500 font-black' 
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {tbl.replace('Table ', '')}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart.map((it) => (
                <div key={it.id} className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{it.name}</div>
                    <div className="text-[11px] text-slate-400">₹{it.price} each</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center border border-slate-200 rounded-lg">
                      <button onClick={() => updateQty(it.id, -1)} className="px-2 py-0.5 text-slate-500 hover:text-black font-bold">-</button>
                      <span className="px-1.5 font-bold text-slate-800">{it.qty}</span>
                      <button onClick={() => updateQty(it.id, 1)} className="px-2 py-0.5 text-slate-500 hover:text-black font-bold">+</button>
                    </div>
                    <span className="font-bold text-slate-900 w-14 text-right">₹{(it.price * it.qty).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bill Summary */}
            <div className="p-3 bg-slate-50 rounded-2xl space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>₹{gstAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#1C3F32] pt-1 border-t border-slate-200">
                <span>Total Payable</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-slate-700">Choose Payment Rail</label>
              <div className="grid grid-cols-3 gap-2">
                {/* 1. Wallet Rail */}
                <button
                  onClick={() => {
                    if (!loggedInUser) setIsAuthModalOpen(true);
                    else setPaymentRail('Wallet');
                  }}
                  className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentRail === 'Wallet'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    {loggedInUser && <Check className="w-3 h-3 text-emerald-600" />}
                  </div>
                  <div className="mt-1">
                    <div className="text-[11px] font-black">Chai Wallet</div>
                    <div className="text-[10px] text-emerald-700 font-bold">
                      {loggedInUser ? `₹${loggedInUser.wallet_balance.toFixed(0)} bal` : 'Sign in'}
                    </div>
                  </div>
                </button>

                {/* 2. Direct UPI Rail */}
                <button
                  onClick={() => setPaymentRail('UPI')}
                  className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentRail === 'UPI'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <QrCode className="w-4 h-4 text-emerald-700" />
                  <div className="mt-1">
                    <div className="text-[11px] font-black">UPI &amp; Apps</div>
                    <div className="text-[10px] text-slate-500">GPay/PhonePe</div>
                  </div>
                </button>

                {/* 3. Cash At Counter */}
                <button
                  onClick={() => setPaymentRail('Cash')}
                  className={`p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    paymentRail === 'Cash'
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-900 ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  <Coffee className="w-4 h-4 text-slate-700" />
                  <div className="mt-1">
                    <div className="text-[11px] font-black">At Counter</div>
                    <div className="text-[10px] text-slate-500">Pay on pickup</div>
                  </div>
                </button>
              </div>

              {/* UPI Instant Mobile Deep Links & QR */}
              {paymentRail === 'UPI' && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <div className="text-xs font-bold text-emerald-900">
                    Scan or Pay via any UPI App
                  </div>

                  <div className="flex justify-center py-1">
                    <img 
                      src={upiQrImgUrl} 
                      alt="UPI QR Code" 
                      className="w-32 h-32 rounded-xl border border-emerald-200 shadow-xs bg-white p-1"
                    />
                  </div>

                  {/* Mobile Deep Link Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <a
                      href={upiPayUrl}
                      className="py-1.5 px-2 bg-white hover:bg-slate-50 border border-emerald-300 rounded-lg text-[11px] font-bold text-slate-800 shadow-2xs"
                    >
                      Google Pay
                    </a>
                    <a
                      href={upiPayUrl}
                      className="py-1.5 px-2 bg-white hover:bg-slate-50 border border-emerald-300 rounded-lg text-[11px] font-bold text-slate-800 shadow-2xs"
                    >
                      PhonePe
                    </a>
                    <a
                      href={upiPayUrl}
                      className="py-1.5 px-2 bg-white hover:bg-slate-50 border border-emerald-300 rounded-lg text-[11px] font-bold text-slate-800 shadow-2xs"
                    >
                      Paytm
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm & Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#1C3F32] hover:bg-[#142E25] disabled:bg-slate-400 text-white font-black text-sm rounded-2xl shadow-xl flex items-center justify-center space-x-2 transition-transform active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order &amp; Generate Token</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 6. Customer Sign-In & Live Wallet Detection Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wallet className="w-5 h-5 text-amber-600" />
                <h3 className="font-serif font-black text-base text-[#1C3F32]">Customer Wallet</h3>
              </div>
              <button onClick={() => setIsAuthModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Sign in with your registered phone or Google account to access your live advance wallet balance for 1-click token checkout.
            </p>

            {/* Google One-Tap Demo Sign In */}
            <button
              onClick={handleGoogleSignInDemo}
              disabled={isAuthLoading}
              className="w-full py-2.5 px-4 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center space-x-2 shadow-2xs transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center my-3">
              <div className="flex-1 border-t border-slate-200" />
              <span className="px-3 text-[10px] font-bold text-slate-400 uppercase">OR WITH PHONE</span>
              <div className="flex-1 border-t border-slate-200" />
            </div>

            {/* Phone/Email Form */}
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Mobile Number / Customer Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. 9876543210"
                    value={authInput}
                    onChange={(e) => setAuthInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#1C3F32]"
                  />
                </div>
              </div>

              {authError && (
                <p className="text-xs text-red-600 font-semibold">{authError}</p>
              )}

              <button
                type="submit"
                disabled={isAuthLoading}
                className="w-full py-2.5 bg-[#1C3F32] hover:bg-[#142E25] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1"
              >
                {isAuthLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Verify &amp; Link Wallet</span>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
