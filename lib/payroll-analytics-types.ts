import { Ofc360Role } from './auth-schemas';

export type PayrollRole = Ofc360Role | 'finance_admin';

export type FinancialYearOption = 'FY 2026-27' | 'FY 2025-26' | 'FY 2024-25';

export type PayrollMonthOption =
  | 'November 2026'
  | 'October 2026'
  | 'September 2026'
  | 'August 2026'
  | 'July 2026'
  | 'June 2026'
  | 'All Months';

export type PayrollDepartmentOption =
  | 'All Departments'
  | 'Engineering'
  | 'Human Resources'
  | 'Finance'
  | 'Sales'
  | 'Marketing'
  | 'Operations'
  | 'Administration';

export type PayrollLocationOption =
  | 'All Locations'
  | 'Bengaluru HQ'
  | 'Mumbai Financial Hub'
  | 'Hyderabad Tech Center'
  | 'Delhi NCR'
  | 'Remote / Hybrid';

export type EmploymentTypeOption =
  | 'All Types'
  | 'Full-Time'
  | 'Contract'
  | 'Intern'
  | 'Consultant';

export type DateRangeOption =
  | 'Nov 01 – Nov 30, 2026'
  | 'Oct 01 – Oct 31, 2026'
  | 'Q3 (Oct – Dec 2026)'
  | 'H1 (Apr – Sep 2026)'
  | 'YTD (Apr – Nov 2026)';

export interface PayrollFilterState {
  financialYear: FinancialYearOption;
  month: PayrollMonthOption;
  department: PayrollDepartmentOption;
  location: PayrollLocationOption;
  employmentType: EmploymentTypeOption;
  dateRange: DateRangeOption;
}

export interface DeductionsBreakdown {
  pf: number;
  esi: number;
  tds: number;
  professionalTax: number;
  otherDeductions: number;
  total: number;
}

export interface EarningsBreakdown {
  basicSalary: number;
  hra: number;
  dearnessAllowance: number;
  specialAllowance: number;
  bonus: number;
  incentives: number;
  overtime: number;
  total: number;
}

export interface PayrollTopKpis {
  grossPayroll: {
    amount: number;
    previousMonthAmount: number;
    changePercent: number;
    trend: 'up' | 'down' | 'neutral';
  };
  netSalaryPaid: {
    amount: number;
    previousMonthAmount: number;
    changePercent: number;
    completionPercent: number;
    disbursedCount: number;
  };
  totalEmployees: {
    activeCount: number;
    newJoiners: number;
    exitedEmployees: number;
    changePercent: number;
  };
  pendingPayroll: {
    pendingAmount: number;
    pendingEmployeeCount: number;
    processingStatus: 'Bank Verification' | 'Final Audit' | 'Cleared' | 'Hold for FnF';
  };
  totalDeductions: DeductionsBreakdown & {
    changePercent: number;
  };
  payrollAccuracy: {
    accuracyPercent: number;
    errorPercent: number;
    processedRecords: number;
    failedRecords: number;
  };
}

export interface PayrollTrendPoint {
  period: string;
  shortLabel: string;
  grossPayroll: number;
  netPayroll: number;
  totalDeductions: number;
  employerContributions: number;
  prevYearGross: number;
  prevYearNet: number;
}

export interface SalaryBandBucket {
  rangeLabel: string;
  minK: number;
  maxK: number;
  employeeCount: number;
  percentage: number;
  avgSalaryInBand: number;
}

export interface DepartmentSalaryMetric {
  department: Exclude<PayrollDepartmentOption, 'All Departments'>;
  employeeCount: number;
  grossCost: number;
  netCost: number;
  averageSalary: number;
  medianSalary: number;
  highestSalary: number;
  lowestSalary: number;
  payrollPercentage: number;
  momChangePercent: number;
  earnings: EarningsBreakdown;
  deductions: DeductionsBreakdown;
  employerContribution: number;
}

export interface DesignationSalaryMetric {
  designationLevel: string;
  roleExamples: string;
  employeeCount: number;
  averageSalary: number;
  medianSalary: number;
  minSalary: number;
  maxSalary: number;
}

export interface SalaryDistributionAnalytics {
  averageSalary: number;
  medianSalary: number;
  highestSalary: number;
  lowestSalary: number;
  salaryBands: SalaryBandBucket[];
  byDepartment: DepartmentSalaryMetric[];
  byDesignation: DesignationSalaryMetric[];
}

export interface VarianceMetricItem {
  label: string;
  currentValue: number;
  previousValue: number;
  deltaAmount: number;
  deltaPercent: number;
}

export interface VarianceDriverItem {
  id: string;
  driver:
    | 'New Employee Joining'
    | 'Employee Exits'
    | 'Salary Revisions'
    | 'Promotions'
    | 'Bonus Payments'
    | 'Overtime Changes';
  affectedEmployees: number;
  costImpact: number; // positive = increase, negative = savings/reduction
  impactPercent: number;
  description: string;
}

export interface PayrollVarianceSection {
  monthOverMonth: {
    grossVariance: VarianceMetricItem;
    netVariance: VarianceMetricItem;
    deductionVariance: VarianceMetricItem;
    overtimeVariance: VarianceMetricItem;
    bonusVariance: VarianceMetricItem;
    drivers: VarianceDriverItem[];
  };
  yearOverYear: {
    grossVariance: VarianceMetricItem;
    netVariance: VarianceMetricItem;
    deductionVariance: VarianceMetricItem;
    overtimeVariance: VarianceMetricItem;
    bonusVariance: VarianceMetricItem;
    drivers: VarianceDriverItem[];
  };
}

export type AnomalyCategory =
  | 'Unusual Salary Increase'
  | 'Duplicate Payroll Entry'
  | 'Missing Salary Component'
  | 'Bank Validation Failure'
  | 'Calculation Discrepancy';

export interface PayrollAnomalyItem {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Exclude<PayrollDepartmentOption, 'All Departments'>;
  category: AnomalyCategory;
  severity: 'Critical' | 'High' | 'Medium';
  financialImpact: number;
  detectedAt: string;
  description: string;
  status: 'Open' | 'Investigating' | 'Resolved';
}

export interface ComplianceAlertItem {
  id: string;
  statutoryBody: 'EPFO (PF)' | 'ESIC (ESI)' | 'Income Tax (TDS)' | 'State PT' | 'LWF & Gratuity';
  obligationTitle: string;
  dueDate: string;
  amountDue: number;
  status: 'Paid & Filed' | 'Challan Generated' | 'Pending Remittance' | 'Due Soon';
  challanRef: string;
  coveredEmployees: number;
}

