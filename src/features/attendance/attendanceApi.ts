/**
 * OFC360 Attendance RTK Query API (`attendanceApi`)
 *
 * Implements typed endpoints for:
 * - All 54 /api/v1/attendance method/path pairs (Face, Shifts, Rosters, Core, Analytics, Regularization)
 * - All 12 Attendance Monitoring operations (/api/v1/ai/attendance/* and /api/v1/ai-hub/attendance-monitor*)
 * - Canonical related routes: Settings, AI Insights, V1 Analytics, V2 PWA Check-In/Out,
 *   V2 AI Shift Plans, and canonical single-prefix V2 Payroll Attendance Lock/Unlock.
 * - Excludes static `/api/v1/reports/attendance` and no-op `/api/v1/reports/export` from live UI.
 *
 * Biometric & PII Hygiene:
 * - All face/break upload mutations accept ONLY an opaque `captureId` and consume/release
 *   raw image bytes & precise coordinates inside `queryFn` with `finally` cleanup.
 */

import { createApi } from '@reduxjs/toolkit/query/react';
import {
  attendanceBaseQuery,
  downloadAuthenticatedAttendanceFile,
  executeAttendanceRequest,
} from './transport';
import {
  consumeTransientCapture,
  clearTransientCaptures,
  peekTransientCapture,
  releaseTransientCapture,
} from './captureVault';
import {
  buildAiShiftPlanBody,
  buildAttendanceSettingsBody,
  buildBreakCaptureFormData,
  buildBreakCaptureJsonBody,
  buildBulkRosterBody,
  buildCalendarQueryParams,
  buildCreateRosterBody,
  buildCreateShiftBody,
  buildEditRosterBody,
  buildEditShiftBody,
  buildFaceEnrollBody,
  buildGeofenceVerifyBody,
  buildManualEditBody,
  buildMonitorAnalysisBody,
  buildPayrollUnlockBody,
  buildRegularizationBody,
  buildShiftChangeRequestBody,
  buildV1FacePunchFormData,
  buildV1FacePunchJsonBody,
  buildV2PwaPunchRequest,
  normalizePaginatedResponse,
  parseAttendanceApiError,
  unwrapDataEnvelope,
} from './builders';
import { resetAttendanceUi } from './attendanceSlice';
import type {
  AiAttendanceFilterParams,
  AiHubMonitorAnomaliesParams,
  AiShiftPlanInput,
  AiShiftPlanResult,
  AttendanceApiError,
  AttendanceCalendarData,
  AttendanceCalendarParams,
  AttendanceDistributionData,
  AttendanceDistributionParams,
  AttendanceExportFormat,
  AttendanceHistoryRecord,
  AttendanceRateData,
  AttendanceScopeContext,
  AttendanceSettingsConfig,
  AttendanceSettingsData,
  AttendanceSummaryData,
  AttendanceTrendsData,
  AttendanceWeeklyData,
  BreakEndResult,
  BreakStartResult,
  BulkRosterInput,
  BulkRosterResult,
  CoreAttendanceStatusData,
  CoreDateRangePageParams,
  CreateRosterInput,
  CreateShiftInput,
  DeletionReceipt,
  EditRosterInput,
  EditShiftInput,
  FaceAnalyticsKpis,
  FaceCompanyQueryParams,
  FaceEnrollResult,
  FaceHistoryQueryParams,
  FaceMeData,
  FacePunchResult,
  FaceStatusData,
  FaceTeamQueryParams,
  GeofenceVerifyResult,
  GpsReading,
  ManualEditInput,
  ManualEditReceipt,
  MonitorAnalysisInput,
  MyScheduleData,
  MyScheduleQueryParams,
  PaginatedItems,
  PaginationOnlyParams,
  PayrollAttendanceLockResult,
  PayrollAttendanceUnlockInput,
  RegularizationRecord,
  RegularizationSubmitInput,
  RegularizationSubmitResult,
  RosterRecord,
  RostersListQueryParams,
  ShiftChangeRequestInput,
  ShiftChangeRequestResult,
  ShiftOptionsData,
  ShiftRecord,
  ShiftsListQueryParams,
  V2PwaPunchResult,
  WorkMode,
} from './types';

export const ATTENDANCE_TAG_TYPES = [
  'FaceEnrollment',
  'AttendanceToday',
  'AttendanceHistory',
  'AttendanceTeam',
  'AttendanceCompany',
  'AttendanceSummary',
  'Regularization',
  'Shifts',
  'Rosters',
  'MySchedule',
  'AttendanceMonitor',
  'AttendanceSettings',
] as const;

export interface FaceEnrollMutationArg {
  /** Opaque ID referencing the live capture in captureVault (never raw base64) */
  captureId: string;
  allowReEnroll?: boolean;
}

export interface V1FacePunchMutationArg {
  captureId: string;
  transport?: 'json' | 'multipart';
  workMode?: WorkMode;
  notes?: string;
  deviceInfo?: string;
  /** Optional Idempotency-Key header read by V1 face/check-in */
  idempotencyKey?: string;
}

export interface BreakCaptureMutationArg {
  captureId: string;
  transport?: 'json' | 'multipart';
  notes?: string;
  deviceInfo?: string;
}

export interface V2PwaPunchMutationArg {
  captureId: string;
  idempotencyKey: string;
  notes?: string;
  deviceInfo?: string;
  /** When true, keeps capture in vault to allow exact logical replay if response is lost */
  preserveForReplay?: boolean;
}

export interface CoreCheckInArg {
  captureId?: string;
  gps?: GpsReading | null;
  ipAddress?: string;
  deviceInfo?: string;
  notes?: string;
}

export interface CoreCheckOutArg {
  gps?: GpsReading | null;
  ipAddress?: string;
  deviceInfo?: string;
  notes?: string;
}

function makeClientValidationError(err: unknown): AttendanceApiError {
  return parseAttendanceApiError(
    422,
    err instanceof Error ? err.message : 'Invalid attendance request payload.'
  );
}

