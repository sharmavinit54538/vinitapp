import { z } from 'zod';
import { Ofc360Role } from './auth-schemas';

export type BottomNavTab =
  | 'home'
  | 'workforce'
  | 'attendance'
  | 'approvals'
  | 'profile'
  | 'more';

export type HomeInternalTab = 'overview' | 'shifts' | 'rosters' | 'holidays';

export type ApprovalCategory =
  | 'Leave Requests'
  | 'Attendance Regularizations'
  | 'Expense Claims';

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface ApprovalItem {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  category: ApprovalCategory;
  requestType: string;
  requestDate: string;
  durationOrAmount: string;
  reason: string;
  status: ApprovalStatus;
  avatarInitials: string;
}

export interface DepartmentAttendanceMetric {
  id: string;
  department: string;
  totalEmployees: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  onLeaveCount: number;
  attendancePercentage: number;
  headOfDept: string;
}

export interface ShiftItem {
  id: string;
  name: 'Morning Shift' | 'General Shift' | 'Night Shift' | 'Flexible Shift' | string;
  code: string;
  startTime: string;
  endTime: string;
  breakDuration: string;
  assignedEmployees: number;
  allowance: string;
  status: 'Active' | 'Scheduled' | 'Inactive';
  departments: string[];
}

export interface RosterDayAssignment {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  date: string;
  shiftCode: 'MS' | 'GS' | 'NS' | 'FLX' | 'OFF';
  shiftLabel: string;
  isSwapRequested?: boolean;
}

export interface RosterEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  department: string;
  avatarInitials: string;
  currentShift: string;
  weeklyOff: string;
  swapStatus: 'None' | 'Swap Requested' | 'Swap Approved';
  swapTargetEmployee?: string;
  rosterStatus: 'Published' | 'Draft' | 'Conflict';
  schedule: RosterDayAssignment[];
}

export type HolidayCategory = 'National' | 'Regional' | 'Optional';

export interface HolidayItem {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  displayDate: string;
  month: string;
  dayOfWeek: string;
  category: HolidayCategory;
  location: string;
  description: string;
}

export type AnnouncementPriority = 'Urgent' | 'High' | 'Normal';

export interface AnnouncementItem {
  id: string;
  title: string;
  description: string;
  publishedDate: string;
  expiryDate: string;
  department: string;
  targetAudience: string;
  category: 'Policy Update' | 'Company News' | 'Payroll & Benefits' | 'Events' | 'IT & Security';
  priority: AnnouncementPriority;
  author: string;
  status: 'Published' | 'Draft';
}

export interface UpcomingJoiner {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  designation: string;
  joiningDate: string;
  location: string;
  onboardingStatus: 'Verified' | 'Docs Pending' | 'Laptop Provisioned';
  initials: string;
}

export interface UpcomingExit {
  id: string;
  employeeId: string;
  name: string;
  department: string;
  designation: string;
  lastWorkingDay: string;
  exitStatus: 'Clearance Pending' | 'Handover Active' | 'FnF Processed';
  initials: string;
}

export interface WorkforceEmployee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  location: string;
  shift: string;
  status: 'Present' | 'Late' | 'On Leave' | 'Remote';
  attendanceRate: number;
  joiningDate: string;
  initials: string;
}

export type NotificationCategory =
  | 'Leave Approvals'
  | 'Attendance Alerts'
  | 'Payroll Updates'
  | 'Recruitment Updates'
  | 'Company Announcements';

export interface HrNotificationItem {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  timestamp: string;
  read: boolean;
  actionTab?: BottomNavTab;
}

export interface AnalyticsSeriesPoint {
  label: string;
  headcount: number;
  attendanceRate: number;
  hires: number;
  attrition: number;
  payrollCostK: number;
}

export interface RecruitmentRequisition {
  id: string;
  title: string;
  department: string;
  location: string;
  openings: number;
  candidatesInPipeline: number;
  stage: 'Sourcing' | 'Technical Round' | 'Offer Extended';
  priority: 'Critical' | 'High' | 'Standard';
}

export interface PayrollCycleSummary {
  cycleName: string;
  status: 'Ready for Disbursement' | 'Processing' | 'Disbursed';
  nextPayoutDate: string;
  eligibleEmployees: number;
  netPayableFormatted: string;
  taxWithheldFormatted: string;
  complianceScore: number;
  lastRunBy: string;
}

export interface HrDashboardDataState {
  adminProfile: {
    name: string;
    email: string;
    role: Ofc360Role;
    designation: string;
    employeeId: string;
    department: string;
    location: string;
  };
  kpis: {
    workforce: {
      totalActive: number;
      growthPercentage: number;
      monthlyComparisonText: string;
      newHiresThisMonth: number;
    };
    attendance: {
      ratePercentage: number;
      present: number;
      late: number;
      onLeave: number;
      absent: number;
    };
    approvals: {
      totalPending: number;
      leaveRequests: number;
      attendanceRegularizations: number;
      expenseClaims: number;
    };
    recruitment: {
      openPositions: number;
      candidatesInPipeline: number;
      activeRequisitionsCount: number;
    };
    payroll: PayrollCycleSummary;
  };
  approvals: ApprovalItem[];
  departments: DepartmentAttendanceMetric[];
  shifts: ShiftItem[];
  rosters: RosterEntry[];
  holidays: HolidayItem[];
  announcements: AnnouncementItem[];
  joiners: UpcomingJoiner[];
  exits: UpcomingExit[];
  workforce: WorkforceEmployee[];
  notifications: HrNotificationItem[];
  requisitions: RecruitmentRequisition[];
  analytics: {
    '7D': AnalyticsSeriesPoint[];
    '30D': AnalyticsSeriesPoint[];
    '6M': AnalyticsSeriesPoint[];
    '12M': AnalyticsSeriesPoint[];
  };
}

/**
 * Zod Validation Schemas for Mobile Forms
 */
export const announcementFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(4, 'Announcement title must be at least 4 characters')
    .max(120, 'Title must be under 120 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be under 1000 characters'),
  priority: z.enum(['Urgent', 'High', 'Normal']),
  category: z.enum([
    'Policy Update',
    'Company News',
    'Payroll & Benefits',
    'Events',
    'IT & Security',
  ]),
  targetAudience: z.string().trim().min(2, 'Target audience is required'),
  department: z.string().trim().min(2, 'Target department is required'),
  expiryDate: z.string().trim().min(4, 'Expiry date is required'),
});

export type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

export const shiftFormSchema = z.object({
  name: z.string().trim().min(3, 'Shift name is required'),
  code: z.string().trim().min(2, 'Shift code is required').max(6, 'Max 6 chars'),
  startTime: z.string().trim().min(4, 'Start time is required'),
  endTime: z.string().trim().min(4, 'End time is required'),
  breakDuration: z.string().trim().min(2, 'Break duration is required'),
  allowance: z.string().trim().min(1, 'Shift allowance is required'),
  assignedEmployees: z.number().min(1, 'Assigned employees must be at least 1'),
});

