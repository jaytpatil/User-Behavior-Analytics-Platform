import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import SessionsTable from '../components/sessions/SessionsTable';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { fetchSessions, fetchHealth } from '../services/api';

export default function SessionsPage() {
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  const loadSessions = async (page = 1, searchQuery = search, showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const [res, healthRes] = await Promise.all([
        fetchSessions({ page, limit: 10, search: searchQuery }),
        fetchHealth().catch(() => ({ success: false })),
      ]);

      if (res.success) {
        setSessions(res.data);
        setPagination(res.pagination || { page, limit: 10, total: res.data.length, totalPages: 1 });
      }
      setIsConnected(healthRes.success !== false);
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError('Unable to load visitor sessions. Please ensure the backend server is reachable.');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSessions(1, search);
  }, []);

  const handleSearchChange = (value) => {
    setSearch(value);
    loadSessions(1, value);
  };

  const handlePageChange = (newPage) => {
    loadSessions(newPage, search);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title="Visitor Sessions"
        subtitle="Individual browsing sessions with aggregated event metrics"
        onRefresh={() => loadSessions(pagination.page, search, true)}
        isRefreshing={isRefreshing}
        isConnected={isConnected}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {error ? (
          <ErrorState message={error} onRetry={() => loadSessions(1, search)} />
        ) : isLoading ? (
          <LoadingState message="Aggregating visitor sessions..." />
        ) : sessions.length === 0 && !search ? (
          <EmptyState
            title="No Sessions Recorded Yet"
            message="No active sessions found. Visit the demo store and navigate around to record your first session."
          />
        ) : (
          <SessionsTable
            sessions={sessions}
            pagination={pagination}
            onPageChange={handlePageChange}
            search={search}
            onSearchChange={handleSearchChange}
          />
        )}
      </main>
    </div>
  );
}
