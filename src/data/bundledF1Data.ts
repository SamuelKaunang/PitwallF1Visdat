import { F1Dataset, Circuit, Constructor, Driver, Race, Result, Qualifying, PitStop, LapTime, DriverStanding, ConstructorStanding, SafetyCarEvent } from '../types/f1';
import { ERGAST_STATUS_LIST } from './statusCodes';

export const CONSTRUCTORS: Constructor[] = [
  { constructorId: 9, constructorRef: 'red_bull', name: 'Red Bull Racing', nationality: 'Austrian', color: '#3671C6' },
  { constructorId: 6, constructorRef: 'ferrari', name: 'Ferrari', nationality: 'Italian', color: '#E8002D' },
  { constructorId: 131, constructorRef: 'mercedes', name: 'Mercedes', nationality: 'German', color: '#27F4D2' },
  { constructorId: 1, constructorRef: 'mclaren', name: 'McLaren', nationality: 'British', color: '#FF8000' },
  { constructorId: 117, constructorRef: 'aston_martin', name: 'Aston Martin', nationality: 'British', color: '#229971' },
  { constructorId: 214, constructorRef: 'alpine', name: 'Alpine', nationality: 'French', color: '#0093CC' },
  { constructorId: 3, constructorRef: 'williams', name: 'Williams', nationality: 'British', color: '#64C4FF' },
  { constructorId: 213, constructorRef: 'alphatauri', name: 'RB / AlphaTauri', nationality: 'Italian', color: '#6692FF' },
  { constructorId: 51, constructorRef: 'alfa', name: 'Kick Sauber / Alfa Romeo', nationality: 'Swiss', color: '#52E252' },
  { constructorId: 210, constructorRef: 'haas', name: 'Haas F1 Team', nationality: 'American', color: '#B6BABD' },
  { constructorId: 4, constructorRef: 'renault', name: 'Renault', nationality: 'French', color: '#FFF500' },
  { constructorId: 211, constructorRef: 'racing_point', name: 'Racing Point', nationality: 'British', color: '#F596C8' },
  { constructorId: 5, constructorRef: 'toro_rosso', name: 'Toro Rosso', nationality: 'Italian', color: '#469BFF' },
  { constructorId: 10, constructorRef: 'force_india', name: 'Force India', nationality: 'Indian', color: '#FF8034' }
];

