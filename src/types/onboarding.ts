export type OnboardingRole =
  | 'super_admin'
  | 'hr_admin'
  | 'hr_executive'
  | 'reporting_manager'
  | 'it_admin'
  | 'admin_facilities'
  | 'finance_payroll'
  | 'buddy_mentor'
  | 'new_joiner';

export type OnboardingModuleId =
  | 'dashboard'
  | 'joiners'
  | 'workflows'
  | 'tasks'
  | 'documents'
  | 'joining-forms'
  | 'offer-handoff'
  | 'policies'
  | 'it-assets'
  | 'payroll-handoff'
  | 'induction'
  | 'training'
  | 'buddy'
  | 'day-one'
  | 'probation'
  | 'surveys'
  | 'communications'
  | 'approvals'
  | 'reports'
  | 'settings'
  | 'audit-logs'
  | 'notifications'
  | 'manager-portal'
  | 'joiner-portal';

export interface OnboardingPaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: OnboardingPaginationMeta;
}

export type JoinerLifecycleStage =
  | 'OfferAccepted'
  | 'PreBoarding'
  | 'JoiningDay'
  | 'Onboarding'
  | 'Probation'
  | 'Confirmed'
  | 'NoShow'
  | 'Withdrawn';

// 1. Dashboard
export interface OnboardingDashboardKpis {
  upcomingJoiners: number;
  joiningToday: number;
  inPreBoarding: number;
  inOnboarding: number;
  overdueTasks: number;
  documentsPending: number;
  noShowRiskCount: number;
  probationDueCount: number;
  avgOnboardingCompletionPct: number;
  timeToProductivityDays: number;
}

export interface OnboardingChartPoint {
  label: string;
  value: number;
}

export interface OnboardingSlaAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  module: OnboardingModuleId;
  createdAt: string;
}

export interface OnboardingDashboardResponse {
  kpis: OnboardingDashboardKpis;
  pipelineByStage: OnboardingChartPoint[];
  departmentJoiners: OnboardingChartPoint[];
  taskCompletionTrend: OnboardingChartPoint[];
  documentCompletionRate: OnboardingChartPoint[];
  pulseNpsTrend: OnboardingChartPoint[];
  alerts: OnboardingSlaAlert[];
  todaysJoiners: JoinerRecord[];
}

// 2. Joiner Management
export interface JoinerRecord {
  id: string;
  joinerCode: string;
  fullName: string;
  maskedEmail: string;
  maskedPhone: string;
  designation: string;
  department: string;
  location: string;
  reportingManager: string;
  hrOwner: string;
  joiningDate: string;
  stage: JoinerLifecycleStage;
  completionPct: number;
  noShowRiskFlag: boolean;
  isRehireBoomerang: boolean;
  buddyName?: string;
}

export interface Joiner360ProfileResponse {
  joiner: JoinerRecord;
  documentsCompletedCount: number;
  tasksCompletedCount: number;
  assetsAssigned: string[];
  probationStatus: string;
  timeline: { id: string; event: string; timestamp: string; actor: string }[];
}

// 3. Workflows & Templates
export interface WorkflowStageTaskRule {
  taskTitle: string;
  ownerRole: OnboardingRole;
  relativeDueDays: string; // e.g. 'T-7', 'T+0', 'T+3'
  mandatory: boolean;
}

export interface OnboardingWorkflowTemplate {
  id: string;
  code: string;
  name: string;
  department: string;
  grade: string;
  location: string;
  employmentType: 'Full-Time' | 'Contract' | 'Intern' | 'Consultant';
  version: number;
  effectiveFrom: string;
  autoAssignOnOfferAccept: boolean;
  active: boolean;
  tasks: WorkflowStageTaskRule[];
}

export interface CreateWorkflowTemplatePayload {
  name: string;
  department: string;
  grade: string;
  location: string;
  employmentType: 'Full-Time' | 'Contract' | 'Intern' | 'Consultant';
  effectiveFrom: string;
  autoAssignOnOfferAccept: boolean;
  tasks: WorkflowStageTaskRule[];
}

// 4. Task Management
export interface OnboardingTaskRecord {
  id: string;
  joinerId: string;
  joinerName: string;
  title: string;
  ownerRole: OnboardingRole;
  assigneeName: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Pending' | 'InProgress' | 'Completed' | 'Overdue' | 'Escalated';
  relativeRule: string;
}

