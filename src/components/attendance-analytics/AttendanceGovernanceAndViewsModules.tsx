'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  Download,
  MessageSquare,
  Plus,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from 'lucide-react';
import {
  AttendanceAnalyticsRole,
  AttendanceAnalyticsSettingsResponse,
  AttendanceAuditLogRecord,
  AttendanceNotificationRecord,
  AttendanceSharedFilterParams,
  EmployeeMyAttendanceViewResponse,
  InsightsAlertsResponse,
  ManagerAttendanceViewResponse,
  PaginatedAttendanceResponse,
  ScheduledAttendanceReportRecord,
} from '../../types/attendanceAnalytics';
import {
  attendanceAuditLogsApi,
  attendanceEmployeeViewApi,
  attendanceInsightsAlertsApi,
  attendanceManagerViewApi,
  attendanceNotificationsApi,
  attendanceSavedSchedulesApi,
  attendanceSettingsApi,
} from '../../services/attendance-analytics';
import { useAttendanceAnalyticsPermission } from '../../hooks/useAttendanceAnalyticsPermission';
import {
  AttendanceEmptyState,
  AttendanceErrorState,
  AttendanceMetricFreshnessBadge,
  AttendanceModal,
  AttendancePermissionDeniedState,
  AttendanceSkeletonBlock,
} from './AttendanceAnalyticsPrimitives';

interface SharedModuleProps {
  role: AttendanceAnalyticsRole;
  filters: AttendanceSharedFilterParams;
}

