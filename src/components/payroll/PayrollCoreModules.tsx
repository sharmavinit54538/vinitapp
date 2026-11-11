'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Lock,
  Unlock,
  Plus,
  Calculator,
  Upload,
  FileSpreadsheet,
  Sliders,
  ArrowUpRight,
  GitCompare,
} from 'lucide-react';
import {
  payrollDashboardService,
  payCalendarRunService,
  salaryStructureService,
  compensationService,
  attendanceLopService,
  variableInputsService,
  formatPayrollCurrency,
  formatPayrollDate,
  PayrollApiError,
} from '../../services/payroll';
import {
  PayrollDashboardResponse,
  PayCalendarCycle,
  PayrollRunDetail,
  PreRunValidationReport,
  PayrollRunEmployeeSummary,
  PayrollEmployeeDrilldown,
  PayrollRunVarianceComparison,
  PayrollRunStageCode,
  SalaryComponentItem,
  UpsertSalaryComponentPayload,
  FormulaValidationResponse,
  SalaryStructureTemplate,
  CtcBreakupPreviewResponse,
  EmployeeCompensationRecord,
  SalaryRevisionHistoryItem,
  BulkUploadValidationPreview,
  AttendanceLopRecord,
  VariableInputRecord,
  CreateVariableInputPayload,
  ReimbursementClaimRecord,
  PaginatedResponse,
  PayrollModuleId,
} from '../../types/payroll';
import { usePayrollPermission } from '../../hooks/usePayrollPermission';
import {
  PayrollLoadingSkeleton,
  PayrollEmptyState,
  PayrollErrorState,
  PayrollPermissionDenied,
  SensitiveFieldCell,
  PayrollPaginationBar,
  ConfirmDestructiveModal,
} from './PayrollPrimitives';

const PAYROLL_STAGES_META: { code: PayrollRunStageCode; label: string }[] = [
  { code: 'attendance_lock', label: '1. Attendance Lock' },
  { code: 'input_collection', label: '2. Input Collection' },
  { code: 'pre_run_validation', label: '3. Pre-Run Validation' },
  { code: 'calculation', label: '4. Calculation' },
  { code: 'exceptions_review', label: '5. Exceptions Review' },
  { code: 'approval', label: '6. Approval' },
  { code: 'statutory_computation', label: '7. Statutory Computation' },
  { code: 'payslip_generation', label: '8. Payslip Generation' },
  { code: 'bank_file_generation', label: '9. Bank File Generation' },
  { code: 'disbursement', label: '10. Disbursement' },
  { code: 'posting_close', label: '11. Posting & Close' },
];

