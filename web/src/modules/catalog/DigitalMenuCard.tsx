import React, { useState, useEffect } from 'react';
import { Coffee, ShoppingBag, Plus, Minus, CheckCircle2, ArrowRight } from 'lucide-react';
import { getCategories, getMenuItems, createOrder } from '../../services/api';
import chaiWalaLogoImg from '../../assets/chai-wala-logo.jpg';

export const DigitalMenuCard: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState('All');
  const [cart, setCart] = useState<any[]>([]);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('Table 1');
  const [isOrdered, setIsOrdered] = useState(false);
  const [orderNum, setOrderNum] = useState('');

  useEffect(() => {
    Promise.all([getCategories(), getMenuItems()]).then(([cats, its]) => {
      setCategories(cats);
      setItems(its.filter((i: any) => i.is_available === 1));
    });
  }, []);

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

  const total = cart.reduce((acc, i) => acc + (i.price * i.qty * 1.05), 0);

  const handlePlaceOrder = async () => {
    if (!cart.length || !customerPhone) {
      alert('Please enter your phone number to place order.');
      return;
    }

    const payload = {
      customerPhone,
      customerName: customerName || 'QR Guest',
      serviceType: 'Dine In',
      items: cart.map(i => ({ itemId: i.id, name: i.name, rate: i.price, quantity: i.qty })),
      paymentMethod: 'UPI',
      status: 'In Service'
    };

    const res = await createOrder(payload);
    if (res.success) {
      setOrderNum(res.orderNumber);
      setIsOrdered(true);
      setCart([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F4] text-slate-800 pb-24">
      {/* Top Banner */}
      <div className="bg-[#1C3F32] text-white p-4 text-center sticky top-0 z-30 shadow-md">
        <img src={chaiWalaLogoImg} alt="Chai Wala" className="h-10 mx-auto object-contain bg-white px-3 py-1 rounded-xl mb-1.5" />
        <h1 className="text-base font-extrabold">Digital Menu Card &amp; Table Order</h1>
        <p className="text-[11px] text-emerald-200">Fresh Dum Chai, Buns &amp; Hot Snacks</p>
      </div>

      {isOrdered ? (
        <div className="max-w-md mx-auto p-6 mt-8 bg-white rounded-3xl shadow-lg text-center space-y-3">
          <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
          <h2 className="text-xl font-black text-slate-900">Order Placed Successfully!</h2>
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-800 font-extrabold text-lg">
            Token {orderNum}
          </div>
          <p className="text-xs text-slate-500">
            Please collect your fresh order at the counter or our staff will serve you shortly.
          </p>
          <button 
            onClick={() => setIsOrdered(false)} 
            className="px-6 py-2.5 rounded-xl bg-[#1C3F32] text-white text-xs font-bold"
          >
            Order More Items
          </button>
        </div>
      ) : (
        <div className="max-w-md mx-auto p-3 space-y-3">
          {/* Categories */}
          <div className="flex space-x-1.5 overflow-x-auto py-2">
            <button
              onClick={() => setActiveCat('All')}
              className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                activeCat === 'All' ? 'bg-[#1C3F32] text-white' : 'bg-white text-slate-700'
              }`}
            >
              All Items
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                  activeCat === c.id ? 'bg-[#1C3F32] text-white' : 'bg-white text-slate-700'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="space-y-2">
            {items
              .filter(i => activeCat === 'All' || i.category_id === activeCat)
              .map((it) => (
                <div key={it.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{it.image_emoji || '☕'}</span>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">{it.name}</h4>
                      <div className="flex items-center space-x-2 mt-0.5">
                        <span className="font-black text-xs text-slate-900">₹{it.price}</span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                          {it.tag}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(it)}
                    className="px-3 py-1 bg-emerald-50 text-[#1C3F32] hover:bg-[#1C3F32] hover:text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    + Add
                  </button>
                </div>
              ))}
          </div>

          {/* Cart Floating Drawer */}
          {cart.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-200 p-4 shadow-2xl rounded-t-3xl z-40 space-y-2.5">
              <div className="flex justify-between items-center text-xs font-bold">
                <span>{cart.reduce((a, b) => a + b.qty, 0)} Items in Cart</span>
                <span className="text-sm font-black text-[#1C3F32]">₹{total.toFixed(2)} (inc GST)</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Your Mobile *"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold"
                />
                <input
                  type="text"
                  placeholder="Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold"
                />
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full py-3 bg-[#1C3F32] text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Place Order &amp; Generate Token</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
