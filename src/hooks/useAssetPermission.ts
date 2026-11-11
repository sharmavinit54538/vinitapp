import { useSelector } from 'react-redux';
import { RootState } from '../../lib/store';
import { AssetModuleId, AssetRole } from '../types/assets';

export const ASSET_ROLE_LABELS: Record<AssetRole, string> = {
  super_admin: 'Super Admin',
  asset_admin: 'Asset Admin',
  it_admin: 'IT Admin',
  facilities_admin: 'Facilities / Admin',
  finance: 'Finance',
  procurement: 'Procurement',
  hr_admin: 'HR Admin',
  reporting_manager: 'Reporting Manager',
  auditor: 'Auditor',
  employee: 'Employee',
};

const ALL_25_ASSET_MODULES: AssetModuleId[] = [
  'dashboard',
  'register',
  'categories',
  'procurement',
  'vendors',
  'allocation',
  'requests',
  'lifecycle-integration',
  'maintenance',
  'warranty',
  'licenses',
  'depreciation',
  'transfers',
  'physical-audit',
  'loss-disposal',
  'consumables',
  'locations',
  'qr-barcode',
  'approvals',
  'reports',
  'settings',
  'audit-logs',
  'notifications',
  'manager-portal',
  'employee-portal',
];

const MODULE_ACCESS_BY_ROLE: Record<AssetRole, AssetModuleId[]> = {
  super_admin: ALL_25_ASSET_MODULES,
  asset_admin: ALL_25_ASSET_MODULES,
  it_admin: [
    'dashboard',
    'register',
    'categories',
    'allocation',
    'requests',
    'lifecycle-integration',
    'maintenance',
    'warranty',
    'licenses',
    'transfers',
    'physical-audit',
    'loss-disposal',
    'consumables',
    'qr-barcode',
    'approvals',
    'reports',
    'notifications',
    'employee-portal',
  ],
  facilities_admin: [
    'dashboard',
    'register',
    'categories',
    'allocation',
    'requests',
    'lifecycle-integration',
    'maintenance',
    'warranty',
    'transfers',
    'physical-audit',
    'loss-disposal',
    'consumables',
    'locations',
    'qr-barcode',
    'reports',
    'notifications',
    'employee-portal',
  ],
  finance: [
    'dashboard',
    'register',
    'procurement',
    'vendors',
    'warranty',
    'licenses',
    'depreciation',
    'loss-disposal',
    'locations',
    'approvals',
    'reports',
    'audit-logs',
    'notifications',
  ],
  procurement: [
    'dashboard',
    'register',
    'categories',
    'procurement',
    'vendors',
    'warranty',
    'consumables',
    'approvals',
    'reports',
    'notifications',
  ],
  hr_admin: [
    'dashboard',
    'register',
    'allocation',
    'requests',
    'lifecycle-integration',
    'approvals',
    'reports',
    'notifications',
    'manager-portal',
    'employee-portal',
  ],
  reporting_manager: [
    'dashboard',
    'allocation',
    'requests',
    'lifecycle-integration',
    'transfers',
    'approvals',
    'notifications',
    'manager-portal',
    'employee-portal',
  ],
  auditor: [
    'dashboard',
    'register',
    'depreciation',
    'physical-audit',
    'loss-disposal',
    'locations',
    'qr-barcode',
    'reports',
    'audit-logs',
  ],
  employee: [
    'requests',
    'transfers',
    'loss-disposal',
    'notifications',
    'employee-portal',
  ],
};

export function normalizeToAssetRole(rawRole?: string | null): AssetRole {
  if (!rawRole) return 'super_admin';
  const normalized = rawRole.toLowerCase().trim();
  if (normalized in MODULE_ACCESS_BY_ROLE) {
    return normalized as AssetRole;
  }
  if (normalized === 'manager') return 'reporting_manager';
  if (normalized === 'executive') return 'finance';
  return 'super_admin';
}

export function canAssetRoleAccessModule(
  role: AssetRole,
  moduleId: AssetModuleId
): boolean {
  const allowed = MODULE_ACCESS_BY_ROLE[role] || [];
  return allowed.includes(moduleId);
}

export interface AssetPermissionMatrix {
  role: AssetRole;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canApprove: boolean;
  canExport: boolean;
  canRevealSensitive: boolean;
}

export function getAssetPermission(
  moduleId: AssetModuleId,
  role: AssetRole
): AssetPermissionMatrix {
  const canView = canAssetRoleAccessModule(role, moduleId);
  const isPowerRole =
    role === 'super_admin' ||
    role === 'asset_admin' ||
    role === 'it_admin' ||
    role === 'facilities_admin' ||
    role === 'procurement' ||
    role === 'finance' ||
    role === 'hr_admin';

  return {
    role,
    canView,
    canCreate:
      canView &&
      (isPowerRole ||
        (moduleId === 'requests' && role === 'employee') ||
        (moduleId === 'loss-disposal' && role === 'employee') ||
        (moduleId === 'physical-audit' && role === 'auditor')),
    canEdit:
      canView &&
      (isPowerRole ||
        role === 'reporting_manager' ||
        (moduleId === 'physical-audit' && role === 'auditor') ||
        (moduleId === 'employee-portal' && role === 'employee')),
    canApprove:
      canView &&
      (role === 'super_admin' ||
        role === 'asset_admin' ||
        role === 'it_admin' ||
        role === 'finance' ||
        role === 'procurement' ||
        role === 'reporting_manager' ||
        role === 'hr_admin'),
    canExport:
      canView &&
      (role === 'super_admin' ||
        role === 'asset_admin' ||
        role === 'finance' ||
        role === 'auditor' ||
        role === 'procurement' ||
        role === 'hr_admin'),
    canRevealSensitive:
      role === 'super_admin' ||
      role === 'asset_admin' ||
      role === 'it_admin' ||
      role === 'finance' ||
      role === 'auditor',
  };
}

export function useAssetPermission(
  moduleId: AssetModuleId,
  overrideRole?: AssetRole | null
): AssetPermissionMatrix {
  const storeRole = useSelector(
    (state: RootState) => state.hrMobileUi?.activeRole
  );
  const resolvedRole = overrideRole || normalizeToAssetRole(storeRole);
  return getAssetPermission(moduleId, resolvedRole);
}
