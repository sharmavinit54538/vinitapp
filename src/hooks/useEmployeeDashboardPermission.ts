'use client';

import { useMemo } from 'react';
import {
  EmployeeDashboardRole,
  EmployeeWidgetId,
} from '../types/employeeDashboard';

export interface EmployeePermissionEvaluation {
  canViewWidget: (
    widgetId: EmployeeWidgetId,
    conditionalFlags?: {
      travel?: boolean;
      probationOrExit?: boolean;
      managerExtras?: boolean;
    }
  ) => boolean;
  hasPermission: (permissionCode: string) => boolean;
  isManager: boolean;
  sanitizedUrlHasForbiddenEmployeeId: boolean;
}

/**
 * Pure guard ensuring the Employee Dashboard never accepts an employeeId from URL query parameters.
 */
export function detectForbiddenEmployeeIdInSearch(search: string): boolean {
  if (!search) return false;
  const normalized = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(normalized);
  const forbiddenKeys = [
    'employeeId',
    'employee_id',
    'empId',
    'emp_id',
    'userId',
    'user_id',
  ];
  return forbiddenKeys.some((k) => params.has(k));
}

export function evaluateEmployeeDashboardPermission(
  role: EmployeeDashboardRole,
  grantedPermissions: string[] = []
): Omit<EmployeePermissionEvaluation, 'sanitizedUrlHasForbiddenEmployeeId'> {
  const isManager =
    role === 'reporting_manager' ||
    grantedPermissions.includes('manager:team_approvals');

  const hasPermission = (permissionCode: string): boolean => {
    if (!permissionCode) return true;
    if (grantedPermissions.includes(permissionCode)) return true;
    if (permissionCode.startsWith('manager:')) {
      return isManager;
    }
    return true;
  };

  const canViewWidget = (
    widgetId: EmployeeWidgetId,
    conditionalFlags?: {
      travel?: boolean;
      probationOrExit?: boolean;
      managerExtras?: boolean;
    }
  ): boolean => {
    if (widgetId === 'manager-extras') {
      return Boolean(isManager && (conditionalFlags?.managerExtras ?? true));
    }
    if (widgetId === 'travel') {
      return Boolean(conditionalFlags?.travel ?? true);
    }
    if (widgetId === 'probation-exit') {
      return Boolean(conditionalFlags?.probationOrExit ?? true);
    }
    return true;
  };

  return {
    canViewWidget,
    hasPermission,
    isManager,
  };
}

export function usePermission(
  role: EmployeeDashboardRole,
  grantedPermissions: string[] = [],
  currentSearch = ''
): EmployeePermissionEvaluation {
  const permKey = grantedPermissions.join(',');
  return useMemo(() => {
    const base = evaluateEmployeeDashboardPermission(
      role,
      permKey ? permKey.split(',') : []
    );
    return {
      ...base,
      sanitizedUrlHasForbiddenEmployeeId:
        detectForbiddenEmployeeIdInSearch(currentSearch),
    };
  }, [role, permKey, currentSearch]);
}
