import { LeaveBalanceItem } from './employee-portal-logic';

export type ExecutiveLens = 'all' | 'ceo' | 'cfo' | 'coo' | 'cto';
export type ExecutiveBottomTab = 'home' | 'workforce' | 'finance' | 'approvals' | 'more';
export type ExecutiveHomeSubTab = 'overview' | 'workforce' | 'finance' | 'ai_insights';
export type ExecutiveMoreModuleId =
  | 'board_reports'
  | 'announcements'
  | 'scorecards'
  | 'compliance'
  | 'self_service'
  | 'profile';

export type ExecutiveApprovalCategory =
  | 'Payroll Batch'
  | 'Senior Offer'
  | 'Budget & Expense'
  | 'Compliance & Exit';

export type ExecutiveApprovalStatus = 'Pending' | 'Approved' | 'On Hold';

export interface ExecutiveApprovalItem {
  id: string;
  referenceCode: string;
  title: string;
  category: ExecutiveApprovalCategory;
  requestedBy: string;
  department: string;
  amountLabel: string;
  amountInr: number;
  priority: 'Critical' | 'High' | 'Normal';
  submittedAt: string;
  lensOwner: Exclude<ExecutiveLens, 'all'>;
  rationale: string;
  status: ExecutiveApprovalStatus;
  decisionNote?: string;
  decidedAt?: string;
}

export interface ExecutiveDepartmentMetric {
  id: string;
  department: string;
  leadName: string;
  headcount: number;
  fullTimeCount: number;
  contractCount: number;
  internCount: number;
  primaryLocation: 'Bengaluru HQ' | 'Mumbai' | 'Hyderabad' | 'Remote';
  attendanceRatePct: number;
  utilizationPct: number;
  overtimeHours: number;
  overtimeCostInr: number;
  monthlyPayrollSpendInr: number;
  monthlyBudgetInr: number;
  openRolesCount: number;
  annualizedAttritionPct: number;
  avgTimeToHireDays: number;
  flightRiskCount: number;
  healthScore: number;
  healthStatus: 'Healthy' | 'Watch' | 'Action Needed';
}

export interface ExecutiveHiringStage {
  id: string;
  stage: string;
  count: number;
  conversionPct: number;
}

export interface ExecutiveAttritionReason {
  id: string;
  reason: string;
  sharePct: number;
  count: number;
  type: 'Voluntary' | 'Involuntary';
}

export interface ExecutiveAiBriefItem {
  id: string;
  lens: Exclude<ExecutiveLens, 'all'>;
  title: string;
  summary: string;
  metricBadge: string;
  severity: 'Critical' | 'Watch' | 'Positive';
  targetTab: ExecutiveHomeSubTab | 'approvals';
}

export interface ExecutiveFlightRiskAlert {
  id: string;
  department: string;
  segmentLabel: string;
  riskScorePct: number;
  impactedCount: number;
  driver: string;
  recommendedAction: string;
  severity: 'High' | 'Medium';
}

export interface ExecutiveAnomalyAlert {
  id: string;
  title: string;
  department: string;
  detectedMetric: string;
  baselineMetric: string;
  detectedAt: string;
  category: 'Overtime' | 'Attendance' | 'Productivity';
}

export interface ExecutivePayrollCycleSummary {
  cycleLabel: string;
  status: 'Awaiting Executive Sign-Off' | 'Approved for Bank Release' | 'On Hold';
  grossPayInr: number;
  statutoryDeductionsInr: number;
  netPayoutInr: number;
  reimbursementsInr: number;
  overtimeSpendInr: number;
  totalBudgetInr: number;
  prevMonthCostPerEmpInr: number;
  costPerEmpTrend: { month: string; costPerEmpInr: number; overtimeLakhs: number }[];
}

export interface ExecutiveBoardReportItem {
  id: 'board_pack' | 'payroll_summary' | 'headcount_attrition' | 'compliance_status';
  title: string;
  subtitle: string;
  formatLabel: string;
  lastGenerated: string;
  ownerLens: Exclude<ExecutiveLens, 'all'>;
}

export interface ExecutiveAnnouncementItem {
  id: string;
  title: string;
  body: string;
  audience: 'All Employees' | 'People Managers' | 'Engineering & Product';
  priority: 'Town Hall' | 'Important' | 'Standard';
  publishedBy: string;
  publishedAt: string;
}

export interface ExecutiveComplianceItem {
  id: string;
  domain: string;
  status: 'Compliant' | 'Review Due';
  scorePct: number;
  lastAudited: string;
  owner: string;
  note: string;
}

export interface ExecutiveNotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'Payroll' | 'Talent' | 'AI Brief' | 'Governance';
  timestamp: string;
  read: boolean;
}

export interface ExecutiveCopilotMessage {
  id: string;
  query: string;
  answer: string;
  highlights: string[];
  timestamp: string;
}

export interface ExecutiveProfileData {
  executiveId: string;
  fullName: string;
  email: string;
  designation: string;
  phone: string;
  location: string;
  avatarInitials: string;
}

export interface ExecutiveSelfServiceState {
  todayStatus: 'Checked In' | 'Not Checked In';
  punchInTime: string;
  shiftName: string;
  leaveBalances: LeaveBalanceItem[];
  leaveRequests: {
    id: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    days: number;
    status: 'Approved' | 'Pending';
    reason: string;
  }[];
  latestNetSalaryInr: number;
  payslips: {
    id: string;
    monthLabel: string;
    grossInr: number;
    deductionsInr: number;
    netInr: number;
    status: 'Credited' | 'Processed';
  }[];
}

