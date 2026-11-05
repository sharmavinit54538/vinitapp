import { Ofc360Role } from './auth-schemas';

export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TicketStatus = 'Open' | 'In Progress' | 'Pending' | 'Resolved' | 'Closed' | 'Escalated';
export type SlaStatus = 'Within SLA' | 'Approaching Breach' | 'Breached';

export type MainCategory =
  | 'HR Support'
  | 'Payroll Support'
  | 'Attendance Support'
  | 'Leave Support'
  | 'IT Support'
  | 'Other';

export interface TicketMessage {
  id: string;
  senderName: string;
  senderRole: Ofc360Role | 'employee';
  senderAvatar?: string;
  timestamp: string;
  message: string;
  isInternalNote: boolean;
  attachments?: { name: string; size: string; url: string }[];
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  designation: string;
  category: MainCategory;
  subcategory: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAgentId?: string;
  assignedAgentName?: string;
  assignedDepartment: string;
  createdDate: string;
  dueDate: string;
  lastUpdated: string;
  slaStatus: SlaStatus;
  firstResponseTimeMinutes?: number;
  resolutionTimeMinutes?: number;
  slaCountdownHours: number;
  escalationLevel: number; // 0 = standard, 1 = Lead, 2 = Head of HR, 3 = Executive
  messages: TicketMessage[];
  tags: string[];
  sentiment?: 'Positive' | 'Neutral' | 'Frustrated' | 'Urgent';
}

export interface EmployeeRequestItem {
  id: string;
  requestNumber: string;
  employeeId: string;
  employeeName: string;
  department: string;
  requestType:
    | 'Payslip Request'
    | 'Salary Certificate'
    | 'Experience Letter'
    | 'Employment Verification'
    | 'Personal Information Update'
    | 'Bank Account Update'
    | 'Address Update'
    | 'Document Request'
    | 'Leave-related Request'
    | 'Attendance Correction';
  subject: string;
  details: string;
  submittedDate: string;
  status: 'Pending Review' | 'Approved' | 'Rejected' | 'Fulfilled';
  currentApprover: string;
  approvalStage: string;
  documentGeneratedUrl?: string;
  history: {
    stage: string;
    actionBy: string;
    timestamp: string;
    notes?: string;
  }[];
}

export interface ConfidentialComplaintItem {
  id: string;
  complaintNumber: string;
  isAnonymous: boolean;
  complainantName?: string;
  complainantId?: string;
  complainantDepartment?: string;
  category: 'Workplace Harassment' | 'Ethics & Fraud' | 'POSH' | 'Discrimination' | 'Manager Misconduct' | 'Other Confidential';
  subject: string;
  detailedStatement: string;
  submittedDate: string;
  status: 'New' | 'Under Investigation' | 'Committee Review' | 'Action Taken' | 'Dismissed';
  assignedInvestigator: string;
  investigationPhase: string;
  restrictedRolesOnly: Ofc360Role[]; // Only super_admin and hr_admin
  evidenceCount: number;
  investigationNotes: {
    id: string;
    author: string;
    timestamp: string;
    note: string;
  }[];
  resolutionSummary?: string;
  escalationWorkflow: string;
}

export interface SlaRuleConfig {
  id: string;
  priority: TicketPriority;
  firstResponseTargetHours: number;
  resolutionTargetHours: number;
  autoEscalateAfterHours: number;
  escalateToRole: Ofc360Role;
  businessHoursOnly: boolean;
  notifySupervisorOnBreach: boolean;
}

export interface SupportAgent {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  avatar: string;
  assignedTicketsCount: number;
  resolvedTicketsCount: number;
  pendingTicketsCount: number;
  avgResponseTimeMinutes: number;
  avgResolutionTimeHours: number;
  availabilityStatus: 'Available' | 'Busy' | 'In Training' | 'Offline';
  currentWorkloadScore: number; // 0-100%
  skills: string[];
}

export interface KbArticle {
  id: string;
  title: string;
  slug: string;
  category: MainCategory;
  summary: string;
  content: string;
  tags: string[];
  status: 'Published' | 'Draft';
  author: string;
  publishedDate: string;
  lastUpdated: string;
  helpfulCount: number;
  notHelpfulCount: number;
  viewCount: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: MainCategory;
  tags: string[];
  order: number;
}

export interface HelpDeskAnnouncement {
  id: string;
  title: string;
  content: string;
  priority: 'Urgent' | 'High' | 'Normal';
  postedDate: string;
  expiryDate: string;
  author: string;
  targetAudience: string;
}

export interface HelpDeskOverviewKpis {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  slaBreachedTickets: number;
  avgFirstResponseTimeMinutes: number;
  avgResolutionTimeHours: number;
  csatScore: number; // e.g. 4.8 / 5.0
  totalRequests: number;
  totalComplaints: number;
  activeAgents: number;
}

export interface HelpDeskState {
  tickets: SupportTicket[];
  employeeRequests: EmployeeRequestItem[];
  complaints: ConfidentialComplaintItem[];
  slaRules: SlaRuleConfig[];
  agents: SupportAgent[];
  kbArticles: KbArticle[];
  faqs: FaqItem[];
  announcements: HelpDeskAnnouncement[];
  kpis: HelpDeskOverviewKpis;
  settings: {
    businessHoursStart: string;
    businessHoursEnd: string;
    workingDays: string[];
    autoAssignmentEnabled: boolean;
    defaultAssigneeAgentId: string;
    emailAlertsEnabled: boolean;
    smsAlertsEnabled: boolean;
    slackIntegrationEnabled: boolean;
  };
}

