'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  QrCode,
  ShieldCheck,
  BarChart3,
  Settings,
  History,
  Bell,
  UsersRound,
  Laptop,
  Download,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  AssetRole,
  AssetLabelBatchRecord,
  AssetApprovalItem,
  AssetReportRunResponse,
  AssetSettingsResponse,
  AssetAuditLogRecord,
  AssetNotificationRecord,
  AssetManagerPortalWorkspaceResponse,
  EmployeeAssetPortalWorkspaceResponse,
} from '../../types/assets';
import {
  assetQrBarcodeApi,
  assetApprovalsApi,
  assetReportsApi,
  assetSettingsApi,
  assetAuditLogsApi,
  assetNotificationsApi,
  assetManagerPortalApi,
  assetEmployeePortalApi,
} from '../../services/assets';
import { useAssetPermission } from '../../hooks/useAssetPermission';
import {
  AssetSkeletonBlock,
  AssetPermissionDeniedState,
  AssetErrorState,
  AssetEmptyState,
  AssetModal,
} from './AssetPrimitives';

export interface AssetGovernanceModuleProps {
  role: AssetRole;
  notify: (msg: string) => void;
}

// 18. QR / Barcode / RFID Management
export function QrBarcodeRfidModule({
  role,
  notify,
}: AssetGovernanceModuleProps) {
  const perm = useAssetPermission('qr-barcode', role);
  const [batches, setBatches] = useState<AssetLabelBatchRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [templateName, setTemplateName] = useState('Standard 50x25mm Thermal');
  const [symbology, setSymbology] = useState<
    'QR' | 'Code128Barcode' | 'RFID_EPC'
  >('QR');
  const [category, setCategory] = useState('Laptop');
  const [count, setCount] = useState(25);

  const loadBatches = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetQrBarcodeApi.listBatches();
      setBatches(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load QR / Barcode / RFID label batches'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadBatches();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadBatches]);

  if (!perm.canView) {
    return (
      <AssetPermissionDeniedState
        moduleName="QR / Barcode / RFID Management"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            QR, Code-128 Barcode & RFID Label Designer
          </h3>
          <p className="text-xs text-slate-500">
            Bulk thermal label generation, scan-to-allocate/return/verify & RFID reader status
          </p>
        </div>
        {perm.canCreate && (
          <button
            type="button"
            onClick={() => setGenerateOpen(true)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            + Generate Labels
          </button>
        )}
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState
          message={error}
          onRetry={loadBatches}
          actionLabel={perm.canCreate ? '+ Generate Labels' : undefined}
          onAction={perm.canCreate ? () => setGenerateOpen(true) : undefined}
        />
      ) : batches.length === 0 ? (
        <AssetEmptyState
          icon={QrCode}
          title="No Label Batches Generated"
          description="Generate QR, Code-128 Barcode, or RFID EPC label batches for physical asset tagging."
          actionLabel={perm.canCreate ? 'Generate Labels' : undefined}
          onAction={perm.canCreate ? () => setGenerateOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {batches.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {b.batchCode} · {b.templateName} ({b.symbology})
                </p>
                <p className="text-[11px] text-slate-500">
                  Category: {b.category} · Labels: {b.labelsCount} · RFID
                  Reader: {b.rfidReaderStatus}
                </p>
              </div>
              <span className="text-[10px] text-slate-400">{b.generatedAt}</span>
            </div>
          ))}
        </div>
      )}

      <AssetModal
        open={generateOpen}
        title="Generate Bulk QR / Barcode / RFID Batch"
        onClose={() => setGenerateOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await assetQrBarcodeApi.generateBatch({
                templateName,
                symbology,
                category,
                count,
              });
              notify('Bulk label batch generated');
              setGenerateOpen(false);
              void loadBatches();
            } catch (err) {
              notify(
                err instanceof Error ? err.message : 'Batch generation failed'
              );
            }
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold mb-1">
              Label Template
            </label>
            <input
              required
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Symbology
              </label>
              <select
                value={symbology}
                onChange={(e) =>
                  setSymbology(
                    e.target.value as 'QR' | 'Code128Barcode' | 'RFID_EPC'
                  )
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              >
                <option value="QR">QR Code</option>
                <option value="Code128Barcode">Code-128 Barcode</option>
                <option value="RFID_EPC">RFID EPC</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Category
              </label>
              <input
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Count</label>
              <input
                type="number"
                min={1}
                max={500}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setGenerateOpen(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Generate
            </button>
          </div>
        </form>
      </AssetModal>
    </div>
  );
}

// 19. Approvals Workflow
export function AssetApprovalsWorkflowModule({
  role,
  notify,
}: AssetGovernanceModuleProps) {
  const perm = useAssetPermission('approvals', role);
  const [items, setItems] = useState<AssetApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadApprovals = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetApprovalsApi.listApprovals();
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load asset approvals inbox'
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
      <AssetPermissionDeniedState
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
      await assetApprovalsApi.decideApprovals({
        approvalIds: [id],
        decision,
        comments: `${decision} via Asset Approvals Inbox`,
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
          Multi-Level Asset Approvals Inbox
        </h3>
        <p className="text-xs text-slate-500">
          Procurement PO, Allocation Exception, Transfer, Write-Off, Disposal, Replacement & License Purchase
        </p>
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState message={error} onRetry={loadApprovals} />
      ) : items.length === 0 ? (
        <AssetEmptyState
          icon={ShieldCheck}
          title="No Pending Asset Approvals"
          description="Your asset procurement, allocation exception, and write-off approval inbox is clear."
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
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {a.referenceCode} · {a.approvalCategory} ({a.levelLabel})
                </p>
                <p className="text-[11px] text-slate-500">
                  {a.summary} · By {a.requestedBy}
                </p>
              </div>
              {perm.canApprove && a.status === 'Pending' && (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => void handleDecision(a.id, 'Approved')}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white"
                  >
                    <CheckCircle2 className="h-3 w-3" /> Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDecision(a.id, 'Rejected')}
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white"
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

// 20. Reports & Analytics (16 Report Catalog)
const ASSET_REPORT_CATALOG = [
  { key: 'asset-register', label: '1. Asset Register Master Report' },
  { key: 'allocation', label: '2. Asset Allocation Register' },
  { key: 'availability', label: '3. Stock Availability Report' },
  { key: 'aging', label: '4. Hardware Aging & Refresh Report' },
  { key: 'warranty-amc-expiry', label: '5. Warranty & AMC Expiry Report' },
  { key: 'maintenance-cost', label: '6. Maintenance Cost & Downtime' },
  { key: 'depreciation-schedule', label: '7. Fixed Asset Depreciation Schedule' },
  { key: 'book-value', label: '8. Net Book Value Valuation Report' },
  { key: 'loss-damage', label: '9. Loss, Damage & Write-Off Report' },
  { key: 'recovery', label: '10. Employee Damage Recovery Report' },
  { key: 'audit-discrepancy', label: '11. Physical Audit Discrepancy Report' },
  { key: 'license-utilization', label: '12. Software License Utilization' },
  { key: 'vendor-performance', label: '13. Vendor SLA Performance Report' },
  { key: 'stock-ledger', label: '14. Consumables Stock Ledger' },
  { key: 'employee-wise-assets', label: '15. Employee-Wise Custody Report' },
  { key: 'exit-clearance-pending', label: '16. Exit Clearance Pending Report' },
];

export function AssetReportsAnalyticsModule({
  role,
  notify,
}: AssetGovernanceModuleProps) {
  const perm = useAssetPermission('reports', role);
  const [selectedKey, setSelectedKey] = useState(ASSET_REPORT_CATALOG[0].key);
  const [report, setReport] = useState<AssetReportRunResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const runSelectedReport = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetReportsApi.runReport(selectedKey);
      setReport(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate asset analytics report'
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
      <AssetPermissionDeniedState
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
            Asset Reports & Analytics Catalog (16 Standard Reports)
          </h3>
          <p className="text-xs text-slate-500">
            Fixed asset register, depreciation, utilization, audit discrepancy & exit clearance exports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium"
          >
            {ASSET_REPORT_CATALOG.map((r) => (
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
                  await assetReportsApi.exportReport(selectedKey, 'csv');
                  notify('Exported Asset Report CSV');
                } catch (err) {
                  notify(err instanceof Error ? err.message : 'Export failed');
                }
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5" /> CSV
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState message={error} onRetry={runSelectedReport} />
      ) : !report || report.rows.length === 0 ? (
        <AssetEmptyState
          icon={BarChart3}
          title="No Report Rows Returned"
          description="No records matched the selected asset report parameters."
          actionLabel="Re-run Report"
          onAction={runSelectedReport}
        />
      ) : (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                {report.columns.map((c) => (
                  <th key={c} className="pb-2 pr-3 font-semibold">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {report.rows.map((row, idx) => (
                <tr key={idx}>
                  {report.columns.map((c) => (
                    <td key={c} className="py-2 pr-3">
                      {String(row[c] ?? '-')}
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

// 21. Settings & Automation Rules (12 Automation Engines + 8 Integrations)
export function AssetSettingsAutomationModule({
  role,
  notify,
}: AssetGovernanceModuleProps) {
  const perm = useAssetPermission('settings', role);
  const [settings, setSettings] = useState<AssetSettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetSettingsApi.getSettings();
      setSettings(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load asset settings, 12 automation rules & integrations'
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
      <AssetPermissionDeniedState
        moduleName="Settings & Automation Rules"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Asset Settings, 12 Automation Rules & 8 Enterprise Integrations
        </h3>
        <p className="text-xs text-slate-500">
          Tag formats, return SLAs, 12 backend automation rules & ITSM/SSO/MDM/ERP/Payroll connectors
        </p>
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState message={error} onRetry={loadSettings} />
      ) : !settings ? (
        <AssetEmptyState
          icon={Settings}
          title="No Asset Settings Loaded"
          description="Configure asset tag format, depreciation policies, and automation triggers."
          actionLabel="Reload Settings"
          onAction={loadSettings}
        />
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2.5">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
              <p className="text-[11px] text-slate-500">Tag Format</p>
              <p className="text-sm font-bold">{settings.assetTagFormat}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
              <p className="text-[11px] text-slate-500">Return SLA</p>
              <p className="text-sm font-bold">
                {settings.defaultReturnSlaDays} Days
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
              <p className="text-[11px] text-slate-500">Data Retention</p>
              <p className="text-sm font-bold">
                {settings.retentionMonths} Months
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
                  <p className="text-xs font-bold">{rule.name}</p>
                  <p className="text-[11px] text-slate-500">
                    {rule.description}
                  </p>
                </div>
                {perm.canEdit && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await assetSettingsApi.toggleAutomationRule(
                          rule.id,
                          !rule.enabled
                        );
                        notify(`Automation rule ${rule.code} updated`);
                        void loadSettings();
                      } catch (err) {
                        notify(
                          err instanceof Error ? err.message : 'Toggle failed'
                        );
                      }
                    }}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                      rule.enabled
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800'
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

// 22. Audit Logs
export function AssetAuditLogsModule({
  role,
  notify,
}: AssetGovernanceModuleProps) {
  const perm = useAssetPermission('audit-logs', role);
  const [logs, setLogs] = useState<AssetAuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetAuditLogsApi.listAuditLogs();
      setLogs(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load immutable asset audit trail'
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
      <AssetPermissionDeniedState moduleName="Audit Logs" role={role} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Immutable Asset Audit Trail
          </h3>
          <p className="text-xs text-slate-500">
            Every custody change, sensitive serial/cost reveal, write-off & GL batch
          </p>
        </div>
        {perm.canExport && (
          <button
            type="button"
            onClick={async () => {
              try {
                await assetAuditLogsApi.exportAuditLogsCsv();
                notify('Exported Asset Audit Logs CSV');
              } catch (err) {
                notify(err instanceof Error ? err.message : 'Export failed');
              }
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </button>
        )}
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState message={error} onRetry={loadLogs} />
      ) : logs.length === 0 ? (
        <AssetEmptyState
          icon={History}
          title="No Asset Audit Events"
          description="Immutable custody, financial, and verification audit logs appear here."
          actionLabel="Refresh"
          onAction={loadLogs}
        />
      ) : (
        <div className="space-y-2">
          {logs.map((l) => (
            <div
              key={l.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">
                  {l.action} · {l.entityType}
                </span>
                <span className="text-[11px] text-slate-500">
                  {l.timestamp} · IP: {l.ipAddress}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {l.actorName} ({l.actorRole}) · {l.beforeSummary} →{' '}
                {l.afterSummary}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 23. Notifications
export function AssetNotificationsModule({
  role,
  notify,
}: AssetGovernanceModuleProps) {
  const perm = useAssetPermission('notifications', role);
  const [items, setItems] = useState<AssetNotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetNotificationsApi.listNotifications();
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load asset notifications'
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
      <AssetPermissionDeniedState moduleName="Notifications" role={role} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Asset Notifications & Alert Center
          </h3>
          <p className="text-xs text-slate-500">
            Allocated, return due, warranty expiring, request approved, audit assigned & low stock
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={async () => {
              try {
                await assetNotificationsApi.markRead(items.map((n) => n.id));
                notify('Marked notifications as read');
                void loadNotifications();
              } catch (err) {
                notify(err instanceof Error ? err.message : 'Update failed');
              }
            }}
            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold"
          >
            Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState message={error} onRetry={loadNotifications} />
      ) : items.length === 0 ? (
        <AssetEmptyState
          icon={Bell}
          title="No Asset Notifications"
          description="You are caught up on all asset custody, warranty, and stock alerts."
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
                <p className="text-xs font-bold">{n.title}</p>
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

// 24. Manager Portal
export function AssetManagerPortalModule({ role }: AssetGovernanceModuleProps) {
  const perm = useAssetPermission('manager-portal', role);
  const [workspace, setWorkspace] =
    useState<AssetManagerPortalWorkspaceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspace = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetManagerPortalApi.getWorkspace();
      setWorkspace(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load Manager Asset Portal'
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
      <AssetPermissionDeniedState moduleName="Manager Portal" role={role} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Manager Asset Portal
        </h3>
        <p className="text-xs text-slate-500">
          Team allocated assets, pending asset approvals & reportees exit clearance status
        </p>
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState message={error} onRetry={loadWorkspace} />
      ) : !workspace || workspace.teamAssets.length === 0 ? (
        <AssetEmptyState
          icon={UsersRound}
          title="No Team Assets Allocated"
          description="Hardware and accessories assigned to your direct reports appear here."
          actionLabel="Refresh Portal"
          onAction={loadWorkspace}
        />
      ) : (
        <div className="space-y-2.5">
          {workspace.teamAssets.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
            >
              <p className="text-xs font-bold">
                {a.assigneeName} · {a.assetTag} ({a.assetName})
              </p>
              <p className="text-[11px] text-slate-500">
                Allocated: {a.allocatedDate} · Status: {a.status}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 25. Employee Portal (My Assets)
export function EmployeeAssetPortalModule({
  role,
  notify,
}: AssetGovernanceModuleProps) {
  const perm = useAssetPermission('employee-portal', role);
  const [workspace, setWorkspace] =
    useState<EmployeeAssetPortalWorkspaceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ackOpen, setAckOpen] = useState(false);
  const [assetTag, setAssetTag] = useState('');
  const [otpOrSignature, setOtpOrSignature] = useState('');

  const loadPortal = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetEmployeePortalApi.getWorkspace();
      setWorkspace(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load Employee Portal (My Assets)'
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
      <AssetPermissionDeniedState
        moduleName="Employee Portal (My Assets)"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Employee Portal — My Assets, Licenses & Self-Verification
          </h3>
          <p className="text-xs text-slate-500">
            Custody acknowledgement, assigned SaaS seats, self-audit verification & No-Dues status
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAckOpen(true)}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
        >
          Acknowledge / Self-Verify Asset
        </button>
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState
          message={error}
          onRetry={loadPortal}
          actionLabel="Acknowledge / Self-Verify Asset"
          onAction={() => setAckOpen(true)}
        />
      ) : !workspace || workspace.myHardwareAssets.length === 0 ? (
        <AssetEmptyState
          icon={Laptop}
          title="No Assets Assigned to You"
          description="Your allocated laptops, mobile devices, ID cards, and software licenses appear here."
          actionLabel="Acknowledge / Self-Verify Asset"
          onAction={() => setAckOpen(true)}
        />
      ) : (
        <div className="space-y-2.5">
          {workspace.myHardwareAssets.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold">
                  {a.assetTag} · {a.assetName}
                </p>
                <p className="text-[11px] text-slate-500">
                  Handover: {a.handoverStatus} · No-Dues: {workspace.noDuesStatus}
                </p>
              </div>
              <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                {a.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <AssetModal
        open={ackOpen}
        title="Acknowledge Custody / Submit Self-Audit Verification"
        onClose={() => setAckOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await assetEmployeePortalApi.acknowledgeAsset({
                assetTag,
                otpOrSignature,
                selfAuditVerified: true,
              });
              notify('Asset custody acknowledged and self-audit recorded');
              setAckOpen(false);
              void loadPortal();
            } catch (err) {
              notify(
                err instanceof Error
                  ? err.message
                  : 'Acknowledgement submission failed'
              );
            }
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold mb-1">
              Asset Tag
            </label>
            <input
              required
              value={assetTag}
              onChange={(e) => setAssetTag(e.target.value)}
              placeholder="e.g. AST-LAP-0092"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Digital Signature / OTP Code
            </label>
            <input
              required
              value={otpOrSignature}
              onChange={(e) => setOtpOrSignature(e.target.value)}
              placeholder="Type full legal name or 6-digit OTP"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAckOpen(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Confirm Custody
            </button>
          </div>
        </form>
      </AssetModal>
    </div>
  );
}
