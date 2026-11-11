export type AttendanceAnalyticsRole =
  | 'super_admin'
  | 'hr_admin'
  | 'attendance_admin'
  | 'regional_hr'
  | 'department_head'
  | 'reporting_manager'
  | 'payroll'
  | 'auditor'
  | 'employee';

export type AttendanceAnalyticsModuleId =
  | 'overview'
  | 'daily-live'
  | 'punctuality'
  | 'absenteeism-leave'
  | 'working-hours'
  | 'overtime-holiday'
  | 'shift-roster'
  | 'location-remote'
  | 'regularizations'
  | 'devices-sources'
  | 'anomalies'
  | 'payroll-impact'
  | 'profiles'
  | 'trends-forecasting'
  | 'benchmarks-targets'
  | 'drill-down'
  | 'insights-alerts'
  | 'saved-schedules'
  | 'settings'
  | 'audit-logs'
  | 'notifications'
  | 'manager-view'
  | 'employee-view';

export interface AttendanceMetricMetadata {
  definition: string;
  asOfTime: string;
  dataFreshness: 'RealTime' | 'Under5Min' | 'HourlyBatch';
}

export interface AttendancePaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedAttendanceResponse<T> {
  items: T[];
  meta: AttendancePaginationMeta;
  metadata?: AttendanceMetricMetadata;
}

export interface AttendanceSharedFilterParams {
  dateRange?: string;
  entity?: string;
  businessUnit?: string;
  department?: string;
  location?: string;
  shift?: string;
  grade?: string;
  employmentType?: string;
  managerId?: string;
}

export interface AttendanceChartPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface KpiCardWithDelta {
  key: string;
  label: string;
  valueFormatted: string;
  deltaFormatted: string;
  deltaDirection: 'up' | 'down' | 'neutral';
  sparkline: number[];
}

// 1. Attendance Overview Dashboard
export interface AttendanceOverviewResponse {
  metadata: AttendanceMetricMetadata;
  kpis: {
    presentPct: KpiCardWithDelta;
    absentPct: KpiCardWithDelta;
    onLeavePct: KpiCardWithDelta;
    latePct: KpiCardWithDelta;
    earlyExitPct: KpiCardWithDelta;
    wfhRemotePct: KpiCardWithDelta;
    avgWorkingHours: KpiCardWithDelta;
    overtimeHours: KpiCardWithDelta;
    regularizationRequests: KpiCardWithDelta;
    missingPunches: KpiCardWithDelta;
    deviceOfflineCount: KpiCardWithDelta;
    anomaliesFlagged: KpiCardWithDelta;
  };
  dailyAttendanceTrend: AttendanceChartPoint[];
  departmentWiseAttendance: AttendanceChartPoint[];
  lateArrivalTrend: AttendanceChartPoint[];
  overtimeTrend: AttendanceChartPoint[];
}

// 2. Daily Attendance & Live Status
export interface DailyLiveStatusResponse {
  metadata: AttendanceMetricMetadata;
  counts: {
    present: number;
    absent: number;
    late: number;
    onLeave: number;
    notYetPunched: number;
    onBreak: number;
    remote: number;
  };
  whoIsAbsent: {
    id: string;
    employeeCode: string;
    employeeName: string;
    department: string;
    leaveOrRegStatus: string;
  }[];
  lateComersToday: {
    id: string;
    employeeCode: string;
    employeeName: string;
    shiftCode: string;
    delayMinutes: number;
    punchInTime: string;
  }[];
  hourlyPunchInCurve: AttendanceChartPoint[];
}

// 3. Punctuality: Late Arrival & Early Exit
export interface PunctualityAnalyticsResponse {
  metadata: AttendanceMetricMetadata;
  lateArrivalCount: number;
  earlyExitCount: number;
  gracePeriodUsageCount: number;
  avgDelayMinutes: number;
  policyLopDeductionInstances: number;
  repeatLateComers: {
    id: string;
    employeeCode: string;
    employeeName: string;
    department: string;
    lateCountInPeriod: number;
    avgDelayMinutes: number;
    nudgeStatus: 'NudgeSent' | 'Improved' | 'PendingAction';
  }[];
  shiftWisePunctuality: AttendanceChartPoint[];
}

// 4. Absenteeism & Leave Correlation
export interface AbsenteeismLeaveCorrelationResponse {
  metadata: AttendanceMetricMetadata;
  plannedAbsencePct: number;
  unplannedAbsencePct: number;
  avgBradfordFactor: number;
  mondayFridayBridgeCount: number;
  prePostHolidaySpikePct: number;
  unauthorizedAbsenceCount: number;
  longAbsenceReturnList: {
    id: string;
    employeeCode: string;
    employeeName: string;
    consecutiveAbsentDays: number;
    bradfordScore: number;
    returnToWorkStatus: 'PendingCheck' | 'Cleared';
  }[];
}

