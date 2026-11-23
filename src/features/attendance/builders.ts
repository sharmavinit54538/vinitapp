/**
 * Pure Attendance URL Builders, Payload Builders, Validators, Error Parser & Projections
 *
 * All functions here are deterministic and decoupled from React/DOM so they
 * can be verified directly via node:test.
 */

import {
  AiShiftPlanInput,
  AttendanceApiError,
  AttendanceEmployeeSummary,
  AttendanceSettingsConfig,
  BulkRosterInput,
  CreateRosterInput,
  CreateShiftInput,
  DerivedAttendanceActions,
  EditRosterInput,
  EditShiftInput,
  FaceMeData,
  FaceStatusData,
  GpsReading,
  ManualEditInput,
  MonitorAnalysisInput,
  PaginatedItems,
  RegularizationSubmitInput,
  ROSTER_TYPES,
  RosterType,
  ShiftChangeRequestInput,
  WorkMode,
} from './types';
import {
  assertValidIdempotencyKey,
  validateBreakMultipartFile,
  validateGpsCoordinates,
} from './captureVault';

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_24H_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const WORK_MODES = new Set<WorkMode>(['office', 'remote', 'field']);
const ROSTER_TYPE_SET = new Set<string>(ROSTER_TYPES);

// Sensitive fields that must never be cached in Redux state or exposed in UI projections
const SENSITIVE_RESPONSE_KEYS = new Set([
  'image_base64',
  'face_image',
  'face_image_url',
  'private_image_url',
  'photo_url',
  'selfie_url',
  'raw_image',
  'face_embedding',
  'embedding',
  'refresh_token',
]);

// ---------------------------------------------------------------------------
// 1. URL Building (Preserves /api/v1 and /api/v2 Exactly Once)
// ---------------------------------------------------------------------------

/**
 * Strips any trailing slashes and trailing `/api`, `/api/v1`, or `/api/v2`
 * from a configured API origin so versioned URLs never duplicate prefixes.
 */
export function normalizeApiOrigin(rawOrigin?: string | null): string {
  const trimmed = (rawOrigin ?? '').trim();
  if (!trimmed) return '';
  return trimmed
    .replace(/\/+$/, '')
    .replace(/\/api(?:\/v[12])?$/i, '');
}

export function buildQueryString(
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  if (!params) return '';
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const str = typeof value === 'boolean' ? String(value) : String(value).trim();
    if (str === '') continue;
    search.set(key, str);
  }
  const encoded = search.toString();
  return encoded ? `?${encoded}` : '';
}

/**
 * Builds a canonical versioned URL preserving `/api/v1` or `/api/v2` exactly once.
 */
export function buildVersionedUrl(
  origin: string | null | undefined,
  version: 'v1' | 'v2',
  path: string,
  query?: Record<string, string | number | boolean | undefined | null>
): string {
  const cleanOrigin = normalizeApiOrigin(origin);
  const cleanedPath = path
    .trim()
    .replace(/^\/?api\/v[12](?=\/|$)/i, '')
    .replace(/^\/+/, '');
  const prefix = `/api/${version}`;
  const fullPath = cleanedPath ? `${prefix}/${cleanedPath}` : prefix;
  return `${cleanOrigin}${fullPath}${buildQueryString(query)}`;
}

/**
 * Canonical single-prefix Payroll Attendance Lock/Unlock URLs
 * (avoids redundant /api/v2/payroll/payroll/cycles/... mount).
 */
export function buildPayrollAttendanceLockUrl(
  origin: string | null | undefined,
  cycleId: string,
  action: 'lock' | 'unlock'
): string {
  const cleanCycleId = cycleId.trim();
  if (!cleanCycleId) {
    throw new Error('Payroll cycle ID is required.');
  }
  const suffix = action === 'lock' ? 'lock-attendance' : 'unlock-attendance';
  return buildVersionedUrl(
    origin,
    'v2',
    `/payroll/cycles/${encodeURIComponent(cleanCycleId)}/${suffix}`
  );
}

export function buildCalendarQueryParams(month: number, year: number): {
  month: number;
  year: number;
} {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error('Calendar month must be an integer between 1 and 12.');
  }
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error('Calendar year must be an integer between 2000 and 2100.');
  }
  return { month, year };
}

// ---------------------------------------------------------------------------
// 2. Date / Time Validators & Company Business Timezone Formatting
// ---------------------------------------------------------------------------

