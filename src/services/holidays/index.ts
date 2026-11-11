import {
  holidayHttpClient,
  buildHolidayQueryString,
  HolidayRequestOptions,
} from './client';
import {
  PaginatedHolidayResponse,
  HolidayDashboardResponse,
  HolidayCalendarViewResponse,
  HolidayCalendarTemplateRecord,
  CreateHolidayCalendarTemplatePayload,
  HolidayMasterRecord,
  CreateHolidayMasterPayload,
  HolidayCalendarAssignmentRecord,
  CreateCalendarAssignmentPayload,
  OptionalHolidayPolicyRecord,
  CreateOptionalHolidayPolicyPayload,
  WeeklyOffRuleRecord,
  CreateWeeklyOffRulePayload,
  SpecialHolidayOverrideRecord,
  CreateSpecialHolidayOverridePayload,
  HolidaySwapCompOffRecord,
  CreateHolidaySwapOrCompOffPayload,
  ShiftSiteHolidayMappingRecord,
  CreateShiftSiteMappingPayload,
  HolidayWorkLogRecord,
  LeavePayrollHolidayIntegrationResponse,
  OptionalHolidayBookingRecord,
  CreateOptionalHolidayBookingPayload,
  HolidayApprovalItem,
  HolidayCommunicationRecord,
  HolidayYearRolloverRunRecord,
  HolidayReportRunResponse,
  HolidaySettingsResponse,
  HolidayAutomationRuleRecord,
  HolidayAuditLogRecord,
  HolidayNotificationRecord,
  HolidayManagerPortalWorkspaceResponse,
  EmployeeHolidayPortalWorkspaceResponse,
} from '../../types/holidays';

// 1. Holiday Dashboard API
export const holidayDashboardApi = {
  getSummary: (
    filters?: {
      year?: number;
      location?: string;
      entity?: string;
      department?: string;
      calendarId?: string;
    },
    options?: HolidayRequestOptions
  ) =>
    holidayHttpClient.request<HolidayDashboardResponse>(
      'GET',
      `/dashboard/summary${buildHolidayQueryString(filters)}`,
      undefined,
      options
    ),
};

// 2. Holiday Calendar Views API
export const holidayCalendarViewsApi = {
  getCalendarEvents: (
    params?: {
      year?: number;
      month?: number;
      viewMode?: 'Year' | 'Month' | 'List';
      calendarId?: string;
      compareCalendarId?: string;
      type?: string;
      search?: string;
    },
    options?: HolidayRequestOptions
  ) =>
    holidayHttpClient.request<HolidayCalendarViewResponse>(
      'GET',
      `/calendar-events${buildHolidayQueryString(params)}`,
      undefined,
      options
    ),
  exportCalendar: (
    format: 'csv' | 'xlsx' | 'pdf' | 'ics',
    year?: number,
    calendarId?: string
  ) =>
    holidayHttpClient.downloadBlob(
      `/calendar-events/export${buildHolidayQueryString({
        format,
        year,
        calendarId,
      })}`,
      `holiday-calendar-${year || 'active'}.${format}`
    ),
};

// 3. Holiday Calendar Templates API
export const holidayTemplatesApi = {
  listTemplates: (
    params?: { year?: number; status?: string; location?: string },
    options?: HolidayRequestOptions
  ) =>
    holidayHttpClient.request<
      PaginatedHolidayResponse<HolidayCalendarTemplateRecord>
    >(
      'GET',
      `/templates${buildHolidayQueryString(params)}`,
      undefined,
      options
    ),
  createTemplate: (payload: CreateHolidayCalendarTemplatePayload) =>
    holidayHttpClient.request<HolidayCalendarTemplateRecord>(
      'POST',
      '/templates',
      payload
    ),
  publishOrUnpublish: (id: string, action: 'publish' | 'unpublish') =>
    holidayHttpClient.request<{
      calendar: HolidayCalendarTemplateRecord;
      affectedEmployeesCount: number;
      validationWarnings: string[];
    }>('POST', `/templates/${encodeURIComponent(id)}/publish`, { action }),
  cloneTemplate: (id: string, targetYear: number) =>
    holidayHttpClient.request<HolidayCalendarTemplateRecord>(
      'POST',
      `/templates/${encodeURIComponent(id)}/clone`,
      { targetYear }
    ),
};