export type ShiftFormValues = z.infer<typeof shiftFormSchema>;

export const holidayFormSchema = z.object({
  name: z.string().trim().min(3, 'Holiday name is required'),
  date: z.string().trim().min(8, 'Valid date is required'),
  category: z.enum(['National', 'Regional', 'Optional']),
  location: z.string().trim().min(2, 'Applicable location is required'),
  description: z.string().trim().min(4, 'Brief description is required'),
});

export type HolidayFormValues = z.infer<typeof holidayFormSchema>;

export const addEmployeeFormSchema = z.object({
  name: z.string().trim().min(2, 'Employee full name is required'),
  email: z.string().trim().email('Valid work email is required'),
  phone: z.string().trim().min(7, 'Phone number is required'),
  designation: z.string().trim().min(2, 'Designation is required'),
  department: z.string().trim().min(2, 'Department is required'),
  location: z.string().trim().min(2, 'Location is required'),
  shift: z.string().trim().min(2, 'Shift is required'),
});

export type AddEmployeeFormValues = z.infer<typeof addEmployeeFormSchema>;

/**
 * Pure Logic Helpers (Unit-Tested)
 */
export function canManageHrAdminActions(role?: Ofc360Role | string | null): boolean {
  if (!role) return false;
  const normalized = role.toLowerCase().trim();
  return (
    normalized === 'hr_admin' ||
    normalized === 'super_admin' ||
    normalized === 'manager'
  );
}

export function calculateAttendancePercentages(summary: {
  present: number;
  late: number;
  onLeave: number;
  absent: number;
}): {
  total: number;
  presentPct: number;
  latePct: number;
  onLeavePct: number;
  absentPct: number;
  effectivePresentPct: number;
} {
  const total =
    summary.present + summary.late + summary.onLeave + summary.absent;
  if (total <= 0) {
    return {
      total: 0,
      presentPct: 0,
      latePct: 0,
      onLeavePct: 0,
      absentPct: 0,
      effectivePresentPct: 0,
    };
  }
  const presentPct = Number(((summary.present / total) * 100).toFixed(1));
  const latePct = Number(((summary.late / total) * 100).toFixed(1));
  const onLeavePct = Number(((summary.onLeave / total) * 100).toFixed(1));
  const absentPct = Number(((summary.absent / total) * 100).toFixed(1));
  const effectivePresentPct = Number(
    (((summary.present + summary.late) / total) * 100).toFixed(1)
  );

  return {
    total,
    presentPct,
    latePct,
    onLeavePct,
    absentPct,
    effectivePresentPct,
  };
}

export function filterApprovals(
  items: ApprovalItem[],
  category: ApprovalCategory | 'All',
  status: ApprovalStatus | 'All' = 'All',
  searchQuery = ''
): ApprovalItem[] {
  const q = searchQuery.trim().toLowerCase();
  return items.filter((item) => {
    const matchesCategory = category === 'All' || item.category === category;
    const matchesStatus = status === 'All' || item.status === status;
    const matchesQuery =
      q === '' ||
      item.employeeName.toLowerCase().includes(q) ||
      item.employeeId.toLowerCase().includes(q) ||
      item.department.toLowerCase().includes(q) ||
      item.requestType.toLowerCase().includes(q);
    return matchesCategory && matchesStatus && matchesQuery;
  });
}

export function applyApprovalDecision(
  items: ApprovalItem[],
  approvalId: string,
  decision: 'Approved' | 'Rejected'
): ApprovalItem[] {
  return items.map((item) =>
    item.id === approvalId ? { ...item, status: decision } : item
  );
}

export function recomputeApprovalCounts(items: ApprovalItem[]): {
  totalPending: number;
  leaveRequests: number;
  attendanceRegularizations: number;
  expenseClaims: number;
} {
  const pending = items.filter((i) => i.status === 'Pending');
  return {
    totalPending: pending.length,
    leaveRequests: pending.filter((i) => i.category === 'Leave Requests').length,
    attendanceRegularizations: pending.filter(
      (i) => i.category === 'Attendance Regularizations'
    ).length,
    expenseClaims: pending.filter((i) => i.category === 'Expense Claims').length,
  };
}

export function filterRosterEntries(
  entries: RosterEntry[],
  department: string,
  searchQuery: string
): RosterEntry[] {
  const q = searchQuery.trim().toLowerCase();
  return entries.filter((entry) => {
    const matchesDept =
      department === 'All' || entry.department === department;
    const matchesSearch =
      q === '' ||
      entry.employeeName.toLowerCase().includes(q) ||
      entry.employeeId.toLowerCase().includes(q) ||
      entry.designation.toLowerCase().includes(q);
    return matchesDept && matchesSearch;
  });
}

export function filterHolidays(
  holidays: HolidayItem[],
  category: HolidayCategory | 'All',
  month: string | 'All' = 'All'
): HolidayItem[] {
  return holidays.filter((h) => {
    const matchesCat = category === 'All' || h.category === category;
    const matchesMonth = month === 'All' || h.month === month;
    return matchesCat && matchesMonth;
  });
}