export function assertIsoDate(value: string, fieldLabel: string): string {
  const trimmed = value.trim();
  if (!ISO_DATE_RE.test(trimmed)) {
    throw new Error(`${fieldLabel} must be in YYYY-MM-DD format.`);
  }
  return trimmed;
}

export function assert24HourTime(value: string, fieldLabel: string): string {
  const trimmed = value.trim();
  if (!TIME_24H_RE.test(trimmed)) {
    throw new Error(`${fieldLabel} must be in 24-hour HH:MM format.`);
  }
  return trimmed;
}

export function isOvernightShiftWindow(startHHMM: string, endHHMM: string): boolean {
  const start = assert24HourTime(startHHMM, 'Start time');
  const end = assert24HourTime(endHHMM, 'End time');
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return eh * 60 + em < sh * 60 + sm;
}

export function resolveBusinessTimezone(
  faceMe?: Pick<FaceMeData, 'company_timezone' | 'timezone' | 'employee' | 'shift'> | null,
  fallback = 'UTC'
): string {
  const candidate =
    faceMe?.company_timezone ||
    faceMe?.timezone ||
    faceMe?.shift?.timezone ||
    faceMe?.employee?.timezone ||
    fallback;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: candidate });
    return candidate;
  } catch {
    return fallback;
  }
}

export function formatIsoTimestampInTimezone(
  isoString: string | null | undefined,
  timeZone: string,
  locale = 'en-US'
): string {
  if (!isoString) return '—';
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return isoString;
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone,
    }).format(parsed);
  } catch {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'UTC',
    }).format(parsed);
  }
}

export function formatDateInBusinessTimezone(
  dateInput: string | Date | null | undefined,
  timeZone: string,
  locale = 'en-US'
): string {
  if (!dateInput) return '—';
  if (typeof dateInput === 'string' && ISO_DATE_RE.test(dateInput.trim())) {
    const [y, m, d] = dateInput.trim().split('-').map(Number);
    const utcNoon = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(utcNoon);
  }
  const dt = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(dt.getTime())) return String(dateInput);
  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone,
    }).format(dt);
  } catch {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(dt);
  }
}

export function getTodayIsoDateInTimezone(timeZone: string, now = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone,
    }).formatToParts(now);
    const y = parts.find((p) => p.type === 'year')?.value;
    const m = parts.find((p) => p.type === 'month')?.value;
    const d = parts.find((p) => p.type === 'day')?.value;
    if (y && m && d) return `${y}-${m}-${d}`;
  } catch {
    // fallback below
  }
  return now.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// 3. Request Body Builders (Omitting Unused Optional Keys)
// ---------------------------------------------------------------------------

function buildNestedLocationObject(gps?: GpsReading | null): {
  latitude: number;
  longitude: number;
  accuracy?: number;
} | undefined {
  if (!gps) return undefined;
  validateGpsCoordinates(gps);
  return {
    latitude: gps.latitude,
    longitude: gps.longitude,
    ...(gps.accuracy === undefined || gps.accuracy === null
      ? {}
      : { accuracy: gps.accuracy }),
  };
}

export function buildFaceEnrollBody(input: {
  imageBase64: string;
  allowReEnroll?: boolean;
}): { image_base64: string; allow_re_enroll?: boolean } {
  const trimmed = input.imageBase64.trim();
  if (!trimmed) {
    throw new Error('A live facial image capture is required for enrollment.');
  }
  return {
    image_base64: trimmed,
    ...(input.allowReEnroll === true ? { allow_re_enroll: true } : {}),
  };
}

export function buildV1FacePunchJsonBody(input: {
  imageBase64: string;
  gps?: GpsReading | null;
  workMode?: WorkMode;
  notes?: string;
  deviceInfo?: string;
}): Record<string, unknown> {
  const trimmedImage = input.imageBase64.trim();
  if (!trimmedImage) {
    throw new Error('A fresh camera capture is required for face attendance.');
  }
  const location = buildNestedLocationObject(input.gps);
  const body: Record<string, unknown> = {
    image_base64: trimmedImage,
  };
  if (location) {
    body.location = location;
  }
  if (input.workMode) {
    if (!WORK_MODES.has(input.workMode)) {
      throw new Error('Work mode must be office, remote, or field.');
    }
    body.work_mode = input.workMode;
  }
  if (input.notes && input.notes.trim()) {
    body.notes = input.notes.trim();
  }
  if (input.deviceInfo && input.deviceInfo.trim()) {
    body.device_info = input.deviceInfo.trim();
  }
  return body;
}

