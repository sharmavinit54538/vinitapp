import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAiShiftPlanBody,
  buildBreakCaptureFormData,
  buildBreakCaptureJsonBody,
  buildBulkRosterBody,
  buildCalendarQueryParams,
  buildCreateRosterBody,
  buildCreateShiftBody,
  buildFaceEnrollBody,
  buildGeofenceVerifyBody,
  buildManualEditBody,
  buildMonitorAnalysisBody,
  buildPayrollAttendanceLockUrl,
  buildPayrollUnlockBody,
  buildRegularizationBody,
  buildShiftChangeRequestBody,
  buildV1FacePunchFormData,
  buildV1FacePunchJsonBody,
  buildV2PwaPunchRequest,
  buildVersionedUrl,
  deriveAttendanceActionState,
  formatEmployeeDisplayName,
  isOvernightShiftWindow,
  normalizeApiOrigin,
  normalizePaginatedResponse,
  parseAttendanceApiError,
  parseRetryAfterHeader,
  stripSensitiveResponseFields,
} from './builders';
import {
  clearTransientCaptures,
  createLogicalPunchAction,
  generateIdempotencyKey,
  getTransientCaptureCount,
  storeTransientCapture,
} from './captureVault';
import {
  configureAttendanceTransportAdapter,
  resetAttendanceTransportAdapter,
} from './transport';
import {
  attendanceApi,
  resetAttendanceSessionState,
} from './attendanceApi';
import { setHistoryDateRange, setHistoryPage } from './attendanceSlice';
import { makeHrStore } from '@/lib/store';

// ---------------------------------------------------------------------------
// 1. URL Building (Single /api/v1 & /api/v2 Preservation)
// ---------------------------------------------------------------------------

test('buildVersionedUrl preserves /api/v1 and /api/v2 exactly once and omits empty params', () => {
  assert.equal(normalizeApiOrigin('https://api.example.com/api/v1/'), 'https://api.example.com');
  assert.equal(normalizeApiOrigin('https://api.example.com/api/v2'), 'https://api.example.com');
  assert.equal(normalizeApiOrigin(''), '');

  assert.equal(
    buildVersionedUrl('https://api.example.com/api/v1', 'v1', '/attendance/face/history', {
      start_date: '2026-11-01',
      end_date: '',
      employee_id: undefined,
      page: 2,
      limit: 20,
    }),
    'https://api.example.com/api/v1/attendance/face/history?start_date=2026-11-01&page=2&limit=20'
  );

  // V2 request from a V1-suffixed origin must still use /api/v2 exactly once
  assert.equal(
    buildVersionedUrl('https://api.example.com/api/v1/', 'v2', '/api/v2/pwa/attendance/check-in'),
    'https://api.example.com/api/v2/pwa/attendance/check-in'
  );

  // Same-origin proxy
  assert.equal(
    buildVersionedUrl('', 'v1', '/attendance/calendar', buildCalendarQueryParams(11, 2026)),
    '/api/v1/attendance/calendar?month=11&year=2026'
  );

  // Canonical single-prefix payroll lock/unlock URL (never /payroll/payroll/)
  assert.equal(
    buildPayrollAttendanceLockUrl('https://api.example.com', 'cycle-uuid-1', 'lock'),
    'https://api.example.com/api/v2/payroll/cycles/cycle-uuid-1/lock-attendance'
  );
  assert.equal(
    buildPayrollAttendanceLockUrl('https://api.example.com/api/v1', 'cycle-uuid-1', 'unlock'),
    'https://api.example.com/api/v2/payroll/cycles/cycle-uuid-1/unlock-attendance'
  );
});

// ---------------------------------------------------------------------------
// 2. Payload Builders: Required vs Optional, V1 Nested vs V2 Flat, Idempotency
// ---------------------------------------------------------------------------

test('V1 JSON face punch uses nested location and omits unused optional keys', () => {
  const minimal = buildV1FacePunchJsonBody({
    imageBase64: 'data:image/jpeg;base64,TESTFRAME',
  });
  assert.deepEqual(minimal, { image_base64: 'data:image/jpeg;base64,TESTFRAME' });
  assert.equal('location' in minimal, false);
  assert.equal('notes' in minimal, false);

  const full = buildV1FacePunchJsonBody({
    imageBase64: 'data:image/jpeg;base64,TESTFRAME',
    gps: { latitude: 12.9716, longitude: 77.5946, accuracy: 18 },
    workMode: 'remote',
    notes: 'Working from client site',
  });
  assert.deepEqual(full, {
    image_base64: 'data:image/jpeg;base64,TESTFRAME',
    location: { latitude: 12.9716, longitude: 77.5946, accuracy: 18 },
    work_mode: 'remote',
    notes: 'Working from client site',
  });
});