export function createInitialHrDashboardState(): HrDashboardDataState {
  const approvals: ApprovalItem[] = [
    {
      id: 'APR-901',
      employeeName: 'Sora Takahashi',
      employeeId: 'EMP-3603',
      department: 'Product & Design',
      category: 'Leave Requests',
      requestType: 'Annual Privilege Leave',
      requestDate: 'Nov 16 – Nov 20, 2026',
      durationOrAmount: '5 Days',
      reason: 'Family travel to Kyoto; design handoff completed with Elena.',
      status: 'Pending',
      avatarInitials: 'ST',
    },
    {
      id: 'APR-902',
      employeeName: 'Elena Rostova',
      employeeId: 'EMP-3601',
      department: 'Engineering',
      category: 'Leave Requests',
      requestType: 'Conference & Study Leave',
      requestDate: 'Dec 03 – Dec 04, 2026',
      durationOrAmount: '2 Days',
      reason: 'Speaking at KubeCon Cloud Native Summit.',
      status: 'Pending',
      avatarInitials: 'ER',
    },
    {
      id: 'APR-903',
      employeeName: 'Rohan Deshmukh',
      employeeId: 'EMP-3614',
      department: 'Engineering',
      category: 'Attendance Regularizations',
      requestType: 'Biometric Missed Punch',
      requestDate: 'Nov 03, 2026 · 09:02 AM',
      durationOrAmount: '09:02 AM – 06:34 PM',
      reason: 'Client architecture workshop at Bengaluru Tech Park.',
      status: 'Pending',
      avatarInitials: 'RD',
    },
    {
      id: 'APR-904',
      employeeName: 'Ananya Krishnan',
      employeeId: 'EMP-3619',
      department: 'Enterprise Sales',
      category: 'Attendance Regularizations',
      requestType: 'Field Visit Check-In',
      requestDate: 'Nov 02, 2026 · 10:15 AM',
      durationOrAmount: '10:15 AM – 07:10 PM',
      reason: 'On-site enterprise contract renewal meeting in Mumbai.',
      status: 'Pending',
      avatarInitials: 'AK',
    },
    {
      id: 'APR-905',
      employeeName: 'David Chen',
      employeeId: 'EMP-3604',
      department: 'Finance & Legal',
      category: 'Expense Claims',
      requestType: 'Q4 Audit Travel & Lodging',
      requestDate: 'Nov 01, 2026',
      durationOrAmount: '$1,420.00',
      reason: 'Singapore statutory compliance audit & legal filing.',
      status: 'Pending',
      avatarInitials: 'DC',
    },
    {
      id: 'APR-906',
      employeeName: 'Vikramaditya Nair',
      employeeId: 'EMP-3622',
      department: 'Customer Success',
      category: 'Expense Claims',
      requestType: 'Enterprise Client Summit Dinner',
      requestDate: 'Oct 29, 2026',
      durationOrAmount: '$385.00',
      reason: 'Quarterly executive business review hospitality.',
      status: 'Pending',
      avatarInitials: 'VN',
    },
    {
      id: 'APR-907',
      employeeName: 'Amara Okafor',
      employeeId: 'EMP-3605',
      department: 'Engineering',
      category: 'Leave Requests',
      requestType: 'Medical Recovery Leave',
      requestDate: 'Nov 02 – Nov 06, 2026',
      durationOrAmount: '5 Days',
      reason: 'Scheduled dental procedure and recovery.',
      status: 'Approved',
      avatarInitials: 'AO',
    },
  ];

  const departments: DepartmentAttendanceMetric[] = [
    {
      id: 'DEPT-01',
      department: 'Engineering',
      totalEmployees: 142,
      presentCount: 131,
      absentCount: 2,
      lateCount: 4,
      onLeaveCount: 5,
      attendancePercentage: 95.1,
      headOfDept: 'Elena Rostova',
    },
    {
      id: 'DEPT-02',
      department: 'Product & Design',
      totalEmployees: 48,
      presentCount: 45,
      absentCount: 0,
      lateCount: 1,
      onLeaveCount: 2,
      attendancePercentage: 95.8,
      headOfDept: 'Sora Takahashi',
    },
    {
      id: 'DEPT-03',
      department: 'Enterprise Sales',
      totalEmployees: 64,
      presentCount: 58,
      absentCount: 1,
      lateCount: 3,
      onLeaveCount: 2,
      attendancePercentage: 95.3,
      headOfDept: 'Ananya Krishnan',
    },
    {
      id: 'DEPT-04',
      department: 'People Operations',
      totalEmployees: 26,
      presentCount: 25,
      absentCount: 0,
      lateCount: 0,
      onLeaveCount: 1,
      attendancePercentage: 96.2,
      headOfDept: 'Marcus Vance',
    },
    {
      id: 'DEPT-05',
      department: 'Finance & Legal',
      totalEmployees: 32,
      presentCount: 30,
      absentCount: 1,
      lateCount: 1,
      onLeaveCount: 0,
      attendancePercentage: 96.9,
      headOfDept: 'David Chen',
    },
    {
      id: 'DEPT-06',
      department: 'Customer Success',
      totalEmployees: 36,
      presentCount: 33,
      absentCount: 1,
      lateCount: 1,
      onLeaveCount: 1,
      attendancePercentage: 94.4,
      headOfDept: 'Vikramaditya Nair',
    },
  ];

  const shifts: ShiftItem[] = [
    {
      id: 'SHF-01',
      name: 'Morning Shift',
      code: 'MS',
      startTime: '06:30 AM',
      endTime: '03:30 PM',
      breakDuration: '45 mins',
      assignedEmployees: 68,
      allowance: '$15 / day',
      status: 'Active',
      departments: ['Customer Success', 'Engineering'],
    },
    {
      id: 'SHF-02',
      name: 'General Shift',
      code: 'GS',
      startTime: '09:30 AM',
      endTime: '06:30 PM',
      breakDuration: '60 mins',
      assignedEmployees: 194,
      allowance: 'Standard',
      status: 'Active',
      departments: ['Engineering', 'Product & Design', 'People Operations', 'Finance & Legal'],
    },
    {
      id: 'SHF-03',
      name: 'Night Shift',
      code: 'NS',
      startTime: '09:00 PM',
      endTime: '06:00 AM',
      breakDuration: '60 mins',
      assignedEmployees: 42,
      allowance: '$35 / night',
      status: 'Active',
      departments: ['Engineering', 'Customer Success'],
    },
    {
      id: 'SHF-04',
      name: 'Flexible Shift',
      code: 'FLX',
      startTime: 'Core 11:00 AM',
      endTime: '08:00 PM',
      breakDuration: '60 mins',
      assignedEmployees: 44,
      allowance: '$10 / remote',
      status: 'Active',
      departments: ['Product & Design', 'Enterprise Sales'],
    },
  ];

  const rosters: RosterEntry[] = [
    {
      id: 'RST-101',
      employeeId: 'EMP-3601',
      employeeName: 'Elena Rostova',
      designation: 'Principal Systems Architect',
      department: 'Engineering',
      avatarInitials: 'ER',
      currentShift: 'General Shift (09:30 – 18:30)',
      weeklyOff: 'Sat, Sun',
      swapStatus: 'None',
      rosterStatus: 'Published',
      schedule: [
        { day: 'Mon', date: '02', shiftCode: 'GS', shiftLabel: 'General' },
        { day: 'Tue', date: '03', shiftCode: 'GS', shiftLabel: 'General' },
        { day: 'Wed', date: '04', shiftCode: 'GS', shiftLabel: 'General' },
        { day: 'Thu', date: '05', shiftCode: 'FLX', shiftLabel: 'Flexible' },
        { day: 'Fri', date: '06', shiftCode: 'GS', shiftLabel: 'General' },
        { day: 'Sat', date: '07', shiftCode: 'OFF', shiftLabel: 'Weekly Off' },
        { day: 'Sun', date: '08', shiftCode: 'OFF', shiftLabel: 'Weekly Off' },
      ],
    },
    {
      id: 'RST-102',
      employeeId: 'EMP-3614',
      employeeName: 'Rohan Deshmukh',
      designation: 'Senior SRE Lead',
      department: 'Engineering',
      avatarInitials: 'RD',
      currentShift: 'Morning Shift (06:30 – 15:30)',
      weeklyOff: 'Sun, Mon',
      swapStatus: 'Swap Requested',
      swapTargetEmployee: 'Kabir Mehta (EMP-3629)',
      rosterStatus: 'Published',
      schedule: [
        { day: 'Mon', date: '02', shiftCode: 'OFF', shiftLabel: 'Weekly Off' },
        { day: 'Tue', date: '03', shiftCode: 'MS', shiftLabel: 'Morning' },
        { day: 'Wed', date: '04', shiftCode: 'MS', shiftLabel: 'Morning' },
        {
          day: 'Thu',
          date: '05',
          shiftCode: 'NS',
          shiftLabel: 'Night',
          isSwapRequested: true,
        },
        { day: 'Fri', date: '06', shiftCode: 'MS', shiftLabel: 'Morning' },
        { day: 'Sat', date: '07', shiftCode: 'MS', shiftLabel: 'Morning' },
        { day: 'Sun', date: '08', shiftCode: 'OFF', shiftLabel: 'Weekly Off' },
      ],
    },
    {
      id: 'RST-103',
      employeeId: 'EMP-3603',
      employeeName: 'Sora Takahashi',
      designation: 'Staff Product Designer',
      department: 'Product & Design',
      avatarInitials: 'ST',
      currentShift: 'Flexible Shift (Core 11:00 – 20:00)',
      weeklyOff: 'Sat, Sun',
      swapStatus: 'None',
      rosterStatus: 'Published',
      schedule: [
        { day: 'Mon', date: '02', shiftCode: 'FLX', shiftLabel: 'Flexible' },
        { day: 'Tue', date: '03', shiftCode: 'FLX', shiftLabel: 'Flexible' },
        { day: 'Wed', date: '04', shiftCode: 'GS', shiftLabel: 'General' },
        { day: 'Thu', date: '05', shiftCode: 'FLX', shiftLabel: 'Flexible' },
        { day: 'Fri', date: '06', shiftCode: 'FLX', shiftLabel: 'Flexible' },
        { day: 'Sat', date: '07', shiftCode: 'OFF', shiftLabel: 'Weekly Off' },
        { day: 'Sun', date: '08', shiftCode: 'OFF', shiftLabel: 'Weekly Off' },
      ],
    },
    {
      id: 'RST-104',
      employeeId: 'EMP-3622',
      employeeName: 'Vikramaditya Nair',
      designation: 'Global Support Lead',
      department: 'Customer Success',
      avatarInitials: 'VN',
      currentShift: 'Night Shift (21:00 – 06:00)',
      weeklyOff: 'Fri, Sat',
      swapStatus: 'Swap Approved',
      swapTargetEmployee: 'Meera Iyer (EMP-3631)',
      rosterStatus: 'Published',
      schedule: [
        { day: 'Mon', date: '02', shiftCode: 'NS', shiftLabel: 'Night' },
        { day: 'Tue', date: '03', shiftCode: 'NS', shiftLabel: 'Night' },
        { day: 'Wed', date: '04', shiftCode: 'NS', shiftLabel: 'Night' },
        { day: 'Thu', date: '05', shiftCode: 'NS', shiftLabel: 'Night' },
        { day: 'Fri', date: '06', shiftCode: 'OFF', shiftLabel: 'Weekly Off' },
        { day: 'Sat', date: '07', shiftCode: 'OFF', shiftLabel: 'Weekly Off' },
        { day: 'Sun', date: '08', shiftCode: 'NS', shiftLabel: 'Night' },
      ],
    },
    {
      id: 'RST-105',
      employeeId: 'EMP-3604',
      employeeName: 'David Chen',
      designation: 'Director of FP&A',
      department: 'Finance & Legal',
      avatarInitials: 'DC',
      currentShift: 'General Shift (09:30 – 18:30)',
      weeklyOff: 'Sat, Sun',
      swapStatus: 'None',
      rosterStatus: 'Published',
      schedule: [
        { day: 'Mon', date: '02', shiftCode: 'GS', shiftLabel: 'General' },
        { day: 'Tue', date: '03', shiftCode: 'GS', shiftLabel: 'General' },
        { day: 'Wed', date: '04', shiftCode: 'GS', shiftLabel: 'General' },
        { day: 'Thu', date: '05', shiftCode: 'GS', shiftLabel: 'General' },
        { day: 'Fri', date: '06', shiftCode: 'GS', shiftLabel: 'General' },
        { day: 'Sat', date: '07', shiftCode: 'OFF', shiftLabel: 'Weekly Off' },
        { day: 'Sun', date: '08', shiftCode: 'OFF', shiftLabel: 'Weekly Off' },
      ],
    },
  ];

  const holidays: HolidayItem[] = [
    {
      id: 'HOL-01',
      name: 'Diwali / Deepavali Festival',
      date: '2026-11-08',
      displayDate: 'Nov 08, 2026',
      month: 'November',
      dayOfWeek: 'Sunday',
      category: 'National',
      location: 'India · All Hubs',
      description: 'Festival of Lights statutory observance across India offices.',
    },
    {
      id: 'HOL-02',
      name: 'Govardhan Puja / Bali Pratipada',
      date: '2026-11-09',
      displayDate: 'Nov 09, 2026',
      month: 'November',
      dayOfWeek: 'Monday',
      category: 'Regional',
      location: 'Mumbai · Bengaluru · Delhi',
      description: 'Regional public holiday following Diwali.',
    },
    {
      id: 'HOL-03',
      name: 'Guru Nanak Jayanti',
      date: '2026-11-24',
      displayDate: 'Nov 24, 2026',
      month: 'November',
      dayOfWeek: 'Tuesday',
      category: 'Optional',
      location: 'Global · Restricted Holiday',
      description: 'Eligible under annual restricted/floating holiday quota.',
    },
    {
      id: 'HOL-04',
      name: 'Thanksgiving Day',
      date: '2026-11-26',
      displayDate: 'Nov 26, 2026',
      month: 'November',
      dayOfWeek: 'Thursday',
      category: 'Regional',
      location: 'US · New York & San Francisco',
      description: 'Federal statutory holiday for US workspace operations.',
    },
    {
      id: 'HOL-05',
      name: 'Year-End Winter Holiday & Christmas',
      date: '2026-12-25',
      displayDate: 'Dec 25, 2026',
      month: 'December',
      dayOfWeek: 'Friday',
      category: 'National',
      location: 'Global · All Hubs',
      description: 'Global enterprise-wide statutory holiday.',
    },
  ];

  const announcements: AnnouncementItem[] = [
    {
      id: 'ANN-301',
      title: 'Q4 Annual Performance & 360° Calibration Window Open',
      description:
        'All department heads and managers must complete peer nominations and self-reviews in OFC360 before November 18, 2026.',
      publishedDate: 'Nov 04, 2026 · 08:45 AM',
      expiryDate: '2026-11-20',
      department: 'All Departments',
      targetAudience: 'All Full-Time Employees',
      category: 'Policy Update',
      priority: 'High',
      author: 'Aarav Sharma (HR Admin)',
      status: 'Published',
    },
    {
      id: 'ANN-302',
      title: 'November Payroll Cut-off & Tax Investment Proof Submission',
      description:
        'Submit flexible benefit claims and revised tax declarations by Nov 20 to reflect in the Nov 28 payout cycle.',
      publishedDate: 'Nov 02, 2026 · 11:20 AM',
      expiryDate: '2026-11-25',
      department: 'Finance & People Ops',
      targetAudience: 'Salaried Workforce',
      category: 'Payroll & Benefits',
      priority: 'Urgent',
      author: 'Aarav Sharma (HR Admin)',
      status: 'Published',
    },
    {
      id: 'ANN-303',
      title: 'Updated Hybrid Work & Winter Shuttle Roster',
      description:
        'Updated shuttle timings for Morning and Night shifts are now live in the Shifts & Rosters tab.',
      publishedDate: 'Oct 30, 2026 · 04:15 PM',
      expiryDate: '2026-12-31',
      department: 'Engineering & Customer Success',
      targetAudience: 'Shift Personnel',
      category: 'Company News',
      priority: 'Normal',
      author: 'Marcus Vance (VP People Ops)',
      status: 'Published',
    },
  ];

  const joiners: UpcomingJoiner[] = [
    {
      id: 'JNR-01',
      employeeId: 'EMP-3649',
      name: 'Neha Singhania',
      department: 'Engineering',
      designation: 'Staff AI Platform Engineer',
      joiningDate: 'Nov 09, 2026',
      location: 'Bengaluru · Hybrid',
      onboardingStatus: 'Laptop Provisioned',
      initials: 'NS',
    },
    {
      id: 'JNR-02',
      employeeId: 'EMP-3650',
      name: 'Lucas Meyer',
      department: 'Product & Design',
      designation: 'Lead Mobile Design Systems',
      joiningDate: 'Nov 12, 2026',
      location: 'Zurich · Hybrid',
      onboardingStatus: 'Verified',
      initials: 'LM',
    },
    {
      id: 'JNR-03',
      employeeId: 'EMP-3651',
      name: 'Priya Subramanian',
      department: 'Enterprise Sales',
      designation: 'Regional Account Director',
      joiningDate: 'Nov 16, 2026',
      location: 'Singapore · Onsite',
      onboardingStatus: 'Docs Pending',
      initials: 'PS',
    },
  ];

  const exits: UpcomingExit[] = [
    {
      id: 'EXT-01',
      employeeId: 'EMP-3588',
      name: 'Siddharth Malhotra',
      department: 'Engineering',
      designation: 'Frontend Engineer II',
      lastWorkingDay: 'Nov 14, 2026',
      exitStatus: 'Handover Active',
      initials: 'SM',
    },
    {
      id: 'EXT-02',
      employeeId: 'EMP-3542',
      name: 'claire Dubois',
      department: 'Customer Success',
      designation: 'Implementation Specialist',
      lastWorkingDay: 'Nov 27, 2026',
      exitStatus: 'Clearance Pending',
      initials: 'CD',
    },
  ];

  const workforce: WorkforceEmployee[] = [
    {
      id: 'WF-01',
      employeeId: 'EMP-3601',
      name: 'Elena Rostova',
      email: 'elena.rostova@ofc360.com',
      phone: '+41 44 580 1290',
      designation: 'Principal Systems Architect',
      department: 'Engineering',
      location: 'Zurich · Hybrid',
      shift: 'General Shift',
      status: 'Present',
      attendanceRate: 99.4,
      joiningDate: 'Jan 15, 2023',
      initials: 'ER',
    },
    {
      id: 'WF-02',
      employeeId: 'EMP-3602',
      name: 'Marcus Vance',
      email: 'marcus.vance@ofc360.com',
      phone: '+44 20 7946 0821',
      designation: 'VP of Global People Operations',
      department: 'People Operations',
      location: 'London · Onsite',
      shift: 'General Shift',
      status: 'Present',
      attendanceRate: 98.8,
      joiningDate: 'Mar 04, 2022',
      initials: 'MV',
    },
    {
      id: 'WF-03',
      employeeId: 'EMP-3603',
      name: 'Sora Takahashi',
      email: 'sora.takahashi@ofc360.com',
      phone: '+81 3 5550 1920',
      designation: 'Staff Product Designer',
      department: 'Product & Design',
      location: 'Tokyo · Remote',
      shift: 'Flexible Shift',
      status: 'Remote',
      attendanceRate: 99.6,
      joiningDate: 'Jul 18, 2023',
      initials: 'ST',
    },
    {
      id: 'WF-04',
      employeeId: 'EMP-3604',
      name: 'David Chen',
      email: 'david.chen@ofc360.com',
      phone: '+65 6789 4321',
      designation: 'Director of FP&A',
      department: 'Finance & Legal',
      location: 'Singapore · Onsite',
      shift: 'General Shift',
      status: 'Present',
      attendanceRate: 98.1,
      joiningDate: 'Sep 11, 2022',
      initials: 'DC',
    },
    {
      id: 'WF-05',
      employeeId: 'EMP-3605',
      name: 'Amara Okafor',
      email: 'amara.okafor@ofc360.com',
      phone: '+1 212 555 0194',
      designation: 'Lead Security Engineer',
      department: 'Engineering',
      location: 'New York · Hybrid',
      shift: 'General Shift',
      status: 'On Leave',
      attendanceRate: 97.5,
      joiningDate: 'Feb 20, 2024',
      initials: 'AO',
    },
    {
      id: 'WF-06',
      employeeId: 'EMP-3614',
      name: 'Rohan Deshmukh',
      email: 'rohan.deshmukh@ofc360.com',
      phone: '+91 98201 44510',
      designation: 'Senior SRE Lead',
      department: 'Engineering',
      location: 'Bengaluru · Hybrid',
      shift: 'Morning Shift',
      status: 'Late',
      attendanceRate: 96.4,
      joiningDate: 'May 09, 2023',
      initials: 'RD',
    },
    {
      id: 'WF-07',
      employeeId: 'EMP-3619',
      name: 'Ananya Krishnan',
      email: 'ananya.krishnan@ofc360.com',
      phone: '+91 98450 77812',
      designation: 'VP Enterprise Sales',
      department: 'Enterprise Sales',
      location: 'Mumbai · Hybrid',
      shift: 'Flexible Shift',
      status: 'Present',
      attendanceRate: 97.9,
      joiningDate: 'Nov 02, 2022',
      initials: 'AK',
    },
    {
      id: 'WF-08',
      employeeId: 'EMP-3622',
      name: 'Vikramaditya Nair',
      email: 'vikram.nair@ofc360.com',
      phone: '+91 98112 33901',
      designation: 'Global Support Lead',
      department: 'Customer Success',
      location: 'Bengaluru · Onsite',
      shift: 'Night Shift',
      status: 'Present',
      attendanceRate: 98.2,
      joiningDate: 'Aug 14, 2023',
      initials: 'VN',
    },
  ];

  const notifications: HrNotificationItem[] = [
    {
      id: 'NTF-01',
      title: '2 Leave Requests Awaiting Approval',
      message: 'Sora Takahashi (5d Annual) and Elena Rostova (2d Study) submitted leave requests.',
      category: 'Leave Approvals',
      timestamp: '12m ago',
      read: false,
      actionTab: 'approvals',
    },
    {
      id: 'NTF-02',
      title: 'Shift Swap Request in Engineering',
      message: 'Rohan Deshmukh requested a Thursday Night Shift swap with Kabir Mehta.',
      category: 'Attendance Alerts',
      timestamp: '42m ago',
      read: false,
      actionTab: 'attendance',
    },
    {
      id: 'NTF-03',
      title: 'November Payroll Pre-Audit Passed',
      message: '348 active employees verified with 99.4% statutory tax compliance.',
      category: 'Payroll Updates',
      timestamp: '2h ago',
      read: false,
      actionTab: 'more',
    },
    {
      id: 'NTF-04',
      title: 'Offer Accepted: Staff AI Platform Engineer',
      message: 'Neha Singhania accepted the offer and is scheduled to join Nov 09.',
      category: 'Recruitment Updates',
      timestamp: '5h ago',
      read: true,
      actionTab: 'workforce',
    },
    {
      id: 'NTF-05',
      title: 'Q4 360° Calibration Announcement Published',
      message: 'Broadcast delivered to 348 employees across 6 departments.',
      category: 'Company Announcements',
      timestamp: '1d ago',
      read: true,
      actionTab: 'home',
    },
  ];

  const requisitions: RecruitmentRequisition[] = [
    {
      id: 'REQ-401',
      title: 'Staff Distributed Systems Engineer',
      department: 'Engineering',
      location: 'Bengaluru / Remote',
      openings: 4,
      candidatesInPipeline: 19,
      stage: 'Technical Round',
      priority: 'Critical',
    },
    {
      id: 'REQ-402',
      title: 'Senior Product Designer (Mobile)',
      department: 'Product & Design',
      location: 'Zurich / Hybrid',
      openings: 2,
      candidatesInPipeline: 11,
      stage: 'Offer Extended',
      priority: 'High',
    },
    {
      id: 'REQ-403',
      title: 'Enterprise Account Executive',
      department: 'Enterprise Sales',
      location: 'Singapore / London',
      openings: 5,
      candidatesInPipeline: 24,
      stage: 'Sourcing',
      priority: 'High',
    },
    {
      id: 'REQ-404',
      title: 'People Partner – EMEA',
      department: 'People Operations',
      location: 'London',
      openings: 1,
      candidatesInPipeline: 8,
      stage: 'Technical Round',
      priority: 'Standard',
    },
  ];

  const approvalCounts = recomputeApprovalCounts(approvals);

  return {
    adminProfile: {
      name: 'Aarav Sharma',
      email: 'hradmin@ofc360.com',
      role: 'hr_admin',
      designation: 'Principal HR Operations Director',
      employeeId: 'EMP-3600',
      department: 'People Operations',
      location: 'Bengaluru · Global HQ',
    },
    kpis: {
      workforce: {
        totalActive: 348,
        growthPercentage: 8.4,
        monthlyComparisonText: '+27 net additions vs Oct',
        newHiresThisMonth: 14,
      },
      attendance: {
        ratePercentage: 95.4,
        present: 322,
        late: 10,
        onLeave: 11,
        absent: 5,
      },
      approvals: approvalCounts,
      recruitment: {
        openPositions: 12,
        candidatesInPipeline: 62,
        activeRequisitionsCount: 4,
      },
      payroll: {
        cycleName: 'November 2026 Cycle',
        status: 'Ready for Disbursement',
        nextPayoutDate: 'Nov 28, 2026',
        eligibleEmployees: 348,
        netPayableFormatted: '$1,842,500',
        taxWithheldFormatted: '$412,800',
        complianceScore: 99.4,
        lastRunBy: 'Aarav Sharma',
      },
    },
    approvals,
    departments,
    shifts,
    rosters,
    holidays,
    announcements,
    joiners,
    exits,
    workforce,
    notifications,
    requisitions,
    analytics: {
      '7D': [
        { label: 'Wed', headcount: 345, attendanceRate: 94.8, hires: 2, attrition: 0, payrollCostK: 458 },
        { label: 'Thu', headcount: 346, attendanceRate: 95.2, hires: 1, attrition: 0, payrollCostK: 459 },
        { label: 'Fri', headcount: 346, attendanceRate: 93.9, hires: 0, attrition: 0, payrollCostK: 459 },
        { label: 'Mon', headcount: 347, attendanceRate: 96.1, hires: 1, attrition: 0, payrollCostK: 460 },
        { label: 'Tue', headcount: 348, attendanceRate: 95.7, hires: 1, attrition: 0, payrollCostK: 461 },
        { label: 'Wed', headcount: 348, attendanceRate: 95.4, hires: 0, attrition: 0, payrollCostK: 461 },
      ],
      '30D': [
        { label: 'Wk 1', headcount: 328, attendanceRate: 94.2, hires: 5, attrition: 1, payrollCostK: 1740 },
        { label: 'Wk 2', headcount: 334, attendanceRate: 94.9, hires: 7, attrition: 1, payrollCostK: 1775 },
        { label: 'Wk 3', headcount: 341, attendanceRate: 95.1, hires: 8, attrition: 1, payrollCostK: 1810 },
        { label: 'Wk 4', headcount: 348, attendanceRate: 95.4, hires: 7, attrition: 0, payrollCostK: 1842 },
      ],
      '6M': [
        { label: 'Jun', headcount: 294, attendanceRate: 93.5, hires: 9, attrition: 2, payrollCostK: 1580 },
        { label: 'Jul', headcount: 304, attendanceRate: 94.0, hires: 12, attrition: 2, payrollCostK: 1625 },
        { label: 'Aug', headcount: 315, attendanceRate: 94.4, hires: 13, attrition: 2, payrollCostK: 1690 },
        { label: 'Sep', headcount: 321, attendanceRate: 94.8, hires: 8, attrition: 2, payrollCostK: 1720 },
        { label: 'Oct', headcount: 336, attendanceRate: 95.1, hires: 16, attrition: 1, payrollCostK: 1795 },
        { label: 'Nov', headcount: 348, attendanceRate: 95.4, hires: 14, attrition: 2, payrollCostK: 1842 },
      ],
      '12M': [
        { label: 'Q1', headcount: 268, attendanceRate: 92.8, hires: 22, attrition: 5, payrollCostK: 1420 },
        { label: 'Q2', headcount: 294, attendanceRate: 93.6, hires: 31, attrition: 5, payrollCostK: 1580 },
        { label: 'Q3', headcount: 321, attendanceRate: 94.7, hires: 33, attrition: 6, payrollCostK: 1720 },
        { label: 'Q4', headcount: 348, attendanceRate: 95.4, hires: 30, attrition: 3, payrollCostK: 1842 },
      ],
    },
  };
}

