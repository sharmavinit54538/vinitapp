import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialHrDashboardState,
  canManageHrAdminActions,
  calculateAttendancePercentages,
  filterApprovals,
  applyApprovalDecision,
  recomputeApprovalCounts,
  filterRosterEntries,
  filterHolidays,
  announcementFormSchema,
  createInitialProfileRecords,
  upsertProfileRecord,
  deleteProfileRecord,
  createInitialCompanyRecords,
  upsertCompanyRecord,
  deleteCompanyRecord,
  MORE_MODULE_CATEGORIES,
  getMoreModulesCatalog,
  filterMoreModules,
} from './hr-dashboard-logic';

test('Initial HR Admin Dashboard state populates all 5 KPIs without fake zeros', () => {
  const state = createInitialHrDashboardState();
  assert.equal(state.kpis.workforce.totalActive, 348);
  assert.equal(state.kpis.attendance.ratePercentage, 95.4);
  assert.equal(state.kpis.approvals.totalPending, 6);
  assert.equal(state.kpis.recruitment.openPositions, 12);
  assert.equal(state.kpis.payroll.netPayableFormatted, '$1,842,500');
  assert.equal(state.shifts.length, 4);
  assert.equal(state.rosters.length, 5);
  assert.equal(state.holidays.length, 5);
});

test('Role-Based Access Control (canManageHrAdminActions) authorizes hr_admin, super_admin, and manager', () => {
  assert.equal(canManageHrAdminActions('hr_admin'), true);
  assert.equal(canManageHrAdminActions('super_admin'), true);
  assert.equal(canManageHrAdminActions('manager'), true);
  assert.equal(canManageHrAdminActions('employee'), false);
  assert.equal(canManageHrAdminActions('it_admin'), false);
  assert.equal(canManageHrAdminActions('executive'), false);
  assert.equal(canManageHrAdminActions(null), false);
});

test('Attendance percentage calculator computes accurate donut chart percentages', () => {
  const res = calculateAttendancePercentages({
    present: 322,
    late: 10,
    onLeave: 11,
    absent: 5,
  });
  assert.equal(res.total, 348);
  assert.equal(res.presentPct, 92.5);
  assert.equal(res.effectivePresentPct, 95.4);
});

test('Approval queue filtering and decision transitions recompute badge counts accurately', () => {
  const state = createInitialHrDashboardState();
  const leaves = filterApprovals(state.approvals, 'Leave Requests', 'Pending');
  assert.equal(leaves.length, 2);

  const updated = applyApprovalDecision(state.approvals, 'APR-901', 'Approved');
  const newCounts = recomputeApprovalCounts(updated);
  assert.equal(newCounts.totalPending, 5);
  assert.equal(newCounts.leaveRequests, 1);
});

test('Roster and Holiday filters narrow items by department, category, and month', () => {
  const state = createInitialHrDashboardState();
  const engRosters = filterRosterEntries(state.rosters, 'Engineering', '');
  assert.equal(engRosters.length, 2);

  const nationalHolidays = filterHolidays(state.holidays, 'National', 'All');
  assert.equal(nationalHolidays.length, 2);

  const decHolidays = filterHolidays(state.holidays, 'All', 'December');
  assert.equal(decHolidays.length, 1);
});

test('Announcement Zod schema validates required title, description, priority, and expiry date', () => {
  const valid = announcementFormSchema.safeParse({
    title: 'Q4 Townhall Broadcast',
    description: 'Join the global executive townhall this Friday at 10:00 AM.',
    priority: 'High',
    category: 'Company News',
    targetAudience: 'All Full-Time Employees',
    department: 'All Departments',
    expiryDate: '2026-12-15',
  });
  assert.equal(valid.success, true);

  const invalid = announcementFormSchema.safeParse({
    title: 'Hi',
    description: 'Short',
    priority: 'High',
    category: 'Company News',
    targetAudience: '',
    department: '',
    expiryDate: '',
  });
  assert.equal(invalid.success, false);
});

test('Profile CRUD and Company CRUD create, update, and delete records cleanly', () => {
  const initialProfiles = createInitialProfileRecords();
  assert.equal(initialProfiles.length, 4);

  const afterCreateProfile = upsertProfileRecord(initialProfiles, {
    title: 'Passport Number',
    category: 'Personal',
    value: 'Z8849201 · Valid till 2032',
    status: 'Verified',
  });
  assert.equal(afterCreateProfile.length, 5);
  assert.equal(afterCreateProfile[0].title, 'Passport Number');

  const afterUpdateProfile = upsertProfileRecord(afterCreateProfile, {
    id: 'PRF-101',
    title: 'Primary Emergency Contact',
    category: 'Emergency',
    value: 'Meera Sharma · +91 98201 99999',
    status: 'Verified',
  });
  const updatedProfileItem = afterUpdateProfile.find((p) => p.id === 'PRF-101');
  assert.equal(updatedProfileItem?.title, 'Primary Emergency Contact');

  const afterDeleteProfile = deleteProfileRecord(afterUpdateProfile, 'PRF-101');
  assert.equal(afterDeleteProfile.length, 4);

  const initialCompanies = createInitialCompanyRecords();
  assert.equal(initialCompanies.length, 3);

  const afterCreateCompany = upsertCompanyRecord(initialCompanies, {
    name: 'OFC360 North Hub',
    code: 'del-n-04',
    city: 'Gurugram, Haryana',
    gstOrRegNo: 'GSTIN: 06AABCO3600F1Z1',
    headcount: 45,
    status: 'Active',
  });
  assert.equal(afterCreateCompany.length, 4);
  assert.equal(afterCreateCompany[0].code, 'DEL-N-04');

  const afterDeleteCompany = deleteCompanyRecord(afterCreateCompany, 'CMP-202');
  assert.equal(afterDeleteCompany.length, 3);
});

test('More Modules launcher provides 5 categorized groups, search filtering, and role-based module visibility', () => {
  const state = createInitialHrDashboardState();
  const catalog = getMoreModulesCatalog(state);
  assert.equal(MORE_MODULE_CATEGORIES.length, 5);
  assert.equal(catalog.length, 25);

  const hrAdminAll = filterMoreModules(catalog, '', 'hr_admin', 'All');
  assert.equal(hrAdminAll.length, 25);
  assert.ok(hrAdminAll.some((m) => m.id === 'asset_management'));
  assert.ok(hrAdminAll.some((m) => m.id === 'visitor_management'));
  assert.ok(hrAdminAll.some((m) => m.id === 'travel_desk'));
  assert.ok(hrAdminAll.some((m) => m.id === 'onboarding'));

  const employeeModules = filterMoreModules(catalog, '', 'employee', 'All');
  assert.ok(employeeModules.length < hrAdminAll.length);
  assert.ok(employeeModules.some((m) => m.id === 'my_profile'));
  assert.equal(
    employeeModules.some((m) => m.id === 'compliance_center'),
    false
  );

  const searchRes = filterMoreModules(catalog, 'People AI', 'hr_admin', 'All');
  assert.equal(searchRes.length, 1);
  assert.equal(searchRes[0].id, 'people_ai');

  const assetsSearch = filterMoreModules(catalog, 'Assets', 'hr_admin', 'All');
  assert.equal(assetsSearch.length, 1);
  assert.equal(assetsSearch[0].id, 'asset_management');

  const commModules = filterMoreModules(
    catalog,
    '',
    'hr_admin',
    'Communication'
  );
  assert.equal(commModules.length, 3);
});