export function buildV1FacePunchFormData(input: {
  file: Blob;
  filename?: string;
  gps?: GpsReading | null;
  workMode?: WorkMode;
  notes?: string;
  deviceInfo?: string;
}): FormData {
  const form = new FormData();
  form.append('file', input.file, input.filename || 'face-capture.jpg');
  if (input.gps) {
    validateGpsCoordinates(input.gps);
    form.append('latitude', String(input.gps.latitude));
    form.append('longitude', String(input.gps.longitude));
    if (input.gps.accuracy !== undefined && input.gps.accuracy !== null) {
      form.append('accuracy', String(input.gps.accuracy));
    }
  }
  if (input.workMode) {
    if (!WORK_MODES.has(input.workMode)) {
      throw new Error('Work mode must be office, remote, or field.');
    }
    form.append('work_mode', input.workMode);
  }
  if (input.notes && input.notes.trim()) {
    form.append('notes', input.notes.trim());
  }
  if (input.deviceInfo && input.deviceInfo.trim()) {
    form.append('device_info', input.deviceInfo.trim());
  }
  return form;
}

export function buildBreakCaptureJsonBody(input: {
  imageBase64: string;
  gps?: GpsReading | null;
  notes?: string;
  deviceInfo?: string;
}): Record<string, unknown> {
  const trimmedImage = input.imageBase64.trim();
  if (!trimmedImage) {
    throw new Error('A fresh camera capture is required to start or end a break.');
  }
  const location = buildNestedLocationObject(input.gps);
  const body: Record<string, unknown> = {
    image_base64: trimmedImage,
  };
  if (location) {
    body.location = location;
  }
  if (input.notes && input.notes.trim()) {
    body.notes = input.notes.trim();
  }
  if (input.deviceInfo && input.deviceInfo.trim()) {
    body.device_info = input.deviceInfo.trim();
  }
  return body;
}

export function buildBreakCaptureFormData(input: {
  file: Blob;
  filename?: string;
  mimeType?: string;
  gps?: GpsReading | null;
  notes?: string;
  deviceInfo?: string;
}): FormData {
  validateBreakMultipartFile(input.file, input.mimeType);
  const form = new FormData();
  form.append('file', input.file, input.filename || 'break-capture.jpg');
  if (input.gps) {
    validateGpsCoordinates(input.gps);
    form.append('latitude', String(input.gps.latitude));
    form.append('longitude', String(input.gps.longitude));
    if (input.gps.accuracy !== undefined && input.gps.accuracy !== null) {
      form.append('accuracy', String(input.gps.accuracy));
    }
  }
  if (input.notes && input.notes.trim()) {
    form.append('notes', input.notes.trim());
  }
  if (input.deviceInfo && input.deviceInfo.trim()) {
    form.append('device_info', input.deviceInfo.trim());
  }
  return form;
}

export function buildGeofenceVerifyBody(gps: GpsReading): {
  latitude: number;
  longitude: number;
  accuracy?: number;
} {
  validateGpsCoordinates(gps);
  return {
    latitude: gps.latitude,
    longitude: gps.longitude,
    ...(gps.accuracy === undefined || gps.accuracy === null
      ? {}
      : { accuracy: gps.accuracy }),
  };
}

export function buildV2PwaPunchRequest(input: {
  imageBase64: string;
  gps: GpsReading;
  idempotencyKey: string;
  notes?: string;
  deviceInfo?: string;
  clientCapturedAt?: string;
}): {
  headers: { 'Idempotency-Key': string };
  body: Record<string, unknown>;
} {
  const trimmedImage = input.imageBase64.trim();
  if (!trimmedImage) {
    throw new Error('A fresh non-empty face capture is required for V2 mobile punch.');
  }
  validateGpsCoordinates(input.gps);
  const validKey = assertValidIdempotencyKey(input.idempotencyKey);

  const body: Record<string, unknown> = {
    image_base64: trimmedImage,
    latitude: input.gps.latitude,
    longitude: input.gps.longitude,
  };
  if (input.gps.accuracy !== undefined && input.gps.accuracy !== null) {
    body.accuracy = input.gps.accuracy;
  }
  if (input.notes && input.notes.trim()) {
    const trimmedNotes = input.notes.trim();
    if (trimmedNotes.length > 500) {
      throw new Error('Notes cannot exceed 500 characters.');
    }
    body.notes = trimmedNotes;
  }
  if (input.deviceInfo && input.deviceInfo.trim()) {
    const trimmedDevice = input.deviceInfo.trim();
    if (trimmedDevice.length > 255) {
      throw new Error('Device info cannot exceed 255 characters.');
    }
    body.device_info = trimmedDevice;
  }
  if (input.clientCapturedAt && input.clientCapturedAt.trim()) {
    body.client_captured_at = input.clientCapturedAt.trim();
  }

  return {
    headers: { 'Idempotency-Key': validKey },
    body,
  };
}