export interface ProfileCrudRecord {
  id: string;
  title: string;
  category: 'Personal' | 'Emergency' | 'Certification' | 'Financial';
  value: string;
  status: 'Verified' | 'Active' | 'Pending';
}

export interface CompanyCrudRecord {
  id: string;
  name: string;
  code: string;
  city: string;
  gstOrRegNo: string;
  headcount: number;
  status: 'Active' | 'Expanding' | 'Inactive';
}

export function createInitialProfileRecords(): ProfileCrudRecord[] {
  return [
    {
      id: 'PRF-101',
      title: 'Emergency Contact',
      category: 'Emergency',
      value: 'Meera Sharma (Spouse) · +91 98201 44110',
      status: 'Verified',
    },
    {
      id: 'PRF-102',
      title: 'SHRM-SCP Global HR Credential',
      category: 'Certification',
      value: 'Cert ID: SHRM-2026-9941 · Valid through Dec 2029',
      status: 'Active',
    },
    {
      id: 'PRF-103',
      title: 'Primary Salary Bank & PAN',
      category: 'Financial',
      value: 'HDFC Bank · A/C ****4821 · PAN: ABCDE1234F',
      status: 'Verified',
    },
    {
      id: 'PRF-104',
      title: 'Residential Address',
      category: 'Personal',
      value: '402 Indiranagar 100ft Road, Bengaluru 560038',
      status: 'Verified',
    },
  ];
}

