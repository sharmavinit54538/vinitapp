import {
  AbsenteeismLeaveCorrelationResponse,
  AttendanceAnalyticsSettingsResponse,
  AttendanceAnomalyRecord,
  AttendanceAuditLogRecord,
  AttendanceDrillDownRecord,
  AttendanceNotificationRecord,
  AttendanceOverviewResponse,
  AttendancePayrollImpactResponse,
  AttendanceSharedFilterParams,
  BenchmarkTargetRecord,
  CreateAlertRulePayload,
  CreateBenchmarkTargetPayload,
  CreateScheduledReportPayload,
  DailyLiveStatusResponse,
  DeviceSourceAnalyticsResponse,
  EmployeeAttendanceProfileResponse,
  EmployeeMyAttendanceViewResponse,
  InsightsAlertsResponse,
  LocationRemoteAnalyticsResponse,
  ManagerAttendanceViewResponse,
  OvertimeHolidayAnalyticsResponse,
  PaginatedAttendanceResponse,
  PunctualityAnalyticsResponse,
  RegularizationExceptionAnalyticsResponse,
  ScheduledAttendanceReportRecord,
  ShiftRosterAnalyticsResponse,
  TrendsForecastingResponse,
  WorkingHoursProductivityResponse,
} from '../../types/attendanceAnalytics';
import {
  AttendanceAnalyticsApiError,
  AttendanceAnalyticsHttpClient,
  AttendanceRequestOptions,
  attendanceAnalyticsHttpClient,
  buildAttendanceQueryString,
  formatAttendanceDateOnly,
  formatShiftWindowWithMidnightCheck,
  maskGeoLocationCoord,
} from './client';

export {
  AttendanceAnalyticsApiError,
  AttendanceAnalyticsHttpClient,
  attendanceAnalyticsHttpClient,
  buildAttendanceQueryString,
  formatAttendanceDateOnly,
  formatShiftWindowWithMidnightCheck,
  maskGeoLocationCoord,
};

function toFilterRecord(
  filters?: AttendanceSharedFilterParams,
  extra?: Record<string, string | number | boolean | undefined | null>
): Record<string, string | number | boolean | undefined | null> {
  return {
    ...(filters || {}),
    ...(extra || {}),
  };
}

