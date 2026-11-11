'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Download,
  Save,
  CheckCheck,
} from 'lucide-react';
import {
  arrearsService,
  payrollReportsService,
  payrollSettingsService,
  payrollAuditLogsService,
  payrollNotificationsService,
  essMyPayService,
  payslipsService,
  formatPayrollCurrency,
  formatPayrollDate,
  PayrollApiError,
} from '../../services/payroll';
import {
  ArrearAdjustmentRecord,
  PayrollReportCode,
  PayrollReportDataResponse,
  SavedReportPreset,
  PayrollSettingsConfiguration,
  PayrollAuditLogEntry,
  PayrollNotificationItem,
  EssMyPayOverview,
  PaginatedResponse,
} from '../../types/payroll';
import { usePayrollPermission } from '../../hooks/usePayrollPermission';
import {
  PayrollLoadingSkeleton,
  PayrollEmptyState,
  PayrollErrorState,
  PayrollPermissionDenied,
  PayrollPaginationBar,
} from './PayrollPrimitives';

const REPORT_TYPES: { code: PayrollReportCode; label: string }[] = [
  { code: 'salary_register', label: 'Salary Register' },
  { code: 'payroll_summary', label: 'Payroll Summary' },
  { code: 'department_cost_center', label: 'Department / Cost-Center Cost' },
  { code: 'statutory_compliance', label: 'PF / ESI / PT / LWF / TDS Statutory' },
  { code: 'bank_transfer_statement', label: 'Bank Transfer Statement' },
  { code: 'variance_analysis', label: 'Month-over-Month Variance' },
  { code: 'lop_attendance_impact', label: 'LOP & Attendance Impact' },
  { code: 'overtime_register', label: 'Overtime Register' },
  { code: 'loan_recovery_ledger', label: 'Loan & Advance Recovery Ledger' },
  { code: 'reimbursement_register', label: 'Reimbursement Claims Register' },
  { code: 'tax_deduction_tds', label: 'Tax & TDS Projection Sheet' },
  { code: 'ctc_master_sheet', label: 'Employee CTC Master Sheet' },
  { code: 'headcount_payroll_cost', label: 'Headcount vs Payroll Cost' },
  { code: 'attrition_fnf_cost', label: 'Attrition & F&F Cost Report' },
  { code: 'year_end_reconciliation', label: 'Year-End Reconciliation' },
];

