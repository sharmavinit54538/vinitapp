export type Ofc360Role =
  | 'hr_admin'
  | 'employee'
  | 'manager'
  | 'it_admin'
  | 'executive';

export type ExecutiveLens = 'all' | 'ceo' | 'cfo' | 'coo' | 'cto';

export interface UserProfile {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  role: Ofc360Role;
  designation: string;
  department: string;
  location: string;
  avatarInitials: string;
  phone: string;
}

export interface AuthSession {
  accessToken: string;
  user: UserProfile;
  expiresAt: string;
}

export interface PushNotificationItem {
  id: string;
  title: string;
  body: string;
  category: 'Attendance' | 'Leave' | 'Payroll' | 'Approval' | 'IT' | 'Executive';
  timestamp: string;
  read: boolean;
}

export interface HolidayItem {
  id: string;
  name: string;
  date: string;
  day: string;
  type: 'National' | 'Regional' | 'Company';
}

/* ---------------- HR ADMIN ---------------- */
export interface HrWorkforceMember {
  id: string;
  employeeCode: string;
  fullName: string;
  department: string;
  designation: string;
  location: string;
  status: 'Active' | 'On Leave' | 'Onboarding';
  attendanceRatePct: number;
}

export interface HrApprovalItem {
  id: string;
  employeeName: string;
  category: 'Leave' | 'Expense' | 'Regularization' | 'Exit';
  summary: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface HrAdminDashboardData {
  kpis: {
    activeWorkforce: number;
    attendanceRatePct: number;
    pendingApprovals: number;
    holidays2026: number;
  };
  workforce: HrWorkforceMember[];
  approvals: HrApprovalItem[];
  holidays: HolidayItem[];
  announcements: { id: string; title: string; body: string; publishedAt: string }[];
}

/* ---------------- EMPLOYEE ---------------- */
export interface PunchRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  mode: 'Face + GPS' | 'Office Wi-Fi' | 'Remote';
  geofenceVerified: boolean;
  workHours: string;
}

export interface LeaveBalance {
  code: 'CL' | 'SL' | 'PL' | 'CO';
  label: string;
  total: number;
  used: number;
  remaining: number;
}

export interface PayslipItem {
  id: string;
  monthLabel: string;
  netPayInr: number;
  grossPayInr: number;
  deductionsInr: number;
  status: 'Credited' | 'Processed';
  downloadUrl: string;
}

export interface KycDocumentItem {
  id: string;
  name: string;
  category: 'PAN' | 'Aadhaar' | 'Passport' | 'Bank' | 'Education';
  status: 'Verified' | 'Uploaded' | 'Pending';
  fileUri?: string;
  updatedAt: string;
}

export interface EmployeeDashboardData {
  todayStatus: 'Checked In' | 'Not Checked In';
  punchInTime: string;
  geofenceName: string;
  attendanceRatePct: number;
  presentDays: number;
  totalLeaveRemaining: number;
  holidays2026: number;
  shiftLabel: string;
  leaveBalances: LeaveBalance[];
  leaveRequests: {
    id: string;
    leaveType: string;
    dateRange: string;
    days: number;
    status: 'Pending' | 'Approved' | 'Rejected';
  }[];
  punchLogs: PunchRecord[];
  payslips: PayslipItem[];
  kycDocuments: KycDocumentItem[];
  digitalIdCard: {
    employeeCode: string;
    bloodGroup: string;
    validThru: string;
    emergencyContact: string;
    qrPayload: string;
  };
  assignedAssets: { id: string; assetTag: string; name: string; status: 'Assigned' | 'Return Due' }[];
  tickets: { id: string; subject: string; category: string; status: 'Open' | 'Resolved' }[];
  holidays: HolidayItem[];
}

/* ---------------- MANAGER ---------------- */
export interface DirectReportItem {
  id: string;
  fullName: string;
  roleTitle: string;
  todayStatus: 'Present' | 'WFH' | 'On Leave' | 'Late';
  punchTime: string;
  shiftCode: string;
}

export interface TeamApprovalItem {
  id: string;
  employeeName: string;
  type: 'Leave' | 'Expense' | 'Shift Swap';
  detail: string;
  amountOrDays: string;
  status: 'Pending' | 'Approved' | 'Declined';
}

export interface PerformanceGoalItem {
  id: string;
  employeeName: string;
  goalTitle: string;
  progressPct: number;
  rating: number;
}

export interface CandidateScorecardItem {
  id: string;
  candidateName: string;
  roleTitle: string;
  stage: string;
  score: number;
  recommendation: 'Strong Hire' | 'Hire' | 'Hold';
}

export interface ManagerDashboardData {
  kpis: {
    teamSize: number;
    teamAttendancePct: number;
    presentCount: number;
    onLeaveCount: number;
    pendingApprovals: number;
    openRequisitions: number;
  };
  directReports: DirectReportItem[];
  approvals: TeamApprovalItem[];
  roster: { id: string; employeeName: string; day: string; shift: string }[];
  goals: PerformanceGoalItem[];
  scorecards: CandidateScorecardItem[];
}

/* ---------------- IT ADMIN ---------------- */
export interface ItAssetItem {
  id: string;
  assetTag: string;
  model: string;
  category: 'Laptop' | 'Monitor' | 'Phone' | 'Security Key';
  assignedTo: string | null;
  status: 'Assigned' | 'Available' | 'In Repair';
  serialNumber: string;
}

export interface ItTicketItem {
  id: string;
  requester: string;
  subject: string;
  priority: 'Critical' | 'High' | 'Normal';
  slaRemaining: string;
  status: 'Open' | 'In Progress' | 'Resolved';
}

export interface ItUserAccount {
  id: string;
  fullName: string;
  email: string;
  role: Ofc360Role;
  mfaEnabled: boolean;
  status: 'Active' | 'Provisioning' | 'Suspended';
}

export interface OffboardingClearanceItem {
  id: string;
  employeeName: string;
  lastWorkingDay: string;
  assetsToRecover: number;
  ssoRevoked: boolean;
  status: 'Pending' | 'Cleared';
}

export interface ItAdminDashboardData {
  kpis: {
    totalAssets: number;
    assignedAssets: number;
    openTickets: number;
    criticalSla: number;
    pendingClearances: number;
    mfaAdoptionPct: number;
  };
  assets: ItAssetItem[];
  tickets: ItTicketItem[];
  users: ItUserAccount[];
  clearances: OffboardingClearanceItem[];
}

/* ---------------- EXECUTIVE ---------------- */
export interface ExecutiveDepartmentMetric {
  id: string;
  department: string;
  headcount: number;
  attendancePct: number;
  attritionPct: number;
  monthlyPayrollCr: number;
  healthStatus: 'Healthy' | 'Watch' | 'Action Needed';
}

export interface ExecutiveApprovalItem {
  id: string;
  referenceCode: string;
  title: string;
  category: 'Payroll Batch' | 'Senior Offer' | 'Budget Escalation';
  amountLabel: string;
  priority: 'Critical' | 'High';
  status: 'Pending' | 'Approved' | 'On Hold';
  holdNote?: string;
}

export interface ExecutiveDashboardData {
  activeLens: ExecutiveLens;
  kpis: {
    totalWorkforce: number;
    momGrowthPct: number;
    monthlyPayrollCr: number;
    budgetVariancePct: number;
    orgAttendancePct: number;
    annualizedAttritionPct: number;
  };
  departments: ExecutiveDepartmentMetric[];
  approvals: ExecutiveApprovalItem[];
  aiInsights: { id: string; title: string; summary: string; metric: string }[];
  boardReports: { id: string; title: string; period: string; format: string }[];
}
