import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Layers,
  Eye,
  MousePointerClick,
  Globe,
  Copy,
  Check,
  Calendar,
} from 'lucide-react';

import Header from '../components/common/Header';
import EventTimeline from '../components/sessions/EventTimeline';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { fetchSessionEvents } from '../services/api';
import { formatDate, formatDuration, truncateId } from '../utils/formatters';

export default function UserJourneyPage() {
  const { sessionId } = useParams();
  const [sessionData, setSessionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadJourney = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetchSessionEvents(sessionId);
      if (res.success) {
        setSessionData(res);
      } else {
        setError(res.message || 'Session not found');
      }
    } catch (err) {
      console.error('Failed to load user journey:', err);
      if (err.response && err.response.status === 404) {
        setError(`Session '${sessionId}' was not found in the database.`);
      } else {
        setError('Error retrieving user journey from backend.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadJourney();
    }
  }, [sessionId]);

  const handleCopy = () => {
    if (sessionId) {
      navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const summary = sessionData?.summary;
  const events = sessionData?.data || [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title="User Journey Timeline"
        subtitle={`Chronological event history for session`}
        onRefresh={loadJourney}
        isRefreshing={isLoading}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
        {/* Back navigation button */}
        <div>
          <Link
            to="/sessions"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span>Back to Sessions</span>
          </Link>
        </div>

        {error ? (
          <ErrorState
            title="Session Not Found"
            message={error}
            onRetry={loadJourney}
          />
        ) : isLoading ? (
          <LoadingState message="Retrieving user journey chronology..." />
        ) : !summary ? (
          <EmptyState
            title="No Activity in Session"
            message="No events recorded for this session ID."
            actionText="Browse Sessions"
            actionLink="/sessions"
          />
        ) : (
          <>
            {/* Top Session Summary Header Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                    Session Identifier
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-base font-bold text-slate-900 break-all">
                      {sessionId}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="text-slate-400 hover:text-slate-700 transition-colors p-1"
                      title="Copy Session ID"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-500">
                  <div className="flex items-center gap-1 sm:justify-end">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Started: {formatDate(summary.first_event_at)}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Last active: {formatDate(summary.last_event_at)}
                  </div>
                </div>
              </div>

              {/* 4 Quick Stat Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Layers className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Total Events</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900">{summary.total_events}</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">Page Views</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900">{summary.page_views}</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <MousePointerClick className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium">Clicks</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900">{summary.total_clicks}</div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="font-medium">Session Duration</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900">
                    {formatDuration(summary.duration_seconds)}
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Chronological Timeline */}
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-4 px-1">
                Event Sequence ({events.length} chronological actions)
              </h2>
              <EventTimeline events={events} firstEventAt={summary.first_event_at} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