export const HELPDESK_NAV_ITEMS = [
  { id: 'overview', title: 'Overview', route: '/helpdesk/overview', icon: 'LayoutDashboard' },
  { id: 'all_tickets', title: 'All Tickets', route: '/helpdesk/all-tickets', icon: 'Ticket' },
  { id: 'my_assigned', title: 'My Assigned Tickets', route: '/helpdesk/my-assigned', icon: 'UserCheck' },
  { id: 'employee_requests', title: 'Employee Requests', route: '/helpdesk/employee-requests', icon: 'FileText' },
  { id: 'complaints', title: 'Complaints', route: '/helpdesk/complaints', icon: 'ShieldAlert' },
  { id: 'escalations', title: 'Escalations', route: '/helpdesk/escalations', icon: 'AlertTriangle' },
  { id: 'sla_management', title: 'SLA Management', route: '/helpdesk/sla-management', icon: 'Clock' },
  { id: 'agent_management', title: 'Agent Management', route: '/helpdesk/agent-management', icon: 'Users' },
  { id: 'categories', title: 'Categories & Departments', route: '/helpdesk/categories', icon: 'FolderTree' },
  { id: 'knowledge_base', title: 'Knowledge Base', route: '/helpdesk/knowledge-base', icon: 'BookOpen' },
  { id: 'faq_management', title: 'FAQ Management', route: '/helpdesk/faq-management', icon: 'HelpCircle' },
  { id: 'announcements', title: 'Announcements', route: '/helpdesk/announcements', icon: 'Megaphone' },
  { id: 'reports_analytics', title: 'Reports & Analytics', route: '/helpdesk/reports-analytics', icon: 'BarChart3' },
  { id: 'settings', title: 'Help Desk Settings', route: '/helpdesk/settings', icon: 'Settings' },
] as const;

export type HelpDeskNavId = typeof HELPDESK_NAV_ITEMS[number]['id'];

