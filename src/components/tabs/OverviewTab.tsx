import React, { useState, useMemo } from 'react';
import { Trophy, Flag, Timer, Zap, ChevronRight, Award } from 'lucide-react';
import { F1Dataset } from '../../types/f1';
import { F1LineChart, LineChartSeries } from '../charts/F1Charts';

export function OverviewTab({
  dataset,
  onSelectRace
}: {
  dataset: F1Dataset;
  onSelectRace?: (raceId: number) => void;
}) {
  const availableYears = useMemo(() => {
    return Array.from(new Set(dataset.races.map(r => r.year))).sort((a, b) => b - a);
  }, [dataset.races]);

  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0] || 2024);

  // Filter races for selected season
  const seasonRaces = useMemo(() => {
    return dataset.races.filter(r => r.year === selectedYear).sort((a, b) => a.round - b.round);
  }, [dataset.races, selectedYear]);

  const seasonRaceIds = useMemo(() => new Set(seasonRaces.map(r => r.raceId)), [seasonRaces]);

  // Season results
  const seasonResults = useMemo(() => {
    return dataset.results.filter(r => seasonRaceIds.has(r.raceId));
  }, [dataset.results, seasonRaceIds]);

  // Season pit stops
  const seasonPitStops = useMemo(() => {
    return dataset.pitStops.filter(p => seasonRaceIds.has(p.raceId));
  }, [dataset.pitStops, seasonRaceIds]);

  // KPIs
  const kpis = useMemo(() => {
    const totalRaces = seasonRaces.length;
    const winners = new Set(seasonResults.filter(r => r.positionOrder === 1).map(r => r.driverId));
    
    // Most wins driver
    const winCounts: Record<number, number> = {};
    seasonResults.filter(r => r.positionOrder === 1).forEach(r => {
      winCounts[r.driverId] = (winCounts[r.driverId] || 0) + 1;
    });

    let topWinnerId = 0;
    let maxWins = 0;
    Object.entries(winCounts).forEach(([dId, wins]) => {
      if (wins > maxWins) {
        maxWins = wins;
        topWinnerId = Number(dId);
      }
    });

    const topDriver = dataset.drivers.find(d => d.driverId === topWinnerId);
    const avgPitStops = totalRaces > 0 ? (seasonPitStops.length / (totalRaces * 20)).toFixed(1) : '1.8';

    return {
      totalRaces,
      uniqueWinners: winners.size,
      topWinnerName: topDriver ? `${topDriver.forename} ${topDriver.surname}` : 'N/A',
      topWinnerWins: maxWins,
      avgPitStopsPerCar: avgPitStops
    };
  }, [seasonRaces, seasonResults, seasonPitStops, dataset.drivers]);

  // Championship standings progression line chart
  const standingsSeries: LineChartSeries[] = useMemo(() => {
    // Get top 6 drivers in this season
    const totalDriverPts: Record<number, number> = {};
    seasonResults.forEach(r => {
      totalDriverPts[r.driverId] = (totalDriverPts[r.driverId] || 0) + r.points;
    });

    const top6DriverIds = Object.entries(totalDriverPts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(entry => Number(entry[0]));

    return top6DriverIds.map(dId => {
      const driver = dataset.drivers.find(d => d.driverId === dId);
      // Find driver's constructor for coloring
      const sampleResult = seasonResults.find(r => r.driverId === dId);
      const team = dataset.constructors.find(c => c.constructorId === sampleResult?.constructorId);

      let runningTotal = 0;
      const data = seasonRaces.map(race => {
        const res = seasonResults.find(r => r.raceId === race.raceId && r.driverId === dId);
        if (res) runningTotal += res.points;
        return {
          x: race.round,
          y: runningTotal,
          label: race.name
        };
      });

      return {
        id: `driver_${dId}`,
        name: driver?.surname || `Driver ${dId}`,
        color: team?.color || '#e10600',
        data
      };
    });
  }, [seasonResults, seasonRaces, dataset.drivers, dataset.constructors]);

  return (
    <div className="space-y-6">
      {/* Season Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl">
        <div>
          <h2 className="text-lg font-bold text-white tracking-tight">Formula 1 Season Overview</h2>
          <p className="text-xs text-zinc-400">
            Championship progression, race winners, and strategy efficiency benchmarks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-mono">Select Season:</span>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#e10600]"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year} World Championship
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Calendar Races</span>
            <Flag className="w-4 h-4 text-[#e10600]" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{kpis.totalRaces}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Official Grand Prix scheduled</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Unique Winners</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">{kpis.uniqueWinners}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Drivers on top step of podium</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Most Wins</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-white truncate font-mono">{kpis.topWinnerName}</div>
          <p className="text-[11px] text-zinc-500 mt-1">{kpis.topWinnerWins} Grand Prix victories</p>
        </div>

        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4 relative overflow-hidden">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono uppercase tracking-wider mb-2">
            <span>Avg Pit Stops / Car</span>
            <Timer className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 font-mono">{kpis.avgPitStopsPerCar}</div>
          <p className="text-[11px] text-zinc-500 mt-1">Stops per driver per race</p>
        </div>
      </div>

      {/* Championship Standings Line Chart */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#e10600]" />
              Drivers' Championship Progression ({selectedYear})
            </h3>
            <p className="text-xs text-zinc-400">
              Cumulative points by round for top title contenders
            </p>
          </div>
          <div className="text-xs text-zinc-500 font-mono">
            Sample size: n={seasonRaces.length} rounds
          </div>
        </div>

        <F1LineChart
          series={standingsSeries}
          xLabel="Championship Round →"
          yLabel="Points"
          height={300}
        />

        {/* Insight caption */}
        <div className="mt-3 p-2.5 bg-zinc-950/60 border border-zinc-800/60 rounded text-xs text-zinc-400 flex items-start gap-2">
          <span className="text-[#e10600] font-mono font-bold shrink-0">INSIGHT:</span>
          <span>
            Notice inflection rounds where title contenders pulled away through superior race tire management and pit execution. Hover over data points to inspect round-by-round points tally.
          </span>
        </div>
      </div>

      {/* Season Calendar & Race Cards */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
          <span>{selectedYear} Grand Prix Calendar &amp; Winning Strategies</span>
          <span className="text-xs font-mono text-zinc-500">{seasonRaces.length} events</span>
        </h3>

        <div className="divide-y divide-zinc-800/60 overflow-hidden rounded-lg border border-zinc-800/60">
          {seasonRaces.map(race => {
            const circuit = dataset.circuits.find(c => c.circuitId === race.circuitId);
            const winnerResult = seasonResults.find(r => r.raceId === race.raceId && r.positionOrder === 1);
            const winnerDriver = dataset.drivers.find(d => d.driverId === winnerResult?.driverId);
            const winnerTeam = dataset.constructors.find(c => c.constructorId === winnerResult?.constructorId);

            // Winner stops
            const winnerStops = dataset.pitStops.filter(p => p.raceId === race.raceId && p.driverId === winnerResult?.driverId).length || 1;

            return (
              <div
                key={race.raceId}
                onClick={() => onSelectRace?.(race.raceId)}
                className="flex items-center justify-between p-3.5 bg-zinc-950/40 hover:bg-zinc-800/50 transition cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center font-mono text-xs font-bold text-zinc-400">
                    R{race.round}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#e10600] transition">
                      {race.name}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      {circuit?.name} • {circuit?.country}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  {winnerDriver ? (
                    <div className="text-right">
                      <div className="font-bold flex items-center gap-1.5 justify-end">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: winnerTeam?.color || '#fff' }} />
                        <span className="text-zinc-200">{winnerDriver.forename} {winnerDriver.surname}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {winnerStops}-Stop Strategy • Grid P{winnerResult?.grid}
                      </div>
                    </div>
                  ) : (
                    <span className="text-zinc-600">Pending</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
