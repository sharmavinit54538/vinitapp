'use client';

import React, { useState } from 'react';
import {
  PayrollTrendPoint,
  SalaryDistributionAnalytics,
  EarningsBreakdown,
  DeductionsBreakdown,
  formatCurrencyUSD,
  formatCompactUSD,
} from '@/lib/payroll-analytics-types';
import {
  TrendingUp,
  BarChart3,
  Layers,
  Award,
  ArrowUpRight,
} from 'lucide-react';

interface PayrollTrendsChartProps {
  trends: {
    monthly: PayrollTrendPoint[];
    daily: PayrollTrendPoint[];
    yearly: PayrollTrendPoint[];
  };
}

export function PayrollTrendsSection({ trends }: PayrollTrendsChartProps) {
  const [granularity, setGranularity] = useState<'monthly' | 'daily' | 'yearly'>('monthly');
  const [comparePrevYear, setComparePrevYear] = useState<boolean>(true);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [visibleSeries, setVisibleSeries] = useState<{
    gross: boolean;
    net: boolean;
    deductions: boolean;
    employer: boolean;
  }>({
    gross: true,
    net: true,
    deductions: true,
    employer: true,
  });

  const data = trends[granularity] || trends.monthly;
  const maxVal = Math.max(
    ...data.map((d) =>
      Math.max(
        visibleSeries.gross ? d.grossPayroll : 0,
        visibleSeries.net ? d.netPayroll : 0,
        visibleSeries.deductions ? d.totalDeductions : 0,
        visibleSeries.employer ? d.employerContributions : 0,
        comparePrevYear ? d.prevYearGross : 0
      )
    ),
    1
  );

  const chartWidth = 860;
  const chartHeight = 250;
  const padLeft = 64;
  const padRight = 24;
  const padTop = 20;
  const padBottom = 34;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const getX = (index: number) => {
    if (data.length <= 1) return padLeft + plotW / 2;
    return padLeft + (index / (data.length - 1)) * plotW;
  };

  const getY = (val: number) => {
    return padTop + plotH - (val / (maxVal * 1.08)) * plotH;
  };

  const buildPath = (getter: (pt: PayrollTrendPoint) => number) => {
    return data
      .map((pt, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(getter(pt)).toFixed(1)}`)
      .join(' ');
  };

  const buildAreaPath = (getter: (pt: PayrollTrendPoint) => number) => {
    if (data.length === 0) return '';
    const line = buildPath(getter);
    const firstX = getX(0).toFixed(1);
    const lastX = getX(data.length - 1).toFixed(1);
    const baseY = (padTop + plotH).toFixed(1);
    return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  const activePoint = hoveredIdx !== null && data[hoveredIdx] ? data[hoveredIdx] : data[data.length - 1];

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => Math.round(maxVal * 1.08 * ratio));

  return (
    <section
      aria-label="Monthly Payroll Trends"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Monthly Payroll Trends
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Gross expenditure, net disbursement, statutory deductions, and employer contributions
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Previous Year Comparison Toggle */}
          <button
            type="button"
            onClick={() => setComparePrevYear((prev) => !prev)}
            data-testid="toggle-prev-year-comparison"
            className={`h-8 px-3 rounded-lg text-xs font-semibold border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              comparePrevYear
                ? 'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                : 'border-slate-200 bg-white text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'
            }`}
          >
            {comparePrevYear ? '✓ YoY Comparison On' : 'Compare Previous Year'}
          </button>

          {/* Daily / Monthly / Yearly Toggle */}
          <div
            role="group"
            aria-label="Trend Granularity"
            className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700"
          >
            {(['daily', 'monthly', 'yearly'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => {
                  setGranularity(mode);
                  setHoveredIdx(null);
                }}
                data-testid={`trend-granularity-${mode}`}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  granularity === mode
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Legend & Active Period Readout */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setVisibleSeries((s) => ({ ...s, gross: !s.gross }))}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border cursor-pointer transition-opacity ${
              visibleSeries.gross
                ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white'
                : 'border-slate-100 dark:border-slate-800 opacity-45 text-slate-400'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-indigo-600 inline-block" />
            <span>Gross Payroll</span>
          </button>

          <button
            type="button"
            onClick={() => setVisibleSeries((s) => ({ ...s, net: !s.net }))}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border cursor-pointer transition-opacity ${
              visibleSeries.net
                ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white'
                : 'border-slate-100 dark:border-slate-800 opacity-45 text-slate-400'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block" />
            <span>Net Payroll</span>
          </button>

          <button
            type="button"
            onClick={() => setVisibleSeries((s) => ({ ...s, deductions: !s.deductions }))}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border cursor-pointer transition-opacity ${
              visibleSeries.deductions
                ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white'
                : 'border-slate-100 dark:border-slate-800 opacity-45 text-slate-400'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block" />
            <span>Total Deductions</span>
          </button>

          <button
            type="button"
            onClick={() => setVisibleSeries((s) => ({ ...s, employer: !s.employer }))}
            className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 border cursor-pointer transition-opacity ${
              visibleSeries.employer
                ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white'
                : 'border-slate-100 dark:border-slate-800 opacity-45 text-slate-400'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-xs bg-cyan-600 inline-block" />
            <span>Employer Contributions</span>
          </button>
        </div>

        {/* Live Tooltip Summary Bar */}
        {activePoint && (
          <div
            data-testid="payroll-trend-tooltip-readout"
            className="flex flex-wrap items-center gap-3 text-xs bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-700/70 font-mono tabular-nums"
          >
            <span className="font-sans font-bold text-slate-800 dark:text-slate-200">
              {activePoint.period}:
            </span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
              Gross {formatCompactUSD(activePoint.grossPayroll)}
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Net {formatCompactUSD(activePoint.netPayroll)}
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              Ded {formatCompactUSD(activePoint.totalDeductions)}
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
              Employer {formatCompactUSD(activePoint.employerContributions)}
            </span>
          </div>
        )}
      </div>

      {/* Responsive Interactive SVG Line Chart */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-[250px] min-w-[580px] select-none"
          role="img"
          aria-label="Interactive Payroll Financial Trend Line Chart"
        >
          <defs>
            <linearGradient id="grossAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.16" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="netAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines & Y-Axis Labels */}
          {yTicks.map((tick, i) => {
            const y = getY(tick);
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={chartWidth - padRight}
                  y2={y}
                  stroke="currentColor"
                  className="text-slate-100 dark:text-slate-800"
                  strokeDasharray={i === 0 ? undefined : '4 4'}
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-slate-400 dark:fill-slate-500 font-mono text-[10px]"
                >
                  {formatCompactUSD(tick)}
                </text>
              </g>
            );
          })}

          {/* Previous Year Comparison Dashed Line */}
          {comparePrevYear && (
            <path
              d={buildPath((d) => d.prevYearGross)}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.75"
              strokeDasharray="5 5"
            />
          )}

          {/* Gross Payroll Area + Line */}
          {visibleSeries.gross && (
            <>
              <path d={buildAreaPath((d) => d.grossPayroll)} fill="url(#grossAreaGrad)" />
              <path
                d={buildPath((d) => d.grossPayroll)}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Net Payroll Area + Line */}
          {visibleSeries.net && (
            <>
              <path d={buildAreaPath((d) => d.netPayroll)} fill="url(#netAreaGrad)" />
              <path
                d={buildPath((d) => d.netPayroll)}
                fill="none"
                stroke="#059669"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Total Deductions Line */}
          {visibleSeries.deductions && (
            <path
              d={buildPath((d) => d.totalDeductions)}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Employer Contributions Line */}
          {visibleSeries.employer && (
            <path
              d={buildPath((d) => d.employerContributions)}
              fill="none"
              stroke="#0891b2"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Data Points & Hover Columns */}
          {data.map((pt, idx) => {
            const x = getX(idx);
            const isHovered = hoveredIdx === idx || (hoveredIdx === null && idx === data.length - 1);
            return (
              <g
                key={pt.period}
                onMouseEnter={() => setHoveredIdx(idx)}
                onClick={() => setHoveredIdx(idx)}
                className="cursor-pointer"
              >
                {isHovered && (
                  <line
                    x1={x}
                    y1={padTop}
                    x2={x}
                    y2={padTop + plotH}
                    stroke="#6366f1"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                )}

                {visibleSeries.gross && (
                  <circle
                    cx={x}
                    cy={getY(pt.grossPayroll)}
                    r={isHovered ? 5 : 3.2}
                    className="fill-indigo-600 stroke-white dark:stroke-slate-900"
                    strokeWidth="1.5"
                  />
                )}
                {visibleSeries.net && (
                  <circle
                    cx={x}
                    cy={getY(pt.netPayroll)}
                    r={isHovered ? 4.5 : 3}
                    className="fill-emerald-600 stroke-white dark:stroke-slate-900"
                    strokeWidth="1.5"
                  />
                )}
                {visibleSeries.deductions && (
                  <circle
                    cx={x}
                    cy={getY(pt.totalDeductions)}
                    r={isHovered ? 4 : 2.5}
                    className="fill-amber-500 stroke-white dark:stroke-slate-900"
                    strokeWidth="1.5"
                  />
                )}
                {visibleSeries.employer && (
                  <circle
                    cx={x}
                    cy={getY(pt.employerContributions)}
                    r={isHovered ? 4 : 2.5}
                    className="fill-cyan-600 stroke-white dark:stroke-slate-900"
                    strokeWidth="1.5"
                  />
                )}

                <text
                  x={x}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  className={`font-mono text-[10px] ${
                    isHovered
                      ? 'fill-indigo-600 dark:fill-indigo-400 font-bold'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }`}
                >
                  {pt.shortLabel}
                </text>

                {/* Invisible wider hit target for smooth mouse scrubbing */}
                <rect
                  x={x - plotW / Math.max(2, data.length * 2)}
                  y={padTop}
                  width={plotW / Math.max(1, data.length)}
                  height={plotH}
                  fill="transparent"
                />
              </g>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

interface SalaryDistributionSectionProps {
  distribution: SalaryDistributionAnalytics;
}

export function SalaryDistributionSection({
  distribution,
}: SalaryDistributionSectionProps) {
  const [viewMode, setViewMode] = useState<'bands' | 'departments' | 'designations'>('bands');
  const [selectedBandIdx, setSelectedBandIdx] = useState<number | null>(null);

  const maxDeptSalary = Math.max(
    ...distribution.byDepartment.map((d) => d.highestSalary),
    1
  );

  return (
    <section
      aria-label="Salary Distribution Analytics"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Salary Distribution Analytics
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Compensation brackets, department benchmarks, and grading hierarchy
          </p>
        </div>

        <div
          role="group"
          aria-label="Salary Distribution View"
          className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 self-start"
        >
          <button
            type="button"
            onClick={() => setViewMode('bands')}
            data-testid="salary-dist-tab-bands"
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 ${
              viewMode === 'bands'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Salary Ranges
          </button>
          <button
            type="button"
            onClick={() => setViewMode('departments')}
            data-testid="salary-dist-tab-departments"
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 ${
              viewMode === 'departments'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            By Department
          </button>
          <button
            type="button"
            onClick={() => setViewMode('designations')}
            data-testid="salary-dist-tab-designations"
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 ${
              viewMode === 'designations'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            By Designation
          </button>
        </div>
      </div>

      {/* 4 Compensation Summary Benchmarks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono tabular-nums">
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 block">
            Average Salary
          </span>
          <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
            {formatCurrencyUSD(distribution.averageSalary)}/mo
          </span>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 block">
            Median Salary
          </span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 block">
            {formatCurrencyUSD(distribution.medianSalary)}/mo
          </span>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 block">
            Highest Salary
          </span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
            {formatCurrencyUSD(distribution.highestSalary)}/mo
          </span>
        </div>
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400 block">
            Lowest Salary
          </span>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">
            {formatCurrencyUSD(distribution.lowestSalary)}/mo
          </span>
        </div>
      </div>

      {/* View 1: Salary Range Distribution Bar Chart */}
      {viewMode === 'bands' && (
        <div className="space-y-2.5 pt-1">
          {distribution.salaryBands.map((band, idx) => {
            const isSelected = selectedBandIdx === idx;
            return (
              <div
                key={band.rangeLabel}
                onClick={() => setSelectedBandIdx(isSelected ? null : idx)}
                className={`p-2.5 rounded-lg border transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/40 dark:bg-indigo-950/30'
                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                    {band.rangeLabel}
                  </span>
                  <div className="flex items-center gap-2 font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    <span>{band.employeeCount} staff</span>
                    <span>·</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {band.percentage}%
                    </span>
                    <span>·</span>
                    <span className="text-indigo-600 dark:text-indigo-400">
                      Avg {formatCurrencyUSD(band.avgSalaryInBand)}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
                    style={{ width: `${Math.max(6, band.percentage * 2.5)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: Department-wise Salary Comparison */}
      {viewMode === 'departments' && (
        <div className="space-y-2.5 pt-1">
          {distribution.byDepartment.map((dept) => (
            <div key={dept.department} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {dept.department}
                </span>
                <div className="font-mono tabular-nums text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <span>Min {formatCurrencyUSD(dept.lowestSalary)}</span>
                  <span>·</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    Avg {formatCurrencyUSD(dept.averageSalary)}
                  </span>
                  <span>·</span>
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Max {formatCurrencyUSD(dept.highestSalary)}
                  </span>
                </div>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-600/85"
                  style={{
                    width: `${Math.min(100, Math.round((dept.averageSalary / maxDeptSalary) * 100))}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View 3: Designation-wise Salary Distribution */}
      {viewMode === 'designations' && (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {distribution.byDesignation.map((des) => (
            <div
              key={des.designationLevel}
              className="py-2.5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span className="font-bold text-slate-900 dark:text-white">
                    {des.designationLevel}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="font-mono text-slate-500">{des.employeeCount} staff</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{des.roleExamples}</p>
              </div>
              <div className="font-mono tabular-nums text-right">
                <span className="font-bold text-slate-900 dark:text-white block">
                  Avg {formatCurrencyUSD(des.averageSalary)}/mo
                </span>
                <span className="text-[11px] text-slate-500">
                  Band: {formatCurrencyUSD(des.minSalary)} – {formatCurrencyUSD(des.maxSalary)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

interface EarningsVsDeductionsProps {
  earnings: EarningsBreakdown;
  deductions: DeductionsBreakdown;
  employerContributions: number;
  netPayable: number;
}

export function EarningsVsDeductionsSection({
  earnings,
  deductions,
  employerContributions,
  netPayable,
}: EarningsVsDeductionsProps) {
  const [chartType, setChartType] = useState<'stacked' | 'grouped'>('grouped');

  const earningItems = [
    { label: 'Basic Salary', amount: earnings.basicSalary, color: 'bg-indigo-600' },
    { label: 'House Rent Allowance (HRA)', amount: earnings.hra, color: 'bg-blue-500' },
    { label: 'Special Allowance', amount: earnings.specialAllowance, color: 'bg-cyan-500' },
    { label: 'Dearness Allowance (DA)', amount: earnings.dearnessAllowance, color: 'bg-teal-500' },
    { label: 'Performance Bonus', amount: earnings.bonus, color: 'bg-emerald-500' },
    { label: 'Sales & KPI Incentives', amount: earnings.incentives, color: 'bg-violet-500' },
    { label: 'Overtime Allowance', amount: earnings.overtime, color: 'bg-sky-500' },
  ];

  const deductionItems = [
    { label: 'Income Tax (TDS)', amount: deductions.tds, color: 'bg-rose-600' },
    { label: 'Employee Provident Fund (PF)', amount: deductions.pf, color: 'bg-amber-500' },
    { label: 'Employee State Insurance (ESI)', amount: deductions.esi, color: 'bg-orange-500' },
    { label: 'Professional Tax (PT)', amount: deductions.professionalTax, color: 'bg-pink-500' },
    { label: 'Other / Loan Recoveries', amount: deductions.otherDeductions, color: 'bg-slate-500' },
  ];

  return (
    <section
      aria-label="Earnings vs Deductions Financial Breakdown"
      className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Earnings vs Deductions Breakdown
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Component-level salary structure and statutory withholdings
          </p>
        </div>

        <div
          role="group"
          aria-label="Chart Type Switcher"
          className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 self-start"
        >
          <button
            type="button"
            onClick={() => setChartType('grouped')}
            data-testid="earnings-chart-grouped"
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 ${
              chartType === 'grouped'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Grouped Bars
          </button>
          <button
            type="button"
            onClick={() => setChartType('stacked')}
            data-testid="earnings-chart-stacked"
            className={`px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 ${
              chartType === 'stacked'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Stacked Composition
          </button>
        </div>
      </div>

      {/* Stacked Bar Visualization when toggled */}
      {chartType === 'stacked' && (
        <div className="space-y-3 py-1">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Gross Earnings Composition (100%)
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {formatCurrencyUSD(earnings.total)}
              </span>
            </div>
            <div className="w-full h-5 rounded-lg overflow-hidden flex bg-slate-100 dark:bg-slate-800">
              {earningItems.map((item) => {
                const pct = (item.amount / Math.max(1, earnings.total)) * 100;
                return (
                  <div
                    key={item.label}
                    title={`${item.label}: ${formatCurrencyUSD(item.amount)} (${pct.toFixed(1)}%)`}
                    className={`${item.color} h-full first:rounded-l-lg last:rounded-r-lg transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Statutory &amp; Tax Deductions Composition (100%)
              </span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                {formatCurrencyUSD(deductions.total)}
              </span>
            </div>
            <div className="w-full h-5 rounded-lg overflow-hidden flex bg-slate-100 dark:bg-slate-800">
              {deductionItems.map((item) => {
                const pct = (item.amount / Math.max(1, deductions.total)) * 100;
                return (
                  <div
                    key={item.label}
                    title={`${item.label}: ${formatCurrencyUSD(item.amount)} (${pct.toFixed(1)}%)`}
                    className={`${item.color} h-full first:rounded-l-lg last:rounded-r-lg transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Two-Column Component Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Earnings Column */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-100 dark:border-slate-800">
            <span>Earnings Components</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrencyUSD(earnings.total)}
            </span>
          </div>
          {earningItems.map((item) => {
            const pct = Math.round((item.amount / Math.max(1, earnings.total)) * 100);
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-xs ${item.color}`} />
                    {item.label}
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                    {formatCurrencyUSD(item.amount)}{' '}
                    <span className="text-slate-400 font-normal">({pct}%)</span>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Deductions Column */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200 pb-1 border-b border-slate-100 dark:border-slate-800">
            <span>Statutory Deductions</span>
            <span className="font-mono text-rose-600 dark:text-rose-400">
              -{formatCurrencyUSD(deductions.total)}
            </span>
          </div>
          {deductionItems.map((item) => {
            const pct = Math.round((item.amount / Math.max(1, deductions.total)) * 100);
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-xs ${item.color}`} />
                    {item.label}
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                    {formatCurrencyUSD(item.amount)}{' '}
                    <span className="text-slate-400 font-normal">({pct}%)</span>
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4-Pillar Reconciliation Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 font-mono tabular-nums">
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
          <span className="text-[10px] font-sans text-slate-500 uppercase block">
            Total Earnings
          </span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {formatCurrencyUSD(earnings.total)}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
          <span className="text-[10px] font-sans text-slate-500 uppercase block">
            Total Deductions
          </span>
          <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
            -{formatCurrencyUSD(deductions.total)}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
          <span className="text-[10px] font-sans text-slate-500 uppercase block">
            Employer Contrib.
          </span>
          <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">
            {formatCurrencyUSD(employerContributions)}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40">
          <span className="text-[10px] font-sans text-indigo-600 dark:text-indigo-300 uppercase font-semibold block">
            Net Payable
          </span>
          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
            {formatCurrencyUSD(netPayable)}
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </section>
  );
}
