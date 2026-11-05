import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialHelpDeskState,
  calculateSlaTimeRemaining,
  canAccessConfidentialComplaint,
  filterTickets,
  HELPDESK_NAV_ITEMS,
} from './helpdesk-types';

test('Initial Help Desk state has valid seed tickets, requests, complaints, and KPIs', () => {
  const state = createInitialHelpDeskState();
  assert.equal(state.tickets.length, 8);
  assert.ok(state.employeeRequests.length >= 4);
  assert.ok(state.complaints.length >= 2);
  assert.equal(state.kpis.totalTickets, 8);
  assert.equal(state.kpis.csatScore, 4.8);
  assert.equal(HELPDESK_NAV_ITEMS.length, 14);
});

test('SLA calculation accurately flags Within SLA, Approaching Breach, and Breached states', () => {
  const now = new Date('2026-11-04T12:00:00Z');

  // Created 1 hour ago, target 4 hours -> 3 hours remaining (Within SLA)
  const created1 = new Date('2026-11-04T11:00:00Z').toISOString();
  const res1 = calculateSlaTimeRemaining(created1, 4, now);
  assert.equal(res1.isBreached, false);
  assert.equal(res1.status, 'Within SLA');
  assert.ok(res1.hoursRemaining > 2);

  // Created 3.5 hours ago, target 4 hours -> 0.5 hours remaining (Approaching Breach)
  const created2 = new Date('2026-11-04T08:30:00Z').toISOString();
  const res2 = calculateSlaTimeRemaining(created2, 4, now);
  assert.equal(res2.isBreached, false);
  assert.equal(res2.status, 'Approaching Breach');

  // Created 5 hours ago, target 4 hours -> -1 hour remaining (Breached)
  const created3 = new Date('2026-11-04T07:00:00Z').toISOString();
  const res3 = calculateSlaTimeRemaining(created3, 4, now);
  assert.equal(res3.isBreached, true);
  assert.equal(res3.status, 'Breached');
});

test('RBAC accurately restricts confidential complaints to super_admin and hr_admin only', () => {
  assert.equal(canAccessConfidentialComplaint('super_admin'), true);
  assert.equal(canAccessConfidentialComplaint('hr_admin'), true);
  assert.equal(canAccessConfidentialComplaint('manager'), false);
  assert.equal(canAccessConfidentialComplaint('it_admin'), false);
  assert.equal(canAccessConfidentialComplaint('employee'), false);
});

test('filterTickets correctly filters by query, status, priority, and category', () => {
  const state = createInitialHelpDeskState();

  // Search by query
  const taxResults = filterTickets(state.tickets, { query: 'Tax' });
  assert.ok(taxResults.length >= 1);
  assert.ok(taxResults.some((t) => t.ticketNumber === 'TCK-101'));

  // Filter by priority
  const criticalTickets = filterTickets(state.tickets, { priority: 'Critical' });
  assert.ok(criticalTickets.length >= 2);
  assert.ok(criticalTickets.every((t) => t.priority === 'Critical'));

  // Filter by category
  const payrollTickets = filterTickets(state.tickets, { category: 'Payroll Support' });
  assert.ok(payrollTickets.length >= 2);
  assert.ok(payrollTickets.every((t) => t.category === 'Payroll Support'));
});