export const CIRCUITS: Circuit[] = [
  { circuitId: 1, circuitRef: 'albert_park', name: 'Albert Park Grand Prix Circuit', location: 'Melbourne', country: 'Australia', lat: -37.8497, lng: 144.968, alt: 10, url: 'https://en.wikipedia.org/wiki/Melbourne_Grand_Prix_Circuit' },
  { circuitId: 3, circuitRef: 'bahrain', name: 'Bahrain International Circuit', location: 'Sakhir', country: 'Bahrain', lat: 26.0325, lng: 50.5106, alt: 7, url: 'https://en.wikipedia.org/wiki/Bahrain_International_Circuit' },
  { circuitId: 4, circuitRef: 'catalunya', name: 'Circuit de Barcelona-Catalunya', location: 'Montmeló', country: 'Spain', lat: 41.57, lng: 2.26111, alt: 109, url: 'https://en.wikipedia.org/wiki/Circuit_de_Barcelona-Catalunya' },
  { circuitId: 6, circuitRef: 'monaco', name: 'Circuit de Monaco', location: 'Monte-Carlo', country: 'Monaco', lat: 43.7347, lng: 7.42056, alt: 7, url: 'https://en.wikipedia.org/wiki/Circuit_de_Monaco' },
  { circuitId: 7, circuitRef: 'villeneuve', name: 'Circuit Gilles Villeneuve', location: 'Montreal', country: 'Canada', lat: 45.5, lng: -73.5228, alt: 13, url: 'https://en.wikipedia.org/wiki/Circuit_Gilles_Villeneuve' },
  { circuitId: 9, circuitRef: 'silverstone', name: 'Silverstone Circuit', location: 'Silverstone', country: 'UK', lat: 52.0786, lng: -1.01694, alt: 153, url: 'https://en.wikipedia.org/wiki/Silverstone_Circuit' },
  { circuitId: 11, circuitRef: 'hungaroring', name: 'Hungaroring', location: 'Budapest', country: 'Hungary', lat: 47.5789, lng: 19.2486, alt: 264, url: 'https://en.wikipedia.org/wiki/Hungaroring' },
  { circuitId: 13, circuitRef: 'spa', name: 'Circuit de Spa-Francorchamps', location: 'Spa', country: 'Belgium', lat: 50.4372, lng: 5.97139, alt: 401, url: 'https://en.wikipedia.org/wiki/Circuit_de_Spa-Francorchamps' },
  { circuitId: 14, circuitRef: 'monza', name: 'Autodromo Nazionale di Monza', location: 'Monza', country: 'Italy', lat: 45.6156, lng: 9.28111, alt: 162, url: 'https://en.wikipedia.org/wiki/Autodromo_Nazionale_Monza' },
  { circuitId: 15, circuitRef: 'marina_bay', name: 'Marina Bay Street Circuit', location: 'Marina Bay', country: 'Singapore', lat: 1.2914, lng: 103.864, alt: 18, url: 'https://en.wikipedia.org/wiki/Marina_Bay_Street_Circuit' },
  { circuitId: 18, circuitRef: 'interlagos', name: 'Autódromo José Carlos Pace', location: 'São Paulo', country: 'Brazil', lat: -23.7036, lng: -46.6997, alt: 785, url: 'https://en.wikipedia.org/wiki/Aut%C3%B3dromo_Jos%C3%A9_Carlos_Pace' },
  { circuitId: 22, circuitRef: 'suzuka', name: 'Suzuka Circuit', location: 'Suzuka', country: 'Japan', lat: 34.8431, lng: 136.541, alt: 45, url: 'https://en.wikipedia.org/wiki/Suzuka_Circuit' },
  { circuitId: 24, circuitRef: 'yas_marina', name: 'Yas Marina Circuit', location: 'Abu Dhabi', country: 'UAE', lat: 24.4672, lng: 54.6031, alt: 3, url: 'https://en.wikipedia.org/wiki/Yas_Marina_Circuit' },
  { circuitId: 69, circuitRef: 'americas', name: 'Circuit of the Americas', location: 'Austin', country: 'USA', lat: 30.1328, lng: -97.6411, alt: 161, url: 'https://en.wikipedia.org/wiki/Circuit_of_the_Americas' },
  { circuitId: 70, circuitRef: 'red_bull_ring', name: 'Red Bull Ring', location: 'Spielberg', country: 'Austria', lat: 47.2197, lng: 14.7647, alt: 678, url: 'https://en.wikipedia.org/wiki/Red_Bull_Ring' },
  { circuitId: 71, circuitRef: 'sochi', name: 'Sochi Autodrom', location: 'Sochi', country: 'Russia', lat: 43.4057, lng: 39.9578, alt: 2, url: 'https://en.wikipedia.org/wiki/Sochi_Autodrom' },
  { circuitId: 73, circuitRef: 'baku', name: 'Baku City Circuit', location: 'Baku', country: 'Azerbaijan', lat: 40.3725, lng: 49.8533, alt: -22, url: 'https://en.wikipedia.org/wiki/Baku_City_Circuit' },
  { circuitId: 75, circuitRef: 'portimao', name: 'Autódromo Internacional do Algarve', location: 'Portimão', country: 'Portugal', lat: 37.227, lng: -8.6267, alt: 108, url: 'https://en.wikipedia.org/wiki/Algarve_International_Circuit' },
  { circuitId: 77, circuitRef: 'jeddah', name: 'Jeddah Corniche Circuit', location: 'Jeddah', country: 'Saudi Arabia', lat: 21.6319, lng: 39.1044, alt: 12, url: 'https://en.wikipedia.org/wiki/Jeddah_Corniche_Circuit' },
  { circuitId: 78, circuitRef: 'losail', name: 'Losail International Circuit', location: 'Al Daayen', country: 'Qatar', lat: 25.49, lng: 51.4542, alt: 12, url: 'https://en.wikipedia.org/wiki/Losail_International_Circuit' },
  { circuitId: 79, circuitRef: 'miami', name: 'Miami International Autodrome', location: 'Miami', country: 'USA', lat: 25.9581, lng: -80.2389, alt: 3, url: 'https://en.wikipedia.org/wiki/Miami_International_Autodrome' },
  { circuitId: 80, circuitRef: 'vegas', name: 'Las Vegas Strip Street Circuit', location: 'Las Vegas', country: 'USA', lat: 36.1147, lng: -115.168, alt: 610, url: 'https://en.wikipedia.org/wiki/Las_Vegas_Strip_Circuit' },
  { circuitId: 39, circuitRef: 'zandvoort', name: 'Circuit Zandvoort', location: 'Zandvoort', country: 'Netherlands', lat: 52.3888, lng: 4.54092, alt: 3, url: 'https://en.wikipedia.org/wiki/Circuit_Zandvoort' }
];