export function buildManualEditBody(input: Omit<ManualEditInput, 'attendanceId' | 'method'>): Record<string, unknown> {
  const reason = input.auditReason.trim();
  if (!reason) {
    throw new Error('An audit reason is required to manually edit an attendance record.');
  }
  const body: Record<string, unknown> = {
    audit_reason: reason,
  };
  if (input.checkInTime && input.checkInTime.trim()) {
    body.check_in_time = input.checkInTime.trim();
  }
  if (input.checkOutTime && input.checkOutTime.trim()) {
    body.check_out_time = input.checkOutTime.trim();
  }
  if (input.status && input.status.trim()) {
    body.status = input.status.trim();
  }
  return body;
}

export function buildRegularizationBody(
  input: RegularizationSubmitInput
): Record<string, unknown> {
  const requestDate = assertIsoDate(input.requestDate, 'Request date');
  const reason = input.reason.trim();
  if (!reason) {
    throw new Error('A reason is required to submit a regularization request.');
  }
  const body: Record<string, unknown> = {
    request_date: requestDate,
    reason,
  };
  if (input.attendanceId && input.attendanceId.trim()) {
    body.attendance_id = input.attendanceId.trim();
  }
  if (input.requestedCheckIn && input.requestedCheckIn.trim()) {
    body.requested_check_in = input.requestedCheckIn.trim();
  }
  if (input.requestedCheckOut && input.requestedCheckOut.trim()) {
    body.requested_check_out = input.requestedCheckOut.trim();
  }
  return body;
}

export function buildShiftChangeRequestBody(
  input: ShiftChangeRequestInput
): Record<string, unknown> {
  const requestedShiftId = input.requestedShiftId.trim();
  if (!requestedShiftId) {
    throw new Error('Please select or enter a requested shift ID.');
  }
  const startDate = assertIsoDate(input.startDate, 'Start date');
  const reason = input.reason.trim();
  if (reason.length < 1 || reason.length > 1000) {
    throw new Error('Shift change reason must be between 1 and 1000 characters.');
  }
  const body: Record<string, unknown> = {
    requested_shift_id: requestedShiftId,
    start_date: startDate,
    reason,
  };
  if (input.endDate && input.endDate.trim()) {
    const endDate = assertIsoDate(input.endDate, 'End date');
    if (endDate < startDate) {
      throw new Error('End date must be on or after the start date.');
    }
    body.end_date = endDate;
  }
  return body;
}

export function buildCreateShiftBody(input: CreateShiftInput): {
  name: string;
  start_time: string;
  end_time: string;
} {
  const name = input.name.trim();
  if (name.length < 1 || name.length > 50) {
    throw new Error('Shift name must be between 1 and 50 characters.');
  }
  const startTime = assert24HourTime(input.startTime, 'Start time');
  const endTime = assert24HourTime(input.endTime, 'End time');
  if (startTime === endTime) {
    throw new Error('Shift start time and end time must be distinct.');
  }
  return {
    name,
    start_time: startTime,
    end_time: endTime,
  };
}

export function buildEditShiftBody(
  input: Omit<EditShiftInput, 'shiftId' | 'method'>
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.name !== undefined) {
    const name = input.name.trim();
    if (name.length < 1 || name.length > 50) {
      throw new Error('Shift name must be between 1 and 50 characters.');
    }
    body.name = name;
  }
  if (input.startTime !== undefined) {
    body.start_time = assert24HourTime(input.startTime, 'Start time');
  }
  if (input.endTime !== undefined) {
    body.end_time = assert24HourTime(input.endTime, 'End time');
  }
  if (
    typeof body.start_time === 'string' &&
    typeof body.end_time === 'string' &&
    body.start_time === body.end_time
  ) {
    throw new Error('Shift start time and end time must be distinct.');
  }
  return body;
}