export interface ExecutivePortalState {
  profile: ExecutiveProfileData;
  activeLens: ExecutiveLens;
  departments: ExecutiveDepartmentMetric[];
  hiringFunnel: ExecutiveHiringStage[];
  attritionReasons: ExecutiveAttritionReason[];
  voluntaryExitPct: number;
  involuntaryExitPct: number;
  payrollCycle: ExecutivePayrollCycleSummary;
  approvals: ExecutiveApprovalItem[];
  aiBriefs: ExecutiveAiBriefItem[];
  flightRisks: ExecutiveFlightRiskAlert[];
  anomalies: ExecutiveAnomalyAlert[];
  boardReports: ExecutiveBoardReportItem[];
  announcements: ExecutiveAnnouncementItem[];
  complianceItems: ExecutiveComplianceItem[];
  notifications: ExecutiveNotificationItem[];
  copilotHistory: ExecutiveCopilotMessage[];
  selfService: ExecutiveSelfServiceState;
}

export const EXECUTIVE_LENS_OPTIONS: {
  id: ExecutiveLens;
  label: string;
  shortLabel: string;
  title: string;
}[] = [
  { id: 'all', label: 'All / CEO', shortLabel: 'CEO', title: 'Enterprise Command' },
  { id: 'cfo', label: 'CFO', shortLabel: 'CFO', title: 'Payroll & Margin' },
  { id: 'coo', label: 'COO', shortLabel: 'COO', title: 'Ops & Utilization' },
  { id: 'cto', label: 'CTO', shortLabel: 'CTO', title: 'Eng & AI Velocity' },
];

export function formatInrCompact(amountInr: number): string {
  const abs = Math.abs(amountInr);
  const sign = amountInr < 0 ? '-' : '';
  if (abs >= 10000000) {
    return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    return `${sign}₹${(abs / 100000).toFixed(1)} L`;
  }
  return `${sign}₹${Math.round(abs).toLocaleString('en-IN')}`;
}

export function getExecutivePortalStorageKey(executiveId: string): string {
  const cleanId = (executiveId || 'EXC-101').trim().toUpperCase();
  return `ofc360_executive_portal_state_v1_${cleanId}`;
}

