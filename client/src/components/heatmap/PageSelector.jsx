import React from 'react';
import { Globe, MousePointerClick, ChevronDown } from 'lucide-react';
import { formatUrlPath } from '../../utils/formatters';

export default function PageSelector({ pages = [], selectedUrl, onSelectPage, isLoading }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Globe className="w-5 h-5" />
        </div>
        <div>
          <label htmlFor="page-select" className="block text-xs font-semibold uppercase text-slate-500 tracking-wider">
            Select Tracked Page
          </label>
          <p className="text-xs text-slate-400">Choose a page URL to visualize click concentration</p>
        </div>
      </div>

      <div className="relative min-w-[280px] sm:min-w-[360px]">
        <select
          id="page-select"
          value={selectedUrl}
          onChange={(e) => onSelectPage(e.target.value)}
          disabled={isLoading || pages.length === 0}
          className="w-full appearance-none bg-slate-50 border border-slate-200 text-slate-800 text-xs font-mono font-medium rounded-lg px-3.5 py-2.5 pr-10 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer disabled:opacity-50"
        >
          {pages.length === 0 ? (
            <option value="">No tracked pages found</option>
          ) : (
            pages.map((p) => (
              <option key={p.url} value={p.url}>
                {formatUrlPath(p.url)} ({p.total_clicks} clicks)
              </option>
            ))
          )}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
}