function downloadBlobFile(blob: Blob, filename: string) {
  if (typeof URL === 'undefined' || typeof document === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================================================
// MODULE 14: ARREARS, REVISIONS & CORRECTIONS
// ============================================================================
export function ArrearsModule({ onToast }: { onToast: (msg: string) => void }) {
  const perms = usePayrollPermission();
  const [arrearsPage, setArrearsPage] = useState<PaginatedResponse<ArrearAdjustmentRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [showCorrectionModal, setShowCorrectionModal] = useState(false);
  const [corrForm, setCorrForm] = useState({
    employeeId: '',
    adjustmentType: 'Retro Salary Revision' as ArrearAdjustmentRecord['adjustmentType'],
    effectiveFromDate: '',
    targetPayCycleId: 'CURRENT',
    grossArrearAmount: 0,
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadArrears = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await arrearsService.getArrears({ page: 1, pageSize: 25 }, { signal });
      setArrearsPage(res);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError({
        message: err instanceof Error ? err.message : 'Failed to load arrears & correction entries',
        status: err instanceof PayrollApiError ? err.statusCode : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('arrears')) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadArrears(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadArrears, perms]);

  if (!perms.canAccessModule('arrears')) {
    return (
      <PayrollPermissionDenied
        moduleTitle="Arrears, Revisions & Corrections"
        requiredPermission="payroll.arrears.view"
        currentRole={perms.role}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Arrears, Retro Revisions & Payroll Corrections
          </h2>
          <p className="text-xs text-slate-500">
            Retroactive salary hike arrears, LOP reversal arrears, and audited correction entries
          </p>
        </div>
        {perms.canManageArrears ? (
          <button
            type="button"
            onClick={() => setShowCorrectionModal(true)}
            className="h-11 px-4 rounded-2xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Correction / Arrear Entry</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <PayrollLoadingSkeleton rows={4} />
      ) : error ? (
        <PayrollErrorState
          title="Arrears & Corrections API Error"
          message={error.message}
          statusCode={error.status}
          onRetry={() => loadArrears()}
          primaryActionLabel={perms.canManageArrears ? 'New Correction / Arrear Entry' : undefined}
          onPrimaryAction={perms.canManageArrears ? () => setShowCorrectionModal(true) : undefined}
        />
      ) : !arrearsPage || arrearsPage.items.length === 0 ? (
        <PayrollEmptyState
          title="No Pending Arrears or Adjustments"
          description="Retroactive revisions and manual payroll corrections will appear here for inclusion in the upcoming payroll cycle."
          ctaLabel="New Correction / Arrear Entry"
          onAction={() => setShowCorrectionModal(true)}
          canAction={perms.canManageArrears}
        />
      ) : (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-3 px-2">Employee</th>
                <th className="py-3 px-2">Adjustment Type</th>
                <th className="py-3 px-2 text-right">Gross Arrear</th>
                <th className="py-3 px-2 text-right">Net Adjustment</th>
                <th className="py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {arrearsPage.items.map((ar) => (
                <tr key={ar.id}>
                  <td className="py-3 px-2 font-bold">{ar.employeeName} ({ar.employeeCode})</td>
                  <td className="py-3 px-2">{ar.adjustmentType} · {ar.reason}</td>
                  <td className="py-3 px-2 text-right font-mono">{formatPayrollCurrency(ar.grossArrearAmount)}</td>
                  <td className="py-3 px-2 text-right font-mono font-bold">{formatPayrollCurrency(ar.netAdjustmentAmount)}</td>
                  <td className="py-3 px-2">{ar.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCorrectionModal ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              try {
                await arrearsService.createCorrectionEntry(corrForm);
                setShowCorrectionModal(false);
                onToast('Correction / arrear entry recorded with audit trail');
                loadArrears();
              } catch (err) {
                onToast(err instanceof Error ? err.message : 'Failed to create correction entry');
              } finally {
                setSubmitting(false);
              }
            }}
            className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold">Record Arrear / Payroll Correction Entry</h3>
            <div className="space-y-3">
              <input
                type="text"
                required
                value={corrForm.employeeId}
                onChange={(e) => setCorrForm({ ...corrForm, employeeId: e.target.value })}
                placeholder="Employee ID"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <select
                value={corrForm.adjustmentType}
                onChange={(e) =>
                  setCorrForm({
                    ...corrForm,
                    adjustmentType: e.target.value as ArrearAdjustmentRecord['adjustmentType'],
                  })
                }
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="Retro Salary Revision">Retro Salary Revision</option>
                <option value="LOP Reversal Arrear">LOP Reversal Arrear</option>
                <option value="Attendance Correction">Attendance Correction</option>
                <option value="Manual Recovery">Manual Recovery</option>
              </select>
              <input
                type="date"
                required
                value={corrForm.effectiveFromDate}
                onChange={(e) => setCorrForm({ ...corrForm, effectiveFromDate: e.target.value })}
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <input
                type="number"
                required
                value={corrForm.grossArrearAmount}
                onChange={(e) =>
                  setCorrForm({ ...corrForm, grossArrearAmount: Number(e.target.value) })
                }
                placeholder="Gross Adjustment Amount"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
              <input
                type="text"
                required
                value={corrForm.reason}
                onChange={(e) => setCorrForm({ ...corrForm, reason: e.target.value })}
                placeholder="Mandatory audit reason"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCorrectionModal(false)}
                className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-11 px-5 rounded-2xl bg-indigo-600 text-white font-semibold"
              >
                Save Entry
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================================
// MODULE 15: REPORTS & ANALYTICS
// ============================================================================
export function PayrollReportsModule({ onToast }: { onToast: (msg: string) => void }) {
  const perms = usePayrollPermission();
  const [selectedReport, setSelectedReport] = useState<PayrollReportCode>('salary_register');
  const [reportData, setReportData] = useState<PayrollReportDataResponse | null>(null);
  const [presets, setPresets] = useState<SavedReportPreset[]>([]);
  const [page, setPage] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);

  const loadReport = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const [data, saved] = await Promise.all([
          payrollReportsService.getReportData(
            selectedReport,
            { page, pageSize: 20, department: departmentFilter || undefined },
            { signal }
          ),
          payrollReportsService.getSavedPresets({ signal }),
        ]);
        setReportData(data);
        setPresets(saved);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError({
          message: err instanceof Error ? err.message : 'Failed to generate payroll report from backend',
          status: err instanceof PayrollApiError ? err.statusCode : undefined,
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedReport, page, departmentFilter]
  );

  useEffect(() => {
    if (!perms.canAccessModule('reports')) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadReport(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadReport, perms]);

  if (!perms.canAccessModule('reports')) {
    return (
      <PayrollPermissionDenied
        moduleTitle="Reports & Analytics"
        requiredPermission="payroll.reports.view"
        currentRole={perms.role}
      />
    );
  }

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    try {
      const blob = await payrollReportsService.exportReport(selectedReport, format);
      downloadBlobFile(blob, `${selectedReport}.${format}`);
      onToast(`Exported ${selectedReport} as ${format.toUpperCase()}`);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Report export failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Enterprise Payroll Reports & Financial Analytics (15 Reports)
          </h2>
          <p className="text-xs text-slate-500">
            Server-side paginated registers, custom column presets, and CSV/XLSX/PDF exports
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            aria-label="Select Report Type"
            value={selectedReport}
            onChange={(e) => {
              setSelectedReport(e.target.value as PayrollReportCode);
              setPage(1);
            }}
            className="h-11 px-3.5 rounded-2xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            {REPORT_TYPES.map((rt) => (
              <option key={rt.code} value={rt.code}>
                {rt.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            placeholder="Filter Department..."
            className="h-11 px-3.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-40"
          />
          {perms.canExportReports ? (
            <>
              <button
                type="button"
                onClick={() => handleExport('csv')}
                className="h-11 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport('xlsx')}
                className="h-11 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>XLSX</span>
              </button>
              <button
                type="button"
                onClick={() => handleExport('pdf')}
                className="h-11 px-3.5 rounded-2xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </>
          ) : null}
        </div>
      </div>

      {presets.length > 0 ? (
        <div className="text-xs text-slate-500">
          Saved Report Presets: {presets.map((p) => p.name).join(', ')}
        </div>
      ) : null}

      {loading ? (
        <PayrollLoadingSkeleton rows={5} />
      ) : error ? (
        <PayrollErrorState
          title="Payroll Reports Engine Error"
          message={error.message}
          statusCode={error.status}
          onRetry={() => loadReport()}
          primaryActionLabel="Save Current Filter Preset"
          onPrimaryAction={async () => {
            try {
              await payrollReportsService.savePreset({
                name: `${selectedReport}_preset`,
                reportCode: selectedReport,
                selectedColumns: [],
                filters: { department: departmentFilter },
              });
              onToast('Report preset saved');
            } catch (err) {
              onToast(err instanceof Error ? err.message : 'Could not save preset');
            }
          }}
        />
      ) : !reportData || reportData.rows.length === 0 ? (
        <PayrollEmptyState
          title="No Report Rows Returned"
          description="Select a different pay cycle or clear department filters to view report data."
        />
      ) : (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                {reportData.columns.map((col) => (
                  <th key={col.key} className="py-3 px-2 font-semibold">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {reportData.rows.map((row, idx) => (
                <tr key={idx}>
                  {reportData.columns.map((col) => (
                    <td key={col.key} className="py-3 px-2 font-mono">
                      {String(row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <PayrollPaginationBar
            page={reportData.pagination.page}
            pageSize={reportData.pagination.pageSize}
            total={reportData.pagination.total}
            totalPages={reportData.pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODULE 16: PAYROLL SETTINGS & AUTOMATION RULES
// ============================================================================
export function PayrollSettingsModule({ onToast }: { onToast: (msg: string) => void }) {
  const perms = usePayrollPermission();
  const [settings, setSettings] = useState<PayrollSettingsConfiguration>({
    payCycleFrequency: 'Monthly',
    payPeriodStartDay: 1,
    attendanceCutoffDay: 25,
    payoutDayOfMonth: 30,
    payDaysCalculationBasis: 'Actual Calendar Days',
    roundingRule: 'Nearest Rupee',
    defaultCurrencyCode: 'INR',
    activeFinancialYear: '2026-27',
    defaultTaxRegime: 'New Regime',
    automationRules: {
      autoRunEnabled: true,
      cronScheduleExpression: '0 2 26 * *',
      autoLockAttendanceOnCutoff: true,
      autoComputeStatutoryChallans: true,
      autoGenerateBankAdviceOnApproval: true,
      autoPublishPayslipsOnDisbursement: true,
      varianceAlertThresholdPercent: 15,
      negativeNetPayAutoHold: true,
      notificationChannels: ['in_app', 'email', 'whatsapp'],
    },
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await payrollSettingsService.getSettings({ signal });
      setSettings(res);
      setHasUnsavedChanges(false);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError({
        message: err instanceof Error ? err.message : 'Failed to load payroll settings from backend',
        status: err instanceof PayrollApiError ? err.statusCode : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('settings')) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadSettings(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadSettings, perms]);

  if (!perms.canAccessModule('settings')) {
    return (
      <PayrollPermissionDenied
        moduleTitle="Payroll Settings & Automation Rules"
        requiredPermission="payroll.settings.view"
        currentRole={perms.role}
      />
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perms.canManageSettings) return;
    setSaving(true);
    try {
      const updated = await payrollSettingsService.updateSettings(settings);
      setSettings(updated);
      setHasUnsavedChanges(false);
      onToast('Payroll settings & automation rules saved');
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to save payroll settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Payroll Settings & Cron Automation Rules
          </h2>
          <p className="text-xs text-slate-500">
            Configure pay cycle frequency, cutoff dates, rounding rules, currency, and automated run schedules
          </p>
        </div>
        {hasUnsavedChanges ? (
          <span className="text-xs font-semibold text-amber-600">
            Unsaved changes pending
          </span>
        ) : null}
      </div>

      {loading ? (
        <PayrollLoadingSkeleton rows={4} />
      ) : error ? (
        <PayrollErrorState
          title="Payroll Settings API Notice"
          message={error.message}
          statusCode={error.status}
          onRetry={() => loadSettings()}
        />
      ) : null}

      <form
        onSubmit={handleSave}
        className="rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-5 text-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-1">Pay Cycle Frequency</label>
            <select
              value={settings.payCycleFrequency}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  payCycleFrequency: e.target.value as PayrollSettingsConfiguration['payCycleFrequency'],
                });
                setHasUnsavedChanges(true);
              }}
              className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="Monthly">Monthly</option>
              <option value="Bi-Weekly">Bi-Weekly</option>
              <option value="Weekly">Weekly</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Pay Days Calculation Basis</label>
            <select
              value={settings.payDaysCalculationBasis}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  payDaysCalculationBasis: e.target.value as PayrollSettingsConfiguration['payDaysCalculationBasis'],
                });
                setHasUnsavedChanges(true);
              }}
              className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="Actual Calendar Days">Actual Calendar Days</option>
              <option value="Working Days Only">Working Days Only</option>
              <option value="Fixed 30 Days">Fixed 30 Days</option>
              <option value="Fixed 26 Days">Fixed 26 Days</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1">Rounding Rule</label>
            <select
              value={settings.roundingRule}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  roundingRule: e.target.value as PayrollSettingsConfiguration['roundingRule'],
                });
                setHasUnsavedChanges(true);
              }}
              className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="Nearest Rupee">Nearest Rupee</option>
              <option value="Round Up">Round Up</option>
              <option value="Round Down">Round Down</option>
              <option value="Exact Two Decimals">Exact Two Decimals</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-1">Default Currency (ISO)</label>
            <input
              type="text"
              value={settings.defaultCurrencyCode}
              onChange={(e) => {
                setSettings({ ...settings, defaultCurrencyCode: e.target.value.toUpperCase() });
                setHasUnsavedChanges(true);
              }}
              className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Cron Auto-Run Schedule</label>
            <input
              type="text"
              value={settings.automationRules.cronScheduleExpression}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  automationRules: {
                    ...settings.automationRules,
                    cronScheduleExpression: e.target.value,
                  },
                });
                setHasUnsavedChanges(true);
              }}
              className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Variance Alert Threshold (%)</label>
            <input
              type="number"
              value={settings.automationRules.varianceAlertThresholdPercent}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  automationRules: {
                    ...settings.automationRules,
                    varianceAlertThresholdPercent: Number(e.target.value),
                  },
                });
                setHasUnsavedChanges(true);
              }}
              className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <span className="font-semibold">Auto-Lock Attendance on Cutoff Date</span>
            <input
              type="checkbox"
              checked={settings.automationRules.autoLockAttendanceOnCutoff}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  automationRules: {
                    ...settings.automationRules,
                    autoLockAttendanceOnCutoff: e.target.checked,
                  },
                });
                setHasUnsavedChanges(true);
              }}
            />
          </label>
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <span className="font-semibold">Auto-Generate Bank Advice on Approval</span>
            <input
              type="checkbox"
              checked={settings.automationRules.autoGenerateBankAdviceOnApproval}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  automationRules: {
                    ...settings.automationRules,
                    autoGenerateBankAdviceOnApproval: e.target.checked,
                  },
                });
                setHasUnsavedChanges(true);
              }}
            />
          </label>
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <span className="font-semibold">Auto-Publish Payslips on Disbursement</span>
            <input
              type="checkbox"
              checked={settings.automationRules.autoPublishPayslipsOnDisbursement}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  automationRules: {
                    ...settings.automationRules,
                    autoPublishPayslipsOnDisbursement: e.target.checked,
                  },
                });
                setHasUnsavedChanges(true);
              }}
            />
          </label>
          <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
            <span className="font-semibold">Auto-Hold Negative Net Pay Employees</span>
            <input
              type="checkbox"
              checked={settings.automationRules.negativeNetPayAutoHold}
              onChange={(e) => {
                setSettings({
                  ...settings,
                  automationRules: {
                    ...settings.automationRules,
                    negativeNetPayAutoHold: e.target.checked,
                  },
                });
                setHasUnsavedChanges(true);
              }}
            />
          </label>
        </div>

        {perms.canManageSettings ? (
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="h-11 px-5 rounded-2xl bg-indigo-600 text-white font-semibold inline-flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Settings & Rules'}</span>
            </button>
          </div>
        ) : null}
      </form>
    </div>
  );
}

