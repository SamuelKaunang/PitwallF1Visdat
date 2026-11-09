import React, { useState, useMemo } from 'react';
import { Wrench, CheckCircle, AlertTriangle, Timer, Zap, Shield, Compass, TrendingUp } from 'lucide-react';
import { F1Dataset } from '../../types/f1';
import {
  calculateStrategyStats,
  calculatePitLapDistribution,
  calculateTeamPitAverages
} from '../../utils/analytics';
import { F1BarChart } from '../charts/F1Charts';

export function PitStrategyTab({
  dataset
}: {
  dataset: F1Dataset;
}) {
  // Available circuits
  const circuits = useMemo(() => {
    return [...dataset.circuits].sort((a, b) => a.name.localeCompare(b.name));
  }, [dataset.circuits]);

  const [selectedCircuitId, setSelectedCircuitId] = useState<number>(() => {
    // Default to Monza or Silverstone or Bahrain
    const monza = circuits.find(c => c.circuitRef === 'monza');
    return monza?.circuitId || circuits[0]?.circuitId || 14;
  });

  const [startYear, setStartYear] = useState<number>(2021);
  const [endYear, setEndYear] = useState<number>(2024);

  const selectedCircuit = useMemo(() => {
    return circuits.find(c => c.circuitId === selectedCircuitId) || circuits[0];
  }, [circuits, selectedCircuitId]);

  // Compute strategy statistics for 1, 2, 3 stops
  const { strategies, sampleRaces, totalClassified } = useMemo(() => {
    return calculateStrategyStats(dataset, selectedCircuitId, startYear, endYear);
  }, [dataset, selectedCircuitId, startYear, endYear]);

  // Compute optimal pit lap window distribution for top-5 finishers
  const pitWindowDist = useMemo(() => {
    return calculatePitLapDistribution(dataset, selectedCircuitId, startYear, endYear);
  }, [dataset, selectedCircuitId, startYear, endYear]);

  // Team pit stop duration benchmarks
  const teamPitAverages = useMemo(() => {
    return calculateTeamPitAverages(dataset, startYear, endYear);
  }, [dataset, startYear, endYear]);

  // Safety car events at this circuit
  const circuitSafetyCars = useMemo(() => {
    return dataset.safetyCars.filter(sc => 
      sc.circuitRef === selectedCircuit?.circuitRef && sc.year >= startYear && sc.year <= endYear
    );
  }, [dataset.safetyCars, selectedCircuit, startYear, endYear]);

  // Plain-Language Strategy Recommendation generated dynamically from the data
  const strategyRecommendation = useMemo(() => {
    if (sampleRaces === 0) {
      return {
        verdict: 'Insufficient historical data in selected era',
        details: 'Select an expanded year range or a circuit with scheduled Grand Prix to generate statistical recommendations.',
        optimalStops: 1,
        confidence: 'Low'
      };
    }

    const s1 = strategies.find(s => s.stops === 1) || { avgPoints: 0, winRate: 0, count: 0 };
    const s2 = strategies.find(s => s.stops === 2) || { avgPoints: 0, winRate: 0, count: 0 };
    const s3 = strategies.find(s => s.stops === 3) || { avgPoints: 0, winRate: 0, count: 0 };

    // Find the strategy with highest average points scored
    const sorted = [...strategies].filter(s => s.count > 0).sort((a, b) => b.avgPoints - a.avgPoints);
    const best = sorted[0] || strategies[0];

    const isOneStopBetter = (s1.avgPoints > s2.avgPoints) || (s1.winRate > s2.winRate);
    const pointDelta = Math.abs(s1.avgPoints - s2.avgPoints).toFixed(1);

    // Isolate top pit windows
    const top5Stops = pitWindowDist.filter(p => p.top5Count > 0);
    const peakStop1 = top5Stops.filter(p => p.stopNumber === 1).sort((a, b) => b.top5Count - a.top5Count)[0];
    const peakStop2 = top5Stops.filter(p => p.stopNumber === 2).sort((a, b) => b.top5Count - a.top5Count)[0];

    const windowText = peakStop1 ? `Lap ${Math.max(10, peakStop1.lap - 3)}–${peakStop1.lap + 3}` : 'Lap 18–24';
    const window2Text = peakStop2 ? `Lap ${Math.max(25, peakStop2.lap - 3)}–${peakStop2.lap + 3}` : 'Lap 36–42';

    return {
      verdict: `${best.stops}-Stop Strategy is statistically optimal at ${selectedCircuit?.name}`,
      details: isOneStopBetter
        ? `Between ${startYear}–${endYear} (n=${sampleRaces} races, ${totalClassified} drivers), 1-stop runners averaged ${pointDelta} more championship points than multi-stoppers with a ${s1.winRate}% win rate. Target Stop 1: ${windowText}.`
        : `Between ${startYear}–${endYear} (n=${sampleRaces} races, ${totalClassified} drivers), 2-stop strategies scored ${pointDelta} more points with a ${s2.winRate}% win rate due to severe tire degradation. Target Window 1: ${windowText}, Window 2: ${window2Text}.`,
      optimalStops: best.stops,
      confidence: sampleRaces >= 3 ? 'High' : 'Moderate'
    };
  }, [strategies, sampleRaces, totalClassified, selectedCircuit, startYear, endYear, pitWindowDist]);

  // Histogram data for Stop 1 top-5 finishers
  const stop1HistogramData = useMemo(() => {
    return pitWindowDist
      .filter(p => p.stopNumber === 1 && p.top5Count > 0)
      .slice(0, 10)
      .map(p => ({
        label: `L${p.lap}`,
        value: p.top5Count,
        sublabel: `${p.count} total`,
        color: p.top5Count >= 2 ? '#e10600' : '#71717a'
      }));
  }, [pitWindowDist]);

  // Team pit duration chart data
  const teamPitChartData = useMemo(() => {
    return teamPitAverages.slice(0, 10).map(t => ({
      label: t.constructorName.split(' ')[0],
      value: t.avgDurationSec,
      sublabel: `Best: ${t.bestDurationSec}s`,
      color: t.constructorColor
    }));
  }, [teamPitAverages]);

  return (
    <div className="space-y-6">
      {/* Control Banner: Circuit & Era Selection */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e10600] animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#e10600] font-bold">
              Race Strategy Optimization Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            {selectedCircuit?.name}
          </h2>
          <p className="text-xs text-zinc-400">
            {selectedCircuit?.location}, {selectedCircuit?.country} • Analyzing {sampleRaces} Grand Prix ({startYear}–{endYear})
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] text-zinc-500 font-mono block uppercase">Circuit</label>
            <select
              value={selectedCircuitId}
              onChange={e => setSelectedCircuitId(Number(e.target.value))}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-[#e10600]"
            >
              {circuits.map(c => (
                <option key={c.circuitId} value={c.circuitId}>
                  {c.name} ({c.country})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-mono block uppercase">Era Start</label>
            <select
              value={startYear}
              onChange={e => setStartYear(Number(e.target.value))}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-white"
            >
              {[2018, 2019, 2020, 2021, 2022, 2023, 2024].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-mono block uppercase">Era End</label>
            <select
              value={endYear}
              onChange={e => setEndYear(Number(e.target.value))}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-medium text-white"
            >
              {[2021, 2022, 2023, 2024].filter(y => y >= startYear).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Primary Strategy Recommendation Card */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border-2 border-[#e10600]/40 rounded-xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-[#e10600]">
            <Compass className="w-4 h-4" />
            <span>Telemetry-Backed Strategy Recommendation</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-400 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
              Sample: n={sampleRaces} races ({totalClassified} drivers)
            </span>
            {sampleRaces < 3 && (
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Small Sample Caution
              </span>
            )}
          </div>
        </div>

        <h3 className="text-xl font-black text-white tracking-tight">
          {strategyRecommendation.verdict}
        </h3>
        <p className="text-sm text-zinc-300 mt-2 leading-relaxed max-w-4xl">
          {strategyRecommendation.details}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-800/80 font-mono text-xs">
          <div>
            <span className="text-zinc-500 block text-[10px]">RECOMMENDED STOPS</span>
            <span className="text-white font-bold text-base">{strategyRecommendation.optimalStops} Stop</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px]">CONFIDENCE LEVEL</span>
            <span className="text-emerald-400 font-bold text-base">{strategyRecommendation.confidence}</span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px]">OPTIMAL STOP 1 WINDOW</span>
            <span className="text-amber-400 font-bold text-base">
              {pitWindowDist.find(p => p.stopNumber === 1 && p.top5Count > 0) ? `Lap ${pitWindowDist.find(p => p.stopNumber === 1 && p.top5Count > 0)?.lap}` : 'Lap 19'}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px]">DEGRADATION PROFILE</span>
            <span className="text-zinc-200 font-bold text-base">
              {strategyRecommendation.optimalStops === 1 ? 'Thermal Limited' : 'Wear Limited'}
            </span>
          </div>
        </div>
      </div>

      {/* Strategy Comparison Cards (1-Stop vs 2-Stop vs 3-Stop) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {strategies.map(s => {
          const isRecommended = s.stops === strategyRecommendation.optimalStops;
          return (
            <div
              key={s.stops}
              className={`bg-zinc-900/70 border rounded-xl p-5 relative overflow-hidden transition ${
                isRecommended
                  ? 'border-[#e10600] ring-1 ring-[#e10600]/30 bg-zinc-900/90'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {isRecommended && (
                <div className="absolute top-0 right-0 bg-[#e10600] text-white text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-bl">
                  Optimal Choice
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <div className="text-base font-black text-white font-mono">
                  {s.stops}-Stop Strategy
                </div>
                <div className="text-xs text-zinc-500 font-mono">
                  n={s.count} cars
                </div>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Win Rate:</span>
                  <span className={`font-bold text-sm ${s.winRate > 0 ? 'text-amber-400' : 'text-zinc-500'}`}>
                    {s.winRate}% ({s.winCount} wins)
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Podium Rate:</span>
                  <span className="font-bold text-zinc-200">
                    {s.podiumRate}% ({s.podiumCount} podiums)
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Avg Points Scored:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {s.avgPoints} pts
                  </span>
                </div>

                <div className="flex justify-between items-center py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Avg Finishing Pos:</span>
                  <span className="font-bold text-zinc-300">
                    P{s.avgFinish}
                  </span>
                </div>

                <div className="flex justify-between items-center py-1">
                  <span className="text-zinc-400">Net Pos Gained:</span>
                  <span className={`font-bold ${s.positionsGained >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {s.positionsGained >= 0 ? `+${s.positionsGained}` : s.positionsGained} spots
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Optimal Pit Windows Histogram & Team Pit Crew Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Optimal Pit Lap Windows Histogram */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#e10600]" />
                Optimal Pit Lap Windows (Top-5 Finishers)
              </h3>
              <p className="text-xs text-zinc-400">
                Histogram of pit laps executed exclusively by race-winning and podium contenders
              </p>
            </div>
          </div>

          <div className="mt-4">
            {stop1HistogramData.length > 0 ? (
              <F1BarChart
                data={stop1HistogramData}
                height={230}
                valueSuffix=" cars"
                color="#e10600"
              />
            ) : (
              <div className="h-48 flex items-center justify-center text-zinc-500 text-xs font-mono">
                No pit stop window records found for this circuit in selected era
              </div>
            )}
          </div>

          <div className="mt-3 p-2.5 bg-zinc-950/60 border border-zinc-800/60 rounded text-xs text-zinc-400 flex items-start gap-2">
            <span className="text-[#e10600] font-mono font-bold shrink-0">INSIGHT:</span>
            <span>
              Red bars indicate peak laps when podium drivers pitted. Pitting earlier triggers the powerful "undercut", while pitting later protects tyre life for late-race combat.
            </span>
          </div>
        </div>

        {/* Right: Team Pit Stop Duration Benchmarks */}
        <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-emerald-400" />
                Pit Crew Speed Benchmark by Constructor
              </h3>
              <p className="text-xs text-zinc-400">
                Average stationary wheel-change duration (seconds) across modern era
              </p>
            </div>
          </div>

          <div className="mt-4">
            {teamPitChartData.length > 0 ? (
              <F1BarChart
                data={teamPitChartData}
                height={230}
                valueSuffix="s"
              />
            ) : (
              <div className="h-48 flex items-center justify-center text-zinc-500 text-xs font-mono">
                Loading team pit times...
              </div>
            )}
          </div>

          <div className="mt-3 p-2.5 bg-zinc-950/60 border border-zinc-800/60 rounded text-xs text-zinc-400 flex items-start gap-2">
            <span className="text-emerald-400 font-mono font-bold shrink-0">INSIGHT:</span>
            <span>
              Red Bull and McLaren consistently lead the pit lane below 2.4 seconds stationary. A 1.2-second pit advantage is often the exact margin that seals an undercut against Ferrari or Mercedes.
            </span>
          </div>
        </div>
      </div>

      {/* Safety Car Influence on Pit Timing */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          Safety Car &amp; Virtual Safety Car Pit Timing Leverage
        </h3>
        <p className="text-xs text-zinc-400 mb-4">
          How neutralizations alter optimal pit timing: under SC / VSC delta speeds, a pit stop costs ~10–12 seconds of track time versus ~21–23 seconds under green flag racing.
        </p>

        {circuitSafetyCars.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {circuitSafetyCars.map((sc, i) => (
              <div key={i} className="bg-zinc-950/80 border border-zinc-800 p-3.5 rounded-lg text-xs font-mono">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    sc.type === 'RED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {sc.type} Deployed
                  </span>
                  <span className="text-zinc-500">{sc.year} Season</span>
                </div>
                <div className="text-zinc-200 font-bold">
                  Lap {sc.deployedLap} → Lap {sc.retreatedLap} ({sc.lapsCount} Laps)
                </div>
                <div className="text-zinc-400 text-[11px] mt-1 font-sans">
                  Cause: {sc.cause}
                </div>
                <div className="text-emerald-400 text-[10px] mt-2 border-t border-zinc-800 pt-1">
                  Strategic Effect: "Free" Pit Window Opened
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-zinc-950/50 rounded-lg border border-zinc-800/60 text-xs text-zinc-400 flex items-center justify-between">
            <span>No safety car periods recorded at {selectedCircuit?.name} in the {startYear}–{endYear} window.</span>
            <span className="text-zinc-500 font-mono">Green flag baseline applies</span>
          </div>
        )}
      </div>
    </div>
  );
}
