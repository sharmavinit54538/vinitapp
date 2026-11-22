import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateGoalOverallProgress,
  calculateKpiScore,
  computeEmployeePerformanceScore,
  calculateDepartmentPerformanceBreakdown,
  INITIAL_GOALS,
  INITIAL_KPIS,
  INITIAL_REVIEWS,
} from './performanceEngine';

test('calculateGoalOverallProgress averages key results accurately', () => {
  const krs = [
    { id: '1', title: 'KR1', target: 100, current: 80, unit: '%', progressPct: 80 },
    { id: '2', title: 'KR2', target: 10, current: 10, unit: 'units', progressPct: 100 },
    { id: '3', title: 'KR3', target: 50, current: 30, unit: '%', progressPct: 60 },
  ];
  const progress = calculateGoalOverallProgress(krs);
  assert.equal(progress, 80); // (80 + 100 + 60) / 3 = 80%

  assert.equal(calculateGoalOverallProgress([]), 0);
});

test('calculateKpiScore calculates target vs actual percentage and weighted score', () => {
  const kpiRes = calculateKpiScore(100, 95, 20);
  assert.equal(kpiRes.achievementPct, 95);
  // (95 / 100) * 4 + 1 = 4.8. 4.8 * 0.20 = 0.96
  assert.equal(kpiRes.weightedScore, 0.96);
});

test('computeEmployeePerformanceScore returns grade and blended score', () => {
  const score = computeEmployeePerformanceScore(INITIAL_GOALS, INITIAL_KPIS);
  assert.ok(score.overallScore > 3.5 && score.overallScore <= 5.0);
  assert.ok(score.onTrackRatio > 0 && score.onTrackRatio <= 100);
  assert.ok(typeof score.grade === 'string');
});

test('calculateDepartmentPerformanceBreakdown computes averages for all departments', () => {
  const breakdown = calculateDepartmentPerformanceBreakdown(INITIAL_GOALS, INITIAL_REVIEWS);
  assert.equal(breakdown.length, 4);
  const eng = breakdown.find((b) => b.department === 'Engineering');
  assert.ok(eng);
  assert.ok(eng.avgRating >= 1 && eng.avgRating <= 5);
  assert.ok(eng.goalProgressPct >= 0 && eng.goalProgressPct <= 100);
});
