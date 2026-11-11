'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  EyeOff,
  FileText,
  LayoutGrid,
  LogOut,
  MapPin,
  Pin,
  PinOff,
  Play,
  Plus,
  Search,
  Settings,
  ShieldAlert,
  Square,
  Table,
  User,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  ApplyLeavePayload,
  ProfileSummaryResponse,
  PunchActionPayload,
  RegularizationSubmitPayload,
} from '../../types/employeeDashboard';
import {
  computeLiveWorkingHoursDisplay,
  computeServerClockOffsetMs,
  employeeAttendanceSummaryApi,
  employeeLeaveApi,
  employeePaySnapshotApi,
  employeeQuickActionsApi,
  employeeTodayApi,
  formatEmployeeDateOnly,
  formatEmployeeShiftWindow,
} from '../../services/employee-dashboard';
import {
  ConfirmActionDialog,
  useWidgetResource,
  WidgetCard,
} from './EmployeeDashboardPrimitives';

// ============================================================================
// 1. HEADER & PROFILE SUMMARY
// ============================================================================
export interface EmployeeHeaderProfileProps {
  profile: ProfileSummaryResponse | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  unreadCount: number;
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenPersonalize: () => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleDark: () => void;
}

export function EmployeeHeaderProfileWidget({
  profile,
  loading,
  error,
  onRetry,
  unreadCount,
  onOpenSearch,
  onOpenNotifications,
  onOpenPersonalize,
  onLogout,
  isDark,
  onToggleDark,
}: EmployeeHeaderProfileProps) {
  const [localTimeStr, setLocalTimeStr] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Welcome');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const tz = profile?.timezone || undefined;
      try {
        const timeFormatted = new Intl.DateTimeFormat('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: tz,
        }).format(now);
        setLocalTimeStr(timeFormatted);
      } catch {
        setLocalTimeStr(
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
      }
      const hr = now.getHours();
      if (hr < 12) setGreeting('Good morning');
      else if (hr < 17) setGreeting('Good afternoon');
      else setGreeting('Good evening');
    };
    updateClock();
    const timer = setInterval(updateClock, 30000);
    return () => clearInterval(timer);
  }, [profile?.timezone]);

  return (
    <header
      data-testid="employee-dashboard-header"
      className={`rounded-2xl border p-5 transition-colors ${
        isDark
          ? 'border-slate-800 bg-slate-900 text-slate-100'
          : 'border-slate-200 bg-white text-slate-900'
      }`}
    >
      {/* Top Bar Contract: Brand / Breadcrumb | Search & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/70 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-base font-bold tracking-tight text-indigo-600 dark:text-indigo-400"
          >
            OFC360 Employee Self-Service
          </Link>
          <span aria-hidden="true" className="text-slate-400">
            /
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            My Dashboard
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenSearch}
            data-testid="open-global-search-btn"
            aria-label="Search colleagues, policies, help articles, and pages"
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-medium transition ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search colleagues, policies, help...</span>
          </button>

          <button
            type="button"
            onClick={onOpenPersonalize}
            data-testid="open-layout-personalize-btn"
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>Customize Widgets</span>
          </button>

          <button
            type="button"
            onClick={onToggleDark}
            aria-label="Toggle color theme"
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-200'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </button>

          <button
            type="button"
            onClick={onOpenNotifications}
            data-testid="open-notifications-bell-btn"
            aria-label={`Notifications (${unreadCount} unread)`}
            className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl border transition ${
              isDark
                ? 'border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 font-mono text-[10px] font-bold text-white tabular-nums">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              aria-expanded={profileMenuOpen}
              aria-label="Open profile menu"
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-200'
                  : 'border-slate-200 bg-slate-50 text-slate-800'
              }`}
            >
              <User className="h-3.5 w-3.5 text-indigo-600" />
              <span>Account</span>
            </button>
            {profileMenuOpen && (
              <div
                role="menu"
                className={`absolute right-0 z-30 mt-2 w-48 rounded-xl border p-1.5 shadow-lg ${
                  isDark
                    ? 'border-slate-700 bg-slate-900 text-slate-100'
                    : 'border-slate-200 bg-white text-slate-800'
                }`}
              >
                <Link
                  href="/onboarding"
                  role="menuitem"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <User className="h-3.5 w-3.5" />
                  My Profile
                </Link>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onOpenPersonalize();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Settings className="h-3.5 w-3.5" />
                  Dashboard Layout Settings
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setProfileMenuOpen(false);
                    onLogout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Summary Body */}
      {loading ? (
        <div className="mt-4 flex animate-pulse items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      ) : error || !profile ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 text-xs text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
          <span>
            {error ||
              'Profile summary endpoint not reachable. Connect /api/v1/employee-dashboard/profile-summary.'}
          </span>
          <button
            type="button"
            onClick={onRetry}
            className="rounded-lg bg-rose-600 px-3 py-1.5 font-semibold text-white hover:bg-rose-700"
          >
            Retry Profile Sync
          </button>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-center">
          <div className="flex items-center gap-4 lg:col-span-7">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 font-mono text-lg font-bold text-white">
              {profile.fullName
                .split(/\s+/)
                .map((p) => p[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                {greeting}, {profile.fullName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                  {profile.employeeCode}
                </span>
                <span aria-hidden="true">·</span>
                <span>{profile.designation}</span>
                <span aria-hidden="true">·</span>
                <span>{profile.department}</span>
                <span aria-hidden="true">·</span>
                <span>Reports to {profile.reportingManagerName}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">
                  Local time: {localTimeStr} ({profile.timezone})
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 p-3.5 lg:col-span-5 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">Profile Completion</span>
              <span className="font-mono font-bold text-indigo-600 tabular-nums dark:text-indigo-400">
                {profile.profileCompletionPct}%
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(0, profile.profileCompletionPct)
                  )}%`,
                }}
              />
            </div>
            {profile.missingProfileItems.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="text-slate-500">Missing:</span>
                {profile.missingProfileItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.deepLinkPath}
                    className="font-semibold text-indigo-600 underline-offset-2 hover:underline dark:text-indigo-400"
                  >
                    {item.label} (+{item.impactWeightPct}%)
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

// ============================================================================
// 2. TODAY WIDGET (PUNCH & STATUS + LIVE WORKING HOURS TIMER)
// ============================================================================
export interface TodayPunchStatusWidgetProps {
  isDark: boolean;
  isOffline: boolean;
  externalOpenRegularize?: boolean;
  onCloseExternalRegularize?: () => void;
}

export function TodayPunchStatusWidget({
  isDark,
  isOffline,
  externalOpenRegularize = false,
  onCloseExternalRegularize,
}: TodayPunchStatusWidgetProps) {
  const {
    data,
    loading,
    error,
    permissionDenied,
    notApplicable,
    asOf,
    refresh,
    setData,
  } = useWidgetResource((signal) =>
    employeeTodayApi.getTodayStatus({ signal })
  );

  const [workMode, setWorkMode] =
    useState<PunchActionPayload['workMode']>('Office');
  const [submittingPunch, setSubmittingPunch] = useState(false);
  const [submittingBreak, setSubmittingBreak] = useState(false);
  const [punchFeedback, setPunchFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [manualReason, setManualReason] = useState('');

  // Regularization Modal State
  const [regModalOpen, setRegModalOpen] = useState(false);
  const [regDate, setRegDate] = useState('');
  const [regCheckIn, setRegCheckIn] = useState('');
  const [regCheckOut, setRegCheckOut] = useState('');
  const [regReason, setRegReason] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);

  const isRegModalOpen = regModalOpen || Boolean(externalOpenRegularize);
  const effectiveRegDate =
    regDate || data?.regularizationPrefill?.dateOnly || data?.dateOnly || '';
  const effectiveRegCheckIn =
    regCheckIn ||
    data?.regularizationPrefill?.suggestedCheckInHHMM ||
    data?.shiftStartHHMM ||
    '';
  const effectiveRegCheckOut =
    regCheckOut ||
    data?.regularizationPrefill?.suggestedCheckOutHHMM ||
    data?.shiftEndHHMM ||
    '';
  const effectiveRegReason =
    regReason || data?.regularizationPrefill?.reasonCode || '';

  // Live Working Hours Running Timer (Only allowed client-side calculation)
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!data?.punchInTimeIso || data?.punchOutTimeIso) return;
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [data?.punchInTimeIso, data?.punchOutTimeIso]);

  const clockOffsetMs = computeServerClockOffsetMs(data?.serverTimeIso, nowMs);
  const liveTimer = computeLiveWorkingHoursDisplay(
    data?.punchOutTimeIso ? null : data?.punchInTimeIso,
    clockOffsetMs,
    data?.workedSecondsToday || 0,
    nowMs
  );

  const handlePunchAction = async (action: 'punch-in' | 'punch-out') => {
    if (submittingPunch || isOffline) return;
    if (data?.selfieRequired && !selfieCaptured) {
      setPunchFeedback({
        type: 'error',
        message:
          'Selfie / face verification is required by your shift policy before punching.',
      });
      return;
    }

    setSubmittingPunch(true);
    setPunchFeedback(null);

    let latitude: number | undefined;
    let longitude: number | undefined;

    if (
      typeof navigator !== 'undefined' &&
      'geolocation' in navigator &&
      workMode === 'Office'
    ) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 4000,
          })
        );
        latitude = pos.coords.latitude;
        longitude = pos.coords.longitude;
      } catch {
        // Backend evaluates geo-fence policy when coordinates are unavailable
      }
    }

    try {
      const response = await employeeTodayApi.submitPunch({
        action,
        workMode,
        latitude,
        longitude,
        selfieDataUrl: selfieCaptured ? 'verified-face-frame' : undefined,
        manualReason: manualReason.trim() || undefined,
      });

      if (!response.accepted) {
        setPunchFeedback({
          type: 'error',
          message: response.serverReason,
        });
        toast.error(response.serverReason);
      } else {
        setData(response.updatedToday);
        setPunchFeedback({
          type: 'success',
          message: response.serverReason,
        });
        toast.success(response.serverReason);
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Punch submission failed';
      setPunchFeedback({ type: 'error', message: msg });
      toast.error(msg);
    } finally {
      setSubmittingPunch(false);
    }
  };

  const handleBreakToggle = async (action: 'start' | 'end') => {
    if (submittingBreak || isOffline) return;
    setSubmittingBreak(true);
    try {
      const updated = await employeeTodayApi.toggleBreak(action);
      setData(updated);
      toast.success(
        action === 'start' ? 'Break timer started' : 'Resumed shift from break'
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not update break status'
      );
    } finally {
      setSubmittingBreak(false);
    }
  };

  const openRegularizeModal = () => {
    if (data?.regularizationPrefill) {
      setRegDate(data.regularizationPrefill.dateOnly);
      setRegCheckIn(data.regularizationPrefill.suggestedCheckInHHMM);
      setRegCheckOut(data.regularizationPrefill.suggestedCheckOutHHMM);
      setRegReason(data.regularizationPrefill.reasonCode);
    } else if (data) {
      setRegDate(data.dateOnly);
      setRegCheckIn(data.shiftStartHHMM);
      setRegCheckOut(data.shiftEndHHMM);
    }
    setRegModalOpen(true);
  };

  const handleRegularizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regSubmitting || !effectiveRegDate || !effectiveRegReason.trim()) return;
    setRegSubmitting(true);
    try {
      const payload: RegularizationSubmitPayload = {
        dateOnly: effectiveRegDate,
        requestedCheckInHHMM: effectiveRegCheckIn,
        requestedCheckOutHHMM: effectiveRegCheckOut,
        reason: effectiveRegReason.trim(),
      };
      const res = await employeeTodayApi.submitRegularization(payload);
      toast.success(res.message || 'Regularization request submitted');
      setRegModalOpen(false);
      onCloseExternalRegularize?.();
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to submit attendance regularization'
      );
    } finally {
      setRegSubmitting(false);
    }
  };

  const shiftWindow = data
    ? formatEmployeeShiftWindow(data.shiftStartHHMM, data.shiftEndHHMM)
    : null;

  return (
    <WidgetCard
      id="today"
      title="Today's Attendance & Live Shift Clock"
      subtitle="Geo-fenced web/mobile punch, live server-synced working hours, and regularization"
      asOf={asOf}
      loading={loading}
      error={error}
      permissionDenied={permissionDenied}
      notApplicable={notApplicable}
      isEmpty={!data}
      emptyTitle="Today's shift schedule not assigned"
      emptyMessage="No active shift or attendance state was returned for today."
      onRefresh={refresh}
      isDark={isDark}
    >
      {data && (
        <div className="space-y-4">
          {data.holidayOrWeekOffDetail && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              <p className="font-semibold">
                {data.holidayOrWeekOffDetail.type === 'holiday'
                  ? 'Scheduled Holiday: '
                  : 'Weekly Off: '}
                {data.holidayOrWeekOffDetail.title}
              </p>
              <p className="mt-0.5">
                Next working day:{' '}
                <span className="font-mono font-semibold">
                  {formatEmployeeDateOnly(
                    data.holidayOrWeekOffDetail.nextWorkingDateOnly
                  )}
                </span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800">
              <p className="text-xs text-slate-500">Current Status</p>
              <p
                role="status"
                aria-live="polite"
                className="mt-1 text-base font-bold text-indigo-600 dark:text-indigo-400"
              >
                {data.statusLabel}
              </p>
              <p className="mt-1 font-mono text-[11px] text-slate-500 tabular-nums">
                {formatEmployeeDateOnly(data.dateOnly)} · {data.timezone}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800">
              <p className="text-xs text-slate-500">Live Working Hours</p>
              <p
                data-testid="today-live-timer"
                className="mt-1 font-mono text-xl font-bold tracking-tight tabular-nums"
              >
                {liveTimer.formattedHHMMSS}
              </p>
              <p className="mt-1 text-[11px] text-slate-500">
                In: {data.punchInDisplay || '—'} · Expected Out:{' '}
                {data.expectedOutTimeDisplay || '—'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800">
              <p className="text-xs text-slate-500">Assigned Shift & Hub</p>
              <p className="mt-1 text-xs font-bold">{data.shiftName}</p>
              <p className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
                {shiftWindow?.label}
              </p>
              <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-slate-500">
                <MapPin className="h-3 w-3" />
                {data.geoFenceHubName || data.geoFenceStatus}
              </p>
            </div>
          </div>

          {/* Work Mode & Selfie Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/70 p-3.5 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              {(['Office', 'WFH', 'On-Duty'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setWorkMode(mode)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    workMode === mode
                      ? 'bg-indigo-600 text-white'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {mode}
                </button>
              ))}

              {data.selfieRequired && (
                <button
                  type="button"
                  onClick={() => setSelfieCaptured((v) => !v)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                    selfieCaptured
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 bg-white text-slate-700'
                  }`}
                >
                  <Camera className="h-3.5 w-3.5" />
                  {selfieCaptured ? 'Selfie Verified' : 'Capture Selfie'}
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {!data.punchInTimeIso ? (
                <button
                  type="button"
                  disabled={submittingPunch || isOffline}
                  onClick={() => handlePunchAction('punch-in')}
                  data-testid="punch-in-btn"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Play className="h-3.5 w-3.5" />
                  {submittingPunch ? 'Recording Punch...' : 'Punch In'}
                </button>
              ) : !data.punchOutTimeIso ? (
                <>
                  <button
                    type="button"
                    disabled={submittingBreak || isOffline}
                    onClick={() =>
                      handleBreakToggle(
                        data.breakStatus === 'on-break' ? 'end' : 'start'
                      )
                    }
                    className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200"
                  >
                    {data.breakStatus === 'on-break'
                      ? 'End Break'
                      : 'Start Break'}
                  </button>
                  <button
                    type="button"
                    disabled={submittingPunch || isOffline}
                    onClick={() => handlePunchAction('punch-out')}
                    data-testid="punch-out-btn"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-700 disabled:opacity-50"
                  >
                    <Square className="h-3.5 w-3.5" />
                    {submittingPunch ? 'Punching Out...' : 'Punch Out'}
                  </button>
                </>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Shift Completed ({data.punchOutDisplay})
                </span>
              )}

              {data.missingPunchOrShortHours && (
                <button
                  type="button"
                  onClick={openRegularizeModal}
                  data-testid="open-regularize-btn"
                  className="rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100"
                >
                  Regularize Attendance
                </button>
              )}
            </div>
          </div>

          {data.manualEntryPermitted && (
            <div>
              <input
                type="text"
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                placeholder="Optional manual punch note (permitted by shift policy)..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          )}

          {punchFeedback && (
            <div
              role="status"
              aria-live="polite"
              className={`rounded-xl border p-3 text-xs font-medium ${
                punchFeedback.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-rose-200 bg-rose-50 text-rose-900'
              }`}
            >
              {punchFeedback.message}
            </div>
          )}
        </div>
      )}

      {/* Pre-filled Regularization Modal */}
      {isRegModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Regularize Attendance"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl">
            <h3 className="text-sm font-bold">
              Regularize Missing Punch / Short Hours
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Pre-filled from your shift log. Submitting routes to your
              reporting manager for approval.
            </p>
            <form onSubmit={handleRegularizeSubmit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">Date</label>
                <input
                  type="date"
                  required
                  value={effectiveRegDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold">
                    Check-In (HH:MM)
                  </label>
                  <input
                    type="text"
                    required
                    value={effectiveRegCheckIn}
                    onChange={(e) => setRegCheckIn(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">
                    Check-Out (HH:MM)
                  </label>
                  <input
                    type="text"
                    required
                    value={effectiveRegCheckOut}
                    onChange={(e) => setRegCheckOut(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">
                  Reason *
                </label>
                <textarea
                  rows={2}
                  required
                  value={effectiveRegReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRegModalOpen(false);
                    onCloseExternalRegularize?.();
                  }}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regSubmitting}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  {regSubmitting ? 'Submitting...' : 'Submit Regularization'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}

// ============================================================================
// 3. QUICK ACTIONS WIDGET
// ============================================================================
export interface QuickActionsWidgetProps {
  isDark: boolean;
  onTriggerQuickAction: (moduleKey: string, targetRouteOrModal: string) => void;
}

export function QuickActionsWidget({
  isDark,
  onTriggerQuickAction,
}: QuickActionsWidgetProps) {
  const {
    data,
    loading,
    error,
    permissionDenied,
    notApplicable,
    asOf,
    refresh,
    setData,
  } = useWidgetResource((signal) =>
    employeeQuickActionsApi.getQuickActions({ signal })
  );

  const handleTogglePin = async (actionId: string, currentPinned: boolean) => {
    try {
      const updated = await employeeQuickActionsApi.togglePin(
        actionId,
        !currentPinned
      );
      setData(updated);
      toast.success(
        !currentPinned ? 'Pinned to top of Quick Actions' : 'Unpinned action'
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update pinned state'
      );
    }
  };

  const sortedActions = data?.items
    ? [...data.items].sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return a.usageRank - b.usageRank;
      })
    : [];

  return (
    <WidgetCard
      id="quick-actions"
      title="Quick Actions"
      subtitle="Permission-aware shortcuts ordered by usage frequency and pinned favorites"
      asOf={asOf}
      loading={loading}
      error={error}
      permissionDenied={permissionDenied}
      notApplicable={notApplicable}
      isEmpty={sortedActions.length === 0}
      emptyTitle="No quick actions enabled"
      emptyMessage="Your role has no quick action tiles configured from the API."
      onRefresh={refresh}
      isDark={isDark}
    >
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {sortedActions.map((tile) => (
          <div
            key={tile.id}
            className={`flex items-start justify-between gap-2 rounded-xl border p-3.5 transition ${
              isDark
                ? 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                : 'border-slate-200/80 bg-slate-50/50 hover:border-slate-300'
            }`}
          >
            <button
              type="button"
              onClick={() =>
                onTriggerQuickAction(tile.moduleKey, tile.targetRouteOrModal)
              }
              className="flex-1 text-left"
            >
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {tile.label}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {tile.description}
              </p>
            </button>
            <button
              type="button"
              onClick={() => handleTogglePin(tile.id, tile.pinned)}
              aria-label={
                tile.pinned ? `Unpin ${tile.label}` : `Pin ${tile.label}`
              }
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800"
            >
              {tile.pinned ? (
                <Pin className="h-3.5 w-3.5 text-indigo-600" />
              ) : (
                <PinOff className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        ))}
      </div>
    </WidgetCard>
  );
}

// ============================================================================
// 4. MY ATTENDANCE SUMMARY WIDGET (CALENDAR HEATMAP + TABLE FALLBACK)
// ============================================================================
export function MyAttendanceSummaryWidget({ isDark }: { isDark: boolean }) {
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [showTableView, setShowTableView] = useState<boolean>(false);

  const {
    data,
    loading,
    error,
    permissionDenied,
    notApplicable,
    asOf,
    refresh,
  } = useWidgetResource(
    (signal) =>
      employeeAttendanceSummaryApi.getMonthlySummary(
        selectedMonth || undefined,
        { signal }
      ),
    [selectedMonth]
  );

  const statusTone: Record<string, string> = {
    present: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    late: 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30',
    absent: 'bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-500/30',
    leave: 'bg-violet-500/20 text-violet-800 dark:text-violet-300 border-violet-500/30',
    wfh: 'bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-500/30',
    holiday: 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-500/30',
    'week-off': 'bg-slate-200/70 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300/40',
    regularized: 'bg-teal-500/20 text-teal-800 dark:text-teal-300 border-teal-500/30',
  };

  return (
    <WidgetCard
      id="attendance-summary"
      title="My Attendance Summary"
      subtitle="Monthly calendar heatmap, working hours telemetry, and pending regularizations"
      asOf={asOf}
      loading={loading}
      error={error}
      permissionDenied={permissionDenied}
      notApplicable={notApplicable}
      isEmpty={!data}
      emptyTitle="No attendance summary for selected month"
      emptyMessage="The API returned no attendance days for this period."
      onRefresh={refresh}
      isDark={isDark}
      headerAction={
        <div className="flex items-center gap-2">
          {data?.availableMonths && data.availableMonths.length > 0 && (
            <select
              aria-label="Select attendance month"
              value={selectedMonth || data.month}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-8 rounded-lg border border-slate-200 bg-transparent px-2 font-mono text-xs dark:border-slate-700"
            >
              {data.availableMonths.map((m) => (
                <option key={m.value} value={m.value} className="text-slate-900">
                  {m.label}
                </option>
              ))}
            </select>
          )}
          <button
            type="button"
            onClick={() => setShowTableView((v) => !v)}
            aria-label="Toggle accessible table view"
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium dark:border-slate-700"
          >
            <Table className="h-3.5 w-3.5" />
            {showTableView ? 'Heatmap' : 'Table View'}
          </button>
        </div>
      }
    >
      {data && (
        <div className="space-y-4">
          {/* Stats Strip */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
            {[
              { label: 'Present', value: data.stats.presentDays },
              { label: 'Absent', value: data.stats.absentDays },
              { label: 'Late Marks', value: data.stats.lateMarks },
              { label: 'Early Exits', value: data.stats.earlyExits },
              { label: 'Avg Hours', value: data.stats.averageWorkingHours },
              { label: 'Overtime', value: data.stats.overtimeHours },
              {
                label: 'Pending Reg.',
                value: data.stats.pendingRegularizationsCount,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-slate-200/80 p-2.5 dark:border-slate-800"
              >
                <p className="text-[11px] text-slate-500">{s.label}</p>
                <p className="mt-0.5 font-mono text-sm font-bold tabular-nums">
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          {/* Heatmap or Accessible Table Fallback */}
          {showTableView ? (
            <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 font-semibold dark:border-slate-800 dark:bg-slate-950">
                  <tr>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Check-In</th>
                    <th className="px-3 py-2">Check-Out</th>
                    <th className="px-3 py-2 text-right">Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.calendarDays.map((d) => (
                    <tr key={d.dateOnly}>
                      <td className="px-3 py-2 font-mono tabular-nums">
                        {formatEmployeeDateOnly(d.dateOnly)}
                      </td>
                      <td className="px-3 py-2 font-medium">{d.statusLabel}</td>
                      <td className="px-3 py-2 font-mono tabular-nums">
                        {d.checkInDisplay || '—'}
                      </td>
                      <td className="px-3 py-2 font-mono tabular-nums">
                        {d.checkOutDisplay || '—'}
                      </td>
                      <td className="px-3 py-2 text-right font-mono tabular-nums">
                        {d.workedHoursFormatted || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-7 gap-1.5">
                {data.calendarDays.map((cell) => (
                  <div
                    key={cell.dateOnly}
                    title={cell.tooltipSummary}
                    className={`rounded-lg border p-2 text-center ${
                      statusTone[cell.status] || statusTone.present
                    }`}
                  >
                    <p className="font-mono text-xs font-bold tabular-nums">
                      {cell.dayOfMonth}
                    </p>
                    <p className="truncate text-[10px] font-medium">
                      {cell.statusLabel}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                <span>Legend:</span>
                <span>Present</span>
                <span>·</span>
                <span>WFH</span>
                <span>·</span>
                <span>Late</span>
                <span>·</span>
                <span>Leave</span>
                <span>·</span>
                <span>Holiday / Week-off</span>
                <span>·</span>
                <span>Regularized</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-slate-500">
              {data.pendingRegularizations.length} regularization request(s) in
              workflow
            </span>
            <Link
              href={data.fullAttendanceRoute || '/attendance-analytics'}
              className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Open Full Attendance Analytics →
            </Link>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}

// ============================================================================
// 5. MY LEAVE WIDGET
// ============================================================================
export interface MyLeaveWidgetProps {
  isDark: boolean;
  externalOpenApply?: boolean;
  onCloseExternalApply?: () => void;
}

export function MyLeaveWidget({
  isDark,
  externalOpenApply = false,
  onCloseExternalApply,
}: MyLeaveWidgetProps) {
  const {
    data,
    loading,
    error,
    permissionDenied,
    notApplicable,
    asOf,
    refresh,
  } = useWidgetResource((signal) => employeeLeaveApi.getLeaveSummary({ signal }));

  const [applyOpen, setApplyOpen] = useState(false);
  const [leaveTypeCode, setLeaveTypeCode] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submittingLeave, setSubmittingLeave] = useState(false);

  const [withdrawTargetId, setWithdrawTargetId] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState(false);

  const isApplyModalOpen = applyOpen || Boolean(externalOpenApply);
  const effectiveLeaveTypeCode =
    leaveTypeCode || data?.balances?.[0]?.leaveTypeCode || '';

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      submittingLeave ||
      !effectiveLeaveTypeCode ||
      !startDate ||
      !endDate
    )
      return;
    setSubmittingLeave(true);
    try {
      const payload: ApplyLeavePayload = {
        leaveTypeCode: effectiveLeaveTypeCode,
        startDateOnly: startDate,
        endDateOnly: endDate,
        reason: reason.trim(),
      };
      const res = await employeeLeaveApi.applyLeave(payload);
      toast.success(res.message || 'Leave request submitted');
      setApplyOpen(false);
      onCloseExternalApply?.();
      setReason('');
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to submit leave request'
      );
    } finally {
      setSubmittingLeave(false);
    }
  };

  const handleConfirmWithdraw = async (withdrawReason: string) => {
    if (!withdrawTargetId) return;
    setWithdrawing(true);
    try {
      const res = await employeeLeaveApi.withdrawLeave(
        withdrawTargetId,
        withdrawReason
      );
      toast.success(res.message || 'Leave request withdrawn');
      setWithdrawTargetId(null);
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not withdraw leave request'
      );
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <WidgetCard
      id="leave"
      title="My Leave & Balances"
      subtitle="API-driven leave balances, pending requests, team leave visibility, and holidays"
      asOf={asOf}
      loading={loading}
      error={error}
      permissionDenied={permissionDenied}
      notApplicable={notApplicable}
      isEmpty={!data || data.balances.length === 0}
      emptyTitle="No leave balances configured"
      emptyMessage="Your leave policy balances have not been published by the API."
      emptyCtaLabel="Apply Leave"
      onEmptyCta={() => setApplyOpen(true)}
      onRefresh={refresh}
      isDark={isDark}
      headerAction={
        <button
          type="button"
          onClick={() => setApplyOpen(true)}
          data-testid="open-apply-leave-btn"
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Apply Leave
        </button>
      }
    >
      {data && (
        <div className="space-y-4">
          {/* Dynamic Leave Balance Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {data.balances.map((bal) => (
              <div
                key={bal.leaveTypeCode}
                className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold">{bal.leaveTypeName}</span>
                  <span className="font-mono text-xs text-slate-500">
                    {bal.leaveTypeCode}
                  </span>
                </div>
                <p className="mt-2 font-mono text-xl font-bold text-indigo-600 tabular-nums dark:text-indigo-400">
                  {bal.availableDays}{' '}
                  <span className="text-xs font-normal text-slate-500">
                    available
                  </span>
                </p>
                <p className="mt-1 font-mono text-[11px] text-slate-500 tabular-nums">
                  Used: {bal.usedDays} · Pending: {bal.pendingDays}
                </p>
                {bal.expiryOrLapseInfo && (
                  <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                    {bal.expiryOrLapseInfo}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Pending & Upcoming Requests */}
          {data.pendingRequests.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Pending &amp; Upcoming Requests
              </h3>
              {data.pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/70 p-3 text-xs dark:border-slate-800"
                >
                  <div>
                    <p className="font-semibold">
                      {req.leaveTypeName} ({req.daysCount}d) ·{' '}
                      <span className="font-mono">
                        {formatEmployeeDateOnly(req.startDateOnly)} –{' '}
                        {formatEmployeeDateOnly(req.endDateOnly)}
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Status: {req.status} · Approver: {req.approverName}
                    </p>
                  </div>
                  {req.canWithdraw && (
                    <button
                      type="button"
                      onClick={() => setWithdrawTargetId(req.id)}
                      className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Who's on leave in my team */}
          {data.canViewTeamOnLeave && data.teamOnLeave.length > 0 && (
            <div className="border-t border-slate-200/70 pt-3 text-xs dark:border-slate-800">
              <p className="font-semibold">Team Members on Leave</p>
              <div className="mt-1.5 flex flex-wrap gap-3 text-slate-600 dark:text-slate-400">
                {data.teamOnLeave.map((m, idx) => (
                  <span key={`${m.employeeName}-${idx}`}>
                    {m.employeeName} ({m.dateRangeLabel})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Apply Leave"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl">
            <h3 className="text-sm font-bold">Apply for Leave</h3>
            <form onSubmit={handleApplyLeave} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold">
                  Leave Type *
                </label>
                <select
                  required
                  value={effectiveLeaveTypeCode}
                  onChange={(e) => setLeaveTypeCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                >
                  {(data?.balances || []).map((b) => (
                    <option key={b.leaveTypeCode} value={b.leaveTypeCode}>
                      {b.leaveTypeName} ({b.availableDays} available)
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold">
                    From Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">
                    To Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">
                  Reason *
                </label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setApplyOpen(false);
                    onCloseExternalApply?.();
                  }}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLeave}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  {submittingLeave ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmActionDialog
        open={Boolean(withdrawTargetId)}
        title="Withdraw Leave Request"
        description="Are you sure you want to withdraw this leave request? This action will be logged in your leave audit trail."
        confirmLabel="Confirm Withdraw"
        requireReason
        reasonLabel="Withdrawal Reason"
        isSubmitting={withdrawing}
        onClose={() => setWithdrawTargetId(null)}
        onConfirm={handleConfirmWithdraw}
      />
    </WidgetCard>
  );
}

// ============================================================================
// 6. MY PAY SNAPSHOT WIDGET (MASKED BY DEFAULT + AUDITED REVEAL + PRIVACY BLUR)
// ============================================================================
export function MyPaySnapshotWidget({ isDark }: { isDark: boolean }) {
  const {
    data,
    loading,
    error,
    permissionDenied,
    notApplicable,
    asOf,
    refresh,
  } = useWidgetResource((signal) =>
    employeePaySnapshotApi.getPaySnapshot({ signal })
  );

  // Rule 6: Never show salary on first paint; never store in localStorage/sessionStorage
  const [revealedNetPay, setRevealedNetPay] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isTabIdleBlurred, setIsTabIdleBlurred] = useState(false);

  // Auto-hide revealed salary when tab becomes hidden or window loses focus
  useEffect(() => {
    const handleVisibilityOrBlur = () => {
      if (document.hidden) {
        setRevealedNetPay(null);
        setIsTabIdleBlurred(true);
      }
    };
    const handleFocus = () => {
      setIsTabIdleBlurred(false);
    };
    document.addEventListener('visibilitychange', handleVisibilityOrBlur);
    window.addEventListener('blur', handleVisibilityOrBlur);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrBlur);
      window.removeEventListener('blur', handleVisibilityOrBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const handleToggleReveal = async () => {
    if (revealedNetPay) {
      setRevealedNetPay(null);
      return;
    }
    if (!data || !data.canRevealNetPay || revealing) return;
    setRevealing(true);
    try {
      const audited = await employeePaySnapshotApi.revealNetPay(
        data.latestPayslipId
      );
      setRevealedNetPay(audited.netPayFormatted);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Unable to reveal net pay'
      );
    } finally {
      setRevealing(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!data || downloading) return;
    setDownloading(true);
    try {
      await employeePaySnapshotApi.downloadPayslipPdf(
        data.latestPayslipId,
        data.monthLabel
      );
      toast.success(`Downloaded payslip for ${data.monthLabel}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to download payslip PDF'
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <WidgetCard
      id="pay"
      title="My Pay Snapshot"
      subtitle="Privacy-masked net pay with audited reveal, PDF payslip, tax & reimbursement status"
      asOf={asOf}
      loading={loading}
      error={error}
      permissionDenied={permissionDenied}
      notApplicable={notApplicable}
      isEmpty={!data}
      emptyTitle="No published payslips yet"
      emptyMessage="Your first monthly payslip will appear here once payroll is finalized."
      onRefresh={refresh}
      isDark={isDark}
    >
      {data && (
        <div
          className={`space-y-4 transition ${
            isTabIdleBlurred ? 'blur-xs' : ''
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 p-4 dark:border-slate-800">
            <div>
              <p className="text-xs text-slate-500">
                Latest Payslip · {data.monthLabel}
              </p>
              <p
                data-testid="pay-net-value"
                className="mt-1 font-mono text-2xl font-bold tracking-tight tabular-nums"
              >
                {revealedNetPay
                  ? revealedNetPay
                  : `${data.currency} ${data.maskedNetPayPlaceholder}`}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Disbursed {formatEmployeeDateOnly(data.payDateOnly)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {data.canRevealNetPay && (
                <button
                  type="button"
                  onClick={handleToggleReveal}
                  disabled={revealing}
                  data-testid="toggle-reveal-pay-btn"
                  aria-label={
                    revealedNetPay ? 'Mask Net Pay' : 'Reveal Net Pay'
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                >
                  {revealedNetPay ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5" />
                      Hide Pay
                    </>
                  ) : (
                    <>
                      <Eye className="h-3.5 w-3.5" />
                      {revealing ? 'Verifying...' : 'Reveal Pay'}
                    </>
                  )}
                </button>
              )}

              {data.canDownloadPayslip && (
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloading}
                  data-testid="download-payslip-pdf-btn"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  {downloading ? 'Downloading...' : 'Payslip PDF'}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200/80 p-3 text-xs dark:border-slate-800">
              <p className="text-slate-500">
                YTD Summary ({data.ytdSummary.fiscalYearLabel})
              </p>
              <p className="mt-1 font-mono font-semibold tabular-nums">
                Gross:{' '}
                {revealedNetPay
                  ? data.ytdSummary.grossEarningsFormatted
                  : '••••••'}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
                Deductions:{' '}
                {revealedNetPay
                  ? data.ytdSummary.totalDeductionsFormatted
                  : '••••••'}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 p-3 text-xs dark:border-slate-800">
              <p className="text-slate-500">
                Tax Declaration ({data.taxDeclaration.regime})
              </p>
              <p className="mt-1 font-semibold">{data.taxDeclaration.status}</p>
              <p className="mt-0.5 font-mono text-[11px] text-amber-600 tabular-nums dark:text-amber-400">
                Proof deadline:{' '}
                {formatEmployeeDateOnly(
                  data.taxDeclaration.proofDeadlineDateOnly
                )}{' '}
                ({data.taxDeclaration.daysUntilDeadline}d left)
              </p>
            </div>

            <div className="rounded-xl border border-slate-200/80 p-3 text-xs dark:border-slate-800">
              <p className="text-slate-500">Reimbursements &amp; Loans</p>
              <p className="mt-1 font-mono font-semibold tabular-nums">
                Pending Claims: {data.reimbursements.pendingAmountFormatted} (
                {data.reimbursements.openClaimsCount})
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
                Next EMI: {data.loansAndAdvances.nextEmiAmountFormatted}
              </p>
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
