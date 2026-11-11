export type EmployeeDashboardRole = 'employee' | 'reporting_manager';

export type EmployeeWidgetId =
  | 'today'
  | 'quick-actions'
  | 'tasks'
  | 'leave'
  | 'pay'
  | 'attendance-summary'
  | 'performance'
  | 'assets-requests'
  | 'learning'
  | 'company-feed'
  | 'team-org'
  | 'travel'
  | 'helpdesk'
  | 'probation-exit'
  | 'manager-extras';

export interface AsOfTimestampEnvelope {
  asOf: string;
  serverTimeIso?: string;
}

// 1. Header & Profile Summary
export interface MissingProfileItem {
  id: string;
  label: string;
  sectionKey: string;
  deepLinkPath: string;
  impactWeightPct: number;
}

export interface ProfileSummaryResponse extends AsOfTimestampEnvelope {
  employeeCode: string;
  fullName: string;
  designation: string;
  department: string;
  locationName: string;
  timezone: string;
  avatarUrl?: string;
  reportingManagerName: string;
  reportingManagerDesignation: string;
  profileCompletionPct: number;
  missingProfileItems: MissingProfileItem[];
  unreadNotificationsCount: number;
  permissions: string[];
  applicableConditionalWidgets: {
    travel: boolean;
    probationOrExit: boolean;
    managerExtras: boolean;
  };
}

// 2. Today Widget
export type TodayAttendanceState =
  | 'present'
  | 'late'
  | 'half-day'
  | 'wfh'
  | 'on-duty'
  | 'on-leave'
  | 'holiday'
  | 'week-off'
  | 'absent'
  | 'not-punched';

export interface TodayStatusResponse extends AsOfTimestampEnvelope {
  dateOnly: string;
  timezone: string;
  status: TodayAttendanceState;
  statusLabel: string;
  shiftName: string;
  shiftStartHHMM: string;
  shiftEndHHMM: string;
  crossesMidnight: boolean;
  punchInTimeIso?: string | null;
  punchInDisplay?: string | null;
  punchOutTimeIso?: string | null;
  punchOutDisplay?: string | null;
  expectedOutTimeDisplay?: string | null;
  workedSecondsToday: number;
  breakStatus: 'none' | 'on-break' | 'completed';
  breakDurationMinutes: number;
  geoFenceStatus: 'verified' | 'outside-geofence' | 'not-required' | 'unknown';
  geoFenceHubName?: string;
  selfieRequired: boolean;
  manualEntryPermitted: boolean;
  missingPunchOrShortHours: boolean;
  regularizationPrefill?: {
    dateOnly: string;
    shiftName: string;
    suggestedCheckInHHMM: string;
    suggestedCheckOutHHMM: string;
    reasonCode: string;
  } | null;
  holidayOrWeekOffDetail?: {
    title: string;
    type: 'holiday' | 'week-off';
    nextWorkingDateOnly: string;
  } | null;
}

export interface PunchActionPayload {
  action: 'punch-in' | 'punch-out';
  workMode: 'Office' | 'WFH' | 'On-Duty';
  latitude?: number;
  longitude?: number;
  selfieDataUrl?: string;
  manualReason?: string;
}

export interface PunchActionResponse extends AsOfTimestampEnvelope {
  accepted: boolean;
  serverReason: string;
  denialCode?: 'OUTSIDE_GEOFENCE' | 'DEVICE_NOT_ALLOWED' | 'ALREADY_PUNCHED';
  updatedToday: TodayStatusResponse;
}

export interface RegularizationSubmitPayload {
  dateOnly: string;
  requestedCheckInHHMM: string;
  requestedCheckOutHHMM: string;
  reason: string;
}

// 3. Quick Actions
export interface QuickActionTile {
  id: string;
  label: string;
  description: string;
  moduleKey:
    | 'leave'
    | 'attendance'
    | 'wfh'
    | 'helpdesk'
    | 'asset'
    | 'expense'
    | 'payroll';
  targetRouteOrModal: string;
  pinned: boolean;
  usageRank: number;
  permissionRequired: string;
}

export interface QuickActionsResponse extends AsOfTimestampEnvelope {
  items: QuickActionTile[];
}

// 4. My Attendance Summary
export type DayAttendanceStatus =
  | 'present'
  | 'absent'
  | 'leave'
  | 'late'
  | 'holiday'
  | 'week-off'
  | 'wfh'
  | 'regularized';

export interface AttendanceCalendarDayCell {
  dateOnly: string;
  dayOfMonth: number;
  status: DayAttendanceStatus;
  statusLabel: string;
  checkInDisplay?: string;
  checkOutDisplay?: string;
  workedHoursFormatted?: string;
  tooltipSummary: string;
}