export function createInitialExecutivePortalState(identity?: {
  executiveId?: string;
  fullName?: string;
  email?: string;
}): ExecutivePortalState {
  const executiveId = (identity?.executiveId || 'EXC-101').trim().toUpperCase();
  const fullName = identity?.fullName || 'Siddharth Malhotra';
  const email = identity?.email || 'executive@ofc360.com';
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('') || 'SM';

  const initialLens: ExecutiveLens = email.includes('cfo')
    ? 'cfo'
    : email.includes('coo')
      ? 'coo'
      : email.includes('cto')
        ? 'cto'
        : 'all';

  const designation =
    initialLens === 'cfo'
      ? 'Chief Financial Officer'
      : initialLens === 'coo'
        ? 'Chief Operating Officer'
        : initialLens === 'cto'
          ? 'Chief Technology Officer'
          : 'Chief Executive Officer';

  return {
    profile: {
      executiveId,
      fullName,
      email,
      designation,
      phone: '+91 98201 88001',
      location: 'Bengaluru HQ · Executive Wing',
      avatarInitials: initials,
    },
    activeLens: initialLens,
    departments: [
      {
        id: 'DEPT-ENG',
        department: 'Engineering',
        leadName: 'Nandini Bose',
        headcount: 168,
        fullTimeCount: 146,
        contractCount: 14,
        internCount: 8,
        primaryLocation: 'Bengaluru HQ',
        attendanceRatePct: 95,
        utilizationPct: 92,
        overtimeHours: 642,
        overtimeCostInr: 720000,
        monthlyPayrollSpendInr: 23800000,
        monthlyBudgetInr: 23200000,
        openRolesCount: 7,
        annualizedAttritionPct: 11.4,
        avgTimeToHireDays: 31,
        flightRiskCount: 5,
        healthScore: 88,
        healthStatus: 'Watch',
      },
      {
        id: 'DEPT-PRD',
        department: 'Product & Design',
        leadName: 'Rhea Kapoor',
        headcount: 48,
        fullTimeCount: 44,
        contractCount: 2,
        internCount: 2,
        primaryLocation: 'Bengaluru HQ',
        attendanceRatePct: 96,
        utilizationPct: 90,
        overtimeHours: 118,
        overtimeCostInr: 135000,
        monthlyPayrollSpendInr: 6850000,
        monthlyBudgetInr: 7100000,
        openRolesCount: 2,
        annualizedAttritionPct: 6.2,
        avgTimeToHireDays: 27,
        flightRiskCount: 1,
        healthScore: 94,
        healthStatus: 'Healthy',
      },
      {
        id: 'DEPT-SLS',
        department: 'Sales & Growth',
        leadName: 'Kabir Ahluwalia',
        headcount: 86,
        fullTimeCount: 78,
        contractCount: 6,
        internCount: 2,
        primaryLocation: 'Mumbai',
        attendanceRatePct: 92,
        utilizationPct: 87,
        overtimeHours: 290,
        overtimeCostInr: 245000,
        monthlyPayrollSpendInr: 9840000,
        monthlyBudgetInr: 9600000,
        openRolesCount: 5,
        annualizedAttritionPct: 14.8,
        avgTimeToHireDays: 24,
        flightRiskCount: 4,
        healthScore: 79,
        healthStatus: 'Action Needed',
      },
      {
        id: 'DEPT-CS',
        department: 'Customer Success',
        leadName: 'Divya Krishnan',
        headcount: 64,
        fullTimeCount: 58,
        contractCount: 4,
        internCount: 2,
        primaryLocation: 'Hyderabad',
        attendanceRatePct: 94,
        utilizationPct: 89,
        overtimeHours: 210,
        overtimeCostInr: 175000,
        monthlyPayrollSpendInr: 5120000,
        monthlyBudgetInr: 5300000,
        openRolesCount: 2,
        annualizedAttritionPct: 9.1,
        avgTimeToHireDays: 21,
        flightRiskCount: 2,
        healthScore: 91,
        healthStatus: 'Healthy',
      },
      {
        id: 'DEPT-OPS',
        department: 'Operations & IT',
        leadName: 'Vikram Deshpande',
        headcount: 42,
        fullTimeCount: 36,
        contractCount: 5,
        internCount: 1,
        primaryLocation: 'Hyderabad',
        attendanceRatePct: 96,
        utilizationPct: 93,
        overtimeHours: 164,
        overtimeCostInr: 140000,
        monthlyPayrollSpendInr: 3940000,
        monthlyBudgetInr: 4100000,
        openRolesCount: 1,
        annualizedAttritionPct: 5.5,
        avgTimeToHireDays: 19,
        flightRiskCount: 0,
        healthScore: 95,
        healthStatus: 'Healthy',
      },
      {
        id: 'DEPT-FIN',
        department: 'Finance & Legal',
        leadName: 'Meera Subramanian',
        headcount: 26,
        fullTimeCount: 25,
        contractCount: 1,
        internCount: 0,
        primaryLocation: 'Mumbai',
        attendanceRatePct: 97,
        utilizationPct: 91,
        overtimeHours: 54,
        overtimeCostInr: 48000,
        monthlyPayrollSpendInr: 3420000,
        monthlyBudgetInr: 3500000,
        openRolesCount: 1,
        annualizedAttritionPct: 4.0,
        avgTimeToHireDays: 29,
        flightRiskCount: 0,
        healthScore: 96,
        healthStatus: 'Healthy',
      },
      {
        id: 'DEPT-HR',
        department: 'People & HR',
        leadName: 'Aarav Sharma',
        headcount: 18,
        fullTimeCount: 17,
        contractCount: 0,
        internCount: 1,
        primaryLocation: 'Remote',
        attendanceRatePct: 95,
        utilizationPct: 90,
        overtimeHours: 32,
        overtimeCostInr: 27000,
        monthlyPayrollSpendInr: 1980000,
        monthlyBudgetInr: 2100000,
        openRolesCount: 0,
        annualizedAttritionPct: 5.8,
        avgTimeToHireDays: 22,
        flightRiskCount: 0,
        healthScore: 93,
        healthStatus: 'Healthy',
      },
    ],
    hiringFunnel: [
      { id: 'HF-1', stage: 'Open Requisitions', count: 18, conversionPct: 100 },
      { id: 'HF-2', stage: 'Active Candidates', count: 214, conversionPct: 78 },
      { id: 'HF-3', stage: 'Final Interviews', count: 42, conversionPct: 46 },
      { id: 'HF-4', stage: 'Offers Released', count: 11, conversionPct: 26 },
      { id: 'HF-5', stage: 'Pending Onboarding', count: 7, conversionPct: 64 },
    ],
    attritionReasons: [
      { id: 'AR-1', reason: 'Compensation & Equity Reset', sharePct: 41, count: 17, type: 'Voluntary' },
      { id: 'AR-2', reason: 'Career Mobility / Role Scope', sharePct: 29, count: 12, type: 'Voluntary' },
      { id: 'AR-3', reason: 'Relocation & Hybrid Policy', sharePct: 17, count: 7, type: 'Voluntary' },
      { id: 'AR-4', reason: 'Performance & Restructuring', sharePct: 13, count: 5, type: 'Involuntary' },
    ],
    voluntaryExitPct: 87,
    involuntaryExitPct: 13,
    payrollCycle: {
      cycleLabel: 'November 2026 Pay Run',
      status: 'Awaiting Executive Sign-Off',
      grossPayInr: 54950000,
      statutoryDeductionsInr: 10420000,
      netPayoutInr: 44530000,
      reimbursementsInr: 1840000,
      overtimeSpendInr: 1490000,
      totalBudgetInr: 54900000,
      prevMonthCostPerEmpInr: 119400,
      costPerEmpTrend: [
        { month: 'Jun', costPerEmpInr: 115200, overtimeLakhs: 10.8 },
        { month: 'Jul', costPerEmpInr: 116400, overtimeLakhs: 11.4 },
        { month: 'Aug', costPerEmpInr: 117900, overtimeLakhs: 12.1 },
        { month: 'Sep', costPerEmpInr: 118500, overtimeLakhs: 12.8 },
        { month: 'Oct', costPerEmpInr: 119400, overtimeLakhs: 13.1 },
        { month: 'Nov', costPerEmpInr: 121571, overtimeLakhs: 14.9 },
      ],
    },
    approvals: [
      {
        id: 'EX-APP-01',
        referenceCode: 'PAY-NOV-2026',
        title: 'November 2026 Final Payroll Batch Release',
        category: 'Payroll Batch',
        requestedBy: 'Aarav Sharma · HR Admin & Finance Maker',
        department: 'Enterprise Wide (452 Employees)',
        amountLabel: '₹4.45 Cr Net',
        amountInr: 44530000,
        priority: 'Critical',
        submittedAt: 'Today · 09:40 AM',
        lensOwner: 'cfo',
        rationale: 'Maker verification completed with 100% PF/TDS reconciliation. Requires final C-Suite checker release prior to bank disbursement.',
        status: 'Pending',
      },
      {
        id: 'EX-APP-02',
        referenceCode: 'OFR-VP-ENG-09',
        title: 'Senior Leadership Offer · VP Platform Engineering',
        category: 'Senior Offer',
        requestedBy: 'Nandini Bose · CTO Office',
        department: 'Engineering',
        amountLabel: '₹1.18 Cr CTC',
        amountInr: 11800000,
        priority: 'High',
        submittedAt: 'Today · 11:15 AM',
        lensOwner: 'cto',
        rationale: '14% above band midpoint due to specialized distributed systems track record; offset by consolidating two open staff roles.',
        status: 'Pending',
      },
      {
        id: 'EX-APP-03',
        referenceCode: 'EXP-TRV-441',
        title: 'APAC Enterprise Summit & Client Roadshow Budget',
        category: 'Budget & Expense',
        requestedBy: 'Kabir Ahluwalia · VP Sales',
        department: 'Sales & Growth',
        amountLabel: '₹14.6 L',
        amountInr: 1460000,
        priority: 'High',
        submittedAt: 'Yesterday · 04:20 PM',
        lensOwner: 'coo',
        rationale: 'Singapore & Tokyo enterprise pipeline acceleration for 6 Tier-1 accounts exceeding ₹18 Cr ARR potential.',
        status: 'Pending',
      },
      {
        id: 'EX-APP-04',
        referenceCode: 'CMP-EXT-19',
        title: 'Non-Compete Waiver & Accelerated Severance Exception',
        category: 'Compliance & Exit',
        requestedBy: 'People & Legal Counsel',
        department: 'Sales & Growth',
        amountLabel: '₹8.2 L',
        amountInr: 820000,
        priority: 'Normal',
        submittedAt: 'Yesterday · 01:05 PM',
        lensOwner: 'ceo',
        rationale: 'Mutual separation agreement signed with Regional Director; legal counsel recommends immediate clearance.',
        status: 'Pending',
      },
    ],
    aiBriefs: [
      {
        id: 'BRIEF-1',
        lens: 'cto',
        title: 'Engineering overtime rose 14% MoM',
        summary: 'Core Platform & Release squads logged 642 overtime hours (₹7.2 L) ahead of Q4 cloud migration.',
        metricBadge: '+14% OT',
        severity: 'Watch',
        targetTab: 'ai_insights',
      },
      {
        id: 'BRIEF-2',
        lens: 'ceo',
        title: 'Q4 hiring velocity 82% on target',
        summary: '11 of 18 critical roles have offers released; average time-to-hire improved by 4 days to 26d.',
        metricBadge: '82% Target',
        severity: 'Positive',
        targetTab: 'workforce',
      },
      {
        id: 'BRIEF-3',
        lens: 'cfo',
        title: 'Payroll burn within +0.1% of budget',
        summary: 'November gross payroll (₹5.50 Cr) aligns closely with ₹5.49 Cr budget despite seasonal overtime.',
        metricBadge: '+0.1% Var',
        severity: 'Positive',
        targetTab: 'finance',
      },
      {
        id: 'BRIEF-4',
        lens: 'coo',
        title: 'Sales turnover alert in Mumbai cluster',
        summary: 'Sales & Growth annualized attrition reached 14.8%, driven by Q3 quota pressure and pay bands.',
        metricBadge: '14.8% Exit',
        severity: 'Critical',
        targetTab: 'ai_insights',
      },
    ],
    flightRisks: [
      {
        id: 'FR-1',
        department: 'Sales & Growth',
        segmentLabel: 'Mid-Market Account Executives (4)',
        riskScorePct: 81,
        impactedCount: 4,
        driver: 'Variable payout lag + 16% higher market base benchmarks',
        recommendedAction: 'Fast-track Q4 accelerator bonus & review territory quotas',
        severity: 'High',
      },
      {
        id: 'FR-2',
        department: 'Engineering',
        segmentLabel: 'Senior Cloud & SRE Engineers (5)',
        riskScorePct: 74,
        impactedCount: 5,
        driver: '3 consecutive months above 22 hrs/mo on-call overtime',
        recommendedAction: 'Approve comp-off recovery sprint & fill 2 open SRE reqs',
        severity: 'High',
      },
      {
        id: 'FR-3',
        department: 'Customer Success',
        segmentLabel: 'Enterprise Implementation Leads (2)',
        riskScorePct: 58,
        impactedCount: 2,
        driver: 'High ticket concurrency across Hyderabad shift window',
        recommendedAction: 'Rebalance tier-2 onboarding pods with Product Ops',
        severity: 'Medium',
      },
    ],
    anomalies: [
      {
        id: 'ANM-1',
        title: 'Weekend Release Overtime Spike',
        department: 'Engineering',
        detectedMetric: '642 hrs (₹7.2 L)',
        baselineMetric: '560 hrs avg',
        detectedAt: 'Detected Today · 07:30 AM',
        category: 'Overtime',
      },
      {
        id: 'ANM-2',
        title: 'Monday Morning Late-Punch Cluster',
        department: 'Sales & Growth',
        detectedMetric: '92% attendance',
        baselineMetric: '96% org baseline',
        detectedAt: 'Detected Yesterday',
        category: 'Attendance',
      },
      {
        id: 'ANM-3',
        title: 'Support Resolution Throughput Gain',
        department: 'Operations & IT',
        detectedMetric: '93% utilization',
        baselineMetric: '88% baseline',
        detectedAt: 'Detected 2d ago',
        category: 'Productivity',
      },
    ],
    boardReports: [
      {
        id: 'board_pack',
        title: 'Monthly C-Suite Board Pack (Nov 2026)',
        subtitle: 'Consolidated KPIs, headcount growth, burn variance & risk brief',
        formatLabel: 'CSV · PDF Summary',
        lastGenerated: 'Today · 08:00 AM',
        ownerLens: 'ceo',
      },
      {
        id: 'payroll_summary',
        title: 'Monthly Payroll & Statutory Disbursement Pack',
        subtitle: 'Gross, PF/TDS deductions, net payout, overtime & dept budget vs actual',
        formatLabel: 'CSV · CFO Sign-Off',
        lastGenerated: 'Today · 09:40 AM',
        ownerLens: 'cfo',
      },
      {
        id: 'headcount_attrition',
        title: 'Workforce Headcount, Hiring & Attrition Report',
        subtitle: 'Dept/location split, hiring funnel conversion & voluntary exit drivers',
        formatLabel: 'CSV · COO / CHRO',
        lastGenerated: 'Yesterday · 06:15 PM',
        ownerLens: 'coo',
      },
      {
        id: 'compliance_status',
        title: 'Audit, Statutory & SOC2 Compliance Matrix',
        subtitle: 'PF/ESIC filings, MFA posture, payroll maker-checker & policy audit',
        formatLabel: 'CSV · Audit Trail',
        lastGenerated: 'Nov 11, 2026',
        ownerLens: 'cto',
      },
    ],
    announcements: [
      {
        id: 'ANN-EX-01',
        title: 'Q4 All-Hands Town Hall & FY27 Roadmap',
        body: 'Join the C-Suite leadership team this Friday at 4:00 PM IST for Q4 enterprise milestones, product launches, and annual recognition awards.',
        audience: 'All Employees',
        priority: 'Town Hall',
        publishedBy: 'Siddharth Malhotra · CEO',
        publishedAt: 'Today · 08:30 AM',
      },
      {
        id: 'ANN-EX-02',
        title: 'FY26-27 Investment & Tax Proof Window Open',
        body: 'Ensure all Section 80C/HRA declarations are uploaded in Payroll & Docs before Nov 28 to optimize monthly TDS deductions.',
        audience: 'All Employees',
        priority: 'Important',
        publishedBy: 'Meera Subramanian · CFO',
        publishedAt: 'Nov 10, 2026',
      },
    ],
    complianceItems: [
      {
        id: 'CMP-1',
        domain: 'Statutory Payroll Filings (PF, ESIC, TDS)',
        status: 'Compliant',
        scorePct: 100,
        lastAudited: 'Nov 12, 2026',
        owner: 'Finance & Payroll',
        note: 'All October challans reconciled; November maker-checker batch staged.',
      },
      {
        id: 'CMP-2',
        domain: 'SOC2 Type II & Identity MFA Coverage',
        status: 'Compliant',
        scorePct: 96,
        lastAudited: 'Nov 11, 2026',
        owner: 'CTO & IT Security',
        note: 'Okta TOTP enforced across privileged portals; 4 contractor accounts queued.',
      },
      {
        id: 'CMP-3',
        domain: 'Labor Law & Overtime Cap Governance',
        status: 'Review Due',
        scorePct: 89,
        lastAudited: 'Nov 09, 2026',
        owner: 'COO & People Ops',
        note: 'Engineering release sprint approached quarterly overtime threshold in 2 squads.',
      },
    ],
    notifications: [
      {
        id: 'EN-1',
        title: 'Payroll Batch Ready for Final Sign-Off',
        message: 'November 2026 payroll (₹4.45 Cr net) passed maker audit and awaits executive release.',
        category: 'Payroll',
        timestamp: '18m ago',
        read: false,
      },
      {
        id: 'EN-2',
        title: 'AI Flight-Risk Alert · Sales & Engineering',
        message: '9 key contributors flagged above 70% flight risk due to overtime and quota gaps.',
        category: 'AI Brief',
        timestamp: '1h ago',
        read: false,
      },
      {
        id: 'EN-3',
        title: 'VP Platform Engineering Offer Escalated',
        message: 'CTO requested executive sign-off on ₹1.18 Cr offer package.',
        category: 'Talent',
        timestamp: '2h ago',
        read: true,
      },
    ],
    copilotHistory: [
      {
        id: 'CP-0',
        query: 'Give me an instant C-Suite pulse across headcount, burn, and urgent risks.',
        answer:
          'Active workforce stands at 452 (+3.4% MoM) with 94.7% org attendance. Monthly gross payroll burn is ₹5.50 Cr (+0.1% vs ₹5.49 Cr budget), and 4 executive approvals totaling ₹4.59 Cr await sign-off.',
        highlights: [
          'Engineering overtime up 14% MoM (642 hrs · ₹7.2 L)',
          'Sales & Growth attrition highest at 14.8% annualized',
          'November 2026 Payroll Batch ready for Maker-Checker release',
        ],
        timestamp: '09:45 AM',
      },
    ],
    selfService: {
      todayStatus: 'Checked In',
      punchInTime: '08:52 AM',
      shiftName: 'Executive Hybrid · Flexible Core',
      leaveBalances: [
        {
          key: 'earned',
          label: 'Privilege Leave',
          code: 'PL',
          total: 24,
          used: 6,
          remaining: 18,
          accrualNote: 'Annual executive quota',
        },
        {
          key: 'casual',
          label: 'Executive Wellness',
          code: 'EW',
          total: 6,
          used: 1,
          remaining: 5,
          accrualNote: 'Quarterly reset',
        },
        {
          key: 'sick',
          label: 'Casual / Sick Leave',
          code: 'CL',
          total: 8,
          used: 2,
          remaining: 6,
          accrualNote: 'Available immediately',
        },
      ],
      leaveRequests: [
        {
          id: 'EX-LV-1',
          leaveType: 'Privilege Leave',
          startDate: '2026-12-24',
          endDate: '2026-12-26',
          days: 3,
          status: 'Approved',
          reason: 'Year-end family travel',
        },
      ],
      latestNetSalaryInr: 685000,
      payslips: [
        {
          id: 'EX-PAY-OCT',
          monthLabel: 'October 2026',
          grossInr: 920000,
          deductionsInr: 235000,
          netInr: 685000,
          status: 'Credited',
        },
        {
          id: 'EX-PAY-SEP',
          monthLabel: 'September 2026',
          grossInr: 920000,
          deductionsInr: 235000,
          netInr: 685000,
          status: 'Credited',
        },
      ],
    },
  };
}

