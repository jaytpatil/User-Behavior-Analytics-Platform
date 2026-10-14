import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading analytics data...', minHeight = 'h-64' }) {
  return (
    <div className={`flex flex-col items-center justify-center ${minHeight} p-8 text-center`}>
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-600">{message}</p>
      <p className="text-xs text-slate-400 mt-1">Connecting to tracking engine...</p>
    </div>
  );
}
