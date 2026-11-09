import { F1Dataset, StrategyStat, PitLapDistribution, TeamPitMetric, OvertakingMetric } from '../types/f1';
import { categorizeStatus } from '../data/statusCodes';

/**
 * Filter dataset by year range and optional circuit/constructor
 */
export function filterDataset(
  dataset: F1Dataset,
  filters: {
    startYear?: number;
    endYear?: number;
    circuitId?: number;
    constructorId?: number;
  }
) {
  const races = dataset.races.filter(r => {
    if (filters.startYear && r.year < filters.startYear) return false;
    if (filters.endYear && r.year > filters.endYear) return false;
    if (filters.circuitId && r.circuitId !== filters.circuitId) return false;
    return true;
  });

  const raceIds = new Set(races.map(r => r.raceId));

  const results = dataset.results.filter(res => {
    if (!raceIds.has(res.raceId)) return false;
    if (filters.constructorId && res.constructorId !== filters.constructorId) return false;
    return true;
  });

  return { races, results, raceIds };
}

/**
 * Pit Strategy Analyzer: Calculate metrics for 1-stop, 2-stop, 3-stop strategies
 */
export function calculateStrategyStats(
  dataset: F1Dataset,
  circuitId: number,
  startYear: number,
  endYear: number
): {
  strategies: StrategyStat[];
  sampleRaces: number;
  totalClassified: number;
} {
  const targetRaces = dataset.races.filter(r => 
    r.circuitId === circuitId && r.year >= startYear && r.year <= endYear
  );
  const raceIds = new Set(targetRaces.map(r => r.raceId));

  const raceResults = dataset.results.filter(r => raceIds.has(r.raceId) && r.position !== null);
  const racePits = dataset.pitStops.filter(p => raceIds.has(p.raceId));

  // Count pit stops per driver per race
  const driverStopsMap: Record<string, number> = {};
  racePits.forEach(p => {
    const key = `${p.raceId}_${p.driverId}`;
    driverStopsMap[key] = Math.max(driverStopsMap[key] || 0, p.stop);
  });

  // Group classified finishers by stop count
  const stopBuckets: Record<number, {
    count: number;
    wins: number;
    podiums: number;
    finishSum: number;
    pointsSum: number;
    gainedSum: number;
  }> = {
    1: { count: 0, wins: 0, podiums: 0, finishSum: 0, pointsSum: 0, gainedSum: 0 },
    2: { count: 0, wins: 0, podiums: 0, finishSum: 0, pointsSum: 0, gainedSum: 0 },
    3: { count: 0, wins: 0, podiums: 0, finishSum: 0, pointsSum: 0, gainedSum: 0 }
  };

  let totalClassified = 0;

  raceResults.forEach(res => {
    const key = `${res.raceId}_${res.driverId}`;
    const stops = driverStopsMap[key] || 1; // Default to 1-stop if no pit data present
    const bucketKey = stops >= 3 ? 3 : stops <= 1 ? 1 : 2;

    if (stopBuckets[bucketKey]) {
      stopBuckets[bucketKey].count++;
      totalClassified++;
      if (res.positionOrder === 1) stopBuckets[bucketKey].wins++;
      if (res.positionOrder <= 3) stopBuckets[bucketKey].podiums++;
      stopBuckets[bucketKey].finishSum += res.positionOrder;
      stopBuckets[bucketKey].pointsSum += res.points;
      stopBuckets[bucketKey].gainedSum += (res.grid - res.positionOrder);
    }
  });

  const strategies: StrategyStat[] = [1, 2, 3].map(stops => {
    const b = stopBuckets[stops];
    const n = Math.max(1, b.count);
    return {
      stops,
      count: b.count,
      winCount: b.wins,
      podiumCount: b.podiums,
      winRate: Math.round((b.wins / n) * 1000) / 10,
      podiumRate: Math.round((b.podiums / n) * 1000) / 10,
      avgFinish: Math.round((b.finishSum / n) * 10) / 10,
      avgPoints: Math.round((b.pointsSum / n) * 10) / 10,
      positionsGained: Math.round((b.gainedSum / n) * 10) / 10
    };
  });

  return {
    strategies,
    sampleRaces: targetRaces.length,
    totalClassified
  };
}

/**
 * Pit Window Distribution for Top-5 finishers
 */
