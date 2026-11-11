'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Megaphone,
  CheckSquare,
  BarChart3,
  Settings,
  ShieldCheck,
  Bell,
  Briefcase,
  QrCode,
  Download,
  RefreshCw,
  Send,
  CheckCircle2,
} from 'lucide-react';
import {
  VisitorCommunicationTemplateRecord,
  VisitorApprovalWorkflowItem,
  VisitorReportRunResponse,
  VisitorSettingsResponse,
  VisitorAuditLogRecord,
  VisitorNotificationRecord,
  HostEmployeePortalWorkspaceResponse,
  PublicVisitorPortalResponse,
} from '../../types/visitors';
import {
  visitorCommunicationsApi,
  visitorApprovalsApi,
  visitorReportsApi,
  visitorSettingsApi,
  visitorAuditLogsApi,
  visitorNotificationsApi,
  visitorHostPortalApi,
  visitorPublicPortalApi,
} from '../../services/visitors';
import { VisitorApiError } from '../../services/visitors/client';
import { useVisitorPermission } from '../../hooks/useVisitorPermission';
import {
  VisitorSkeletonBlock,
  VisitorPermissionDeniedState,
  VisitorErrorState,
  VisitorEmptyState,
  VisitorModal,
} from './VisitorPrimitives';
import { VisitorModuleProps } from './VisitorCoreAndCheckInModules';