// 5. Working Hours & Productivity
export interface WorkingHoursProductivityResponse {
  metadata: AttendanceMetricMetadata;
  avgDailyWorkingHours: number;
  expectedStandardHours: number;
  totalShortfallHours: number;
  avgBreakMinutes: number;
  fullDayCount: number;
  halfDayCount: number;
  shortHoursCount: number;
  weeklyHoursCompliancePct: number;
  hoursDistribution: AttendanceChartPoint[];
}

// 6. Overtime & Holiday Work Analytics
export interface OvertimeHolidayAnalyticsResponse {
  metadata: AttendanceMetricMetadata;
  approvedOvertimeHours: number;
  unapprovedOvertimeHours: number;
  statutoryCapBreaches: number;
  holidayWorkHours: number;
  compOffEarnedDays: number;
  compOffAvailedDays: number;
  payrollSyncStatus: 'Synced' | 'PendingSync';
  departmentOvertime: AttendanceChartPoint[];
}

// 7. Shift & Roster Analytics
export interface ShiftRosterAnalyticsResponse {
  metadata: AttendanceMetricMetadata;
  onTimeShiftStartPct: number;
  rosterCoverageGaps: number;
  shiftSwapCount: number;
  nightShiftCrossMidnightCount: number;
  consecutiveDaysFatigueAlerts: number;
  shiftAdherenceRows: {
    id: string;
    shiftCode: string;
    shiftName: string;
    windowLabel: string;
     crossesMidnight: boolean;
    plannedHeadcount: number;
    actualHeadcount: number;
    adherencePct: number;
  }[];
}

// 8. Location, Geo-fence & Remote Work Analytics
export interface LocationRemoteAnalyticsResponse {
  metadata: AttendanceMetricMetadata;
  officeRatioPct: number;
  wfhRemoteRatioPct: number;
  onDutyTravelPct: number;
  geoFenceViolationCount: number;
  hybridPolicyCompliancePct: number;
  siteOccupancy: {
    id: string;
    locationName: string;
    checkedInCount: number;
    geoFenceBreaches: number;
    maskedCoordSummary: string;
  }[];
}

// 9. Regularization & Exception Analytics
export interface RegularizationExceptionAnalyticsResponse {
  metadata: AttendanceMetricMetadata;
  totalRequests: number;
  avgTurnaroundHours: number;
  rejectionRatePct: number;
  missingPunchCount: number;
  manualEntryRatioPct: number;
  slaBreachesCount: number;
  repeatRequesters: {
    id: string;
    employeeCode: string;
    employeeName: string;
    requestCount: number;
    primaryReason: string;
  }[];
}

// 10. Biometric / Device & Source Analytics
export interface AttendanceDeviceHealthRecord {
  id: string;
  deviceCode: string;
  locationName: string;
  sourceType: 'Biometric' | 'FaceAI' | 'RFID' | 'MobileGeo' | 'WebKiosk';
  status: 'Online' | 'Offline' | 'SyncLag';
  lastSyncAt: string;
  failedSyncCount: number;
  spoofLivenessAlerts: number;
}

export interface DeviceSourceAnalyticsResponse {
  metadata: AttendanceMetricMetadata;
  onlineDevicesCount: number;
  offlineDevicesCount: number;
  spoofLivenessFailuresCount: number;
  duplicateFailedPunchesCount: number;
  sourceMix: AttendanceChartPoint[];
  devices: AttendanceDeviceHealthRecord[];
}

// 11. Anomaly, Fraud & Compliance Detection
export interface AttendanceAnomalyRecord {
  id: string;
  anomalyCode: string;
  employeeCode: string;
  employeeName: string;
  anomalyCategory:
    | 'BuddyPunchIndicator'
    | 'ImpossibleTravel'
    | 'IdenticalPunchTimes'
    | 'ExcessiveManualEdits'
    | 'StatutoryHoursBreach';
  severity: 'High' | 'Medium' | 'Low';
  evidenceSummary: string;
  detectedAt: string;
  reviewStatus: 'PendingReview' | 'Confirmed' | 'Dismissed' | 'Escalated';
}

// 12. Attendance-to-Payroll Impact (LOP & Pay Days)
export interface AttendancePayrollImpactResponse {
  metadata: AttendanceMetricMetadata;
  cycleMonth: string;
  attendanceLockStatus: 'Unlocked' | 'LockedForPayroll';
  totalLopDays: number;
  blockingExceptionsCount: number;
  reconciledEmployeesCount: number;
  varianceCount: number;
  records: {
    id: string;
    employeeCode: string;
    employeeName: string;
    payableDays: number;
    lopDays: number;
    overtimeHours: number;
    reconciliationStatus: 'Matched' | 'VarianceFlagged';
  }[];
}