// Default Seed Data
export function createInitialHelpDeskState(): HelpDeskState {
  const tickets: SupportTicket[] = [
    {
      id: 'TCK-2026-101',
      ticketNumber: 'TCK-101',
      subject: 'Tax Investment Proof Submission Rejection Clarification',
      description: 'My Section 80C mutual fund investment statement was rejected in the November payroll run. Kindly review the re-uploaded signed certificate.',
      employeeId: 'EMP-3601',
      employeeName: 'Elena Rostova',
      employeeEmail: 'elena.rostova@ofc360.internal',
      department: 'Engineering',
      designation: 'Principal Staff Engineer',
      category: 'Payroll Support',
      subcategory: 'Tax & TDS',
      priority: 'High',
      status: 'In Progress',
      assignedAgentId: 'AGT-01',
      assignedAgentName: 'Aarav Sharma',
      assignedDepartment: 'Finance & People Ops',
      createdDate: '2026-11-03 09:30 AM',
      dueDate: '2026-11-05 06:00 PM',
      lastUpdated: '2026-11-04 08:15 AM',
      slaStatus: 'Within SLA',
      firstResponseTimeMinutes: 24,
      slaCountdownHours: 18,
      escalationLevel: 0,
      tags: ['Payroll', 'TDS', 'Tax Proof', 'High Priority'],
      sentiment: 'Neutral',
      messages: [
        {
          id: 'MSG-001',
          senderName: 'Elena Rostova',
          senderRole: 'employee',
          timestamp: '2026-11-03 09:30 AM',
          message: 'Hello Support, I noticed my ELSS statement proof was marked as rejected yesterday with reason "Missing Registrar Stamp". I have re-uploaded the official stamped copy from the AMC portal. Please re-validate so TDS deduction is adjusted for Nov payout.',
          isInternalNote: false,
          attachments: [{ name: 'ELSS_AMC_Stamped_Proof_2026.pdf', size: '1.4 MB', url: '#' }]
        },
        {
          id: 'MSG-002',
          senderName: 'Aarav Sharma',
          senderRole: 'hr_admin',
          timestamp: '2026-11-03 09:54 AM',
          message: 'Hi Elena, thank you for reaching out. We have received your re-uploaded stamped document. Our payroll compliance desk is currently reviewing the certificate numbers.',
          isInternalNote: false
        },
        {
          id: 'MSG-003',
          senderName: 'Aarav Sharma (Internal Note)',
          senderRole: 'hr_admin',
          timestamp: '2026-11-03 10:15 AM',
          message: 'Internal review note: Verified PAN number and AMC registration ID against Karvy CAMS ledger. Tax exemption value of $1,800 is legitimate. Awaiting final sign-off from Finance Controller before closing.',
          isInternalNote: true
        }
      ]
    },
    {
      id: 'TCK-2026-102',
      ticketNumber: 'TCK-102',
      subject: 'Missing Biometric Punch Regularization for Offsite Client Summit',
      description: 'Missed evening biometric punch on Nov 02 due to Bangalore Airport client briefing with Enterprise Sales team.',
      employeeId: 'EMP-3614',
      employeeName: 'Rohan Deshmukh',
      employeeEmail: 'rohan.deshmukh@ofc360.internal',
      department: 'Engineering',
      designation: 'Senior DevOps Architect',
      category: 'Attendance Support',
      subcategory: 'Missing Attendance',
      priority: 'Medium',
      status: 'Open',
      assignedAgentId: 'AGT-02',
      assignedAgentName: 'Neha Verma',
      assignedDepartment: 'People Operations',
      createdDate: '2026-11-04 07:45 AM',
      dueDate: '2026-11-06 06:00 PM',
      lastUpdated: '2026-11-04 07:45 AM',
      slaStatus: 'Within SLA',
      slaCountdownHours: 32,
      escalationLevel: 0,
      tags: ['Biometric', 'Punch Regularization'],
      sentiment: 'Neutral',
      messages: [
        {
          id: 'MSG-004',
          senderName: 'Rohan Deshmukh',
          senderRole: 'employee',
          timestamp: '2026-11-04 07:45 AM',
          message: 'My manager Marcus Vance has approved my offsite visit slip. Requesting HR to regularize the evening check-out at 06:34 PM.',
          isInternalNote: false
        }
      ]
    },
    {
      id: 'TCK-2026-103',
      ticketNumber: 'TCK-103',
      subject: 'Urgent Single Sign-On & VPN Access Token Reset',
      description: 'Security key lost sync during APAC regional travel. Cannot access enterprise GitHub & Figma workspace.',
      employeeId: 'EMP-3603',
      employeeName: 'Sora Takahashi',
      employeeEmail: 'sora.takahashi@ofc360.internal',
      department: 'Product & Design',
      designation: 'VP of Product Experience',
      category: 'IT Support',
      subcategory: 'Account Access',
      priority: 'Critical',
      status: 'Escalated',
      assignedAgentId: 'AGT-03',
      assignedAgentName: 'Vikramaditya Nair',
      assignedDepartment: 'IT Security',
      createdDate: '2026-11-03 04:10 PM',
      dueDate: '2026-11-04 12:00 PM',
      lastUpdated: '2026-11-04 08:30 AM',
      slaStatus: 'Approaching Breach',
      firstResponseTimeMinutes: 12,
      slaCountdownHours: 1.5,
      escalationLevel: 1,
      tags: ['Security', 'VPN', 'Critical SLA'],
      sentiment: 'Urgent',
      messages: [
        {
          id: 'MSG-005',
          senderName: 'Sora Takahashi',
          senderRole: 'employee',
          timestamp: '2026-11-03 04:10 PM',
          message: 'I am in Tokyo for client demos. My hardware YubiKey is returning validation error SEC-904. Please reset my MFA token so I can proceed with the keynote demo.',
          isInternalNote: false
        },
        {
          id: 'MSG-006',
          senderName: 'Vikramaditya Nair',
          senderRole: 'it_admin',
          timestamp: '2026-11-03 04:22 PM',
          message: 'Hello Sora, we have initiated identity verification via secondary emergency SMS channel. Please acknowledge the verification code.',
          isInternalNote: false
        },
        {
          id: 'MSG-007',
          senderName: 'Vikramaditya Nair (Internal Note)',
          senderRole: 'it_admin',
          timestamp: '2026-11-04 08:30 AM',
          message: 'Escalated to Level 1 IT Security lead due to VP role and upcoming keynote at 11:00 AM JST. Temporary hardware token bypass approved by CISO.',
          isInternalNote: true
        }
      ]
    },
    {
      id: 'TCK-2026-104',
      ticketNumber: 'TCK-104',
      subject: 'Annual Privilege Leave Encashment Calculation Discrepancy',
      description: 'Calculated 14 encashable days but portal shows only 9 days remaining.',
      employeeId: 'EMP-3619',
      employeeName: 'Ananya Krishnan',
      employeeEmail: 'ananya.k@ofc360.internal',
      department: 'Enterprise Sales',
      designation: 'Enterprise Account Executive',
      category: 'Leave Support',
      subcategory: 'Leave Encashment',
      priority: 'Medium',
      status: 'Pending',
      assignedAgentId: 'AGT-01',
      assignedAgentName: 'Aarav Sharma',
      assignedDepartment: 'People Operations',
      createdDate: '2026-11-02 11:20 AM',
      dueDate: '2026-11-05 06:00 PM',
      lastUpdated: '2026-11-03 02:00 PM',
      slaStatus: 'Within SLA',
      firstResponseTimeMinutes: 45,
      slaCountdownHours: 24,
      escalationLevel: 0,
      tags: ['Leave', 'Encashment'],
      sentiment: 'Neutral',
      messages: [
        {
          id: 'MSG-008',
          senderName: 'Ananya Krishnan',
          senderRole: 'employee',
          timestamp: '2026-11-02 11:20 AM',
          message: 'Requesting review of my 2025 carry-forward leave balance audit report.',
          isInternalNote: false
        }
      ]
    },
    {
      id: 'TCK-2026-105',
      ticketNumber: 'TCK-105',
      subject: 'Duplicate Health Insurance Premium Deduction on October Salary Slip',
      description: 'Payroll slip shows both Corporate Base & Voluntary Top-up deducted twice.',
      employeeId: 'EMP-3607',
      employeeName: 'Devendra Patel',
      employeeEmail: 'devendra.p@ofc360.internal',
      department: 'Finance & Legal',
      designation: 'Senior Financial Analyst',
      category: 'Payroll Support',
      subcategory: 'Salary Issues',
      priority: 'High',
      status: 'Resolved',
      assignedAgentId: 'AGT-01',
      assignedAgentName: 'Aarav Sharma',
      assignedDepartment: 'Finance & People Ops',
      createdDate: '2026-11-01 02:15 PM',
      dueDate: '2026-11-03 06:00 PM',
      lastUpdated: '2026-11-03 04:30 PM',
      slaStatus: 'Within SLA',
      firstResponseTimeMinutes: 18,
      resolutionTimeMinutes: 1250,
      slaCountdownHours: 0,
      escalationLevel: 0,
      tags: ['Payroll', 'Insurance', 'Deduction', 'Refund'],
      sentiment: 'Positive',
      messages: [
        {
          id: 'MSG-009',
          senderName: 'Devendra Patel',
          senderRole: 'employee',
          timestamp: '2026-11-01 02:15 PM',
          message: 'Please check October payslip line items for Care Health Insurance. Total deduction was $180 instead of $90.',
          isInternalNote: false
        },
        {
          id: 'MSG-010',
          senderName: 'Aarav Sharma',
          senderRole: 'hr_admin',
          timestamp: '2026-11-03 04:30 PM',
          message: 'Hi Devendra, the duplicate $90 deduction was traced to an insurer batch API sync delay. The full $90 has been credited as a reimbursement adjustment in the upcoming Nov 28 cycle. Ticket resolved.',
          isInternalNote: false
        }
      ]
    },
    {
      id: 'TCK-2026-106',
      ticketNumber: 'TCK-106',
      subject: 'New Joinee Welcome Kit & Ergonomic Chair Delivery Follow-Up',
      description: 'Joining date Nov 09, confirmed address received but tracking link not active.',
      employeeId: 'EMP-3649',
      employeeName: 'Neha Singhania',
      employeeEmail: 'neha.singhania@ofc360.internal',
      department: 'Engineering',
      designation: 'Staff AI Platform Engineer',
      category: 'HR Support',
      subcategory: 'Joining & Onboarding',
      priority: 'Medium',
      status: 'Open',
      assignedAgentId: 'AGT-02',
      assignedAgentName: 'Neha Verma',
      assignedDepartment: 'People Operations',
      createdDate: '2026-11-04 06:15 AM',
      dueDate: '2026-11-06 06:00 PM',
      lastUpdated: '2026-11-04 06:15 AM',
      slaStatus: 'Within SLA',
      slaCountdownHours: 42,
      escalationLevel: 0,
      tags: ['Onboarding', 'Welcome Kit', 'Hardware'],
      sentiment: 'Neutral',
      messages: [
        {
          id: 'MSG-011',
          senderName: 'Neha Singhania',
          senderRole: 'employee',
          timestamp: '2026-11-04 06:15 AM',
          message: 'Hi team, checking when the courier dispatch for my MacBook Pro M3 and Welcome Kit will arrive at my Bengaluru home address.',
          isInternalNote: false
        }
      ]
    },
    {
      id: 'TCK-2026-107',
      ticketNumber: 'TCK-107',
      subject: 'Workplace Air Quality & Temperature Calibration in Floor 4 Bay-C',
      description: 'Server room HVAC air exhaust blowing cold air directly into team workstations.',
      employeeId: 'EMP-3622',
      employeeName: 'Vikram Rao',
      employeeEmail: 'vikram.rao@ofc360.internal',
      department: 'Engineering',
      designation: 'Senior Cloud Architect',
      category: 'Other',
      subcategory: 'Workplace Complaints',
      priority: 'Low',
      status: 'Closed',
      assignedAgentId: 'AGT-04',
      assignedAgentName: 'Facilities Lead',
      assignedDepartment: 'Workplace & Admin',
      createdDate: '2026-10-29 10:00 AM',
      dueDate: '2026-11-01 06:00 PM',
      lastUpdated: '2026-11-01 05:00 PM',
      slaStatus: 'Within SLA',
      firstResponseTimeMinutes: 30,
      resolutionTimeMinutes: 1800,
      slaCountdownHours: 0,
      escalationLevel: 0,
      tags: ['Facilities', 'Workplace', 'HVAC'],
      sentiment: 'Positive',
      messages: [
        {
          id: 'MSG-012',
          senderName: 'Vikram Rao',
          senderRole: 'employee',
          timestamp: '2026-10-29 10:00 AM',
          message: 'Bay-C vent is currently at 18°C. Can we adjust dampeners to 22°C?',
          isInternalNote: false
        },
        {
          id: 'MSG-013',
          senderName: 'Facilities Lead',
          senderRole: 'hr_admin',
          timestamp: '2026-11-01 05:00 PM',
          message: 'HVAC airflow diverter installed and ambient temp calibrated to 22.5°C across Floor 4.',
          isInternalNote: false
        }
      ]
    },
    {
      id: 'TCK-2026-108',
      ticketNumber: 'TCK-108',
      subject: 'Critical SLA Breach: Relocation Allowance Wire Transfer Delayed > 14 Days',
      description: 'International relocation reimbursement from Zurich branch was promised by Oct 20.',
      employeeId: 'EMP-3650',
      employeeName: 'Lucas Meyer',
      employeeEmail: 'lucas.meyer@ofc360.internal',
      department: 'Product & Design',
      designation: 'Lead Mobile Design Systems',
      category: 'Payroll Support',
      subcategory: 'Reimbursements',
      priority: 'Critical',
      status: 'Escalated',
      assignedAgentId: 'AGT-01',
      assignedAgentName: 'Aarav Sharma',
      assignedDepartment: 'Finance & People Ops',
      createdDate: '2026-10-20 09:00 AM',
      dueDate: '2026-10-24 06:00 PM',
      lastUpdated: '2026-11-04 07:30 AM',
      slaStatus: 'Breached',
      firstResponseTimeMinutes: 120,
      slaCountdownHours: -180,
      escalationLevel: 2,
      tags: ['Relocation', 'Finance', 'SLA Breached', 'Escalation Level 2'],
      sentiment: 'Frustrated',
      messages: [
        {
          id: 'MSG-014',
          senderName: 'Lucas Meyer',
          senderRole: 'employee',
          timestamp: '2026-10-20 09:00 AM',
          message: 'I submitted verified rental advance receipts totaling 4,200 CHF. No update has been received for two weeks.',
          isInternalNote: false
        },
        {
          id: 'MSG-015',
          senderName: 'Aarav Sharma (Internal Note)',
          senderRole: 'hr_admin',
          timestamp: '2026-11-04 07:30 AM',
          message: 'CRITICAL ESCALATION: SWIFT transfer code was returned by Swiss banking node due to missing IBAN check digit. Expedited wire re-submitted with Treasury priority.',
          isInternalNote: true
        }
      ]
    }
  ];

  const employeeRequests: EmployeeRequestItem[] = [
    {
      id: 'REQ-501',
      requestNumber: 'REQ-501',
      employeeId: 'EMP-3601',
      employeeName: 'Elena Rostova',
      department: 'Engineering',
      requestType: 'Salary Certificate',
      subject: 'Formal Salary Certificate for Bank Home Loan Application',
      details: 'Required with corporate seal and authorized signatory for HDFC Home Loan processing.',
      submittedDate: '2026-11-03 11:20 AM',
      status: 'Pending Review',
      currentApprover: 'Aarav Sharma (HR Admin)',
      approvalStage: 'HR Document Attestation',
      history: [
        { stage: 'Submission', actionBy: 'Elena Rostova', timestamp: '2026-11-03 11:20 AM', notes: 'Application initiated via portal.' },
        { stage: 'Verification', actionBy: 'Automated HR Validator', timestamp: '2026-11-03 11:21 AM', notes: 'Tenure > 24 months, verified.' }
      ]
    },
    {
      id: 'REQ-502',
      requestNumber: 'REQ-502',
      employeeId: 'EMP-3603',
      employeeName: 'Sora Takahashi',
      department: 'Product & Design',
      requestType: 'Employment Verification',
      subject: 'Visa Employment Verification Letter for US B1/B2 Travel',
      details: 'Attending San Francisco Design Leadership Summit in January 2027.',
      submittedDate: '2026-11-02 04:00 PM',
      status: 'Approved',
      currentApprover: 'Completed',
      approvalStage: 'Digital Stamp & Signed PDF Generated',
      documentGeneratedUrl: '#',
      history: [
        { stage: 'Submission', actionBy: 'Sora Takahashi', timestamp: '2026-11-02 04:00 PM' },
        { stage: 'Approval', actionBy: 'Aarav Sharma', timestamp: '2026-11-03 09:15 AM', notes: 'Corporate sponsorship approved.' }
      ]
    },
    {
      id: 'REQ-503',
      requestNumber: 'REQ-503',
      employeeId: 'EMP-3614',
      employeeName: 'Rohan Deshmukh',
      department: 'Engineering',
      requestType: 'Bank Account Update',
      subject: 'Salary Direct Deposit Account Change to Axis Bank',
      details: 'Changing primary salary credit account. Attached cancelled cheque and bank statement.',
      submittedDate: '2026-11-04 08:00 AM',
      status: 'Pending Review',
      currentApprover: 'Payroll Lead',
      approvalStage: 'Penny Drop Account Validation',
      history: [
        { stage: 'Submission', actionBy: 'Rohan Deshmukh', timestamp: '2026-11-04 08:00 AM' }
      ]
    },
    {
      id: 'REQ-504',
      requestNumber: 'REQ-504',
      employeeId: 'EMP-3619',
      employeeName: 'Ananya Krishnan',
      department: 'Enterprise Sales',
      requestType: 'Experience Letter',
      subject: 'Provisional Service Letter for Higher Education Application',
      details: 'Applying for Executive MBA at INSEAD; requires breakdown of roles and dates.',
      submittedDate: '2026-10-28 02:30 PM',
      status: 'Fulfilled',
      currentApprover: 'Completed',
      approvalStage: 'Digitally Dispatched',
      documentGeneratedUrl: '#',
      history: [
        { stage: 'Submission', actionBy: 'Ananya Krishnan', timestamp: '2026-10-28 02:30 PM' },
        { stage: 'Fulfilled', actionBy: 'Aarav Sharma', timestamp: '2026-10-30 11:00 AM', notes: 'Letter issued with Dean reference.' }
      ]
    }
  ];

  const complaints: ConfidentialComplaintItem[] = [
    {
      id: 'CMP-901',
      complaintNumber: 'CMP-901',
      isAnonymous: true,
      category: 'Ethics & Fraud',
      subject: 'Vendor Quotation Bias in Cloud Server Infrastructure Procurement',
      detailedStatement: 'Observed that preferred pricing tenders for European data center hardware were pre-selected before RFP closing date.',
      submittedDate: '2026-10-25 04:15 PM',
      status: 'Under Investigation',
      assignedInvestigator: 'Super Admin & Internal Audit Chair',
      investigationPhase: 'Forensic Audit of Procurement RFPs',
      restrictedRolesOnly: ['super_admin', 'hr_admin'],
      evidenceCount: 3,
      investigationNotes: [
        { id: 'NT-1', author: 'Internal Audit Chair', timestamp: '2026-10-27 10:00 AM', note: 'Independent auditor assigned to inspect timestamped RFP bid submissions.' },
        { id: 'NT-2', author: 'Super Admin', timestamp: '2026-11-02 03:30 PM', note: 'Vendor communication emails preserved under legal hold.' }
      ],
      escalationWorkflow: 'Board Audit Committee Escalation Matrix Level 2'
    },
    {
      id: 'CMP-902',
      complaintNumber: 'CMP-902',
      isAnonymous: false,
      complainantName: 'Confidential Staff Member',
      complainantId: 'EMP-REDACTED',
      complainantDepartment: 'Operations',
      category: 'POSH',
      subject: 'Inappropriate Communication in Cross-Department Slack Channel',
      detailedStatement: 'Repeated unwelcome non-work-related messages during after-hours shift duty.',
      submittedDate: '2026-11-01 11:00 AM',
      status: 'Committee Review',
      assignedInvestigator: 'Internal Complaints Committee (ICC)',
      investigationPhase: 'Statement Recording & Deposition',
      restrictedRolesOnly: ['super_admin', 'hr_admin'],
      evidenceCount: 2,
      investigationNotes: [
        { id: 'NT-3', author: 'ICC Presiding Officer', timestamp: '2026-11-02 11:30 AM', note: 'Both parties notified under confidential ICC charter rules. Safe workplace interim safeguards instituted.' }
      ],
      escalationWorkflow: 'Statutory ICC 90-Day Inquiry Pipeline'
    }
  ];

  const slaRules: SlaRuleConfig[] = [
    {
      id: 'SLA-1',
      priority: 'Critical',
      firstResponseTargetHours: 1,
      resolutionTargetHours: 4,
      autoEscalateAfterHours: 2,
      escalateToRole: 'super_admin',
      businessHoursOnly: false,
      notifySupervisorOnBreach: true
    },
    {
      id: 'SLA-2',
      priority: 'High',
      firstResponseTargetHours: 4,
      resolutionTargetHours: 24,
      autoEscalateAfterHours: 12,
      escalateToRole: 'hr_admin',
      businessHoursOnly: true,
      notifySupervisorOnBreach: true
    },
    {
      id: 'SLA-3',
      priority: 'Medium',
      firstResponseTargetHours: 8,
      resolutionTargetHours: 48,
      autoEscalateAfterHours: 36,
      escalateToRole: 'hr_admin',
      businessHoursOnly: true,
      notifySupervisorOnBreach: false
    },
    {
      id: 'SLA-4',
      priority: 'Low',
      firstResponseTargetHours: 24,
      resolutionTargetHours: 96,
      autoEscalateAfterHours: 72,
      escalateToRole: 'manager',
      businessHoursOnly: true,
      notifySupervisorOnBreach: false
    }
  ];

  const agents: SupportAgent[] = [
    {
      id: 'AGT-01',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@ofc360.internal',
      department: 'People Operations',
      role: 'Lead HR Support Architect',
      avatar: 'AS',
      assignedTicketsCount: 4,
      resolvedTicketsCount: 38,
      pendingTicketsCount: 2,
      avgResponseTimeMinutes: 22,
      avgResolutionTimeHours: 14.5,
      availabilityStatus: 'Available',
      currentWorkloadScore: 45,
      skills: ['Payroll & Tax', 'Employee Lifecycle', 'Statutory PF/ESI', 'Escalations']
    },
    {
      id: 'AGT-02',
      name: 'Neha Verma',
      email: 'neha.verma@ofc360.internal',
      department: 'HR Operations',
      role: 'Senior Support Specialist',
      avatar: 'NV',
      assignedTicketsCount: 2,
      resolvedTicketsCount: 29,
      pendingTicketsCount: 1,
      avgResponseTimeMinutes: 28,
      avgResolutionTimeHours: 18.0,
      availabilityStatus: 'Available',
      currentWorkloadScore: 30,
      skills: ['Attendance Regularization', 'Joining & Induction', 'Leave Management']
    },
    {
      id: 'AGT-03',
      name: 'Vikramaditya Nair',
      email: 'vikram.nair@ofc360.internal',
      department: 'IT Security',
      role: 'Identity & Access Lead',
      avatar: 'VN',
      assignedTicketsCount: 1,
      resolvedTicketsCount: 44,
      pendingTicketsCount: 1,
      avgResponseTimeMinutes: 14,
      avgResolutionTimeHours: 8.2,
      availabilityStatus: 'Busy',
      currentWorkloadScore: 80,
      skills: ['SSO & MFA', 'Hardware Tokens', 'VPN & Firewall', 'Device Security']
    },
    {
      id: 'AGT-04',
      name: 'Farhan Akhtar',
      email: 'farhan.akhtar@ofc360.internal',
      department: 'Workplace & Facilities',
      role: 'Corporate Services Manager',
      avatar: 'FA',
      assignedTicketsCount: 1,
      resolvedTicketsCount: 22,
      pendingTicketsCount: 0,
      avgResponseTimeMinutes: 35,
      avgResolutionTimeHours: 24.0,
      availabilityStatus: 'Available',
      currentWorkloadScore: 25,
      skills: ['Facilities', 'Air Quality & HVAC', 'Visitor Access', 'Office Assets']
    }
  ];

  const kbArticles: KbArticle[] = [
    {
      id: 'KB-101',
      title: 'How to Submit and Verify Section 80C Tax Investment Proofs',
      slug: 'section-80c-tax-proofs-guide',
      category: 'Payroll Support',
      summary: 'Complete step-by-step checklist for submitting ELSS mutual funds, LIC premiums, tuition fees, and PPF proofs before November 20 cut-off.',
      content: 'All regular full-time employees can declare and submit proof of tax saving investments via the OFC360 Payroll module. Accepted file formats are password-free signed PDFs. Ensure AMC registrar stamps or bank transaction confirmations are visible on the document before uploading.',
      tags: ['Tax', 'TDS', 'Investment Proof', 'Payroll'],
      status: 'Published',
      author: 'Aarav Sharma',
      publishedDate: '2026-10-15',
      lastUpdated: '2026-11-02',
      helpfulCount: 142,
      notHelpfulCount: 4,
      viewCount: 1890
    },
    {
      id: 'KB-102',
      title: 'Biometric Attendance Regularization & Field Duty Policy',
      slug: 'biometric-regularization-policy',
      category: 'Attendance Support',
      summary: 'Guidelines for missed biometric punches, on-duty client visits, and late entry approvals.',
      content: 'If you miss a punch due to hardware readers or offsite client travel, log an attendance regularization request within 48 hours. Regularizations require manager sign-off and are processed daily at 06:00 PM.',
      tags: ['Attendance', 'Biometrics', 'Regularization'],
      status: 'Published',
      author: 'Neha Verma',
      publishedDate: '2026-09-10',
      lastUpdated: '2026-10-28',
      helpfulCount: 98,
      notHelpfulCount: 2,
      viewCount: 1140
    },
    {
      id: 'KB-103',
      title: 'Annual Privilege Leave Carry-Forward and Encashment Matrix',
      slug: 'privilege-leave-encashment-matrix',
      category: 'Leave Support',
      summary: 'Rules governing maximum 30 days leave carry-forward to the 2027 calendar year and encashment formula.',
      content: 'Employees with more than 15 unavailed Privilege Leaves at the end of the calendar year may encash up to 10 days at basic salary rates. Remaining eligible balance up to 30 days automatically rolls forward to January 01.',
      tags: ['Leave', 'Carry Forward', 'Encashment'],
      status: 'Published',
      author: 'Aarav Sharma',
      publishedDate: '2026-08-20',
      lastUpdated: '2026-11-01',
      helpfulCount: 84,
      notHelpfulCount: 1,
      viewCount: 960
    },
    {
      id: 'KB-104',
      title: 'Confidential Whistleblower & POSH Redressal Mechanism',
      slug: 'confidential-whistleblower-posh-mechanism',
      category: 'Other',
      summary: 'Independent reporting channel, anonymous protections, and ICC inquiry timelines.',
      content: 'OFC360 enforces a zero-retaliation policy. Complaints submitted through the confidential support portal are encrypted and restricted to the Internal Complaints Committee (ICC) and Super Admin only. Complainants may choose anonymity.',
      tags: ['Ethics', 'POSH', 'Confidential', 'Whistleblower'],
      status: 'Published',
      author: 'Legal & Ethics Office',
      publishedDate: '2026-06-01',
      lastUpdated: '2026-10-10',
      helpfulCount: 210,
      notHelpfulCount: 3,
      viewCount: 2450
    }
  ];

  const faqs: FaqItem[] = [
    {
      id: 'FAQ-01',
      question: 'When is the monthly salary credited?',
      answer: 'Salaries are credited on the 28th of every calendar month. If the 28th falls on a weekend or public holiday, disbursement occurs on the preceding business day.',
      category: 'Payroll Support',
      tags: ['Salary', 'Disbursement', 'Payout'],
      order: 1
    },
    {
      id: 'FAQ-02',
      question: 'How do I download my monthly payslip?',
      answer: 'Navigate to More > Payroll or Employee Requests > Payslip Request. Verified PDF payslips with digital signatures are downloadable instantaneously for the past 24 months.',
      category: 'Payroll Support',
      tags: ['Payslip', 'PDF'],
      order: 2
    },
    {
      id: 'FAQ-03',
      question: 'What is the turnaround time for a formal Employment Verification Letter?',
      answer: 'Standard requests are processed within 24 business hours. Urgent requests for visa consulate interviews can be flagged as High Priority for 4-hour turnaround.',
      category: 'HR Support',
      tags: ['Verification', 'Visa', 'Letter'],
      order: 3
    },
    {
      id: 'FAQ-04',
      question: 'Who can see my confidential complaint submissions?',
      answer: 'Only designated members of the statutory Internal Complaints Committee (ICC) and authorized Super Admins have decryption clearance to view confidential complaint files. Managers and general HR personnel cannot access these records.',
      category: 'Other',
      tags: ['Confidential', 'Security'],
      order: 4
    }
  ];

  const announcements: HelpDeskAnnouncement[] = [
    {
      id: 'HDA-01',
      title: 'Tax Investment Proof Verification Window Closes Nov 20',
      content: 'Please ensure all LIC, ELSS, tuition fee, and housing loan interest certificates are uploaded in the portal before 11:59 PM on Nov 20 to guarantee adjustment in the November salary payout.',
      priority: 'High',
      postedDate: '2026-11-01',
      expiryDate: '2026-11-20',
      author: 'Aarav Sharma (People Ops)',
      targetAudience: 'All Employees'
    },
    {
      id: 'HDA-02',
      title: 'Scheduled Single Sign-On (SSO) Security Certificate Upgrade',
      content: 'IT Infrastructure team will rotate SAML 2.0 signing certificates this Saturday from 02:00 AM to 03:00 AM IST. No active sessions will be terminated.',
      priority: 'Normal',
      postedDate: '2026-11-03',
      expiryDate: '2026-11-08',
      author: 'Vikramaditya Nair (IT Security)',
      targetAudience: 'All Employees'
    }
  ];

  const kpis: HelpDeskOverviewKpis = {
    totalTickets: tickets.length,
    openTickets: tickets.filter((t) => t.status === 'Open').length,
    inProgressTickets: tickets.filter((t) => t.status === 'In Progress').length,
    pendingTickets: tickets.filter((t) => t.status === 'Pending').length,
    resolvedTickets: tickets.filter((t) => t.status === 'Resolved' || t.status === 'Closed').length,
    slaBreachedTickets: tickets.filter((t) => t.slaStatus === 'Breached').length,
    avgFirstResponseTimeMinutes: 26,
    avgResolutionTimeHours: 16.4,
    csatScore: 4.8,
    totalRequests: employeeRequests.length,
    totalComplaints: complaints.length,
    activeAgents: agents.filter((a) => a.availabilityStatus === 'Available').length
  };

  return {
    tickets,
    employeeRequests,
    complaints,
    slaRules,
    agents,
    kbArticles,
    faqs,
    announcements,
    kpis,
    settings: {
      businessHoursStart: '09:00',
      businessHoursEnd: '18:00',
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      autoAssignmentEnabled: true,
      defaultAssigneeAgentId: 'AGT-01',
      emailAlertsEnabled: true,
      smsAlertsEnabled: true,
      slackIntegrationEnabled: true
    }
  };
}

