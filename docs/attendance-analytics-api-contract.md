# Attendance Analytics REST API Contract (`docs/attendance-analytics-api-contract.md`)

Base Path: `${API_BASE_URL}/api/v1/attendance-analytics`  
Authentication: `Authorization: Bearer <access_token>` (sourced from `authClient.getAccessToken()` in `lib/auth-api.ts`).

All endpoints listed below are **required from backend** (or linked to existing Attendance Core, Leave, Holiday Management, Shift/Roster, Payroll, and Employee Directory endpoints). All metric computations, Bradford factor scores, anomaly detections, and forecasts are computed strictly on the backend. The frontend consumes these endpoints through `src/services/attendance-analytics/*` with **zero mock, fake, or hardcoded data**.

## Standard Response Envelope, Metric Metadata & Error Format
- Every analytical response includes `metadata: AttendanceMetricMetadata`:
  `{ definition: string, asOfTime: string, dataFreshness: 'RealTime' | 'Under5Min' | 'HourlyBatch' }`
- Paginated responses return `PaginatedAttendanceResponse<T>`:
  `{ items: T[], meta: { page, pageSize, totalItems, totalPages }, metadata?: AttendanceMetricMetadata }`
- Error responses return HTTP `400 | 401 | 403 | 404 | 409 | 422 | 500`:
  `{ error: { code: string, message: string, details?: Record<string, unknown> } }`

## Shared Global Filters (`AttendanceSharedFilterParams`)
`dateRange?`, `entity?`, `businessUnit?`, `department?`, `location?`, `shift?`, `grade?`, `employmentType?`, `managerId?` (non-sensitive filter keys only; no PII or raw GPS coordinates in URLs).

## Role-Based Access Control (RBAC) Roles (9 Roles)
- `super_admin` (Super Admin)
- `hr_admin` (HR Admin)
- `attendance_admin` (Attendance Admin)
- `regional_hr` (Location / Regional HR)
- `department_head` (Department Head)
- `reporting_manager` (Reporting Manager)
- `payroll` (Payroll Officer)
- `auditor` (Auditor)
- `employee` (Employee)

---

## 1. Attendance Overview Dashboard
- **GET** `/overview`
  - Query: `AttendanceSharedFilterParams`
  - Response: `AttendanceOverviewResponse` (12 KPIs with period delta & sparklines: presentPct, absentPct, onLeavePct, latePct, earlyExitPct, wfhRemotePct, avgWorkingHours, overtimeHours, regularizationRequests, missingPunches, deviceOfflineCount, anomaliesFlagged; dailyTrend, departmentAttendance, lateArrivalTrend, absenteeismHeatmap, overtimeTrend)

## 2. Daily Attendance & Live Status
- **GET** `/daily-live`
  - Query: `AttendanceSharedFilterParams`
  - Response: `DailyLiveStatusResponse` (live counts: present, absent, late, onLeave, notYetPunched, onBreak, remote; absentWithContextList, lateComersList, hourlyPunchCurve, shiftStartTracking)

## 3. Punctuality: Late Arrival & Early Exit
- **GET** `/punctuality`
  - Query: `AttendanceSharedFilterParams`
  - Response: `PunctualityAnalyticsResponse` (lateFrequency, earlyExitFrequency, gracePeriodUsageCount, avgDelayMinutes, policyLopImpactCount, repeatLateComers, shiftWisePunctuality)

## 4. Absenteeism & Leave Correlation
- **GET** `/absenteeism-leave`
  - Query: `AttendanceSharedFilterParams`
  - Response: `AbsenteeismLeaveCorrelationResponse` (plannedAbsencePct, unplannedAbsencePct, avgBradfordFactor, mondayFridayPatternCount, prePostHolidaySpikePct, unauthorizedAbsenceCount, longAbsenceReturnList)

## 5. Working Hours & Productivity
- **GET** `/working-hours`
  - Query: `AttendanceSharedFilterParams`
  - Response: `WorkingHoursProductivityResponse` (avgDailyHours, expectedHours, shortfallHoursTotal, avgBreakMinutes, fullDayCount, halfDayCount, shortHoursCount, weeklyComplianceRatePct, distributionSeries)

## 6. Overtime & Holiday Work Analytics
- **GET** `/overtime-holiday`
  - Query: `AttendanceSharedFilterParams`
  - Response: `OvertimeHolidayAnalyticsResponse` (approvedOvertimeHours, unapprovedOvertimeHours, statutoryCapBreaches, holidayWorkHours, compOffEarnedDays, compOffAvailedDays, payrollSyncStatus, departmentOvertimeBreakdown)
- **POST** `/overtime-holiday/sync-payroll`
  - Body: `{ cycleMonth: string }`
  - Response: `{ syncedRecords: number, status: string }`

## 7. Shift & Roster Analytics
- **GET** `/shift-roster`
  - Query: `AttendanceSharedFilterParams`
  - Response: `ShiftRosterAnalyticsResponse` (onTimeShiftStartPct, rosterCoverageGapCount, swapFrequencyCount, nightShiftCrossMidnightCount, consecutiveDaysFatigueFlags, shiftAdherenceRows)

