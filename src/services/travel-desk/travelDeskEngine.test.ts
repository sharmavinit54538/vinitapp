import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTravelKpis,
  checkPolicyViolation,
  INITIAL_EXPENSES,
  INITIAL_TRAVEL_REQUESTS,
  INITIAL_TRAVEL_SETTINGS,
  validateTravelRequestForm,
} from './travelDeskEngine';

test('calculateTravelKpis correctly tallies requests, approvals, and budget', () => {
  const kpis = calculateTravelKpis(INITIAL_TRAVEL_REQUESTS, INITIAL_EXPENSES, 2500000);
  assert.equal(kpis.totalRequests, 6);
  assert.equal(typeof kpis.pendingApprovals, 'number');
  assert.ok(kpis.pendingApprovals >= 1);
  assert.equal(typeof kpis.totalExpenseClaimed, 'number');
  assert.ok(kpis.totalExpenseClaimed > 0);
  assert.ok(kpis.budgetUtilizationPct >= 0 && kpis.budgetUtilizationPct <= 100);
});

test('checkPolicyViolation detects budget threshold escalation', () => {
  const normalCheck = checkPolicyViolation('domestic', 25000, INITIAL_TRAVEL_SETTINGS);
  assert.equal(normalCheck.violation, false);

  const violationCheck = checkPolicyViolation('international', 150000, INITIAL_TRAVEL_SETTINGS);
  assert.equal(violationCheck.violation, true);
  assert.ok(violationCheck.reason?.includes('threshold'));
});

test('validateTravelRequestForm validates inputs strictly', () => {
  const invalidSameCity = validateTravelRequestForm({
    sourceCity: 'Mumbai',
    destinationCity: 'Mumbai',
    departureDate: '2026-11-20',
    returnDate: '2026-11-25',
    purpose: 'Client Meeting',
    estimatedBudget: 20000,
    emergencyContact: '+91 99999 88888',
  });
  assert.equal(invalidSameCity.valid, false);
  assert.ok(invalidSameCity.error?.includes('same'));

  const invalidDates = validateTravelRequestForm({
    sourceCity: 'Bengaluru',
    destinationCity: 'Delhi',
    departureDate: '2026-11-25',
    returnDate: '2026-11-20',
    purpose: 'Client Meeting',
    estimatedBudget: 20000,
    emergencyContact: '+91 99999 88888',
  });
  assert.equal(invalidDates.valid, false);
  assert.ok(invalidDates.error?.includes('earlier'));

  const validForm = validateTravelRequestForm({
    sourceCity: 'Bengaluru',
    destinationCity: 'Singapore',
    departureDate: '2026-11-20',
    returnDate: '2026-11-25',
    purpose: 'Sales Pitch',
    estimatedBudget: 85000,
    emergencyContact: '+91 99999 88888',
  });
  assert.equal(validForm.valid, true);
});