test('V1 multipart face punch & break capture serialize flat fields and enforce break limits', () => {
  const file = new Blob(['fake-jpg-bytes'], { type: 'image/jpeg' });
  const form = buildV1FacePunchFormData({
    file,
    filename: 'selfie.jpg',
    gps: { latitude: 28.6139, longitude: 77.209, accuracy: 25 },
    workMode: 'office',
  });
  assert.equal(form.get('latitude'), '28.6139');
  assert.equal(form.get('longitude'), '77.209');
  assert.equal(form.get('accuracy'), '25');
  assert.equal(form.get('work_mode'), 'office');
  assert.equal(form.has('notes'), false);

  const breakJson = buildBreakCaptureJsonBody({
    imageBase64: 'data:image/png;base64,BREAKFRAME',
    gps: { latitude: 28.6139, longitude: 77.209 },
  });
  assert.deepEqual(breakJson, {
    image_base64: 'data:image/png;base64,BREAKFRAME',
    location: { latitude: 28.6139, longitude: 77.209 },
  });

  const breakForm = buildBreakCaptureFormData({
    file: new Blob(['png-bytes'], { type: 'image/png' }),
    mimeType: 'image/png',
    gps: { latitude: 28.6139, longitude: 77.209 },
  });
  assert.equal(breakForm.get('latitude'), '28.6139');

  // Unsupported MIME rejected
  assert.throws(
    () =>
      buildBreakCaptureFormData({
        file: new Blob(['gif'], { type: 'image/gif' }),
        mimeType: 'image/gif',
      }),
    /JPG, JPEG, PNG, or WEBP/
  );
});

test('V2 PWA punch uses flat location, client_captured_at, and per-action Idempotency-Key (8-128 chars)', () => {
  const key1 = generateIdempotencyKey('pwa_checkin');
  const key2 = generateIdempotencyKey('pwa_checkin');
  assert.notEqual(key1, key2);
  assert.ok(key1.length >= 8 && key1.length <= 128);

  const req = buildV2PwaPunchRequest({
    imageBase64: 'data:image/jpeg;base64,V2FRAME',
    gps: { latitude: 19.076, longitude: 72.8777, accuracy: 12 },
    idempotencyKey: key1,
    clientCapturedAt: '2026-11-23T09:05:00.000Z',
  });

  assert.equal(req.headers['Idempotency-Key'], key1);
  assert.deepEqual(req.body, {
    image_base64: 'data:image/jpeg;base64,V2FRAME',
    latitude: 19.076,
    longitude: 72.8777,
    accuracy: 12,
    client_captured_at: '2026-11-23T09:05:00.000Z',
  });
  assert.equal('location' in req.body, false);

  // Short Idempotency-Key rejected
  assert.throws(
    () =>
      buildV2PwaPunchRequest({
        imageBase64: 'data:image/jpeg;base64,V2FRAME',
        gps: { latitude: 19.076, longitude: 72.8777 },
        idempotencyKey: 'short',
      }),
    /8 and 128/
  );

  // Separate logical actions always get distinct keys
  const actionA = createLogicalPunchAction('check_in', {
    imageBase64: 'frameA',
    gps: { latitude: 19.076, longitude: 72.8777 },
    capturedAtIso: '2026-11-23T09:00:00Z',
  });
  const actionB = createLogicalPunchAction('check_in', {
    imageBase64: 'frameB',
    gps: { latitude: 19.076, longitude: 72.8777 },
    capturedAtIso: '2026-11-23T09:01:00Z',
  });
  assert.notEqual(actionA.idempotencyKey, actionB.idempotencyKey);
  clearTransientCaptures();
});

