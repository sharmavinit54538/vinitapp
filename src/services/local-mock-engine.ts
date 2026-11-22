import {
  createInitialHrDashboardState,
  applyApprovalDecision,
  recomputeApprovalCounts,
  HrDashboardDataState,
  ApprovalItem,
  ShiftItem,
  HolidayItem,
  AnnouncementItem,
  FaceAttendanceLogItem,
  WorkforceEmployee,
} from '../../lib/hr-dashboard-logic';
import {
  createInitialHelpDeskState,
  HelpDeskState,
  SupportTicket,
  TicketMessage,
  ConfidentialComplaintItem,
  KbArticle,
  SlaRuleConfig,
} from '../../lib/helpdesk-types';
import {
  computePayrollAnalyticsData,
  DEFAULT_PAYROLL_FILTERS,
  PayrollFilterState,
  PayrollAnomalyItem,
  ComplianceAlertItem,
} from '../../lib/payroll-analytics-types';
import {
  getAdminDepartmentsStore,
  setAdminDepartmentsStore,
  getAdminEmployeesStore,
  setAdminEmployeesStore,
} from '../../lib/admin-workforce-store';

const STORAGE_KEYS = {
  HR_DASHBOARD: 'ofc360_local_hr_dashboard_v1',
  HELPDESK: 'ofc360_local_helpdesk_v1',
  PAYROLL_ANOMALIES: 'ofc360_local_payroll_anomalies_v1',
  PAYROLL_COMPLIANCE: 'ofc360_local_payroll_compliance_v1',
  AUTH_USER: 'ofc360_local_auth_user_v1',
  DOMAIN_RECORDS: 'ofc360_local_domain_records_v1',
};

function readLocalJson<T>(key: string, fallback: () => T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback();
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback();
    return JSON.parse(raw) as T;
  } catch {
    return fallback();
  }
}

function writeLocalJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota errors in demo mode
  }
}

let hrStateMem: HrDashboardDataState | null = null;
let helpDeskStateMem: HelpDeskState | null = null;
let payrollAnomaliesMem: PayrollAnomalyItem[] | null = null;
let payrollComplianceMem: ComplianceAlertItem[] | null = null;

export function getLocalHrState(): HrDashboardDataState {
  if (!hrStateMem) {
    const initial = createInitialHrDashboardState();
    const loaded = readLocalJson(STORAGE_KEYS.HR_DASHBOARD, () => initial);
    hrStateMem = {
      ...initial,
      ...loaded,
      kpis: {
        ...initial.kpis,
        ...(loaded?.kpis || {}),
        workforce: { ...initial.kpis.workforce, ...(loaded?.kpis?.workforce || {}) },
        attendance: { ...initial.kpis.attendance, ...(loaded?.kpis?.attendance || {}) },
        approvals: { ...initial.kpis.approvals, ...(loaded?.kpis?.approvals || {}) },
        payroll: { ...initial.kpis.payroll, ...(loaded?.kpis?.payroll || {}) },
        recruitment: { ...initial.kpis.recruitment, ...(loaded?.kpis?.recruitment || {}) },
      },
      workforce: Array.isArray(loaded?.workforce) ? loaded.workforce : initial.workforce,
      approvals: Array.isArray(loaded?.approvals) ? loaded.approvals : initial.approvals,
      shifts: Array.isArray(loaded?.shifts) ? loaded.shifts : initial.shifts,
      rosters: Array.isArray(loaded?.rosters) ? loaded.rosters : initial.rosters,
      holidays: Array.isArray(loaded?.holidays) ? loaded.holidays : initial.holidays,
      announcements: Array.isArray(loaded?.announcements) ? loaded.announcements : initial.announcements,
      notifications: Array.isArray(loaded?.notifications) ? loaded.notifications : initial.notifications,
      requisitions: Array.isArray(loaded?.requisitions) ? loaded.requisitions : initial.requisitions,
      faceAttendanceLogs: Array.isArray(loaded?.faceAttendanceLogs) ? loaded.faceAttendanceLogs : initial.faceAttendanceLogs,
      departments: Array.isArray(loaded?.departments) ? loaded.departments : initial.departments,
      joiners: Array.isArray(loaded?.joiners) ? loaded.joiners : initial.joiners,
      exits: Array.isArray(loaded?.exits) ? loaded.exits : initial.exits,
    };
  }
  const syncedDepts = getAdminDepartmentsStore();
  const syncedEmployees = getAdminEmployeesStore();
  if (syncedEmployees.length > 0) {
    hrStateMem.kpis.workforce.totalActive = syncedEmployees.length;
  }
  if (syncedDepts.length > 0) {
    hrStateMem.departments = syncedDepts.map((d) => ({
      id: d.id,
      department: d.name,
      totalEmployees:
        syncedEmployees.filter(
          (e) => e.department.toLowerCase() === d.name.toLowerCase()
        ).length || d.activeHeadcount,
      presentCount: Math.max(1, d.activeHeadcount - 1),
      absentCount: 0,
      lateCount: 1,
      onLeaveCount: 0,
      attendancePercentage: 96,
      headOfDept: d.managerName,
    }));
  }
  return hrStateMem;
}

export function saveLocalHrState(next: HrDashboardDataState): void {
  hrStateMem = next;
  writeLocalJson(STORAGE_KEYS.HR_DASHBOARD, next);
}

export function getLocalHelpDeskState(): HelpDeskState {
  if (!helpDeskStateMem) {
    const initial = createInitialHelpDeskState();
    const loaded = readLocalJson(STORAGE_KEYS.HELPDESK, () => initial);
    helpDeskStateMem = {
      ...initial,
      ...loaded,
      kpis: { ...initial.kpis, ...(loaded?.kpis || {}) },
      tickets: Array.isArray(loaded?.tickets) ? loaded.tickets : initial.tickets,
      agents: Array.isArray(loaded?.agents) ? loaded.agents : initial.agents,
      employeeRequests: Array.isArray(loaded?.employeeRequests)
        ? loaded.employeeRequests
        : initial.employeeRequests,
      complaints: Array.isArray(loaded?.complaints)
        ? loaded.complaints
        : initial.complaints,
      kbArticles: Array.isArray(loaded?.kbArticles)
        ? loaded.kbArticles
        : initial.kbArticles,
      slaRules: Array.isArray(loaded?.slaRules)
        ? loaded.slaRules
        : initial.slaRules,
    };
  }
  return helpDeskStateMem;
}