// 1. Attendance Overview Dashboard
export const attendanceOverviewApi = {
  getOverview: (
    filters?: AttendanceSharedFilterParams,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<AttendanceOverviewResponse>(
      'GET',
      `/overview${buildAttendanceQueryString(toFilterRecord(filters))}`,
      undefined,
      opts
    ),
};

// 2. Daily Attendance & Live Status
export const attendanceDailyLiveApi = {
  getLiveStatus: (
    filters?: AttendanceSharedFilterParams,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<DailyLiveStatusResponse>(
      'GET',
      `/daily-live${buildAttendanceQueryString(toFilterRecord(filters))}`,
      undefined,
      opts
    ),
};

// 3. Punctuality: Late Arrival & Early Exit
export const attendancePunctualityApi = {
  getAnalytics: (
    filters?: AttendanceSharedFilterParams,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<PunctualityAnalyticsResponse>(
      'GET',
      `/punctuality${buildAttendanceQueryString(toFilterRecord(filters))}`,
      undefined,
      opts
    ),
};

// 4. Absenteeism & Leave Correlation
export const attendanceAbsenteeismLeaveApi = {
  getAnalytics: (
    filters?: AttendanceSharedFilterParams,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<AbsenteeismLeaveCorrelationResponse>(
      'GET',
      `/absenteeism-leave${buildAttendanceQueryString(toFilterRecord(filters))}`,
      undefined,
      opts
    ),
};

// 5. Working Hours & Productivity
export const attendanceWorkingHoursApi = {
  getAnalytics: (
    filters?: AttendanceSharedFilterParams,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<WorkingHoursProductivityResponse>(
      'GET',
      `/working-hours${buildAttendanceQueryString(toFilterRecord(filters))}`,
      undefined,
      opts
    ),
};

// 6. Overtime & Holiday Work Analytics
export const attendanceOvertimeHolidayApi = {
  getAnalytics: (
    filters?: AttendanceSharedFilterParams,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<OvertimeHolidayAnalyticsResponse>(
      'GET',
      `/overtime-holiday${buildAttendanceQueryString(toFilterRecord(filters))}`,
      undefined,
      opts
    ),
  syncToPayrollInputs: (cycleMonth: string, opts?: AttendanceRequestOptions) =>
    attendanceAnalyticsHttpClient.request<{ syncedCount: number }>(
      'POST',
      '/overtime-holiday/sync-payroll',
      { cycleMonth },
      opts
    ),
};

// 7. Shift & Roster Analytics
export const attendanceShiftRosterApi = {
  getAnalytics: (
    filters?: AttendanceSharedFilterParams,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<ShiftRosterAnalyticsResponse>(
      'GET',
      `/shift-roster${buildAttendanceQueryString(toFilterRecord(filters))}`,
      undefined,
      opts
    ),
};

// 8. Location, Geo-fence & Remote Work Analytics
export const attendanceLocationRemoteApi = {
  getAnalytics: (
    filters?: AttendanceSharedFilterParams,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<LocationRemoteAnalyticsResponse>(
      'GET',
      `/location-remote${buildAttendanceQueryString(toFilterRecord(filters))}`,
      undefined,
      opts
    ),
};

// 9. Regularization & Exception Analytics
export const attendanceRegularizationsApi = {
  getAnalytics: (
    filters?: AttendanceSharedFilterParams,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<RegularizationExceptionAnalyticsResponse>(
      'GET',
      `/regularizations${buildAttendanceQueryString(toFilterRecord(filters))}`,
      undefined,
      opts
    ),
};

// 10. Biometric / Device & Source Analytics
export const attendanceDevicesSourcesApi = {
  getAnalytics: (
    filters?: AttendanceSharedFilterParams,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<DeviceSourceAnalyticsResponse>(
      'GET',
      `/devices-sources${buildAttendanceQueryString(toFilterRecord(filters))}`,
      undefined,
      opts
    ),
  triggerDeviceResync: (deviceId: string, opts?: AttendanceRequestOptions) =>
    attendanceAnalyticsHttpClient.request<{ status: string }>(
      'POST',
      `/devices-sources/${encodeURIComponent(deviceId)}/resync`,
      {},
      opts
    ),
};

// 11. Anomaly, Fraud & Compliance Detection
export const attendanceAnomaliesApi = {
  list: (
    filters?: AttendanceSharedFilterParams & { severity?: string },
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<
      PaginatedAttendanceResponse<AttendanceAnomalyRecord>
    >(
      'GET',
      `/anomalies${buildAttendanceQueryString(toFilterRecord(filters))}`,
      undefined,
      opts
    ),
  reviewAnomaly: (
    id: string,
    payload: {
      decision: 'Confirmed' | 'Dismissed' | 'Escalated';
      reviewNotes: string;
    },
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<AttendanceAnomalyRecord>(
      'POST',
      `/anomalies/${encodeURIComponent(id)}/review`,
      payload,
      opts
    ),
};

// 12. Attendance-to-Payroll Impact (LOP & Pay Days)
export const attendancePayrollImpactApi = {
  getImpact: (
    filters?: AttendanceSharedFilterParams & { cycleMonth?: string },
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<AttendancePayrollImpactResponse>(
      'GET',
      `/payroll-impact${buildAttendanceQueryString(toFilterRecord(filters))}`,
      undefined,
      opts
    ),
  reconcileWithPayroll: (
    cycleMonth: string,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<{ reconciledCount: number }>(
      'POST',
      '/payroll-impact/reconcile',
      { cycleMonth },
      opts
    ),
};

// 13. Employee & Team Attendance Profiles
export const attendanceProfilesApi = {
  getEmployeeProfile: (
    employeeCode: string,
    filters?: AttendanceSharedFilterParams,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<EmployeeAttendanceProfileResponse>(
      'GET',
      `/profiles${buildAttendanceQueryString(
        toFilterRecord(filters, { employeeCode })
      )}`,
      undefined,
      opts
    ),
};

// 14. Trends, Patterns & Forecasting
export const attendanceTrendsForecastingApi = {
  getForecasts: (
    filters?: AttendanceSharedFilterParams,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<TrendsForecastingResponse>(
      'GET',
      `/trends-forecasting${buildAttendanceQueryString(toFilterRecord(filters))}`,
      undefined,
      opts
    ),
};

// 15. Benchmarking & Targets
export const attendanceBenchmarksTargetsApi = {
  list: (
    filters?: AttendanceSharedFilterParams,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<
      PaginatedAttendanceResponse<BenchmarkTargetRecord>
    >(
      'GET',
      `/benchmarks-targets${buildAttendanceQueryString(toFilterRecord(filters))}`,
      undefined,
      opts
    ),
  createTarget: (
    payload: CreateBenchmarkTargetPayload,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<BenchmarkTargetRecord>(
      'POST',
      '/benchmarks-targets',
      payload,
      opts
    ),
};

// 16. Drill-down & Record Explorer
export const attendanceDrillDownApi = {
  listRecords: (
    filters?: AttendanceSharedFilterParams & {
      page?: number;
      pageSize?: number;
      search?: string;
    },
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<
      PaginatedAttendanceResponse<AttendanceDrillDownRecord>
    >(
      'GET',
      `/drill-down${buildAttendanceQueryString(toFilterRecord(filters))}`,
      undefined,
      opts
    ),
  exportRecords: (
    format: 'csv' | 'xlsx' | 'pdf',
    filters?: AttendanceSharedFilterParams,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.downloadBlob(
      `/drill-down/export${buildAttendanceQueryString(
        toFilterRecord(filters, { format })
      )}`,
      `attendance-drilldown-export.${format}`,
      opts
    ),
};

// 17. Insights, Alerts & Narratives
export const attendanceInsightsAlertsApi = {
  getInsights: (
    filters?: AttendanceSharedFilterParams,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<InsightsAlertsResponse>(
      'GET',
      `/insights-alerts${buildAttendanceQueryString(toFilterRecord(filters))}`,
      undefined,
      opts
    ),
  createAlertRule: (
    payload: CreateAlertRulePayload,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<{ id: string }>(
      'POST',
      '/insights-alerts/rules',
      payload,
      opts
    ),
  askAnalyticalQuestion: (question: string, opts?: AttendanceRequestOptions) =>
    attendanceAnalyticsHttpClient.request<{
      answerNarrative: string;
      series?: { label: string; value: number }[];
    }>('POST', '/insights-alerts/query', { question }, opts),
};

// 18. Saved Views, Scheduled Reports & Exports
export const attendanceSavedSchedulesApi = {
  listSchedules: (opts?: AttendanceRequestOptions) =>
    attendanceAnalyticsHttpClient.request<
      PaginatedAttendanceResponse<ScheduledAttendanceReportRecord>
    >('GET', '/saved-schedules', undefined, opts),
  createSchedule: (
    payload: CreateScheduledReportPayload,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<ScheduledAttendanceReportRecord>(
      'POST',
      '/saved-schedules',
      payload,
      opts
    ),
};

// 19. Settings & Automation Rules
export const attendanceSettingsApi = {
  getSettings: (opts?: AttendanceRequestOptions) =>
    attendanceAnalyticsHttpClient.request<AttendanceAnalyticsSettingsResponse>(
      'GET',
      '/settings',
      undefined,
      opts
    ),
  updateSettings: (
    payload: Partial<AttendanceAnalyticsSettingsResponse>,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<AttendanceAnalyticsSettingsResponse>(
      'PUT',
      '/settings',
      payload,
      opts
    ),
  toggleAutomationRule: (
    ruleId: string,
    enabled: boolean,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<{ id: string; enabled: boolean }>(
      'PATCH',
      `/settings/automation/${encodeURIComponent(ruleId)}`,
      { enabled },
      opts
    ),
};

// 20. Audit Logs
export const attendanceAuditLogsApi = {
  list: (
    params?: { search?: string; page?: number },
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<
      PaginatedAttendanceResponse<AttendanceAuditLogRecord>
    >('GET', `/audit-logs${buildAttendanceQueryString(params)}`, undefined, opts),
  exportCsv: (opts?: AttendanceRequestOptions) =>
    attendanceAnalyticsHttpClient.downloadBlob(
      '/audit-logs/export?format=csv',
      'attendance-analytics-audit-logs.csv',
      opts
    ),
};

// 21. Notifications
export const attendanceNotificationsApi = {
  list: (opts?: AttendanceRequestOptions) =>
    attendanceAnalyticsHttpClient.request<
      PaginatedAttendanceResponse<AttendanceNotificationRecord>
    >('GET', '/notifications', undefined, opts),
  markAllRead: (opts?: AttendanceRequestOptions) =>
    attendanceAnalyticsHttpClient.request<{ updatedCount: number }>(
      'POST',
      '/notifications/read-all',
      {},
      opts
    ),
};

// 22. Manager View
export const attendanceManagerViewApi = {
  getTeamView: (
    filters?: AttendanceSharedFilterParams,
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<ManagerAttendanceViewResponse>(
      'GET',
      `/manager-view${buildAttendanceQueryString(toFilterRecord(filters))}`,
      undefined,
      opts
    ),
  sendAttendanceNudge: (
    payload: { employeeCode: string; message: string },
    opts?: AttendanceRequestOptions
  ) =>
    attendanceAnalyticsHttpClient.request<{ status: string }>(
      'POST',
      '/manager-view/nudge',
      payload,
      opts
    ),
};

// 23. Employee View (My Attendance Insights)
export const attendanceEmployeeViewApi = {
  getMyView: (opts?: AttendanceRequestOptions) =>
    attendanceAnalyticsHttpClient.request<EmployeeMyAttendanceViewResponse>(
      'GET',
      '/employee-view',
      undefined,
      opts
    ),
};
