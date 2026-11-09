import JSZip from 'jszip';
import Papa from 'papaparse';
import { F1Dataset, Circuit, Constructor, Driver, Race, Result, Qualifying, LapTime, PitStop, DriverStanding, ConstructorStanding, Status, SafetyCarEvent } from '../types/f1';
import { ERGAST_STATUS_LIST } from '../data/statusCodes';

export interface ParseProgress {
  step: string;
  percent: number;
  totalFiles: number;
  processedFiles: number;
}

export async function parseF1Zip(
  file: File,
  onProgress?: (progress: ParseProgress) => void
): Promise<F1Dataset> {
  onProgress?.({ step: 'Reading ZIP file...', percent: 5, totalFiles: 0, processedFiles: 0 });

  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(file);

  const fileEntries = Object.keys(loadedZip.files).filter(name => !name.startsWith('__MACOSX') && name.toLowerCase().endsWith('.csv'));
  const totalFiles = fileEntries.length;

  const dataset: Partial<F1Dataset> = {
    fileSourceNames: fileEntries,
    isCustomUpload: true,
    loadedAt: new Date()
  };

  let processed = 0;

  for (const filename of fileEntries) {
    const baseName = filename.split('/').pop()?.toLowerCase() || '';
    onProgress?.({
      step: `Parsing ${baseName}...`,
      percent: Math.round(10 + (processed / Math.max(1, totalFiles)) * 80),
      totalFiles,
      processedFiles: processed
    });

    const csvText = await loadedZip.files[filename].async('string');
    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false
    });

    const rows = parsed.data;

    if (baseName.includes('circuit')) {
      dataset.circuits = rows.map(r => ({
        circuitId: parseIntOrZero(r.circuitId),
        circuitRef: cleanString(r.circuitRef),
        name: cleanString(r.name),
        location: cleanString(r.location),
        country: cleanString(r.country),
        lat: parseFloatOrZero(r.lat),
        lng: parseFloatOrZero(r.lng),
        alt: parseNullFloat(r.alt),
        url: cleanString(r.url)
      })).filter(c => c.circuitId > 0);
    } else if (baseName.includes('constructor') && !baseName.includes('standing') && !baseName.includes('result')) {
      dataset.constructors = rows.map(r => ({
        constructorId: parseIntOrZero(r.constructorId),
        constructorRef: cleanString(r.constructorRef),
        name: cleanString(r.name),
        nationality: cleanString(r.nationality),
        url: cleanString(r.url),
        color: getConstructorDefaultColor(cleanString(r.constructorRef))
      })).filter(c => c.constructorId > 0);
    } else if (baseName.includes('driver') && !baseName.includes('standing')) {
      dataset.drivers = rows.map(r => ({
        driverId: parseIntOrZero(r.driverId),
        driverRef: cleanString(r.driverRef),
        number: parseNullInt(r.number),
        code: cleanString(r.code) || cleanString(r.driverRef).substring(0, 3).toUpperCase(),
        forename: cleanString(r.forename),
        surname: cleanString(r.surname),
        dob: cleanString(r.dob),
        nationality: cleanString(r.nationality),
        url: cleanString(r.url)
      })).filter(d => d.driverId > 0);
    } else if (baseName.includes('race') && !baseName.includes('result')) {
      dataset.races = rows.map(r => ({
        raceId: parseIntOrZero(r.raceId),
        year: parseIntOrZero(r.year),
        round: parseIntOrZero(r.round),
        circuitId: parseIntOrZero(r.circuitId),
        name: cleanString(r.name),
        date: cleanString(r.date),
        time: cleanString(r.time),
        url: cleanString(r.url)
      })).filter(r => r.raceId > 0);
    } else if (baseName.includes('result') && !baseName.includes('constructor')) {
      dataset.results = rows.map(r => ({
        resultId: parseIntOrZero(r.resultId),
        raceId: parseIntOrZero(r.raceId),
        driverId: parseIntOrZero(r.driverId),
        constructorId: parseIntOrZero(r.constructorId),
        number: parseNullInt(r.number),
        grid: parseIntOrZero(r.grid),
        position: parseNullInt(r.position),
        positionText: cleanString(r.positionText),
        positionOrder: parseIntOrZero(r.positionOrder) || 99,
        points: parseFloatOrZero(r.points),
        laps: parseIntOrZero(r.laps),
        time: cleanString(r.time),
        milliseconds: parseNullInt(r.milliseconds),
        fastestLap: parseNullInt(r.fastestLap),
        rank: parseNullInt(r.rank),
        fastestLapTime: cleanString(r.fastestLapTime),
        fastestLapSpeed: parseNullFloat(r.fastestLapSpeed),
        statusId: parseIntOrZero(r.statusId)
      })).filter(r => r.resultId > 0);
    } else if (baseName.includes('qualifying')) {
      dataset.qualifying = rows.map(r => ({
        qualifyId: parseIntOrZero(r.qualifyId),
        raceId: parseIntOrZero(r.raceId),
        driverId: parseIntOrZero(r.driverId),
        constructorId: parseIntOrZero(r.constructorId),
        number: parseNullInt(r.number),
        position: parseIntOrZero(r.position),
        q1: cleanString(r.q1),
        q2: cleanString(r.q2),
        q3: cleanString(r.q3)
      })).filter(q => q.qualifyId > 0);
    } else if (baseName.includes('pit_stop')) {
      dataset.pitStops = rows.map(r => ({
        raceId: parseIntOrZero(r.raceId),
        driverId: parseIntOrZero(r.driverId),
        stop: parseIntOrZero(r.stop),
        lap: parseIntOrZero(r.lap),
        time: cleanString(r.time),
        duration: cleanString(r.duration),
        milliseconds: parseIntOrZero(r.milliseconds) || Math.round(parseFloatOrZero(r.duration) * 1000)
      })).filter(p => p.raceId > 0);
    } else if (baseName.includes('lap_time')) {
      // Lap times can be large; only keep valid rows
      dataset.lapTimes = rows.map(r => ({
        raceId: parseIntOrZero(r.raceId),
        driverId: parseIntOrZero(r.driverId),
        lap: parseIntOrZero(r.lap),
        position: parseIntOrZero(r.position),
        time: cleanString(r.time),
        milliseconds: parseIntOrZero(r.milliseconds)
      })).filter(l => l.raceId > 0 && l.lap > 0);
    } else if (baseName.includes('driver_standing')) {
      dataset.driverStandings = rows.map(r => ({
        driverStandingsId: parseIntOrZero(r.driverStandingsId),
        raceId: parseIntOrZero(r.raceId),
        driverId: parseIntOrZero(r.driverId),
        points: parseFloatOrZero(r.points),
        position: parseIntOrZero(r.position),
        wins: parseIntOrZero(r.wins)
      })).filter(ds => ds.driverStandingsId > 0);
    } else if (baseName.includes('constructor_standing')) {
      dataset.constructorStandings = rows.map(r => ({
        constructorStandingsId: parseIntOrZero(r.constructorStandingsId),
        raceId: parseIntOrZero(r.raceId),
        constructorId: parseIntOrZero(r.constructorId),
        points: parseFloatOrZero(r.points),
        position: parseIntOrZero(r.position),
        wins: parseIntOrZero(r.wins)
      })).filter(cs => cs.constructorStandingsId > 0);
    } else if (baseName.includes('status')) {
      dataset.status = rows.map(r => ({
        statusId: parseIntOrZero(r.statusId),
        status: cleanString(r.status)
      })).filter(s => s.statusId > 0);
    } else if (baseName.includes('safety_car')) {
      dataset.safetyCars = rows.map(r => ({
        raceId: parseIntOrZero(r.raceId),
        year: parseIntOrZero(r.year),
        circuitRef: cleanString(r.circuitRef) || cleanString(r.circuit),
        type: cleanString(r.type).toUpperCase() as 'SC' | 'VSC' | 'RED' || 'SC',
        deployedLap: parseIntOrZero(r.deployedLap || r.deployed),
        retreatedLap: parseIntOrZero(r.retreatedLap || r.retreated),
        lapsCount: parseIntOrZero(r.lapsCount || r.laps),
        cause: cleanString(r.cause || r.reason)
      })).filter(sc => sc.deployedLap > 0);
    }

    processed++;
  }

  onProgress?.({ step: 'Finalizing tables & associations...', percent: 95, totalFiles, processedFiles: processed });

  // Fallback defaults if certain optional files are omitted from ZIP
  const finalDataset: F1Dataset = {
    circuits: dataset.circuits && dataset.circuits.length > 0 ? dataset.circuits : [],
    constructors: dataset.constructors && dataset.constructors.length > 0 ? dataset.constructors : [],
    drivers: dataset.drivers && dataset.drivers.length > 0 ? dataset.drivers : [],
    races: dataset.races && dataset.races.length > 0 ? dataset.races : [],
    results: dataset.results && dataset.results.length > 0 ? dataset.results : [],
    qualifying: dataset.qualifying || [],
    lapTimes: dataset.lapTimes || [],
    pitStops: dataset.pitStops || [],
    driverStandings: dataset.driverStandings || [],
    constructorStandings: dataset.constructorStandings || [],
    status: dataset.status && dataset.status.length > 0 ? dataset.status : ERGAST_STATUS_LIST,
    safetyCars: dataset.safetyCars || [],
    loadedAt: new Date(),
    isCustomUpload: true,
    fileSourceNames: fileEntries
  };

  onProgress?.({ step: 'Complete!', percent: 100, totalFiles, processedFiles: processed });
  return finalDataset;
}

