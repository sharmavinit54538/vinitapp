export type HolidayRole =
  | 'super_admin'
  | 'hr_admin'
  | 'hr_executive'
  | 'regional_hr'
  | 'reporting_manager'
  | 'employee';

export type HolidayModuleId =
  | 'dashboard'
  | 'calendar-views'
  | 'templates'
  | 'master'
  | 'assignment'
  | 'optional-policy'
  | 'weekly-off'
  | 'special-overrides'
  | 'swap-compoff'
  | 'shift-site'
  | 'holiday-work'
  | 'leave-payroll-sync'
  | 'optional-booking'
  | 'approvals'
  | 'communications'
  | 'year-rollover'
  | 'reports'
  | 'settings'
  | 'audit-logs'
  | 'notifications'
  | 'manager-portal'
  | 'employee-portal';

export interface HolidayPaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedHolidayResponse<T> {
  items: T[];
  meta: HolidayPaginationMeta;
}

export type HolidayCategoryType =
  | 'National'
  | 'Regional'
  | 'Company'
  | 'Optional'
  | 'Restricted'
  | 'Special'
  | 'WeeklyOff'
  | 'WorkingDayOverride';

// 1. Holiday Dashboard
export interface HolidayDashboardKpis {
  totalHolidaysThisYear: number;
  upcomingNext30Days: number;
  activeCalendars: number;
  optionalHolidaysBooked: number;
  pendingApprovals: number;
  employeesWithoutCalendar: number;
  conflictsDetected: number;
  longWeekendCount: number;
}

export interface HolidayChartPoint {
  label: string;
  value: number;
}

export interface HolidayAutomationAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  module: HolidayModuleId;
  createdAt: string;
}

export interface HolidayDashboardResponse {
  kpis: HolidayDashboardKpis;
  nextHolidayCountdown?: {
    holidayName: string;
    dateOnly: string;
    daysAway: number;
    type: HolidayCategoryType;
  };
  monthWiseDistribution: HolidayChartPoint[];
  locationWiseHolidays: HolidayChartPoint[];
  optionalUtilization: HolidayChartPoint[];
  holidayWorkOvertimeTrend: HolidayChartPoint[];
  alerts: HolidayAutomationAlert[];
  draftCalendarsAwaitingPublish: number;
}

// 2. Holiday Calendar Views (Year / Month / List & Side-by-Side Compare)
export interface HolidayCalendarEventItem {
  id: string;
  calendarCode: string;
  name: string;
  dateOnly: string; // YYYY-MM-DD timezone-safe
  weekdayLabel: string;
  type: HolidayCategoryType;
  isLongWeekendPart: boolean;
  halfDaySession?: 'FullDay' | 'FirstHalf' | 'SecondHalf';
  description?: string;
}

export interface HolidayCalendarViewResponse {
  calendarName: string;
  compareCalendarName?: string;
  events: HolidayCalendarEventItem[];
  compareEvents: HolidayCalendarEventItem[];
  longWeekends: {
    id: string;
    label: string;
    startDateOnly: string;
    endDateOnly: string;
    totalDays: number;
  }[];
  icsSubscribeUrl: string;
}

// 3. Holiday Calendar Templates
export interface HolidayCalendarTemplateRecord {
  id: string;
  code: string;
  name: string;
  year: number;
  yearType: 'CalendarYear' | 'FinancialYear';
  entity: string;
  countryStateLocation: string;
  version: number;
  effectiveFrom: string;
  totalHolidaysCount: number;
  optionalQuotaCount: number;
  assignedEmployeesCount: number;
  status: 'Draft' | 'Published' | 'Archived';
}

export interface CreateHolidayCalendarTemplatePayload {
  name: string;
  code: string;
  year: number;
  yearType: 'CalendarYear' | 'FinancialYear';
  entity: string;
  countryStateLocation: string;
  effectiveFrom: string;
}

// 4. Holiday Master
export interface HolidayMasterRecord {
  id: string;
  name: string;
  dateOnly: string;
  weekdayLabel: string;
  type: HolidayCategoryType;
  halfDaySession: 'FullDay' | 'FirstHalf' | 'SecondHalf';
  applicableCalendars: string[];
  religionOrRegionTag?: string;
  paid: boolean;
  includeInLeaveCount: boolean;
  recurringType: 'FixedDate' | 'LunarMovable';
  conflictStatus: 'Clear' | 'WeeklyOffOverlap' | 'DuplicateDate' | 'LeaveOverlap';
}

export interface CreateHolidayMasterPayload {
  name: string;
  dateOnly: string;
  type: HolidayCategoryType;
  halfDaySession: 'FullDay' | 'FirstHalf' | 'SecondHalf';
  applicableCalendars: string[];
  religionOrRegionTag?: string;
  paid: boolean;
  includeInLeaveCount: boolean;
  recurringType: 'FixedDate' | 'LunarMovable';
  description: string;
}

