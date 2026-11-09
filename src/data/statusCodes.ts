import { Status } from '../types/f1';

export const ERGAST_STATUS_LIST: Status[] = [
  { statusId: 1, status: 'Finished' },
  { statusId: 2, status: 'Disqualified' },
  { statusId: 3, status: 'Accident' },
  { statusId: 4, status: 'Collision' },
  { statusId: 5, status: 'Engine' },
  { statusId: 6, status: 'Gearbox' },
  { statusId: 7, status: 'Transmission' },
  { statusId: 8, status: 'Clutch' },
  { statusId: 9, status: 'Hydraulics' },
  { statusId: 10, status: 'Electrical' },
  { statusId: 11, status: '+1 Lap' },
  { statusId: 12, status: '+2 Laps' },
  { statusId: 13, status: '+3 Laps' },
  { statusId: 14, status: '+4 Laps' },
  { statusId: 15, status: '+5 Laps' },
  { statusId: 16, status: '+6 Laps' },
  { statusId: 20, status: 'Spun off' },
  { statusId: 21, status: 'Radiator' },
  { statusId: 22, status: 'Suspension' },
  { statusId: 23, status: 'Brakes' },
  { statusId: 24, status: 'Differential' },
  { statusId: 25, status: 'Overheating' },
  { statusId: 26, status: 'Mechanical' },
  { statusId: 27, status: 'Tyre' },
  { statusId: 28, status: 'Driver Seat' },
  { statusId: 29, status: 'Puncture' },
  { statusId: 30, status: 'Driveshaft' },
  { statusId: 31, status: 'Retired' },
  { statusId: 32, status: 'Fuel pressure' },
  { statusId: 33, status: 'Front wing' },
  { statusId: 34, status: 'Water pressure' },
  { statusId: 35, status: 'Refuelling' },
  { statusId: 36, status: 'Wheel' },
  { statusId: 37, status: 'Throttle' },
  { statusId: 38, status: 'Steering' },
  { statusId: 39, status: 'Technical' },
  { statusId: 40, status: 'Electronics' },
  { statusId: 41, status: 'Broken wing' },
  { statusId: 42, status: 'Heat shield fire' },
  { statusId: 43, status: 'Exhaust' },
  { statusId: 44, status: 'Oil leak' },
  { statusId: 45, status: 'Wheel rim' },
  { statusId: 46, status: 'Water leak' },
  { statusId: 47, status: 'Fuel pump' },
  { statusId: 48, status: 'Track rod' },
  { statusId: 50, status: 'Ignition' },
  { statusId: 51, status: 'Engine fire' },
  { statusId: 53, status: 'Power Unit' },
  { statusId: 54, status: 'Safety concerns' },
  { statusId: 56, status: 'Engine misfire' },
  { statusId: 60, status: 'Safety' },
  { statusId: 62, status: 'ERS' },
  { statusId: 70, status: 'Oil pressure' },
  { statusId: 130, status: 'Collision damage' },
  { statusId: 131, status: 'Power loss' },
  { statusId: 135, status: 'Brake duct' },
  { statusId: 136, status: 'Seat' },
  { statusId: 137, status: 'Damage' },
  { statusId: 138, status: 'Debris' },
  { statusId: 139, status: 'Illness' },
  { statusId: 140, status: 'Undertray' },
  { statusId: 141, status: 'Cooling system' }
];

export function categorizeStatus(statusId: number, statusText?: string): 'finished' | 'mechanical' | 'collision' | 'other' {
  if (statusId === 1 || (statusText && (statusText.toLowerCase().includes('finished') || statusText.startsWith('+')))) {
    return 'finished';
  }
  
  const text = (statusText || '').toLowerCase();
  
  // Collision / Accident
  if ([3, 4, 20, 130, 137, 138].includes(statusId) ||
      text.includes('accident') || text.includes('collision') || text.includes('spun') || text.includes('damage') || text.includes('debris')) {
    return 'collision';
  }

  // Mechanical / Power Unit / Transmission / Brakes / Electrical
  const mechanicalIds = [5, 6, 7, 8, 9, 10, 21, 22, 23, 24, 25, 26, 27, 29, 30, 32, 33, 34, 36, 37, 38, 39, 40, 42, 43, 44, 45, 46, 47, 48, 50, 51, 53, 56, 62, 70, 131, 135, 140, 141];
  if (mechanicalIds.includes(statusId) ||
      text.includes('engine') || text.includes('gearbox') || text.includes('power unit') || text.includes('hydraulic') ||
      text.includes('electrical') || text.includes('brake') || text.includes('suspension') || text.includes('overheating') ||
      text.includes('tyre') || text.includes('puncture') || text.includes('leak') || text.includes('ers') || text.includes('mechanical')) {
    return 'mechanical';
  }

  return 'other';
}
