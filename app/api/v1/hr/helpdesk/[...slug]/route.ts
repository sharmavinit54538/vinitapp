import { NextRequest, NextResponse } from 'next/server';
import {
  getHelpDeskState,
  recomputeHelpDeskKpis,
} from '../route';
import {
  SupportTicket,
  TicketMessage,
  EmployeeRequestItem,
  ConfidentialComplaintItem,
  KbArticle,
  FaqItem,
} from '@/lib/helpdesk-types';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const endpoint = slug.join('/');
  const state = getHelpDeskState();

  // Individual ticket lookup: /api/v1/hr/helpdesk/tickets/:id
  if (slug[0] === 'tickets' && slug[1]) {
    const ticket = state.tickets.find((t) => t.id === slug[1] || t.ticketNumber === slug[1]);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }
    return NextResponse.json(ticket);
  }

  // Individual KB article lookup
  if (slug[0] === 'kb' && slug[1]) {
    const article = state.kbArticles.find((a) => a.id === slug[1] || a.slug === slug[1]);
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    return NextResponse.json(article);
  }

  return NextResponse.json({ endpoint, state });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await context.params;
  const endpoint = slug.join('/');
  const state = getHelpDeskState();

  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  // 1. Ticket Action: Reply or Internal Note
  // /api/v1/hr/helpdesk/tickets/:id/messages
  if (slug[0] === 'tickets' && slug[2] === 'messages') {
    const ticketId = slug[1];
    const ticket = state.tickets.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const isInternalNote = Boolean(body.isInternalNote);
    const newMessage: TicketMessage = {
      id: `MSG-${Date.now()}`,
      senderName: String(body.senderName || 'HR Support Agent'),
      senderRole: (body.senderRole as TicketMessage['senderRole']) || 'hr_admin',
      timestamp: 'Just now',
      message: String(body.message || ''),
      isInternalNote,
      attachments: Array.isArray(body.attachments)
        ? (body.attachments as { name: string; size: string; url: string }[])
        : undefined,
    };

    ticket.messages.push(newMessage);
    ticket.lastUpdated = 'Just now';

    // If it's a direct HR reply to employee, mark ticket as In Progress
    if (!isInternalNote && ticket.status === 'Open') {
      ticket.status = 'In Progress';
    }

    recomputeHelpDeskKpis(state);

    return NextResponse.json({
      message: isInternalNote
        ? 'Internal note added (restricted from employee view).'
        : 'Reply sent to employee.',
      ticket,
      newMessage,
    });
  }

  // 2. Ticket Status, Priority, Agent, or Escalation Update
  // /api/v1/hr/helpdesk/tickets/:id/update
  if (slug[0] === 'tickets' && slug[2] === 'update') {
    const ticketId = slug[1];
    const ticket = state.tickets.find((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    if (body.status) {
      ticket.status = body.status as SupportTicket['status'];
      if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
        ticket.slaCountdownHours = 0;
      }
    }
    if (body.priority) {
      ticket.priority = body.priority as SupportTicket['priority'];
    }
    if (body.assignedAgentId) {
      ticket.assignedAgentId = String(body.assignedAgentId);
      const agent = state.agents.find((a) => a.id === body.assignedAgentId);
      if (agent) {
        ticket.assignedAgentName = agent.name;
        ticket.assignedDepartment = agent.department;
      }
    }
    if (typeof body.escalationLevel === 'number') {
      ticket.escalationLevel = body.escalationLevel;
      if (body.escalationLevel > 0) {
        ticket.status = 'Escalated';
      }
    }

    ticket.lastUpdated = 'Just now';
    recomputeHelpDeskKpis(state);

    return NextResponse.json({
      message: `Ticket ${ticket.ticketNumber} updated successfully.`,
      ticket,
      kpis: state.kpis,
    });
  }

  // 3. Bulk Ticket Actions: /api/v1/hr/helpdesk/tickets/bulk
  if (slug[0] === 'tickets' && slug[1] === 'bulk') {
    const ticketIds = Array.isArray(body.ticketIds) ? (body.ticketIds as string[]) : [];
    const action = String(body.action || '');

    if (action === 'assign' && body.agentId) {
      const agent = state.agents.find((a) => a.id === body.agentId);
      if (agent) {
        state.tickets.forEach((t) => {
          if (ticketIds.includes(t.id)) {
            t.assignedAgentId = agent.id;
            t.assignedAgentName = agent.name;
            t.assignedDepartment = agent.department;
            t.lastUpdated = 'Just now';
          }
        });
      }
    } else if (action === 'status' && body.status) {
      state.tickets.forEach((t) => {
        if (ticketIds.includes(t.id)) {
          t.status = body.status as SupportTicket['status'];
          t.lastUpdated = 'Just now';
        }
      });
    }

    recomputeHelpDeskKpis(state);
    return NextResponse.json({
      message: `Bulk operation applied to ${ticketIds.length} tickets.`,
      tickets: state.tickets,
      kpis: state.kpis,
    });
  }

  // 4. Employee Requests: /api/v1/hr/helpdesk/requests/:id/action
  if (slug[0] === 'requests' && slug[2] === 'action') {
    const reqId = slug[1];
    const reqItem = state.employeeRequests.find((r) => r.id === reqId || r.requestNumber === reqId);
    if (!reqItem) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const action = String(body.action || 'Approved');
    reqItem.status =
      action === 'Approved'
        ? 'Approved'
        : action === 'Rejected'
        ? 'Rejected'
        : 'Fulfilled';
    reqItem.history.push({
      stage: action,
      actionBy: String(body.actionBy || 'Aarav Sharma (HR Admin)'),
      timestamp: 'Just now',
      notes: String(body.notes || `Request transitioned to ${action}.`),
    });

    if (action === 'Approved' || action === 'Fulfilled') {
      reqItem.approvalStage = 'Completed';
      reqItem.documentGeneratedUrl = '#';
    }

    recomputeHelpDeskKpis(state);
    return NextResponse.json({
      message: `Request ${reqItem.requestNumber} marked as ${action}.`,
      request: reqItem,
    });
  }

  // 5. Confidential Complaints: /api/v1/hr/helpdesk/complaints
  if (slug[0] === 'complaints') {
    if (slug[2] === 'notes') {
      const complaintId = slug[1];
      const complaint = state.complaints.find((c) => c.id === complaintId);
      if (!complaint) {
        return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
      }
      complaint.investigationNotes.push({
        id: `NT-${Date.now()}`,
        author: String(body.author || 'Super Admin & ICC Member'),
        timestamp: 'Just now',
        note: String(body.note || ''),
      });
      return NextResponse.json({
        message: 'Confidential investigation note logged securely.',
        complaint,
      });
    }

    // New complaint submission
    const newComplaint: ConfidentialComplaintItem = {
      id: `CMP-${900 + state.complaints.length + 1}`,
      complaintNumber: `CMP-${900 + state.complaints.length + 1}`,
      isAnonymous: Boolean(body.isAnonymous),
      complainantName: body.isAnonymous ? undefined : String(body.complainantName || 'Confidential Complainant'),
      complainantId: body.isAnonymous ? undefined : String(body.complainantId || 'EMP-REDACTED'),
      complainantDepartment: body.isAnonymous ? undefined : String(body.complainantDepartment || 'General'),
      category: (body.category as ConfidentialComplaintItem['category']) || 'Other Confidential',
      subject: String(body.subject || 'Confidential Grievance'),
      detailedStatement: String(body.detailedStatement || ''),
      submittedDate: 'Just now',
      status: 'New',
      assignedInvestigator: 'Internal Complaints Committee (ICC)',
      investigationPhase: 'Preliminary Triage',
      restrictedRolesOnly: ['super_admin', 'hr_admin'],
      evidenceCount: Number(body.evidenceCount || 1),
      investigationNotes: [
        {
          id: `NT-${Date.now()}`,
          author: 'Automated Redaction Engine',
          timestamp: 'Just now',
          note: 'Case encrypted with restricted RBAC token. Access authorized to Super Admin & ICC only.',
        },
      ],
      escalationWorkflow: 'Statutory 90-Day Inquiry Pipeline',
    };

    state.complaints = [newComplaint, ...state.complaints];
    recomputeHelpDeskKpis(state);

    return NextResponse.json({
      message: 'Confidential complaint submitted securely under protected RBAC vault.',
      complaint: newComplaint,
    });
  }

  // 6. Knowledge Base: /api/v1/hr/helpdesk/kb
  if (slug[0] === 'kb') {
    if (slug[2] === 'feedback') {
      const articleId = slug[1];
      const article = state.kbArticles.find((a) => a.id === articleId);
      if (article) {
        if (body.type === 'helpful') {
          article.helpfulCount += 1;
        } else {
          article.notHelpfulCount += 1;
        }
        return NextResponse.json({ message: 'Feedback recorded', article });
      }
    }

    // Create new KB Article
    const newArticle: KbArticle = {
      id: `KB-${100 + state.kbArticles.length + 1}`,
      title: String(body.title || 'Support Guide'),
      slug: String(body.slug || `guide-${Date.now()}`),
      category: (body.category as KbArticle['category']) || 'HR Support',
      summary: String(body.summary || ''),
      content: String(body.content || ''),
      tags: Array.isArray(body.tags) ? (body.tags as string[]) : ['Guide'],
      status: (body.status as 'Published' | 'Draft') || 'Published',
      author: String(body.author || 'Aarav Sharma'),
      publishedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      helpfulCount: 0,
      notHelpfulCount: 0,
      viewCount: 1,
    };

    state.kbArticles = [newArticle, ...state.kbArticles];
    return NextResponse.json({ message: 'Article saved', article: newArticle });
  }

  // 7. AI Assist: /api/v1/hr/helpdesk/ai/assist
  if (slug[0] === 'ai' && slug[1] === 'assist') {
    const text = String(body.text || body.subject || '');
    const category = String(body.category || '');

    // Algorithmic intelligent assist
    let suggestedPriority = 'Medium';
    let suggestedCategory = 'HR Support';
    let sentiment = 'Neutral';

    const lower = text.toLowerCase();
    if (lower.includes('urgent') || lower.includes('critical') || lower.includes('wire') || lower.includes('breach') || lower.includes('cannot access')) {
      suggestedPriority = 'Critical';
      sentiment = 'Urgent';
    } else if (lower.includes('tax') || lower.includes('tds') || lower.includes('salary') || lower.includes('deduction')) {
      suggestedPriority = 'High';
      suggestedCategory = 'Payroll Support';
    } else if (lower.includes('punch') || lower.includes('biometric') || lower.includes('attendance') || lower.includes('late')) {
      suggestedCategory = 'Attendance Support';
    } else if (lower.includes('leave') || lower.includes('vacation') || lower.includes('encashment')) {
      suggestedCategory = 'Leave Support';
    } else if (lower.includes('sso') || lower.includes('vpn') || lower.includes('login') || lower.includes('token') || lower.includes('hardware')) {
      suggestedCategory = 'IT Support';
      suggestedPriority = 'High';
    }

    const aiSuggestions = [
      `Dear Employee, thank you for reaching out to the Support Desk. We have reviewed your request regarding "${text.slice(0, 40)}..." and our team is actively processing the verified records.`,
      `Hello, your ticket has been prioritized under our ${suggestedPriority} SLA window. Please verify if any additional documentation or stamped receipts are required.`,
      `Internal Agent Tip: Relevant KB Article "Section 80C Tax Proofs Guide" matches this query with 94% relevance confidence.`
    ];

    return NextResponse.json({
      suggestedPriority,
      suggestedCategory: category || suggestedCategory,
      sentiment,
      summary: `Ticket focuses on ${suggestedCategory}. Priority recommended as ${suggestedPriority} based on SLA impact score.`,
      aiSuggestions,
    });
  }

  // 8. SLA Rules Update: /api/v1/hr/helpdesk/sla/update
  if (slug[0] === 'sla' && slug[1] === 'update') {
    const priority = String(body.priority || 'Medium');
    const rule = state.slaRules.find((r) => r.priority === priority);
    if (rule) {
      if (typeof body.firstResponseTargetHours === 'number') {
        rule.firstResponseTargetHours = body.firstResponseTargetHours;
      }
      if (typeof body.resolutionTargetHours === 'number') {
        rule.resolutionTargetHours = body.resolutionTargetHours;
      }
      if (typeof body.autoEscalateAfterHours === 'number') {
        rule.autoEscalateAfterHours = body.autoEscalateAfterHours;
      }
      return NextResponse.json({ message: `SLA rule for ${priority} updated.`, rule, slaRules: state.slaRules });
    }
  }

  return NextResponse.json({ message: 'Operation executed', endpoint });
}
