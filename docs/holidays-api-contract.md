# OFC360 HRMS — Holiday Management Module REST API Contract

**Base Path**: `${NEXT_PUBLIC_API_BASE_URL}/api/v1/holidays`
**Authentication**: `Authorization: Bearer <access_token>` (sourced from `authClient.getAccessToken()` in `lib/auth-api.ts`)
**Standard Error Envelope**:
```json
{
  "error": {
    "code": "FORBIDDEN | VALIDATION_ERROR | NOT_FOUND | CONFLICT | INTERNAL_ERROR",
    "message": "Human-readable error description",
    "details": {}
  }
}
```
**Standard Error Codes**: `400` Validation Error, `401` Unauthorized, `403` Permission Denied (RBAC), `404` Resource Not Found, `409` Conflict / Duplicate Date / Overlap Detected, `422` Business Rule Violation, `500/502/503/504` Server Error (idempotent `GET` requests automatically retry).

---

## Role-Based Access Control (RBAC) Roles
- `super_admin` (Super Admin)
- `hr_admin` (HR Admin)
- `hr_executive` (HR Executive)
- `regional_hr` (Location / Regional HR)
- `reporting_manager` (Reporting Manager)
- `employee` (Employee)

---

## 1. Holiday Dashboard (`dashboard`)
- **GET** `/api/v1/holidays/dashboard/summary`
  - **Query**: `year`, `location`, `entity`, `department`, `calendarId`
  - **Response**: `HolidayDashboardResponse` (8 KPI cards: total holidays this year, upcoming next 30 days, active calendars, optional holidays booked, pending approvals, employees without calendar, conflicts detected, long-weekend count; 4 chart series: month-wise distribution, location-wise holidays, optional utilization, holiday work/overtime trend; next holiday countdown; automation alerts; draft calendars awaiting publish)
  - **Permissions**: `super_admin`, `hr_admin`, `hr_executive`, `regional_hr`, `reporting_manager`
  - **Status**: Required from backend

## 2. Holiday Calendar Views — Year / Month / List & Side-by-Side Compare (`calendar-views`)
- **GET** `/api/v1/holidays/calendar-events`
  - **Query**: `year`, `month`, `viewMode` (`Year` | `Month` | `List`), `calendarId`, `compareCalendarId`, `type`, `search`
  - **Response**: `HolidayCalendarViewResponse` (primary calendar events, optional comparison calendar events, long-weekend spans, subscribe ICal URL)
  - **Status**: Required from backend
- **GET** `/api/v1/holidays/calendar-events/export`
  - **Query**: `format=csv|xlsx|pdf|ics`, `year`, `calendarId`
  - **Response**: Binary Blob stream (`holiday-calendar.ics` / `.csv` / `.xlsx` / `.pdf`)
  - **Status**: Required from backend

## 3. Holiday Calendar Templates (`templates`)
- **GET** `/api/v1/holidays/templates`
  - **Query**: `year`, `status` (`Draft` | `Published` | `Archived`), `location`
  - **Response**: `PaginatedHolidayResponse<HolidayCalendarTemplateRecord>`
  - **Status**: Required from backend
- **POST** `/api/v1/holidays/templates`
  - **Body**: `CreateHolidayCalendarTemplatePayload` (name, code, year, yearType, entity, countryStateLocation, effectiveFrom)
  - **Response**: `HolidayCalendarTemplateRecord`
  - **Status**: Required from backend
- **POST** `/api/v1/holidays/templates/:id/publish`
  - **Body**: `{ action: 'publish' | 'unpublish' }`
  - **Response**: `{ calendar: HolidayCalendarTemplateRecord; affectedEmployeesCount: number; validationWarnings: string[] }`
  - **Status**: Required from backend
- **POST** `/api/v1/holidays/templates/:id/clone`
  - **Body**: `{ targetYear: number }`
  - **Response**: `HolidayCalendarTemplateRecord`
  - **Status**: Required from backend