export function loadExecutivePortalState(identity?: {
  executiveId?: string;
  fullName?: string;
  email?: string;
}): ExecutivePortalState {
  const fallback = createInitialExecutivePortalState(identity);
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }
  try {
    const key = getExecutivePortalStorageKey(fallback.profile.executiveId);
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<ExecutivePortalState> | null;
    if (!parsed || typeof parsed !== 'object') return fallback;
    return {
      ...fallback,
      ...parsed,
      profile: {
        ...fallback.profile,
        ...(parsed.profile || {}),
      },
      payrollCycle: {
        ...fallback.payrollCycle,
        ...(parsed.payrollCycle || {}),
      },
      selfService: {
        ...fallback.selfService,
        ...(parsed.selfService || {}),
      },
      departments: Array.isArray(parsed.departments) ? parsed.departments : fallback.departments,
      hiringFunnel: Array.isArray(parsed.hiringFunnel) ? parsed.hiringFunnel : fallback.hiringFunnel,
      attritionReasons: Array.isArray(parsed.attritionReasons)
        ? parsed.attritionReasons
        : fallback.attritionReasons,
      approvals: Array.isArray(parsed.approvals) ? parsed.approvals : fallback.approvals,
      aiBriefs: Array.isArray(parsed.aiBriefs) ? parsed.aiBriefs : fallback.aiBriefs,
      flightRisks: Array.isArray(parsed.flightRisks) ? parsed.flightRisks : fallback.flightRisks,
      anomalies: Array.isArray(parsed.anomalies) ? parsed.anomalies : fallback.anomalies,
      boardReports: Array.isArray(parsed.boardReports) ? parsed.boardReports : fallback.boardReports,
      announcements: Array.isArray(parsed.announcements)
        ? parsed.announcements
        : fallback.announcements,
      complianceItems: Array.isArray(parsed.complianceItems)
        ? parsed.complianceItems
        : fallback.complianceItems,
      notifications: Array.isArray(parsed.notifications)
        ? parsed.notifications
        : fallback.notifications,
      copilotHistory: Array.isArray(parsed.copilotHistory)
        ? parsed.copilotHistory
        : fallback.copilotHistory,
    };
  } catch {
    return fallback;
  }
}

