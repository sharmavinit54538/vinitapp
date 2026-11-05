import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  PayrollAnalyticsResponse,
  PayrollFilterState,
  PayrollRole,
} from '@/lib/payroll-analytics-types';
import { authClient, API_BASE_URL } from '@/lib/auth-api';

const PAYROLL_API_BASE = `${API_BASE_URL}/api/v1/hr/payroll-analytics`;

export const payrollAnalyticsApi = createApi({
  reducerPath: 'payrollAnalyticsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: PAYROLL_API_BASE,
    prepareHeaders: (headers) => {
      const token = authClient.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Accept', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['PayrollAnalytics'],
  endpoints: (builder) => ({
    getPayrollAnalytics: builder.query<PayrollAnalyticsResponse, PayrollFilterState>({
      query: (filters) => {
        const params = new URLSearchParams({
          financialYear: filters.financialYear,
          month: filters.month,
          department: filters.department,
          location: filters.location,
          employmentType: filters.employmentType,
          dateRange: filters.dateRange,
        });
        return `?${params.toString()}`;
      },
      providesTags: ['PayrollAnalytics'],
    }),

    updatePayrollAnomaly: builder.mutation<
      PayrollAnalyticsResponse,
      {
        anomalyId: string;
        status: 'Open' | 'Investigating' | 'Resolved';
        role?: PayrollRole;
        filters?: PayrollFilterState;
      }
    >({
      query: (payload) => ({
        url: '',
        method: 'POST',
        body: {
          action: 'update_anomaly',
          ...payload,
        },
      }),
      invalidatesTags: ['PayrollAnalytics'],
    }),

    fileComplianceObligation: builder.mutation<
      PayrollAnalyticsResponse,
      {
        complianceId: string;
        role?: PayrollRole;
        filters?: PayrollFilterState;
      }
    >({
      query: (payload) => ({
        url: '',
        method: 'POST',
        body: {
          action: 'file_compliance',
          ...payload,
        },
      }),
      invalidatesTags: ['PayrollAnalytics'],
    }),
  }),
});

export const {
  useGetPayrollAnalyticsQuery,
  useUpdatePayrollAnomalyMutation,
  useFileComplianceObligationMutation,
} = payrollAnalyticsApi;
