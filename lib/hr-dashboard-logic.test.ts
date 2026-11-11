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

test('Initial HR Admin Dashboard state initializes clean attendance, shifts, rosters, and departments without dummy data', () => {
  const state = createInitialHrDashboardState();
  assert.equal(state.kpis.workforce.totalActive, 348);
  assert.equal(state.kpis.attendance.ratePercentage, 0);
  assert.equal(state.kpis.attendance.present, 0);
  assert.equal(state.kpis.approvals.totalPending, 0);
  assert.equal(state.approvals.length, 0);
  assert.equal(state.kpis.recruitment.openPositions, 0);
  assert.equal(state.kpis.payroll.netPayableFormatted, '$1,842,500');
  assert.equal(state.departments.length, 0);
  assert.equal(state.shifts.length, 0);
  assert.equal(state.rosters.length, 0);
  assert.equal(state.holidays.length, 19);
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
  const sampleApprovals = [
    {
      id: 'APR-901',
      employeeName: 'Test Employee 1',
      employeeId: 'EMP-1',
      department: 'Product & Design',
      category: 'Leave Requests' as const,
      requestType: 'Annual Leave',
      requestDate: 'Nov 16 – Nov 20, 2026',
      durationOrAmount: '5 Days',
      reason: 'Vacation',
      status: 'Pending' as const,
      avatarInitials: 'TE',
    },
    {
      id: 'APR-902',
      employeeName: 'Test Employee 2',
      employeeId: 'EMP-2',
      department: 'Engineering',
      category: 'Leave Requests' as const,
      requestType: 'Study Leave',
      requestDate: 'Dec 03 – Dec 04, 2026',
      durationOrAmount: '2 Days',
      reason: 'Conference',
      status: 'Pending' as const,
      avatarInitials: 'T2',
    },
    {
      id: 'APR-903',
      employeeName: 'Test Employee 3',
      employeeId: 'EMP-3',
      department: 'Engineering',
      category: 'Expense Claims' as const,
      requestType: 'Travel Claim',
      requestDate: 'Nov 01, 2026',
      durationOrAmount: '$200',
      reason: 'Client visit',
      status: 'Pending' as const,
      avatarInitials: 'T3',
    },
  ];
  const leaves = filterApprovals(sampleApprovals, 'Leave Requests', 'Pending');
  assert.equal(leaves.length, 2);

  const updated = applyApprovalDecision(sampleApprovals, 'APR-901', 'Approved');
  const newCounts = recomputeApprovalCounts(updated);
  assert.equal(newCounts.totalPending, 2);
  assert.equal(newCounts.leaveRequests, 1);
});

test('Roster and Holiday filters narrow items by department, category, and month', () => {
  const state = createInitialHrDashboardState();
  const sampleRosters = [
    {
      id: 'RST-1',
      employeeId: 'EMP-1',
      employeeName: 'Test Engineer 1',
      designation: 'Engineer',
      department: 'Engineering',
      avatarInitials: 'TE',
      currentShift: 'General Shift',
      weeklyOff: 'Sat, Sun',
      swapStatus: 'None' as const,
      rosterStatus: 'Published' as const,
      schedule: [],
    },
    {
      id: 'RST-2',
      employeeId: 'EMP-2',
      employeeName: 'Test Designer',
      designation: 'Designer',
      department: 'Product & Design',
      avatarInitials: 'TD',
      currentShift: 'Flexible Shift',
      weeklyOff: 'Sat, Sun',
      swapStatus: 'None' as const,
      rosterStatus: 'Published' as const,
      schedule: [],
    },
  ];
  const engRosters = filterRosterEntries(sampleRosters, 'Engineering', '');
  assert.equal(engRosters.length, 1);

  const nationalHolidays = filterHolidays(state.holidays, 'National', 'All');
  assert.equal(nationalHolidays.length, 7);

  const decHolidays = filterHolidays(state.holidays, 'All', 'December');
  assert.equal(decHolidays.length, 3);
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

test('addEmployeeFormSchema validates all 4 required workforce roles (Employee, Manager, Executive, IT-Admin)', async () => {
  const { addEmployeeFormSchema, WORKFORCE_EMPLOYEE_ROLES } = await import(
    './hr-dashboard-logic'
  );
  assert.deepEqual(WORKFORCE_EMPLOYEE_ROLES, [
    'Employee',
    'Manager',
    'Executive',
    'IT-Admin',
  ]);

  for (const role of WORKFORCE_EMPLOYEE_ROLES) {
    const parsed = addEmployeeFormSchema.safeParse({
      name: 'Rohan Verma',
      email: 'rohan.verma@ofc360.com',
      phone: '+91 98201 11223',
      designation: 'Senior Engineer',
      role,
      department: 'Engineering',
      location: 'Bengaluru · Global HQ',
      shift: 'General Shift (09:30 - 18:30)',
    });
    assert.equal(parsed.success, true);
  }
});