function validateRosterOptionalFields(
  input: {
    shiftId?: string;
    shiftType?: RosterType;
    startTime?: string;
    endTime?: string;
    notes?: string;
  },
  target: Record<string, unknown>
): void {
  if (input.shiftId && input.shiftId.trim()) {
    target.shift_id = input.shiftId.trim();
  }
  if (input.shiftType) {
    if (!ROSTER_TYPE_SET.has(input.shiftType)) {
      throw new Error(`Unsupported roster shift_type: ${input.shiftType}`);
    }
    target.shift_type = input.shiftType;
  }
  const hasStart = Boolean(input.startTime && input.startTime.trim());
  const hasEnd = Boolean(input.endTime && input.endTime.trim());
  if (hasStart !== hasEnd) {
    throw new Error('Supply both custom start_time and end_time together, or omit both.');
  }
  if (hasStart && hasEnd) {
    target.start_time = assert24HourTime(input.startTime!, 'Custom start time');
    target.end_time = assert24HourTime(input.endTime!, 'Custom end time');
  }
  if (input.notes && input.notes.trim()) {
    target.notes = input.notes.trim();
  }
}

export function buildCreateRosterBody(
  input: CreateRosterInput
): Record<string, unknown> {
  const employeeId = input.employeeId.trim();
  if (!employeeId) {
    throw new Error('Employee ID is required for a roster entry.');
  }
  const shiftDate = assertIsoDate(input.shiftDate, 'Shift date');
  const body: Record<string, unknown> = {
    employee_id: employeeId,
    shift_date: shiftDate,
  };
  validateRosterOptionalFields(input, body);
  return body;
}

export function buildEditRosterBody(
  input: Omit<EditRosterInput, 'rosterId' | 'method'>
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.shiftDate && input.shiftDate.trim()) {
    body.shift_date = assertIsoDate(input.shiftDate, 'Shift date');
  }
  validateRosterOptionalFields(input, body);
  return body;
}

function countInclusiveDays(startDate: string, endDate: string): number {
  const [sy, sm, sd] = startDate.split('-').map(Number);
  const [ey, em, ed] = endDate.split('-').map(Number);
  const startUtc = Date.UTC(sy, sm - 1, sd);
  const endUtc = Date.UTC(ey, em - 1, ed);
  if (endUtc < startUtc) return 0;
  return Math.floor((endUtc - startUtc) / (24 * 60 * 60 * 1000)) + 1;
}

export function buildBulkRosterBody(
  input: BulkRosterInput
): Record<string, unknown> {
  const employeeIds = input.employeeIds
    .map((id) => id.trim())
    .filter(Boolean);
  if (employeeIds.length === 0) {
    throw new Error('Select at least one employee for bulk roster assignment.');
  }

  const body: Record<string, unknown> = {
    employee_ids: employeeIds,
  };

  let dateCount = 0;
  if (input.dates && input.dates.length > 0) {
    const cleanDates = input.dates.map((d) => assertIsoDate(d, 'Roster date'));
    body.dates = cleanDates;
    dateCount = cleanDates.length;
  } else if (input.startDate && input.endDate) {
    const startDate = assertIsoDate(input.startDate, 'Start date');
    const endDate = assertIsoDate(input.endDate, 'End date');
    if (endDate < startDate) {
      throw new Error('Bulk roster end date must be on or after start date.');
    }
    dateCount = countInclusiveDays(startDate, endDate);
    body.start_date = startDate;
    body.end_date = endDate;
  } else {
    throw new Error(
      'Provide either a non-empty list of dates or an inclusive start_date and end_date.'
    );
  }

  const totalCells = employeeIds.length * dateCount;
  if (totalCells > 2000) {
    throw new Error(
      `Bulk roster exceeds the 2,000 assignment limit (${employeeIds.length} employees × ${dateCount} days = ${totalCells}).`
    );
  }

  validateRosterOptionalFields(input, body);
  return body;
}

export function buildMonitorAnalysisBody(
  input: MonitorAnalysisInput
): Record<string, unknown> {
  const startDate = assertIsoDate(input.startDate, 'Start date');
  const endDate = assertIsoDate(input.endDate, 'End date');
  if (endDate < startDate) {
    throw new Error('Monitor analysis endDate must be on or after startDate.');
  }
  const body: Record<string, unknown> = {
    startDate,
    endDate,
  };
  if (input.department && input.department.trim()) {
    body.department = input.department.trim();
  }
  return body;
}

export function buildAttendanceSettingsBody(
  config: AttendanceSettingsConfig = {}
): { config: AttendanceSettingsConfig } {
  return { config };
}

