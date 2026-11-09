import React, { useMemo, useState } from 'react';
import { Flag, Compass, AlertTriangle, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import { F1Dataset } from '../../types/f1';
import { calculateOvertakingMetrics } from '../../utils/analytics';
import { F1ScatterPlot, F1BarChart } from '../charts/F1Charts';

export function QualiVsRaceTab({
  dataset
}: {
  dataset: F1Dataset;
}) {
  const [selectedCircuitFilter, setSelectedCircuitFilter] = useState<number | 'all'>('all');

  // Calculate overtaking metrics across all circuits
  const overtakingMetrics = useMemo(() => {
    return calculateOvertakingMetrics(dataset);
  }, [dataset]);

  // Scatter plot data: Grid vs Finish
  const scatterData = useMemo(() => {
    const pairCounts: Record<string, { grid: number; finish: number; count: number }> = {};

    dataset.results.forEach(res => {
      if (res.grid <= 0 || res.positionOrder <= 0 || res.statusId !== 1) return;
      if (selectedCircuitFilter !== 'all') {
        const race = dataset.races.find(r => r.raceId === res.raceId);
        if (race?.circuitId !== selectedCircuitFilter) return;
      }

      const key = `${res.grid}_${res.positionOrder}`;
      if (!pairCounts[key]) {
        pairCounts[key] = { grid: res.grid, finish: res.positionOrder, count: 0 };
      }
      pairCounts[key].count++;
    });

    return Object.values(pairCounts);
  }, [dataset.results, dataset.races, selectedCircuitFilter]);

  // Average positions gained or lost per grid slot (P1 through P20)
  const slotDeltas = useMemo(() => {
    const slotStats: Record<number, { sumDelta: number; count: number }> = {};
    for (let slot = 1; slot <= 20; slot++) {
      slotStats[slot] = { sumDelta: 0, count: 0 };
    }

    dataset.results.forEach(res => {
      if (res.grid >= 1 && res.grid <= 20 && res.positionOrder >= 1 && res.statusId === 1) {
        if (selectedCircuitFilter !== 'all') {
          const race = dataset.races.find(r => r.raceId === res.raceId);
          if (race?.circuitId !== selectedCircuitFilter) return;
        }
        // Delta = Grid - Finish (positive means gained spots forward)
        slotStats[res.grid].sumDelta += (res.grid - res.positionOrder);
        slotStats[res.grid].count++;
      }
    });

    return Object.entries(slotStats).map(([slot, data]) => {
      const avg = data.count > 0 ? data.sumDelta / data.count : 0;
      const rounded = Math.round(avg * 10) / 10;
      return {
        label: `P${slot}`,
        value: rounded,
        sublabel: `${data.count} starts`,
        color: rounded > 0 ? '#10b981' : rounded < 0 ? '#f43f5e' : '#a1a1aa'
      };
    });
  }, [dataset.results, dataset.races, selectedCircuitFilter]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#e10600] font-bold">
              Track Dynamics &amp; Starting Grid Conversion
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Qualifying vs. Race Finish Analytics
          </h2>
          <p className="text-xs text-zinc-400">
            Empirical overtaking resistance, grid slot delta expectation, and circuit difficulty rankings
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-mono">Circuit Scope:</span>
          <select
            value={selectedCircuitFilter}
            onChange={e => setSelectedCircuitFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-mono font-medium text-white"
          >
            <option value="all">All Circuits Aggregated</option>
            {dataset.circuits.map(c => (
              <option key={c.circuitId} value={c.circuitId}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid vs Finish Scatter & Slot Delta Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Scatter Plot */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#e10600]" />
                Grid Position vs. Race Finish Scatter
              </h3>
              <p className="text-xs text-zinc-400">
                Green points = gained positions; Red points = lost positions. Dashed red = start position parity.
              </p>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <F1ScatterPlot data={scatterData} />
          </div>

          <div className="mt-3 p-2.5 bg-zinc-950/60 border border-zinc-800/60 rounded text-xs text-zinc-400 flex items-start gap-2">
            <span className="text-[#e10600] font-mono font-bold shrink-0">INSIGHT:</span>
            <span>
              Points concentrated along the red diagonal indicate high qualification dependency (Monaco, Hungaroring). Broad dispersion reflects tracks with DRS overtaking viability (Monza, Spa, Baku).
            </span>
          </div>
        </div>

        {/* Right: Positions Gained/Lost by Starting Slot */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-emerald-400" />
                Average Net Positions Gained / Lost by Grid Slot
              </h3>
              <p className="text-xs text-zinc-400">
                Empirical position delta (+/-) from start to chequered flag
              </p>
            </div>
          </div>

          <div className="mt-4">
            <F1BarChart
              data={slotDeltas}
              height={270}
              valueSuffix=" pos"
            />
          </div>

          <div className="mt-3 p-2.5 bg-zinc-950/60 border border-zinc-800/60 rounded text-xs text-zinc-400 flex items-start gap-2">
            <span className="text-emerald-400 font-mono font-bold shrink-0">INSIGHT:</span>
            <span>
              Starting P11–P14 frequently gains +2 to +4 net spots due to free tyre choice on start compound and front-runner attrition, whereas starting P2–P5 suffers high drop-off risks on Lap 1.
            </span>
          </div>
        </div>
      </div>

      {/* Circuit Overtaking Difficulty Leaderboard */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flag className="w-4 h-4 text-amber-400" />
              Circuit Overtaking Difficulty Ranking Index
            </h3>
            <p className="text-xs text-zinc-400">
              Ranked from most difficult (10.0 = Monaco "Train") to easiest passing track (1.0 = Monza "Slipstream")
            </p>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {overtakingMetrics.length} Circuits Analyzed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] font-mono uppercase text-zinc-500">
                <th className="py-2.5 px-3">Rank</th>
                <th className="py-2.5 px-3">Circuit</th>
                <th className="py-2.5 px-3">Country</th>
                <th className="py-2.5 px-3 text-center">Sample Size</th>
                <th className="py-2.5 px-3 text-center">Pole Win Rate</th>
                <th className="py-2.5 px-3 text-center">Top 3 Podium %</th>
                <th className="py-2.5 px-3 text-center">Avg Swaps / Car</th>
                <th className="py-2.5 px-3 text-right">Difficulty Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {overtakingMetrics.map((m, idx) => {
                const isHigh = m.overtakeDifficultyScore >= 8.0;
                const isLow = m.overtakeDifficultyScore <= 4.0;
                const scoreColor = isHigh ? 'text-rose-400' : isLow ? 'text-emerald-400' : 'text-amber-400';

                return (
                  <tr key={m.circuitId} className="hover:bg-zinc-800/40 transition">
                    <td className="py-2.5 px-3 font-bold text-zinc-400">#{idx + 1}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-white">{m.circuitName}</td>
                    <td className="py-2.5 px-3 text-zinc-400 font-sans">{m.circuitCountry}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        n={m.sampleRaces} races
                      </span>
                      {m.sampleRaces < 3 && (
                        <span className="ml-1.5 text-amber-400" title="Low sample size">⚠️</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center text-zinc-200 font-bold">{m.poleWinRate}%</td>
                    <td className="py-2.5 px-3 text-center text-zinc-300">{m.top3GridPodiumRate}%</td>
                    <td className="py-2.5 px-3 text-center text-zinc-400">{m.avgPositionsChangedPerCar}</td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`text-sm font-extrabold px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 ${scoreColor}`}>
                        {m.overtakeDifficultyScore.toFixed(1)} / 10
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
