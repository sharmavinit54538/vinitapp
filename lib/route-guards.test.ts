import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canRoleAccessRoute,
  enforceEmployeeScope,
  getDefaultRouteForRole,
  isEmployeeRestrictedRoute,
  normalizeRole,
  resolveAuthorizedDestination,
} from './route-guards';

test('normalizeRole and getDefaultRouteForRole resolve standard and hyphenated roles', () => {
  assert.equal(normalizeRole('employee'), 'employee');
  assert.equal(normalizeRole('hr-admin'), 'hr_admin');
  assert.equal(getDefaultRouteForRole('employee'), '/dashboard/employee');
  assert.equal(getDefaultRouteForRole('hr_admin'), '/dashboard/hr-admin');
});

test('isEmployeeRestrictedRoute flags all admin, manager, executive, and admin routes', () => {
  assert.equal(isEmployeeRestrictedRoute('/dashboard/hr-admin'), true);
  assert.equal(isEmployeeRestrictedRoute('/dashboard/manager'), true);
  assert.equal(isEmployeeRestrictedRoute('/dashboard/it-admin'), true);
  assert.equal(isEmployeeRestrictedRoute('/dashboard/executive'), true);
  assert.equal(isEmployeeRestrictedRoute('/dashboard/super-admin'), true);
  assert.equal(isEmployeeRestrictedRoute('/admin/workforce'), true);
  assert.equal(isEmployeeRestrictedRoute('/dashboard/employee'), false);
});

test('canRoleAccessRoute blocks employee from admin/hr routes and permits self-service routes', () => {
  assert.equal(canRoleAccessRoute('employee', '/dashboard/employee'), true);
  assert.equal(canRoleAccessRoute('employee', '/employee'), true);
  assert.equal(canRoleAccessRoute('employee', '/my-dashboard'), true);
  assert.equal(canRoleAccessRoute('employee', '/dashboard/forbidden'), true);

  assert.equal(canRoleAccessRoute('employee', '/dashboard/hr-admin'), false);
  assert.equal(canRoleAccessRoute('employee', '/admin/workforce'), false);
  assert.equal(canRoleAccessRoute('employee', '/dashboard/super-admin'), false);
  assert.equal(canRoleAccessRoute('employee', '/payroll-analytics'), false);
});

test('resolveAuthorizedDestination redirects unauthorized employee attempts to /dashboard/forbidden', () => {
  const blocked = resolveAuthorizedDestination('employee', '/dashboard/hr-admin');
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.redirectTo, '/dashboard/forbidden');

  const allowed = resolveAuthorizedDestination('employee', '/dashboard/employee');
  assert.equal(allowed.allowed, true);
  assert.equal(allowed.redirectTo, '/dashboard/employee');
});

test('enforceEmployeeScope strips tampered URL employeeId overrides', () => {
  const clean = enforceEmployeeScope('EMP-2048', 'EMP-2048');
  assert.equal(clean.tampered, false);
  assert.equal(clean.scopedEmployeeId, 'EMP-2048');

  const tampered = enforceEmployeeScope('EMP-9999', 'EMP-2048');
  assert.equal(tampered.tampered, true);
  assert.equal(tampered.scopedEmployeeId, 'EMP-2048');
});

test('canRoleAccessRoute permits manager-scoped & personal ESS routes and restricts org-wide admin routes', () => {
  assert.equal(getDefaultRouteForRole('manager'), '/dashboard/manager');
  assert.equal(canRoleAccessRoute('manager', '/manager'), true);
  assert.equal(canRoleAccessRoute('manager', '/dashboard/manager'), true);
  assert.equal(canRoleAccessRoute('manager', '/dashboard/employee'), true);
  assert.equal(canRoleAccessRoute('manager', '/performance'), true);

  assert.equal(canRoleAccessRoute('manager', '/dashboard/hr-admin'), false);
  assert.equal(canRoleAccessRoute('manager', '/dashboard/it-admin'), false);
  assert.equal(canRoleAccessRoute('manager', '/dashboard/executive'), false);
  assert.equal(canRoleAccessRoute('manager', '/dashboard/super-admin'), false);
  assert.equal(canRoleAccessRoute('manager', '/payroll'), false);
  assert.equal(canRoleAccessRoute('manager', '/payroll-analytics'), false);
  assert.equal(canRoleAccessRoute('manager', '/admin/workforce'), false);
  assert.equal(canRoleAccessRoute('manager', '/settings'), false);

  const blockedMgr = resolveAuthorizedDestination('manager', '/dashboard/hr-admin');
  assert.equal(blockedMgr.allowed, false);
  assert.equal(blockedMgr.redirectTo, '/dashboard/forbidden');
});