export interface AiPayrollInsightItem {
  id: string;
  category:
    | 'Cost Prediction'
    | 'Anomaly Detection'
    | 'Expense Optimization'
    | 'Department Spending'
    | 'Variance Explanation'
    | 'Predictive Financial';
  title: string;
  finding: string;
  quantifiedImpact: string;
  confidenceScore: number;
  recommendedAction: string;
}

export interface PayrollActivityRecord {
  payrollId: string;
  payrollMonth: string;
  financialYear: FinancialYearOption;
  department: Exclude<PayrollDepartmentOption, 'All Departments'>;
  location: Exclude<PayrollLocationOption, 'All Locations'>;
  employmentType: Exclude<EmploymentTypeOption, 'All Types'>;
  employeesProcessed: number;
  grossPayroll: number;
  netPayroll: number;
  totalDeductions: number;
  employerContributions: number;
  status: 'Completed' | 'Disbursed' | 'Pending Approval' | 'Validation Warning';
  processedDate: string;
  processedBy: string;
  earningsBreakdown: EarningsBreakdown;
  deductionsBreakdown: DeductionsBreakdown;
}

export interface PayrollAnalyticsResponse {
  filters: PayrollFilterState;
  lastUpdated: string;
  kpis: PayrollTopKpis;
  trends: {
    monthly: PayrollTrendPoint[];
    daily: PayrollTrendPoint[];
    yearly: PayrollTrendPoint[];
  };
  salaryDistribution: SalaryDistributionAnalytics;
  earningsVsDeductions: {
    earnings: EarningsBreakdown;
    deductions: DeductionsBreakdown;
    employerContributions: number;
    netPayable: number;
  };
  departmentBreakdown: DepartmentSalaryMetric[];
  varianceAnalysis: PayrollVarianceSection;
  anomalies: PayrollAnomalyItem[];
  complianceAlerts: ComplianceAlertItem[];
  aiInsights: AiPayrollInsightItem[];
  recentActivity: PayrollActivityRecord[];
}

export const PAYROLL_DEPARTMENTS: Exclude<PayrollDepartmentOption, 'All Departments'>[] = [
  'Engineering',
  'Human Resources',
  'Finance',
  'Sales',
  'Marketing',
  'Operations',
  'Administration',
];

export const DEFAULT_PAYROLL_FILTERS: PayrollFilterState = {
  financialYear: 'FY 2026-27',
  month: 'November 2026',
  department: 'All Departments',
  location: 'All Locations',
  employmentType: 'All Types',
  dateRange: 'Nov 01 – Nov 30, 2026',
};

/**
 * RBAC check for Payroll Analytics access and write actions
 */
export function canAccessPayrollAnalytics(role: PayrollRole): boolean {
  return (
    role === 'super_admin' ||
    role === 'hr_admin' ||
    role === 'finance_admin' ||
    role === 'executive' ||
    role === 'manager'
  );
}

export function canManagePayrollActions(role: PayrollRole): boolean {
  return role === 'super_admin' || role === 'hr_admin' || role === 'finance_admin';
}

export function formatCurrencyUSD(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  return `${sign}$${Math.round(abs).toLocaleString('en-US')}`;
}

export function formatCompactUSD(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 1_000_000) {
    return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  }
  return `${sign}$${Math.round(abs)}`;
}

interface DepartmentSeedSpec {
  department: Exclude<PayrollDepartmentOption, 'All Departments'>;
  baseHeadcount: number;
  baseAvgGross: number;
  baseMedianGross: number;
  baseHighestGross: number;
  baseLowestGross: number;
  momDelta: number;
  primaryLocation: Exclude<PayrollLocationOption, 'All Locations'>;
  primaryEmpType: Exclude<EmploymentTypeOption, 'All Types'>;
}

const DEPARTMENT_SPECS: DepartmentSeedSpec[] = [
  {
    department: 'Engineering',
    baseHeadcount: 96,
    baseAvgGross: 8400,
    baseMedianGross: 8100,
    baseHighestGross: 16500,
    baseLowestGross: 4200,
    momDelta: 4.8,
    primaryLocation: 'Bengaluru HQ',
    primaryEmpType: 'Full-Time',
  },
  {
    department: 'Sales',
    baseHeadcount: 44,
    baseAvgGross: 6900,
    baseMedianGross: 6500,
    baseHighestGross: 13800,
    baseLowestGross: 3800,
    momDelta: 6.2,
    primaryLocation: 'Mumbai Financial Hub',
    primaryEmpType: 'Full-Time',
  },
  {
    department: 'Operations',
    baseHeadcount: 38,
    baseAvgGross: 5400,
    baseMedianGross: 5150,
    baseHighestGross: 9600,
    baseLowestGross: 3200,
    momDelta: 2.1,
    primaryLocation: 'Hyderabad Tech Center',
    primaryEmpType: 'Full-Time',
  },
  {
    department: 'Marketing',
    baseHeadcount: 24,
    baseAvgGross: 6200,
    baseMedianGross: 5950,
    baseHighestGross: 11200,
    baseLowestGross: 3600,
    momDelta: 3.4,
    primaryLocation: 'Delhi NCR',
    primaryEmpType: 'Full-Time',
  },
  {
    department: 'Finance',
    baseHeadcount: 20,
    baseAvgGross: 7100,
    baseMedianGross: 6800,
    baseHighestGross: 13400,
    baseLowestGross: 4100,
    momDelta: 1.9,
    primaryLocation: 'Mumbai Financial Hub',
    primaryEmpType: 'Full-Time',
  },
  {
    department: 'Human Resources',
    baseHeadcount: 14,
    baseAvgGross: 5800,
    baseMedianGross: 5600,
    baseHighestGross: 10400,
    baseLowestGross: 3500,
    momDelta: 2.5,
    primaryLocation: 'Bengaluru HQ',
    primaryEmpType: 'Full-Time',
  },
  {
    department: 'Administration',
    baseHeadcount: 12,
    baseAvgGross: 4600,
    baseMedianGross: 4400,
    baseHighestGross: 7800,
    baseLowestGross: 2900,
    momDelta: 1.2,
    primaryLocation: 'Bengaluru HQ',
    primaryEmpType: 'Full-Time',
  },
];

