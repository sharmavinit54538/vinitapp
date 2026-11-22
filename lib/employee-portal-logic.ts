import {
  AnnouncementItem,
  HolidayItem,
  createInitialHrDashboardState,
} from './hr-dashboard-logic';

export type EmployeeBottomTab = 'home' | 'attendance' | 'leaves' | 'payroll_docs' | 'more';
export type EmployeeHomeSubTab = 'overview' | 'my_shift' | 'roster' | 'holidays';
export type EmployeePayrollDocsTab = 'payslips' | 'id_letters' | 'kyc_vault';
export type EmployeeMoreModuleId =
  | 'assets'
  | 'expenses'
  | 'travel'
  | 'helpdesk'
  | 'announcements'
  | 'connect'
  | 'onboarding'
  | 'exit_management'
  | 'profile';

export type RequestBadgeStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Open' | 'Resolved';

export interface EmployeeProfileData {
  employeeId: string;
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  location: string;
  reportingManager: string;
  dateOfJoining: string;
  bloodGroup: string;
  avatarInitials: string;
  workMode: 'Hybrid' | 'On-Site' | 'Remote';
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
  address: string;
  bankName: string;
  bankAccountMasked: string;
  ifscCode: string;
  panMasked: string;
  uanNumber: string;
}

export interface TodayAttendanceSession {
  dateIso: string;
  status: 'Checked In' | 'Checked Out' | 'Not Checked In';
  checkInTime: string | null;
  checkInIso: string | null;
  checkOutTime: string | null;
  checkOutIso: string | null;
  workMode: 'Office' | 'WFH' | 'On-Duty';
  locationLabel: string;
  geofenceVerified: boolean;
  confidenceScore?: number;
}

export interface EmployeeAttendanceRecord {
  id: string;
  dateIso: string;
  displayDate: string;
  dayName: string;
  status: 'Present' | 'Late' | 'Half-Day' | 'Leave' | 'Holiday' | 'Absent';
  checkIn: string;
  checkOut: string;
  totalHours: string;
  workMode: 'Office' | 'WFH' | 'On-Duty' | 'Holiday' | 'Leave';
  location: string;
}

export interface EmployeeShiftAssignment {
  shiftId: string;
  shiftName: string;
  shiftCode: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
  weeklyOffDays: string[];
  gracePeriodMins: number;
  allowance: string;
  effectiveFrom: string;
}

export interface EmployeeRosterDay {
  day: string;
  dateIso: string;
  displayDate: string;
  shiftCode: 'GS' | 'MS' | 'NS' | 'FLX' | 'OFF';
  shiftTitle: string;
  timing: string;
  workMode: 'Office' | 'WFH' | 'Weekly Off';
}

export interface EmployeeShiftChangeRequest {
  id: string;
  employeeId: string;
  currentShift: string;
  requestedShift: string;
  effectiveDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
}

export type LeaveCategoryKey = 'earned' | 'casual' | 'sick' | 'unpaid';

export interface LeaveBalanceItem {
  key: LeaveCategoryKey;
  label: string;
  code: string;
  total: number;
  used: number;
  remaining: number;
  accrualNote: string;
}

export interface EmployeeLeaveRequest {
  id: string;
  employeeId: string;
  leaveKey: LeaveCategoryKey;
  leaveType: string;
  fromDate: string;
  toDate: string;
  isHalfDay: boolean;
  days: number;
  reason: string;
  attachmentName?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  appliedAt: string;
}

export interface PayslipLineItem {
  label: string;
  amount: number;
}

export interface EmployeePayslip {
  id: string;
  monthLabel: string;
  payPeriod: string;
  payDate: string;
  paymentStatus: 'Credited' | 'Processing';
  ctcAnnual: number;
  earnings: PayslipLineItem[];
  deductions: PayslipLineItem[];
  reimbursements: number;
  taxRegime: 'New Regime' | 'Old Regime';
  tdsDeducted: number;
  bankAccountMasked: string;
}

export interface EmployeeHrLetter {
  id: string;
  title: string;
  category: 'Offer' | 'Appointment' | 'Appraisal' | 'Policy';
  issuedDate: string;
  referenceCode: string;
  summary: string;
  requiresAcknowledgment: boolean;
  acknowledged: boolean;
  acknowledgedAt?: string;
}

export interface EmployeeKycDocument {
  id: string;
  docType: 'Aadhaar Card' | 'PAN Card' | 'Passport' | 'Education Certificate';
  documentNumberMasked: string;
  fileName: string;
  uploadedAt: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  reviewerNote?: string;
}

export interface EmployeeAssignedAsset {
  id: string;
  assetTag: string;
  name: string;
  category: 'Laptop' | 'Access Badge' | 'Phone' | 'Monitor';
  serialNumber: string;
  assignedDate: string;
  condition: 'Excellent' | 'Good' | 'Issue Reported';
  issueNote?: string;
}

export interface EmployeeExpenseClaim {
  id: string;
  employeeId: string;
  title: string;
  category: 'Travel' | 'Meals' | 'Internet & Phone' | 'Client Hosting' | 'Equipment';
  expenseDate: string;
  amount: number;
  receiptName?: string;
  notes: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  submittedAt: string;
}

export interface EmployeeTravelRequest {
  id: string;
  employeeId: string;
  destination: string;
  purpose: string;
  departureDate: string;
  returnDate: string;
  mode: 'Flight' | 'Train' | 'Cab & Hotel';
  estimatedBudget: number;
  itinerarySummary: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedAt: string;
}

export interface EmployeeTicketReply {
  id: string;
  sender: 'Employee' | 'Support Agent';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface EmployeeHelpdeskTicket {
  id: string;
  ticketNumber: string;
  employeeId: string;
  category: 'HR & Payroll' | 'IT & Hardware' | 'Facilities' | 'Policy & Benefits';
  priority: 'High' | 'Medium' | 'Low';
  subject: string;
  description: string;
  status: 'Pending' | 'Approved' | 'Resolved' | 'Open';
  createdAt: string;
  replies: EmployeeTicketReply[];
}

export interface EmployeeChatThread {
  id: string;
  contactName: string;
  roleTitle: string;
  department: string;
  initials: string;
  statusText: string;
  unreadCount: number;
  messages: {
    id: string;
    sender: 'me' | 'them';
    text: string;
    time: string;
  }[];
}

export interface EmployeeOnboardingTask {
  id: string;
  title: string;
  category: 'Identity & KYC' | 'IT Setup' | 'Compliance' | 'Team Induction';
  dueDate: string;
  completed: boolean;
}

export interface EmployeeNotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'Approval' | 'Payroll' | 'Announcement' | 'Attendance';
  read: boolean;
}

export type EmployeeExitReasonCategory =
  | 'Career Growth'
  | 'Higher Studies'
  | 'Relocation'
  | 'Compensation'
  | 'Health & Personal';