export function saveExecutivePortalState(state: ExecutivePortalState): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const key = getExecutivePortalStorageKey(state.profile.executiveId);
    window.localStorage.setItem(key, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors in demo mode
  }
}

export interface ExecutiveDashboardKpis {
  totalWorkforce: number;
  momGrowthPct: number;
  monthlyPayrollBurnInr: number;
  budgetVariancePct: number;
  orgAttendanceRatePct: number;
  activeDepartmentsCount: number;
  annualizedAttritionPct: number;
  openRolesCount: number;
  pendingApprovalsCount: number;
  totalOvertimeCostInr: number;
  avgCostPerEmployeeInr: number;
}

export function computeExecutiveDashboardKpis(
  state: ExecutivePortalState
): ExecutiveDashboardKpis {
  const totalWorkforce = state.departments.reduce((sum, d) => sum + d.headcount, 0);
  const openRolesCount = state.departments.reduce((sum, d) => sum + d.openRolesCount, 0);
  const totalOvertimeCostInr = state.departments.reduce((sum, d) => sum + d.overtimeCostInr, 0);

  const weightedAttendance = totalWorkforce
    ? Math.round(
        state.departments.reduce((sum, d) => sum + d.attendanceRatePct * d.headcount, 0) /
          totalWorkforce
      )
    : 94;

  const weightedAttrition = totalWorkforce
    ? Number(
        (
          state.departments.reduce((sum, d) => sum + d.annualizedAttritionPct * d.headcount, 0) /
          totalWorkforce
        ).toFixed(1)
      )
    : 9.8;

  const totalSpend = state.payrollCycle.grossPayInr;
  const totalBudget = state.payrollCycle.totalBudgetInr || totalSpend;
  const budgetVariancePct = Number((((totalSpend - totalBudget) / totalBudget) * 100).toFixed(1));

  const pendingApprovalsCount = state.approvals.filter((a) => a.status === 'Pending').length;
  const avgCostPerEmployeeInr = totalWorkforce ? Math.round(totalSpend / totalWorkforce) : 0;

  return {
    totalWorkforce,
    momGrowthPct: 3.4,
    monthlyPayrollBurnInr: totalSpend,
    budgetVariancePct,
    orgAttendanceRatePct: weightedAttendance,
    activeDepartmentsCount: state.departments.length,
    annualizedAttritionPct: weightedAttrition,
    openRolesCount,
    pendingApprovalsCount,
    totalOvertimeCostInr,
    avgCostPerEmployeeInr,
  };
}

