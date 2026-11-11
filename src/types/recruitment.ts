export type RecruitmentRole =
  | 'super_admin'
  | 'hr_admin'
  | 'recruiter'
  | 'hiring_manager'
  | 'interviewer'
  | 'approver'
  | 'candidate';

export type RecruitmentModuleId =
  | 'dashboard'
  | 'requisitions'
  | 'job-postings'
  | 'career-portal'
  | 'candidates'
  | 'resume-screening'
  | 'pipeline'
  | 'assessments'
  | 'interviews'
  | 'video-interviews'
  | 'scorecards'
  | 'offers'
  | 'bgv'
  | 'onboarding-handoff'
  | 'referrals'
  | 'vendors'
  | 'communications'
  | 'approvals'
  | 'reports'
  | 'settings'
  | 'audit-logs'
  | 'notifications'
  | 'hiring-manager';

export interface RecruitmentPaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: RecruitmentPaginationMeta;
}

// 1. Dashboard
export interface RecruitmentDashboardKpis {
  openPositions: number;
  activeCandidates: number;
  interviewsToday: number;
  interviewsThisWeek: number;
  offersPending: number;
  offerAcceptanceRatePct: number;
  timeToHireDays: number;
  timeToFillDays: number;
  costPerHireAmount: number;
  currency: string;
  joiningsThisMonth: number;
}

export interface RecruitmentChartPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface RecruitmentSlaAlertItem {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  module: RecruitmentModuleId;
  slaBreachHours?: number;
  createdAt: string;
}

export interface RecruitmentDashboardResponse {
  kpis: RecruitmentDashboardKpis;
  hiringFunnel: RecruitmentChartPoint[];
  sourceEffectiveness: RecruitmentChartPoint[];
  departmentOpenings: RecruitmentChartPoint[];
  recruiterPerformance: RecruitmentChartPoint[];
  pipelineAging: RecruitmentChartPoint[];
  offerVsJoinedTrend: RecruitmentChartPoint[];
  alerts: RecruitmentSlaAlertItem[];
  upcomingInterviews: InterviewScheduleRecord[];
}

// 2. Manpower Planning & Requisitions
export interface ManpowerPlanRecord {
  id: string;
  fiscalYear: string;
  departmentName: string;
  location: string;
  approvedHeadcountBudget: number;
  currentHeadcount: number;
  openRequisitions: number;
  filledYtd: number;
  remainingBudget: number;
  allocatedBudgetAmount: number;
  currency: string;
}

export type RequisitionStatus =
  | 'Draft'
  | 'PendingApproval'
  | 'Approved'
  | 'OnHold'
  | 'Closed'
  | 'Reopened';

export interface JobRequisitionRecord {
  id: string;
  requisitionCode: string;
  title: string;
  department: string;
  location: string;
  grade: string;
  openings: number;
  filledCount: number;
  employmentType: 'Full-Time' | 'Contract' | 'Internship' | 'Part-Time';
  experienceMinYears: number;
  experienceMaxYears: number;
  skills: string[];
  salaryBandMin: number;
  salaryBandMax: number;
  currency: string;
  justification: string;
  isReplacement: boolean;
  replacementForEmployee?: string;
  targetJoiningDate: string;
  jdSummary: string;
  status: RequisitionStatus;
  currentApprovalStep: string;
  requestedBy: string;
  createdAt: string;
}

export interface CreateRequisitionPayload {
  title: string;
  department: string;
  location: string;
  grade: string;
  openings: number;
  employmentType: 'Full-Time' | 'Contract' | 'Internship' | 'Part-Time';
  experienceMinYears: number;
  experienceMaxYears: number;
  skills: string[];
  salaryBandMin: number;
  salaryBandMax: number;
  currency: string;
  justification: string;
  isReplacement: boolean;
  targetJoiningDate: string;
  jdSummary: string;
}