test('Enrollment, geofence, shifts (overnight), bulk roster (2,000 cap), regularization, monitor & unlock validators', () => {
  assert.deepEqual(buildFaceEnrollBody({ imageBase64: 'abc' }), { image_base64: 'abc' });
  assert.deepEqual(buildFaceEnrollBody({ imageBase64: 'abc', allowReEnroll: true }), {
    image_base64: 'abc',
    allow_re_enroll: true,
  });

  assert.deepEqual(buildGeofenceVerifyBody({ latitude: 12.9, longitude: 77.6 }), {
    latitude: 12.9,
    longitude: 77.6,
  });

  // Shifts: 24h HH:MM + overnight detection
  assert.deepEqual(
    buildCreateShiftBody({ name: 'Night Watch', startTime: '22:00', endTime: '06:30' }),
    { name: 'Night Watch', start_time: '22:00', end_time: '06:30' }
  );
  assert.equal(isOvernightShiftWindow('22:00', '06:30'), true);
  assert.equal(isOvernightShiftWindow('09:00', '18:00'), false);
  assert.throws(
    () => buildCreateShiftBody({ name: 'Bad', startTime: '09:00', endTime: '09:00' }),
    /distinct/
  );

  // Roster paired custom times & 2,000-cell cap
  assert.throws(
    () =>
      buildCreateRosterBody({
        employeeId: 'emp-1',
        shiftDate: '2026-11-24',
        startTime: '09:00',
      }),
    /both custom start_time and end_time/
  );

  const manyEmployees = Array.from({ length: 100 }, (_, i) => `emp-${i}`);
  assert.throws(
    () =>
      buildBulkRosterBody({
        employeeIds: manyEmployees,
        startDate: '2026-11-01',
        endDate: '2026-11-25', // 25 days * 100 = 2500 > 2000
        shiftType: 'WFH',
      }),
    /2,000/
  );

  const validBulk = buildBulkRosterBody({
    employeeIds: ['emp-1', 'emp-2'],
    startDate: '2026-11-23',
    endDate: '2026-11-25',
    shiftType: 'WEEKLY_OFF',
  });
  assert.deepEqual(validBulk, {
    employee_ids: ['emp-1', 'emp-2'],
    start_date: '2026-11-23',
    end_date: '2026-11-25',
    shift_type: 'WEEKLY_OFF',
  });

  // Regularization, manual edit, shift change, monitor camelCase, AI plan, payroll unlock
  assert.deepEqual(
    buildRegularizationBody({ requestDate: '2026-11-22', reason: 'Forgot punch' }),
    { request_date: '2026-11-22', reason: 'Forgot punch' }
  );
  assert.deepEqual(
    buildManualEditBody({ auditReason: 'Biometric device outage', status: 'present' }),
    { audit_reason: 'Biometric device outage', status: 'present' }
  );
  assert.deepEqual(
    buildShiftChangeRequestBody({
      requestedShiftId: 'shift-uuid-1',
      startDate: '2026-12-01',
      endDate: '2026-12-05',
      reason: 'Commute schedule',
    }),
    {
      requested_shift_id: 'shift-uuid-1',
      start_date: '2026-12-01',
      end_date: '2026-12-05',
      reason: 'Commute schedule',
    }
  );
  assert.deepEqual(
    buildMonitorAnalysisBody({ startDate: '2026-11-01', endDate: '2026-11-23' }),
    { startDate: '2026-11-01', endDate: '2026-11-23' }
  );
  assert.throws(
    () => buildMonitorAnalysisBody({ startDate: '2026-11-25', endDate: '2026-11-01' }),
    /on or after/
  );
  assert.deepEqual(
    buildAiShiftPlanBody({
      companyId: 'comp-uuid',
      periodStart: '2026-12-01',
      periodEnd: '2026-12-07',
      employeeIds: ['emp-1'],
      planType: 'WEEKLY',
    }),
    {
      company_id: 'comp-uuid',
      period_start: '2026-12-01',
      period_end: '2026-12-07',
      employee_ids: ['emp-1'],
      plan_type: 'WEEKLY',
    }
  );
  assert.throws(() => buildPayrollUnlockBody('a'), /at least 2/);
  assert.deepEqual(buildPayrollUnlockBody('Late correction approved'), {
    reason: 'Late correction approved',
  });
});

// ---------------------------------------------------------------------------
// 3. Error Parsing, Response Projections & Action State Derivation
// ---------------------------------------------------------------------------

