import {
  recruitmentHttpClient,
  buildRecruitmentQueryString,
  RecruitmentRequestOptions,
} from './client';
import {
  PaginatedResponse,
  RecruitmentDashboardResponse,
  ManpowerPlanRecord,
  JobRequisitionRecord,
  CreateRequisitionPayload,
  RequisitionStatus,
  JobPostingRecord,
  CreateJobPostingPayload,
  SourcingChannelType,
  BulkResumeUploadResponse,
  CareerPageConfigRecord,
  PublicJobListingRecord,
  CandidateApplicationPayload,
  CandidatePortalApplicationState,
  CandidatePortalProfileResponse,
  CandidateRecord,
  Candidate360ProfileResponse,
  CandidatePiiRevealResponse,
  AiScreeningResultRecord,
  PipelineBoardResponse,
  PipelineStageId,
  PipelineApplicationCard,
  AssessmentTemplateRecord,
  CandidateAssessmentAttemptRecord,
  InterviewScheduleRecord,
  ScheduleInterviewPayload,
  AiVideoTemplateRecord,
  CreateAiVideoTemplatePayload,
  AiVideoSubmissionRecord,
  InterviewScorecardRecord,
  SubmitScorecardPayload,
  OfferRecord,
  OfferCompensationBreakup,
  CreateOfferPayload,
  BgvCaseRecord,
  InitiateBgvPayload,
  OnboardingHandoffRecord,
  ReferralsWorkspaceResponse,
  CreateReferralPayload,
  ReferralSubmissionRecord,
  VendorAgencyRecord,
  CreateVendorAgencyPayload,
  CommunicationTemplateRecord,
  CommunicationLogRecord,
  RecruitmentApprovalItem,
  RecruitmentReportDefinition,
  RecruitmentReportRunResponse,
  RecruitmentSettingsResponse,
  RecruitmentAutomationRule,
  RecruitmentAuditLogRecord,
  RecruitmentNotificationRecord,
  HiringManagerWorkspaceResponse,
} from '../../types/recruitment';

