'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Send,
  ShieldCheck,
  BarChart3,
  Settings,
  History,
  Bell,
  UsersRound,
  UserCheck,
  Download,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  OnboardingRole,
  OnboardingCommunicationLog,
  OnboardingApprovalItem,
  OnboardingReportRunResponse,
  OnboardingSettingsResponse,
  OnboardingAuditLogRecord,
  OnboardingNotificationRecord,
  OnboardingManagerPortalResponse,
  NewJoinerPortalWorkspaceResponse,
} from '../../types/onboarding';
import {
  onboardingCommunicationsApi,
  onboardingApprovalsApi,
  onboardingReportsApi,
  onboardingSettingsApi,
  onboardingAuditLogsApi,
  onboardingNotificationsApi,
  onboardingManagerPortalApi,
  onboardingNewJoinerPortalApi,
} from '../../services/onboarding';
import { useOnboardingPermission } from '../../hooks/useOnboardingPermission';
import {
  OnboardingSkeletonBlock,
  OnboardingPermissionDeniedState,
  OnboardingErrorState,
  OnboardingEmptyState,
  OnboardingModal,
} from './OnboardingPrimitives';

export interface OnboardingOpsModuleProps {
  role: OnboardingRole;
  notify: (msg: string) => void;
}

// 17. Communication Center
export function OnboardingCommunicationCenterModule({
  role,
  notify,
}: OnboardingOpsModuleProps) {
  const perm = useOnboardingPermission('communications', role);
  const [logs, setLogs] = useState<OnboardingCommunicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendOpen, setSendOpen] = useState(false);
  const [joinerIds, setJoinerIds] = useState('');
  const [channel, setChannel] = useState<'Email' | 'SMS' | 'WhatsApp'>('Email');
  const [templateCode, setTemplateCode] = useState('WELCOME_DAY_MINUS_3');

  const loadLogs = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingCommunicationsApi.listLogs();
      setLogs(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load onboarding communication logs'
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

  if (!perm.canView) {
    return (
      <OnboardingPermissionDeniedState
        moduleName="Communication Center"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Communication Center (Email / SMS / WhatsApp)
          </h3>
          <p className="text-xs text-slate-500">
            Pre-boarding drip engagement, welcome emails, Day-1 instructions & reminder logs
          </p>
        </div>
        {perm.canCreate && (
          <button
            type="button"
            onClick={() => setSendOpen(true)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            + Send Communication
          </button>
        )}
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={4} />
      ) : error ? (
        <div className="space-y-3">
          <OnboardingErrorState message={error} onRetry={loadLogs} />
          {perm.canCreate && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Dispatch a pre-boarding or Day-1 template communication
              </span>
              <button
                type="button"
                onClick={() => setSendOpen(true)}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                + Send Communication
              </button>
            </div>
          )}
        </div>
      ) : logs.length === 0 ? (
        <OnboardingEmptyState
          icon={Send}
          title="No Communication Logs"
          description="Automated and manual onboarding Email, SMS, and WhatsApp dispatches will appear here."
          actionLabel={perm.canCreate ? 'Send Communication' : undefined}
          onAction={perm.canCreate ? () => setSendOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {logs.map((l) => (
            <div
              key={l.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {l.joinerName} · {l.templateCode}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Channel: {l.channel} · Trigger: {l.stageTrigger} · Sent:{' '}
                  {l.sentAt}
                </p>
              </div>
              <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                {l.deliveryStatus}
              </span>
            </div>
          ))}
        </div>
      )}

      <OnboardingModal
        open={sendOpen}
        title="Dispatch Onboarding Communication"
        onClose={() => setSendOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await onboardingCommunicationsApi.sendCommunication({
                joinerIds: joinerIds
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
                channel,
                templateCode,
              });
              notify('Onboarding communication queued');
              setSendOpen(false);
              void loadLogs();
            } catch (err) {
              notify(
                err instanceof Error
                  ? err.message
                  : 'Communication dispatch failed'
              );
            }
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Joiner IDs (comma-separated)
            </label>
            <input
              required
              value={joinerIds}
              onChange={(e) => setJoinerIds(e.target.value)}
              placeholder="e.g. JNR-1042, JNR-1045"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Channel
              </label>
              <select
                value={channel}
                onChange={(e) =>
                  setChannel(e.target.value as 'Email' | 'SMS' | 'WhatsApp')
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
              >
                <option value="Email">Email</option>
                <option value="SMS">SMS</option>
                <option value="WhatsApp">WhatsApp</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Template Code
              </label>
              <select
                value={templateCode}
                onChange={(e) => setTemplateCode(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
              >
                <option value="WELCOME_DAY_MINUS_3">WELCOME_DAY_MINUS_3</option>
                <option value="DOC_REMINDER_DRIP">DOC_REMINDER_DRIP</option>
                <option value="DAY_ONE_REPORTING_GUIDE">
                  DAY_ONE_REPORTING_GUIDE
                </option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSendOpen(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Dispatch
            </button>
          </div>
        </form>
      </OnboardingModal>
    </div>
  );
}

// 18. Approvals Workflow
export function OnboardingApprovalsModule({
  role,
  notify,
}: OnboardingOpsModuleProps) {
  const perm = useOnboardingPermission('approvals', role);
  const [items, setItems] = useState<OnboardingApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApprovals = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingApprovalsApi.listApprovals();
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load onboarding approvals inbox'
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
      <OnboardingPermissionDeniedState
        moduleName="Approvals Workflow"
        role={role}
      />
    );
  }

  const handleDecision = async (
    id: string,
    decision: 'Approved' | 'Rejected'
  ) => {
    try {
      await onboardingApprovalsApi.decideApprovals({
        approvalIds: [id],
        decision,
        comments: `${decision} via Onboarding Approvals Inbox`,
      });
      notify(`Request ${decision.toLowerCase()}`);
      void loadApprovals();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Approval action failed');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Approvals Workflow Inbox
        </h3>
        <p className="text-xs text-slate-500">
          Joining Date Change, Asset Exception, Probation Confirmation/Extension & Document Waiver approvals
        </p>
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={4} />
      ) : error ? (
        <OnboardingErrorState message={error} onRetry={loadApprovals} />
      ) : items.length === 0 ? (
        <OnboardingEmptyState
          icon={ShieldCheck}
          title="No Pending Approvals"
          description="Your onboarding approval inbox is clear."
          actionLabel="Refresh Inbox"
          onAction={loadApprovals}
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {a.joinerName}
                  </span>
                  <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                    {a.approvalType}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {a.summary} · Requested by {a.requestedBy}
                </p>
              </div>
              {perm.canApprove && a.status === 'Pending' && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => void handleDecision(a.id, 'Approved')}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-500"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDecision(a.id, 'Rejected')}
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-rose-500"
                  >
                    <XCircle className="h-3 w-3" /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 19. Reports & Analytics
const ONBOARDING_REPORT_KEYS = [
  { key: 'upcoming-joiner-register', label: 'Upcoming Joiner Register' },
  { key: 'onboarding-completion', label: 'Onboarding Completion Report' },
  { key: 'document-pendency', label: 'Document Pendency Report' },
  { key: 'task-sla-overdue', label: 'Task SLA & Overdue Report' },
  { key: 'asset-provisioning-status', label: 'IT & Asset Provisioning Status' },
  { key: 'no-show-renege-analysis', label: 'No-Show & Renege Analysis' },
  { key: 'probation-due-confirmation', label: 'Probation Due & Confirmation' },
  { key: 'first-payroll-readiness', label: 'First Payroll Readiness Report' },
  { key: 'enps-survey-analytics', label: 'Onboarding eNPS & Survey Report' },
];

export function OnboardingReportsModule({
  role,
  notify,
}: OnboardingOpsModuleProps) {
  const perm = useOnboardingPermission('reports', role);
  const [selectedKey, setSelectedKey] = useState(
    ONBOARDING_REPORT_KEYS[0].key
  );
  const [report, setReport] = useState<OnboardingReportRunResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runSelectedReport = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingReportsApi.runReport(selectedKey);
      setReport(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate onboarding report'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, selectedKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void runSelectedReport();
    }, 0);
    return () => clearTimeout(timer);
  }, [runSelectedReport]);

  if (!perm.canView) {
    return (
      <OnboardingPermissionDeniedState
        moduleName="Reports & Analytics"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Onboarding Reports & Analytics
          </h3>
          <p className="text-xs text-slate-500">
            9 pre-built MIS & statutory readiness reports with CSV/XLSX/PDF export
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            {ONBOARDING_REPORT_KEYS.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
          {perm.canExport && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await onboardingReportsApi.exportReport(selectedKey, 'csv');
                  notify('Exported onboarding report CSV');
                } catch (err) {
                  notify(err instanceof Error ? err.message : 'Export failed');
                }
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={4} />
      ) : error ? (
        <OnboardingErrorState message={error} onRetry={runSelectedReport} />
      ) : !report || report.rows.length === 0 ? (
        <OnboardingEmptyState
          icon={BarChart3}
          title="No Report Rows Returned"
          description="No records matched the selected report parameters."
          actionLabel="Re-run Report"
          onAction={runSelectedReport}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                {report.columns.map((col) => (
                  <th key={col} className="pb-2 pr-3 font-semibold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {report.rows.map((row, idx) => (
                <tr key={idx}>
                  {report.columns.map((col) => (
                    <td
                      key={col}
                      className="py-2 pr-3 text-slate-700 dark:text-slate-300"
                    >
                      {String(row[col] ?? '-')}
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

// 20. Settings & Automation Rules (12 Automation Engines)
export function OnboardingSettingsAutomationModule({
  role,
  notify,
}: OnboardingOpsModuleProps) {
  const perm = useOnboardingPermission('settings', role);
  const [settings, setSettings] = useState<OnboardingSettingsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingSettingsApi.getSettings();
      setSettings(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load onboarding settings & 12 automation rules'
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
      <OnboardingPermissionDeniedState
        moduleName="Settings & Automation Rules"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Onboarding Settings & 12 Automation Rules
        </h3>
        <p className="text-xs text-slate-500">
          Employee ID numbering, probation rules, GDPR retention & 12 backend automation triggers
        </p>
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={4} />
      ) : error ? (
        <OnboardingErrorState message={error} onRetry={loadSettings} />
      ) : !settings ? (
        <OnboardingEmptyState
          icon={Settings}
          title="No Settings Configured"
          description="Unable to find onboarding configuration settings."
          actionLabel="Reload Settings"
          onAction={loadSettings}
        />
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
              <p className="text-[11px] text-slate-500">Employee ID Prefix</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {settings.employeeIdPrefix}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
              <p className="text-[11px] text-slate-500">Default Probation</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {settings.defaultProbationDays} Days
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
              <p className="text-[11px] text-slate-500">GDPR Retention</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {settings.gdprRetentionMonths} Months
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {settings.automationRules.map((rule) => (
              <div
                key={rule.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {rule.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {rule.description}
                  </p>
                </div>
                {perm.canEdit && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await onboardingSettingsApi.toggleAutomationRule(
                          rule.id,
                          !rule.enabled
                        );
                        notify(`Automation rule ${rule.code} updated`);
                        void loadSettings();
                      } catch (err) {
                        notify(
                          err instanceof Error
                            ? err.message
                            : 'Rule toggle failed'
                        );
                      }
                    }}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                      rule.enabled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {rule.enabled ? 'Enabled' : 'Disabled'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// 21. Audit Logs
export function OnboardingAuditLogsModule({
  role,
  notify,
}: OnboardingOpsModuleProps) {
  const perm = useOnboardingPermission('audit-logs', role);
  const [logs, setLogs] = useState<OnboardingAuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAudit = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingAuditLogsApi.listAuditLogs();
      setLogs(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load immutable onboarding audit trail'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadAudit();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAudit]);

  if (!perm.canView) {
    return (
      <OnboardingPermissionDeniedState moduleName="Audit Logs" role={role} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Immutable Onboarding Audit Trail
          </h3>
          <p className="text-xs text-slate-500">
            Every document verification, sensitive ID reveal, date change, and probation decision
          </p>
        </div>
        {perm.canExport && (
          <button
            type="button"
            onClick={async () => {
              try {
                await onboardingAuditLogsApi.exportAuditLogsCsv();
                notify('Exported audit logs CSV');
              } catch (err) {
                notify(err instanceof Error ? err.message : 'Export failed');
              }
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        )}
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={4} />
      ) : error ? (
        <OnboardingErrorState message={error} onRetry={loadAudit} />
      ) : logs.length === 0 ? (
        <OnboardingEmptyState
          icon={History}
          title="No Audit Trail Events"
          description="Immutable audit records will appear here as actions occur."
          actionLabel="Refresh"
          onAction={loadAudit}
        />
      ) : (
        <div className="space-y-2">
          {logs.map((l) => (
            <div
              key={l.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">
                  {l.action} · {l.entityType}
                </span>
                <span className="text-[11px] text-slate-500">
                  {l.timestamp} · IP: {l.ipAddress}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Actor: {l.actorName} ({l.actorRole}) · {l.beforeSummary} →{' '}
                {l.afterSummary}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 22. Notifications
export function OnboardingNotificationsModule({
  role,
  notify,
}: OnboardingOpsModuleProps) {
  const perm = useOnboardingPermission('notifications', role);
  const [items, setItems] = useState<OnboardingNotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingNotificationsApi.listNotifications();
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load onboarding notifications'
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
      <OnboardingPermissionDeniedState
        moduleName="Notifications"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Onboarding Notifications & Event Alerts
          </h3>
          <p className="text-xs text-slate-500">
            Joiner added, document uploaded, task overdue, joining tomorrow & probation due alerts
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={async () => {
              try {
                await onboardingNotificationsApi.markRead(
                  items.map((n) => n.id)
                );
                notify('Marked notifications as read');
                void loadNotifications();
              } catch (err) {
                notify(
                  err instanceof Error
                    ? err.message
                    : 'Failed to mark notifications read'
                );
              }
            }}
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold"
          >
            Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={4} />
      ) : error ? (
        <OnboardingErrorState message={error} onRetry={loadNotifications} />
      ) : items.length === 0 ? (
        <OnboardingEmptyState
          icon={Bell}
          title="No Onboarding Notifications"
          description="You are all caught up on onboarding lifecycle alerts."
          actionLabel="Refresh"
          onAction={loadNotifications}
        />
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div
              key={n.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {n.title}
                </p>
                <p className="text-[11px] text-slate-500">{n.message}</p>
              </div>
              <span className="text-[10px] text-slate-400">{n.createdAt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 23. Manager Onboarding Portal
export function OnboardingManagerPortalModule({
  role,
}: OnboardingOpsModuleProps) {
  const perm = useOnboardingPermission('manager-portal', role);
  const [workspace, setWorkspace] =
    useState<OnboardingManagerPortalResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspace = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingManagerPortalApi.getWorkspace();
      setWorkspace(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load Manager Onboarding Portal'
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
      <OnboardingPermissionDeniedState
        moduleName="Manager Onboarding Portal"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Manager Onboarding Portal
        </h3>
        <p className="text-xs text-slate-500">
          Upcoming team joiners, 30-60-90 day goal setting, buddy assignment & probation reviews
        </p>
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={4} />
      ) : error ? (
        <OnboardingErrorState message={error} onRetry={loadWorkspace} />
      ) : !workspace || workspace.upcomingTeamJoiners.length === 0 ? (
        <OnboardingEmptyState
          icon={UsersRound}
          title="No Upcoming Team Joiners"
          description="Direct reports joining your team and their 30-60-90 day milestones will appear here."
          actionLabel="Refresh Portal"
          onAction={loadWorkspace}
        />
      ) : (
        <div className="space-y-2.5">
          {workspace.upcomingTeamJoiners.map((j) => (
            <div
              key={j.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
            >
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {j.fullName} · {j.designation}
              </p>
              <p className="text-[11px] text-slate-500">
                Joining: {j.joiningDate} · Progress: {j.completionPct}%
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 24. New Joiner Self-Service Portal (Pre-Boarding + ESS)
export function NewJoinerPortalModule({
  role,
  notify,
}: OnboardingOpsModuleProps) {
  const perm = useOnboardingPermission('joiner-portal', role);
  const [workspace, setWorkspace] =
    useState<NewJoinerPortalWorkspaceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queryOpen, setQueryOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<
    'IT' | 'HR' | 'Payroll' | 'Facilities'
  >('HR');

  const loadPortal = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingNewJoinerPortalApi.getWorkspace();
      setWorkspace(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load New Joiner Self-Service Portal'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadPortal();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadPortal]);

  if (!perm.canView) {
    return (
      <OnboardingPermissionDeniedState
        moduleName="New Joiner Self-Service Portal"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            New Joiner Self-Service Portal (Pre-Boarding + ESS)
          </h3>
          <p className="text-xs text-slate-500">
            Personalized welcome, checklist tracker, document uploads, policy e-sign & HR helpdesk
          </p>
        </div>
        <button
          type="button"
          onClick={() => setQueryOpen(true)}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
        >
          Ask HR / IT Helpdesk
        </button>
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={4} />
      ) : error ? (
        <div className="space-y-3">
          <OnboardingErrorState message={error} onRetry={loadPortal} />
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Need assistance before your joining day? Raise an onboarding helpdesk query
            </span>
            <button
              type="button"
              onClick={() => setQueryOpen(true)}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Ask HR / IT Helpdesk
            </button>
          </div>
        </div>
      ) : !workspace ? (
        <OnboardingEmptyState
          icon={UserCheck}
          title="No Self-Service Profile Active"
          description="Your personalized pre-boarding checklist, buddy card, and Day-1 guide will appear here."
          actionLabel="Ask HR Helpdesk"
          onAction={() => setQueryOpen(true)}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            {workspace.welcomeHeadline}
          </h4>
          <p className="text-xs text-slate-500">
            {workspace.joinerName} · {workspace.designation} · Joining:{' '}
            {workspace.joiningDate} · Buddy: {workspace.buddyName}
          </p>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            Checklist Progress: {workspace.checklistCompletionPct}%
          </p>
        </div>
      )}

      <OnboardingModal
        open={queryOpen}
        title="Raise Pre-Boarding / Onboarding Helpdesk Query"
        onClose={() => setQueryOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await onboardingNewJoinerPortalApi.submitHelpdeskQuery({
                subject,
                message,
                category,
              });
              notify('Helpdesk query submitted to Onboarding Desk');
              setQueryOpen(false);
            } catch (err) {
              notify(
                err instanceof Error ? err.message : 'Helpdesk query failed'
              );
            }
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Support Category
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value as 'IT' | 'HR' | 'Payroll' | 'Facilities'
                )
              }
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            >
              <option value="HR">HR & Documents</option>
              <option value="IT">IT Laptop & Access</option>
              <option value="Payroll">Bank & Statutory Setup</option>
              <option value="Facilities">ID Card & Seating</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Subject
            </label>
            <input
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Question about relieving letter upload"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Message
            </label>
            <textarea
              required
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setQueryOpen(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Submit Ticket
            </button>
          </div>
        </form>
      </OnboardingModal>
    </div>
  );
}
