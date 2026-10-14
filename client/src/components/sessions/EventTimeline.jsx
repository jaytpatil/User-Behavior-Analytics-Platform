import React from 'react';
import { Eye, MousePointerClick, Clock, Globe, Crosshair, Tag, Monitor } from 'lucide-react';
import { formatDate, formatDuration, formatUrlPath } from '../../utils/formatters';

export default function EventTimeline({ events = [], firstEventAt }) {
  if (!events || events.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 bg-white rounded-xl border border-slate-200">
        No events found in this session.
      </div>
    );
  }

  const startTime = firstEventAt ? new Date(firstEventAt).getTime() : new Date(events[0].timestamp).getTime();

  return (
    <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-6 my-4 ml-4 sm:ml-6">
      {events.map((evt, idx) => {
        const isClick = evt.event_type === 'click';
        const eventTime = new Date(evt.timestamp).getTime();
        const elapsedSec = Math.max(0, Math.round((eventTime - startTime) / 1000));

        return (
          <div key={evt.event_id || idx} className="relative group">
            {/* Timeline icon node */}
            <div
              className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                isClick ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white'
              }`}
            >
              {isClick ? (
                <MousePointerClick className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </div>

            {/* Event Content Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      isClick
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {evt.event_type === 'page_view' ? 'Page View' : 'Click Interaction'}
                  </span>
                  <span className="text-xs font-mono text-slate-400">#{idx + 1}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1 font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    <Clock className="w-3 h-3 text-slate-400" />
                    +{formatDuration(elapsedSec)}
                  </span>
                  <span>{formatDate(evt.timestamp)}</span>
                </div>
              </div>

              {/* Page URL and Title */}
              <div className="mb-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-700">URL:</span>
                  <a
                    href={evt.page_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline font-mono text-xs break-all"
                  >
                    {evt.page_url}
                  </a>
                </div>
                {evt.page_title && (
                  <div className="text-xs text-slate-500 italic pl-5">
                    "{evt.page_title}"
                  </div>
                )}
              </div>

              {/* Click Event Metadata */}
              {isClick && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/60 p-3 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Viewport Coordinates</span>
                    <span className="font-mono font-bold text-slate-800">
                      X: {evt.click_x}px, Y: {evt.click_y}px
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Viewport Dimensions</span>
                    <span className="font-mono text-slate-700">
                      {evt.viewport_width || '—'} × {evt.viewport_height || '—'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Element Tag</span>
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      &lt;{evt.element_tag || 'ELEMENT'}&gt;
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Element ID</span>
                    <span className="font-mono text-slate-700 truncate block">
                      {evt.element_id ? `#${evt.element_id}` : 'None'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
