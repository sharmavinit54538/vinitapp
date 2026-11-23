'use client';

/**
 * OFC360 Attendance Screen — Backend-Driven Redux Toolkit / RTK Query Integration
 *
 * - Loads GET /api/v1/attendance/face-status and GET /api/v1/attendance/face/me
 *   on mount, on window focus / visibilitychange foreground return, and after mutations.
 * - Derives employee name from data.employee.first_name + last_name.
 * - Distinct states for: loading, permission denied (403), failed request (4xx/5xx/network),
 *   missing employee profile, not enrolled, no record today, checked in, on break, checked out.
 * - Buttons strictly driven by data.checked_in, data.checked_out, data.is_on_break, current_break.
 * - Personal history (/face/history without employee_id), Direct reports (/face/team),
 *   Company history (/face/company for admin), Manual Edit (PATCH /attendance/{id}),
 *   Regularization (POST /regularization; GET /regularization kept off employee self-service),
 *   Monthly Calendar (explicit month & year), and Authenticated File Export outside Redux state.
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Download,
  Edit3,
  RefreshCw,
  ScanFace,
  ShieldAlert,
  UserCheck,
  X,
} from 'lucide-react';
import { Ofc360Role } from '@/lib/auth-schemas';
import { useAppDispatch, useAppSelector } from '@/lib/store';
import {
  downloadAttendanceExport,
  downloadExportsFaceAttendance,
  useGetAttendanceCalendarQuery,
  useGetFaceAnalyticsQuery,
  useGetFaceCompanyQuery,
  useGetFaceHistoryQuery,
  useGetFaceMeQuery,
  useGetFaceStatusQuery,
  useGetFaceTeamQuery,
  useGetRegularizationsQuery,
  useManualEditAttendanceMutation,
  useSubmitRegularizationMutation,
} from '@/src/features/attendance/attendanceApi';
import {
  AttendanceHistoryScope,
  AttendanceSubTab,
  setAttendanceSubTab,
  setCompanyHistoryFilters,
  setHistoryDateRange,
  setHistoryPage,
  setHistoryScope,
  setSelectedCalendarPeriod,
  setSelectedWorkMode,
} from '@/src/features/attendance/attendanceSlice';
import {
  deriveAttendanceActionState,
  formatDateInBusinessTimezone,
  formatEmployeeDisplayName,
  formatIsoTimestampInTimezone,
  formatMinutesAsDuration,
  getTodayIsoDateInTimezone,
  resolveBusinessTimezone,
} from '@/src/features/attendance/builders';
import type {
  AttendanceApiError,
  AttendanceHistoryRecord,
  WorkMode,
} from '@/src/features/attendance/types';
import {
  LinkedInEmptyState,
  LinkedInErrorState,
  LinkedInLoadingRows,
  LinkedInSection,
  LinkedInTopTabItem,
  LinkedInTopTabs,
} from '@/src/components/linkedin/LinkedInPrimitives';
import {
  AttendanceCaptureAction,
  CameraCaptureModal,
} from '@/src/components/attendance/CameraCaptureModal';

interface AttendanceScreenProps {
  activeRole: Ofc360Role;
  isDark: boolean;
  onSuccessToast: (msg: string) => void;
}

const SUB_TABS: LinkedInTopTabItem<AttendanceSubTab>[] = [
  { id: 'today', label: 'Today' },
  { id: 'history', label: 'History' },
  { id: 'regularization', label: 'Corrections' },
];

const WORK_MODE_OPTIONS: { id: WorkMode; label: string }[] = [
  { id: 'office', label: 'Office' },
  { id: 'remote', label: 'Remote' },
  { id: 'field', label: 'Field' },
];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function asApiError(err: unknown): AttendanceApiError | null {
  if (!err || typeof err !== 'object') return null;
  if ('status' in err && 'message' in err) return err as AttendanceApiError;
  return null;
}

export function AttendanceScreen({
  activeRole,
  onSuccessToast,
}: AttendanceScreenProps) {
  const dispatch = useAppDispatch();
  const ui = useAppSelector((state) => state.attendanceUi);

  const isAdmin = activeRole === 'hr_admin' || activeRole === 'executive';
  const isManagerOrAdmin = isAdmin || activeRole === 'manager';
  const scopeReady = Boolean(ui.activeScopeKey);
  const scopeArg = useMemo(
    () => (ui.activeScopeKey ? { scopeKey: ui.activeScopeKey } : undefined),
    [ui.activeScopeKey]
  );

  // Core employee status queries — paused until session/tenant scope resolves
  const faceStatusQuery = useGetFaceStatusQuery(scopeArg, { skip: !scopeReady });
  const faceMeQuery = useGetFaceMeQuery(scopeArg, { skip: !scopeReady });

  // Company KPIs for authorized admin/manager
  const faceAnalyticsQuery = useGetFaceAnalyticsQuery(scopeArg, {
    skip: !scopeReady || !isManagerOrAdmin,
  });

  // Calendar with explicit selected month & year
  const calendarQuery = useGetAttendanceCalendarQuery(
    {
      month: ui.selectedCalendarMonth,
      year: ui.selectedCalendarYear,
      scopeKey: ui.activeScopeKey || undefined,
    },
    { skip: !scopeReady || ui.activeSubTab !== 'today' }
  );

  // Effective history scope respects role authorization
  const effectiveHistoryScope: AttendanceHistoryScope =
    ui.historyScope === 'company' && !isAdmin
      ? 'personal'
      : ui.historyScope === 'team' && !isManagerOrAdmin
      ? 'personal'
      : ui.historyScope;

  // History queries — only active scope runs
  const personalHistoryQuery = useGetFaceHistoryQuery(
    {
      start_date: ui.startDate || undefined,
      end_date: ui.endDate || undefined,
      page: ui.page,
      limit: ui.limit,
      scopeKey: ui.activeScopeKey || undefined,
    },
    {
      skip: !scopeReady || ui.activeSubTab !== 'history' || effectiveHistoryScope !== 'personal',
    }
  );

  const teamHistoryQuery = useGetFaceTeamQuery(
    {
      start_date: ui.startDate || undefined,
      end_date: ui.endDate || undefined,
      page: ui.page,
      limit: ui.limit,
      scopeKey: ui.activeScopeKey || undefined,
    },
    {
      skip:
        !scopeReady ||
        ui.activeSubTab !== 'history' ||
        effectiveHistoryScope !== 'team' ||
        !isManagerOrAdmin,
    }
  );

  const companyHistoryQuery = useGetFaceCompanyQuery(
    {
      branch: ui.branchFilter || undefined,
      department: ui.departmentFilter || undefined,
      start_date: ui.startDate || undefined,
      end_date: ui.endDate || undefined,
      page: ui.page,
      limit: ui.limit,
      scopeKey: ui.activeScopeKey || undefined,
    },
    {
      skip:
        !scopeReady ||
        ui.activeSubTab !== 'history' ||
        effectiveHistoryScope !== 'company' ||
        !isAdmin,
    }
  );

  // Company-wide regularization list — kept strictly off employee self-service
  const regularizationsQuery = useGetRegularizationsQuery(
    {
      page: 1,
      limit: 20,
      scopeKey: ui.activeScopeKey || undefined,
    },
    {
      skip: !scopeReady || ui.activeSubTab !== 'regularization' || !isManagerOrAdmin,
    }
  );

  const [submitRegularization, { isLoading: isSubmittingReg }] =
    useSubmitRegularizationMutation();
  const [manualEditAttendance, { isLoading: isSavingEdit }] =
    useManualEditAttendanceMutation();

  // Camera capture modal state
  const [captureAction, setCaptureAction] = useState<AttendanceCaptureAction | null>(null);

  // Regularization form state
  const businessTz = resolveBusinessTimezone(faceMeQuery.data);
  const [regDate, setRegDate] = useState(() => getTodayIsoDateInTimezone('UTC'));
  const [regCheckIn, setRegCheckIn] = useState('');
  const [regCheckOut, setRegCheckOut] = useState('');
  const [regReason, setRegReason] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regSubmittedReceipt, setRegSubmittedReceipt] = useState<{
    id: string;
    status: string;
    message?: string | null;
  } | null>(null);

  // Manual edit modal state (admin/manager only)
  const [editingRecord, setEditingRecord] = useState<AttendanceHistoryRecord | null>(null);
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editAuditReason, setEditAuditReason] = useState('');
  const [editError, setEditError] = useState<string | null>(null);

  // Export download state
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Refetch on window focus / foreground return
  useEffect(() => {
    if (!scopeReady || typeof window === 'undefined') return;
    const refetchStatus = () => {
      void faceStatusQuery.refetch();
      void faceMeQuery.refetch();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refetchStatus();
      }
    };
    window.addEventListener('focus', refetchStatus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', refetchStatus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeReady]);

  const faceStatusErr = asApiError(faceStatusQuery.error);
  const faceMeErr = asApiError(faceMeQuery.error);
  const primaryError = faceMeErr || faceStatusErr;

  const isStatusLoading =
    !scopeReady ||
    (faceStatusQuery.isLoading && !faceStatusQuery.data) ||
    (faceMeQuery.isLoading && !faceMeQuery.data);

  const actionState = useMemo(
    () => deriveAttendanceActionState(faceStatusQuery.data, faceMeQuery.data),
    [faceStatusQuery.data, faceMeQuery.data]
  );

  const employeeDisplayName = formatEmployeeDisplayName(faceMeQuery.data?.employee);
  const todayRec = faceMeQuery.data?.today_attendance;
  const activeBreak = faceMeQuery.data?.current_break;

  const handleRefreshAll = () => {
    void faceStatusQuery.refetch();
    void faceMeQuery.refetch();
    if (isManagerOrAdmin) {
      void faceAnalyticsQuery.refetch();
    }
  };

  const handleRegularizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSubmittedReceipt(null);
    try {
      const receipt = await submitRegularization({
        requestDate: regDate,
        reason: regReason,
        requestedCheckIn: regCheckIn.trim() || undefined,
        requestedCheckOut: regCheckOut.trim() || undefined,
      }).unwrap();
      setRegSubmittedReceipt(receipt);
      setRegReason('');
      setRegCheckIn('');
      setRegCheckOut('');
      onSuccessToast(
        receipt.message || `Correction submitted (${receipt.status || 'pending'})`
      );
    } catch (err) {
      const apiErr = asApiError(err);
      setRegError(apiErr?.message || 'Unable to submit regularization request.');
    }
  };

  const handleOpenManualEdit = (rec: AttendanceHistoryRecord) => {
    setEditingRecord(rec);
    setEditCheckIn(rec.check_in_time || '');
    setEditCheckOut(rec.check_out_time || '');
    setEditStatus(rec.status || '');
    setEditAuditReason('');
    setEditError(null);
  };

  const handleSaveManualEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    setEditError(null);
    try {
      const receipt = await manualEditAttendance({
        attendanceId: editingRecord.id,
        auditReason: editAuditReason,
        checkInTime: editCheckIn.trim() || undefined,
        checkOutTime: editCheckOut.trim() || undefined,
        status: editStatus.trim() || undefined,
        method: 'PATCH',
      }).unwrap();
      onSuccessToast(receipt.message || 'Attendance record updated.');
      setEditingRecord(null);
    } catch (err) {
      const apiErr = asApiError(err);
      setEditError(apiErr?.message || 'Unable to update attendance record.');
    }
  };

  const handleExportDownload = async (kind: 'face_xlsx' | 'core_csv') => {
    setIsExporting(true);
    setExportError(null);
    try {
      const res =
        kind === 'face_xlsx'
          ? await downloadExportsFaceAttendance({
              format: 'xlsx',
              date_from: ui.startDate || undefined,
              branch: ui.branchFilter || undefined,
              department: ui.departmentFilter || undefined,
            })
          : await downloadAttendanceExport({
              from_date: ui.startDate || undefined,
              to_date: ui.endDate || undefined,
            });
      if (!res.ok) {
        setExportError(res.error.message);
      } else {
        onSuccessToast(`Downloaded ${res.filename}`);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const activeHistoryQuery =
    effectiveHistoryScope === 'company'
      ? companyHistoryQuery
      : effectiveHistoryScope === 'team'
      ? teamHistoryQuery
      : personalHistoryQuery;

  const historyError = asApiError(activeHistoryQuery.error);
  const historyData = activeHistoryQuery.data;
  const totalPages = historyData
    ? Math.max(1, Math.ceil(historyData.total / Math.max(1, historyData.limit)))
    : 1;

  const handleStepMonth = (delta: number) => {
    let nextMonth = ui.selectedCalendarMonth + delta;
    let nextYear = ui.selectedCalendarYear;
    if (nextMonth < 1) {
      nextMonth = 12;
      nextYear -= 1;
    } else if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    dispatch(setSelectedCalendarPeriod({ month: nextMonth, year: nextYear }));
  };

  return (
    <div className="flex flex-col gap-2 md:gap-3">
      {/* Underlined Sub-Tabs: Today | History | Corrections */}
      <div className="w-full md:rounded-lg md:overflow-hidden md:border md:border-[#E5E7EB]">
        <LinkedInTopTabs
          tabs={SUB_TABS}
          activeTab={ui.activeSubTab}
          onSelect={(tab) => dispatch(setAttendanceSubTab(tab))}
          ariaLabel="Attendance sections"
        />
      </div>

      {/* =================================================================== */}
      {/* TAB 1: TODAY (Enrollment, Live Biometric Punch, Breaks & Calendar)  */}
      {/* =================================================================== */}
      {ui.activeSubTab === 'today' ? (
        <div className="flex flex-col gap-2 md:gap-3">
          <LinkedInSection>
            <div className="flex items-start justify-between gap-3 px-4 py-4 border-b border-[#E5E7EB]">
              <div className="min-w-0">
                <h1 className="text-[16px] font-semibold text-[#171717] tracking-[-0.01em]">
                  {employeeDisplayName ? `${employeeDisplayName} · Attendance` : 'My Attendance'}
                </h1>
                <p className="mt-0.5 text-[12px] text-[#666666]">
                  Timezone: {businessTz}
                  {faceMeQuery.data?.shift?.name
                    ? ` · Shift: ${faceMeQuery.data.shift.name} (${faceMeQuery.data.shift.start_time || '--:--'} – ${faceMeQuery.data.shift.end_time || '--:--'})`
                    : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRefreshAll}
                aria-label="Refresh attendance status"
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2.5 text-[12px] font-semibold text-[#171717] hover:bg-[#F3F2EF] cursor-pointer"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    faceMeQuery.isFetching || faceStatusQuery.isFetching ? 'animate-spin' : ''
                  }`}
                />
                Refresh
              </button>
            </div>

            {isStatusLoading ? (
              <LinkedInLoadingRows rows={3} />
            ) : primaryError?.isPermissionDenied ? (
              <div className="px-4 py-6 text-center space-y-2" role="alert">
                <ShieldAlert className="h-6 w-6 text-[#B45309] mx-auto" strokeWidth={1.85} />
                <p className="text-[14px] font-semibold text-[#171717]">
                  Access restricted by server
                </p>
                <p className="text-[12px] text-[#666666] max-w-md mx-auto">
                  {primaryError.message}
                </p>
              </div>
            ) : primaryError ? (
              <LinkedInErrorState
                message={
                  primaryError.retryAfterSeconds
                    ? `${primaryError.message} (Retry after ${primaryError.retryAfterSeconds}s)`
                    : primaryError.message
                }
                onRetry={handleRefreshAll}
              />
            ) : actionState.flowState === 'missing_profile' ? (
              <div className="px-4 py-6 text-center space-y-2">
                <AlertCircle className="h-6 w-6 text-[#B45309] mx-auto" strokeWidth={1.85} />
                <p className="text-[14px] font-semibold text-[#171717]">
                  Employee profile not linked
                </p>
                <p className="text-[12px] text-[#666666] max-w-md mx-auto">
                  The server did not return an employee profile for this account. Contact HR Admin
                  to link your employee record before enrolling or punching attendance.
                </p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Status Banner Driven Strictly by Backend Flags */}
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-3.5">
                  <div className="min-w-0">
                    <p className="text-[12px] font-medium text-[#666666]">
                      Current server status
                    </p>
                    <p className="mt-0.5 text-[15px] font-semibold text-[#171717]">
                      {actionState.flowState === 'not_enrolled'
                        ? 'Face enrollment required'
                        : actionState.flowState === 'no_record_today'
                        ? 'Not checked in today'
                        : actionState.flowState === 'on_break'
                        ? 'On break'
                        : actionState.flowState === 'checked_in'
                        ? 'Checked in'
                        : 'Checked out for today'}
                    </p>
                    <p className="mt-0.5 text-[12px] text-[#666666] tabular-nums">
                      {todayRec?.check_in_time
                        ? `In: ${formatIsoTimestampInTimezone(todayRec.check_in_time, businessTz)}`
                        : 'In: —'}{' '}
                      ·{' '}
                      {todayRec?.check_out_time
                        ? `Out: ${formatIsoTimestampInTimezone(todayRec.check_out_time, businessTz)}`
                        : 'Out: —'}{' '}
                      · Worked:{' '}
                      {formatMinutesAsDuration(
                        todayRec?.worked_minutes ?? todayRec?.work_duration_minutes ?? null
                      )}
                    </p>
                  </div>

                  <div className="text-right text-[12px] text-[#666666] tabular-nums">
                    <p className="font-medium text-[#171717]">
                      {faceStatusQuery.data?.is_enrolled ? 'Face enrolled' : 'Not enrolled'}
                    </p>
                    {faceStatusQuery.data?.enrolled_at ? (
                      <p>
                        {formatDateInBusinessTimezone(
                          faceStatusQuery.data.enrolled_at,
                          businessTz
                        )}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Active Break Notice */}
                {activeBreak ? (
                  <div className="flex items-center justify-between gap-3 rounded-md border border-[#FDE68A] bg-[#FFFBEB] px-3.5 py-2.5 text-[12px] text-[#92400E]">
                    <div className="flex items-center gap-2">
                      <Coffee className="h-4 w-4 shrink-0" />
                      <span>
                        Active break since{' '}
                        <strong className="tabular-nums">
                          {formatIsoTimestampInTimezone(activeBreak.start_time, businessTz)}
                        </strong>
                      </span>
                    </div>
                    <span className="font-semibold">
                      {activeBreak.status || 'Active'}
                    </span>
                  </div>
                ) : null}

                {/* Work Mode Selector (for punch actions) */}
                {actionState.canCheckIn || actionState.canCheckOut ? (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[12px] font-medium text-[#404040]">
                        Work mode
                      </span>
                      <span className="text-[11px] text-[#666666]">
                        Server enforces geofence policy
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {WORK_MODE_OPTIONS.map((opt) => {
                        const active = ui.selectedWorkMode === opt.id;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => dispatch(setSelectedWorkMode(opt.id))}
                            className={`h-9 rounded-md border text-[12px] font-medium transition-colors cursor-pointer ${
                              active
                                ? 'border-[#0A66C2] bg-[#EFF6FF] text-[#0A66C2] font-semibold'
                                : 'border-[#E5E7EB] bg-white text-[#404040] hover:bg-[#F3F2EF]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Action Buttons Strictly Driven by Server Flags */}
                <div className="flex flex-wrap items-center gap-2">
                  {actionState.canEnroll ? (
                    <button
                      type="button"
                      onClick={() => setCaptureAction('enroll')}
                      className="inline-flex h-10 items-center gap-2 rounded-md bg-[#0A66C2] px-4 text-[13px] font-semibold text-white hover:bg-[#004182] cursor-pointer"
                    >
                      <ScanFace className="h-4 w-4" />
                      Enroll face
                    </button>
                  ) : null}

                  {actionState.canCheckIn ? (
                    <button
                      type="button"
                      onClick={() => setCaptureAction('check_in')}
                      className="inline-flex h-10 items-center gap-2 rounded-md bg-[#0A66C2] px-4 text-[13px] font-semibold text-white hover:bg-[#004182] cursor-pointer"
                    >
                      <ScanFace className="h-4 w-4" />
                      Face check-in
                    </button>
                  ) : null}

                  {actionState.canStartBreak ? (
                    <button
                      type="button"
                      onClick={() => setCaptureAction('break_start')}
                      className="inline-flex h-10 items-center gap-2 rounded-md border border-[#E5E7EB] bg-white px-4 text-[13px] font-semibold text-[#171717] hover:bg-[#F3F2EF] cursor-pointer"
                    >
                      <Coffee className="h-4 w-4" />
                      Start break
                    </button>
                  ) : null}

                  {actionState.canEndBreak ? (
                    <button
                      type="button"
                      onClick={() => setCaptureAction('break_end')}
                      className="inline-flex h-10 items-center gap-2 rounded-md bg-[#0A66C2] px-4 text-[13px] font-semibold text-white hover:bg-[#004182] cursor-pointer"
                    >
                      <Coffee className="h-4 w-4" />
                      End break
                    </button>
                  ) : null}

                  {actionState.canCheckOut ? (
                    <button
                      type="button"
                      onClick={() => setCaptureAction('check_out')}
                      className="inline-flex h-10 items-center gap-2 rounded-md border border-[#0A66C2] bg-white px-4 text-[13px] font-semibold text-[#0A66C2] hover:bg-[#EFF6FF] cursor-pointer"
                    >
                      <Clock className="h-4 w-4" />
                      Face check-out
                    </button>
                  ) : null}

                  {actionState.canExplicitReEnroll ? (
                    <button
                      type="button"
                      onClick={() => setCaptureAction('re_enroll')}
                      className="inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-[12px] font-semibold text-[#666666] hover:bg-[#F3F2EF] hover:text-[#171717] cursor-pointer ml-auto"
                    >
                      Replace enrolled face
                    </button>
                  ) : null}
                </div>

                {/* Today's Breaks List from Server */}
                {faceMeQuery.data?.breaks && faceMeQuery.data.breaks.length > 0 ? (
                  <div className="border-t border-[#E5E7EB] pt-3 space-y-2">
                    <h2 className="text-[13px] font-semibold text-[#171717]">
                      Breaks today ({faceMeQuery.data.breaks.length})
                    </h2>
                    <div className="divide-y divide-[#E5E7EB] rounded-md border border-[#E5E7EB]">
                      {faceMeQuery.data.breaks.map((brk) => (
                        <div
                          key={brk.id}
                          className="flex items-center justify-between px-3 py-2 text-[12px]"
                        >
                          <span className="text-[#171717] tabular-nums">
                            {formatIsoTimestampInTimezone(brk.start_time, businessTz)} –{' '}
                            {brk.end_time
                              ? formatIsoTimestampInTimezone(brk.end_time, businessTz)
                              : 'Active'}
                          </span>
                          <span className="text-[#666666] tabular-nums">
                            {formatMinutesAsDuration(brk.duration_minutes)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </LinkedInSection>

          {/* Company KPIs (Authorized Admin/Manager Only, strictly from /face/analytics) */}
          {isManagerOrAdmin ? (
            <LinkedInSection>
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
                <h2 className="text-[15px] font-semibold text-[#171717]">
                  Company attendance KPIs
                </h2>
                <span className="text-[11px] text-[#666666]">
                  Live backend summary
                </span>
              </div>
              {faceAnalyticsQuery.isLoading ? (
                <LinkedInLoadingRows rows={2} />
              ) : faceAnalyticsQuery.isError ? (
                <LinkedInErrorState
                  message={
                    asApiError(faceAnalyticsQuery.error)?.message ||
                    'Unable to load company attendance KPIs.'
                  }
                  onRetry={() => void faceAnalyticsQuery.refetch()}
                />
              ) : faceAnalyticsQuery.data ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-[#E5E7EB]">
                  <div className="p-4 border-r border-b sm:border-b-0 border-[#E5E7EB]">
                    <span className="text-[12px] text-[#666666]">Present</span>
                    <p className="mt-1 text-[20px] font-semibold text-[#15803D] tabular-nums">
                      {faceAnalyticsQuery.data.present_count ?? '—'}
                    </p>
                  </div>
                  <div className="p-4 sm:border-r border-b sm:border-b-0 border-[#E5E7EB]">
                    <span className="text-[12px] text-[#666666]">Late</span>
                    <p className="mt-1 text-[20px] font-semibold text-[#B45309] tabular-nums">
                      {faceAnalyticsQuery.data.late_count ?? '—'}
                    </p>
                  </div>
                  <div className="p-4 border-r border-[#E5E7EB]">
                    <span className="text-[12px] text-[#666666]">Absent</span>
                    <p className="mt-1 text-[20px] font-semibold text-[#B91C1C] tabular-nums">
                      {faceAnalyticsQuery.data.absent_count ?? '—'}
                    </p>
                  </div>
                  <div className="p-4">
                    <span className="text-[12px] text-[#666666]">Rate</span>
                    <p className="mt-1 text-[20px] font-semibold text-[#171717] tabular-nums">
                      {faceAnalyticsQuery.data.attendance_rate != null
                        ? `${faceAnalyticsQuery.data.attendance_rate}%`
                        : '—'}
                    </p>
                  </div>
                </div>
              ) : null}
            </LinkedInSection>
          ) : null}

          {/* Monthly Calendar (always sends explicit month & year) */}
          <LinkedInSection>
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#404040]" strokeWidth={1.85} />
                <h2 className="text-[15px] font-semibold text-[#171717]">
                  {MONTH_NAMES[ui.selectedCalendarMonth - 1]} {ui.selectedCalendarYear}
                </h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={() => handleStepMonth(-1)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#404040] hover:bg-[#F3F2EF] cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={() => handleStepMonth(1)}
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E5E7EB] text-[#404040] hover:bg-[#F3F2EF] cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            {calendarQuery.isLoading ? (
              <LinkedInLoadingRows rows={2} />
            ) : calendarQuery.isError ? (
              <LinkedInErrorState
                message={
                  asApiError(calendarQuery.error)?.message ||
                  'Unable to load monthly attendance calendar.'
                }
                onRetry={() => void calendarQuery.refetch()}
              />
            ) : (
              (() => {
                const days = calendarQuery.data?.calendar || calendarQuery.data?.days || [];
                if (days.length === 0) {
                  return (
                    <LinkedInEmptyState
                      title="No calendar entries for this month"
                      subtitle="Server returned no attendance records for the selected month and year."
                      variant="neutral"
                    />
                  );
                }
                return (
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 p-4">
                    {days.map((entry, index) => {
                      const dateStr = String(entry.date || entry.day || index + 1);
                      const statusStr = String(entry.status || '—');
                      return (
                        <div
                          key={`${dateStr}-${index}`}
                          className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-2 text-center"
                        >
                          <p className="text-[11px] font-semibold text-[#171717] tabular-nums">
                            {dateStr.slice(-2)}
                          </p>
                          <p className="mt-0.5 text-[10px] text-[#666666] truncate">
                            {statusStr}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            )}
          </LinkedInSection>
        </div>
      ) : null}

      {/* =================================================================== */}
      {/* TAB 2: HISTORY (Personal / Team / Company with Server Pagination)   */}
      {/* =================================================================== */}
      {ui.activeSubTab === 'history' ? (
        <LinkedInSection>
          <div className="px-4 py-4 border-b border-[#E5E7EB] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-[16px] font-semibold text-[#171717]">
                  Attendance records
                </h2>
                <p className="text-[12px] text-[#666666]">
                  Server-paginated history scoped by your role permissions
                </p>
              </div>
              {isManagerOrAdmin ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => void handleExportDownload('face_xlsx')}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-semibold text-[#171717] hover:bg-[#F3F2EF] disabled:opacity-50 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export XLSX
                  </button>
                  <button
                    type="button"
                    disabled={isExporting}
                    onClick={() => void handleExportDownload('core_csv')}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 text-[12px] font-semibold text-[#171717] hover:bg-[#F3F2EF] disabled:opacity-50 cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export CSV
                  </button>
                </div>
              ) : null}
            </div>

            {exportError ? (
              <div
                role="alert"
                className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]"
              >
                {exportError}
              </div>
            ) : null}

            {/* Scope Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => dispatch(setHistoryScope('personal'))}
                className={`h-8 rounded-md border px-3 text-[12px] font-semibold cursor-pointer ${
                  effectiveHistoryScope === 'personal'
                    ? 'border-[#0A66C2] bg-[#EFF6FF] text-[#0A66C2]'
                    : 'border-[#E5E7EB] bg-white text-[#404040] hover:bg-[#F3F2EF]'
                }`}
              >
                My history
              </button>
              {isManagerOrAdmin ? (
                <button
                  type="button"
                  onClick={() => dispatch(setHistoryScope('team'))}
                  className={`h-8 rounded-md border px-3 text-[12px] font-semibold cursor-pointer ${
                    effectiveHistoryScope === 'team'
                      ? 'border-[#0A66C2] bg-[#EFF6FF] text-[#0A66C2]'
                      : 'border-[#E5E7EB] bg-white text-[#404040] hover:bg-[#F3F2EF]'
                  }`}
                >
                  Direct reports
                </button>
              ) : null}
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => dispatch(setHistoryScope('company'))}
                  className={`h-8 rounded-md border px-3 text-[12px] font-semibold cursor-pointer ${
                    effectiveHistoryScope === 'company'
                      ? 'border-[#0A66C2] bg-[#EFF6FF] text-[#0A66C2]'
                      : 'border-[#E5E7EB] bg-white text-[#404040] hover:bg-[#F3F2EF]'
                  }`}
                >
                  Company
                </button>
              ) : null}
            </div>

            {/* Date & Company Filters (reset page to 1 on change) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label htmlFor="att-start-date" className="block text-[11px] font-medium text-[#666666] mb-1">
                  Start date
                </label>
                <input
                  id="att-start-date"
                  type="date"
                  value={ui.startDate}
                  onChange={(e) =>
                    dispatch(
                      setHistoryDateRange({
                        startDate: e.target.value,
                        endDate: ui.endDate,
                      })
                    )
                  }
                  className="h-9 w-full rounded-md border border-[#E5E7EB] px-2.5 text-[12px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="att-end-date" className="block text-[11px] font-medium text-[#666666] mb-1">
                  End date
                </label>
                <input
                  id="att-end-date"
                  type="date"
                  value={ui.endDate}
                  onChange={(e) =>
                    dispatch(
                      setHistoryDateRange({
                        startDate: ui.startDate,
                        endDate: e.target.value,
                      })
                    )
                  }
                  className="h-9 w-full rounded-md border border-[#E5E7EB] px-2.5 text-[12px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
                />
              </div>
              {effectiveHistoryScope === 'company' ? (
                <>
                  <div>
                    <label htmlFor="att-branch" className="block text-[11px] font-medium text-[#666666] mb-1">
                      Branch
                    </label>
                    <input
                      id="att-branch"
                      type="text"
                      value={ui.branchFilter}
                      onChange={(e) =>
                        dispatch(setCompanyHistoryFilters({ branch: e.target.value }))
                      }
                      placeholder="All branches"
                      className="h-9 w-full rounded-md border border-[#E5E7EB] px-2.5 text-[12px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="att-dept" className="block text-[11px] font-medium text-[#666666] mb-1">
                      Department
                    </label>
                    <input
                      id="att-dept"
                      type="text"
                      value={ui.departmentFilter}
                      onChange={(e) =>
                        dispatch(setCompanyHistoryFilters({ department: e.target.value }))
                      }
                      placeholder="All departments"
                      className="h-9 w-full rounded-md border border-[#E5E7EB] px-2.5 text-[12px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
                    />
                  </div>
                </>
              ) : null}
            </div>
          </div>

          {activeHistoryQuery.isLoading ? (
            <LinkedInLoadingRows rows={4} />
          ) : historyError ? (
            <LinkedInErrorState
              message={historyError.message}
              onRetry={() => void activeHistoryQuery.refetch()}
            />
          ) : !historyData || historyData.items.length === 0 ? (
            <LinkedInEmptyState
              title="No attendance records found"
              subtitle="Adjust the date range or filters to inspect another period."
              variant="neutral"
            />
          ) : (
            <>
              <div className="divide-y divide-[#E5E7EB]">
                {historyData.items.map((item) => {
                  const rowName =
                    item.employee_name ||
                    [item.first_name, item.last_name].filter(Boolean).join(' ') ||
                    'Employee';
                  const rowDate = formatDateInBusinessTimezone(
                    item.date || item.attendance_date,
                    businessTz
                  );
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 px-4 py-3.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[14px] font-semibold text-[#171717]">
                          {effectiveHistoryScope === 'personal' ? rowDate : rowName}
                          {effectiveHistoryScope !== 'personal' ? (
                            <span className="font-normal text-[#666666]"> · {rowDate}</span>
                          ) : null}
                        </p>
                        <p className="mt-0.5 text-[12px] text-[#666666] tabular-nums">
                          In: {formatIsoTimestampInTimezone(item.check_in_time, businessTz)} · Out:{' '}
                          {formatIsoTimestampInTimezone(item.check_out_time, businessTz)} · Worked:{' '}
                          {formatMinutesAsDuration(item.worked_minutes)}
                        </p>
                        {item.department || item.work_mode || item.geofence_status ? (
                          <p className="mt-0.5 text-[11px] text-[#666666]">
                            {[item.department, item.work_mode, item.geofence_status]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[12px] font-semibold text-[#171717]">
                          {item.status || 'Recorded'}
                        </span>
                        {isManagerOrAdmin ? (
                          <button
                            type="button"
                            aria-label={`Edit attendance ${item.id}`}
                            onClick={() => handleOpenManualEdit(item)}
                            className="inline-flex h-8 items-center gap-1 rounded-md border border-[#E5E7EB] px-2.5 text-[12px] font-semibold text-[#0A66C2] hover:bg-[#F3F2EF] cursor-pointer"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            Edit
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Server Pagination Bar */}
              <div className="flex items-center justify-between border-t border-[#E5E7EB] px-4 py-3 text-[12px] text-[#666666]">
                <span className="tabular-nums">
                  Page {historyData.page} of {totalPages} · {historyData.total} total
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={ui.page <= 1}
                    onClick={() => dispatch(setHistoryPage(ui.page - 1))}
                    className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 font-semibold text-[#171717] hover:bg-[#F3F2EF] disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={ui.page >= totalPages}
                    onClick={() => dispatch(setHistoryPage(ui.page + 1))}
                    className="h-8 rounded-md border border-[#E5E7EB] bg-white px-3 font-semibold text-[#171717] hover:bg-[#F3F2EF] disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </LinkedInSection>
      ) : null}

      {/* =================================================================== */}
      {/* TAB 3: REGULARIZATION / CORRECTIONS                                 */}
      {/* =================================================================== */}
      {ui.activeSubTab === 'regularization' ? (
        <div className="flex flex-col gap-2 md:gap-3">
          {/* Submit Correction Form (POST /api/v1/attendance/regularization) */}
          <LinkedInSection>
            <div className="px-4 py-4 border-b border-[#E5E7EB]">
              <h2 className="text-[16px] font-semibold text-[#171717]">
                Submit attendance correction
              </h2>
              <p className="mt-0.5 text-[12px] text-[#666666]">
                Submitted corrections remain pending until reviewed through HR administration.
              </p>
            </div>
            <form onSubmit={handleRegularizationSubmit} className="p-4 space-y-3">
              {regError ? (
                <div
                  role="alert"
                  className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]"
                >
                  {regError}
                </div>
              ) : null}

              {regSubmittedReceipt ? (
                <div
                  role="status"
                  className="rounded-md border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-[12px] text-[#15803D]"
                >
                  Request #{regSubmittedReceipt.id} recorded with status:{' '}
                  <strong>{regSubmittedReceipt.status}</strong>.
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="reg-date"
                    className="block text-[12px] font-medium text-[#404040] mb-1"
                  >
                    Request date *
                  </label>
                  <input
                    id="reg-date"
                    type="date"
                    required
                    value={regDate}
                    onChange={(e) => setRegDate(e.target.value)}
                    className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reg-checkin"
                    className="block text-[12px] font-medium text-[#404040] mb-1"
                  >
                    Requested check-in (ISO timestamp)
                  </label>
                  <input
                    id="reg-checkin"
                    type="text"
                    value={regCheckIn}
                    onChange={(e) => setRegCheckIn(e.target.value)}
                    placeholder="2026-11-23T09:00:00Z"
                    className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="reg-checkout"
                    className="block text-[12px] font-medium text-[#404040] mb-1"
                  >
                    Requested check-out (ISO timestamp)
                  </label>
                  <input
                    id="reg-checkout"
                    type="text"
                    value={regCheckOut}
                    onChange={(e) => setRegCheckOut(e.target.value)}
                    placeholder="2026-11-23T18:00:00Z"
                    className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-reason"
                  className="block text-[12px] font-medium text-[#404040] mb-1"
                >
                  Reason *
                </label>
                <textarea
                  id="reg-reason"
                  required
                  rows={2}
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  placeholder="Describe why this attendance date needs regularization"
                  className="w-full rounded-md border border-[#E5E7EB] p-3 text-[13px] text-[#171717] focus:border-[#0A66C2] focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingReg}
                  className="h-9 rounded-md bg-[#0A66C2] px-4 text-[13px] font-semibold text-white hover:bg-[#004182] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingReg ? 'Submitting…' : 'Submit correction'}
                </button>
              </div>
            </form>
          </LinkedInSection>

          {/* Company Regularization Queue — Authorized Admin/Manager Only */}
          {isManagerOrAdmin ? (
            <LinkedInSection>
              <div className="px-4 py-3 border-b border-[#E5E7EB]">
                <h2 className="text-[15px] font-semibold text-[#171717]">
                  Company regularization requests
                </h2>
                <p className="mt-0.5 text-[12px] text-[#666666]">
                  Approve/reject actions are unavailable in this backend contract snapshot; use
                  manual attendance edit for approved adjustments.
                </p>
              </div>
              {regularizationsQuery.isLoading ? (
                <LinkedInLoadingRows rows={3} />
              ) : regularizationsQuery.isError ? (
                <LinkedInErrorState
                  message={
                    asApiError(regularizationsQuery.error)?.message ||
                    'Unable to load regularization requests.'
                  }
                  onRetry={() => void regularizationsQuery.refetch()}
                />
              ) : !regularizationsQuery.data || regularizationsQuery.data.items.length === 0 ? (
                <LinkedInEmptyState
                  title="No regularization requests"
                  subtitle="Submitted attendance corrections will appear here."
                  variant="neutral"
                />
              ) : (
                <div className="divide-y divide-[#E5E7EB]">
                  {regularizationsQuery.data.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 px-4 py-3.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-semibold text-[#171717]">
                          {item.employee_name || item.employee_id || 'Employee'} ·{' '}
                          <span className="font-normal text-[#666666] tabular-nums">
                            {item.request_date}
                          </span>
                        </p>
                        <p className="mt-0.5 text-[12px] text-[#404040]">{item.reason}</p>
                      </div>
                      <span className="shrink-0 text-[12px] font-semibold text-[#B45309]">
                        {item.status || 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </LinkedInSection>
          ) : (
            <LinkedInSection>
              <div className="px-4 py-4 text-[12px] text-[#666666] flex items-start gap-2">
                <UserCheck className="h-4 w-4 text-[#404040] shrink-0 mt-0.5" />
                <p>
                  Personal regularization request history is not exposed as a self-scoped read
                  endpoint in the current attendance API contract. Your newly submitted receipt
                  status is shown directly above.
                </p>
              </div>
            </LinkedInSection>
          )}
        </div>
      ) : null}

      {/* Live Biometric Capture Modal (Opened ONLY for selected action) */}
      <CameraCaptureModal
        open={captureAction !== null}
        action={captureAction}
        workMode={ui.selectedWorkMode}
        punchContract={ui.punchContract}
        onClose={() => setCaptureAction(null)}
        onSuccess={(msg) => {
          onSuccessToast(msg);
          void faceStatusQuery.refetch();
          void faceMeQuery.refetch();
        }}
        onReconcileToday={() => {
          void faceMeQuery.refetch();
          void faceStatusQuery.refetch();
        }}
      />

      {/* Manual Attendance Edit Modal (PATCH /api/v1/attendance/{attendance_id}) */}
      {editingRecord ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Edit attendance record"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 md:p-4"
          onClick={() => setEditingRecord(null)}
        >
          <form
            onSubmit={handleSaveManualEdit}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[460px] bg-white rounded-t-lg md:rounded-lg border border-[#E5E7EB] overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 h-13">
              <h3 className="text-[15px] font-semibold text-[#171717]">
                Manual attendance edit
              </h3>
              <button
                type="button"
                aria-label="Close manual edit"
                onClick={() => setEditingRecord(null)}
                className="flex h-9 w-9 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {editError ? (
                <div
                  role="alert"
                  className="rounded-md border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-[12px] text-[#B91C1C]"
                >
                  {editError}
                </div>
              ) : null}

              <div>
                <label htmlFor="edit-checkin" className="block text-[12px] font-medium text-[#404040] mb-1">
                  Check-in time (ISO 8601)
                </label>
                <input
                  id="edit-checkin"
                  type="text"
                  value={editCheckIn}
                  onChange={(e) => setEditCheckIn(e.target.value)}
                  className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717]"
                />
              </div>

              <div>
                <label htmlFor="edit-checkout" className="block text-[12px] font-medium text-[#404040] mb-1">
                  Check-out time (ISO 8601)
                </label>
                <input
                  id="edit-checkout"
                  type="text"
                  value={editCheckOut}
                  onChange={(e) => setEditCheckOut(e.target.value)}
                  className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717]"
                />
              </div>

              <div>
                <label htmlFor="edit-status" className="block text-[12px] font-medium text-[#404040] mb-1">
                  Status
                </label>
                <input
                  id="edit-status"
                  type="text"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  placeholder="present / late / half_day"
                  className="h-10 w-full rounded-md border border-[#E5E7EB] px-3 text-[13px] text-[#171717]"
                />
              </div>

              <div>
                <label htmlFor="edit-reason" className="block text-[12px] font-medium text-[#404040] mb-1">
                  Audit reason *
                </label>
                <textarea
                  id="edit-reason"
                  required
                  rows={2}
                  value={editAuditReason}
                  onChange={(e) => setEditAuditReason(e.target.value)}
                  placeholder="Provide a meaningful audit reason for this correction"
                  className="w-full rounded-md border border-[#E5E7EB] p-3 text-[13px] text-[#171717]"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-[#E5E7EB] px-4 py-3">
              <button
                type="button"
                onClick={() => setEditingRecord(null)}
                className="h-9 rounded-md border border-[#E5E7EB] bg-white px-4 text-[13px] font-medium text-[#171717] hover:bg-[#F3F2EF] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingEdit}
                className="h-9 rounded-md bg-[#0A66C2] px-4 text-[13px] font-semibold text-white hover:bg-[#004182] disabled:opacity-50 cursor-pointer"
              >
                {isSavingEdit ? 'Saving…' : 'Save correction'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
