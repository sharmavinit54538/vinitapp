'use client';

import React, { useState } from 'react';
import {
  PayrollAnomalyItem,
  ComplianceAlertItem,
  AiPayrollInsightItem,
  PayrollActivityRecord,
  formatCurrencyUSD,
} from '@/lib/payroll-analytics-types';
import {
  AlertTriangle,
  ShieldCheck,
  Cpu,
  Search,
  ArrowUpDown,
  Download,
  Eye,
  FileText,
  Layers,
  CheckCircle2,
  X,
} from 'lucide-react';

interface AlertsAndIntelligenceSectionProps {
  anomalies: PayrollAnomalyItem[];
  complianceAlerts: ComplianceAlertItem[];
  aiInsights: AiPayrollInsightItem[];
  canManage: boolean;
  onUpdateAnomalyStatus: (id: string, status: 'Open' | 'Investigating' | 'Resolved') => void;
  onFileCompliance: (id: string) => void;
  onTriggerToast: (msg: string) => void;
}

export function AlertsAndIntelligenceSection({
  anomalies,
  complianceAlerts,
  aiInsights,
  canManage,
  onUpdateAnomalyStatus,
  onFileCompliance,
  onTriggerToast,
}: AlertsAndIntelligenceSectionProps) {
  const [anomalyFilter, setAnomalyFilter] = useState<'all' | 'Open' | 'Resolved'>('all');

  const visibleAnomalies = anomalies.filter(
    (a) => anomalyFilter === 'all' || a.status === anomalyFilter
  );

  return (
    <section
      aria-label="Payroll Alerts, Statutory Compliance and AI Financial Intelligence"
      className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch"
    >
      {/* PANEL A: PAYROLL ANOMALIES */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Payroll Anomalies
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Salary spikes, duplicate entries, bank &amp; tax discrepancies
              </p>
            </div>

            <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
              {(['all', 'Open', 'Resolved'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setAnomalyFilter(tab)}
                  className={`px-2 py-0.5 rounded-md capitalize cursor-pointer ${
                    anomalyFilter === tab
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {visibleAnomalies.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No payroll anomalies matching filter `{anomalyFilter}`.
              </div>
            ) : (
              visibleAnomalies.map((anm) => (
                <div
                  key={anm.id}
                  className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                      {anm.category} · {anm.severity}
                    </span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                      {formatCurrencyUSD(anm.financialImpact)}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {anm.employeeName}{' '}
                    <span className="font-mono font-normal text-slate-500">
                      ({anm.employeeId} · {anm.department})
                    </span>
                  </p>

                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                    {anm.description}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                    <span className="font-mono text-slate-500">
                      Status: <strong className="text-slate-800 dark:text-slate-200">{anm.status}</strong>
                    </span>

                    {canManage && anm.status !== 'Resolved' && (
                      <div className="flex items-center gap-1.5">
                        {anm.status === 'Open' && (
                          <button
                            type="button"
                            onClick={() => onUpdateAnomalyStatus(anm.id, 'Investigating')}
                            className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer hover:bg-slate-100"
                          >
                            Investigate
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onUpdateAnomalyStatus(anm.id, 'Resolved')}
                          data-testid={`resolve-anomaly-${anm.id}`}
                          className="px-2.5 py-1 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Automated Pre-Disbursement Audit</span>
          <span>{anomalies.filter((a) => a.status === 'Resolved').length}/{anomalies.length} Resolved</span>
        </div>
      </div>

      {/* PANEL B: COMPLIANCE ALERTS */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Compliance Alerts
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                PF, ESI, TDS, Professional Tax &amp; statutory deadlines
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              100% Tracked
            </span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {complianceAlerts.map((cmp) => {
              const isFiled = cmp.status === 'Paid & Filed';
              return (
                <div
                  key={cmp.id}
                  className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] font-mono tabular-nums">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {cmp.statutoryBody} · Due {cmp.dueDate}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrencyUSD(cmp.amountDue)}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {cmp.obligationTitle}
                  </p>

                  <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between">
                    <span>Ref: {cmp.challanRef}</span>
                    <span>{cmp.coveredEmployees} employees</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 text-[11px]">
                    <span
                      className={`font-semibold ${
                        isFiled
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {cmp.status}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          onTriggerToast(
                            `Downloaded official statutory challan ${cmp.challanRef} (${cmp.statutoryBody}).`
                          )
                        }
                        className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer hover:bg-slate-100"
                      >
                        Challan
                      </button>
                      {canManage && !isFiled && (
                        <button
                          type="button"
                          onClick={() => onFileCompliance(cmp.id)}
                          data-testid={`file-compliance-${cmp.id}`}
                          className="px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer"
                        >
                          Mark Filed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>Statutory Filing Ledger</span>
          <span>
            {complianceAlerts.filter((c) => c.status === 'Paid & Filed').length}/
            {complianceAlerts.length} Filed
          </span>
        </div>
      </div>

      {/* PANEL C: AI PAYROLL INTELLIGENCE */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  AI Payroll Intelligence
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Predictive spend modeling, variance diagnostics &amp; optimization
              </p>
            </div>
            <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold">
              Live Data Grounded
            </span>
          </div>

          <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
            {aiInsights.map((ins) => (
              <div
                key={ins.id}
                className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {ins.category}
                  </span>
                  <span className="text-slate-500">{ins.confidenceScore}% confidence</span>
                </div>

                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {ins.title}
                </p>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  {ins.finding}
                </p>

                <div className="pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2 text-[11px]">
                  <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                    {ins.quantifiedImpact}
                  </span>
                  <button
                    type="button"
                    onClick={() => onTriggerToast(`Applied AI action: ${ins.recommendedAction}`)}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer shrink-0"
                  >
                    Apply Action &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>OFC360 Financial Engine</span>
          <span>{aiInsights.length} Verified Insights</span>
        </div>
      </div>
    </section>
  );
}

interface RecentPayrollActivitySectionProps {
  records: PayrollActivityRecord[];
  onExportCsv: (filename: string, rows: Record<string, string | number>[]) => void;
  onTriggerToast: (msg: string) => void;
}

export function RecentPayrollActivitySection({
  records,
  onExportCsv,
  onTriggerToast,
}: RecentPayrollActivitySectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<
    'payrollId' | 'employeesProcessed' | 'grossPayroll' | 'netPayroll' | 'processedDate'
  >('processedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBatch, setSelectedBatch] = useState<{
    record: PayrollActivityRecord;
    mode: 'details' | 'breakdown';
  } | null>(null);

  const pageSize = 5;

  const filteredRecords = records
    .filter((rec) => {
      const matchesStatus = statusFilter === 'ALL' || rec.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        rec.payrollId.toLowerCase().includes(q) ||
        rec.department.toLowerCase().includes(q) ||
        rec.payrollMonth.toLowerCase().includes(q) ||
        rec.location.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    })
    .sort((a, b) => {
      const mul = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'payrollId' || sortBy === 'processedDate') {
        return a[sortBy].localeCompare(b[sortBy]) * mul;
      }
      return (a[sortBy] - b[sortBy]) * mul;
    });

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedRecords = filteredRecords.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const handleSort = (
    col: 'payrollId' | 'employeesProcessed' | 'grossPayroll' | 'netPayroll' | 'processedDate'
  ) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  return (
    <section
      aria-label="Recent Payroll Activity"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recent Payroll Activity &amp; Batch Register
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Departmental disbursement runs, gross-to-net audit logs, and downloadable batch statements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search ID, department, month..."
              aria-label="Search recent payroll activity"
              data-testid="payroll-activity-search"
              className="h-8 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white w-52"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter payroll activity by status"
            data-testid="payroll-activity-status-filter"
            className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="Disbursed">Disbursed</option>
            <option value="Completed">Completed</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Validation Warning">Validation Warning</option>
          </select>

          <button
            type="button"
            onClick={() =>
              onExportCsv(
                'ofc360-recent-payroll-activity.csv',
                filteredRecords.map((r) => ({
                  PayrollID: r.payrollId,
                  PayrollMonth: r.payrollMonth,
                  Department: r.department,
                  EmployeesProcessed: r.employeesProcessed,
                  GrossPayrollUSD: r.grossPayroll,
                  NetPayrollUSD: r.netPayroll,
                  Status: r.status,
                  ProcessedDate: r.processedDate,
                }))
              )
            }
            data-testid="export-activity-csv-btn"
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export Register
          </button>
        </div>
      </div>

      {/* Responsive Activity Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <th className="py-2.5 pr-3">
                <button
                  type="button"
                  onClick={() => handleSort('payrollId')}
                  className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  Payroll ID
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-2">Payroll Month</th>
              <th className="py-2.5 px-2">Department</th>
              <th className="py-2.5 px-2 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('employeesProcessed')}
                  className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  Employees Processed
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-2 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('grossPayroll')}
                  className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  Gross Payroll
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-2 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('netPayroll')}
                  className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  Net Payroll
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 px-2">Status</th>
              <th className="py-2.5 px-2">
                <button
                  type="button"
                  onClick={() => handleSort('processedDate')}
                  className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                >
                  Processed Date
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="py-2.5 pl-2 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs font-mono tabular-nums">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center font-sans text-slate-500">
                  No payroll activity batches match your search criteria.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((rec) => (
                <tr
                  key={rec.payrollId}
                  className="hover:bg-slate-50/90 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 pr-3 font-bold text-indigo-600 dark:text-indigo-400">
                    {rec.payrollId}
                  </td>
                  <td className="py-3 px-2 font-sans text-slate-700 dark:text-slate-300">
                    {rec.payrollMonth}
                  </td>
                  <td className="py-3 px-2 font-sans font-semibold text-slate-900 dark:text-white">
                    {rec.department}
                  </td>
                  <td className="py-3 px-2 text-right text-slate-700 dark:text-slate-300">
                    {rec.employeesProcessed}
                  </td>
                  <td className="py-3 px-2 text-right font-bold text-slate-900 dark:text-white">
                    {formatCurrencyUSD(rec.grossPayroll)}
                  </td>
                  <td className="py-3 px-2 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrencyUSD(rec.netPayroll)}
                  </td>
                  <td className="py-3 px-2 font-sans">
                    <span
                      className={`font-semibold ${
                        rec.status === 'Disbursed' || rec.status === 'Completed'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : rec.status === 'Validation Warning'
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-slate-500">{rec.processedDate}</td>
                  <td className="py-3 pl-2 text-right font-sans">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedBatch({ record: rec, mode: 'details' })}
                        data-testid={`view-details-${rec.payrollId}`}
                        className="px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Eye className="w-3 h-3" />
                        View Details
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedBatch({ record: rec, mode: 'breakdown' })}
                        data-testid={`view-breakdown-${rec.payrollId}`}
                        className="px-2 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/80 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <Layers className="w-3 h-3" />
                        Breakdown
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onExportCsv(`${rec.payrollId}-${rec.department}-register.csv`, [
                            {
                              PayrollID: rec.payrollId,
                              Month: rec.payrollMonth,
                              Department: rec.department,
                              Location: rec.location,
                              Employees: rec.employeesProcessed,
                              BasicSalary: rec.earningsBreakdown.basicSalary,
                              HRA: rec.earningsBreakdown.hra,
                              SpecialAllowance: rec.earningsBreakdown.specialAllowance,
                              PF: rec.deductionsBreakdown.pf,
                              TDS: rec.deductionsBreakdown.tds,
                              GrossPayroll: rec.grossPayroll,
                              NetPayroll: rec.netPayroll,
                            },
                          ]);
                          onTriggerToast(`Downloaded batch report for ${rec.payrollId} (${rec.department}).`);
                        }}
                        aria-label={`Download Report for ${rec.payrollId}`}
                        className="px-2 py-1 rounded-md bg-slate-900 dark:bg-indigo-600 text-white text-[11px] font-semibold hover:opacity-90 inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
                      >
                        <FileText className="w-3 h-3" />
                        Download Report
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
        <span className="font-mono">
          Showing {(safePage - 1) * pageSize + 1}–
          {Math.min(safePage * pageSize, filteredRecords.length)} of {filteredRecords.length}{' '}
          batches
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-slate-800 font-semibold disabled:opacity-40 cursor-pointer"
          >
            Previous
          </button>
          <span className="font-mono px-2">
            Page {safePage} of {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="h-7 px-2.5 rounded-md border border-slate-200 dark:border-slate-800 font-semibold disabled:opacity-40 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

      {/* Batch Detail / Breakdown Modal */}
      {selectedBatch && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Payroll Batch ${selectedBatch.record.payrollId}`}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {selectedBatch.record.payrollId} · {selectedBatch.record.payrollMonth}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {selectedBatch.mode === 'details'
                    ? `${selectedBatch.record.department} — Batch Execution Details`
                    : `${selectedBatch.record.department} — Earnings vs Deductions Breakdown`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBatch(null)}
                aria-label="Close modal"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono tabular-nums text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] font-sans text-slate-500 block">Employees</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedBatch.record.employeesProcessed}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] font-sans text-slate-500 block">Gross Payroll</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrencyUSD(selectedBatch.record.grossPayroll)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] font-sans text-slate-500 block">Deductions</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  -{formatCurrencyUSD(selectedBatch.record.totalDeductions)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40">
                <span className="text-[10px] font-sans text-emerald-700 dark:text-emerald-300 block">
                  Net Disbursed
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                  {formatCurrencyUSD(selectedBatch.record.netPayroll)}
                </span>
              </div>
            </div>

            {selectedBatch.mode === 'details' ? (
              <div className="space-y-2 text-xs border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Primary Hub Location</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedBatch.record.location}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Employment Category</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedBatch.record.employmentType}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Authorized &amp; Processed By</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {selectedBatch.record.processedBy}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Processed Timestamp</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {selectedBatch.record.processedDate}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Employer Statutory Contribution</span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {formatCurrencyUSD(selectedBatch.record.employerContributions)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-mono tabular-nums">
                <div className="space-y-1.5">
                  <p className="font-sans font-bold text-slate-800 dark:text-slate-200">
                    Earnings Breakdown
                  </p>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Basic Salary</span>
                    <span>{formatCurrencyUSD(selectedBatch.record.earningsBreakdown.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">HRA</span>
                    <span>{formatCurrencyUSD(selectedBatch.record.earningsBreakdown.hra)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Dearness Allowance</span>
                    <span>
                      {formatCurrencyUSD(selectedBatch.record.earningsBreakdown.dearnessAllowance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Special Allowance</span>
                    <span>
                      {formatCurrencyUSD(selectedBatch.record.earningsBreakdown.specialAllowance)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Bonus &amp; Incentives</span>
                    <span>
                      {formatCurrencyUSD(
                        selectedBatch.record.earningsBreakdown.bonus +
                          selectedBatch.record.earningsBreakdown.incentives
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Overtime</span>
                    <span>{formatCurrencyUSD(selectedBatch.record.earningsBreakdown.overtime)}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="font-sans font-bold text-slate-800 dark:text-slate-200">
                    Deductions Breakdown
                  </p>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Employee PF</span>
                    <span className="text-rose-600">
                      -{formatCurrencyUSD(selectedBatch.record.deductionsBreakdown.pf)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">ESI</span>
                    <span className="text-rose-600">
                      -{formatCurrencyUSD(selectedBatch.record.deductionsBreakdown.esi)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Income Tax (TDS)</span>
                    <span className="text-rose-600">
                      -{formatCurrencyUSD(selectedBatch.record.deductionsBreakdown.tds)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Professional Tax</span>
                    <span className="text-rose-600">
                      -{formatCurrencyUSD(selectedBatch.record.deductionsBreakdown.professionalTax)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-sans text-slate-500">Other Deductions</span>
                    <span className="text-rose-600">
                      -{formatCurrencyUSD(selectedBatch.record.deductionsBreakdown.otherDeductions)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() =>
                  setSelectedBatch((prev) =>
                    prev
                      ? {
                          ...prev,
                          mode: prev.mode === 'details' ? 'breakdown' : 'details',
                        }
                      : null
                  )
                }
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Switch to {selectedBatch.mode === 'details' ? 'Component Breakdown' : 'Batch Details'}
              </button>
              <button
                type="button"
                onClick={() => setSelectedBatch(null)}
                className="h-8 px-4 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
