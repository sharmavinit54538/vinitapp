import {
  AnnouncementItem,
  createInitialHrDashboardState,
} from './hr-dashboard-logic';
import {
  EmployeePayslip,
  LeaveBalanceItem,
  getDefaultAnnouncementsForEmployee,
} from './employee-portal-logic';

export type ManagerBottomTab =
  | 'home'
  | 'my_team'
  | 'approvals'
  | 'performance'
  | 'more';

export type ManagerHomeSubTab =
  | 'overview'
  | 'team_shifts'
  | 'team_roster'
  | 'approvals';

export type ManagerMoreModuleId =
  | 'hiring'
  | 'analytics'
  | 'self_service'
  | 'announcements'
  | 'profile';

export type ManagerShiftType = 'Morning' | 'General' | 'Night' | 'Week Off';

export type TeamAttendanceStatus =
  | 'Present'
  | 'Remote'
  | 'Late'
  | 'On Leave'
  | 'Checked Out'
  | 'Absent';

export type ApprovalFilterCategory =
  | 'All'
  | 'Leaves'
  | 'Shift Swaps'
  | 'Expenses & Travel'
  | 'Timesheets';

export type ManagerApprovalCategory = Exclude<ApprovalFilterCategory, 'All'>;

export interface ManagerProfileData {
  managerId: string;
  departmentId: string;
  departmentName: string;
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  location: string;
  avatarInitials: string;
}

export interface AttendanceRegularizationLog {
  id: string;
  date: string;
  previousStatus: TeamAttendanceStatus;
  nextStatus: TeamAttendanceStatus;
  reason: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  employeeId: string;
  managerId: string;
  departmentId: string;
  fullName: string;
  initials: string;
  email: string;
  phone: string;
  designation: string;
  location: string;
  shiftType: ManagerShiftType;
  shiftTiming: string;
  todayStatus: TeamAttendanceStatus;
  checkInTime: string;
  checkOutTime: string;
  monthlyAttendancePct: number;
  presentDays: number;
  overtimeHoursMonth: number;
  leaveBalance: {
    el: number;
    cl: number;
    sl: number;
  };
  assignedAssets: string[];
  goalProgressPct: number;
  lastAppraisalRating: number;
  regularizationHistory: AttendanceRegularizationLog[];
}

export interface ManagerApprovalItem {
  id: string;
  managerId: string;
  employeeId: string;
  employeeName: string;
  initials: string;
  designation: string;
  category: ManagerApprovalCategory;
  requestTitle: string;
  dateRange: string;
  durationOrAmount: string;
  reason: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  rejectionRemark?: string;
  leaveContext?: {
    leaveType: string;
    remainingDays: number;
    overlappingTeammates: string[];
  };
  shiftSwapContext?: {
    currentShift: string;
    requestedShift: string;
  };
}

export const ROSTER_DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export type RosterDayKey = (typeof ROSTER_DAYS_OF_WEEK)[number];

export interface TeamRosterRow {
  employeeId: string;
  managerId: string;
  employeeName: string;
  designation: string;
  dayShifts: Record<RosterDayKey, ManagerShiftType>;
}

export interface TeamGoalItem {
  id: string;
  managerId: string;
  employeeId: string;
  employeeName: string;
  title: string;
  kpiMetric: string;
  quarter: string;
  progressPct: number;
  status: 'On Track' | 'At Risk' | 'Completed';
  oneOnOneNotes: {
    id: string;
    date: string;
    summary: string;
  }[];
}

export interface TeamAppraisalRecord {
  id: string;
  managerId: string;
  employeeId: string;
  employeeName: string;
  designation: string;
  cycle: string;
  rating: number;
  competencyHighlight: string;
  feedback: string;
  status: 'Pending Review' | 'Submitted';
  updatedAt?: string;
}

export interface HiringRequisition {
  id: string;
  managerId: string;
  department: string;
  title: string;
  headcount: number;
  priority: 'Critical' | 'High' | 'Standard';
  hiringMode: 'Full-Time' | 'Contract';
  status: 'Open' | 'Interviewing' | 'Offer Stage';
  createdAt: string;
}

export interface HiringCandidate {
  id: string;
  managerId: string;
  requisitionId: string;
  requisitionTitle: string;
  name: string;
  initials: string;
  experienceYears: number;
  currentCompany: string;
  interviewSlot: string;
  stage: 'Shortlisted' | 'Technical Round' | 'Manager Round' | 'Decision Recorded';
  decision?: 'Hire' | 'Hold' | 'Reject';
  scorecardRating?: number;
  scorecardNotes?: string;
}

export interface ManagerPersonalLeaveRequest {
  id: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved';
}

export interface ManagerSelfServiceState {
  todayStatus: 'Not Checked In' | 'Checked In' | 'Checked Out';
  checkInTime: string | null;
  checkInIso: string | null;
  checkOutTime: string | null;
  workMode: 'Office' | 'WFH';
  locationLabel: string;
  leaveBalances: LeaveBalanceItem[];
  personalLeaveRequests: ManagerPersonalLeaveRequest[];
  payslips: EmployeePayslip[];
}

