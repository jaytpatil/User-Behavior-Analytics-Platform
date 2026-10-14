import React, { useRef, useEffect, useState } from 'react';
import {
  Flame,
  Crosshair,
  Filter,
  Info,
  Maximize2,
  Sliders,
  Layers,
  ZoomIn,
} from 'lucide-react';
import {
  REFERENCE_CANVAS,
  drawCoordinatePlot,
  drawHeatmapOverlay,
  normalizeCoordinate,
} from '../../utils/heatmapUtils';
import { formatDate } from '../../utils/formatters';

export default function HeatmapCanvas({
  clicks = [],
  viewports = [],
  totalClicks = 0,
  pageUrl = '',
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const [mode, setMode] = useState('heatmap'); // 'heatmap' or 'scatter'
  const [selectedViewport, setSelectedViewport] = useState('all');
  const [hoveredClick, setHoveredClick] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [intensityRadius, setIntensityRadius] = useState(28);

  const canvasWidth = REFERENCE_CANVAS.width;
  const canvasHeight = REFERENCE_CANVAS.height;

  // Filter clicks if a specific viewport is selected
  const activeClicks = clicks.filter((c) => {
    if (selectedViewport === 'all') return true;
    const key = `${c.viewport_width || 1440}x${c.viewport_height || 900}`;
    return key === selectedViewport;
  });

  // Re-draw canvas whenever mode, clicks, or viewport changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (mode === 'scatter') {
      drawCoordinatePlot(canvas, activeClicks, {
        dotRadius: 6,
        filterViewport: selectedViewport,
      });
    } else {
      drawHeatmapOverlay(canvas, activeClicks, {
        radius: intensityRadius,
        filterViewport: selectedViewport,
      });
    }
  }, [mode, activeClicks, selectedViewport, intensityRadius]);

  // Handle canvas mousemove for tooltips
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });

    // Find closest click within hit radius
    const hitRadius = 15;
    let found = null;

    for (const click of activeClicks) {
      const pt = normalizeCoordinate(
        click.click_x,
        click.click_y,
        click.viewport_width,
        click.viewport_height,
        canvas.width,
        canvas.height
      );
      const dist = Math.hypot(pt.x - mouseX, pt.y - mouseY);
      if (dist <= hitRadius) {
        found = click;
        break;
      }
    }

    setHoveredClick(found);
  };

  const handleMouseLeave = () => {
    setHoveredClick(null);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Heatmap Toolbar Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
        {/* Mode Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Visualization Mode:
          </span>
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
            <button
              onClick={() => setMode('heatmap')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                mode === 'heatmap'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Heatmap Overlay</span>
            </button>
            <button
              onClick={() => setMode('scatter')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                mode === 'scatter'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5 text-blue-400" />
              <span>Coordinate Plot</span>
            </button>
          </div>
        </div>

        {/* Viewport Filter Dropdown */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Viewport:</span>
            <select
              value={selectedViewport}
              onChange={(e) => setSelectedViewport(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Viewports (Normalized)</option>
              {viewports.map((v, i) => (
                <option key={i} value={`${v.width}x${v.height}`}>
                  {v.width} × {v.height} ({v.count} clicks)
                </option>
              ))}
            </select>
          </div>

          {/* Radius/Intensity Slider (for Heatmap mode) */}
          {mode === 'heatmap' && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-600 pl-3 border-l border-slate-200">
              <Sliders className="w-3.5 h-3.5 text-slate-400" />
              <span>Radius:</span>
              <input
                type="range"
                min="16"
                max="48"
                value={intensityRadius}
                onChange={(e) => setIntensityRadius(Number(e.target.value))}
                className="w-20 accent-blue-600 cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Container with Page Wireframe Background */}
      <div className="p-4 sm:p-6 bg-slate-900/5 overflow-x-auto flex justify-center">
        <div
          ref={containerRef}
          className="relative rounded-lg shadow-md border border-slate-300 bg-white overflow-hidden select-none"
          style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px`, minWidth: `${canvasWidth}px` }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Representative Wireframe Layout of Sample Page */}
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {/* Header wireframe */}
            <div className="h-14 border-b border-slate-200 px-6 flex items-center justify-between bg-slate-50">
              <div className="w-28 h-5 bg-slate-300 rounded"></div>
              <div className="flex gap-4">
                <div className="w-16 h-3 bg-slate-200 rounded"></div>
                <div className="w-16 h-3 bg-slate-200 rounded"></div>
                <div className="w-16 h-3 bg-slate-200 rounded"></div>
              </div>
            </div>

            {/* Hero banner wireframe */}
            <div className="m-6 p-8 bg-slate-100 rounded-xl border border-slate-200 flex flex-col justify-center">
              <div className="w-64 h-7 bg-slate-300 rounded mb-3"></div>
              <div className="w-96 h-4 bg-slate-200 rounded mb-4"></div>
              <div className="flex gap-3">
                <div className="w-28 h-9 bg-blue-400/50 rounded-lg"></div>
                <div className="w-28 h-9 bg-slate-300 rounded-lg"></div>
              </div>
            </div>

            {/* 3 Product cards wireframe */}
            <div className="mx-6 grid grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="border border-slate-200 rounded-lg p-5 bg-white">
                  <div className="w-full h-24 bg-slate-100 rounded-md mb-3"></div>
                  <div className="w-3/4 h-4 bg-slate-300 rounded mb-2"></div>
                  <div className="w-1/2 h-3 bg-slate-200 rounded mb-4"></div>
                  <div className="w-24 h-8 bg-blue-500/40 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Canvas Layer for Clicks / Heatmap */}
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            className="absolute inset-0 z-10 cursor-crosshair"
          />

          {/* Interactive Tooltip on Hover */}
          {hoveredClick && (
            <div
              className="absolute z-20 pointer-events-none bg-slate-900/95 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700 min-w-[200px] backdrop-blur-xs"
              style={{
                left: `${Math.min(canvasWidth - 220, Math.max(10, mousePos.x + 15))}px`,
                top: `${Math.min(canvasHeight - 140, Math.max(10, mousePos.y + 15))}px`,
              }}
            >
              <div className="font-bold text-blue-400 mb-1 flex items-center gap-1.5">
                <Crosshair className="w-3.5 h-3.5" />
                <span>Click Recorded</span>
              </div>
              <div className="space-y-0.5 font-mono text-[11px] text-slate-300">
                <div>
                  <span className="text-slate-400">Position: </span>
                  X: {hoveredClick.click_x}px, Y: {hoveredClick.click_y}px
                </div>
                <div>
                  <span className="text-slate-400">Viewport: </span>
                  {hoveredClick.viewport_width} × {hoveredClick.viewport_height}
                </div>
                <div>
                  <span className="text-slate-400">Element: </span>
                  &lt;{hoveredClick.element_tag || 'ELEMENT'}&gt;
                  {hoveredClick.element_id ? ` #${hoveredClick.element_id}` : ''}
                </div>
                <div className="text-slate-400 text-[10px] pt-1">
                  {formatDate(hoveredClick.timestamp)}
                </div>
              </div>
            </div>
          )}

          {/* Empty state if 0 clicks */}
          {activeClicks.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 text-center p-6">
              <Crosshair className="w-10 h-10 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No Clicks Recorded For This Viewport</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Clicks made by visitors using this screen resolution will appear here automatically.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Legend & Viewport Documentation Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-700">Intensity Legend:</span>
          {mode === 'heatmap' ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Low</span>
              <div className="w-32 h-3 rounded-full bg-gradient-to-r from-cyan-400 via-green-400 via-yellow-400 to-red-600 border border-slate-300" />
              <span className="text-[11px] text-slate-500">High Concentration</span>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>Single Click</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Moderate Overlap</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-600" />
                <span>High Frequency Cluster</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] max-w-md">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Coordinates are normalized proportionally to standard canvas dimensions. Viewport grouping prevents coordinate skew across varying screen resolutions.
          </span>
        </div>
      </div>
    </div>
  );
}
