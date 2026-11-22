import test from 'node:test';
import assert from 'node:assert/strict';
import {
  aggregateEmployeeRequests,
  calculateLeaveDays,
  computeEmployeeAttendanceMetrics,
  computeExitClearanceProgress,
  computePayslipTotals,
  computeSuggestedLastWorkingDay,
  createInitialEmployeePortalState,
  formatElapsedShiftDuration,
  getSeedHolidays2026,
  getTotalRemainingLeaves,
  validateLeaveApplication,
  validateResignationSubmission,
} from './employee-portal-logic';

test('getSeedHolidays2026 returns all 19 company holidays for 2026', () => {
  const holidays = getSeedHolidays2026();
  assert.equal(holidays.length, 19);
});

test('calculateLeaveDays excludes weekends and holidays and supports half-day requests', () => {
  // Nov 16 (Mon) to Nov 20 (Fri), 2026 = 5 working days
  assert.equal(calculateLeaveDays('2026-11-16', '2026-11-20', false), 5);
  // Including Nov 18 as holiday -> 4 working days
  assert.equal(calculateLeaveDays('2026-11-16', '2026-11-20', false, ['2026-11-18']), 4);
  // Half-day on single weekday
  assert.equal(calculateLeaveDays('2026-11-16', '2026-11-16', true), 0.5);
  // Weekend only -> 0
  assert.equal(calculateLeaveDays('2026-11-14', '2026-11-15', false), 0);
});

test('validateLeaveApplication checks balance, date ordering, and reason length', () => {
  const state = createInitialEmployeePortalState();
  const valid = validateLeaveApplication(
    {
      leaveKey: 'casual',
      fromDate: '2026-11-18',
      toDate: '2026-11-19',
      isHalfDay: false,
      reason: 'Attending family ceremony in Pune.',
    },
    state.leaveBalances
  );
  assert.equal(valid.valid, true);
  assert.equal(valid.days, 2);

  const exceeds = validateLeaveApplication(
    {
      leaveKey: 'casual',
      fromDate: '2026-11-16',
      toDate: '2026-11-27',
      isHalfDay: false,
      reason: 'Extended vacation across states.',
    },
    state.leaveBalances
  );
  assert.equal(exceeds.valid, false);
  assert.match(exceeds.error || '', /exceeds remaining/i);
});

test('computeEmployeeAttendanceMetrics updates present days and rate when checked in today', () => {
  const state = createInitialEmployeePortalState();
  const before = computeEmployeeAttendanceMetrics(state.attendanceRecords, state.todaySession);
  assert.equal(before.attendanceRatePct, 96);
  assert.equal(before.presentDays, 23);

  const after = computeEmployeeAttendanceMetrics(state.attendanceRecords, {
    ...state.todaySession,
    status: 'Checked In',
    checkInTime: '09:22 AM',
    checkInIso: '2026-11-13T09:22:00Z',
  });
  assert.equal(after.presentDays, 24);
  assert.equal(after.attendanceRatePct, 96);
});

test('formatElapsedShiftDuration formats active and completed shift timers cleanly', () => {
  const checkIn = '2026-11-13T09:00:00.000Z';
  const activeNow = Date.parse('2026-11-13T11:15:30.000Z');
  assert.equal(formatElapsedShiftDuration(checkIn, null, activeNow), '02h 15m 30s');

  const checkOut = '2026-11-13T18:30:00.000Z';
  assert.equal(formatElapsedShiftDuration(checkIn, checkOut, activeNow), '09h 30m');
});

test('aggregateEmployeeRequests counts pending, approved, and rejected requests accurately', () => {
  const state = createInitialEmployeePortalState();
  const agg = aggregateEmployeeRequests(state);
  assert.equal(agg.counts.pending, 4); // LEV-302, SCR-101, EXP-412, TKT-882
  assert.equal(agg.counts.approved, 2); // LEV-289, EXP-398
  assert.equal(agg.counts.rejected, 0);
  assert.equal(agg.counts.total, 6);

  const withExit = aggregateEmployeeRequests({
    ...state,
    exitManagement: {
      ...state.exitManagement,
      status: 'Resignation Submitted',
      submittedDate: '2026-11-13',
      requestedLastWorkingDay: '2027-01-12',
      reasonCategory: 'Career Growth',
    },
  });
  assert.equal(withExit.counts.pending, 5);
  assert.equal(withExit.counts.total, 7);
  assert.equal(withExit.items.some((i) => i.kind === 'Exit'), true);
});

test('computePayslipTotals calculates gross, deductions, and net pay with reimbursements', () => {
  const state = createInitialEmployeePortalState();
  const totals = computePayslipTotals(state.payslips[0]);
  assert.equal(totals.grossEarnings, 150000);
  assert.equal(totals.totalDeductions, 20450);
  assert.equal(totals.netPay, 131950);
  assert.equal(getTotalRemainingLeaves(state.leaveBalances), 22);
});

test('exit management helpers calculate notice period LWD, validate submission, and track clearance', () => {
  assert.equal(computeSuggestedLastWorkingDay('2026-11-13', 60), '2027-01-12');

  const invalidPast = validateResignationSubmission({
    requestedLastWorkingDay: '2026-11-10',
    reasonCategory: 'Career Growth',
    handoverTo: 'Vikram Nair',
    notes: 'Moving to a new role outside Bengaluru.',
    todayIso: '2026-11-13',
  });
  assert.equal(invalidPast.valid, false);
  assert.match(invalidPast.error || '', /future date/i);

  const valid = validateResignationSubmission({
    requestedLastWorkingDay: '2027-01-12',
    reasonCategory: 'Higher Studies',
    handoverTo: 'Vikram Nair',
    notes: 'Pursuing Masters degree starting Q1 2027.',
    todayIso: '2026-11-13',
  });
  assert.equal(valid.valid, true);

  const state = createInitialEmployeePortalState();
  const initialProgress = computeExitClearanceProgress(state.exitManagement.clearanceTasks);
  assert.equal(initialProgress.completed, 0);
  assert.equal(initialProgress.total, 4);
  assert.equal(initialProgress.pct, 0);

  const updatedTasks = state.exitManagement.clearanceTasks.map((t, idx) =>
    idx < 2 ? { ...t, status: 'Completed' as const } : t
  );
  const halfProgress = computeExitClearanceProgress(updatedTasks);
  assert.equal(halfProgress.completed, 2);
  assert.equal(halfProgress.pct, 50);
});
