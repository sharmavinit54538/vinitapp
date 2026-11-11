import {
  onboardingHttpClient,
  buildOnboardingQueryString,
  OnboardingRequestOptions,
} from './client';
import {
  PaginatedResponse,
  OnboardingDashboardResponse,
  JoinerRecord,
  Joiner360ProfileResponse,
  OnboardingWorkflowTemplate,
  CreateWorkflowTemplatePayload,
  OnboardingTaskRecord,
  CreateOnboardingTaskPayload,
  JoinerDocumentRecord,
  JoiningFormSubmissionRecord,
  SaveJoiningFormPayload,
  OfferToJoiningHandoffRecord,
  PolicyAssignmentRecord,
  ProvisioningRequestRecord,
  CreateProvisioningRequestPayload,
  PayrollStatutoryHandoffRecord,
  InductionSessionRecord,
  CreateInductionSessionPayload,
  JoinerTrainingAssignmentRecord,
  BuddyAssignmentRecord,
  DayOneExperienceRecord,
  ProbationCaseRecord,
  OnboardingSurveyWorkspaceResponse,
  OnboardingCommunicationLog,
  OnboardingApprovalItem,
  OnboardingReportRunResponse,
  OnboardingSettingsResponse,
  OnboardingAutomationRule,
  OnboardingAuditLogRecord,
  OnboardingNotificationRecord,
  OnboardingManagerPortalResponse,
  NewJoinerPortalWorkspaceResponse,
} from '../../types/onboarding';

