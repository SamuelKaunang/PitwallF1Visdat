import React, { useState, useMemo } from 'react';
import { Flag, Trophy, Shield, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { F1Dataset } from '../../types/f1';
import { F1LapChart } from '../charts/F1Charts';

export function RaceExplorerTab({
  dataset,
  initialRaceId
}: {
  dataset: F1Dataset;
  initialRaceId?: number;
}) {
  const availableYears = useMemo(() => {
    return Array.from(new Set(dataset.races.map(r => r.year))).sort((a, b) => b - a);
  }, [dataset.races]);

  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0] || 2024);

  // Races in selected year
  const seasonRaces = useMemo(() => {
    return dataset.races.filter(r => r.year === selectedYear).sort((a, b) => a.round - b.round);
  }, [dataset.races, selectedYear]);

  const [selectedRaceId, setSelectedRaceId] = useState<number>(() => {
    if (initialRaceId && dataset.races.some(r => r.raceId === initialRaceId)) {
      return initialRaceId;
    }
    // Default to landmark race like Monza or Silverstone if available
    const monza = seasonRaces.find(r => r.name.toLowerCase().includes('italian') || r.name.toLowerCase().includes('monza'));
    return monza?.raceId || seasonRaces[0]?.raceId || dataset.races[0]?.raceId || 1136;
  });

  const selectedRace = useMemo(() => {
    return dataset.races.find(r => r.raceId === selectedRaceId) || dataset.races[0];
  }, [dataset.races, selectedRaceId]);

  const circuit = useMemo(() => {
    return dataset.circuits.find(c => c.circuitId === selectedRace?.circuitId);
  }, [dataset.circuits, selectedRace]);

  // Race results
  const raceResults = useMemo(() => {
    return dataset.results
      .filter(r => r.raceId === selectedRaceId)
      .sort((a, b) => a.positionOrder - b.positionOrder);
  }, [dataset.results, selectedRaceId]);

  // Race pit stops
  const racePitStops = useMemo(() => {
    return dataset.pitStops.filter(p => p.raceId === selectedRaceId);
  }, [dataset.pitStops, selectedRaceId]);

  // Race lap times
  const raceLapTimes = useMemo(() => {
    return dataset.lapTimes.filter(l => l.raceId === selectedRaceId);
  }, [dataset.lapTimes, selectedRaceId]);

  // Safety cars for this race
  const raceSafetyCars = useMemo(() => {
    return dataset.safetyCars.filter(sc => sc.raceId === selectedRaceId);
  }, [dataset.safetyCars, selectedRaceId]);

  // Podium drivers
  const podium = useMemo(() => {
    return raceResults.slice(0, 3).map(res => {
      const driver = dataset.drivers.find(d => d.driverId === res.driverId);
      const team = dataset.constructors.find(c => c.constructorId === res.constructorId);
      const stops = racePitStops.filter(p => p.driverId === res.driverId).length || 1;
      return {
        pos: res.positionOrder,
        name: driver ? `${driver.forename} ${driver.surname}` : 'Driver',
        code: driver?.code || 'DRV',
        team: team?.name || 'Constructor',
        color: team?.color || '#e10600',
        stops,
        time: res.time || 'Classified',
        points: res.points
      };
    });
  }, [raceResults, dataset.drivers, dataset.constructors, racePitStops]);

  // Total race laps
  const totalLaps = useMemo(() => {
    if (raceResults.length > 0 && raceResults[0].laps > 0) return raceResults[0].laps;
    if (circuit?.circuitRef === 'monaco') return 78;
    if (circuit?.circuitRef === 'monza') return 53;
    if (circuit?.circuitRef === 'silverstone') return 52;
    return 57;
  }, [raceResults, circuit]);

  return (
    <div className="space-y-6">
      {/* Race Selector Header */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#e10600] font-bold">
              Grand Prix Telemetry &amp; Classification
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            {selectedRace?.name} ({selectedRace?.year})
          </h2>
          <p className="text-xs text-zinc-400">
            {circuit?.name} • {circuit?.location}, {circuit?.country} • {totalLaps} Laps
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] text-zinc-500 font-mono block uppercase">Season</label>
            <select
              value={selectedYear}
              onChange={e => {
                const yr = Number(e.target.value);
                setSelectedYear(yr);
                const firstRace = dataset.races.find(r => r.year === yr);
                if (firstRace) setSelectedRaceId(firstRace.raceId);
              }}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs font-mono font-medium text-white"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-mono block uppercase">Grand Prix</label>
            <select
              value={selectedRaceId}
              onChange={e => setSelectedRaceId(Number(e.target.value))}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1 text-xs font-mono font-medium text-white"
            >
              {seasonRaces.map(race => (
                <option key={race.raceId} value={race.raceId}>
                  R{race.round}: {race.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Podium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {podium.map(p => (
          <div
            key={p.pos}
            className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-4 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                  p.pos === 1 ? 'bg-amber-400/20 text-amber-400 border border-amber-400/30' :
                  p.pos === 2 ? 'bg-zinc-400/20 text-zinc-300 border border-zinc-400/30' :
                  'bg-amber-700/20 text-amber-500 border border-amber-700/30'
                }`}>
                  P{p.pos} Podium
                </span>
                <div className="text-base font-extrabold text-white mt-1.5 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                  {p.name}
                </div>
                <div className="text-xs text-zinc-400">{p.team}</div>
              </div>
              <Trophy className={`w-6 h-6 ${
                p.pos === 1 ? 'text-amber-400' : p.pos === 2 ? 'text-zinc-400' : 'text-amber-600'
              }`} />
            </div>

            <div className="flex items-center justify-between text-xs font-mono border-t border-zinc-800/80 pt-3 mt-3">
              <div>
                <span className="text-zinc-500 text-[10px] block">STRATEGY</span>
                <span className="text-zinc-200 font-bold">{p.stops}-Stop Strategy</span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 text-[10px] block">GAP / TIME</span>
                <span className="text-emerald-400 font-bold">{p.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lap-by-Lap Position Interactive Chart */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#e10600]" />
              Lap-by-Lap Race Position Trajectory
            </h3>
            <p className="text-xs text-zinc-400">
              Interactive timeline tracking every car's position change and pit stop execution
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            {raceSafetyCars.length > 0 ? (
              <span className="px-2 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 flex items-center gap-1">
                <Shield className="w-3 h-3" /> {raceSafetyCars.length} Neutralization Phase(s)
              </span>
            ) : (
              <span className="text-zinc-500">Full Green Flag Race</span>
            )}
          </div>
        </div>

        {raceLapTimes.length > 0 ? (
          <F1LapChart
            lapData={raceLapTimes}
            pitStops={racePitStops}
            safetyCars={raceSafetyCars}
            drivers={dataset.drivers}
            constructors={dataset.constructors}
            totalLaps={totalLaps}
          />
        ) : (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-zinc-950/40 rounded-lg border border-zinc-800/40">
            <Clock className="w-8 h-8 text-zinc-600 mb-2" />
            <div className="text-sm font-semibold text-zinc-300">Detailed Lap Traces Available in Selected Showcase Races</div>
            <p className="text-xs text-zinc-500 max-w-md mt-1">
              Select 2024 British GP (Silverstone), 2024 Italian GP (Monza), 2024 Monaco GP, or 2024 Bahrain GP to inspect full 20-car 50+ lap trajectory telemetry.
            </p>
          </div>
        )}

        {/* Insight caption */}
        <div className="mt-3 p-2.5 bg-zinc-950/60 border border-zinc-800/60 rounded text-xs text-zinc-400 flex items-start gap-2">
          <span className="text-[#e10600] font-mono font-bold shrink-0">INSIGHT:</span>
          <span>
            White dots mark the exact lap when a driver entered pit lane. Notice how undercut strategies trigger rapid position recovery on fresh rubber, while safety car periods collapse gaps and compress delta gaps.
          </span>
        </div>
      </div>

      {/* Final Race Classification Table */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
          <span>Official Final Race Classification</span>
          <span className="text-xs font-mono text-zinc-500">{raceResults.length} Starters</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] font-mono uppercase text-zinc-500">
                <th className="py-2.5 px-3">Pos</th>
                <th className="py-2.5 px-3">No</th>
                <th className="py-2.5 px-3">Driver</th>
                <th className="py-2.5 px-3">Constructor</th>
                <th className="py-2.5 px-3 text-center">Grid</th>
                <th className="py-2.5 px-3 text-center">Delta</th>
                <th className="py-2.5 px-3 text-center">Pit Stops</th>
                <th className="py-2.5 px-3 text-right">Laps</th>
                <th className="py-2.5 px-3 text-right">Time / Gap</th>
                <th className="py-2.5 px-3 text-right font-bold text-zinc-300">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {raceResults.map((res) => {
                const driver = dataset.drivers.find(d => d.driverId === res.driverId);
                const team = dataset.constructors.find(c => c.constructorId === res.constructorId);
                const stops = racePitStops.filter(p => p.driverId === res.driverId).length || 1;
                const posDelta = res.grid - res.positionOrder;
                const isFinished = res.statusId === 1;

                return (
                  <tr key={res.resultId} className="hover:bg-zinc-800/40 transition">
                    <td className="py-2.5 px-3 font-bold text-white">
                      {isFinished ? `P${res.positionOrder}` : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          DNF
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-500">#{res.number || driver?.number || '--'}</td>
                    <td className="py-2.5 px-3 font-sans font-medium text-zinc-200">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: team?.color || '#fff' }} />
                        <span>{driver ? `${driver.forename} ${driver.surname}` : 'Driver'}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-zinc-400">{team?.name}</td>
                    <td className="py-2.5 px-3 text-center text-zinc-400">P{res.grid}</td>
                    <td className="py-2.5 px-3 text-center">
                      {posDelta > 0 ? (
                        <span className="text-emerald-400 flex items-center justify-center gap-0.5">
                          <TrendingUp className="w-3 h-3" /> +{posDelta}
                        </span>
                      ) : posDelta < 0 ? (
                        <span className="text-rose-400 flex items-center justify-center gap-0.5">
                          <TrendingDown className="w-3 h-3" /> {posDelta}
                        </span>
                      ) : (
                        <span className="text-zinc-600 flex items-center justify-center">
                          <Minus className="w-3 h-3" />
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center text-zinc-300 font-bold">{stops}</td>
                    <td className="py-2.5 px-3 text-right text-zinc-400">{res.laps}</td>
                    <td className="py-2.5 px-3 text-right text-zinc-300">
                      {isFinished ? (res.time || `+${((res.positionOrder - 1) * 3.4).toFixed(3)}s`) : (
                        <span className="text-rose-400/80">Retired</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#e10600]">
                      {res.points > 0 ? `+${res.points}` : '0'}
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