export const DRIVERS: Driver[] = [
  { driverId: 830, driverRef: 'max_verstappen', number: 1, code: 'VER', forename: 'Max', surname: 'Verstappen', dob: '1997-09-30', nationality: 'Dutch' },
  { driverId: 1, driverRef: 'hamilton', number: 44, code: 'HAM', forename: 'Lewis', surname: 'Hamilton', dob: '1985-01-07', nationality: 'British' },
  { driverId: 846, driverRef: 'norris', number: 4, code: 'NOR', forename: 'Lando', surname: 'Norris', dob: '1999-11-13', nationality: 'British' },
  { driverId: 844, driverRef: 'leclerc', number: 16, code: 'LEC', forename: 'Charles', surname: 'Leclerc', dob: '1997-10-16', nationality: 'Monegasque' },
  { driverId: 832, driverRef: 'sainz', number: 55, code: 'SAI', forename: 'Carlos', surname: 'Sainz', dob: '1994-09-01', nationality: 'Spanish' },
  { driverId: 857, driverRef: 'piastri', number: 81, code: 'PIA', forename: 'Oscar', surname: 'Piastri', dob: '2001-04-06', nationality: 'Australian' },
  { driverId: 847, driverRef: 'russell', number: 63, code: 'RUS', forename: 'George', surname: 'Russell', dob: '1998-02-15', nationality: 'British' },
  { driverId: 815, driverRef: 'perez', number: 11, code: 'PER', forename: 'Sergio', surname: 'Perez', dob: '1990-01-26', nationality: 'Mexican' },
  { driverId: 4, driverRef: 'alonso', number: 14, code: 'ALO', forename: 'Fernando', surname: 'Alonso', dob: '1981-07-29', nationality: 'Spanish' },
  { driverId: 842, driverRef: 'gasly', number: 10, code: 'GAS', forename: 'Pierre', surname: 'Gasly', dob: '1996-02-07', nationality: 'French' },
  { driverId: 839, driverRef: 'ocon', number: 31, code: 'OCO', forename: 'Esteban', surname: 'Ocon', dob: '1996-09-17', nationality: 'French' },
  { driverId: 848, driverRef: 'albon', number: 23, code: 'ALB', forename: 'Alexander', surname: 'Albon', dob: '1996-03-23', nationality: 'Thai' },
  { driverId: 852, driverRef: 'tsunoda', number: 22, code: 'TSU', forename: 'Yuki', surname: 'Tsunoda', dob: '2000-05-11', nationality: 'Japanese' },
  { driverId: 807, driverRef: 'hulkenberg', number: 27, code: 'HUL', forename: 'Nico', surname: 'Hülkenberg', dob: '1987-08-19', nationality: 'German' },
  { driverId: 840, driverRef: 'stroll', number: 18, code: 'STR', forename: 'Lance', surname: 'Stroll', dob: '1998-10-29', nationality: 'Canadian' },
  { driverId: 822, driverRef: 'bottas', number: 77, code: 'BOT', forename: 'Valtteri', surname: 'Bottas', dob: '1989-08-28', nationality: 'Finnish' },
  { driverId: 855, driverRef: 'zhou', number: 24, code: 'ZHO', forename: 'Guanyu', surname: 'Zhou', dob: '1999-05-30', nationality: 'Chinese' },
  { driverId: 825, driverRef: 'kevin_magnussen', number: 20, code: 'MAG', forename: 'Kevin', surname: 'Magnussen', dob: '1992-10-05', nationality: 'Danish' },
  { driverId: 858, driverRef: 'sargeant', number: 2, code: 'SAR', forename: 'Logan', surname: 'Sargeant', dob: '2000-12-31', nationality: 'American' },
  { driverId: 817, driverRef: 'ricciardo', number: 3, code: 'RIC', forename: 'Daniel', surname: 'Ricciardo', dob: '1989-07-01', nationality: 'Australian' },
  { driverId: 20, driverRef: 'vettel', number: 5, code: 'VET', forename: 'Sebastian', surname: 'Vettel', dob: '1987-07-03', nationality: 'German' },
  { driverId: 8, driverRef: 'raikkonen', number: 7, code: 'RAI', forename: 'Kimi', surname: 'Räikkönen', dob: '1979-10-17', nationality: 'Finnish' }
];

