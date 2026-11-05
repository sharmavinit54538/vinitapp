'use client';

import React, { useState } from 'react';
import {
  DepartmentSalaryMetric,
  PayrollVarianceSection,
  formatCurrencyUSD,
  formatCompactUSD,
} from '@/lib/payroll-analytics-types';
import {
  PieChart,
  GitCompareArrows,
  ArrowUpDown,
  Search,
  Download,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface DepartmentPayrollSectionProps {
  departments: DepartmentSalaryMetric[];
  onSelectDepartment?: (dept: DepartmentSalaryMetric['department']) => void;
  onExportCsv: (filename: string, rows: Record<string, string | number>[]) => void;
}

const DEPT_COLORS: Record<string, { hex: string; dot: string }> = {
  Engineering: { hex: '#4f46e5', dot: 'bg-indigo-600' },
  Sales: { hex: '#0891b2', dot: 'bg-cyan-600' },
  Operations: { hex: '#059669', dot: 'bg-emerald-600' },
  Marketing: { hex: '#7c3aed', dot: 'bg-violet-600' },
  Finance: { hex: '#f59e0b', dot: 'bg-amber-500' },
  'Human Resources': { hex: '#ec4899', dot: 'bg-pink-500' },
  Administration: { hex: '#64748b', dot: 'bg-slate-500' },
};

export function DepartmentPayrollCostSection({
  departments,
  onSelectDepartment,
  onExportCsv,
}: DepartmentPayrollSectionProps) {
  const [hoveredDept, setHoveredDept] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<
    'grossCost' | 'employeeCount' | 'averageSalary' | 'payrollPercentage' | 'momChangePercent'
  >('grossCost');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const totalCost = departments.reduce((acc, d) => acc + d.grossCost, 0);
  const totalStaff = departments.reduce((acc, d) => acc + d.employeeCount, 0);

  const filteredDepts = departments
    .filter((d) => d.department.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const mul = sortOrder === 'asc' ? 1 : -1;
      return (a[sortBy] - b[sortBy]) * mul;
    });

  const handleSort = (
    col: 'grossCost' | 'employeeCount' | 'averageSalary' | 'payrollPercentage' | 'momChangePercent'
  ) => {
    if (sortBy === col) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  // Interactive SVG Donut Chart math
  const radius = 68;
  const circumference = 2 * Math.PI * radius;

  const activeSlice = departments.find((d) => d.department === hoveredDept);

  return (
    <section
      aria-label="Department-Wise Payroll Cost"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Department-Wise Payroll Cost
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cost allocation, headcount share, average compensation, and month-over-month velocity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search department..."
              aria-label="Search department payroll table"
              className="h-8 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-xs text-slate-900 dark:text-white w-44"
            />
          </div>
          <button
            type="button"
            onClick={() =>
              onExportCsv(
                'ofc360-department-payroll-cost.csv',
                filteredDepts.map((d) => ({
                  Department: d.department,
                  Employees: d.employeeCount,
                  GrossPayrollCostUSD: d.grossCost,
                  NetCostUSD: d.netCost,
                  AverageSalaryUSD: d.averageSalary,
                  SharePercent: d.payrollPercentage,
                  MoMChangePercent: d.momChangePercent,
                }))
              )
            }
            className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Interactive Donut Chart & Legend (5 cols) */}
        <div className="lg:col-span-5 flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
            <svg viewBox="0 0 180 180" className="w-44 h-44 -rotate-90">
              {departments.map((d, idx) => {
                const fraction = totalCost > 0 ? d.grossCost / totalCost : 0;
                const priorFraction =
                  totalCost > 0
                    ? departments
                        .slice(0, idx)
                        .reduce((acc, item) => acc + item.grossCost / totalCost, 0)
                    : 0;
                const strokeDasharray = `${fraction * circumference} ${circumference}`;
                const strokeDashoffset = -priorFraction * circumference;
                const color = DEPT_COLORS[d.department]?.hex || '#4f46e5';
                const isHovered = hoveredDept === d.department;

                return (
                  <circle
                    key={d.department}
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="transparent"
                    stroke={color}
                    strokeWidth={isHovered ? 24 : 20}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    onMouseEnter={() => setHoveredDept(d.department)}
                    onMouseLeave={() => setHoveredDept(null)}
                    onClick={() => onSelectDepartment?.(d.department)}
                    className="cursor-pointer transition-all duration-150"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-full">
                {activeSlice ? activeSlice.department : 'Total Gross'}
              </span>
              <span className="text-sm font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                {formatCompactUSD(activeSlice ? activeSlice.grossCost : totalCost)}
              </span>
              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
                {activeSlice ? `${activeSlice.payrollPercentage}% share` : `${totalStaff} staff`}
              </span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-1.5">
            {departments.map((d) => {
              const colorMeta = DEPT_COLORS[d.department] || { dot: 'bg-indigo-600' };
              return (
                <button
                  key={d.department}
                  type="button"
                  onMouseEnter={() => setHoveredDept(d.department)}
                  onMouseLeave={() => setHoveredDept(null)}
                  onClick={() => onSelectDepartment?.(d.department)}
                  className="w-full flex items-center justify-between text-xs py-1 px-2 rounded-md hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
                >
                  <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium truncate">
                    <span className={`w-2.5 h-2.5 rounded-xs shrink-0 ${colorMeta.dot}`} />
                    <span className="truncate">{d.department}</span>
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white shrink-0">
                    {d.payrollPercentage}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Department Comparison Table (7 cols) */}
        <div className="lg:col-span-7 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <th className="py-2.5 pr-3">Department</th>
                <th className="py-2.5 px-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('employeeCount')}
                    className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  >
                    Employees
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('grossCost')}
                    className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  >
                    Payroll Cost
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('averageSalary')}
                    className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  >
                    Avg Salary
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('payrollPercentage')}
                    className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  >
                    % Share
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 pl-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('momChangePercent')}
                    className="inline-flex items-center gap-1 cursor-pointer hover:text-slate-900 dark:hover:text-white"
                  >
                    MoM Change
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs font-mono tabular-nums">
              {filteredDepts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                    No department payroll data matches &ldquo;{searchQuery}&rdquo;.
                  </td>
                </tr>
              ) : (
                filteredDepts.map((dept) => {
                const colorMeta = DEPT_COLORS[dept.department] || { dot: 'bg-indigo-600' };
                return (
                  <tr
                    key={dept.department}
                    onMouseEnter={() => setHoveredDept(dept.department)}
                    onMouseLeave={() => setHoveredDept(null)}
                    onClick={() => onSelectDepartment?.(dept.department)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="py-2.5 pr-3 font-sans font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-xs shrink-0 ${colorMeta.dot}`} />
                        <span>{dept.department}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-700 dark:text-slate-300">
                      {dept.employeeCount}
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrencyUSD(dept.grossCost)}
                    </td>
                    <td className="py-2.5 px-2 text-right text-slate-700 dark:text-slate-300">
                      {formatCurrencyUSD(dept.averageSalary)}
                    </td>
                    <td className="py-2.5 px-2 text-right text-indigo-600 dark:text-indigo-400 font-semibold">
                      {dept.payrollPercentage}%
                    </td>
                    <td className="py-2.5 pl-2 text-right">
                      <span
                        className={`inline-flex items-center gap-0.5 font-semibold ${
                          dept.momChangePercent >= 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {dept.momChangePercent >= 0 ? '+' : ''}
                        {dept.momChangePercent}%
                      </span>
                    </td>
                  </tr>
                );
              })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

interface PayrollVarianceAnalysisProps {
  variance: PayrollVarianceSection;
}

export function PayrollVarianceAnalysisSection({
  variance,
}: PayrollVarianceAnalysisProps) {
  const [comparisonScope, setComparisonScope] = useState<'mom' | 'yoy'>('mom');

  const activeScope =
    comparisonScope === 'mom' ? variance.monthOverMonth : variance.yearOverYear;

  const varianceCards = [
    activeScope.grossVariance,
    activeScope.netVariance,
    activeScope.deductionVariance,
    activeScope.overtimeVariance,
    activeScope.bonusVariance,
  ];

  const maxAbsDriverImpact = Math.max(
    ...activeScope.drivers.map((d) => Math.abs(d.costImpact)),
    1
  );

  return (
    <section
      aria-label="Payroll Variance Analysis"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <GitCompareArrows className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Payroll Variance &amp; Cost Attribution Analysis
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Period-over-period financial deltas and headcount movement cost drivers
          </p>
        </div>

        <div
          role="group"
          aria-label="Variance Comparison Period"
          className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 self-start"
        >
          <button
            type="button"
            onClick={() => setComparisonScope('mom')}
            data-testid="variance-scope-mom"
            className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 ${
              comparisonScope === 'mom'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Current vs Previous Month
          </button>
          <button
            type="button"
            onClick={() => setComparisonScope('yoy')}
            data-testid="variance-scope-yoy"
            className={`px-3 py-1 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 ${
              comparisonScope === 'yoy'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Current vs Previous Year
          </button>
        </div>
      </div>

      {/* 5 Variance Metric Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 font-mono tabular-nums">
        {varianceCards.map((vc) => {
          const isIncrease = vc.deltaAmount >= 0;
          return (
            <div
              key={vc.label}
              className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-1.5"
            >
              <span className="text-[11px] font-sans font-semibold text-slate-500 dark:text-slate-400 block">
                {vc.label}
              </span>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {isIncrease ? '+' : ''}
                  {formatCurrencyUSD(vc.deltaAmount)}
                </span>
                <span
                  className={`text-xs font-semibold inline-flex items-center gap-0.5 ${
                    isIncrease
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {isIncrease ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {isIncrease ? '+' : ''}
                  {vc.deltaPercent}%
                </span>
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                <span>Curr: {formatCompactUSD(vc.currentValue)}</span>
                <span>Prev: {formatCompactUSD(vc.previousValue)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cost Drivers Attribution Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Root-Cause Cost Change Attribution
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">
            Positive = Expenditure Expansion · Negative = Cost Reduction
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeScope.drivers.map((drv) => {
            const isPositive = drv.costImpact >= 0;
            const barWidth = Math.min(
              100,
              Math.max(10, Math.round((Math.abs(drv.costImpact) / maxAbsDriverImpact) * 100))
            );
            return (
              <div
                key={drv.id}
                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      {drv.driver}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {drv.affectedEmployees} employees impacted
                    </p>
                  </div>
                  <div className="text-right font-mono tabular-nums">
                    <span
                      className={`text-xs font-bold block ${
                        isPositive
                          ? 'text-indigo-600 dark:text-indigo-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {formatCurrencyUSD(drv.costImpact)}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ({isPositive ? '+' : ''}
                      {drv.impactPercent}% of gross)
                    </span>
                  </div>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      isPositive ? 'bg-indigo-600' : 'bg-emerald-600'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  {drv.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
