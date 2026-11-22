import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyManagerApprovalDecision,
  assignTeamRosterShift,
  computeManagerDashboardKpis,
  computeTeamAnalyticsSummary,
  createInitialManagerPortalState,
  filterManagerApprovals,
  regularizeMemberAttendance,
  scopeTeamByManager,
  validateHiringRequisitionInput,
} from './manager-portal-logic';

test('scopeTeamByManager isolates direct reports to the signed-in managerId', () => {
  const state = createInitialManagerPortalState({ managerId: 'MGR-104' });
  assert.equal(state.allTeamMembers.length, 13); // 12 direct + 1 external MGR-999
  const scoped = scopeTeamByManager(state.allTeamMembers, 'MGR-104');
  assert.equal(scoped.length, 12);
  assert.equal(scoped.some((m) => m.employeeId === 'EMP-9099'), false);
});

test('computeManagerDashboardKpis calculates team size, 92% attendance, pending approvals, and open reqs', () => {
  const state = createInitialManagerPortalState({ managerId: 'MGR-104' });
  const kpis = computeManagerDashboardKpis(state);
  assert.equal(kpis.teamSize, 12);
  assert.equal(kpis.presentCount, 11);
  assert.equal(kpis.onLeaveCount, 1);
  assert.equal(kpis.attendanceRatePct, 92);
  assert.equal(kpis.pendingApprovalsCount, 5);
  assert.equal(kpis.openRequisitionsCount, 2);
  assert.equal(kpis.pendingReviewsCount, 2);
});

test('filterManagerApprovals and applyManagerApprovalDecision enforce mandatory rejection remarks', () => {
  const state = createInitialManagerPortalState();
  const leaves = filterManagerApprovals(state.approvals, 'MGR-104', 'Leaves');
  assert.equal(leaves.length, 2);

  const missingRemark = applyManagerApprovalDecision(
    state.approvals,
    'MAPR-301',
    'Rejected',
    'no'
  );
  assert.equal(missingRemark.valid, false);
  assert.match(missingRemark.error || '', /rejection remark/i);

  const rejected = applyManagerApprovalDecision(
    state.approvals,
    'MAPR-301',
    'Rejected',
    'Critical sprint freeze on Nov 27'
  );
  assert.equal(rejected.valid, true);
  const target = rejected.items.find((i) => i.id === 'MAPR-301');
  assert.equal(target?.status, 'Rejected');
  assert.equal(target?.rejectionRemark, 'Critical sprint freeze on Nov 27');
});

test('regularizeMemberAttendance updates status and records an audit trail log', () => {
  const state = createInitialManagerPortalState();
  const bad = regularizeMemberAttendance(
    state.allTeamMembers,
    'EMP-2057',
    'Present',
    'ok'
  );
  assert.equal(bad.valid, false);

  const good = regularizeMemberAttendance(
    state.allTeamMembers,
    'EMP-2057',
    'Present',
    'Biometric gate offline during morning release deploy'
  );
  assert.equal(good.valid, true);
  const updated = good.members.find((m) => m.employeeId === 'EMP-2057');
  assert.equal(updated?.todayStatus, 'Present');
  assert.equal(updated?.regularizationHistory.length, 1);
  assert.equal(updated?.regularizationHistory[0].previousStatus, 'Late');
});

test('assignTeamRosterShift updates both roster day cell and member active shift', () => {
  const state = createInitialManagerPortalState();
  const res = assignTeamRosterShift(
    state.rosterRows,
    state.allTeamMembers,
    'EMP-2048',
    'Wed',
    'Morning'
  );
  const row = res.rosterRows.find((r) => r.employeeId === 'EMP-2048');
  assert.equal(row?.dayShifts.Wed, 'Morning');
  const member = res.members.find((m) => m.employeeId === 'EMP-2048');
  assert.equal(member?.shiftType, 'Morning');
});

test('validateHiringRequisitionInput and computeTeamAnalyticsSummary validate constraints and averages', () => {
  assert.equal(
    validateHiringRequisitionInput({ title: 'QA', headcount: 1 }).valid,
    false
  );
  assert.equal(
    validateHiringRequisitionInput({ title: 'Staff Security Engineer', headcount: 2 }).valid,
    true
  );

  const state = createInitialManagerPortalState();
  const scopedMembers = scopeTeamByManager(state.allTeamMembers, 'MGR-104');
  const summary = computeTeamAnalyticsSummary(scopedMembers, state.teamGoals);
  assert.equal(summary.avgAttendancePct > 90, true);
  assert.equal(summary.onTrackGoalsCount, 2);
  assert.equal(summary.atRiskGoalsCount, 1);
});
