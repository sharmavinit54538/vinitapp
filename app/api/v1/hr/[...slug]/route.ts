import { NextRequest, NextResponse } from 'next/server';
import {
  createInitialHrDashboardState,
  HrDashboardDataState,
  recomputeApprovalCounts,
  ApprovalItem,
  ShiftItem,
  HolidayItem,
  AnnouncementItem,
  WorkforceEmployee,
} from '@/lib/hr-dashboard-logic';

// Persistent server-side state across requests in the running container
const globalForHr = globalThis as unknown as {
  __ofc360HrState?: HrDashboardDataState;
};

function getHrState(): HrDashboardDataState {
  if (!globalForHr.__ofc360HrState) {
    globalForHr.__ofc360HrState = createInitialHrDashboardState();
  }
  return globalForHr.__ofc360HrState;
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const endpoint = slug.join('/');
  const state = getHrState();

  switch (endpoint) {
    case 'dashboard':
    case 'overview':
      return NextResponse.json(state);

    case 'kpis':
      return NextResponse.json(state.kpis);

    case 'approvals':
      return NextResponse.json({
        items: state.approvals,
        counts: state.kpis.approvals,
      });

    case 'attendance':
      return NextResponse.json({
        summary: state.kpis.attendance,
        departments: state.departments,
      });

    case 'shifts':
      return NextResponse.json({ items: state.shifts });

    case 'rosters':
      return NextResponse.json({ items: state.rosters });

    case 'holidays':
      return NextResponse.json({ items: state.holidays });

    case 'announcements':
      return NextResponse.json({ items: state.announcements });

    case 'workforce':
      return NextResponse.json({
        employees: state.workforce,
        joiners: state.joiners,
        exits: state.exits,
      });

    case 'notifications':
      return NextResponse.json({ items: state.notifications });

    case 'analytics':
      return NextResponse.json(state.analytics);

    case 'payroll':
      return NextResponse.json(state.kpis.payroll);

    default:
      return NextResponse.json(state);
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const endpoint = slug.join('/');
  const state = getHrState();

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  switch (endpoint) {
    case 'approvals/action': {
      const id = String(body.id || '');
      const status = body.status === 'Rejected' ? 'Rejected' : 'Approved';
      state.approvals = state.approvals.map((item: ApprovalItem) =>
        item.id === id ? { ...item, status } : item
      );
      state.kpis.approvals = recomputeApprovalCounts(state.approvals);
      return NextResponse.json({
        message: `Request ${id} marked as ${status}.`,
        approvals: state.approvals,
        counts: state.kpis.approvals,
      });
    }

    case 'shifts': {
      const id = String(body.id || `SHF-0${state.shifts.length + 1}`);
      const existingIndex = state.shifts.findIndex((s) => s.id === id);
      const shiftPayload: ShiftItem = {
        id,
        name: String(body.name || 'Custom Shift'),
        code: String(body.code || 'CS').toUpperCase(),
        startTime: String(body.startTime || '09:00 AM'),
        endTime: String(body.endTime || '06:00 PM'),
        breakDuration: String(body.breakDuration || '60 mins'),
        assignedEmployees: Number(body.assignedEmployees || 12),
        allowance: String(body.allowance || '$20 / day'),
        status: 'Active',
        departments: Array.isArray(body.departments)
          ? (body.departments as string[])
          : ['Engineering', 'People Operations'],
      };

      if (existingIndex >= 0) {
        state.shifts[existingIndex] = shiftPayload;
      } else {
        state.shifts = [shiftPayload, ...state.shifts];
      }

      return NextResponse.json({
        message:
          existingIndex >= 0
            ? `Shift "${shiftPayload.name}" updated.`
            : `Shift "${shiftPayload.name}" created.`,
        shift: shiftPayload,
        shifts: state.shifts,
      });
    }

    case 'rosters/assign': {
      const rosterId = String(body.rosterId || '');
      const day = String(body.day || 'Mon') as
        | 'Mon'
        | 'Tue'
        | 'Wed'
        | 'Thu'
        | 'Fri'
        | 'Sat'
        | 'Sun';
      const shiftCode = String(body.shiftCode || 'GS') as
        | 'MS'
        | 'GS'
        | 'NS'
        | 'FLX'
        | 'OFF';
      const labelMap: Record<string, string> = {
        MS: 'Morning',
        GS: 'General',
        NS: 'Night',
        FLX: 'Flexible',
        OFF: 'Weekly Off',
      };

      state.rosters = state.rosters.map((entry) => {
        if (entry.id !== rosterId) return entry;
        return {
          ...entry,
          swapStatus: body.approveSwap ? 'Swap Approved' : entry.swapStatus,
          schedule: entry.schedule.map((d) =>
            d.day === day
              ? {
                  ...d,
                  shiftCode,
                  shiftLabel: labelMap[shiftCode] || 'General',
                  isSwapRequested: false,
                }
              : d
          ),
        };
      });

      return NextResponse.json({
        message: 'Duty roster assignment updated.',
        rosters: state.rosters,
      });
    }

    case 'holidays': {
      const dateStr = String(body.date || '2026-12-31');
      const parsedDate = new Date(`${dateStr}T00:00:00`);
      const monthName = isNaN(parsedDate.getTime())
        ? 'December'
        : parsedDate.toLocaleDateString('en-US', { month: 'long' });
      const dayOfWeek = isNaN(parsedDate.getTime())
        ? 'Thursday'
        : parsedDate.toLocaleDateString('en-US', { weekday: 'long' });
      const displayDate = isNaN(parsedDate.getTime())
        ? dateStr
        : parsedDate.toLocaleDateString('en-US', {
            month: 'short',
            day: '2-digit',
            year: 'numeric',
          });

      const id = String(body.id || `HOL-0${state.holidays.length + 1}`);
      const existingIdx = state.holidays.findIndex((h) => h.id === id);

      const newHoliday: HolidayItem = {
        id,
        name: String(body.name || 'Company Holiday'),
        date: dateStr,
        displayDate,
        month: monthName,
        dayOfWeek,
        category:
          body.category === 'Regional' || body.category === 'Optional'
            ? body.category
            : 'National',
        location: String(body.location || 'Global · All Hubs'),
        description: String(
          body.description || 'Enterprise scheduled company holiday.'
        ),
      };

      if (existingIdx >= 0) {
        state.holidays[existingIdx] = newHoliday;
      } else {
        state.holidays = [newHoliday, ...state.holidays];
      }

      return NextResponse.json({
        message: `Holiday "${newHoliday.name}" saved.`,
        holiday: newHoliday,
        holidays: state.holidays,
      });
    }

    case 'holidays/delete': {
      const id = String(body.id || '');
      state.holidays = state.holidays.filter((h) => h.id !== id);
      return NextResponse.json({
        message: 'Holiday removed from calendar.',
        holidays: state.holidays,
      });
    }

    case 'announcements': {
      const newAnnouncement: AnnouncementItem = {
        id: `ANN-${300 + state.announcements.length + 1}`,
        title: String(body.title || 'Company Announcement'),
        description: String(body.description || ''),
        publishedDate: 'Just now · Nov 04, 2026',
        expiryDate: String(body.expiryDate || '2026-12-31'),
        department: String(body.department || 'All Departments'),
        targetAudience: String(body.targetAudience || 'All Employees'),
        category:
          (body.category as AnnouncementItem['category']) || 'Company News',
        priority: (body.priority as AnnouncementItem['priority']) || 'High',
        author: 'Aarav Sharma (HR Admin)',
        status: body.status === 'Draft' ? 'Draft' : 'Published',
      };

      state.announcements = [newAnnouncement, ...state.announcements];
      state.notifications = [
        {
          id: `NTF-${Date.now()}`,
          title: `Broadcast: ${newAnnouncement.title}`,
          message: `Published to ${newAnnouncement.department} (${newAnnouncement.targetAudience}).`,
          category: 'Company Announcements',
          timestamp: 'Just now',
          read: false,
          actionTab: 'home',
        },
        ...state.notifications,
      ];

      return NextResponse.json({
        message:
          newAnnouncement.status === 'Draft'
            ? 'Announcement saved as draft.'
            : 'Announcement published to workforce.',
        announcement: newAnnouncement,
        announcements: state.announcements,
      });
    }

    case 'workforce': {
      const fullName = String(body.name || 'New Employee').trim();
      const parts = fullName.split(/\s+/);
      const initials =
        parts.length >= 2
          ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
          : fullName.slice(0, 2).toUpperCase();
      const empId = `EMP-${3650 + state.workforce.length + 1}`;

      const role = (body.role as any) || 'employee';
      const newEmp: WorkforceEmployee = {
        id: `WF-${state.workforce.length + 1}`,
        employeeId: empId,
        name: fullName,
        email: String(
          body.email ||
            `${fullName.toLowerCase().replace(/\s+/g, '.')}@ofc360.com`
        ),
        phone: String(body.phone || '+91 98200 11223'),
        role,
        designation: String(body.designation || 'Senior Specialist'),
        department: String(body.department || 'Engineering'),
        location: String(body.location || 'Bengaluru · Hybrid'),
        shift: String(body.shift || 'General Shift'),
        status: 'Present',
        attendanceRate: 100.0,
        joiningDate: 'Nov 05, 2026',
        initials,
      };

      state.workforce = [newEmp, ...state.workforce];
      state.kpis.workforce.totalActive += 1;
      state.kpis.workforce.newHiresThisMonth += 1;
      state.kpis.attendance.present += 1;

      return NextResponse.json({
        message: `${fullName} (${empId}) enrolled in OFC360 Workforce.`,
        employee: newEmp,
        workforce: state.workforce,
      });
    }

    case 'notifications/read': {
      const id = body.id ? String(body.id) : null;
      if (id) {
        state.notifications = state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
      } else {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          read: true,
        }));
      }
      return NextResponse.json({
        message: 'Notifications updated.',
        notifications: state.notifications,
      });
    }

    case 'payroll/run': {
      state.kpis.payroll = {
        ...state.kpis.payroll,
        status:
          state.kpis.payroll.status === 'Ready for Disbursement'
            ? 'Processing'
            : 'Disbursed',
      };
      return NextResponse.json({
        message: `Payroll cycle (${state.kpis.payroll.cycleName}) status updated to ${state.kpis.payroll.status}.`,
        payroll: state.kpis.payroll,
      });
    }

    default:
      return NextResponse.json({ status: 'ok', endpoint });
  }
}