test('parseAttendanceApiError normalizes 422 field errors, 403 messages, 429 Retry-After, and detail shapes', () => {
  const err422 = parseAttendanceApiError(422, {
    detail: [
      { loc: ['body', 'start_time'], msg: 'Invalid 24h time format' },
      { loc: ['body', 'name'], msg: 'Field required' },
    ],
  });
  assert.equal(err422.status, 422);
  assert.deepEqual(err422.fieldErrors['start_time'], ['Invalid 24h time format']);
  assert.deepEqual(err422.fieldErrors['name'], ['Field required']);

  const err403 = parseAttendanceApiError(403, {
    code: 'OUTSIDE_GEOFENCE',
    detail: 'Employee is outside permitted office geofence.',
  });
  assert.equal(err403.isPermissionDenied, true);
  assert.equal(err403.code, 'OUTSIDE_GEOFENCE');
  assert.equal(err403.message, 'Employee is outside permitted office geofence.');

  const err429 = parseAttendanceApiError(
    429,
    { message: 'Rate limit exceeded' },
    { retryAfterHeader: '45' }
  );
  assert.equal(err429.isRateLimited, true);
  assert.equal(err429.retryAfterSeconds, 45);
  assert.equal(parseRetryAfterHeader('120'), 120);

  // Raw HTML 404 page from proxy/CDN must never leak HTML tags into user-facing message
  const errHtml404 = parseAttendanceApiError(
    404,
    '<!DOCTYPE html><html><head><title>404</title></head><body>Not Found</body></html>'
  );
  assert.equal(errHtml404.status, 404);
  assert.equal(errHtml404.message.includes('<!DOCTYPE'), false);
  assert.equal(errHtml404.message.includes('<html'), false);
  assert.match(errHtml404.message, /HTTP 404/);
});

test('Response projection strips sensitive biometric fields & derives button states strictly from server flags', () => {
  const sanitized = stripSensitiveResponseFields({
    data: {
      id: 'att-1',
      image_base64: 'SECRET_BASE64',
      private_image_url: 'https://private.bucket/selfie.jpg',
      employee: { first_name: 'Aarav', last_name: 'Mehta' },
    },
  });
  const serialized = JSON.stringify(sanitized);
  assert.equal(serialized.includes('SECRET_BASE64'), false);
  assert.equal(serialized.includes('private.bucket'), false);
  assert.equal(formatEmployeeDisplayName({ first_name: 'Aarav', last_name: 'Mehta' }), 'Aarav Mehta');

  const paginated = normalizePaginatedResponse<{ id: string }>(
    { data: { items: [{ id: 'r1' }], total: 42, page: 2, limit: 20 } },
    2,
    20
  );
  assert.equal(paginated.total, 42);
  assert.equal(paginated.page, 2);
  assert.equal(paginated.items[0].id, 'r1');

  // Action state machine checks
  const notEnrolled = deriveAttendanceActionState(
    { is_enrolled: false, enrolled_at: null },
    {
      employee: { first_name: 'Aarav', last_name: 'Mehta' },
      shift: null,
      checked_in: false,
      checked_out: false,
      is_on_break: false,
      current_break: null,
      breaks: [],
      today_attendance: null,
    }
  );
  assert.equal(notEnrolled.flowState, 'not_enrolled');
  assert.equal(notEnrolled.canEnroll, true);
  assert.equal(notEnrolled.canCheckIn, false);

  const onBreak = deriveAttendanceActionState(
    { is_enrolled: true, enrolled_at: '2026-11-01T00:00:00Z' },
    {
      employee: { first_name: 'Aarav', last_name: 'Mehta' },
      shift: null,
      checked_in: true,
      checked_out: false,
      is_on_break: true,
      current_break: { id: 'brk-1', start_time: '2026-11-23T13:00:00Z', end_time: null },
      breaks: [],
      today_attendance: { id: 'att-1', check_in_time: '2026-11-23T09:00:00Z' },
    }
  );
  assert.equal(onBreak.flowState, 'on_break');
  assert.equal(onBreak.canEndBreak, true);
  assert.equal(onBreak.canStartBreak, false);
  assert.equal(onBreak.canCheckOut, true);
});

// ---------------------------------------------------------------------------
// 4. Redux Toolkit Store Integration: Coalesced 401 Refresh, Biometric Hygiene,
//    Mutation Tag Invalidation & Logout/Tenant Cache Reset
// ---------------------------------------------------------------------------

