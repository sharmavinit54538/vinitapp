import test from 'node:test';
import assert from 'node:assert/strict';
import {
  answerExecutiveCopilotQuery,
  applyExecutiveApprovalDecision,
  buildExecutiveCsvExport,
  computeExecutiveDashboardKpis,
  computeScenarioProjection,
  createInitialExecutivePortalState,
  formatInrCompact,
} from './executive-portal-logic';

test('computeExecutiveDashboardKpis aggregates workforce, payroll burn, attendance, and attrition accurately', () => {
  const state = createInitialExecutivePortalState();
  const kpis = computeExecutiveDashboardKpis(state);

  assert.equal(kpis.totalWorkforce, 452);
  assert.equal(kpis.activeDepartmentsCount, 7);
  assert.equal(kpis.openRolesCount, 18);
  assert.equal(kpis.pendingApprovalsCount, 4);
  assert.equal(kpis.monthlyPayrollBurnInr, 54950000);
  assert.equal(kpis.budgetVariancePct, 0.1);
  assert.ok(kpis.orgAttendanceRatePct >= 93 && kpis.orgAttendanceRatePct <= 97);
  assert.equal(formatInrCompact(44530000), '₹4.45 Cr');
  assert.equal(formatInrCompact(720000), '₹7.2 L');
});

test('applyExecutiveApprovalDecision updates payroll release status and enforces hold rationale', () => {
  const state = createInitialExecutivePortalState();

  const invalidHold = applyExecutiveApprovalDecision(state, 'EX-APP-01', 'On Hold', 'no');
  assert.equal(invalidHold.valid, false);
  assert.ok(invalidHold.error);

  const approvedPayroll = applyExecutiveApprovalDecision(
    state,
    'EX-APP-01',
    'Approved',
    'Verified maker-checker challans'
  );
  assert.equal(approvedPayroll.valid, true);
  assert.equal(approvedPayroll.nextState.payrollCycle.status, 'Approved for Bank Release');
  assert.equal(
    approvedPayroll.nextState.approvals.find((a) => a.id === 'EX-APP-01')?.status,
    'Approved'
  );
  assert.equal(computeExecutiveDashboardKpis(approvedPayroll.nextState).pendingApprovalsCount, 3);
});

test('computeScenarioProjection calculates headcount, overtime savings, and net budget impact', () => {
  const state = createInitialExecutivePortalState();
  const baseline = computeScenarioProjection(state, {
    headcountGrowthPct: 0,
    attritionReductionPct: 0,
    overtimeReductionPct: 0,
  });
  assert.equal(baseline.projectedHeadcount, 452);
  assert.equal(baseline.projectedAnnualPayrollDeltaInr, 0);

  const optimized = computeScenarioProjection(state, {
    headcountGrowthPct: 5,
    attritionReductionPct: 2,
    overtimeReductionPct: 20,
  });
  assert.equal(optimized.projectedHeadcount, 475);
  assert.ok(optimized.overtimeAnnualSavingsInr > 0);
  assert.ok(optimized.estimatedRetentionSavingsInr > 0);
});

test('answerExecutiveCopilotQuery and buildExecutiveCsvExport return deterministic insights and CSV rows', () => {
  const state = createInitialExecutivePortalState();
  const otReply = answerExecutiveCopilotQuery(state, 'Which department has highest overtime?');
  assert.ok(otReply.answer.includes('Engineering'));
  assert.equal(otReply.highlights.length, 3);

  const csv = buildExecutiveCsvExport('payroll_summary', state);
  assert.equal(csv.rowCount, 7);
  assert.ok(csv.csvContent.includes('Engineering'));
  assert.ok(csv.filename.endsWith('.csv'));
});