// ============================================================================
// MODULE 1: PAYROLL DASHBOARD
// ============================================================================
export function PayrollDashboardModule({
  onNavigateModule,
  onToast,
}: {
  onNavigateModule: (mod: PayrollModuleId) => void;
  onToast: (msg: string) => void;
}) {
  const perms = usePayrollPermission();
  const [financialYear, setFinancialYear] = useState('2026-27');
  const [cycleId, setCycleId] = useState('');
  const [data, setData] = useState<PayrollDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);

  const fetchDashboard = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const res = await payrollDashboardService.getSummary(
          { cycleId: cycleId || undefined, financialYear },
          { signal }
        );
        setData(res);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const status = err instanceof PayrollApiError ? err.statusCode : undefined;
        setError({
          message: err instanceof Error ? err.message : 'Failed to load payroll dashboard summary',
          status,
        });
      } finally {
        setLoading(false);
      }
    },
    [cycleId, financialYear]
  );

  useEffect(() => {
    if (!perms.canAccessModule('dashboard')) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchDashboard(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fetchDashboard, perms]);

  if (!perms.canAccessModule('dashboard')) {
    return (
      <PayrollPermissionDenied
        moduleTitle="Payroll Dashboard"
        requiredPermission="payroll.dashboard.view"
        currentRole={perms.role}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Filter & Quick Navigation Header */}
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Payroll Command Center
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time cycle metrics, statutory compliance deadlines, and variance alerts from API
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <select
            aria-label="Financial Year"
            value={financialYear}
            onChange={(e) => setFinancialYear(e.target.value)}
            className="h-11 px-3.5 rounded-2xl text-xs font-semibold bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          >
            <option value="2026-27">FY 2026-27</option>
            <option value="2025-26">FY 2025-26</option>
          </select>
          <input
            type="text"
            value={cycleId}
            onChange={(e) => setCycleId(e.target.value)}
            placeholder="Filter Cycle ID..."
            aria-label="Filter Cycle ID"
            className="h-11 px-3.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white w-36"
          />
          <button
            type="button"
            onClick={() => onNavigateModule('pay-calendar')}
            className="h-11 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 inline-flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Open Payroll Run Engine</span>
          </button>
        </div>
      </div>

      {loading ? (
        <PayrollLoadingSkeleton rows={4} />
      ) : error ? (
        <PayrollErrorState
          title="Payroll Dashboard API Unreachable"
          message={error.message}
          statusCode={error.status}
          onRetry={() => fetchDashboard()}
          primaryActionLabel="Go to Pay Calendar & Run"
          onPrimaryAction={() => onNavigateModule('pay-calendar')}
        />
      ) : !data ? (
        <PayrollEmptyState
          title="No Active Payroll Cycle Found"
          description="Initialize a pay calendar cycle or configure payroll settings to begin processing monthly salaries."
          ctaLabel="Configure Pay Calendar"
          onAction={() => onNavigateModule('pay-calendar')}
        />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Current Cycle ({data.kpis.currentCycleLabel})</span>
                <span className="font-mono text-indigo-600 dark:text-indigo-400">
                  {data.kpis.cycleStatus}
                </span>
              </div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {formatPayrollCurrency(data.kpis.netPay, data.kpis.currencyCode)}
              </div>
              <div className="text-xs text-slate-500">
                Net Pay · Pay Date {formatPayrollDate(data.kpis.payDate)}
              </div>
            </div>

            <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="text-xs font-semibold text-slate-500">Gross Earnings & Cost</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                {formatPayrollCurrency(data.kpis.grossPay, data.kpis.currencyCode)}
              </div>
              <div className="text-xs text-slate-500 font-mono tabular-nums">
                Total Cost: {formatPayrollCurrency(data.kpis.totalPayrollCost, data.kpis.currencyCode)}
              </div>
            </div>

            <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="text-xs font-semibold text-slate-500">Deductions & Employer Contrib.</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                {formatPayrollCurrency(data.kpis.totalDeductions, data.kpis.currencyCode)}
              </div>
              <div className="text-xs text-slate-500 font-mono tabular-nums">
                Employer: {formatPayrollCurrency(data.kpis.employerContributions, data.kpis.currencyCode)}
              </div>
            </div>

            <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-1.5">
              <div className="text-xs font-semibold text-slate-500">Processed Headcount & Holds</div>
              <div className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                {data.kpis.processedHeadcount}
              </div>
              <div className="text-xs text-slate-500 font-mono tabular-nums">
                {data.kpis.pendingHoldCount} on hold · Variance {data.kpis.variancePercentVsLastMonth}%
              </div>
            </div>
          </div>

          {/* Monthly Trend & Department Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Monthly Payroll Cost Trend
                </h3>
                <button
                  type="button"
                  onClick={() => onNavigateModule('reports')}
                  className="text-xs font-semibold text-indigo-600 inline-flex items-center gap-1"
                >
                  <span>Reports</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {data.monthlyTrend.length === 0 ? (
                <p className="text-xs text-slate-500 py-4">No historical trend points returned.</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {data.monthlyTrend.map((pt) => (
                    <div key={pt.cycleLabel} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white">{pt.cycleLabel}</span>
                        <span className="text-slate-500 ml-2 font-mono">{pt.headcount} emp</span>
                      </div>
                      <div className="font-mono tabular-nums text-right">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatPayrollCurrency(pt.netPay, data.kpis.currencyCode)}
                        </span>
                        <span className="text-slate-500 ml-2">
                          (Gross {formatPayrollCurrency(pt.grossPay, data.kpis.currencyCode)})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Statutory Dues & Exception Alerts ({data.exceptions.length})
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    onToast('Navigated to Statutory Compliance');
                    onNavigateModule('statutory');
                  }}
                  className="text-xs font-semibold text-indigo-600"
                >
                  Statutory Hub
                </button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {data.statutoryDues.map((due) => (
                  <div key={due.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {due.statutoryType} · {due.title}
                      </span>
                      <p className="text-slate-500">Due {formatPayrollDate(due.dueDate)}</p>
                    </div>
                    <div className="text-right font-mono tabular-nums">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {formatPayrollCurrency(due.amountDue, data.kpis.currencyCode)}
                      </div>
                      <div className="text-[11px] text-amber-600">{due.status}</div>
                    </div>
                  </div>
                ))}
                {data.exceptions.map((ex) => (
                  <div key={ex.id} className="py-2.5 flex items-start justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-rose-600">{ex.category}</span>
                      <span className="text-slate-500"> · {ex.employeeName}</span>
                      <p className="text-slate-600 dark:text-slate-400">{ex.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// MODULE 2: PAY CALENDAR & AUTOMATED PAYROLL RUN (CORE ENGINE UI)
// ============================================================================
export function PayCalendarRunModule({ onToast }: { onToast: (msg: string) => void }) {
  const perms = usePayrollPermission();
  const [calendars, setCalendars] = useState<PayCalendarCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [runDetail, setRunDetail] = useState<PayrollRunDetail | null>(null);
  const [validationReport, setValidationReport] = useState<PreRunValidationReport | null>(null);
  const [employeesPage, setEmployeesPage] = useState<PaginatedResponse<PayrollRunEmployeeSummary> | null>(null);
  const [variance, setVariance] = useState<PayrollRunVarianceComparison | null>(null);
  const [drilldown, setDrilldown] = useState<PayrollEmployeeDrilldown | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modals
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [showOffCycleModal, setShowOffCycleModal] = useState(false);
  const [holdTarget, setHoldTarget] = useState<{ empId: string; currentStatus: string } | null>(null);
  const [offCycleForm, setOffCycleForm] = useState({
    name: '',
    payDate: '',
    runType: 'Off-Cycle' as 'Off-Cycle' | 'Supplementary',
    reason: '',
    employeeIdsCsv: '',
  });

  const loadRunData = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const [cals, currentRun] = await Promise.all([
          payCalendarRunService.getCalendars(undefined, { signal }),
          payCalendarRunService.getCurrentRun(selectedCycleId || undefined, { signal }),
        ]);
        setCalendars(cals);
        setRunDetail(currentRun);

        if (currentRun?.id) {
          const [valRep, empList, varData] = await Promise.all([
            payCalendarRunService.getPreRunValidation(currentRun.id, { signal }),
            payCalendarRunService.getRunEmployees(
              currentRun.id,
              { page, pageSize: 20, search },
              { signal }
            ),
            payCalendarRunService.getVarianceComparison(currentRun.id, undefined, { signal }),
          ]);
          setValidationReport(valRep);
          setEmployeesPage(empList);
          setVariance(varData);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const status = err instanceof PayrollApiError ? err.statusCode : undefined;
        setError({
          message: err instanceof Error ? err.message : 'Unable to fetch active payroll run engine state',
          status,
        });
      } finally {
        setLoading(false);
      }
    },
    [selectedCycleId, page, search]
  );

  useEffect(() => {
    if (!perms.canAccessModule('pay-calendar')) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadRunData(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadRunData, perms]);

  // Real-time progress polling when run is in 'Running' state
  useEffect(() => {
    if (!runDetail || runDetail.overallStatus !== 'Running') return;
    const timer = setInterval(async () => {
      try {
        const prog = await payCalendarRunService.getRunProgress(runDetail.id);
        setRunDetail((prev) =>
          prev
            ? {
                ...prev,
                currentStage: prog.currentStage,
                overallStatus: prog.overallStatus,
                progressPercentage: prog.progressPercentage,
                processedEmployees: prog.processedEmployees,
              }
            : prev
        );
      } catch {
        // Polling error ignored
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [runDetail]);

  if (!perms.canAccessModule('pay-calendar')) {
    return (
      <PayrollPermissionDenied
        moduleTitle="Pay Calendar & Automated Payroll Run"
        requiredPermission="payroll.run.view"
        currentRole={perms.role}
      />
    );
  }

  const handleRunAction = async (
    action: 'execute' | 'pause' | 'resume' | 'retry',
    stage?: PayrollRunStageCode
  ) => {
    if (! perms.canExecuteRun) return;
    const targetRunId = runDetail?.id || selectedCycleId || 'current';
    setIsSubmitting(true);
    try {
      let updated: PayrollRunDetail;
      if (action === 'execute') {
        updated = await payCalendarRunService.executeRun(targetRunId, {
          runType: runDetail?.runType || 'Regular',
          stepCode: stage,
        });
        onToast('Payroll run execution triggered on backend');
      } else if (action === 'pause') {
        updated = await payCalendarRunService.pauseRun(targetRunId, 'Operator paused run');
        onToast('Payroll run paused');
      } else if (action === 'resume') {
        updated = await payCalendarRunService.resumeRun(targetRunId);
        onToast('Payroll run resumed');
      } else {
        updated = await payCalendarRunService.retryFailedStep(
          targetRunId,
          stage || runDetail?.currentStage || 'calculation'
        );
        onToast('Retrying failed payroll stage');
      }
      setRunDetail(updated);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Payroll run command failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRollback = async (reason: string) => {
    const targetRunId = runDetail?.id || 'current';
    setIsSubmitting(true);
    try {
      const updated = await payCalendarRunService.rollbackRun(targetRunId, {
        reason,
        targetStage: 'input_collection',
      });
      setRunDetail(updated);
      setShowRollbackModal(false);
      onToast('Payroll run rolled back and reopened with audit log');
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Rollback request failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateOffCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!offCycleForm.name.trim() || !offCycleForm.payDate.trim()) {
      onToast('Please provide cycle name and payout date');
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await payCalendarRunService.createOffCycleRun({
        name: offCycleForm.name.trim(),
        payDate: offCycleForm.payDate.trim(),
        runType: offCycleForm.runType,
        reason: offCycleForm.reason.trim(),
        employeeIds: offCycleForm.employeeIdsCsv
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setRunDetail(created);
      setShowOffCycleModal(false);
      onToast(`${offCycleForm.runType} payroll run initialized`);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to create off-cycle run');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDrilldown = async (employeeId: string) => {
    if (!runDetail) return;
    try {
      const detail = await payCalendarRunService.getEmployeeDrilldown(runDetail.id, employeeId);
      setDrilldown(detail);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Could not load employee calculation breakdown');
    }
  };

  const handleConfirmHoldToggle = async (reason: string) => {
    if (!holdTarget || !runDetail) return;
    setIsSubmitting(true);
    try {
      const action = holdTarget.currentStatus === 'On Hold' ? 'release' : 'hold';
      await payCalendarRunService.toggleSalaryHold(runDetail.id, holdTarget.empId, {
        action,
        reason,
      });
      setHoldTarget(null);
      onToast(`Employee salary ${action === 'hold' ? 'placed on hold' : 'released'}`);
      loadRunData();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Salary hold update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Engine Action Bar */}
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Pay Calendar & Automated Payroll Run Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            11-Stage Automated Pipeline: Attendance Lock → Validation → Calculation → Statutory → Bank Advice → Posting
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {calendars.length > 0 ? (
            <select
              aria-label="Select Pay Cycle"
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className="h-11 px-3.5 rounded-2xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="">Current Active Cycle</option>
              {calendars.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.runType} · {c.status})
                </option>
              ))}
            </select>
          ) : null}

          {perms.canExecuteRun ? (
            <>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleRunAction('execute')}
                className="h-11 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 inline-flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Run Now</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleRunAction('pause')}
                className="h-11 px-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleRunAction('resume')}
                className="h-11 px-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Resume / Retry</span>
              </button>
              <button
                type="button"
                onClick={() => setShowOffCycleModal(true)}
                className="h-11 px-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Off-Cycle / Supplementary</span>
              </button>
            </>
          ) : null}

          {perms.canRollbackRun ? (
            <button
              type="button"
              onClick={() => setShowRollbackModal(true)}
              className="h-11 px-3.5 rounded-2xl border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400 inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rollback / Reopen</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* 11-Stage Visual Pipeline Stepper */}
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            11-Stage Automated Run Stepper
          </h3>
          <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">
            {runDetail
              ? `${runDetail.overallStatus} · ${runDetail.progressPercentage}% (${runDetail.processedEmployees}/${runDetail.eligibleEmployees})`
              : 'Awaiting Backend Run State'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {PAYROLL_STAGES_META.map((stageMeta) => {
            const apiStage = runDetail?.stages?.find((s) => s.code === stageMeta.code);
            const status = apiStage?.status || 'pending';
            const isCurrent = runDetail?.currentStage === stageMeta.code;
            return (
              <div
                key={stageMeta.code}
                className={`rounded-2xl p-3 border text-xs space-y-1 ${
                  isCurrent
                    ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40'
                    : status === 'completed'
                    ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : status === 'failed'
                    ? 'border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20'
                    : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40'
                }`}
              >
                <div className="font-bold text-slate-900 dark:text-white truncate">
                  {stageMeta.label}
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span className="capitalize">{status.replace('_', ' ')}</span>
                  {status === 'failed' && perms.canExecuteRun ? (
                    <button
                      type="button"
                      onClick={() => handleRunAction('retry', stageMeta.code)}
                      className="text-rose-600 underline font-semibold"
                    >
                      Retry
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {loading ? (
        <PayrollLoadingSkeleton rows={5} />
      ) : error ? (
        <PayrollErrorState
          title="Payroll Run Engine API Error"
          message={error.message}
          statusCode={error.status}
          onRetry={() => loadRunData()}
          primaryActionLabel={perms.canExecuteRun ? 'Initialize Off-Cycle Run' : undefined}
          onPrimaryAction={perms.canExecuteRun ? () => setShowOffCycleModal(true) : undefined}
        />
      ) : !runDetail ? (
        <PayrollEmptyState
          title="No Active Payroll Run Selected"
          description="Select a pay calendar period or trigger an automated Regular / Off-Cycle payroll run."
          ctaLabel="Create Off-Cycle / Supplementary Run"
          onAction={() => setShowOffCycleModal(true)}
          canAction={perms.canExecuteRun}
        />
      ) : (
        <>
          {/* Pre-Run Validation Checks & Variance Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pre-Run Validation Checks
                </h3>
                <span className="text-xs font-mono text-slate-500">
                  {validationReport?.canProceedToCalculation ? 'Ready to Calculate' : 'Review Required'}
                </span>
              </div>
              {validationReport?.checks?.length ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {validationReport.checks.map((chk) => (
                    <div key={chk.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {chk.status === 'passed' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                        )}
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {chk.label}
                          </span>
                          <p className="text-slate-500">{chk.details}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {chk.affectedEmployeesCount} affected
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">No pre-run validation anomalies reported.</p>
              )}
            </div>

            <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white inline-flex items-center gap-1.5">
                  <GitCompare className="w-4 h-4 text-indigo-600" />
                  <span>Run Variance Comparison (Current vs Previous)</span>
                </h3>
              </div>
              {variance ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Comparing Cycles</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {variance.currentCycleName} vs {variance.previousCycleName}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 font-mono">
                    <span className="text-slate-500">Headcount Delta</span>
                    <span>{variance.headcountDelta >= 0 ? `+${variance.headcountDelta}` : variance.headcountDelta}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 font-mono">
                    <span className="text-slate-500">Gross Pay Delta</span>
                    <span>{formatPayrollCurrency(variance.grossPayDelta, runDetail.currencyCode)}</span>
                  </div>
                  <div className="flex justify-between py-1.5 font-mono">
                    <span className="text-slate-500">Net Pay Delta</span>
                    <span className="font-bold text-indigo-600">
                      {formatPayrollCurrency(variance.netPayDelta, runDetail.currencyCode)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Variance comparison will populate once run calculation completes.</p>
              )}
            </div>
          </div>

          {/* Employee-Wise Run Summary Table */}
          <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Employee-Wise Run Summary
              </h3>
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search employee name or code..."
                aria-label="Search run employees"
                className="h-10 px-3.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-64"
              />
            </div>

            {!employeesPage || employeesPage.items.length === 0 ? (
              <PayrollEmptyState
                title="No Employee Run Records Found"
                description="Execute the calculation step to populate employee-wise gross, deductions, statutory, and net pay rows."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <th className="py-3 px-2 font-semibold">Employee</th>
                      <th className="py-3 px-2 font-semibold">Pay Days / LOP</th>
                      <th className="py-3 px-2 font-semibold text-right">Gross</th>
                      <th className="py-3 px-2 font-semibold text-right">Deductions</th>
                      <th className="py-3 px-2 font-semibold text-right">Net Pay</th>
                      <th className="py-3 px-2 font-semibold text-right">Variance</th>
                      <th className="py-3 px-2 font-semibold">Status</th>
                      <th className="py-3 px-2 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {employeesPage.items.map((emp) => (
                      <tr key={emp.employeeId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-2">
                          <div className="font-bold text-slate-900 dark:text-white">{emp.employeeName}</div>
                          <div className="text-slate-500 font-mono">{emp.employeeCode} · {emp.department}</div>
                        </td>
                        <td className="py-3 px-2 font-mono tabular-nums">
                          {emp.payableDays}d / {emp.lopDays} LOP
                        </td>
                        <td className="py-3 px-2 text-right font-mono tabular-nums">
                          {formatPayrollCurrency(emp.grossEarnings, runDetail.currencyCode)}
                        </td>
                        <td className="py-3 px-2 text-right font-mono tabular-nums text-amber-600">
                          {formatPayrollCurrency(emp.totalDeductions, runDetail.currencyCode)}
                        </td>
                        <td className="py-3 px-2 text-right font-mono tabular-nums font-bold text-slate-900 dark:text-white">
                          {formatPayrollCurrency(emp.netPay, runDetail.currencyCode)}
                        </td>
                        <td className="py-3 px-2 text-right font-mono tabular-nums">
                          {emp.variancePercentage}%
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                            {emp.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDrilldown(emp.employeeId)}
                            className="text-indigo-600 font-semibold hover:underline"
                          >
                            Drill-down
                          </button>
                          {perms.canHoldSalary ? (
                            <button
                              type="button"
                              onClick={() =>
                                setHoldTarget({ empId: emp.employeeId, currentStatus: emp.paymentStatus })
                              }
                              className="text-amber-600 font-semibold hover:underline"
                            >
                              {emp.paymentStatus === 'On Hold' ? 'Release' : 'Hold'}
                            </button>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <PayrollPaginationBar
                  page={employeesPage.page}
                  pageSize={employeesPage.pageSize}
                  total={employeesPage.total}
                  totalPages={employeesPage.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Employee Calculation Drill-down Drawer */}
      {drilldown ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Employee Calculation Breakdown"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end"
        >
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full p-6 overflow-y-auto border-l border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {drilldown.employeeName} ({drilldown.employeeCode})
                </h3>
                <p className="text-xs text-slate-500">
                  Pay Days: {drilldown.payDays} · LOP: {drilldown.lopDays} · Prior Net:{' '}
                  {formatPayrollCurrency(drilldown.priorMonthNetPay)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDrilldown(null)}
                className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {drilldown.lines.map((line) => (
                <div key={line.componentCode} className="py-2.5 flex justify-between">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {line.componentName}
                    </span>
                    <span className="text-slate-500 ml-1.5">({line.category})</span>
                  </div>
                  <div className="font-mono tabular-nums font-bold">
                    {formatPayrollCurrency(line.amount)} (YTD: {formatPayrollCurrency(line.ytdAmount)})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Off-Cycle / Supplementary Run Modal */}
      {showOffCycleModal ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleCreateOffCycle}
            className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Launch Off-Cycle / Supplementary Run
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Run Name</label>
                <input
                  type="text"
                  required
                  value={offCycleForm.name}
                  onChange={(e) => setOffCycleForm({ ...offCycleForm, name: e.target.value })}
                  placeholder="e.g., Nov Bonus Supplementary Run"
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Run Type</label>
                  <select
                    value={offCycleForm.runType}
                    onChange={(e) =>
                      setOffCycleForm({
                        ...offCycleForm,
                        runType: e.target.value as 'Off-Cycle' | 'Supplementary',
                      })
                    }
                    className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Off-Cycle">Off-Cycle</option>
                    <option value="Supplementary">Supplementary</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Pay Date</label>
                  <input
                    type="date"
                    required
                    value={offCycleForm.payDate}
                    onChange={(e) => setOffCycleForm({ ...offCycleForm, payDate: e.target.value })}
                    className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1">Employee IDs (comma-separated)</label>
                <input
                  type="text"
                  value={offCycleForm.employeeIdsCsv}
                  onChange={(e) =>
                    setOffCycleForm({ ...offCycleForm, employeeIdsCsv: e.target.value })
                  }
                  placeholder="EMP-101, EMP-104"
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Reason</label>
                <input
                  type="text"
                  required
                  value={offCycleForm.reason}
                  onChange={(e) => setOffCycleForm({ ...offCycleForm, reason: e.target.value })}
                  placeholder="Reason for off-cycle payout"
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOffCycleModal(false)}
                className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-11 px-5 rounded-2xl bg-indigo-600 text-white text-xs font-semibold"
              >
                {isSubmitting ? 'Creating...' : 'Start Run'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <ConfirmDestructiveModal
        open={showRollbackModal}
        title="Rollback & Reopen Payroll Run"
        description="Rolling back a payroll run reopens input collection and invalidates draft payslips/bank advice files. This action is recorded in the immutable audit log."
        confirmLabel="Confirm Rollback"
        isSubmitting={isSubmitting}
        onCancel={() => setShowRollbackModal(false)}
        onConfirm={handleConfirmRollback}
      />

      <ConfirmDestructiveModal
        open={Boolean(holdTarget)}
        title={holdTarget?.currentStatus === 'On Hold' ? 'Release Salary Hold' : 'Hold Employee Salary'}
        description="Specify the mandatory reason for holding or releasing this employee's payout in the current payroll cycle."
        confirmLabel={holdTarget?.currentStatus === 'On Hold' ? 'Release Salary' : 'Place on Hold'}
        isSubmitting={isSubmitting}
        onCancel={() => setHoldTarget(null)}
        onConfirm={handleConfirmHoldToggle}
      />
    </div>
  );
}

// ============================================================================
// MODULE 3: SALARY STRUCTURE & COMPONENTS
// ============================================================================
export function SalaryStructureModule({ onToast }: { onToast: (msg: string) => void }) {
  const perms = usePayrollPermission();
  const [subTab, setSubTab] = useState<'components' | 'structures' | 'calculator'>('components');
  const [componentsPage, setComponentsPage] = useState<PaginatedResponse<SalaryComponentItem> | null>(null);
  const [structuresPage, setStructuresPage] = useState<PaginatedResponse<SalaryStructureTemplate> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);

  // Component Modal & Formula Validator
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [compForm, setCompForm] = useState<UpsertSalaryComponentPayload>({
    code: '',
    name: '',
    category: 'Fixed Earning',
    calculationType: 'Percentage of CTC',
    valueOrFormula: '50',
    taxability: 'Fully Taxable',
    prorateOnLop: true,
    considerForPf: true,
    considerForEsi: false,
    considerForPt: true,
    showInPayslip: true,
    isActive: true,
  });
  const [formulaResult, setFormulaResult] = useState<FormulaValidationResponse | null>(null);

  // CTC Calculator via API Preview
  const [ctcCalcInput, setCtcCalcInput] = useState({
    structureId: '',
    annualCtc: 1200000,
    taxRegime: 'New Regime' as 'New Regime' | 'Old Regime',
    stateCode: 'KA',
  });
  const [ctcPreview, setCtcPreview] = useState<CtcBreakupPreviewResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadStructuresData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const [comps, structs] = await Promise.all([
        salaryStructureService.getComponents({ page: 1, pageSize: 50 }, { signal }),
        salaryStructureService.getStructures({ page: 1, pageSize: 50 }, { signal }),
      ]);
      setComponentsPage(comps);
      setStructuresPage(structs);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError({
        message: err instanceof Error ? err.message : 'Failed to load salary structures',
        status: err instanceof PayrollApiError ? err.statusCode : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('salary-structures')) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadStructuresData(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadStructuresData, perms]);

  if (!perms.canAccessModule('salary-structures')) {
    return (
      <PayrollPermissionDenied
        moduleTitle="Salary Structure & Components"
        requiredPermission="payroll.structure.view"
        currentRole={perms.role}
      />
    );
  }

  const handleValidateFormula = async () => {
    try {
      const res = await salaryStructureService.validateFormula({
        expression: compForm.valueOrFormula,
        componentType: compForm.category,
      });
      setFormulaResult(res);
      onToast(res.isValid ? 'Formula syntax validated by backend' : 'Formula validation error');
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Formula validation call failed');
    }
  };

  const handleSaveComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await salaryStructureService.createComponent(compForm);
      setShowComponentModal(false);
      onToast(`Component ${compForm.code} saved`);
      loadStructuresData();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Could not save salary component');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePreviewCtc = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await salaryStructureService.previewCtcBreakup(ctcCalcInput);
      setCtcPreview(res);
      onToast('CTC breakup calculated by backend engine');
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'CTC preview calculation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Salary Structures, Components & CTC Calculator
          </h2>
          <p className="text-xs text-slate-500">
            Configure earnings, deductions, statutory applicability, formulas, and grade templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 flex gap-1 text-xs font-semibold">
            {(['components', 'structures', 'calculator'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSubTab(tab)}
                className={`h-9 px-3.5 rounded-xl capitalize transition ${
                  subTab === tab
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          {perms.canManageStructure ? (
            <button
              type="button"
              onClick={() => setShowComponentModal(true)}
              className="h-11 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Component</span>
            </button>
          ) : null}
        </div>
      </div>

      {subTab === 'calculator' ? (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white inline-flex items-center gap-2">
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span>API-Driven CTC Breakup Preview Calculator</span>
          </h3>
          <form onSubmit={handlePreviewCtc} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <input
              type="text"
              required
              value={ctcCalcInput.structureId}
              onChange={(e) => setCtcCalcInput({ ...ctcCalcInput, structureId: e.target.value })}
              placeholder="Structure ID (e.g. STR-G4)"
              className="h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              type="number"
              required
              min={100000}
              value={ctcCalcInput.annualCtc}
              onChange={(e) =>
                setCtcCalcInput({ ...ctcCalcInput, annualCtc: Number(e.target.value) })
              }
              placeholder="Annual CTC"
              className="h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
            />
            <select
              value={ctcCalcInput.taxRegime}
              onChange={(e) =>
                setCtcCalcInput({
                  ...ctcCalcInput,
                  taxRegime: e.target.value as 'New Regime' | 'Old Regime',
                })
              }
              className="h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="New Regime">New Tax Regime</option>
              <option value="Old Regime">Old Tax Regime</option>
            </select>
            <button
              type="submit"
              disabled={submitting}
              className="h-11 px-4 rounded-2xl bg-indigo-600 text-white font-semibold"
            >
              {submitting ? 'Requesting Preview...' : 'Compute Breakup via API'}
            </button>
          </form>

          {ctcPreview ? (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between font-mono font-bold">
                <span>Monthly Gross: {formatPayrollCurrency(ctcPreview.monthlyGross)}</span>
                <span className="text-emerald-600">
                  Net Take-Home: {formatPayrollCurrency(ctcPreview.monthlyNetTakeHome)}
                </span>
              </div>
              {ctcPreview.breakdown.map((b) => (
                <div key={b.componentCode} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                  <span>{b.componentName} ({b.category})</span>
                  <span className="font-mono">
                    {formatPayrollCurrency(b.monthlyAmount)}/mo · {formatPayrollCurrency(b.annualAmount)}/yr
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : loading ? (
        <PayrollLoadingSkeleton rows={4} />
      ) : error ? (
        <PayrollErrorState
          title="Salary Structure Service Unreachable"
          message={error.message}
          statusCode={error.status}
          onRetry={() => loadStructuresData()}
          primaryActionLabel={perms.canManageStructure ? 'Create Salary Component' : undefined}
          onPrimaryAction={perms.canManageStructure ? () => setShowComponentModal(true) : undefined}
        />
      ) : subTab === 'components' ? (
        !componentsPage || componentsPage.items.length === 0 ? (
          <PayrollEmptyState
            title="No Salary Components Configured"
            description="Create earnings, allowances, statutory deductions, and custom formula components."
            ctaLabel="Create Salary Component"
            onAction={() => setShowComponentModal(true)}
            canAction={perms.canManageStructure}
          />
        ) : (
          <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-3 px-2">Code & Name</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Basis / Formula</th>
                  <th className="py-3 px-2">Taxability</th>
                  <th className="py-3 px-2">Statutory Flags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {componentsPage.items.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 px-2">
                      <span className="font-mono font-bold text-indigo-600">{c.code}</span> ·{' '}
                      <span className="font-semibold text-slate-900 dark:text-white">{c.name}</span>
                    </td>
                    <td className="py-3 px-2">{c.category}</td>
                    <td className="py-3 px-2 font-mono">{c.calculationType}: {c.valueOrFormula}</td>
                    <td className="py-3 px-2">{c.taxability}</td>
                    <td className="py-3 px-2 font-mono text-[11px]">
                      {[
                        c.considerForPf ? 'PF' : null,
                        c.considerForEsi ? 'ESI' : null,
                        c.considerForPt ? 'PT' : null,
                        c.prorateOnLop ? 'LOP-Prorated' : null,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : !structuresPage || structuresPage.items.length === 0 ? (
        <PayrollEmptyState
          title="No Salary Structure Templates"
          description="Define grade-wise or band-wise salary structures mapped to your salary components."
          ctaLabel="Open CTC Calculator"
          onAction={() => setSubTab('calculator')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {structuresPage.items.map((st) => (
            <div
              key={st.id}
              className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2"
            >
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {st.name} ({st.code})
                </h4>
                <span className="text-xs font-mono text-indigo-600">
                  {st.assignedEmployeeCount} employees
                </span>
              </div>
              <p className="text-xs text-slate-500">{st.description}</p>
              <div className="text-xs font-mono text-slate-600 dark:text-slate-300">
                Band: {st.gradeOrBand} · {formatPayrollCurrency(st.minAnnualCtc)} –{' '}
                {formatPayrollCurrency(st.maxAnnualCtc)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Component + Formula Builder Modal */}
      {showComponentModal ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleSaveComponent}
            className="w-full max-w-lg rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Create Salary Component & Formula Builder
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Component Code</label>
                <input
                  type="text"
                  required
                  value={compForm.code}
                  onChange={(e) =>
                    setCompForm({ ...compForm, code: e.target.value.toUpperCase() })
                  }
                  placeholder="BASIC / HRA / SPL_ALW"
                  className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Component Name</label>
                <input
                  type="text"
                  required
                  value={compForm.name}
                  onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                  placeholder="Basic Salary"
                  className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={compForm.category}
                  onChange={(e) =>
                    setCompForm({
                      ...compForm,
                      category: e.target.value as UpsertSalaryComponentPayload['category'],
                    })
                  }
                  className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Fixed Earning">Fixed Earning</option>
                  <option value="Variable Earning">Variable Earning</option>
                  <option value="Allowance">Allowance</option>
                  <option value="Reimbursement">Reimbursement</option>
                  <option value="Pre-Tax Deduction">Pre-Tax Deduction</option>
                  <option value="Post-Tax Deduction">Post-Tax Deduction</option>
                  <option value="Employer Contribution">Employer Contribution</option>
                  <option value="Statutory">Statutory</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Calculation Basis</label>
                <select
                  value={compForm.calculationType}
                  onChange={(e) =>
                    setCompForm({
                      ...compForm,
                      calculationType: e.target.value as UpsertSalaryComponentPayload['calculationType'],
                    })
                  }
                  className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Percentage of CTC">Percentage of CTC</option>
                  <option value="Percentage of Basic">Percentage of Basic</option>
                  <option value="Percentage of Gross">Percentage of Gross</option>
                  <option value="Flat Amount">Flat Amount</option>
                  <option value="Custom Formula">Custom Formula</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-1">
                Value or Formula Expression (Tokens: BASIC, GROSS, CTC, PAY_DAYS)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={compForm.valueOrFormula}
                  onChange={(e) => setCompForm({ ...compForm, valueOrFormula: e.target.value })}
                  placeholder="e.g. BASIC * 0.40"
                  className="flex-1 h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
                <button
                  type="button"
                  onClick={handleValidateFormula}
                  className="h-11 px-3.5 rounded-2xl bg-slate-900 text-white font-semibold"
                >
                  Validate Formula via API
                </button>
              </div>
              {formulaResult ? (
                <p
                  className={`mt-1 font-mono text-[11px] ${
                    formulaResult.isValid ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {formulaResult.isValid
                    ? `Valid formula · Referenced: ${formulaResult.referencedComponents.join(', ')}`
                    : formulaResult.errorMessage}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-4 pt-1">
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={compForm.prorateOnLop}
                  onChange={(e) => setCompForm({ ...compForm, prorateOnLop: e.target.checked })}
                />
                <span>Prorate on LOP</span>
              </label>
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={compForm.considerForPf}
                  onChange={(e) => setCompForm({ ...compForm, considerForPf: e.target.checked })}
                />
                <span>PF Wage</span>
              </label>
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={compForm.considerForEsi}
                  onChange={(e) => setCompForm({ ...compForm, considerForEsi: e.target.checked })}
                />
                <span>ESI Wage</span>
              </label>
              <label className="inline-flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={compForm.considerForPt}
                  onChange={(e) => setCompForm({ ...compForm, considerForPt: e.target.checked })}
                />
                <span>PT Wage</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowComponentModal(false)}
                className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-11 px-5 rounded-2xl bg-indigo-600 text-white font-semibold"
              >
                {submitting ? 'Saving...' : 'Save Component'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================================
// MODULE 4: EMPLOYEE COMPENSATION
// ============================================================================
export function EmployeeCompensationModule({ onToast }: { onToast: (msg: string) => void }) {
  const perms = usePayrollPermission();
  const [pageData, setPageData] = useState<PaginatedResponse<EmployeeCompensationRecord> | null>(null);
  const [historyItems, setHistoryItems] = useState<SalaryRevisionHistoryItem[] | null>(null);
  const [uploadPreview, setUploadPreview] = useState<BulkUploadValidationPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignForm, setAssignForm] = useState({
    employeeId: '',
    structureId: '',
    annualCtc: 1500000,
    effectiveFrom: '',
    reason: 'Annual Appraisal Revision',
    computeRetroArrears: true,
    paymentMode: 'NEFT' as 'NEFT' | 'RTGS' | 'IMPS' | 'Cheque',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadCompensations = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const res = await compensationService.getCompensations(
          { page, pageSize: 20, search },
          { signal }
        );
        setPageData(res);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError({
          message: err instanceof Error ? err.message : 'Failed to load employee compensation records',
          status: err instanceof PayrollApiError ? err.statusCode : undefined,
        });
      } finally {
        setLoading(false);
      }
    },
    [page, search]
  );

  useEffect(() => {
    if (!perms.canAccessModule('compensation')) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadCompensations(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadCompensations, perms]);

  if (!perms.canAccessModule('compensation')) {
    return (
      <PayrollPermissionDenied
        moduleTitle="Employee Compensation"
        requiredPermission="payroll.compensation.view"
        currentRole={perms.role}
      />
    );
  }

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await compensationService.assignOrReviseCompensation(assignForm);
      setShowAssignModal(false);
      onToast('Compensation revision submitted to backend');
      loadCompensations();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Compensation revision failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const preview = await compensationService.validateBulkUpload(file);
      setUploadPreview(preview);
      onToast(`Validated ${preview.totalRows} rows from ${file.name}`);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Bulk CSV/XLSX validation failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Employee Compensation & Sensitive Identifiers
          </h2>
          <p className="text-xs text-slate-500">
            Assign/revise salary structures, inspect revision history, and manage masked PAN/UAN/ESI/Bank fields
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search employee..."
            className="h-11 px-3.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          {perms.canManageCompensation ? (
            <>
              <label className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Bulk Upload CSV/XLSX</span>
                <input
                  type="file"
                  accept=".csv,.xlsx"
                  onChange={handleBulkFileChange}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => setShowAssignModal(true)}
                className="h-11 px-4 rounded-2xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assign / Revise CTC</span>
              </button>
            </>
          ) : null}
        </div>
      </div>

      {uploadPreview ? (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900 space-y-2 text-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold">
              Upload Validation Preview: {uploadPreview.fileName} ({uploadPreview.validRowsCount} valid /{' '}
              {uploadPreview.invalidRowsCount} invalid)
            </span>
            <button
              type="button"
              onClick={async () => {
                try {
                  await compensationService.commitBulkUpload(uploadPreview.batchId);
                  setUploadPreview(null);
                  onToast('Bulk compensation batch committed');
                  loadCompensations();
                } catch (err) {
                  onToast(err instanceof Error ? err.message : 'Bulk commit failed');
                }
              }}
              className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white font-semibold"
            >
              Commit Valid Rows
            </button>
          </div>
        </div>
      ) : null}

      {loading ? (
        <PayrollLoadingSkeleton rows={5} />
      ) : error ? (
        <PayrollErrorState
          title="Employee Compensation Service Error"
          message={error.message}
          statusCode={error.status}
          onRetry={() => loadCompensations()}
          primaryActionLabel={perms.canManageCompensation ? 'Assign / Revise CTC' : undefined}
          onPrimaryAction={perms.canManageCompensation ? () => setShowAssignModal(true) : undefined}
        />
      ) : !pageData || pageData.items.length === 0 ? (
        <PayrollEmptyState
          title="No Employee Compensation Records Found"
          description="Assign salary structures to employees or bulk import compensation revisions via CSV/XLSX."
          ctaLabel="Assign / Revise CTC"
          onAction={() => setShowAssignModal(true)}
          canAction={perms.canManageCompensation}
        />
      ) : (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-3 px-2">Employee</th>
                <th className="py-3 px-2">Structure & Effective</th>
                <th className="py-3 px-2 text-right">Annual CTC</th>
                <th className="py-3 px-2">PAN (Masked)</th>
                <th className="py-3 px-2">UAN (Masked)</th>
                <th className="py-3 px-2">Bank A/C (Masked)</th>
                <th className="py-3 px-2 text-right">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {pageData.items.map((row) => (
                <tr key={row.employeeId}>
                  <td className="py-3 px-2">
                    <div className="font-bold text-slate-900 dark:text-white">{row.employeeName}</div>
                    <div className="text-slate-500 font-mono">{row.employeeCode} · {row.department}</div>
                  </td>
                  <td className="py-3 px-2">
                    <div>{row.structureName}</div>
                    <div className="text-slate-500">From {formatPayrollDate(row.effectiveFrom)}</div>
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-bold">
                    {formatPayrollCurrency(row.annualCtc)}
                  </td>
                  <td className="py-3 px-2">
                    <SensitiveFieldCell
                      employeeId={row.employeeId}
                      field="pan"
                      maskedValue={row.panMasked}
                      canReveal={perms.canRevealSensitive}
                      onRevealedToast={onToast}
                    />
                  </td>
                  <td className="py-3 px-2">
                    <SensitiveFieldCell
                      employeeId={row.employeeId}
                      field="uan"
                      maskedValue={row.uanMasked}
                      canReveal={perms.canRevealSensitive}
                      onRevealedToast={onToast}
                    />
                  </td>
                  <td className="py-3 px-2">
                    <SensitiveFieldCell
                      employeeId={row.employeeId}
                      field="bankAccount"
                      maskedValue={row.bankAccountMasked}
                      canReveal={perms.canRevealSensitive}
                      onRevealedToast={onToast}
                    />
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const hist = await compensationService.getRevisionHistory(row.employeeId);
                          setHistoryItems(hist);
                        } catch (err) {
                          onToast(err instanceof Error ? err.message : 'Failed to load revision history');
                        }
                      }}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      Timeline
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <PayrollPaginationBar
            page={pageData.page}
            pageSize={pageData.pageSize}
            total={pageData.total}
            totalPages={pageData.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      {historyItems ? (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-sm">Salary Revision Timeline</h4>
            <button
              type="button"
              onClick={() => setHistoryItems(null)}
              className="text-slate-500 hover:underline"
            >
              Close
            </button>
          </div>
          {historyItems.map((h) => (
            <div key={h.revisionId} className="py-2 border-b border-slate-100 dark:border-slate-800 flex justify-between">
              <div>
                <span className="font-bold">{formatPayrollDate(h.effectiveFrom)}</span> · {h.reason}
              </div>
              <div className="font-mono">
                {formatPayrollCurrency(h.previousCtc)} → {formatPayrollCurrency(h.revisedCtc)} (+{h.hikePercentage}%)
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {showAssignModal ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleAssignSubmit}
            className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Assign or Revise Employee Compensation
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                required
                value={assignForm.employeeId}
                onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
                placeholder="Employee ID (e.g. EMP-101)"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                required
                value={assignForm.structureId}
                onChange={(e) => setAssignForm({ ...assignForm, structureId: e.target.value })}
                placeholder="Salary Structure ID"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <input
                type="number"
                required
                value={assignForm.annualCtc}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, annualCtc: Number(e.target.value) })
                }
                placeholder="Revised Annual CTC"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
              <input
                type="date"
                required
                value={assignForm.effectiveFrom}
                onChange={(e) => setAssignForm({ ...assignForm, effectiveFrom: e.target.value })}
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={assignForm.computeRetroArrears}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, computeRetroArrears: e.target.checked })
                  }
                />
                <span>Auto-trigger Retroactive Arrears if backdated</span>
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAssignModal(false)}
                className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-11 px-5 rounded-2xl bg-indigo-600 text-white font-semibold"
              >
                {submitting ? 'Submitting...' : 'Save Revision'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================================
// MODULE 5: ATTENDANCE, LEAVE & LOP INTEGRATION
// ============================================================================
export function AttendanceLopModule({ onToast }: { onToast: (msg: string) => void }) {
  const perms = usePayrollPermission();
  const [records, setRecords] = useState<PaginatedResponse<AttendanceLopRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const page = 1;
  const cycleId = 'CURRENT';

  const [overrideTarget, setOverrideTarget] = useState<string | null>(null);
  const [overrideForm, setOverrideForm] = useState({
    overriddenLopDays: 0,
    lopReversalDays: 0,
    reason: '',
  });
  const [lockModalState, setLockModalState] = useState<{ lock: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadAttendance = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const res = await attendanceLopService.getRecords(
          { page, pageSize: 20, cycleId },
          { signal }
        );
        setRecords(res);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError({
          message: err instanceof Error ? err.message : 'Failed to load cycle attendance & LOP feed',
          status: err instanceof PayrollApiError ? err.statusCode : undefined,
        });
      } finally {
        setLoading(false);
      }
    },
    [page, cycleId]
  );

  useEffect(() => {
    if (!perms.canAccessModule('attendance-lop')) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadAttendance(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadAttendance, perms]);

  if (!perms.canAccessModule('attendance-lop')) {
    return (
      <PayrollPermissionDenied
        moduleTitle="Attendance, Leave & LOP Integration"
        requiredPermission="payroll.attendance.view"
        currentRole={perms.role}
      />
    );
  }

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideTarget) return;
    setSubmitting(true);
    try {
      await attendanceLopService.overrideLop(overrideTarget, {
        cycleId,
        ...overrideForm,
      });
      setOverrideTarget(null);
      onToast('LOP override saved with audit reason');
      loadAttendance();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'LOP override failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Attendance, Leave & LOP Integration
          </h2>
          <p className="text-xs text-slate-500">
            Synchronized working days, paid leaves, LOP days, reversals, overtime hours, and cycle attendance lock
          </p>
        </div>
        <div className="flex items-center gap-2">
          {perms.canOverrideLop ? (
            <button
              type="button"
              onClick={() => setOverrideTarget('EMP-SELECT')}
              className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>LOP Override / Reversal</span>
            </button>
          ) : null}
          {perms.canLockAttendance ? (
            <>
              <button
                type="button"
                onClick={() => setLockModalState({ lock: true })}
                className="h-11 px-4 rounded-2xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Attendance</span>
              </button>
              <button
                type="button"
                onClick={() => setLockModalState({ lock: false })}
                className="h-11 px-3.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlock</span>
              </button>
            </>
          ) : null}
        </div>
      </div>

      {loading ? (
        <PayrollLoadingSkeleton rows={4} />
      ) : error ? (
        <PayrollErrorState
          title="Attendance & LOP Integration API Error"
          message={error.message}
          statusCode={error.status}
          onRetry={() => loadAttendance()}
          primaryActionLabel={perms.canOverrideLop ? 'Log LOP Override' : undefined}
          onPrimaryAction={perms.canOverrideLop ? () => setOverrideTarget('EMP-SELECT') : undefined}
        />
      ) : !records || records.items.length === 0 ? (
        <PayrollEmptyState
          title="No Attendance Summary Synced for Cycle"
          description="Lock attendance for the current pay cycle to freeze payable days, LOP deductions, and overtime hours."
          ctaLabel="Lock Cycle Attendance"
          onAction={() => setLockModalState({ lock: true })}
          canAction={perms.canLockAttendance}
        />
      ) : (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-3 px-2">Employee</th>
                <th className="py-3 px-2 text-right">Working / Present</th>
                <th className="py-3 px-2 text-right">Paid Leave</th>
                <th className="py-3 px-2 text-right">System LOP</th>
                <th className="py-3 px-2 text-right">Final Payable</th>
                <th className="py-3 px-2 text-right">OT Hours</th>
                <th className="py-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {records.items.map((r) => (
                <tr key={r.employeeId}>
                  <td className="py-3 px-2">
                    <div className="font-bold text-slate-900 dark:text-white">{r.employeeName}</div>
                    <div className="text-slate-500 font-mono">{r.employeeCode}</div>
                  </td>
                  <td className="py-3 px-2 text-right font-mono">{r.workingDays} / {r.presentDays}</td>
                  <td className="py-3 px-2 text-right font-mono">{r.paidLeaveDays}</td>
                  <td className="py-3 px-2 text-right font-mono text-rose-600">{r.systemLopDays}</td>
                  <td className="py-3 px-2 text-right font-mono font-bold">{r.finalPayableDays}</td>
                  <td className="py-3 px-2 text-right font-mono">{r.overtimeHours}h</td>
                  <td className="py-3 px-2 text-right">
                    {perms.canOverrideLop ? (
                      <button
                        type="button"
                        onClick={() => setOverrideTarget(r.employeeId)}
                        className="text-indigo-600 font-semibold hover:underline"
                      >
                        Override LOP
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {overrideTarget ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleOverrideSubmit}
            className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold">Override LOP / LOP Reversal ({overrideTarget})</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">Overridden LOP Days</label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  value={overrideForm.overriddenLopDays}
                  onChange={(e) =>
                    setOverrideForm({ ...overrideForm, overriddenLopDays: Number(e.target.value) })
                  }
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Prior Month LOP Reversal Days</label>
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  value={overrideForm.lopReversalDays}
                  onChange={(e) =>
                    setOverrideForm({ ...overrideForm, lopReversalDays: Number(e.target.value) })
                  }
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Mandatory Approval Reason</label>
                <input
                  type="text"
                  required
                  value={overrideForm.reason}
                  onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })}
                  placeholder="Regularization approved by department head"
                  className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOverrideTarget(null)}
                className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-11 px-5 rounded-2xl bg-indigo-600 text-white font-semibold"
              >
                Save Override
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <ConfirmDestructiveModal
        open={Boolean(lockModalState)}
        title={lockModalState?.lock ? 'Lock Cycle Attendance' : 'Unlock Cycle Attendance'}
        description="Locking or unlocking cycle attendance controls whether leave and punch modifications affect the current payroll run."
        confirmLabel={lockModalState?.lock ? 'Lock Attendance' : 'Unlock Attendance'}
        isSubmitting={submitting}
        onCancel={() => setLockModalState(null)}
        onConfirm={async (reason) => {
          setSubmitting(true);
          try {
            await attendanceLopService.setAttendanceLock({
              cycleId,
              locked: Boolean(lockModalState?.lock),
              reason,
            });
            setLockModalState(null);
            onToast('Attendance lock status updated');
            loadAttendance();
          } catch (err) {
            onToast(err instanceof Error ? err.message : 'Attendance lock update failed');
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </div>
  );
}

// ============================================================================
// MODULE 6: VARIABLE INPUTS (EARNINGS, DEDUCTIONS, REIMBURSEMENTS, OVERTIME)
// ============================================================================
export function VariableInputsModule({ onToast }: { onToast: (msg: string) => void }) {
  const perms = usePayrollPermission();
  const [subTab, setSubTab] = useState<'variables' | 'reimbursements' | 'bulk-grid'>('variables');
  const [varPage, setVarPage] = useState<PaginatedResponse<VariableInputRecord> | null>(null);
  const [reimbPage, setReimbPage] = useState<PaginatedResponse<ReimbursementClaimRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);

  const [showAddVarModal, setShowAddVarModal] = useState(false);
  const [varForm, setVarForm] = useState<CreateVariableInputPayload>({
    cycleId: 'CURRENT',
    employeeId: '',
    category: 'Bonus',
    componentCode: 'PERF_BONUS',
    amount: 0,
    remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadVariables = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const [vars, reimbs] = await Promise.all([
        variableInputsService.getVariableInputs({ page: 1, pageSize: 25 }, { signal }),
        variableInputsService.getReimbursements({ page: 1, pageSize: 25 }, { signal }),
      ]);
      setVarPage(vars);
      setReimbPage(reimbs);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError({
        message: err instanceof Error ? err.message : 'Failed to load variable pay inputs & claims',
        status: err instanceof PayrollApiError ? err.statusCode : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('variable-inputs')) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadVariables(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadVariables, perms]);

  if (!perms.canAccessModule('variable-inputs')) {
    return (
      <PayrollPermissionDenied
        moduleTitle="Variable Inputs & Reimbursements"
        requiredPermission="payroll.variables.view"
        currentRole={perms.role}
      />
    );
  }

  const handleSaveVariable = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await variableInputsService.createVariableInput(varForm);
      setShowAddVarModal(false);
      onToast('Variable pay entry submitted');
      loadVariables();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Variable input submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Variable Inputs: Bonuses, Incentives, Overtime & Reimbursements
          </h2>
          <p className="text-xs text-slate-500">
            Single entry, bulk grid entry, CSV/XLSX validation upload, and reimbursement claim verification
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 flex gap-1 text-xs font-semibold">
            {(['variables', 'reimbursements', 'bulk-grid'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setSubTab(t)}
                className={`h-9 px-3 rounded-xl capitalize ${
                  subTab === t ? 'bg-white dark:bg-slate-900 text-indigo-600' : 'text-slate-500'
                }`}
              >
                {t.replace('-', ' ')}
              </button>
            ))}
          </div>
          {perms.canManageVariables ? (
            <button
              type="button"
              onClick={() => setShowAddVarModal(true)}
              className="h-11 px-4 rounded-2xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variable Input</span>
            </button>
          ) : null}
        </div>
      </div>

      {subTab === 'bulk-grid' ? (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4 text-xs">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold inline-flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <span>Bulk Grid Entry & CSV/XLSX Upload</span>
            </h3>
            <label className="h-10 px-4 rounded-2xl bg-slate-900 text-white font-semibold inline-flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Variable Pay CSV/XLSX</span>
              <input
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    const res = await variableInputsService.validateVariableUpload(file, 'CURRENT');
                    onToast(`Validated ${res.validRowsCount} variable input rows`);
                  } catch (err) {
                    onToast(err instanceof Error ? err.message : 'Upload validation failed');
                  }
                }}
              />
            </label>
          </div>
          <p className="text-slate-500">
            Use the single entry modal or upload a multi-employee variable sheet to batch-submit bonuses, incentives, and one-time deductions.
          </p>
        </div>
      ) : loading ? (
        <PayrollLoadingSkeleton rows={4} />
      ) : error ? (
        <PayrollErrorState
          title="Variable Inputs API Error"
          message={error.message}
          statusCode={error.status}
          onRetry={() => loadVariables()}
          primaryActionLabel={perms.canManageVariables ? 'Add Variable Input' : undefined}
          onPrimaryAction={perms.canManageVariables ? () => setShowAddVarModal(true) : undefined}
        />
      ) : subTab === 'variables' ? (
        !varPage || varPage.items.length === 0 ? (
          <PayrollEmptyState
            title="No Variable Inputs Recorded for Cycle"
            description="Add one-time bonuses, sales incentives, shift allowances, or ad-hoc deductions."
            ctaLabel="Add Variable Input"
            onAction={() => setShowAddVarModal(true)}
            canAction={perms.canManageVariables}
          />
        ) : (
          <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-3 px-2">Employee</th>
                  <th className="py-3 px-2">Category & Component</th>
                  <th className="py-3 px-2 text-right">Amount</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {varPage.items.map((v) => (
                  <tr key={v.id}>
                    <td className="py-3 px-2 font-bold">{v.employeeName} ({v.employeeCode})</td>
                    <td className="py-3 px-2">{v.category} · {v.componentName}</td>
                    <td className="py-3 px-2 text-right font-mono font-bold">
                      {formatPayrollCurrency(v.amount)}
                    </td>
                    <td className="py-3 px-2">{v.approvalStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : !reimbPage || reimbPage.items.length === 0 ? (
        <PayrollEmptyState
          title="No Pending Reimbursement Claims"
          description="Employee reimbursement claims for medical, fuel, LTA, and telecom will appear here for payroll inclusion."
        />
      ) : (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-3 px-2">Claim # & Employee</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2 text-right">Claimed</th>
                <th className="py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {reimbPage.items.map((cl) => (
                <tr key={cl.id}>
                  <td className="py-3 px-2 font-bold">{cl.claimNumber} · {cl.employeeName}</td>
                  <td className="py-3 px-2">{cl.category}</td>
                  <td className="py-3 px-2 text-right font-mono">{formatPayrollCurrency(cl.claimedAmount)}</td>
                  <td className="py-3 px-2">{cl.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddVarModal ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleSaveVariable}
            className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Variable Pay / Deduction Entry
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                required
                value={varForm.employeeId}
                onChange={(e) => setVarForm({ ...varForm, employeeId: e.target.value })}
                placeholder="Employee ID"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <select
                value={varForm.category}
                onChange={(e) =>
                  setVarForm({
                    ...varForm,
                    category: e.target.value as CreateVariableInputPayload['category'],
                  })
                }
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="Bonus">Bonus</option>
                <option value="Incentive">Incentive</option>
                <option value="Overtime">Overtime</option>
                <option value="One-Time Earning">One-Time Earning</option>
                <option value="One-Time Deduction">One-Time Deduction</option>
                <option value="Penalty">Penalty</option>
              </select>
              <input
                type="number"
                required
                value={varForm.amount}
                onChange={(e) => setVarForm({ ...varForm, amount: Number(e.target.value) })}
                placeholder="Amount"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
              <input
                type="text"
                required
                value={varForm.remarks}
                onChange={(e) => setVarForm({ ...varForm, remarks: e.target.value })}
                placeholder="Remarks / Reference"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddVarModal(false)}
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