test('Coalesced 401 refresh retries safe reads only, never blindly retries mutations, and preserves 403', async () => {
  let token: string | null = 'expired-token';
  let refreshCount = 0;
  let faceMeCalls = 0;
  let postCalls = 0;

  configureAttendanceTransportAdapter({
    getOrigin: () => 'https://api.test.local',
    getAccessToken: () => token,
    refreshAccessToken: async () => {
      refreshCount += 1;
      await new Promise((r) => setTimeout(r, 10));
      token = 'fresh-token';
      return token;
    },
    fetchImpl: async (input, init) => {
      const url = String(input);
      const authHeader = (init?.headers as Record<string, string>)?.Authorization;
      if (url.endsWith('/face/me')) {
        faceMeCalls += 1;
        if (authHeader === 'Bearer expired-token') {
          return new Response(JSON.stringify({ detail: 'Token expired' }), {
            status: 401,
            headers: { 'content-type': 'application/json' },
          });
        }
        return new Response(
          JSON.stringify({
            data: {
              employee: { first_name: 'Priya', last_name: 'Sharma' },
              shift: null,
              checked_in: false,
              checked_out: false,
              is_on_break: false,
              current_break: null,
              breaks: [],
              today_attendance: null,
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );
      }
      if (url.endsWith('/face-status')) {
        if (authHeader === 'Bearer expired-token') {
          return new Response(JSON.stringify({ detail: 'Token expired' }), {
            status: 401,
            headers: { 'content-type': 'application/json' },
          });
        }
        return new Response(
          JSON.stringify({ data: { is_enrolled: true, enrolled_at: '2026-11-01T00:00:00Z' } }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );
      }
      if (new URL(url).pathname.endsWith('/face/company')) {
        return new Response(
          JSON.stringify({ detail: 'Admin role required for company attendance' }),
          { status: 403, headers: { 'content-type': 'application/json' } }
        );
      }
      if (url.endsWith('/regularization') && init?.method === 'POST') {
        postCalls += 1;
        return new Response(JSON.stringify({ detail: 'Token expired' }), {
          status: 401,
          headers: { 'content-type': 'application/json' },
        });
      }
      return new Response('{}', { status: 404 });
    },
  });

  try {
    const store = makeHrStore();
    // Fire two parallel GETs with expired token -> must coalesce to ONE refresh
    const [statusRes, meRes] = await Promise.all([
      store.dispatch(attendanceApi.endpoints.getFaceStatus.initiate({ scopeKey: 't1:u1' })),
      store.dispatch(attendanceApi.endpoints.getFaceMe.initiate({ scopeKey: 't1:u1' })),
    ]);

    assert.equal(refreshCount, 1);
    assert.equal(faceMeCalls, 2);
    assert.equal(statusRes.data?.is_enrolled, true);
    assert.equal(meRes.data?.employee?.first_name, 'Priya');

    // 403 must NOT refresh and must preserve exact server message
    const companyRes = await store.dispatch(
      attendanceApi.endpoints.getFaceCompany.initiate({ scopeKey: 't1:u1', page: 1, limit: 20 })
    );
    assert.equal(refreshCount, 1);
    assert.equal(companyRes.isError, true);
    assert.equal(
      (companyRes.error as { message?: string })?.message,
      'Admin role required for company attendance'
    );

    // Uncertain POST returning 401 must NOT blindly replay mutation
    token = 'expired-again';
    const postRes = await store.dispatch(
      attendanceApi.endpoints.submitRegularization.initiate({
        requestDate: '2026-11-22',
        reason: 'Missed punch',
      })
    );
    assert.equal(postCalls, 1);
    assert.equal('error' in postRes, true);
    assert.equal((postRes as { error: { isUncertainWrite: boolean } }).error.isUncertainWrite, true);
  } finally {
    resetAttendanceTransportAdapter();
  }
});

test('Biometric hygiene, mutation tag invalidation, and session cache reset on logout/tenant switch', async () => {
  let enrolled = false;
  let checkedIn = false;
  let faceMeFetchCount = 0;
  let faceStatusFetchCount = 0;
  const capturedBodies: Array<{ url: string; body: unknown }> = [];

  configureAttendanceTransportAdapter({
    getOrigin: () => 'https://api.test.local',
    getAccessToken: () => 'valid-token',
    refreshAccessToken: async () => null,
    fetchImpl: async (input, init) => {
      const url = String(input);
      if (url.endsWith('/face-status')) {
        faceStatusFetchCount += 1;
        return new Response(
          JSON.stringify({
            data: { is_enrolled: enrolled, enrolled_at: enrolled ? '2026-11-23T08:00:00Z' : null },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );
      }
      if (url.endsWith('/face/me')) {
        faceMeFetchCount += 1;
        return new Response(
          JSON.stringify({
            data: {
              employee: { first_name: 'Neha', last_name: 'Kapoor' },
              shift: null,
              checked_in: checkedIn,
              checked_out: false,
              is_on_break: false,
              current_break: null,
              breaks: [],
              today_attendance: checkedIn
                ? { id: 'att-99', check_in_time: '2026-11-23T09:00:00Z', status: 'present' }
                : null,
            },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );
      }
      if (url.endsWith('/face-enroll') && init?.method === 'POST') {
        enrolled = true;
        capturedBodies.push({ url, body: JSON.parse(String(init.body)) });
        return new Response(
          JSON.stringify({ data: { is_enrolled: true, action: 'enrolled' } }),
          { status: 200, headers: { 'content-type': 'application/json' } }
        );
      }
      if (url.endsWith('/face/check-in') && init?.method === 'POST') {
        checkedIn = true;
        capturedBodies.push({ url, body: JSON.parse(String(init.body)) });
        return new Response(
          JSON.stringify({ data: { id: 'att-99', status: 'present' } }),
          { status: 201, headers: { 'content-type': 'application/json' } }
        );
      }
      return new Response('{}', { status: 404 });
    },
  });

  try {
    const store = makeHrStore();
    const statusSub = store.dispatch(
      attendanceApi.endpoints.getFaceStatus.initiate({ scopeKey: 'tenantA:emp1' })
    );
    const meSub = store.dispatch(
      attendanceApi.endpoints.getFaceMe.initiate({ scopeKey: 'tenantA:emp1' })
    );
    await Promise.all([statusSub, meSub]);
    assert.equal(faceStatusFetchCount, 1);
    assert.equal(faceMeFetchCount, 1);

    // Stage transient capture -> pass only opaque captureId to Redux mutation
    const secretBase64 = 'data:image/jpeg;base64,SENSITIVE_FACE_BYTES_12345';
    const enrollCaptureId = storeTransientCapture({
      imageBase64: secretBase64,
      capturedAtIso: '2026-11-23T08:00:00Z',
    });
    await store.dispatch(
      attendanceApi.endpoints.enrollFace.initiate({ captureId: enrollCaptureId })
    );

    // Wait briefly for RTK Query invalidation refetch
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(faceStatusFetchCount, 2);
    assert.equal(faceMeFetchCount, 2);
    assert.equal(getTransientCaptureCount(), 0); // vault entry released in finally

    // Check-in with transient GPS + base64
    const punchCaptureId = storeTransientCapture({
      imageBase64: secretBase64,
      gps: { latitude: 12.9715987, longitude: 77.5945627, accuracy: 15 },
      capturedAtIso: '2026-11-23T09:00:00Z',
    });
    await store.dispatch(
      attendanceApi.endpoints.faceCheckIn.initiate({
        captureId: punchCaptureId,
        workMode: 'office',
      })
    );
    await new Promise((r) => setTimeout(r, 20));
    assert.equal(faceMeFetchCount, 3);
    assert.equal(getTransientCaptureCount(), 0);

    // Verify raw base64 and precise GPS coordinates NEVER entered Redux state
    const serializedState = JSON.stringify(store.getState());
    assert.equal(serializedState.includes('SENSITIVE_FACE_BYTES_12345'), false);
    assert.equal(serializedState.includes('12.9715987'), false);
    assert.equal(serializedState.includes('77.5945627'), false);

    // Verify actual HTTP body DID send nested location + image_base64
    const checkInReq = capturedBodies.find((c) => c.url.endsWith('/face/check-in'));
    assert.ok(checkInReq);
    assert.deepEqual((checkInReq.body as Record<string, unknown>).location, {
      latitude: 12.9715987,
      longitude: 77.5945627,
      accuracy: 15,
    });

    // Filter change resets pagination to page 1
    store.dispatch(setHistoryPage(4));
    assert.equal(store.getState().attendanceUi.page, 4);
    store.dispatch(setHistoryDateRange({ startDate: '2026-11-01', endDate: '2026-11-23' }));
    assert.equal(store.getState().attendanceUi.page, 1);

    // Session/tenant/logout reset clears RTK Query cache + UI state + transient vault
    storeTransientCapture({
      imageBase64: 'stray-capture',
      capturedAtIso: '2026-11-23T09:05:00Z',
    });
    statusSub.unsubscribe();
    meSub.unsubscribe();
    resetAttendanceSessionState(store.dispatch);

    assert.equal(Object.keys(store.getState().attendanceApi.queries).length, 0);
    assert.equal(store.getState().attendanceUi.startDate, '');
    assert.equal(getTransientCaptureCount(), 0);
  } finally {
    clearTransientCaptures();
    resetAttendanceTransportAdapter();
  }
});