// 13. Employee & Team Attendance Profiles
export interface EmployeeAttendanceProfileResponse {
  metadata: AttendanceMetricMetadata;
  employeeCode: string;
  employeeName: string;
  department: string;
  shiftName: string;
  attendanceScore: number;
  presentDays: number;
  lateMarks: number;
  leaveDays: number;
  overtimeHours: number;
  recentPunches: {
    dateOnly: string;
    shiftCode: string;
    inTime: string;
    outTime: string;
    workingHours: number;
    status: string;
  }[];
}

// 14. Trends, Patterns & Forecasting
export interface TrendsForecastingResponse {
  metadata: AttendanceMetricMetadata;
  weekOverWeekDeltaPct: number;
  yearOverYearDeltaPct: number;
  predictedAbsenteeismNext30dPct: number;
  predictedOvertimeHoursNext30d: number;
  staffingRequirementForecast: AttendanceChartPoint[];
}

// 15. Benchmarking & Targets
export interface BenchmarkTargetRecord {
  id: string;
  metricKey: 'PunctualityRate' | 'AbsenteeismRate' | 'OvertimeCapHours' | 'HybridOfficeDays';
  scopeDepartmentOrLocation: string;
  targetValue: number;
  actualValue: number;
  ragStatus: 'Green' | 'Amber' | 'Red';
}

export interface CreateBenchmarkTargetPayload {
  metricKey: 'PunctualityRate' | 'AbsenteeismRate' | 'OvertimeCapHours' | 'HybridOfficeDays';
  scopeDepartmentOrLocation: string;
  targetValue: number;
}

// 16. Drill-down & Record Explorer
export interface AttendanceDrillDownRecord {
  id: string;
  employeeCode: string;
  employeeName: string;
  dateOnly: string;
  shiftCode: string;
  punchIn: string;
  punchOut: string;
  workingHours: number;
  status: string;
  source: string;
  locationName: string;
}

// 17. Insights, Alerts & Narratives
export interface InsightsAlertsResponse {
  metadata: AttendanceMetricMetadata;
  narratives: {
    id: string;
    headline: string;
    detail: string;
    severity: 'critical' | 'warning' | 'info';
  }[];
  activeAlertRulesCount: number;
}

export interface CreateAlertRulePayload {
  metricKey: string;
  thresholdValue: number;
  scope: string;
  frequency: 'RealTime' | 'Daily' | 'Weekly';
  channel: 'InApp' | 'Email' | 'SlackTeams' | 'WhatsApp';
}

// 18. Saved Views, Scheduled Reports & Exports
export interface ScheduledAttendanceReportRecord {
  id: string;
  reportTitle: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  format: 'PDF' | 'XLSX' | 'CSV';
  recipients: string;
  lastRunAt: string;
  lastRunStatus: 'Delivered' | 'Queued';
}

export interface CreateScheduledReportPayload {
  reportTitle: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  format: 'PDF' | 'XLSX' | 'CSV';
  recipients: string;
}

// 19. Settings & Automation Rules
export interface AttendanceAutomationRuleRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  enabled: boolean;
  lastRunAt?: string;
  lastRunStatus?: 'Success' | 'Warning' | 'Idle';
}

export interface AttendanceAnalyticsSettingsResponse {
  graceMinutesDefault: number;
  fullDayMinHours: number;
  halfDayMinHours: number;
  smallGroupPrivacyThreshold: number;
  retentionMonths: number;
  automationRules: AttendanceAutomationRuleRecord[];
}

// 20. Audit Logs
export interface AttendanceAuditLogRecord {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: AttendanceAnalyticsRole;
  action: string;
  filtersUsedSummary: string;
  ipAddress: string;
}

// 21. Notifications
export interface AttendanceNotificationRecord {
  id: string;
  eventType:
    | 'AnomalyFlagged'
    | 'DeviceOffline'
    | 'AlertRuleFired'
    | 'ScheduledReportReady'
    | 'TargetBreached'
    | 'ExceptionSlaBreach';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// 22. Manager View
export interface ManagerAttendanceViewResponse {
  teamPresentToday: number;
  teamLateToday: number;
  teamAbsentToday: number;
  pendingRegularizationsCount: number;
  teamOvertimeHoursMonth: number;
  teamMembers: {
    employeeCode: string;
    employeeName: string;
    todayStatus: string;
    punctualityPct: number;
    hybridOfficeDaysDone: number;
  }[];
}

// 23. Employee View (My Attendance Insights)
export interface EmployeeMyAttendanceViewResponse {
  employeeCode: string;
  presentDaysMonth: number;
  lateMarksMonth: number;
  avgWorkingHours: number;
  overtimeHoursMonth: number;
  compOffBalanceDays: number;
  hybridDaysCompleted: number;
  personalInsights: string[];
}