export function buildAiShiftPlanBody(
  input: AiShiftPlanInput
): Record<string, unknown> {
  const companyId = input.companyId.trim();
  if (!companyId) {
    throw new Error('Authorized tenant company_id is required for AI shift planning.');
  }
  const periodStart = assertIsoDate(input.periodStart, 'Period start');
  const periodEnd = assertIsoDate(input.periodEnd, 'Period end');
  if (periodEnd < periodStart) {
    throw new Error('Period end must be on or after period start.');
  }
  const employeeIds = input.employeeIds.map((id) => id.trim()).filter(Boolean);
  if (employeeIds.length === 0) {
    throw new Error('At least one employee_id is required for AI shift planning.');
  }
  const body: Record<string, unknown> = {
    company_id: companyId,
    period_start: periodStart,
    period_end: periodEnd,
    employee_ids: employeeIds,
  };
  if (input.department && input.department.trim()) {
    body.department = input.department.trim();
  }
  if (input.planType) {
    body.plan_type = input.planType;
  }
  if (input.constraints && input.constraints.trim()) {
    body.constraints = input.constraints.trim();
  }
  if (input.model && input.model.trim()) {
    body.model = input.model.trim();
  }
  return body;
}

export function buildPayrollUnlockBody(reason: string): { reason: string } {
  const trimmed = reason.trim();
  if (trimmed.length < 2) {
    throw new Error('Unlock reason must be at least 2 characters.');
  }
  return { reason: trimmed };
}

// ---------------------------------------------------------------------------
// 4. Error Parsing & Retry-After Handling
// ---------------------------------------------------------------------------

export function parseRetryAfterHeader(
  headerValue: string | null | undefined,
  nowMs = Date.now()
): number | undefined {
  if (!headerValue) return undefined;
  const trimmed = headerValue.trim();
  if (!trimmed) return undefined;
  if (/^\d+$/.test(trimmed)) {
    const secs = Number(trimmed);
    return Number.isFinite(secs) && secs >= 0 ? secs : undefined;
  }
  const targetMs = Date.parse(trimmed);
  if (!Number.isNaN(targetMs)) {
    return Math.max(0, Math.ceil((targetMs - nowMs) / 1000));
  }
  return undefined;
}

function pushFieldError(
  map: Record<string, string[]>,
  field: string,
  msg: string
): void {
  const cleanField = field.trim() || '_general';
  if (!map[cleanField]) {
    map[cleanField] = [];
  }
  if (!map[cleanField].includes(msg)) {
    map[cleanField].push(msg);
  }
}