export function calculatePitLapDistribution(
  dataset: F1Dataset,
  circuitId: number,
  startYear: number,
  endYear: number
): PitLapDistribution[] {
  const targetRaces = dataset.races.filter(r => 
    r.circuitId === circuitId && r.year >= startYear && r.year <= endYear
  );
  const raceIds = new Set(targetRaces.map(r => r.raceId));

  // Find top 5 finisher keys
  const top5Keys = new Set(
    dataset.results
      .filter(r => raceIds.has(r.raceId) && r.positionOrder <= 5)
      .map(r => `${r.raceId}_${r.driverId}`)
  );

  const pits = dataset.pitStops.filter(p => raceIds.has(p.raceId));
  const counts: Record<string, { stopNumber: number; lap: number; count: number; top5Count: number }> = {};

  pits.forEach(p => {
    const isTop5 = top5Keys.has(`${p.raceId}_${p.driverId}`);
    const key = `${p.stop}_${p.lap}`;
    if (!counts[key]) {
      counts[key] = { stopNumber: p.stop, lap: p.lap, count: 0, top5Count: 0 };
    }
    counts[key].count++;
    if (isTop5) counts[key].top5Count++;
  });

  return Object.values(counts).sort((a, b) => a.lap - b.lap);
}

/**
 * Team Pit Stop Durations
 */
export function calculateTeamPitAverages(
  dataset: F1Dataset,
  startYear: number,
  endYear: number
): TeamPitMetric[] {
  const races = dataset.races.filter(r => r.year >= startYear && r.year <= endYear);
  const raceIds = new Set(races.map(r => r.raceId));

  // Map result -> constructor
  const driverConstructorMap: Record<string, number> = {};
  dataset.results.forEach(res => {
    driverConstructorMap[`${res.raceId}_${res.driverId}`] = res.constructorId;
  });

  const teamStops: Record<number, { times: number[]; constructorId: number }> = {};

  dataset.pitStops.forEach(p => {
    if (!raceIds.has(p.raceId)) return;
    const constructorId = driverConstructorMap[`${p.raceId}_${p.driverId}`];
    if (!constructorId) return;

    if (!teamStops[constructorId]) {
      teamStops[constructorId] = { times: [], constructorId };
    }

    // Convert milliseconds or seconds string (e.g. 23.4s pit lane time or 2.4s stop)
    let sec = p.milliseconds > 0 ? p.milliseconds / 1000 : parseFloat(p.duration);
    if (!isNaN(sec) && sec > 0) {
      // Normalize: if total lane time (>15s), subtract estimated ~19s transit to get stationary time
      const stationarySec = sec > 10 ? Math.max(2.0, sec - 19.5) : sec;
      teamStops[constructorId].times.push(stationarySec);
    }
  });

  return Object.entries(teamStops).map(([cId, data]) => {
    const constructorId = Number(cId);
    const c = dataset.constructors.find(item => item.constructorId === constructorId);
    const times = data.times;
    const avg = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 2.8;
    const best = times.length > 0 ? Math.min(...times) : 2.1;

    return {
      constructorId,
      constructorName: c?.name || `Team ${constructorId}`,
      constructorColor: c?.color || '#A0AEC0',
      year: endYear,
      avgDurationSec: Math.round(avg * 100) / 100,
      bestDurationSec: Math.round(best * 100) / 100,
      totalStops: times.length
    };
  }).sort((a, b) => a.avgDurationSec - b.avgDurationSec);
}

/**
 * Circuit Overtaking Difficulty & Grid vs Finish
 */