export interface ManagerNotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'Approvals' | 'Attendance' | 'Hiring' | 'Performance';
  read: boolean;
}

export interface ManagerPortalState {
  profile: ManagerProfileData;
  allTeamMembers: TeamMember[];
  approvals: ManagerApprovalItem[];
  rosterRows: TeamRosterRow[];
  teamGoals: TeamGoalItem[];
  appraisals: TeamAppraisalRecord[];
  requisitions: HiringRequisition[];
  candidates: HiringCandidate[];
  announcements: AnnouncementItem[];
  selfService: ManagerSelfServiceState;
  notifications: ManagerNotificationItem[];
}

export const SHIFT_TIMINGS_MAP: Record<ManagerShiftType, string> = {
  Morning: '07:00 AM – 04:00 PM',
  General: '09:30 AM – 06:30 PM',
  Night: '09:00 PM – 06:00 AM',
  'Week Off': 'Rest Day',
};

export const MANAGER_PORTAL_STORAGE_PREFIX = 'ofc360_manager_portal_state_v1';

export function getManagerPortalStorageKey(managerId: string): string {
  const cleanId = (managerId || 'MGR-104').trim().toUpperCase();
  return `${MANAGER_PORTAL_STORAGE_PREFIX}_${cleanId}`;
}

export function scopeTeamByManager<T extends { managerId: string }>(
  items: T[],
  managerId: string
): T[] {
  const clean = (managerId || 'MGR-104').trim().toUpperCase();
  return items.filter((item) => item.managerId.trim().toUpperCase() === clean);
}

export function computeManagerDashboardKpis(state: ManagerPortalState): {
  teamSize: number;
  attendanceRatePct: number;
  presentCount: number;
  onLeaveCount: number;
  lateCount: number;
  remoteCount: number;
  absentCount: number;
  pendingApprovalsCount: number;
  openRequisitionsCount: number;
  pendingReviewsCount: number;
} {
  const scopedMembers = scopeTeamByManager(
    state.allTeamMembers,
    state.profile.managerId
  );
  const teamSize = scopedMembers.length;
  const presentLike = scopedMembers.filter(
    (m) =>
      m.todayStatus === 'Present' ||
      m.todayStatus === 'Remote' ||
      m.todayStatus === 'Late' ||
      m.todayStatus === 'Checked Out'
  );
  const onLeaveCount = scopedMembers.filter((m) => m.todayStatus === 'On Leave').length;
  const lateCount = scopedMembers.filter((m) => m.todayStatus === 'Late').length;
  const remoteCount = scopedMembers.filter((m) => m.todayStatus === 'Remote').length;
  const absentCount = scopedMembers.filter((m) => m.todayStatus === 'Absent').length;
  const attendanceRatePct =
    teamSize > 0 ? Math.round((presentLike.length / teamSize) * 100) : 100;

  const scopedApprovals = scopeTeamByManager(
    state.approvals,
    state.profile.managerId
  );
  const pendingApprovalsCount = scopedApprovals.filter(
    (a) => a.status === 'Pending'
  ).length;

  const scopedReqs = scopeTeamByManager(
    state.requisitions,
    state.profile.managerId
  );
  const openRequisitionsCount = scopedReqs.length;

  const scopedReviews = scopeTeamByManager(
    state.appraisals,
    state.profile.managerId
  );
  const pendingReviewsCount = scopedReviews.filter(
    (r) => r.status === 'Pending Review'
  ).length;

  return {
    teamSize,
    attendanceRatePct,
    presentCount: presentLike.length,
    onLeaveCount,
    lateCount,
    remoteCount,
    absentCount,
    pendingApprovalsCount,
    openRequisitionsCount,
    pendingReviewsCount,
  };
}

export function filterManagerApprovals(
  items: ManagerApprovalItem[],
  managerId: string,
  category: ApprovalFilterCategory
): ManagerApprovalItem[] {
  const scoped = scopeTeamByManager(items, managerId);
  if (category === 'All') return scoped;
  return scoped.filter((item) => item.category === category);
}

export function applyManagerApprovalDecision(
  items: ManagerApprovalItem[],
  approvalId: string,
  decision: 'Approved' | 'Rejected',
  remark?: string
): { valid: boolean; error?: string; items: ManagerApprovalItem[] } {
  const trimmedRemark = (remark || '').trim();
  if (decision === 'Rejected' && trimmedRemark.length < 4) {
    return {
      valid: false,
      error: 'Please enter a rejection remark (min 4 characters) for the employee.',
      items,
    };
  }
  const updated = items.map((item) =>
    item.id === approvalId
      ? {
          ...item,
          status: decision,
          rejectionRemark: decision === 'Rejected' ? trimmedRemark : undefined,
        }
      : item
  );
  return { valid: true, items: updated };
}

