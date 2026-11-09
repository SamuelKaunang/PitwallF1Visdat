/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { F1Dataset } from './types/f1';
import { buildDataset } from './data/bundledF1Data';
import { Navbar, TabKey } from './components/Navbar';
import { OverviewTab } from './components/tabs/OverviewTab';
import { RaceExplorerTab } from './components/tabs/RaceExplorerTab';
import { PitStrategyTab } from './components/tabs/PitStrategyTab';
import { QualiVsRaceTab } from './components/tabs/QualiVsRaceTab';
import { HeadToHeadTab } from './components/tabs/HeadToHeadTab';
import { ReliabilityTab } from './components/tabs/ReliabilityTab';
import { PredictorTab } from './components/tabs/PredictorTab';
import { UploadModal } from './components/UploadModal';
import { AboutModal } from './components/AboutModal';
import { exportToCSV, calculateOvertakingMetrics, calculateConstructorReliability, calculateStrategyStats } from './utils/analytics';

export default function App() {
  // Master F1 dataset state, initialized with bundled Ergast core
  const [dataset, setDataset] = useState<F1Dataset>(() => buildDataset());

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<TabKey>('pit_strategy');

  // Selected race ID for linking from Overview into Race Explorer
  const [targetRaceId, setTargetRaceId] = useState<number | undefined>(undefined);

  // Modal dialog states
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Handle navigating from a calendar race click
  const handleSelectRace = (raceId: number) => {
    setTargetRaceId(raceId);
    setActiveTab('race_explorer');
  };

  // Export CSV handler for active tab data
  const handleExportCurrent = () => {
    switch (activeTab) {
      case 'overview': {
        const rows = dataset.races.map(r => {
          const res = dataset.results.find(res => res.raceId === r.raceId && res.positionOrder === 1);
          const d = dataset.drivers.find(drv => drv.driverId === res?.driverId);
          const c = dataset.constructors.find(con => con.constructorId === res?.constructorId);
          return {
            Year: r.year,
            Round: r.round,
            RaceName: r.name,
            Date: r.date,
            Winner: d ? `${d.forename} ${d.surname}` : 'Unknown',
            Constructor: c?.name || 'Unknown',
            GridPosition: res?.grid || 0
          };
        });
        exportToCSV('f1_races_and_winners', rows);
        break;
      }
      case 'race_explorer': {
        const race = dataset.races[0];
        const rows = dataset.results.filter(r => r.raceId === (targetRaceId || race.raceId)).map(r => {
          const d = dataset.drivers.find(drv => drv.driverId === r.driverId);
          const c = dataset.constructors.find(con => con.constructorId === r.constructorId);
          return {
            Position: r.positionOrder,
            Driver: d ? `${d.forename} ${d.surname}` : 'Driver',
            Code: d?.code || 'DRV',
            Team: c?.name || 'Constructor',
            Grid: r.grid,
            Points: r.points,
            Laps: r.laps,
            StatusId: r.statusId
          };
        });
        exportToCSV('f1_race_classification', rows);
        break;
      }
      case 'pit_strategy': {
        const stats = calculateStrategyStats(dataset, 14, 2021, 2024);
        const rows = stats.strategies.map(s => ({
          Stops: s.stops,
          CarCount: s.count,
          WinRatePct: s.winRate,
          PodiumRatePct: s.podiumRate,
          AvgFinishPos: s.avgFinish,
          AvgPoints: s.avgPoints,
          NetPositionsGained: s.positionsGained
        }));
        exportToCSV('f1_pit_strategy_benchmarks', rows);
        break;
      }
      case 'quali_vs_race': {
        const metrics = calculateOvertakingMetrics(dataset);
        const rows = metrics.map(m => ({
          CircuitName: m.circuitName,
          Country: m.circuitCountry,
          OvertakeDifficultyScore: m.overtakeDifficultyScore,
          PoleWinRatePct: m.poleWinRate,
          Top3PodiumRatePct: m.top3GridPodiumRate,
          AvgPositionsChanged: m.avgPositionsChangedPerCar,
          SampleRaces: m.sampleRaces
        }));
        exportToCSV('f1_overtaking_difficulty_index', rows);
        break;
      }
      case 'reliability': {
        const rel = calculateConstructorReliability(dataset, 2021, 2024);
        const rows = rel.map(r => ({
          Constructor: r.constructorName,
          TotalStarts: r.starts,
          Finishes: r.finishes,
          DnfRatePct: r.dnfRate,
          MechanicalDnfPct: r.mechRate,
          CollisionDnfPct: r.collisionRate,
          FinishRatePct: r.finishRate
        }));
        exportToCSV('f1_constructor_reliability', rows);
        break;
      }
      default: {
        const rows = dataset.constructors.map(c => ({
          Id: c.constructorId,
          Name: c.name,
          Nationality: c.nationality
        }));
        exportToCSV('f1_data_export', rows);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0d] text-zinc-100 flex flex-col font-sans selection:bg-[#e10600] selection:text-white">
      {/* Sticky Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dataset={dataset}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onExportCurrent={handleExportCurrent}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && (
          <OverviewTab
            dataset={dataset}
            onSelectRace={handleSelectRace}
          />
        )}

        {activeTab === 'race_explorer' && (
          <RaceExplorerTab
            dataset={dataset}
            initialRaceId={targetRaceId}
          />
        )}

        {activeTab === 'pit_strategy' && (
          <PitStrategyTab
            dataset={dataset}
          />
        )}

        {activeTab === 'quali_vs_race' && (
          <QualiVsRaceTab
            dataset={dataset}
          />
        )}

        {activeTab === 'head_to_head' && (
          <HeadToHeadTab
            dataset={dataset}
          />
        )}

        {activeTab === 'reliability' && (
          <ReliabilityTab
            dataset={dataset}
          />
        )}

        {activeTab === 'predictor' && (
          <PredictorTab
            dataset={dataset}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-4 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            PitWall IQ • Formula 1 Strategy &amp; Predictive Analytics
          </div>
          <div>
            Data sourced from Ergast / Jolpica F1 Developer DB (CC0 1.0)
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        dataset={dataset}
        onDatasetUpdated={newDataset => {
          setDataset(newDataset);
        }}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />
    </div>
  );
}