export type EmployeeExitStatus =
  | 'Active Employment'
  | 'Resignation Submitted'
  | 'Notice Period Active'
  | 'Clearance In Progress'
  | 'Withdrawn';

export interface EmployeeExitClearanceTask {
  id: string;
  department: 'IT & Assets' | 'Manager KT' | 'Finance & FnF' | 'HR & Admin';
  title: string;
  owner: string;
  status: 'Pending' | 'Completed';
  employeeActionable: boolean;
}

export interface EmployeeFnfEstimate {
  leaveEncashmentDays: number;
  leaveEncashmentAmount: number;
  pendingReimbursements: number;
  proRataSalaryEstimate: number;
  estimatedNetSettlement: number;
  settlementTimeline: string;
}

export interface EmployeeExitState {
  status: EmployeeExitStatus;
  noticePeriodDays: number;
  submittedDate: string | null;
  requestedLastWorkingDay: string | null;
  approvedLastWorkingDay: string | null;
  reasonCategory: EmployeeExitReasonCategory | null;
  notes: string;
  handoverTo: string;
  withdrawalReason?: string;
  clearanceTasks: EmployeeExitClearanceTask[];
  fnfEstimate: EmployeeFnfEstimate;
  exitInterviewSubmitted: boolean;
  exitInterviewRating: number;
  exitInterviewFeedback: string;
}