export function createInitialCompanyRecords(): CompanyCrudRecord[] {
  return [
    {
      id: 'CMP-201',
      name: 'OFC360 Technologies Pvt. Ltd. (Global HQ)',
      code: 'BLR-HQ-01',
      city: 'Bengaluru, Karnataka',
      gstOrRegNo: 'GSTIN: 29AABCO3600F1Z5',
      headcount: 210,
      status: 'Active',
    },
    {
      id: 'CMP-202',
      name: 'OFC360 Enterprise West Hub',
      code: 'BOM-W-02',
      city: 'Mumbai, Maharashtra',
      gstOrRegNo: 'GSTIN: 27AABCO3600F1Z9',
      headcount: 86,
      status: 'Active',
    },
    {
      id: 'CMP-203',
      name: 'OFC360 APAC Cloud Operations',
      code: 'SGP-AP-03',
      city: 'Marina Bay, Singapore',
      gstOrRegNo: 'UEN: 202318492K',
      headcount: 52,
      status: 'Expanding',
    },
  ];
}

export function upsertProfileRecord(
  list: ProfileCrudRecord[],
  record: Omit<ProfileCrudRecord, 'id'> & { id?: string }
): ProfileCrudRecord[] {
  const cleanTitle = record.title.trim();
  const cleanValue = record.value.trim();
  if (!cleanTitle || !cleanValue) return list;

  if (record.id) {
    return list.map((item) =>
      item.id === record.id
        ? {
            ...item,
            title: cleanTitle,
            category: record.category,
            value: cleanValue,
            status: record.status,
          }
        : item
    );
  }

  const newRecord: ProfileCrudRecord = {
    id: `PRF-${100 + list.length + 1}-${Date.now().toString().slice(-3)}`,
    title: cleanTitle,
    category: record.category,
    value: cleanValue,
    status: record.status,
  };
  return [newRecord, ...list];
}

