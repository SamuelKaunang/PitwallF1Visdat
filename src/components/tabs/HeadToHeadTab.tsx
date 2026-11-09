import React, { useState, useMemo } from 'react';
import { GitCompare, Trophy, Award, Zap, ShieldAlert, Timer, Check, Sparkles } from 'lucide-react';
import { F1Dataset } from '../../types/f1';
import { compareDrivers } from '../../utils/analytics';
import { F1RadarChart } from '../charts/F1Charts';

export function HeadToHeadTab({
  dataset
}: {
  dataset: F1Dataset;
}) {
  const drivers = useMemo(() => {
    return [...dataset.drivers].sort((a, b) => a.surname.localeCompare(b.surname));
  }, [dataset.drivers]);

  // Default: Verstappen (830) vs Norris (846) or Hamilton (1)
  const [driver1Id, setDriver1Id] = useState<number>(() => {
    return drivers.find(d => d.driverId === 830)?.driverId || drivers[0]?.driverId || 830;
  });

  const [driver2Id, setDriver2Id] = useState<number>(() => {
    return drivers.find(d => d.driverId === 846)?.driverId || drivers[1]?.driverId || 846;
  });

  const [startYear, setStartYear] = useState<number>(2021);
  const [endYear, setEndYear] = useState<number>(2024);

  // Compute head to head statistics
  const comparison = useMemo(() => {
    return compareDrivers(dataset, driver1Id, driver2Id, startYear, endYear);
  }, [dataset, driver1Id, driver2Id, startYear, endYear]);

  // Find teams for colors
  const d1Team = useMemo(() => {
    const res = dataset.results.find(r => r.driverId === driver1Id);
    return dataset.constructors.find(c => c.constructorId === res?.constructorId);
  }, [dataset, driver1Id]);

  const d2Team = useMemo(() => {
    const res = dataset.results.find(r => r.driverId === driver2Id);
    return dataset.constructors.find(c => c.constructorId === res?.constructorId);
  }, [dataset, driver2Id]);

  // Radar metrics normalized 0-100
  const radarMetrics = ['Race Wins', 'Podium Rate', 'Quali H2H', 'Race H2H', 'Points/Race', 'Reliability'];

  const radarData1 = useMemo(() => {
    const d = comparison.d1;
    const races = Math.max(1, d.totalRaces);
    const winRate = Math.min(100, (d.wins / races) * 200);
    const podRate = Math.min(100, (d.podiums / races) * 120);
    const qualiRate = Math.min(100, (d.aheadInQuali / Math.max(1, comparison.commonRacesCount)) * 100);
    const raceH2H = Math.min(100, (d.aheadInRace / Math.max(1, comparison.commonRacesCount)) * 100);
    const ppr = Math.min(100, (d.points / races) * 4);
    const rel = Math.max(10, 100 - d.dnfRate * 2);
    return [Math.round(winRate), Math.round(podRate), Math.round(qualiRate), Math.round(raceH2H), Math.round(ppr), Math.round(rel)];
  }, [comparison]);

  const radarData2 = useMemo(() => {
    const d = comparison.d2;
    const races = Math.max(1, d.totalRaces);
    const winRate = Math.min(100, (d.wins / races) * 200);
    const podRate = Math.min(100, (d.podiums / races) * 120);
    const qualiRate = Math.min(100, (d.aheadInQuali / Math.max(1, comparison.commonRacesCount)) * 100);
    const raceH2H = Math.min(100, (d.aheadInRace / Math.max(1, comparison.commonRacesCount)) * 100);
    const ppr = Math.min(100, (d.points / races) * 4);
    const rel = Math.max(10, 100 - d.dnfRate * 2);
    return [Math.round(winRate), Math.round(podRate), Math.round(qualiRate), Math.round(raceH2H), Math.round(ppr), Math.round(rel)];
  }, [comparison]);

  // Dynamic plain-language comparative summary
  const summaryVerdict = useMemo(() => {
    const d1Name = comparison.driver1?.surname || 'Driver 1';
    const d2Name = comparison.driver2?.surname || 'Driver 2';

    if (comparison.commonRacesCount === 0) {
      return `No common Grand Prix starts found between ${d1Name} and ${d2Name} in the ${startYear}–${endYear} era.`;
    }

    const raceAdv = comparison.d1.aheadInRace > comparison.d2.aheadInRace ? d1Name : d2Name;
    const qualiAdv = comparison.d1.aheadInQuali > comparison.d2.aheadInQuali ? d1Name : d2Name;
    const raceDiff = Math.abs(comparison.d1.aheadInRace - comparison.d2.aheadInRace);
    const qualiDiff = Math.abs(comparison.d1.aheadInQuali - comparison.d2.aheadInQuali);

    if (raceAdv === qualiAdv) {
      return `Across ${comparison.commonRacesCount} head-to-head races (${startYear}–${endYear}), ${raceAdv} demonstrated comprehensive dominance, finishing ahead in ${Math.max(comparison.d1.aheadInRace, comparison.d2.aheadInRace)} Grand Prix and out-qualifying their rival ${Math.max(comparison.d1.aheadInQuali, comparison.d2.aheadInQuali)} times.`;
    }

    return `Across ${comparison.commonRacesCount} head-to-head races (${startYear}–${endYear}), ${raceAdv} held the Sunday race execution edge (+${raceDiff} ahead in race trim), while ${qualiAdv} proved faster in Saturday qualifying (+${qualiDiff} on the grid).`;
  }, [comparison, startYear, endYear]);

  return (
    <div className="space-y-6">
      {/* Driver Selectors Banner */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 p-5 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#e10600] font-bold">
              Driver Rivalry Comparator
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Head-to-Head Performance Benchmark
          </h2>
          <p className="text-xs text-zinc-400">
            Contested {comparison.commonRacesCount} Grand Prix together ({startYear}–{endYear})
          </p>
        </div>

        {/* Global Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] text-zinc-500 font-mono block uppercase">Driver 1</label>
            <select
              value={driver1Id}
              onChange={e => setDriver1Id(Number(e.target.value))}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white"
            >
              {drivers.map(d => (
                <option key={d.driverId} value={d.driverId}>
                  {d.forename} {d.surname} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="text-zinc-600 font-bold self-end pb-2">VS</div>

          <div>
            <label className="text-[10px] text-zinc-500 font-mono block uppercase">Driver 2</label>
            <select
              value={driver2Id}
              onChange={e => setDriver2Id(Number(e.target.value))}
              className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-white"
            >
              {drivers.map(d => (
                <option key={d.driverId} value={d.driverId}>
                  {d.forename} {d.surname} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-zinc-500 font-mono block uppercase">Era Range</label>
            <div className="flex items-center gap-1">
              <select
                value={startYear}
                onChange={e => setStartYear(Number(e.target.value))}
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
              >
                {[2018, 2019, 2020, 2021, 2022, 2023, 2024].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <span className="text-zinc-500 text-xs">-</span>
              <select
                value={endYear}
                onChange={e => setEndYear(Number(e.target.value))}
                className="bg-zinc-950 border border-zinc-700 rounded-lg px-2 py-1 text-xs font-mono text-white"
              >
                {[2021, 2022, 2023, 2024].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Summary Card */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-[#e10600]/40 rounded-xl p-5 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#e10600] shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-mono uppercase font-bold text-[#e10600]">Strategic Verdict</div>
          <p className="text-sm text-zinc-200 mt-1 leading-relaxed font-medium">
            {summaryVerdict}
          </p>
        </div>
      </div>

      {/* Main Grid: Comparison Metrics & Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Detailed Metric Battle Cards (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-3 text-center border-b border-zinc-800 pb-3">
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: d1Team?.color || '#3671C6' }} />
                <span className="font-black text-sm text-white">
                  {comparison.driver1?.forename} {comparison.driver1?.surname}
                </span>
              </div>
              <div className="text-[11px] text-zinc-500">{d1Team?.name}</div>
            </div>

            <div className="text-xs font-mono uppercase text-zinc-500 font-bold self-center">
              Metric
            </div>

            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="font-black text-sm text-white">
                  {comparison.driver2?.forename} {comparison.driver2?.surname}
                </span>
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: d2Team?.color || '#FF8000' }} />
              </div>
              <div className="text-[11px] text-zinc-500">{d2Team?.name}</div>
            </div>
          </div>

          {/* Metric Rows */}
          <div className="space-y-3 font-mono text-xs">
            <MetricRow
              label="Race Wins"
              val1={comparison.d1.wins}
              val2={comparison.d2.wins}
              color1={d1Team?.color}
              color2={d2Team?.color}
            />

            <MetricRow
              label="Podiums"
              val1={comparison.d1.podiums}
              val2={comparison.d2.podiums}
              color1={d1Team?.color}
              color2={d2Team?.color}
            />

            <MetricRow
              label="Finished Ahead (Race)"
              val1={comparison.d1.aheadInRace}
              val2={comparison.d2.aheadInRace}
              color1={d1Team?.color}
              color2={d2Team?.color}
              highlight
            />

            <MetricRow
              label="Qualified Ahead (Grid)"
              val1={comparison.d1.aheadInQuali}
              val2={comparison.d2.aheadInQuali}
              color1={d1Team?.color}
              color2={d2Team?.color}
              highlight
            />

            <MetricRow
              label="Total Championship Points"
              val1={comparison.d1.points}
              val2={comparison.d2.points}
              color1={d1Team?.color}
              color2={d2Team?.color}
            />

            <MetricRow
              label="Average Finish Position"
              val1={`P${comparison.d1.avgFinish}`}
              val2={`P${comparison.d2.avgFinish}`}
              color1={d1Team?.color}
              color2={d2Team?.color}
              reverseBetter
              num1={comparison.d1.avgFinish}
              num2={comparison.d2.avgFinish}
            />

            <MetricRow
              label="DNF Attrition Rate"
              val1={`${comparison.d1.dnfRate}%`}
              val2={`${comparison.d2.dnfRate}%`}
              color1={d1Team?.color}
              color2={d2Team?.color}
              reverseBetter
              num1={comparison.d1.dnfRate}
              num2={comparison.d2.dnfRate}
            />
          </div>
        </div>

        {/* Right: Radar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-[#e10600]" />
              Multi-Axis Radar Comparison
            </h3>
            <p className="text-xs text-zinc-400">
              Normalized index across pace, qualifying speed, and reliability
            </p>
          </div>

          <div className="my-2">
            <F1RadarChart
              driver1Name={comparison.driver1?.surname || 'Driver 1'}
              driver1Color={d1Team?.color || '#3671C6'}
              driver1Stats={radarData1}
              driver2Name={comparison.driver2?.surname || 'Driver 2'}
              driver2Color={d2Team?.color || '#FF8000'}
              driver2Stats={radarData2}
              metrics={radarMetrics}
            />
          </div>

          <div className="p-2 bg-zinc-950/60 border border-zinc-800/60 rounded text-[11px] text-zinc-500 font-mono text-center">
            Scores normalized 0-100 relative to career peer groups
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricRow({
  label,
  val1,
  val2,
  color1 = '#3671C6',
  color2 = '#FF8000',
  highlight = false,
  reverseBetter = false,
  num1,
  num2
}: {
  label: string;
  val1: string | number;
  val2: string | number;
  color1?: string;
  color2?: string;
  highlight?: boolean;
  reverseBetter?: boolean;
  num1?: number;
  num2?: number;
}) {
  const n1 = num1 !== undefined ? num1 : Number(val1);
  const n2 = num2 !== undefined ? num2 : Number(val2);

  const isD1Better = reverseBetter ? n1 < n2 : n1 > n2;
  const isD2Better = reverseBetter ? n2 < n1 : n2 > n1;

  return (
    <div className={`flex items-center justify-between p-2.5 rounded ${highlight ? 'bg-zinc-950/80 border border-zinc-800' : 'bg-zinc-950/40'}`}>
      <div className={`w-20 text-left font-bold ${isD1Better ? 'text-white' : 'text-zinc-400'}`}>
        <span className="px-2 py-0.5 rounded" style={{ backgroundColor: isD1Better ? `${color1}30` : undefined }}>
          {val1}
        </span>
      </div>

      <div className="text-center font-sans text-zinc-400 text-[11px] font-medium">
        {label}
      </div>

      <div className={`w-20 text-right font-bold ${isD2Better ? 'text-white' : 'text-zinc-400'}`}>
        <span className="px-2 py-0.5 rounded" style={{ backgroundColor: isD2Better ? `${color2}30` : undefined }}>
          {val2}
        </span>
      </div>
    </div>
  );
}
