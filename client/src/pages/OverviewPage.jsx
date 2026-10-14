import React, { useState, useEffect } from 'react';
import {
  Users,
  MousePointerClick,
  Eye,
  Layers,
  Globe,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import Header from '../components/common/Header';
import StatCard from '../components/common/StatCard';
import ActivityChart from '../components/dashboard/ActivityChart';
import EventBreakdownChart from '../components/dashboard/EventBreakdownChart';
import TopPagesTable from '../components/dashboard/TopPagesTable';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { fetchOverviewStats, fetchSessions, fetchHealth } from '../services/api';
import { formatDate, formatRelativeTime, truncateId } from '../utils/formatters';

export default function OverviewPage() {
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  const loadData = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      // Parallel fetch
      const [statsRes, sessionsRes, healthRes] = await Promise.all([
        fetchOverviewStats(),
        fetchSessions({ page: 1, limit: 5 }),
        fetchHealth().catch(() => ({ success: false })),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (sessionsRes.success) setRecentSessions(sessionsRes.data);
      setIsConnected(healthRes.success !== false);
    } catch (err) {
      console.error('Error loading dashboard overview:', err);
      setError('Unable to retrieve analytics data from backend. Please verify the server is running.');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title="Analytics Overview"
        subtitle="Real-time user behavior, click metrics, and session intelligence"
        onRefresh={() => loadData(true)}
        isRefreshing={isRefreshing}
        isConnected={isConnected}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {error ? (
          <ErrorState message={error} onRetry={() => loadData()} />
        ) : (
          <>
            {/* Top 5 Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
              <StatCard
                title="Total Sessions"
                value={stats?.total_sessions}
                icon={Users}
                description="Unique visitor sessions"
                isLoading={isLoading}
              />
              <StatCard
                title="Total Events"
                value={stats?.total_events}
                icon={Layers}
                description="All recorded interactions"
                isLoading={isLoading}
              />
              <StatCard
                title="Page Views"
                value={stats?.page_views}
                icon={Eye}
                badge={`${
                  stats?.total_events
                    ? Math.round(((stats?.page_views || 0) / stats.total_events) * 100)
                    : 0
                }%`}
                description="Total screens visited"
                isLoading={isLoading}
              />
              <StatCard
                title="Total Clicks"
                value={stats?.total_clicks}
                icon={MousePointerClick}
                badge={`${
                  stats?.total_events
                    ? Math.round(((stats?.total_clicks || 0) / stats.total_events) * 100)
                    : 0
                }%`}
                description="Viewport click events"
                isLoading={isLoading}
              />
              <StatCard
                title="Unique Pages"
                value={stats?.unique_pages}
                icon={Globe}
                description="Tracked URLs with activity"
                isLoading={isLoading}
              />
            </div>

            {/* Empty State when no events exist */}
            {!isLoading && stats?.total_events === 0 ? (
              <EmptyState
                title="No Events Recorded Yet"
                message="Start the demo store and click buttons to record real-time interactions, or run 'npm run seed' in the server to populate realistic sample data."
              />
            ) : (
              <>
                {/* Visual Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Activity over time chart (2 cols on large screen) */}
                  <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Interaction Timeline</h3>
                        <p className="text-xs text-slate-500">
                          Chronological distribution of page views and clicks
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Live Aggregation
                      </span>
                    </div>
                    <ActivityChart data={stats?.activityDistribution || []} />
                  </div>

                  {/* Event type donut breakdown */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-slate-900">Event Composition</h3>
                      <p className="text-xs text-slate-500">Page views vs user click events</p>
                    </div>
                    <EventBreakdownChart
                      pageViews={stats?.page_views || 0}
                      clicks={stats?.total_clicks || 0}
                    />
                  </div>
                </div>

                {/* Bottom Row: Top Pages & Recent Sessions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Pages */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Top Visited Pages</h3>
                        <p className="text-xs text-slate-500">Highest volume user destinations</p>
                      </div>
                      <Link
                        to="/heatmap"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <span>Heatmap</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                    <TopPagesTable pages={stats?.topPages || []} />
                  </div>

                  {/* Recent Sessions */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">Recent Sessions</h3>
                        <p className="text-xs text-slate-500">Latest active user journeys</p>
                      </div>
                      <Link
                        to="/sessions"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <span>View All</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {recentSessions.length === 0 ? (
                        <div className="py-8 text-center text-sm text-slate-400">
                          No sessions recorded yet.
                        </div>
                      ) : (
                        recentSessions.map((s) => (
                          <div
                            key={s.session_id}
                            className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg transition-colors"
                          >
                            <div>
                              <div className="font-mono text-xs font-bold text-slate-900">
                                {truncateId(s.session_id)}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {formatRelativeTime(s.last_event_at)} • {s.total_events} events •{' '}
                                {s.unique_pages} {s.unique_pages === 1 ? 'page' : 'pages'}
                              </div>
                            </div>
                            <Link
                              to={`/sessions/${s.session_id}`}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded transition-colors"
                            >
                              Journey →
                            </Link>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