// 3. Job Posting & Multi-channel Sourcing
export type SourcingChannelType =
  | 'CareerPage'
  | 'LinkedIn'
  | 'Naukri'
  | 'Indeed'
  | 'InternalIJP'
  | 'ReferralPortal'
  | 'VendorAgency'
  | 'CampusWalkIn';

export interface ChannelPostingStatus {
  channel: SourcingChannelType;
  status: 'Live' | 'Expired' | 'Failed' | 'Queued';
  applicantsCount: number;
  lastSyncedAt: string;
  errorMessage?: string;
}

export interface JobPostingRecord {
  id: string;
  requisitionId: string;
  requisitionCode: string;
  title: string;
  department: string;
  location: string;
  autoPublishEnabled: boolean;
  autoExpireDate: string;
  autoRepostEnabled: boolean;
  totalApplicants: number;
  channels: ChannelPostingStatus[];
  publishedAt: string;
}

export interface CreateJobPostingPayload {
  requisitionId: string;
  channels: SourcingChannelType[];
  autoPublishEnabled: boolean;
  autoExpireDate: string;
  autoRepostEnabled: boolean;
}

export interface BulkResumeUploadItemStatus {
  fileName: string;
  status: 'Parsed' | 'Duplicate' | 'Failed';
  candidateName?: string;
  matchScorePct?: number;
  errorReason?: string;
}

export interface BulkResumeUploadResponse {
  batchId: string;
  totalFiles: number;
  parsedCount: number;
  failedCount: number;
  results: BulkResumeUploadItemStatus[];
}

// 4. Career Page & Candidate Portal
export interface CareerPageConfigRecord {
  companyTitle: string;
  tagline: string;
  primaryColorHex: string;
  bannerHeadline: string;
  evpHighlights: string[];
  privacyConsentText: string;
  gdprNoticeEnabled: boolean;
}

export interface PublicJobListingRecord {
  id: string;
  code: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  experienceRange: string;
  postedAgo: string;
  skills: string[];
  description: string;
}

export interface CandidateApplicationPayload {
  jobId: string;
  fullName: string;
  email: string;
  phone: string;
  currentLocation: string;
  totalExperienceYears: number;
  noticePeriodDays: number;
  privacyConsentAccepted: boolean;
  resumeFileName: string;
}

export interface CandidatePortalApplicationState {
  applicationId: string;
  jobTitle: string;
  department: string;
  currentStage: PipelineStageId;
  appliedAt: string;
  pendingAction?: 'ScheduleInterview' | 'TakeAssessment' | 'ReviewOffer' | 'UploadDocuments' | 'None';
  offerStatus?: 'Sent' | 'Accepted' | 'Declined';
}

export interface CandidatePortalProfileResponse {
  candidateId: string;
  fullName: string;
  email: string;
  applications: CandidatePortalApplicationState[];
}

// 5. Candidate Database (Talent Pool)
export type PipelineStageId =
  | 'Applied'
  | 'Screening'
  | 'Assessment'
  | 'Interview'
  | 'Offer'
  | 'BGV'
  | 'Joined'
  | 'Rejected'
  | 'OnHold'
  | 'Withdrawn';

export interface CandidateRecord {
  id: string;
  candidateCode: string;
  fullName: string;
  maskedEmail: string;
  maskedPhone: string;
  maskedCurrentCtc: string;
  location: string;
  experienceYears: number;
  noticePeriodDays: number;
  skills: string[];
  source: SourcingChannelType;
  currentStage: PipelineStageId;
  appliedJobTitle: string;
  aiMatchScorePct: number;
  talentPoolTag?: 'SilverMedalist' | 'HighPotential' | 'Passive' | 'ImmediateJoiner';
  isBlacklisted: boolean;
  blacklistReason?: string;
  duplicateOfCandidateId?: string;
  updatedAt: string;
}

export interface Candidate360ProfileResponse {
  candidate: CandidateRecord;
  educationSummary: string;
  workHistorySummary: string[];
  notes: { id: string; author: string; text: string; createdAt: string }[];
  timeline: { id: string; event: string; timestamp: string; actor: string }[];
}