export function applyExecutiveApprovalDecision(
  state: ExecutivePortalState,
  approvalId: string,
  decision: 'Approved' | 'On Hold',
  note?: string
): { valid: boolean; nextState: ExecutivePortalState; error?: string } {
  const cleanNote = (note || '').trim();
  if (decision === 'On Hold' && cleanNote.length < 4) {
    return {
      valid: false,
      nextState: state,
      error: 'Please enter a brief executive note (min 4 characters) when placing an item on hold.',
    };
  }

  const target = state.approvals.find((a) => a.id === approvalId);
  if (!target) {
    return { valid: false, nextState: state, error: 'Approval request not found.' };
  }

  const nextApprovals = state.approvals.map((a) =>
    a.id === approvalId
      ? {
          ...a,
          status: decision,
          decisionNote:
            cleanNote ||
            (decision === 'Approved' ? 'Signed off via Executive Command Center' : 'Placed on hold'),
          decidedAt: 'Just now',
        }
      : a
  );

  let nextPayrollCycle = state.payrollCycle;
  if (target.category === 'Payroll Batch') {
    nextPayrollCycle = {
      ...state.payrollCycle,
      status: decision === 'Approved' ? 'Approved for Bank Release' : 'On Hold',
    };
  }

  return {
    valid: true,
    nextState: {
      ...state,
      approvals: nextApprovals,
      payrollCycle: nextPayrollCycle,
    },
  };
}