// 4. Holiday Master API
export const holidayMasterApi = {
  listHolidays: (
    params?: {
      year?: number;
      type?: string;
      calendarId?: string;
      search?: string;
    },
    options?: HolidayRequestOptions
  ) =>
    holidayHttpClient.request<PaginatedHolidayResponse<HolidayMasterRecord>>(
      'GET',
      `/master${buildHolidayQueryString(params)}`,
      undefined,
      options
    ),
  createHoliday: (payload: CreateHolidayMasterPayload) =>
    holidayHttpClient.request<HolidayMasterRecord>('POST', '/master', payload),
  bulkImportCsv: (formData: FormData) =>
    holidayHttpClient.request<{
      validRowsCount: number;
      conflictCount: number;
      previewId: string;
    }>('POST', '/master/bulk-import', formData),
};

// 5. Calendar Assignment API
export const holidayAssignmentApi = {
  listAssignments: (
    params?: { scopeType?: string; unassignedOnly?: boolean },
    options?: HolidayRequestOptions
  ) =>
    holidayHttpClient.request<
      PaginatedHolidayResponse<HolidayCalendarAssignmentRecord>
    >(
      'GET',
      `/assignments${buildHolidayQueryString(params)}`,
      undefined,
      options
    ),
  assignCalendar: (payload: CreateCalendarAssignmentPayload) =>
    holidayHttpClient.request<HolidayCalendarAssignmentRecord>(
      'POST',
      '/assignments',
      payload
    ),
};

// 6. Optional / Restricted Holidays API
export const holidayOptionalPolicyApi = {
  listPools: (
    params?: { year?: number; calendarId?: string },
    options?: HolidayRequestOptions
  ) =>
    holidayHttpClient.request<
      PaginatedHolidayResponse<OptionalHolidayPolicyRecord>
    >(
      'GET',
      `/optional-pools${buildHolidayQueryString(params)}`,
      undefined,
      options
    ),
  savePoolPolicy: (payload: CreateOptionalHolidayPolicyPayload) =>
    holidayHttpClient.request<OptionalHolidayPolicyRecord>(
      'POST',
      '/optional-pools',
      payload
    ),
};

// 7. Weekly Off & Working Saturday Rules API
export const holidayWeeklyOffApi = {
  listRules: (
    params?: { location?: string; shiftCode?: string },
    options?: HolidayRequestOptions
  ) =>
    holidayHttpClient.request<PaginatedHolidayResponse<WeeklyOffRuleRecord>>(
      'GET',
      `/weekly-off-rules${buildHolidayQueryString(params)}`,
      undefined,
      options
    ),
  createRule: (payload: CreateWeeklyOffRulePayload) =>
    holidayHttpClient.request<WeeklyOffRuleRecord>(
      'POST',
      '/weekly-off-rules',
      payload
    ),
};

// 8. Special / Ad-hoc Holidays & Working Day Overrides API
export const holidaySpecialOverridesApi = {
  listOverrides: (
    params?: { year?: number; overrideType?: string },
    options?: HolidayRequestOptions
  ) =>
    holidayHttpClient.request<
      PaginatedHolidayResponse<SpecialHolidayOverrideRecord>
    >(
      'GET',
      `/special-overrides${buildHolidayQueryString(params)}`,
      undefined,
      options
    ),
  declareOverride: (payload: CreateSpecialHolidayOverridePayload) =>
    holidayHttpClient.request<SpecialHolidayOverrideRecord>(
      'POST',
      '/special-overrides',
      payload
    ),
  rollbackOverride: (id: string, reason: string) =>
    holidayHttpClient.request<SpecialHolidayOverrideRecord>(
      'POST',
      `/special-overrides/${encodeURIComponent(id)}/rollback`,
      { reason }
    ),
};