## 4. Holiday Master — Create / Edit / Bulk Import (`master`)
- **GET** `/api/v1/holidays/master`
  - **Query**: `year`, `type`, `calendarId`, `search`, `page`, `pageSize`
  - **Response**: `PaginatedHolidayResponse<HolidayMasterRecord>`
  - **Status**: Required from backend
- **POST** `/api/v1/holidays/master`
  - **Body**: `CreateHolidayMasterPayload` (name, dateOnly, type, halfDaySession, calendarIds, paid, includeInLeaveCount, recurringType, regionOrReligionTag, description)
  - **Response**: `HolidayMasterRecord`
  - **Status**: Required from backend
- **POST** `/api/v1/holidays/master/bulk-import`
  - **Body**: `FormData` (`file`: CSV/XLSX)
  - **Response**: `{ validRowsCount: number; conflictCount: number; previewId: string }`
  - **Status**: Required from backend

## 5. Calendar Assignment (`assignment`)
- **GET** `/api/v1/holidays/assignments`
  - **Query**: `scopeType` (`Entity` | `Location` | `Department` | `Grade` | `Employee`), `unassignedOnly`
  - **Response**: `PaginatedHolidayResponse<HolidayCalendarAssignmentRecord>`
  - **Status**: Required from backend
- **POST** `/api/v1/holidays/assignments`
  - **Body**: `CreateCalendarAssignmentPayload` (calendarCode, scopeType, scopeValue, priorityRank, effectiveFrom)
  - **Response**: `HolidayCalendarAssignmentRecord`
  - **Status**: Required from backend

## 6. Optional / Restricted Holidays (`optional-policy`)
- **GET** `/api/v1/holidays/optional-pools`
  - **Query**: `year`, `calendarId`
  - **Response**: `PaginatedHolidayResponse<OptionalHolidayPolicyRecord>`
  - **Status**: Required from backend
- **POST** `/api/v1/holidays/optional-pools`
  - **Body**: `CreateOptionalHolidayPolicyPayload` (calendarCode, yearlyQuotaPerEmployee, bookingWindowDaysPrior, maxDailyTeamCapacityPct, requireManagerApproval, lapseAtYearEnd)
  - **Response**: `OptionalHolidayPolicyRecord`
  - **Status**: Required from backend

## 7. Weekly Off & Working Saturday Rules (`weekly-off`)
- **GET** `/api/v1/holidays/weekly-off-rules`
  - **Query**: `location`, `shiftCode`
  - **Response**: `PaginatedHolidayResponse<WeeklyOffRuleRecord>`
  - **Status**: Required from backend
- **POST** `/api/v1/holidays/weekly-off-rules`
  - **Body**: `CreateWeeklyOffRulePayload` (name, patternType, saturdayRule, overlapHandlingRule, applicableLocationOrShift, effectiveFrom)
  - **Response**: `WeeklyOffRuleRecord`
  - **Status**: Required from backend

## 8. Special / Ad-hoc Holidays & Working Day Overrides (`special-overrides`)
- **GET** `/api/v1/holidays/special-overrides`
  - **Query**: `year`, `overrideType` (`AdHocHoliday` | `WorkingDayOverride`)
  - **Response**: `PaginatedHolidayResponse<SpecialHolidayOverrideRecord>`
  - **Status**: Required from backend
- **POST** `/api/v1/holidays/special-overrides`
  - **Body**: `CreateSpecialHolidayOverridePayload` (title, dateOnly, overrideType, reasonCategory, scopeTarget, autoSyncAttendanceLeavePayroll)
  - **Response**: `SpecialHolidayOverrideRecord`
  - **Status**: Required from backend
- **POST** `/api/v1/holidays/special-overrides/:id/rollback`
  - **Body**: `{ reason: string }`
  - **Response**: `SpecialHolidayOverrideRecord`
  - **Status**: Required from backend

## 9. Holiday Swap & Compensatory Off Rules (`swap-compoff`)
- **GET** `/api/v1/holidays/swap-compoff`
  - **Query**: `recordType` (`SwapRequest` | `CompOffCredit`), `status`
  - **Response**: `PaginatedHolidayResponse<HolidaySwapCompOffRecord>`
  - **Status**: Required from backend
