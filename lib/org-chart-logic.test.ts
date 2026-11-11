import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialHrDashboardState, WorkforceEmployee } from './hr-dashboard-logic';
import {
  buildOrganizationHierarchy,
  getUpwardReportingChain,
  getHighlightedReportingLineIds,
  matchesOrgFilter,
} from './org-chart-logic';

const sampleEnrolledEmployees: WorkforceEmployee[] = [
  {
    id: 'WF-00',
    employeeId: 'EMP-3600',
    name: 'Aarav Sharma',
    email: 'hradmin@ofc360.com',
    phone: '+91 80 4090 3600',
    designation: 'Principal HR Operations Director',
    department: 'People Operations',
    location: 'Bengaluru · Global HQ',
    shift: 'General Shift',
    status: 'Present',
    attendanceRate: 99.8,
    joiningDate: 'Jan 10, 2022',
    initials: 'AS',
  },
  {
    id: 'WF-01',
    employeeId: 'EMP-3601',
    name: 'Elena Rostova',
    email: 'elena.rostova@ofc360.com',
    phone: '+41 44 580 1290',
    designation: 'Principal Systems Architect',
    department: 'Engineering',
    location: 'Zurich · Hybrid',
    shift: 'General Shift',
    status: 'Present',
    attendanceRate: 99.4,
    joiningDate: 'Jan 15, 2023',
    initials: 'ER',
  },
  {
    id: 'WF-05',
    employeeId: 'EMP-3605',
    name: 'Amara Okafor',
    email: 'amara.okafor@ofc360.com',
    phone: '+1 212 555 0194',
    designation: 'Lead Security Engineer',
    department: 'Engineering',
    location: 'New York · Hybrid',
    shift: 'General Shift',
    status: 'On Leave',
    attendanceRate: 97.5,
    joiningDate: 'Feb 20, 2024',
    initials: 'AO',
  },
  {
    id: 'WF-06',
    employeeId: 'EMP-3614',
    name: 'Rohan Deshmukh',
    email: 'rohan.deshmukh@ofc360.com',
    phone: '+91 98201 44510',
    designation: 'Senior SRE Lead',
    department: 'Engineering',
    location: 'Bengaluru · Hybrid',
    shift: 'Morning Shift',
    status: 'Late',
    attendanceRate: 96.4,
    joiningDate: 'May 09, 2023',
    initials: 'RD',
  },
];

test('initial workforce state contains zero dummy employees and produces empty hierarchy', () => {
  const state = createInitialHrDashboardState();
  assert.equal(state.workforce.length, 0);

  const org = buildOrganizationHierarchy(state);
  assert.equal(org.allNodes.length, 0);
  assert.equal(org.analytics.totalDirectoryEmployees, 0);
  assert.equal(org.analytics.totalDepartments, 0);
  assert.equal(org.analytics.totalManagers, 0);
  assert.equal(org.analytics.reportingLevels, 0);
});

test('buildOrganizationHierarchy constructs dynamic multi-level tree from enrolled employees', () => {
  const state = createInitialHrDashboardState();
  state.workforce = [...sampleEnrolledEmployees];
  const org = buildOrganizationHierarchy(state);

  assert.equal(org.allNodes.length, 4);
  assert.equal(org.analytics.totalDepartments, 2);
  assert.equal(org.analytics.totalManagers, 2);
  assert.equal(org.analytics.reportingLevels, 3);
  assert.equal(org.analytics.employeesWithoutManager, 1);

  const elena = org.nodesById['EMP-3601'];
  assert.ok(elena);
  assert.equal(elena.isDepartmentHead, true);
  assert.equal(elena.directReportsCount, 2);
  assert.equal(elena.managerId, 'EMP-3600');
});

test('buildOrganizationHierarchy safely breaks circular manager relationships', () => {
  const state = createInitialHrDashboardState();
  state.workforce = [...sampleEnrolledEmployees];
  const org = buildOrganizationHierarchy(state, {
    'EMP-3601': 'EMP-3605',
    'EMP-3605': 'EMP-3601',
  });

  assert.equal(org.allNodes.length, 4);
  assert.equal(org.nodesById['EMP-3601'].hasCircularReference, true);
  assert.equal(org.nodesById['EMP-3605'].hasCircularReference, true);
});

test('getUpwardReportingChain, getHighlightedReportingLineIds, and matchesOrgFilter work on enrolled tree', () => {
  const state = createInitialHrDashboardState();
  state.workforce = [...sampleEnrolledEmployees];
  const org = buildOrganizationHierarchy(state);

  const chain = getUpwardReportingChain('EMP-3605', org.nodesById);
  assert.deepEqual(
    chain.map((n) => n.employeeId),
    ['EMP-3600', 'EMP-3601']
  );

  const highlighted = getHighlightedReportingLineIds('EMP-3601', org.nodesById);
  assert.equal(highlighted.has('EMP-3600'), true);
  assert.equal(highlighted.has('EMP-3601'), true);
  assert.equal(highlighted.has('EMP-3605'), true);
  assert.equal(highlighted.has('EMP-3614'), true);

  const rohan = org.nodesById['EMP-3614'];
  assert.equal(
    matchesOrgFilter(rohan, {
      search: 'SRE',
      department: 'Engineering',
      managerId: 'EMP-3601',
      location: 'Bengaluru',
    }),
    true
  );

  assert.equal(
    matchesOrgFilter(rohan, {
      search: 'SRE',
      department: 'Finance & Legal',
      managerId: 'All',
      location: 'All',
    }),
    false
  );
});
