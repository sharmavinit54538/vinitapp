import { Ofc360Role, OFC360_ROLES, ROLE_ROUTES, resolveRoleDashboardPath } from './auth-schemas';

export type { Ofc360Role };

const ADMIN_AND_LEADERSHIP_ROUTES = [
  '/dashboard/hr-admin',
  '/dashboard/manager',
  '/manager',
  '/dashboard/it-admin',
  '/it-admin',
  '/dashboard/executive',
  '/executive',
  '/dashboard/super-admin',
  '/admin',
  '/payroll-analytics',
  '/recruitment',
];

const EXECUTIVE_RESTRICTED_PREFIXES = [
  '/dashboard/hr-admin',
  '/dashboard/it-admin',
  '/it-admin',
  '/dashboard/manager',
  '/manager',
  '/dashboard/super-admin',
  '/admin',
  '/settings',
];

const EXECUTIVE_ALLOWED_PREFIXES = [
  '/dashboard/executive',
  '/executive',
  '/dashboard/employee',
  '/employee',
  '/my-dashboard',
  '/payroll-analytics',
  '/attendance-analytics',
  '/performance',
  '/recruitment',
  '/holidays',
  '/documents',
  '/travel',
  '/helpdesk',
  '/dashboard/forbidden',
  '/forbidden',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/verify-otp',
  '/mfa-verify',
  '/activate',
  '/change-password',
];

const MANAGER_RESTRICTED_PREFIXES = [
  '/dashboard/hr-admin',
  '/dashboard/it-admin',
  '/it-admin',
  '/dashboard/executive',
  '/executive',
  '/dashboard/super-admin',
  '/admin',
  '/payroll',
  '/payroll-analytics',
  '/settings',
];

const MANAGER_ALLOWED_PREFIXES = [
  '/dashboard/manager',
  '/manager',
  '/dashboard/employee',
  '/employee',
  '/my-dashboard',
  '/performance',
  '/attendance-analytics',
  '/recruitment',
  '/onboarding',
  '/holidays',
  '/helpdesk',
  '/travel',
  '/assets',
  '/documents',
  '/dashboard/forbidden',
  '/forbidden',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/verify-otp',
  '/mfa-verify',
  '/activate',
  '/change-password',
];

const IT_ADMIN_RESTRICTED_PREFIXES = [
  '/dashboard/hr-admin',
  '/dashboard/manager',
  '/manager',
  '/dashboard/executive',
  '/executive',
  '/dashboard/super-admin',
  '/admin/workforce',
  '/admin/payroll',
  '/payroll',
  '/payroll-analytics',
  '/recruitment',
];

const IT_ADMIN_ALLOWED_PREFIXES = [
  '/dashboard/it-admin',
  '/it-admin',
  '/dashboard/employee',
  '/employee',
  '/my-dashboard',
  '/assets',
  '/helpdesk',
  '/holidays',
  '/documents',
  '/settings',
  '/visitors',
  '/attendance-analytics',
  '/dashboard/forbidden',
  '/forbidden',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/verify-otp',
  '/mfa-verify',
  '/activate',
  '/change-password',
];

const EMPLOYEE_ALLOWED_PREFIXES = [
  '/dashboard/employee',
  '/employee',
  '/my-dashboard',
  '/dashboard/forbidden',
  '/forbidden',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/verify-otp',
  '/mfa-verify',
  '/activate',
  '/change-password',
];

export function normalizeRole(rawRole?: string | null): Ofc360Role {
  if (!rawRole) return 'employee';
  const normalized = rawRole.trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (normalized === 'ceo' || normalized === 'cfo' || normalized === 'coo' || normalized === 'cto') {
    return 'executive';
  }
  return OFC360_ROLES.includes(normalized as Ofc360Role)
    ? (normalized as Ofc360Role)
    : 'employee';
}

export function getDefaultRouteForRole(rawRole?: string | null): string {
  return resolveRoleDashboardPath(normalizeRole(rawRole));
}

