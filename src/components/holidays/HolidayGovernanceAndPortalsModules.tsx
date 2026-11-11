'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarCog,
  BarChart3,
  Settings,
  ShieldCheck,
  Bell,
  Users,
  UserCheck,
  Download,
  RefreshCw,
  Play,
  CheckCircle2,
} from 'lucide-react';
import {
  HolidayYearRolloverRunRecord,
  HolidayReportRunResponse,
  HolidaySettingsResponse,
  HolidayAuditLogRecord,
  HolidayNotificationRecord,
  HolidayManagerPortalWorkspaceResponse,
  EmployeeHolidayPortalWorkspaceResponse,
} from '../../types/holidays';
import {
  holidayYearRolloverApi,
  holidayReportsApi,
  holidaySettingsApi,
  holidayAuditLogsApi,
  holidayNotificationsApi,
  holidayManagerPortalApi,
  holidayEmployeePortalApi,
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
// 16. YEAR ROLLOVER & CALENDAR PUBLISHING MODULE
// ============================================================================
export function YearRolloverPublishingModule({
  activeRole,
}: HolidayModuleProps) {
  const perm = useHolidayPermission('year-rollover', activeRole);
  const [runs, setRuns] = useState<HolidayYearRolloverRunRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [sourceYear, setSourceYear] = useState<string>('');
  const [targetYear, setTargetYear] = useState<string>('');
  const [carryForwardOptionalQuota, setCarryForwardOptionalQuota] =
    useState<boolean>(false);
  const [lockPublishedCalendars, setLockPublishedCalendars] =
    useState<boolean>(true);
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadRuns = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayYearRolloverApi.listRuns();
      setRuns(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load year rollover runs')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadRuns();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadRuns]);

  const handleExecuteRollover = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Running year rollover wizard...');
    try {
      await holidayYearRolloverApi.executeRollover({
        sourceYear: Number(sourceYear),
        targetYear: Number(targetYear),
        carryForwardOptionalQuota,
        lockPublishedCalendars,
      });
      setModalOpen(false);
      setSubmitStatus('');
      await loadRuns();
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Rollover failed');
    }
  };

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="16. Year Rollover & Calendar Publishing"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            16. Year Rollover & Calendar Publishing Wizard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Clone active calendars into next year, flag movable/lunar dates, carry forward optional quotas & lock published calendars
          </p>
        </div>
        {perm.canCreate ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Launch Year Rollover Wizard</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={4} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void loadRuns()}
          actionLabel={
            perm.canCreate ? 'Launch Year Rollover Wizard' : undefined
          }
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : runs.length === 0 ? (
        <HolidayEmptyState
          icon={CalendarCog}
          title="No Year Rollover Runs Executed"
          description="Run the year-end rollover wizard to clone calendars, reset or carry forward optional quotas, and publish next year's schedule."
          actionLabel={
            perm.canCreate ? 'Launch Year Rollover Wizard' : undefined
          }
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {runs.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {r.sourceYear} → {r.targetYear} ({r.status})
                </p>
                <p className="text-xs text-slate-500">
                  Cloned: {r.calendarsClonedCount} calendars • Quotas carried:{' '}
                  {r.optionalQuotasCarriedCount} • Validation warnings:{' '}
                  {r.validationErrorsCount}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <HolidayModal
        open={modalOpen}
        title="Year-End Holiday Calendar Rollover Wizard"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleExecuteRollover} className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              type="number"
              value={sourceYear}
              onChange={(e) => setSourceYear(e.target.value)}
              placeholder="Source Year (YYYY)"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <input
              required
              type="number"
              value={targetYear}
              onChange={(e) => setTargetYear(e.target.value)}
              placeholder="Target Year (YYYY)"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={carryForwardOptionalQuota}
              onChange={(e) => setCarryForwardOptionalQuota(e.target.checked)}
            />
            <span>Carry forward unused Optional Holiday quota to Target Q1</span>
          </label>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={lockPublishedCalendars}
              onChange={(e) => setLockPublishedCalendars(e.target.checked)}
            />
            <span>
              Lock published calendars (require HR Admin approval to unlock)
            </span>
          </label>
          {submitStatus ? (
            <p className="text-xs text-rose-600">{submitStatus}</p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Execute Rollover & Pre-Publish Check
          </button>
        </form>
      </HolidayModal>
    </div>
  );
}

// ============================================================================
// 17. REPORTS & ANALYTICS MODULE (10-REPORT CATALOG)
// ============================================================================
const HOLIDAY_REPORT_CATALOG = [
  {
    key: 'annual-calendar-by-location',
    label: '1. Annual Holiday Calendar Report by Location/Entity',
  },
  {
    key: 'employee-calendar-assignment',
    label: '2. Employee Calendar Assignment Report',
  },
  {
    key: 'optional-booking-utilization',
    label: '3. Optional Holiday Booking & Utilization Report',
  },
  {
    key: 'unused-optional-quota',
    label: '4. Unused Optional Quota Report',
  },
  {
    key: 'holiday-attendance-overtime',
    label: '5. Holiday Attendance & Overtime Report',
  },
  {
    key: 'compoff-earned-vs-utilized',
    label: '6. Comp-Off Earned vs Utilized Report',
  },
  {
    key: 'special-override-holiday-log',
    label: '7. Special / Override Holiday Log Report',
  },
  {
    key: 'weekly-off-working-saturday',
    label: '8. Weekly Off & Working Saturday Schedule Report',
  },
  {
    key: 'leave-payroll-impact',
    label: '9. Leave & Payroll Impact Report',
  },
  {
    key: 'statutory-gazette-compliance',
    label: '10. Statutory Gazette Compliance Report',
  },
] as const;

export function HolidayReportsAnalyticsModule({
  activeRole,
}: HolidayModuleProps) {
  const perm = useHolidayPermission('reports', activeRole);
  const [selectedReportKey, setSelectedReportKey] = useState<string>(
    HOLIDAY_REPORT_CATALOG[0].key
  );
  const [reportData, setReportData] =
    useState<HolidayReportRunResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);
  const [exportMsg, setExportMsg] = useState<string>('');

  const runSelectedReport = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayReportsApi.runReport(selectedReportKey);
      setReportData(res);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to run holiday report')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, selectedReportKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void runSelectedReport();
    }, 0);
    return () => clearTimeout(timer);
  }, [runSelectedReport]);

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    setExportMsg(`Exporting ${format.toUpperCase()}...`);
    try {
      await holidayReportsApi.exportReport(selectedReportKey, format);
      setExportMsg(`Exported ${format.toUpperCase()}`);
    } catch (err) {
      setExportMsg(err instanceof Error ? err.message : 'Export failed');
    }
  };

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="17. Reports & Analytics"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              17. Holiday Reports & Statutory Gazette Compliance
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              10 enterprise holiday & compliance reports with CSV, XLSX & PDF export
            </p>
          </div>
          {perm.canExport ? (
            <div className="flex items-center gap-1.5">
              {(['csv', 'xlsx', 'pdf'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => void handleExport(fmt)}
                  className="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>{fmt.toUpperCase()}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <select
          value={selectedReportKey}
          onChange={(e) => setSelectedReportKey(e.target.value)}
          aria-label="Select Holiday Report"
          className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
        >
          {HOLIDAY_REPORT_CATALOG.map((rep) => (
            <option key={rep.key} value={rep.key}>
              {rep.label}
            </option>
          ))}
        </select>
        {exportMsg ? (
          <p className="text-xs text-indigo-600 dark:text-indigo-400">
            {exportMsg}
          </p>
        ) : null}
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={5} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void runSelectedReport()}
        />
      ) : !reportData || reportData.rows.length === 0 ? (
        <HolidayEmptyState
          icon={BarChart3}
          title="No Report Rows Returned"
          description="No records matched the selected report parameters."
          actionLabel="Re-run Report"
          onAction={() => void runSelectedReport()}
        />
      ) : (
        <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                {reportData.columns.map((col) => (
                  <th key={col} className="py-2 px-3 font-bold text-slate-500">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.rows.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-100 dark:border-slate-800/60"
                >
                  {reportData.columns.map((col) => (
                    <td key={col} className="py-2.5 px-3">
                      {String(row[col] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 18. SETTINGS & AUTOMATION RULES MODULE
// ============================================================================
export function HolidaySettingsAutomationModule({
  activeRole,
}: HolidayModuleProps) {
  const perm = useHolidayPermission('settings', activeRole);
  const [settings, setSettings] = useState<HolidaySettingsResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);

  const loadSettings = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidaySettingsApi.getSettings();
      setSettings(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load holiday settings & automation rules')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadSettings();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadSettings]);

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="18. Settings & Automation Rules"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            18. Holiday Settings, 11 Automation Rules & 6 Integrations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure backend automation triggers and Attendance, Leave, Payroll, Calendar (ICS), Email & WhatsApp/SMS connectors
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadSettings()}
          className="h-9 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload</span>
        </button>
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={5} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void loadSettings()}
        />
      ) : !settings ? (
        <HolidayEmptyState
          icon={Settings}
          title="No Holiday Settings Returned"
          description="Connect to the Holiday Management API to configure automation rules and integrations."
          actionLabel="Retry Load"
          onAction={() => void loadSettings()}
        />
      ) : (
        <div className="space-y-3">
          {settings.automationRules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {rule.name}
                </p>
                <p className="text-xs text-slate-500">{rule.description}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  void holidaySettingsApi
                    .toggleAutomationRule(rule.id, !rule.enabled)
                    .then(() => loadSettings())
                }
                className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  rule.enabled
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {rule.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 19. AUDIT LOGS MODULE
// ============================================================================
export function HolidayAuditLogsModule({ activeRole }: HolidayModuleProps) {
  const perm = useHolidayPermission('audit-logs', activeRole);
  const [logs, setLogs] = useState<HolidayAuditLogRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);

  const loadAuditLogs = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayAuditLogsApi.listAuditLogs();
      setLogs(res.items);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load audit logs')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadAuditLogs();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAuditLogs]);

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="19. Audit Logs"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            19. Immutable Holiday Audit Trail
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track calendar edits, publish/unpublish events, special overrides & policy modifications
          </p>
        </div>
        {perm.canExport ? (
          <button
            type="button"
            onClick={() => void holidayAuditLogsApi.exportAuditLogsCsv()}
            className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit CSV</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={4} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void loadAuditLogs()}
        />
      ) : logs.length === 0 ? (
        <HolidayEmptyState
          icon={ShieldCheck}
          title="No Audit Trail Events Recorded"
          description="All administrative mutations across calendars, rules, and overrides are logged here."
          actionLabel="Refresh Audit Trail"
          onAction={() => void loadAuditLogs()}
        />
      ) : (
        <div className="space-y-2.5">
          {logs.map((log) => (
            <div
              key={log.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
            >
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {log.action} • {log.entityType}
              </p>
              <p className="text-xs text-slate-500">
                Actor: {log.actorName} ({log.actorRole}) • {log.timestamp} • IP:{' '}
                {log.ipAddress}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 20. NOTIFICATIONS MODULE
// ============================================================================
export function HolidayNotificationsModule({ activeRole }: HolidayModuleProps) {
  const perm = useHolidayPermission('notifications', activeRole);
  const [items, setItems] = useState<HolidayNotificationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayNotificationsApi.listNotifications();
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load notifications')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadNotifications();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadNotifications]);

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="20. Notifications"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            20. Holiday Notifications & Alerts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calendar published, special holiday declared, optional booking status, quota expiry & sync alerts
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            void holidayNotificationsApi
              .markRead(items.map((i) => i.id))
              .then(() => loadNotifications())
          }
          className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Mark All Read</span>
        </button>
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={4} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void loadNotifications()}
        />
      ) : items.length === 0 ? (
        <HolidayEmptyState
          icon={Bell}
          title="No Holiday Notifications"
          description="You are caught up on all holiday calendar, optional booking, and sync alerts."
          actionLabel="Refresh Alerts"
          onAction={() => void loadNotifications()}
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((n) => (
            <div
              key={n.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
            >
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {n.title}
              </p>
              <p className="text-xs text-slate-500">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 21. MANAGER PORTAL MODULE
// ============================================================================
export function HolidayManagerPortalModule({
  activeRole,
}: HolidayModuleProps) {
  const perm = useHolidayPermission('manager-portal', activeRole);
  const [workspace, setWorkspace] =
    useState<HolidayManagerPortalWorkspaceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);

  const loadWorkspace = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayManagerPortalApi.getWorkspace();
      setWorkspace(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load Manager Holiday Portal')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadWorkspace();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadWorkspace]);

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="21. Manager Portal"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            21. Reporting Manager Holiday Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Team holiday coverage, optional holiday booking approvals, holiday work roster & comp-off requests
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadWorkspace()}
          className="h-9 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Refresh Team View
        </button>
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={4} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void loadWorkspace()}
        />
      ) : !workspace ? (
        <HolidayEmptyState
          icon={Users}
          title="No Team Holiday Activity Found"
          description="Your direct reports' optional holiday bookings, holiday work logs, and comp-off claims appear here."
          actionLabel="Refresh Team View"
          onAction={() => void loadWorkspace()}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs text-slate-500">Team Optional Bookings</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
              {workspace.teamOptionalBookings.length}
            </p>
          </div>
          <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs text-slate-500">Team Working on Holidays</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
              {workspace.teamWorkingOnHolidays.length}
            </p>
          </div>
          <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs text-slate-500">Pending Comp-Off Claims</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
              {workspace.pendingCompOffRequests.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 22. EMPLOYEE PORTAL (MY HOLIDAYS) MODULE
// ============================================================================
export function EmployeeHolidayPortalModule({
  activeRole,
  onNavigateModule,
}: HolidayModuleProps) {
  const perm = useHolidayPermission('employee-portal', activeRole);
  const [portal, setPortal] =
    useState<EmployeeHolidayPortalWorkspaceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);

  const loadMyPortal = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayEmployeePortalApi.getWorkspace();
      setPortal(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load My Holidays portal')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadMyPortal();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadMyPortal]);

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="22. Employee Portal (My Holidays)"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            22. Employee Portal — My Holidays & Optional Quota
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View assigned location calendar, book/cancel optional holidays, request comp-off & subscribe via ICS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateModule?.('optional-booking')}
            className="h-9 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Book Optional Holiday
          </button>
          <button
            type="button"
            onClick={() => onNavigateModule?.('swap-compoff')}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          >
            Request Swap / Comp-Off
          </button>
        </div>
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={4} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void loadMyPortal()}
          actionLabel="Book Optional Holiday"
          onAction={() => onNavigateModule?.('optional-booking')}
        />
      ) : !portal ? (
        <HolidayEmptyState
          icon={UserCheck}
          title="No Personal Holiday Calendar Assigned"
          description="Your HR Administrator has not yet assigned an active holiday calendar to your profile."
          actionLabel="Refresh My Holidays"
          onAction={() => void loadMyPortal()}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs text-slate-500">Assigned Calendar</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {portal.effectiveCalendarName} ({portal.effectiveCalendarCode})
            </p>
          </div>
          <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs text-slate-500">Optional Holiday Quota</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {portal.optionalQuotaRemaining} remaining of{' '}
              {portal.optionalQuotaTotal}
            </p>
          </div>
          <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs text-slate-500">Comp-Off Balance</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {portal.compOffBalanceDays} Days
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
