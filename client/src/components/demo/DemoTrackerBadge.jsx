import React, { useState, useEffect } from 'react';
import { Activity, RefreshCw, ChevronUp, ChevronDown, CheckCircle2, ShieldCheck } from 'lucide-react';
import { truncateId } from '../../utils/formatters';

export default function DemoTrackerBadge() {
  const [sessionId, setSessionId] = useState('');
  const [lastEvent, setLastEvent] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Read session ID from tracker
    if (window.CausalFunnel) {
      setSessionId(window.CausalFunnel.getSessionId());

      // Register listener for live feedback
      const handleEvent = (type, data) => {
        setLastEvent({
          type,
          data,
          time: new Date().toLocaleTimeString(),
        });
      };

      window.CausalFunnel.addListener(handleEvent);
      return () => {
        if (window.CausalFunnel && window.CausalFunnel.removeListener) {
          window.CausalFunnel.removeListener(handleEvent);
        }
      };
    }
  }, []);

  const handleResetSession = () => {
    if (window.CausalFunnel) {
      const newId = window.CausalFunnel.resetSession();
      setSessionId(newId);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 overflow-hidden">
        {/* Header bar */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 bg-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-750 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold tracking-tight">SDK Tracking Active</span>
          </div>
          <button className="text-slate-400 hover:text-white">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {/* Expandable details */}
        {isOpen ? (
          <div className="p-4 space-y-3 text-xs bg-slate-900">
            <div>
              <div className="text-slate-400 text-[11px] uppercase font-semibold">Active Session</div>
              <div className="font-mono text-emerald-400 font-bold break-all bg-slate-950 p-1.5 rounded border border-slate-800 mt-1">
                {sessionId || 'Initializing...'}
              </div>
            </div>

            {lastEvent && (
              <div className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span className="font-semibold uppercase text-blue-400">
                    Latest: {lastEvent.type}
                  </span>
                  <span>{lastEvent.time}</span>
                </div>
                {lastEvent.type === 'click' ? (
                  <div className="font-mono text-[11px] text-slate-300">
                    Coords: ({lastEvent.data.click_x}, {lastEvent.data.click_y}) | Element: &lt;
                    {lastEvent.data.element_tag}&gt;
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-300 truncate">
                    {lastEvent.data.page_url}
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleResetSession}
                className="inline-flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Simulate New Session</span>
              </button>
              <span className="text-[10px] text-slate-500">30m timeout</span>
            </div>
          </div>
        ) : (
          <div className="px-3 py-2 text-[11px] text-slate-300 flex items-center justify-between gap-3">
            <span className="font-mono text-slate-400">{truncateId(sessionId)}</span>
            <span className="text-emerald-400 font-medium">Auto-capturing clicks</span>
          </div>
        )}
      </div>
    </div>
  );
}