// 5. Calendar Assignment
export interface HolidayCalendarAssignmentRecord {
  id: string;
  calendarCode: string;
  calendarName: string;
  scopeType: 'Entity' | 'Location' | 'Department' | 'Grade' | 'Employee';
  scopeValue: string;
  priorityRank: number;
  effectiveFrom: string;
  resolvedEmployeeCount: number;
  autoReassignOnTransfer: boolean;
}

export interface CreateCalendarAssignmentPayload {
  calendarCode: string;
  scopeType: 'Entity' | 'Location' | 'Department' | 'Grade' | 'Employee';
  scopeValue: string;
  priorityRank: number;
  effectiveFrom: string;
}

// 6. Optional / Restricted Holidays Policy
export interface OptionalHolidayPolicyRecord {
  id: string;
  calendarCode: string;
  year: number;
  optionalPoolSize: number;
  yearlyQuotaPerEmployee: number;
  bookingWindowDaysPrior: number;
  maxDailyTeamCapacityPct: number;
  requireManagerApproval: boolean;
  lapseRule: 'LapseAtYearEnd' | 'CarryForwardNextQ1';
  bookedCount: number;
}

export interface CreateOptionalHolidayPolicyPayload {
  calendarCode: string;
  yearlyQuotaPerEmployee: number;
  bookingWindowDaysPrior: number;
  maxDailyTeamCapacityPct: number;
  requireManagerApproval: boolean;
  lapseRule: 'LapseAtYearEnd' | 'CarryForwardNextQ1';
}

// 7. Weekly Off & Working Saturday Rules
export interface WeeklyOffRuleRecord {
  id: string;
  code: string;
  name: string;
  patternType:
    | 'FixedSatSun'
    | 'SundayOnly'
    | 'AlternateSaturday'
    | 'SecondFourthSaturdayOff'
    | 'FirstThirdFifthWorking'
    | 'RotationalShift';
  holidayOverlapHandling:
    | 'NoExtraDay'
    | 'AutoCreditCompOff'
    | 'MoveToNextWorkingDay';
  applicableLocationOrShift: string;
  effectiveFrom: string;
}

export interface CreateWeeklyOffRulePayload {
  name: string;
  patternType:
    | 'FixedSatSun'
    | 'SundayOnly'
    | 'AlternateSaturday'
    | 'SecondFourthSaturdayOff'
    | 'FirstThirdFifthWorking'
    | 'RotationalShift';
  holidayOverlapHandling:
    | 'NoExtraDay'
    | 'AutoCreditCompOff'
    | 'MoveToNextWorkingDay';
  applicableLocationOrShift: string;
  effectiveFrom: string;
}

// 8. Special / Ad-hoc Holidays & Working Day Overrides
export interface SpecialHolidayOverrideRecord {
  id: string;
  title: string;
  dateOnly: string;
  overrideType: 'AdHocHoliday' | 'WorkingDayOverride';
  reasonCategory: 'WeatherEmergency' | 'BandhCivicOrder' | 'GovernmentMandate' | 'CompanyMilestone';
  scopeTarget: string;
  attendanceLeavePayrollSyncStatus: 'Synced' | 'SyncInProgress' | 'RolledBack';
  status: 'Active' | 'PendingApproval' | 'RolledBack';
}

export interface CreateSpecialHolidayOverridePayload {
  title: string;
  dateOnly: string;
  overrideType: 'AdHocHoliday' | 'WorkingDayOverride';
  reasonCategory: 'WeatherEmergency' | 'BandhCivicOrder' | 'GovernmentMandate' | 'CompanyMilestone';
  scopeTarget: string;
  autoSyncAttendanceLeavePayroll: boolean;
}

// 9. Holiday Swap & Compensatory Off Rules
export interface HolidaySwapCompOffRecord {
  id: string;
  employeeCode: string;
  employeeName: string;
  recordType: 'SwapRequest' | 'CompOffCredit';
  originalHolidayDate: string;
  targetSwapOrWorkedDate: string;
  expiryDateOnly: string;
  status: 'PendingApproval' | 'ApprovedCredited' | 'Utilized' | 'Expired';
}

export interface CreateHolidaySwapOrCompOffPayload {
  recordType: 'SwapRequest' | 'CompOffCredit';
  originalHolidayDate: string;
  targetSwapOrWorkedDate: string;
  reason: string;
}

// 10. Shift-wise & Site-wise Holidays
export interface ShiftSiteHolidayMappingRecord {
  id: string;
  siteOrProjectName: string;
  shiftCategory:
    | '24x7_Rotational'
    | 'ManufacturingPlant'
    | 'RetailStore'
    | 'ClientCalendar';
  calendarCode: string;
  overtimeMultiplier: number;
  conflictCount: number;
}

export interface CreateShiftSiteMappingPayload {
  siteOrProjectName: string;
  shiftCategory:
    | '24x7_Rotational'
    | 'ManufacturingPlant'
    | 'RetailStore'
    | 'ClientCalendar';
  calendarCode: string;
  overtimeMultiplier: number;
}

