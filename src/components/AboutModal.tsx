import React from 'react';
import { Info, X, Database, Crosshair, Wrench, ShieldAlert } from 'lucide-react';

export function AboutModal({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#e10600]/10 border border-[#e10600]/30 flex items-center justify-center text-[#e10600]">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">About PitWall IQ</h2>
              <p className="text-xs text-zinc-400">AQX Data Bowl • F1 Race Strategy &amp; Predictive Analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-sm text-zinc-300">
          {/* Problem Statement */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#e10600] font-bold flex items-center gap-2">
              <Crosshair className="w-4 h-4" /> The Strategic Problem
            </h3>
            <p className="text-xs leading-relaxed text-zinc-300">
              In modern Formula 1, races are routinely won and lost on the pit wall. Teams battle with tyre degradation cliffs, safety car probability windows, and circuit overtaking bottlenecks. <strong className="text-white">PitWall IQ</strong> converts raw Ergast/Jolpica telemetry and historical results into actionable recommendations: identifying the true optimal pit stop count per circuit, isolating race-winning pit lap windows, and quantifying the actual value of grid position versus race pace.
            </p>
          </div>

          {/* Data Sources */}
          <div className="space-y-2 border-t border-zinc-800 pt-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" /> Data Source &amp; Open License
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              Built on the canonical <strong className="text-zinc-200">Ergast Developer Database</strong> and the community maintained <strong className="text-zinc-200">Jolpica-F1</strong> dataset. All historical lap times, pit stop durations, grid orders, and race results are distributed under the <span className="text-emerald-400 font-mono">CC0 1.0 Universal (Public Domain)</span> license.
            </p>
          </div>

          {/* Analytical Methodology */}
          <div className="space-y-3 border-t border-zinc-800 pt-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-400" /> Analytical Methodology
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-zinc-950/60 p-3 rounded border border-zinc-800">
                <div className="font-semibold text-white mb-1">Optimal Pit Lap Windows</div>
                <div className="text-zinc-400 text-[11px] leading-relaxed">
                  Calculated by isolating pit stop occurrences exclusively among <span className="text-zinc-200 font-medium">Top-5 classified finishers</span> to remove traffic-bound and compromised strategies from the optimal pit distribution.
                </div>
              </div>
              <div className="bg-zinc-950/60 p-3 rounded border border-zinc-800">
                <div className="font-semibold text-white mb-1">Overtaking Difficulty Score</div>
                <div className="text-zinc-400 text-[11px] leading-relaxed">
                  A standardized index (1.0 to 10.0) combining average position delta per starter, pole-to-win conversion frequency, and top-3 grid to podium retention rates.
                </div>
              </div>
              <div className="bg-zinc-950/60 p-3 rounded border border-zinc-800">
                <div className="font-semibold text-white mb-1">Mechanical vs. Incident DNFs</div>
                <div className="text-zinc-400 text-[11px] leading-relaxed">
                  Classifies 140+ Ergast status IDs into structural mechanical failures (power unit, gearbox, hydraulics, brakes) vs racing incidents (collisions, spins, crash damage).
                </div>
              </div>
              <div className="bg-zinc-950/60 p-3 rounded border border-zinc-800">
                <div className="font-semibold text-white mb-1">Race Outcome Predictor</div>
                <div className="text-zinc-400 text-[11px] leading-relaxed">
                  A transparent scoring model evaluating grid degradation odds, qualifying delta seconds, and rolling 10-race constructor &amp; driver form to compute win &amp; podium probabilities.
                </div>
              </div>
            </div>
          </div>

          {/* Sample Size & Limitations */}
          <div className="space-y-2 border-t border-zinc-800 pt-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> Sample Sizes &amp; Limitations
            </h3>
            <p className="text-xs leading-relaxed text-zinc-400">
              All statistical aggregates clearly display their sample size (<span className="text-zinc-200 font-mono">n races</span>). When samples are fewer than 3 events (e.g. newer tracks like Las Vegas or Qatar), a caution badge is highlighted. Limitations include unmodeled sudden rain showers, Lap 1 Turn 1 multi-car pileups, and unpredictable Red Flag restart neutralizations.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 bg-zinc-950/60 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="text-xs bg-[#e10600] hover:bg-[#c70500] text-white font-medium px-4 py-2 rounded transition"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