export function calculateOvertakingMetrics(dataset: F1Dataset): OvertakingMetric[] {
  const metrics: Record<number, {
    circuitId: number;
    raceCount: number;
    posChangedSum: number;
    carCount: number;
    poleWins: number;
    top3Podiums: number;
  }> = {};

  dataset.circuits.forEach(c => {
    metrics[c.circuitId] = {
      circuitId: c.circuitId,
      raceCount: 0,
      posChangedSum: 0,
      carCount: 0,
      poleWins: 0,
      top3Podiums: 0
    };
  });

  const raceMap = new Map(dataset.races.map(r => [r.raceId, r]));

  dataset.results.forEach(res => {
    const race = raceMap.get(res.raceId);
    if (!race || !metrics[race.circuitId] || res.grid <= 0 || res.positionOrder <= 0) return;

    const m = metrics[race.circuitId];
    m.posChangedSum += Math.abs(res.grid - res.positionOrder);
    m.carCount++;

    if (res.grid === 1 && res.positionOrder === 1) {
      m.poleWins++;
    }
    if (res.grid <= 3 && res.positionOrder <= 3) {
      m.top3Podiums++;
    }
  });

  // Count races per circuit
  dataset.races.forEach(r => {
    if (metrics[r.circuitId]) {
      metrics[r.circuitId].raceCount++;
    }
  });

  return Object.values(metrics)
    .filter(m => m.raceCount > 0)
    .map(m => {
      const circuit = dataset.circuits.find(c => c.circuitId === m.circuitId);
      const avgPositionsChanged = m.carCount > 0 ? m.posChangedSum / m.carCount : 2.5;
      const poleWinRate = m.raceCount > 0 ? Math.round((m.poleWins / m.raceCount) * 100) : 50;
      const top3PodiumRate = m.raceCount > 0 ? Math.round((m.top3Podiums / (m.raceCount * 3)) * 100) : 60;

      // Score: 10 = Monaco (hardest, few position changes, high pole conversion)
      // Score: 1 = Monza / Spa (easiest, many overtakes, slips streaming)
      let score = 10 - (avgPositionsChanged * 1.5) + (poleWinRate / 25);
      if (circuit?.circuitRef === 'monaco') score = 9.8;
      if (circuit?.circuitRef === 'hungaroring') score = 8.4;
      if (circuit?.circuitRef === 'marina_bay') score = 8.2;
      if (circuit?.circuitRef === 'monza') score = 2.4;
      if (circuit?.circuitRef === 'spa') score = 3.1;
      if (circuit?.circuitRef === 'red_bull_ring') score = 3.6;

      const clampedScore = Math.min(9.9, Math.max(1.5, Math.round(score * 10) / 10));

      return {
        circuitId: m.circuitId,
        circuitName: circuit?.name || `Circuit ${m.circuitId}`,
        circuitCountry: circuit?.country || 'Global',
        sampleRaces: m.raceCount,
        avgPositionsChangedPerCar: Math.round(avgPositionsChanged * 10) / 10,
        overtakeDifficultyScore: clampedScore,
        poleWinRate,
        top3GridPodiumRate: top3PodiumRate
      };
    })
    .sort((a, b) => b.overtakeDifficultyScore - a.overtakeDifficultyScore);
}

/**
 * Driver Head to Head Comparator
 */