export function regularizeMemberAttendance(
  members: TeamMember[],
  employeeId: string,
  nextStatus: TeamAttendanceStatus,
  reason: string
): { valid: boolean; error?: string; members: TeamMember[] } {
  const cleanReason = reason.trim();
  if (cleanReason.length < 5) {
    return {
      valid: false,
      error: 'Enter an audit reason (min 5 characters) for punch regularization.',
      members,
    };
  }
  const nowStr = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const todayIso = new Date().toISOString().slice(0, 10);

  const updated = members.map((m) => {
    if (m.employeeId !== employeeId) return m;
    const log: AttendanceRegularizationLog = {
      id: `REG-${Date.now().toString().slice(-4)}`,
      date: todayIso,
      previousStatus: m.todayStatus,
      nextStatus,
      reason: cleanReason,
      updatedAt: `Today · ${nowStr}`,
    };
    return {
      ...m,
      todayStatus: nextStatus,
      checkInTime:
        nextStatus === 'Present' || nextStatus === 'Remote'
          ? m.checkInTime === '--'
            ? '09:30 AM'
            : m.checkInTime
          : m.checkInTime,
      regularizationHistory: [log, ...m.regularizationHistory],
    };
  });

  return { valid: true, members: updated };
}

export function assignTeamRosterShift(
  rosterRows: TeamRosterRow[],
  members: TeamMember[],
  employeeId: string,
  dayKey: RosterDayKey,
  shiftType: ManagerShiftType
): { rosterRows: TeamRosterRow[]; members: TeamMember[] } {
  const nextRoster = rosterRows.map((row) =>
    row.employeeId === employeeId
      ? {
          ...row,
          dayShifts: {
            ...row.dayShifts,
            [dayKey]: shiftType,
          },
        }
      : row
  );
  const nextMembers = members.map((m) =>
    m.employeeId === employeeId && shiftType !== 'Week Off'
      ? {
          ...m,
          shiftType,
          shiftTiming: SHIFT_TIMINGS_MAP[shiftType],
        }
      : m
  );
  return { rosterRows: nextRoster, members: nextMembers };
}

export function validateHiringRequisitionInput(input: {
  title: string;
  headcount: number;
}): { valid: boolean; error?: string } {
  if (input.title.trim().length < 4) {
    return {
      valid: false,
      error: 'Enter a descriptive role title (min 4 characters).',
    };
  }
  if (!Number.isFinite(input.headcount) || input.headcount < 1 || input.headcount > 20) {
    return {
      valid: false,
      error: 'Headcount must be between 1 and 20.',
    };
  }
  return { valid: true };
}

export function computeTeamAnalyticsSummary(
  members: TeamMember[],
  goals: TeamGoalItem[]
): {
  avgAttendancePct: number;
  totalOvertimeHours: number;
  avgLeaveBalanceDays: number;
  avgGoalProgressPct: number;
  onTrackGoalsCount: number;
  atRiskGoalsCount: number;
} {
  if (members.length === 0) {
    return {
      avgAttendancePct: 0,
      totalOvertimeHours: 0,
      avgLeaveBalanceDays: 0,
      avgGoalProgressPct: 0,
      onTrackGoalsCount: 0,
      atRiskGoalsCount: 0,
    };
  }
  const avgAttendancePct = Math.round(
    members.reduce((sum, m) => sum + m.monthlyAttendancePct, 0) / members.length
  );
  const totalOvertimeHours = Number(
    members.reduce((sum, m) => sum + m.overtimeHoursMonth, 0).toFixed(1)
  );
  const avgLeaveBalanceDays = Math.round(
    members.reduce(
      (sum, m) => sum + m.leaveBalance.el + m.leaveBalance.cl + m.leaveBalance.sl,
      0
    ) / members.length
  );
  const avgGoalProgressPct =
    goals.length > 0
      ? Math.round(goals.reduce((s, g) => s + g.progressPct, 0) / goals.length)
      : 0;
  const onTrackGoalsCount = goals.filter(
    (g) => g.status === 'On Track' || g.status === 'Completed'
  ).length;
  const atRiskGoalsCount = goals.filter((g) => g.status === 'At Risk').length;

  return {
    avgAttendancePct,
    totalOvertimeHours,
    avgLeaveBalanceDays,
    avgGoalProgressPct,
    onTrackGoalsCount,
    atRiskGoalsCount,
  };
}