export interface PendingRegularizationItem {
  id: string;
  dateOnly: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approverName: string;
}

export interface MyAttendanceSummaryResponse extends AsOfTimestampEnvelope {
  month: string; // YYYY-MM
  monthLabel: string;
  availableMonths: { value: string; label: string }[];
  stats: {
    presentDays: number;
    absentDays: number;
    lateMarks: number;
    earlyExits: number;
    averageWorkingHours: string;
    overtimeHours: string;
    pendingRegularizationsCount: number;
  };
  calendarDays: AttendanceCalendarDayCell[];
  pendingRegularizations: PendingRegularizationItem[];
  fullAttendanceRoute: string;
}

// 5. My Leave
export interface LeaveTypeBalanceCard {
  leaveTypeCode: string;
  leaveTypeName: string;
  availableDays: number;
  usedDays: number;
  pendingDays: number;
  totalAllocatedDays: number;
  expiryOrLapseInfo?: string | null;
}

export interface EmployeeLeaveRequestItem {
  id: string;
  leaveTypeCode: string;
  leaveTypeName: string;
  startDateOnly: string;
  endDateOnly: string;
  daysCount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Withdrawn';
  approverName: string;
  canWithdraw: boolean;
  reason: string;
}

export interface TeamMemberOnLeaveItem {
  employeeName: string;
  designation: string;
  dateRangeLabel: string;
  leaveCategoryLabel: string;
}

export interface UpcomingHolidayContextItem {
  id: string;
  name: string;
  dateOnly: string;
  dayOfWeek: string;
  isOptional: boolean;
}

export interface MyLeaveWidgetResponse extends AsOfTimestampEnvelope {
  balances: LeaveTypeBalanceCard[];
  pendingRequests: EmployeeLeaveRequestItem[];
  upcomingApprovedLeaves: EmployeeLeaveRequestItem[];
  teamOnLeave: TeamMemberOnLeaveItem[];
  canViewTeamOnLeave: boolean;
  upcomingHolidays: UpcomingHolidayContextItem[];
}

export interface ApplyLeavePayload {
  leaveTypeCode: string;
  startDateOnly: string;
  endDateOnly: string;
  reason: string;
  halfDay?: boolean;
}

// 6. My Pay Snapshot
export interface MyPaySnapshotResponse extends AsOfTimestampEnvelope {
  latestPayslipId: string;
  monthLabel: string;
  payDateOnly: string;
  currency: string;
  maskedNetPayPlaceholder: string; // e.g., "••••••••"
  canRevealNetPay: boolean;
  canDownloadPayslip: boolean;
  previousPayslipsRoute: string;
  ytdSummary: {
    fiscalYearLabel: string;
    grossEarningsFormatted: string;
    totalDeductionsFormatted: string;
    taxDeductedFormatted: string;
  };
  taxDeclaration: {
    regime: string;
    status: 'Submitted' | 'Action Required' | 'Verified';
    proofDeadlineDateOnly: string;
    daysUntilDeadline: number;
  };
  reimbursements: {
    pendingAmountFormatted: string;
    approvedLastMonthFormatted: string;
    openClaimsCount: number;
  };
  loansAndAdvances: {
    activeLoanCount: number;
    outstandingBalanceFormatted: string;
    nextEmiAmountFormatted: string;
    nextEmiDateOnly: string | null;
  };
}

export interface PayRevealAuditedResponse {
  payslipId: string;
  netPayFormatted: string;
  currency: string;
  auditId: string;
  expiresInSeconds: number;
}

// 7. My Tasks & Pending Actions
export type EmployeeTaskCategory =
  | 'policy'
  | 'document'
  | 'onboarding'
  | 'goal'
  | 'training'
  | 'survey'
  | 'feedback'
  | 'asset'
  | 'profile';

export interface EmployeeTaskItem {
  id: string;
  title: string;
  sourceModule: string;
  category: EmployeeTaskCategory;
  dueDateOnly: string;
  priority: 'Urgent' | 'High' | 'Normal';
  isOverdue: boolean;
  deepLinkPath: string;
  canCompleteInline: boolean;
  completed: boolean;
}

export interface MyTasksResponse extends AsOfTimestampEnvelope {
  totalOpenCount: number;
  overdueCount: number;
  items: EmployeeTaskItem[];
}

// 8. My Performance
export interface EmployeeGoalOkrItem {
  id: string;
  title: string;
  metricTarget: string;
  progressPct: number;
  status: 'On Track' | 'At Risk' | 'Behind';
  dueDateOnly: string;
  canUpdateProgressInline: boolean;
}

export interface RecognitionBadgeItem {
  id: string;
  badgeTitle: string;
  awardedBy: string;
  awardedDateOnly: string;
  citation: string;
}

