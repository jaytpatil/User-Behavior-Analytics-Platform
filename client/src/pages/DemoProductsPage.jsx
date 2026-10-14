import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, Filter, ArrowUpDown, CheckCircle2 } from 'lucide-react';
import DemoNavbar from '../components/demo/DemoNavbar';
import DemoTrackerBadge from '../components/demo/DemoTrackerBadge';

const CATALOG = [
  { id: 'cat-1', title: 'Aura Studio Wireless Headphones', category: 'Audio', price: 249.99, rating: 4.8, image: '🎧' },
  { id: 'cat-2', title: 'Keychron Pro Mechanical Keyboard', category: 'Peripherals', price: 139.99, rating: 4.9, image: '⌨️' },
  { id: 'cat-3', title: 'Precision Optical Gaming Mouse', category: 'Peripherals', price: 79.99, rating: 4.7, image: '🖱️' },
  { id: 'cat-4', title: 'UltraWide 34-Inch Curved Monitor', category: 'Displays', price: 499.99, rating: 4.9, image: '🖥️' },
  { id: 'cat-5', title: 'Studio USB Condenser Microphone', category: 'Audio', price: 119.99, rating: 4.6, image: '🎙️' },
  { id: 'cat-6', title: 'Thunderbolt 4 Multi-Port Dock', category: 'Peripherals', price: 189.99, rating: 4.8, image: '🔌' },
];

export default function DemoProductsPage() {
  const [cartCount, setCartCount] = useState(1);
  const [filter, setFilter] = useState('all');
  const [addedItem, setAddedItem] = useState(null);

  const handleAddToCart = (product) => {
    setCartCount((c) => c + 1);
    setAddedItem(product.title);
    setTimeout(() => setAddedItem(null), 2500);
  };

  const filteredProducts = CATALOG.filter(
    (p) => filter === 'all' || p.category.toLowerCase() === filter.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      <DemoNavbar cartCount={cartCount} />
      <DemoTrackerBadge />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Product Catalog</h1>
            <p className="text-xs text-slate-500 mt-1">Browse all high-precision workspace gear</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-white border border-slate-200 p-1 rounded-lg">
              <Filter className="w-3.5 h-3.5 text-slate-400 ml-1" />
              {['all', 'Audio', 'Peripherals', 'Displays'].map((c) => (
                <button
                  key={c}
                  id={`filter-cat-${c.toLowerCase()}`}
                  onClick={() => setFilter(c)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                    filter === c ? 'bg-blue-600 text-white' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  {c === 'all' ? 'All' : c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {addedItem && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Added "{addedItem}" to your cart!</span>
            </div>
            <Link to="/demo/cart" id="btn-products-view-cart" className="underline font-bold">
              Go to Cart →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              id={`card-${p.id}`}
              className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="w-full h-36 bg-slate-100 rounded-lg flex items-center justify-center text-5xl mb-4">
                  {p.image}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span className="font-semibold uppercase text-blue-600">{p.category}</span>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="font-bold text-slate-700">{p.rating}</span>
                  </div>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{p.title}</h3>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="text-xl font-extrabold text-slate-900">${p.price}</div>
                <button
                  id={`btn-add-cart-${p.id}`}
                  onClick={() => handleAddToCart(p)}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-2xs transition-colors"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