export function createInitialManagerPortalState(overrides?: {
  managerId?: string;
  fullName?: string;
  email?: string;
}): ManagerPortalState {
  const managerId = overrides?.managerId || 'MGR-104';
  const fullName = overrides?.fullName || 'Ananya Verma';
  const email = overrides?.email || 'ananya.verma@ofc360.com';
  const initials =
    fullName
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'AV';

  const makeRoster = (
    empId: string,
    empName: string,
    designation: string,
    base: ManagerShiftType
  ): TeamRosterRow => ({
    employeeId: empId,
    managerId,
    employeeName: empName,
    designation,
    dayShifts: {
      Mon: base,
      Tue: base,
      Wed: base,
      Thu: base,
      Fri: base,
      Sat: 'Week Off',
      Sun: 'Week Off',
    },
  });

  const directMembers: TeamMember[] = [
    {
      id: 'TM-01',
      employeeId: 'EMP-2048',
      managerId,
      departmentId: 'ENG-CORE',
      fullName: 'Rohan Kulkarni',
      initials: 'RK',
      email: 'rohan.kulkarni@ofc360.com',
      phone: '+91 98450 22918',
      designation: 'Senior Product Engineer',
      location: 'Bengaluru HQ · Floor 3',
      shiftType: 'General',
      shiftTiming: SHIFT_TIMINGS_MAP.General,
      todayStatus: 'Present',
      checkInTime: '09:21 AM',
      checkOutTime: '--',
      monthlyAttendancePct: 96,
      presentDays: 23,
      overtimeHoursMonth: 4.5,
      leaveBalance: { el: 11, cl: 5, sl: 6 },
      assignedAssets: ['MacBook Pro 14" (OFC-MBP-0842)', 'HID Badge (OFC-RFID-2048)'],
      goalProgressPct: 86,
      lastAppraisalRating: 4.6,
      regularizationHistory: [],
    },
    {
      id: 'TM-02',
      employeeId: 'EMP-2051',
      managerId,
      departmentId: 'ENG-CORE',
      fullName: 'Kavya Menon',
      initials: 'KM',
      email: 'kavya.menon@ofc360.com',
      phone: '+91 98861 33410',
      designation: 'Staff Backend Engineer',
      location: 'Remote · Kochi',
      shiftType: 'General',
      shiftTiming: SHIFT_TIMINGS_MAP.General,
      todayStatus: 'Remote',
      checkInTime: '09:14 AM',
      checkOutTime: '--',
      monthlyAttendancePct: 98,
      presentDays: 24,
      overtimeHoursMonth: 3.0,
      leaveBalance: { el: 12, cl: 6, sl: 7 },
      assignedAssets: ['MacBook Pro 16" (OFC-MBP-0911)'],
      goalProgressPct: 92,
      lastAppraisalRating: 4.8,
      regularizationHistory: [],
    },
    {
      id: 'TM-03',
      employeeId: 'EMP-2054',
      managerId,
      departmentId: 'ENG-CORE',
      fullName: 'Arjun Rao',
      initials: 'AR',
      email: 'arjun.rao@ofc360.com',
      phone: '+91 97400 77821',
      designation: 'Cloud Infrastructure Lead',
      location: 'Bengaluru HQ · Floor 3',
      shiftType: 'Morning',
      shiftTiming: SHIFT_TIMINGS_MAP.Morning,
      todayStatus: 'Present',
      checkInTime: '07:05 AM',
      checkOutTime: '--',
      monthlyAttendancePct: 94,
      presentDays: 22,
      overtimeHoursMonth: 8.0,
      leaveBalance: { el: 9, cl: 4, sl: 5 },
      assignedAssets: ['ThinkPad X1 Carbon (OFC-TP-0224)', 'Hardware Key'],
      goalProgressPct: 79,
      lastAppraisalRating: 4.3,
      regularizationHistory: [],
    },
    {
      id: 'TM-04',
      employeeId: 'EMP-2057',
      managerId,
      departmentId: 'ENG-CORE',
      fullName: 'Devika Nair',
      initials: 'DN',
      email: 'devika.nair@ofc360.com',
      phone: '+91 99002 51209',
      designation: 'Senior QA Automation Engineer',
      location: 'Bengaluru HQ · Floor 2',
      shiftType: 'General',
      shiftTiming: SHIFT_TIMINGS_MAP.General,
      todayStatus: 'Late',
      checkInTime: '10:02 AM',
      checkOutTime: '--',
      monthlyAttendancePct: 91,
      presentDays: 21,
      overtimeHoursMonth: 6.5,
      leaveBalance: { el: 10, cl: 3, sl: 6 },
      assignedAssets: ['MacBook Air M3 (OFC-MBA-0402)'],
      goalProgressPct: 84,
      lastAppraisalRating: 4.4,
      regularizationHistory: [],
    },
    {
      id: 'TM-05',
      employeeId: 'EMP-2060',
      managerId,
      departmentId: 'ENG-CORE',
      fullName: 'Meera Iyer',
      initials: 'MI',
      email: 'meera.iyer@ofc360.com',
      phone: '+91 98454 60912',
      designation: 'Product Designer',
      location: 'Bengaluru HQ · Studio',
      shiftType: 'General',
      shiftTiming: SHIFT_TIMINGS_MAP.General,
      todayStatus: 'On Leave',
      checkInTime: '--',
      checkOutTime: '--',
      monthlyAttendancePct: 92,
      presentDays: 22,
      overtimeHoursMonth: 1.0,
      leaveBalance: { el: 8, cl: 4, sl: 6 },
      assignedAssets: ['MacBook Pro 14" (OFC-MBP-0788)', 'Wacom Intuos'],
      goalProgressPct: 88,
      lastAppraisalRating: 4.5,
      regularizationHistory: [],
    },
    {
      id: 'TM-06',
      employeeId: 'EMP-2063',
      managerId,
      departmentId: 'ENG-CORE',
      fullName: 'Siddharth Joshi',
      initials: 'SJ',
      email: 'siddharth.joshi@ofc360.com',
      phone: '+91 98119 43210',
      designation: 'Frontend Platform Engineer',
      location: 'Remote · Pune',
      shiftType: 'General',
      shiftTiming: SHIFT_TIMINGS_MAP.General,
      todayStatus: 'Remote',
      checkInTime: '09:19 AM',
      checkOutTime: '--',
      monthlyAttendancePct: 95,
      presentDays: 23,
      overtimeHoursMonth: 2.0,
      leaveBalance: { el: 13, cl: 5, sl: 8 },
      assignedAssets: ['MacBook Pro 14" (OFC-MBP-0891)'],
      goalProgressPct: 74,
      lastAppraisalRating: 4.1,
      regularizationHistory: [],
    },
    {
      id: 'TM-07',
      employeeId: 'EMP-2066',
      managerId,
      departmentId: 'ENG-CORE',
      fullName: 'Nikhil Deshmukh',
      initials: 'ND',
      email: 'nikhil.d@ofc360.com',
      phone: '+91 97650 88211',
      designation: 'Site Reliability Engineer',
      location: 'Bengaluru HQ · NOC',
      shiftType: 'Night',
      shiftTiming: SHIFT_TIMINGS_MAP.Night,
      todayStatus: 'Present',
      checkInTime: '08:58 PM',
      checkOutTime: '--',
      monthlyAttendancePct: 96,
      presentDays: 23,
      overtimeHoursMonth: 5.5,
      leaveBalance: { el: 14, cl: 6, sl: 7 },
      assignedAssets: ['ThinkPad P14s (OFC-TP-0519)'],
      goalProgressPct: 90,
      lastAppraisalRating: 4.7,
      regularizationHistory: [],
    },
    {
      id: 'TM-08',
      employeeId: 'EMP-2069',
      managerId,
      departmentId: 'ENG-CORE',
      fullName: 'Tanya Kapoor',
      initials: 'TK',
      email: 'tanya.kapoor@ofc360.com',
      phone: '+91 98204 99123',
      designation: 'Data Platform Engineer',
      location: 'Bengaluru HQ · Floor 3',
      shiftType: 'General',
      shiftTiming: SHIFT_TIMINGS_MAP.General,
      todayStatus: 'Present',
      checkInTime: '09:26 AM',
      checkOutTime: '--',
      monthlyAttendancePct: 93,
      presentDays: 22,
      overtimeHoursMonth: 2.5,
      leaveBalance: { el: 10, cl: 5, sl: 6 },
      assignedAssets: ['MacBook Pro 14" (OFC-MBP-0904)'],
      goalProgressPct: 81,
      lastAppraisalRating: 4.2,
      regularizationHistory: [],
    },
    {
      id: 'TM-09',
      employeeId: 'EMP-2072',
      managerId,
      departmentId: 'ENG-CORE',
      fullName: 'Pranav Shetty',
      initials: 'PS',
      email: 'pranav.shetty@ofc360.com',
      phone: '+91 99801 44019',
      designation: 'Mobile Apps Engineer',
      location: 'Bengaluru HQ · Floor 3',
      shiftType: 'General',
      shiftTiming: SHIFT_TIMINGS_MAP.General,
      todayStatus: 'Present',
      checkInTime: '09:12 AM',
      checkOutTime: '--',
      monthlyAttendancePct: 95,
      presentDays: 23,
      overtimeHoursMonth: 3.5,
      leaveBalance: { el: 11, cl: 5, sl: 7 },
      assignedAssets: ['MacBook Pro 14" (OFC-MBP-0920)', 'Pixel 9 Test Device'],
      goalProgressPct: 87,
      lastAppraisalRating: 4.5,
      regularizationHistory: [],
    },
    {
      id: 'TM-10',
      employeeId: 'EMP-2075',
      managerId,
      departmentId: 'ENG-CORE',
      fullName: 'Zoya Khan',
      initials: 'ZK',
      email: 'zoya.khan@ofc360.com',
      phone: '+91 98182 11904',
      designation: 'Security & API Engineer',
      location: 'Bengaluru HQ · Floor 3',
      shiftType: 'Morning',
      shiftTiming: SHIFT_TIMINGS_MAP.Morning,
      todayStatus: 'Present',
      checkInTime: '07:08 AM',
      checkOutTime: '--',
      monthlyAttendancePct: 97,
      presentDays: 24,
      overtimeHoursMonth: 1.5,
      leaveBalance: { el: 12, cl: 6, sl: 6 },
      assignedAssets: ['MacBook Pro 14" (OFC-MBP-0933)'],
      goalProgressPct: 94,
      lastAppraisalRating: 4.8,
      regularizationHistory: [],
    },
    {
      id: 'TM-11',
      employeeId: 'EMP-2078',
      managerId,
      departmentId: 'ENG-CORE',
      fullName: 'Harsh Vardhan',
      initials: 'HV',
      email: 'harsh.v@ofc360.com',
      phone: '+91 99100 54321',
      designation: 'Platform Engineer I',
      location: 'Bengaluru HQ · Floor 3',
      shiftType: 'General',
      shiftTiming: SHIFT_TIMINGS_MAP.General,
      todayStatus: 'Present',
      checkInTime: '09:24 AM',
      checkOutTime: '--',
      monthlyAttendancePct: 90,
      presentDays: 21,
      overtimeHoursMonth: 2.0,
      leaveBalance: { el: 9, cl: 4, sl: 5 },
      assignedAssets: ['MacBook Air M3 (OFC-MBA-0499)'],
      goalProgressPct: 68,
      lastAppraisalRating: 3.9,
      regularizationHistory: [],
    },
    {
      id: 'TM-12',
      employeeId: 'EMP-2081',
      managerId,
      departmentId: 'ENG-CORE',
      fullName: 'Neha Bansal',
      initials: 'NB',
      email: 'neha.bansal@ofc360.com',
      phone: '+91 98712 67890',
      designation: 'Technical Program Coordinator',
      location: 'Bengaluru HQ · Floor 3',
      shiftType: 'General',
      shiftTiming: SHIFT_TIMINGS_MAP.General,
      todayStatus: 'Present',
      checkInTime: '09:16 AM',
      checkOutTime: '--',
      monthlyAttendancePct: 96,
      presentDays: 23,
      overtimeHoursMonth: 1.0,
      leaveBalance: { el: 11, cl: 5, sl: 8 },
      assignedAssets: ['MacBook Air M3 (OFC-MBA-0512)'],
      goalProgressPct: 89,
      lastAppraisalRating: 4.6,
      regularizationHistory: [],
    },
    // Non-scoped out-of-team member to verify strict managerId isolation
    {
      id: 'TM-EXT-99',
      employeeId: 'EMP-9099',
      managerId: 'MGR-999',
      departmentId: 'SALES-OPS',
      fullName: 'Vikramaditya Sen',
      initials: 'VS',
      email: 'vikram.sen@ofc360.com',
      phone: '+91 98200 10101',
      designation: 'Enterprise Account Director',
      location: 'Mumbai BKC',
      shiftType: 'General',
      shiftTiming: SHIFT_TIMINGS_MAP.General,
      todayStatus: 'Absent',
      checkInTime: '--',
      checkOutTime: '--',
      monthlyAttendancePct: 84,
      presentDays: 19,
      overtimeHoursMonth: 0,
      leaveBalance: { el: 7, cl: 2, sl: 4 },
      assignedAssets: ['iPad Pro'],
      goalProgressPct: 60,
      lastAppraisalRating: 3.8,
      regularizationHistory: [],
    },
  ];

  return {
    profile: {
      managerId,
      departmentId: 'ENG-CORE',
      departmentName: 'Core Engineering & Platform',
      fullName,
      email,
      phone: '+91 98450 11290',
      designation: 'VP Engineering · Team Lead',
      location: 'Bengaluru · Global HQ',
      avatarInitials: initials,
    },
    allTeamMembers: directMembers,
    approvals: [
      {
        id: 'MAPR-301',
        managerId,
        employeeId: 'EMP-2048',
        employeeName: 'Rohan Kulkarni',
        initials: 'RK',
        designation: 'Senior Product Engineer',
        category: 'Leaves',
        requestTitle: 'Casual Leave (1 Day)',
        dateRange: '2026-11-27',
        durationOrAmount: '1 Day',
        reason: 'Family travel to Mysuru for sister’s convocation.',
        submittedAt: '2h ago',
        status: 'Pending',
        leaveContext: {
          leaveType: 'Casual Leave',
          remainingDays: 5,
          overlappingTeammates: ['Meera Iyer (Nov 27)'],
        },
      },
      {
        id: 'MAPR-302',
        managerId,
        employeeId: 'EMP-2051',
        employeeName: 'Kavya Menon',
        initials: 'KM',
        designation: 'Staff Backend Engineer',
        category: 'Leaves',
        requestTitle: 'Earned Leave (2 Days)',
        dateRange: '2026-11-19 → 2026-11-20',
        durationOrAmount: '2 Days',
        reason: 'Attending cousin wedding ceremony in Ernakulam.',
        submittedAt: '4h ago',
        status: 'Pending',
        leaveContext: {
          leaveType: 'Earned / Privilege Leave',
          remainingDays: 12,
          overlappingTeammates: [],
        },
      },
      {
        id: 'MAPR-303',
        managerId,
        employeeId: 'EMP-2048',
        employeeName: 'Rohan Kulkarni',
        initials: 'RK',
        designation: 'Senior Product Engineer',
        category: 'Shift Swaps',
        requestTitle: 'Shift Swap → Flexible Hybrid',
        dateRange: 'Effective 2026-11-18',
        durationOrAmount: 'Morning / Flex',
        reason: 'Coordinate release handoff with EU product engineering.',
        submittedAt: 'Yesterday',
        status: 'Pending',
        shiftSwapContext: {
          currentShift: 'General (09:30 AM – 06:30 PM)',
          requestedShift: 'Morning (07:00 AM – 04:00 PM)',
        },
      },
      {
        id: 'MAPR-304',
        managerId,
        employeeId: 'EMP-2054',
        employeeName: 'Arjun Rao',
        initials: 'AR',
        designation: 'Cloud Infrastructure Lead',
        category: 'Expenses & Travel',
        requestTitle: 'AWS Architecture Summit Flight & Stay',
        dateRange: '2026-11-10',
        durationOrAmount: '₹14,200',
        reason: 'Mumbai enterprise security partner workshop.',
        submittedAt: 'Yesterday',
        status: 'Pending',
      },
      {
        id: 'MAPR-305',
        managerId,
        employeeId: 'EMP-2057',
        employeeName: 'Devika Nair',
        initials: 'DN',
        designation: 'Senior QA Automation Engineer',
        category: 'Timesheets',
        requestTitle: 'Production Release Overtime Log',
        dateRange: '2026-11-08 (Sunday)',
        durationOrAmount: '6.5 Hrs OT',
        reason: 'Zero-downtime payment gateway v4 regression sign-off.',
        submittedAt: '2d ago',
        status: 'Pending',
      },
      {
        id: 'MAPR-298',
        managerId,
        employeeId: 'EMP-2066',
        employeeName: 'Nikhil Deshmukh',
        initials: 'ND',
        designation: 'Site Reliability Engineer',
        category: 'Timesheets',
        requestTitle: 'DR Failover Drill Overtime',
        dateRange: '2026-11-02',
        durationOrAmount: '4.0 Hrs OT',
        reason: 'Quarterly multi-region failover drill.',
        submittedAt: 'Nov 03',
        status: 'Approved',
      },
    ],
    rosterRows: directMembers
      .filter((m) => m.managerId === managerId)
      .slice(0, 6)
      .map((m) => makeRoster(m.employeeId, m.fullName, m.designation, m.shiftType)),
    teamGoals: [
      {
        id: 'GOAL-01',
        managerId,
        employeeId: 'EMP-2048',
        employeeName: 'Rohan Kulkarni',
        title: 'Reduce Core Checkout API p99 Latency below 120ms',
        kpiMetric: '112ms / 120ms target',
        quarter: 'Q4 2026',
        progressPct: 86,
        status: 'On Track',
        oneOnOneNotes: [
          {
            id: 'N-1',
            date: 'Nov 07, 2026',
            summary: 'Redis cache warming rolled out to 100% production pods.',
          },
        ],
      },
      {
        id: 'GOAL-02',
        managerId,
        employeeId: 'EMP-2051',
        employeeName: 'Kavya Menon',
        title: 'Multi-Region Ledger Idempotency Migration',
        kpiMetric: '92% rollout complete',
        quarter: 'Q4 2026',
        progressPct: 92,
        status: 'On Track',
        oneOnOneNotes: [],
      },
      {
        id: 'GOAL-03',
        managerId,
        employeeId: 'EMP-2078',
        employeeName: 'Harsh Vardhan',
        title: 'Increase Automated Integration Coverage to 85%',
        kpiMetric: '68% / 85% target',
        quarter: 'Q4 2026',
        progressPct: 68,
        status: 'At Risk',
        oneOnOneNotes: [
          {
            id: 'N-2',
            date: 'Nov 05, 2026',
            summary: 'Paired with Devika to unblock Playwright CI fixtures.',
          },
        ],
      },
    ],
    appraisals: [
      {
        id: 'APPR-01',
        managerId,
        employeeId: 'EMP-2048',
        employeeName: 'Rohan Kulkarni',
        designation: 'Senior Product Engineer',
        cycle: 'Q4 2026',
        rating: 4,
        competencyHighlight: 'System Architecture & Ownership',
        feedback: '',
        status: 'Pending Review',
      },
      {
        id: 'APPR-02',
        managerId,
        employeeId: 'EMP-2051',
        employeeName: 'Kavya Menon',
        designation: 'Staff Backend Engineer',
        cycle: 'Q4 2026',
        rating: 5,
        competencyHighlight: 'Distributed Reliability & Mentorship',
        feedback: 'Consistently unblocked cross-team architecture bottlenecks.',
        status: 'Submitted',
        updatedAt: 'Nov 09, 2026',
      },
      {
        id: 'APPR-03',
        managerId,
        employeeId: 'EMP-2078',
        employeeName: 'Harsh Vardhan',
        designation: 'Platform Engineer I',
        cycle: 'Q4 2026',
        rating: 3,
        competencyHighlight: 'Testing Velocity & Code Quality',
        feedback: '',
        status: 'Pending Review',
      },
    ],
    requisitions: [
      {
        id: 'REQ-401',
        managerId,
        department: 'Core Engineering',
        title: 'Senior Distributed Systems Engineer',
        headcount: 2,
        priority: 'Critical',
        hiringMode: 'Full-Time',
        status: 'Interviewing',
        createdAt: 'Oct 28, 2026',
      },
      {
        id: 'REQ-402',
        managerId,
        department: 'Core Engineering',
        title: 'Staff Product Designer (Design Systems)',
        headcount: 1,
        priority: 'High',
        hiringMode: 'Full-Time',
        status: 'Open',
        createdAt: 'Nov 06, 2026',
      },
    ],
    candidates: [
      {
        id: 'CND-801',
        managerId,
        requisitionId: 'REQ-401',
        requisitionTitle: 'Senior Distributed Systems Engineer',
        name: 'Aditi Subramanian',
        initials: 'AS',
        experienceYears: 6,
        currentCompany: 'Razorpay',
        interviewSlot: 'Today · 04:00 PM',
        stage: 'Manager Round',
      },
      {
        id: 'CND-802',
        managerId,
        requisitionId: 'REQ-401',
        requisitionTitle: 'Senior Distributed Systems Engineer',
        name: 'Karthik Hegde',
        initials: 'KH',
        experienceYears: 5,
        currentCompany: 'Postman',
        interviewSlot: 'Tomorrow · 11:30 AM',
        stage: 'Technical Round',
      },
    ],
    announcements: getDefaultAnnouncementsForEmployee(),
    selfService: {
      todayStatus: 'Checked In',
      checkInTime: '09:10 AM',
      checkInIso: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      checkOutTime: null,
      workMode: 'Office',
      locationLabel: 'Bengaluru HQ · Indiranagar Tower B',
      leaveBalances: [
        {
          key: 'earned',
          label: 'Earned Leave',
          code: 'EL',
          total: 18,
          used: 4,
          remaining: 14,
          accrualNote: '+1.5 days / month',
        },
        {
          key: 'casual',
          label: 'Casual Leave',
          code: 'CL',
          total: 8,
          used: 2,
          remaining: 6,
          accrualNote: 'Annual credit',
        },
        {
          key: 'sick',
          label: 'Sick Leave',
          code: 'SL',
          total: 8,
          used: 1,
          remaining: 7,
          accrualNote: 'Medical allowance',
        },
      ],
      personalLeaveRequests: [
        {
          id: 'MLEV-12',
          leaveType: 'Earned Leave',
          fromDate: '2026-12-24',
          toDate: '2026-12-26',
          days: 3,
          reason: 'Year-end family holiday break.',
          status: 'Approved',
        },
      ],
      payslips: [
        {
          id: 'MPAY-2026-10',
          monthLabel: 'October 2026',
          payPeriod: '01 Oct 2026 – 31 Oct 2026',
          payDate: 'Oct 30, 2026',
          paymentStatus: 'Credited',
          ctcAnnual: 3800000,
          earnings: [
            { label: 'Basic Salary', amount: 155000 },
            { label: 'HRA', amount: 62000 },
            { label: 'Leadership Allowance', amount: 75000 },
          ],
          deductions: [
            { label: 'EPF Contribution', amount: 18600 },
            { label: 'Income Tax (TDS)', amount: 46200 },
            { label: 'Professional Tax', amount: 200 },
          ],
          reimbursements: 4200,
          taxRegime: 'New Regime',
          tdsDeducted: 46200,
          bankAccountMasked: 'HDFC •••• 9182',
        },
      ],
    },
    notifications: [
      {
        id: 'MNOT-01',
        title: '5 Team Requests Awaiting Review',
        message: '2 leave requests, 1 shift swap, 1 travel expense & 1 overtime log.',
        timestamp: '18m ago',
        category: 'Approvals',
        read: false,
      },
      {
        id: 'MNOT-02',
        title: 'Candidate Manager Round Today 4:00 PM',
        message: 'Aditi Subramanian (REQ-401 Senior Distributed Systems Engineer).',
        timestamp: '1h ago',
        category: 'Hiring',
        read: false,
      },
      {
        id: 'MNOT-03',
        title: 'Devika Nair Punched In Late (10:02 AM)',
        message: '32 mins past General Shift start · Check attendance logs if needed.',
        timestamp: '2h ago',
        category: 'Attendance',
        read: true,
      },
    ],
  };
}

