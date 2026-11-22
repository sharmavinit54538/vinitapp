import {
  BookingRecord,
  ExpenseClaimRecord,
  TravelActivityLog,
  TravelDeskSettings,
  TravelNotificationItem,
  TravelPolicyRule,
  TravelRequestRecord,
} from '../../types/travelDesk';

export const REFERENCE_TODAY = '2026-11-15';

export const INITIAL_TRAVEL_REQUESTS: TravelRequestRecord[] = [
  {
    id: 'TRV-2026-001',
    employeeId: 'EMP-1001',
    employeeName: 'Aarav Sharma',
    department: 'Engineering',
    designation: 'Principal Product Engineer',
    reportingManager: 'Vikramaditya Nair',
    tripType: 'domestic',
    purpose: 'Client Meeting',
    sourceCity: 'Bengaluru',
    destinationCity: 'Mumbai',
    departureDate: '2026-11-20',
    returnDate: '2026-11-22',
    travelMode: 'flight',
    travelClass: 'Economy',
    hotelRequired: true,
    accommodationType: '4-Star Business Hotel',
    projectCostCenter: 'CC-ENG-FINTECH',
    estimatedBudget: 28500,
    actualCost: 26400,
    emergencyContact: '+91 98765 43210 (Pooja Sharma - Spouse)',
    notes: 'Meeting with ICICI Bank core enterprise integration team.',
    status: 'booked',
    policyViolation: false,
    submittedAt: '2026-11-10 10:30 AM',
    approvalHistory: [
      {
        id: 'APH-1',
        actor: 'Aarav Sharma',
        role: 'Employee',
        action: 'Submitted',
        timestamp: '2026-11-10 10:30 AM',
        comments: 'Critical client integration delivery review.',
      },
      {
        id: 'APH-2',
        actor: 'Vikramaditya Nair',
        role: 'Manager',
        action: 'Approved',
        timestamp: '2026-11-10 02:15 PM',
        comments: 'Approved. Deliverables aligned with Q4 sprint.',
      },
      {
        id: 'APH-3',
        actor: 'Priya Krishnan',
        role: 'HR Admin',
        action: 'Booked',
        timestamp: '2026-11-11 11:00 AM',
        comments: 'IndiGo flight & The Orchid Mumbai booked via corporate desk.',
      },
    ],
    attachments: [
      {
        id: 'ATT-1',
        name: 'IndiGo_6E-442_Bengaluru_Mumbai.pdf',
        sizeFormatted: '420 KB',
        type: 'application/pdf',
        category: 'ticket',
      },
      {
        id: 'ATT-2',
        name: 'The_Orchid_Mumbai_Confirmation.pdf',
        sizeFormatted: '680 KB',
        type: 'application/pdf',
        category: 'hotel',
      },
    ],
  },
  {
    id: 'TRV-2026-002',
    employeeId: 'EMP-1005',
    employeeName: 'Marcus Vance',
    department: 'Sales & GTM',
    designation: 'Enterprise Account Director',
    reportingManager: 'Vikramaditya Nair',
    tripType: 'international',
    purpose: 'Sales Pitch',
    sourceCity: 'Bengaluru',
    destinationCity: 'Singapore',
    departureDate: '2026-11-28',
    returnDate: '2026-12-02',
    travelMode: 'flight',
    travelClass: 'Premium Economy',
    hotelRequired: true,
    accommodationType: 'Marina Bay Financial Hotel',
    projectCostCenter: 'CC-GTM-APAC',
    estimatedBudget: 145000,
    emergencyContact: '+65 9123 4567 (Elena Vance - Sister)',
    notes: 'APAC Regional BFSI RFP Presentation (Deal Size: $1.2M ARR).',
    status: 'pending_executive',
    policyViolation: true,
    policyViolationReason: 'International trip budget exceeds ₹1,00,000 threshold. Executive sign-off required.',
    submittedAt: '2026-11-12 03:00 PM',
    approvalHistory: [
      {
        id: 'APH-4',
        actor: 'Marcus Vance',
        role: 'Employee',
        action: 'Submitted',
        timestamp: '2026-11-12 03:00 PM',
        comments: 'High priority enterprise pitch.',
      },
      {
        id: 'APH-5',
        actor: 'Vikramaditya Nair',
        role: 'Manager',
        action: 'Approved',
        timestamp: '2026-11-13 11:30 AM',
        comments: 'Strongly recommended. Enterprise tier customer.',
      },
      {
        id: 'APH-6',
        actor: 'Priya Krishnan',
        role: 'HR Admin',
        action: 'Approved',
        timestamp: '2026-11-13 04:00 PM',
        comments: 'Passed to Executive desk for budget escalation clearance.',
      },
    ],
    attachments: [
      {
        id: 'ATT-3',
        name: 'Client_Meeting_Agenda_Singapore.pdf',
        sizeFormatted: '850 KB',
        type: 'application/pdf',
        category: 'approval',
      },
    ],
  },
  {
    id: 'TRV-2026-003',
    employeeId: 'EMP-1002',
    employeeName: 'Elena Rostova',
    department: 'Engineering',
    designation: 'Staff Cloud Architect',
    reportingManager: 'Vikramaditya Nair',
    tripType: 'domestic',
    purpose: 'Conference / Seminar',
    sourceCity: 'Bengaluru',
    destinationCity: 'New Delhi',
    departureDate: '2026-12-05',
    returnDate: '2026-12-07',
    travelMode: 'flight',
    travelClass: 'Economy',
    hotelRequired: true,
    accommodationType: 'Aerocity Business Suites',
    projectCostCenter: 'CC-ENG-RND',
    estimatedBudget: 32000,
    emergencyContact: '+91 99887 76655 (Dmitry - Brother)',
    notes: 'AWS Cloud Community Day speaker keynoting on serverless scale.',
    status: 'pending_manager',
    policyViolation: false,
    submittedAt: '2026-11-14 09:15 AM',
    approvalHistory: [
      {
        id: 'APH-7',
        actor: 'Elena Rostova',
        role: 'Employee',
        action: 'Submitted',
        timestamp: '2026-11-14 09:15 AM',
        comments: 'Keynote speaking slot confirmed by AWS team.',
      },
    ],
    attachments: [],
  },
  {
    id: 'TRV-2026-004',
    employeeId: 'EMP-1006',
    employeeName: 'Sora Takahashi',
    department: 'Product & Design',
    designation: 'Senior UX Researcher',
    reportingManager: 'Vikramaditya Nair',
    tripType: 'domestic',
    purpose: 'Project Deployment',
    sourceCity: 'Bengaluru',
    destinationCity: 'Hyderabad',
    departureDate: '2026-10-15',
    returnDate: '2026-10-18',
    travelMode: 'train',
    travelClass: 'AC 1st Class',
    hotelRequired: true,
    accommodationType: 'Hitech City Corporate Inn',
    projectCostCenter: 'CC-PRD-UX',
    estimatedBudget: 18000,
    actualCost: 16500,
    emergencyContact: '+91 98112 23344 (Kenji - Father)',
    notes: 'On-site user research and field interviews with warehouse workers.',
    status: 'completed',
    policyViolation: false,
    submittedAt: '2026-10-01 11:00 AM',
    approvalHistory: [
      {
        id: 'APH-8',
        actor: 'Sora Takahashi',
        role: 'Employee',
        action: 'Submitted',
        timestamp: '2026-10-01 11:00 AM',
      },
      {
        id: 'APH-9',
        actor: 'Vikramaditya Nair',
        role: 'Manager',
        action: 'Approved',
        timestamp: '2026-10-02 03:00 PM',
      },
      {
        id: 'APH-10',
        actor: 'Priya Krishnan',
        role: 'HR Admin',
        action: 'Booked',
        timestamp: '2026-10-03 10:00 AM',
      },
    ],
    attachments: [
      {
        id: 'ATT-4',
        name: 'IRCTC_VandeBharat_Ticket.pdf',
        sizeFormatted: '310 KB',
        type: 'application/pdf',
        category: 'ticket',
      },
      {
        id: 'ATT-5',
        name: 'Hyderabad_Hotel_Tax_Invoice.pdf',
        sizeFormatted: '540 KB',
        type: 'application/pdf',
        category: 'invoice',
      },
    ],
  },
  {
    id: 'TRV-2026-005',
    employeeId: 'EMP-1007',
    employeeName: 'Rohan Kulkarni',
    department: 'Finance & Legal',
    designation: 'Senior Payroll Controller',
    reportingManager: 'Vikramaditya Nair',
    tripType: 'domestic',
    purpose: 'Internal Review',
    sourceCity: 'Bengaluru',
    destinationCity: 'Chennai',
    departureDate: '2026-11-24',
    returnDate: '2026-11-25',
    travelMode: 'train',
    travelClass: 'AC 2-Tier',
    hotelRequired: true,
    accommodationType: 'Express Avenue Corporate Stay',
    projectCostCenter: 'CC-FIN-COMPLIANCE',
    estimatedBudget: 12000,
    emergencyContact: '+91 94455 66778 (Sneha - Spouse)',
    notes: 'Statutory compliance audit with Tamil Nadu branch advisors.',
    status: 'pending_hr',
    policyViolation: false,
    submittedAt: '2026-11-13 02:45 PM',
    approvalHistory: [
      {
        id: 'APH-11',
        actor: 'Rohan Kulkarni',
        role: 'Employee',
        action: 'Submitted',
        timestamp: '2026-11-13 02:45 PM',
      },
      {
        id: 'APH-12',
        actor: 'Vikramaditya Nair',
        role: 'Manager',
        action: 'Approved',
        timestamp: '2026-11-14 10:00 AM',
        comments: 'Essential quarterly audit visit.',
      },
    ],
    attachments: [],
  },
  {
    id: 'TRV-2026-006',
    employeeId: 'EMP-1003',
    employeeName: 'Vikramaditya Nair',
    department: 'Product & Design',
    designation: 'Lead Product Designer',
    reportingManager: 'Elena Rostova',
    tripType: 'domestic',
    purpose: 'Client Meeting',
    sourceCity: 'Bengaluru',
    destinationCity: 'Pune',
    departureDate: '2026-11-18',
    returnDate: '2026-11-19',
    travelMode: 'flight',
    travelClass: 'Economy',
    hotelRequired: false,
    projectCostCenter: 'CC-PRD-CORE',
    estimatedBudget: 16500,
    emergencyContact: '+91 97711 22334 (Ananya - Sister)',
    notes: 'Same-day client workshop with Bajaj Auto design team.',
    status: 'approved',
    policyViolation: false,
    submittedAt: '2026-11-11 05:00 PM',
    approvalHistory: [
      {
        id: 'APH-13',
        actor: 'Vikramaditya Nair',
        role: 'Employee',
        action: 'Submitted',
        timestamp: '2026-11-11 05:00 PM',
      },
      {
        id: 'APH-14',
        actor: 'Elena Rostova',
        role: 'Manager',
        action: 'Approved',
        timestamp: '2026-11-12 09:30 AM',
      },
    ],
    attachments: [],
  },
];