// 9. Holiday Swap & Compensatory Off Rules API
export const holidaySwapCompOffApi = {
  listRecords: (
    params?: { recordType?: string; status?: string },
    options?: HolidayRequestOptions
  ) =>
    holidayHttpClient.request<
      PaginatedHolidayResponse<HolidaySwapCompOffRecord>
    >(
      'GET',
      `/swap-compoff${buildHolidayQueryString(params)}`,
      undefined,
      options
    ),
  submitSwapOrCompOff: (payload: CreateHolidaySwapOrCompOffPayload) =>
    holidayHttpClient.request<HolidaySwapCompOffRecord>(
      'POST',
      '/swap-compoff',
      payload
    ),
};

// 10. Shift-wise & Site-wise Holidays API
export const holidayShiftSiteApi = {
  listMappings: (
    params?: { shiftCategory?: string },
    options?: HolidayRequestOptions
  ) =>
    holidayHttpClient.request<
      PaginatedHolidayResponse<ShiftSiteHolidayMappingRecord>
    >(
      'GET',
      `/shift-site-mappings${buildHolidayQueryString(params)}`,
      undefined,
      options
    ),
  createMapping: (payload: CreateShiftSiteMappingPayload) =>
    holidayHttpClient.request<ShiftSiteHolidayMappingRecord>(
      'POST',
      '/shift-site-mappings',
      payload
    ),
};

// 11. Holiday Work Handling (Attendance & Overtime Integration) API
export const holidayWorkHandlingApi = {
  listWorkLogs: (
    params?: { holidayDate?: string; compensationMode?: string },
    options?: HolidayRequestOptions
  ) =>
    holidayHttpClient.request<PaginatedHolidayResponse<HolidayWorkLogRecord>>(
      'GET',
      `/holiday-work-logs${buildHolidayQueryString(params)}`,
      undefined,
      options
    ),
  syncToPayrollInputs: (logIds: string[]) =>
    holidayHttpClient.request<{ syncedCount: number }>(
      'POST',
      '/holiday-work-logs/sync-payroll',
      { logIds }
    ),
};

// 12. Leave & Payroll Integration API
export const holidayLeavePayrollSyncApi = {
  getStatus: (
    params?: { payrollCycleMonth?: string },
    options?: HolidayRequestOptions
  ) =>
    holidayHttpClient.request<LeavePayrollHolidayIntegrationResponse>(
      'GET',
      `/integrations/leave-payroll-status${buildHolidayQueryString(params)}`,
      undefined,
      options
    ),
  retrySync: (targetSystem: 'Attendance' | 'Leave' | 'Payroll') =>
    holidayHttpClient.request<{ triggered: boolean; syncBatchId: string }>(
      'POST',
      '/integrations/retry-sync',
      { targetSystem }
    ),
};

// 13. Holiday Request & Approval (Optional Holiday Booking) API
export const holidayOptionalBookingApi = {
  listBookings: (
    params?: { status?: string; department?: string },
    options?: HolidayRequestOptions
  ) =>
    holidayHttpClient.request<
      PaginatedHolidayResponse<OptionalHolidayBookingRecord>
    >(
      'GET',
      `/optional-bookings${buildHolidayQueryString(params)}`,
      undefined,
      options
    ),
  bookOptionalHoliday: (payload: CreateOptionalHolidayBookingPayload) =>
    holidayHttpClient.request<OptionalHolidayBookingRecord>(
      'POST',
      '/optional-bookings',
      payload
    ),
};

// 14. Approvals Workflow API
export const holidayApprovalsApi = {
  listApprovals: (
    params?: { approvalType?: string; status?: string },
    options?: HolidayRequestOptions
  ) =>
    holidayHttpClient.request<PaginatedHolidayResponse<HolidayApprovalItem>>(
      'GET',
      `/approvals${buildHolidayQueryString(params)}`,
      undefined,
      options
    ),
  decideApprovals: (payload: {
    approvalIds: string[];
    decision: 'Approved' | 'Rejected' | 'Delegated';
    comments: string;
  }) =>
    holidayHttpClient.request<{ processedCount: number }>(
      'POST',
      '/approvals/decide',
      payload
    ),
};

