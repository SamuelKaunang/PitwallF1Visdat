import React, { useState } from 'react';

// Reusable Tooltip State
export interface TooltipData {
  x: number;
  y: number;
  title: string;
  items: Array<{ label: string; value: string | number; color?: string }>;
}

// 1. Line Chart
export interface LineChartSeries {
  id: string;
  name: string;
  color: string;
  data: Array<{ x: number | string; y: number; label?: string }>;
}

export function F1LineChart({
  series,
  xLabel,
  yLabel,
  height = 280,
  reverseY = false,
  formatY = (v: number) => `${v}`
}: {
  series: LineChartSeries[];
  xLabel?: string;
  yLabel?: string;
  height?: number;
  reverseY?: boolean;
  formatY?: (v: number) => string;
}) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  if (series.length === 0 || series.every(s => s.data.length === 0)) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-500 text-sm">
        No telemetry data available for this selection
      </div>
    );
  }

  const allY = series.flatMap(s => s.data.map(d => d.y));
  const minY = Math.min(...allY, 0);
  const maxY = Math.max(...allY, 1);

  // Collect all unique X labels
  const allX = Array.from(new Set(series.flatMap(s => s.data.map(d => d.x))));
  const padding = { top: 20, right: 30, bottom: 40, left: 45 };
  const width = 600; // SVG viewBox coordinate width

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const getX = (idx: number) => {
    if (allX.length <= 1) return padding.left + plotW / 2;
    return padding.left + (idx / (allX.length - 1)) * plotW;
  };

  const getY = (val: number) => {
    const range = maxY - minY || 1;
    const normalized = (val - minY) / range;
    if (reverseY) {
      return padding.top + normalized * plotH;
    }
    return padding.top + (1 - normalized) * plotH;
  };

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
          const yVal = reverseY ? minY + pct * (maxY - minY) : maxY - pct * (maxY - minY);
          const yPos = padding.top + pct * plotH;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={yPos}
                x2={width - padding.right}
                y2={yPos}
                stroke="#27272a"
                strokeDasharray="3 3"
              />
              <text
                x={padding.left - 8}
                y={yPos + 4}
                textAnchor="end"
                className="text-[10px] fill-zinc-500 font-mono"
              >
                {formatY(Math.round(yVal))}
              </text>
            </g>
          );
        })}

        {/* X Axis ticks */}
        {allX.map((xVal, idx) => {
          if (allX.length > 12 && idx % Math.ceil(allX.length / 10) !== 0 && idx !== allX.length - 1) {
            return null;
          }
          const xPos = getX(idx);
          return (
            <text
              key={idx}
              x={xPos}
              y={height - 12}
              textAnchor="middle"
              className="text-[10px] fill-zinc-500 font-mono"
            >
              {typeof xVal === 'string' ? xVal : `R${xVal}`}
            </text>
          );
        })}

        {/* Series lines */}
        {series.map(s => {
          if (s.data.length === 0) return null;
          const points = s.data.map(d => {
            const xIdx = allX.indexOf(d.x);
            return `${getX(xIdx)},${getY(d.y)}`;
          }).join(' ');

          return (
            <g key={s.id}>
              <polyline
                fill="none"
                stroke={s.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={points}
                opacity={0.88}
              />
              {s.data.map((d, dIdx) => {
                const xIdx = allX.indexOf(d.x);
                const cx = getX(xIdx);
                const cy = getY(d.y);
                return (
                  <circle
                    key={dIdx}
                    cx={cx}
                    cy={cy}
                    r={allX.length > 25 ? 2.5 : 4}
                    fill={s.color}
                    className="cursor-pointer transition-transform hover:scale-150"
                    onMouseEnter={(e) => {
                      const rect = (e.target as SVGElement).getBoundingClientRect();
                      setTooltip({
                        x: rect.left,
                        y: rect.top,
                        title: `${s.name} - Round ${d.x}`,
                        items: [
                          { label: yLabel || 'Value', value: formatY(d.y), color: s.color }
                        ]
                      });
                    }}
                  />
                );
              })}
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip */}
      {tooltip && (
        <div
          className="fixed pointer-events-none z-50 bg-zinc-900 border border-zinc-700/80 rounded px-2.5 py-1.5 shadow-xl text-xs backdrop-blur"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 45}px`
          }}
        >
          <div className="font-semibold text-zinc-200">{tooltip.title}</div>
          {tooltip.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-zinc-400 mt-0.5">
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color || '#e10600' }} />
              <span>{item.label}:</span>
              <span className="font-mono text-zinc-100 font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Axis titles */}
      {(xLabel || yLabel) && (
        <div className="flex justify-between text-[11px] text-zinc-500 font-mono px-2 mt-1">
          <span>{yLabel}</span>
          <span>{xLabel}</span>
        </div>
      )}
    </div>
  );
}

// 2. Bar Chart
export function F1BarChart({
  data,
  height = 240,
  valueSuffix = '',
  color = '#e10600'
}: {
  data: Array<{ label: string; value: number; color?: string; sublabel?: string }>;
  height?: number;
  valueSuffix?: string;
  color?: string;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-zinc-500 text-sm">No data</div>;
  }

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const width = 500;
  const padding = { top: 20, right: 20, bottom: 40, left: 45 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;
  const barWidth = Math.min(36, Math.max(12, (plotW / data.length) * 0.65));
  const slotW = plotW / data.length;

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Horizontal gridlines */}
        {[0, 0.5, 1].map((pct, i) => {
          const yPos = padding.top + (1 - pct) * plotH;
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={yPos}
                x2={width - padding.right}
                y2={yPos}
                stroke="#27272a"
                strokeDasharray="2 2"
              />
              <text
                x={padding.left - 6}
                y={yPos + 4}
                textAnchor="end"
                className="text-[10px] fill-zinc-500 font-mono"
              >
                {Math.round(pct * maxVal)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const barH = (d.value / maxVal) * plotH;
          const x = padding.left + i * slotW + (slotW - barWidth) / 2;
          const y = padding.top + plotH - barH;
          const barColor = d.color || color;
          const isHovered = hoveredIdx === i;

          return (
            <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(2, barH)}
                fill={barColor}
                opacity={isHovered ? 1 : 0.85}
                rx={2}
                className="cursor-pointer transition-all duration-150"
              />
              {/* Value on top of bar */}
              <text
                x={x + barWidth / 2}
                y={y - 5}
                textAnchor="middle"
                className="text-[10px] fill-zinc-300 font-mono font-medium"
              >
                {d.value}{valueSuffix}
              </text>
              {/* Label below bar */}
              <text
                x={x + barWidth / 2}
                y={height - 18}
                textAnchor="middle"
                className="text-[10px] fill-zinc-400 font-medium"
              >
                {d.label}
              </text>
              {d.sublabel && (
                <text
                  x={x + barWidth / 2}
                  y={height - 6}
                  textAnchor="middle"
                  className="text-[8px] fill-zinc-500 font-mono"
                >
                  {d.sublabel}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// 3. Lap-by-Lap Position Timeline with Pit Stop Markers
export function F1LapChart({
  lapData,
  pitStops,
  safetyCars = [],
  drivers,
  constructors,
  totalLaps
}: {
  lapData: Array<{ raceId: number; driverId: number; lap: number; position: number }>;
  pitStops: Array<{ raceId: number; driverId: number; stop: number; lap: number; duration: string }>;
  safetyCars?: Array<{ deployedLap: number; retreatedLap: number; type: 'SC' | 'VSC' | 'RED'; cause: string }>;
  drivers: Array<{ driverId: number; code: string; forename: string; surname: string }>;
  constructors: Array<{ constructorId: number; color?: string; name: string }>;
  totalLaps: number;
}) {
  const [highlightedDriver, setHighlightedDriver] = useState<number | null>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const width = 800;
  const height = 400;
  const padding = { top: 30, right: 45, bottom: 40, left: 40 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const getX = (lap: number) => padding.left + ((lap - 1) / Math.max(1, totalLaps - 1)) * plotW;
  // Position 1 at top, Position 20 at bottom
  const getY = (pos: number) => padding.top + ((pos - 1) / 19) * plotH;

  // Group lap times by driver
  const driverLaps: Record<number, Array<{ lap: number; pos: number }>> = {};
  lapData.forEach(l => {
    if (!driverLaps[l.driverId]) driverLaps[l.driverId] = [];
    driverLaps[l.driverId].push({ lap: l.lap, pos: l.position });
  });

  // Sort each driver's laps
  Object.keys(driverLaps).forEach(dId => {
    driverLaps[Number(dId)].sort((a, b) => a.lap - b.lap);
  });

  return (
    <div className="relative w-full overflow-hidden select-none">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Safety car shade zones */}
        {safetyCars.map((sc, i) => {
          const xStart = getX(sc.deployedLap);
          const xEnd = getX(sc.retreatedLap || sc.deployedLap + 3);
          const scColor = sc.type === 'RED' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(234, 179, 8, 0.15)';
          const scBorder = sc.type === 'RED' ? '#ef4444' : '#eab308';

          return (
            <g key={i}>
              <rect
                x={xStart}
                y={padding.top}
                width={Math.max(6, xEnd - xStart)}
                height={plotH}
                fill={scColor}
                stroke={scBorder}
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              <text
                x={xStart + 4}
                y={padding.top + 14}
                className="text-[9px] font-mono font-bold"
                fill={scBorder}
              >
                {sc.type} (L{sc.deployedLap}-{sc.retreatedLap})
              </text>
            </g>
          );
        })}

        {/* Position Y gridlines (P1 to P20) */}
        {[1, 5, 10, 15, 20].map(pos => {
          const y = getY(pos);
          return (
            <g key={pos}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#27272a"
                strokeDasharray="2 2"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                textAnchor="end"
                className="text-[10px] font-mono fill-zinc-500 font-bold"
              >
                P{pos}
              </text>
            </g>
          );
        })}

        {/* Lap X ticks */}
        {[1, 10, 20, 30, 40, 50, totalLaps].filter(l => l <= totalLaps).map(lap => {
          const x = getX(lap);
          return (
            <g key={lap}>
              <line
                x1={x}
                y1={height - padding.bottom}
                x2={x}
                y2={height - padding.bottom + 5}
                stroke="#3f3f46"
              />
              <text
                x={x}
                y={height - padding.bottom + 18}
                textAnchor="middle"
                className="text-[10px] font-mono fill-zinc-500"
              >
                L{lap}
              </text>
            </g>
          );
        })}

        {/* Driver trajectory lines */}
        {Object.entries(driverLaps).map(([dIdStr, laps]) => {
          const dId = Number(dIdStr);
          const driver = drivers.find(d => d.driverId === dId);
          const isHighlighted = highlightedDriver === dId;
          const isFaded = highlightedDriver !== null && !isHighlighted;

          // Compute color
          const color = getDriverColor(driver?.code || '', isHighlighted);

          const points = laps.map(l => `${getX(l.lap)},${getY(l.pos)}`).join(' ');

          return (
            <g
              key={dId}
              onMouseEnter={() => setHighlightedDriver(dId)}
              onMouseLeave={() => setHighlightedDriver(null)}
              className="cursor-pointer"
            >
              <polyline
                fill="none"
                stroke={color}
                strokeWidth={isHighlighted ? 4 : 1.8}
                strokeOpacity={isFaded ? 0.15 : 0.85}
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Driver code label at end of line */}
              {laps.length > 0 && (
                <text
                  x={getX(laps[laps.length - 1].lap) + 6}
                  y={getY(laps[laps.length - 1].pos) + 3}
                  className={`text-[9px] font-mono font-bold ${isHighlighted ? 'fill-white' : 'fill-zinc-400'}`}
                  opacity={isFaded ? 0.2 : 1}
                >
                  {driver?.code}
                </text>
              )}
            </g>
          );
        })}

        {/* Pit stop markers */}
        {pitStops.map((pit, idx) => {
          const driver = drivers.find(d => d.driverId === pit.driverId);
          const driverLapsList = driverLaps[pit.driverId];
          const lapEntry = driverLapsList?.find(l => l.lap === pit.lap);
          const pos = lapEntry ? lapEntry.pos : 10;
          const cx = getX(pit.lap);
          const cy = getY(pos);
          const isHighlighted = highlightedDriver === pit.driverId;

          return (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={(e) => {
                const rect = (e.target as SVGElement).getBoundingClientRect();
                setTooltip({
                  x: rect.left,
                  y: rect.top,
                  title: `${driver?.code || 'Driver'} • Stop ${pit.stop}`,
                  items: [
                    { label: 'Lap', value: pit.lap },
                    { label: 'Pit Duration', value: `${pit.duration}s`, color: '#e10600' }
                  ]
                });
              }}
            >
              <circle
                cx={cx}
                cy={cy}
                r={isHighlighted ? 5 : 3.5}
                fill="#ffffff"
                stroke="#e10600"
                strokeWidth="2"
              />
            </g>
          );
        })}
      </svg>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed pointer-events-none z-50 bg-zinc-900 border border-zinc-700/80 rounded px-2.5 py-1.5 shadow-xl text-xs backdrop-blur"
          style={{
            left: `${tooltip.x + 10}px`,
            top: `${tooltip.y - 45}px`
          }}
        >
          <div className="font-semibold text-zinc-100">{tooltip.title}</div>
          {tooltip.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5 text-zinc-400 mt-0.5">
              <span>{item.label}:</span>
              <span className="font-mono text-zinc-100 font-bold">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Chart legend / info */}
      <div className="flex flex-wrap items-center justify-between text-xs text-zinc-400 mt-2 px-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-white border border-[#e10600] inline-block" />
            <span>Pit Stop Marker</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-yellow-500/20 border border-yellow-500 inline-block" />
            <span>Safety Car / VSC</span>
          </div>
        </div>
        <div className="text-[11px] text-zinc-500 font-mono">
          Hover driver line to isolate trajectory
        </div>
      </div>
    </div>
  );
}

// 4. Radar Chart for Head-to-Head Driver Comparison
export function F1RadarChart({
  driver1Name,
  driver1Color = '#3671C6',
  driver1Stats,
  driver2Name,
  driver2Color = '#E8002D',
  driver2Stats,
  metrics
}: {
  driver1Name: string;
  driver1Color?: string;
  driver1Stats: number[]; // 0-100
  driver2Name: string;
  driver2Color?: string;
  driver2Stats: number[]; // 0-100
  metrics: string[];
}) {
  const size = 320;
  const center = size / 2;
  const radius = center - 45;
  const totalAxes = metrics.length;

  const getCoordinates = (axisIndex: number, value: number) => {
    const angle = (Math.PI * 2 / totalAxes) * axisIndex - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle)
    };
  };

  const poly1 = driver1Stats.map((val, idx) => {
    const pt = getCoordinates(idx, val);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  const poly2 = driver2Stats.map((val, idx) => {
    const pt = getCoordinates(idx, val);
    return `${pt.x},${pt.y}`;
  }).join(' ');

  return (
    <div className="flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[320px] h-auto select-none">
        {/* Background concentric webs */}
        {[25, 50, 75, 100].map((level, i) => {
          const pts = metrics.map((_, idx) => {
            const pt = getCoordinates(idx, level);
            return `${pt.x},${pt.y}`;
          }).join(' ');
          return (
            <polygon
              key={i}
              points={pts}
              fill="none"
              stroke="#27272a"
              strokeWidth="1"
              strokeDasharray={level === 100 ? undefined : '2 2'}
            />
          );
        })}

        {/* Axis spoke lines */}
        {metrics.map((m, idx) => {
          const pt = getCoordinates(idx, 100);
          const labelPt = getCoordinates(idx, 118);
          return (
            <g key={idx}>
              <line
                x1={center}
                y1={center}
                x2={pt.x}
                y2={pt.y}
                stroke="#3f3f46"
                strokeWidth="1"
              />
              <text
                x={labelPt.x}
                y={labelPt.y + 3}
                textAnchor="middle"
                className="text-[10px] font-medium fill-zinc-400"
              >
                {m}
              </text>
            </g>
          );
        })}

        {/* Driver 1 polygon */}
        <polygon
          points={poly1}
          fill={driver1Color}
          fillOpacity={0.25}
          stroke={driver1Color}
          strokeWidth="2.5"
        />

        {/* Driver 2 polygon */}
        <polygon
          points={poly2}
          fill={driver2Color}
          fillOpacity={0.25}
          stroke={driver2Color}
          strokeWidth="2.5"
        />

        {/* Points for Driver 1 */}
        {driver1Stats.map((val, idx) => {
          const pt = getCoordinates(idx, val);
          return <circle key={idx} cx={pt.x} cy={pt.y} r="3" fill={driver1Color} />;
        })}

        {/* Points for Driver 2 */}
        {driver2Stats.map((val, idx) => {
          const pt = getCoordinates(idx, val);
          return <circle key={idx} cx={pt.x} cy={pt.y} r="3" fill={driver2Color} />;
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: driver1Color }} />
          <span className="font-semibold text-zinc-200">{driver1Name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: driver2Color }} />
          <span className="font-semibold text-zinc-200">{driver2Name}</span>
        </div>
      </div>
    </div>
  );
}

// 5. Grid vs Finish Scatter Plot
export function F1ScatterPlot({
  data
}: {
  data: Array<{ grid: number; finish: number; count: number }>;
}) {
  const [hovered, setHovered] = useState<{ grid: number; finish: number; count: number } | null>(null);

  const size = 380;
  const padding = 45;
  const plotSize = size - padding * 2;

  const getCoord = (pos: number) => padding + ((pos - 1) / 19) * plotSize;

  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[380px] h-auto select-none">
        {/* Identity line y = x (started and finished at same spot) */}
        <line
          x1={getCoord(1)}
          y1={getCoord(1)}
          x2={getCoord(20)}
          y2={getCoord(20)}
          stroke="#e10600"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* Grid lines */}
        {[1, 5, 10, 15, 20].map(pos => {
          const coord = getCoord(pos);
          return (
            <g key={pos}>
              {/* Vertical */}
              <line x1={coord} y1={padding} x2={coord} y2={size - padding} stroke="#27272a" />
              <text x={coord} y={size - padding + 15} textAnchor="middle" className="text-[10px] fill-zinc-500 font-mono">
                P{pos}
              </text>
              {/* Horizontal */}
              <line x1={padding} y1={coord} x2={size - padding} y2={coord} stroke="#27272a" />
              <text x={padding - 8} y={coord + 3} textAnchor="end" className="text-[10px] fill-zinc-500 font-mono">
                P{pos}
              </text>
            </g>
          );
        })}

        {/* Data points */}
        {data.map((pt, i) => {
          const cx = getCoord(pt.grid);
          const cy = getCoord(pt.finish);
          const r = Math.min(12, Math.max(3.5, Math.sqrt(pt.count) * 2.5));
          const isGained = pt.finish < pt.grid;
          const isLost = pt.finish > pt.grid;
          const color = isGained ? '#10b981' : isLost ? '#f43f5e' : '#e4e4e7';

          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill={color}
              fillOpacity={0.65}
              stroke={color}
              strokeWidth="1.5"
              className="cursor-pointer transition-transform hover:scale-125"
              onMouseEnter={() => setHovered(pt)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}

        {/* Labels */}
        <text x={size / 2} y={size - 10} textAnchor="middle" className="text-xs fill-zinc-400 font-mono font-medium">
          Grid Starting Position →
        </text>
        <text
          x={12}
          y={size / 2}
          textAnchor="middle"
          transform={`rotate(-90 12 ${size / 2})`}
          className="text-xs fill-zinc-400 font-mono font-medium"
        >
          Race Finish Position →
        </text>
      </svg>

      {hovered && (
        <div className="absolute top-2 right-2 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-xs">
          <div className="text-zinc-200 font-medium">
            Grid P{hovered.grid} → Finish P{hovered.finish}
          </div>
          <div className="text-zinc-400 font-mono">
            {hovered.count} driver occurrences ({hovered.grid - hovered.finish > 0 ? `+${hovered.grid - hovered.finish} gained` : `${hovered.grid - hovered.finish} lost`})
          </div>
        </div>
      )}
    </div>
  );
}

function getDriverColor(code: string, isHighlighted: boolean): string {
  if (isHighlighted) return '#ffffff';
  const colorMap: Record<string, string> = {
    VER: '#3671C6',
    PER: '#3671C6',
    NOR: '#FF8000',
    PIA: '#FF8000',
    LEC: '#E8002D',
    SAI: '#E8002D',
    HAM: '#27F4D2',
    RUS: '#27F4D2',
    ALO: '#229971',
    STR: '#229971',
    GAS: '#0093CC',
    OCO: '#0093CC',
    ALB: '#64C4FF',
    SAR: '#64C4FF',
    TSU: '#6692FF',
    RIC: '#6692FF',
    BOT: '#52E252',
    ZHO: '#52E252',
    HUL: '#B6BABD',
    MAG: '#B6BABD'
  };
  return colorMap[code] || '#94a3b8';
}