export interface CreateOnboardingTaskPayload {
  joinerId: string;
  title: string;
  ownerRole: OnboardingRole;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
}

// 5. Document Collection & Verification
export interface JoinerDocumentRecord {
  id: string;
  joinerId: string;
  joinerName: string;
  documentType:
    | 'Aadhaar'
    | 'PAN'
    | 'Passport'
    | 'EducationDegree'
    | 'RelievingLetter'
    | 'BankCancelledCheque'
    | 'MedicalFitness';
  maskedDocumentNumber: string;
  ocrConfidencePct: number;
  status: 'PendingUpload' | 'PendingVerification' | 'Approved' | 'Rejected';
  expiryDate?: string;
  uploadedAt: string;
}

// 6. Employee Data Collection (Joining Forms)
export interface JoiningFormSubmissionRecord {
  joinerId: string;
  joinerName: string;
  completionPct: number;
  personalSectionComplete: boolean;
  familyNomineeComplete: boolean;
  emergencyContactComplete: boolean;
  bankStatutoryComplete: boolean;
  maskedPan: string;
  maskedUan: string;
  status: 'Draft' | 'Submitted' | 'CorrectionRequested' | 'LockedApproved';
  updatedAt: string;
}

export interface SaveJoiningFormPayload {
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  nomineeName: string;
  nomineeRelationship: string;
  bankAccountNumber: string;
  ifscCode: string;
  panNumber: string;
  uanNumber: string;
}

// 7. Offer-to-Joining Handoff
export interface OfferToJoiningHandoffRecord {
  id: string;
  offerCode: string;
  candidateName: string;
  designation: string;
  department: string;
  location: string;
  reportingManager: string;
  annualCtcFormatted: string;
  bgvStatus: 'Cleared' | 'InProgress' | 'Discrepancy';
  employeeCodeStatus: 'PendingGeneration' | 'Generated';
  generatedEmployeeCode?: string;
  joiningDate: string;
}

// 8. Policy Acknowledgement & E-Sign
export interface PolicyAssignmentRecord {
  id: string;
  joinerId: string;
  joinerName: string;
  policyPackName: string;
  policiesIncluded: string[];
  version: string;
  eSignStatus: 'Pending' | 'Signed' | 'Overdue';
  signedAt?: string;
}

// 9. IT, Asset & Access Provisioning
export interface ProvisioningRequestRecord {
  id: string;
  joinerId: string;
  joinerName: string;
  category:
    | 'Laptop'
    | 'Mobile'
    | 'IdCard'
    | 'AccessCard'
    | 'CorporateEmail'
    | 'VpnSso'
    | 'WorkstationSeating';
  specification: string;
  assigneeGroup: 'ITAdmin' | 'FacilitiesAdmin';
  status: 'Requested' | 'Approved' | 'Provisioned' | 'HandedOver';
  serialNumberOrAccount?: string;
  itsmTicketCode: string;
}

export interface CreateProvisioningRequestPayload {
  joinerId: string;
  category:
    | 'Laptop'
    | 'Mobile'
    | 'IdCard'
    | 'AccessCard'
    | 'CorporateEmail'
    | 'VpnSso'
    | 'WorkstationSeating';
  specification: string;
}

// 10. Payroll & Statutory Setup Handoff
export interface PayrollStatutoryHandoffRecord {
  id: string;
  joinerId: string;
  joinerName: string;
  employeeCode: string;
  salaryStructureAssigned: boolean;
  bankVerified: boolean;
  pfUanLinked: boolean;
  esiLinked: boolean;
  taxRegimeDeclared: boolean;
  benefitsEnrolled: boolean;
  readyForFirstPayroll: boolean;
  blockedByReasons: string[];
}

// 11. Orientation & Induction Scheduling
export interface InductionSessionRecord {
  id: string;
  title: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  mode: 'Virtual' | 'InPerson';
  speakerNames: string[];
  enrolledJoinersCount: number;
  attendedCount: number;
}

export interface CreateInductionSessionPayload {
  title: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  mode: 'Virtual' | 'InPerson';
  speakerNames: string[];
}

// 12. Training & Learning Assignment
export interface JoinerTrainingAssignmentRecord {
  id: string;
  joinerId: string;
  joinerName: string;
  courseCode: string;
  courseTitle: string;
  mandatory: boolean;
  lmsSyncStatus: 'Synced' | 'Pending';
  progressPct: number;
  dueDate: string;
  status: 'Assigned' | 'InProgress' | 'Completed' | 'Overdue';
}

