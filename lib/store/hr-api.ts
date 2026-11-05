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
} = hrDashboardApi;