export const attendanceApi = createApi({
  reducerPath: 'attendanceApi',
  baseQuery: attendanceBaseQuery,
  tagTypes: ATTENDANCE_TAG_TYPES,
  endpoints: (builder) => ({
    // =========================================================================
    // A. FACE ATTENDANCE, SHIFTS & ROSTERS (/api/v1/attendance/...)
    // =========================================================================

    // 1. GET /api/v1/attendance/face-status
    getFaceStatus: builder.query<FaceStatusData, AttendanceScopeContext | void>({
      query: () => ({
        version: 'v1',
        path: '/attendance/face-status',
        method: 'GET',
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<FaceStatusData>(raw),
      providesTags: ['FaceEnrollment'],
    }),

    // 2. POST /api/v1/attendance/face-enroll (JSON only, transient capture)
    enrollFace: builder.mutation<FaceEnrollResult, FaceEnrollMutationArg>({
      async queryFn(arg) {
        try {
          const capture = consumeTransientCapture(arg.captureId);
          if (!capture?.imageBase64) {
            return {
              error: makeClientValidationError(
                new Error('Fresh camera capture expired or missing. Please capture again.')
              ),
            };
          }
          const body = buildFaceEnrollBody({
            imageBase64: capture.imageBase64,
            allowReEnroll: arg.allowReEnroll,
          });
          const res = await executeAttendanceRequest<unknown>({
            version: 'v1',
            path: '/attendance/face-enroll',
            method: 'POST',
            body,
          });
          if ('error' in res) return { error: res.error };
          return { data: unwrapDataEnvelope<FaceEnrollResult>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        } finally {
          releaseTransientCapture(arg.captureId);
        }
      },
      invalidatesTags: ['FaceEnrollment', 'AttendanceToday'],
    }),

    // 3. POST /api/v1/attendance/face/check-in (JSON or multipart, optional Idempotency-Key)
    faceCheckIn: builder.mutation<FacePunchResult, V1FacePunchMutationArg>({
      async queryFn(arg) {
        try {
          const capture = consumeTransientCapture(arg.captureId);
          if (!capture) {
            return {
              error: makeClientValidationError(
                new Error('Fresh camera capture expired or missing. Please capture again.')
              ),
            };
          }
          const useMultipart = arg.transport === 'multipart' && Boolean(capture.file);
          const body = useMultipart
            ? buildV1FacePunchFormData({
                file: capture.file!,
                filename: capture.filename,
                gps: capture.gps,
                workMode: arg.workMode,
                notes: arg.notes,
                deviceInfo: arg.deviceInfo,
              })
            : buildV1FacePunchJsonBody({
                imageBase64: capture.imageBase64 || '',
                gps: capture.gps,
                workMode: arg.workMode,
                notes: arg.notes,
                deviceInfo: arg.deviceInfo,
              });

          const headers = arg.idempotencyKey
            ? { 'Idempotency-Key': arg.idempotencyKey }
            : undefined;

          const res = await executeAttendanceRequest<unknown>({
            version: 'v1',
            path: '/attendance/face/check-in',
            method: 'POST',
            body,
            headers,
          });
          if ('error' in res) return { error: res.error };
          return { data: unwrapDataEnvelope<FacePunchResult>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        } finally {
          releaseTransientCapture(arg.captureId);
        }
      },
      invalidatesTags: [
        'AttendanceToday',
        'AttendanceHistory',
        'AttendanceTeam',
        'AttendanceCompany',
        'AttendanceSummary',
      ],
    }),

    // 4. POST /api/v1/attendance/face/check-out (JSON or multipart)
    faceCheckOut: builder.mutation<FacePunchResult, V1FacePunchMutationArg>({
      async queryFn(arg) {
        try {
          const capture = consumeTransientCapture(arg.captureId);
          if (!capture) {
            return {
              error: makeClientValidationError(
                new Error('Fresh camera capture expired or missing. Please capture again.')
              ),
            };
          }
          const useMultipart = arg.transport === 'multipart' && Boolean(capture.file);
          const body = useMultipart
            ? buildV1FacePunchFormData({
                file: capture.file!,
                filename: capture.filename,
                gps: capture.gps,
                workMode: arg.workMode,
                notes: arg.notes,
                deviceInfo: arg.deviceInfo,
              })
            : buildV1FacePunchJsonBody({
                imageBase64: capture.imageBase64 || '',
                gps: capture.gps,
                workMode: arg.workMode,
                notes: arg.notes,
                deviceInfo: arg.deviceInfo,
              });

          const res = await executeAttendanceRequest<unknown>({
            version: 'v1',
            path: '/attendance/face/check-out',
            method: 'POST',
            body,
          });
          if ('error' in res) return { error: res.error };
          return { data: unwrapDataEnvelope<FacePunchResult>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        } finally {
          releaseTransientCapture(arg.captureId);
        }
      },
      invalidatesTags: [
        'AttendanceToday',
        'AttendanceHistory',
        'AttendanceTeam',
        'AttendanceCompany',
        'AttendanceSummary',
      ],
    }),

    // 5. GET /api/v1/attendance/shifts/me/schedule
    getMyShiftSchedule: builder.query<MyScheduleData, MyScheduleQueryParams | void>({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/shifts/me/schedule',
        method: 'GET',
        query: params
          ? {
              start_date: params.start_date,
              end_date: params.end_date,
            }
          : undefined,
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<MyScheduleData>(raw),
      providesTags: ['MySchedule'],
    }),

    // 6. POST /api/v1/attendance/shifts/change-requests
    submitShiftChangeRequest: builder.mutation<
      ShiftChangeRequestResult,
      ShiftChangeRequestInput
    >({
      async queryFn(arg) {
        try {
          const body = buildShiftChangeRequestBody(arg);
          const res = await executeAttendanceRequest<unknown>({
            version: 'v1',
            path: '/attendance/shifts/change-requests',
            method: 'POST',
            body,
          });
          if ('error' in res) return { error: res.error };
          return { data: unwrapDataEnvelope<ShiftChangeRequestResult>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        }
      },
      invalidatesTags: ['MySchedule', 'Shifts'],
    }),

    // 7. GET /api/v1/attendance/face/me
    getFaceMe: builder.query<FaceMeData, AttendanceScopeContext | void>({
      query: () => ({
        version: 'v1',
        path: '/attendance/face/me',
        method: 'GET',
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<FaceMeData>(raw),
      providesTags: ['AttendanceToday'],
    }),

    // 8. GET /api/v1/attendance/face/history (omit employee_id for employee self-service)
    getFaceHistory: builder.query<
      PaginatedItems<AttendanceHistoryRecord>,
      FaceHistoryQueryParams | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/face/history',
        method: 'GET',
        query: params
          ? {
              start_date: params.start_date,
              end_date: params.end_date,
              employee_id: params.employee_id,
              page: params.page ?? 1,
              limit: params.limit ?? 20,
            }
          : { page: 1, limit: 20 },
      }),
      transformResponse: (raw: unknown, _meta, arg) =>
        normalizePaginatedResponse<AttendanceHistoryRecord>(
          raw,
          arg?.page ?? 1,
          arg?.limit ?? 20
        ),
      providesTags: ['AttendanceHistory'],
    }),

    // 9. GET /api/v1/attendance/face/team (Direct reports, Admin/Manager)
    getFaceTeam: builder.query<
      PaginatedItems<AttendanceHistoryRecord>,
      FaceTeamQueryParams | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/face/team',
        method: 'GET',
        query: params
          ? {
              start_date: params.start_date,
              end_date: params.end_date,
              page: params.page ?? 1,
              limit: params.limit ?? 20,
            }
          : { page: 1, limit: 20 },
      }),
      transformResponse: (raw: unknown, _meta, arg) =>
        normalizePaginatedResponse<AttendanceHistoryRecord>(
          raw,
          arg?.page ?? 1,
          arg?.limit ?? 20
        ),
      providesTags: ['AttendanceTeam'],
    }),

    // 10. GET /api/v1/attendance/face/company (Admin company history)
    getFaceCompany: builder.query<
      PaginatedItems<AttendanceHistoryRecord>,
      FaceCompanyQueryParams | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/face/company',
        method: 'GET',
        query: params
          ? {
              branch: params.branch,
              department: params.department,
              employee_id: params.employee_id,
              start_date: params.start_date,
              end_date: params.end_date,
              page: params.page ?? 1,
              limit: params.limit ?? 20,
            }
          : { page: 1, limit: 20 },
      }),
      transformResponse: (raw: unknown, _meta, arg) =>
        normalizePaginatedResponse<AttendanceHistoryRecord>(
          raw,
          arg?.page ?? 1,
          arg?.limit ?? 20
        ),
      providesTags: ['AttendanceCompany'],
    }),

    // 11. GET /api/v1/attendance/face/analytics
    getFaceAnalytics: builder.query<FaceAnalyticsKpis, AttendanceScopeContext | void>({
      query: () => ({
        version: 'v1',
        path: '/attendance/face/analytics',
        method: 'GET',
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<FaceAnalyticsKpis>(raw),
      providesTags: ['AttendanceSummary'],
    }),

    // 12. GET /api/v1/attendance/analytics/distribution
    getAttendanceDistribution: builder.query<
      AttendanceDistributionData,
      AttendanceDistributionParams | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/analytics/distribution',
        method: 'GET',
        query: params
          ? {
              start_date: params.start_date,
              end_date: params.end_date,
              view_mode: params.view_mode ?? 'week',
            }
          : { view_mode: 'week' },
      }),
      transformResponse: (raw: unknown) =>
        unwrapDataEnvelope<AttendanceDistributionData>(raw),
      providesTags: ['AttendanceSummary'],
    }),

    // 13. POST /api/v1/attendance/break/start
    startBreak: builder.mutation<BreakStartResult, BreakCaptureMutationArg>({
      async queryFn(arg) {
        try {
          const capture = consumeTransientCapture(arg.captureId);
          if (!capture) {
            return {
              error: makeClientValidationError(
                new Error('Fresh camera capture is required to start a break.')
              ),
            };
          }
          const useMultipart = arg.transport === 'multipart' && Boolean(capture.file);
          const body = useMultipart
            ? buildBreakCaptureFormData({
                file: capture.file!,
                filename: capture.filename,
                mimeType: capture.mimeType,
                gps: capture.gps,
                notes: arg.notes,
                deviceInfo: arg.deviceInfo,
              })
            : buildBreakCaptureJsonBody({
                imageBase64: capture.imageBase64 || '',
                gps: capture.gps,
                notes: arg.notes,
                deviceInfo: arg.deviceInfo,
              });

          const res = await executeAttendanceRequest<unknown>({
            version: 'v1',
            path: '/attendance/break/start',
            method: 'POST',
            body,
          });
          if ('error' in res) return { error: res.error };
          return { data: unwrapDataEnvelope<BreakStartResult>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        } finally {
          releaseTransientCapture(arg.captureId);
        }
      },
      invalidatesTags: ['AttendanceToday', 'AttendanceHistory', 'AttendanceSummary'],
    }),

    // 14. POST /api/v1/attendance/break/end
    endBreak: builder.mutation<BreakEndResult, BreakCaptureMutationArg>({
      async queryFn(arg) {
        try {
          const capture = consumeTransientCapture(arg.captureId);
          if (!capture) {
            return {
              error: makeClientValidationError(
                new Error('Fresh camera capture is required to end a break.')
              ),
            };
          }
          const useMultipart = arg.transport === 'multipart' && Boolean(capture.file);
          const body = useMultipart
            ? buildBreakCaptureFormData({
                file: capture.file!,
                filename: capture.filename,
                mimeType: capture.mimeType,
                gps: capture.gps,
                notes: arg.notes,
                deviceInfo: arg.deviceInfo,
              })
            : buildBreakCaptureJsonBody({
                imageBase64: capture.imageBase64 || '',
                gps: capture.gps,
                notes: arg.notes,
                deviceInfo: arg.deviceInfo,
              });

          const res = await executeAttendanceRequest<unknown>({
            version: 'v1',
            path: '/attendance/break/end',
            method: 'POST',
            body,
          });
          if ('error' in res) return { error: res.error };
          return { data: unwrapDataEnvelope<BreakEndResult>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        } finally {
          releaseTransientCapture(arg.captureId);
        }
      },
      invalidatesTags: ['AttendanceToday', 'AttendanceHistory', 'AttendanceSummary'],
    }),

    // 15. POST /api/v1/attendance/geofence/verify (optional precheck — reads inside_geofence)
    verifyGeofence: builder.mutation<GeofenceVerifyResult, { captureId?: string; gps?: GpsReading }>({
      async queryFn(arg) {
        try {
          const gps = arg.captureId
            ? peekTransientCapture(arg.captureId)?.gps
            : arg.gps;
          if (!gps) {
            return {
              error: makeClientValidationError(
                new Error('Live GPS coordinates are required to verify geofence.')
              ),
            };
          }
          const body = buildGeofenceVerifyBody(gps);
          const res = await executeAttendanceRequest<unknown>({
            version: 'v1',
            path: '/attendance/geofence/verify',
            method: 'POST',
            body,
          });
          if ('error' in res) return { error: res.error };
          return { data: unwrapDataEnvelope<GeofenceVerifyResult>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        }
      },
    }),

    // 16. GET /api/v1/attendance/shifts/options (Admin/manager gated in snapshot)
    getShiftOptions: builder.query<ShiftOptionsData, AttendanceScopeContext | void>({
      query: () => ({
        version: 'v1',
        path: '/attendance/shifts/options',
        method: 'GET',
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<ShiftOptionsData>(raw),
      providesTags: ['Shifts'],
    }),

    // 17. GET /api/v1/attendance/shifts
    getShifts: builder.query<PaginatedItems<ShiftRecord>, ShiftsListQueryParams | void>({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/shifts',
        method: 'GET',
        query: params
          ? {
              search: params.search,
              page: params.page ?? 1,
              limit: params.limit ?? 20,
            }
          : { page: 1, limit: 20 },
      }),
      transformResponse: (raw: unknown, _meta, arg) =>
        normalizePaginatedResponse<ShiftRecord>(raw, arg?.page ?? 1, arg?.limit ?? 20),
      providesTags: (result) =>
        result
          ? [
              'Shifts',
              ...result.items.map((s) => ({ type: 'Shifts' as const, id: s.id })),
            ]
          : ['Shifts'],
    }),

    // 18. POST /api/v1/attendance/shifts
    createShift: builder.mutation<ShiftRecord, CreateShiftInput>({
      async queryFn(arg) {
        try {
          const body = buildCreateShiftBody(arg);
          const res = await executeAttendanceRequest<unknown>({
            version: 'v1',
            path: '/attendance/shifts',
            method: 'POST',
            body,
          });
          if ('error' in res) return { error: res.error };
          return { data: unwrapDataEnvelope<ShiftRecord>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        }
      },
      invalidatesTags: ['Shifts', 'Rosters', 'MySchedule'],
    }),

    // 19. GET /api/v1/attendance/shifts/{shift_id}
    getShiftById: builder.query<ShiftRecord, { shiftId: string } & AttendanceScopeContext>({
      query: ({ shiftId }) => ({
        version: 'v1',
        path: `/attendance/shifts/${encodeURIComponent(shiftId)}`,
        method: 'GET',
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<ShiftRecord>(raw),
      providesTags: (_res, _err, arg) => [{ type: 'Shifts', id: arg.shiftId }],
    }),

    // 20 & 21. PUT / PATCH /api/v1/attendance/shifts/{shift_id}
    updateShift: builder.mutation<ShiftRecord, EditShiftInput>({
      async queryFn(arg) {
        try {
          const body = buildEditShiftBody(arg);
          const res = await executeAttendanceRequest<unknown>({
            version: 'v1',
            path: `/attendance/shifts/${encodeURIComponent(arg.shiftId)}`,
            method: arg.method || 'PATCH',
            body,
          });
          if ('error' in res) return { error: res.error };
          return { data: unwrapDataEnvelope<ShiftRecord>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        }
      },
      invalidatesTags: (_res, _err, arg) => [
        'Shifts',
        { type: 'Shifts', id: arg.shiftId },
        'Rosters',
        'MySchedule',
      ],
    }),

    // 22. DELETE /api/v1/attendance/shifts/{shift_id}
    deleteShift: builder.mutation<DeletionReceipt, { shiftId: string }>({
      query: ({ shiftId }) => ({
        version: 'v1',
        path: `/attendance/shifts/${encodeURIComponent(shiftId)}`,
        method: 'DELETE',
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<DeletionReceipt>(raw),
      invalidatesTags: (_res, _err, arg) => [
        'Shifts',
        { type: 'Shifts', id: arg.shiftId },
        'Rosters',
        'MySchedule',
      ],
    }),

    // 23. GET /api/v1/attendance/rosters
    getRosters: builder.query<PaginatedItems<RosterRecord>, RostersListQueryParams | void>({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/rosters',
        method: 'GET',
        query: params
          ? {
              start_date: params.start_date,
              end_date: params.end_date,
              employee_id: params.employee_id,
              department: params.department,
              shift_type: params.shift_type,
              page: params.page ?? 1,
              limit: params.limit ?? 100,
            }
          : { page: 1, limit: 100 },
      }),
      transformResponse: (raw: unknown, _meta, arg) =>
        normalizePaginatedResponse<RosterRecord>(raw, arg?.page ?? 1, arg?.limit ?? 100),
      providesTags: (result) =>
        result
          ? [
              'Rosters',
              ...result.items.map((r) => ({ type: 'Rosters' as const, id: r.id })),
            ]
          : ['Rosters'],
    }),

    // 24. POST /api/v1/attendance/rosters
    createRoster: builder.mutation<RosterRecord, CreateRosterInput>({
      async queryFn(arg) {
        try {
          const body = buildCreateRosterBody(arg);
          const res = await executeAttendanceRequest<unknown>({
            version: 'v1',
            path: '/attendance/rosters',
            method: 'POST',
            body,
          });
          if ('error' in res) return { error: res.error };
          return { data: unwrapDataEnvelope<RosterRecord>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        }
      },
      invalidatesTags: ['Rosters', 'MySchedule'],
    }),

    // 25. POST /api/v1/attendance/rosters/bulk
    bulkCreateRoster: builder.mutation<BulkRosterResult, BulkRosterInput>({
      async queryFn(arg) {
        try {
          const body = buildBulkRosterBody(arg);
          const res = await executeAttendanceRequest<unknown>({
            version: 'v1',
            path: '/attendance/rosters/bulk',
            method: 'POST',
            body,
          });
          if ('error' in res) return { error: res.error };
          return { data: unwrapDataEnvelope<BulkRosterResult>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        }
      },
      invalidatesTags: ['Rosters', 'MySchedule'],
    }),

    // 26. GET /api/v1/attendance/rosters/{roster_id}
    getRosterById: builder.query<RosterRecord, { rosterId: string } & AttendanceScopeContext>({
      query: ({ rosterId }) => ({
        version: 'v1',
        path: `/attendance/rosters/${encodeURIComponent(rosterId)}`,
        method: 'GET',
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<RosterRecord>(raw),
      providesTags: (_res, _err, arg) => [{ type: 'Rosters', id: arg.rosterId }],
    }),

    // 27 & 28. PUT / PATCH /api/v1/attendance/rosters/{roster_id}
    updateRoster: builder.mutation<RosterRecord, EditRosterInput>({
      async queryFn(arg) {
        try {
          const body = buildEditRosterBody(arg);
          const res = await executeAttendanceRequest<unknown>({
            version: 'v1',
            path: `/attendance/rosters/${encodeURIComponent(arg.rosterId)}`,
            method: arg.method || 'PATCH',
            body,
          });
          if ('error' in res) return { error: res.error };
          return { data: unwrapDataEnvelope<RosterRecord>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        }
      },
      invalidatesTags: (_res, _err, arg) => [
        'Rosters',
        { type: 'Rosters', id: arg.rosterId },
        'MySchedule',
      ],
    }),

    // 29. DELETE /api/v1/attendance/rosters/{roster_id}
    deleteRoster: builder.mutation<DeletionReceipt, { rosterId: string }>({
      query: ({ rosterId }) => ({
        version: 'v1',
        path: `/attendance/rosters/${encodeURIComponent(rosterId)}`,
        method: 'DELETE',
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<DeletionReceipt>(raw),
      invalidatesTags: (_res, _err, arg) => [
        'Rosters',
        { type: 'Rosters', id: arg.rosterId },
        'MySchedule',
      ],
    }),

    // =========================================================================
    // B. CORE ATTENDANCE (/api/v1/attendance/...)
    // =========================================================================

    // 30. GET /api/v1/attendance/me
    getCoreAttendanceMe: builder.query<AttendanceHistoryRecord | null, AttendanceScopeContext | void>({
      query: () => ({ version: 'v1', path: '/attendance/me', method: 'GET' }),
      transformResponse: (raw: unknown) =>
        unwrapDataEnvelope<AttendanceHistoryRecord | null>(raw),
      providesTags: ['AttendanceToday'],
    }),

    // 31. GET /api/v1/attendance/status
    getCoreAttendanceStatus: builder.query<CoreAttendanceStatusData, AttendanceScopeContext | void>({
      query: () => ({ version: 'v1', path: '/attendance/status', method: 'GET' }),
      transformResponse: (raw: unknown) =>
        unwrapDataEnvelope<CoreAttendanceStatusData>(raw),
      providesTags: ['AttendanceToday'],
    }),

    // 32. GET /api/v1/attendance/today
    getCoreAttendanceToday: builder.query<
      PaginatedItems<AttendanceHistoryRecord>,
      PaginationOnlyParams | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/today',
        method: 'GET',
        query: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      }),
      transformResponse: (raw: unknown, _m, arg) =>
        normalizePaginatedResponse<AttendanceHistoryRecord>(raw, arg?.page ?? 1, arg?.limit ?? 20),
      providesTags: ['AttendanceCompany'],
    }),

    // 33. GET /api/v1/attendance/history
    getCoreAttendanceHistory: builder.query<
      PaginatedItems<AttendanceHistoryRecord>,
      CoreDateRangePageParams | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/history',
        method: 'GET',
        query: params
          ? {
              from_date: params.from_date,
              to_date: params.to_date,
              page: params.page ?? 1,
              limit: params.limit ?? 20,
            }
          : { page: 1, limit: 20 },
      }),
      transformResponse: (raw: unknown, _m, arg) =>
        normalizePaginatedResponse<AttendanceHistoryRecord>(raw, arg?.page ?? 1, arg?.limit ?? 20),
      providesTags: ['AttendanceHistory'],
    }),

    // 34. GET /api/v1/attendance/team (Note: company-wide today in snapshot; use getFaceTeam for direct reports)
    getCoreAttendanceTeam: builder.query<
      PaginatedItems<AttendanceHistoryRecord>,
      PaginationOnlyParams | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/team',
        method: 'GET',
        query: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      }),
      transformResponse: (raw: unknown, _m, arg) =>
        normalizePaginatedResponse<AttendanceHistoryRecord>(raw, arg?.page ?? 1, arg?.limit ?? 20),
      providesTags: ['AttendanceTeam'],
    }),

    // 35. GET /api/v1/attendance/company
    getCoreAttendanceCompany: builder.query<
      PaginatedItems<AttendanceHistoryRecord>,
      PaginationOnlyParams | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/company',
        method: 'GET',
        query: { page: params?.page ?? 1, limit: params?.limit ?? 50 },
      }),
      transformResponse: (raw: unknown, _m, arg) =>
        normalizePaginatedResponse<AttendanceHistoryRecord>(raw, arg?.page ?? 1, arg?.limit ?? 50),
      providesTags: ['AttendanceCompany'],
    }),

    // 36. GET /api/v1/attendance/records
    getCoreAttendanceRecords: builder.query<
      PaginatedItems<AttendanceHistoryRecord>,
      CoreDateRangePageParams | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/records',
        method: 'GET',
        query: params
          ? {
              from_date: params.from_date,
              to_date: params.to_date,
              status: params.status,
              page: params.page ?? 1,
              limit: params.limit ?? 20,
            }
          : { page: 1, limit: 20 },
      }),
      transformResponse: (raw: unknown, _m, arg) =>
        normalizePaginatedResponse<AttendanceHistoryRecord>(raw, arg?.page ?? 1, arg?.limit ?? 20),
      providesTags: ['AttendanceCompany'],
    }),

    // 37. GET /api/v1/attendance/analytics
    getCoreAttendanceAnalytics: builder.query<
      AttendanceSummaryData,
      ({ target_date?: string } & AttendanceScopeContext) | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/analytics',
        method: 'GET',
        query: params?.target_date ? { target_date: params.target_date } : undefined,
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<AttendanceSummaryData>(raw),
      providesTags: ['AttendanceSummary'],
    }),

    // 38. GET /api/v1/attendance/summary
    getAttendanceSummary: builder.query<
      AttendanceSummaryData,
      ({ target_date?: string } & AttendanceScopeContext) | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/summary',
        method: 'GET',
        query: params?.target_date ? { target_date: params.target_date } : undefined,
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<AttendanceSummaryData>(raw),
      providesTags: ['AttendanceSummary'],
    }),

    // 39. GET /api/v1/attendance/analytics/trends (core handler: from_date / to_date)
    getAttendanceTrends: builder.query<
      AttendanceTrendsData,
      ({ from_date?: string; to_date?: string } & AttendanceScopeContext) | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/analytics/trends',
        method: 'GET',
        query: params
          ? { from_date: params.from_date, to_date: params.to_date }
          : undefined,
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<AttendanceTrendsData>(raw),
      providesTags: ['AttendanceSummary'],
    }),

    // 40. GET /api/v1/attendance/analytics/rate (core handler: from_date / to_date)
    getAttendanceRate: builder.query<
      AttendanceRateData,
      ({ from_date?: string; to_date?: string } & AttendanceScopeContext) | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/analytics/rate',
        method: 'GET',
        query: params
          ? { from_date: params.from_date, to_date: params.to_date }
          : undefined,
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<AttendanceRateData>(raw),
      providesTags: ['AttendanceSummary'],
    }),

    // 41. GET /api/v1/attendance/analytics/weekly (core handler: weeks 1-12)
    getAttendanceWeekly: builder.query<
      AttendanceWeeklyData,
      ({ weeks?: number } & AttendanceScopeContext) | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/analytics/weekly',
        method: 'GET',
        query: { weeks: params?.weeks ?? 4 },
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<AttendanceWeeklyData>(raw),
      providesTags: ['AttendanceSummary'],
    }),

    // 42. GET /api/v1/attendance/calendar (always sends explicit month & year)
    getAttendanceCalendar: builder.query<AttendanceCalendarData, AttendanceCalendarParams>({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/calendar',
        method: 'GET',
        query: buildCalendarQueryParams(params.month, params.year),
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<AttendanceCalendarData>(raw),
      providesTags: ['AttendanceHistory', 'AttendanceSummary'],
    }),

    // 43. GET /api/v1/attendance/late
    getLateAttendance: builder.query<
      PaginatedItems<AttendanceHistoryRecord>,
      PaginationOnlyParams | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/late',
        method: 'GET',
        query: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      }),
      transformResponse: (raw: unknown, _m, arg) =>
        normalizePaginatedResponse<AttendanceHistoryRecord>(raw, arg?.page ?? 1, arg?.limit ?? 20),
      providesTags: ['AttendanceCompany'],
    }),

    // 44. GET /api/v1/attendance/early-leaving (flagged unfiltered in snapshot — typed, not auto-exposed)
    getEarlyLeavingAttendance: builder.query<
      PaginatedItems<AttendanceHistoryRecord>,
      PaginationOnlyParams | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/early-leaving',
        method: 'GET',
        query: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      }),
      transformResponse: (raw: unknown, _m, arg) =>
        normalizePaginatedResponse<AttendanceHistoryRecord>(raw, arg?.page ?? 1, arg?.limit ?? 20),
      providesTags: ['AttendanceCompany'],
    }),

    // 45. GET /api/v1/attendance/missing (filters status=absent in snapshot)
    getMissingAttendance: builder.query<
      PaginatedItems<AttendanceHistoryRecord>,
      PaginationOnlyParams | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/missing',
        method: 'GET',
        query: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      }),
      transformResponse: (raw: unknown, _m, arg) =>
        normalizePaginatedResponse<AttendanceHistoryRecord>(raw, arg?.page ?? 1, arg?.limit ?? 20),
      providesTags: ['AttendanceCompany'],
    }),

    // 46. GET /api/v1/attendance/overtime (flagged unfiltered in snapshot — typed, not auto-exposed)
    getOvertimeAttendance: builder.query<
      PaginatedItems<AttendanceHistoryRecord>,
      PaginationOnlyParams | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/overtime',
        method: 'GET',
        query: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      }),
      transformResponse: (raw: unknown, _m, arg) =>
        normalizePaginatedResponse<AttendanceHistoryRecord>(raw, arg?.page ?? 1, arg?.limit ?? 20),
      providesTags: ['AttendanceCompany'],
    }),

    // 47. GET /api/v1/attendance/export — handled outside Redux cache via downloadAttendanceExport()

    // 48. POST /api/v1/attendance/check-in (Legacy core policy-driven — never fallback from face/check-in)
    coreCheckIn: builder.mutation<FacePunchResult, CoreCheckInArg>({
      async queryFn(arg) {
        try {
          const capture = arg.captureId
            ? consumeTransientCapture(arg.captureId)
            : null;
          const body: Record<string, unknown> = {};
          if (capture?.imageBase64) body.image_base64 = capture.imageBase64;
          const gps = capture?.gps || arg.gps;
          if (gps) {
            body.latitude = gps.latitude;
            body.longitude = gps.longitude;
          }
          if (arg.ipAddress) body.ip_address = arg.ipAddress;
          if (arg.deviceInfo) body.device_info = arg.deviceInfo;
          if (arg.notes) body.notes = arg.notes;

          const res = await executeAttendanceRequest<unknown>({
            version: 'v1',
            path: '/attendance/check-in',
            method: 'POST',
            body,
          });
          if ('error' in res) return { error: res.error };
          return { data: unwrapDataEnvelope<FacePunchResult>(res.data) };
        } finally {
          if (arg.captureId) releaseTransientCapture(arg.captureId);
        }
      },
      invalidatesTags: ['AttendanceToday', 'AttendanceHistory', 'AttendanceSummary'],
    }),

    // 49. POST /api/v1/attendance/check-out (Legacy core checkout — never fallback from face/check-out)
    coreCheckOut: builder.mutation<FacePunchResult, CoreCheckOutArg>({
      query: (arg) => {
        const body: Record<string, unknown> = {};
        if (arg.gps) {
          body.latitude = arg.gps.latitude;
          body.longitude = arg.gps.longitude;
        }
        if (arg.ipAddress) body.ip_address = arg.ipAddress;
        if (arg.deviceInfo) body.device_info = arg.deviceInfo;
        if (arg.notes) body.notes = arg.notes;
        return {
          version: 'v1',
          path: '/attendance/check-out',
          method: 'POST',
          body,
        };
      },
      transformResponse: (raw: unknown) => unwrapDataEnvelope<FacePunchResult>(raw),
      invalidatesTags: ['AttendanceToday', 'AttendanceHistory', 'AttendanceSummary'],
    }),

    // 50 & 51. PUT / PATCH /api/v1/attendance/{attendance_id} (Manual edit)
    manualEditAttendance: builder.mutation<ManualEditReceipt, ManualEditInput>({
      async queryFn(arg) {
        try {
          const body = buildManualEditBody(arg);
          const res = await executeAttendanceRequest<unknown>({
            version: 'v1',
            path: `/attendance/${encodeURIComponent(arg.attendanceId)}`,
            method: arg.method || 'PATCH',
            body,
          });
          if ('error' in res) return { error: res.error };
          return { data: unwrapDataEnvelope<ManualEditReceipt>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        }
      },
      invalidatesTags: [
        'AttendanceToday',
        'AttendanceHistory',
        'AttendanceTeam',
        'AttendanceCompany',
        'AttendanceSummary',
      ],
    }),

    // 52. DELETE /api/v1/attendance/{attendance_id}
    deleteAttendanceRecord: builder.mutation<DeletionReceipt, { attendanceId: string }>({
      query: ({ attendanceId }) => ({
        version: 'v1',
        path: `/attendance/${encodeURIComponent(attendanceId)}`,
        method: 'DELETE',
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<DeletionReceipt>(raw),
      invalidatesTags: [
        'AttendanceToday',
        'AttendanceHistory',
        'AttendanceTeam',
        'AttendanceCompany',
        'AttendanceSummary',
      ],
    }),

    // 53. GET /api/v1/attendance/regularization (Company-wide list — keep off employee self-service)
    getRegularizations: builder.query<
      PaginatedItems<RegularizationRecord>,
      PaginationOnlyParams | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/attendance/regularization',
        method: 'GET',
        query: { page: params?.page ?? 1, limit: params?.limit ?? 20 },
      }),
      transformResponse: (raw: unknown, _m, arg) =>
        normalizePaginatedResponse<RegularizationRecord>(raw, arg?.page ?? 1, arg?.limit ?? 20),
      providesTags: ['Regularization'],
    }),

    // 54. POST /api/v1/attendance/regularization
    submitRegularization: builder.mutation<
      RegularizationSubmitResult,
      RegularizationSubmitInput
    >({
      async queryFn(arg) {
        try {
          const body = buildRegularizationBody(arg);
          const res = await executeAttendanceRequest<unknown>({
            version: 'v1',
            path: '/attendance/regularization',
            method: 'POST',
            body,
          });
          if ('error' in res) return { error: res.error };
          return { data: unwrapDataEnvelope<RegularizationSubmitResult>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        }
      },
      invalidatesTags: ['Regularization', 'AttendanceHistory'],
    }),

    // =========================================================================
    // C. ATTENDANCE MONITORING (12 operations)
    // =========================================================================

    getAiAttendanceDashboard: builder.query<Record<string, unknown>, AiAttendanceFilterParams | void>({
      query: (params) => ({
        version: 'v1',
        path: '/ai/attendance/dashboard',
        method: 'GET',
        query: params
          ? {
              department_id: params.department_id,
              start_date: params.start_date,
              end_date: params.end_date,
            }
          : undefined,
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<Record<string, unknown>>(raw),
      providesTags: ['AttendanceMonitor'],
    }),

    getAiAttendanceTrend: builder.query<Record<string, unknown>, AiAttendanceFilterParams | void>({
      query: (params) => ({
        version: 'v1',
        path: '/ai/attendance/trend',
        method: 'GET',
        query: params
          ? {
              group_by: params.group_by ?? 'daily',
              department_id: params.department_id,
              start_date: params.start_date,
              end_date: params.end_date,
            }
          : { group_by: 'daily' },
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<Record<string, unknown>>(raw),
      providesTags: ['AttendanceMonitor'],
    }),

    getAiLateArrivals: builder.query<Record<string, unknown>, AiAttendanceFilterParams | void>({
      query: (params) => ({
        version: 'v1',
        path: '/ai/attendance/late-arrivals',
        method: 'GET',
        query: params
          ? {
              department_id: params.department_id,
              start_date: params.start_date,
              end_date: params.end_date,
            }
          : undefined,
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<Record<string, unknown>>(raw),
      providesTags: ['AttendanceMonitor'],
    }),

    getAiAnomalies: builder.query<Record<string, unknown>, AiAttendanceFilterParams | void>({
      query: (params) => ({
        version: 'v1',
        path: '/ai/attendance/anomalies',
        method: 'GET',
        query: params?.department_id ? { department_id: params.department_id } : undefined,
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<Record<string, unknown>>(raw),
      providesTags: ['AttendanceMonitor'],
    }),

    getAiAbsencePattern: builder.query<Record<string, unknown>, AiAttendanceFilterParams | void>({
      query: (params) => ({
        version: 'v1',
        path: '/ai/attendance/absence-pattern',
        method: 'GET',
        query: params?.department_id ? { department_id: params.department_id } : undefined,
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<Record<string, unknown>>(raw),
      providesTags: ['AttendanceMonitor'],
    }),

    getAiOvertime: builder.query<Record<string, unknown>, AiAttendanceFilterParams | void>({
      query: (params) => ({
        version: 'v1',
        path: '/ai/attendance/overtime',
        method: 'GET',
        query: params?.department_id ? { department_id: params.department_id } : undefined,
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<Record<string, unknown>>(raw),
      providesTags: ['AttendanceMonitor'],
    }),

    getAiShiftViolations: builder.query<Record<string, unknown>, AiAttendanceFilterParams | void>({
      query: (params) => ({
        version: 'v1',
        path: '/ai/attendance/shift-violations',
        method: 'GET',
        query: params?.department_id ? { department_id: params.department_id } : undefined,
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<Record<string, unknown>>(raw),
      providesTags: ['AttendanceMonitor'],
    }),

    getAiHealthScore: builder.query<Record<string, unknown>, AiAttendanceFilterParams | void>({
      query: (params) => ({
        version: 'v1',
        path: '/ai/attendance/health-score',
        method: 'GET',
        query: params?.department_id ? { department_id: params.department_id } : undefined,
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<Record<string, unknown>>(raw),
      providesTags: ['AttendanceMonitor'],
    }),

    getAiWatchlist: builder.query<Record<string, unknown>, AiAttendanceFilterParams | void>({
      query: (params) => ({
        version: 'v1',
        path: '/ai/attendance/watchlist',
        method: 'GET',
        query: params?.department_id ? { department_id: params.department_id } : undefined,
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<Record<string, unknown>>(raw),
      providesTags: ['AttendanceMonitor'],
    }),

    getAiHubAttendanceMonitor: builder.query<Record<string, unknown>, AttendanceScopeContext | void>({
      query: () => ({
        version: 'v1',
        path: '/ai-hub/attendance-monitor',
        method: 'GET',
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<Record<string, unknown>>(raw),
      providesTags: ['AttendanceMonitor'],
    }),

    analyzeAiHubAttendanceMonitor: builder.mutation<Record<string, unknown>, MonitorAnalysisInput>({
      async queryFn(arg) {
        try {
          const body = buildMonitorAnalysisBody(arg);
          const res = await executeAttendanceRequest<unknown>({
            version: 'v1',
            path: '/ai-hub/attendance-monitor/analyze',
            method: 'POST',
            body,
          });
          if ('error' in res) return { error: res.error };
          return { data: unwrapDataEnvelope<Record<string, unknown>>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        }
      },
      invalidatesTags: ['AttendanceMonitor'],
    }),

    getAiHubAttendanceMonitorAnomalies: builder.query<
      PaginatedItems<Record<string, unknown>>,
      AiHubMonitorAnomaliesParams | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/ai-hub/attendance-monitor/anomalies',
        method: 'GET',
        query: params
          ? {
              page: params.page ?? 1,
              limit: params.limit ?? 20,
              search: params.search,
              sortBy: params.sortBy,
              sortOrder: params.sortOrder,
            }
          : { page: 1, limit: 20 },
      }),
      transformResponse: (raw: unknown, _m, arg) =>
        normalizePaginatedResponse<Record<string, unknown>>(raw, arg?.page ?? 1, arg?.limit ?? 20),
      providesTags: ['AttendanceMonitor'],
    }),

    // =========================================================================
    // D. RELATED CANONICAL ROUTES (V1 & V2)
    // =========================================================================

    // GET /api/v1/settings/attendance
    getAttendanceSettings: builder.query<AttendanceSettingsData, AttendanceScopeContext | void>({
      query: () => ({
        version: 'v1',
        path: '/settings/attendance',
        method: 'GET',
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<AttendanceSettingsData>(raw),
      providesTags: ['AttendanceSettings'],
    }),

    // PUT /api/v1/settings/attendance (invalidate to verify read-after-write)
    updateAttendanceSettings: builder.mutation<
      AttendanceSettingsData,
      AttendanceSettingsConfig
    >({
      query: (config) => ({
        version: 'v1',
        path: '/settings/attendance',
        method: 'PUT',
        body: buildAttendanceSettingsBody(config),
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<AttendanceSettingsData>(raw),
      invalidatesTags: ['AttendanceSettings'],
    }),

    // GET /api/v1/analytics/attendance
    getCompanyAnalyticsAttendance: builder.query<
      Record<string, unknown>,
      ({ periodType?: string } & AttendanceScopeContext) | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/analytics/attendance',
        method: 'GET',
        query: { periodType: params?.periodType ?? 'monthly' },
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<Record<string, unknown>>(raw),
      providesTags: ['AttendanceSummary'],
    }),

    // GET /api/v1/ai-insights/attendance
    getAiInsightsAttendance: builder.query<
      Record<string, unknown>,
      ({ refresh?: boolean } & AttendanceScopeContext) | void
    >({
      query: (params) => ({
        version: 'v1',
        path: '/ai-insights/attendance',
        method: 'GET',
        query: { refresh: params?.refresh ?? false },
      }),
      transformResponse: (raw: unknown) => unwrapDataEnvelope<Record<string, unknown>>(raw),
      providesTags: ['AttendanceMonitor'],
    }),

    // POST /api/v2/pwa/attendance/check-in (Flat JSON + required Idempotency-Key)
    v2PwaCheckIn: builder.mutation<V2PwaPunchResult, V2PwaPunchMutationArg>({
      async queryFn(arg) {
        try {
          const capture = arg.preserveForReplay
            ? peekTransientCapture(arg.captureId)
            : consumeTransientCapture(arg.captureId);
          if (!capture?.imageBase64 || !capture.gps) {
            return {
              error: makeClientValidationError(
                new Error('Fresh face capture and live GPS coordinates are required for V2 PWA check-in.')
              ),
            };
          }
          const req = buildV2PwaPunchRequest({
            imageBase64: capture.imageBase64,
            gps: capture.gps,
            idempotencyKey: arg.idempotencyKey,
            notes: arg.notes,
            deviceInfo: arg.deviceInfo,
            clientCapturedAt: capture.capturedAtIso,
          });
          const res = await executeAttendanceRequest<unknown>({
            version: 'v2',
            path: '/pwa/attendance/check-in',
            method: 'POST',
            headers: req.headers,
            body: req.body,
          });
          if ('error' in res) return { error: res.error };
          releaseTransientCapture(arg.captureId);
          return { data: unwrapDataEnvelope<V2PwaPunchResult>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        } finally {
          if (!arg.preserveForReplay) {
            releaseTransientCapture(arg.captureId);
          }
        }
      },
      invalidatesTags: [
        'AttendanceToday',
        'AttendanceHistory',
        'AttendanceTeam',
        'AttendanceCompany',
        'AttendanceSummary',
      ],
    }),

    // POST /api/v2/pwa/attendance/check-out (Flat JSON + required Idempotency-Key)
    v2PwaCheckOut: builder.mutation<V2PwaPunchResult, V2PwaPunchMutationArg>({
      async queryFn(arg) {
        try {
          const capture = arg.preserveForReplay
            ? peekTransientCapture(arg.captureId)
            : consumeTransientCapture(arg.captureId);
          if (!capture?.imageBase64 || !capture.gps) {
            return {
              error: makeClientValidationError(
                new Error('Fresh face capture and live GPS coordinates are required for V2 PWA check-out.')
              ),
            };
          }
          const req = buildV2PwaPunchRequest({
            imageBase64: capture.imageBase64,
            gps: capture.gps,
            idempotencyKey: arg.idempotencyKey,
            notes: arg.notes,
            deviceInfo: arg.deviceInfo,
            clientCapturedAt: capture.capturedAtIso,
          });
          const res = await executeAttendanceRequest<unknown>({
            version: 'v2',
            path: '/pwa/attendance/check-out',
            method: 'POST',
            headers: req.headers,
            body: req.body,
          });
          if ('error' in res) return { error: res.error };
          releaseTransientCapture(arg.captureId);
          return { data: unwrapDataEnvelope<V2PwaPunchResult>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        } finally {
          if (!arg.preserveForReplay) {
            releaseTransientCapture(arg.captureId);
          }
        }
      },
      invalidatesTags: [
        'AttendanceToday',
        'AttendanceHistory',
        'AttendanceTeam',
        'AttendanceCompany',
        'AttendanceSummary',
      ],
    }),

    // POST /api/v2/shifts/plans (AI shift planning workflow)
    createAiShiftPlan: builder.mutation<AiShiftPlanResult, AiShiftPlanInput>({
      async queryFn(arg) {
        try {
          const body = buildAiShiftPlanBody(arg);
          const res = await executeAttendanceRequest<unknown>({
            version: 'v2',
            path: '/shifts/plans',
            method: 'POST',
            body,
          });
          if ('error' in res) return { error: res.error };
          return { data: unwrapDataEnvelope<AiShiftPlanResult>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        }
      },
      invalidatesTags: ['Shifts', 'Rosters'],
    }),

    // POST /api/v2/payroll/cycles/{cycleId}/lock-attendance (Canonical single prefix, payroll-only)
    lockPayrollCycleAttendance: builder.mutation<
      PayrollAttendanceLockResult,
      { cycleId: string }
    >({
      query: ({ cycleId }) => ({
        version: 'v2',
        path: `/payroll/cycles/${encodeURIComponent(cycleId)}/lock-attendance`,
        method: 'POST',
      }),
      transformResponse: (raw: unknown) =>
        unwrapDataEnvelope<PayrollAttendanceLockResult>(raw),
      invalidatesTags: ['AttendanceCompany', 'AttendanceSummary'],
    }),

    // POST /api/v2/payroll/cycles/{cycleId}/unlock-attendance (Canonical single prefix, payroll-only)
    unlockPayrollCycleAttendance: builder.mutation<
      PayrollAttendanceLockResult,
      PayrollAttendanceUnlockInput
    >({
      async queryFn(arg) {
        try {
          const body = buildPayrollUnlockBody(arg.reason);
          const res = await executeAttendanceRequest<unknown>({
            version: 'v2',
            path: `/payroll/cycles/${encodeURIComponent(arg.cycleId)}/unlock-attendance`,
            method: 'POST',
            body,
          });
          if ('error' in res) return { error: res.error };
          return { data: unwrapDataEnvelope<PayrollAttendanceLockResult>(res.data) };
        } catch (err) {
          return { error: makeClientValidationError(err) };
        }
      },
      invalidatesTags: ['AttendanceCompany', 'AttendanceSummary'],
    }),
  }),
});

export const {
  useGetFaceStatusQuery,
  useEnrollFaceMutation,
  useFaceCheckInMutation,
  useFaceCheckOutMutation,
  useGetMyShiftScheduleQuery,
  useSubmitShiftChangeRequestMutation,
  useGetFaceMeQuery,
  useGetFaceHistoryQuery,
  useGetFaceTeamQuery,
  useGetFaceCompanyQuery,
  useGetFaceAnalyticsQuery,
  useGetAttendanceDistributionQuery,
  useStartBreakMutation,
  useEndBreakMutation,
  useVerifyGeofenceMutation,
  useGetShiftOptionsQuery,
  useGetShiftsQuery,
  useCreateShiftMutation,
  useGetShiftByIdQuery,
  useUpdateShiftMutation,
  useDeleteShiftMutation,
  useGetRostersQuery,
  useCreateRosterMutation,
  useBulkCreateRosterMutation,
  useGetRosterByIdQuery,
  useUpdateRosterMutation,
  useDeleteRosterMutation,
  useGetCoreAttendanceMeQuery,
  useGetCoreAttendanceStatusQuery,
  useGetCoreAttendanceTodayQuery,
  useGetCoreAttendanceHistoryQuery,
  useGetCoreAttendanceTeamQuery,
  useGetCoreAttendanceCompanyQuery,
  useGetCoreAttendanceRecordsQuery,
  useGetCoreAttendanceAnalyticsQuery,
  useGetAttendanceSummaryQuery,
  useGetAttendanceTrendsQuery,
  useGetAttendanceRateQuery,
  useGetAttendanceWeeklyQuery,
  useGetAttendanceCalendarQuery,
  useGetLateAttendanceQuery,
  useGetEarlyLeavingAttendanceQuery,
  useGetMissingAttendanceQuery,
  useGetOvertimeAttendanceQuery,
  useCoreCheckInMutation,
  useCoreCheckOutMutation,
  useManualEditAttendanceMutation,
  useDeleteAttendanceRecordMutation,
  useGetRegularizationsQuery,
  useSubmitRegularizationMutation,
  useGetAiAttendanceDashboardQuery,
  useGetAiAttendanceTrendQuery,
  useGetAiLateArrivalsQuery,
  useGetAiAnomaliesQuery,
  useGetAiAbsencePatternQuery,
  useGetAiOvertimeQuery,
  useGetAiShiftViolationsQuery,
  useGetAiHealthScoreQuery,
  useGetAiWatchlistQuery,
  useGetAiHubAttendanceMonitorQuery,
  useAnalyzeAiHubAttendanceMonitorMutation,
  useGetAiHubAttendanceMonitorAnomaliesQuery,
  useGetAttendanceSettingsQuery,
  useUpdateAttendanceSettingsMutation,
  useGetCompanyAnalyticsAttendanceQuery,
  useGetAiInsightsAttendanceQuery,
  useV2PwaCheckInMutation,
  useV2PwaCheckOutMutation,
  useCreateAiShiftPlanMutation,
  useLockPayrollCycleAttendanceMutation,
  useUnlockPayrollCycleAttendanceMutation,
} = attendanceApi;

// ---------------------------------------------------------------------------
// Authenticated File Downloads (Kept Strictly Outside Redux Cache)
// ---------------------------------------------------------------------------

export function downloadAttendanceExport(params?: {
  from_date?: string;
  to_date?: string;
}) {
  return downloadAuthenticatedAttendanceFile({
    path: '/attendance/export',
    query: params,
    fallbackFilename: `attendance-export-${params?.from_date || 'all'}.csv`,
  });
}

export function downloadExportsAttendance(params?: {
  format?: AttendanceExportFormat;
  search?: string;
  date_from?: string;
}) {
  const fmt = params?.format || 'xlsx';
  return downloadAuthenticatedAttendanceFile({
    path: '/exports/attendance',
    query: {
      format: fmt,
      search: params?.search,
      date_from: params?.date_from,
    },
    fallbackFilename: `attendance.${fmt}`,
  });
}

export function downloadExportsFaceAttendance(params?: {
  format?: AttendanceExportFormat;
  search?: string;
  date_from?: string;
  branch?: string;
  department?: string;
}) {
  const fmt = params?.format || 'xlsx';
  return downloadAuthenticatedAttendanceFile({
    path: '/exports/face-attendance',
    query: {
      format: fmt,
      search: params?.search,
      date_from: params?.date_from,
      branch: params?.branch,
      department: params?.department,
    },
    fallbackFilename: `face-attendance.${fmt}`,
  });
}

// ---------------------------------------------------------------------------
// Session / User / Tenant Switch Cache Reset
// ---------------------------------------------------------------------------

export function resetAttendanceSessionState(dispatch: (action: unknown) => unknown): void {
  clearTransientCaptures();
  dispatch(attendanceApi.util.resetApiState());
  dispatch(resetAttendanceUi());
}
