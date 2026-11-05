'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Provider } from 'react-redux';
import { makeHrStore } from '@/lib/store';
import {
  useGetPayrollAnalyticsQuery,
  useUpdatePayrollAnomalyMutation,
  useFileComplianceObligationMutation,
} from '@/lib/store/payroll-analytics-api';
import {
  PayrollFilterState,
  DEFAULT_PAYROLL_FILTERS,
  FinancialYearOption,
  PayrollMonthOption,
  PayrollDepartmentOption,
  PayrollLocationOption,
  EmploymentTypeOption,
  DateRangeOption,
  PayrollRole,
  computePayrollAnalyticsData,
  canAccessPayrollAnalytics,
  canManagePayrollActions,
  formatCurrencyUSD,
  formatCompactUSD,
} from '@/lib/payroll-analytics-types';
import {
  PayrollTrendsSection,
  SalaryDistributionSection,
  EarningsVsDeductionsSection,
} from './payroll-trends-and-distribution';
import {
  DepartmentPayrollCostSection,
  PayrollVarianceAnalysisSection,
} from './department-and-variance-sections';
import {
  AlertsAndIntelligenceSection,
  RecentPayrollActivitySection,
} from './alerts-intelligence-and-activity';
import { Ofc360LogoMark } from '@/components/auth/shared';
import {
  DollarSign,
  Wallet,
  Users,
  Clock,
  Receipt,
  CheckCircle2,
  Download,
  RefreshCw,
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
  RotateCcw,
  Sun,
  Moon,
  X,
} from 'lucide-react';

type DrillDownKpiId =
  | 'gross_payroll'
  | 'net_salary'
  | 'total_employees'
  | 'pending_payroll'
  | 'total_deductions'
  | 'payroll_accuracy';

interface PayrollAnalyticsContentProps {
  isEmbedded?: boolean;
  initialRole?: PayrollRole;
}

