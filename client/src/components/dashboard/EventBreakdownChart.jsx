import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981'];

export default function EventBreakdownChart({ pageViews = 0, clicks = 0 }) {
  const total = pageViews + clicks;

  if (total === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
        <p className="text-sm font-medium">No events to breakdown</p>
      </div>
    );
  }

  const data = [
    { name: 'Page Views', value: pageViews },
    { name: 'Clicks', value: clicks },
  ];

  return (
    <div className="w-full h-72 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [
              `${value.toLocaleString()} (${Math.round((value / total) * 100)}%)`,
              'Events',
            ]}
            contentStyle={{
              backgroundColor: '#1e293b',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '12px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend below */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-slate-600 font-medium">Page Views:</span>
          <span className="font-bold text-slate-900">{pageViews.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-600 font-medium">Clicks:</span>
          <span className="font-bold text-slate-900">{clicks.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
