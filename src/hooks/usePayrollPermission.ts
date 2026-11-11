import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../lib/store';
import {
  PayrollRole,
  PayrollPermission,
  PayrollModuleId,
} from '../types/payroll';

const ALL_PERMISSIONS: PayrollPermission[] = [
  'payroll.dashboard.view',
  'payroll.run.view',
  'payroll.run.execute',
  'payroll.run.rollback',
  'payroll.run.hold',
  'payroll.structure.view',
  'payroll.structure.manage',
  'payroll.compensation.view',
  'payroll.compensation.manage',
  'payroll.sensitive.reveal',
  'payroll.attendance.view',
  'payroll.attendance.override',
  'payroll.attendance.lock',
  'payroll.variables.view',
  'payroll.variables.manage',
  'payroll.loans.view',
  'payroll.loans.manage',
  'payroll.statutory.view',
  'payroll.statutory.manage',
  'payroll.tax.view',
  'payroll.tax.verify',
  'payroll.approvals.view',
  'payroll.approvals.act',
  'payroll.payslips.view',
  'payroll.payslips.manage',
  'payroll.disbursement.view',
  'payroll.disbursement.manage',
  'payroll.fnf.view',
  'payroll.fnf.manage',
  'payroll.arrears.view',
  'payroll.arrears.manage',
  'payroll.reports.view',
  'payroll.reports.export',
  'payroll.settings.view',
  'payroll.settings.manage',
  'payroll.audit.view',
  'payroll.notifications.view',
  'payroll.ess.self',
];

export const ROLE_PERMISSION_MATRIX: Record<PayrollRole, PayrollPermission[]> = {
  super_admin: ALL_PERMISSIONS,
  hr_admin: ALL_PERMISSIONS.filter((p) => p !== 'payroll.run.rollback'),
  payroll_manager: [
    'payroll.dashboard.view',
    'payroll.run.view',
    'payroll.run.execute',
    'payroll.run.hold',
    'payroll.structure.view',
    'payroll.structure.manage',
    'payroll.compensation.view',
    'payroll.compensation.manage',
    'payroll.sensitive.reveal',
    'payroll.attendance.view',
    'payroll.attendance.override',
    'payroll.attendance.lock',
    'payroll.variables.view',
    'payroll.variables.manage',
    'payroll.loans.view',
    'payroll.loans.manage',
    'payroll.statutory.view',
    'payroll.statutory.manage',
    'payroll.tax.view',
    'payroll.tax.verify',
    'payroll.approvals.view',
    'payroll.payslips.view',
    'payroll.payslips.manage',
    'payroll.disbursement.view',
    'payroll.disbursement.manage',
    'payroll.fnf.view',
    'payroll.fnf.manage',
    'payroll.arrears.view',
    'payroll.arrears.manage',
    'payroll.reports.view',
    'payroll.reports.export',
    'payroll.settings.view',
    'payroll.audit.view',
    'payroll.notifications.view',
    'payroll.ess.self',
  ],
  finance_approver: [
    'payroll.dashboard.view',
    'payroll.run.view',
    'payroll.compensation.view',
    'payroll.loans.view',
    'payroll.statutory.view',
    'payroll.approvals.view',
    'payroll.approvals.act',
    'payroll.disbursement.view',
    'payroll.disbursement.manage',
    'payroll.fnf.view',
    'payroll.fnf.manage',
    'payroll.arrears.view',
    'payroll.reports.view',
    'payroll.reports.export',
    'payroll.audit.view',
    'payroll.notifications.view',
    'payroll.ess.self',
  ],
  manager: [
    'payroll.dashboard.view',
    'payroll.attendance.view',
    'payroll.variables.view',
    'payroll.loans.view',
    'payroll.approvals.view',
    'payroll.approvals.act',
    'payroll.reports.view',
    'payroll.notifications.view',
    'payroll.ess.self',
  ],
  employee: [
    'payroll.notifications.view',
    'payroll.ess.self',
  ],
};