// Helpers for robust parsing
function cleanString(val: unknown): string {
  if (val === undefined || val === null) return '';
  const s = String(val).trim();
  if (s === '\\N' || s === 'null' || s === 'undefined') return '';
  return s;
}

function parseIntOrZero(val: unknown): number {
  const s = cleanString(val);
  const n = parseInt(s, 10);
  return isNaN(n) ? 0 : n;
}

function parseNullInt(val: unknown): number | null {
  const s = cleanString(val);
  if (!s) return null;
  const n = parseInt(s, 10);
  return isNaN(n) ? null : n;
}

function parseFloatOrZero(val: unknown): number {
  const s = cleanString(val);
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function parseNullFloat(val: unknown): number | null {
  const s = cleanString(val);
  if (!s) return null;
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function getConstructorDefaultColor(ref: string): string {
  const map: Record<string, string> = {
    red_bull: '#3671C6',
    ferrari: '#E8002D',
    mercedes: '#27F4D2',
    mclaren: '#FF8000',
    aston_martin: '#229971',
    alpine: '#0093CC',
    williams: '#64C4FF',
    alphatauri: '#6692FF',
    rb: '#6692FF',
    toro_rosso: '#469BFF',
    sauber: '#52E252',
    alfa: '#C92D4B',
    haas: '#B6BABD',
    renault: '#FFF500',
    racing_point: '#F596C8',
    force_india: '#FF8034',
    lotus_f1: '#E5C07B',
    brawn: '#FFFFFF'
  };
  return map[ref] || '#A0AEC0';
}
