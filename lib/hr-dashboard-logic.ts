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

export type HolidayCategory =
  | 'National'
  | 'Gazetted'
  | 'Restricted'
  | 'Regional'
  | 'Company'
  | 'Optional';

export type HolidayType = HolidayCategory;

export interface HolidayItem {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  displayDate: string;
  month: string;
  dayOfWeek: string;
  category: HolidayCategory;
  type?: HolidayType;
  location: string;
  locations?: string[];
  departments?: string[];
  employeeCategory?: string;
  description: string;
  recurring?: boolean;
  isOptional?: boolean;
  status?: 'Published' | 'Draft' | 'Unpublished';
  instructions?: string;
  createdDate?: string;
  lastUpdated?: string;
  optedInCount?: number;
  selectionDeadline?: string;
  userSelected?: boolean;
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

export const WORKFORCE_EMPLOYEE_ROLES = [
  'Employee',
  'Manager',
  'Executive',
  'IT-Admin',
] as const;

export type WorkforceEmployeeRole = (typeof WORKFORCE_EMPLOYEE_ROLES)[number];

export interface WorkforceEmployee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  role?: WorkforceEmployeeRole | string;
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

export interface FaceAttendanceLogItem {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  shift: string;
  punchType: 'Check-In' | 'Late Check-In' | 'Check-Out';
  timestamp: string;
  location: string;
  confidenceScore: number;
  livenessVerified: boolean;
  initials: string;
  snapshotDataUrl?: string;
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
  faceAttendanceLogs?: FaceAttendanceLogItem[];
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
  role: z.enum(['Employee', 'Manager', 'Executive', 'IT-Admin']),
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
  category: HolidayCategory | 'All' = 'All',
  month: string | 'All' = 'All',
  location: string | 'All' = 'All',
  department: string | 'All' = 'All',
  searchQuery: string = '',
  statusFilter: string = 'All',
  isOptionalOnly: boolean = false,
  yearFilter: string = 'All'
): HolidayItem[] {
  const q = searchQuery.trim().toLowerCase();
  return holidays.filter((h) => {
    const matchesCat = category === 'All' || h.category === category;
    const matchesMonth = month === 'All' || h.month.toLowerCase() === month.toLowerCase();
    const matchesLoc =
      location === 'All' ||
      h.location.toLowerCase().includes(location.toLowerCase()) ||
      (h.locations && h.locations.some((l) => l.toLowerCase() === location.toLowerCase()));
    const matchesDept =
      department === 'All' ||
      !h.departments ||
      h.departments.includes('All Departments') ||
      h.departments.some((d) => d.toLowerCase() === department.toLowerCase());
    const matchesSearch =
      q === '' ||
      h.name.toLowerCase().includes(q) ||
      h.description.toLowerCase().includes(q) ||
      h.location.toLowerCase().includes(q) ||
      h.category.toLowerCase().includes(q);
    const matchesStatus =
      statusFilter === 'All' || (h.status || 'Published') === statusFilter;
    const matchesOptional =
      !isOptionalOnly || h.category === 'Optional' || h.isOptional === true;
    const matchesYear = yearFilter === 'All' || h.date.startsWith(yearFilter);

    return (
      matchesCat &&
      matchesMonth &&
      matchesLoc &&
      matchesDept &&
      matchesSearch &&
      matchesStatus &&
      matchesOptional &&
      matchesYear
    );
  });
}

export function createInitialHrDashboardState(): HrDashboardDataState {
  const approvals: ApprovalItem[] = [];

  const departments: DepartmentAttendanceMetric[] = [];

  const shifts: ShiftItem[] = [];

  const rosters: RosterEntry[] = [];

  const holidays: HolidayItem[] = [
    {
      id: 'HOL-01',
      name: "New Year's Day",
      date: '2026-01-01',
      displayDate: 'Jan 01, 2026',
      month: 'January',
      dayOfWeek: 'Thursday',
      category: 'National',
      location: 'Global · All Hubs',
      locations: ['Jaipur', 'Bangalore', 'Hyderabad', 'Delhi', 'Global'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: 'Global statutory celebration for the start of the new calendar year.',
      recurring: true,
      isOptional: false,
      status: 'Published',
      instructions: 'All enterprise offices and support hubs remain closed.',
      createdDate: '2026-01-01',
      lastUpdated: '2026-01-01',
    },
    {
      id: 'HOL-02',
      name: 'Republic Day of India',
      date: '2026-01-26',
      displayDate: 'Jan 26, 2026',
      month: 'January',
      dayOfWeek: 'Monday',
      category: 'National',
      location: 'India · All Hubs',
      locations: ['Jaipur', 'Bangalore', 'Hyderabad', 'Delhi'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: 'National statutory holiday celebrating the Constitution of India.',
      recurring: true,
      isOptional: false,
      status: 'Published',
      instructions: 'Mandatory paid holiday for all Indian office locations.',
      createdDate: '2026-01-02',
      lastUpdated: '2026-01-02',
    },
    {
      id: 'HOL-03',
      name: 'Maha Shivratri',
      date: '2026-02-15',
      displayDate: 'Feb 15, 2026',
      month: 'February',
      dayOfWeek: 'Sunday',
      category: 'Gazetted',
      location: 'Jaipur · Delhi · Hyderabad',
      locations: ['Jaipur', 'Delhi', 'Hyderabad'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: 'Gazetted religious observance across North and South regional hubs.',
      recurring: true,
      isOptional: false,
      status: 'Published',
      instructions: 'Official holiday for applicable regional branches.',
      createdDate: '2026-01-05',
      lastUpdated: '2026-01-05',
    },
    {
      id: 'HOL-04',
      name: 'Holi / Festival of Colors',
      date: '2026-03-04',
      displayDate: 'Mar 04, 2026',
      month: 'March',
      dayOfWeek: 'Wednesday',
      category: 'Gazetted',
      location: 'India · All Hubs',
      locations: ['Jaipur', 'Bangalore', 'Hyderabad', 'Delhi'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: 'Gazetted national festival of spring celebration.',
      recurring: true,
      isOptional: false,
      status: 'Published',
      instructions: 'No shift roster scheduling allowed on this date.',
      createdDate: '2026-01-05',
      lastUpdated: '2026-01-05',
    },
    {
      id: 'HOL-05',
      name: 'Good Friday',
      date: '2026-04-03',
      displayDate: 'Apr 03, 2026',
      month: 'April',
      dayOfWeek: 'Friday',
      category: 'Regional',
      location: 'Bangalore · Hyderabad · Global',
      locations: ['Bangalore', 'Hyderabad', 'Global'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: 'Statutory holiday for Southern technology hubs and international teams.',
      recurring: true,
      isOptional: false,
      status: 'Published',
      instructions: 'Emergency on-call engineers receive 2x holiday compensation.',
      createdDate: '2026-01-10',
      lastUpdated: '2026-01-10',
    },
    {
      id: 'HOL-06',
      name: 'Dr. B.R. Ambedkar Jayanti',
      date: '2026-04-14',
      displayDate: 'Apr 14, 2026',
      month: 'April',
      dayOfWeek: 'Tuesday',
      category: 'National',
      location: 'India · All Hubs',
      locations: ['Jaipur', 'Bangalore', 'Hyderabad', 'Delhi'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: "National gazetted holiday honoring the chief architect of India's Constitution.",
      recurring: true,
      isOptional: false,
      status: 'Published',
      instructions: 'Enterprise offices closed.',
      createdDate: '2026-01-10',
      lastUpdated: '2026-01-10',
    },
    {
      id: 'HOL-07',
      name: "International Workers' Day",
      date: '2026-05-01',
      displayDate: 'May 01, 2026',
      month: 'May',
      dayOfWeek: 'Friday',
      category: 'Regional',
      location: 'Jaipur · Delhi · Bangalore',
      locations: ['Jaipur', 'Delhi', 'Bangalore'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: 'Labor Day observance across regional corporate units.',
      recurring: true,
      isOptional: false,
      status: 'Published',
      instructions: 'Applies to state offices and statutory operations.',
      createdDate: '2026-01-15',
      lastUpdated: '2026-01-15',
    },
    {
      id: 'HOL-08',
      name: 'Eid-ul-Fitr',
      date: '2026-05-20',
      displayDate: 'May 20, 2026',
      month: 'May',
      dayOfWeek: 'Wednesday',
      category: 'Gazetted',
      location: 'Hyderabad · Delhi · Jaipur',
      locations: ['Hyderabad', 'Delhi', 'Jaipur'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: 'Gazetted festival holiday based on lunar moon sighting.',
      recurring: false,
      isOptional: false,
      status: 'Published',
      instructions: 'Date subject to official government moon sighting notification.',
      createdDate: '2026-01-15',
      lastUpdated: '2026-01-15',
    },
    {
      id: 'HOL-09',
      name: 'Independence Day of India',
      date: '2026-08-15',
      displayDate: 'Aug 15, 2026',
      month: 'August',
      dayOfWeek: 'Saturday',
      category: 'National',
      location: 'India · All Hubs',
      locations: ['Jaipur', 'Bangalore', 'Hyderabad', 'Delhi'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: 'National holiday celebrating Indian Independence.',
      recurring: true,
      isOptional: false,
      status: 'Published',
      instructions: 'Flag hoisting ceremony organized at Delhi & Jaipur headquarters.',
      createdDate: '2026-01-20',
      lastUpdated: '2026-01-20',
    },
    {
      id: 'HOL-10',
      name: 'Ganesh Chaturthi',
      date: '2026-09-14',
      displayDate: 'Sep 14, 2026',
      month: 'September',
      dayOfWeek: 'Monday',
      category: 'Regional',
      location: 'Hyderabad · Bangalore',
      locations: ['Hyderabad', 'Bangalore'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: 'Regional festive holiday across West & South IT hubs.',
      recurring: true,
      isOptional: false,
      status: 'Published',
      instructions: 'Regional holiday for Hyderabad and Bangalore campus staff.',
      createdDate: '2026-02-01',
      lastUpdated: '2026-02-01',
    },
    {
      id: 'HOL-11',
      name: 'Mahatma Gandhi Jayanti',
      date: '2026-10-02',
      displayDate: 'Oct 02, 2026',
      month: 'October',
      dayOfWeek: 'Friday',
      category: 'National',
      location: 'India · All Hubs',
      locations: ['Jaipur', 'Bangalore', 'Hyderabad', 'Delhi'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: 'National statutory holiday honoring Mahatma Gandhi.',
      recurring: true,
      isOptional: false,
      status: 'Published',
      instructions: 'Statutory closed day for all enterprise units.',
      createdDate: '2026-02-01',
      lastUpdated: '2026-02-01',
    },
    {
      id: 'HOL-12',
      name: 'Dussehra / Vijayadashami',
      date: '2026-10-20',
      displayDate: 'Oct 20, 2026',
      month: 'October',
      dayOfWeek: 'Tuesday',
      category: 'Gazetted',
      location: 'India · All Hubs',
      locations: ['Jaipur', 'Bangalore', 'Hyderabad', 'Delhi'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: 'Gazetted national festival celebrating the victory of good over evil.',
      recurring: true,
      isOptional: false,
      status: 'Published',
      instructions: 'Enterprise-wide holiday.',
      createdDate: '2026-02-10',
      lastUpdated: '2026-02-10',
    },
    {
      id: 'HOL-13',
      name: 'Diwali / Deepavali Festival',
      date: '2026-11-08',
      displayDate: 'Nov 08, 2026',
      month: 'November',
      dayOfWeek: 'Sunday',
      category: 'National',
      location: 'India · All Hubs',
      locations: ['Jaipur', 'Bangalore', 'Hyderabad', 'Delhi'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: 'Festival of Lights statutory observance across India offices.',
      recurring: true,
      isOptional: false,
      status: 'Published',
      instructions: 'Enterprise gift vouchers distributed prior to holiday.',
      createdDate: '2026-02-10',
      lastUpdated: '2026-02-10',
    },
    {
      id: 'HOL-14',
      name: 'Govardhan Puja / Bali Pratipada',
      date: '2026-11-09',
      displayDate: 'Nov 09, 2026',
      month: 'November',
      dayOfWeek: 'Monday',
      category: 'Regional',
      location: 'Jaipur · Delhi · Bangalore',
      locations: ['Jaipur', 'Delhi', 'Bangalore'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: 'Regional public holiday following Diwali.',
      recurring: true,
      isOptional: false,
      status: 'Published',
      instructions: 'Applicable to Jaipur, Delhi, and Bangalore branches.',
      createdDate: '2026-02-15',
      lastUpdated: '2026-02-15',
    },
    {
      id: 'HOL-15',
      name: 'Guru Nanak Jayanti',
      date: '2026-11-24',
      displayDate: 'Nov 24, 2026',
      month: 'November',
      dayOfWeek: 'Tuesday',
      category: 'Optional',
      location: 'Global · Restricted Holiday',
      locations: ['Jaipur', 'Bangalore', 'Hyderabad', 'Delhi', 'Global'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: 'Eligible under annual restricted/floating holiday quota.',
      recurring: true,
      isOptional: true,
      status: 'Published',
      instructions: 'Employees must submit floating holiday selection in OFC360 by Nov 15.',
      createdDate: '2026-02-15',
      lastUpdated: '2026-02-15',
      optedInCount: 42,
      selectionDeadline: '2026-11-15',
      userSelected: true,
    },
    {
      id: 'HOL-16',
      name: 'Thanksgiving Day',
      date: '2026-11-26',
      displayDate: 'Nov 26, 2026',
      month: 'November',
      dayOfWeek: 'Thursday',
      category: 'Regional',
      location: 'Global · US Operations',
      locations: ['Global'],
      departments: ['Operations', 'Sales'],
      employeeCategory: 'Full-Time',
      description: 'Federal statutory holiday for US workspace operations.',
      recurring: true,
      isOptional: false,
      status: 'Published',
      instructions: 'US desk support handled by APAC backup team.',
      createdDate: '2026-03-01',
      lastUpdated: '2026-03-01',
    },
    {
      id: 'HOL-17',
      name: 'Year-End Winter Holiday & Christmas',
      date: '2026-12-25',
      displayDate: 'Dec 25, 2026',
      month: 'December',
      dayOfWeek: 'Friday',
      category: 'National',
      location: 'Global · All Hubs',
      locations: ['Jaipur', 'Bangalore', 'Hyderabad', 'Delhi', 'Global'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: 'Global enterprise-wide statutory holiday.',
      recurring: true,
      isOptional: false,
      status: 'Published',
      instructions: 'Annual global shutdown day.',
      createdDate: '2026-03-01',
      lastUpdated: '2026-03-01',
    },
    {
      id: 'HOL-18',
      name: "New Year's Eve Floating Leave",
      date: '2026-12-31',
      displayDate: 'Dec 31, 2026',
      month: 'December',
      dayOfWeek: 'Thursday',
      category: 'Optional',
      location: 'Jaipur · Bangalore · Delhi',
      locations: ['Jaipur', 'Bangalore', 'Delhi'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: 'Year-end optional restricted holiday for team bonding.',
      recurring: true,
      isOptional: true,
      status: 'Published',
      instructions: 'Claim before Dec 20, 2026.',
      createdDate: '2026-03-05',
      lastUpdated: '2026-03-05',
      optedInCount: 18,
      selectionDeadline: '2026-12-20',
      userSelected: false,
    },
    {
      id: 'HOL-19',
      name: "Founder's Day Observance",
      date: '2026-12-18',
      displayDate: 'Dec 18, 2026',
      month: 'December',
      dayOfWeek: 'Friday',
      category: 'Company',
      location: 'Global · All Hubs',
      locations: ['Jaipur', 'Bangalore', 'Hyderabad', 'Delhi', 'Global'],
      departments: ['All Departments'],
      employeeCategory: 'All Employees',
      description: 'Company-specific celebratory holiday and annual town hall.',
      recurring: true,
      isOptional: false,
      status: 'Published',
      instructions: 'Town hall broadcast at 11:00 AM prior to holiday rest.',
      createdDate: '2026-03-10',
      lastUpdated: '2026-03-10',
    },
  ];

  const announcements: AnnouncementItem[] = [];

  const joiners: UpcomingJoiner[] = [];

  const exits: UpcomingExit[] = [];

  const workforce: WorkforceEmployee[] = [];

  const notifications: HrNotificationItem[] = [];

  const requisitions: RecruitmentRequisition[] = [];

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
        ratePercentage: 0,
        present: 0,
        late: 0,
        onLeave: 0,
        absent: 0,
      },
      approvals: approvalCounts,
      recruitment: {
        openPositions: 0,
        candidatesInPipeline: 0,
        activeRequisitionsCount: 0,
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
    faceAttendanceLogs: [],
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
      subtitle: 'HR profile information',
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

