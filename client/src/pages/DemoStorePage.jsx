import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowRight,
  Star,
  CheckCircle2,
  Truck,
  Shield,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';
import DemoNavbar from '../components/demo/DemoNavbar';
import DemoTrackerBadge from '../components/demo/DemoTrackerBadge';

const FEATURED_PRODUCTS = [
  {
    id: 'prod-1',
    title: 'Aura Wireless Noise-Cancelling Headphones',
    category: 'Audio',
    price: 249.99,
    rating: 4.8,
    reviews: 142,
    image: '🎧',
  },
  {
    id: 'prod-2',
    title: 'Keychron Pro Mechanical Keyboard',
    category: 'Peripherals',
    price: 139.99,
    rating: 4.9,
    reviews: 89,
    image: '⌨️',
  },
  {
    id: 'prod-3',
    title: 'Precision Ergonomic Optical Mouse',
    category: 'Peripherals',
    price: 79.99,
    rating: 4.7,
    reviews: 210,
    image: '🖱️',
  },
];

export default function DemoStorePage() {
  const [cartCount, setCartCount] = useState(0);
  const [activeTab, setActiveTab] = useState('all');
  const [addedItem, setAddedItem] = useState(null);

  const handleAddToCart = (product) => {
    setCartCount((prev) => prev + 1);
    setAddedItem(product.title);
    setTimeout(() => setAddedItem(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Navbar */}
      <DemoNavbar cartCount={cartCount} />

      {/* Interactive Floating Tracker Badge */}
      <DemoTrackerBadge />

      {/* Testing Instructions Banner */}
      <div className="bg-blue-600 text-white px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 shrink-0 text-blue-200" />
            <span>
              <strong>Tracking SDK Active:</strong> Every click on buttons, links, and cards is captured with viewport coordinates and sent to <code>POST /api/events</code>.
            </span>
          </div>
          <Link
            to="/"
            id="banner-view-dashboard"
            className="shrink-0 bg-white text-blue-700 hover:bg-blue-50 font-bold px-3 py-1 rounded-md text-xs shadow-2xs transition-colors"
          >
            Open Analytics Dashboard →
          </Link>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Added to cart toast feedback */}
        {addedItem && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Added "{addedItem}" to your cart!</span>
            </div>
            <Link to="/demo/cart" id="btn-toast-view-cart" className="text-xs font-bold text-emerald-700 underline">
              View Cart
            </Link>
          </div>
        )}

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-8 sm:p-12 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Generation Workspace Gear</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Upgrade Your Setup With Precision Hardware.
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Explore high-performance peripherals engineered for productivity. Click anywhere to test the CausalFunnel analytics coordinate tracking.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/demo/products"
                id="btn-hero-shop-now"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <span>Shop Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                id="btn-hero-learn-more"
                onClick={() => setActiveTab('audio')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-5 py-3 rounded-xl border border-slate-700 transition-colors"
              >
                Browse Audio Gear
              </button>
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Featured Products</h2>
            <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-lg text-xs">
              {['all', 'Audio', 'Peripherals'].map((cat) => (
                <button
                  key={cat}
                  id={`tab-category-${cat.toLowerCase()}`}
                  onClick={() => setActiveTab(cat)}
                  className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                    activeTab === cat
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'all' ? 'All Gear' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_PRODUCTS.filter(
              (p) => activeTab === 'all' || p.category.toLowerCase() === activeTab.toLowerCase()
            ).map((product) => (
              <div
                key={product.id}
                id={`card-${product.id}`}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-36 bg-slate-100 rounded-lg flex items-center justify-center text-5xl mb-4">
                    {product.image}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold uppercase text-blue-600">{product.category}</span>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-bold text-slate-700">{product.rating}</span>
                      <span className="text-slate-400">({product.reviews})</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{product.title}</h3>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xl font-extrabold text-slate-900">${product.price}</div>
                  <button
                    id={`btn-add-cart-${product.id}`}
                    onClick={() => handleAddToCart(product)}
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-2xs transition-colors"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Value Proposition Section */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-6 border-t border-slate-200">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Free Express Shipping</h4>
              <p className="text-xs text-slate-500 mt-1">On orders over $50 with guaranteed next-day dispatch.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">2-Year Warranty</h4>
              <p className="text-xs text-slate-500 mt-1">Full replacement coverage on all premium electronics.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">30-Day Free Returns</h4>
              <p className="text-xs text-slate-500 mt-1">No questions asked return policy with prepaid labels.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