// ============================================================================
// MODULE 17: AUDIT LOGS
// ============================================================================
export function PayrollAuditLogsModule({ onToast }: { onToast: (msg: string) => void }) {
  const perms = usePayrollPermission();
  const [logsPage, setLogsPage] = useState<PaginatedResponse<PayrollAuditLogEntry> | null>(null);
  const [selectedDiff, setSelectedDiff] = useState<PayrollAuditLogEntry | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);

  const loadLogs = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const res = await payrollAuditLogsService.getLogs(
          { page, pageSize: 25, search },
          { signal }
        );
        setLogsPage(res);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError({
          message: err instanceof Error ? err.message : 'Failed to load immutable payroll audit logs',
          status: err instanceof PayrollApiError ? err.statusCode : undefined,
        });
      } finally {
        setLoading(false);
      }
    },
    [page, search]
  );

  useEffect(() => {
    if (!perms.canAccessModule('audit-logs')) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadLogs(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadLogs, perms]);

  if (!perms.canAccessModule('audit-logs')) {
    return (
      <PayrollPermissionDenied
        moduleTitle="Payroll Audit Logs"
        requiredPermission="payroll.audit.view"
        currentRole={perms.role}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Immutable Payroll Audit Trail
          </h2>
          <p className="text-xs text-slate-500">
            Inspect actor, IP address, timestamp, and before/after JSON snapshots for every payroll mutation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Filter actor or entity..."
            className="h-11 px-3.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <button
            type="button"
            onClick={async () => {
              try {
                const blob = await payrollAuditLogsService.exportLogs('csv', { search });
                downloadBlobFile(blob, 'PayrollAuditLogs.csv');
                onToast('Audit log CSV exported');
              } catch (err) {
                onToast(err instanceof Error ? err.message : 'Export failed');
              }
            }}
            className="h-11 px-4 rounded-2xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {loading ? (
        <PayrollLoadingSkeleton rows={4} />
      ) : error ? (
        <PayrollErrorState
          title="Audit Logs API Error"
          message={error.message}
          statusCode={error.status}
          onRetry={() => loadLogs()}
        />
      ) : !logsPage || logsPage.items.length === 0 ? (
        <PayrollEmptyState
          title="No Audit Log Entries Matched"
          description="Immutable audit events for payroll runs, overrides, and sensitive field reveals will be listed here."
        />
      ) : (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-3 px-2">Timestamp & IP</th>
                <th className="py-3 px-2">Actor</th>
                <th className="py-3 px-2">Action</th>
                <th className="py-3 px-2">Summary</th>
                <th className="py-3 px-2 text-right">Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {logsPage.items.map((log) => (
                <tr key={log.id}>
                  <td className="py-3 px-2 font-mono">{formatPayrollDate(log.timestamp)} · {log.ipAddress}</td>
                  <td className="py-3 px-2 font-bold">{log.actorName} ({log.actorRole})</td>
                  <td className="py-3 px-2 font-mono text-indigo-600">{log.actionType}</td>
                  <td className="py-3 px-2">{log.summary}</td>
                  <td className="py-3 px-2 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedDiff(log)}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      Inspect Diff
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedDiff ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-lg rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
            <div className="flex justify-between">
              <h3 className="font-bold text-sm">Before / After Diff Snapshot ({selectedDiff.entityReference})</h3>
              <button type="button" onClick={() => setSelectedDiff(null)} className="text-slate-500">
                Close
              </button>
            </div>
            <pre className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 font-mono text-[11px] overflow-x-auto">
              {JSON.stringify(
                { before: selectedDiff.beforeSnapshot, after: selectedDiff.afterSnapshot },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================================
// MODULE 18: NOTIFICATIONS
// ============================================================================
export function PayrollNotificationsModule({ onToast }: { onToast: (msg: string) => void }) {
  const perms = usePayrollPermission();
  const [notifPage, setNotifPage] = useState<PaginatedResponse<PayrollNotificationItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);

  const loadNotifications = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await payrollNotificationsService.getNotifications(
        { page: 1, pageSize: 25 },
        { signal }
      );
      setNotifPage(res);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError({
        message: err instanceof Error ? err.message : 'Failed to load payroll notifications',
        status: err instanceof PayrollApiError ? err.statusCode : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('notifications')) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadNotifications(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadNotifications, perms]);

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Payroll Notification Center & Channel Preferences
          </h2>
          <p className="text-xs text-slate-500">
            Cycle run completion alerts, statutory filing reminders, and approval escalations
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            try {
              await payrollNotificationsService.markAllRead();
              onToast('All payroll notifications marked as read');
              loadNotifications();
            } catch (err) {
              onToast(err instanceof Error ? err.message : 'Could not mark notifications read');
            }
          }}
          className="h-11 px-4 rounded-2xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <CheckCheck className="w-3.5 h-3.5" />
          <span>Mark All Read</span>
        </button>
      </div>

      {loading ? (
        <PayrollLoadingSkeleton rows={3} />
      ) : error ? (
        <PayrollErrorState
          title="Payroll Notifications API Error"
          message={error.message}
          statusCode={error.status}
          onRetry={() => loadNotifications()}
        />
      ) : !notifPage || notifPage.items.length === 0 ? (
        <PayrollEmptyState
          title="No Unread Payroll Notifications"
          description="You are all caught up on payroll run alerts, approval reminders, and statutory deadlines."
        />
      ) : (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {notifPage.items.map((n) => (
            <div key={n.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">{n.title}</div>
                <p className="text-slate-500">{n.message}</p>
              </div>
              {!n.isRead ? (
                <button
                  type="button"
                  onClick={async () => {
                    await payrollNotificationsService.markAsRead(n.id);
                    loadNotifications();
                  }}
                  className="text-indigo-600 font-semibold"
                >
                  Mark Read
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODULE 19: EMPLOYEE SELF-SERVICE (ESS) — MY PAY
// ============================================================================
export function EssMyPayModule({ onToast }: { onToast: (msg: string) => void }) {
  const [essData, setEssData] = useState<EssMyPayOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);

  // Interactive ESS Modals (Tax Declaration, Reimbursement Claim, Bank Change Request)
  const [activeEssModal, setActiveEssModal] = useState<'tax' | 'reimbursement' | 'bank' | null>(null);
  const [taxForm, setTaxForm] = useState({
    selectedRegime: 'New Regime' as 'New Regime' | 'Old Regime',
    sec80CAmount: 150000,
    sec80DAmount: 25000,
    hraAmount: 0,
  });
  const [reimbForm, setReimbForm] = useState({
    category: 'Medical' as 'Medical' | 'Fuel & Conveyance' | 'Telecom & Broadband' | 'LTA',
    claimAmount: 0,
    billDate: '',
    description: '',
  });
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadEss = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await essMyPayService.getOverview('2026-27', { signal });
      setEssData(res);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError({
        message: err instanceof Error ? err.message : 'Failed to load My Pay self-service portal',
        status: err instanceof PayrollApiError ? err.statusCode : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadEss(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadEss]);

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Employee Self-Service (ESS) — My Pay Portal
          </h2>
          <p className="text-xs text-slate-500">
            My payslips, CTC breakup, YTD earnings & tax projection, Form 16, reimbursement claims, and bank account change requests
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setActiveEssModal('tax')}
            className="h-11 px-4 rounded-2xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Submit Tax Declaration
          </button>
          <button
            type="button"
            onClick={() => setActiveEssModal('reimbursement')}
            className="h-11 px-4 rounded-2xl bg-slate-900 text-white text-xs font-semibold"
          >
            Claim Reimbursement
          </button>
          <button
            type="button"
            onClick={() => setActiveEssModal('bank')}
            className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
          >
            Update Salary Bank A/C
          </button>
        </div>
      </div>

      {loading ? (
        <PayrollLoadingSkeleton rows={4} />
      ) : error ? (
        <PayrollErrorState
          title="My Pay Self-Service API Error"
          message={error.message}
          statusCode={error.status}
          onRetry={() => loadEss()}
          primaryActionLabel="Submit Tax Declaration"
          onPrimaryAction={() => setActiveEssModal('tax')}
        />
      ) : !essData ? (
        <PayrollEmptyState
          title="My Pay Profile Not Yet Initialized"
          description="Use the buttons above to submit your FY tax regime declaration, upload investment proofs, or file a reimbursement claim."
          ctaLabel="Submit Tax Declaration"
          onAction={() => setActiveEssModal('tax')}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="text-xs text-slate-500">Annual CTC</div>
              <div className="text-2xl font-bold font-mono">{formatPayrollCurrency(essData.annualCtc)}</div>
              <div className="text-xs text-slate-500 mt-1">Regime: {essData.activeTaxRegime}</div>
            </div>
            <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="text-xs text-slate-500">Latest Net Take-Home ({essData.latestPayCycleName})</div>
              <div className="text-2xl font-bold font-mono text-emerald-600">{formatPayrollCurrency(essData.latestNetPay)}</div>
            </div>
            <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="text-xs text-slate-500">YTD Net Earnings</div>
              <div className="text-2xl font-bold font-mono">{formatPayrollCurrency(essData.ytdNetTakeHome)}</div>
              <div className="text-xs text-slate-500 mt-1">YTD Gross: {formatPayrollCurrency(essData.ytdGrossEarnings)}</div>
            </div>
            <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="text-xs text-slate-500">YTD Tax Deducted / Projected</div>
              <div className="text-2xl font-bold font-mono text-amber-600">{formatPayrollCurrency(essData.ytdTaxDeducted)}</div>
              <div className="text-xs text-slate-500 mt-1">Remaining Tax: {formatPayrollCurrency(essData.remainingTaxToBeDeducted)}</div>
            </div>
          </div>

          <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <h3 className="text-sm font-bold mb-3">My Recent Payslips</h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {essData.recentPayslips.map((ps) => (
                <div key={ps.id} className="py-2.5 flex items-center justify-between">
                  <span className="font-bold">{ps.cycleName} · Pay Date {formatPayrollDate(ps.payDate)}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold">{formatPayrollCurrency(ps.netPay, ps.currencyCode)}</span>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const blob = await payslipsService.downloadPayslipPdf(ps.id, false);
                          downloadBlobFile(blob, `Payslip_${ps.cycleName}.pdf`);
                        } catch (err) {
                          onToast(err instanceof Error ? err.message : 'PDF download failed');
                        }
                      }}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ESS Modals */}
      {activeEssModal === 'tax' ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              try {
                await essMyPayService.submitTaxDeclaration({
                  financialYear: '2026-27',
                  selectedRegime: taxForm.selectedRegime,
                  declarations: [
                    { sectionCode: '80C', particulars: 'PPF / ELSS / LIC', declaredAmount: taxForm.sec80CAmount },
                    { sectionCode: '80D', particulars: 'Medical Insurance', declaredAmount: taxForm.sec80DAmount },
                    { sectionCode: 'HRA', particulars: 'House Rent Allowance', declaredAmount: taxForm.hraAmount },
                  ],
                });
                setActiveEssModal(null);
                onToast('Tax declaration submitted to payroll engine');
                loadEss();
              } catch (err) {
                onToast(err instanceof Error ? err.message : 'Tax declaration submission failed');
              } finally {
                setSubmitting(false);
              }
            }}
            className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold">My FY 2026-27 Tax Declaration</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Tax Regime</label>
                <select
                  value={taxForm.selectedRegime}
                  onChange={(e) =>
                    setTaxForm({
                      ...taxForm,
                      selectedRegime: e.target.value as 'New Regime' | 'Old Regime',
                    })
                  }
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="New Regime">New Tax Regime (Default)</option>
                  <option value="Old Regime">Old Tax Regime (With Exemptions)</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Section 80C Declared Amount</label>
                <input
                  type="number"
                  value={taxForm.sec80CAmount}
                  onChange={(e) => setTaxForm({ ...taxForm, sec80CAmount: Number(e.target.value) })}
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Section 80D Medical Insurance</label>
                <input
                  type="number"
                  value={taxForm.sec80DAmount}
                  onChange={(e) => setTaxForm({ ...taxForm, sec80DAmount: Number(e.target.value) })}
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveEssModal(null)}
                className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-11 px-5 rounded-2xl bg-indigo-600 text-white font-semibold"
              >
                Submit Declaration
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {activeEssModal === 'reimbursement' ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              try {
                await essMyPayService.submitReimbursementClaim(reimbForm);
                setActiveEssModal(null);
                onToast('Reimbursement claim submitted');
                loadEss();
              } catch (err) {
                onToast(err instanceof Error ? err.message : 'Reimbursement submission failed');
              } finally {
                setSubmitting(false);
              }
            }}
            className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold">Submit Reimbursement Claim</h3>
            <div className="space-y-3">
              <select
                value={reimbForm.category}
                onChange={(e) =>
                  setReimbForm({
                    ...reimbForm,
                    category: e.target.value as typeof reimbForm.category,
                  })
                }
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="Medical">Medical</option>
                <option value="Fuel & Conveyance">Fuel & Conveyance</option>
                <option value="Telecom & Broadband">Telecom & Broadband</option>
                <option value="LTA">LTA</option>
              </select>
              <input
                type="number"
                required
                value={reimbForm.claimAmount}
                onChange={(e) =>
                  setReimbForm({ ...reimbForm, claimAmount: Number(e.target.value) })
                }
                placeholder="Bill Claim Amount"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
              <input
                type="date"
                required
                value={reimbForm.billDate}
                onChange={(e) => setReimbForm({ ...reimbForm, billDate: e.target.value })}
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                required
                value={reimbForm.description}
                onChange={(e) => setReimbForm({ ...reimbForm, description: e.target.value })}
                placeholder="Invoice / Bill Description"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveEssModal(null)}
                className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-11 px-5 rounded-2xl bg-indigo-600 text-white font-semibold"
              >
                Submit Claim
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {activeEssModal === 'bank' ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              try {
                await essMyPayService.submitBankChangeRequest(bankForm);
                setActiveEssModal(null);
                onToast('Bank account change request submitted for HR verification');
                loadEss();
              } catch (err) {
                onToast(err instanceof Error ? err.message : 'Bank change request failed');
              } finally {
                setSubmitting(false);
              }
            }}
            className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold">Salary Bank Account Change Request</h3>
            <div className="space-y-3">
              <input
                type="text"
                required
                value={bankForm.bankName}
                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                placeholder="Bank Name (e.g. HDFC Bank)"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                required
                value={bankForm.accountNumber}
                onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                placeholder="Account Number"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
              <input
                type="text"
                required
                value={bankForm.ifscCode}
                onChange={(e) => setBankForm({ ...bankForm, ifscCode: e.target.value.toUpperCase() })}
                placeholder="IFSC Code"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
              <input
                type="text"
                required
                value={bankForm.reason}
                onChange={(e) => setBankForm({ ...bankForm, reason: e.target.value })}
                placeholder="Reason for change"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveEssModal(null)}
                className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-11 px-5 rounded-2xl bg-indigo-600 text-white font-semibold"
              >
                Submit Bank Change
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