export function deleteProfileRecord(
  list: ProfileCrudRecord[],
  id: string
): ProfileCrudRecord[] {
  return list.filter((item) => item.id !== id);
}

export function upsertCompanyRecord(
  list: CompanyCrudRecord[],
  record: Omit<CompanyCrudRecord, 'id'> & { id?: string }
): CompanyCrudRecord[] {
  const cleanName = record.name.trim();
  const cleanCode = record.code.trim().toUpperCase();
  const cleanCity = record.city.trim();
  const cleanGst = record.gstOrRegNo.trim();
  if (!cleanName || !cleanCode || !cleanCity) return list;

  if (record.id) {
    return list.map((item) =>
      item.id === record.id
        ? {
            ...item,
            name: cleanName,
            code: cleanCode,
            city: cleanCity,
            gstOrRegNo: cleanGst || 'GSTIN Pending',
            headcount: Math.max(0, Number(record.headcount) || 0),
            status: record.status,
          }
        : item
    );
  }

  const newRecord: CompanyCrudRecord = {
    id: `CMP-${200 + list.length + 1}-${Date.now().toString().slice(-3)}`,
    name: cleanName,
    code: cleanCode,
    city: cleanCity,
    gstOrRegNo: cleanGst || 'GSTIN Pending',
    headcount: Math.max(0, Number(record.headcount) || 0),
    status: record.status,
  };
  return [newRecord, ...list];
}