export const INITIAL_BOOKINGS: BookingRecord[] = [
  {
    id: 'BKG-FL-101',
    travelRequestId: 'TRV-2026-001',
    employeeName: 'Aarav Sharma',
    mode: 'flight',
    vendor: 'IndiGo (6E-442)',
    bookingReference: 'PNR: 6EX9Q2',
    bookingDate: '2026-11-11',
    travelDate: '2026-11-20',
    estimatedCost: 14000,
    actualCost: 13200,
    status: 'Confirmed',
    details: 'BLR -> BOM · 06:15 AM - 08:00 AM · Seat 12F · 15kg Baggage Included',
  },
  {
    id: 'BKG-HT-102',
    travelRequestId: 'TRV-2026-001',
    employeeName: 'Aarav Sharma',
    mode: 'hotel',
    vendor: 'The Orchid Hotel Mumbai',
    bookingReference: 'RES: ORC-99201',
    bookingDate: '2026-11-11',
    travelDate: '2026-11-20',
    estimatedCost: 14500,
    actualCost: 13200,
    status: 'Confirmed',
    details: 'Deluxe Queen Room · 2 Nights · Complimentary Breakfast & Wi-Fi',
  },
  {
    id: 'BKG-TR-103',
    travelRequestId: 'TRV-2026-004',
    employeeName: 'Sora Takahashi',
    mode: 'train',
    vendor: 'Indian Railways (Vande Bharat 20704)',
    bookingReference: 'PNR: 4429810231',
    bookingDate: '2026-10-03',
    travelDate: '2026-10-15',
    estimatedCost: 3500,
    actualCost: 3200,
    status: 'Confirmed',
    details: 'Kacheguda -> YPR · Executive Chair Car (EC) · Meals Included',
  },
  {
    id: 'BKG-CB-104',
    travelRequestId: 'TRV-2026-001',
    employeeName: 'Aarav Sharma',
    mode: 'cab',
    vendor: 'Uber for Business Corporate',
    bookingReference: 'UBR-BLR-098',
    bookingDate: '2026-11-15',
    travelDate: '2026-11-20',
    estimatedCost: 1800,
    actualCost: 1650,
    status: 'Confirmed',
    details: 'Scheduled Airport Drop · BLR Airport Premier Sedan',
  },
  {
    id: 'BKG-FL-105',
    travelRequestId: 'TRV-2026-006',
    employeeName: 'Vikramaditya Nair',
    mode: 'flight',
    vendor: 'Air India Express (IX-912)',
    bookingReference: 'PNR: AI9B52',
    bookingDate: '2026-11-13',
    travelDate: '2026-11-18',
    estimatedCost: 12000,
    actualCost: 11400,
    status: 'Confirmed',
    details: 'BLR -> PNQ · 08:30 AM - 10:10 AM · Seat 4C',
  },
];

