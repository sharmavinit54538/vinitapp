import {
  ApplyLeavePayload,
  CompanyFeedResponse,
  DashboardLayoutConfigResponse,
  EmployeeNotificationsResponse,
  GlobalSearchResponse,
  ManagerExtrasWidgetResponse,
  MyAssetsAndRequestsResponse,
  MyAttendanceSummaryResponse,
  MyHelpdeskWidgetResponse,
  MyLearningResponse,
  MyLeaveWidgetResponse,
  MyPaySnapshotResponse,
  MyPerformanceResponse,
  MyProbationExitResponse,
  MyTasksResponse,
  MyTeamOrgResponse,
  MyTravelWidgetResponse,
  PayRevealAuditedResponse,
  ProfileSummaryResponse,
  PunchActionPayload,
  PunchActionResponse,
  QuickActionsResponse,
  RaiseHelpdeskTicketPayload,
  RealtimePulseResponse,
  RegularizationSubmitPayload,
  TodayStatusResponse,
  UpdateDashboardLayoutPayload,
} from '../../types/employeeDashboard';
import {
  buildEmployeeQueryString,
  computeLiveWorkingHoursDisplay,
  computeServerClockOffsetMs,
  EmployeeDashboardApiError,
  EmployeeDashboardHttpClient,
  employeeDashboardHttpClient,
  EmployeeRequestOptions,
  formatEmployeeDateOnly,
  formatEmployeeShiftWindow,
} from './client';

export {
  buildEmployeeQueryString,
  computeLiveWorkingHoursDisplay,
  computeServerClockOffsetMs,
  EmployeeDashboardApiError,
  EmployeeDashboardHttpClient,
  employeeDashboardHttpClient,
  formatEmployeeDateOnly,
  formatEmployeeShiftWindow,
};

