import { describe, it } from 'node:test';
import assert from 'node:assert';
import { categorizeStatus } from '../data/statusCodes.ts';
import { predictRaceOutcomes, calculateOvertakingMetrics } from './analytics.ts';
import { buildDataset } from '../data/bundledF1Data.ts';

describe('F1 Analytics Pure Logic Tests', () => {
  it('correctly categorizes status codes into mechanical vs collision vs finished', () => {
    assert.strictEqual(categorizeStatus(1, 'Finished'), 'finished');
    assert.strictEqual(categorizeStatus(11, '+1 Lap'), 'finished');
    assert.strictEqual(categorizeStatus(3, 'Accident'), 'collision');
    assert.strictEqual(categorizeStatus(4, 'Collision'), 'collision');
    assert.strictEqual(categorizeStatus(5, 'Engine'), 'mechanical');
    assert.strictEqual(categorizeStatus(6, 'Gearbox'), 'mechanical');
    assert.strictEqual(categorizeStatus(23, 'Brakes'), 'mechanical');
  });

  it('buildDataset creates a consistent dataset with all required entities', () => {
    const data = buildDataset();
    assert.ok(data.circuits.length >= 10, 'Should have multiple circuits');
    assert.ok(data.constructors.length >= 10, 'Should have constructors');
    assert.ok(data.drivers.length >= 15, 'Should have drivers');
    assert.ok(data.races.length >= 20, 'Should have multiple races');
    assert.ok(data.results.length > 100, 'Should have results');
    assert.ok(data.pitStops.length > 50, 'Should have pit stops');
  });

  it('calculates overtaking difficulty metrics correctly without crashing', () => {
    const data = buildDataset();
    const metrics = calculateOvertakingMetrics(data);
    assert.ok(metrics.length > 0, 'Overtaking metrics should not be empty');
    
    // Check Monaco has high difficulty score
    const monaco = metrics.find(m => m.circuitName.toLowerCase().includes('monaco'));
    if (monaco) {
      assert.ok(monaco.overtakeDifficultyScore >= 8.0, 'Monaco should have high overtake difficulty');
    }
  });

  it('predictRaceOutcomes generates normalized win probabilities summing close to 100%', () => {
    const data = buildDataset();
    const testGrid = [
      { driverId: 830, constructorId: 9, gridPosition: 1, qualiGapSec: 0.0 },
      { driverId: 846, constructorId: 1, gridPosition: 2, qualiGapSec: 0.08 },
      { driverId: 844, constructorId: 6, gridPosition: 3, qualiGapSec: 0.15 },
      { driverId: 857, constructorId: 1, gridPosition: 4, qualiGapSec: 0.22 },
      { driverId: 1, constructorId: 131, gridPosition: 5, qualiGapSec: 0.35 }
    ];

    const predictions = predictRaceOutcomes(testGrid, data);
    assert.strictEqual(predictions.length, 5);

    const sumWin = predictions.reduce((acc, p) => acc + p.winProbability, 0);
    // Should be around 100% (within rounding tolerance)
    assert.ok(Math.abs(sumWin - 100) < 2.0, `Sum of win probabilities (${sumWin}) should be ~100%`);

    // P1 driver should have highest win probability
    assert.strictEqual(predictions[0].driverId, 830, 'Pole sitter should have top win odds');
  });
});