// Pure logic helpers for unit testing and operations
export function calculateSlaTimeRemaining(
  createdDateStr: string,
  targetHours: number,
  currentTime: Date = new Date()
): { hoursRemaining: number; isBreached: boolean; status: SlaStatus } {
  const created = new Date(createdDateStr);
  const deadline = new Date(created.getTime() + targetHours * 3600 * 1000);
  const diffMs = deadline.getTime() - currentTime.getTime();
  const hoursRemaining = Math.round((diffMs / (3600 * 1000)) * 10) / 10;

  if (hoursRemaining <= 0) {
    return { hoursRemaining, isBreached: true, status: 'Breached' };
  } else if (hoursRemaining <= 2) {
    return { hoursRemaining, isBreached: false, status: 'Approaching Breach' };
  }
  return { hoursRemaining, isBreached: false, status: 'Within SLA' };
}

export function canAccessConfidentialComplaint(role: Ofc360Role): boolean {
  return role === 'super_admin' || role === 'hr_admin';
}

export function filterTickets(
  tickets: SupportTicket[],
  filters: {
    query?: string;
    status?: string;
    priority?: string;
    category?: string;
    department?: string;
    assignedAgentId?: string;
  }
): SupportTicket[] {
  return tickets.filter((t) => {
    if (filters.query) {
      const q = filters.query.toLowerCase();
      const match =
        t.ticketNumber.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.employeeName.toLowerCase().includes(q) ||
        t.employeeId.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filters.status && filters.status !== 'All' && t.status !== filters.status) {
      return false;
    }
    if (filters.priority && filters.priority !== 'All' && t.priority !== filters.priority) {
      return false;
    }
    if (filters.category && filters.category !== 'All' && t.category !== filters.category) {
      return false;
    }
    if (filters.department && filters.department !== 'All' && t.department !== filters.department) {
      return false;
    }
    if (filters.assignedAgentId && filters.assignedAgentId !== 'All' && t.assignedAgentId !== filters.assignedAgentId) {
      return false;
    }
    return true;
  });
}