export const MODULE_REQUIRED_PERMISSION: Record<PayrollModuleId, PayrollPermission> = {
  dashboard: 'payroll.dashboard.view',
  'pay-calendar': 'payroll.run.view',
  'salary-structures': 'payroll.structure.view',
  compensation: 'payroll.compensation.view',
  'attendance-lop': 'payroll.attendance.view',
  'variable-inputs': 'payroll.variables.view',
  'loans-advances': 'payroll.loans.view',
  statutory: 'payroll.statutory.view',
  'tax-declarations': 'payroll.tax.view',
  approvals: 'payroll.approvals.view',
  payslips: 'payroll.payslips.view',
  'bank-disbursement': 'payroll.disbursement.view',
  'fnf-settlement': 'payroll.fnf.view',
  arrears: 'payroll.arrears.view',
  reports: 'payroll.reports.view',
  settings: 'payroll.settings.view',
  'audit-logs': 'payroll.audit.view',
  notifications: 'payroll.notifications.view',
  'my-pay': 'payroll.ess.self',
};

export function normalizePayrollRole(rawRole?: string | null): PayrollRole {
  if (!rawRole) return 'hr_admin';
  const r = rawRole.toLowerCase().trim();
  if (r === 'super_admin') return 'super_admin';
  if (r === 'hr_admin') return 'hr_admin';
  if (r === 'payroll_manager') return 'payroll_manager';
  if (r === 'finance_approver' || r === 'executive') return 'finance_approver';
  if (r === 'manager') return 'manager';
  if (r === 'employee') return 'employee';
  return 'hr_admin';
}

export function checkPayrollPermission(
  role: PayrollRole,
  permission: PayrollPermission
): boolean {
  const allowed = ROLE_PERMISSION_MATRIX[role] || [];
  return allowed.includes(permission);
}

export function canRoleAccessModule(
  role: PayrollRole,
  moduleId: PayrollModuleId
): boolean {
  const reqPerm = MODULE_REQUIRED_PERMISSION[moduleId];
  return checkPayrollPermission(role, reqPerm);
}

export function usePayrollPermission(overrideRole?: PayrollRole | null) {
  const storeRole = useSelector(
    (state: RootState) => state.hrMobileUi?.activeRole
  );
  const effectiveRole: PayrollRole = overrideRole || normalizePayrollRole(storeRole);

  return useMemo(() => {
    const permissions = ROLE_PERMISSION_MATRIX[effectiveRole] || [];
    const hasPermission = (perm: PayrollPermission) => permissions.includes(perm);
    const canAccessModule = (moduleId: PayrollModuleId) =>
      hasPermission(MODULE_REQUIRED_PERMISSION[moduleId]);

    return {
      role: effectiveRole,
      permissions,
      hasPermission,
      canAccessModule,
      canExecuteRun: hasPermission('payroll.run.execute'),
      canRollbackRun: hasPermission('payroll.run.rollback'),
      canHoldSalary: hasPermission('payroll.run.hold'),
      canManageStructure: hasPermission('payroll.structure.manage'),
      canManageCompensation: hasPermission('payroll.compensation.manage'),
      canRevealSensitive: hasPermission('payroll.sensitive.reveal'),
      canOverrideLop: hasPermission('payroll.attendance.override'),
      canLockAttendance: hasPermission('payroll.attendance.lock'),
      canManageVariables: hasPermission('payroll.variables.manage'),
      canManageLoans: hasPermission('payroll.loans.manage'),
      canManageStatutory: hasPermission('payroll.statutory.manage'),
      canVerifyTax: hasPermission('payroll.tax.verify'),
      canActOnApprovals: hasPermission('payroll.approvals.act'),
      canManagePayslips: hasPermission('payroll.payslips.manage'),
      canManageDisbursement: hasPermission('payroll.disbursement.manage'),
      canManageFnf: hasPermission('payroll.fnf.manage'),
      canManageArrears: hasPermission('payroll.arrears.manage'),
      canExportReports: hasPermission('payroll.reports.export'),
      canManageSettings: hasPermission('payroll.settings.manage'),
    };
  }, [effectiveRole]);
}
