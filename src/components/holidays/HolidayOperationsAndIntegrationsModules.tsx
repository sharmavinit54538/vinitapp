'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeftRight,
  Building2,
  Clock,
  Link2,
  CalendarCheck,
  CheckSquare,
  Megaphone,
  Plus,
  RefreshCw,
  Send,
} from 'lucide-react';
import {
  HolidaySwapCompOffRecord,
  ShiftSiteHolidayMappingRecord,
  HolidayWorkLogRecord,
  LeavePayrollHolidayIntegrationResponse,
  OptionalHolidayBookingRecord,
  HolidayApprovalItem,
  HolidayCommunicationRecord,
} from '../../types/holidays';
import {
  holidaySwapCompOffApi,
  holidayShiftSiteApi,
  holidayWorkHandlingApi,
  holidayLeavePayrollSyncApi,
  holidayOptionalBookingApi,
  holidayApprovalsApi,
  holidayCommunicationsApi,
} from '../../services/holidays';
import {
  HolidayApiError,
  formatHolidayDateOnly,
} from '../../services/holidays/client';
import { useHolidayPermission } from '../../hooks/useHolidayPermission';
import {
  HolidaySkeletonBlock,
  HolidayPermissionDeniedState,
  HolidayErrorState,
  HolidayEmptyState,
  HolidayModal,
} from './HolidayPrimitives';
import { HolidayModuleProps } from './HolidayCoreAndCalendarsModules';