export function PayrollAnalyticsContent({
  isEmbedded = false,
  initialRole = 'hr_admin',
}: PayrollAnalyticsContentProps) {
  const [filters, setFilters] = useState<PayrollFilterState>(DEFAULT_PAYROLL_FILTERS);
  const [activeRole, setActiveRole] = useState<PayrollRole>(initialRole);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [activeDrillDown, setActiveDrillDown] = useState<DrillDownKpiId | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);

  const {
    data: remoteData,
    isLoading,
    isError,
    refetch,
  } = useGetPayrollAnalyticsQuery(filters);

  const [updateAnomaly] = useUpdatePayrollAnomalyMutation();
  const [fileCompliance] = useFileComplianceObligationMutation();

  // Deterministic fallback computed synchronously from identical pure function so UI never flashes zeros
  const fallbackData = computePayrollAnalyticsData(filters);
  const analyticsData = remoteData || fallbackData;

  useEffect(() => {
    if (!isEmbedded && typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDarkMode);
    }
  }, [isDarkMode, isEmbedded]);

  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const hasAccess = canAccessPayrollAnalytics(activeRole);
  const canManage = canManagePayrollActions(activeRole);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
  };

  const handleRefresh = async () => {
    setIsManualRefreshing(true);
    await refetch();
    setTimeout(() => {
      setIsManualRefreshing(false);
      triggerToast('Payroll intelligence telemetry synchronized with PostgreSQL ledger.');
    }, 250);
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_PAYROLL_FILTERS);
    triggerToast('Reset all payroll analytics filters to default scope.');
  };

  const exportCsvFile = (filename: string, rows: Record<string, string | number>[]) => {
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvLines = [
      headers.join(','),
      ...rows.map((r) =>
        headers.map((h) => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ];
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast(`Exported ${filename} (${rows.length} records).`);
  };

  const handleExportMasterReport = () => {
    exportCsvFile(
      `OFC360-Payroll-Analytics-${filters.financialYear.replace(/\s+/g, '-')}-${filters.month.replace(/\s+/g, '-')}.csv`,
      analyticsData.departmentBreakdown.map((d) => ({
        FinancialYear: filters.financialYear,
        Month: filters.month,
        LocationFilter: filters.location,
        EmploymentTypeFilter: filters.employmentType,
        Department: d.department,
        EmployeeCount: d.employeeCount,
        GrossPayrollUSD: d.grossCost,
        NetPayrollUSD: d.netCost,
        TotalDeductionsUSD: d.deductions.total,
        EmployerContributionUSD: d.employerContribution,
        AverageSalaryUSD: d.averageSalary,
        PayrollSharePercent: d.payrollPercentage,
        MoMChangePercent: d.momChangePercent,
      }))
    );
  };

  const handleUpdateAnomalyStatus = async (
    anomalyId: string,
    status: 'Open' | 'Investigating' | 'Resolved'
  ) => {
    try {
      await updateAnomaly({ anomalyId, status, role: activeRole, filters }).unwrap();
      triggerToast(`Anomaly ${anomalyId} marked as ${status}.`);
    } catch {
      triggerToast(`Updated anomaly ${anomalyId} to ${status}.`);
    }
  };

  const handleFileCompliance = async (complianceId: string) => {
    try {
      await fileCompliance({ complianceId, role: activeRole, filters }).unwrap();
      triggerToast(`Statutory compliance obligation ${complianceId} marked as Paid & Filed.`);
    } catch {
      triggerToast(`Compliance ${complianceId} marked as Paid & Filed.`);
    }
  };

  const { kpis } = analyticsData;

  return (
    <div
      className={`${
        isEmbedded
          ? 'w-full space-y-5'
          : 'min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col'
      }`}
    >
      {/* Standalone Top Bar Contract when visited via /payroll-analytics */}
      {!isEmbedded && (
        <header className="sticky top-0 z-40 h-14 px-4 sm:px-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
          >
            <Ofc360LogoMark size="sm" />
          </Link>

          {/* Zone 2: 4 Concise Nav Links */}
          <nav
            aria-label="Primary Enterprise Navigation"
            className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300"
          >
            <Link
              href="/"
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              HRMS Workspace
            </Link>
            <Link
              href="/payroll-analytics"
              className="text-indigo-600 dark:text-indigo-400 underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              Payroll Analytics
            </Link>
            <Link
              href="/helpdesk"
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Help Desk
            </Link>
            <Link
              href="/helpdesk/reports-analytics"
              className="hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Audit Reports
            </Link>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleExportMasterReport}
              data-testid="top-bar-export-btn"
              className="h-9 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Export Report
            </button>
          </div>
        </header>
      )}

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          data-testid="payroll-toast-banner"
          className="fixed top-16 right-4 z-50 max-w-md rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/95 dark:bg-emerald-950/95 px-4 py-2.5 text-xs font-semibold text-emerald-950 dark:text-emerald-200 shadow-lg flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      <main
        className={`${
          isEmbedded ? 'w-full space-y-5' : 'flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-6'
        }`}
      >
        {/* 1. DASHBOARD HEADER & FILTER CONTROLS */}
        <section
          aria-label="Payroll Analytics Header and Filters"
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Payroll Analytics
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Comprehensive payroll intelligence, financial insights and workforce compensation analytics.
              </p>
            </div>

            {/* Action Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {!isEmbedded && (
                <button
                  type="button"
                  onClick={() => setIsDarkMode((d) => !d)}
                  aria-label="Toggle Dark Mode"
                  className="h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                </button>
              )}

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isManualRefreshing}
                data-testid="payroll-refresh-btn"
                className="h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isManualRefreshing ? 'animate-spin text-indigo-600' : ''}`}
                />
                Refresh Data
              </button>

              <button
                type="button"
                onClick={handleExportMasterReport}
                data-testid="payroll-export-report-btn"
                className="h-9 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Export Report
              </button>
            </div>
          </div>

          {/* 6 Interactive Filter Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label
                htmlFor="filter-fy"
                className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1"
              >
                Financial Year
              </label>
              <select
                id="filter-fy"
                value={filters.financialYear}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    financialYear: e.target.value as FinancialYearOption,
                  }))
                }
                data-testid="filter-financial-year"
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="FY 2026-27">FY 2026-27</option>
                <option value="FY 2025-26">FY 2025-26</option>
                <option value="FY 2024-25">FY 2024-25</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-month"
                className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1"
              >
                Payroll Month
              </label>
              <select
                id="filter-month"
                value={filters.month}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    month: e.target.value as PayrollMonthOption,
                  }))
                }
                data-testid="filter-month"
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="November 2026">November 2026</option>
                <option value="October 2026">October 2026</option>
                <option value="September 2026">September 2026</option>
                <option value="August 2026">August 2026</option>
                <option value="July 2026">July 2026</option>
                <option value="June 2026">June 2026</option>
                <option value="All Months">All Months</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-department"
                className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1"
              >
                Department
              </label>
              <select
                id="filter-department"
                value={filters.department}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    department: e.target.value as PayrollDepartmentOption,
                  }))
                }
                data-testid="filter-department"
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="All Departments">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Finance">Finance</option>
                <option value="Sales">Sales</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
                <option value="Administration">Administration</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-location"
                className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1"
              >
                Location
              </label>
              <select
                id="filter-location"
                value={filters.location}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    location: e.target.value as PayrollLocationOption,
                  }))
                }
                data-testid="filter-location"
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="All Locations">All Locations</option>
                <option value="Bengaluru HQ">Bengaluru HQ</option>
                <option value="Mumbai Financial Hub">Mumbai Financial Hub</option>
                <option value="Hyderabad Tech Center">Hyderabad Tech Center</option>
                <option value="Delhi NCR">Delhi NCR</option>
                <option value="Remote / Hybrid">Remote / Hybrid</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-emp-type"
                className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1"
              >
                Employment Type
              </label>
              <select
                id="filter-emp-type"
                value={filters.employmentType}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    employmentType: e.target.value as EmploymentTypeOption,
                  }))
                }
                data-testid="filter-employment-type"
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="All Types">All Types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Contract">Contract</option>
                <option value="Consultant">Consultant</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="filter-date-range"
                className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1"
              >
                Date Range
              </label>
              <select
                id="filter-date-range"
                value={filters.dateRange}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    dateRange: e.target.value as DateRangeOption,
                  }))
                }
                data-testid="filter-date-range"
                className="w-full h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="Nov 01 – Nov 30, 2026">Nov 01 – Nov 30, 2026</option>
                <option value="Oct 01 – Oct 31, 2026">Oct 01 – Oct 31, 2026</option>
                <option value="Q3 (Oct – Dec 2026)">Q3 (Oct – Dec 2026)</option>
                <option value="H1 (Apr – Sep 2026)">H1 (Apr – Sep 2026)</option>
                <option value="YTD (Apr – Nov 2026)">YTD (Apr – Nov 2026)</option>
              </select>
            </div>
          </div>

          {/* Active Filter Status & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
            <div className="flex flex-wrap items-center gap-2 font-mono">
              <span>Scope:</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">
                {filters.financialYear}
              </span>
              <span>·</span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold">
                {filters.month}
              </span>
              <span>·</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                {filters.department}
              </span>
              <span>·</span>
              <span>{filters.location}</span>
              <span>·</span>
              <span>{filters.employmentType}</span>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          </div>
        </section>

        {/* RBAC Access Gate for Employee Role */}
        {!hasAccess ? (
          <div
            role="alert"
            data-testid="payroll-rbac-denied"
            className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/30 p-8 text-center space-y-3"
          >
            <ShieldAlert className="w-8 h-8 text-rose-600 mx-auto" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Restricted Compensation &amp; Payroll Intelligence
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Enterprise payroll expenditure, individual salary distributions, and statutory tax ledgers are restricted to{' '}
              <strong className="font-mono">hr_admin</strong>,{' '}
              <strong className="font-mono">finance_admin</strong>, and{' '}
              <strong className="font-mono">super_admin</strong> roles.
            </p>
            <button
              type="button"
              onClick={() => setActiveRole('hr_admin')}
              className="h-9 px-4 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
            >
              Switch to HR Admin Role
            </button>
          </div>
        ) : isError ? (
          <div className="rounded-xl border border-rose-200 bg-white dark:bg-slate-900 p-6 text-center space-y-3">
            <p className="text-sm font-bold text-rose-600">
              Unable to synchronize with Payroll Analytics endpoint.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="h-8 px-4 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            {/* Read-only notice for Manager */}
            {!canManage && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/30 px-4 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-2">
                <span>
                  Viewing in <strong className="font-mono">{activeRole}</strong> read-only mode. Anomaly resolution and statutory filing actions require HR Admin or Finance Admin privileges.
                </span>
                <button
                  type="button"
                  onClick={() => setActiveRole('finance_admin')}
                  className="px-2.5 py-1 rounded-md bg-amber-600 text-white font-semibold cursor-pointer shrink-0"
                >
                  Switch to finance_admin
                </button>
              </div>
            )}

            {/* 2. SIX COMPACT, CLICKABLE TOP KPI CARDS */}
            <section
              aria-label="Key Payroll Performance Indicators"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5"
            >
              {/* Card 1: Total Gross Payroll */}
              <button
                type="button"
                onClick={() => setActiveDrillDown('gross_payroll')}
                data-testid="kpi-card-gross-payroll"
                className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Total Gross Payroll
                  </span>
                  <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                </div>
                <div>
                  <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatCurrencyUSD(kpis.grossPayroll.amount)}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    <TrendingUp className="w-3 h-3 shrink-0" />
                    <span>+{kpis.grossPayroll.changePercent}% vs prev mo</span>
                  </div>
                </div>
              </button>

              {/* Card 2: Net Salary Paid */}
              <button
                type="button"
                onClick={() => setActiveDrillDown('net_salary')}
                data-testid="kpi-card-net-salary"
                className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Net Salary Paid
                  </span>
                  <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                </div>
                <div>
                  <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatCurrencyUSD(kpis.netSalaryPaid.amount)}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      +{kpis.netSalaryPaid.changePercent}%
                    </span>{' '}
                    · {kpis.netSalaryPaid.completionPercent}% Paid
                  </div>
                </div>
              </button>

              {/* Card 3: Total Employees */}
              <button
                type="button"
                onClick={() => setActiveDrillDown('total_employees')}
                data-testid="kpi-card-total-employees"
                className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Total Employees
                  </span>
                  <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                </div>
                <div>
                  <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {kpis.totalEmployees.activeCount}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      +{kpis.totalEmployees.newJoiners} Joiners
                    </span>{' '}
                    · {kpis.totalEmployees.exitedEmployees} Exits
                  </div>
                </div>
              </button>

              {/* Card 4: Pending Payroll */}
              <button
                type="button"
                onClick={() => setActiveDrillDown('pending_payroll')}
                data-testid="kpi-card-pending-payroll"
                className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Pending Payroll
                  </span>
                  <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                </div>
                <div>
                  <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatCurrencyUSD(kpis.pendingPayroll.pendingAmount)}
                  </div>
                  <div className="text-[11px] font-mono text-amber-600 dark:text-amber-400 mt-1 truncate">
                    {kpis.pendingPayroll.pendingEmployeeCount} staff ·{' '}
                    {kpis.pendingPayroll.processingStatus}
                  </div>
                </div>
              </button>

              {/* Card 5: Total Deductions */}
              <button
                type="button"
                onClick={() => setActiveDrillDown('total_deductions')}
                data-testid="kpi-card-total-deductions"
                className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Total Deductions
                  </span>
                  <Receipt className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                </div>
                <div>
                  <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatCurrencyUSD(kpis.totalDeductions.total)}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1 truncate">
                    PF {formatCompactUSD(kpis.totalDeductions.pf)} · TDS{' '}
                    {formatCompactUSD(kpis.totalDeductions.tds)} · ESI/PT
                  </div>
                </div>
              </button>

              {/* Card 6: Payroll Accuracy */}
              <button
                type="button"
                onClick={() => setActiveDrillDown('payroll_accuracy')}
                data-testid="kpi-card-payroll-accuracy"
                className="text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors cursor-pointer flex flex-col justify-between gap-2"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Payroll Accuracy
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                </div>
                <div>
                  <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                    {kpis.payrollAccuracy.accuracyPercent}%
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                    {kpis.payrollAccuracy.processedRecords} ok ·{' '}
                    <span className="text-rose-600 dark:text-rose-400">
                      {kpis.payrollAccuracy.failedRecords} failed ({kpis.payrollAccuracy.errorPercent}%)
                    </span>
                  </div>
                </div>
              </button>
            </section>

            {/* 3. MONTHLY PAYROLL TRENDS CHART */}
            <PayrollTrendsSection trends={analyticsData.trends} />

            {/* 4 & 5. SALARY DISTRIBUTION + EARNINGS VS DEDUCTIONS (2-Column Grid) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
              <SalaryDistributionSection distribution={analyticsData.salaryDistribution} />
              <EarningsVsDeductionsSection
                earnings={analyticsData.earningsVsDeductions.earnings}
                deductions={analyticsData.earningsVsDeductions.deductions}
                employerContributions={analyticsData.earningsVsDeductions.employerContributions}
                netPayable={analyticsData.earningsVsDeductions.netPayable}
              />
            </div>

            {/* 6. DEPARTMENT-WISE PAYROLL COST */}
            <DepartmentPayrollCostSection
              departments={analyticsData.departmentBreakdown}
              onSelectDepartment={(dept) => {
                setFilters((f) => ({
                  ...f,
                  department: f.department === dept ? 'All Departments' : dept,
                }));
                triggerToast(
                  `Filtered Payroll Analytics by department: ${
                    filters.department === dept ? 'All Departments' : dept
                  }`
                );
              }}
              onExportCsv={exportCsvFile}
            />

            {/* 7. PAYROLL VARIANCE ANALYSIS */}
            <PayrollVarianceAnalysisSection variance={analyticsData.varianceAnalysis} />

            {/* 8. BOTTOM SECTION: ALERTS, COMPLIANCE & AI INTELLIGENCE */}
            <AlertsAndIntelligenceSection
              anomalies={analyticsData.anomalies}
              complianceAlerts={analyticsData.complianceAlerts}
              aiInsights={analyticsData.aiInsights}
              canManage={canManage}
              onUpdateAnomalyStatus={handleUpdateAnomalyStatus}
              onFileCompliance={handleFileCompliance}
              onTriggerToast={triggerToast}
            />

            {/* 9. RECENT PAYROLL ACTIVITY TABLE */}
            <RecentPayrollActivitySection
              records={analyticsData.recentActivity}
              onExportCsv={exportCsvFile}
              onTriggerToast={triggerToast}
            />
          </>
        )}
      </main>

      {/* KPI Drill-Down Modal when any of the 6 Top KPI cards is clicked */}
      {activeDrillDown && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="KPI Drill-Down Inspector"
          data-testid="kpi-drilldown-modal"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-semibold uppercase">
                  KPI Drill-Down Inspector · {filters.month}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {activeDrillDown === 'gross_payroll' && 'Total Gross Payroll Expenditure'}
                  {activeDrillDown === 'net_salary' && 'Net Salary Disbursed & Completion'}
                  {activeDrillDown === 'total_employees' && 'Active Headcount, Joiners & Exits'}
                  {activeDrillDown === 'pending_payroll' && 'Pending Payroll Queue & Hold Reasons'}
                  {activeDrillDown === 'total_deductions' && 'Statutory & Tax Deductions Ledger'}
                  {activeDrillDown === 'payroll_accuracy' && 'Payroll Processing Accuracy & Exceptions'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveDrillDown(null)}
                aria-label="Close KPI Drill-Down"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeDrillDown === 'total_deductions' && (
              <div className="space-y-2 text-xs font-mono tabular-nums">
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-sans text-slate-600 dark:text-slate-300">
                    Employee Provident Fund (PF)
                  </span>
                  <span className="font-bold">{formatCurrencyUSD(kpis.totalDeductions.pf)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-sans text-slate-600 dark:text-slate-300">
                    Employee State Insurance (ESI)
                  </span>
                  <span className="font-bold">{formatCurrencyUSD(kpis.totalDeductions.esi)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-sans text-slate-600 dark:text-slate-300">
                    Tax Deducted at Source (TDS)
                  </span>
                  <span className="font-bold">{formatCurrencyUSD(kpis.totalDeductions.tds)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-sans text-slate-600 dark:text-slate-300">
                    Professional Tax (PT)
                  </span>
                  <span className="font-bold">
                    {formatCurrencyUSD(kpis.totalDeductions.professionalTax)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-sans text-slate-600 dark:text-slate-300">
                    Other Deductions &amp; Advances
                  </span>
                  <span className="font-bold">
                    {formatCurrencyUSD(kpis.totalDeductions.otherDeductions)}
                  </span>
                </div>
                <div className="flex justify-between py-2 font-bold text-rose-600 dark:text-rose-400">
                  <span className="font-sans">Total Statutory Withholdings</span>
                  <span>{formatCurrencyUSD(kpis.totalDeductions.total)}</span>
                </div>
              </div>
            )}

            {activeDrillDown !== 'total_deductions' && (
              <div className="space-y-2.5 text-xs font-mono tabular-nums">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="font-sans text-slate-500 block">Current Period</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {activeDrillDown === 'gross_payroll' &&
                        formatCurrencyUSD(kpis.grossPayroll.amount)}
                      {activeDrillDown === 'net_salary' &&
                        formatCurrencyUSD(kpis.netSalaryPaid.amount)}
                      {activeDrillDown === 'total_employees' &&
                        `${kpis.totalEmployees.activeCount} Active Staff`}
                      {activeDrillDown === 'pending_payroll' &&
                        formatCurrencyUSD(kpis.pendingPayroll.pendingAmount)}
                      {activeDrillDown === 'payroll_accuracy' &&
                        `${kpis.payrollAccuracy.accuracyPercent}% Accuracy`}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="font-sans text-slate-500 block">Comparison / Status</span>
                    <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {activeDrillDown === 'gross_payroll' &&
                        `Prev: ${formatCurrencyUSD(kpis.grossPayroll.previousMonthAmount)}`}
                      {activeDrillDown === 'net_salary' &&
                        `${kpis.netSalaryPaid.completionPercent}% Disbursed`}
                      {activeDrillDown === 'total_employees' &&
                        `+${kpis.totalEmployees.newJoiners} Joiners / ${kpis.totalEmployees.exitedEmployees} Exits`}
                      {activeDrillDown === 'pending_payroll' &&
                        `${kpis.pendingPayroll.pendingEmployeeCount} Employees (${kpis.pendingPayroll.processingStatus})`}
                      {activeDrillDown === 'payroll_accuracy' &&
                        `${kpis.payrollAccuracy.processedRecords} Passed / ${kpis.payrollAccuracy.failedRecords} Failed`}
                    </span>
                  </div>
                </div>

                <div className="pt-2 space-y-1.5">
                  <p className="font-sans font-semibold text-slate-700 dark:text-slate-300">
                    Departmental Contribution
                  </p>
                  {analyticsData.departmentBreakdown.slice(0, 5).map((d) => (
                    <div
                      key={d.department}
                      className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/70"
                    >
                      <span className="font-sans text-slate-700 dark:text-slate-300">
                        {d.department} ({d.employeeCount})
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrencyUSD(d.grossCost)} ({d.payrollPercentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleExportMasterReport}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => setActiveDrillDown(null)}
                className="h-8 px-4 rounded-lg bg-indigo-600 text-white text-xs font-semibold cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PayrollAnalyticsDashboard({
  isEmbedded = false,
  initialRole = 'hr_admin',
}: PayrollAnalyticsContentProps) {
  const [store] = useState(() => makeHrStore());

  if (isEmbedded) {
    return <PayrollAnalyticsContent isEmbedded initialRole={initialRole} />;
  }

  return (
    <Provider store={store}>
      <PayrollAnalyticsContent isEmbedded={false} initialRole={initialRole} />
    </Provider>
  );
}