export function isEmployeeRestrictedRoute(pathname: string): boolean {
  const cleanPath = (pathname || '/').split('?')[0].toLowerCase().replace(/\/+$/, '') || '/';
  return ADMIN_AND_LEADERSHIP_ROUTES.some(
    (prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)
  );
}

export function canRoleAccessRoute(
  rawRole: string | null | undefined,
  pathname: string
): boolean {
  const role = normalizeRole(rawRole);
  const cleanPath = (pathname || '/').split('?')[0].toLowerCase().replace(/\/+$/, '') || '/';

  if (cleanPath === '/dashboard/forbidden' || cleanPath === '/forbidden') {
    return true;
  }

  if (role === 'employee') {
    if (isEmployeeRestrictedRoute(cleanPath)) {
      return false;
    }
    if (cleanPath === '/' || cleanPath === '/dashboard') {
      return false;
    }
    return EMPLOYEE_ALLOWED_PREFIXES.some(
      (prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)
    );
  }

  if (role === 'manager') {
    if (
      MANAGER_RESTRICTED_PREFIXES.some(
        (prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)
      )
    ) {
      return false;
    }
    if (cleanPath === '/' || cleanPath === '/dashboard') {
      return false;
    }
    return MANAGER_ALLOWED_PREFIXES.some(
      (prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)
    );
  }

  if (role === 'it_admin') {
    if (
      IT_ADMIN_RESTRICTED_PREFIXES.some(
        (prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)
      )
    ) {
      return false;
    }
    if (cleanPath === '/' || cleanPath === '/dashboard') {
      return false;
    }
    return IT_ADMIN_ALLOWED_PREFIXES.some(
      (prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)
    );
  }

  if (role === 'executive') {
    if (
      EXECUTIVE_RESTRICTED_PREFIXES.some(
        (prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)
      )
    ) {
      return false;
    }
    if (cleanPath === '/' || cleanPath === '/dashboard') {
      return false;
    }
    return EXECUTIVE_ALLOWED_PREFIXES.some(
      (prefix) => cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)
    );
  }

  // Non-employee privileged roles
  if (cleanPath.startsWith('/dashboard/')) {
    const roleSlug = cleanPath.replace('/dashboard/', '').split('/')[0];
    const targetRole = normalizeRole(roleSlug);
    if (role === 'super_admin') return true;
    if (role === 'hr_admin') {
      return targetRole === 'hr_admin' || targetRole === 'employee';
    }
    return targetRole === role || targetRole === 'employee';
  }

  return true;
}

export function resolveAuthorizedDestination(
  rawRole: string | null | undefined,
  requestedPath: string
): { allowed: boolean; redirectTo: string } {
  const role = normalizeRole(rawRole);
  if (canRoleAccessRoute(role, requestedPath)) {
    return { allowed: true, redirectTo: requestedPath };
  }
  if (
    role === 'employee' ||
    role === 'manager' ||
    role === 'it_admin' ||
    role === 'executive'
  ) {
    return { allowed: false, redirectTo: '/dashboard/forbidden' };
  }
  return { allowed: false, redirectTo: ROLE_ROUTES[role].path };
}

/**
 * Prevents privilege escalation via URL query parameters such as ?employeeId=EMP-9999.
 * Always locks scope to the authenticated employee's own employeeId.
 */
export function enforceEmployeeScope(
  requestedEmployeeId: string | null | undefined,
  sessionEmployeeId: string
): { scopedEmployeeId: string; tampered: boolean } {
  const cleanSession = sessionEmployeeId.trim() || 'EMP-2048';
  const cleanRequested = (requestedEmployeeId || '').trim();
  if (!cleanRequested || cleanRequested === cleanSession) {
    return { scopedEmployeeId: cleanSession, tampered: false };
  }
  return { scopedEmployeeId: cleanSession, tampered: true };
}
