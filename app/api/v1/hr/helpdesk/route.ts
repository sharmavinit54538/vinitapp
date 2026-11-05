import { NextRequest, NextResponse } from 'next/server';
import {
  createInitialHelpDeskState,
  HelpDeskState,
  SupportTicket,
  TicketMessage,
  EmployeeRequestItem,
  ConfidentialComplaintItem,
  KbArticle,
  FaqItem,
} from '@/lib/helpdesk-types';

const globalForHelpDesk = globalThis as unknown as {
  __ofc360HelpDeskState?: HelpDeskState;
};

export function getHelpDeskState(): HelpDeskState {
  if (!globalForHelpDesk.__ofc360HelpDeskState) {
    globalForHelpDesk.__ofc360HelpDeskState = createInitialHelpDeskState();
  }
  return globalForHelpDesk.__ofc360HelpDeskState;
}

export function recomputeHelpDeskKpis(state: HelpDeskState) {
  state.kpis.totalTickets = state.tickets.length;
  state.kpis.openTickets = state.tickets.filter((t) => t.status === 'Open').length;
  state.kpis.inProgressTickets = state.tickets.filter((t) => t.status === 'In Progress').length;
  state.kpis.pendingTickets = state.tickets.filter((t) => t.status === 'Pending').length;
  state.kpis.resolvedTickets = state.tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length;
  state.kpis.slaBreachedTickets = state.tickets.filter((t) => t.slaStatus === 'Breached').length;
  state.kpis.totalRequests = state.employeeRequests.length;
  state.kpis.totalComplaints = state.complaints.length;
  state.kpis.activeAgents = state.agents.filter((a) => a.availabilityStatus === 'Available').length;
}

// GET /api/v1/hr/helpdesk
export async function GET(req: NextRequest) {
  const state = getHelpDeskState();
  const searchParams = req.nextUrl.searchParams;
  const section = searchParams.get('section');

  if (section === 'kpis') {
    return NextResponse.json(state.kpis);
  }
  if (section === 'tickets') {
    return NextResponse.json(state.tickets);
  }
  if (section === 'requests') {
    return NextResponse.json(state.employeeRequests);
  }
  if (section === 'complaints') {
    return NextResponse.json(state.complaints);
  }
  if (section === 'agents') {
    return NextResponse.json(state.agents);
  }
  if (section === 'kb') {
    return NextResponse.json(state.kbArticles);
  }
  if (section === 'faqs') {
    return NextResponse.json(state.faqs);
  }
  if (section === 'sla') {
    return NextResponse.json(state.slaRules);
  }
  if (section === 'settings') {
    return NextResponse.json(state.settings);
  }

  return NextResponse.json(state);
}

// POST /api/v1/hr/helpdesk (Create ticket)
export async function POST(req: NextRequest) {
  const state = getHelpDeskState();
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const newTicketId = `TCK-2026-${100 + state.tickets.length + 1}`;
  const newTicketNumber = `TCK-${100 + state.tickets.length + 1}`;

  const newTicket: SupportTicket = {
    id: newTicketId,
    ticketNumber: newTicketNumber,
    subject: String(body.subject || 'New Support Ticket'),
    description: String(body.description || ''),
    employeeId: String(body.employeeId || 'EMP-3601'),
    employeeName: String(body.employeeName || 'Elena Rostova'),
    employeeEmail: String(body.employeeEmail || 'elena.rostova@ofc360.internal'),
    department: String(body.department || 'Engineering'),
    designation: String(body.designation || 'Staff Engineer'),
    category: (body.category as SupportTicket['category']) || 'HR Support',
    subcategory: String(body.subcategory || 'General Query'),
    priority: (body.priority as SupportTicket['priority']) || 'Medium',
    status: 'Open',
    assignedAgentId: String(body.assignedAgentId || 'AGT-01'),
    assignedAgentName: String(body.assignedAgentName || 'Aarav Sharma'),
    assignedDepartment: String(body.assignedDepartment || 'People Operations'),
    createdDate: new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
    dueDate: '2026-11-08 06:00 PM',
    lastUpdated: 'Just now',
    slaStatus: 'Within SLA',
    slaCountdownHours: body.priority === 'Critical' ? 4 : body.priority === 'High' ? 24 : 48,
    escalationLevel: 0,
    tags: Array.isArray(body.tags) ? (body.tags as string[]) : ['Support Desk'],
    sentiment: 'Neutral',
    messages: [
      {
        id: `MSG-${Date.now()}`,
        senderName: String(body.employeeName || 'Elena Rostova'),
        senderRole: 'employee',
        timestamp: 'Just now',
        message: String(body.description || body.subject || 'Ticket initiated.'),
        isInternalNote: false,
      },
    ],
  };

  state.tickets = [newTicket, ...state.tickets];
  recomputeHelpDeskKpis(state);

  return NextResponse.json({
    message: `Ticket ${newTicket.ticketNumber} created successfully.`,
    ticket: newTicket,
    kpis: state.kpis,
  });
}