export const INITIAL_EXPENSES: ExpenseClaimRecord[] = [
  {
    id: 'EXP-2026-101',
    travelRequestId: 'TRV-2026-004',
    employeeName: 'Sora Takahashi',
    employeeId: 'EMP-1006',
    category: 'Hotel',
    amount: 9800,
    expenseDate: '2026-10-18',
    description: 'Hotel stay at Hitech City Corporate Inn (3 nights invoice)',
    receiptName: 'Hitech_Inn_Tax_Invoice_9800.pdf',
    approvalStatus: 'Reimbursed',
    reimbursedDate: '2026-10-25',
  },
  {
    id: 'EXP-2026-102',
    travelRequestId: 'TRV-2026-004',
    employeeName: 'Sora Takahashi',
    employeeId: 'EMP-1006',
    category: 'Meals',
    amount: 3250,
    expenseDate: '2026-10-17',
    description: 'Client team working lunch and field dinner during deployment',
    receiptName: 'Paradise_Food_Invoice_3250.jpg',
    approvalStatus: 'Reimbursed',
    reimbursedDate: '2026-10-25',
  },
  {
    id: 'EXP-2026-103',
    travelRequestId: 'TRV-2026-001',
    employeeName: 'Aarav Sharma',
    employeeId: 'EMP-1001',
    category: 'Cab',
    amount: 1450,
    expenseDate: '2026-11-12',
    description: 'Advance local cab booking receipt from Mumbai Airport to BKC',
    receiptName: 'Mumbai_Meru_Cab_Receipt.pdf',
    approvalStatus: 'Manager Approved',
  },
  {
    id: 'EXP-2026-104',
    travelRequestId: 'TRV-2026-006',
    employeeName: 'Vikramaditya Nair',
    employeeId: 'EMP-1003',
    category: 'Meals',
    amount: 1800,
    expenseDate: '2026-11-14',
    description: 'Per diem meal allowance for upcoming Pune sprint',
    receiptName: 'Airport_Lounge_Receipt_1800.png',
    approvalStatus: 'Submitted',
  },
];