function computeEarningsFromGross(gross: number): EarningsBreakdown {
  const basicSalary = Math.round(gross * 0.46);
  const hra = Math.round(gross * 0.20);
  const dearnessAllowance = Math.round(gross * 0.07);
  const specialAllowance = Math.round(gross * 0.13);
  const bonus = Math.round(gross * 0.06);
  const incentives = Math.round(gross * 0.05);
  const overtime = Math.max(
    0,
    gross - (basicSalary + hra + dearnessAllowance + specialAllowance + bonus + incentives)
  );
  return {
    basicSalary,
    hra,
    dearnessAllowance,
    specialAllowance,
    bonus,
    incentives,
    overtime,
    total: gross,
  };
}

function computeDeductionsFromGross(gross: number): DeductionsBreakdown {
  const pf = Math.round(gross * 0.055);
  const esi = Math.round(gross * 0.012);
  const tds = Math.round(gross * 0.108);
  const professionalTax = Math.round(gross * 0.008);
  const otherDeductions = Math.round(gross * 0.007);
  const total = pf + esi + tds + professionalTax + otherDeductions;
  return {
    pf,
    esi,
    tds,
    professionalTax,
    otherDeductions,
    total,
  };
}

function getFilterMultiplier(filters: PayrollFilterState): {
  scale: number;
  fyFactor: number;
  monthFactor: number;
  locationFactor: number;
  empTypeFactor: number;
} {
  const fyFactor =
    filters.financialYear === 'FY 2026-27'
      ? 1.0
      : filters.financialYear === 'FY 2025-26'
      ? 0.91
      : 0.83;

  const monthFactorMap: Record<PayrollMonthOption, number> = {
    'November 2026': 1.0,
    'October 2026': 0.975,
    'September 2026': 0.955,
    'August 2026': 0.94,
    'July 2026': 0.93,
    'June 2026': 0.915,
    'All Months': 1.0,
  };
  const monthFactor = monthFactorMap[filters.month] ?? 1.0;

  const locationFactorMap: Record<PayrollLocationOption, number> = {
    'All Locations': 1.0,
    'Bengaluru HQ': 0.44,
    'Mumbai Financial Hub': 0.24,
    'Hyderabad Tech Center': 0.16,
    'Delhi NCR': 0.10,
    'Remote / Hybrid': 0.06,
  };
  const locationFactor = locationFactorMap[filters.location] ?? 1.0;

  const empTypeFactorMap: Record<EmploymentTypeOption, number> = {
    'All Types': 1.0,
    'Full-Time': 0.84,
    'Contract': 0.09,
    'Consultant': 0.04,
    'Intern': 0.03,
  };
  const empTypeFactor = empTypeFactorMap[filters.employmentType] ?? 1.0;

  const scale = fyFactor * monthFactor * locationFactor * empTypeFactor;
  return { scale, fyFactor, monthFactor, locationFactor, empTypeFactor };
}

/**
 * Pure deterministic computation of the entire Payroll Analytics state for any filter combination.
 */