// 15. Communication & Announcements API
export const holidayCommunicationsApi = {
  listBroadcasts: (
    params?: { channel?: string },
    options?: HolidayRequestOptions
  ) =>
    holidayHttpClient.request<
      PaginatedHolidayResponse<HolidayCommunicationRecord>
    >(
      'GET',
      `/communications${buildHolidayQueryString(params)}`,
      undefined,
      options
    ),
  sendBroadcast: (payload: {
    templateCode: string;
    channel: 'Email' | 'InApp' | 'WhatsApp' | 'SMS';
    targetScope: string;
  }) =>
    holidayHttpClient.request<{ queuedCount: number }>(
      'POST',
      '/communications/broadcast',
      payload
    ),
};

// 16. Year Rollover & Calendar Publishing API
export const holidayYearRolloverApi = {
  listRuns: (options?: HolidayRequestOptions) =>
    holidayHttpClient.request<
      PaginatedHolidayResponse<HolidayYearRolloverRunRecord>
    >('GET', '/rollover/runs', undefined, options),
  executeRollover: (payload: {
    sourceYear: number;
    targetYear: number;
    carryForwardOptionalQuota: boolean;
    lockPublishedCalendars: boolean;
  }) =>
    holidayHttpClient.request<HolidayYearRolloverRunRecord>(
      'POST',
      '/rollover/execute',
      payload
    ),
};

// 17. Reports & Analytics API
export const holidayReportsApi = {
  runReport: (
    reportKey: string,
    params?: { year?: number; location?: string },
    options?: HolidayRequestOptions
  ) =>
    holidayHttpClient.request<HolidayReportRunResponse>(
      'GET',
      `/reports/${encodeURIComponent(reportKey)}/run${buildHolidayQueryString(params)}`,
      undefined,
      options
    ),
  exportReport: (reportKey: string, format: 'csv' | 'xlsx' | 'pdf') =>
    holidayHttpClient.downloadBlob(
      `/reports/${encodeURIComponent(reportKey)}/export?format=${format}`,
      `holiday-report-${reportKey}.${format}`
    ),
};

// 18. Settings & Automation Rules API
export const holidaySettingsApi = {
  getSettings: (options?: HolidayRequestOptions) =>
    holidayHttpClient.request<HolidaySettingsResponse>(
      'GET',
      '/settings',
      undefined,
      options
    ),
  toggleAutomationRule: (ruleId: string, enabled: boolean) =>
    holidayHttpClient.request<HolidayAutomationRuleRecord>(
      'PUT',
      `/settings/automation-rules/${encodeURIComponent(ruleId)}`,
      { enabled }
    ),
};

// 19. Audit Logs API
export const holidayAuditLogsApi = {
  listAuditLogs: (
    params?: { actor?: string; action?: string; page?: number; pageSize?: number },
    options?: HolidayRequestOptions
  ) =>
    holidayHttpClient.request<PaginatedHolidayResponse<HolidayAuditLogRecord>>(
      'GET',
      `/audit-logs${buildHolidayQueryString(params)}`,
      undefined,
      options
    ),
  exportAuditLogsCsv: () =>
    holidayHttpClient.downloadBlob(
      '/audit-logs/export?format=csv',
      'holiday-audit-logs.csv'
    ),
};

// 20. Notifications API
export const holidayNotificationsApi = {
  listNotifications: (
    params?: { unreadOnly?: boolean },
    options?: HolidayRequestOptions
  ) =>
    holidayHttpClient.request<
      PaginatedHolidayResponse<HolidayNotificationRecord>
    >(
      'GET',
      `/notifications${buildHolidayQueryString(params)}`,
      undefined,
      options
    ),
  markRead: (notificationIds: string[]) =>
    holidayHttpClient.request<{ markedCount: number }>(
      'POST',
      '/notifications/mark-read',
      { notificationIds }
    ),
};

// 21. Manager Portal API
export const holidayManagerPortalApi = {
  getWorkspace: (options?: HolidayRequestOptions) =>
    holidayHttpClient.request<HolidayManagerPortalWorkspaceResponse>(
      'GET',
      '/manager-portal/workspace',
      undefined,
      options
    ),
};

// 22. Employee Portal (My Holidays) API
export const holidayEmployeePortalApi = {
  getWorkspace: (options?: HolidayRequestOptions) =>
    holidayHttpClient.request<EmployeeHolidayPortalWorkspaceResponse>(
      'GET',
      '/employee-portal/me',
      undefined,
      options
    ),
};