export const RACES: Race[] = [
  // 2024 Season
  { raceId: 1121, year: 2024, round: 1, circuitId: 3, name: 'Bahrain Grand Prix', date: '2024-03-02' },
  { raceId: 1122, year: 2024, round: 2, circuitId: 77, name: 'Saudi Arabian Grand Prix', date: '2024-03-09' },
  { raceId: 1123, year: 2024, round: 3, circuitId: 1, name: 'Australian Grand Prix', date: '2024-03-24' },
  { raceId: 1124, year: 2024, round: 4, circuitId: 22, name: 'Japanese Grand Prix', date: '2024-04-07' },
  { raceId: 1126, year: 2024, round: 6, circuitId: 79, name: 'Miami Grand Prix', date: '2024-05-05' },
  { raceId: 1128, year: 2024, round: 8, circuitId: 6, name: 'Monaco Grand Prix', date: '2024-05-26' },
  { raceId: 1129, year: 2024, round: 9, circuitId: 7, name: 'Canadian Grand Prix', date: '2024-06-09' },
  { raceId: 1130, year: 2024, round: 10, circuitId: 4, name: 'Spanish Grand Prix', date: '2024-06-23' },
  { raceId: 1131, year: 2024, round: 11, circuitId: 70, name: 'Austrian Grand Prix', date: '2024-06-30' },
  { raceId: 1132, year: 2024, round: 12, circuitId: 9, name: 'British Grand Prix', date: '2024-07-07' },
  { raceId: 1133, year: 2024, round: 13, circuitId: 11, name: 'Hungarian Grand Prix', date: '2024-07-21' },
  { raceId: 1134, year: 2024, round: 14, circuitId: 13, name: 'Belgian Grand Prix', date: '2024-07-28' },
  { raceId: 1135, year: 2024, round: 15, circuitId: 39, name: 'Dutch Grand Prix', date: '2024-08-25' },
  { raceId: 1136, year: 2024, round: 16, circuitId: 14, name: 'Italian Grand Prix', date: '2024-09-01' },
  { raceId: 1137, year: 2024, round: 17, circuitId: 73, name: 'Azerbaijan Grand Prix', date: '2024-09-15' },
  { raceId: 1138, year: 2024, round: 18, circuitId: 15, name: 'Singapore Grand Prix', date: '2024-09-22' },
  { raceId: 1139, year: 2024, round: 19, circuitId: 69, name: 'United States Grand Prix', date: '2024-10-20' },
  { raceId: 1141, year: 2024, round: 21, circuitId: 18, name: 'São Paulo Grand Prix', date: '2024-11-03' },
  { raceId: 1142, year: 2024, round: 22, circuitId: 80, name: 'Las Vegas Grand Prix', date: '2024-11-23' },
  { raceId: 1143, year: 2024, round: 23, circuitId: 78, name: 'Qatar Grand Prix', date: '2024-12-01' },
  { raceId: 1144, year: 2024, round: 24, circuitId: 24, name: 'Abu Dhabi Grand Prix', date: '2024-12-08' },

  // 2023 Season
  { raceId: 1098, year: 2023, round: 1, circuitId: 3, name: 'Bahrain Grand Prix', date: '2023-03-05' },
  { raceId: 1100, year: 2023, round: 3, circuitId: 1, name: 'Australian Grand Prix', date: '2023-04-02' },
  { raceId: 1103, year: 2023, round: 6, circuitId: 6, name: 'Monaco Grand Prix', date: '2023-05-28' },
  { raceId: 1104, year: 2023, round: 7, circuitId: 4, name: 'Spanish Grand Prix', date: '2023-06-04' },
  { raceId: 1105, year: 2023, round: 8, circuitId: 7, name: 'Canadian Grand Prix', date: '2023-06-18' },
  { raceId: 1106, year: 2023, round: 9, circuitId: 70, name: 'Austrian Grand Prix', date: '2023-07-02' },
  { raceId: 1107, year: 2023, round: 10, circuitId: 9, name: 'British Grand Prix', date: '2023-07-09' },
  { raceId: 1108, year: 2023, round: 11, circuitId: 11, name: 'Hungarian Grand Prix', date: '2023-07-23' },
  { raceId: 1109, year: 2023, round: 12, circuitId: 13, name: 'Belgian Grand Prix', date: '2023-07-30' },
  { raceId: 1110, year: 2023, round: 13, circuitId: 39, name: 'Dutch Grand Prix', date: '2023-08-27' },
  { raceId: 1111, year: 2023, round: 14, circuitId: 14, name: 'Italian Grand Prix', date: '2023-09-03' },
  { raceId: 1112, year: 2023, round: 15, circuitId: 15, name: 'Singapore Grand Prix', date: '2023-09-17' },
  { raceId: 1113, year: 2023, round: 16, circuitId: 22, name: 'Japanese Grand Prix', date: '2023-09-24' },
  { raceId: 1114, year: 2023, round: 17, circuitId: 78, name: 'Qatar Grand Prix', date: '2023-10-08' },
  { raceId: 1115, year: 2023, round: 18, circuitId: 69, name: 'United States Grand Prix', date: '2023-10-22' },
  { raceId: 1117, year: 2023, round: 20, circuitId: 18, name: 'São Paulo Grand Prix', date: '2023-11-05' },
  { raceId: 1118, year: 2023, round: 21, circuitId: 80, name: 'Las Vegas Grand Prix', date: '2023-11-18' },
  { raceId: 1119, year: 2023, round: 22, circuitId: 24, name: 'Abu Dhabi Grand Prix', date: '2023-11-26' },

  // 2022 Season
  { raceId: 1074, year: 2022, round: 1, circuitId: 3, name: 'Bahrain Grand Prix', date: '2022-03-20' },
  { raceId: 1076, year: 2022, round: 3, circuitId: 1, name: 'Australian Grand Prix', date: '2022-04-10' },
  { raceId: 1080, year: 2022, round: 7, circuitId: 6, name: 'Monaco Grand Prix', date: '2022-05-29' },
  { raceId: 1083, year: 2022, round: 10, circuitId: 9, name: 'British Grand Prix', date: '2022-07-03' },
  { raceId: 1084, year: 2022, round: 11, circuitId: 70, name: 'Austrian Grand Prix', date: '2022-07-10' },
  { raceId: 1086, year: 2022, round: 13, circuitId: 11, name: 'Hungarian Grand Prix', date: '2022-07-31' },
  { raceId: 1087, year: 2022, round: 14, circuitId: 13, name: 'Belgian Grand Prix', date: '2022-08-28' },
  { raceId: 1089, year: 2022, round: 16, circuitId: 14, name: 'Italian Grand Prix', date: '2022-09-11' },
  { raceId: 1091, year: 2022, round: 18, circuitId: 22, name: 'Japanese Grand Prix', date: '2022-10-09' },
  { raceId: 1092, year: 2022, round: 19, circuitId: 69, name: 'United States Grand Prix', date: '2022-10-23' },
  { raceId: 1095, year: 2022, round: 21, circuitId: 18, name: 'São Paulo Grand Prix', date: '2022-11-13' },
  { raceId: 1096, year: 2022, round: 22, circuitId: 24, name: 'Abu Dhabi Grand Prix', date: '2022-11-20' },

  // 2021 Season
  { raceId: 1052, year: 2021, round: 1, circuitId: 3, name: 'Bahrain Grand Prix', date: '2021-03-28' },
  { raceId: 1056, year: 2021, round: 5, circuitId: 6, name: 'Monaco Grand Prix', date: '2021-05-23' },
  { raceId: 1060, year: 2021, round: 9, circuitId: 70, name: 'Austrian Grand Prix', date: '2021-07-04' },
  { raceId: 1061, year: 2021, round: 10, circuitId: 9, name: 'British Grand Prix', date: '2021-07-18' },
  { raceId: 1065, year: 2021, round: 14, circuitId: 14, name: 'Italian Grand Prix', date: '2021-09-12' },
  { raceId: 1071, year: 2021, round: 20, circuitId: 78, name: 'Qatar Grand Prix', date: '2021-11-21' },
  { raceId: 1073, year: 2021, round: 22, circuitId: 24, name: 'Abu Dhabi Grand Prix', date: '2021-12-12' }
];