// 11. Holiday Work Handling (Attendance & Overtime Integration)
export interface HolidayWorkLogRecord {
  id: string;
  employeeCode: string;
  employeeName: string;
  holidayName: string;
  holidayDateOnly: string;
  hoursWorked: number;
  overtimeMultiplier: number;
  compensationChoice: 'OvertimePayout' | 'CompOffCredit';
  payrollSyncStatus: 'SyncedToPayroll' | 'PendingSync';
}

// 12. Leave & Payroll Integration
export interface LeavePayrollHolidayIntegrationResponse {
  sandwichRulePolicy: 'IncludeHolidaysBetweenLeaves' | 'ExcludeNationalHolidays';
  leaveRecalculationStatus: 'UpToDate' | 'Recalculating';
  affectedLeaveRequestsCount: number;
  payrollCycleMonth: string;
  paidHolidayTreatment: string;
  payrollSyncStatus: 'Synced' | 'MismatchDetected';
  attendanceAutoMarkStatus: 'Synced' | 'FailedRetryAvailable';
  affectedLeaves: {
    id: string;
    employeeName: string;
    leaveDates: string;
    impactSummary: string;
  }[];
}

// 13. Holiday Request & Approval (Optional Holiday Booking)
export interface OptionalHolidayBookingRecord {
  id: string;
  bookingCode: string;
  employeeName: string;
  department: string;
  holidayName: string;
  dateOnly: string;
  teamCapacityUsedPct: number;
  remainingQuotaAfterBooking: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
}

export interface CreateOptionalHolidayBookingPayload {
  holidayName: string;
  dateOnly: string;
  reason: string;
}

// 14. Approvals Workflow
export interface HolidayApprovalItem {
  id: string;
  approvalType:
    | 'CalendarPublish'
    | 'SpecialHoliday'
    | 'WorkingDayOverride'
    | 'OptionalBooking'
    | 'HolidaySwap'
    | 'CompOff';
  referenceCode: string;
  requestedBy: string;
  summary: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Delegated';
  submittedAt: string;
}

// 15. Communication & Announcements
export interface HolidayCommunicationRecord {
  id: string;
  templateCode: string;
  subjectTitle: string;
  channel: 'Email' | 'InApp' | 'WhatsApp' | 'SMS';
  targetScope: string;
  deliveryStatus: 'Delivered' | 'Queued';
  sentAt: string;
}

// 16. Year Rollover & Calendar Publishing
export interface HolidayYearRolloverRunRecord {
  id: string;
  sourceYear: number;
  targetYear: number;
  calendarsClonedCount: number;
  optionalQuotasCarriedCount: number;
  validationErrorsCount: number;
  lockedAfterPublish: boolean;
  status: 'Completed' | 'DraftReady' | 'ValidationWarning';
  executedAt: string;
}

// 17. Reports & Analytics
export interface HolidayReportRunResponse {
  reportKey: string;
  generatedAt: string;
  columns: string[];
  rows: Record<string, string | number>[];
}

// 18. Settings & Automation Rules
export interface HolidayAutomationRuleRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  enabled: boolean;
  lastRunAt?: string;
  lastRunStatus?: 'Success' | 'Warning' | 'Idle';
}

export interface HolidayIntegrationStatusRecord {
  key:
    | 'Attendance'
    | 'Leave'
    | 'Payroll'
    | 'GoogleOutlookCalendar'
    | 'Email'
    | 'WhatsAppSMS';
  label: string;
  connected: boolean;
  lastSyncAt: string;
}

export interface HolidaySettingsResponse {
  defaultOptionalQuota: number;
  compOffValidityDays: number;
  defaultOverlapHandling: string;
  retentionMonths: number;
  automationRules: HolidayAutomationRuleRecord[];
  integrations: HolidayIntegrationStatusRecord[];
}

// 19. Audit Logs
export interface HolidayAuditLogRecord {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: HolidayRole;
  action: string;
  entityType: string;
  beforeSummary: string;
  afterSummary: string;
  ipAddress: string;
}

// 20. Notifications
export interface HolidayNotificationRecord {
  id: string;
  eventType:
    | 'CalendarPublished'
    | 'SpecialHolidayDeclared'
    | 'OptionalBookingDecided'
    | 'UpcomingHoliday'
    | 'QuotaExpiring'
    | 'SyncFailed';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// 21. Manager Portal
export interface HolidayManagerPortalWorkspaceResponse {
  teamOptionalBookings: OptionalHolidayBookingRecord[];
  teamWorkingOnHolidays: HolidayWorkLogRecord[];
  pendingCompOffRequests: HolidaySwapCompOffRecord[];
}

// 22. Employee Portal (My Holidays)
export interface EmployeeHolidayPortalWorkspaceResponse {
  effectiveCalendarCode: string;
  effectiveCalendarName: string;
  optionalQuotaTotal: number;
  optionalQuotaRemaining: number;
  compOffBalanceDays: number;
  icsSubscribeUrl: string;
  upcomingHolidays: HolidayCalendarEventItem[];
  myBookings: OptionalHolidayBookingRecord[];
}