export const INITIAL_NOTIFICATIONS: TravelNotificationItem[] = [
  {
    id: 'NTF-1',
    type: 'booking_confirmed',
    title: 'Flight & Hotel Confirmed',
    message: 'Your Mumbai travel tickets for TRV-2026-001 have been issued by HR Travel Desk.',
    timestamp: '2 hours ago',
    read: false,
    relatedRequestId: 'TRV-2026-001',
  },
  {
    id: 'NTF-2',
    type: 'policy_violation',
    title: 'Executive Approval Required',
    message: 'International Trip TRV-2026-002 exceeds ₹1,00,000 threshold and is awaiting Executive sign-off.',
    timestamp: '5 hours ago',
    read: false,
    relatedRequestId: 'TRV-2026-002',
  },
  {
    id: 'NTF-3',
    type: 'request_approved',
    title: 'Manager Approved Your Trip',
    message: 'Vikramaditya Nair approved your travel request TRV-2026-006 to Pune.',
    timestamp: '1 day ago',
    read: true,
    relatedRequestId: 'TRV-2026-006',
  },
  {
    id: 'NTF-4',
    type: 'reimbursement_processed',
    title: 'Expense Claim Settled',
    message: '₹13,050 for Hyderabad deployment trip TRV-2026-004 has been credited to your payroll account.',
    timestamp: '3 days ago',
    read: true,
    relatedRequestId: 'TRV-2026-004',
  },
];

