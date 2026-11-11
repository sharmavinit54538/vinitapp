import { useSelector } from 'react-redux';
import { RootState } from '../../lib/store';
import { HolidayModuleId, HolidayRole } from '../types/holidays';

export const HOLIDAY_ROLE_LABELS: Record<HolidayRole, string> = {
  super_admin: 'Super Admin',
  hr_admin: 'HR Admin',
  hr_executive: 'HR Executive',
  regional_hr: 'Location / Regional HR',
  reporting_manager: 'Reporting Manager',
  employee: 'Employee',
};

const ALL_22_HOLIDAY_MODULES: HolidayModuleId[] = [
  'dashboard',
  'calendar-views',
  'templates',
  'master',
  'assignment',
  'optional-policy',
  'weekly-off',
  'special-overrides',
  'swap-compoff',
  'shift-site',
  'holiday-work',
  'leave-payroll-sync',
  'optional-booking',
  'approvals',
  'communications',
  'year-rollover',
  'reports',
  'settings',
  'audit-logs',
  'notifications',
  'manager-portal',
  'employee-portal',
];

const MODULE_ACCESS_BY_ROLE: Record<HolidayRole, HolidayModuleId[]> = {
  super_admin: ALL_22_HOLIDAY_MODULES,
  hr_admin: ALL_22_HOLIDAY_MODULES,
  hr_executive: [
    'dashboard',
    'calendar-views',
    'templates',
    'master',
    'assignment',
    'optional-policy',
    'weekly-off',
    'special-overrides',
    'swap-compoff',
    'shift-site',
    'holiday-work',
    'leave-payroll-sync',
    'optional-booking',
    'communications',
    'reports',
    'notifications',
    'employee-portal',
  ],
  regional_hr: [
    'dashboard',
    'calendar-views',
    'templates',
    'master',
    'assignment',
    'optional-policy',
    'weekly-off',
    'special-overrides',
    'shift-site',
    'holiday-work',
    'optional-booking',
    'approvals',
    'communications',
    'reports',
    'notifications',
    'employee-portal',
  ],
  reporting_manager: [
    'dashboard',
    'calendar-views',
    'swap-compoff',
    'holiday-work',
    'optional-booking',
    'approvals',
    'notifications',
    'manager-portal',
    'employee-portal',
  ],
  employee: [
    'calendar-views',
    'swap-compoff',
    'optional-booking',
    'notifications',
    'employee-portal',
  ],
};

export function normalizeToHolidayRole(rawRole?: string | null): HolidayRole {
  if (!rawRole) return 'super_admin';
  const normalized = rawRole.toLowerCase().trim();
  if (normalized in MODULE_ACCESS_BY_ROLE) {
    return normalized as HolidayRole;
  }
  if (normalized === 'manager') return 'reporting_manager';
  if (normalized === 'executive') return 'hr_executive';
  return 'super_admin';
}

export function canHolidayRoleAccessModule(
  role: HolidayRole,
  moduleId: HolidayModuleId
): boolean {
  const allowed = MODULE_ACCESS_BY_ROLE[role] || [];
  return allowed.includes(moduleId);
}

export interface HolidayPermissionMatrix {
  role: HolidayRole;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canApprove: boolean;
  canExport: boolean;
}

export function getHolidayPermission(
  moduleId: HolidayModuleId,
  role: HolidayRole
): HolidayPermissionMatrix {
  const canView = canHolidayRoleAccessModule(role, moduleId);
  const isHrOrAdmin =
    role === 'super_admin' ||
    role === 'hr_admin' ||
    role === 'hr_executive' ||
    role === 'regional_hr';

  return {
    role,
    canView,
    canCreate:
      canView &&
      (isHrOrAdmin ||
        (moduleId === 'optional-booking' && role === 'employee') ||
        (moduleId === 'swap-compoff' && role === 'employee')),
    canEdit:
      canView &&
      (isHrOrAdmin ||
        role === 'reporting_manager' ||
        (moduleId === 'optional-booking' && role === 'employee') ||
        (moduleId === 'employee-portal' && role === 'employee')),
    canApprove:
      canView &&
      (role === 'super_admin' ||
        role === 'hr_admin' ||
        role === 'regional_hr' ||
        role === 'reporting_manager'),
    canExport:
      canView &&
      (isHrOrAdmin ||
        role === 'reporting_manager' ||
        moduleId === 'calendar-views' ||
        moduleId === 'employee-portal'),
  };
}

export function useHolidayPermission(
  moduleId: HolidayModuleId,
  overrideRole?: HolidayRole | null
): HolidayPermissionMatrix {
  const storeRole = useSelector(
    (state: RootState) => state.hrMobileUi?.activeRole
  );
  const resolvedRole = overrideRole || normalizeToHolidayRole(storeRole);
  return getHolidayPermission(moduleId, resolvedRole);
}