// Helper to generate realistic results and pit stops
export function buildDataset(): F1Dataset {
  const results: Result[] = [];
  const qualifying: Qualifying[] = [];
  const pitStops: PitStop[] = [];
  const lapTimes: LapTime[] = [];
  const driverStandings: DriverStanding[] = [];
  const constructorStandings: ConstructorStanding[] = [];
  const safetyCars: SafetyCarEvent[] = [
    { raceId: 1136, year: 2024, circuitRef: 'monza', type: 'VSC', deployedLap: 12, retreatedLap: 13, lapsCount: 1, cause: 'Debris at Curva Grande' },
    { raceId: 1132, year: 2024, circuitRef: 'silverstone', type: 'SC', deployedLap: 39, retreatedLap: 43, lapsCount: 4, cause: 'Rain downpour & retired car at Turn 3' },
    { raceId: 1128, year: 2024, circuitRef: 'monaco', type: 'RED', deployedLap: 1, retreatedLap: 1, lapsCount: 0, cause: 'First lap crash Perez and Haas' },
    { raceId: 1121, year: 2024, circuitRef: 'bahrain', type: 'VSC', deployedLap: 32, retreatedLap: 33, lapsCount: 1, cause: 'Debris clearance Turn 10' },
    { raceId: 1111, year: 2023, circuitRef: 'monza', type: 'VSC', deployedLap: 41, retreatedLap: 43, lapsCount: 2, cause: 'Tsunoda stranded on straight' },
    { raceId: 1112, year: 2023, circuitRef: 'marina_bay', type: 'SC', deployedLap: 20, retreatedLap: 23, lapsCount: 3, cause: 'Sargeant crash barrier Turn 8' },
    { raceId: 1107, year: 2023, circuitRef: 'silverstone', type: 'SC', deployedLap: 33, retreatedLap: 38, lapsCount: 5, cause: 'Magnussen engine fire Wellington Straight' },
    { raceId: 1089, year: 2022, circuitRef: 'monza', type: 'SC', deployedLap: 47, retreatedLap: 53, lapsCount: 6, cause: 'Ricciardo car stopped between Lesmos' },
    { raceId: 1083, year: 2022, circuitRef: 'silverstone', type: 'SC', deployedLap: 39, retreatedLap: 42, lapsCount: 3, cause: 'Ocon fuel pump failure inside National straight' }
  ];

  let resultIdCounter = 1;
  let qualifyIdCounter = 1;
  let standingIdCounter = 1;

  // Driver performance profiles (grid conversion, speed, consistency)
  const driverConfigs = [
    { driverId: 830, constructorId: 9, baseRank: 1, qualiDelta: -0.3, dnfProb: 0.05, pitAvg: 2.25 }, // Verstappen
    { driverId: 846, constructorId: 1, baseRank: 2, qualiDelta: -0.15, dnfProb: 0.07, pitAvg: 2.45 }, // Norris
    { driverId: 844, constructorId: 6, baseRank: 3, qualiDelta: -0.25, dnfProb: 0.09, pitAvg: 2.50 }, // Leclerc
    { driverId: 857, constructorId: 1, baseRank: 4, qualiDelta: -0.05, dnfProb: 0.08, pitAvg: 2.48 }, // Piastri
    { driverId: 832, constructorId: 6, baseRank: 5, qualiDelta: -0.1, dnfProb: 0.08, pitAvg: 2.52 }, // Sainz
    { driverId: 847, constructorId: 131, baseRank: 6, qualiDelta: -0.08, dnfProb: 0.09, pitAvg: 2.42 }, // Russell
    { driverId: 1, constructorId: 131, baseRank: 7, qualiDelta: -0.05, dnfProb: 0.06, pitAvg: 2.40 }, // Hamilton
    { driverId: 815, constructorId: 9, baseRank: 8, qualiDelta: 0.25, dnfProb: 0.11, pitAvg: 2.30 }, // Perez
    { driverId: 4, constructorId: 117, baseRank: 9, qualiDelta: -0.12, dnfProb: 0.09, pitAvg: 2.70 }, // Alonso
    { driverId: 840, constructorId: 117, baseRank: 10, qualiDelta: 0.35, dnfProb: 0.14, pitAvg: 2.75 }, // Stroll
    { driverId: 852, constructorId: 213, baseRank: 11, qualiDelta: 0.05, dnfProb: 0.12, pitAvg: 2.65 }, // Tsunoda
    { driverId: 817, constructorId: 213, baseRank: 12, qualiDelta: 0.15, dnfProb: 0.13, pitAvg: 2.68 }, // Ricciardo
    { driverId: 807, constructorId: 210, baseRank: 13, qualiDelta: -0.18, dnfProb: 0.12, pitAvg: 2.95 }, // Hulkenberg
    { driverId: 825, constructorId: 210, baseRank: 14, qualiDelta: 0.2, dnfProb: 0.16, pitAvg: 3.02 }, // Magnussen
    { driverId: 848, constructorId: 3, baseRank: 15, qualiDelta: -0.1, dnfProb: 0.13, pitAvg: 2.85 }, // Albon
    { driverId: 842, constructorId: 214, baseRank: 16, qualiDelta: 0.1, dnfProb: 0.14, pitAvg: 2.78 }, // Gasly
    { driverId: 839, constructorId: 214, baseRank: 17, qualiDelta: 0.15, dnfProb: 0.15, pitAvg: 2.80 }, // Ocon
    { driverId: 822, constructorId: 51, baseRank: 18, qualiDelta: 0.22, dnfProb: 0.15, pitAvg: 3.45 }, // Bottas
    { driverId: 855, constructorId: 51, baseRank: 19, qualiDelta: 0.3, dnfProb: 0.15, pitAvg: 3.52 }, // Zhou
    { driverId: 858, constructorId: 3, baseRank: 20, qualiDelta: 0.45, dnfProb: 0.20, pitAvg: 2.90 } // Sargeant
  ];

  const pointsDistribution = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // Deterministic seed helper
  let seed = 42;
  function pseudoRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  // Iterate over each race to generate realistic Ergast results, qualifying and pit stops
  RACES.forEach((race, raceIndex) => {
    // Determine circuit characteristics
    const circuit = CIRCUITS.find(c => c.circuitId === race.circuitId);
    const isMonaco = circuit?.circuitRef === 'monaco';
    const isMonza = circuit?.circuitRef === 'monza';
    const isSilverstone = circuit?.circuitRef === 'silverstone';
    const isSpa = circuit?.circuitRef === 'spa';
    const totalLaps = isMonaco ? 78 : isMonza ? 53 : isSilverstone ? 52 : isSpa ? 44 : 57;

    // Determine circuit pit stop strategy bias:
    // Monza: heavily 1-stop
    // Monaco: 1-stop or rain 2-stop
    // Bahrain / Spain / Silverstone: 2-stop optimal
    // Qatar: mandatory 3-stop (extreme tyre wear)
    const isQatar = circuit?.circuitRef === 'losail';

    // Shuffle drivers slightly around their base ranks for qualifying
    const qualiGrid = [...driverConfigs].map(d => {
      // era modifier
      let rank = d.baseRank;
      if (race.year === 2021) {
        if (d.driverId === 1) rank = 1.5; // Hamilton in 2021
        if (d.driverId === 830) rank = 1.2; // Verstappen
        if (d.driverId === 822) rank = 3.5; // Bottas
      } else if (race.year === 2024) {
        if (d.driverId === 846) rank = 1.8; // Norris 2024
        if (d.driverId === 844) rank = 2.5; // Leclerc 2024
      }
      const jitter = (pseudoRandom() - 0.5) * 4;
      return { ...d, qualScore: rank + jitter };
    }).sort((a, b) => a.qualScore - b.qualScore);

    // Save qualifying results
    qualiGrid.forEach((d, idx) => {
      qualifying.push({
        qualifyId: qualifyIdCounter++,
        raceId: race.raceId,
        driverId: d.driverId,
        constructorId: d.constructorId,
        number: d.driverId === 830 ? 1 : d.driverId === 1 ? 44 : 10 + idx,
        position: idx + 1,
        q1: '1:29.800',
        q2: idx < 15 ? '1:29.100' : null,
        q3: idx < 10 ? '1:28.450' : null
      });
    });

    // Now compute race finishing order with overtaking difficulty & tyre strategy impact
    const overtakeResistance = isMonaco ? 0.90 : isHungaroring(circuit?.circuitRef) ? 0.75 : isMonza ? 0.25 : 0.45;

    // Assign pit stop count to each driver
    const driverStrategies = qualiGrid.map((d, gridIdx) => {
      const grid = gridIdx + 1;
      let targetStops = 1;

      if (isQatar) {
        targetStops = 3;
      } else if (isMonza) {
        targetStops = pseudoRandom() < 0.85 ? 1 : 2;
      } else if (isMonaco) {
        targetStops = pseudoRandom() < 0.90 ? 1 : 2;
      } else if (isSilverstone || isSpa) {
        targetStops = pseudoRandom() < 0.70 ? 2 : 1;
      } else {
        // General circuit
        targetStops = pseudoRandom() < 0.55 ? 2 : (pseudoRandom() < 0.9 ? 1 : 3);
      }

      // Check DNF
      const isDnf = pseudoRandom() < d.dnfProb;
      let statusId = 1;
      if (isDnf) {
        // 60% mechanical, 40% collision
        statusId = pseudoRandom() < 0.6 ? (pseudoRandom() < 0.5 ? 5 : 6) : (pseudoRandom() < 0.5 ? 3 : 4);
      }

      // Calculate race performance score
      // Strategy benefit: optimal stops gives bonus
      let strategyDelta = 0;
      if (isMonza && targetStops === 1) strategyDelta -= 1.2; // 1-stop faster at Monza
      if (isMonza && targetStops === 2) strategyDelta += 1.8;
      if (isSilverstone && targetStops === 2) strategyDelta -= 1.5; // 2-stop faster at Silverstone
      if (isSilverstone && targetStops === 1) strategyDelta += 2.1;

      // Overtake factor: drivers can only gain or lose limited spots based on track difficulty
      const abilityScore = d.baseRank + (pseudoRandom() - 0.45) * 3 + strategyDelta;
      const effectivePositionScore = grid * overtakeResistance + abilityScore * (1 - overtakeResistance);

      return {
        ...d,
        grid,
        targetStops,
        statusId,
        isDnf,
        effectiveScore: isDnf ? 9999 + pseudoRandom() * 100 : effectivePositionScore
      };
    });

    // Sort to determine final positions
    driverStrategies.sort((a, b) => a.effectiveScore - b.effectiveScore);

    // Save race results
    driverStrategies.forEach((d, posIdx) => {
      const pos = posIdx + 1;
      const isFinished = d.statusId === 1;
      const pts = isFinished && pos <= 10 ? pointsDistribution[pos - 1] : 0;
      const lapsCompleted = isFinished ? totalLaps : Math.max(1, Math.floor(totalLaps * (0.2 + pseudoRandom() * 0.6)));

      results.push({
        resultId: resultIdCounter++,
        raceId: race.raceId,
        driverId: d.driverId,
        constructorId: d.constructorId,
        number: d.driverId === 830 ? 1 : d.driverId === 1 ? 44 : 10 + d.grid,
        grid: d.grid,
        position: isFinished ? pos : null,
        positionText: isFinished ? `${pos}` : 'R',
        positionOrder: pos,
        points: pts,
        laps: lapsCompleted,
        time: isFinished ? (pos === 1 ? '1:24:15.340' : `+${(pos * 3.421).toFixed(3)}`) : null,
        milliseconds: isFinished ? 5055340 + pos * 3421 : null,
        fastestLap: isFinished && pos <= 3 ? 48 : null,
        rank: pos,
        fastestLapTime: '1:21.045',
        fastestLapSpeed: 242.3,
        statusId: d.statusId
      });

      // Generate realistic pit stops
      if (lapsCompleted > 10) {
        const stopsCount = d.targetStops;
        const window1 = Math.floor(totalLaps * (1 / (stopsCount + 1)));
        const window2 = Math.floor(totalLaps * (2 / (stopsCount + 1)));

        // Stop 1
        const stop1Lap = Math.max(8, Math.min(lapsCompleted - 2, Math.floor(window1 + (pseudoRandom() - 0.5) * 6)));
        const pitDurationSec = (d.pitAvg + (pseudoRandom() - 0.48) * 0.4).toFixed(3);
        const totalLaneTimeSec = (20.5 + parseFloat(pitDurationSec)).toFixed(3);
        const pitMs = Math.round(parseFloat(totalLaneTimeSec) * 1000);

        pitStops.push({
          raceId: race.raceId,
          driverId: d.driverId,
          stop: 1,
          lap: stop1Lap,
          time: '14:32:00',
          duration: totalLaneTimeSec,
          milliseconds: pitMs
        });

        // Stop 2 if applicable
        if (stopsCount >= 2 && lapsCompleted > window2) {
          const stop2Lap = Math.max(stop1Lap + 10, Math.min(lapsCompleted - 2, Math.floor(window2 + (pseudoRandom() - 0.5) * 6)));
          const pit2DurationSec = (d.pitAvg + (pseudoRandom() - 0.48) * 0.4).toFixed(3);
          const totalLane2Sec = (20.5 + parseFloat(pit2DurationSec)).toFixed(3);
          pitStops.push({
            raceId: race.raceId,
            driverId: d.driverId,
            stop: 2,
            lap: stop2Lap,
            time: '15:02:00',
            duration: totalLane2Sec,
            milliseconds: Math.round(parseFloat(totalLane2Sec) * 1000)
          });
        }

        // Stop 3 if applicable
        if (stopsCount >= 3 && lapsCompleted > 40) {
          const stop3Lap = Math.max(38, Math.min(lapsCompleted - 2, 45));
          pitStops.push({
            raceId: race.raceId,
            driverId: d.driverId,
            stop: 3,
            lap: stop3Lap,
            time: '15:25:00',
            duration: '22.840',
            milliseconds: 22840
          });
        }
      }
    });

    // Generate lap-by-lap tracking for selected showcase races (Monza 2023, Silverstone 2024, Monaco 2024, Bahrain 2024)
    if ([1136, 1132, 1128, 1121, 1111].includes(race.raceId)) {
      generateLapTimesForRace(race.raceId, driverStrategies, totalLaps, lapTimes, pitStops);
    }
  });

  // Generate driver championship standings progression
  generateChampionshipStandings(RACES, results, driverStandings, constructorStandings);

  return {
    circuits: CIRCUITS,
    constructors: CONSTRUCTORS,
    drivers: DRIVERS,
    races: RACES,
    results,
    qualifying,
    lapTimes,
    pitStops,
    driverStandings,
    constructorStandings,
    status: ERGAST_STATUS_LIST,
    safetyCars,
    loadedAt: new Date(),
    isCustomUpload: false,
    fileSourceNames: ['circuits.csv', 'constructors.csv', 'drivers.csv', 'races.csv', 'results.csv', 'qualifying.csv', 'pit_stops.csv', 'lap_times.csv', 'driver_standings.csv', 'status.csv', 'safety_cars.csv']
  };
}

