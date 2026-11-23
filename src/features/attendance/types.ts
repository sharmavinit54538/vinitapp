/**
 * OFC360 Attendance API Types & Domain Contracts
 * Aligned with backend contract: 54 /api/v1/attendance routes,
 * 12 attendance-monitoring routes, and canonical related V1/V2 routes.
 */

export type WorkMode = 'office' | 'remote' | 'field';

export const ROSTER_TYPES = [
  'DAY',
  'NIGHT',
  'MORNING',
  'EVENING',
  'OVERTIME',
  'ROTATION',
  'HOLIDAY',
  'OFF',
  'WEEKLY_OFF',
  'LEAVE',
  'TRAINING',
  'WFH',
] as const;

export type RosterType = (typeof ROSTER_TYPES)[number];

export type AiShiftPlanType = 'WEEKLY' | 'MONTHLY' | 'ROTATION' | 'HOLIDAY';

export type AttendanceExportFormat = 'csv' | 'xlsx';

export interface AttendanceScopeContext {
  /** Combined tenant + user scope identifier to isolate RTK Query cache entries */
  scopeKey?: string;
}

export interface ApiSuccessEnvelope<T> {
  success?: boolean;
  message?: string;
  data: T;
}

export interface PaginatedItems<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AttendanceApiError {
  status: number;
  code: string;
  message: string;
  fieldErrors: Record<string, string[]>;
  retryAfterSeconds?: number;
  isNetworkError: boolean;
  isPermissionDenied: boolean;
  isUnauthorized: boolean;
  isNotFound: boolean;
  isConflict: boolean;
  isRateLimited: boolean;
  isUncertainWrite: boolean;
  rawDetail?: unknown;
}

export interface GpsReading {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
}

// ---------------------------------------------------------------------------
// Face Enrollment & Today's Employee State
// ---------------------------------------------------------------------------

export interface FaceStatusData {
  is_enrolled: boolean;
  enrolled_at: string | null;
  enrollment_status?: string | null;
  employee_id?: string | null;
}

export interface FaceEnrollResult {
  enrolled?: boolean;
  is_enrolled?: boolean;
  action?: string | null;
  enrolled_at?: string | null;
  message?: string | null;
}

export interface AttendanceEmployeeSummary {
  id?: string | null;
  employee_code?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  email?: string | null;
  department?: string | null;
  designation?: string | null;
  branch?: string | null;
  timezone?: string | null;
}

export interface AttendanceShiftSummary {
  id?: string | null;
  name?: string | null;
  code?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  is_overnight?: boolean | null;
  timezone?: string | null;
}

export interface AttendanceBreakRecord {
  id: string;
  start_time: string | null;
  end_time: string | null;
  duration_minutes?: number | null;
  status?: string | null;
  notes?: string | null;
}

export interface TodayAttendanceRecord {
  id?: string | null;
  date?: string | null;
  attendance_date?: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  status?: string | null;
  work_mode?: WorkMode | string | null;
  worked_minutes?: number | null;
  work_duration_minutes?: number | null;
  total_hours?: number | string | null;
  break_minutes?: number | null;
  total_break_minutes?: number | null;
  geofence_status?: string | null;
  location_label?: string | null;
  notes?: string | null;
  is_overnight?: boolean | null;
}

export interface FaceMeData {
  employee: AttendanceEmployeeSummary | null;
  shift: AttendanceShiftSummary | null;
  checked_in: boolean;
  checked_out: boolean;
  is_on_break: boolean;
  current_break: AttendanceBreakRecord | null;
  breaks: AttendanceBreakRecord[];
  today_attendance: TodayAttendanceRecord | null;
  company_timezone?: string | null;
  timezone?: string | null;
  server_time?: string | null;
  date?: string | null;
}

export interface FacePunchResult {
  id: string;
  status?: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  work_mode?: string | null;
  geofence_status?: string | null;
  message?: string | null;
  worked_minutes?: number | null;
}

export interface V2PwaPunchResult {
  attendance_id: string;
  idempotent_replay: boolean;
  status?: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  message?: string | null;
}

export interface BreakStartResult {
  id: string;
  start_time: string | null;
  status: string | null;
  message?: string | null;
}

export interface BreakEndResult {
  id: string;
  end_time: string | null;
  duration_minutes: number | null;
  status?: string | null;
  message?: string | null;
}

export interface GeofenceVerifyResult {
  inside_geofence: boolean;
  status: string;
  message: string;
  distance_meters?: number | null;
  branch_name?: string | null;
}

// ---------------------------------------------------------------------------
// History, Team, Company, Core Records & Calendar
// ---------------------------------------------------------------------------

