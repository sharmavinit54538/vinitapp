import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  HrDashboardDataState,
  ApprovalItem,
  ShiftItem,
  RosterEntry,
  HolidayItem,
  AnnouncementItem,
  WorkforceEmployee,
  PayrollCycleSummary,
  FaceAttendanceLogItem,
} from '@/lib/hr-dashboard-logic';
import { authClient, API_BASE_URL } from '@/lib/auth-api';

const HR_API_BASE = `${API_BASE_URL}/api/v1/hr`;

export const hrDashboardApi = createApi({
  reducerPath: 'hrDashboardApi',
  baseQuery: fetchBaseQuery({
    baseUrl: HR_API_BASE,
    prepareHeaders: (headers) => {
      const token = authClient.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: [
    'Dashboard',
    'Approvals',
    'Shifts',
    'Rosters',
    'Holidays',
    'Announcements',
    'Workforce',
    'Notifications',
    'Payroll',
  ],
  endpoints: (builder) => ({
    getHrDashboard: builder.query<HrDashboardDataState, void>({
      query: () => '/dashboard',
      providesTags: [
        'Dashboard',
        'Approvals',
        'Shifts',
        'Rosters',
        'Holidays',
        'Announcements',
        'Workforce',
        'Notifications',
        'Payroll',
      ],
    }),

    decideApproval: builder.mutation<
      { message: string; approvals: ApprovalItem[] },
      { id: string; status: 'Approved' | 'Rejected'; comment?: string }
    >({
      query: (body) => ({
        url: '/approvals/action',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dashboard', 'Approvals'],
    }),

    saveShift: builder.mutation<
      { message: string; shift: ShiftItem; shifts: ShiftItem[] },
      Partial<ShiftItem> & { name: string }
    >({
      query: (body) => ({
        url: '/shifts',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dashboard', 'Shifts'],
    }),

    assignRosterShift: builder.mutation<
      { message: string; rosters: RosterEntry[] },
      {
        rosterId: string;
        day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
        shiftCode: 'MS' | 'GS' | 'NS' | 'FLX' | 'OFF';
        approveSwap?: boolean;
      }
    >({
      query: (body) => ({
        url: '/rosters/assign',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dashboard', 'Rosters'],
    }),

    saveHoliday: builder.mutation<
      { message: string; holiday: HolidayItem; holidays: HolidayItem[] },
      Partial<HolidayItem> & { name: string; date: string }
    >({
      query: (body) => ({
        url: '/holidays',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dashboard', 'Holidays'],
    }),

    deleteHoliday: builder.mutation<
      { message: string; holidays: HolidayItem[] },
      { id: string }
    >({
      query: (body) => ({
        url: '/holidays/delete',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dashboard', 'Holidays'],
    }),

    publishAnnouncement: builder.mutation<
      {
        message: string;
        announcement: AnnouncementItem;
        announcements: AnnouncementItem[];
      },
      {
        title: string;
        description: string;
        priority: 'Urgent' | 'High' | 'Normal';
        category: AnnouncementItem['category'];
        targetAudience: string;
        department: string;
        expiryDate: string;
        status?: 'Published' | 'Draft';
      }
    >({
      query: (body) => ({
        url: '/announcements',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dashboard', 'Announcements', 'Notifications'],
    }),

    addWorkforceEmployee: builder.mutation<
      {
        message: string;
        employee: WorkforceEmployee;
        workforce: WorkforceEmployee[];
      },
      {
        name: string;
        email: string;
        phone: string;
        designation: string;
        role?: string;
        department: string;
        location: string;
        shift: string;
      }
    >({
      query: (body) => ({
        url: '/workforce',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dashboard', 'Workforce'],
    }),

    markNotificationsRead: builder.mutation<
      { message: string },
      { id?: string }
    >({
      query: (body) => ({
        url: '/notifications/read',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dashboard', 'Notifications'],
    }),

    triggerPayrollRun: builder.mutation<
      { message: string; payroll: PayrollCycleSummary },
      void
    >({
      query: () => ({
        url: '/payroll/run',
        method: 'POST',
      }),
      invalidatesTags: ['Dashboard', 'Payroll'],
    }),

    updateAnnouncement: builder.mutation<
      { message: string; announcements: AnnouncementItem[] },
      {
        id: string;
        title?: string;
        description?: string;
        priority?: 'Urgent' | 'High' | 'Normal';
        department?: string;
        status?: 'Published' | 'Draft';
      }
    >({
      query: (body) => ({
        url: '/announcements/update',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dashboard', 'Announcements'],
    }),

    deleteAnnouncement: builder.mutation<
      { message: string; announcements: AnnouncementItem[] },
      { id: string }
    >({
      query: (body) => ({
        url: '/announcements/delete',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dashboard', 'Announcements'],
    }),

    createRequisition: builder.mutation<
      { message: string },
      {
        title: string;
        department: string;
        location?: string;
        openings?: number;
        priority?: 'Critical' | 'High' | 'Standard';
      }
    >({
      query: (body) => ({
        url: '/recruitment/create',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dashboard'],
    }),

    advanceRequisitionStage: builder.mutation<
      { message: string },
      { id: string; stage: 'Sourcing' | 'Technical Round' | 'Offer Extended' }
    >({
      query: (body) => ({
        url: '/recruitment/stage',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dashboard'],
    }),

    recordFaceAttendance: builder.mutation<
      {
        message: string;
        log: FaceAttendanceLogItem;
        faceAttendanceLogs: FaceAttendanceLogItem[];
      },
      {
        employeeName: string;
        employeeId?: string;
        department: string;
        shift?: string;
        punchType?: 'Check-In' | 'Late Check-In' | 'Check-Out';
        location?: string;
        snapshotDataUrl?: string;
      }
    >({
      query: (body) => ({
        url: '/attendance/face-checkin',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Dashboard', 'Workforce'],
    }),
  }),
});

export const {
  useGetHrDashboardQuery,
  useDecideApprovalMutation,
  useSaveShiftMutation,
  useAssignRosterShiftMutation,
  useSaveHolidayMutation,
  useDeleteHolidayMutation,
  usePublishAnnouncementMutation,
  useAddWorkforceEmployeeMutation,
  useMarkNotificationsReadMutation,
  useTriggerPayrollRunMutation,
  useUpdateAnnouncementMutation,
  useDeleteAnnouncementMutation,
  useCreateRequisitionMutation,
  useAdvanceRequisitionStageMutation,
  useRecordFaceAttendanceMutation,
} = hrDashboardApi;