// 1. Dashboard API
export const recruitmentDashboardApi = {
  getSummary: (
    filters?: {
      from?: string;
      to?: string;
      departmentId?: string;
      location?: string;
      recruiterId?: string;
      jobId?: string;
      legalEntityId?: string;
    },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<RecruitmentDashboardResponse>(
      'GET',
      `/dashboard/summary${buildRecruitmentQueryString(filters)}`,
      undefined,
      options
    ),
};

// 2. Manpower Planning & Job Requisitions API
export const recruitmentRequisitionsApi = {
  listManpowerPlans: (
    params?: { fiscalYear?: string; departmentId?: string },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<PaginatedResponse<ManpowerPlanRecord>>(
      'GET',
      `/manpower-plans${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  listRequisitions: (
    params?: {
      page?: number;
      pageSize?: number;
      status?: string;
      departmentId?: string;
      location?: string;
      search?: string;
    },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<PaginatedResponse<JobRequisitionRecord>>(
      'GET',
      `/requisitions${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  createRequisition: (payload: CreateRequisitionPayload) =>
    recruitmentHttpClient.request<JobRequisitionRecord>(
      'POST',
      '/requisitions',
      payload
    ),
  generateAiJd: (payload: {
    title: string;
    department: string;
    skills: string[];
    experienceMin: number;
    experienceMax: number;
    grade: string;
  }) =>
    recruitmentHttpClient.request<{
      generatedJd: string;
      suggestedSkills: string[];
    }>('POST', '/requisitions/generate-jd', payload),
  cloneRequisition: (id: string) =>
    recruitmentHttpClient.request<JobRequisitionRecord>(
      'POST',
      `/requisitions/${encodeURIComponent(id)}/clone`,
      {}
    ),
  updateStatus: (
    id: string,
    payload: { status: RequisitionStatus; reason: string }
  ) =>
    recruitmentHttpClient.request<JobRequisitionRecord>(
      'POST',
      `/requisitions/${encodeURIComponent(id)}/status`,
      payload
    ),
};

// 3. Job Posting & Multi-channel Sourcing API
export const recruitmentJobPostingsApi = {
  listPostings: (
    params?: {
      page?: number;
      pageSize?: number;
      status?: string;
      channel?: string;
      requisitionId?: string;
    },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<PaginatedResponse<JobPostingRecord>>(
      'GET',
      `/postings${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  createPosting: (payload: CreateJobPostingPayload) =>
    recruitmentHttpClient.request<JobPostingRecord>('POST', '/postings', payload),
  publishChannels: (id: string, channels: SourcingChannelType[]) =>
    recruitmentHttpClient.request<JobPostingRecord>(
      'POST',
      `/postings/${encodeURIComponent(id)}/publish`,
      { channels }
    ),
  retryChannel: (id: string, channel: SourcingChannelType) =>
    recruitmentHttpClient.request<JobPostingRecord>(
      'POST',
      `/postings/${encodeURIComponent(id)}/channels/${encodeURIComponent(channel)}/retry`,
      {}
    ),
  uploadBulkResumes: (formData: FormData) =>
    recruitmentHttpClient.request<BulkResumeUploadResponse>(
      'POST',
      '/sourcing/bulk-resumes',
      formData
    ),
};

// 4. Career Page & Candidate Portal API
export const recruitmentCareerPortalApi = {
  getConfig: (options?: RecruitmentRequestOptions) =>
    recruitmentHttpClient.request<CareerPageConfigRecord>(
      'GET',
      '/career-page/config',
      undefined,
      options
    ),
  updateConfig: (payload: Partial<CareerPageConfigRecord>) =>
    recruitmentHttpClient.request<CareerPageConfigRecord>(
      'PUT',
      '/career-page/config',
      payload
    ),
  listPublicJobs: (
    params?: {
      search?: string;
      department?: string;
      location?: string;
      employmentType?: string;
    },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<PaginatedResponse<PublicJobListingRecord>>(
      'GET',
      `/career-page/jobs${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  submitApplication: (payload: CandidateApplicationPayload) =>
    recruitmentHttpClient.request<CandidatePortalApplicationState>(
      'POST',
      '/career-page/apply',
      payload
    ),
  getMyCandidatePortal: (options?: RecruitmentRequestOptions) =>
    recruitmentHttpClient.request<CandidatePortalProfileResponse>(
      'GET',
      '/candidate-portal/me',
      undefined,
      options
    ),
  decideOfferInPortal: (
    applicationId: string,
    payload: {
      decision: 'Accepted' | 'Declined';
      eSignSignature?: string;
      reason?: string;
    }
  ) =>
    recruitmentHttpClient.request<CandidatePortalApplicationState>(
      'POST',
      `/candidate-portal/applications/${encodeURIComponent(applicationId)}/offer-decision`,
      payload
    ),
};

// 5. Candidate Database (Talent Pool) API
export const recruitmentCandidatesApi = {
  listCandidates: (
    params?: {
      page?: number;
      pageSize?: number;
      search?: string;
      skills?: string;
      experienceMin?: number;
      location?: string;
      source?: string;
      stage?: string;
      pool?: string;
      status?: string;
    },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<PaginatedResponse<CandidateRecord>>(
      'GET',
      `/candidates${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  getCandidate360: (id: string, options?: RecruitmentRequestOptions) =>
    recruitmentHttpClient.request<Candidate360ProfileResponse>(
      'GET',
      `/candidates/${encodeURIComponent(id)}`,
      undefined,
      options
    ),
  revealPii: (
    id: string,
    fields: ('email' | 'phone' | 'currentCtc' | 'govtId')[]
  ) =>
    recruitmentHttpClient.request<CandidatePiiRevealResponse>(
      'POST',
      `/candidates/${encodeURIComponent(id)}/reveal-pii`,
      { fields }
    ),
  mergeDuplicate: (id: string, duplicateCandidateId: string) =>
    recruitmentHttpClient.request<CandidateRecord>(
      'POST',
      `/candidates/${encodeURIComponent(id)}/merge`,
      { duplicateCandidateId }
    ),
  setBlacklist: (id: string, payload: { blacklisted: boolean; reason: string }) =>
    recruitmentHttpClient.request<CandidateRecord>(
      'POST',
      `/candidates/${encodeURIComponent(id)}/blacklist`,
      payload
    ),
  bulkAction: (payload: {
    candidateIds: string[];
    action: 'tag' | 'move_pool' | 'email' | 're_engage';
    payloadValue: string;
  }) =>
    recruitmentHttpClient.request<{ updatedCount: number }>(
      'POST',
      '/candidates/bulk-action',
      payload
    ),
};

// 6. Resume Parsing & AI Screening API
export const recruitmentScreeningApi = {
  listScreeningResults: (
    params?: {
      jobId?: string;
      page?: number;
      pageSize?: number;
      recommendation?: string;
      blindMode?: boolean;
    },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<PaginatedResponse<AiScreeningResultRecord>>(
      'GET',
      `/screening/results${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  overrideScreeningDecision: (
    id: string,
    payload: { decision: 'Shortlisted' | 'Rejected' | 'Hold'; reason: string }
  ) =>
    recruitmentHttpClient.request<AiScreeningResultRecord>(
      'POST',
      `/screening/${encodeURIComponent(id)}/override`,
      payload
    ),
  updateParsedFields: (id: string, correctedFields: Record<string, string>) =>
    recruitmentHttpClient.request<AiScreeningResultRecord>(
      'PUT',
      `/screening/${encodeURIComponent(id)}/parsed-fields`,
      { correctedFields }
    ),
  toggleBlindScreening: (jobId: string, blindScreeningEnabled: boolean) =>
    recruitmentHttpClient.request<{
      jobId: string;
      blindScreeningEnabled: boolean;
    }>('POST', '/screening/toggle-blind', { jobId, blindScreeningEnabled }),
};

// 7. Application Pipeline API
export const recruitmentPipelineApi = {
  getBoard: (
    params?: {
      jobId?: string;
      stage?: string;
      search?: string;
      page?: number;
      pageSize?: number;
      sortBy?: string;
      sortDir?: 'asc' | 'desc';
    },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<PipelineBoardResponse>(
      'GET',
      `/pipeline${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  moveApplications: (payload: {
    applicationIds: string[];
    targetStage: PipelineStageId;
    reason?: string;
    sendNotification?: boolean;
  }) =>
    recruitmentHttpClient.request<{
      movedCount: number;
      updatedItems: PipelineApplicationCard[];
    }>('POST', '/pipeline/move', payload),
  exportPipeline: (jobId?: string, format: 'csv' | 'xlsx' = 'csv') =>
    recruitmentHttpClient.downloadBlob(
      `/pipeline/export${buildRecruitmentQueryString({ jobId, format })}`,
      `recruitment-pipeline.${format}`
    ),
};

// 8. Assessments & Tests API
export const recruitmentAssessmentsApi = {
  listTemplates: (
    params?: { type?: string; search?: string },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<PaginatedResponse<AssessmentTemplateRecord>>(
      'GET',
      `/assessments/templates${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  listAttempts: (
    params?: {
      jobId?: string;
      status?: string;
      page?: number;
      pageSize?: number;
    },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<
      PaginatedResponse<CandidateAssessmentAttemptRecord>
    >(
      'GET',
      `/assessments/attempts${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  assignAssessment: (payload: {
    candidateId: string;
    jobId: string;
    templateId: string;
    dueInHours: number;
  }) =>
    recruitmentHttpClient.request<CandidateAssessmentAttemptRecord>(
      'POST',
      '/assessments/assign',
      payload
    ),
  requestRetest: (attemptId: string, reason: string) =>
    recruitmentHttpClient.request<CandidateAssessmentAttemptRecord>(
      'POST',
      `/assessments/attempts/${encodeURIComponent(attemptId)}/retest`,
      { reason }
    ),
};

// 9. Interview Scheduling & Management API
export const recruitmentInterviewsApi = {
  listInterviews: (
    params?: {
      from?: string;
      to?: string;
      interviewerId?: string;
      jobId?: string;
      status?: string;
      view?: 'day' | 'week' | 'month';
    },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<PaginatedResponse<InterviewScheduleRecord>>(
      'GET',
      `/interviews${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  scheduleInterview: (payload: ScheduleInterviewPayload) =>
    recruitmentHttpClient.request<InterviewScheduleRecord>(
      'POST',
      '/interviews',
      payload
    ),
  rescheduleInterview: (
    id: string,
    payload: { startAt: string; endAt: string; reason: string }
  ) =>
    recruitmentHttpClient.request<InterviewScheduleRecord>(
      'POST',
      `/interviews/${encodeURIComponent(id)}/reschedule`,
      payload
    ),
  updateStatus: (
    id: string,
    payload: { status: 'Completed' | 'Cancelled' | 'NoShow'; reason?: string }
  ) =>
    recruitmentHttpClient.request<InterviewScheduleRecord>(
      'POST',
      `/interviews/${encodeURIComponent(id)}/status`,
      payload
    ),
};

// 10. AI Video Interview API
export const recruitmentVideoInterviewsApi = {
  listTemplates: (options?: RecruitmentRequestOptions) =>
    recruitmentHttpClient.request<PaginatedResponse<AiVideoTemplateRecord>>(
      'GET',
      '/video-interviews/templates',
      undefined,
      options
    ),
  createTemplate: (payload: CreateAiVideoTemplatePayload) =>
    recruitmentHttpClient.request<AiVideoTemplateRecord>(
      'POST',
      '/video-interviews/templates',
      payload
    ),
  listSubmissions: (
    params?: { jobId?: string; status?: string },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<PaginatedResponse<AiVideoSubmissionRecord>>(
      'GET',
      `/video-interviews/submissions${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  decideSubmission: (
    id: string,
    payload: { decision: 'Shortlisted' | 'Rejected'; reviewerNotes: string }
  ) =>
    recruitmentHttpClient.request<AiVideoSubmissionRecord>(
      'POST',
      `/video-interviews/submissions/${encodeURIComponent(id)}/decision`,
      payload
    ),
};

// 11. Evaluation & Scorecards API
export const recruitmentScorecardsApi = {
  listScorecards: (
    params?: { jobId?: string; candidateId?: string; status?: string },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<PaginatedResponse<InterviewScorecardRecord>>(
      'GET',
      `/scorecards${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  submitScorecard: (payload: SubmitScorecardPayload) =>
    recruitmentHttpClient.request<InterviewScorecardRecord>(
      'POST',
      '/scorecards',
      payload
    ),
  sendReminderChase: (id: string) =>
    recruitmentHttpClient.request<{ reminderSentAt: string }>(
      'POST',
      `/scorecards/${encodeURIComponent(id)}/chase`,
      {}
    ),
};

// 12. Offer Management API
export const recruitmentOffersApi = {
  listOffers: (
    params?: {
      status?: string;
      jobId?: string;
      page?: number;
      pageSize?: number;
    },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<PaginatedResponse<OfferRecord>>(
      'GET',
      `/offers${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  previewBreakup: (payload: {
    templateId: string;
    offeredAnnualCtc: number;
    location: string;
    grade: string;
  }) =>
    recruitmentHttpClient.request<OfferCompensationBreakup>(
      'POST',
      '/offers/preview-breakup',
      payload
    ),
  createOffer: (payload: CreateOfferPayload) =>
    recruitmentHttpClient.request<OfferRecord>('POST', '/offers', payload),
  sendForESign: (id: string) =>
    recruitmentHttpClient.request<OfferRecord>(
      'POST',
      `/offers/${encodeURIComponent(id)}/send-esign`,
      {}
    ),
  withdrawOffer: (id: string, reason: string) =>
    recruitmentHttpClient.request<OfferRecord>(
      'POST',
      `/offers/${encodeURIComponent(id)}/withdraw`,
      { reason }
    ),
  downloadOfferPdf: (id: string) =>
    recruitmentHttpClient.downloadBlob(
      `/offers/${encodeURIComponent(id)}/pdf`,
      `offer-${id}.pdf`
    ),
};

// 13. Background Verification (BGV) API
export const recruitmentBgvApi = {
  listCases: (
    params?: {
      status?: string;
      vendor?: string;
      page?: number;
      pageSize?: number;
    },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<PaginatedResponse<BgvCaseRecord>>(
      'GET',
      `/bgv/cases${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  initiateBgv: (payload: InitiateBgvPayload) =>
    recruitmentHttpClient.request<BgvCaseRecord>('POST', '/bgv/cases', payload),
  decideClearance: (
    id: string,
    payload: {
      decision: 'Cleared' | 'Discrepancy' | 'Rejected';
      remarks: string;
    }
  ) =>
    recruitmentHttpClient.request<BgvCaseRecord>(
      'POST',
      `/bgv/cases/${encodeURIComponent(id)}/clearance`,
      payload
    ),
};

// 14. Onboarding Handoff API
export const recruitmentOnboardingHandoffApi = {
  listHandoffs: (
    params?: { status?: string; page?: number; pageSize?: number },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<PaginatedResponse<OnboardingHandoffRecord>>(
      'GET',
      `/onboarding-handoffs${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  convertToEmployee: (
    id: string,
    payload: {
      confirmedJoiningDate: string;
      triggerItAssets: boolean;
      triggerPayrollSetup: boolean;
    }
  ) =>
    recruitmentHttpClient.request<OnboardingHandoffRecord>(
      'POST',
      `/onboarding-handoffs/${encodeURIComponent(id)}/convert`,
      payload
    ),
  markNoShow: (
    id: string,
    payload: { reason: string; initiateBackfillRequisition: boolean }
  ) =>
    recruitmentHttpClient.request<OnboardingHandoffRecord>(
      'POST',
      `/onboarding-handoffs/${encodeURIComponent(id)}/no-show`,
      payload
    ),
};

// 15. Referrals API
export const recruitmentReferralsApi = {
  getWorkspace: (
    params?: {
      status?: string;
      jobId?: string;
      page?: number;
      pageSize?: number;
    },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<ReferralsWorkspaceResponse>(
      'GET',
      `/referrals${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  submitReferral: (payload: CreateReferralPayload) =>
    recruitmentHttpClient.request<ReferralSubmissionRecord>(
      'POST',
      '/referrals',
      payload
    ),
};

// 16. Vendors / Agencies API
export const recruitmentVendorsApi = {
  listVendors: (
    params?: { status?: string; page?: number; pageSize?: number },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<PaginatedResponse<VendorAgencyRecord>>(
      'GET',
      `/vendors${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  createVendor: (payload: CreateVendorAgencyPayload) =>
    recruitmentHttpClient.request<VendorAgencyRecord>(
      'POST',
      '/vendors',
      payload
    ),
  assignJobs: (id: string, jobIds: string[]) =>
    recruitmentHttpClient.request<VendorAgencyRecord>(
      'POST',
      `/vendors/${encodeURIComponent(id)}/assign-jobs`,
      { jobIds }
    ),
};

// 17. Communication Center API
export const recruitmentCommunicationsApi = {
  listTemplates: (
    params?: { channel?: 'Email' | 'SMS' | 'WhatsApp' },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<
      PaginatedResponse<CommunicationTemplateRecord>
    >(
      'GET',
      `/communications/templates${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  listLogs: (
    params?: {
      candidateId?: string;
      channel?: string;
      page?: number;
      pageSize?: number;
    },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<PaginatedResponse<CommunicationLogRecord>>(
      'GET',
      `/communications/logs${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  sendBulkMessage: (payload: {
    candidateIds: string[];
    templateId: string;
    channel: 'Email' | 'SMS' | 'WhatsApp';
  }) =>
    recruitmentHttpClient.request<{ queuedCount: number }>(
      'POST',
      '/communications/send-bulk',
      payload
    ),
};

// 18. Approvals Workflow API
export const recruitmentApprovalsApi = {
  listApprovals: (
    params?: {
      type?: string;
      status?: string;
      page?: number;
      pageSize?: number;
    },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<PaginatedResponse<RecruitmentApprovalItem>>(
      'GET',
      `/approvals${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  decideApprovals: (payload: {
    approvalIds: string[];
    decision: 'Approved' | 'Rejected' | 'Delegated';
    comments: string;
    delegateToUserId?: string;
  }) =>
    recruitmentHttpClient.request<{ processedCount: number }>(
      'POST',
      '/approvals/decide',
      payload
    ),
};

// 19. Reports & Analytics API
export const recruitmentReportsApi = {
  getCatalog: (options?: RecruitmentRequestOptions) =>
    recruitmentHttpClient.request<RecruitmentReportDefinition[]>(
      'GET',
      '/reports/catalog',
      undefined,
      options
    ),
  runReport: (
    reportKey: string,
    params?: {
      from?: string;
      to?: string;
      departmentId?: string;
      page?: number;
      pageSize?: number;
    },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<RecruitmentReportRunResponse>(
      'GET',
      `/reports/${encodeURIComponent(reportKey)}/run${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  exportReport: (
    reportKey: string,
    format: 'csv' | 'xlsx' | 'pdf',
    params?: { from?: string; to?: string }
  ) =>
    recruitmentHttpClient.downloadBlob(
      `/reports/${encodeURIComponent(reportKey)}/export${buildRecruitmentQueryString({
        format,
        ...params,
      })}`,
      `recruitment-report-${reportKey}.${format}`
    ),
};

// 20. Settings & Automation Rules API
export const recruitmentSettingsApi = {
  getSettings: (options?: RecruitmentRequestOptions) =>
    recruitmentHttpClient.request<RecruitmentSettingsResponse>(
      'GET',
      '/settings',
      undefined,
      options
    ),
  updateAutomationRule: (
    ruleId: string,
    payload: {
      enabled: boolean;
      thresholdValue?: number;
      slaHours?: number;
    }
  ) =>
    recruitmentHttpClient.request<RecruitmentAutomationRule>(
      'PUT',
      `/settings/automation-rules/${encodeURIComponent(ruleId)}`,
      payload
    ),
  updateGdprRetention: (payload: {
    retentionMonths: number;
    autoAnonymizeExpired: boolean;
    dpdpConsentRequired: boolean;
  }) =>
    recruitmentHttpClient.request<RecruitmentSettingsResponse>(
      'PUT',
      '/settings/gdpr-retention',
      payload
    ),
};

// 21. Audit Logs API
export const recruitmentAuditLogsApi = {
  listAuditLogs: (
    params?: {
      actor?: string;
      action?: string;
      entityType?: string;
      from?: string;
      to?: string;
      page?: number;
      pageSize?: number;
    },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<
      PaginatedResponse<RecruitmentAuditLogRecord>
    >(
      'GET',
      `/audit-logs${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  exportAuditLogsCsv: () =>
    recruitmentHttpClient.downloadBlob(
      '/audit-logs/export?format=csv',
      'recruitment-audit-logs.csv'
    ),
};

// 22. Notifications API
export const recruitmentNotificationsApi = {
  listNotifications: (
    params?: { unreadOnly?: boolean; page?: number; pageSize?: number },
    options?: RecruitmentRequestOptions
  ) =>
    recruitmentHttpClient.request<
      PaginatedResponse<RecruitmentNotificationRecord>
    >(
      'GET',
      `/notifications${buildRecruitmentQueryString(params)}`,
      undefined,
      options
    ),
  markRead: (notificationIds: string[]) =>
    recruitmentHttpClient.request<{ markedCount: number }>(
      'POST',
      '/notifications/mark-read',
      { notificationIds }
    ),
};

// 23. Hiring Manager Portal API
export const recruitmentHiringManagerApi = {
  getWorkspace: (options?: RecruitmentRequestOptions) =>
    recruitmentHttpClient.request<HiringManagerWorkspaceResponse>(
      'GET',
      '/hiring-manager/workspace',
      undefined,
      options
    ),
  submitQuickDecision: (
    candidateId: string,
    payload: {
      jobId: string;
      decision: 'Shortlist' | 'Reject' | 'ScheduleInterview';
      notes: string;
    }
  ) =>
    recruitmentHttpClient.request<{ status: string }>(
      'POST',
      `/hiring-manager/candidates/${encodeURIComponent(candidateId)}/quick-decision`,
      payload
    ),
};