export function parseAttendanceApiError(
  status: number,
  payload: unknown,
  options?: {
    retryAfterHeader?: string | null;
    isNetworkError?: boolean;
    isUncertainWrite?: boolean;
  }
): AttendanceApiError {
  const fieldErrors: Record<string, string[]> = {};
  let code = status === 0 ? 'NETWORK_ERROR' : `HTTP_${status}`;
  let message =
    status === 0
      ? 'Network error while reaching the attendance service. Check your connection and try again.'
      : status === 401
      ? 'Your session has expired. Please sign in again.'
      : status === 403
      ? 'You do not have permission to perform this attendance action.'
      : status === 404
      ? 'Requested attendance resource or employee profile was not found.'
      : status === 409
      ? 'This attendance request conflicts with existing server state.'
      : status === 429
      ? 'Too many attendance requests. Please wait before retrying.'
      : `Attendance request failed (HTTP ${status}).`;

  let rawDetail: unknown;

  const isHtmlDocument = (text: string): boolean => {
    const trimmed = text.trim().toLowerCase();
    return (
      trimmed.startsWith('<!doctype') ||
      trimmed.startsWith('<html') ||
      trimmed.includes('<head>') ||
      trimmed.includes('<body>')
    );
  };

  if (typeof payload === 'string' && payload.trim()) {
    const trimmed = payload.trim();
    if (isHtmlDocument(trimmed)) {
      if (status === 404) {
        message =
          'Attendance API endpoint is not reachable on this host (HTTP 404). Configure NEXT_PUBLIC_API_URL or connect the OFC360 backend proxy.';
      } else if (status >= 500) {
        message = `Attendance service returned an unexpected server error (HTTP ${status}). Please retry shortly.`;
      }
    } else {
      message = trimmed.length > 280 ? `${trimmed.slice(0, 277)}…` : trimmed;
    }
  } else if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    const nestedError =
      obj.error && typeof obj.error === 'object'
        ? (obj.error as Record<string, unknown>)
        : null;

    if (typeof obj.code === 'string' && obj.code.trim()) {
      code = obj.code.trim();
    } else if (nestedError && typeof nestedError.code === 'string' && nestedError.code.trim()) {
      code = nestedError.code.trim();
    }

    if (typeof obj.message === 'string' && obj.message.trim()) {
      message = obj.message.trim();
    } else if (nestedError && typeof nestedError.message === 'string' && nestedError.message.trim()) {
      message = nestedError.message.trim();
    }

    // Handle errors[] array
    const errorsArray = Array.isArray(obj.errors)
      ? obj.errors
      : nestedError && Array.isArray(nestedError.errors)
      ? nestedError.errors
      : null;

    if (errorsArray) {
      const collectedMessages: string[] = [];
      for (const item of errorsArray) {
        if (typeof item === 'string' && item.trim()) {
          collectedMessages.push(item.trim());
          pushFieldError(fieldErrors, '_general', item.trim());
        } else if (item && typeof item === 'object') {
          const entry = item as Record<string, unknown>;
          const field = String(entry.field || entry.path || entry.param || '_general');
          const msg = String(entry.message || entry.msg || entry.error || '').trim();
          if (msg) {
            collectedMessages.push(msg);
            pushFieldError(fieldErrors, field, msg);
          }
        }
      }
      if (collectedMessages.length > 0 && !obj.message && !nestedError?.message) {
        message = collectedMessages[0];
      }
    }

    // Handle FastAPI / backend detail (string | object | list)
    if ('detail' in obj && obj.detail !== undefined && obj.detail !== null) {
      rawDetail = obj.detail;
      if (typeof obj.detail === 'string' && obj.detail.trim()) {
        message = obj.detail.trim();
      } else if (Array.isArray(obj.detail)) {
        const listMessages: string[] = [];
        for (const item of obj.detail) {
          if (typeof item === 'string' && item.trim()) {
            listMessages.push(item.trim());
            pushFieldError(fieldErrors, '_general', item.trim());
          } else if (item && typeof item === 'object') {
            const entry = item as Record<string, unknown>;
            const loc = Array.isArray(entry.loc)
              ? entry.loc
                  .filter((seg) => seg !== 'body' && seg !== 'query' && seg !== 'path')
                  .map(String)
                  .join('.')
              : String(entry.field || '_general');
            const msg = String(entry.msg || entry.message || '').trim();
            if (msg) {
              listMessages.push(loc && loc !== '_general' ? `${loc}: ${msg}` : msg);
              pushFieldError(fieldErrors, loc || '_general', msg);
            }
          }
        }
        if (listMessages.length > 0) {
          message = listMessages[0];
        }
      } else if (typeof obj.detail === 'object') {
        const detailObj = obj.detail as Record<string, unknown>;
        if (typeof detailObj.code === 'string' && detailObj.code.trim()) {
          code = detailObj.code.trim();
        }
        if (typeof detailObj.message === 'string' && detailObj.message.trim()) {
          message = detailObj.message.trim();
        } else if (typeof detailObj.error === 'string' && detailObj.error.trim()) {
          message = detailObj.error.trim();
        }
        if (detailObj.fields && typeof detailObj.fields === 'object') {
          for (const [k, v] of Object.entries(detailObj.fields as Record<string, unknown>)) {
            if (typeof v === 'string') pushFieldError(fieldErrors, k, v);
            else if (Array.isArray(v)) {
              v.forEach((m) => typeof m === 'string' && pushFieldError(fieldErrors, k, m));
            }
          }
        }
      }
    }
  }

  const retryAfterSeconds = parseRetryAfterHeader(options?.retryAfterHeader);

  return {
    status,
    code,
    message,
    fieldErrors,
    retryAfterSeconds,
    isNetworkError: Boolean(options?.isNetworkError) || status === 0,
    isPermissionDenied: status === 403,
    isUnauthorized: status === 401,
    isNotFound: status === 404,
    isConflict: status === 409,
    isRateLimited: status === 429,
    isUncertainWrite: Boolean(options?.isUncertainWrite),
    rawDetail,
  };
}

// ---------------------------------------------------------------------------
// 5. Response Unwrapping, PII/Biometric Projection & UI State Derivation
// ---------------------------------------------------------------------------

/**
 * Recursively strips sensitive biometric/private-URL keys before storing
 * API responses in the RTK Query cache.
 */
export function stripSensitiveResponseFields<T>(value: T): T {
  if (value === null || value === undefined || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => stripSensitiveResponseFields(item)) as unknown as T;
  }
  const input = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (SENSITIVE_RESPONSE_KEYS.has(k.toLowerCase())) {
      continue;
    }
    output[k] = stripSensitiveResponseFields(v);
  }
  return output as T;
}

