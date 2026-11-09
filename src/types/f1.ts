export interface Circuit {
  circuitId: number;
  circuitRef: string;
  name: string;
  location: string;
  country: string;
  lat: number;
  lng: number;
  alt: number | null;
  url: string;
}

export interface Constructor {
  constructorId: number;
  constructorRef: string;
  name: string;
  nationality: string;
  color?: string;
  url?: string;
}

export interface Driver {
  driverId: number;
  driverRef: string;
  number: number | null;
  code: string;
  forename: string;
  surname: string;
  dob: string;
  nationality: string;
  url?: string;
}

export interface Race {
  raceId: number;
  year: number;
  round: number;
  circuitId: number;
  name: string;
  date: string;
  time?: string;
  url?: string;
}

export interface Result {
  resultId: number;
  raceId: number;
  driverId: number;
  constructorId: number;
  number: number | null;
  grid: number;
  position: number | null;
  positionText: string;
  positionOrder: number;
  points: number;
  laps: number;
  time?: string | null;
  milliseconds?: number | null;
  fastestLap?: number | null;
  rank?: number | null;
  fastestLapTime?: string | null;
  fastestLapSpeed?: number | null;
  statusId: number;
}

export interface Qualifying {
  qualifyId: number;
  raceId: number;
  driverId: number;
  constructorId: number;
  number: number | null;
  position: number;
  q1?: string | null;
  q2?: string | null;
  q3?: string | null;
}

export interface LapTime {
  raceId: number;
  driverId: number;
  lap: number;
  position: number;
  time: string;
  milliseconds: number;
}

export interface PitStop {
  raceId: number;
  driverId: number;
  stop: number;
  lap: number;
  time: string;
  duration: string;
  milliseconds: number;
}

export interface DriverStanding {
  driverStandingsId: number;
  raceId: number;
  driverId: number;
  points: number;
  position: number;
  wins: number;
}

export interface ConstructorStanding {
  constructorStandingsId: number;
  raceId: number;
  constructorId: number;
  points: number;
  position: number;
  wins: number;
}

export interface Status {
  statusId: number;
  status: string;
}

export interface SafetyCarEvent {
  raceId: number;
  year: number;
  circuitRef: string;
  type: 'SC' | 'VSC' | 'RED';
  deployedLap: number;
  retreatedLap: number;
  lapsCount: number;
  cause: string;
}

export interface F1Dataset {
  circuits: Circuit[];
  constructors: Constructor[];
  drivers: Driver[];
  races: Race[];
  results: Result[];
  qualifying: Qualifying[];
  lapTimes: LapTime[];
  pitStops: PitStop[];
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  status: Status[];
  safetyCars: SafetyCarEvent[];
  loadedAt: Date;
  isCustomUpload: boolean;
  fileSourceNames: string[];
}

export interface StrategyStat {
  stops: number;
  count: number;
  winCount: number;
  podiumCount: number;
  winRate: number; // percentage 0-100
  podiumRate: number; // percentage 0-100
  avgFinish: number;
  avgPoints: number;
  positionsGained: number; // grid minus finish
}

export interface PitLapDistribution {
  stopNumber: number;
  lap: number;
  count: number;
  top5Count: number;
}

export interface TeamPitMetric {
  constructorId: number;
  constructorName: string;
  constructorColor: string;
  year: number;
  avgDurationSec: number;
  bestDurationSec: number;
  totalStops: number;
}

export interface OvertakingMetric {
  circuitId: number;
  circuitName: string;
  circuitCountry: string;
  sampleRaces: number;
  avgPositionsChangedPerCar: number;
  overtakeDifficultyScore: number; // 1 to 10 (10 = hardest like Monaco, 1 = easiest like Monza/Spa)
  poleWinRate: number; // %
  top3GridPodiumRate: number; // %
}
