import React from 'react';
import { ExternalLink, Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatUrlPath } from '../../utils/formatters';

export default function TopPagesTable({ pages = [] }) {
  if (!pages || pages.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-slate-400">
        No tracked pages recorded yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <tr>
            <th className="py-3 px-4">Page Path</th>
            <th className="py-3 px-4 text-center">Page Views</th>
            <th className="py-3 px-4 text-center">Clicks</th>
            <th className="py-3 px-4 text-center">Total Events</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {pages.map((p, idx) => (
            <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
              <td className="py-3 px-4 font-medium text-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="truncate max-w-xs font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    {formatUrlPath(p.url)}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 text-center text-slate-600 font-medium">
                {p.views.toLocaleString()}
              </td>
              <td className="py-3 px-4 text-center text-slate-600 font-medium">
                {p.clicks.toLocaleString()}
              </td>
              <td className="py-3 px-4 text-center font-bold text-slate-900">
                {p.total.toLocaleString()}
              </td>
              <td className="py-3 px-4 text-right">
                <Link
                  to={`/heatmap?url=${encodeURIComponent(p.url)}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded transition-colors"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Heatmap</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