export interface UnifiedEmployeeRequestItem {
  id: string;
  kind: 'Leave' | 'Shift Change' | 'Expense' | 'Helpdesk' | 'Exit';
  title: string;
  subtitle: string;
  dateLabel: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface EmployeePortalState {
  profile: EmployeeProfileData;
  todaySession: TodayAttendanceSession;
  attendanceRecords: EmployeeAttendanceRecord[];
  shiftAssignment: EmployeeShiftAssignment;
  rosterDays: EmployeeRosterDay[];
  shiftChangeRequests: EmployeeShiftChangeRequest[];
  leaveBalances: LeaveBalanceItem[];
  leaveRequests: EmployeeLeaveRequest[];
  payslips: EmployeePayslip[];
  hrLetters: EmployeeHrLetter[];
  kycDocuments: EmployeeKycDocument[];
  assignedAssets: EmployeeAssignedAsset[];
  expenseClaims: EmployeeExpenseClaim[];
  travelRequests: EmployeeTravelRequest[];
  helpdeskTickets: EmployeeHelpdeskTicket[];
  chatThreads: EmployeeChatThread[];
  onboardingTasks: EmployeeOnboardingTask[];
  exitManagement: EmployeeExitState;
  notifications: EmployeeNotificationItem[];
  optionalHolidaySelections: Record<string, boolean>;
}

export const EMPLOYEE_PORTAL_STORAGE_PREFIX = 'ofc360_employee_portal_state_v1';

export function getEmployeePortalStorageKey(employeeId: string): string {
  const cleanId = (employeeId || 'EMP-2048').trim().toUpperCase();
  return `${EMPLOYEE_PORTAL_STORAGE_PREFIX}_${cleanId}`;
}

export function getSeedHolidays2026(): HolidayItem[] {
  return createInitialHrDashboardState().holidays;
}

export function getDefaultAnnouncementsForEmployee(): AnnouncementItem[] {
  return [
    {
      id: 'EMP-ANN-01',
      title: 'Q4 Performance Appraisal Cycle & Self-Review Window',
      description:
        'Self-assessment forms for Q4 2026 are open until Nov 25. Review your OKRs before scheduling manager 1:1s.',
      publishedDate: 'Today · 09:30 AM',
      expiryDate: '2026-11-30',
      department: 'All Departments',
      targetAudience: 'All Employees',
      category: 'Policy Update',
      priority: 'High',
      author: 'Aarav Sharma · People Ops',
      status: 'Published',
    },
    {
      id: 'EMP-ANN-02',
      title: 'Flexible Benefit & Tax Investment Proof Submission',
      description:
        'Upload HRA, LTA, and 80C investment declarations under Payroll & Docs before the monthly payroll cutoff.',
      publishedDate: 'Nov 10, 2026',
      expiryDate: '2026-12-15',
      department: 'Finance & Payroll',
      targetAudience: 'All Employees',
      category: 'Payroll & Benefits',
      priority: 'Normal',
      author: 'Finance Compliance Desk',
      status: 'Published',
    },
    {
      id: 'EMP-ANN-03',
      title: 'Bengaluru HQ Annual Wellness & Eye Screening Camp',
      description:
        'Complimentary health checkup booths will run at Floor 3 Atrium from 10:00 AM to 4:00 PM this Friday.',
      publishedDate: 'Nov 08, 2026',
      expiryDate: '2026-11-20',
      department: 'All Departments',
      targetAudience: 'Bengaluru HQ',
      category: 'Events',
      priority: 'Normal',
      author: 'OFC360 Workplace Team',
      status: 'Published',
    },
  ];
}

export function calculateLeaveDays(
  fromDate: string,
  toDate: string,
  isHalfDay: boolean,
  holidayDates: string[] = []
): number {
  if (!fromDate || !toDate) return 0;
  const start = new Date(`${fromDate}T00:00:00Z`);
  const end = new Date(`${toDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return 0;
  }
  if (isHalfDay) {
    return fromDate === toDate ? 0.5 : 0.5;
  }

  const holidaySet = new Set(holidayDates);
  let count = 0;
  const cursor = new Date(start.getTime());
  while (cursor <= end) {
    const dayOfWeek = cursor.getUTCDay();
    const iso = cursor.toISOString().slice(0, 10);
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidaySet.has(iso)) {
      count += 1;
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}

export function validateLeaveApplication(
  input: {
    leaveKey: LeaveCategoryKey;
    fromDate: string;
    toDate: string;
    isHalfDay: boolean;
    reason: string;
  },
  balances: LeaveBalanceItem[],
  holidayDates: string[] = []
): { valid: boolean; days: number; error?: string } {
  if (!input.fromDate || !input.toDate) {
    return { valid: false, days: 0, error: 'Select both start and end dates.' };
  }
  if (input.toDate < input.fromDate) {
    return { valid: false, days: 0, error: 'End date cannot be earlier than start date.' };
  }
  if (input.isHalfDay && input.fromDate !== input.toDate) {
    return { valid: false, days: 0, error: 'Half-day leave must be on a single date.' };
  }
  const days = calculateLeaveDays(input.fromDate, input.toDate, input.isHalfDay, holidayDates);
  if (days <= 0) {
    return {
      valid: false,
      days: 0,
      error: 'Selected dates fall only on weekends or company holidays.',
    };
  }
  if (input.reason.trim().length < 5) {
    return { valid: false, days, error: 'Please enter a brief reason (min 5 characters).' };
  }
  const balance = balances.find((b) => b.key === input.leaveKey);
  if (input.leaveKey !== 'unpaid' && balance && days > balance.remaining) {
    return {
      valid: false,
      days,
      error: `Requested ${days} day(s) exceeds remaining ${balance.label} (${balance.remaining}).`,
    };
  }
  return { valid: true, days };
}

export function computeEmployeeAttendanceMetrics(
  records: EmployeeAttendanceRecord[],
  todaySession: TodayAttendanceSession
): {
  attendanceRatePct: number;
  presentDays: number;
  lateDays: number;
  leaveDays: number;
  totalWorkingDays: number;
} {
  const workingRecords = records.filter((r) => r.status !== 'Holiday');
  const presentRecords = workingRecords.filter(
    (r) => r.status === 'Present' || r.status === 'Late' || r.status === 'Half-Day'
  );
  const lateRecords = workingRecords.filter((r) => r.status === 'Late');
  const leaveRecords = workingRecords.filter((r) => r.status === 'Leave');

  const todayPresentIncrement =
    todaySession.status === 'Checked In' || todaySession.status === 'Checked Out' ? 1 : 0;

  const totalWorkingDays = workingRecords.length + todayPresentIncrement;
  const presentDays = presentRecords.length + todayPresentIncrement;

  if (totalWorkingDays <= 0) {
    return {
      attendanceRatePct: 100,
      presentDays: 0,
      lateDays: 0,
      leaveDays: 0,
      totalWorkingDays: 0,
    };
  }

  const attendanceRatePct = Math.round((presentDays / totalWorkingDays) * 100);
  return {
    attendanceRatePct: Math.min(100, attendanceRatePct),
    presentDays,
    lateDays: lateRecords.length,
    leaveDays: leaveRecords.length,
    totalWorkingDays,
  };
}

export function formatElapsedShiftDuration(
  checkInIso: string | null,
  checkOutIso: string | null,
  nowMs: number = Date.now()
): string {
  if (!checkInIso) return '00h 00m';
  const startMs = Date.parse(checkInIso);
  if (Number.isNaN(startMs)) return '00h 00m';
  const endMs = checkOutIso ? Date.parse(checkOutIso) : nowMs;
  const diffSecs = Math.max(0, Math.floor((endMs - startMs) / 1000));
  const hrs = Math.floor(diffSecs / 3600);
  const mins = Math.floor((diffSecs % 3600) / 60);
  const secs = diffSecs % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return checkOutIso ? `${pad(hrs)}h ${pad(mins)}m` : `${pad(hrs)}h ${pad(mins)}m ${pad(secs)}s`;
}

export function computeSuggestedLastWorkingDay(
  submittedIso: string,
  noticePeriodDays: number
): string {
  const base = new Date(`${submittedIso}T00:00:00Z`);
  if (Number.isNaN(base.getTime())) {
    return submittedIso;
  }
  const safeDays = Math.max(0, Math.round(noticePeriodDays));
  base.setUTCDate(base.getUTCDate() + safeDays);
  return base.toISOString().slice(0, 10);
}

export function validateResignationSubmission(input: {
  requestedLastWorkingDay: string;
  reasonCategory: EmployeeExitReasonCategory | '';
  handoverTo: string;
  notes: string;
  todayIso?: string;
}): { valid: boolean; error?: string } {
  if (!input.reasonCategory) {
    return { valid: false, error: 'Select a primary resignation reason.' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.requestedLastWorkingDay.trim())) {
    return { valid: false, error: 'Enter Last Working Day in YYYY-MM-DD format.' };
  }
  const todayIso = input.todayIso || new Date().toISOString().slice(0, 10);
  if (input.requestedLastWorkingDay.trim() <= todayIso) {
    return { valid: false, error: 'Requested Last Working Day must be a future date.' };
  }
  if (input.handoverTo.trim().length < 2) {
    return { valid: false, error: 'Specify a Knowledge Transfer (KT) handover owner.' };
  }
  if (input.notes.trim().length < 10) {
    return { valid: false, error: 'Please provide brief resignation notes (min 10 characters).' };
  }
  return { valid: true };
}

export function computeExitClearanceProgress(
  tasks: EmployeeExitClearanceTask[]
): { completed: number; total: number; pct: number } {
  const total = tasks.length;
  if (total === 0) {
    return { completed: 0, total: 0, pct: 0 };
  }
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  return {
    completed,
    total,
    pct: Math.round((completed / total) * 100),
  };
}

export function aggregateEmployeeRequests(
  state: Pick<
    EmployeePortalState,
    'leaveRequests' | 'shiftChangeRequests' | 'expenseClaims' | 'helpdeskTickets'
  > & { exitManagement?: EmployeeExitState }
): {
  counts: {
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  };
  items: UnifiedEmployeeRequestItem[];
} {
  const mapStatus = (
    raw: string
  ): 'Pending' | 'Approved' | 'Rejected' | null => {
    if (raw === 'Cancelled') return null;
    if (raw === 'Approved' || raw === 'Paid' || raw === 'Resolved') return 'Approved';
    if (raw === 'Rejected') return 'Rejected';
    return 'Pending';
  };

  const items: UnifiedEmployeeRequestItem[] = [];

  for (const lr of state.leaveRequests) {
    const st = mapStatus(lr.status);
    if (!st) continue;
    items.push({
      id: lr.id,
      kind: 'Leave',
      title: `${lr.leaveType} (${lr.days} ${lr.days === 1 ? 'day' : 'days'})`,
      subtitle: `${lr.fromDate} → ${lr.toDate}`,
      dateLabel: lr.appliedAt,
      status: st,
    });
  }

  for (const sc of state.shiftChangeRequests) {
    const st = mapStatus(sc.status);
    if (!st) continue;
    items.push({
      id: sc.id,
      kind: 'Shift Change',
      title: `Shift → ${sc.requestedShift}`,
      subtitle: `Effective ${sc.effectiveDate}`,
      dateLabel: sc.submittedAt,
      status: st,
    });
  }

  for (const ex of state.expenseClaims) {
    const st = mapStatus(ex.status);
    if (!st) continue;
    items.push({
      id: ex.id,
      kind: 'Expense',
      title: `${ex.title} (₹${ex.amount.toLocaleString('en-IN')})`,
      subtitle: ex.category,
      dateLabel: ex.submittedAt,
      status: st,
    });
  }

  for (const tk of state.helpdeskTickets) {
    const st = mapStatus(tk.status);
    if (!st) continue;
    items.push({
      id: tk.id,
      kind: 'Helpdesk',
      title: tk.subject,
      subtitle: `${tk.ticketNumber} · ${tk.category}`,
      dateLabel: tk.createdAt,
      status: st,
    });
  }

  if (
    state.exitManagement &&
    (state.exitManagement.status === 'Resignation Submitted' ||
      state.exitManagement.status === 'Notice Period Active' ||
      state.exitManagement.status === 'Clearance In Progress')
  ) {
    items.push({
      id: 'EXIT-SELF-01',
      kind: 'Exit',
      title: `Resignation (${state.exitManagement.reasonCategory || 'Separation'})`,
      subtitle: `Requested LWD ${state.exitManagement.requestedLastWorkingDay || 'Pending'}`,
      dateLabel: state.exitManagement.submittedDate || 'Just now',
      status: 'Pending',
    });
  }

  const pending = items.filter((i) => i.status === 'Pending').length;
  const approved = items.filter((i) => i.status === 'Approved').length;
  const rejected = items.filter((i) => i.status === 'Rejected').length;

  return {
    counts: {
      pending,
      approved,
      rejected,
      total: items.length,
    },
    items,
  };
}

export function computePayslipTotals(payslip: Pick<EmployeePayslip, 'earnings' | 'deductions' | 'reimbursements'>): {
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
} {
  const grossEarnings = payslip.earnings.reduce((sum, item) => sum + item.amount, 0);
  const totalDeductions = payslip.deductions.reduce((sum, item) => sum + item.amount, 0);
  const netPay = grossEarnings + payslip.reimbursements - totalDeductions;
  return {
    grossEarnings,
    totalDeductions,
    netPay,
  };
}

export function getTotalRemainingLeaves(balances: LeaveBalanceItem[]): number {
  return balances
    .filter((b) => b.key !== 'unpaid')
    .reduce((sum, b) => sum + Math.max(0, b.remaining), 0);
}

export function createInitialEmployeePortalState(overrides?: {
  employeeId?: string;
  fullName?: string;
  email?: string;
}): EmployeePortalState {
  const employeeId = overrides?.employeeId || 'EMP-2048';
  const fullName = overrides?.fullName || 'Rohan Kulkarni';
  const email = overrides?.email || 'rohan.kulkarni@ofc360.com';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'RK';

  const todayIso = new Date().toISOString().slice(0, 10);

  return {
    profile: {
      employeeId,
      fullName,
      email,
      phone: '+91 98450 22918',
      designation: 'Senior Product Engineer',
      department: 'Engineering',
      location: 'Bengaluru · Global HQ',
      reportingManager: 'Ananya Verma (VP Engineering)',
      dateOfJoining: '2024-03-18',
      bloodGroup: 'O+',
      avatarInitials: initials,
      workMode: 'Hybrid',
      emergencyContactName: 'Priya Kulkarni',
      emergencyContactRelation: 'Spouse',
      emergencyContactPhone: '+91 98450 88712',
      address: '214 Koramangala 4th Block, Bengaluru 560034',
      bankName: 'HDFC Bank',
      bankAccountMasked: '•••• 6194',
      ifscCode: 'HDFC0001204',
      panMasked: 'ABCDE••••K',
      uanNumber: '100948271645',
    },
    todaySession: {
      dateIso: todayIso,
      status: 'Not Checked In',
      checkInTime: null,
      checkInIso: null,
      checkOutTime: null,
      checkOutIso: null,
      workMode: 'Office',
      locationLabel: 'Bengaluru HQ · Indiranagar Tower B',
      geofenceVerified: false,
    },
    attendanceRecords: [
      {
        id: 'ATT-24',
        dateIso: '2026-11-12',
        displayDate: 'Nov 12, 2026',
        dayName: 'Thu',
        status: 'Present',
        checkIn: '09:24 AM',
        checkOut: '06:38 PM',
        totalHours: '09h 14m',
        workMode: 'Office',
        location: 'Bengaluru HQ · Gate 2',
      },
      {
        id: 'ATT-23',
        dateIso: '2026-11-11',
        displayDate: 'Nov 11, 2026',
        dayName: 'Wed',
        status: 'Present',
        checkIn: '09:28 AM',
        checkOut: '06:32 PM',
        totalHours: '09h 04m',
        workMode: 'WFH',
        location: 'Remote · Bengaluru',
      },
      {
        id: 'ATT-22',
        dateIso: '2026-11-10',
        displayDate: 'Nov 10, 2026',
        dayName: 'Tue',
        status: 'Late',
        checkIn: '09:52 AM',
        checkOut: '06:55 PM',
        totalHours: '09h 03m',
        workMode: 'Office',
        location: 'Bengaluru HQ · Gate 1',
      },
      {
        id: 'ATT-21',
        dateIso: '2026-11-09',
        displayDate: 'Nov 09, 2026',
        dayName: 'Mon',
        status: 'Holiday',
        checkIn: '--',
        checkOut: '--',
        totalHours: '00h 00m',
        workMode: 'Holiday',
        location: 'Govardhan Puja',
      },
      {
        id: 'ATT-20',
        dateIso: '2026-11-06',
        displayDate: 'Nov 06, 2026',
        dayName: 'Fri',
        status: 'Present',
        checkIn: '09:18 AM',
        checkOut: '06:29 PM',
        totalHours: '09h 11m',
        workMode: 'Office',
        location: 'Bengaluru HQ · Gate 1',
      },
      {
        id: 'ATT-19',
        dateIso: '2026-11-05',
        displayDate: 'Nov 05, 2026',
        dayName: 'Thu',
        status: 'Present',
        checkIn: '09:21 AM',
        checkOut: '06:35 PM',
        totalHours: '09h 14m',
        workMode: 'WFH',
        location: 'Remote · Bengaluru',
      },
      {
        id: 'ATT-18',
        dateIso: '2026-11-04',
        displayDate: 'Nov 04, 2026',
        dayName: 'Wed',
        status: 'Half-Day',
        checkIn: '09:25 AM',
        checkOut: '01:45 PM',
        totalHours: '04h 20m',
        workMode: 'Office',
        location: 'Bengaluru HQ · Gate 2',
      },
      {
        id: 'ATT-17',
        dateIso: '2026-11-03',
        displayDate: 'Nov 03, 2026',
        dayName: 'Tue',
        status: 'Present',
        checkIn: '09:16 AM',
        checkOut: '06:31 PM',
        totalHours: '09h 15m',
        workMode: 'Office',
        location: 'Bengaluru HQ · Gate 1',
      },
      {
        id: 'ATT-16',
        dateIso: '2026-11-02',
        displayDate: 'Nov 02, 2026',
        dayName: 'Mon',
        status: 'Present',
        checkIn: '09:29 AM',
        checkOut: '06:40 PM',
        totalHours: '09h 11m',
        workMode: 'Office',
        location: 'Bengaluru HQ · Gate 1',
      },
      {
        id: 'ATT-15',
        dateIso: '2026-10-30',
        displayDate: 'Oct 30, 2026',
        dayName: 'Fri',
        status: 'Present',
        checkIn: '09:20 AM',
        checkOut: '06:34 PM',
        totalHours: '09h 14m',
        workMode: 'Office',
        location: 'Bengaluru HQ · Gate 1',
      },
      {
        id: 'ATT-14',
        dateIso: '2026-10-29',
        displayDate: 'Oct 29, 2026',
        dayName: 'Thu',
        status: 'Present',
        checkIn: '09:18 AM',
        checkOut: '06:30 PM',
        totalHours: '09h 12m',
        workMode: 'WFH',
        location: 'Remote · Bengaluru',
      },
      {
        id: 'ATT-13',
        dateIso: '2026-10-28',
        displayDate: 'Oct 28, 2026',
        dayName: 'Wed',
        status: 'Present',
        checkIn: '09:26 AM',
        checkOut: '06:39 PM',
        totalHours: '09h 13m',
        workMode: 'Office',
        location: 'Bengaluru HQ · Gate 2',
      },
      {
        id: 'ATT-12',
        dateIso: '2026-10-27',
        displayDate: 'Oct 27, 2026',
        dayName: 'Tue',
        status: 'Present',
        checkIn: '09:22 AM',
        checkOut: '06:31 PM',
        totalHours: '09h 09m',
        workMode: 'Office',
        location: 'Bengaluru HQ · Gate 1',
      },
      {
        id: 'ATT-11',
        dateIso: '2026-10-26',
        displayDate: 'Oct 26, 2026',
        dayName: 'Mon',
        status: 'Present',
        checkIn: '09:15 AM',
        checkOut: '06:28 PM',
        totalHours: '09h 13m',
        workMode: 'Office',
        location: 'Bengaluru HQ · Gate 1',
      },
      {
        id: 'ATT-10',
        dateIso: '2026-10-23',
        displayDate: 'Oct 23, 2026',
        dayName: 'Fri',
        status: 'Present',
        checkIn: '09:24 AM',
        checkOut: '06:36 PM',
        totalHours: '09h 12m',
        workMode: 'WFH',
        location: 'Remote · Bengaluru',
      },
      {
        id: 'ATT-09',
        dateIso: '2026-10-22',
        displayDate: 'Oct 22, 2026',
        dayName: 'Thu',
        status: 'Present',
        checkIn: '09:21 AM',
        checkOut: '06:33 PM',
        totalHours: '09h 12m',
        workMode: 'Office',
        location: 'Bengaluru HQ · Gate 1',
      },
      {
        id: 'ATT-08',
        dateIso: '2026-10-21',
        displayDate: 'Oct 21, 2026',
        dayName: 'Wed',
        status: 'Present',
        checkIn: '09:27 AM',
        checkOut: '06:41 PM',
        totalHours: '09h 14m',
        workMode: 'Office',
        location: 'Bengaluru HQ · Gate 2',
      },
      {
        id: 'ATT-07',
        dateIso: '2026-10-20',
        displayDate: 'Oct 20, 2026',
        dayName: 'Tue',
        status: 'Present',
        checkIn: '09:19 AM',
        checkOut: '06:30 PM',
        totalHours: '09h 11m',
        workMode: 'Office',
        location: 'Bengaluru HQ · Gate 1',
      },
      {
        id: 'ATT-06',
        dateIso: '2026-10-19',
        displayDate: 'Oct 19, 2026',
        dayName: 'Mon',
        status: 'Present',
        checkIn: '09:23 AM',
        checkOut: '06:34 PM',
        totalHours: '09h 11m',
        workMode: 'Office',
        location: 'Bengaluru HQ · Gate 1',
      },
      {
        id: 'ATT-05',
        dateIso: '2026-10-16',
        displayDate: 'Oct 16, 2026',
        dayName: 'Fri',
        status: 'Present',
        checkIn: '09:25 AM',
        checkOut: '06:37 PM',
        totalHours: '09h 12m',
        workMode: 'WFH',
        location: 'Remote · Bengaluru',
      },
      {
        id: 'ATT-04',
        dateIso: '2026-10-15',
        displayDate: 'Oct 15, 2026',
        dayName: 'Thu',
        status: 'Leave',
        checkIn: '--',
        checkOut: '--',
        totalHours: '00h 00m',
        workMode: 'Office',
        location: 'Approved Sick Leave',
      },
      {
        id: 'ATT-03',
        dateIso: '2026-10-13',
        displayDate: 'Oct 13, 2026',
        dayName: 'Tue',
        status: 'Present',
        checkIn: '09:20 AM',
        checkOut: '06:31 PM',
        totalHours: '09h 11m',
        workMode: 'Office',
        location: 'Bengaluru HQ · Gate 1',
      },
      {
        id: 'ATT-02',
        dateIso: '2026-10-12',
        displayDate: 'Oct 12, 2026',
        dayName: 'Mon',
        status: 'Present',
        checkIn: '09:17 AM',
        checkOut: '06:29 PM',
        totalHours: '09h 12m',
        workMode: 'Office',
        location: 'Bengaluru HQ · Gate 1',
      },
      {
        id: 'ATT-01',
        dateIso: '2026-10-09',
        displayDate: 'Oct 09, 2026',
        dayName: 'Fri',
        status: 'Present',
        checkIn: '09:22 AM',
        checkOut: '06:33 PM',
        totalHours: '09h 11m',
        workMode: 'Office',
        location: 'Bengaluru HQ · Gate 2',
      },
      {
        id: 'ATT-00',
        dateIso: '2026-10-08',
        displayDate: 'Oct 08, 2026',
        dayName: 'Thu',
        status: 'Present',
        checkIn: '09:24 AM',
        checkOut: '06:35 PM',
        totalHours: '09h 11m',
        workMode: 'Office',
        location: 'Bengaluru HQ · Gate 1',
      },
    ],
    shiftAssignment: {
      shiftId: 'SHF-GS-01',
      shiftName: 'General Day Shift',
      shiftCode: 'GS',
      startTime: '09:30 AM',
      endTime: '06:30 PM',
      breakDuration: '60 mins (01:00 PM – 02:00 PM)',
      weeklyOffDays: ['Saturday', 'Sunday'],
      gracePeriodMins: 15,
      allowance: '₹0 / day (Standard)',
      effectiveFrom: 'Jan 01, 2026',
    },
    rosterDays: [
      {
        day: 'Mon',
        dateIso: '2026-11-09',
        displayDate: 'Nov 09',
        shiftCode: 'GS',
        shiftTitle: 'General Shift',
        timing: '09:30 AM – 06:30 PM',
        workMode: 'Office',
      },
      {
        day: 'Tue',
        dateIso: '2026-11-10',
        displayDate: 'Nov 10',
        shiftCode: 'GS',
        shiftTitle: 'General Shift',
        timing: '09:30 AM – 06:30 PM',
        workMode: 'Office',
      },
      {
        day: 'Wed',
        dateIso: '2026-11-11',
        displayDate: 'Nov 11',
        shiftCode: 'FLX',
        shiftTitle: 'Hybrid Flex',
        timing: '09:30 AM – 06:30 PM',
        workMode: 'WFH',
      },
      {
        day: 'Thu',
        dateIso: '2026-11-12',
        displayDate: 'Nov 12',
        shiftCode: 'GS',
        shiftTitle: 'General Shift',
        timing: '09:30 AM – 06:30 PM',
        workMode: 'Office',
      },
      {
        day: 'Fri',
        dateIso: '2026-11-13',
        displayDate: 'Nov 13',
        shiftCode: 'FLX',
        shiftTitle: 'Hybrid Flex',
        timing: '09:30 AM – 06:30 PM',
        workMode: 'WFH',
      },
      {
        day: 'Sat',
        dateIso: '2026-11-14',
        displayDate: 'Nov 14',
        shiftCode: 'OFF',
        shiftTitle: 'Weekly Off',
        timing: 'Rest Day',
        workMode: 'Weekly Off',
      },
      {
        day: 'Sun',
        dateIso: '2026-11-15',
        displayDate: 'Nov 15',
        shiftCode: 'OFF',
        shiftTitle: 'Weekly Off',
        timing: 'Rest Day',
        workMode: 'Weekly Off',
      },
    ],
    shiftChangeRequests: [
      {
        id: 'SCR-101',
        employeeId,
        currentShift: 'General Day Shift (GS)',
        requestedShift: 'Flexible Hybrid (FLX)',
        effectiveDate: '2026-11-18',
        reason: 'Coordinate release handoff with EU product team.',
        status: 'Pending',
        submittedAt: 'Nov 11, 2026',
      },
    ],
    leaveBalances: [
      {
        key: 'earned',
        label: 'Earned / Privilege Leave',
        code: 'EL',
        total: 15,
        used: 4,
        remaining: 11,
        accrualNote: '+1.25 days / month · Carry forward up to 30',
      },
      {
        key: 'casual',
        label: 'Casual Leave',
        code: 'CL',
        total: 8,
        used: 3,
        remaining: 5,
        accrualNote: 'Credited annually · Max 3 consecutive days',
      },
      {
        key: 'sick',
        label: 'Sick / Medical Leave',
        code: 'SL',
        total: 8,
        used: 2,
        remaining: 6,
        accrualNote: 'Medical proof needed for >2 consecutive days',
      },
      {
        key: 'unpaid',
        label: 'Loss of Pay / Unpaid',
        code: 'LOP',
        total: 0,
        used: 0,
        remaining: 0,
        accrualNote: 'Only applied when paid leave balance is exhausted',
      },
    ],
    leaveRequests: [
      {
        id: 'LEV-302',
        employeeId,
        leaveKey: 'casual',
        leaveType: 'Casual Leave',
        fromDate: '2026-11-27',
        toDate: '2026-11-27',
        isHalfDay: false,
        days: 1,
        reason: 'Family travel to Mysuru for sister’s convocation.',
        status: 'Pending',
        appliedAt: 'Nov 12, 2026',
      },
      {
        id: 'LEV-289',
        employeeId,
        leaveKey: 'sick',
        leaveType: 'Sick / Medical Leave',
        fromDate: '2026-10-14',
        toDate: '2026-10-15',
        isHalfDay: false,
        days: 2,
        reason: 'Viral fever recovery and rest.',
        status: 'Approved',
        appliedAt: 'Oct 14, 2026',
      },
    ],
    payslips: [
      {
        id: 'PAY-2026-10',
        monthLabel: 'October 2026',
        payPeriod: '01 Oct 2026 – 31 Oct 2026',
        payDate: 'Oct 30, 2026',
        paymentStatus: 'Credited',
        ctcAnnual: 1800000,
        earnings: [
          { label: 'Basic Salary', amount: 75000 },
          { label: 'House Rent Allowance (HRA)', amount: 30000 },
          { label: 'Special & Skill Allowance', amount: 35000 },
          { label: 'Conveyance & Meal Card', amount: 10000 },
        ],
        deductions: [
          { label: 'Employee Provident Fund (EPF)', amount: 9000 },
          { label: 'Income Tax (TDS)', amount: 11250 },
          { label: 'Professional Tax (PT)', amount: 200 },
        ],
        reimbursements: 2400,
        taxRegime: 'New Regime',
        tdsDeducted: 11250,
        bankAccountMasked: 'HDFC •••• 6194',
      },
      {
        id: 'PAY-2026-09',
        monthLabel: 'September 2026',
        payPeriod: '01 Sep 2026 – 30 Sep 2026',
        payDate: 'Sep 30, 2026',
        paymentStatus: 'Credited',
        ctcAnnual: 1800000,
        earnings: [
          { label: 'Basic Salary', amount: 75000 },
          { label: 'House Rent Allowance (HRA)', amount: 30000 },
          { label: 'Special & Skill Allowance', amount: 35000 },
          { label: 'Conveyance & Meal Card', amount: 10000 },
        ],
        deductions: [
          { label: 'Employee Provident Fund (EPF)', amount: 9000 },
          { label: 'Income Tax (TDS)', amount: 11250 },
          { label: 'Professional Tax (PT)', amount: 200 },
        ],
        reimbursements: 0,
        taxRegime: 'New Regime',
        tdsDeducted: 11250,
        bankAccountMasked: 'HDFC •••• 6194',
      },
      {
        id: 'PAY-2026-08',
        monthLabel: 'August 2026',
        payPeriod: '01 Aug 2026 – 31 Aug 2026',
        payDate: 'Aug 31, 2026',
        paymentStatus: 'Credited',
        ctcAnnual: 1800000,
        earnings: [
          { label: 'Basic Salary', amount: 75000 },
          { label: 'House Rent Allowance (HRA)', amount: 30000 },
          { label: 'Special & Skill Allowance', amount: 35000 },
          { label: 'Conveyance & Meal Card', amount: 10000 },
        ],
        deductions: [
          { label: 'Employee Provident Fund (EPF)', amount: 9000 },
          { label: 'Income Tax (TDS)', amount: 11250 },
          { label: 'Professional Tax (PT)', amount: 200 },
        ],
        reimbursements: 1850,
        taxRegime: 'New Regime',
        tdsDeducted: 11250,
        bankAccountMasked: 'HDFC •••• 6194',
      },
    ],
    hrLetters: [
      {
        id: 'LTR-01',
        title: 'Annual Compensation Revision & Increment Letter (FY 2026–27)',
        category: 'Appraisal',
        issuedDate: 'Apr 01, 2026',
        referenceCode: 'OFC360/HR/APR-2026/2048',
        summary: 'Revised annual CTC ₹18,00,000 effective April 1, 2026 with Senior Product Engineer band.',
        requiresAcknowledgment: false,
        acknowledged: true,
        acknowledgedAt: 'Apr 03, 2026',
      },
      {
        id: 'LTR-02',
        title: 'Hybrid Work & Information Security Policy 2026',
        category: 'Policy',
        issuedDate: 'Oct 15, 2026',
        referenceCode: 'OFC360/POL/SEC-2026',
        summary: 'Updated SOC2 device compliance, VPN hygiene, and 3-days-a-week office collaboration guidelines.',
        requiresAcknowledgment: true,
        acknowledged: false,
      },
      {
        id: 'LTR-03',
        title: 'Employment Appointment & Confirmation Letter',
        category: 'Appointment',
        issuedDate: 'Mar 18, 2024',
        referenceCode: 'OFC360/HR/EMP-2048',
        summary: 'Permanent full-time employment terms and probation completion confirmation.',
        requiresAcknowledgment: false,
        acknowledged: true,
        acknowledgedAt: 'Mar 19, 2024',
      },
      {
        id: 'LTR-04',
        title: 'Original Offer of Employment',
        category: 'Offer',
        issuedDate: 'Feb 12, 2024',
        referenceCode: 'OFC360/OFFER/2024/812',
        summary: 'Signed offer letter accepted prior to onboarding.',
        requiresAcknowledgment: false,
        acknowledged: true,
        acknowledgedAt: 'Feb 14, 2024',
      },
    ],
    kycDocuments: [
      {
        id: 'KYC-01',
        docType: 'Aadhaar Card',
        documentNumberMasked: 'XXXX-XXXX-8412',
        fileName: 'aadhaar_verified_2024.pdf',
        uploadedAt: 'Mar 18, 2024',
        status: 'Verified',
      },
      {
        id: 'KYC-02',
        docType: 'PAN Card',
        documentNumberMasked: 'ABCDE••••K',
        fileName: 'pan_rohan_kulkarni.pdf',
        uploadedAt: 'Mar 18, 2024',
        status: 'Verified',
      },
      {
        id: 'KYC-03',
        docType: 'Passport',
        documentNumberMasked: 'Z481••••9',
        fileName: 'passport_scan_front.pdf',
        uploadedAt: 'Oct 02, 2026',
        status: 'Pending',
        reviewerNote: 'Awaiting HR immigration desk check.',
      },
      {
        id: 'KYC-04',
        docType: 'Education Certificate',
        documentNumberMasked: 'B.Tech CSE · 2019',
        fileName: 'degree_certificate_blurry.jpg',
        uploadedAt: 'Sep 20, 2026',
        status: 'Rejected',
        reviewerNote: 'Seal unreadable — please re-upload clear PDF scan.',
      },
    ],
    assignedAssets: [
      {
        id: 'AST-101',
        assetTag: 'OFC-MBP-0842',
        name: 'Apple MacBook Pro 14" (M3 Pro, 36GB)',
        category: 'Laptop',
        serialNumber: 'C02YM4Q8JGH5',
        assignedDate: 'Mar 18, 2024',
        condition: 'Excellent',
      },
      {
        id: 'AST-102',
        assetTag: 'OFC-RFID-2048',
        name: 'HID Proximity Campus Access Badge',
        category: 'Access Badge',
        serialNumber: 'HID-9920-4821',
        assignedDate: 'Mar 18, 2024',
        condition: 'Good',
      },
      {
        id: 'AST-103',
        assetTag: 'OFC-MON-0411',
        name: 'Dell UltraSharp 27" 4K USB-C Hub Monitor',
        category: 'Monitor',
        serialNumber: 'DL-27U-88124',
        assignedDate: 'May 10, 2024',
        condition: 'Excellent',
      },
    ],
    expenseClaims: [
      {
        id: 'EXP-412',
        employeeId,
        title: 'Broadband Fiber Monthly Reimbursement',
        category: 'Internet & Phone',
        expenseDate: '2026-11-05',
        amount: 1499,
        receiptName: 'act_fibernet_nov26.pdf',
        notes: 'Monthly WFH broadband plan bill.',
        status: 'Pending',
        submittedAt: 'Nov 06, 2026',
      },
      {
        id: 'EXP-398',
        employeeId,
        title: 'Client Architecture Workshop Cab Fare',
        category: 'Travel',
        expenseDate: '2026-10-22',
        amount: 2400,
        receiptName: 'uber_trip_oct22.pdf',
        notes: 'Round-trip airport transfer for client review.',
        status: 'Approved',
        submittedAt: 'Oct 24, 2026',
      },
    ],
    travelRequests: [
      {
        id: 'TRV-704',
        employeeId,
        destination: 'Mumbai · BKC Enterprise Hub',
        purpose: 'Q4 Security & Payments Architecture Summit',
        departureDate: '2026-11-24',
        returnDate: '2026-11-26',
        mode: 'Flight',
        estimatedBudget: 18500,
        itinerarySummary: 'IndiGo 6E-512 BLR→BOM · Trident BKC Stay',
        status: 'Approved',
        submittedAt: 'Nov 04, 2026',
      },
    ],
    helpdeskTickets: [
      {
        id: 'TKT-882',
        ticketNumber: 'HD-2026-882',
        employeeId,
        category: 'IT & Hardware',
        priority: 'Medium',
        subject: 'Docker Desktop Enterprise License Renewal',
        description: 'Current seat expires on Nov 20; requesting annual enterprise license key.',
        status: 'Pending',
        createdAt: 'Nov 10, 2026',
        replies: [
          {
            id: 'REP-1',
            sender: 'Employee',
            senderName: fullName,
            message: 'Current seat expires on Nov 20; requesting annual enterprise license key.',
            timestamp: 'Nov 10 · 11:20 AM',
          },
          {
            id: 'REP-2',
            sender: 'Support Agent',
            senderName: 'Vikram Nair · IT Desk',
            message: 'Procurement batch queued — provisioning key will be assigned today.',
            timestamp: 'Nov 11 · 02:15 PM',
          },
        ],
      },
    ],
    chatThreads: [
      {
        id: 'CHT-01',
        contactName: 'Ananya Verma',
        roleTitle: 'VP Engineering',
        department: 'Engineering',
        initials: 'AV',
        statusText: 'Online · Bengaluru HQ',
        unreadCount: 1,
        messages: [
          {
            id: 'MSG-1',
            sender: 'them',
            text: 'Hey Rohan, thanks for pushing the Q4 API latency benchmarks ahead of schedule!',
            time: '10:15 AM',
          },
        ],
      },
      {
        id: 'CHT-02',
        contactName: 'People Ops Desk',
        roleTitle: 'HR Support Channel',
        department: 'People Operations',
        initials: 'PO',
        statusText: 'Active · SLA < 2h',
        unreadCount: 0,
        messages: [
          {
            id: 'MSG-2',
            sender: 'them',
            text: 'Welcome to OFC360 Self-Service! Message here for quick payroll or policy queries.',
            time: 'Yesterday',
          },
        ],
      },
    ],
    onboardingTasks: [
      {
        id: 'ONB-01',
        title: 'Verify Aadhaar & PAN in Personal KYC Vault',
        category: 'Identity & KYC',
        dueDate: 'Completed',
        completed: true,
      },
      {
        id: 'ONB-02',
        title: 'Acknowledge Hybrid Work & InfoSec Policy 2026',
        category: 'Compliance',
        dueDate: 'Nov 18, 2026',
        completed: false,
      },
      {
        id: 'ONB-03',
        title: 'Confirm Primary Salary Bank Account & UAN Link',
        category: 'Identity & KYC',
        dueDate: 'Completed',
        completed: true,
      },
      {
        id: 'ONB-04',
        title: 'Complete Annual POSH & Security Awareness Module',
        category: 'Compliance',
        dueDate: 'Nov 30, 2026',
        completed: false,
      },
    ],
    exitManagement: {
      status: 'Active Employment',
      noticePeriodDays: 60,
      submittedDate: null,
      requestedLastWorkingDay: null,
      approvedLastWorkingDay: null,
      reasonCategory: null,
      notes: '',
      handoverTo: 'Vikram Nair (Staff Engineer)',
      clearanceTasks: [
        {
          id: 'CLR-01',
          department: 'Manager KT',
          title: 'Complete Sprint & Codebase Knowledge Transfer Docs',
          owner: 'Ananya Verma (VP Engineering)',
          status: 'Pending',
          employeeActionable: true,
        },
        {
          id: 'CLR-02',
          department: 'IT & Assets',
          title: 'Schedule Return of MacBook Pro, Monitor & Campus Badge',
          owner: 'IT Asset Desk',
          status: 'Pending',
          employeeActionable: true,
        },
        {
          id: 'CLR-03',
          department: 'Finance & FnF',
          title: 'Submit Pending Reimbursements & Confirm Bank Details',
          owner: 'Payroll & FnF Compliance',
          status: 'Pending',
          employeeActionable: true,
        },
        {
          id: 'CLR-04',
          department: 'HR & Admin',
          title: 'Complete Confidential Exit Interview & Relieving Sign-off',
          owner: 'People Operations',
          status: 'Pending',
          employeeActionable: false,
        },
      ],
      fnfEstimate: {
        leaveEncashmentDays: 11,
        leaveEncashmentAmount: 27500,
        pendingReimbursements: 1499,
        proRataSalaryEstimate: 131950,
        estimatedNetSettlement: 160949,
        settlementTimeline: 'Within 45 days post Last Working Day',
      },
      exitInterviewSubmitted: false,
      exitInterviewRating: 0,
      exitInterviewFeedback: '',
    },
    notifications: [
      {
        id: 'ENOT-01',
        title: 'Mumbai Business Travel Approved',
        message: 'TRV-704 (Nov 24–26) approved by Ananya Verma. Flight voucher ready.',
        timestamp: '2h ago',
        category: 'Approval',
        read: false,
      },
      {
        id: 'ENOT-02',
        title: 'October 2026 Payslip Available',
        message: 'Net salary ₹1,31,950 credited to HDFC •••• 6194. Download PDF anytime.',
        timestamp: '1d ago',
        category: 'Payroll',
        read: false,
      },
      {
        id: 'ENOT-03',
        title: 'Policy Acknowledgment Required',
        message: 'Review Hybrid Work & InfoSec Policy 2026 under Payroll & Docs.',
        timestamp: '3d ago',
        category: 'Announcement',
        read: true,
      },
    ],
    optionalHolidaySelections: {
      'HOL-15': true,
      'HOL-18': false,
    },
  };
}

export function loadEmployeePortalState(overrides?: {
  employeeId?: string;
  fullName?: string;
  email?: string;
}): EmployeePortalState {
  const employeeId = overrides?.employeeId || 'EMP-2048';
  const fallback = createInitialEmployeePortalState(overrides);
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(getEmployeePortalStorageKey(employeeId));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<EmployeePortalState>;
    const todayIso = new Date().toISOString().slice(0, 10);
    const savedToday =
      parsed.todaySession && parsed.todaySession.dateIso === todayIso
        ? parsed.todaySession
        : fallback.todaySession;

    return {
      ...fallback,
      ...parsed,
      profile: { ...fallback.profile, ...(parsed.profile || {}) },
      todaySession: savedToday,
      attendanceRecords: Array.isArray(parsed.attendanceRecords)
        ? parsed.attendanceRecords
        : fallback.attendanceRecords,
      shiftAssignment: { ...fallback.shiftAssignment, ...(parsed.shiftAssignment || {}) },
      rosterDays: Array.isArray(parsed.rosterDays) ? parsed.rosterDays : fallback.rosterDays,
      shiftChangeRequests: Array.isArray(parsed.shiftChangeRequests)
        ? parsed.shiftChangeRequests
        : fallback.shiftChangeRequests,
      leaveBalances: Array.isArray(parsed.leaveBalances)
        ? parsed.leaveBalances
        : fallback.leaveBalances,
      leaveRequests: Array.isArray(parsed.leaveRequests)
        ? parsed.leaveRequests
        : fallback.leaveRequests,
      payslips: Array.isArray(parsed.payslips) ? parsed.payslips : fallback.payslips,
      hrLetters: Array.isArray(parsed.hrLetters) ? parsed.hrLetters : fallback.hrLetters,
      kycDocuments: Array.isArray(parsed.kycDocuments)
        ? parsed.kycDocuments
        : fallback.kycDocuments,
      assignedAssets: Array.isArray(parsed.assignedAssets)
        ? parsed.assignedAssets
        : fallback.assignedAssets,
      expenseClaims: Array.isArray(parsed.expenseClaims)
        ? parsed.expenseClaims
        : fallback.expenseClaims,
      travelRequests: Array.isArray(parsed.travelRequests)
        ? parsed.travelRequests
        : fallback.travelRequests,
      helpdeskTickets: Array.isArray(parsed.helpdeskTickets)
        ? parsed.helpdeskTickets
        : fallback.helpdeskTickets,
      chatThreads: Array.isArray(parsed.chatThreads) ? parsed.chatThreads : fallback.chatThreads,
      onboardingTasks: Array.isArray(parsed.onboardingTasks)
        ? parsed.onboardingTasks
        : fallback.onboardingTasks,
      exitManagement: parsed.exitManagement
        ? {
            ...fallback.exitManagement,
            ...parsed.exitManagement,
            clearanceTasks: Array.isArray(parsed.exitManagement.clearanceTasks)
              ? parsed.exitManagement.clearanceTasks
              : fallback.exitManagement.clearanceTasks,
            fnfEstimate: {
              ...fallback.exitManagement.fnfEstimate,
              ...(parsed.exitManagement.fnfEstimate || {}),
            },
          }
        : fallback.exitManagement,
      notifications: Array.isArray(parsed.notifications)
        ? parsed.notifications
        : fallback.notifications,
      optionalHolidaySelections: parsed.optionalHolidaySelections || fallback.optionalHolidaySelections,
    };
  } catch {
    return fallback;
  }
}

export function saveEmployeePortalState(state: EmployeePortalState): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(
      getEmployeePortalStorageKey(state.profile.employeeId),
      JSON.stringify(state)
    );
  } catch {
    // Ignore storage quota errors
  }
}
