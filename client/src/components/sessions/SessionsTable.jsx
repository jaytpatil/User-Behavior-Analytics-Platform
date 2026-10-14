import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Clock, ArrowRight, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { formatDate, formatRelativeTime, formatDuration, truncateId } from '../../utils/formatters';

export default function SessionsTable({
  sessions = [],
  pagination = {},
  onPageChange,
  search,
  onSearchChange,
}) {
  const [copiedId, setCopiedId] = React.useState(null);

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const { page = 1, totalPages = 1, total = 0, limit = 10 } = pagination;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Search and summary header */}
      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search by Session ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-xs"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Showing <span className="font-semibold text-slate-800">{sessions.length}</span> of{' '}
          <span className="font-semibold text-slate-800">{total}</span> total sessions
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Session ID</th>
              <th className="py-3 px-4">First Activity</th>
              <th className="py-3 px-4">Last Activity</th>
              <th className="py-3 px-4 text-center">Duration</th>
              <th className="py-3 px-4 text-center">Events</th>
              <th className="py-3 px-4 text-center">Page Views</th>
              <th className="py-3 px-4 text-center">Clicks</th>
              <th className="py-3 px-4 text-center">Unique Pages</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sessions.map((s) => (
              <tr key={s.session_id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4 font-mono text-xs">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded cursor-pointer"
                      title={s.session_id}
                    >
                      {truncateId(s.session_id)}
                    </span>
                    <button
                      onClick={() => handleCopy(s.session_id)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                      title="Copy full Session ID"
                    >
                      {copiedId === s.session_id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                  {formatDate(s.first_event_at)}
                </td>
                <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                  {formatRelativeTime(s.last_event_at)}
                </td>
                <td className="py-3.5 px-4 text-center text-xs text-slate-600 font-medium">
                  {formatDuration(s.duration_seconds)}
                </td>
                <td className="py-3.5 px-4 text-center font-bold text-slate-900 text-xs">
                  {s.total_events}
                </td>
                <td className="py-3.5 px-4 text-center text-xs">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold">
                    {s.page_views}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center text-xs">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                    {s.total_clicks}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center text-xs font-medium text-slate-700">
                  {s.unique_pages}
                </td>
                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                  <Link
                    to={`/sessions/${s.session_id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>View Journey</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-slate-50/50">
          <div>
            Page <span className="font-semibold text-slate-900">{page}</span> of{' '}
            <span className="font-semibold text-slate-900">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-slate-700 shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