export interface CandidatePiiRevealResponse {
  candidateId: string;
  email: string;
  phone: string;
  currentCtcFormatted: string;
  govtIdMaskedOrRevealed: string;
}

// 6. Resume Parsing & AI Screening
export interface AiScreeningResultRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  parseConfidencePct: number;
  aiMatchScorePct: number;
  matchedSkills: string[];
  missingSkills: string[];
  experienceFitSummary: string;
  knockoutPassed: boolean;
  autoThresholdDecision: 'AutoShortlisted' | 'AutoRejected' | 'ManualReview';
  manualOverrideDecision?: 'Shortlisted' | 'Rejected' | 'Hold';
  manualOverrideReason?: string;
  rankInJob: number;
  blindScreeningActive: boolean;
  parsedAt: string;
}

// 7. Application Pipeline (Kanban + List)
export interface PipelineApplicationCard {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  stage: PipelineStageId;
  aiMatchScorePct: number;
  stageAgeHours: number;
  slaBreached: boolean;
  autoMoveActive: boolean;
  autoEmailSent: boolean;
  recruiterOwner: string;
  updatedAt: string;
}

export interface PipelineBoardResponse {
  jobId?: string;
  stages: {
    stage: PipelineStageId;
    label: string;
    slaHours: number;
    count: number;
    items: PipelineApplicationCard[];
  }[];
  meta: RecruitmentPaginationMeta;
}

// 8. Assessments & Tests
export interface AssessmentTemplateRecord {
  id: string;
  title: string;
  category: 'MCQ' | 'Coding' | 'Aptitude' | 'Psychometric' | 'Typing' | 'Custom';
  durationMinutes: number;
  passingScorePct: number;
  provider: string;
  proctoringEnabled: boolean;
  autoAssignStage?: PipelineStageId;
}

export interface CandidateAssessmentAttemptRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  templateTitle: string;
  category: string;
  status: 'Invited' | 'InProgress' | 'Completed' | 'Expired';
  scorePct?: number;
  passed?: boolean;
  proctoringFlagsCount: number;
  proctoringSummary?: string;
  completedAt?: string;
}

// 9. Interview Scheduling & Management
export interface InterviewScheduleRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  roundType: 'HR' | 'Technical' | 'Managerial' | 'CultureFit';
  mode: 'Video' | 'Phone' | 'InPerson';
  panelInterviewerNames: string[];
  startAt: string;
  endAt: string;
  meetingLinkOrRoom: string;
  calendarSynced: boolean;
  hasConflict: boolean;
  reminderStatus: 'Sent' | 'Queued' | 'Failed';
  status: 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled' | 'NoShow';
}

export interface ScheduleInterviewPayload {
  candidateId: string;
  jobId: string;
  roundType: 'HR' | 'Technical' | 'Managerial' | 'CultureFit';
  mode: 'Video' | 'Phone' | 'InPerson';
  panelInterviewerNames: string[];
  startAt: string;
  endAt: string;
  meetingLinkOrRoom: string;
}

// 10. AI Video Interview
export interface AiVideoTemplateRecord {
  id: string;
  title: string;
  jobRole: string;
  questions: { id: string; prompt: string; thinkTimeSec: number; answerLimitSec: number }[];
  allowedRetakes: number;
}

export interface CreateAiVideoTemplatePayload {
  title: string;
  jobRole: string;
  questions: { prompt: string; thinkTimeSec: number; answerLimitSec: number }[];
  allowedRetakes: number;
}

export interface AiVideoSubmissionRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  templateTitle: string;
  status: 'PendingCandidate' | 'Uploaded' | 'Evaluated';
  aiOverallScorePct: number;
  aiCommunicationScorePct: number;
  aiTranscriptExcerpt: string;
  aiSummary: string;
  flags: string[];
  reviewerDecision?: 'Shortlisted' | 'Rejected';
  submittedAt: string;
}

// 11. Evaluation & Scorecards
export interface ScorecardCompetencyRating {
  competency: string;
  weightPct: number;
  ratingOutOf5: number;
  comment: string;
}

