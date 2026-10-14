import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';

import Sidebar from './components/common/Sidebar';
import OverviewPage from './pages/OverviewPage';
import SessionsPage from './pages/SessionsPage';
import UserJourneyPage from './pages/UserJourneyPage';
import HeatmapPage from './pages/HeatmapPage';
import DemoStorePage from './pages/DemoStorePage';
import DemoProductsPage from './pages/DemoProductsPage';
import DemoCartPage from './pages/DemoCartPage';
import NotFoundPage from './pages/NotFoundPage';

// Layout wrapper for analytics dashboard pages with sidebar
function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Analytics Dashboard Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/sessions/:sessionId" element={<UserJourneyPage />} />
        <Route path="/heatmap" element={<HeatmapPage />} />
      </Route>

      {/* Demo E-Commerce Store Routes (Independent experience with live tracking) */}
      <Route path="/demo" element={<DemoStorePage />} />
      <Route path="/demo/products" element={<DemoProductsPage />} />
      <Route path="/demo/cart" element={<DemoCartPage />} />

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