export const INITIAL_TRAVEL_POLICIES: TravelPolicyRule[] = [
  {
    grade: 'L1 - L3 (Associate / Engineer)',
    flightAllowed: true,
    flightMaxBudget: 15000,
    hotelDailyLimit: 4500,
    perDiemLimit: 1200,
    internationalRequiresExecutive: true,
  },
  {
    grade: 'L4 - L6 (Senior / Staff / Lead)',
    flightAllowed: true,
    flightMaxBudget: 35000,
    hotelDailyLimit: 8500,
    perDiemLimit: 2500,
    internationalRequiresExecutive: true,
  },
  {
    grade: 'L7+ (Director / Executive)',
    flightAllowed: true,
    flightMaxBudget: 150000,
    hotelDailyLimit: 18000,
    perDiemLimit: 5000,
    internationalRequiresExecutive: false,
  },
];

export const INITIAL_TRAVEL_SETTINGS: TravelDeskSettings = {
  autoApprovalThreshold: 10000,
  executiveApprovalThreshold: 100000,
  maxAdvanceDaysBooking: 90,
  requireReceiptOverAmount: 500,
  allowSelfBooking: false,
  perDiemDomestic: 1500,
  perDiemInternational: 5500,
  emergencyTravelHotline: '+91 80 4567 8999 (24x7 Corporate SOS)',
};

export const INITIAL_ACTIVITY_LOGS: TravelActivityLog[] = [
  {
    id: 'LOG-1',
    actor: 'Priya Krishnan (HR Admin)',
    action: 'Flight Ticket Uploaded',
    targetId: 'TRV-2026-001',
    details: 'Uploaded IndiGo 6E-442 ticket and updated PNR 6EX9Q2',
    timestamp: '2026-11-11 11:05 AM',
  },
  {
    id: 'LOG-2',
    actor: 'Vikramaditya Nair (Manager)',
    action: 'Travel Request Approved',
    targetId: 'TRV-2026-002',
    details: 'Approved international trip to Singapore ($1.2M RFP pitch)',
    timestamp: '2026-11-13 11:30 AM',
  },
  {
    id: 'LOG-3',
    actor: 'Finance Controller',
    action: 'Reimbursement Disbursed',
    targetId: 'EXP-2026-101',
    details: 'Disbursed ₹9,800 to Sora Takahashi for Hyderabad stay',
    timestamp: '2026-10-25 04:30 PM',
  },
];