export interface InterviewScorecardRecord {
  id: string;
  interviewId: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  interviewerName: string;
  roundType: string;
  competencies: ScorecardCompetencyRating[];
  panelAverageRating: number;
  recommendation: 'StrongHire' | 'Hire' | 'Hold' | 'NoHire';
  debriefNotes: string;
  submittedAt: string;
}

export interface SubmitScorecardPayload {
  interviewId: string;
  candidateId: string;
  recommendation: 'StrongHire' | 'Hire' | 'Hold' | 'NoHire';
  competencies: ScorecardCompetencyRating[];
  debriefNotes: string;
}

// 12. Offer Management
export interface OfferCompensationBreakup {
  annualCtc: number;
  basicAnnual: number;
  hraAnnual: number;
  specialAllowanceAnnual: number;
  pfEmployerAnnual: number;
  variableBonusAnnual: number;
  monthlyGross: number;
  currency: string;
}

export interface OfferRecord {
  id: string;
  offerCode: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  designation: string;
  department: string;
  location: string;
  reportingManager: string;
  joiningDate: string;
  breakup: OfferCompensationBreakup;
  versionNumber: number;
  approvalStatus: 'PendingApproval' | 'Approved' | 'Rejected';
  offerStatus: 'Draft' | 'Sent' | 'Viewed' | 'Accepted' | 'Declined' | 'Expired' | 'Withdrawn';
  eSignStatus: 'NotSent' | 'AwaitingSignature' | 'Signed';
  expiresAt: string;
  updatedAt: string;
}

export interface CreateOfferPayload {
  candidateId: string;
  jobId: string;
  templateId: string;
  offeredAnnualCtc: number;
  designation: string;
  location: string;
  reportingManager: string;
  joiningDate: string;
  expiresAt: string;
}

// 13. Background Verification (BGV)
export interface BgvCheckItem {
  checkType: 'Identity' | 'Education' | 'Employment' | 'Address' | 'Criminal' | 'Reference';
  status: 'Pending' | 'Verified' | 'Discrepancy';
  remarks?: string;
}

export interface BgvCaseRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  vendorName: string;
  initiatedAt: string;
  overallStatus: 'InProgress' | 'Cleared' | 'Discrepancy' | 'Rejected';
  checks: BgvCheckItem[];
  reportDownloadUrl?: string;
}

export interface InitiateBgvPayload {
  candidateId: string;
  vendorName: string;
  checkTypes: ('Identity' | 'Education' | 'Employment' | 'Address' | 'Criminal' | 'Reference')[];
}

// 14. Onboarding Handoff
export interface OnboardingHandoffRecord {
  id: string;
  candidateId: string;
  candidateName: string;
  jobTitle: string;
  department: string;
  scheduledJoiningDate: string;
  preJoiningDocsVerifiedPct: number;
  bgvCleared: boolean;
  itAssetWorkflowStatus: 'NotStarted' | 'Triggered' | 'Provisioned';
  payrollSetupWorkflowStatus: 'NotStarted' | 'Triggered' | 'Completed';
  joiningStatus: 'AwaitingJoining' | 'JoinedConverted' | 'NoShow';
  employeeCodeGenerated?: string;
}

// 15. Referrals
export interface ReferralSubmissionRecord {
  id: string;
  referrerEmployeeName: string;
  referrerEmployeeCode: string;
  candidateName: string;
  candidateEmail: string;
  jobId: string;
  jobTitle: string;
  currentStage: PipelineStageId;
  bonusAmount: number;
  currency: string;
  bonusEligibilityStatus: 'InPipeline' | 'CoolingPeriod' | 'EligibleForPayout' | 'Paid';
  referredAt: string;
}

export interface ReferralsWorkspaceResponse {
  policySummary: {
    coolingPeriodDays: number;
    standardBonusAmount: number;
    currency: string;
  };
  leaderboard: { employeeName: string; referralsCount: number; successfulHires: number }[];
  submissions: PaginatedResponse<ReferralSubmissionRecord>;
}

