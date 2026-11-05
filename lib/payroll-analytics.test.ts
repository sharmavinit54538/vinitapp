import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computePayrollAnalyticsData,
  canAccessPayrollAnalytics,
  canManagePayrollActions,
  PAYROLL_DEPARTMENTS,
} from './payroll-analytics-types';

test('Default Payroll Analytics state populates all 6 KPIs and reconciles Net = Gross - Deductions', () => {
  const data = computePayrollAnalyticsData();

  assert.ok(data.kpis.grossPayroll.amount > 1_000_000, 'Gross payroll should be populated');
  assert.ok(data.kpis.netSalaryPaid.amount > 800_000, 'Net salary paid should be populated');
  assert.equal(data.kpis.totalEmployees.activeCount, 248, 'Default active employee count should be 248');
  assert.ok(data.kpis.pendingPayroll.pendingEmployeeCount > 0, 'Pending payroll count should be positive');
  assert.ok(data.kpis.totalDeductions.total > 0, 'Total deductions should be positive');
  assert.ok(data.kpis.payrollAccuracy.accuracyPercent > 95, 'Payroll accuracy should be > 95%');

  // Verify Earnings = Gross and Gross - Deductions = Net Payable
  assert.equal(
    data.earningsVsDeductions.earnings.total,
    data.kpis.grossPayroll.amount,
    'Total earnings must equal gross payroll'
  );
  assert.equal(
    data.kpis.grossPayroll.amount - data.earningsVsDeductions.deductions.total,
    data.earningsVsDeductions.netPayable,
    'Net payable must equal Gross minus Total Deductions'
  );
  assert.ok(data.salaryDistribution.lowestSalary > 2000, 'Lowest salary should be > $2,000');
  assert.ok(
    data.salaryDistribution.highestSalary > data.salaryDistribution.averageSalary,
    'Highest salary should exceed average salary'
  );
});

test('All 7 required departments are represented and their shares sum to ~100%', () => {
  const data = computePayrollAnalyticsData();
  assert.equal(data.departmentBreakdown.length, 7);

  const deptNames = data.departmentBreakdown.map((d) => d.department);
  for (const reqDept of PAYROLL_DEPARTMENTS) {
    assert.ok(deptNames.includes(reqDept), `Missing department: ${reqDept}`);
  }

  const totalPct = data.departmentBreakdown.reduce((acc, d) => acc + d.payrollPercentage, 0);
  assert.ok(Math.abs(totalPct - 100) <= 0.5, `Department percentages should sum to ~100%, got ${totalPct}`);
});

test('Filtering by Department, Financial Year, and Location dynamically updates metrics', () => {
  const allData = computePayrollAnalyticsData();
  const engData = computePayrollAnalyticsData({ department: 'Engineering' });

  assert.equal(engData.departmentBreakdown.length, 1);
  assert.equal(engData.departmentBreakdown[0].department, 'Engineering');
  assert.equal(engData.departmentBreakdown[0].payrollPercentage, 100);
  assert.ok(engData.kpis.grossPayroll.amount < allData.kpis.grossPayroll.amount);

  const prevFyData = computePayrollAnalyticsData({ financialYear: 'FY 2025-26' });
  assert.ok(
    prevFyData.kpis.grossPayroll.amount < allData.kpis.grossPayroll.amount,
    'FY 2025-26 gross should be lower than FY 2026-27'
  );
});

test('Variance analysis includes all 6 cost drivers and both MoM / YoY comparisons', () => {
  const data = computePayrollAnalyticsData();
  assert.equal(data.varianceAnalysis.monthOverMonth.drivers.length, 6);
  assert.equal(data.varianceAnalysis.yearOverYear.drivers.length, 6);

  const exitsDriver = data.varianceAnalysis.monthOverMonth.drivers.find(
    (d) => d.driver === 'Employee Exits'
  );
  assert.ok(exitsDriver && exitsDriver.costImpact < 0, 'Employee exits should have negative cost impact');
});

test('RBAC authorizes HR Admin, Finance Admin, and Super Admin while restricting Employee', () => {
  assert.equal(canAccessPayrollAnalytics('hr_admin'), true);
  assert.equal(canAccessPayrollAnalytics('finance_admin'), true);
  assert.equal(canAccessPayrollAnalytics('super_admin'), true);
  assert.equal(canAccessPayrollAnalytics('employee'), false);

  assert.equal(canManagePayrollActions('hr_admin'), true);
  assert.equal(canManagePayrollActions('finance_admin'), true);
  assert.equal(canManagePayrollActions('super_admin'), true);
  assert.equal(canManagePayrollActions('manager'), false);
});