// ============================================================================
// 9. HOLIDAY SWAP & COMPENSATORY OFF RULES MODULE
// ============================================================================
export function HolidaySwapCompOffModule({ activeRole }: HolidayModuleProps) {
  const perm = useHolidayPermission('swap-compoff', activeRole);
  const [records, setRecords] = useState<HolidaySwapCompOffRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [recordType, setRecordType] = useState<'SwapRequest' | 'CompOffCredit'>(
    'SwapRequest'
  );
  const [originalHolidayDate, setOriginalHolidayDate] = useState<string>('');
  const [targetSwapOrWorkedDate, setTargetSwapOrWorkedDate] =
    useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadRecords = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidaySwapCompOffApi.listRecords();
      setRecords(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load swap & comp-off records')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadRecords();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadRecords]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Submitting request...');
    try {
      await holidaySwapCompOffApi.submitSwapOrCompOff({
        recordType,
        originalHolidayDate,
        targetSwapOrWorkedDate,
        reason,
      });
      setModalOpen(false);
      setSubmitStatus('');
      await loadRecords();
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Request failed');
    }
  };

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="9. Holiday Swap & Compensatory Off Rules"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            9. Holiday Swap & Compensatory Off Rules
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Exchange scheduled holidays or claim comp-off for working on a holiday (validity window enforced by backend)
          </p>
        </div>
        {perm.canCreate ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Request Swap / Comp-Off</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={4} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void loadRecords()}
          actionLabel={perm.canCreate ? 'Request Swap / Comp-Off' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : records.length === 0 ? (
        <HolidayEmptyState
          icon={ArrowLeftRight}
          title="No Holiday Swap or Comp-Off Ledger Entries"
          description="Submit a holiday swap request or claim compensatory off for working on a gazetted/company holiday."
          actionLabel={perm.canCreate ? 'Request Swap / Comp-Off' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {records.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {r.employeeName} ({r.employeeCode}) • {r.recordType}
                </p>
                <p className="text-xs text-slate-500">
                  Original: {formatHolidayDateOnly(r.originalHolidayDate)} →
                  Target: {formatHolidayDateOnly(r.targetSwapOrWorkedDate)} •
                  Expires: {formatHolidayDateOnly(r.expiryDateOnly)} •{' '}
                  {r.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <HolidayModal
        open={modalOpen}
        title="Submit Holiday Swap or Comp-Off Request"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <select
            value={recordType}
            onChange={(e) =>
              setRecordType(e.target.value as 'SwapRequest' | 'CompOffCredit')
            }
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="SwapRequest">Swap Assigned Holiday Date</option>
            <option value="CompOffCredit">
              Claim Comp-Off Credit for Holiday Worked
            </option>
          </select>
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              type="date"
              value={originalHolidayDate}
              onChange={(e) => setOriginalHolidayDate(e.target.value)}
              aria-label="Original holiday date"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <input
              required
              type="date"
              value={targetSwapOrWorkedDate}
              onChange={(e) => setTargetSwapOrWorkedDate(e.target.value)}
              aria-label="Target swap or worked date"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Business justification / shift coverage note"
            rows={2}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          {submitStatus ? (
            <p className="text-xs text-rose-600">{submitStatus}</p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Submit Request
          </button>
        </form>
      </HolidayModal>
    </div>
  );
}

// ============================================================================
// 10. SHIFT-WISE & SITE-WISE HOLIDAYS MODULE
// ============================================================================
export function ShiftSiteHolidaysModule({ activeRole }: HolidayModuleProps) {
  const perm = useHolidayPermission('shift-site', activeRole);
  const [mappings, setMappings] = useState<ShiftSiteHolidayMappingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [siteOrProjectName, setSiteOrProjectName] = useState<string>('');
  const [shiftCategory, setShiftCategory] = useState<
    ShiftSiteHolidayMappingRecord['shiftCategory']
  >('24x7_Rotational');
  const [calendarCode, setCalendarCode] = useState<string>('');
  const [overtimeMultiplier, setOvertimeMultiplier] = useState<string>('2');
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadMappings = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayShiftSiteApi.listMappings();
      setMappings(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load shift/site holiday mappings')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadMappings();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadMappings]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Saving shift/site mapping...');
    try {
      await holidayShiftSiteApi.createMapping({
        siteOrProjectName,
        shiftCategory,
        calendarCode,
        overtimeMultiplier: Number(overtimeMultiplier),
      });
      setModalOpen(false);
      setSubmitStatus('');
      await loadMappings();
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Save failed');
    }
  };

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="10. Shift-wise & Site-wise Holidays"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            10. Shift-wise & Site-wise Holidays
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            24x7 rotational shifts, manufacturing plants, retail stores & client-calendar project overrides
          </p>
        </div>
        {perm.canCreate ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Map Shift / Client Site</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={4} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void loadMappings()}
          actionLabel={perm.canCreate ? 'Map Shift / Client Site' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : mappings.length === 0 ? (
        <HolidayEmptyState
          icon={Building2}
          title="No Shift or Client-Site Holiday Mappings"
          description="Bind 24x7 shift rosters, plants, retail branches, or client-holiday projects to specialized calendars."
          actionLabel={perm.canCreate ? 'Map Shift / Client Site' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {mappings.map((m) => (
            <div
              key={m.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {m.siteOrProjectName} ({m.shiftCategory})
                </p>
                <p className="text-xs text-slate-500">
                  Calendar: {m.calendarCode} • OT Multiplier:{' '}
                  {m.overtimeMultiplier}x • Conflicts: {m.conflictCount}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <HolidayModal
        open={modalOpen}
        title="Map Shift Roster or Client Site to Holiday Calendar"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            required
            value={siteOrProjectName}
            onChange={(e) => setSiteOrProjectName(e.target.value)}
            placeholder="Plant / Store / Client Project Name"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <select
            value={shiftCategory}
            onChange={(e) =>
              setShiftCategory(
                e.target.value as ShiftSiteHolidayMappingRecord['shiftCategory']
              )
            }
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="24x7_Rotational">24x7 Rotational Shift</option>
            <option value="ManufacturingPlant">Manufacturing Plant</option>
            <option value="RetailStore">Retail Store / Field Ops</option>
            <option value="ClientCalendar">
              Client / Project Specific Calendar
            </option>
          </select>
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              value={calendarCode}
              onChange={(e) => setCalendarCode(e.target.value)}
              placeholder="Calendar Code"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <input
              required
              type="number"
              step="0.5"
              value={overtimeMultiplier}
              onChange={(e) => setOvertimeMultiplier(e.target.value)}
              placeholder="OT Multiplier (e.g. 2.0)"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          {submitStatus ? (
            <p className="text-xs text-rose-600">{submitStatus}</p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Save Shift / Site Mapping
          </button>
        </form>
      </HolidayModal>
    </div>
  );
}

// ============================================================================
// 11. HOLIDAY WORK HANDLING (ATTENDANCE & OVERTIME INTEGRATION) MODULE
// ============================================================================
export function HolidayWorkHandlingModule({ activeRole }: HolidayModuleProps) {
  const perm = useHolidayPermission('holiday-work', activeRole);
  const [logs, setLogs] = useState<HolidayWorkLogRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);
  const [syncMessage, setSyncMessage] = useState<string>('');

  const loadLogs = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayWorkHandlingApi.listWorkLogs();
      setLogs(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load holiday work logs')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadLogs();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadLogs]);

  const handleSyncPayroll = async () => {
    setSyncMessage('Syncing holiday work logs to Payroll variable inputs...');
    try {
      const res = await holidayWorkHandlingApi.syncToPayrollInputs(
        logs.map((l) => l.id)
      );
      setSyncMessage(`Synced ${res.syncedCount} records to Payroll inputs.`);
      await loadLogs();
    } catch (err) {
      setSyncMessage(
        err instanceof Error ? err.message : 'Payroll sync failed'
      );
    }
  };

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="11. Holiday Work Handling (Attendance & Overtime)"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            11. Holiday Work Handling (Attendance & Overtime Integration)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Detect attendance punches on holidays, apply 1.5x/2x/3x overtime or Comp-Off & sync to Payroll
          </p>
        </div>
        {perm.canEdit ? (
          <button
            type="button"
            onClick={() => void handleSyncPayroll()}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Holiday OT to Payroll</span>
          </button>
        ) : null}
      </div>

      {syncMessage ? (
        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold px-2">
          {syncMessage}
        </p>
      ) : null}

      {loading ? (
        <HolidaySkeletonBlock rows={4} />
      ) : error ? (
        <HolidayErrorState error={error} onRetry={() => void loadLogs()} />
      ) : logs.length === 0 ? (
        <HolidayEmptyState
          icon={Clock}
          title="No Holiday Attendance Punches Recorded"
          description="Employees who punch in on a scheduled holiday appear here for overtime multiplier or comp-off settlement."
          actionLabel="Refresh Attendance Sync"
          onAction={() => void loadLogs()}
        />
      ) : (
        <div className="space-y-2.5">
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {log.employeeName} ({log.employeeCode}) — {log.holidayName}
                </p>
                <p className="text-xs text-slate-500">
                  Date: {formatHolidayDateOnly(log.holidayDateOnly)} • Worked:{' '}
                  {log.hoursWorked}h • {log.overtimeMultiplier}x •{' '}
                  {log.compensationChoice} • {log.payrollSyncStatus}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 12. LEAVE & PAYROLL INTEGRATION MODULE
// ============================================================================
export function LeavePayrollIntegrationModule({
  activeRole,
}: HolidayModuleProps) {
  const perm = useHolidayPermission('leave-payroll-sync', activeRole);
  const [statusData, setStatusData] =
    useState<LeavePayrollHolidayIntegrationResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);
  const [retryFeedback, setRetryFeedback] = useState<string>('');

  const loadStatus = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayLeavePayrollSyncApi.getStatus();
      setStatusData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load Leave & Payroll integration status')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadStatus();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadStatus]);

  const handleRetrySync = async (
    target: 'Attendance' | 'Leave' | 'Payroll'
  ) => {
    setRetryFeedback(`Triggering ${target} sync...`);
    try {
      const res = await holidayLeavePayrollSyncApi.retrySync(target);
      setRetryFeedback(`Triggered ${target} sync (Batch ${res.syncBatchId})`);
      await loadStatus();
    } catch (err) {
      setRetryFeedback(
        err instanceof Error ? err.message : `${target} sync failed`
      );
    }
  };

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="12. Leave & Payroll Integration"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            12. Leave & Payroll Integration (Sandwich Rule & Payable Days)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sandwich leave policy, leave balance recalculation on calendar edits & payroll payable-days sync
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(['Attendance', 'Leave', 'Payroll'] as const).map((sys) => (
            <button
              key={sys}
              type="button"
              onClick={() => void handleRetrySync(sys)}
              className="h-8 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Sync {sys}</span>
            </button>
          ))}
        </div>
      </div>

      {retryFeedback ? (
        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold px-2">
          {retryFeedback}
        </p>
      ) : null}

      {loading ? (
        <HolidaySkeletonBlock rows={4} />
      ) : error ? (
        <HolidayErrorState error={error} onRetry={() => void loadStatus()} />
      ) : !statusData ? (
        <HolidayEmptyState
          icon={Link2}
          title="No Leave & Payroll Sync Telemetry"
          description="Connect Attendance, Leave, and Payroll engines to inspect sandwich rules and payable-day sync."
          actionLabel="Retry Sync Check"
          onAction={() => void loadStatus()}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs text-slate-500">Sandwich Leave Rule</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {statusData.sandwichRulePolicy}
            </p>
          </div>
          <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs text-slate-500">Leave Recalculation</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {statusData.leaveRecalculationStatus} (
              {statusData.affectedLeaveRequestsCount} affected)
            </p>
          </div>
          <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs text-slate-500">Payroll Sync Status</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {statusData.payrollCycleMonth} • {statusData.payrollSyncStatus}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 13. HOLIDAY REQUEST & APPROVAL (OPTIONAL HOLIDAY BOOKING) MODULE
// ============================================================================
export function OptionalHolidayBookingModule({
  activeRole,
}: HolidayModuleProps) {
  const perm = useHolidayPermission('optional-booking', activeRole);
  const [bookings, setBookings] = useState<OptionalHolidayBookingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [holidayName, setHolidayName] = useState<string>('');
  const [dateOnly, setDateOnly] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadBookings = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayOptionalBookingApi.listBookings();
      setBookings(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load optional holiday bookings')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadBookings();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadBookings]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Booking optional holiday...');
    try {
      await holidayOptionalBookingApi.bookOptionalHoliday({
        holidayName,
        dateOnly,
        reason,
      });
      setModalOpen(false);
      setSubmitStatus('');
      await loadBookings();
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Booking failed');
    }
  };

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="13. Optional Holiday Booking"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            13. Holiday Request & Approval (Optional Holiday Booking)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Book from eligible optional holiday pool with team capacity & annual quota check
          </p>
        </div>
        {perm.canCreate ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Optional Holiday</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={4} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void loadBookings()}
          actionLabel={perm.canCreate ? 'Book Optional Holiday' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : bookings.length === 0 ? (
        <HolidayEmptyState
          icon={CalendarCheck}
          title="No Optional Holiday Bookings Found"
          description="Employees can book optional/restricted holidays from their assigned calendar pool."
          actionLabel={perm.canCreate ? 'Book Optional Holiday' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {bookings.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {b.employeeName} — {b.holidayName} (
                  {formatHolidayDateOnly(b.dateOnly)})
                </p>
                <p className="text-xs text-slate-500">
                  Team Capacity Used: {b.teamCapacityUsedPct}% • Remaining
                  Quota: {b.remainingQuotaAfterBooking} • {b.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <HolidayModal
        open={modalOpen}
        title="Book Optional / Restricted Holiday"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleBook} className="space-y-3">
          <input
            required
            value={holidayName}
            onChange={(e) => setHolidayName(e.target.value)}
            placeholder="Optional Holiday Name (from Assigned Pool)"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <input
            required
            type="date"
            value={dateOnly}
            onChange={(e) => setDateOnly(e.target.value)}
            aria-label="Optional Holiday Date"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Booking note"
            rows={2}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          {submitStatus ? (
            <p className="text-xs text-rose-600">{submitStatus}</p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Submit Booking Request
          </button>
        </form>
      </HolidayModal>
    </div>
  );
}

// ============================================================================
// 14. APPROVALS WORKFLOW MODULE
// ============================================================================
export function HolidayApprovalsWorkflowModule({
  activeRole,
}: HolidayModuleProps) {
  const perm = useHolidayPermission('approvals', activeRole);
  const [items, setItems] = useState<HolidayApprovalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);

  const loadApprovals = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayApprovalsApi.listApprovals();
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load holiday approvals')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadApprovals();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadApprovals]);

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="14. Approvals Workflow"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            14. Multi-Level Holiday Approvals Inbox
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Approve calendar publishing, special holidays, working-day overrides, optional bookings & comp-off
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadApprovals()}
          className="h-9 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Inbox</span>
        </button>
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={4} />
      ) : error ? (
        <HolidayErrorState error={error} onRetry={() => void loadApprovals()} />
      ) : items.length === 0 ? (
        <HolidayEmptyState
          icon={CheckSquare}
          title="No Pending Holiday Approvals"
          description="All calendar publications, optional holiday requests, and comp-off claims are up to date."
          actionLabel="Refresh Inbox"
          onAction={() => void loadApprovals()}
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  [{item.approvalType}] {item.referenceCode} — {item.summary}
                </p>
                <p className="text-xs text-slate-500">
                  Requested by {item.requestedBy} • {item.status}
                </p>
              </div>
              {perm.canApprove ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void holidayApprovalsApi
                        .decideApprovals({
                          approvalIds: [item.id],
                          decision: 'Approved',
                          comments: 'Approved',
                        })
                        .then(() => loadApprovals())
                    }
                    className="h-8 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void holidayApprovalsApi
                        .decideApprovals({
                          approvalIds: [item.id],
                          decision: 'Rejected',
                          comments: 'Rejected',
                        })
                        .then(() => loadApprovals())
                    }
                    className="h-8 px-3 rounded-xl bg-rose-600 text-white text-xs font-bold"
                  >
                    Reject
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 15. COMMUNICATION & ANNOUNCEMENTS MODULE
// ============================================================================
export function HolidayCommunicationsModule({
  activeRole,
}: HolidayModuleProps) {
  const perm = useHolidayPermission('communications', activeRole);
  const [broadcasts, setBroadcasts] = useState<HolidayCommunicationRecord[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [templateCode, setTemplateCode] = useState<string>(
    'ANNUAL_CALENDAR_PUBLISHED'
  );
  const [channel, setChannel] = useState<
    'Email' | 'InApp' | 'WhatsApp' | 'SMS'
  >('Email');
  const [targetScope, setTargetScope] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadBroadcasts = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayCommunicationsApi.listBroadcasts();
      setBroadcasts(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load holiday announcements')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadBroadcasts();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadBroadcasts]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Dispatching holiday circular...');
    try {
      await holidayCommunicationsApi.sendBroadcast({
        templateCode,
        channel,
        targetScope,
      });
      setModalOpen(false);
      setSubmitStatus('');
      await loadBroadcasts();
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Broadcast failed');
    }
  };

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="15. Communication & Announcements"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            15. Holiday Communication & Announcements
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Broadcast annual calendar publish circulars, emergency holiday alerts & upcoming holiday reminders
          </p>
        </div>
        {perm.canCreate ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Broadcast Circular</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={4} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void loadBroadcasts()}
          actionLabel={perm.canCreate ? 'Send Broadcast Circular' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : broadcasts.length === 0 ? (
        <HolidayEmptyState
          icon={Megaphone}
          title="No Holiday Announcements Sent"
          description="Send annual holiday circulars or emergency closure notices via Email, In-App, WhatsApp, or SMS."
          actionLabel={perm.canCreate ? 'Send Broadcast Circular' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {broadcasts.map((b) => (
            <div
              key={b.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {b.subjectTitle} ({b.channel})
                </p>
                <p className="text-xs text-slate-500">
                  Target: {b.targetScope} • {b.deliveryStatus}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <HolidayModal
        open={modalOpen}
        title="Dispatch Holiday Circular / Broadcast"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleBroadcast} className="space-y-3">
          <select
            value={templateCode}
            onChange={(e) => setTemplateCode(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="ANNUAL_CALENDAR_PUBLISHED">
              Annual Holiday Calendar Published Circular
            </option>
            <option value="EMERGENCY_SPECIAL_HOLIDAY">
              Emergency / Special Holiday Declaration Notice
            </option>
            <option value="WORKING_SATURDAY_OVERRIDE">
              Working Day Override Circular
            </option>
            <option value="UPCOMING_HOLIDAY_REMINDER">
              Upcoming Holiday & Long-Weekend Reminder
            </option>
          </select>
          <select
            value={channel}
            onChange={(e) =>
              setChannel(
                e.target.value as 'Email' | 'InApp' | 'WhatsApp' | 'SMS'
              )
            }
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="Email">Email Circular</option>
            <option value="InApp">In-App Notification</option>
            <option value="WhatsApp">WhatsApp Business Alert</option>
            <option value="SMS">SMS Broadcast</option>
          </select>
          <input
            required
            value={targetScope}
            onChange={(e) => setTargetScope(e.target.value)}
            placeholder="Target Location / Calendar Scope"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          {submitStatus ? (
            <p className="text-xs text-rose-600">{submitStatus}</p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Send Broadcast
          </button>
        </form>
      </HolidayModal>
    </div>
  );
}