// ============================================================================
// 17. VISITOR COMMUNICATION & NOTIFICATIONS MODULE
// ============================================================================
export function VisitorCommunicationsModule({
  activeRole,
}: VisitorModuleProps) {
  const perm = useVisitorPermission('communications', activeRole);
  const [templates, setTemplates] = useState<
    VisitorCommunicationTemplateRecord[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [templateCode, setTemplateCode] = useState<string>('INVITE_QR_PASS');
  const [channel, setChannel] = useState<'Email' | 'SMS' | 'WhatsApp' | 'InApp'>(
    'Email'
  );
  const [targetAudience, setTargetAudience] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadTemplates = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorCommunicationsApi.listTemplates();
      setTemplates(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load visitor communication templates')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadTemplates();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTemplates]);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Dispatching visitor message...');
    try {
      await visitorCommunicationsApi.dispatchMessage({
        templateCode,
        channel,
        targetAudience,
      });
      setModalOpen(false);
      setSubmitStatus('');
      await loadTemplates();
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Dispatch failed');
    }
  };

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="17. Visitor Communication & Notifications"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            17. Visitor Communication Templates & Feedback Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Invite QR passes, arrival alerts, overstay warnings & post-visit feedback surveys
          </p>
        </div>
        {perm.canCreate ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Dispatch Template Message</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState
          error={error}
          onRetry={() => void loadTemplates()}
          actionLabel={
            perm.canCreate ? 'Dispatch Template Message' : undefined
          }
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : templates.length === 0 ? (
        <VisitorEmptyState
          icon={Megaphone}
          title="No Visitor Communication Templates Found"
          description="Manage Email, SMS, WhatsApp, and In-App notification templates for visitor journeys."
          actionLabel={
            perm.canCreate ? 'Dispatch Template Message' : undefined
          }
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {templates.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {t.title} ({t.channel})
                </p>
                <p className="text-xs text-slate-500">
                  Delivery Rate: {t.deliveryRatePct}% • Avg Feedback Rating:{' '}
                  {t.avgFeedbackRating}/5
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <VisitorModal
        open={modalOpen}
        title="Dispatch Visitor Notification / Feedback Survey"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleDispatch} className="space-y-3">
          <select
            value={templateCode}
            onChange={(e) => setTemplateCode(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="INVITE_QR_PASS">
              Pre-Registration Invite & QR Pass
            </option>
            <option value="HOST_ARRIVAL_ALERT">
              Host Visitor Arrival Notification
            </option>
            <option value="OVERSTAY_REMINDER">Overstay Check-Out Reminder</option>
            <option value="POST_VISIT_FEEDBACK">
              Thank-You & Post-Visit Feedback Survey
            </option>
          </select>
          <select
            value={channel}
            onChange={(e) =>
              setChannel(
                e.target.value as 'Email' | 'SMS' | 'WhatsApp' | 'InApp'
              )
            }
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="Email">Email</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="SMS">SMS</option>
            <option value="InApp">In-App</option>
          </select>
          <input
            required
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            placeholder="Target Pass Code or Location Group"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          {submitStatus ? (
            <p className="text-xs text-rose-600">{submitStatus}</p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Send Message
          </button>
        </form>
      </VisitorModal>
    </div>
  );
}

// ============================================================================
// 18. APPROVALS WORKFLOW MODULE
// ============================================================================
export function VisitorApprovalsWorkflowModule({
  activeRole,
}: VisitorModuleProps) {
  const perm = useVisitorPermission('approvals', activeRole);
  const [items, setItems] = useState<VisitorApprovalWorkflowItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);

  const loadApprovals = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorApprovalsApi.listApprovals();
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load visitor approvals workflow')
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
      <VisitorPermissionDeniedState
        moduleName="18. Approvals Workflow"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            18. Multi-Level Security & Facility Approvals Inbox
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Approve restricted area access, blacklist overrides, material gate passes, contractor permits & after-hours visits
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadApprovals()}
          className="h-9 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Refresh Inbox
        </button>
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState error={error} onRetry={() => void loadApprovals()} />
      ) : items.length === 0 ? (
        <VisitorEmptyState
          icon={CheckSquare}
          title="No Pending Security or Facility Approvals"
          description="All restricted area requests, blacklist overrides, and material gate passes have been processed."
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
                  [{item.approvalCategory}] {item.referenceCode} — {item.summary}
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
                      void visitorApprovalsApi
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
                      void visitorApprovalsApi
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
// 19. REPORTS & ANALYTICS MODULE (15-REPORT CATALOG)
// ============================================================================
const VISITOR_REPORT_CATALOG = [
  { key: 'visitor-log', label: '1. Complete Visitor Register Log' },
  { key: 'daily-monthly-footfall', label: '2. Daily & Monthly Footfall Report' },
  { key: 'host-wise-visits', label: '3. Host-Wise Visitor Activity Report' },
  {
    key: 'vendor-contractor-movement',
    label: '4. Vendor & Contractor Movement Report',
  },
  { key: 'overstay-incidents', label: '5. Visitor Overstay Incident Report' },
  { key: 'no-show-invitations', label: '6. Pre-Registration No-Show Report' },
  { key: 'watchlist-screening-hits', label: '7. Watchlist & Blacklist Hits Report' },
  { key: 'restricted-area-access', label: '8. Restricted Area Access Log' },
  { key: 'vehicle-parking-log', label: '9. Vehicle Entry & Parking Bay Log' },
  { key: 'material-gate-pass-movement', label: '10. Material Gate Pass Movement Report' },
  { key: 'evacuation-drill-audit', label: '11. Emergency & Evacuation Drill Report' },
  { key: 'ehs-nda-compliance', label: '12. NDA & Health/Safety Compliance Report' },
  { key: 'peak-hour-analysis', label: '13. Lobby Peak-Hour Heatmap Report' },
  { key: 'visit-duration-analysis', label: '14. Average Visit Duration Analysis' },
  { key: 'visitor-feedback-ratings', label: '15. Visitor Experience & Feedback Report' },
] as const;

export function VisitorReportsAnalyticsModule({
  activeRole,
}: VisitorModuleProps) {
  const perm = useVisitorPermission('reports', activeRole);
  const [selectedReportKey, setSelectedReportKey] = useState<string>(
    VISITOR_REPORT_CATALOG[0].key
  );
  const [reportData, setReportData] =
    useState<VisitorReportRunResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);
  const [exportMsg, setExportMsg] = useState<string>('');

  const runSelectedReport = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorReportsApi.runReport(selectedReportKey);
      setReportData(res);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to run visitor report')
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
      await visitorReportsApi.exportReport(selectedReportKey, format);
      setExportMsg(`Downloaded ${format.toUpperCase()}`);
    } catch (err) {
      setExportMsg(err instanceof Error ? err.message : 'Export failed');
    }
  };

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="19. Reports & Analytics"
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
              19. Visitor Reports & Security Compliance Catalog (15 Reports)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Server-driven footfall, watchlist, gate pass, evacuation & NDA compliance reports with CSV/XLSX/PDF export
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
          aria-label="Select Visitor Management Report"
          className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
        >
          {VISITOR_REPORT_CATALOG.map((rep) => (
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
        <VisitorSkeletonBlock rows={5} />
      ) : error ? (
        <VisitorErrorState
          error={error}
          onRetry={() => void runSelectedReport()}
        />
      ) : !reportData || reportData.rows.length === 0 ? (
        <VisitorEmptyState
          icon={BarChart3}
          title="No Report Rows Returned"
          description="No visitor records matched the selected report parameters."
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
// 20. SETTINGS & AUTOMATION RULES MODULE
// ============================================================================
export function VisitorSettingsAutomationModule({
  activeRole,
}: VisitorModuleProps) {
  const perm = useVisitorPermission('settings', activeRole);
  const [settings, setSettings] = useState<VisitorSettingsResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);

  const loadSettings = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorSettingsApi.getSettings();
      setSettings(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load visitor settings & automation rules')
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
      <VisitorPermissionDeniedState
        moduleName="20. Settings & Automation Rules"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            20. Visitor Policies, DPDP/GDPR Privacy & 14 Automation Rules
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure PII retention, kiosk idle reset, turnstile/ANPR/Wi-Fi integrations & backend automation rules
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
        <VisitorSkeletonBlock rows={5} />
      ) : error ? (
        <VisitorErrorState
          error={error}
          onRetry={() => void loadSettings()}
        />
      ) : !settings ? (
        <VisitorEmptyState
          icon={Settings}
          title="No Visitor Settings Returned"
          description="Connect to the Visitor Management API to configure automation rules and integrations."
          actionLabel="Retry Load"
          onAction={() => void loadSettings()}
        />
      ) : (
        <div className="space-y-2.5">
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
                  void visitorSettingsApi
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
// 21. AUDIT LOGS MODULE
// ============================================================================
export function VisitorAuditLogsModule({ activeRole }: VisitorModuleProps) {
  const perm = useVisitorPermission('audit-logs', activeRole);
  const [logs, setLogs] = useState<VisitorAuditLogRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);

  const loadAuditLogs = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorAuditLogsApi.listAuditLogs();
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
      <VisitorPermissionDeniedState
        moduleName="21. Audit Logs"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            21. Immutable Visitor Security Audit Trail
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track PII reveals, blacklist overrides, badge revocations, emergency triggers & kiosk events
          </p>
        </div>
        {perm.canExport ? (
          <button
            type="button"
            onClick={() => void visitorAuditLogsApi.exportAuditCsv()}
            className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit CSV</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState
          error={error}
          onRetry={() => void loadAuditLogs()}
        />
      ) : logs.length === 0 ? (
        <VisitorEmptyState
          icon={ShieldCheck}
          title="No Security Audit Trail Events Recorded"
          description="Every sensitive action across reception desks, kiosks, and watchlists is logged here."
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
                Actor: {log.actorName} ({log.actorRole}) • {log.timestamp} •
                Device/IP: {log.ipOrKioskId}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 22. NOTIFICATIONS MODULE
// ============================================================================
export function VisitorNotificationsModule({ activeRole }: VisitorModuleProps) {
  const perm = useVisitorPermission('notifications', activeRole);
  const [items, setItems] = useState<VisitorNotificationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorNotificationsApi.listNotifications();
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
      <VisitorPermissionDeniedState
        moduleName="22. Notifications"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            22. Visitor Event Notification Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time alerts for visitor arrivals, overstays, watchlist hits, pass expiry & emergency broadcasts
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            void visitorNotificationsApi
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
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState
          error={error}
          onRetry={() => void loadNotifications()}
        />
      ) : items.length === 0 ? (
        <VisitorEmptyState
          icon={Bell}
          title="No Visitor Notifications"
          description="You are caught up on all visitor arrival, approval, and security alerts."
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
// 23. HOST / EMPLOYEE PORTAL MODULE
// ============================================================================
export function HostEmployeePortalModule({
  activeRole,
  onNavigateModule,
}: VisitorModuleProps) {
  const perm = useVisitorPermission('host-portal', activeRole);
  const [workspace, setWorkspace] =
    useState<HostEmployeePortalWorkspaceResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);

  const loadWorkspace = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorHostPortalApi.getWorkspace();
      setWorkspace(res);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load Host Portal')
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
      <VisitorPermissionDeniedState
        moduleName="23. Host / Employee Portal"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            23. Host / Employee Portal — My Visitors & Invitations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Invite guests, approve lobby arrivals, extend active visits & issue material gate passes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateModule?.('pre-registration')}
            className="h-9 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Invite Visitor
          </button>
          <button
            type="button"
            onClick={() => onNavigateModule?.('material-gate-pass')}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          >
            Request Gate Pass
          </button>
        </div>
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState
          error={error}
          onRetry={() => void loadWorkspace()}
          actionLabel="Invite Visitor"
          onAction={() => onNavigateModule?.('pre-registration')}
        />
      ) : !workspace ? (
        <VisitorEmptyState
          icon={Briefcase}
          title="No Visitors Scheduled for You Today"
          description="Your upcoming guests, active lobby arrivals, and pre-registration invites appear here."
          actionLabel="Invite Visitor"
          onAction={() => onNavigateModule?.('pre-registration')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs text-slate-500">My Visitors Today</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
              {workspace.myVisitorsToday.length}
            </p>
          </div>
          <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs text-slate-500">Active Invitations</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
              {workspace.myActiveInvitations.length}
            </p>
          </div>
          <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <p className="text-xs text-slate-500">Pending Arrival Approvals</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
              {workspace.pendingArrivalApprovals.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 24. VISITOR PORTAL (PUBLIC PRE-REGISTRATION & PASS) MODULE
// ============================================================================
export function VisitorPublicPortalModule({ activeRole }: VisitorModuleProps) {
  const perm = useVisitorPermission('visitor-portal', activeRole);
  const [shortLivedToken, setShortLivedToken] = useState<string>('');
  const [ndaAccepted, setNdaAccepted] = useState<boolean>(true);
  const [healthCleared, setHealthCleared] = useState<boolean>(true);
  const [passData, setPassData] = useState<PublicVisitorPortalResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);

  const handleLoadPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortLivedToken.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorPublicPortalApi.completePreReg({
        token: shortLivedToken.trim(),
        ndaAccepted,
        healthCleared,
      });
      setPassData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Invalid or expired short-lived visitor portal token')
      );
    } finally {
      setLoading(false);
    }
  };

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="24. Visitor Portal (Public Pre-Registration & Pass)"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            24. Public Visitor Self-Service Portal (Zero PII in URL)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verify short-lived invitation token, complete NDA e-sign & health check, and view digital QR pass & parking directions
          </p>
        </div>

        <form onSubmit={handleLoadPass} className="space-y-3">
          <input
            required
            value={shortLivedToken}
            onChange={(e) => setShortLivedToken(e.target.value)}
            placeholder="Enter Short-Lived Secure Invitation Token / OTP"
            aria-label="Short-lived visitor portal token"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={ndaAccepted}
                onChange={(e) => setNdaAccepted(e.target.checked)}
              />
              <span>Accept Visitor NDA & Confidentiality Policy</span>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={healthCleared}
                onChange={(e) => setHealthCleared(e.target.checked)}
              />
              <span>Confirm Health & Safety Declaration</span>
            </label>
          </div>
          <button
            type="submit"
            className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Verify Token & Retrieve Digital QR Pass
          </button>
        </form>
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={3} />
      ) : error ? (
        <VisitorErrorState
          error={error}
          onRetry={() => {
            if (shortLivedToken.trim()) {
              void visitorPublicPortalApi
                .getPublicPass(shortLivedToken.trim())
                .then(setPassData)
                .catch(setError);
            }
          }}
        />
      ) : !passData ? (
        <VisitorEmptyState
          icon={QrCode}
          title="Enter Your Secure Invitation Token"
          description="No PII is ever placed in the URL. Enter your short-lived invitation token to complete pre-registration and unlock your QR pass."
        />
      ) : (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <p className="text-sm font-bold text-slate-900 dark:text-white">
            Pass {passData.passCode} — {passData.visitorName}
          </p>
          <p className="text-xs text-slate-500">
            Host: {passData.hostName} • Directions:{' '}
            {passData.locationDirections} • Parking: {passData.parkingSlotInfo}
          </p>
        </div>
      )}
    </div>
  );
}