// 1. Header & Profile Summary
export const employeeProfileSummaryApi = {
  getSummary: (opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<ProfileSummaryResponse>(
      'GET',
      '/profile-summary',
      undefined,
      opts
    ),
};

// 2. Today Widget (Punch & Status)
export const employeeTodayApi = {
  getTodayStatus: (opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<TodayStatusResponse>(
      'GET',
      '/today',
      undefined,
      opts
    ),
  submitPunch: (payload: PunchActionPayload, opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<PunchActionResponse>(
      'POST',
      '/today/punch',
      payload,
      opts
    ),
  toggleBreak: (
    action: 'start' | 'end',
    opts?: EmployeeRequestOptions
  ) =>
    employeeDashboardHttpClient.request<TodayStatusResponse>(
      'POST',
      '/today/break',
      { action },
      opts
    ),
  submitRegularization: (
    payload: RegularizationSubmitPayload,
    opts?: EmployeeRequestOptions
  ) =>
    employeeDashboardHttpClient.request<{
      requestId: string;
      status: string;
      message: string;
    }>('POST', '/today/regularize', payload, opts),
};

// 3. Quick Actions
export const employeeQuickActionsApi = {
  getQuickActions: (opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<QuickActionsResponse>(
      'GET',
      '/quick-actions',
      undefined,
      opts
    ),
  togglePin: (
    actionId: string,
    pinned: boolean,
    opts?: EmployeeRequestOptions
  ) =>
    employeeDashboardHttpClient.request<QuickActionsResponse>(
      'PATCH',
      '/quick-actions/pin',
      { actionId, pinned },
      opts
    ),
};

// 4. My Attendance Summary
export const employeeAttendanceSummaryApi = {
  getMonthlySummary: (month?: string, opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<MyAttendanceSummaryResponse>(
      'GET',
      `/attendance-summary${buildEmployeeQueryString({ month })}`,
      undefined,
      opts
    ),
};

// 5. My Leave
export const employeeLeaveApi = {
  getLeaveSummary: (opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<MyLeaveWidgetResponse>(
      'GET',
      '/leaves',
      undefined,
      opts
    ),
  applyLeave: (payload: ApplyLeavePayload, opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<{
      requestId: string;
      status: string;
      message: string;
    }>('POST', '/leaves/apply', payload, opts),
  withdrawLeave: (
    requestId: string,
    reason: string,
    opts?: EmployeeRequestOptions
  ) =>
    employeeDashboardHttpClient.request<{
      requestId: string;
      status: string;
      message: string;
    }>(
      'POST',
      `/leaves/${encodeURIComponent(requestId)}/withdraw`,
      { reason },
      opts
    ),
};

// 6. My Pay Snapshot
export const employeePaySnapshotApi = {
  getPaySnapshot: (opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<MyPaySnapshotResponse>(
      'GET',
      '/pay-snapshot',
      undefined,
      opts
    ),
  revealNetPay: (payslipId: string, opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<PayRevealAuditedResponse>(
      'POST',
      '/pay-snapshot/reveal',
      { payslipId },
      opts
    ),
  downloadPayslipPdf: (
    payslipId: string,
    monthLabel: string,
    opts?: EmployeeRequestOptions
  ) =>
    employeeDashboardHttpClient.downloadBlob(
      `/pay-snapshot/${encodeURIComponent(payslipId)}/download`,
      `Payslip-${monthLabel.replace(/\s+/g, '-')}.pdf`,
      opts
    ),
};

// 7. My Tasks & Pending Actions
export const employeeTasksApi = {
  getTasks: (category?: string, opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<MyTasksResponse>(
      'GET',
      `/tasks${buildEmployeeQueryString({ category })}`,
      undefined,
      opts
    ),
  completeTask: (
    taskId: string,
    notes?: string,
    opts?: EmployeeRequestOptions
  ) =>
    employeeDashboardHttpClient.request<{
      taskId: string;
      completedAt: string;
    }>(
      'POST',
      `/tasks/${encodeURIComponent(taskId)}/complete`,
      { notes },
      opts
    ),
};

// 8. My Performance
export const employeePerformanceApi = {
  getPerformance: (opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<MyPerformanceResponse>(
      'GET',
      '/performance',
      undefined,
      opts
    ),
  updateGoalProgress: (
    goalId: string,
    progressPct: number,
    statusNote?: string,
    opts?: EmployeeRequestOptions
  ) =>
    employeeDashboardHttpClient.request<{
      goalId: string;
      progressPct: number;
      status: string;
    }>(
      'PATCH',
      `/performance/goals/${encodeURIComponent(goalId)}`,
      { progressPct, statusNote },
      opts
    ),
};

// 9. My Assets & Requests Tracker
export const employeeAssetsRequestsApi = {
  getAssetsAndRequests: (
    params?: { requestType?: string; status?: string },
    opts?: EmployeeRequestOptions
  ) =>
    employeeDashboardHttpClient.request<MyAssetsAndRequestsResponse>(
      'GET',
      `/assets-requests${buildEmployeeQueryString(params)}`,
      undefined,
      opts
    ),
  acknowledgeAsset: (
    assetId: string,
    conditionNote?: string,
    opts?: EmployeeRequestOptions
  ) =>
    employeeDashboardHttpClient.request<{
      assetId: string;
      acknowledgedAt: string;
    }>(
      'POST',
      `/assets/${encodeURIComponent(assetId)}/acknowledge`,
      { conditionNote },
      opts
    ),
  requestAssetReturn: (
    assetId: string,
    reason: string,
    opts?: EmployeeRequestOptions
  ) =>
    employeeDashboardHttpClient.request<{
      requestId: string;
      status: string;
    }>(
      'POST',
      `/assets/${encodeURIComponent(assetId)}/return-request`,
      { reason },
      opts
    ),
};

// 10. Learning
export const employeeLearningApi = {
  getLearning: (opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<MyLearningResponse>(
      'GET',
      '/learning',
      undefined,
      opts
    ),
  downloadCertificatePdf: (
    courseId: string,
    courseTitle: string,
    opts?: EmployeeRequestOptions
  ) =>
    employeeDashboardHttpClient.downloadBlob(
      `/learning/certificates/${encodeURIComponent(courseId)}/download`,
      `Certificate-${courseTitle.replace(/\s+/g, '-')}.pdf`,
      opts
    ),
  launchLmsSso: (courseId?: string, opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<{ ssoLaunchUrl: string }>(
      'POST',
      '/learning/sso-launch',
      { courseId },
      opts
    ),
};

// 11. Company Feed
export const employeeCompanyFeedApi = {
  getFeed: (opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<CompanyFeedResponse>(
      'GET',
      '/company-feed',
      undefined,
      opts
    ),
  acknowledgeAnnouncement: (id: string, opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<{ id: string; acknowledgedAt: string }>(
      'POST',
      `/company-feed/announcements/${encodeURIComponent(id)}/acknowledge`,
      {},
      opts
    ),
  sendCelebrationWish: (
    id: string,
    reaction: string,
    message?: string,
    opts?: EmployeeRequestOptions
  ) =>
    employeeDashboardHttpClient.request<{ id: string; totalWishes: number }>(
      'POST',
      `/company-feed/celebrations/${encodeURIComponent(id)}/wish`,
      { reaction, message },
      opts
    ),
  bookOptionalHoliday: (holidayId: string, opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<{ bookingId: string; status: string }>(
      'POST',
      `/company-feed/optional-holiday/${encodeURIComponent(holidayId)}/book`,
      {},
      opts
    ),
};

// 12. My Team & Org
export const employeeTeamOrgApi = {
  getTeamOrg: (opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<MyTeamOrgResponse>(
      'GET',
      '/team-org',
      undefined,
      opts
    ),
};

// 13. Travel (Conditional)
export const employeeTravelApi = {
  getTravel: (opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<MyTravelWidgetResponse>(
      'GET',
      '/travel',
      undefined,
      opts
    ),
  downloadTripTicketsPdf: (tripId: string, opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.downloadBlob(
      `/travel/trips/${encodeURIComponent(tripId)}/tickets`,
      `Trip-Tickets-${tripId}.pdf`,
      opts
    ),
};

// 14. Helpdesk
export const employeeHelpdeskApi = {
  getHelpdesk: (q?: string, opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<MyHelpdeskWidgetResponse>(
      'GET',
      `/helpdesk${buildEmployeeQueryString({ q })}`,
      undefined,
      opts
    ),
  raiseTicket: (
    payload: RaiseHelpdeskTicketPayload,
    opts?: EmployeeRequestOptions
  ) =>
    employeeDashboardHttpClient.request<{ ticketId: string; status: string }>(
      'POST',
      '/helpdesk/tickets',
      payload,
      opts
    ),
};

// 15. Probation / Exit (Conditional)
export const employeeProbationExitApi = {
  getLifecycleStatus: (opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<MyProbationExitResponse>(
      'GET',
      '/lifecycle',
      undefined,
      opts
    ),
  withdrawResignation: (reason: string, opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<{ status: string; message: string }>(
      'POST',
      '/lifecycle/withdraw-resignation',
      { reason },
      opts
    ),
};

// 16. Manager Extras (Conditional — Manager Role Only)
export const employeeManagerExtrasApi = {
  getManagerExtras: (opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<ManagerExtrasWidgetResponse>(
      'GET',
      '/manager-extras',
      undefined,
      opts
    ),
  decideApprovalInline: (
    id: string,
    decision: 'Approved' | 'Rejected',
    comment?: string,
    opts?: EmployeeRequestOptions
  ) =>
    employeeDashboardHttpClient.request<{ id: string; status: string }>(
      'POST',
      `/manager-extras/approvals/${encodeURIComponent(id)}/decision`,
      { decision, comment },
      opts
    ),
};

// 17. Widget Layout & Personalization
export const employeeDashboardLayoutApi = {
  getLayout: (opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<DashboardLayoutConfigResponse>(
      'GET',
      '/layout',
      undefined,
      opts
    ),
  saveLayout: (
    payload: UpdateDashboardLayoutPayload,
    opts?: EmployeeRequestOptions
  ) =>
    employeeDashboardHttpClient.request<DashboardLayoutConfigResponse>(
      'PUT',
      '/layout',
      payload,
      opts
    ),
  resetLayout: (opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<DashboardLayoutConfigResponse>(
      'POST',
      '/layout/reset',
      {},
      opts
    ),
};

// 18. Notifications & Global Search
export const employeeNotificationsSearchApi = {
  getNotifications: (opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<EmployeeNotificationsResponse>(
      'GET',
      '/notifications',
      undefined,
      opts
    ),
  markRead: (
    payload: { notificationId?: string; markAll?: boolean },
    opts?: EmployeeRequestOptions
  ) =>
    employeeDashboardHttpClient.request<{ unreadCount: number }>(
      'POST',
      '/notifications/mark-read',
      payload,
      opts
    ),
  globalSearch: (q: string, opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<GlobalSearchResponse>(
      'GET',
      `/search${buildEmployeeQueryString({ q })}`,
      undefined,
      opts
    ),
};

// 19. Real-Time Pulse
export const employeeRealtimePulseApi = {
  getPulse: (since?: string, opts?: EmployeeRequestOptions) =>
    employeeDashboardHttpClient.request<RealtimePulseResponse>(
      'GET',
      `/realtime-pulse${buildEmployeeQueryString({ since })}`,
      undefined,
      opts
    ),
};