## 8. Location, Geo-fence & Remote Work Analytics
- **GET** `/location-remote`
  - Query: `AttendanceSharedFilterParams`
  - Response: `LocationRemoteAnalyticsResponse` (officeRatioPct, wfhRemoteRatioPct, onDutyTravelPct, geoFenceViolationCount, hybridPolicyCompliancePct, siteOccupancyList)

## 9. Regularization & Exception Analytics
- **GET** `/regularizations`
  - Query: `AttendanceSharedFilterParams`
  - Response: `RegularizationExceptionAnalyticsResponse` (totalRequests, avgTurnaroundHours, rejectionRatePct, missingPunchCount, manualEntryRatioPct, slaBreachesCount, repeatRequesters)

## 10. Biometric / Device & Source Analytics
- **GET** `/devices-sources`
  - Query: `AttendanceSharedFilterParams`
  - Response: `DeviceSourceAnalyticsResponse` (sourceMix, onlineDevicesCount, offlineDevicesCount, spoofLivenessFailuresCount, duplicateFailedPunchesCount, devices)
- **POST** `/devices-sources/:deviceId/resync`
  - Body: `{ auditReason: string }`
  - Response: `{ triggered: boolean, syncJobId: string }`

## 11. Anomaly, Fraud & Compliance Detection
- **GET** `/anomalies`
  - Query: `AttendanceSharedFilterParams`
  - Response: `PaginatedAttendanceResponse<AttendanceAnomalyRecord>`
- **POST** `/anomalies/:id/review`
  - Body: `{ decision: 'Confirmed' | 'Dismissed' | 'Escalated', reason: string }`
  - Response: `AttendanceAnomalyRecord`

## 12. Attendance-to-Payroll Impact (LOP & Pay Days)
- **GET** `/payroll-impact`
  - Query: `cycleMonth?`, `entity?`, `location?`
  - Response: `AttendancePayrollImpactResponse` (cycleMonth, attendanceLockStatus, totalLopDays, blockingExceptionsCount, reconciledEmployeesCount, varianceCount, records)

## 13. Employee & Team Attendance Profiles
- **GET** `/profiles`
  - Query: `employeeCode?`, `department?`
  - Response: `EmployeeAttendanceProfileResponse`

## 14. Trends, Patterns & Forecasting
- **GET** `/trends-forecasting`
  - Query: `AttendanceSharedFilterParams`
  - Response: `TrendsForecastingResponse`

## 15. Benchmarking & Targets
- **GET** `/benchmarks-targets`
  - Query: `AttendanceSharedFilterParams`
  - Response: `PaginatedAttendanceResponse<BenchmarkTargetRecord>`
- **POST** `/benchmarks-targets`
  - Body: `CreateBenchmarkTargetPayload`
  - Response: `BenchmarkTargetRecord`

## 16. Drill-down & Record Explorer
- **GET** `/drill-down`
  - Query: `segmentKey?`, `search?`, `page?`, `pageSize?`
  - Response: `PaginatedAttendanceResponse<AttendanceDrillDownRecord>`
- **GET** `/drill-down/export`
  - Query: `format=csv|xlsx|pdf`, `segmentKey?`
  - Response: Binary Blob download

## 17. Insights, Alerts & Narratives
- **GET** `/insights-alerts`
  - Query: `AttendanceSharedFilterParams`
  - Response: `InsightsAlertsResponse`
- **POST** `/insights-alerts/rules`
  - Body: `CreateAlertRulePayload`
  - Response: `{ id: string, status: string }`
- **POST** `/insights-alerts/ask`
  - Body: `{ question: string }`
  - Response: `{ narrativeAnswer: string, series: { label: string, value: number }[] }`

## 18. Saved Views, Scheduled Reports & Exports
- **GET** `/saved-schedules`
  - Response: `PaginatedAttendanceResponse<ScheduledAttendanceReportRecord>`
- **POST** `/saved-schedules`
  - Body: `CreateScheduledReportPayload`
  - Response: `ScheduledAttendanceReportRecord`

## 19. Settings & Automation Rules (9 Automation Rules + 10 Integrations)
- **GET** `/settings`
  - Response: `AttendanceAnalyticsSettingsResponse`
- **PUT** `/settings/automation-rules/:ruleId`
  - Body: `{ enabled: boolean }`
  - Response: `AttendanceAutomationRuleRecord`

## 20. Audit Logs
- **GET** `/audit-logs`
  - Query: `actor?`, `action?`, `page?`, `pageSize?`
  - Response: `PaginatedAttendanceResponse<AttendanceAuditLogRecord>`
- **GET** `/audit-logs/export`
  - Query: `format=csv`
  - Response: Binary CSV Blob

## 21. Notifications
- **GET** `/notifications`
  - Query: `unreadOnly?`
  - Response: `PaginatedAttendanceResponse<AttendanceNotificationRecord>`
- **POST** `/notifications/mark-read`
  - Body: `{ notificationIds: string[] }`
  - Response: `{ markedCount: number }`

## 22. Manager View
- **GET** `/manager-view`
  - Response: `ManagerAttendanceViewResponse`
- **POST** `/manager-view/nudge`
  - Body: `{ employeeCode: string, channel: 'InApp' | 'Email', messageNote: string }`
  - Response: `{ delivered: boolean }`

## 23. Employee View (My Attendance Insights)
- **GET** `/employee-view/me`
  - Response: `EmployeeMyAttendanceViewResponse`