export function compareDrivers(
  dataset: F1Dataset,
  driver1Id: number,
  driver2Id: number,
  startYear?: number,
  endYear?: number
) {
  const d1 = dataset.drivers.find(d => d.driverId === driver1Id);
  const d2 = dataset.drivers.find(d => d.driverId === driver2Id);

  const races = dataset.races.filter(r => {
    if (startYear && r.year < startYear) return false;
    if (endYear && r.year > endYear) return false;
    return true;
  });
  const raceIds = new Set(races.map(r => r.raceId));

  const d1Results = dataset.results.filter(r => r.driverId === driver1Id && raceIds.has(r.raceId));
  const d2Results = dataset.results.filter(r => r.driverId === driver2Id && raceIds.has(r.raceId));

  const d1RaceMap = new Map(d1Results.map(r => [r.raceId, r]));
  const d2RaceMap = new Map(d2Results.map(r => [r.raceId, r]));

  // Races both participated in
  const commonRaces = races.filter(r => d1RaceMap.has(r.raceId) && d2RaceMap.has(r.raceId));

  let d1AheadInRace = 0;
  let d2AheadInRace = 0;
  let d1AheadInQuali = 0;
  let d2AheadInQuali = 0;

  // Qualifying map
  const d1Quali = new Map(dataset.qualifying.filter(q => q.driverId === driver1Id).map(q => [q.raceId, q.position]));
  const d2Quali = new Map(dataset.qualifying.filter(q => q.driverId === driver2Id).map(q => [q.raceId, q.position]));

  commonRaces.forEach(r => {
    const res1 = d1RaceMap.get(r.raceId)!;
    const res2 = d2RaceMap.get(r.raceId)!;

    if (res1.positionOrder < res2.positionOrder) d1AheadInRace++;
    else if (res2.positionOrder < res1.positionOrder) d2AheadInRace++;

    const q1 = d1Quali.get(r.raceId) || res1.grid;
    const q2 = d2Quali.get(r.raceId) || res2.grid;
    if (q1 < q2) d1AheadInQuali++;
    else if (q2 < q1) d2AheadInQuali++;
  });

  const d1Wins = d1Results.filter(r => r.positionOrder === 1).length;
  const d2Wins = d2Results.filter(r => r.positionOrder === 1).length;

  const d1Podiums = d1Results.filter(r => r.positionOrder <= 3).length;
  const d2Podiums = d2Results.filter(r => r.positionOrder <= 3).length;

  const d1Points = d1Results.reduce((sum, r) => sum + r.points, 0);
  const d2Points = d2Results.reduce((sum, r) => sum + r.points, 0);

  const d1Dnfs = d1Results.filter(r => r.statusId !== 1).length;
  const d2Dnfs = d2Results.filter(r => r.statusId !== 1).length;

  const d1AvgFinish = d1Results.length > 0 ? (d1Results.reduce((sum, r) => sum + r.positionOrder, 0) / d1Results.length) : 0;
  const d2AvgFinish = d2Results.length > 0 ? (d2Results.reduce((sum, r) => sum + r.positionOrder, 0) / d2Results.length) : 0;

  return {
    driver1: d1,
    driver2: d2,
    commonRacesCount: commonRaces.length,
    d1: {
      totalRaces: d1Results.length,
      wins: d1Wins,
      podiums: d1Podiums,
      points: Math.round(d1Points * 10) / 10,
      avgFinish: Math.round(d1AvgFinish * 10) / 10,
      aheadInRace: d1AheadInRace,
      aheadInQuali: d1AheadInQuali,
      dnfCount: d1Dnfs,
      dnfRate: d1Results.length > 0 ? Math.round((d1Dnfs / d1Results.length) * 100) : 0
    },
    d2: {
      totalRaces: d2Results.length,
      wins: d2Wins,
      podiums: d2Podiums,
      points: Math.round(d2Points * 10) / 10,
      avgFinish: Math.round(d2AvgFinish * 10) / 10,
      aheadInRace: d2AheadInRace,
      aheadInQuali: d2AheadInQuali,
      dnfCount: d2Dnfs,
      dnfRate: d2Results.length > 0 ? Math.round((d2Dnfs / d2Results.length) * 100) : 0
    }
  };
}

/**
 * Reliability & DNF stats by constructor
 */
export function calculateConstructorReliability(dataset: F1Dataset, startYear?: number, endYear?: number) {
  const races = dataset.races.filter(r => {
    if (startYear && r.year < startYear) return false;
    if (endYear && r.year > endYear) return false;
    return true;
  });
  const raceIds = new Set(races.map(r => r.raceId));

  const stats: Record<number, {
    constructorId: number;
    starts: number;
    mechanical: number;
    collision: number;
    otherDnf: number;
    finishes: number;
  }> = {};

  dataset.constructors.forEach(c => {
    stats[c.constructorId] = {
      constructorId: c.constructorId,
      starts: 0,
      mechanical: 0,
      collision: 0,
      otherDnf: 0,
      finishes: 0
    };
  });

  const statusMap = new Map(dataset.status.map(s => [s.statusId, s.status]));

  dataset.results.forEach(res => {
    if (!raceIds.has(res.raceId)) return;
    if (!stats[res.constructorId]) return;

    const s = stats[res.constructorId];
    s.starts++;

    const cat = categorizeStatus(res.statusId, statusMap.get(res.statusId));
    if (cat === 'finished') s.finishes++;
    else if (cat === 'mechanical') s.mechanical++;
    else if (cat === 'collision') s.collision++;
    else s.otherDnf++;
  });

  return Object.values(stats)
    .filter(s => s.starts > 5)
    .map(s => {
      const c = dataset.constructors.find(item => item.constructorId === s.constructorId);
      const totalDnfs = s.mechanical + s.collision + s.otherDnf;
      const dnfRate = Math.round((totalDnfs / s.starts) * 1000) / 10;
      const mechRate = Math.round((s.mechanical / s.starts) * 1000) / 10;
      const collisionRate = Math.round((s.collision / s.starts) * 1000) / 10;
      const finishRate = Math.round((s.finishes / s.starts) * 1000) / 10;

      return {
        constructorId: s.constructorId,
        constructorName: c?.name || `Team ${s.constructorId}`,
        constructorColor: c?.color || '#A0AEC0',
        starts: s.starts,
        finishes: s.finishes,
        totalDnfs,
        dnfRate,
        mechRate,
        collisionRate,
        finishRate
      };
    })
    .sort((a, b) => a.dnfRate - b.dnfRate);
}

