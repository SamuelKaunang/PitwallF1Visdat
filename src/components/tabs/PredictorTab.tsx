import React, { useState, useMemo } from 'react';
import { Cpu, ArrowUpDown, Info, RefreshCw, Trophy, Zap, AlertCircle } from 'lucide-react';
import { F1Dataset } from '../../types/f1';
import { predictRaceOutcomes } from '../../utils/analytics';

export function PredictorTab({
  dataset
}: {
  dataset: F1Dataset;
}) {
  // Initial default grid: 2024 top drivers
  const defaultDrivers = [
    { driverId: 830, constructorId: 9 },   // Verstappen (Red Bull)
    { driverId: 846, constructorId: 1 },   // Norris (McLaren)
    { driverId: 844, constructorId: 6 },   // Leclerc (Ferrari)
    { driverId: 857, constructorId: 1 },   // Piastri (McLaren)
    { driverId: 832, constructorId: 6 },   // Sainz (Ferrari)
    { driverId: 847, constructorId: 131 }, // Russell (Mercedes)
    { driverId: 1, constructorId: 131 },   // Hamilton (Mercedes)
    { driverId: 815, constructorId: 9 },   // Perez (Red Bull)
    { driverId: 4, constructorId: 117 },   // Alonso (Aston Martin)
    { driverId: 852, constructorId: 213 }  // Tsunoda (RB)
  ];

  const [gridDrivers, setGridDrivers] = useState<Array<{ driverId: number; constructorId: number; qualiGapSec: number }>>(() => {
    return defaultDrivers.map((d, idx) => ({
      ...d,
      qualiGapSec: idx === 0 ? 0.0 : Math.round(idx * 0.085 * 1000) / 1000
    }));
  });

  // Run the probabilistic prediction model
  const predictions = useMemo(() => {
    const inputGrid = gridDrivers.map((d, idx) => ({
      driverId: d.driverId,
      constructorId: d.constructorId,
      gridPosition: idx + 1,
      qualiGapSec: d.qualiGapSec
    }));

    return predictRaceOutcomes(inputGrid, dataset);
  }, [gridDrivers, dataset]);

  // Move driver up in grid
  const moveDriver = (index: number, direction: 'up' | 'down') => {
    const newGrid = [...gridDrivers];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newGrid.length) return;

    const temp = newGrid[index];
    newGrid[index] = newGrid[targetIndex];
    newGrid[targetIndex] = temp;

    // Recalculate default quali gaps based on new positions
    newGrid.forEach((item, idx) => {
      item.qualiGapSec = idx === 0 ? 0.0 : Math.round(idx * 0.085 * 1000) / 1000;
    });

    setGridDrivers(newGrid);
  };

  // Change driver in a grid slot
  const changeDriverAtSlot = (slotIdx: number, newDriverId: number) => {
    const driver = dataset.drivers.find(d => d.driverId === newDriverId);
    const sampleResult = dataset.results.find(r => r.driverId === newDriverId);
    const constructorId = sampleResult?.constructorId || 9;

    const newGrid = [...gridDrivers];
    newGrid[slotIdx] = {
      driverId: newDriverId,
      constructorId,
      qualiGapSec: slotIdx === 0 ? 0.0 : Math.round(slotIdx * 0.085 * 1000) / 1000
    };
    setGridDrivers(newGrid);
  };

  const resetToDefaultGrid = () => {
    setGridDrivers(
      defaultDrivers.map((d, idx) => ({
        ...d,
        qualiGapSec: idx === 0 ? 0.0 : Math.round(idx * 0.085 * 1000) / 1000
      }))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#e10600] font-bold">
              Machine Learning &amp; Probabilistic Modeling
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Race Outcome &amp; Podium Probability Predictor
          </h2>
          <p className="text-xs text-zinc-400">
            Interactive multi-factor probabilistic simulation based on starting grid position, qualifying delta, and rolling team form
          </p>
        </div>

        <button
          onClick={resetToDefaultGrid}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-zinc-300 bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 rounded-lg transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Baseline Grid
        </button>
      </div>

      {/* Main Grid: Left Grid Editor vs Right Live Odds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Grid Setup (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-[#e10600]" />
                Configure Starting Grid (P1–P10)
              </h3>
              <p className="text-[11px] text-zinc-400">
                Reorder drivers or adjust delta seconds to simulate strategy outcomes
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {gridDrivers.map((slot, idx) => {
              const driver = dataset.drivers.find(d => d.driverId === slot.driverId);
              const team = dataset.constructors.find(c => c.constructorId === slot.constructorId);

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/80 gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded flex items-center justify-center font-mono text-xs font-black ${
                      idx === 0 ? 'bg-[#e10600] text-white' : 'bg-zinc-800 text-zinc-300'
                    }`}>
                      {idx + 1}
                    </span>
                    <select
                      value={slot.driverId}
                      onChange={e => changeDriverAtSlot(idx, Number(e.target.value))}
                      className="bg-transparent text-xs font-medium text-white focus:outline-none border-b border-zinc-700/60 pb-0.5"
                    >
                      {dataset.drivers.slice(0, 20).map(d => (
                        <option key={d.driverId} value={d.driverId} className="bg-zinc-900">
                          {d.forename} {d.surname} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      +{slot.qualiGapSec}s
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => moveDriver(idx, 'up')}
                        disabled={idx === 0}
                        className="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 text-[10px]"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveDriver(idx, 'down')}
                        disabled={idx === gridDrivers.length - 1}
                        className="w-5 h-5 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-300 text-[10px]"
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Live Probability Projections (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                Projected Win &amp; Podium Probabilities
              </h3>
              <p className="text-[11px] text-zinc-400">
                Simulated chances normalized across 10-car front field
              </p>
            </div>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded">
              Model Active
            </span>
          </div>

          <div className="space-y-3">
            {predictions.map((p, idx) => {
              const isFavorite = idx === 0;

              return (
                <div
                  key={p.driverId}
                  className={`p-3 rounded-lg border transition ${
                    isFavorite
                      ? 'bg-zinc-950 border-amber-500/40 ring-1 ring-amber-500/20'
                      : 'bg-zinc-950/50 border-zinc-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-zinc-500 text-[11px]">Grid P{p.gridPosition}</span>
                      <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: p.constructorColor }} />
                      <span className="font-bold text-white font-sans">{p.driverName}</span>
                      <span className="text-zinc-500 text-[11px]">({p.constructorName})</span>
                    </div>

                    <div className="flex items-center gap-4 font-mono font-bold">
                      <div className="text-right">
                        <span className="text-[9px] text-zinc-500 block">WIN PROB</span>
                        <span className={p.winProbability > 30 ? 'text-amber-400 text-sm' : 'text-zinc-200'}>
                          {p.winProbability}%
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-zinc-500 block">PODIUM</span>
                        <span className="text-emerald-400 text-sm">
                          {p.podiumProbability}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dual Progress Bars: Win (amber/crimson) and Podium (emerald) */}
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-[#e10600] to-amber-400 transition-all duration-300"
                        style={{ width: `${Math.min(100, p.winProbability * 1.5)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Methodology & Limitations Panel */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5">
        <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-sky-400" />
          Model Formulation &amp; Limitations Notice
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-zinc-300">
          <div className="bg-zinc-950/60 p-3.5 rounded border border-zinc-800 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Scoring Mechanics
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Calculates unnormalized win power <code className="text-zinc-200">W = exp(-0.42 * (Grid - 1)) * max(0.1, 1 - 0.7 * Gap) * Form_Driver * Form_Team</code>. Grid decay reflects the massive historical advantage of clean air in Turn 1, while recent 10-race rolling points weight constructor operational superiority.
            </p>
          </div>

          <div className="bg-zinc-950/60 p-3.5 rounded border border-zinc-800 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Known Statistical Limits
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Model assumes standard dry track conditions. Unexpected precipitation, Lap 1 multi-car accidents, and safety car restarts introduce stochastic variance that cannot be fully deterministic. Probabilities should guide race strategy risk assessments rather than guarantee outcomes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