// ============================================================================
// 17. Insights, Alerts & Narratives
// ============================================================================
export function InsightsAlertsNarrativesModule({
  role,
  filters,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'insights-alerts');
  const [data, setData] = useState<InsightsAlertsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ruleModalOpen, setRuleModalOpen] = useState(false);
  const [metricKey, setMetricKey] = useState('LateArrivalRate');
  const [thresholdValue, setThresholdValue] = useState('15');
  const [scope, setScope] = useState('All Departments');
  const [frequency, setFrequency] = useState<'RealTime' | 'Daily' | 'Weekly'>(
    'Daily'
  );
  const [channel, setChannel] = useState<
    'InApp' | 'Email' | 'SlackTeams' | 'WhatsApp'
  >('InApp');
  const [ruleFeedback, setRuleFeedback] = useState<string | null>(null);

  const [question, setQuestion] = useState('');
  const [nlAnswer, setNlAnswer] = useState<string | null>(null);
  const [nlLoading, setNlLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceInsightsAlertsApi.getInsights(filters);
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load auto-generated attendance narratives & alerts'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setRuleFeedback('Creating custom alert rule...');
    try {
      const res = await attendanceInsightsAlertsApi.createAlertRule({
        metricKey,
        thresholdValue: Number(thresholdValue),
        scope,
        frequency,
        channel,
      });
      setRuleFeedback(`Alert rule created (${res.id}).`);
    } catch (err) {
      setRuleFeedback(
        err instanceof Error ? err.message : 'Failed to create alert rule'
      );
    }
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    setNlLoading(true);
    setNlAnswer(null);
    try {
      const res = await attendanceInsightsAlertsApi.askAnalyticalQuestion(
        question.trim()
      );
      setNlAnswer(res.answerNarrative);
    } catch (err) {
      setNlAnswer(
        err instanceof Error
          ? err.message
          : 'Backend analytical query endpoint unreachable'
      );
    } finally {
      setNlLoading(false);
    }
  };

  if (!perm.canView) {
    return (
      <AttendancePermissionDeniedState
        role={role}
        moduleTitle="17. Insights, Alerts & Narratives"
        scopeDescription={perm.scopeDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleAskQuestion}
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
      >
        <div className="flex items-center justify-between pb-2">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
            <Sparkles className="h-4 w-4 text-indigo-600" />
            Natural-Language Attendance Query (Backend Analytical Engine)
          </label>
          {perm.canManage && (
            <button
              type="button"
              onClick={() => setRuleModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              New Alert Rule
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask e.g. Which department had the highest late arrival delta this week?"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs"
          />
          <button
            type="submit"
            disabled={nlLoading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {nlLoading ? 'Querying...' : 'Run Query'}
          </button>
        </div>
        {nlAnswer && (
          <p className="mt-2 rounded-xl bg-slate-50 p-3 text-xs text-slate-700">
            {nlAnswer}
          </p>
        )}
      </form>

      {loading ? (
        <AttendanceSkeletonBlock rows={3} />
      ) : error ? (
        <AttendanceErrorState
          title="Unable to load Attendance Narratives & Alert Rules"
          message={error}
          onRetry={() => void loadData()}
          actionLabel={perm.canManage ? 'Create Alert Rule' : undefined}
          onAction={perm.canManage ? () => setRuleModalOpen(true) : undefined}
        />
      ) : !data || data.narratives.length === 0 ? (
        <AttendanceEmptyState
          title="No Auto-Generated Narratives Returned"
          description="Configure threshold alert rules to receive automated anomaly and trend narratives."
          ctaLabel={
            perm.canManage ? 'Create Alert Rule' : 'Reload Narratives'
          }
          onCta={() =>
            perm.canManage ? setRuleModalOpen(true) : void loadData()
          }
        />
      ) : (
        <div className="space-y-3">
          <AttendanceMetricFreshnessBadge metadata={data.metadata} />
          {data.narratives.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
            >
              <h4 className="text-xs font-bold text-slate-900">
                {item.headline}
              </h4>
              <p className="mt-1 text-xs text-slate-600">{item.detail}</p>
            </div>
          ))}
        </div>
      )}

      <AttendanceModal
        open={ruleModalOpen}
        title="Custom Attendance Alert Rule Builder"
        onClose={() => setRuleModalOpen(false)}
      >
        <form onSubmit={handleCreateRule} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Metric Key
            </label>
            <input
              type="text"
              value={metricKey}
              onChange={(e) => setMetricKey(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Threshold Value
            </label>
            <input
              type="number"
              value={thresholdValue}
              onChange={(e) => setThresholdValue(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Scope (Department / Location)
            </label>
            <input
              type="text"
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) =>
                  setFrequency(
                    e.target.value as 'RealTime' | 'Daily' | 'Weekly'
                  )
                }
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              >
                <option value="RealTime">Real-Time</option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Delivery Channel
              </label>
              <select
                value={channel}
                onChange={(e) =>
                  setChannel(
                    e.target.value as
                      | 'InApp'
                      | 'Email'
                      | 'SlackTeams'
                      | 'WhatsApp'
                  )
                }
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              >
                <option value="InApp">In-App</option>
                <option value="Email">Email</option>
                <option value="SlackTeams">Slack / Teams</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>
          </div>
          {ruleFeedback && (
            <p className="rounded-lg bg-slate-100 p-2 text-xs text-slate-700">
              {ruleFeedback}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRuleModalOpen(false)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              Close
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Save Alert Rule
            </button>
          </div>
        </form>
      </AttendanceModal>
    </div>
  );
}

// ============================================================================
// 18. Saved Views, Scheduled Reports & Exports
// ============================================================================
export function SavedViewsScheduledReportsModule({ role }: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'saved-schedules');
  const [data, setData] = useState<
    PaginatedAttendanceResponse<ScheduledAttendanceReportRecord> | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly' | 'Monthly'>(
    'Weekly'
  );
  const [format, setFormat] = useState<'PDF' | 'XLSX' | 'CSV'>('XLSX');
  const [recipients, setRecipients] = useState('');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceSavedSchedulesApi.listSchedules();
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load scheduled attendance reports'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle.trim() || !recipients.trim()) return;
    setStatusMsg('Scheduling report delivery...');
    try {
      await attendanceSavedSchedulesApi.createSchedule({
        reportTitle: reportTitle.trim(),
        frequency,
        format,
        recipients: recipients.trim(),
      });
      setStatusMsg('Scheduled report saved.');
      void loadData();
    } catch (err) {
      setStatusMsg(
        err instanceof Error ? err.message : 'Failed to create scheduled report'
      );
    }
  };

  if (!perm.canView) {
    return (
      <AttendancePermissionDeniedState
        role={role}
        moduleTitle="18. Saved Views, Scheduled Reports & Exports"
        scopeDescription={perm.scopeDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <AttendanceSkeletonBlock rows={4} />
      ) : error ? (
        <AttendanceErrorState
          title="Unable to load Saved Views & Scheduled Reports"
          message={error}
          onRetry={() => void loadData()}
          actionLabel={
            perm.canManage ? 'Schedule Email Digest' : undefined
          }
          onAction={perm.canManage ? () => setModalOpen(true) : undefined}
        />
      ) : !data || data.items.length === 0 ? (
        <AttendanceEmptyState
          title="No Scheduled Attendance Digests Configured"
          description="Schedule automated Daily, Weekly, or Monthly PDF/XLSX attendance reports to stakeholders."
          ctaLabel={
            perm.canManage ? 'Schedule Email Digest' : 'Reload Schedules'
          }
          onCta={() => (perm.canManage ? setModalOpen(true) : void loadData())}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <h4 className="text-xs font-bold text-slate-900">
              Scheduled Report Deliveries
            </h4>
            {perm.canManage && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                New Schedule
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <th className="py-2">Report Title</th>
                  <th className="py-2">Frequency</th>
                  <th className="py-2">Format</th>
                  <th className="py-2">Recipients</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 font-semibold text-slate-900">
                      {item.reportTitle}
                    </td>
                    <td className="py-2 text-slate-600">{item.frequency}</td>
                    <td className="py-2 font-mono text-slate-700">
                      {item.format}
                    </td>
                    <td className="py-2 text-slate-600">{item.recipients}</td>
                    <td className="py-2 font-semibold text-emerald-700">
                      {item.lastRunStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AttendanceModal
        open={modalOpen}
        title="Schedule Automated Attendance Digest"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleCreateSchedule} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Report Title
            </label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="e.g. Executive Weekly Punctuality & OT Pack"
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) =>
                  setFrequency(
                    e.target.value as 'Daily' | 'Weekly' | 'Monthly'
                  )
                }
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Format
              </label>
              <select
                value={format}
                onChange={(e) =>
                  setFormat(e.target.value as 'PDF' | 'XLSX' | 'CSV')
                }
                className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
              >
                <option value="PDF">PDF</option>
                <option value="XLSX">XLSX</option>
                <option value="CSV">CSV</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Recipient Emails (comma-separated)
            </label>
            <input
              type="text"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="hr-ops@company.com, payroll@company.com"
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
          {statusMsg && (
            <p className="rounded-lg bg-slate-100 p-2 text-xs text-slate-700">
              {statusMsg}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              Close
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Save Schedule
            </button>
          </div>
        </form>
      </AttendanceModal>
    </div>
  );
}

// ============================================================================
// 19. Settings & Automation Rules
// ============================================================================
export function AttendanceSettingsAutomationModule({
  role,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'settings');
  const [data, setData] = useState<AttendanceAnalyticsSettingsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceSettingsApi.getSettings();
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load attendance analytics settings & automation rules'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  if (!perm.canView) {
    return (
      <AttendancePermissionDeniedState
        role={role}
        moduleTitle="19. Settings & Automation Rules"
        scopeDescription={perm.scopeDescription}
      />
    );
  }
  if (loading) return <AttendanceSkeletonBlock rows={4} />;
  if (error) {
    return (
      <AttendanceErrorState
        title="Unable to load Settings & Automation Rules"
        message={error}
        onRetry={() => void loadData()}
      />
    );
  }
  if (!data) {
    return (
      <AttendanceEmptyState
        title="No Policy Thresholds or Automation Rules Loaded"
        description="Configure grace minutes, full/half-day thresholds, small-group privacy threshold (N<5), and backend automation triggers."
        ctaLabel="Reload Settings"
        onCta={() => void loadData()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Default Grace Minutes</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.graceMinutesDefault}m
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Full-Day Min Hours</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.fullDayMinHours}h
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Half-Day Min Hours</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.halfDayMinHours}h
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">
            Small-Group Privacy (N&lt;)
          </p>
          <p className="mt-1 text-lg font-bold text-indigo-700">
            N &lt; {data.smallGroupPrivacyThreshold}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Data Retention</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.retentionMonths} mo
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <h4 className="text-xs font-bold text-slate-900">
          Backend Attendance Automation Rules
        </h4>
        <div className="mt-3 divide-y divide-slate-100">
          {data.automationRules.map((rule) => (
            <div
              key={rule.id}
              className="flex items-center justify-between py-2.5"
            >
              <div>
                <p className="text-xs font-semibold text-slate-900">
                  {rule.name} ({rule.code})
                </p>
                <p className="text-[11px] text-slate-500">{rule.description}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  rule.enabled
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {rule.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 20. Audit Logs
// ============================================================================
export function AttendanceAuditLogsModule({ role }: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'audit-logs');
  const [search, setSearch] = useState('');
  const [data, setData] =
    useState<PaginatedAttendanceResponse<AttendanceAuditLogRecord> | null>(
      null
    );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceAuditLogsApi.list({ search });
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load immutable attendance analytics audit trail'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  if (!perm.canView) {
    return (
      <AttendancePermissionDeniedState
        role={role}
        moduleTitle="20. Audit Logs"
        scopeDescription={perm.scopeDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search actor, action, or filter parameters..."
          className="w-64 rounded-xl border border-slate-200 px-3 py-1.5 text-xs"
        />
        {perm.canExport && (
          <button
            type="button"
            onClick={() => void attendanceAuditLogsApi.exportCsv()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            <Download className="h-3.5 w-3.5" />
            Export Audit Trail CSV
          </button>
        )}
      </div>

      {loading ? (
        <AttendanceSkeletonBlock rows={4} />
      ) : error ? (
        <AttendanceErrorState
          title="Unable to load Immutable Audit Logs"
          message={error}
          onRetry={() => void loadData()}
        />
      ) : !data || data.items.length === 0 ? (
        <AttendanceEmptyState
          title="No Audit Trail Events Recorded"
          description="Every report run, export, anomaly review, and rule change is logged here."
          ctaLabel="Reload Audit Logs"
          onCta={() => void loadData()}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <th className="py-2">Timestamp</th>
                  <th className="py-2">Actor</th>
                  <th className="py-2">Action</th>
                  <th className="py-2">Filters Used</th>
                  <th className="py-2">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2 font-mono text-slate-600">
                      {log.timestamp}
                    </td>
                    <td className="py-2 font-semibold text-slate-900">
                      {log.actorName} ({log.actorRole})
                    </td>
                    <td className="py-2 text-slate-800">{log.action}</td>
                    <td className="py-2 font-mono text-slate-600">
                      {log.filtersUsedSummary}
                    </td>
                    <td className="py-2 font-mono text-slate-500">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 21. Notifications
// ============================================================================
export function AttendanceNotificationsModule({ role }: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'notifications');
  const [data, setData] = useState<
    PaginatedAttendanceResponse<AttendanceNotificationRecord> | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceNotificationsApi.list();
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load attendance notifications'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  if (!perm.canView) {
    return (
      <AttendancePermissionDeniedState
        role={role}
        moduleTitle="21. Notifications"
        scopeDescription={perm.scopeDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <AttendanceSkeletonBlock rows={3} />
      ) : error ? (
        <AttendanceErrorState
          title="Unable to load Attendance Notifications"
          message={error}
          onRetry={() => void loadData()}
        />
      ) : !data || data.items.length === 0 ? (
        <AttendanceEmptyState
          title="No Unread Attendance Alerts"
          description="Alerts for flagged anomalies, offline terminals, SLA breaches, and scheduled reports appear here."
          ctaLabel="Refresh Alerts"
          onCta={() => void loadData()}
        />
      ) : (
        <div className="space-y-2.5">
          {data.items.map((n) => (
            <div
              key={n.id}
              className="flex items-start justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
            >
              <div>
                <p className="text-xs font-bold text-slate-900">
                  [{n.eventType}] {n.title}
                </p>
                <p className="mt-1 text-xs text-slate-600">{n.message}</p>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                {n.createdAt}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 22. Manager View
// ============================================================================
export function ManagerAttendanceViewModule({
  role,
  filters,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'manager-view');
  const [data, setData] = useState<ManagerAttendanceViewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nudgeModalOpen, setNudgeModalOpen] = useState(false);
  const [employeeCode, setEmployeeCode] = useState('');
  const [nudgeMessage, setNudgeMessage] = useState('');
  const [nudgeStatus, setNudgeStatus] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceManagerViewApi.getTeamView(filters);
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load Manager Team Attendance View'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleSendNudge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeCode.trim() || !nudgeMessage.trim()) return;
    setNudgeStatus('Dispatching attendance nudge...');
    try {
      const res = await attendanceManagerViewApi.sendAttendanceNudge({
        employeeCode: employeeCode.trim(),
        message: nudgeMessage.trim(),
      });
      setNudgeStatus(`Nudge status: ${res.status}`);
    } catch (err) {
      setNudgeStatus(
        err instanceof Error ? err.message : 'Failed to send nudge'
      );
    }
  };

  if (!perm.canView) {
    return (
      <AttendancePermissionDeniedState
        role={role}
        moduleTitle="22. Manager View"
        scopeDescription={perm.scopeDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <AttendanceSkeletonBlock rows={4} />
      ) : error ? (
        <AttendanceErrorState
          title="Unable to load Manager Team Attendance View"
          message={error}
          onRetry={() => void loadData()}
          actionLabel={perm.canManage ? 'Send Team Attendance Nudge' : undefined}
          onAction={perm.canManage ? () => setNudgeModalOpen(true) : undefined}
        />
      ) : !data ? (
        <AttendanceEmptyState
          title="No Direct Reports Attendance Data"
          description="No team members or direct report punches returned for your manager scope."
          ctaLabel="Send Team Nudge"
          onCta={() => setNudgeModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-3.5">
            <p className="text-[11px] text-slate-500">Team Present Today</p>
            <p className="mt-1 text-lg font-bold text-emerald-700">
              {data.teamPresentToday}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3.5">
            <p className="text-[11px] text-slate-500">Team Late Today</p>
            <p className="mt-1 text-lg font-bold text-amber-600">
              {data.teamLateToday}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3.5">
            <p className="text-[11px] text-slate-500">Team Absent Today</p>
            <p className="mt-1 text-lg font-bold text-rose-600">
              {data.teamAbsentToday}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3.5">
            <p className="text-[11px] text-slate-500">Pending Regularizations</p>
            <p className="mt-1 text-lg font-bold text-indigo-700">
              {data.pendingRegularizationsCount}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-3.5">
            <p className="text-[11px] text-slate-500">Team OT (Month)</p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {data.teamOvertimeHoursMonth}h
            </p>
          </div>
        </div>
      )}

      <AttendanceModal
        open={nudgeModalOpen}
        title="Send Punctuality / Missing Punch Nudge to Team Member"
        onClose={() => setNudgeModalOpen(false)}
      >
        <form onSubmit={handleSendNudge} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Employee Code
            </label>
            <input
              type="text"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Coaching / Reminder Message
            </label>
            <textarea
              value={nudgeMessage}
              onChange={(e) => setNudgeMessage(e.target.value)}
              rows={3}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
          {nudgeStatus && (
            <p className="rounded-lg bg-slate-100 p-2 text-xs text-slate-700">
              {nudgeStatus}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setNudgeModalOpen(false)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              Close
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              <Send className="h-3.5 w-3.5" />
              Send Nudge
            </button>
          </div>
        </form>
      </AttendanceModal>
    </div>
  );
}

// ============================================================================
// 23. Employee View (My Attendance Insights)
// ============================================================================
export function EmployeeMyAttendanceViewModule({ role }: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'employee-view');
  const [data, setData] = useState<EmployeeMyAttendanceViewResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceEmployeeViewApi.getMyView();
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load My Attendance Insights'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  if (!perm.canView) {
    return (
      <AttendancePermissionDeniedState
        role={role}
        moduleTitle="23. Employee View (My Attendance Insights)"
        scopeDescription={perm.scopeDescription}
      />
    );
  }
  if (loading) return <AttendanceSkeletonBlock rows={3} />;
  if (error) {
    return (
      <AttendanceErrorState
        title="Unable to load My Attendance Insights"
        message={error}
        onRetry={() => void loadData()}
      />
    );
  }
  if (!data) {
    return (
      <AttendanceEmptyState
        title="No Personal Attendance Summary Available"
        description="Your monthly present days, punctuality trend, working hours, and comp-off balance will appear here."
        ctaLabel="Refresh My Insights"
        onCta={() => void loadData()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-6">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Present Days (Month)</p>
          <p className="mt-1 text-lg font-bold text-emerald-700">
            {data.presentDaysMonth}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Late Marks</p>
          <p className="mt-1 text-lg font-bold text-amber-600">
            {data.lateMarksMonth}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Avg Working Hours</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.avgWorkingHours}h
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Overtime (Month)</p>
          <p className="mt-1 text-lg font-bold text-indigo-700">
            {data.overtimeHoursMonth}h
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Comp-Off Balance</p>
          <p className="mt-1 text-lg font-bold text-emerald-700">
            {data.compOffBalanceDays}d
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Hybrid Office Days</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.hybridDaysCompleted}
          </p>
        </div>
      </div>
    </div>
  );
}
