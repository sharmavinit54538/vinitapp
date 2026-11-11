import { useSelector } from 'react-redux';
import { RootState } from '../../lib/store';
import { OnboardingModuleId, OnboardingRole } from '../types/onboarding';

export const ONBOARDING_ROLE_LABELS: Record<OnboardingRole, string> = {
  super_admin: 'Super Admin',
  hr_admin: 'HR Admin',
  hr_executive: 'HR Executive (Onboarding)',
  reporting_manager: 'Reporting Manager',
  it_admin: 'IT / Systems Admin',
  admin_facilities: 'Admin / Facilities',
  finance_payroll: 'Finance / Payroll',
  buddy_mentor: 'Buddy / Mentor',
  new_joiner: 'New Joiner (Pre-boarding)',
};

const MODULE_ACCESS_BY_ROLE: Record<OnboardingRole, OnboardingModuleId[]> = {
  super_admin: [
    'dashboard',
    'joiners',
    'workflows',
    'tasks',
    'documents',
    'joining-forms',
    'offer-handoff',
    'policies',
    'it-assets',
    'payroll-handoff',
    'induction',
    'training',
    'buddy',
    'day-one',
    'probation',
    'surveys',
    'communications',
    'approvals',
    'reports',
    'settings',
    'audit-logs',
    'notifications',
    'manager-portal',
    'joiner-portal',
  ],
  hr_admin: [
    'dashboard',
    'joiners',
    'workflows',
    'tasks',
    'documents',
    'joining-forms',
    'offer-handoff',
    'policies',
    'it-assets',
    'payroll-handoff',
    'induction',
    'training',
    'buddy',
    'day-one',
    'probation',
    'surveys',
    'communications',
    'approvals',
    'reports',
    'settings',
    'audit-logs',
    'notifications',
    'manager-portal',
    'joiner-portal',
  ],
  hr_executive: [
    'dashboard',
    'joiners',
    'workflows',
    'tasks',
    'documents',
    'joining-forms',
    'offer-handoff',
    'policies',
    'it-assets',
    'payroll-handoff',
    'induction',
    'training',
    'buddy',
    'day-one',
    'probation',
    'surveys',
    'communications',
    'reports',
    'notifications',
    'joiner-portal',
  ],
  reporting_manager: [
    'dashboard',
    'joiners',
    'tasks',
    'training',
    'buddy',
    'probation',
    'approvals',
    'reports',
    'notifications',
    'manager-portal',
  ],
  it_admin: ['tasks', 'it-assets', 'notifications'],
  admin_facilities: ['tasks', 'it-assets', 'day-one', 'notifications'],
  finance_payroll: [
    'tasks',
    'documents',
    'payroll-handoff',
    'approvals',
    'notifications',
  ],
  buddy_mentor: ['tasks', 'buddy', 'day-one', 'notifications'],
  new_joiner: [
    'documents',
    'joining-forms',
    'policies',
    'induction',
    'training',
    'surveys',
    'notifications',
    'joiner-portal',
  ],
};

export function normalizeToOnboardingRole(rawRole?: string | null): OnboardingRole {
  if (!rawRole) return 'super_admin';
  const normalized = rawRole.toLowerCase().trim();
  if (normalized === 'super_admin') return 'super_admin';
  if (normalized === 'hr_admin') return 'hr_admin';
  if (normalized === 'hr_executive') return 'hr_executive';
  if (normalized === 'reporting_manager' || normalized === 'manager') {
    return 'reporting_manager';
  }
  if (normalized === 'it_admin') return 'it_admin';
  if (normalized === 'admin_facilities') return 'admin_facilities';
  if (normalized === 'finance_payroll' || normalized === 'executive') {
    return 'finance_payroll';
  }
  if (normalized === 'buddy_mentor') return 'buddy_mentor';
  if (normalized === 'new_joiner' || normalized === 'employee') {
    return 'new_joiner';
  }
  return 'super_admin';
}