- **POST** `/api/v1/holidays/swap-compoff`
  - **Body**: `CreateHolidaySwapOrCompOffPayload` (recordType, originalHolidayDate, targetSwapOrWorkedDate, reason)
  - **Response**: `HolidaySwapCompOffRecord`
  - **Status**: Required from backend

## 10. Shift-wise & Site-wise Holidays (`shift-site`)
- **GET** `/api/v1/holidays/shift-site-mappings`
  - **Query**: `shiftCategory` (`24x7_Rotational` | `ManufacturingPlant` | `RetailStore` | `ClientCalendar`)
  - **Response**: `PaginatedHolidayResponse<ShiftSiteHolidayMappingRecord>`
  - **Status**: Required from backend
- **POST** `/api/v1/holidays/shift-site-mappings`
  - **Body**: `CreateShiftSiteMappingPayload`
  - **Response**: `ShiftSiteHolidayMappingRecord`
  - **Status**: Required from backend

## 11. Holiday Work Handling — Attendance & Overtime Integration (`holiday-work`)
- **GET** `/api/v1/holidays/holiday-work-logs`
  - **Query**: `holidayDate`, `compensationMode` (`OvertimePayout` | `CompOffCredit`)
  - **Response**: `PaginatedHolidayResponse<HolidayWorkLogRecord>`
  - **Status**: Integrates with Attendance logs and Payroll variable overtime/holiday-pay inputs
- **POST** `/api/v1/holidays/holiday-work-logs/sync-payroll`
  - **Body**: `{ logIds: string[] }`
  - **Response**: `{ syncedCount: number }`
  - **Status**: Required from backend

## 12. Leave & Payroll Integration (`leave-payroll-sync`)
- **GET** `/api/v1/holidays/integrations/leave-payroll-status`
  - **Query**: `payrollCycleMonth`
  - **Response**: `LeavePayrollHolidayIntegrationResponse` (sandwich rule config, leave recalculation queue, affected leave requests, payroll cycle sync status, attendance auto-mark status)
  - **Status**: Integrates with Leave Management and `/api/v1/payroll/attendance-inputs`
- **POST** `/api/v1/holidays/integrations/retry-sync`
  - **Body**: `{ targetSystem: 'Attendance' | 'Leave' | 'Payroll' }`
  - **Response**: `{ triggered: boolean; syncBatchId: string }`
  - **Status**: Required from backend

## 13. Holiday Request & Approval — Optional Holiday Booking (`optional-booking`)
- **GET** `/api/v1/holidays/optional-bookings`
  - **Query**: `status`, `department`
  - **Response**: `PaginatedHolidayResponse<OptionalHolidayBookingRecord>`
  - **Status**: Required from backend
- **POST** `/api/v1/holidays/optional-bookings`
  - **Body**: `CreateOptionalHolidayBookingPayload` (holidayId, holidayName, dateOnly, reason)
  - **Response**: `OptionalHolidayBookingRecord`
  - **Status**: Required from backend

## 14. Approvals Workflow (`approvals`)
- **GET** `/api/v1/holidays/approvals`
  - **Query**: `approvalType` (`CalendarPublish` | `SpecialHoliday` | `WorkingDayOverride` | `OptionalBooking` | `HolidaySwap` | `CompOff`), `status`
  - **Response**: `PaginatedHolidayResponse<HolidayApprovalItem>`
  - **Status**: Required from backend
- **POST** `/api/v1/holidays/approvals/decide`
  - **Body**: `{ approvalIds: string[]; decision: 'Approved' | 'Rejected' | 'Delegated'; comments: string }`
  - **Response**: `{ processedCount: number }`
  - **Status**: Required from backend

## 15. Communication & Announcements (`communications`)
- **GET** `/api/v1/holidays/communications`
  - **Query**: `channel` (`Email` | `InApp` | `WhatsApp` | `SMS`)
  - **Response**: `PaginatedHolidayResponse<HolidayCommunicationRecord>`
  - **Status**: Required from backend