export function computePayrollAnalyticsData(
  partialFilters?: Partial<PayrollFilterState>,
  customAnomalies?: PayrollAnomalyItem[],
  customCompliance?: ComplianceAlertItem[]
): PayrollAnalyticsResponse {
  const filters: PayrollFilterState = {
    ...DEFAULT_PAYROLL_FILTERS,
    ...partialFilters,
  };

  const { scale, fyFactor, monthFactor, locationFactor, empTypeFactor } =
    getFilterMultiplier(filters);

  const selectedDepts =
    filters.department === 'All Departments'
      ? DEPARTMENT_SPECS
      : DEPARTMENT_SPECS.filter((d) => d.department === filters.department);

  // Build department metrics first
  const rawDepts = selectedDepts.map((spec) => {
    const scaledHeadcount = Math.max(
      1,
      Math.round(spec.baseHeadcount * locationFactor * empTypeFactor * fyFactor)
    );
    const avgSalary = Math.round(spec.baseAvgGross * fyFactor * monthFactor);
    const grossCost = scaledHeadcount * avgSalary;
    const earnings = computeEarningsFromGross(grossCost);
    const deductions = computeDeductionsFromGross(grossCost);
    const netCost = grossCost - deductions.total;
    const employerContribution = Math.round(grossCost * 0.072);

    return {
      department: spec.department,
      employeeCount: scaledHeadcount,
      grossCost,
      netCost,
      averageSalary: avgSalary,
      medianSalary: Math.round(spec.baseMedianGross * fyFactor * monthFactor),
      highestSalary: Math.round(spec.baseHighestGross * fyFactor * monthFactor),
      lowestSalary: Math.round(spec.baseLowestGross * fyFactor * monthFactor),
      payrollPercentage: 0, // computed after totalGross is known
      momChangePercent: Number((spec.momDelta * monthFactor).toFixed(1)),
      earnings,
      deductions,
      employerContribution,
    };
  });

  const totalGross = rawDepts.reduce((acc, d) => acc + d.grossCost, 0);
  const totalNet = rawDepts.reduce((acc, d) => acc + d.netCost, 0);
  const totalEmployeesCount = rawDepts.reduce((acc, d) => acc + d.employeeCount, 0);
  const totalEmployerContrib = rawDepts.reduce((acc, d) => acc + d.employerContribution, 0);

  // Assign exact payrollPercentage summing to 100%
  const departmentBreakdown: DepartmentSalaryMetric[] = rawDepts.map((d) => ({
    ...d,
    payrollPercentage:
      totalGross > 0 ? Number(((d.grossCost / totalGross) * 100).toFixed(1)) : 0,
  }));

  const aggregatedEarnings: EarningsBreakdown = rawDepts.reduce(
    (acc, d) => ({
      basicSalary: acc.basicSalary + d.earnings.basicSalary,
      hra: acc.hra + d.earnings.hra,
      dearnessAllowance: acc.dearnessAllowance + d.earnings.dearnessAllowance,
      specialAllowance: acc.specialAllowance + d.earnings.specialAllowance,
      bonus: acc.bonus + d.earnings.bonus,
      incentives: acc.incentives + d.earnings.incentives,
      overtime: acc.overtime + d.earnings.overtime,
      total: acc.total + d.earnings.total,
    }),
    {
      basicSalary: 0,
      hra: 0,
      dearnessAllowance: 0,
      specialAllowance: 0,
      bonus: 0,
      incentives: 0,
      overtime: 0,
      total: 0,
    }
  );

  const aggregatedDeductions: DeductionsBreakdown = rawDepts.reduce(
    (acc, d) => ({
      pf: acc.pf + d.deductions.pf,
      esi: acc.esi + d.deductions.esi,
      tds: acc.tds + d.deductions.tds,
      professionalTax: acc.professionalTax + d.deductions.professionalTax,
      otherDeductions: acc.otherDeductions + d.deductions.otherDeductions,
      total: acc.total + d.deductions.total,
    }),
    {
      pf: 0,
      esi: 0,
      tds: 0,
      professionalTax: 0,
      otherDeductions: 0,
      total: 0,
    }
  );

  const prevMonthGross = Math.round(totalGross / 1.042);
  const prevMonthNet = Math.round(totalNet / 1.039);
  const pendingCount = Math.max(1, Math.round(totalEmployeesCount * 0.024));
  const pendingAmount = Math.round((totalNet / Math.max(1, totalEmployeesCount)) * pendingCount);
  const failedRecords = Math.max(1, Math.round(totalEmployeesCount * 0.012));
  const processedRecords = Math.max(1, totalEmployeesCount - failedRecords);
  const errorPercent = Number(((failedRecords / Math.max(1, totalEmployeesCount)) * 100).toFixed(2));
  const accuracyPercent = Number((100 - errorPercent).toFixed(2));

  const kpis: PayrollTopKpis = {
    grossPayroll: {
      amount: totalGross,
      previousMonthAmount: prevMonthGross,
      changePercent: 4.2,
      trend: 'up',
    },
    netSalaryPaid: {
      amount: totalNet,
      previousMonthAmount: prevMonthNet,
      changePercent: 3.9,
      completionPercent: Number(
        (((totalEmployeesCount - pendingCount) / Math.max(1, totalEmployeesCount)) * 100).toFixed(1)
      ),
      disbursedCount: Math.max(1, totalEmployeesCount - pendingCount),
    },
    totalEmployees: {
      activeCount: totalEmployeesCount,
      newJoiners: Math.max(1, Math.round(totalEmployeesCount * 0.056)),
      exitedEmployees: Math.max(1, Math.round(totalEmployeesCount * 0.012)),
      changePercent: 4.4,
    },
    pendingPayroll: {
      pendingAmount,
      pendingEmployeeCount: pendingCount,
      processingStatus: pendingCount > 3 ? 'Bank Verification' : 'Final Audit',
    },
    totalDeductions: {
      ...aggregatedDeductions,
      changePercent: 3.1,
    },
    payrollAccuracy: {
      accuracyPercent,
      errorPercent,
      processedRecords,
      failedRecords,
    },
  };

  // Monthly, Daily, Yearly trends scaled to current filter scope
  const baseMonths = [
    { period: 'December 2025', shortLabel: 'Dec', factor: 0.86 },
    { period: 'January 2026', shortLabel: 'Jan', factor: 0.87 },
    { period: 'February 2026', shortLabel: 'Feb', factor: 0.88 },
    { period: 'March 2026', shortLabel: 'Mar', factor: 0.91 },
    { period: 'April 2026', shortLabel: 'Apr', factor: 0.93 },
    { period: 'May 2026', shortLabel: 'May', factor: 0.94 },
    { period: 'June 2026', shortLabel: 'Jun', factor: 0.95 },
    { period: 'July 2026', shortLabel: 'Jul', factor: 0.96 },
    { period: 'August 2026', shortLabel: 'Aug', factor: 0.97 },
    { period: 'September 2026', shortLabel: 'Sep', factor: 0.98 },
    { period: 'October 2026', shortLabel: 'Oct', factor: 0.96 },
    { period: 'November 2026', shortLabel: 'Nov', factor: 1.0 },
  ];

  const monthlyTrends: PayrollTrendPoint[] = baseMonths.map((m) => {
    const g = Math.round(totalGross * m.factor);
    const ded = Math.round(g * 0.19);
    const net = g - ded;
    const emp = Math.round(g * 0.072);
    return {
      period: m.period,
      shortLabel: m.shortLabel,
      grossPayroll: g,
      netPayroll: net,
      totalDeductions: ded,
      employerContributions: emp,
      prevYearGross: Math.round(g * 0.89),
      prevYearNet: Math.round(net * 0.89),
    };
  });

  const dailyTrends: PayrollTrendPoint[] = [
    { label: 'Nov 01', factor: 0.08 },
    { label: 'Nov 05', factor: 0.14 },
    { label: 'Nov 10', factor: 0.22 },
    { label: 'Nov 15', factor: 0.35 },
    { label: 'Nov 20', factor: 0.52 },
    { label: 'Nov 25', factor: 0.84 },
    { label: 'Nov 28', factor: 0.97 },
    { label: 'Nov 30', factor: 1.0 },
  ].map((d) => {
    const g = Math.round(totalGross * d.factor);
    const ded = Math.round(g * 0.19);
    const net = g - ded;
    return {
      period: `${d.label}, 2026 (Cumulative Run)`,
      shortLabel: d.label,
      grossPayroll: g,
      netPayroll: net,
      totalDeductions: ded,
      employerContributions: Math.round(g * 0.072),
      prevYearGross: Math.round(g * 0.9),
      prevYearNet: Math.round(net * 0.9),
    };
  });

  const yearlyTrends: PayrollTrendPoint[] = [
    { period: 'FY 2022-23', shortLabel: 'FY23', factor: 8.4 },
    { period: 'FY 2023-24', shortLabel: 'FY24', factor: 9.6 },
    { period: 'FY 2024-25', shortLabel: 'FY25', factor: 10.5 },
    { period: 'FY 2025-26', shortLabel: 'FY26', factor: 11.3 },
    { period: 'FY 2026-27 (Projected)', shortLabel: 'FY27', factor: 12.0 },
  ].map((y) => {
    const g = Math.round(totalGross * y.factor);
    const ded = Math.round(g * 0.19);
    const net = g - ded;
    return {
      period: y.period,
      shortLabel: y.shortLabel,
      grossPayroll: g,
      netPayroll: net,
      totalDeductions: ded,
      employerContributions: Math.round(g * 0.072),
      prevYearGross: Math.round(g * 0.91),
      prevYearNet: Math.round(net * 0.91),
    };
  });

  // Salary Distribution Analytics
  const overallAvgSalary =
    totalEmployeesCount > 0 ? Math.round(totalGross / totalEmployeesCount) : 0;
  const overallMedianSalary = Math.round(overallAvgSalary * 0.94);
  const highestSalary =
    departmentBreakdown.length > 0
      ? Math.max(...departmentBreakdown.map((d) => d.highestSalary))
      : 0;
  const lowestSalary =
    departmentBreakdown.length > 0
      ? Math.min(...departmentBreakdown.map((d) => d.lowestSalary))
      : 0;

  const bandShares = [
    { rangeLabel: '$2.5k – $4.0k / mo', minK: 30, maxK: 48, share: 0.14, avg: 3450 },
    { rangeLabel: '$4.0k – $6.0k / mo', minK: 48, maxK: 72, share: 0.29, avg: 5120 },
    { rangeLabel: '$6.0k – $8.5k / mo', minK: 72, maxK: 102, share: 0.31, avg: 7240 },
    { rangeLabel: '$8.5k – $11.5k / mo', minK: 102, maxK: 138, share: 0.16, avg: 9850 },
    { rangeLabel: '$11.5k – $14.5k / mo', minK: 138, maxK: 174, share: 0.07, avg: 12900 },
    { rangeLabel: '$14.5k+ / mo', minK: 174, maxK: 220, share: 0.03, avg: 15800 },
  ];

  const salaryBands: SalaryBandBucket[] = bandShares.map((b) => {
    const count = Math.max(1, Math.round(totalEmployeesCount * b.share));
    return {
      rangeLabel: b.rangeLabel,
      minK: b.minK,
      maxK: b.maxK,
      employeeCount: count,
      percentage: Math.round(b.share * 100),
      avgSalaryInBand: Math.round(b.avg * fyFactor),
    };
  });

  const byDesignation: DesignationSalaryMetric[] = [
    {
      designationLevel: 'Executive & VP (L7–L8)',
      roleExamples: 'VP Engineering, VP Sales, CFO',
      employeeCount: Math.max(1, Math.round(totalEmployeesCount * 0.04)),
      averageSalary: Math.round(14800 * fyFactor),
      medianSalary: Math.round(14200 * fyFactor),
      minSalary: Math.round(12500 * fyFactor),
      maxSalary: Math.round(16500 * fyFactor),
    },
    {
      designationLevel: 'Director & Principal (L6)',
      roleExamples: 'Principal Architect, Director of Ops',
      employeeCount: Math.max(1, Math.round(totalEmployeesCount * 0.10)),
      averageSalary: Math.round(11200 * fyFactor),
      medianSalary: Math.round(10900 * fyFactor),
      minSalary: Math.round(9400 * fyFactor),
      maxSalary: Math.round(13200 * fyFactor),
    },
    {
      designationLevel: 'Senior & Lead (L5)',
      roleExamples: 'Staff Engineer, Senior Finance Manager',
      employeeCount: Math.max(1, Math.round(totalEmployeesCount * 0.28)),
      averageSalary: Math.round(8350 * fyFactor),
      medianSalary: Math.round(8100 * fyFactor),
      minSalary: Math.round(6900 * fyFactor),
      maxSalary: Math.round(9800 * fyFactor),
    },
    {
      designationLevel: 'Mid-Level Specialist (L3–L4)',
      roleExamples: 'Product Engineer II, Account Executive',
      employeeCount: Math.max(1, Math.round(totalEmployeesCount * 0.38)),
      averageSalary: Math.round(5900 * fyFactor),
      medianSalary: Math.round(5750 * fyFactor),
      minSalary: Math.round(4600 * fyFactor),
      maxSalary: Math.round(7100 * fyFactor),
    },
    {
      designationLevel: 'Associate & Junior (L1–L2)',
      roleExamples: 'Junior Analyst, Operations Coordinator',
      employeeCount: Math.max(1, Math.round(totalEmployeesCount * 0.20)),
      averageSalary: Math.round(3750 * fyFactor),
      medianSalary: Math.round(3600 * fyFactor),
      minSalary: Math.round(2900 * fyFactor),
      maxSalary: Math.round(4500 * fyFactor),
    },
  ];

  // Variance Analysis (MoM and YoY)
  const momGrossDelta = totalGross - prevMonthGross;
  const momNetDelta = totalNet - prevMonthNet;
  const prevDeductions = Math.round(aggregatedDeductions.total / 1.031);
  const prevOvertime = Math.round(aggregatedEarnings.overtime / 1.084);
  const prevBonus = Math.round(aggregatedEarnings.bonus / 1.112);

  const yoyPrevGross = Math.round(totalGross * 0.885);
  const yoyPrevNet = Math.round(totalNet * 0.882);
  const yoyPrevDed = Math.round(aggregatedDeductions.total * 0.895);
  const yoyPrevOvertime = Math.round(aggregatedEarnings.overtime * 0.92);
  const yoyPrevBonus = Math.round(aggregatedEarnings.bonus * 0.85);

  const varianceAnalysis: PayrollVarianceSection = {
    monthOverMonth: {
      grossVariance: {
        label: 'Gross Payroll Variance',
        currentValue: totalGross,
        previousValue: prevMonthGross,
        deltaAmount: momGrossDelta,
        deltaPercent: 4.2,
      },
      netVariance: {
        label: 'Net Payroll Variance',
        currentValue: totalNet,
        previousValue: prevMonthNet,
        deltaAmount: momNetDelta,
        deltaPercent: 3.9,
      },
      deductionVariance: {
        label: 'Deduction Variance',
        currentValue: aggregatedDeductions.total,
        previousValue: prevDeductions,
        deltaAmount: aggregatedDeductions.total - prevDeductions,
        deltaPercent: 3.1,
      },
      overtimeVariance: {
        label: 'Overtime Variance',
        currentValue: aggregatedEarnings.overtime,
        previousValue: prevOvertime,
        deltaAmount: aggregatedEarnings.overtime - prevOvertime,
        deltaPercent: 8.4,
      },
      bonusVariance: {
        label: 'Bonus Variance',
        currentValue: aggregatedEarnings.bonus,
        previousValue: prevBonus,
        deltaAmount: aggregatedEarnings.bonus - prevBonus,
        deltaPercent: 11.2,
      },
      drivers: [
        {
          id: 'DRV-1',
          driver: 'New Employee Joining',
          affectedEmployees: kpis.totalEmployees.newJoiners,
          costImpact: Math.round(momGrossDelta * 0.62),
          impactPercent: 2.6,
          description: 'Lateral engineering and enterprise sales hires onboarded in current cycle',
        },
        {
          id: 'DRV-2',
          driver: 'Employee Exits',
          affectedEmployees: kpis.totalEmployees.exitedEmployees,
          costImpact: -Math.round(momGrossDelta * 0.24),
          impactPercent: -1.0,
          description: 'Full & final settlements completed for departing staff',
        },
        {
          id: 'DRV-3',
          driver: 'Salary Revisions',
          affectedEmployees: Math.max(2, Math.round(totalEmployeesCount * 0.07)),
          costImpact: Math.round(momGrossDelta * 0.28),
          impactPercent: 1.2,
          description: 'Mid-year market parity adjustments & retention increments',
        },
        {
          id: 'DRV-4',
          driver: 'Promotions',
          affectedEmployees: Math.max(1, Math.round(totalEmployeesCount * 0.035)),
          costImpact: Math.round(momGrossDelta * 0.14),
          impactPercent: 0.6,
          description: 'L4 to L5 role elevations across Product Engineering and Finance',
        },
        {
          id: 'DRV-5',
          driver: 'Bonus Payments',
          affectedEmployees: Math.max(3, Math.round(totalEmployeesCount * 0.18)),
          costImpact: Math.round(momGrossDelta * 0.13),
          impactPercent: 0.5,
          description: 'Quarterly sales quota accelerator & festive performance payouts',
        },
        {
          id: 'DRV-6',
          driver: 'Overtime Changes',
          affectedEmployees: Math.max(2, Math.round(totalEmployeesCount * 0.09)),
          costImpact: Math.round(momGrossDelta * 0.07),
          impactPercent: 0.3,
          description: 'Deployment window shift allowances in Operations & Infrastructure',
        },
      ],
    },
    yearOverYear: {
      grossVariance: {
        label: 'Gross Payroll Variance (YoY)',
        currentValue: totalGross,
        previousValue: yoyPrevGross,
        deltaAmount: totalGross - yoyPrevGross,
        deltaPercent: 13.0,
      },
      netVariance: {
        label: 'Net Payroll Variance (YoY)',
        currentValue: totalNet,
        previousValue: yoyPrevNet,
        deltaAmount: totalNet - yoyPrevNet,
        deltaPercent: 13.4,
      },
      deductionVariance: {
        label: 'Deduction Variance (YoY)',
        currentValue: aggregatedDeductions.total,
        previousValue: yoyPrevDed,
        deltaAmount: aggregatedDeductions.total - yoyPrevDed,
        deltaPercent: 11.7,
      },
      overtimeVariance: {
        label: 'Overtime Variance (YoY)',
        currentValue: aggregatedEarnings.overtime,
        previousValue: yoyPrevOvertime,
        deltaAmount: aggregatedEarnings.overtime - yoyPrevOvertime,
        deltaPercent: 8.7,
      },
      bonusVariance: {
        label: 'Bonus Variance (YoY)',
        currentValue: aggregatedEarnings.bonus,
        previousValue: yoyPrevBonus,
        deltaAmount: aggregatedEarnings.bonus - yoyPrevBonus,
        deltaPercent: 17.6,
      },
      drivers: [
        {
          id: 'YOY-1',
          driver: 'New Employee Joining',
          affectedEmployees: Math.max(8, Math.round(totalEmployeesCount * 0.22)),
          costImpact: Math.round((totalGross - yoyPrevGross) * 0.58),
          impactPercent: 7.5,
          description: 'Annual headcount expansion across Bengaluru HQ & Hyderabad Tech Center',
        },
        {
          id: 'YOY-2',
          driver: 'Employee Exits',
          affectedEmployees: Math.max(3, Math.round(totalEmployeesCount * 0.08)),
          costImpact: -Math.round((totalGross - yoyPrevGross) * 0.19),
          impactPercent: -2.5,
          description: 'Natural attrition and role consolidation savings over 12 months',
        },
        {
          id: 'YOY-3',
          driver: 'Salary Revisions',
          affectedEmployees: Math.max(10, Math.round(totalEmployeesCount * 0.78)),
          costImpact: Math.round((totalGross - yoyPrevGross) * 0.34),
          impactPercent: 4.4,
          description: 'Annual appraisal cycle merit increments (8.6% average band hike)',
        },
        {
          id: 'YOY-4',
          driver: 'Promotions',
          affectedEmployees: Math.max(4, Math.round(totalEmployeesCount * 0.12)),
          costImpact: Math.round((totalGross - yoyPrevGross) * 0.12),
          impactPercent: 1.6,
          description: 'Annual career progression elevations across all 7 departments',
        },
        {
          id: 'YOY-5',
          driver: 'Bonus Payments',
          affectedEmployees: Math.max(6, Math.round(totalEmployeesCount * 0.45)),
          costImpact: Math.round((totalGross - yoyPrevGross) * 0.10),
          impactPercent: 1.3,
          description: 'Annual variable pay & leadership milestone bonuses',
        },
        {
          id: 'YOY-6',
          driver: 'Overtime Changes',
          affectedEmployees: Math.max(3, Math.round(totalEmployeesCount * 0.14)),
          costImpact: Math.round((totalGross - yoyPrevGross) * 0.05),
          impactPercent: 0.7,
          description: '24/7 global customer reliability shift coverage expansion',
        },
      ],
    },
  };

  const defaultAnomalies: PayrollAnomalyItem[] = [
    {
      id: 'ANM-2026-01',
      employeeId: 'EMP-3614',
      employeeName: 'Rohan Deshmukh',
      department: 'Engineering',
      category: 'Unusual Salary Increase',
      severity: 'High',
      financialImpact: 3450,
      detectedAt: '2026-11-04 08:15 AM',
      description:
        'Gross payout increased by +41.2% vs October due to retroactive L6 promotion arrear bundled with special allowance.',
      status: 'Open',
    },
    {
      id: 'ANM-2026-02',
      employeeId: 'EMP-3629',
      employeeName: 'Meera Nair',
      department: 'Sales',
      category: 'Duplicate Payroll Entry',
      severity: 'Critical',
      financialImpact: 1850,
      detectedAt: '2026-11-04 07:50 AM',
      description:
        'Q3 enterprise commission voucher #COM-884 appears in both regular incentive line and manual adjustment.',
      status: 'Investigating',
    },
    {
      id: 'ANM-2026-03',
      employeeId: 'EMP-3641',
      employeeName: 'Kabir Malhotra',
      department: 'Operations',
      category: 'Bank Validation Failure',
      severity: 'Critical',
      financialImpact: 5200,
      detectedAt: '2026-11-03 06:20 PM',
      description:
        'NEFT/ACH pre-note rejected by beneficiary bank (IFSC/Routing mismatch following branch merger).',
      status: 'Open',
    },
    {
      id: 'ANM-2026-04',
      employeeId: 'EMP-3652',
      employeeName: 'Ananya Verma',
      department: 'Marketing',
      category: 'Missing Salary Component',
      severity: 'Medium',
      financialImpact: 920,
      detectedAt: '2026-11-03 04:10 PM',
      description:
        'HRA exemption component missing for November joinee; tax engine defaulted to non-exempt slab.',
      status: 'Open',
    },
    {
      id: 'ANM-2026-05',
      employeeId: 'EMP-3608',
      employeeName: 'Siddharth Joshi',
      department: 'Finance',
      category: 'Calculation Discrepancy',
      severity: 'Medium',
      financialImpact: 410,
      detectedAt: '2026-11-02 05:45 PM',
      description:
        'Statutory PF ceiling prorated on 28 days instead of 30 calendar days after unpaid leave regularization.',
      status: 'Resolved',
    },
  ];

  const anomalies = (customAnomalies || defaultAnomalies).filter(
    (a) => filters.department === 'All Departments' || a.department === filters.department
  );

  const defaultComplianceAlerts: ComplianceAlertItem[] = [
    {
      id: 'CMP-PF-11',
      statutoryBody: 'EPFO (PF)',
      obligationTitle: 'Monthly Provident Fund ECR & Employer Contribution',
      dueDate: 'Nov 15, 2026',
      amountDue: Math.round(aggregatedDeductions.pf * 2),
      status: 'Challan Generated',
      challanRef: 'TRRN-202611-99481',
      coveredEmployees: totalEmployeesCount,
    },
    {
      id: 'CMP-TDS-11',
      statutoryBody: 'Income Tax (TDS)',
      obligationTitle: 'Section 192 Salary TDS Remittance (ITNS 281)',
      dueDate: 'Nov 07, 2026',
      amountDue: aggregatedDeductions.tds,
      status: 'Due Soon',
      challanRef: 'CIN-2611-44019',
      coveredEmployees: Math.max(1, Math.round(totalEmployeesCount * 0.88)),
    },
    {
      id: 'CMP-ESI-11',
      statutoryBody: 'ESIC (ESI)',
      obligationTitle: 'Employee State Insurance Contribution Filing',
      dueDate: 'Nov 15, 2026',
      amountDue: aggregatedDeductions.esi,
      status: 'Paid & Filed',
      challanRef: 'ESIC-88371029',
      coveredEmployees: Math.max(1, Math.round(totalEmployeesCount * 0.32)),
    },
    {
      id: 'CMP-PT-11',
      statutoryBody: 'State PT',
      obligationTitle: 'Multi-State Professional Tax Returns (KA, MH, TS, DL)',
      dueDate: 'Nov 20, 2026',
      amountDue: aggregatedDeductions.professionalTax,
      status: 'Pending Remittance',
      challanRef: 'PT-REG-2026-11',
      coveredEmployees: totalEmployeesCount,
    },
    {
      id: 'CMP-LWF-11',
      statutoryBody: 'LWF & Gratuity',
      obligationTitle: 'Half-Yearly Labour Welfare Fund & Gratuity Trust Accrual',
      dueDate: 'Nov 30, 2026',
      amountDue: Math.round(totalEmployerContrib * 0.18),
      status: 'Paid & Filed',
      challanRef: 'LWF-2026-H2-77',
      coveredEmployees: totalEmployeesCount,
    },
  ];

  const complianceAlerts = customCompliance || defaultComplianceAlerts;

  // Dynamic AI Payroll Intelligence grounded strictly in computed backend data
  const topDept = [...departmentBreakdown].sort((a, b) => b.grossCost - a.grossCost)[0];
  const openAnomaliesCount = anomalies.filter((a) => a.status !== 'Resolved').length;
  const openAnomaliesValue = anomalies
    .filter((a) => a.status !== 'Resolved')
    .reduce((acc, a) => acc + a.financialImpact, 0);
  const nextMonthForecast = Math.round(totalGross * 1.028);

  const aiInsights: AiPayrollInsightItem[] = [
    {
      id: 'AI-INS-1',
      category: 'Cost Prediction',
      title: 'December 2026 Gross Payroll Outflow Forecast',
      finding: `Based on ${totalEmployeesCount} active employees and ${kpis.totalEmployees.newJoiners} pipeline joiners, December gross expenditure is projected at ${formatCurrencyUSD(nextMonthForecast)} (+2.8% MoM).`,
      quantifiedImpact: `${formatCurrencyUSD(nextMonthForecast - totalGross)} projected incremental spend`,
      confidenceScore: 96,
      recommendedAction: 'Reserve treasury liquidity before Dec 24 payout cut-off.',
    },
    {
      id: 'AI-INS-2',
      category: 'Anomaly Detection',
      title: `${openAnomaliesCount} Active Pre-Disbursement Variance Exceptions`,
      finding: `Automated pre-payroll audit flagged ${openAnomaliesCount} unresolved anomalies totaling ${formatCurrencyUSD(openAnomaliesValue)} across duplicate incentives and bank routing mismatches.`,
      quantifiedImpact: `${formatCurrencyUSD(openAnomaliesValue)} prevented leakage`,
      confidenceScore: 99,
      recommendedAction: 'Clear EMP-3629 duplicate commission voucher before final bank batch lock.',
    },
    {
      id: 'AI-INS-3',
      category: 'Department Spending',
      title: `${topDept?.department || 'Engineering'} Drives ${topDept?.payrollPercentage || 45}% of Total Payroll Cost`,
      finding: `${topDept?.department || 'Engineering'} (${topDept?.employeeCount || 96} staff) represents ${formatCurrencyUSD(topDept?.grossCost || 0)} gross expenditure with a +${topDept?.momChangePercent || 4.8}% MoM expansion.`,
      quantifiedImpact: `Avg salary ${formatCurrencyUSD(topDept?.averageSalary || 0)} / employee`,
      confidenceScore: 98,
      recommendedAction: 'Review L5–L6 band utilization against Q3 product delivery velocity.',
    },
    {
      id: 'AI-INS-4',
      category: 'Expense Optimization',
      title: 'Overtime Shift Rebalancing Opportunity',
      finding: `Overtime expenditure reached ${formatCurrencyUSD(aggregatedEarnings.overtime)} (+8.4% MoM). Converting 4 high-frequency overtime contractors to staggered general shifts reduces overtime outlay by 22%.`,
      quantifiedImpact: `${formatCurrencyUSD(Math.round(aggregatedEarnings.overtime * 0.22))} / mo savings`,
      confidenceScore: 92,
      recommendedAction: 'Align Operations & Engineering release rosters to reduce weekend overtime.',
    },
    {
      id: 'AI-INS-5',
      category: 'Variance Explanation',
      title: 'Net-to-Gross Retention Ratio & Tax Slab Drift',
      finding: `Net take-home pay represents ${((totalNet / Math.max(1, totalGross)) * 100).toFixed(1)}% of Gross Payroll, while TDS withholdings stand at ${formatCurrencyUSD(aggregatedDeductions.tds)} (${((aggregatedDeductions.tds / Math.max(1, totalGross)) * 100).toFixed(1)}%).`,
      quantifiedImpact: `100% statutory formula reconciliation`,
      confidenceScore: 97,
      recommendedAction: 'Notify 18 employees with unverified Section 80C/HRA proofs before Nov 20.',
    },
    {
      id: 'AI-INS-6',
      category: 'Predictive Financial',
      title: 'FY 2026-27 Year-End Statutory & Gratuity Liability',
      finding: `Employer statutory contributions (${formatCurrencyUSD(totalEmployerContrib)}/mo) are tracking 1.4% below budgeted ceiling due to higher intern & consultant mix.`,
      quantifiedImpact: `${formatCurrencyUSD(Math.round(totalEmployerContrib * 0.16))} Q4 buffer`,
      confidenceScore: 94,
      recommendedAction: 'Maintain current PF & Gratuity trust escrow schedule.',
    },
  ];

  // Recent Payroll Activity Table
  const recentActivity: PayrollActivityRecord[] = DEPARTMENT_SPECS.map((spec, idx) => {
    const deptMetric =
      departmentBreakdown.find((d) => d.department === spec.department) || {
        department: spec.department,
        employeeCount: Math.max(1, Math.round(spec.baseHeadcount * scale)),
        grossCost: Math.round(spec.baseHeadcount * spec.baseAvgGross * scale),
        netCost: Math.round(spec.baseHeadcount * spec.baseAvgGross * scale * 0.81),
        deductions: computeDeductionsFromGross(
          Math.round(spec.baseHeadcount * spec.baseAvgGross * scale)
        ),
        earnings: computeEarningsFromGross(
          Math.round(spec.baseHeadcount * spec.baseAvgGross * scale)
        ),
        employerContribution: Math.round(
          spec.baseHeadcount * spec.baseAvgGross * scale * 0.072
        ),
      };

    const statuses: PayrollActivityRecord['status'][] = [
      'Disbursed',
      'Completed',
      'Disbursed',
      'Pending Approval',
      'Completed',
      'Validation Warning',
      'Disbursed',
    ];

    return {
      payrollId: `PR-2026-${1101 + idx}`,
      payrollMonth: filters.month === 'All Months' ? 'November 2026' : filters.month,
      financialYear: filters.financialYear,
      department: spec.department,
      location: spec.primaryLocation,
      employmentType: spec.primaryEmpType,
      employeesProcessed: deptMetric.employeeCount,
      grossPayroll: deptMetric.grossCost,
      netPayroll: deptMetric.netCost,
      totalDeductions: deptMetric.deductions.total,
      employerContributions: deptMetric.employerContribution,
      status: statuses[idx % statuses.length],
      processedDate: `2026-11-0${Math.max(1, 4 - (idx % 4))}`,
      processedBy: idx % 2 === 0 ? 'Aarav Sharma (HR Admin)' : 'Devendra Patel (Finance Admin)',
      earningsBreakdown: deptMetric.earnings,
      deductionsBreakdown: deptMetric.deductions,
    };
  }).filter(
    (row) => filters.department === 'All Departments' || row.department === filters.department
  );

  // Add previous month historical batches so pagination & sorting have rich multi-month records
  const octoberBatches: PayrollActivityRecord[] = DEPARTMENT_SPECS.slice(0, 4)
    .map((spec, idx) => {
      const g = Math.round(spec.baseHeadcount * spec.baseAvgGross * scale * 0.96);
      const ded = computeDeductionsFromGross(g);
      const earn = computeEarningsFromGross(g);
      return {
        payrollId: `PR-2026-${1001 + idx}`,
        payrollMonth: 'October 2026',
        financialYear: filters.financialYear,
        department: spec.department,
        location: spec.primaryLocation,
        employmentType: spec.primaryEmpType,
        employeesProcessed: Math.max(1, Math.round(spec.baseHeadcount * locationFactor * empTypeFactor)),
        grossPayroll: g,
        netPayroll: g - ded.total,
        totalDeductions: ded.total,
        employerContributions: Math.round(g * 0.072),
        status: 'Disbursed' as const,
        processedDate: '2026-10-29',
        processedBy: 'Devendra Patel (Finance Admin)',
        earningsBreakdown: earn,
        deductionsBreakdown: ded,
      };
    })
    .filter(
      (row) => filters.department === 'All Departments' || row.department === filters.department
    );

  return {
    filters,
    lastUpdated: new Date().toISOString(),
    kpis,
    trends: {
      monthly: monthlyTrends,
      daily: dailyTrends,
      yearly: yearlyTrends,
    },
    salaryDistribution: {
      averageSalary: overallAvgSalary,
      medianSalary: overallMedianSalary,
      highestSalary,
      lowestSalary,
      salaryBands,
      byDepartment: departmentBreakdown,
      byDesignation,
    },
    earningsVsDeductions: {
      earnings: aggregatedEarnings,
      deductions: aggregatedDeductions,
      employerContributions: totalEmployerContrib,
      netPayable: totalNet,
    },
    departmentBreakdown,
    varianceAnalysis,
    anomalies,
    complianceAlerts,
    aiInsights,
    recentActivity: [...recentActivity, ...octoberBatches],
  };
}
