import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, LayoutDashboard, ArrowLeft } from 'lucide-react';

export default function DemoNavbar({ cartCount = 0 }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to="/demo" id="nav-demo-brand" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow">
              SF
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-slate-900 text-lg">ShopFlow</span>
              <span className="text-[10px] uppercase font-bold text-emerald-600 ml-1.5 px-1.5 py-0.5 bg-emerald-50 rounded">
                Demo
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/demo"
              end
              id="nav-demo-home"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-emerald-700 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/demo/products"
              id="nav-demo-products"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-emerald-700 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              Catalog
            </NavLink>
            <NavLink
              to="/demo/cart"
              id="nav-demo-cart-link"
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-emerald-700 bg-emerald-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              Cart
            </NavLink>
          </nav>
        </div>

        {/* Right action controls */}
        <div className="flex items-center gap-3">
          {/* Cart Icon */}
          <Link
            to="/demo/cart"
            id="btn-nav-cart"
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            title="View Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Back to Dashboard */}
          <Link
            to="/"
            id="btn-return-dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden sm:inline">Analytics Dashboard</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