export interface MyPerformanceResponse extends AsOfTimestampEnvelope {
  reviewCycle: {
    cycleName: string;
    currentStage: string;
    deadlineDateOnly: string;
    selfReviewStatus: 'Not Started' | 'In Progress' | 'Submitted';
  };
  upcomingOneOnOne: {
    managerName: string;
    scheduledAtIso: string;
    scheduledDisplay: string;
    agendaSummary: string;
  } | null;
  goals: EmployeeGoalOkrItem[];
  recentFeedbackSummary: string;
  recognitions: RecognitionBadgeItem[];
  developmentPlanHighlights: string[];
}

// 9. My Assets & Requests Tracker
export interface AssignedEmployeeAsset {
  id: string;
  assetTag: string;
  assetName: string;
  category: string;
  assignedDateOnly: string;
  acknowledgementStatus: 'Pending Acknowledgement' | 'Acknowledged';
  returnRequestStatus?: 'None' | 'Return Requested';
}

export type UnifiedRequestType =
  | 'Leave'
  | 'Regularization'
  | 'Asset'
  | 'Expense'
  | 'Travel'
  | 'Ticket'
  | 'Profile Change';

export interface UnifiedEmployeeRequestItem {
  id: string;
  requestType: UnifiedRequestType;
  title: string;
  submittedDateOnly: string;
  status: 'Pending' | 'In Review' | 'Approved' | 'Rejected' | 'Resolved';
  approverOrAssignee: string;
  slaAgeLabel: string;
  deepLinkPath: string;
}

export interface MyAssetsAndRequestsResponse extends AsOfTimestampEnvelope {
  assignedAssets: AssignedEmployeeAsset[];
  requests: UnifiedEmployeeRequestItem[];
  requestNewAssetRoute: string;
}

// 10. Learning
export interface AssignedLearningCourse {
  id: string;
  title: string;
  category: string;
  progressPct: number;
  dueDateOnly: string;
  isOverdue: boolean;
  mandatory: boolean;
  certificateAvailable: boolean;
}

export interface MyLearningResponse extends AsOfTimestampEnvelope {
  courses: AssignedLearningCourse[];
  completedCount: number;
  overdueCount: number;
  lmsPortalName: string;
}

// 11. Company Feed
export interface FeedAnnouncementItem {
  id: string;
  title: string;
  summary: string;
  bodyText: string;
  publishedDateOnly: string;
  authorName: string;
  urgentOrPinned: boolean;
  unread: boolean;
  requiresAcknowledgement: boolean;
  acknowledged: boolean;
}

export interface FeedCelebrationItem {
  id: string;
  employeeName: string;
  department: string;
  type: 'Birthday' | 'Work Anniversary' | 'New Joiner';
  detailLabel: string;
  dateOnly: string;
  wishesCount: number;
  wishedByMe: boolean;
}

export interface FeedUpcomingEventItem {
  id: string;
  title: string;
  dateOnly: string;
  timeDisplay: string;
  locationOrLink: string;
}

export interface CompanyFeedResponse extends AsOfTimestampEnvelope {
  announcements: FeedAnnouncementItem[];
  nextHolidayCountdown: {
    holidayId: string;
    name: string;
    dateOnly: string;
    daysRemaining: number;
    isOptional: boolean;
    bookedByMe?: boolean;
  } | null;
  upcomingHolidays: UpcomingHolidayContextItem[];
  celebrations: FeedCelebrationItem[];
  upcomingEvents: FeedUpcomingEventItem[];
}

// 12. My Team & Org
export interface TeamPeerMember {
  id: string;
  fullName: string;
  designation: string;
  presenceStatus: 'Present' | 'WFH' | 'On Leave' | 'In a Meeting' | 'Offline';
  localTimeDisplay: string;
  email?: string;
  chatDeepLink?: string;
  callDeepLink?: string;
}

export interface MyTeamOrgResponse extends AsOfTimestampEnvelope {
  manager: {
    fullName: string;
    designation: string;
    department: string;
    presenceStatus: string;
    localTimeDisplay: string;
    email?: string;
    chatDeepLink?: string;
  };
  peers: TeamPeerMember[];
  orgChartRoute: string;
  directoryRoute: string;
}

// 13. Travel (Conditional)
export interface MyTravelWidgetResponse extends AsOfTimestampEnvelope {
  applicable: boolean;
  upcomingTrip: {
    tripId: string;
    destination: string;
    purpose: string;
    departureDateOnly: string;
    returnDateOnly: string;
    itinerarySummary: string;
    ticketAvailable: boolean;
    advanceStatus: 'None' | 'Requested' | 'Disbursed';
    advanceAmountFormatted?: string;
  } | null;
  pendingExpenseClaimsCount: number;
  settlementStatusLabel: string;
  visaOrPassportAlert: {
    documentType: 'Passport' | 'Visa';
    expiryDateOnly: string;
    daysRemaining: number;
    severity: 'warning' | 'critical';
  } | null;
}

