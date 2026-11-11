'use client';

import { useMemo } from 'react';
import {
  AttendanceAnalyticsModuleId,
  AttendanceAnalyticsRole,
} from '../types/attendanceAnalytics';

export interface AttendanceModulePermission {
  canView: boolean;
  canExport: boolean;
  canManage: boolean;
  canReviewAnomalies: boolean;
  canViewRawGeoCoords: boolean;
  scopeDescription: string;
}

const ROLE_SCOPE_DESCRIPTIONS: Record<AttendanceAnalyticsRole, string> = {
  super_admin: 'Full global access across all entities, settings, devices, anomalies, and audit logs',
  hr_admin: 'Organization-wide attendance analytics, targets, alerts, and reports',
  attendance_admin: 'Shift rosters, devices, regularizations, exceptions, and live status',
  regional_hr: 'Assigned locations, entities, and regional attendance metrics',
  department_head: 'Department-level attendance analytics, overtime, and productivity',
  reporting_manager: 'Direct & indirect reports attendance, punctuality, and team alerts',
  payroll: 'Attendance-to-payroll impact, LOP, overtime, holiday work, and reconciliation',
  auditor: 'Read-only access to all attendance dashboards, anomalies, compliance, and audit logs',
  employee: 'Own attendance insights, working hours, punctuality, and comp-off balance only',
};

const ROLE_VIEWABLE_MODULES: Record<
  AttendanceAnalyticsRole,
  AttendanceAnalyticsModuleId[]
> = {
  super_admin: [
    'overview',
    'daily-live',
    'punctuality',
    'absenteeism-leave',
    'working-hours',
    'overtime-holiday',
    'shift-roster',
    'location-remote',
    'regularizations',
    'devices-sources',
    'anomalies',
    'payroll-impact',
    'profiles',
    'trends-forecasting',
    'benchmarks-targets',
    'drill-down',
    'insights-alerts',
    'saved-schedules',
    'settings',
    'audit-logs',
    'notifications',
    'manager-view',
    'employee-view',
  ],
  hr_admin: [
    'overview',
    'daily-live',
    'punctuality',
    'absenteeism-leave',
    'working-hours',
    'overtime-holiday',
    'shift-roster',
    'location-remote',
    'regularizations',
    'devices-sources',
    'anomalies',
    'payroll-impact',
    'profiles',
    'trends-forecasting',
    'benchmarks-targets',
    'drill-down',
    'insights-alerts',
    'saved-schedules',
    'settings',
    'audit-logs',
    'notifications',
    'manager-view',
    'employee-view',
  ],
  attendance_admin: [
    'overview',
    'daily-live',
    'punctuality',
    'absenteeism-leave',
    'working-hours',
    'overtime-holiday',
    'shift-roster',
    'location-remote',
    'regularizations',
    'devices-sources',
    'anomalies',
    'profiles',
    'drill-down',
    'insights-alerts',
    'saved-schedules',
    'settings',
    'notifications',
  ],
  regional_hr: [
    'overview',
    'daily-live',
    'punctuality',
    'absenteeism-leave',
    'working-hours',
    'overtime-holiday',
    'shift-roster',
    'location-remote',
    'regularizations',
    'devices-sources',
    'anomalies',
    'profiles',
    'trends-forecasting',
    'benchmarks-targets',
    'drill-down',
    'insights-alerts',
    'saved-schedules',
    'notifications',
  ],
  department_head: [
    'overview',
    'daily-live',
    'punctuality',
    'absenteeism-leave',
    'working-hours',
    'overtime-holiday',
    'shift-roster',
    'location-remote',
    'regularizations',
    'profiles',
    'trends-forecasting',
    'benchmarks-targets',
    'drill-down',
    'insights-alerts',
    'saved-schedules',
    'notifications',
    'manager-view',
  ],
  reporting_manager: [
    'daily-live',
    'punctuality',
    'absenteeism-leave',
    'working-hours',
    'overtime-holiday',
    'shift-roster',
    'regularizations',
    'profiles',
    'notifications',
    'manager-view',
    'employee-view',
  ],
  payroll: [
    'overview',
    'overtime-holiday',
    'absenteeism-leave',
    'regularizations',
    'payroll-impact',
    'drill-down',
    'saved-schedules',
    'notifications',
  ],
  auditor: [
    'overview',
    'daily-live',
    'punctuality',
    'absenteeism-leave',
    'working-hours',
    'overtime-holiday',
    'shift-roster',
    'location-remote',
    'regularizations',
    'devices-sources',
    'anomalies',
    'payroll-impact',
    'profiles',
    'trends-forecasting',
    'benchmarks-targets',
    'drill-down',
    'insights-alerts',
    'saved-schedules',
    'audit-logs',
    'notifications',
  ],
  employee: ['notifications', 'employee-view'],
};

export function evaluateAttendanceAnalyticsPermission(
  role: AttendanceAnalyticsRole,
  moduleId: AttendanceAnalyticsModuleId
): AttendanceModulePermission {
  const viewable = ROLE_VIEWABLE_MODULES[role] || [];
  const canView = viewable.includes(moduleId);

  const isReadOnlyAuditor = role === 'auditor';
  const canManage =
    !isReadOnlyAuditor &&
    canView &&
    (role === 'super_admin' ||
      role === 'hr_admin' ||
      role === 'attendance_admin' ||
      (role === 'payroll' &&
        (moduleId === 'payroll-impact' || moduleId === 'overtime-holiday')) ||
      ((role === 'reporting_manager' || role === 'department_head') &&
        moduleId === 'manager-view'));

  const canExport =
    canView &&
    role !== 'employee' &&
    (role === 'super_admin' ||
      role === 'hr_admin' ||
      role === 'attendance_admin' ||
      role === 'regional_hr' ||
      role === 'department_head' ||
      role === 'payroll' ||
      role === 'auditor');

  const canReviewAnomalies =
    !isReadOnlyAuditor &&
    (role === 'super_admin' ||
      role === 'hr_admin' ||
      role === 'attendance_admin');

  const canViewRawGeoCoords =
    role === 'super_admin' || role === 'attendance_admin';

  return {
    canView,
    canExport,
    canManage,
    canReviewAnomalies,
    canViewRawGeoCoords,
    scopeDescription: ROLE_SCOPE_DESCRIPTIONS[role],
  };
}

export function useAttendanceAnalyticsPermission(
  role: AttendanceAnalyticsRole,
  moduleId: AttendanceAnalyticsModuleId
): AttendanceModulePermission {
  return useMemo(
    () => evaluateAttendanceAnalyticsPermission(role, moduleId),
    [role, moduleId]
  );
}