export interface ScenarioInputs {
  headcountGrowthPct: number; // -5 to +20
  attritionReductionPct: number; // 0 to 5
  overtimeReductionPct: number; // 0 to 40
}

export interface ScenarioProjectionResult {
  projectedHeadcount: number;
  projectedMonthlyPayrollInr: number;
  projectedAnnualPayrollDeltaInr: number;
  estimatedRetentionSavingsInr: number;
  overtimeAnnualSavingsInr: number;
  netAnnualBudgetImpactInr: number;
}

export function computeScenarioProjection(
  state: ExecutivePortalState,
  inputs: ScenarioInputs
): ScenarioProjectionResult {
  const kpis = computeExecutiveDashboardKpis(state);
  const growthFactor = 1 + inputs.headcountGrowthPct / 100;
  const projectedHeadcount = Math.max(1, Math.round(kpis.totalWorkforce * growthFactor));

  const overtimeMonthlySavings = Math.round(
    kpis.totalOvertimeCostInr * (inputs.overtimeReductionPct / 100)
  );
  const overtimeAnnualSavingsInr = overtimeMonthlySavings * 12;

  const baseMonthlyWithoutOt = Math.max(
    0,
    state.payrollCycle.grossPayInr - kpis.totalOvertimeCostInr
  );
  const projectedMonthlyPayrollInr = Math.round(
    baseMonthlyWithoutOt * growthFactor + (kpis.totalOvertimeCostInr - overtimeMonthlySavings)
  );
  const projectedAnnualPayrollDeltaInr =
    (projectedMonthlyPayrollInr - state.payrollCycle.grossPayInr) * 12;

  // Replacement + ramp cost estimated at ₹4.8 L per avoided attrition exit
  const avoidedExits = Math.round(
    (kpis.totalWorkforce * Math.max(0, inputs.attritionReductionPct)) / 100
  );
  const estimatedRetentionSavingsInr = avoidedExits * 480000;

  const netAnnualBudgetImpactInr =
    projectedAnnualPayrollDeltaInr - estimatedRetentionSavingsInr;

  return {
    projectedHeadcount,
    projectedMonthlyPayrollInr,
    projectedAnnualPayrollDeltaInr,
    estimatedRetentionSavingsInr,
    overtimeAnnualSavingsInr,
    netAnnualBudgetImpactInr,
  };
}

export function answerExecutiveCopilotQuery(
  state: ExecutivePortalState,
  rawQuery: string
): ExecutiveCopilotMessage {
  const q = rawQuery.trim();
  const lower = q.toLowerCase();
  const kpis = computeExecutiveDashboardKpis(state);

  const sortedByOt = [...state.departments].sort(
    (a, b) => b.overtimeCostInr - a.overtimeCostInr
  );
  const sortedByAttrition = [...state.departments].sort(
    (a, b) => b.annualizedAttritionPct - a.annualizedAttritionPct
  );
  const overBudgetDepts = state.departments.filter(
    (d) => d.monthlyPayrollSpendInr > d.monthlyBudgetInr
  );

  if (lower.includes('overtime') || lower.includes('ot') || lower.includes('hours')) {
    const top = sortedByOt[0];
    return {
      id: `CP-${Date.now().toString().slice(-5)}`,
      query: q,
      answer: `${top.department} leads company overtime at ${top.overtimeHours} hrs (${formatInrCompact(
        top.overtimeCostInr
      )}), accounting for ${Math.round(
        (top.overtimeCostInr / Math.max(1, kpis.totalOvertimeCostInr)) * 100
      )}% of total monthly overtime spend (${formatInrCompact(kpis.totalOvertimeCostInr)}).`,
      highlights: [
        `#1 ${sortedByOt[0].department}: ${sortedByOt[0].overtimeHours} hrs (${formatInrCompact(sortedByOt[0].overtimeCostInr)})`,
        `#2 ${sortedByOt[1].department}: ${sortedByOt[1].overtimeHours} hrs (${formatInrCompact(sortedByOt[1].overtimeCostInr)})`,
        `Recommended: Cap sprint OT by 20% to save ~₹35.8 L/year`,
      ],
      timestamp: 'Just now',
    };
  }

  if (lower.includes('attrition') || lower.includes('turnover') || lower.includes('flight') || lower.includes('risk')) {
    const top = sortedByAttrition[0];
    return {
      id: `CP-${Date.now().toString().slice(-5)}`,
      query: q,
      answer: `Enterprise annualized attrition is ${kpis.annualizedAttritionPct}% (${state.voluntaryExitPct}% voluntary). ${top.department} shows the highest turnover at ${top.annualizedAttritionPct}%, followed by ${sortedByAttrition[1].department} at ${sortedByAttrition[1].annualizedAttritionPct}%.`,
      highlights: [
        `Top exit driver: ${state.attritionReasons[0].reason} (${state.attritionReasons[0].sharePct}%)`,
        `${state.flightRisks[0].department}: ${state.flightRisks[0].riskScorePct}% flight-risk index (${state.flightRisks[0].impactedCount} key staff)`,
        `Avg org time-to-hire: 26 days across ${kpis.openRolesCount} open roles`,
      ],
      timestamp: 'Just now',
    };
  }

  if (lower.includes('payroll') || lower.includes('budget') || lower.includes('burn') || lower.includes('cost') || lower.includes('finance')) {
    return {
      id: `CP-${Date.now().toString().slice(-5)}`,
      query: q,
      answer: `${state.payrollCycle.cycleLabel} gross payroll is ${formatInrCompact(
        state.payrollCycle.grossPayInr
      )} (${kpis.budgetVariancePct >= 0 ? '+' : ''}${kpis.budgetVariancePct}% vs ${formatInrCompact(
        state.payrollCycle.totalBudgetInr
      )} budget). Net bank payout is ${formatInrCompact(
        state.payrollCycle.netPayoutInr
      )} and status is "${state.payrollCycle.status}".`,
      highlights: [
        `Avg monthly cost/employee: ${formatInrCompact(kpis.avgCostPerEmployeeInr)}`,
        `${overBudgetDepts.length} departments slightly over monthly budget (${overBudgetDepts.map((d) => d.department).join(', ') || 'None'})`,
        `Reimbursements queued: ${formatInrCompact(state.payrollCycle.reimbursementsInr)}`,
      ],
      timestamp: 'Just now',
    };
  }

  if (lower.includes('approval') || lower.includes('pending') || lower.includes('sign') || lower.includes('hiring')) {
    const pending = state.approvals.filter((a) => a.status === 'Pending');
    return {
      id: `CP-${Date.now().toString().slice(-5)}`,
      query: q,
      answer: `There are ${pending.length} executive sign-offs pending action, while Q4 hiring pipeline tracks ${kpis.openRolesCount} open roles with 11 offers released and 7 pending onboarding.`,
      highlights: pending.length
        ? pending.slice(0, 3).map((p) => `${p.referenceCode}: ${p.title} (${p.amountLabel})`)
        : ['All executive approvals are currently resolved.'],
      timestamp: 'Just now',
    };
  }

  return {
    id: `CP-${Date.now().toString().slice(-5)}`,
    query: q,
    answer: `Enterprise snapshot: ${kpis.totalWorkforce} active employees across ${kpis.activeDepartmentsCount} departments (${kpis.orgAttendanceRatePct}% attendance), ${formatInrCompact(
      kpis.monthlyPayrollBurnInr
    )} monthly payroll burn (${kpis.budgetVariancePct >= 0 ? '+' : ''}${kpis.budgetVariancePct}% vs budget), and ${kpis.pendingApprovalsCount} pending executive approvals.`,
    highlights: [
      `Highest spend: Engineering (${formatInrCompact(state.departments[0].monthlyPayrollSpendInr)})`,
      `Watchlist attrition: ${sortedByAttrition[0].department} (${sortedByAttrition[0].annualizedAttritionPct}%)`,
      `Compliance posture: 95% average across statutory & SOC2 audits`,
    ],
    timestamp: 'Just now',
  };
}