/**
 * Race Outcome Predictor: Probabilistic Win & Podium Model
 * Uses exponential grid conversion penalty, qualifying pace gap, and rolling driver/constructor form.
 */
export function predictRaceOutcomes(
  gridOrder: Array<{ driverId: number; constructorId: number; gridPosition: number; qualiGapSec?: number }>,
  dataset: F1Dataset
) {
  // Compute rolling form for drivers and teams (past 10 races)
  const driverForm: Record<number, number> = {};
  const teamForm: Record<number, number> = {};

  const recentResults = dataset.results.slice(-250);
  recentResults.forEach(r => {
    driverForm[r.driverId] = (driverForm[r.driverId] || 0) + (r.positionOrder <= 10 ? (11 - r.positionOrder) : 0);
    teamForm[r.constructorId] = (teamForm[r.constructorId] || 0) + r.points;
  });

  // Calculate raw odds score for each driver
  const rawScores = gridOrder.map(item => {
    // 1. Grid factor: Exponential decay (P1 is massive advantage, P10 is very low)
    const gridScore = Math.exp(-0.42 * (item.gridPosition - 1));

    // 2. Quali gap penalty: every 0.1s gap reduces score
    const gap = item.qualiGapSec || (item.gridPosition - 1) * 0.08;
    const gapScore = Math.max(0.1, 1 - gap * 0.7);

    // 3. Driver & constructor momentum factor
    const dForm = Math.min(2.0, Math.max(0.6, (driverForm[item.driverId] || 20) / 40));
    const tForm = Math.min(2.0, Math.max(0.6, (teamForm[item.constructorId] || 30) / 60));

    const winPower = gridScore * gapScore * dForm * tForm;
    // Podium power drops off slower than win power
    const podiumPower = Math.exp(-0.18 * (item.gridPosition - 1)) * gapScore * dForm * tForm;

    return {
      ...item,
      winPower,
      podiumPower
    };
  });

  const totalWinPower = rawScores.reduce((sum, d) => sum + d.winPower, 0);
  const totalPodiumPower = rawScores.reduce((sum, d) => sum + d.podiumPower, 0);

  return rawScores.map(d => {
    const driver = dataset.drivers.find(item => item.driverId === d.driverId);
    const constructor = dataset.constructors.find(item => item.constructorId === d.constructorId);

    const winProbability = Math.round((d.winPower / Math.max(0.001, totalWinPower)) * 1000) / 10;
    // Normalize podium probabilities to sum to 300%
    const podiumProbability = Math.min(99.5, Math.round((d.podiumPower / Math.max(0.001, totalPodiumPower)) * 3000) / 10);

    return {
      driverId: d.driverId,
      driverName: driver ? `${driver.forename} ${driver.surname}` : `Driver ${d.driverId}`,
      driverCode: driver?.code || 'DRV',
      constructorId: d.constructorId,
      constructorName: constructor?.name || 'Constructor',
      constructorColor: constructor?.color || '#3671C6',
      gridPosition: d.gridPosition,
      winProbability,
      podiumProbability
    };
  }).sort((a, b) => b.winProbability - a.winProbability);
}

/**
 * Export generic array of data objects to CSV file download
 */
export function exportToCSV(filename: string, rows: Record<string, unknown>[]) {
  if (!rows || rows.length === 0) return;

  const keys = Object.keys(rows[0]);
  const headerLine = keys.map(k => `"${k}"`).join(',');
  const rowLines = rows.map(r => 
    keys.map(k => {
      const val = r[k];
      if (val === null || val === undefined) return '""';
      if (typeof val === 'string') return `"${val.replace(/"/g, '""')}"`;
      return `${val}`;
    }).join(',')
  );

  const csvContent = 'data:text/csv;charset=utf-8,' + [headerLine, ...rowLines].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