export function canOnboardingRoleAccessModule(
  role: OnboardingRole,
  moduleId: OnboardingModuleId
): boolean {
  const allowed = MODULE_ACCESS_BY_ROLE[role] || [];
  return allowed.includes(moduleId);
}

export interface OnboardingPermissionsMatrix {
  role: OnboardingRole;
  canAccessModule: (moduleId: OnboardingModuleId) => boolean;
  canRevealSensitiveId: boolean;
  canManageTemplates: boolean;
  canVerifyDocuments: boolean;
  canFulfillItAssets: boolean;
  canSyncPayrollHandoff: boolean;
  canEvaluateProbation: boolean;
  canApproveWorkflow: boolean;
  canConfigureSettings: boolean;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canApprove: boolean;
  canExport: boolean;
  canRevealSensitive: boolean;
}

export function getOnboardingPermission(
  moduleId: OnboardingModuleId,
  role: OnboardingRole
): OnboardingPermissionsMatrix {
  const canView = canOnboardingRoleAccessModule(role, moduleId);
  const isAdminOrHr =
    role === 'super_admin' || role === 'hr_admin' || role === 'hr_executive';
  return {
    role,
    canAccessModule: (m: OnboardingModuleId) =>
      canOnboardingRoleAccessModule(role, m),
    canRevealSensitiveId:
      role === 'super_admin' ||
      role === 'hr_admin' ||
      role === 'finance_payroll',
    canManageTemplates: role === 'super_admin' || role === 'hr_admin',
    canVerifyDocuments:
      role === 'super_admin' ||
      role === 'hr_admin' ||
      role === 'hr_executive' ||
      role === 'finance_payroll',
    canFulfillItAssets:
      role === 'super_admin' ||
      role === 'it_admin' ||
      role === 'admin_facilities',
    canSyncPayrollHandoff:
      role === 'super_admin' ||
      role === 'hr_admin' ||
      role === 'finance_payroll',
    canEvaluateProbation:
      role === 'super_admin' ||
      role === 'hr_admin' ||
      role === 'reporting_manager',
    canApproveWorkflow:
      role === 'super_admin' ||
      role === 'hr_admin' ||
      role === 'reporting_manager' ||
      role === 'finance_payroll',
    canConfigureSettings: role === 'super_admin' || role === 'hr_admin',
    canView,
    canCreate:
      canView &&
      (isAdminOrHr ||
        (moduleId === 'surveys' && role === 'new_joiner') ||
        (moduleId === 'joiner-portal' && role === 'new_joiner') ||
        (moduleId === 'buddy' && role === 'reporting_manager')),
    canEdit:
      canView &&
      (isAdminOrHr ||
        role === 'it_admin' ||
        role === 'admin_facilities' ||
        role === 'finance_payroll' ||
        role === 'reporting_manager' ||
        (moduleId === 'joiner-portal' && role === 'new_joiner')),
    canApprove:
      canView &&
      (role === 'super_admin' ||
        role === 'hr_admin' ||
        role === 'reporting_manager' ||
        role === 'finance_payroll'),
    canExport:
      canView &&
      (role === 'super_admin' ||
        role === 'hr_admin' ||
        role === 'hr_executive' ||
        role === 'finance_payroll'),
    canRevealSensitive:
      role === 'super_admin' ||
      role === 'hr_admin' ||
      role === 'finance_payroll',
  };
}

export function computeOnboardingPermissions(
  role: OnboardingRole,
  moduleId: OnboardingModuleId = 'dashboard'
): OnboardingPermissionsMatrix {
  return getOnboardingPermission(moduleId, role);
}

export function useOnboardingPermission(
  arg1?: OnboardingModuleId | OnboardingRole | null,
  arg2?: OnboardingRole | null
): OnboardingPermissionsMatrix {
  const storeRole = useSelector(
    (state: RootState) => state.hrMobileUi?.activeRole
  );
  if (arg2) {
    return getOnboardingPermission(arg1 as OnboardingModuleId, arg2);
  }
  const resolvedRole = normalizeToOnboardingRole(
    (arg1 as string | undefined) || storeRole
  );
  return computeOnboardingPermissions(resolvedRole);
}