export interface CreateReferralPayload {
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone: string;
  relationshipNote: string;
}

// 16. Vendors / Agencies
export interface VendorAgencyRecord {
  id: string;
  agencyName: string;
  contactEmail: string;
  feePercentage: number;
  replacementGuaranteeDays: number;
  assignedJobsCount: number;
  submissionsCount: number;
  hiresCount: number;
  slaCompliancePct: number;
  invoiceStatus: 'NoPending' | 'UnderReview' | 'Approved' | 'Paid';
  status: 'Active' | 'Suspended';
}

export interface CreateVendorAgencyPayload {
  agencyName: string;
  contactEmail: string;
  feePercentage: number;
  replacementGuaranteeDays: number;
}

// 17. Communication Center
export interface CommunicationTemplateRecord {
  id: string;
  name: string;
  channel: 'Email' | 'SMS' | 'WhatsApp';
  triggerStage?: PipelineStageId;
  subject?: string;
  bodyPreview: string;
  mergeFields: string[];
  autoTriggerEnabled: boolean;
}

export interface CommunicationLogRecord {
  id: string;
  candidateName: string;
  channel: 'Email' | 'SMS' | 'WhatsApp';
  templateName: string;
  deliveryStatus: 'Delivered' | 'Opened' | 'Queued' | 'Bounced';
  sentAt: string;
}

// 18. Approvals Workflow
export interface RecruitmentApprovalItem {
  id: string;
  approvalType: 'Requisition' | 'Offer' | 'SalaryDeviation' | 'HiringException' | 'AgencyHire';
  referenceCode: string;
  title: string;
  requestedBy: string;
  department: string;
  amountOrImpact: string;
  currentLevel: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Delegated';
  submittedAt: string;
}

// 19. Reports & Analytics
export interface RecruitmentReportDefinition {
  key: string;
  title: string;
  category: 'Funnel & Velocity' | 'Cost & ROI' | 'Operations & SLA' | 'Compliance & Diversity';
  description: string;
  supportedFormats: ('csv' | 'xlsx' | 'pdf')[];
}

export interface RecruitmentReportRunResponse {
  reportKey: string;
  generatedAt: string;
  columns: string[];
  rows: Record<string, string | number>[];
  meta: RecruitmentPaginationMeta;
}

// 20. Settings & Automation Rules
export interface RecruitmentAutomationRule {
  id: string;
  code: string;
  name: string;
  description: string;
  enabled: boolean;
  thresholdValue?: number;
  slaHours?: number;
  lastRunAt?: string;
  lastRunStatus?: 'Success' | 'Warning' | 'Idle';
}

export interface RecruitmentSettingsResponse {
  gdprRetentionMonths: number;
  autoAnonymizeExpired: boolean;
  dpdpConsentRequired: boolean;
  automationRules: RecruitmentAutomationRule[];
  integrations: {
    provider: string;
    category: 'JobBoard' | 'Calendar' | 'Messaging' | 'Assessment' | 'BGV' | 'ESign';
    connected: boolean;
    lastHealthCheckAt: string;
  }[];
}

// 21. Audit Logs
export interface RecruitmentAuditLogRecord {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: RecruitmentRole;
  action: string;
  entityType: string;
  entityId: string;
  beforeSummary: string;
  afterSummary: string;
  ipAddress: string;
}

// 22. Notifications
export interface RecruitmentNotificationRecord {
  id: string;
  eventType:
    | 'NewApplication'
    | 'InterviewScheduled'
    | 'FeedbackPending'
    | 'OfferAccepted'
    | 'SlaBreach';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// 23. Hiring Manager Portal
export interface HiringManagerWorkspaceResponse {
  myOpenRequisitions: JobRequisitionRecord[];
  candidatesAwaitingReview: PipelineApplicationCard[];
  pendingScorecards: InterviewScorecardRecord[];
  offersAwaitingApproval: OfferRecord[];
}