export function buildExecutiveCsvExport(
  reportId: ExecutiveBoardReportItem['id'],
  state: ExecutivePortalState
): { filename: string; csvContent: string; rowCount: number } {
  const kpis = computeExecutiveDashboardKpis(state);
  if (reportId === 'payroll_summary') {
    const header =
      'Department,Lead,Headcount,Monthly Budget (INR),Monthly Spend (INR),Variance (INR),Overtime Cost (INR)';
    const rows = state.departments.map(
      (d) =>
        `"${d.department}","${d.leadName}",${d.headcount},${d.monthlyBudgetInr},${d.monthlyPayrollSpendInr},${
          d.monthlyPayrollSpendInr - d.monthlyBudgetInr
        },${d.overtimeCostInr}`
    );
    return {
      filename: 'ofc360-executive-payroll-summary-nov-2026.csv',
      csvContent: [header, ...rows].join('\n'),
      rowCount: rows.length,
    };
  }

  if (reportId === 'headcount_attrition') {
    const header =
      'Department,Location,Headcount,Full-Time,Contract,Attendance %,Open Roles,Annualized Attrition %,Avg Time To Hire (Days)';
    const rows = state.departments.map(
      (d) =>
        `"${d.department}","${d.primaryLocation}",${d.headcount},${d.fullTimeCount},${d.contractCount},${d.attendanceRatePct},${d.openRolesCount},${d.annualizedAttritionPct},${d.avgTimeToHireDays}`
    );
    return {
      filename: 'ofc360-executive-headcount-attrition-nov-2026.csv',
      csvContent: [header, ...rows].join('\n'),
      rowCount: rows.length,
    };
  }

  if (reportId === 'compliance_status') {
    const header = 'Domain,Status,Score %,Last Audited,Owner,Notes';
    const rows = state.complianceItems.map(
      (c) =>
        `"${c.domain}","${c.status}",${c.scorePct},"${c.lastAudited}","${c.owner}","${c.note}"`
    );
    return {
      filename: 'ofc360-executive-compliance-audit-nov-2026.csv',
      csvContent: [header, ...rows].join('\n'),
      rowCount: rows.length,
    };
  }

  const header = 'Metric,Value,Context';
  const rows = [
    `"Total Active Workforce",${kpis.totalWorkforce},"+${kpis.momGrowthPct}% MoM across ${kpis.activeDepartmentsCount} departments"`,
    `"Monthly Gross Payroll Burn","${formatInrCompact(kpis.monthlyPayrollBurnInr)}","${kpis.budgetVariancePct}% vs budget"`,
    `"Org Attendance Rate","${kpis.orgAttendanceRatePct}%","Enterprise daily utilization"`,
    `"Annualized Attrition","${kpis.annualizedAttritionPct}%","${kpis.openRolesCount} critical open roles"`,
    `"Pending Executive Sign-Offs",${kpis.pendingApprovalsCount},"Status: ${state.payrollCycle.status}"`,
  ];
  return {
    filename: 'ofc360-executive-board-pack-nov-2026.csv',
    csvContent: [header, ...rows].join('\n'),
    rowCount: rows.length,
  };
}