export function unwrapDataEnvelope<T>(payload: unknown): T {
  const sanitized = stripSensitiveResponseFields(payload);
  if (
    sanitized &&
    typeof sanitized === 'object' &&
    'data' in (sanitized as Record<string, unknown>)
  ) {
    return (sanitized as Record<string, unknown>).data as T;
  }
  return sanitized as T;
}

export function normalizePaginatedResponse<T>(
  payload: unknown,
  fallbackPage = 1,
  fallbackLimit = 20
): PaginatedItems<T> {
  const data = unwrapDataEnvelope<unknown>(payload);
  if (Array.isArray(data)) {
    return {
      items: data as T[],
      total: data.length,
      page: fallbackPage,
      limit: fallbackLimit,
    };
  }
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const items = Array.isArray(obj.items)
      ? (obj.items as T[])
      : Array.isArray(obj.records)
      ? (obj.records as T[])
      : Array.isArray(obj.shifts)
      ? (obj.shifts as T[])
      : Array.isArray(obj.rosters)
      ? (obj.rosters as T[])
      : [];
    const total =
      typeof obj.total === 'number'
        ? obj.total
        : typeof obj.total_count === 'number'
        ? obj.total_count
        : items.length;
    const page = typeof obj.page === 'number' && obj.page >= 1 ? obj.page : fallbackPage;
    const limit = typeof obj.limit === 'number' && obj.limit >= 1 ? obj.limit : fallbackLimit;
    return { items, total, page, limit };
  }
  return { items: [], total: 0, page: fallbackPage, limit: fallbackLimit };
}

export function formatEmployeeDisplayName(
  employee: AttendanceEmployeeSummary | null | undefined
): string | null {
  if (!employee) return null;
  const first = (employee.first_name ?? '').trim();
  const last = (employee.last_name ?? '').trim();
  const combined = [first, last].filter(Boolean).join(' ').trim();
  if (combined) return combined;
  if (employee.full_name && employee.full_name.trim()) {
    return employee.full_name.trim();
  }
  if (employee.email && employee.email.trim()) {
    return employee.email.trim();
  }
  return null;
}

/**
 * Strictly derives available employee actions from backend `face-status` and
 * `/face/me` booleans (`checked_in`, `checked_out`, `is_on_break`, `current_break`).
 */
export function deriveAttendanceActionState(
  faceStatus: FaceStatusData | null | undefined,
  faceMe: FaceMeData | null | undefined
): DerivedAttendanceActions {
  const isEnrolled = Boolean(faceStatus?.is_enrolled);

  if (faceMe && faceMe.employee === null && !faceMe.checked_in && !faceMe.today_attendance) {
    return {
      flowState: 'missing_profile',
      canEnroll: false,
      canExplicitReEnroll: false,
      canCheckIn: false,
      canCheckOut: false,
      canStartBreak: false,
      canEndBreak: false,
    };
  }

  if (!isEnrolled) {
    return {
      flowState: 'not_enrolled',
      canEnroll: true,
      canExplicitReEnroll: false,
      canCheckIn: false,
      canCheckOut: false,
      canStartBreak: false,
      canEndBreak: false,
    };
  }

  const checkedIn = Boolean(faceMe?.checked_in);
  const checkedOut = Boolean(faceMe?.checked_out);
  const isOnBreak = Boolean(faceMe?.is_on_break || faceMe?.current_break);

  if (checkedOut) {
    return {
      flowState: 'checked_out',
      canEnroll: false,
      canExplicitReEnroll: true,
      canCheckIn: false,
      canCheckOut: false,
      canStartBreak: false,
      canEndBreak: false,
    };
  }

  if (checkedIn && isOnBreak) {
    return {
      flowState: 'on_break',
      canEnroll: false,
      canExplicitReEnroll: true,
      canCheckIn: false,
      canCheckOut: true,
      canStartBreak: false,
      canEndBreak: true,
    };
  }

  if (checkedIn) {
    return {
      flowState: 'checked_in',
      canEnroll: false,
      canExplicitReEnroll: true,
      canCheckIn: false,
      canCheckOut: true,
      canStartBreak: true,
      canEndBreak: false,
    };
  }

  return {
    flowState: 'no_record_today',
    canEnroll: false,
    canExplicitReEnroll: true,
    canCheckIn: true,
    canCheckOut: false,
    canStartBreak: false,
    canEndBreak: false,
  };
}

export function formatMinutesAsDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || !Number.isFinite(minutes) || minutes < 0) {
    return '—';
  }
  const rounded = Math.round(minutes);
  const hrs = Math.floor(rounded / 60);
  const mins = rounded % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}