// Pure helper functions
export function calculateTravelKpis(
  requests: TravelRequestRecord[],
  expenses: ExpenseClaimRecord[],
  budgetAnnual = 2500000
) {
  const totalRequests = requests.length;
  const pendingApprovals = requests.filter(
    (r) =>
      r.status === 'pending_manager' ||
      r.status === 'pending_hr' ||
      r.status === 'pending_executive'
  ).length;
  const approvedTrips = requests.filter(
    (r) => r.status === 'approved' || r.status === 'booked'
  ).length;
  const activeTrips = requests.filter(
    (r) =>
      r.status === 'booked' &&
      r.departureDate <= REFERENCE_TODAY &&
      r.returnDate >= REFERENCE_TODAY
  ).length;
  const upcomingTrips = requests.filter(
    (r) =>
      (r.status === 'approved' || r.status === 'booked') &&
      r.departureDate > REFERENCE_TODAY
  ).length;
  const totalExpenseClaimed = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenseReimbursed = expenses
    .filter((e) => e.approvalStatus === 'Reimbursed')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalCommittedBudget = requests
    .filter((r) => r.status !== 'rejected' && r.status !== 'cancelled')
    .reduce((acc, curr) => acc + (curr.actualCost || curr.estimatedBudget), 0);
  const budgetUtilizationPct = Math.min(
    100,
    Math.round((totalCommittedBudget / Math.max(1, budgetAnnual)) * 100)
  );

  return {
    totalRequests,
    pendingApprovals,
    approvedTrips,
    activeTrips,
    upcomingTrips,
    totalExpenseClaimed,
    totalExpenseReimbursed,
    totalCommittedBudget,
    budgetAnnual,
    budgetUtilizationPct,
  };
}

export function checkPolicyViolation(
  tripType: 'domestic' | 'international',
  estimatedBudget: number,
  settings: TravelDeskSettings
): { violation: boolean; reason?: string } {
  if (tripType === 'international' && estimatedBudget > settings.executiveApprovalThreshold) {
    return {
      violation: true,
      reason: `International trip budget (₹${estimatedBudget.toLocaleString()}) exceeds the ₹${settings.executiveApprovalThreshold.toLocaleString()} executive approval threshold.`,
    };
  }
  if (estimatedBudget > 80000) {
    return {
      violation: true,
      reason: `Estimated budget exceeds standard corporate cap of ₹80,000.`,
    };
  }
  return { violation: false };
}

export function validateTravelRequestForm(fields: {
  sourceCity: string;
  destinationCity: string;
  departureDate: string;
  returnDate: string;
  purpose: string;
  estimatedBudget: number;
  emergencyContact: string;
}): { valid: boolean; error?: string } {
  if (!fields.sourceCity.trim()) return { valid: false, error: 'Departure/Source city is required.' };
  if (!fields.destinationCity.trim()) return { valid: false, error: 'Destination city is required.' };
  if (fields.sourceCity.toLowerCase().trim() === fields.destinationCity.toLowerCase().trim()) {
    return { valid: false, error: 'Source and destination cities cannot be the same.' };
  }
  if (!fields.departureDate) return { valid: false, error: 'Departure date is required.' };
  if (!fields.returnDate) return { valid: false, error: 'Return date is required.' };
  if (fields.departureDate > fields.returnDate) {
    return { valid: false, error: 'Return date cannot be earlier than departure date.' };
  }
  if (fields.estimatedBudget <= 0) {
    return { valid: false, error: 'Estimated budget must be greater than zero.' };
  }
  if (!fields.emergencyContact.trim()) {
    return { valid: false, error: 'Emergency contact details are required for corporate travel.' };
  }
  return { valid: true };
}