export interface AttendanceHistoryRecord {
  id: string;
  employee_id?: string | null;
  employee_code?: string | null;
  employee_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  department?: string | null;
  branch?: string | null;
  date?: string | null;
  attendance_date?: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  status?: string | null;
  work_mode?: string | null;
  worked_minutes?: number | null;
  total_hours?: number | string | null;
  break_minutes?: number | null;
  geofence_status?: string | null;
  notes?: string | null;
  shift_name?: string | null;
}

export interface FaceHistoryQueryParams extends AttendanceScopeContext {
  start_date?: string;
  end_date?: string;
  /** Privileged filter only; omit for employee personal history */
  employee_id?: string;
  page?: number;
  limit?: number;
}

export interface FaceTeamQueryParams extends AttendanceScopeContext {
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface FaceCompanyQueryParams extends AttendanceScopeContext {
  branch?: string;
  department?: string;
  employee_id?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface CoreDateRangePageParams extends AttendanceScopeContext {
  from_date?: string;
  to_date?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginationOnlyParams extends AttendanceScopeContext {
  page?: number;
  limit?: number;
}

export interface CoreAttendanceStatusData {
  checked_in: boolean;
  checked_out: boolean;
  check_in_time?: string | null;
  check_out_time?: string | null;
  status?: string | null;
}

export interface FaceAnalyticsKpis {
  total_employees?: number;
  present_count?: number;
  absent_count?: number;
  late_count?: number;
  on_leave_count?: number;
  on_break_count?: number;
  attendance_rate?: number;
  enrolled_count?: number;
  [key: string]: unknown;
}

export interface AttendanceDistributionParams extends AttendanceScopeContext {
  start_date?: string;
  end_date?: string;
  view_mode?: 'week' | 'month';
}

export interface AttendanceDistributionData {
  view_mode?: string;
  start_date?: string;
  end_date?: string;
  buckets?: Array<Record<string, unknown>>;
  distribution?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface AttendanceSummaryData {
  target_date?: string | null;
  total_employees?: number;
  present?: number;
  absent?: number;
  late?: number;
  on_leave?: number;
  attendance_rate?: number;
  [key: string]: unknown;
}

export interface AttendanceTrendsData {
  from_date?: string;
  to_date?: string;
  trends: Array<Record<string, unknown>>;
}

export interface AttendanceRateData {
  from_date?: string;
  to_date?: string;
  attendance_rate: number | null;
  [key: string]: unknown;
}

export interface AttendanceWeeklyData {
  weeks: number;
  weekly: Array<Record<string, unknown>>;
}

export interface AttendanceCalendarParams extends AttendanceScopeContext {
  month: number;
  year: number;
}

export interface AttendanceCalendarData {
  month: number;
  year: number;
  calendar?: Array<Record<string, unknown>>;
  days?: Array<Record<string, unknown>>;
  calendar_summary?: Record<string, unknown> | null;
}

// ---------------------------------------------------------------------------
// Manual Edit & Regularization
// ---------------------------------------------------------------------------

export interface ManualEditInput {
  attendanceId: string;
  auditReason: string;
  checkInTime?: string;
  checkOutTime?: string;
  status?: string;
  method?: 'PUT' | 'PATCH';
}

export interface ManualEditReceipt {
  id: string;
  updated?: boolean;
  notes?: string | null;
  status?: string | null;
  message?: string | null;
}

export interface DeletionReceipt {
  id?: string;
  deleted?: boolean;
  message?: string | null;
}

export interface RegularizationRecord {
  id: string;
  employee_id?: string | null;
  employee_name?: string | null;
  attendance_id?: string | null;
  request_date: string;
  requested_check_in?: string | null;
  requested_check_out?: string | null;
  reason: string;
  status: string;
  created_at?: string | null;
}

export interface RegularizationSubmitInput {
  requestDate: string;
  reason: string;
  attendanceId?: string;
  requestedCheckIn?: string;
  requestedCheckOut?: string;
}

export interface RegularizationSubmitResult {
  id: string;
  status: string;
  message?: string | null;
}

// ---------------------------------------------------------------------------
// Shifts, My Schedule, Shift Change & Rosters
// ---------------------------------------------------------------------------

export interface ShiftRecord {
  id: string;
  name: string;
  code?: string | null;
  start_time: string;
  end_time: string;
  is_overnight?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ShiftOption {
  id: string;
  name: string;
  code?: string | null;
  start_time?: string | null;
  end_time?: string | null;
}

export interface ShiftOptionsData {
  options: ShiftOption[];
}

export interface ShiftsListQueryParams extends AttendanceScopeContext {
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateShiftInput {
  name: string;
  startTime: string;
  endTime: string;
}

export interface EditShiftInput {
  shiftId: string;
  name?: string;
  startTime?: string;
  endTime?: string;
  method?: 'PUT' | 'PATCH';
}

export interface MyScheduleQueryParams extends AttendanceScopeContext {
  start_date?: string;
  end_date?: string;
}

export interface MyScheduleEntry {
  date: string;
  shift_id?: string | null;
  shift_name?: string | null;
  shift_type?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  notes?: string | null;
}

export interface MyScheduleData {
  employee_name?: string | null;
  current_shift?: ShiftRecord | null;
  schedule: MyScheduleEntry[];
}

export interface ShiftChangeRequestInput {
  requestedShiftId: string;
  startDate: string;
  endDate?: string;
  reason: string;
}

export interface ShiftChangeRequestResult {
  id?: string;
  requested_shift_id?: string;
  start_date: string;
  end_date?: string | null;
  status: string;
  message?: string | null;
}

export interface RosterRecord {
  id: string;
  employee_id: string;
  employee_name?: string | null;
  department?: string | null;
  shift_date: string;
  shift_id?: string | null;
  shift_name?: string | null;
  shift_type?: RosterType | string | null;
  start_time?: string | null;
  end_time?: string | null;
  notes?: string | null;
}

export interface RostersListQueryParams extends AttendanceScopeContext {
  start_date?: string;
  end_date?: string;
  employee_id?: string;
  department?: string;
  shift_type?: RosterType | string;
  page?: number;
  limit?: number;
}

export interface CreateRosterInput {
  employeeId: string;
  shiftDate: string;
  shiftId?: string;
  shiftType?: RosterType;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface BulkRosterInput {
  employeeIds: string[];
  dates?: string[];
  startDate?: string;
  endDate?: string;
  shiftId?: string;
  shiftType?: RosterType;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface BulkRosterResult {
  created: number;
  updated: number;
  total: number;
  message?: string | null;
}

export interface EditRosterInput {
  rosterId: string;
  shiftDate?: string;
  shiftId?: string;
  shiftType?: RosterType;
  startTime?: string;
  endTime?: string;
  notes?: string;
  method?: 'PUT' | 'PATCH';
}

// ---------------------------------------------------------------------------
// Attendance Monitoring (12 routes)
// ---------------------------------------------------------------------------

export interface AiAttendanceFilterParams extends AttendanceScopeContext {
  department_id?: string;
  start_date?: string;
  end_date?: string;
  group_by?: string;
}

export interface AiHubMonitorAnomaliesParams extends AttendanceScopeContext {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface MonitorAnalysisInput {
  startDate: string;
  endDate: string;
  department?: string;
}

// ---------------------------------------------------------------------------
// Related Canonical Routes (Settings, AI Shift Plans, Payroll Lock/Unlock)
// ---------------------------------------------------------------------------

export interface AttendanceSettingsConfig {
  working_days?: string[];
  office_timing?: Record<string, unknown> | string;
  timezone?: string;
  currency?: string;
  [key: string]: unknown;
}

export interface AttendanceSettingsData {
  config?: AttendanceSettingsConfig;
  working_days?: string[];
  office_timing?: Record<string, unknown> | string;
  timezone?: string;
  currency?: string;
  [key: string]: unknown;
}

export interface AiShiftPlanInput {
  companyId: string;
  periodStart: string;
  periodEnd: string;
  employeeIds: string[];
  department?: string;
  planType?: AiShiftPlanType;
  constraints?: string;
  model?: string;
}

export interface AiShiftPlanResult {
  plan_id: string;
  entries_count: number;
  ai_notes?: string | null;
}

export interface PayrollAttendanceLockResult {
  cycle_id?: string;
  locked?: boolean;
  status?: string | null;
  message?: string | null;
}

export interface PayrollAttendanceUnlockInput {
  cycleId: string;
  reason: string;
}

// ---------------------------------------------------------------------------
// Derived Employee UI State
// ---------------------------------------------------------------------------

export type EmployeeAttendanceFlowState =
  | 'missing_profile'
  | 'not_enrolled'
  | 'no_record_today'
  | 'checked_in'
  | 'on_break'
  | 'checked_out';

export interface DerivedAttendanceActions {
  flowState: EmployeeAttendanceFlowState;
  canEnroll: boolean;
  canExplicitReEnroll: boolean;
  canCheckIn: boolean;
  canCheckOut: boolean;
  canStartBreak: boolean;
  canEndBreak: boolean;
}
