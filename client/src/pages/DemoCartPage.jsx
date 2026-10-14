import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import DemoNavbar from '../components/demo/DemoNavbar';
import DemoTrackerBadge from '../components/demo/DemoTrackerBadge';

export default function DemoCartPage() {
  const [items, setItems] = useState([
    { id: 'cart-1', title: 'Aura Studio Wireless Headphones', price: 249.99, quantity: 1, image: '🎧' },
    { id: 'cart-2', title: 'Keychron Pro Mechanical Keyboard', price: 139.99, quantity: 1, image: '⌨️' },
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = promoApplied ? subtotal * 0.15 : 0;
  const shipping = subtotal > 100 ? 0 : 15.0;
  const total = subtotal - discount + shipping;

  const handleRemove = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleQuantity = (id, delta) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i))
    );
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().toUpperCase() === 'FUNNEL15' || promoCode.trim().length > 0) {
      setPromoApplied(true);
    }
  };

  const handleCheckout = () => {
    setCheckedOut(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      <DemoNavbar cartCount={items.reduce((acc, i) => acc + i.quantity, 0)} />
      <DemoTrackerBadge />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <Link
            to="/demo"
            id="btn-cart-back-shop"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        <h1 className="text-2xl font-extrabold text-slate-900">Your Shopping Cart</h1>

        {checkedOut ? (
          <div className="bg-white rounded-xl border border-emerald-200 p-8 text-center max-w-lg mx-auto shadow-sm space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Order Placed Successfully!</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your order conversion has been tracked by CausalFunnel Analytics. View the session timeline to see the full conversion funnel!
            </p>
            <div className="pt-2">
              <Link
                to="/"
                id="btn-order-view-dashboard"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition-colors"
              >
                <span>Check User Journey in Dashboard →</span>
              </Link>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 text-base">Your cart is empty</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">Explore our catalog and add items to your cart.</p>
            <Link
              to="/demo/products"
              id="btn-empty-cart-shop"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  id={`cart-item-${item.id}`}
                  className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-3xl shrink-0">
                      {item.image}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                      <div className="text-xs font-semibold text-slate-600 mt-1">
                        ${item.price.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 text-xs">
                      <button
                        id={`btn-qty-minus-${item.id}`}
                        onClick={() => handleQuantity(item.id, -1)}
                        className="px-2.5 py-1 hover:bg-slate-200 text-slate-700 font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-bold text-slate-900 bg-white">
                        {item.quantity}
                      </span>
                      <button
                        id={`btn-qty-plus-${item.id}`}
                        onClick={() => handleQuantity(item.id, 1)}
                        className="px-2.5 py-1 hover:bg-slate-200 text-slate-700 font-bold"
                      >
                        +
                      </button>
                    </div>

                    <button
                      id={`btn-remove-${item.id}`}
                      onClick={() => handleRemove(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Box */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4 h-fit">
              <h3 className="font-bold text-slate-900 text-base pb-3 border-b border-slate-100">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount (15%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-semibold text-slate-900">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="pt-3 border-t border-slate-100 flex justify-between text-sm font-bold text-slate-900">
                  <span>Total</span>
                  <span className="text-base text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Promo code */}
              <div className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="input-promo-code"
                    placeholder="Promo code (e.g. FUNNEL15)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    id="btn-apply-promo"
                    onClick={handleApplyPromo}
                    className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                id="btn-checkout-now"
                onClick={handleCheckout}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Complete Purchase</span>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