// 1. Dashboard API
export const onboardingDashboardApi = {
  getSummary: (
    filters?: {
      from?: string;
      to?: string;
      departmentId?: string;
      location?: string;
      legalEntityId?: string;
      managerId?: string;
      hrOwnerId?: string;
    },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<OnboardingDashboardResponse>(
      'GET',
      `/dashboard/summary${buildOnboardingQueryString(filters)}`,
      undefined,
      options
    ),
};

// 2. Joiner Management API
export const onboardingJoinersApi = {
  listJoiners: (
    params?: {
      page?: number;
      pageSize?: number;
      stage?: string;
      search?: string;
      department?: string;
      location?: string;
    },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<PaginatedResponse<JoinerRecord>>(
      'GET',
      `/joiners${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  getJoiner360: (id: string, options?: OnboardingRequestOptions) =>
    onboardingHttpClient.request<Joiner360ProfileResponse>(
      'GET',
      `/joiners/${encodeURIComponent(id)}`,
      undefined,
      options
    ),
  changeJoiningDate: (
    id: string,
    payload: { requestedJoiningDate: string; reason: string }
  ) =>
    onboardingHttpClient.request<JoinerRecord>(
      'POST',
      `/joiners/${encodeURIComponent(id)}/change-date`,
      payload
    ),
  markNoShow: (
    id: string,
    payload: { reason: string; withdrawOffer: boolean }
  ) =>
    onboardingHttpClient.request<JoinerRecord>(
      'POST',
      `/joiners/${encodeURIComponent(id)}/no-show`,
      payload
    ),
  exportJoinersCsv: (stage?: string) =>
    onboardingHttpClient.downloadBlob(
      `/joiners/export${buildOnboardingQueryString({ stage, format: 'csv' })}`,
      'onboarding-joiners.csv'
    ),
};

// 3. Workflows & Templates API
export const onboardingWorkflowsApi = {
  listTemplates: (
    params?: { department?: string; employmentType?: string; status?: string },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<PaginatedResponse<OnboardingWorkflowTemplate>>(
      'GET',
      `/workflow-templates${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  createTemplate: (payload: CreateWorkflowTemplatePayload) =>
    onboardingHttpClient.request<OnboardingWorkflowTemplate>(
      'POST',
      '/workflow-templates',
      payload
    ),
  cloneTemplate: (id: string) =>
    onboardingHttpClient.request<OnboardingWorkflowTemplate>(
      'POST',
      `/workflow-templates/${encodeURIComponent(id)}/clone`,
      {}
    ),
  toggleTemplate: (id: string, active: boolean) =>
    onboardingHttpClient.request<OnboardingWorkflowTemplate>(
      'POST',
      `/workflow-templates/${encodeURIComponent(id)}/toggle`,
      { active }
    ),
};

// 4. Task Management API
export const onboardingTasksApi = {
  listTasks: (
    params?: {
      joinerId?: string;
      ownerRole?: string;
      status?: string;
      overdueOnly?: boolean;
      page?: number;
      pageSize?: number;
    },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<PaginatedResponse<OnboardingTaskRecord>>(
      'GET',
      `/tasks${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  createTask: (payload: CreateOnboardingTaskPayload) =>
    onboardingHttpClient.request<OnboardingTaskRecord>('POST', '/tasks', payload),
  bulkTaskAction: (payload: {
    taskIds: string[];
    action: 'complete' | 'reassign' | 'remind';
    targetOwner?: string;
  }) =>
    onboardingHttpClient.request<{ updatedCount: number }>(
      'POST',
      '/tasks/bulk-action',
      payload
    ),
};

// 5. Document Collection & Verification API
export const onboardingDocumentsApi = {
  listDocuments: (
    params?: {
      joinerId?: string;
      status?: string;
      category?: string;
      page?: number;
      pageSize?: number;
    },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<PaginatedResponse<JoinerDocumentRecord>>(
      'GET',
      `/documents${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  uploadDocument: (formData: FormData) =>
    onboardingHttpClient.request<JoinerDocumentRecord>(
      'POST',
      '/documents/upload',
      formData
    ),
  verifyDocument: (
    id: string,
    payload: { decision: 'Approved' | 'Rejected'; remarks: string }
  ) =>
    onboardingHttpClient.request<JoinerDocumentRecord>(
      'POST',
      `/documents/${encodeURIComponent(id)}/verify`,
      payload
    ),
  revealSensitiveNumber: (id: string) =>
    onboardingHttpClient.request<{
      documentId: string;
      unmaskedNumber: string;
    }>('POST', `/documents/${encodeURIComponent(id)}/reveal-sensitive`, {}),
};

// 6. Employee Data Collection (Joining Forms) API
export const onboardingJoiningFormsApi = {
  listSubmissions: (
    params?: { joinerId?: string; status?: string },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<
      PaginatedResponse<JoiningFormSubmissionRecord>
    >(
      'GET',
      `/joining-forms${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  saveJoiningForm: (joinerId: string, payload: SaveJoiningFormPayload) =>
    onboardingHttpClient.request<JoiningFormSubmissionRecord>(
      'PUT',
      `/joining-forms/${encodeURIComponent(joinerId)}`,
      payload
    ),
  reviewForm: (
    joinerId: string,
    payload: { action: 'LockApproved' | 'RequestCorrection'; comments: string }
  ) =>
    onboardingHttpClient.request<JoiningFormSubmissionRecord>(
      'POST',
      `/joining-forms/${encodeURIComponent(joinerId)}/review`,
      payload
    ),
};

// 7. Offer-to-Joining Handoff API
export const onboardingOfferHandoffApi = {
  listHandoffs: (
    params?: { status?: string; page?: number; pageSize?: number },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<
      PaginatedResponse<OfferToJoiningHandoffRecord>
    >(
      'GET',
      `/offer-handoffs${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  generateEmployeeId: (id: string) =>
    onboardingHttpClient.request<OfferToJoiningHandoffRecord>(
      'POST',
      `/offer-handoffs/${encodeURIComponent(id)}/generate-emp-id`,
      {}
    ),
};

// 8. Policy Acknowledgement & E-Sign API
export const onboardingPoliciesApi = {
  listAssignments: (
    params?: { joinerId?: string; status?: string },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<PaginatedResponse<PolicyAssignmentRecord>>(
      'GET',
      `/policies/assignments${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  assignPolicyPack: (payload: { joinerId: string; policyPackCode: string }) =>
    onboardingHttpClient.request<PolicyAssignmentRecord>(
      'POST',
      '/policies/assign-pack',
      payload
    ),
  eSignPolicyPack: (id: string, signatureText: string) =>
    onboardingHttpClient.request<PolicyAssignmentRecord>(
      'POST',
      `/policies/${encodeURIComponent(id)}/esign`,
      { signatureText }
    ),
  downloadSignedPdf: (id: string) =>
    onboardingHttpClient.downloadBlob(
      `/policies/${encodeURIComponent(id)}/signed-pdf`,
      `signed-policy-pack-${id}.pdf`
    ),
};

// 9. IT, Asset & Access Provisioning API
export const onboardingItAssetsApi = {
  listRequests: (
    params?: { joinerId?: string; status?: string; category?: string },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<PaginatedResponse<ProvisioningRequestRecord>>(
      'GET',
      `/provisioning/requests${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  createRequest: (payload: CreateProvisioningRequestPayload) =>
    onboardingHttpClient.request<ProvisioningRequestRecord>(
      'POST',
      '/provisioning/requests',
      payload
    ),
  fulfillRequest: (
    id: string,
    payload: { serialNumberOrAccount: string; handoverConfirmed: boolean }
  ) =>
    onboardingHttpClient.request<ProvisioningRequestRecord>(
      'POST',
      `/provisioning/requests/${encodeURIComponent(id)}/fulfill`,
      payload
    ),
};

// 10. Payroll & Statutory Setup Handoff API
export const onboardingPayrollHandoffApi = {
  listHandoffs: (
    params?: { readyOnly?: boolean; page?: number; pageSize?: number },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<
      PaginatedResponse<PayrollStatutoryHandoffRecord>
    >(
      'GET',
      `/payroll-handoffs${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  syncToPayroll: (id: string) =>
    onboardingHttpClient.request<PayrollStatutoryHandoffRecord>(
      'POST',
      `/payroll-handoffs/${encodeURIComponent(id)}/sync-payroll`,
      {}
    ),
};

// 11. Orientation & Induction Scheduling API
export const onboardingInductionApi = {
  listSessions: (
    params?: { from?: string; to?: string; mode?: string },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<PaginatedResponse<InductionSessionRecord>>(
      'GET',
      `/induction/sessions${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  createSession: (payload: CreateInductionSessionPayload) =>
    onboardingHttpClient.request<InductionSessionRecord>(
      'POST',
      '/induction/sessions',
      payload
    ),
  markAttendance: (id: string, joinerId: string, attended: boolean) =>
    onboardingHttpClient.request<InductionSessionRecord>(
      'POST',
      `/induction/sessions/${encodeURIComponent(id)}/attendance`,
      { joinerId, attended }
    ),
};

// 12. Training & Learning Assignment API
export const onboardingTrainingApi = {
  listAssignments: (
    params?: { joinerId?: string; status?: string },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<
      PaginatedResponse<JoinerTrainingAssignmentRecord>
    >(
      'GET',
      `/training/assignments${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  assignCourse: (payload: {
    joinerId: string;
    courseCode: string;
    dueDate: string;
  }) =>
    onboardingHttpClient.request<JoinerTrainingAssignmentRecord>(
      'POST',
      '/training/assign',
      payload
    ),
};

// 13. Buddy / Mentor Assignment API
export const onboardingBuddyApi = {
  listAssignments: (
    params?: { joinerId?: string; buddyId?: string },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<PaginatedResponse<BuddyAssignmentRecord>>(
      'GET',
      `/buddies/assignments${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  assignBuddy: (payload: {
    joinerId: string;
    buddyEmployeeCode: string;
    checkInCadenceDays: number;
  }) =>
    onboardingHttpClient.request<BuddyAssignmentRecord>(
      'POST',
      '/buddies/assign',
      payload
    ),
};

// 14. Day-1 Experience & Welcome Kit API
export const onboardingDayOneApi = {
  listKits: (
    params?: { status?: string },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<PaginatedResponse<DayOneExperienceRecord>>(
      'GET',
      `/day-one/kits${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  confirmDayOne: (
    id: string,
    payload: { kitDispatched: boolean; dayOneAttended: boolean }
  ) =>
    onboardingHttpClient.request<DayOneExperienceRecord>(
      'POST',
      `/day-one/kits/${encodeURIComponent(id)}/confirm-joining`,
      payload
    ),
};

// 15. Probation Tracking & Confirmation API
export const onboardingProbationApi = {
  listCases: (
    params?: { status?: string; department?: string },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<PaginatedResponse<ProbationCaseRecord>>(
      'GET',
      `/probation/cases${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  evaluateProbation: (
    id: string,
    payload: {
      milestoneDay: 30 | 60 | 90;
      ratingOutOf5: number;
      decision: 'Confirm' | 'Extend' | 'Terminate';
      extensionDays?: number;
      comments: string;
    }
  ) =>
    onboardingHttpClient.request<ProbationCaseRecord>(
      'POST',
      `/probation/cases/${encodeURIComponent(id)}/evaluate`,
      payload
    ),
  downloadConfirmationLetterPdf: (id: string) =>
    onboardingHttpClient.downloadBlob(
      `/probation/cases/${encodeURIComponent(id)}/letter-pdf`,
      `probation-confirmation-${id}.pdf`
    ),
};

// 16. Feedback & Pulse Surveys API
export const onboardingSurveysApi = {
  getWorkspace: (
    params?: { milestone?: 'Day1' | 'Week1' | 'Day30' | 'Day90' },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<OnboardingSurveyWorkspaceResponse>(
      'GET',
      `/surveys/responses${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  submitSurvey: (payload: {
    milestone: 'Day1' | 'Week1' | 'Day30' | 'Day90';
    eNpsScore: number;
    feedbackText: string;
    anonymous: boolean;
  }) =>
    onboardingHttpClient.request<{ recorded: boolean }>(
      'POST',
      '/surveys/submit',
      payload
    ),
};

// 17. Communication Center API
export const onboardingCommunicationsApi = {
  listLogs: (
    params?: { channel?: string; stage?: string },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<PaginatedResponse<OnboardingCommunicationLog>>(
      'GET',
      `/communications/logs${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  sendCommunication: (payload: {
    joinerIds: string[];
    channel: 'Email' | 'SMS' | 'WhatsApp';
    templateCode: string;
  }) =>
    onboardingHttpClient.request<{ queuedCount: number }>(
      'POST',
      '/communications/send',
      payload
    ),
};

// 18. Approvals Workflow API
export const onboardingApprovalsApi = {
  listApprovals: (
    params?: { type?: string; status?: string },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<PaginatedResponse<OnboardingApprovalItem>>(
      'GET',
      `/approvals${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  decideApprovals: (payload: {
    approvalIds: string[];
    decision: 'Approved' | 'Rejected' | 'Delegated';
    comments: string;
  }) =>
    onboardingHttpClient.request<{ processedCount: number }>(
      'POST',
      '/approvals/decide',
      payload
    ),
};

// 19. Reports & Analytics API
export const onboardingReportsApi = {
  runReport: (
    reportKey: string,
    params?: { from?: string; to?: string; departmentId?: string },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<OnboardingReportRunResponse>(
      'GET',
      `/reports/${encodeURIComponent(reportKey)}/run${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  exportReport: (reportKey: string, format: 'csv' | 'xlsx' | 'pdf') =>
    onboardingHttpClient.downloadBlob(
      `/reports/${encodeURIComponent(reportKey)}/export?format=${format}`,
      `onboarding-report-${reportKey}.${format}`
    ),
};

// 20. Settings & Automation Rules API
export const onboardingSettingsApi = {
  getSettings: (options?: OnboardingRequestOptions) =>
    onboardingHttpClient.request<OnboardingSettingsResponse>(
      'GET',
      '/settings',
      undefined,
      options
    ),
  toggleAutomationRule: (ruleId: string, enabled: boolean) =>
    onboardingHttpClient.request<OnboardingAutomationRule>(
      'PUT',
      `/settings/automation-rules/${encodeURIComponent(ruleId)}`,
      { enabled }
    ),
};

// 21. Audit Logs API
export const onboardingAuditLogsApi = {
  listAuditLogs: (
    params?: { actor?: string; action?: string; page?: number; pageSize?: number },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<PaginatedResponse<OnboardingAuditLogRecord>>(
      'GET',
      `/audit-logs${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  exportAuditLogsCsv: () =>
    onboardingHttpClient.downloadBlob(
      '/audit-logs/export?format=csv',
      'onboarding-audit-logs.csv'
    ),
};

// 22. Notifications API
export const onboardingNotificationsApi = {
  listNotifications: (
    params?: { unreadOnly?: boolean },
    options?: OnboardingRequestOptions
  ) =>
    onboardingHttpClient.request<
      PaginatedResponse<OnboardingNotificationRecord>
    >(
      'GET',
      `/notifications${buildOnboardingQueryString(params)}`,
      undefined,
      options
    ),
  markRead: (notificationIds: string[]) =>
    onboardingHttpClient.request<{ markedCount: number }>(
      'POST',
      '/notifications/mark-read',
      { notificationIds }
    ),
};

// 23. Manager Portal API
export const onboardingManagerPortalApi = {
  getWorkspace: (options?: OnboardingRequestOptions) =>
    onboardingHttpClient.request<OnboardingManagerPortalResponse>(
      'GET',
      '/manager-portal/workspace',
      undefined,
      options
    ),
};

// 24. New Joiner Portal API
export const onboardingNewJoinerPortalApi = {
  getWorkspace: (options?: OnboardingRequestOptions) =>
    onboardingHttpClient.request<NewJoinerPortalWorkspaceResponse>(
      'GET',
      '/joiner-portal/me',
      undefined,
      options
    ),
  submitHelpdeskQuery: (payload: {
    subject: string;
    message: string;
    category: 'IT' | 'HR' | 'Payroll' | 'Facilities';
  }) =>
    onboardingHttpClient.request<{ ticketId: string }>(
      'POST',
      '/joiner-portal/helpdesk-query',
      payload
    ),
};