export function deleteCompanyRecord(
  list: CompanyCrudRecord[],
  id: string
): CompanyCrudRecord[] {
  return list.filter((item) => item.id !== id);
}

export type MoreModuleCategory =
  | 'Workforce & Operations'
  | 'Communication'
  | 'Intelligence & Analytics'
  | 'Documents & Compliance'
  | 'Account & Administration';

export const MORE_MODULE_CATEGORIES: MoreModuleCategory[] = [
  'Workforce & Operations',
  'Communication',
  'Intelligence & Analytics',
  'Documents & Compliance',
  'Account & Administration',
];

export type MoreModuleId =
  | 'payroll'
  | 'recruitment'
  | 'onboarding'
  | 'shifts_rosters'
  | 'holidays'
  | 'asset_management'
  | 'visitor_management'
  | 'travel_desk'
  | 'exit_management'
  | 'performance_goals'
  | 'ofc_connect_chat'
  | 'audio_video_meetings'
  | 'announcements'
  | 'people_ai'
  | 'reports_analytics'
  | 'workforce_analytics'
  | 'attendance_analytics'
  | 'payroll_analytics'
  | 'employee_documents'
  | 'documents_policies'
  | 'compliance_center'
  | 'my_profile'
  | 'settings'
  | 'integrations'
  | 'help_support';

export interface MoreModuleItem {
  id: MoreModuleId;
  title: string;
  subtitle: string;
  category: MoreModuleCategory;
  badge?: string | number;
  badgeTone?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet';
  allowedRoles: Ofc360Role[];
}

const ALL_ROLES: Ofc360Role[] = [
  'hr_admin',
  'it_admin',
  'employee',
  'manager',
  'executive',
  'super_admin',
];

const ADMIN_AND_LEADERSHIP_ROLES: Ofc360Role[] = [
  'hr_admin',
  'it_admin',
  'manager',
  'executive',
  'super_admin',
];