export function saveLocalHelpDeskState(next: HelpDeskState): void {
  helpDeskStateMem = next;
  writeLocalJson(STORAGE_KEYS.HELPDESK, next);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function parseInitBody(init?: RequestInit): Promise<Record<string, unknown>> {
  if (!init?.body) return {};
  if (typeof init.body === 'string') {
    try {
      return JSON.parse(init.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return {};
}

// ============================================================================
// 1. DEMO AUTH LOCAL HANDLER (/api/v1/auth/*)
// ============================================================================
async function handleLocalAuthRequest(
  pathAfterAuth: string,
  method: string,
  init?: RequestInit
): Promise<Response> {
  const body = await parseInitBody(init);
  const action = pathAfterAuth.replace(/^\/+/, '').split('?')[0];

  const defaultDemoUser = {
    id: 'usr-demo-001',
    email: String(body.email || 'aarav.sharma@ofc360.com'),
    full_name: String(body.full_name || 'Aarav Sharma'),
    phone: String(body.phone || '+91 98201 44510'),
    company_name: String(body.company_name || 'OFC360 Technologies Pvt. Ltd.'),
    role: 'hr_admin',
    email_verified: true,
    is_active: true,
    created_at: '2026-01-15T09:00:00Z',
  };

  if (action === 'logout') {
    writeLocalJson(STORAGE_KEYS.AUTH_USER, null);
    return jsonResponse({
      message: 'Session signed out locally.',
      status: 'ok',
    });
  }

  if (action === 'login' || action === 'google' || action === 'github') {
    const emailStr = String(body.email || 'aarav.sharma@ofc360.com').toLowerCase();
    const isExecAlias =
      emailStr.includes('executive') ||
      emailStr.includes('exec') ||
      emailStr.includes('ceo') ||
      emailStr.includes('cfo') ||
      emailStr.includes('coo') ||
      emailStr.includes('cto');
    const role = emailStr.includes('super')
      ? 'super_admin'
      : isExecAlias
        ? 'executive'
        : emailStr.includes('it-admin') ||
            emailStr.includes('it_admin') ||
            emailStr.includes('itadmin')
          ? 'it_admin'
          : emailStr.includes('manager')
            ? 'manager'
            : emailStr.includes('emp')
              ? 'employee'
              : 'hr_admin';

    const execId = emailStr.includes('cfo')
      ? 'EXC-102'
      : emailStr.includes('coo')
        ? 'EXC-103'
        : emailStr.includes('cto')
          ? 'EXC-104'
          : 'EXC-101';
    const execName = emailStr.includes('cfo')
      ? 'Meera Subramanian'
      : emailStr.includes('coo')
        ? 'Rajeshwar Rao'
        : emailStr.includes('cto')
          ? 'Nandini Bose'
          : 'Siddharth Malhotra';

    const user = {
      ...defaultDemoUser,
      id:
        role === 'executive'
          ? execId
          : role === 'it_admin'
            ? 'IT-302'
            : role === 'manager'
              ? 'MGR-104'
              : role === 'employee'
                ? 'EMP-2048'
                : defaultDemoUser.id,
      full_name:
        role === 'executive'
          ? execName
          : role === 'it_admin'
            ? 'Vikram Deshpande'
            : role === 'manager'
              ? 'Ananya Verma'
              : role === 'employee'
                ? 'Rohan Kulkarni'
                : defaultDemoUser.full_name,
      email: emailStr,
      role,
    };
    writeLocalJson(STORAGE_KEYS.AUTH_USER, user);
    return jsonResponse({
      access_token: `demo_local_jwt_${Date.now()}`,
      token_type: 'bearer',
      requires_otp: false,
      requires_mfa: false,
      email_verified: true,
      is_active: true,
      message: 'Signed in using local Demo Authentication.',
      user,
    });
  }

  if (action === 'register') {
    const user = {
      ...defaultDemoUser,
      full_name: String(body.full_name || 'Demo Admin'),
      email: String(body.email || 'admin@ofc360.com'),
      phone: String(body.phone || '+91 98201 11223'),
      company_name: String(body.company_name || 'OFC360 Enterprise'),
      role: 'hr_admin',
    };
    writeLocalJson(STORAGE_KEYS.AUTH_USER, user);
    return jsonResponse({
      access_token: `demo_local_jwt_${Date.now()}`,
      requires_otp: false,
      requires_mfa: false,
      email_verified: true,
      is_active: true,
      message: 'Account registered locally in Demo Mode.',
      user,
    });
  }

  if (action === 'verify-otp') {
    const savedUser = readLocalJson(STORAGE_KEYS.AUTH_USER, () => defaultDemoUser);
    return jsonResponse({
      access_token: `demo_local_jwt_${Date.now()}`,
      message: 'OTP verified locally.',
      user: savedUser || defaultDemoUser,
    });
  }

  if (action === 'refresh') {
    return jsonResponse({
      access_token: `demo_local_jwt_refreshed_${Date.now()}`,
      token_type: 'bearer',
    });
  }

  if (action === 'me') {
    const savedUser = readLocalJson(STORAGE_KEYS.AUTH_USER, () => defaultDemoUser);
    return jsonResponse({
      user: savedUser || defaultDemoUser,
    });
  }

  if (action === 'forgot-password') {
    return jsonResponse({
      message: 'Demo password reset link generated locally.',
      status: 'ok',
    });
  }

  if (action === 'reset-password' || action === 'change-password') {
    return jsonResponse({
      message: 'Password updated locally in Demo Mode.',
      status: 'ok',
    });
  }

  if (
    action === 'verify-email' ||
    action === 'activate' ||
    action === 'verify-email-change'
  ) {
    return jsonResponse({
      message: 'Account verified locally.',
      status: 'verified',
    });
  }

  return jsonResponse({
    access_token: `demo_local_jwt_${Date.now()}`,
    user: defaultDemoUser,
    status: 'ok',
  });
}

// ============================================================================
// 2. HELPDESK LOCAL HANDLER (/api/v1/hr/helpdesk/*)
// ============================================================================
async function handleLocalHelpDeskRequest(
  subPath: string,
  method: string,
  init?: RequestInit
): Promise<Response> {
  const state = getLocalHelpDeskState();
  const cleanSub = subPath.replace(/^\/+/, '').split('?')[0];
  const segments = cleanSub ? cleanSub.split('/') : [];

  if (method === 'GET') {
    if (segments.length === 0) {
      return jsonResponse(state);
    }
    if (segments[0] === 'tickets' && segments[1]) {
      const ticket = state.tickets.find((t) => t.id === segments[1]);
      return jsonResponse(ticket || state.tickets[0]);
    }
    return jsonResponse(state);
  }

  const body = await parseInitBody(init);

  if (segments.length === 0 || cleanSub === 'tickets/create') {
    const nextNum = 2400 + state.tickets.length + 1;
    const createdTicket: SupportTicket = {
      id: `TKT-${nextNum}`,
      ticketNumber: `HD-2026-${nextNum}`,
      subject: String(body.subject || 'New Support Ticket'),
      description: String(body.description || 'Submitted via local workspace.'),
      employeeId: String(body.employeeId || 'EMP-1001'),
      employeeName: String(body.employeeName || 'Aarav Sharma'),
      employeeEmail: String(body.employeeEmail || 'aarav.sharma@ofc360.com'),
      department: String(body.department || 'Engineering'),
      designation: String(body.designation || 'Software Engineer'),
      category: (body.category as SupportTicket['category']) || 'HR Support',
      subcategory: String(body.subcategory || 'General Query'),
      priority: (body.priority as SupportTicket['priority']) || 'Medium',
      status: 'Open',
      assignedAgentId: 'AGT-01',
      assignedAgentName: 'Ananya Verma',
      assignedDepartment: 'People Operations',
      createdDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      lastUpdated: 'Just now',
      slaStatus: 'Within SLA',
      slaCountdownHours: 24,
      escalationLevel: 0,
      messages: [
        {
          id: `MSG-${Date.now()}`,
          senderName: String(body.employeeName || 'Aarav Sharma'),
          senderRole: 'employee',
          timestamp: 'Just now',
          message: String(body.description || 'Ticket created.'),
          isInternalNote: false,
        },
      ],
      tags: Array.isArray(body.tags) ? (body.tags as string[]) : ['Support'],
      sentiment: 'Neutral',
    };
    const nextState: HelpDeskState = {
      ...state,
      tickets: [createdTicket, ...state.tickets],
      kpis: {
        ...state.kpis,
        totalTickets: state.kpis.totalTickets + 1,
        openTickets: state.kpis.openTickets + 1,
      },
    };
    saveLocalHelpDeskState(nextState);
    return jsonResponse(
      {
        message: `Ticket ${createdTicket.id} created with SLA timer.`,
        ticket: createdTicket,
        helpDesk: nextState,
      },
      201
    );
  }

  if (segments[0] === 'tickets' && segments[1] === 'bulk') {
    const ids = Array.isArray(body.ticketIds) ? (body.ticketIds as string[]) : [];
    const nextTickets = state.tickets.map((t) => {
      if (!ids.includes(t.id)) return t;
      if (body.action === 'assign' && body.agentId) {
        const agent = state.agents.find((a) => a.id === body.agentId);
        return {
          ...t,
          assignedAgentId: String(body.agentId),
          assignedAgentName: agent?.name || t.assignedAgentName,
          lastUpdated: 'Just now',
        };
      }
      if (body.status) {
        return {
          ...t,
          status: body.status as SupportTicket['status'],
          lastUpdated: 'Just now',
        };
      }
      return t;
    });
    const nextState = { ...state, tickets: nextTickets };
    saveLocalHelpDeskState(nextState);
    return jsonResponse({
      message: `Updated ${ids.length} tickets.`,
      tickets: nextState.tickets,
      helpDesk: nextState,
    });
  }

  if (segments[0] === 'tickets' && segments[1] && segments[2] === 'messages') {
    const ticketId = segments[1];
    const newMessage: TicketMessage = {
      id: `MSG-${Date.now()}`,
      senderName: String(body.senderName || 'Aarav Sharma (HR Ops)'),
      senderRole: (body.senderRole as TicketMessage['senderRole']) || 'hr_admin',
      timestamp: 'Just now',
      message: String(body.message || ''),
      isInternalNote: Boolean(body.isInternalNote),
      attachments: Array.isArray(body.attachments)
        ? (body.attachments as { name: string; size: string; url: string }[])
        : undefined,
    };
    let updatedTicket = state.tickets[0];
    const nextTickets = state.tickets.map((t) => {
      if (t.id === ticketId) {
        updatedTicket = {
          ...t,
          messages: [...t.messages, newMessage],
          lastUpdated: 'Just now',
        };
        return updatedTicket;
      }
      return t;
    });
    const nextState = { ...state, tickets: nextTickets };
    saveLocalHelpDeskState(nextState);
    return jsonResponse({
      message: body.isInternalNote ? 'Internal note added.' : 'Reply sent.',
      ticket: updatedTicket,
      newMessage,
      helpDesk: nextState,
    });
  }

  if (segments[0] === 'tickets' && segments[1] && segments[2] === 'update') {
    const ticketId = segments[1];
    let updatedTicket = state.tickets[0];
    const nextTickets = state.tickets.map((t) => {
      if (t.id === ticketId) {
        const agent = body.assignedAgentId
          ? state.agents.find((a) => a.id === body.assignedAgentId)
          : undefined;
        updatedTicket = {
          ...t,
          status: (body.status as SupportTicket['status']) || t.status,
          priority: (body.priority as SupportTicket['priority']) || t.priority,
          assignedAgentId: body.assignedAgentId
            ? String(body.assignedAgentId)
            : t.assignedAgentId,
          assignedAgentName: agent ? agent.name : t.assignedAgentName,
          escalationLevel:
            typeof body.escalationLevel === 'number'
              ? body.escalationLevel
              : t.escalationLevel,
          lastUpdated: 'Just now',
        };
        return updatedTicket;
      }
      return t;
    });
    const nextState = { ...state, tickets: nextTickets };
    saveLocalHelpDeskState(nextState);
    return jsonResponse({
      message: `Ticket ${ticketId} updated.`,
      ticket: updatedTicket,
      helpDesk: nextState,
    });
  }

  if (segments[0] === 'requests' && segments[1] && segments[2] === 'action') {
    const requestId = segments[1];
    const nextStatus =
      body.action === 'Rejected'
        ? ('Rejected' as const)
        : body.action === 'Fulfilled'
        ? ('Fulfilled' as const)
        : ('Approved' as const);
    let updatedRequest = state.employeeRequests[0];
    const nextRequests = state.employeeRequests.map((r) => {
      if (r.id === requestId) {
        updatedRequest = {
          ...r,
          status: nextStatus,
          history: [
            ...r.history,
            {
              stage: nextStatus,
              actionBy: 'Aarav Sharma (HR Admin)',
              timestamp: 'Just now',
              notes: body.notes ? String(body.notes) : undefined,
            },
          ],
        };
        return updatedRequest;
      }
      return r;
    });
    const nextState = { ...state, employeeRequests: nextRequests };
    saveLocalHelpDeskState(nextState);
    return jsonResponse({
      message: `Request ${requestId} marked as ${nextStatus}.`,
      request: updatedRequest,
      helpDesk: nextState,
    });
  }

  if (segments[0] === 'complaints' && !segments[1]) {
    const createdComplaint: ConfidentialComplaintItem = {
      id: `CMP-${Date.now().toString().slice(-4)}`,
      complaintNumber: `ETH-2026-${100 + state.complaints.length + 1}`,
      isAnonymous: Boolean(body.isAnonymous),
      complainantName: body.isAnonymous
        ? 'Anonymous Employee'
        : String(body.complainantName || 'Employee'),
      complainantId: body.isAnonymous ? undefined : String(body.complainantId || 'EMP-1020'),
      complainantDepartment: String(body.complainantDepartment || 'Engineering'),
      category:
        (body.category as ConfidentialComplaintItem['category']) ||
        'Ethics & Fraud',
      subject: String(body.subject || 'Confidential Report'),
      detailedStatement: String(body.detailedStatement || ''),
      submittedDate: new Date().toISOString().slice(0, 10),
      status: 'New',
      assignedInvestigator: 'Internal Complaints Committee (ICC)',
      investigationPhase: 'Initial Intake',
      restrictedRolesOnly: ['super_admin', 'hr_admin'],
      evidenceCount: 1,
      investigationNotes: [],
      escalationWorkflow: 'Standard ICC Protocol',
    };
    const nextState = {
      ...state,
      complaints: [createdComplaint, ...state.complaints],
    };
    saveLocalHelpDeskState(nextState);
    return jsonResponse(
      {
        message: `Confidential case ${createdComplaint.id} logged securely.`,
        complaint: createdComplaint,
        helpDesk: nextState,
      },
      201
    );
  }

  if (segments[0] === 'complaints' && segments[1] && segments[2] === 'notes') {
    const complaintId = segments[1];
    let updatedComplaint = state.complaints[0];
    const nextComplaints = state.complaints.map((c) => {
      if (c.id === complaintId) {
        updatedComplaint = {
          ...c,
          investigationNotes: [
            ...c.investigationNotes,
            {
              id: `NOTE-${Date.now()}`,
              author: String(body.author || 'IC Committee Chair'),
              timestamp: 'Just now',
              note: String(body.note || ''),
            },
          ],
        };
        return updatedComplaint;
      }
      return c;
    });
    const nextState = { ...state, complaints: nextComplaints };
    saveLocalHelpDeskState(nextState);
    return jsonResponse({
      message: `Investigation note recorded on ${complaintId}.`,
      complaint: updatedComplaint,
      helpDesk: nextState,
    });
  }

  if (segments[0] === 'kb' && segments[1] && segments[2] === 'feedback') {
    const articleId = segments[1];
    let updatedArticle = state.kbArticles[0];
    const nextKb = state.kbArticles.map((a) => {
      if (a.id === articleId) {
        updatedArticle = {
          ...a,
          helpfulCount:
            body.type === 'notHelpful' ? a.helpfulCount : a.helpfulCount + 1,
          notHelpfulCount:
            body.type === 'notHelpful'
              ? a.notHelpfulCount + 1
              : a.notHelpfulCount,
        };
        return updatedArticle;
      }
      return a;
    });
    const nextState = { ...state, kbArticles: nextKb };
    saveLocalHelpDeskState(nextState);
    return jsonResponse({
      message: 'Thank you for your feedback!',
      article: updatedArticle,
      helpDesk: nextState,
    });
  }

  if (segments[0] === 'kb' && !segments[1]) {
    const article: KbArticle = {
      id: body.id ? String(body.id) : `KB-${Date.now().toString().slice(-3)}`,
      title: String(body.title || 'New Knowledge Base Guide'),
      slug: String(body.title || 'guide')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-'),
      category: (body.category as KbArticle['category']) || 'HR Support',
      summary: String(body.summary || ''),
      content: String(body.content || ''),
      tags: Array.isArray(body.tags) ? (body.tags as string[]) : ['Policy'],
      status: body.status === 'Draft' ? 'Draft' : 'Published',
      author: String(body.author || 'Aarav Sharma'),
      publishedDate: new Date().toISOString().slice(0, 10),
      lastUpdated: new Date().toISOString().slice(0, 10),
      helpfulCount: 1,
      notHelpfulCount: 0,
      viewCount: 1,
    };
    const nextKb = [
      article,
      ...state.kbArticles.filter((k) => k.id !== article.id),
    ];
    const nextState = { ...state, kbArticles: nextKb };
    saveLocalHelpDeskState(nextState);
    return jsonResponse({
      message: `Article "${article.title}" published.`,
      article,
      helpDesk: nextState,
    });
  }

  if (segments[0] === 'ai' && segments[1] === 'assist') {
    return jsonResponse({
      suggestedPriority: 'High',
      suggestedCategory: String(body.category || 'Payroll Support'),
      sentiment: 'Neutral',
      summary: `Automated triage summary for: ${String(body.subject || body.text || 'Employee support query')}`,
      aiSuggestions: [
        'Verify employee statutory profile and latest cycle cut-off.',
        'Share standard self-service KB guide for immediate resolution.',
      ],
    });
  }

  if (segments[0] === 'sla' && segments[1] === 'update') {
    const updatedRules: SlaRuleConfig[] = state.slaRules.map((rule) =>
      rule.priority === body.priority
        ? {
            ...rule,
            firstResponseTargetHours:
              typeof body.firstResponseTargetHours === 'number'
                ? body.firstResponseTargetHours
                : rule.firstResponseTargetHours,
            resolutionTargetHours:
              typeof body.resolutionTargetHours === 'number'
                ? body.resolutionTargetHours
                : rule.resolutionTargetHours,
          }
        : rule
    );
    const nextState = { ...state, slaRules: updatedRules };
    saveLocalHelpDeskState(nextState);
    return jsonResponse({
      message: `SLA policy for ${body.priority} updated.`,
      slaRules: nextState.slaRules,
      helpDesk: nextState,
    });
  }

  return jsonResponse(state);
}

// ============================================================================
// 3. PAYROLL ANALYTICS LOCAL HANDLER (/api/v1/hr/payroll-analytics)
// ============================================================================
async function handleLocalPayrollAnalyticsRequest(
  urlObj: URL,
  method: string,
  init?: RequestInit
): Promise<Response> {
  if (!payrollAnomaliesMem) {
    const initial = computePayrollAnalyticsData(DEFAULT_PAYROLL_FILTERS);
    payrollAnomaliesMem = readLocalJson(
      STORAGE_KEYS.PAYROLL_ANOMALIES,
      () => initial.anomalies
    );
  }
  if (!payrollComplianceMem) {
    const initial = computePayrollAnalyticsData(DEFAULT_PAYROLL_FILTERS);
    payrollComplianceMem = readLocalJson(
      STORAGE_KEYS.PAYROLL_COMPLIANCE,
      () => initial.complianceAlerts
    );
  }

  if (method === 'GET') {
    const sp = urlObj.searchParams;
    const filters: Partial<PayrollFilterState> = {
      financialYear:
        (sp.get('financialYear') as PayrollFilterState['financialYear']) ||
        DEFAULT_PAYROLL_FILTERS.financialYear,
      month:
        (sp.get('month') as PayrollFilterState['month']) ||
        DEFAULT_PAYROLL_FILTERS.month,
      department:
        (sp.get('department') as PayrollFilterState['department']) ||
        DEFAULT_PAYROLL_FILTERS.department,
      location:
        (sp.get('location') as PayrollFilterState['location']) ||
        DEFAULT_PAYROLL_FILTERS.location,
      employmentType:
        (sp.get('employmentType') as PayrollFilterState['employmentType']) ||
        DEFAULT_PAYROLL_FILTERS.employmentType,
      dateRange:
        (sp.get('dateRange') as PayrollFilterState['dateRange']) ||
        DEFAULT_PAYROLL_FILTERS.dateRange,
    };
    return jsonResponse(
      computePayrollAnalyticsData(
        filters,
        payrollAnomaliesMem,
        payrollComplianceMem
      )
    );
  }

  const body = await parseInitBody(init);
  const action = String(body.action || '');
  const filters: Partial<PayrollFilterState> = {
    ...DEFAULT_PAYROLL_FILTERS,
    ...(body.filters && typeof body.filters === 'object'
      ? (body.filters as Partial<PayrollFilterState>)
      : {}),
  };

  if (action === 'update_anomaly') {
    const anomalyId = String(body.anomalyId || '');
    const status =
      (body.status as 'Open' | 'Investigating' | 'Resolved') || 'Resolved';
    payrollAnomaliesMem = (payrollAnomaliesMem || []).map((a) =>
      a.id === anomalyId ? { ...a, status } : a
    );
    writeLocalJson(STORAGE_KEYS.PAYROLL_ANOMALIES, payrollAnomaliesMem);
    return jsonResponse(
      computePayrollAnalyticsData(
        filters,
        payrollAnomaliesMem,
        payrollComplianceMem
      )
    );
  }

  if (action === 'file_compliance') {
    const complianceId = String(body.complianceId || '');
    payrollComplianceMem = (payrollComplianceMem || []).map((c) =>
      c.id === complianceId ? { ...c, status: 'Paid & Filed' as const } : c
    );
    writeLocalJson(STORAGE_KEYS.PAYROLL_COMPLIANCE, payrollComplianceMem);
    return jsonResponse(
      computePayrollAnalyticsData(
        filters,
        payrollAnomaliesMem,
        payrollComplianceMem
      )
    );
  }

  return jsonResponse(
    computePayrollAnalyticsData(
      filters,
      payrollAnomaliesMem,
      payrollComplianceMem
    )
  );
}

// ============================================================================
// 4. HR DASHBOARD LOCAL HANDLER (/api/v1/hr/*)
// ============================================================================
async function handleLocalHrRequest(
  subPath: string,
  method: string,
  init?: RequestInit
): Promise<Response> {
  const state = getLocalHrState();
  const action = subPath.replace(/^\/+/, '').split('?')[0];

  if (method === 'GET') {
    if (action === 'dashboard' || action === '') {
      return jsonResponse({
        ...state,
        helpDesk: getLocalHelpDeskState(),
      });
    }
    if (action === 'approvals') return jsonResponse({ items: state.approvals });
    if (action === 'shifts') return jsonResponse({ items: state.shifts });
    if (action === 'rosters') return jsonResponse({ items: state.rosters });
    if (action === 'holidays') return jsonResponse({ items: state.holidays });
    if (action === 'announcements')
      return jsonResponse({ items: state.announcements });
    if (action === 'workforce') return jsonResponse({ items: state.workforce });
    if (action === 'notifications')
      return jsonResponse({ items: state.notifications });
    return jsonResponse(state);
  }

  const body = await parseInitBody(init);

  if (action === 'approvals/action') {
    const id = String(body.id || '');
    const status = body.status === 'Rejected' ? 'Rejected' : 'Approved';
    const nextApprovals = applyApprovalDecision(state.approvals, id, status);
    const nextCounts = recomputeApprovalCounts(nextApprovals);
    const next: HrDashboardDataState = {
      ...state,
      approvals: nextApprovals,
      kpis: {
        ...state.kpis,
        approvals: nextCounts,
      },
    };
    saveLocalHrState(next);
    return jsonResponse({
      message: `Request ${id} marked as ${status}.`,
      approvals: next.approvals,
      kpis: next.kpis,
    });
  }

  if (action === 'approvals/create') {
    const newItem: ApprovalItem = {
      id: `APR-${Math.floor(100 + Math.random() * 900)}`,
      employeeName: String(body.employeeName || 'Aarav Sharma'),
      employeeId: String(body.employeeId || 'EMP-1001'),
      department: String(body.department || 'Engineering'),
      category:
        (body.category as ApprovalItem['category']) || 'Leave Requests',
      requestType: String(body.requestType || body.subType || 'Privilege Leave'),
      requestDate: String(body.requestDate || body.dates || 'Nov 18 – Nov 20, 2026'),
      durationOrAmount: String(body.durationOrAmount || body.daysOrHours || '3 Days'),
      reason: String(body.reason || 'Personal family commitment'),
      status: 'Pending',
      avatarInitials: String(body.employeeName || 'AS')
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    };
    const nextApprovals = [newItem, ...state.approvals];
    const next: HrDashboardDataState = {
      ...state,
      approvals: nextApprovals,
      kpis: {
        ...state.kpis,
        approvals: recomputeApprovalCounts(nextApprovals),
      },
    };
    saveLocalHrState(next);
    return jsonResponse({
      message: `Request ${newItem.id} submitted for approval.`,
      approval: newItem,
      approvals: next.approvals,
    });
  }

  if (action === 'shifts') {
    const saved: ShiftItem = {
      id: body.id ? String(body.id) : `SHF-${Date.now().toString().slice(-3)}`,
      name: String(body.name || 'Custom Shift'),
      code: String(body.code || 'CS'),
      startTime: String(body.startTime || '09:30 AM'),
      endTime: String(body.endTime || '06:30 PM'),
      breakDuration: String(body.breakDuration || '60 mins'),
      assignedEmployees: Number(body.assignedEmployees || 12),
      allowance: String(body.allowance || '₹0 / day'),
      status: 'Active',
      departments: Array.isArray(body.departments)
        ? (body.departments as string[])
        : ['Engineering'],
    };
    const nextShifts = [
      saved,
      ...state.shifts.filter((s) => s.id !== saved.id),
    ];
    const next: HrDashboardDataState = { ...state, shifts: nextShifts };
    saveLocalHrState(next);
    return jsonResponse({
      message: `Shift "${saved.name}" saved.`,
      shift: saved,
      shifts: next.shifts,
    });
  }

  if (action === 'rosters/assign') {
    const rosterId = String(body.rosterId || '');
    const day = (body.day as 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun') || 'Mon';
    const shiftCode = (body.shiftCode as 'MS' | 'GS' | 'NS' | 'FLX' | 'OFF') || 'GS';
    const nextRosters = state.rosters.map((r) => {
      if (r.id !== rosterId) return r;
      return {
        ...r,
        swapStatus: body.approveSwap ? ('Swap Approved' as const) : r.swapStatus,
        schedule: r.schedule.map((d) =>
          d.day === day
            ? { ...d, shiftCode, shiftLabel: shiftCode }
            : d
        ),
      };
    });
    const next: HrDashboardDataState = { ...state, rosters: nextRosters };
    saveLocalHrState(next);
    return jsonResponse({
      message: 'Roster updated.',
      rosters: next.rosters,
    });
  }

  if (action === 'holidays') {
    const dateStr = String(body.date || '2026-12-25');
    const saved: HolidayItem = {
      id: body.id ? String(body.id) : `HOL-${Date.now().toString().slice(-3)}`,
      name: String(body.name || 'Corporate Holiday'),
      date: dateStr,
      displayDate: dateStr,
      month: 'December',
      dayOfWeek: 'Friday',
      category: (body.category as HolidayItem['category']) || 'National',
      location: String(body.location || 'India · All Hubs'),
      description: String(body.description || 'Scheduled corporate holiday.'),
      status: 'Published',
    };
    const nextHolidays = [
      saved,
      ...state.holidays.filter((h) => h.id !== saved.id),
    ];
    const next: HrDashboardDataState = { ...state, holidays: nextHolidays };
    saveLocalHrState(next);
    return jsonResponse({
      message: `Holiday "${saved.name}" saved.`,
      holiday: saved,
      holidays: next.holidays,
    });
  }

  if (action === 'holidays/delete') {
    const id = String(body.id || '');
    const next: HrDashboardDataState = {
      ...state,
      holidays: state.holidays.filter((h) => h.id !== id),
    };
    saveLocalHrState(next);
    return jsonResponse({
      message: 'Holiday removed.',
      holidays: next.holidays,
    });
  }

  if (action === 'announcements') {
    const created: AnnouncementItem = {
      id: `ANN-${Date.now().toString().slice(-3)}`,
      title: String(body.title || 'Company Broadcast'),
      description: String(body.description || ''),
      publishedDate: 'Just now',
      expiryDate: String(body.expiryDate || '2026-12-31'),
      department: String(body.department || 'All Departments'),
      targetAudience: String(body.targetAudience || 'All Employees'),
      category:
        (body.category as AnnouncementItem['category']) || 'Company News',
      priority: (body.priority as 'Urgent' | 'High' | 'Normal') || 'Normal',
      author: 'Aarav Sharma',
      status: body.status === 'Draft' ? 'Draft' : 'Published',
    };
    const next: HrDashboardDataState = {
      ...state,
      announcements: [created, ...state.announcements],
    };
    saveLocalHrState(next);
    return jsonResponse({
      message: `Announcement "${created.title}" saved.`,
      announcement: created,
      announcements: next.announcements,
    });
  }

  if (action === 'announcements/update') {
    const id = String(body.id || '');
    const next: HrDashboardDataState = {
      ...state,
      announcements: state.announcements.map((a) =>
        a.id === id
          ? {
              ...a,
              title: body.title ? String(body.title) : a.title,
              description: body.description
                ? String(body.description)
                : a.description,
              priority:
                (body.priority as AnnouncementItem['priority']) || a.priority,
              department: body.department ? String(body.department) : a.department,
              status: (body.status as 'Published' | 'Draft') || a.status,
            }
          : a
      ),
    };
    saveLocalHrState(next);
    return jsonResponse({
      message: 'Announcement updated.',
      announcements: next.announcements,
    });
  }

  if (action === 'announcements/delete') {
    const id = String(body.id || '');
    const next: HrDashboardDataState = {
      ...state,
      announcements: state.announcements.filter((a) => a.id !== id),
    };
    saveLocalHrState(next);
    return jsonResponse({
      message: 'Announcement deleted.',
      announcements: next.announcements,
    });
  }

  if (action === 'workforce') {
    const name = String(body.name || 'New Employee').trim();
    const created: WorkforceEmployee = {
      id: `WF-${Date.now().toString().slice(-4)}`,
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email: String(body.email || 'employee@ofc360.com'),
      phone: String(body.phone || '+91 98201 00000'),
      designation: String(body.designation || 'Software Engineer'),
      role: String(body.role || 'Employee'),
      department: String(body.department || 'Engineering'),
      location: String(body.location || 'Bengaluru HQ'),
      shift: String(body.shift || 'General Shift'),
      status: 'Present',
      attendanceRate: 98,
      joiningDate: new Date().toISOString().slice(0, 10),
      initials: name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
    };
    const next: HrDashboardDataState = {
      ...state,
      workforce: [created, ...state.workforce],
      kpis: {
        ...state.kpis,
        workforce: {
          ...state.kpis.workforce,
          totalActive: state.kpis.workforce.totalActive + 1,
        },
      },
    };
    saveLocalHrState(next);
    return jsonResponse({
      message: `${created.name} added to workforce directory.`,
      employee: created,
      workforce: next.workforce,
    });
  }

  if (action === 'notifications/read') {
    const targetId = body.id ? String(body.id) : undefined;
    const next: HrDashboardDataState = {
      ...state,
      notifications: state.notifications.map((n) =>
        !targetId || n.id === targetId ? { ...n, read: true } : n
      ),
    };
    saveLocalHrState(next);
    return jsonResponse({
      message: 'Notifications marked as read.',
      notifications: next.notifications,
    });
  }

  if (action === 'payroll/run') {
    const next: HrDashboardDataState = {
      ...state,
      kpis: {
        ...state.kpis,
        payroll: {
          ...state.kpis.payroll,
          status: 'Disbursed',
          lastRunBy: 'Aarav Sharma (Verified Local Run)',
        },
      },
    };
    saveLocalHrState(next);
    return jsonResponse({
      message: 'Payroll batch verified and queued for bank disbursement.',
      payroll: next.kpis.payroll,
    });
  }

  if (action === 'recruitment/create') {
    const newReq = {
      id: `REQ-${Math.floor(400 + Math.random() * 500)}`,
      title: String(body.title || 'Senior Product Engineer'),
      department: String(body.department || 'Engineering'),
      location: String(body.location || 'Bengaluru HQ'),
      openings: Number(body.openings || 2),
      candidatesInPipeline: 4,
      stage: 'Sourcing' as const,
      priority:
        (body.priority as 'Critical' | 'High' | 'Standard') || 'High',
    };
    const next: HrDashboardDataState = {
      ...state,
      requisitions: [newReq, ...state.requisitions],
      kpis: {
        ...state.kpis,
        recruitment: {
          ...state.kpis.recruitment,
          openPositions: state.kpis.recruitment.openPositions + newReq.openings,
          activeRequisitionsCount:
            state.kpis.recruitment.activeRequisitionsCount + 1,
        },
      },
    };
    saveLocalHrState(next);
    return jsonResponse({
      message: `Requisition "${newReq.title}" created.`,
      requisitions: next.requisitions,
    });
  }

  if (action === 'recruitment/stage') {
    const id = String(body.id || '');
    const stage = body.stage as
      | 'Sourcing'
      | 'Technical Round'
      | 'Offer Extended';
    const next: HrDashboardDataState = {
      ...state,
      requisitions: state.requisitions.map((r) =>
        r.id === id
          ? { ...r, stage, candidatesInPipeline: r.candidatesInPipeline + 2 }
          : r
      ),
    };
    saveLocalHrState(next);
    return jsonResponse({
      message: `Requisition ${id} moved to ${stage}.`,
      requisitions: next.requisitions,
    });
  }

  if (action === 'attendance/face-checkin') {
    const employeeName = String(body.employeeName || 'Aarav Sharma').trim();
    const employeeId = String(body.employeeId || 'EMP-1001').trim();
    const department = String(body.department || 'Engineering').trim();
    const shift = String(body.shift || 'General Shift').trim();
    const punchType =
      (body.punchType as FaceAttendanceLogItem['punchType']) || 'Check-In';
    const location = String(body.location || 'Bengaluru HQ · Gate 1').trim();
    const snapshotDataUrl = body.snapshotDataUrl
      ? String(body.snapshotDataUrl)
      : undefined;

    const nowTime = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newLog: FaceAttendanceLogItem = {
      id: `FACE-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeId,
      employeeName,
      department,
      shift,
      punchType,
      timestamp: `Today, ${nowTime}`,
      confidenceScore: Number((98.4 + Math.random() * 1.4).toFixed(1)),
      livenessVerified: true,
      location,
      initials: employeeName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      snapshotDataUrl,
    };

    const next: HrDashboardDataState = {
      ...state,
      faceAttendanceLogs: [newLog, ...(state.faceAttendanceLogs || [])],
      workforce: state.workforce.map((emp) =>
        emp.name.toLowerCase() === employeeName.toLowerCase() ||
        emp.id.toLowerCase() === employeeId.toLowerCase()
          ? {
              ...emp,
              status: punchType === 'Late Check-In' ? 'Late' : 'Present',
            }
          : emp
      ),
    };
    saveLocalHrState(next);
    return jsonResponse({
      message: `Face biometric verified (${newLog.confidenceScore}% match) for ${employeeName}.`,
      log: newLog,
      faceAttendanceLogs: next.faceAttendanceLogs,
    });
  }

  return jsonResponse({ status: 'ok', message: 'Processed locally.' });
}

// ============================================================================
// 5. UNIVERSAL ENTERPRISE SUITES LOCAL RESPONDER
// ============================================================================
const PAYROLL_DASHBOARD_SUMMARY = {
  kpis: {
    currentCycleId: 'CYCLE-2026-11',
    currentCycleLabel: 'Nov 2026',
    cycleStatus: 'In Progress',
    payDate: '2026-11-30',
    cutoffDate: '2026-11-25',
    currencyCode: 'INR',
    grossPay: 2840000,
    netPay: 2485600,
    totalDeductions: 354400,
    employerContributions: 211000,
    totalPayrollCost: 3051000,
    processedHeadcount: 48,
    pendingHoldCount: 0,
    variancePercentVsLastMonth: 2.4,
  },
  monthlyTrend: [
    {
      cycleLabel: 'Jun 2026',
      grossPay: 2710000,
      netPay: 2370000,
      statutoryDeductions: 198000,
      employerCost: 202000,
      headcount: 45,
    },
    {
      cycleLabel: 'Jul 2026',
      grossPay: 2750000,
      netPay: 2410000,
      statutoryDeductions: 202000,
      employerCost: 205000,
      headcount: 46,
    },
    {
      cycleLabel: 'Aug 2026',
      grossPay: 2790000,
      netPay: 2440000,
      statutoryDeductions: 205000,
      employerCost: 207000,
      headcount: 47,
    },
    {
      cycleLabel: 'Sep 2026',
      grossPay: 2810000,
      netPay: 2460000,
      statutoryDeductions: 208000,
      employerCost: 209000,
      headcount: 47,
    },
    {
      cycleLabel: 'Oct 2026',
      grossPay: 2825000,
      netPay: 2470000,
      statutoryDeductions: 209500,
      employerCost: 210000,
      headcount: 48,
    },
    {
      cycleLabel: 'Nov 2026',
      grossPay: 2840000,
      netPay: 2485600,
      statutoryDeductions: 211000,
      employerCost: 211000,
      headcount: 48,
    },
  ],
  departmentCostBreakdown: [
    {
      department: 'Engineering',
      costCenterCode: 'CC-ENG',
      headcount: 22,
      grossAmount: 1420000,
      netAmount: 1242800,
      sharePercentage: 50,
    },
    {
      department: 'Product & Design',
      costCenterCode: 'CC-PRD',
      headcount: 9,
      grossAmount: 568000,
      netAmount: 497120,
      sharePercentage: 20,
    },
    {
      department: 'People Operations',
      costCenterCode: 'CC-HR',
      headcount: 8,
      grossAmount: 426000,
      netAmount: 372840,
      sharePercentage: 15,
    },
    {
      department: 'Sales & Marketing',
      costCenterCode: 'CC-MKT',
      headcount: 9,
      grossAmount: 426000,
      netAmount: 372840,
      sharePercentage: 15,
    },
  ],
  statutoryDues: [
    {
      id: 'due-1',
      statutoryType: 'PF',
      title: 'Provident Fund (EPF)',
      dueDate: '2026-12-15',
      amountDue: 182400,
      status: 'Upcoming',
    },
    {
      id: 'due-2',
      statutoryType: 'ESI',
      title: 'Employee State Insurance (ESIC)',
      dueDate: '2026-12-15',
      amountDue: 28600,
      status: 'Upcoming',
    },
    {
      id: 'due-3',
      statutoryType: 'TDS',
      title: 'Tax Deducted at Source (TDS)',
      dueDate: '2026-12-07',
      amountDue: 143400,
      status: 'Upcoming',
    },
    {
      id: 'due-4',
      statutoryType: 'PT',
      title: 'Professional Tax (PT)',
      dueDate: '2026-12-10',
      amountDue: 9600,
      status: 'Upcoming',
    },
  ],
  exceptions: [
    {
      id: 'exc-1',
      severity: 'info',
      category: 'High Variance',
      employeeId: 'EMP-001',
      employeeName: 'Aarav Sharma',
      message: 'Annual performance bonus included in current payroll run.',
      detectedAt: '2026-11-10T10:30:00Z',
    },
  ],
  pendingApprovalsCount: 2,
  financialYear: '2026-27',
};

const RECRUITMENT_DASHBOARD_SUMMARY = {
  kpis: {
    openPositions: 14,
    activeCandidates: 128,
    interviewsToday: 6,
    interviewsThisWeek: 24,
    offersPending: 5,
    offerAcceptanceRatePct: 88,
    timeToHireDays: 19,
    timeToFillDays: 26,
    costPerHireAmount: 42500,
    currency: 'INR',
    joiningsThisMonth: 9,
  },
  hiringFunnel: [
    { label: 'Sourced / Applied', value: 420 },
    { label: 'Screened', value: 185 },
    { label: 'Technical Round', value: 76 },
    { label: 'Managerial Round', value: 34 },
    { label: 'Offer Extended', value: 16 },
    { label: 'Joined', value: 12 },
  ],
  sourceEffectiveness: [
    { label: 'LinkedIn', value: 42 },
    { label: 'Employee Referrals', value: 28 },
    { label: 'Career Portal', value: 18 },
    { label: 'Naukri / Boards', value: 12 },
  ],
  departmentOpenings: [
    { label: 'Engineering', value: 7 },
    { label: 'Product & Design', value: 3 },
    { label: 'Sales & GTM', value: 2 },
    { label: 'People Ops', value: 2 },
  ],
  recruiterPerformance: [
    { label: 'Ananya Verma', value: 14, secondaryValue: 18 },
    { label: 'Rohan Mehta', value: 11, secondaryValue: 21 },
    { label: 'Sneha Nair', value: 9, secondaryValue: 16 },
  ],
  pipelineAging: [
    { label: '0–7 Days', value: 64 },
    { label: '8–14 Days', value: 38 },
    { label: '15–30 Days', value: 19 },
    { label: '30+ Days', value: 7 },
  ],
  offerVsJoinedTrend: [
    { label: 'Aug', value: 10, secondaryValue: 9 },
    { label: 'Sep', value: 12, secondaryValue: 11 },
    { label: 'Oct', value: 15, secondaryValue: 13 },
    { label: 'Nov', value: 16, secondaryValue: 14 },
  ],
  alerts: [
    {
      id: 'rec-alert-1',
      severity: 'warning',
      title: '3 Senior Backend candidates awaiting scorecard submission (>24h)',
      module: 'scorecards',
      slaBreachHours: 28,
      createdAt: '2026-11-11T06:00:00Z',
    },
    {
      id: 'rec-alert-2',
      severity: 'info',
      title: '2 Offer approvals pending Finance sign-off',
      module: 'offers',
      createdAt: '2026-11-11T07:30:00Z',
    },
  ],
  upcomingInterviews: [
    {
      id: 'int-101',
      candidateId: 'CAND-201',
      candidateName: 'Vikramaditya Rao',
      jobId: 'JOB-301',
      jobTitle: 'Senior Full-Stack Engineer',
      roundType: 'Technical',
      mode: 'Video',
      panelInterviewerNames: ['Karthik S', 'Meera N'],
      startAt: '2026-11-11T11:00:00Z',
      endAt: '2026-11-11T11:45:00Z',
      meetingLinkOrRoom: 'https://meet.ofc360.io/tech-301',
      calendarSynced: true,
      hasConflict: false,
      reminderStatus: 'Sent',
      status: 'Scheduled',
    },
    {
      id: 'int-102',
      candidateId: 'CAND-204',
      candidateName: 'Priya Krishnan',
      jobId: 'JOB-305',
      jobTitle: 'Product Designer',
      roundType: 'Managerial',
      mode: 'Video',
      panelInterviewerNames: ['Siddharth M'],
      startAt: '2026-11-11T14:30:00Z',
      endAt: '2026-11-11T15:15:00Z',
      meetingLinkOrRoom: 'https://meet.ofc360.io/design-305',
      calendarSynced: true,
      hasConflict: false,
      reminderStatus: 'Sent',
      status: 'Scheduled',
    },
  ],
};

function makeKpiCard(
  key: string,
  label: string,
  valueFormatted: string,
  deltaFormatted = '+1.8%',
  deltaDirection: 'up' | 'down' | 'neutral' = 'up'
) {
  return {
    key,
    label,
    valueFormatted,
    deltaFormatted,
    deltaDirection,
    sparkline: [88, 90, 91, 93, 92, 94, 95],
  };
}

function handleEnterpriseDomainFallback(
  pathname: string,
  method: string,
  body: Record<string, unknown>
): Response {
  const domainRecords = readLocalJson<Record<string, unknown[]>>(
    STORAGE_KEYS.DOMAIN_RECORDS,
    () => ({})
  );
  const savedItems = Array.isArray(domainRecords[pathname])
    ? domainRecords[pathname]
    : [];

  // 1. Handle POST / PUT / PATCH / DELETE mutations first
  if (method !== 'GET') {
    const createdItem = {
      id: `LOC-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      status: body.status || 'Active',
      checks: [],
      channels: Array.isArray(body.channels) ? body.channels : ['LinkedIn', 'CareerPage'],
      tasks: Array.isArray(body.tasks) ? body.tasks : [],
    };
    domainRecords[pathname] = [createdItem, ...savedItems];
    writeLocalJson(STORAGE_KEYS.DOMAIN_RECORDS, domainRecords);

    return jsonResponse({
      ...createdItem,
      asOf: new Date().toISOString(),
      serverTimeIso: new Date().toISOString(),
      accepted: true,
      serverReason: 'Verified in local workspace',
      message: 'Action saved locally.',
      success: true,
      recorded: true,
      acknowledged: true,
      triggered: true,
      verified: true,
      scanResult: 'Valid',
      visitorName: String(body.visitorName || 'Guest Visitor'),
      allowedAreas: ['Main Lobby', 'Meeting Wing'],
      statusMessage: 'Processed locally.',
      unmaskedNumber: 'XXXX-XXXX-8821',
      unmaskedIdNumber: 'ID-9920-4410',
      unmaskedPhone: '+91 98201 44510',
      unmaskedSerialOrImei: 'SN-MBP-2026-9910',
      unmaskedCost: 165000,
      netPayFormatted: '₹1,42,800',
      currency: 'INR',
      auditId: `AUD-${Date.now()}`,
      expiresInSeconds: 60,
      ssoLaunchUrl: '#lms-local',
      answerNarrative: 'Local attendance compliance is tracking at 94.8% across all active shifts.',
      series: [
        { label: 'Mon', value: 95 },
        { label: 'Tue', value: 96 },
        { label: 'Wed', value: 94 },
        { label: 'Thu', value: 95 },
        { label: 'Fri', value: 93 },
      ],
      breakdown: [
        { code: 'BASIC', name: 'Basic Salary', monthlyAmount: 50000, annualAmount: 600000, category: 'Earning' },
        { code: 'HRA', name: 'House Rent Allowance', monthlyAmount: 25000, annualAmount: 300000, category: 'Earning' },
        { code: 'PF', name: 'Provident Fund (EPF)', monthlyAmount: 6000, annualAmount: 72000, category: 'Statutory' },
      ],
      items: domainRecords[pathname],
      data: domainRecords[pathname],
      total: domainRecords[pathname].length,
      meta: {
        page: 1,
        pageSize: 20,
        totalItems: domainRecords[pathname].length,
        totalPages: 1,
      },
    });
  }

  // 2. Endpoints that expect a raw Array T[] on GET
  if (
    pathname.endsWith('/payroll/calendars') ||
    (pathname.includes('/payroll/compensation/') && pathname.endsWith('/history')) ||
    pathname.endsWith('/payroll/loans/types') ||
    (pathname.includes('/payroll/loans/') && pathname.endsWith('/schedule')) ||
    pathname.endsWith('/payroll/payslips/templates') ||
    pathname.endsWith('/payroll/reports/catalog') ||
    pathname.endsWith('/payroll/reports/presets') ||
    pathname.endsWith('/recruitment/reports/catalog')
  ) {
    if (pathname.endsWith('/payroll/calendars') && savedItems.length === 0) {
      return jsonResponse([
        {
          id: 'CAL-2026-11',
          name: 'November 2026 Monthly Payroll',
          frequency: 'Monthly',
          financialYear: '2026-27',
          monthLabel: 'Nov 2026',
          periodStart: '2026-11-01',
          periodEnd: '2026-11-30',
          attendanceCutoffDate: '2026-11-25',
          payDate: '2026-11-30',
          status: 'Open',
          legalEntity: 'OFC360 Technologies Pvt. Ltd.',
          locationGroup: 'India All Hubs',
          autopilotEnabled: true,
        },
      ]);
    }
    if (pathname.endsWith('/payroll/loans/types') && savedItems.length === 0) {
      return jsonResponse([
        {
          code: 'SAL_ADV',
          name: 'Interest-Free Salary Advance',
          maxAmount: 150000,
          interestRatePct: 0,
          maxTenureMonths: 6,
        },
        {
          code: 'EMERG_LOAN',
          name: 'Medical & Emergency Loan',
          maxAmount: 500000,
          interestRatePct: 4.5,
          maxTenureMonths: 24,
        },
      ]);
    }
    if (pathname.endsWith('/payroll/payslips/templates') && savedItems.length === 0) {
      return jsonResponse([
        {
          id: 'TPL-STD-01',
          name: 'Enterprise Standard Payslip (YTD + Statutory)',
          showEmployerContributions: true,
          showYtdColumns: true,
          showBankDetails: true,
          passwordProtectedPdf: true,
          watermarkText: 'OFC360 CONFIDENTIAL',
          isDefault: true,
        },
      ]);
    }
    if (pathname.endsWith('/recruitment/reports/catalog') && savedItems.length === 0) {
      return jsonResponse([
        {
          key: 'FUNNEL_CONVERSION',
          title: 'Hiring Funnel Conversion Report',
          category: 'Pipeline',
          description: 'Stage-by-stage conversion and drop-off metrics.',
        },
        {
          key: 'TIME_TO_HIRE',
          title: 'Time-to-Hire & SLA Velocity',
          category: 'Efficiency',
          description: 'Average days to fill open requisitions by department.',
        },
      ]);
    }
    return jsonResponse(savedItems);
  }

  // 3. Suite Dashboards & Overview Endpoints
  if (pathname.includes('/payroll/dashboard/summary')) {
    return jsonResponse(PAYROLL_DASHBOARD_SUMMARY);
  }
  if (pathname.includes('/recruitment/dashboard/summary')) {
    return jsonResponse(RECRUITMENT_DASHBOARD_SUMMARY);
  }

  if (pathname.includes('/onboarding/dashboard')) {
    return jsonResponse({
      kpis: {
        upcomingJoiners: 12,
        joiningToday: 2,
        inPreBoarding: 7,
        inOnboarding: 5,
        overdueTasks: 1,
        documentsPending: 3,
        noShowRiskCount: 1,
        probationDueCount: 4,
        avgOnboardingCompletionPct: 88,
        timeToProductivityDays: 21,
      },
      pipelineByStage: [
        { label: 'Offer Accepted', value: 3 },
        { label: 'Pre-Boarding', value: 4 },
        { label: 'Joining Day', value: 2 },
        { label: 'Onboarding', value: 3 },
      ],
      departmentJoiners: [
        { label: 'Engineering', value: 6 },
        { label: 'Product & Design', value: 3 },
        { label: 'Sales & GTM', value: 3 },
      ],
      taskCompletionTrend: [
        { label: 'Week 1', value: 78 },
        { label: 'Week 2', value: 84 },
        { label: 'Week 3', value: 89 },
        { label: 'Week 4', value: 92 },
      ],
      documentCompletionRate: [
        { label: 'Verified', value: 86 },
        { label: 'Pending', value: 14 },
      ],
      pulseNpsTrend: [
        { label: 'Day 1', value: 76 },
        { label: 'Day 30', value: 82 },
        { label: 'Day 90', value: 85 },
      ],
      alerts: [],
      todaysJoiners: [],
    });
  }

  if (pathname.includes('/holidays/dashboard')) {
    const hrState = getLocalHrState();
    return jsonResponse({
      kpis: {
        totalHolidaysThisYear: hrState.holidays.length || 12,
        upcomingNext30Days: 2,
        activeCalendars: 3,
        optionalHolidaysBooked: 18,
        pendingApprovals: 1,
        employeesWithoutCalendar: 0,
        conflictsDetected: 0,
        longWeekendCount: 4,
      },
      nextHolidayCountdown: {
        holidayName: hrState.holidays[0]?.name || 'Diwali Festival',
        dateOnly: hrState.holidays[0]?.date || '2026-11-08',
        daysAway: 14,
        type: 'National',
      },
      monthWiseDistribution: [
        { label: 'Jan', value: 2 },
        { label: 'Aug', value: 2 },
        { label: 'Oct', value: 3 },
        { label: 'Nov', value: 3 },
        { label: 'Dec', value: 2 },
      ],
      locationWiseHolidays: [
        { label: 'Bengaluru HQ', value: 12 },
        { label: 'Mumbai West', value: 12 },
        { label: 'Delhi NCR', value: 12 },
      ],
      optionalUtilization: [
        { label: 'Used', value: 68 },
        { label: 'Remaining', value: 32 },
      ],
      holidayWorkOvertimeTrend: [
        { label: 'Q1', value: 14 },
        { label: 'Q2', value: 10 },
        { label: 'Q3', value: 18 },
      ],
      alerts: [],
      draftCalendarsAwaitingPublish: 0,
      upcomingHolidays: hrState.holidays,
      items: hrState.holidays,
      total: hrState.holidays.length,
    });
  }

  if (pathname.includes('/assets/dashboard')) {
    return jsonResponse({
      kpis: {
        totalAssets: 164,
        allocatedAssets: 142,
        availableAssets: 16,
        underMaintenance: 6,
        lostOrDamaged: 0,
        pendingRequests: 3,
        warrantyExpiringSoon: 4,
        overdueReturns: 1,
        totalAssetValue: 18450000,
        currentBookValue: 14200000,
      },
      categoryDistribution: [
        { label: 'MacBook Pro / Laptops', value: 98 },
        { label: 'Monitors & Displays', value: 42 },
        { label: 'Mobile Devices', value: 24 },
      ],
      departmentAllocation: [
        { label: 'Engineering', value: 86 },
        { label: 'Product & Design', value: 32 },
        { label: 'People Ops', value: 24 },
      ],
      assetAgeBuckets: [
        { label: '< 1 Year', value: 74 },
        { label: '1–2 Years', value: 62 },
        { label: '2+ Years', value: 28 },
      ],
      maintenanceCostTrend: [
        { label: 'Aug', value: 24000 },
        { label: 'Sep', value: 18000 },
        { label: 'Oct', value: 15000 },
        { label: 'Nov', value: 12000 },
      ],
      utilizationRateTrend: [
        { label: 'Aug', value: 88 },
        { label: 'Sep', value: 90 },
        { label: 'Oct', value: 91 },
        { label: 'Nov', value: 92 },
      ],
      depreciationTrend: [
        { label: 'Q1', value: 420000 },
        { label: 'Q2', value: 410000 },
        { label: 'Q3', value: 395000 },
      ],
      alerts: [],
    });
  }

  if (pathname.includes('/visitors/dashboard')) {
    return jsonResponse({
      kpis: {
        expectedToday: 19,
        currentlyInside: 8,
        checkedInToday: 14,
        checkedOutToday: 6,
        pendingApprovals: 2,
        overstays: 0,
        noShows: 1,
        blacklistedAttempts: 0,
        avgVisitDurationMinutes: 68,
      },
      whoIsInside: [
        {
          id: 'VIS-IN-01',
          visitorName: 'Rakesh Malhotra',
          visitorType: 'Vendor',
          hostName: 'Aarav Sharma',
          locationBuilding: 'Bengaluru HQ · Tower B',
          zoneName: 'Floor 4 · Collaboration Wing',
          checkedInAt: '10:15 AM',
          expectedOutAt: '01:00 PM',
          isOverstay: false,
        },
      ],
      locationOccupancy: [
        { locationName: 'Bengaluru HQ · Tower B', currentCount: 6, maxCapacity: 50 },
        { locationName: 'Mumbai Corporate Hub', currentCount: 2, maxCapacity: 30 },
      ],
      upcomingArrivals: [
        {
          id: 'ARR-01',
          visitorName: 'Meenakshi Iyer',
          hostName: 'Ananya Verma',
          scheduledTime: '02:30 PM',
          visitorType: 'InterviewCandidate',
        },
      ],
      alerts: [],
    });
  }

  if (
    pathname.includes('/attendance-analytics/overview') ||
    pathname.includes('/attendance-analytics/dashboard')
  ) {
    return jsonResponse({
      metadata: {
        definition: 'Live Workforce Attendance Telemetry',
        asOfTime: new Date().toISOString(),
        dataFreshness: 'RealTime',
      },
      kpis: {
        presentPct: makeKpiCard('presentPct', 'Present Today', '94.2%', '+1.4%', 'up'),
        absentPct: makeKpiCard('absentPct', 'Absent Rate', '2.1%', '-0.4%', 'down'),
        onLeavePct: makeKpiCard('onLeavePct', 'On Approved Leave', '3.7%', '+0.2%', 'neutral'),
        latePct: makeKpiCard('latePct', 'Late Arrivals', '4.2%', '-1.1%', 'down'),
        earlyExitPct: makeKpiCard('earlyExitPct', 'Early Exits', '1.2%', '-0.3%', 'down'),
        wfhRemotePct: makeKpiCard('wfhRemotePct', 'Remote / WFH', '18.5%', '+2.0%', 'up'),
        avgWorkingHours: makeKpiCard('avgWorkingHours', 'Avg Working Hours', '8.6 hrs', '+0.2h', 'up'),
        overtimeHours: makeKpiCard('overtimeHours', 'Overtime Hours', '42 hrs', '+4h', 'neutral'),
        regularizationRequests: makeKpiCard('regularizationRequests', 'Regularizations', '3 Open', '-2', 'down'),
        missingPunches: makeKpiCard('missingPunches', 'Missing Punches', '1', '-1', 'down'),
        deviceOfflineCount: makeKpiCard('deviceOfflineCount', 'Biometric Terminals', '0 Offline', '100% Up', 'neutral'),
        anomaliesFlagged: makeKpiCard('anomaliesFlagged', 'Anomalies Flagged', '0 Critical', 'Clean', 'neutral'),
      },
      dailyAttendanceTrend: [
        { label: 'Mon', value: 95 },
        { label: 'Tue', value: 96 },
        { label: 'Wed', value: 94 },
        { label: 'Thu', value: 95 },
        { label: 'Fri', value: 93 },
      ],
      departmentWiseAttendance: [
        { label: 'Engineering', value: 96 },
        { label: 'Product & Design', value: 94 },
        { label: 'People Ops', value: 98 },
        { label: 'Sales & GTM', value: 91 },
      ],
      lateArrivalTrend: [
        { label: 'Mon', value: 3 },
        { label: 'Tue', value: 2 },
        { label: 'Wed', value: 4 },
        { label: 'Thu', value: 2 },
        { label: 'Fri', value: 3 },
      ],
      overtimeTrend: [
        { label: 'Week 1', value: 10 },
        { label: 'Week 2', value: 12 },
        { label: 'Week 3', value: 11 },
        { label: 'Week 4', value: 9 },
      ],
    });
  }

  // 4. Employee Self-Service Dashboard (/api/v1/employee-dashboard/*)
  if (pathname.includes('/employee-dashboard')) {
    const nowIso = new Date().toISOString();
    const hrState = getLocalHrState();

    if (pathname.endsWith('/profile-summary')) {
      return jsonResponse({
        asOf: nowIso,
        serverTimeIso: nowIso,
        employeeCode: 'OFC-001',
        fullName: 'Aarav Sharma',
        designation: 'Principal Product Engineer',
        department: 'Engineering',
        locationName: 'Bengaluru HQ',
        timezone: 'Asia/Kolkata',
        reportingManagerName: 'Vikramaditya Rao',
        reportingManagerDesignation: 'VP of Engineering',
        profileCompletionPct: 96,
        missingProfileItems: [],
        unreadNotificationsCount: hrState.notifications.filter((n) => !n.read).length,
        permissions: ['all'],
        applicableConditionalWidgets: {
          travel: true,
          probationOrExit: true,
          managerExtras: true,
        },
      });
    }

    if (pathname.endsWith('/today')) {
      return jsonResponse({
        asOf: nowIso,
        serverTimeIso: nowIso,
        dateOnly: nowIso.slice(0, 10),
        timezone: 'Asia/Kolkata',
        status: 'present',
        statusLabel: 'Checked In · Office',
        shiftName: 'General Shift',
        shiftStartHHMM: '09:30',
        shiftEndHHMM: '18:30',
        crossesMidnight: false,
        punchInTimeIso: new Date(Date.now() - 3.5 * 3600 * 1000).toISOString(),
        punchInDisplay: '09:28 AM',
        punchOutTimeIso: null,
        punchOutDisplay: null,
        expectedOutTimeDisplay: '06:30 PM',
        workedSecondsToday: 12600,
        breakStatus: 'none',
        breakDurationMinutes: 0,
        geoFenceStatus: 'verified',
        geoFenceHubName: 'Bengaluru HQ · Bellandur Campus',
        selfieRequired: false,
        manualEntryPermitted: true,
        missingPunchOrShortHours: false,
        regularizationPrefill: null,
        holidayOrWeekOffDetail: null,
      });
    }

    if (pathname.endsWith('/quick-actions')) {
      return jsonResponse({
        asOf: nowIso,
        serverTimeIso: nowIso,
        items: [
          {
            id: 'qa-leave',
            label: 'Apply Leave',
            description: 'Submit PL, CL, or Sick Leave',
            moduleKey: 'leave',
            targetRouteOrModal: 'apply-leave',
            pinned: true,
            usageRank: 1,
            permissionRequired: 'leave:apply',
          },
          {
            id: 'qa-reg',
            label: 'Regularize Punch',
            description: 'Fix missed check-in or check-out',
            moduleKey: 'attendance',
            targetRouteOrModal: 'regularize',
            pinned: true,
            usageRank: 2,
            permissionRequired: 'attendance:regularize',
          },
          {
            id: 'qa-payslip',
            label: 'Download Payslip',
            description: 'Latest monthly salary statement',
            moduleKey: 'payroll',
            targetRouteOrModal: '/payroll',
            pinned: true,
            usageRank: 3,
            permissionRequired: 'payroll:ess',
          },
          {
            id: 'qa-ticket',
            label: 'Raise Helpdesk Ticket',
            description: 'IT, HR, or Payroll support',
            moduleKey: 'helpdesk',
            targetRouteOrModal: 'raise-ticket',
            pinned: false,
            usageRank: 4,
            permissionRequired: 'helpdesk:create',
          },
        ],
      });
    }

    if (pathname.includes('/attendance-summary')) {
      return jsonResponse({
        asOf: nowIso,
        serverTimeIso: nowIso,
        month: '2026-11',
        monthLabel: 'November 2026',
        availableMonths: [
          { value: '2026-11', label: 'November 2026' },
          { value: '2026-10', label: 'October 2026' },
          { value: '2026-09', label: 'September 2026' },
        ],
        stats: {
          presentDays: 18,
          absentDays: 0,
          lateMarks: 1,
          earlyExits: 0,
          averageWorkingHours: '8h 42m',
          overtimeHours: '4h 15m',
          pendingRegularizationsCount: 0,
        },
        calendarDays: Array.from({ length: 15 }, (_, idx) => ({
          dateOnly: `2026-11-${String(idx + 1).padStart(2, '0')}`,
          dayOfMonth: idx + 1,
          status: idx % 7 === 6 ? 'week-off' : 'present',
          statusLabel: idx % 7 === 6 ? 'Weekly Off' : 'Present',
          checkInDisplay: '09:28 AM',
          checkOutDisplay: '06:34 PM',
          workedHoursFormatted: '9h 06m',
          tooltipSummary: 'Verified via Biometric Gate 1',
        })),
        pendingRegularizations: [],
        fullAttendanceRoute: '/attendance-analytics',
      });
    }

    if (pathname.endsWith('/leaves')) {
      return jsonResponse({
        asOf: nowIso,
        serverTimeIso: nowIso,
        balances: [
          {
            leaveTypeCode: 'PL',
            leaveTypeName: 'Privilege Leave',
            availableDays: 14,
            usedDays: 4,
            pendingDays: 0,
            totalAllocatedDays: 18,
            expiryOrLapseInfo: 'Carry forward up to 30 days',
          },
          {
            leaveTypeCode: 'CL',
            leaveTypeName: 'Casual Leave',
            availableDays: 6,
            usedDays: 2,
            pendingDays: 0,
            totalAllocatedDays: 8,
            expiryOrLapseInfo: null,
          },
          {
            leaveTypeCode: 'SL',
            leaveTypeName: 'Sick Leave',
            availableDays: 8,
            usedDays: 1,
            pendingDays: 0,
            totalAllocatedDays: 9,
            expiryOrLapseInfo: null,
          },
        ],
        pendingRequests: [],
        upcomingApprovedLeaves: [],
        teamOnLeave: [],
        canViewTeamOnLeave: true,
        upcomingHolidays: hrState.holidays.slice(0, 3).map((h) => ({
          id: h.id,
          name: h.name,
          dateOnly: h.date,
          dayOfWeek: h.dayOfWeek,
          isOptional: h.category === 'Optional',
        })),
      });
    }

    if (pathname.endsWith('/pay-snapshot')) {
      return jsonResponse({
        asOf: nowIso,
        serverTimeIso: nowIso,
        latestPayslipId: 'PS-2026-10',
        monthLabel: 'October 2026',
        payDateOnly: '2026-10-31',
        currency: 'INR',
        maskedNetPayPlaceholder: '₹ ••••••••',
        canRevealNetPay: true,
        canDownloadPayslip: true,
        previousPayslipsRoute: '/payroll',
        ytdSummary: {
          fiscalYearLabel: 'FY 2026–27',
          grossEarningsFormatted: '₹11,40,000',
          totalDeductionsFormatted: '₹1,42,000',
          taxDeductedFormatted: '₹98,400',
        },
        taxDeclaration: {
          regime: 'New Tax Regime (FY 2026-27)',
          status: 'Verified',
          proofDeadlineDateOnly: '2027-01-31',
          daysUntilDeadline: 81,
        },
        reimbursements: {
          pendingAmountFormatted: '₹4,500',
          approvedLastMonthFormatted: '₹12,800',
          openClaimsCount: 1,
        },
        loansAndAdvances: {
          activeLoanCount: 0,
          outstandingBalanceFormatted: '₹0',
          nextEmiAmountFormatted: '₹0',
          nextEmiDateOnly: null,
        },
      });
    }

    if (pathname.endsWith('/layout') || pathname.endsWith('/layout/reset')) {
      const defaultWidgets = [
        'today',
        'quick-actions',
        'tasks',
        'leave',
        'pay',
        'attendance-summary',
        'performance',
        'assets-requests',
        'learning',
        'company-feed',
        'team-org',
        'travel',
        'helpdesk',
        'probation-exit',
        'manager-extras',
      ].map((widgetId, idx) => ({
        widgetId,
        title: widgetId.replace(/-/g, ' ').toUpperCase(),
        visible: true,
        order: idx + 1,
        mobilePriorityOrder: idx + 1,
        mandatory: idx < 2,
      }));
      return jsonResponse({
        asOf: nowIso,
        serverTimeIso: nowIso,
        roleDefaultApplied: 'reporting_manager',
        widgets: defaultWidgets,
      });
    }
  }

  // 5. Universal Safe Envelope for All Remaining Enterprise Endpoints
  return jsonResponse({
    asOf: new Date().toISOString(),
    serverTimeIso: new Date().toISOString(),
    status: 'ok',
    items: savedItems,
    data: savedItems,
    total: savedItems.length,
    page: 1,
    pageSize: 20,
    meta: {
      page: 1,
      pageSize: 20,
      totalItems: savedItems.length,
      totalPages: 1,
    },
    metadata: {
      definition: 'Local Enterprise State',
      asOfTime: new Date().toISOString(),
      dataFreshness: 'RealTime',
    },
    // Recruitment & Pipeline nested arrays
    stages: [
      {
        stage: 'Applied',
        label: 'Applied',
        count: 2,
        items: [
          {
            applicationId: 'APP-101',
            candidateId: 'CAND-201',
            candidateName: 'Vikramaditya Rao',
            jobId: 'JOB-301',
            jobTitle: 'Senior Full-Stack Engineer',
            stage: 'Applied',
            aiMatchScorePct: 94,
            stageAgeHours: 14,
            slaBreached: false,
            recruiterName: 'Ananya Verma',
          },
        ],
      },
      {
        stage: 'Screening',
        label: 'Screening',
        count: 1,
        items: [
          {
            applicationId: 'APP-102',
            candidateId: 'CAND-204',
            candidateName: 'Priya Krishnan',
            jobId: 'JOB-305',
            jobTitle: 'Product Designer',
            stage: 'Screening',
            aiMatchScorePct: 91,
            stageAgeHours: 8,
            slaBreached: false,
            recruiterName: 'Rohan Mehta',
          },
        ],
      },
      { stage: 'Interview', label: 'Interview', count: 0, items: [] },
      { stage: 'Offer', label: 'Offer', count: 0, items: [] },
    ],
    submissions: {
      items: savedItems,
      total: savedItems.length,
      page: 1,
      pageSize: 20,
      meta: {
        page: 1,
        pageSize: 20,
        totalItems: savedItems.length,
        totalPages: 1,
      },
    },
    referrals: savedItems,
    leaderboard: [],
    myOpenRequisitions: [],
    candidatesAwaitingReview: [],
    upcomingInterviews: [],
    pendingOfferApprovals: [],
    applications: [],
    savedJobIds: [],
    timeline: [],
    // Reports & Settings nested arrays across all suites
    columns: [
      { key: 'name', label: 'Record / Employee' },
      { key: 'department', label: 'Department' },
      { key: 'status', label: 'Status' },
    ],
    rows: savedItems,
    summaryMetrics: [],
    totals: {},
    automationRules: [],
    slaConfigs: [],
    integrations: [],
    approvalMatrix: [],
    enabledModules: ['Core', 'Statutory', 'ESS', 'Analytics'],
    gdprRetention: {
      retentionMonths: 24,
      autoAnonymizeExpired: true,
      dpdpConsentRequired: true,
    },
    // Payroll nested arrays
    checks: [
      {
        code: 'ATT_SYNC',
        title: 'Attendance & Leave Cutoff Verified',
        status: 'Passed',
        affectedCount: 0,
        description: 'All 48 active employees have verified attendance logs.',
      },
    ],
    anomalies: [],
    warnings: [],
    blockers: [],
    lines: [],
    breakdown: [],
    componentVariances: [],
    departmentVariances: [],
    topEmployeeVariances: [],
    filings: [],
    statePtBreakdown: [],
    registrations: {
      pfEstablishmentCode: 'KA/BLR/0048291',
      esicCode: '53-00-112948',
      tanNumber: 'BLRO12345F',
      panNumber: 'AABCO3600D',
      ptRegistrationStates: ['Karnataka', 'Maharashtra'],
    },
    recentPayslips: [],
    taxDeclarations: [],
    reimbursementClaims: [],
    activeLoans: [],
    salaryStructureLines: [],
    // Onboarding nested arrays
    responses: [],
    upcomingTeamJoiners: [],
    teamTasks: [],
    probationReviewsDue: [],
    assetsAssigned: [],
    // Holiday nested arrays
    events: [],
    compareEvents: [],
    longWeekends: [],
    teamOptionalBookings: [],
    teamWorkingOnHolidays: [],
    pendingCompOffRequests: [],
    // Asset nested arrays
    teamAssets: [],
    myHardwareAssets: [],
    mySoftwareLicenses: [],
    myOpenRequests: [],
    linkedAccessories: [],
    allocationHistory: [],
    maintenanceHistory: [],
    // Visitor nested arrays
    myVisitorsToday: [],
    myActiveInvitations: [],
    pendingArrivalApprovals: [],
    whoIsInside: [],
    locationOccupancy: [],
    upcomingArrivals: [],
    alerts: [],
    // Attendance Analytics nested arrays
    counts: {
      present: 45,
      absent: 1,
      late: 2,
      onLeave: 2,
      notYetPunched: 0,
      onBreak: 1,
      remote: 8,
    },
    whoIsAbsent: [],
    lateComersToday: [],
    hourlyPunchInCurve: [],
    repeatLateComers: [],
    shiftWisePunctuality: [],
    longAbsenceReturnList: [],
    hoursDistribution: [],
    departmentOvertime: [],
    shiftAdherenceRows: [],
    siteOccupancy: [],
    repeatRequesters: [],
    narratives: [],
    recentPunches: [],
    // Employee Dashboard nested arrays & objects
    missingProfileItems: [],
    availableMonths: [{ value: '2026-11', label: 'November 2026' }],
    calendarDays: [],
    pendingRegularizations: [],
    balances: [],
    pendingRequests: [],
    upcomingApprovedLeaves: [],
    teamOnLeave: [],
    upcomingHolidays: [],
    reviewCycle: {
      cycleName: 'Annual Review FY 2026-27',
      currentStage: 'Mid-Year Calibration',
      deadlineDateOnly: '2026-11-30',
      selfReviewStatus: 'Submitted',
    },
    upcomingOneOnOne: null,
    recentFeedbackSummary: 'Strong architectural leadership across Q3 deliverables.',
    goals: [
      {
        id: 'GOAL-101',
        title: 'Deliver Enterprise Frontend Modernization',
        metricTarget: '100% Zero-Latency Local State',
        progressPct: 92,
        status: 'On Track',
        dueDateOnly: '2026-12-15',
        canUpdateProgressInline: true,
      },
    ],
    recognitions: [],
    developmentPlanHighlights: ['Principal Architecture Track'],
    assignedAssets: [],
    requests: [],
    requestNewAssetRoute: '/assets',
    courses: [],
    completedCount: 4,
    overdueCount: 0,
    lmsPortalName: 'OFC360 Academy',
    announcements: [],
    nextHolidayCountdown: null,
    celebrations: [],
    upcomingEvents: [],
    manager: {
      fullName: 'Vikramaditya Rao',
      designation: 'VP of Engineering',
      department: 'Engineering',
      presenceStatus: 'Present',
      localTimeDisplay: '01:00 PM IST',
    },
    peers: [],
    orgChartRoute: '/?tab=more',
    directoryRoute: '/?tab=workforce',
    applicable: true,
    upcomingTrip: null,
    pendingExpenseClaimsCount: 0,
    settlementStatusLabel: 'All Clear',
    visaOrPassportAlert: null,
    openTickets: [],
    faqs: [],
    connectChatBotRoute: '/?tab=more',
    mode: 'probation',
    probation: {
      startDateOnly: '2026-08-01',
      confirmationTargetDateOnly: '2027-02-01',
      evaluationStatus: 'Scheduled',
      milestones: [],
    },
    permitted: true,
    pendingCountByType: {},
    totalPendingApprovals: 0,
    actionableApprovals: [],
    approvalsInboxRoute: '/?tab=approvals',
    teamSnapshot: {
      presentToday: 8,
      wfhToday: 2,
      onLeaveToday: 0,
      absentToday: 0,
      upcomingTeamLeaves: [],
      teamCelebrations: [],
      teamGoalsCheckInsDue: 0,
      openRequisitionsCount: 2,
      openRequisitionsRoute: '/recruitment',
      teamOnTripCount: 0,
    },
    widgets: [],
    unreadCount: 0,
    preferencesRoute: '/settings',
    query: '',
    results: [],
    todayStatus: 'present',
    workedSecondsToday: 12600,
    unreadNotificationsCount: 0,
    openTasksCount: 0,
  });
}

// ============================================================================
// 6. MAIN LOCAL FETCH INTERCEPTOR (ZERO NETWORK CALLS)
// ============================================================================
export const localMockFetch: typeof fetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const rawUrl =
    typeof input === 'string'
      ? input
      : input instanceof URL
      ? input.toString()
      : input.url;

  const urlObj = new URL(rawUrl, 'http://localhost:3000');
  const pathname = urlObj.pathname;
  const method = (init?.method || 'GET').toUpperCase();

  if (pathname.startsWith('/api/v1/auth')) {
    const subPath = pathname.slice('/api/v1/auth'.length);
    return handleLocalAuthRequest(subPath, method, init);
  }

  if (pathname.startsWith('/api/v1/hr/helpdesk')) {
    const subPath = pathname.slice('/api/v1/hr/helpdesk'.length);
    return handleLocalHelpDeskRequest(subPath, method, init);
  }

  if (pathname.startsWith('/api/v1/hr/payroll-analytics')) {
    return handleLocalPayrollAnalyticsRequest(urlObj, method, init);
  }

  if (pathname.startsWith('/api/v1/hr/admin-departments')) {
    const depts = getAdminDepartmentsStore();
    if (method === 'GET') {
      return jsonResponse({ items: depts });
    }
    const body = await parseInitBody(init);
    const created = {
      id: `dept-local-${Date.now()}`,
      name: String(body.name || 'New Department'),
      code: String(body.code || 'NEW').toUpperCase(),
      parentDepartmentId: body.parentDepartmentId
        ? String(body.parentDepartmentId)
        : null,
      parentDepartmentName: body.parentDepartmentName
        ? String(body.parentDepartmentName)
        : null,
      managerName: String(body.managerName || 'Aarav Sharma'),
      description: String(body.description || ''),
      budget: Number(body.budget || 300000),
      headcountLimit: Number(body.headcountLimit || 25),
      activeHeadcount: 1,
      colorTheme: (body.colorTheme as 'indigo') || 'indigo',
      iconKey: (body.iconKey as 'Briefcase') || 'Briefcase',
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setAdminDepartmentsStore([created, ...depts]);
    return jsonResponse({ department: created }, 201);
  }

  if (pathname.startsWith('/api/v1/hr/admin-employees')) {
    const emps = getAdminEmployeesStore();
    if (method === 'GET') {
      return jsonResponse({ items: emps });
    }
    if (method === 'DELETE') {
      const id = urlObj.searchParams.get('id');
      if (id) {
        setAdminEmployeesStore(emps.filter((e) => e.id !== id));
      }
      return jsonResponse({ status: 'deleted' });
    }
    const body = await parseInitBody(init);
    const firstName = String(body.firstName || 'New');
    const lastName = String(body.lastName || 'Employee');
    const created = {
      ...(body as Record<string, unknown>),
      id: `emp-local-${Date.now()}`,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),
      officialEmail: String(body.officialEmail || 'employee@ofc360.com'),
      mobileNumber: String(body.mobileNumber || '+91 98201 00000'),
      gender: 'Prefer not to say' as const,
      dateOfBirth: String(body.dateOfBirth || '1995-01-01'),
      employeeCode: String(body.employeeCode || `EMP-${Date.now().toString().slice(-4)}`),
      department: String(body.department || 'Engineering'),
      designation: String(body.designation || 'Software Engineer'),
      reportingManager: String(body.reportingManager || 'Aarav Sharma'),
      dateOfJoining: String(body.dateOfJoining || '2026-11-11'),
      employmentType: 'Full-time' as const,
      workMode: 'Hybrid' as const,
      probationPeriod: '6 months' as const,
      ctcStructure: String(body.ctcStructure || '₹14,00,000 / yr'),
      defaultShift: String(body.defaultShift || 'General Shift (09:30 - 18:30)'),
      systemRole: 'Employee' as const,
      sendOnboardingInvite: Boolean(body.sendOnboardingInvite ?? true),
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
    };
    setAdminEmployeesStore([created, ...emps]);
    return jsonResponse({ employee: created }, 201);
  }

  if (pathname.startsWith('/api/v1/hr')) {
    const subPath = pathname.slice('/api/v1/hr'.length);
    return handleLocalHrRequest(subPath, method, init);
  }

  const body = await parseInitBody(init);
  return handleEnterpriseDomainFallback(pathname, method, body);
};