function isHungaroring(ref?: string) {
  return ref === 'hungaroring';
}

function generateLapTimesForRace(
  raceId: number,
  drivers: Array<{ driverId: number; grid: number; effectiveScore: number; statusId: number; isDnf: boolean }>,
  totalLaps: number,
  lapTimes: LapTime[],
  pitStops: PitStop[]
) {
  const driverPits = pitStops.filter(p => p.raceId === raceId);

  // Initialize current positions with grid
  const currentPositions = drivers.map(d => ({
    driverId: d.driverId,
    pos: d.grid,
    dnfLap: d.isDnf ? Math.floor(10 + (d.driverId % 30)) : totalLaps + 1
  }));

  for (let lap = 1; lap <= totalLaps; lap++) {
    // Check pit stops this lap: driver drops 3-6 positions on pit out, then recovers
    currentPositions.forEach(cp => {
      if (lap > cp.dnfLap) {
        cp.pos = 20;
        return;
      }
      const hadPit = driverPits.some(p => p.driverId === cp.driverId && p.lap === lap);
      if (hadPit) {
        cp.pos = Math.min(18, cp.pos + 4);
      } else if (lap % 4 === 0 && cp.pos > 1) {
        // Natural racing ebb and flow
        const targetDriver = drivers.find(d => d.driverId === cp.driverId);
        if (targetDriver && targetDriver.effectiveScore < cp.pos) {
          cp.pos = Math.max(1, cp.pos - 1);
        }
      }
    });

    // Normalize positions 1..20
    const sorted = [...currentPositions].sort((a, b) => a.pos - b.pos);
    sorted.forEach((item, idx) => {
      item.pos = idx + 1;
      lapTimes.push({
        raceId,
        driverId: item.driverId,
        lap,
        position: item.pos,
        time: '1:24.500',
        milliseconds: 84500
      });
    });
  }
}

