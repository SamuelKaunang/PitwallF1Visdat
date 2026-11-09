import React from 'react';
import { Flag, Activity, Wrench, GitCompare, BarChart3, ShieldAlert, Cpu, Upload, Download, Info } from 'lucide-react';
import { F1Dataset } from '../types/f1';

export type TabKey =
  | 'overview'
  | 'race_explorer'
  | 'pit_strategy'
  | 'quali_vs_race'
  | 'head_to_head'
  | 'reliability'
  | 'predictor';

interface NavbarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  dataset: F1Dataset;
  onOpenUpload: () => void;
  onOpenAbout: () => void;
  onExportCurrent: () => void;
}

export function Navbar({
  activeTab,
  onTabChange,
  dataset,
  onOpenUpload,
  onOpenAbout,
  onExportCurrent
}: NavbarProps) {
  const tabs = [
    { key: 'overview' as TabKey, label: 'Overview', icon: BarChart3 },
    { key: 'race_explorer' as TabKey, label: 'Race Explorer', icon: Activity },
    { key: 'pit_strategy' as TabKey, label: 'Pit Strategy', icon: Wrench, isPrimary: true },
    { key: 'quali_vs_race' as TabKey, label: 'Quali vs Race', icon: Flag },
    { key: 'head_to_head' as TabKey, label: 'Head-to-Head', icon: GitCompare },
    { key: 'reliability' as TabKey, label: 'Reliability & DNFs', icon: ShieldAlert },
    { key: 'predictor' as TabKey, label: 'Outcome Predictor', icon: Cpu }
  ];

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/90 border-b border-zinc-800/80 backdrop-blur-md">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#e10600] to-rose-700 flex items-center justify-center text-white shadow-lg shadow-[#e10600]/20 font-black italic tracking-tighter">
              F1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white font-mono">
                  PitWall <span className="text-[#e10600]">IQ</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-mono font-bold tracking-wider bg-zinc-800 text-zinc-300 rounded border border-zinc-700">
                  AQX Data Bowl
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Strategy Optimization &amp; Predictive Telemetry Dashboard
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Data Source indicator */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400">
              <span className={`w-2 h-2 rounded-full ${dataset.isCustomUpload ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
              <span className="font-mono">
                {dataset.isCustomUpload ? 'Custom Archive' : 'Ergast/Jolpica Core'}
              </span>
            </div>

            {/* Export CSV button */}
            <button
              onClick={onExportCurrent}
              title="Download current chart data as CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded transition"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Upload ZIP / CSV button */}
            <button
              onClick={onOpenUpload}
              title="Upload Ergast ZIP dataset"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded transition"
            >
              <Upload className="w-3.5 h-3.5 text-[#e10600]" />
              <span className="hidden sm:inline">Upload ZIP</span>
            </button>

            {/* About Modal */}
            <button
              onClick={onOpenAbout}
              title="About dataset and methods"
              className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded transition"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none border-t border-zinc-800/40">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded transition whitespace-nowrap ${
                  isActive
                    ? 'bg-[#e10600] text-white shadow-md shadow-[#e10600]/25 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                } ${tab.isPrimary && !isActive ? 'border border-[#e10600]/30 text-zinc-200' : ''}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.isPrimary ? 'text-[#e10600]' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
                {tab.isPrimary && (
                  <span className={`text-[9px] px-1 rounded uppercase font-bold tracking-tighter ${isActive ? 'bg-white/20 text-white' : 'bg-[#e10600]/20 text-[#e10600]'}`}>
                    Main
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
