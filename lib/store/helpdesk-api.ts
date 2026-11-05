import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
  HelpDeskState,
  SupportTicket,
  TicketMessage,
  EmployeeRequestItem,
  ConfidentialComplaintItem,
  KbArticle,
  SlaRuleConfig,
} from '@/lib/helpdesk-types';
import { authClient, API_BASE_URL } from '@/lib/auth-api';

const HELPDESK_API_BASE = `${API_BASE_URL}/api/v1/hr/helpdesk`;

export const helpDeskApi = createApi({
  reducerPath: 'helpDeskApi',
  baseQuery: fetchBaseQuery({
    baseUrl: HELPDESK_API_BASE,
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
    'HelpDeskState',
    'Tickets',
    'TicketDetail',
    'Requests',
    'Complaints',
    'KB',
    'SLA',
    'Agents',
  ],
  endpoints: (builder) => ({
    getHelpDeskData: builder.query<HelpDeskState, void>({
      query: () => '',
      providesTags: ['HelpDeskState', 'Tickets', 'Requests', 'Complaints'],
    }),

    getTicketById: builder.query<SupportTicket, string>({
      query: (id) => `/tickets/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'TicketDetail', id }],
    }),

    createTicket: builder.mutation<
      { message: string; ticket: SupportTicket },
      Partial<SupportTicket>
    >({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['HelpDeskState', 'Tickets'],
    }),

    sendTicketMessage: builder.mutation<
      { message: string; ticket: SupportTicket; newMessage: TicketMessage },
      {
        ticketId: string;
        message: string;
        isInternalNote: boolean;
        senderName?: string;
        senderRole?: string;
        attachments?: { name: string; size: string; url: string }[];
      }
    >({
      query: ({ ticketId, ...body }) => ({
        url: `/tickets/${ticketId}/messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        'HelpDeskState',
        'Tickets',
        { type: 'TicketDetail', id: arg.ticketId },
      ],
    }),

    updateTicket: builder.mutation<
      { message: string; ticket: SupportTicket },
      {
        ticketId: string;
        status?: SupportTicket['status'];
        priority?: SupportTicket['priority'];
        assignedAgentId?: string;
        escalationLevel?: number;
      }
    >({
      query: ({ ticketId, ...body }) => ({
        url: `/tickets/${ticketId}/update`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_res, _err, arg) => [
        'HelpDeskState',
        'Tickets',
        { type: 'TicketDetail', id: arg.ticketId },
      ],
    }),

    bulkUpdateTickets: builder.mutation<
      { message: string; tickets: SupportTicket[] },
      { ticketIds: string[]; action: 'assign' | 'status'; agentId?: string; status?: string }
    >({
      query: (body) => ({
        url: '/tickets/bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['HelpDeskState', 'Tickets'],
    }),

    actionEmployeeRequest: builder.mutation<
      { message: string; request: EmployeeRequestItem },
      { requestId: string; action: 'Approved' | 'Rejected' | 'Fulfilled'; notes?: string }
    >({
      query: ({ requestId, ...body }) => ({
        url: `/requests/${requestId}/action`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['HelpDeskState', 'Requests'],
    }),

    submitComplaint: builder.mutation<
      { message: string; complaint: ConfidentialComplaintItem },
      Partial<ConfidentialComplaintItem>
    >({
      query: (body) => ({
        url: '/complaints',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['HelpDeskState', 'Complaints'],
    }),

    addInvestigationNote: builder.mutation<
      { message: string; complaint: ConfidentialComplaintItem },
      { complaintId: string; note: string; author?: string }
    >({
      query: ({ complaintId, ...body }) => ({
        url: `/complaints/${complaintId}/notes`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['HelpDeskState', 'Complaints'],
    }),

    submitArticleFeedback: builder.mutation<
      { message: string; article: KbArticle },
      { articleId: string; type: 'helpful' | 'notHelpful' }
    >({
      query: ({ articleId, ...body }) => ({
        url: `/kb/${articleId}/feedback`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['HelpDeskState', 'KB'],
    }),

    saveKbArticle: builder.mutation<
      { message: string; article: KbArticle },
      Partial<KbArticle>
    >({
      query: (body) => ({
        url: '/kb',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['HelpDeskState', 'KB'],
    }),

    getAiAssist: builder.mutation<
      {
        suggestedPriority: string;
        suggestedCategory: string;
        sentiment: string;
        summary: string;
        aiSuggestions: string[];
      },
      { text: string; subject?: string; category?: string }
    >({
      query: (body) => ({
        url: '/ai/assist',
        method: 'POST',
        body,
      }),
    }),

    updateSlaRule: builder.mutation<
      { message: string; slaRules: SlaRuleConfig[] },
      Partial<SlaRuleConfig> & { priority: string }
    >({
      query: (body) => ({
        url: '/sla/update',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['HelpDeskState', 'SLA'],
    }),
  }),
});

export const {
  useGetHelpDeskDataQuery,
  useGetTicketByIdQuery,
  useCreateTicketMutation,
  useSendTicketMessageMutation,
  useUpdateTicketMutation,
  useBulkUpdateTicketsMutation,
  useActionEmployeeRequestMutation,
  useSubmitComplaintMutation,
  useAddInvestigationNoteMutation,
  useSubmitArticleFeedbackMutation,
  useSaveKbArticleMutation,
  useGetAiAssistMutation,
  useUpdateSlaRuleMutation,
} = helpDeskApi;