export function getMoreModulesCatalog(
  state?: HrDashboardDataState
): MoreModuleItem[] {
  const openPos = state?.kpis.recruitment.openPositions ?? 12;
  const shiftCount = state?.shifts.length ?? 4;
  const holidayCount = state?.holidays.length ?? 5;
  const exitCount = state?.exits.length ?? 2;
  const announcementCount = state?.announcements.length ?? 3;
  const joinerCount = state?.joiners.length ?? 3;

  return [
    // 1. Workforce & Operations
    {
      id: 'payroll',
      title: 'Payroll',
      subtitle: 'Cycle execution & net payouts',
      category: 'Workforce & Operations',
      badge: 'Ready',
      badgeTone: 'emerald',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'recruitment',
      title: 'Recruitment',
      subtitle: 'ATS pipeline & requisitions',
      category: 'Workforce & Operations',
      badge: `${openPos} Open`,
      badgeTone: 'indigo',
      allowedRoles: ADMIN_AND_LEADERSHIP_ROLES,
    },
    {
      id: 'onboarding',
      title: 'Onboarding',
      subtitle: 'New joiner induction & kit dispatch',
      category: 'Workforce & Operations',
      badge: `${joinerCount} Pending`,
      badgeTone: 'indigo',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'shifts_rosters',
      title: 'Shifts & Rosters',
      subtitle: 'Shift windows & duty rosters',
      category: 'Workforce & Operations',
      badge: shiftCount,
      badgeTone: 'indigo',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'holidays',
      title: 'Holidays',
      subtitle: '2026 corporate & regional calendar',
      category: 'Workforce & Operations',
      badge: holidayCount,
      badgeTone: 'emerald',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'asset_management',
      title: 'Assets',
      subtitle: 'Hardware, laptops & IT inventory',
      category: 'Workforce & Operations',
      badge: '348 Active',
      badgeTone: 'indigo',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'visitor_management',
      title: 'Visitors',
      subtitle: 'Digital guest check-in & badges',
      category: 'Workforce & Operations',
      badge: '4 Today',
      badgeTone: 'emerald',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'travel_desk',
      title: 'Travel Desk',
      subtitle: 'Corporate flights, hotels & cabs',
      category: 'Workforce & Operations',
      badge: '2 Trips',
      badgeTone: 'indigo',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'exit_management',
      title: 'Exit Management',
      subtitle: 'Offboarding & FnF clearance',
      category: 'Workforce & Operations',
      badge: exitCount,
      badgeTone: 'amber',
      allowedRoles: ADMIN_AND_LEADERSHIP_ROLES,
    },
    {
      id: 'performance_goals',
      title: 'Performance & Goals',
      subtitle: 'OKRs, 360 reviews & appraisals',
      category: 'Workforce & Operations',
      badge: 'Q4 Live',
      badgeTone: 'violet',
      allowedRoles: ALL_ROLES,
    },

    // 2. Communication
    {
      id: 'ofc_connect_chat',
      title: 'OFC Connect Chat',
      subtitle: 'Direct & department channels',
      category: 'Communication',
      badge: 5,
      badgeTone: 'rose',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'audio_video_meetings',
      title: 'Audio & Video Meetings',
      subtitle: 'HD huddles, townhalls & rooms',
      category: 'Communication',
      badge: '2 Today',
      badgeTone: 'indigo',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'announcements',
      title: 'Announcements',
      subtitle: 'Company-wide broadcasts',
      category: 'Communication',
      badge: announcementCount,
      badgeTone: 'violet',
      allowedRoles: ALL_ROLES,
    },

    // 3. Intelligence & Analytics
    {
      id: 'people_ai',
      title: 'People AI / Intelligence Hub',
      subtitle: 'Retention signals & workforce IQ',
      category: 'Intelligence & Analytics',
      badge: 'AI',
      badgeTone: 'violet',
      allowedRoles: ADMIN_AND_LEADERSHIP_ROLES,
    },
    {
      id: 'reports_analytics',
      title: 'Reports & Analytics',
      subtitle: 'Executive exports & statutory MIS',
      category: 'Intelligence & Analytics',
      badge: '14 Reports',
      badgeTone: 'indigo',
      allowedRoles: ADMIN_AND_LEADERSHIP_ROLES,
    },
    {
      id: 'workforce_analytics',
      title: 'Workforce Analytics',
      subtitle: 'Headcount velocity & diversity',
      category: 'Intelligence & Analytics',
      allowedRoles: ADMIN_AND_LEADERSHIP_ROLES,
    },
    {
      id: 'attendance_analytics',
      title: 'Attendance Analytics',
      subtitle: 'Punctuality & shift adherence',
      category: 'Intelligence & Analytics',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'payroll_analytics',
      title: 'Payroll Analytics',
      subtitle: 'Cost centers, variance & tax trends',
      category: 'Intelligence & Analytics',
      allowedRoles: ADMIN_AND_LEADERSHIP_ROLES,
    },

    // 4. Documents & Compliance
    {
      id: 'employee_documents',
      title: 'Employee Documents',
      subtitle: 'Letters, KYC vault & contracts',
      category: 'Documents & Compliance',
      badge: '99% KYC',
      badgeTone: 'emerald',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'documents_policies',
      title: 'Documents & Policies',
      subtitle: 'Employee handbook & SOPs',
      category: 'Documents & Compliance',
      badge: 8,
      badgeTone: 'indigo',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'compliance_center',
      title: 'Compliance Center',
      subtitle: 'PF, ESI, PT, POSH & SOC2 audits',
      category: 'Documents & Compliance',
      badge: '99.4%',
      badgeTone: 'emerald',
      allowedRoles: ADMIN_AND_LEADERSHIP_ROLES,
    },

    // 5. Account & Administration
    {
      id: 'my_profile',
      title: 'My Profile',
      subtitle: 'Personal & company CRUD records',
      category: 'Account & Administration',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Appearance, security & alerts',
      category: 'Account & Administration',
      allowedRoles: ALL_ROLES,
    },
    {
      id: 'integrations',
      title: 'Integrations',
      subtitle: 'Slack, Google Workspace, SSO & Biometrics',
      category: 'Account & Administration',
      badge: '6 Active',
      badgeTone: 'emerald',
      allowedRoles: ADMIN_AND_LEADERSHIP_ROLES,
    },
    {
      id: 'help_support',
      title: 'Help & Support',
      subtitle: '24/7 HR desk, SLA tickets & docs',
      category: 'Account & Administration',
      allowedRoles: ALL_ROLES,
    },
  ];
}

export function filterMoreModules(
  modules: MoreModuleItem[],
  searchQuery: string,
  role: Ofc360Role = 'hr_admin',
  category: MoreModuleCategory | 'All' = 'All'
): MoreModuleItem[] {
  const q = searchQuery.trim().toLowerCase();
  return modules.filter((mod) => {
    const allowed = mod.allowedRoles.includes(role);
    const matchesCategory = category === 'All' || mod.category === category;
    const matchesQuery =
      q === '' ||
      mod.title.toLowerCase().includes(q) ||
      mod.subtitle.toLowerCase().includes(q) ||
      mod.category.toLowerCase().includes(q);
    return allowed && matchesCategory && matchesQuery;
  });
}