function generateChampionshipStandings(
  races: Race[],
  results: Result[],
  driverStandings: DriverStanding[],
  constructorStandings: ConstructorStanding[]
) {
  const seasons = Array.from(new Set(races.map(r => r.year))).sort((a, b) => a - b);

  let dStandingId = 1;
  let cStandingId = 1;

  seasons.forEach(year => {
    const seasonRaces = races.filter(r => r.year === year).sort((a, b) => a.round - b.round);
    const cumulativeDriverPoints: Record<number, number> = {};
    const cumulativeDriverWins: Record<number, number> = {};
    const cumulativeConstructorPoints: Record<number, number> = {};
    const cumulativeConstructorWins: Record<number, number> = {};

    seasonRaces.forEach(race => {
      const raceResults = results.filter(r => r.raceId === race.raceId);

      raceResults.forEach(res => {
        cumulativeDriverPoints[res.driverId] = (cumulativeDriverPoints[res.driverId] || 0) + res.points;
        if (res.positionOrder === 1) {
          cumulativeDriverWins[res.driverId] = (cumulativeDriverWins[res.driverId] || 0) + 1;
        }

        cumulativeConstructorPoints[res.constructorId] = (cumulativeConstructorPoints[res.constructorId] || 0) + res.points;
        if (res.positionOrder === 1) {
          cumulativeConstructorWins[res.constructorId] = (cumulativeConstructorWins[res.constructorId] || 0) + 1;
        }
      });

      // Sort drivers
      const sortedDrivers = Object.entries(cumulativeDriverPoints)
        .map(([dId, pts]) => ({ driverId: Number(dId), points: pts, wins: cumulativeDriverWins[Number(dId)] || 0 }))
        .sort((a, b) => b.points - a.points || b.wins - a.wins);

      sortedDrivers.forEach((sd, idx) => {
        driverStandings.push({
          driverStandingsId: dStandingId++,
          raceId: race.raceId,
          driverId: sd.driverId,
          points: sd.points,
          position: idx + 1,
          wins: sd.wins
        });
      });

      // Sort constructors
      const sortedConstructors = Object.entries(cumulativeConstructorPoints)
        .map(([cId, pts]) => ({ constructorId: Number(cId), points: pts, wins: cumulativeConstructorWins[Number(cId)] || 0 }))
        .sort((a, b) => b.points - a.points || b.wins - a.wins);

      sortedConstructors.forEach((sc, idx) => {
        constructorStandings.push({
          constructorStandingsId: cStandingId++,
          raceId: race.raceId,
          constructorId: sc.constructorId,
          points: sc.points,
          position: idx + 1,
          wins: sc.wins
        });
      });
    });
  });
}
