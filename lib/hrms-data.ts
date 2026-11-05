/**
 * Deterministic enterprise HRMS data and state transition helpers
 * for the OFC360 Mobile App Simulator.
 */

export interface Employee360Record {
  id: string;
  name: string;
  role: string;
  department: 'Engineering' | 'Product' | 'People Ops' | 'Finance';
  location: string;
  review360Score: number; // e.g., 4.9 / 5.0
  attendanceRate: number; // e.g., 99.2%
  status: 'Active' | 'In Review' | 'On Leave';
  initials: string;
}

export interface LeaveRequestItem {
  id: string;
  employeeName: string;
  department: string;
  leaveType: 'Annual Leave' | 'Parental Leave' | 'Study Leave';
  dateRange: string;
  days: number;
  status: 'Pending' | 'Approved' | 'Declined';
}

export const INITIAL_EMPLOYEES: Employee360Record[] = [
  {
    id: 'EMP-3601',
    name: 'Elena Rostova',
    role: 'Principal Systems Architect',
    department: 'Engineering',
    location: 'Zurich · Hybrid',
    review360Score: 4.9,
    attendanceRate: 99.4,
    status: 'Active',
    initials: 'ER',
  },
  {
    id: 'EMP-3602',
    name: 'Marcus Vance',
    role: 'VP of Global People Operations',
    department: 'People Ops',
    location: 'London · Onsite',
    review360Score: 4.8,
    attendanceRate: 98.8,
    status: 'Active',
    initials: 'MV',
  },
  {
    id: 'EMP-3603',
    name: 'Sora Takahashi',
    role: 'Staff Product Designer',
    department: 'Product',
    location: 'Tokyo · Remote',
    review360Score: 4.9,
    attendanceRate: 99.6,
    status: 'In Review',
    initials: 'ST',
  },
  {
    id: 'EMP-3604',
    name: 'David Chen',
    role: 'Director of FP&A',
    department: 'Finance',
    location: 'Singapore · Onsite',
    review360Score: 4.7,
    attendanceRate: 98.1,
    status: 'Active',
    initials: 'DC',
  },
  {
    id: 'EMP-3605',
    name: 'Amara Okafor',
    role: 'Lead Security Engineer',
    department: 'Engineering',
    location: 'New York · Hybrid',
    review360Score: 4.8,
    attendanceRate: 97.5,
    status: 'On Leave',
    initials: 'AO',
  },
];

export const INITIAL_LEAVE_REQUESTS: LeaveRequestItem[] = [
  {
    id: 'LR-801',
    employeeName: 'Sora Takahashi',
    department: 'Product',
    leaveType: 'Annual Leave',
    dateRange: 'Nov 16 – Nov 20, 2026',
    days: 5,
    status: 'Pending',
  },
  {
    id: 'LR-802',
    employeeName: 'Elena Rostova',
    department: 'Engineering',
    leaveType: 'Study Leave',
    dateRange: 'Dec 03 – Dec 04, 2026',
    days: 2,
    status: 'Pending',
  },
  {
    id: 'LR-803',
    employeeName: 'Amara Okafor',
    department: 'Engineering',
    leaveType: 'Annual Leave',
    dateRange: 'Nov 02 – Nov 06, 2026',
    days: 5,
    status: 'Approved',
  },
];

export function filterEmployees(
  employees: Employee360Record[],
  query: string,
  department: string
): Employee360Record[] {
  const q = query.trim().toLowerCase();
  return employees.filter((emp) => {
    const matchesDept = department === 'All' || emp.department === department;
    const matchesQuery =
      q === '' ||
      emp.name.toLowerCase().includes(q) ||
      emp.role.toLowerCase().includes(q) ||
      emp.id.toLowerCase().includes(q) ||
      emp.location.toLowerCase().includes(q);
    return matchesDept && matchesQuery;
  });
}

export function updateLeaveRequestStatus(
  requests: LeaveRequestItem[],
  requestId: string,
  newStatus: 'Approved' | 'Declined'
): LeaveRequestItem[] {
  return requests.map((req) =>
    req.id === requestId ? { ...req, status: newStatus } : req
  );
}