export function loadManagerPortalState(overrides?: {
  managerId?: string;
  fullName?: string;
  email?: string;
}): ManagerPortalState {
  const managerId = overrides?.managerId || 'MGR-104';
  const fallback = createInitialManagerPortalState(overrides);
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(getManagerPortalStorageKey(managerId));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<ManagerPortalState>;
    return {
      ...fallback,
      ...parsed,
      profile: { ...fallback.profile, ...(parsed.profile || {}) },
      allTeamMembers: Array.isArray(parsed.allTeamMembers)
        ? parsed.allTeamMembers
        : fallback.allTeamMembers,
      approvals: Array.isArray(parsed.approvals)
        ? parsed.approvals
        : fallback.approvals,
      rosterRows: Array.isArray(parsed.rosterRows)
        ? parsed.rosterRows
        : fallback.rosterRows,
      teamGoals: Array.isArray(parsed.teamGoals)
        ? parsed.teamGoals
        : fallback.teamGoals,
      appraisals: Array.isArray(parsed.appraisals)
        ? parsed.appraisals
        : fallback.appraisals,
      requisitions: Array.isArray(parsed.requisitions)
        ? parsed.requisitions
        : fallback.requisitions,
      candidates: Array.isArray(parsed.candidates)
        ? parsed.candidates
        : fallback.candidates,
      announcements: Array.isArray(parsed.announcements)
        ? parsed.announcements
        : fallback.announcements,
      selfService: {
        ...fallback.selfService,
        ...(parsed.selfService || {}),
      },
      notifications: Array.isArray(parsed.notifications)
        ? parsed.notifications
        : fallback.notifications,
    };
  } catch {
    return fallback;
  }
}

export function saveManagerPortalState(state: ManagerPortalState): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(
      getManagerPortalStorageKey(state.profile.managerId),
      JSON.stringify(state)
    );
  } catch {
    // Ignore storage quota errors
  }
}

export function getSeedHolidaysCount(): number {
  return createInitialHrDashboardState().holidays.length;
}