// 14. Helpdesk
export interface EmployeeHelpdeskTicket {
  id: string;
  subject: string;
  category: string;
  status: 'Open' | 'In Progress' | 'Waiting on Employee' | 'Resolved';
  lastUpdatedLabel: string;
  slaTargetLabel: string;
}

export interface HelpdeskFaqArticle {
  id: string;
  question: string;
  answerSnippet: string;
  category: string;
}

export interface MyHelpdeskWidgetResponse extends AsOfTimestampEnvelope {
  openTickets: EmployeeHelpdeskTicket[];
  faqs: HelpdeskFaqArticle[];
  connectChatBotRoute: string;
}

export interface RaiseHelpdeskTicketPayload {
  category: string;
  subject: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High';
}

// 15. Probation / Exit (Conditional)
export interface MyProbationExitResponse extends AsOfTimestampEnvelope {
  applicable: boolean;
  mode: 'probation' | 'notice-period' | 'none';
  probation?: {
    startDateOnly: string;
    confirmationTargetDateOnly: string;
    evaluationStatus: 'Scheduled' | 'In Review' | 'Confirmed';
    milestones: {
      id: string;
      title: string;
      checkInDateOnly: string;
      status: 'Completed' | 'Upcoming' | 'Due';
    }[];
  };
  noticePeriod?: {
    resignationSubmittedDateOnly: string;
    lastWorkingDateOnly: string;
    daysRemaining: number;
    ktStatus: 'Not Started' | 'In Progress' | 'Signed Off';
    clearanceProgressPct: number;
    fnfSettlementStatus: string;
    relievingLetterAvailable: boolean;
    canWithdrawResignation: boolean;
  };
}

// 16. Manager Extras (Conditional — Manager Role Only)
export interface ManagerPendingApprovalItem {
  id: string;
  type:
    | 'Leave'
    | 'Regularization'
    | 'Expense'
    | 'Travel'
    | 'Asset'
    | 'Goals'
    | 'Onboarding';
  employeeName: string;
  summary: string;
  submittedLabel: string;
  canInlineDecide: boolean;
}

export interface ManagerExtrasWidgetResponse extends AsOfTimestampEnvelope {
  permitted: boolean;
  pendingCountByType: Record<string, number>;
  totalPendingApprovals: number;
  actionableApprovals: ManagerPendingApprovalItem[];
  approvalsInboxRoute: string;
  teamSnapshot: {
    presentToday: number;
    wfhToday: number;
    onLeaveToday: number;
    absentToday: number;
    upcomingTeamLeaves: { employeeName: string; datesLabel: string }[];
    teamCelebrations: { employeeName: string; occasionLabel: string }[];
    teamGoalsCheckInsDue: number;
    openRequisitionsCount: number;
    openRequisitionsRoute: string;
    teamOnTripCount: number;
  };
}

// 17. Widget Layout & Personalization
export interface WidgetLayoutItem {
  widgetId: EmployeeWidgetId;
  title: string;
  visible: boolean;
  order: number;
  mobilePriorityOrder: number;
  mandatory?: boolean;
}

export interface DashboardLayoutConfigResponse extends AsOfTimestampEnvelope {
  roleDefaultApplied: EmployeeDashboardRole;
  widgets: WidgetLayoutItem[];
}

export interface UpdateDashboardLayoutPayload {
  widgets: { widgetId: EmployeeWidgetId; visible: boolean; order: number }[];
}

// 18. Notifications & Global Search
export interface EmployeeDashboardNotification {
  id: string;
  category:
    | 'Approval'
    | 'Leave'
    | 'Payslip'
    | 'Task'
    | 'Announcement'
    | 'Asset';
  title: string;
  message: string;
  createdAtLabel: string;
  read: boolean;
  deepLinkPath: string;
}

export interface EmployeeNotificationsResponse extends AsOfTimestampEnvelope {
  unreadCount: number;
  preferencesRoute: string;
  items: EmployeeDashboardNotification[];
}

export interface GlobalSearchResultItem {
  id: string;
  category: 'Colleague' | 'Policy' | 'Help Article' | 'Page';
  title: string;
  subtitle: string;
  deepLinkPath: string;
}

export interface GlobalSearchResponse extends AsOfTimestampEnvelope {
  query: string;
  results: GlobalSearchResultItem[];
}

// 19. Real-Time Pulse
export interface RealtimePulseResponse extends AsOfTimestampEnvelope {
  todayStatus: TodayAttendanceState;
  workedSecondsToday: number;
  unreadNotificationsCount: number;
  openTasksCount: number;
  pendingManagerApprovalsCount?: number;
}