test('canRoleAccessRoute permits it_admin IT ops & ESS routes while blocking payroll & executive routes', () => {
  assert.equal(normalizeRole('it-admin'), 'it_admin');
  assert.equal(getDefaultRouteForRole('it-admin'), '/dashboard/it-admin');
  assert.equal(canRoleAccessRoute('it_admin', '/it-admin'), true);
  assert.equal(canRoleAccessRoute('it_admin', '/dashboard/it-admin'), true);
  assert.equal(canRoleAccessRoute('it_admin', '/assets'), true);
  assert.equal(canRoleAccessRoute('it_admin', '/helpdesk'), true);
  assert.equal(canRoleAccessRoute('it_admin', '/dashboard/employee'), true);

  assert.equal(canRoleAccessRoute('it_admin', '/payroll'), false);
  assert.equal(canRoleAccessRoute('it_admin', '/payroll-analytics'), false);
  assert.equal(canRoleAccessRoute('it_admin', '/dashboard/hr-admin'), false);
  assert.equal(canRoleAccessRoute('it_admin', '/dashboard/executive'), false);
  assert.equal(canRoleAccessRoute('it_admin', '/dashboard/super-admin'), false);
  assert.equal(canRoleAccessRoute('it_admin', '/dashboard/manager'), false);
  assert.equal(canRoleAccessRoute('it_admin', '/admin/workforce'), false);

  const blockedIt = resolveAuthorizedDestination('it_admin', '/payroll');
  assert.equal(blockedIt.allowed, false);
  assert.equal(blockedIt.redirectTo, '/dashboard/forbidden');
});

test('canRoleAccessRoute permits executive/ceo/cfo/coo/cto analytics & ESS routes while blocking operational admin routes', () => {
  assert.equal(normalizeRole('ceo'), 'executive');
  assert.equal(normalizeRole('cfo'), 'executive');
  assert.equal(normalizeRole('coo'), 'executive');
  assert.equal(normalizeRole('cto'), 'executive');
  assert.equal(getDefaultRouteForRole('executive'), '/dashboard/executive');
  assert.equal(getDefaultRouteForRole('cfo'), '/dashboard/executive');

  assert.equal(canRoleAccessRoute('executive', '/executive'), true);
  assert.equal(canRoleAccessRoute('executive', '/dashboard/executive'), true);
  assert.equal(canRoleAccessRoute('executive', '/payroll-analytics'), true);
  assert.equal(canRoleAccessRoute('executive', '/attendance-analytics'), true);
  assert.equal(canRoleAccessRoute('executive', '/performance'), true);
  assert.equal(canRoleAccessRoute('executive', '/recruitment'), true);
  assert.equal(canRoleAccessRoute('executive', '/dashboard/employee'), true);

  assert.equal(canRoleAccessRoute('executive', '/dashboard/hr-admin'), false);
  assert.equal(canRoleAccessRoute('executive', '/dashboard/it-admin'), false);
  assert.equal(canRoleAccessRoute('executive', '/dashboard/manager'), false);
  assert.equal(canRoleAccessRoute('executive', '/dashboard/super-admin'), false);
  assert.equal(canRoleAccessRoute('executive', '/admin/workforce'), false);
  assert.equal(canRoleAccessRoute('executive', '/settings'), false);

  const blockedExec = resolveAuthorizedDestination('ceo', '/admin/workforce');
  assert.equal(blockedExec.allowed, false);
  assert.equal(blockedExec.redirectTo, '/dashboard/forbidden');
});