- **POST** `/api/v1/holidays/communications/broadcast`
  - **Body**: `{ templateCode: string; channel: 'Email' | 'InApp' | 'WhatsApp' | 'SMS'; targetScope: string }`
  - **Response**: `{ queuedCount: number }`
  - **Status**: Required from backend

## 16. Year Rollover & Calendar Publishing (`year-rollover`)
- **GET** `/api/v1/holidays/rollover/runs`
  - **Response**: `PaginatedHolidayResponse<HolidayYearRolloverRunRecord>`
  - **Status**: Required from backend
- **POST** `/api/v1/holidays/rollover/execute`
  - **Body**: `{ sourceYear: number; targetYear: number; carryForwardOptionalQuota: boolean; lockPublishedCalendars: boolean }`
  - **Response**: `HolidayYearRolloverRunRecord`
  - **Status**: Required from backend

## 17. Reports & Analytics (`reports`)
- **GET** `/api/v1/holidays/reports/:reportKey/run`
  - **Path `reportKey`**: `holiday-list-by-calendar`, `optional-holiday-utilization`, `employees-without-calendar`, `holiday-work-overtime`, `comp-off-balance`, `holiday-leave-overlap`, `calendar-change-history`, `long-weekend-report`, `payroll-holiday-impact`, `special-holiday-log`
  - **Response**: `HolidayReportRunResponse`
  - **Status**: Required from backend
- **GET** `/api/v1/holidays/reports/:reportKey/export`
  - **Query**: `format=csv|xlsx|pdf`
  - **Response**: Binary Blob stream
  - **Status**: Required from backend

## 18. Settings & Automation Rules (`settings`)
- **GET** `/api/v1/holidays/settings`
  - **Response**: `HolidaySettingsResponse` (default optional quota, comp-off validity days, overlap handling, 11 automation rules with last-run status, and 6 integration statuses: Attendance, Leave, Payroll, Google/Outlook Calendar, Email, WhatsApp/SMS)
  - **Status**: Required from backend
- **PUT** `/api/v1/holidays/settings/automation-rules/:ruleId`
  - **Body**: `{ enabled: boolean }`
  - **Response**: `HolidayAutomationRuleRecord`
  - **Status**: Required from backend

## 19. Audit Logs (`audit-logs`)
- **GET** `/api/v1/holidays/audit-logs`
  - **Query**: `actor`, `action`, `page`, `pageSize`
  - **Response**: `PaginatedHolidayResponse<HolidayAuditLogRecord>`
  - **Status**: Required from backend
- **GET** `/api/v1/holidays/audit-logs/export`
  - **Query**: `format=csv`
  - **Response**: Binary CSV Blob
  - **Status**: Required from backend

## 20. Notifications (`notifications`)
- **GET** `/api/v1/holidays/notifications`
  - **Query**: `unreadOnly`
  - **Response**: `PaginatedHolidayResponse<HolidayNotificationRecord>`
  - **Status**: Required from backend
- **POST** `/api/v1/holidays/notifications/mark-read`
  - **Body**: `{ notificationIds: string[] }`
  - **Response**: `{ markedCount: number }`
  - **Status**: Required from backend

## 21. Manager Portal (`manager-portal`)
- **GET** `/api/v1/holidays/manager-portal/workspace`
  - **Response**: `HolidayManagerPortalWorkspaceResponse` (team optional holiday bookings, pending approval queue, reportees working on holidays, team comp-off requests)
  - **Status**: Required from backend

## 22. Employee Portal — My Holidays (`employee-portal`)
- **GET** `/api/v1/holidays/employee-portal/me`
  - **Response**: `EmployeeHolidayPortalWorkspaceResponse` (effective calendar name, upcoming holidays, optional holiday quota & balance, comp-off balance, my optional/swap requests, personal ICS subscribe URL)
  - **Status**: Required from backend
