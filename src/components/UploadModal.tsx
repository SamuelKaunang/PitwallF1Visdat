import React, { useState } from 'react';
import { Upload, FileArchive, CheckCircle2, AlertCircle, RefreshCw, X } from 'lucide-react';
import { parseF1Zip, ParseProgress } from '../utils/zipParser';
import { F1Dataset } from '../types/f1';
import { buildDataset } from '../data/bundledF1Data';

export function UploadModal({
  isOpen,
  onClose,
  dataset,
  onDatasetUpdated
}: {
  isOpen: boolean;
  onClose: () => void;
  dataset: F1Dataset;
  onDatasetUpdated: (newDataset: F1Dataset) => void;
}) {
  const [isParsing, setIsParsing] = useState(false);
  const [progress, setProgress] = useState<ParseProgress | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setErrorMsg(null);
    setSuccessInfo(null);

    try {
      const parsedData = await parseF1Zip(file, p => {
        setProgress(p);
      });

      onDatasetUpdated(parsedData);
      setSuccessInfo(`Successfully imported ${parsedData.races.length} races and ${parsedData.results.length} results from ${file.name}`);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to parse ZIP file. Ensure it contains valid Ergast CSV tables.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleResetToBundled = () => {
    const bundled = buildDataset();
    onDatasetUpdated(bundled);
    setSuccessInfo('Restored official bundled F1 dataset (2021-2024 modern era).');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#e10600]/10 border border-[#e10600]/30 flex items-center justify-center text-[#e10600]">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">Dataset Management</h2>
              <p className="text-xs text-zinc-400">Load Ergast / Jolpica F1 CSV archives or restore defaults</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Dataset Status */}
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-lg p-4">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span className="font-mono uppercase tracking-wider text-zinc-500">Active Dataset Status</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${dataset.isCustomUpload ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'}`}>
                {dataset.isCustomUpload ? 'Custom Upload Active' : 'Official Bundled Core'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1 text-center">
              <div className="bg-zinc-900/60 rounded p-2">
                <div className="text-lg font-bold font-mono text-white">{dataset.races.length}</div>
                <div className="text-[10px] text-zinc-400 uppercase">Races</div>
              </div>
              <div className="bg-zinc-900/60 rounded p-2">
                <div className="text-lg font-bold font-mono text-white">{dataset.results.length}</div>
                <div className="text-[10px] text-zinc-400 uppercase">Results</div>
              </div>
              <div className="bg-zinc-900/60 rounded p-2">
                <div className="text-lg font-bold font-mono text-white">{dataset.pitStops.length}</div>
                <div className="text-[10px] text-zinc-400 uppercase">Pit Stops</div>
              </div>
            </div>
          </div>

          {/* Upload Drop Area */}
          <div className="relative border-2 border-dashed border-zinc-700/80 hover:border-[#e10600] rounded-xl p-8 text-center transition bg-zinc-950/40 group">
            <input
              type="file"
              accept=".zip,.csv"
              onChange={handleFileUpload}
              disabled={isParsing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex flex-col items-center pointer-events-none">
              <FileArchive className="w-10 h-10 text-zinc-500 group-hover:text-[#e10600] transition mb-3" />
              <div className="text-sm font-semibold text-zinc-200">
                Click or drag &amp; drop Ergast ZIP archive
              </div>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                Supports standard Ergast CSV files (circuits, races, results, pit_stops, lap_times, qualifying, status).
              </p>
            </div>
          </div>

          {/* Parsing progress */}
          {isParsing && progress && (
            <div className="space-y-2 bg-zinc-950/90 border border-zinc-800 p-4 rounded-lg">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300 font-mono flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#e10600]" />
                  {progress.step}
                </span>
                <span className="font-mono text-[#e10600] font-bold">{progress.percent}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#e10600] transition-all duration-200 rounded-full"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {successInfo && (
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-lg">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successInfo}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/30 border border-rose-800/40 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleResetToBundled}
              disabled={isParsing}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-3 py-1.5 rounded border border-zinc-800 hover:border-zinc-700 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset to Bundled Core
            </button>
            <button
              onClick={onClose}
              className="text-xs bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-4 py-2 rounded transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