// 13. Buddy / Mentor Assignment
export interface BuddyAssignmentRecord {
  id: string;
  joinerId: string;
  joinerName: string;
  buddyEmployeeCode: string;
  buddyName: string;
  department: string;
  matchExplanation: string;
  checkInsCompleted: number;
  nextCheckInDate: string;
}

// 14. Day-1 Experience & Welcome Kit
export interface DayOneExperienceRecord {
  id: string;
  joinerId: string;
  joinerName: string;
  joiningDate: string;
  welcomeVideoWatched: boolean;
  swagKitStatus: 'Pending' | 'Packed' | 'Dispatched' | 'Delivered';
  idCardReady: boolean;
  dayOneAttendanceConfirmed: boolean;
}

// 15. Probation Tracking & Confirmation
export interface ProbationCaseRecord {
  id: string;
  joinerId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  reportingManager: string;
  joiningDate: string;
  probationEndDate: string;
  day30CheckInDone: boolean;
  day60CheckInDone: boolean;
  day90CheckInDone: boolean;
  status: 'InProbation' | 'DueSoon' | 'Confirmed' | 'Extended' | 'Terminated';
}

// 16. Feedback & Pulse Surveys
export interface OnboardingSurveyWorkspaceResponse {
  overallEnpsScore: number;
  responseRatePct: number;
  themes: string[];
  responses: {
    id: string;
    milestone: 'Day1' | 'Week1' | 'Day30' | 'Day90';
    joinerNameOrAnon: string;
    eNpsScore: number;
    comment: string;
    submittedAt: string;
  }[];
}

// 17. Communication Center
export interface OnboardingCommunicationLog {
  id: string;
  joinerName: string;
  channel: 'Email' | 'SMS' | 'WhatsApp';
  templateCode: string;
  stageTrigger: JoinerLifecycleStage;
  deliveryStatus: 'Delivered' | 'Opened' | 'Queued';
  sentAt: string;
}

// 18. Approvals Workflow
export interface OnboardingApprovalItem {
  id: string;
  approvalType:
    | 'JoiningDateChange'
    | 'AssetException'
    | 'ProbationConfirmation'
    | 'ProbationExtension'
    | 'DocumentWaiver';
  joinerName: string;
  requestedBy: string;
  summary: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Delegated';
  submittedAt: string;
}

// 19. Reports & Analytics
export interface OnboardingReportRunResponse {
  reportKey: string;
  generatedAt: string;
  columns: string[];
  rows: Record<string, string | number>[];
}

// 20. Settings & Automation Rules
export interface OnboardingAutomationRule {
  id: string;
  code: string;
  name: string;
  description: string;
  enabled: boolean;
  lastRunAt?: string;
  lastRunStatus?: 'Success' | 'Warning' | 'Idle';
}

export interface OnboardingSettingsResponse {
  employeeIdPrefix: string;
  defaultProbationDays: number;
  gdprRetentionMonths: number;
  automationRules: OnboardingAutomationRule[];
}

// 21. Audit Logs
export interface OnboardingAuditLogRecord {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: OnboardingRole;
  action: string;
  entityType: string;
  beforeSummary: string;
  afterSummary: string;
  ipAddress: string;
}

// 22. Notifications
export interface OnboardingNotificationRecord {
  id: string;
  eventType:
    | 'JoinerAdded'
    | 'DocumentUploaded'
    | 'TaskOverdue'
    | 'ApprovalPending'
    | 'JoiningTomorrow'
    | 'ProbationDue';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// 23. Manager Portal
export interface OnboardingManagerPortalResponse {
  upcomingTeamJoiners: JoinerRecord[];
  pendingManagerTasks: OnboardingTaskRecord[];
  probationEvaluationsDue: ProbationCaseRecord[];
}

// 24. New Joiner Portal
export interface NewJoinerPortalWorkspaceResponse {
  joinerName: string;
  designation: string;
  joiningDate: string;
  reportingManager: string;
  buddyName: string;
  welcomeHeadline: string;
  checklistCompletionPct: number;
  pendingFormSections: string[];
  pendingDocuments: string[];
  pendingPolicies: string[];
  assignedAssets: string[];
}
