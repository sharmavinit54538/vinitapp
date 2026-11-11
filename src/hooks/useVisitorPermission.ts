import { useSelector } from 'react-redux';
import { RootState } from '../../lib/store';
import { VisitorModuleId, VisitorRole } from '../types/visitors';

export const VISITOR_ROLE_LABELS: Record<VisitorRole, string> = {
  super_admin: 'Super Admin',
  admin_facilities: 'Admin / Facilities',
  security_reception: 'Security / Reception',
  security_supervisor: 'Security Supervisor',
  host_employee: 'Host / Employee',
  approver: 'Approver',
  auditor: 'Auditor',
  visitor: 'Visitor (Public Pass)',
};

const ALL_24_VISITOR_MODULES: VisitorModuleId[] = [
  'dashboard',
  'pre-registration',
  'walk-in',
  'kiosk',
  'passes',
  'reception-desk',
  'host-approvals',
  'visitor-types',
  'watchlist',
  'documents-nda',
  'vehicles-parking',
  'contractors-deliveries',
  'area-access',
  'material-gate-pass',
  'health-safety',
  'evacuation',
  'communications',
  'approvals',
  'reports',
  'settings',
  'audit-logs',
  'notifications',
  'host-portal',
  'visitor-portal',
];

const MODULE_ACCESS_BY_ROLE: Record<VisitorRole, VisitorModuleId[]> = {
  super_admin: ALL_24_VISITOR_MODULES,
  admin_facilities: ALL_24_VISITOR_MODULES,
  security_supervisor: [
    'dashboard',
    'pre-registration',
    'walk-in',
    'kiosk',
    'passes',
    'reception-desk',
    'host-approvals',
    'visitor-types',
    'watchlist',
    'documents-nda',
    'vehicles-parking',
    'contractors-deliveries',
    'area-access',
    'material-gate-pass',
    'health-safety',
    'evacuation',
    'approvals',
    'reports',
    'audit-logs',
    'notifications',
  ],
  security_reception: [
    'dashboard',
    'pre-registration',
    'walk-in',
    'kiosk',
    'passes',
    'reception-desk',
    'host-approvals',
    'watchlist',
    'documents-nda',
    'vehicles-parking',
    'contractors-deliveries',
    'area-access',
    'material-gate-pass',
    'health-safety',
    'evacuation',
    'notifications',
  ],
  host_employee: [
    'dashboard',
    'pre-registration',
    'host-approvals',
    'material-gate-pass',
    'notifications',
    'host-portal',
  ],
  approver: [
    'dashboard',
    'pre-registration',
    'host-approvals',
    'watchlist',
    'area-access',
    'material-gate-pass',
    'approvals',
    'notifications',
    'host-portal',
  ],
  auditor: [
    'dashboard',
    'watchlist',
    'documents-nda',
    'health-safety',
    'evacuation',
    'reports',
    'audit-logs',
  ],
  visitor: ['kiosk', 'visitor-portal'],
};

export function normalizeToVisitorRole(rawRole?: string | null): VisitorRole {
  if (!rawRole) return 'super_admin';
  const normalized = rawRole.toLowerCase().trim();
  if (normalized in MODULE_ACCESS_BY_ROLE) {
    return normalized as VisitorRole;
  }
  if (normalized === 'hr_admin') return 'admin_facilities';
  if (normalized === 'employee') return 'host_employee';
  if (normalized === 'manager') return 'approver';
  return 'super_admin';
}

export function canVisitorRoleAccessModule(
  role: VisitorRole,
  moduleId: VisitorModuleId
): boolean {
  const allowed = MODULE_ACCESS_BY_ROLE[role] || [];
  return allowed.includes(moduleId);
}

export interface VisitorPermissionMatrix {
  role: VisitorRole;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canApprove: boolean;
  canRevealPii: boolean;
  canTriggerEmergency: boolean;
  canExport: boolean;
}

export function getVisitorPermission(
  moduleId: VisitorModuleId,
  role: VisitorRole
): VisitorPermissionMatrix {
  const canView = canVisitorRoleAccessModule(role, moduleId);
  const isAdminOrSec =
    role === 'super_admin' ||
    role === 'admin_facilities' ||
    role === 'security_supervisor' ||
    role === 'security_reception';

  return {
    role,
    canView,
    canCreate:
      canView &&
      (isAdminOrSec ||
        role === 'host_employee' ||
        (moduleId === 'visitor-portal' && role === 'visitor') ||
        (moduleId === 'kiosk' && role === 'visitor')),
    canEdit:
      canView &&
      (isAdminOrSec ||
        role === 'host_employee' ||
        role === 'approver' ||
        moduleId === 'visitor-portal'),
    canApprove:
      canView &&
      (role === 'super_admin' ||
        role === 'admin_facilities' ||
        role === 'security_supervisor' ||
        role === 'approver' ||
        role === 'host_employee'),
    canRevealPii:
      canView &&
      (role === 'super_admin' ||
        role === 'admin_facilities' ||
        role === 'security_supervisor' ||
        role === 'auditor'),
    canTriggerEmergency:
      canView &&
      (role === 'super_admin' ||
        role === 'admin_facilities' ||
        role === 'security_supervisor'),
    canExport:
      canView &&
      (role === 'super_admin' ||
        role === 'admin_facilities' ||
        role === 'security_supervisor' ||
        role === 'auditor'),
  };
}

export function useVisitorPermission(
  moduleId: VisitorModuleId,
  overrideRole?: VisitorRole | null
): VisitorPermissionMatrix {
  const storeRole = useSelector(
    (state: RootState) => state.hrMobileUi?.activeRole
  );
  const resolvedRole = overrideRole || normalizeToVisitorRole(storeRole);
  return getVisitorPermission(moduleId, resolvedRole);
}
