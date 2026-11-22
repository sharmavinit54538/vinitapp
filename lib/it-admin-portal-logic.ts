import { Ofc360Role } from './auth-schemas';
import { AnnouncementItem } from './hr-dashboard-logic';
import {
  EmployeePayslip,
  LeaveBalanceItem,
  getDefaultAnnouncementsForEmployee,
} from './employee-portal-logic';

export type ItAdminBottomTab =
  | 'home'
  | 'assets'
  | 'tickets'
  | 'users_rbac'
  | 'more';

export type ItAdminHomeSubTab =
  | 'overview'
  | 'assets'
  | 'helpdesk'
  | 'access_security';

export type ItAdminMoreModuleId =
  | 'offboarding'
  | 'audit_logs'
  | 'integrations'
  | 'self_service'
  | 'announcements'
  | 'profile';

export type ItAssetCategory =
  | 'Laptop'
  | 'Monitor'
  | 'Smartphone'
  | 'Access Card'
  | 'Biometric Terminal'
  | 'Software License';

export type ItAssetStatus = 'Available' | 'Assigned' | 'In Repair' | 'Retired';

export type ItAssetCondition = 'Mint' | 'Good' | 'Fair' | 'Faulty';

export interface ItRepairRecord {
  id: string;
  vendor: string;
  issueSummary: string;
  repairStatus: 'Diagnosing' | 'With Vendor' | 'Parts Ordered' | 'Completed';
  costInr: number;
  loggedAt: string;
}

export interface ItAssetItem {
  id: string;
  assetTag: string;
  category: ItAssetCategory;
  brandModel: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  condition: ItAssetCondition;
  status: ItAssetStatus;
  assignedToEmployeeId?: string;
  assignedToName?: string;
  assignedDepartment?: string;
  location: string;
  qrPayload: string;
  repairLogs: ItRepairRecord[];
}

export type ItTicketStatus =
  | 'Open'
  | 'In Progress'
  | 'Waiting on User'
  | 'Resolved';

export type ItTicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface ItTicketMessage {
  id: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
  isInternalNote: boolean;
}

export interface ItHelpdeskTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: 'Hardware' | 'VPN & Network' | 'Email & SSO' | 'Biometric Sync' | 'Software Access';
  priority: ItTicketPriority;
  status: ItTicketStatus;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  relatedAssetTag?: string;
  assignedToId?: string;
  assignedToName?: string;
  slaCountdownHours: number;
  slaTargetLabel: string;
  createdAt: string;
  messages: ItTicketMessage[];
}

export interface ItUserAccount {
  id: string;
  employeeId: string;
  fullName: string;
  email: string;
  department: string;
  role: Ofc360Role;
  accountStatus: 'Active' | 'Suspended' | 'Pending Setup';
  mfaEnabled: boolean;
  biometricEnrolled: boolean;
  toolsProvisioned: string[];
  activeSessionsCount: number;
  lastActiveAt: string;
  forcePasswordResetPending?: boolean;
}

export interface ItNewJoinerSetupItem {
  id: string;
  employeeId: string;
  fullName: string;
  department: string;
  designation: string;
  joiningDate: string;
  officialEmail: string;
  requestedHardware: string;
  emailCreated: boolean;
  ssoProvisioned: boolean;
  biometricSynced: boolean;
  hardwareIssued: boolean;
  status: 'Pending Setup' | 'Completed';
}

export interface ItOffboardingClearanceItem {
  id: string;
  employeeId: string;
  fullName: string;
  department: string;
  lastWorkingDay: string;
  assignedAssetIds: string[];
  assignedAssetLabels: string[];
  returnedAssetIds: string[];
  ssoRevoked: boolean;
  emailArchived: boolean;
  badgeDeactivated: boolean;
  clearanceStatus: 'Pending IT Clearance' | 'Cleared';
  signedOffBy?: string;
  signedOffAt?: string;
}

export interface ItSecurityPolicyConfig {
  enforceMfaAllUsers: boolean;
  enforceMfaAdminsOnly: boolean;
  minPasswordLength: 8 | 12 | 14;
  passwordRotationDays: 60 | 90 | 180;
  ipAllowlistEnabled: boolean;
  allowedIpCidrs: string;
  sessionTimeoutMinutes: 30 | 60 | 240;
}

export interface ItAuditLogItem {
  id: string;
  category: 'Asset' | 'Access & RBAC' | 'Security' | 'Clearance' | 'Helpdesk';
  actorName: string;
  action: string;
  target: string;
  timestamp: string;
  severity: 'Info' | 'Warning' | 'Critical';
}

export interface ItIntegrationItem {
  id: string;
  name: string;
  category: 'Identity / SSO' | 'Messaging' | 'Hardware / Biometric' | 'Endpoint MDM';
  status: 'Connected' | 'Sync Warning' | 'Paused';
  endpointOrTenant: string;
  lastSyncedAt: string;
}

export interface ItAdminProfileData {
  itAdminId: string;
  fullName: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  location: string;
  avatarInitials: string;
}

export interface ItSelfServiceState {
  todayStatus: 'Not Checked In' | 'Checked In' | 'Checked Out';
  checkInTime: string | null;
  checkInIso: string | null;
  checkOutTime: string | null;
  workMode: 'Office' | 'WFH';
  locationLabel: string;
  leaveBalances: LeaveBalanceItem[];
  personalLeaveRequests: {
    id: string;
    leaveType: string;
    fromDate: string;
    toDate: string;
    days: number;
    reason: string;
    status: 'Pending' | 'Approved';
  }[];
  payslips: EmployeePayslip[];
}

export interface ItNotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  category: 'Security' | 'Helpdesk' | 'Assets' | 'Clearance';
  read: boolean;
}

export interface ItAdminPortalState {
  profile: ItAdminProfileData;
  assets: ItAssetItem[];
  tickets: ItHelpdeskTicket[];
  users: ItUserAccount[];
  newJoiners: ItNewJoinerSetupItem[];
  offboardingClearances: ItOffboardingClearanceItem[];
  securityPolicy: ItSecurityPolicyConfig;
  auditLogs: ItAuditLogItem[];
  integrations: ItIntegrationItem[];
  announcements: AnnouncementItem[];
  selfService: ItSelfServiceState;
  notifications: ItNotificationItem[];
}

export const IT_CANNED_KB_REPLIES: {
  id: string;
  title: string;
  body: string;
}[] = [
  {
    id: 'KB-01',
    title: 'SSO & Password Reset',
    body: 'I have triggered a forced password reset link to your recovery email and cleared stale SSO tokens. Please sign in again via Okta SSO and re-verify MFA.',
  },
  {
    id: 'KB-02',
    title: 'Corporate VPN & Wi-Fi Fix',
    body: 'Please refresh your WireGuard VPN profile from the IT Self-Service agent (Gateway: blr-gw01.ofc360.internal) and reconnect to OFC360-Corp 5GHz.',
  },
  {
    id: 'KB-03',
    title: 'Biometric & Face Sync',
    body: 'Your biometric template has been resynchronized to HQ Turnstile #2 and mobile geofence services. Retry check-in after 30 seconds.',
  },
];

export const IT_ADMIN_PORTAL_STORAGE_PREFIX = 'ofc360_it_admin_portal_state_v1';

export function getItAdminPortalStorageKey(itAdminId: string): string {
  const cleanId = (itAdminId || 'IT-302').trim().toUpperCase();
  return `${IT_ADMIN_PORTAL_STORAGE_PREFIX}_${cleanId}`;
}

export function computeItAdminDashboardKpis(state: ItAdminPortalState): {
  totalActiveAssets: number;
  assignedAssetsCount: number;
  availableAssetsCount: number;
  inRepairAssetsCount: number;
  openTicketsCount: number;
  highCriticalTicketsCount: number;
  pendingClearancesCount: number;
  pendingJoinersCount: number;
  pendingExitsCount: number;
  activeUsersCount: number;
  mfaAdoptionPct: number;
  expiringWarrantiesCount: number;
} {
  const activeAssets = state.assets.filter((a) => a.status !== 'Retired');
  const assignedAssetsCount = activeAssets.filter((a) => a.status === 'Assigned').length;
  const availableAssetsCount = activeAssets.filter((a) => a.status === 'Available').length;
  const inRepairAssetsCount = activeAssets.filter((a) => a.status === 'In Repair').length;

  const openTickets = state.tickets.filter((t) => t.status !== 'Resolved');
  const highCriticalTicketsCount = openTickets.filter(
    (t) => t.priority === 'Critical' || t.priority === 'High'
  ).length;

  const pendingJoinersCount = state.newJoiners.filter(
    (j) => j.status === 'Pending Setup'
  ).length;
  const pendingExitsCount = state.offboardingClearances.filter(
    (e) => e.clearanceStatus === 'Pending IT Clearance'
  ).length;

  const activeUsers = state.users.filter((u) => u.accountStatus === 'Active');
  const mfaUsers = activeUsers.filter((u) => u.mfaEnabled);
  const mfaAdoptionPct =
    activeUsers.length > 0
      ? Math.round((mfaUsers.length / activeUsers.length) * 100)
      : 100;

  const expiringWarrantiesCount = activeAssets.filter(
    (a) => a.warrantyExpiry <= '2026-12-31'
  ).length;

  return {
    totalActiveAssets: activeAssets.length,
    assignedAssetsCount,
    availableAssetsCount,
    inRepairAssetsCount,
    openTicketsCount: openTickets.length,
    highCriticalTicketsCount,
    pendingClearancesCount: pendingJoinersCount + pendingExitsCount,
    pendingJoinersCount,
    pendingExitsCount,
    activeUsersCount: activeUsers.length,
    mfaAdoptionPct,
    expiringWarrantiesCount,
  };
}

export function validateAssetPayload(input: {
  assetTag: string;
  brandModel: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
}): { valid: boolean; error?: string } {
  if (input.assetTag.trim().length < 3) {
    return { valid: false, error: 'Asset Tag must be at least 3 characters (e.g. OFC-MBP-904).' };
  }
  if (input.brandModel.trim().length < 3) {
    return { valid: false, error: 'Enter Brand & Model (min 3 characters).' };
  }
  if (input.serialNumber.trim().length < 4) {
    return { valid: false, error: 'Enter a valid Serial / License Number (min 4 characters).' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.purchaseDate.trim())) {
    return { valid: false, error: 'Purchase Date must follow YYYY-MM-DD format.' };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.warrantyExpiry.trim())) {
    return { valid: false, error: 'Warranty Expiry must follow YYYY-MM-DD format.' };
  }
  return { valid: true };
}

export function assignAssetToEmployee(
  assets: ItAssetItem[],
  assetId: string,
  employee: { employeeId: string; fullName: string; department: string }
): { valid: boolean; error?: string; assets: ItAssetItem[] } {
  const target = assets.find((a) => a.id === assetId);
  if (!target) {
    return { valid: false, error: 'Selected asset could not be found.', assets };
  }
  if (target.status === 'Retired') {
    return { valid: false, error: 'Retired assets cannot be assigned.', assets };
  }
  if (target.status === 'In Repair') {
    return { valid: false, error: 'Assets currently in repair must be marked repaired before assignment.', assets };
  }
  const updated = assets.map((a) =>
    a.id === assetId
      ? {
          ...a,
          status: 'Assigned' as const,
          assignedToEmployeeId: employee.employeeId,
          assignedToName: employee.fullName,
          assignedDepartment: employee.department,
        }
      : a
  );
  return { valid: true, assets: updated };
}

export function returnAssetToPool(
  assets: ItAssetItem[],
  assetId: string,
  condition: ItAssetCondition = 'Good'
): ItAssetItem[] {
  return assets.map((a) =>
    a.id === assetId
      ? {
          ...a,
          status: condition === 'Faulty' ? 'In Repair' : 'Available',
          condition,
          assignedToEmployeeId: undefined,
          assignedToName: undefined,
          assignedDepartment: undefined,
        }
      : a
  );
}

export function logAssetRepair(
  assets: ItAssetItem[],
  assetId: string,
  payload: {
    vendor: string;
    issueSummary: string;
    costInr: number;
    markCompleted?: boolean;
  }
): { valid: boolean; error?: string; assets: ItAssetItem[] } {
  if (payload.vendor.trim().length < 2) {
    return { valid: false, error: 'Specify repair vendor or service center.', assets };
  }
  if (payload.issueSummary.trim().length < 5) {
    return { valid: false, error: 'Describe the hardware fault (min 5 characters).', assets };
  }
  if (!Number.isFinite(payload.costInr) || payload.costInr < 0) {
    return { valid: false, error: 'Repair cost must be 0 or greater.', assets };
  }
  const todayIso = new Date().toISOString().slice(0, 10);
  const updated = assets.map((a) => {
    if (a.id !== assetId) return a;
    const record: ItRepairRecord = {
      id: `REP-${Date.now().toString().slice(-4)}`,
      vendor: payload.vendor.trim(),
      issueSummary: payload.issueSummary.trim(),
      repairStatus: payload.markCompleted ? 'Completed' : 'With Vendor',
      costInr: payload.costInr,
      loggedAt: todayIso,
    };
    return {
      ...a,
      status: payload.markCompleted
        ? a.assignedToEmployeeId
          ? ('Assigned' as const)
          : ('Available' as const)
        : ('In Repair' as const),
      condition: payload.markCompleted ? ('Good' as const) : ('Faulty' as const),
      repairLogs: [record, ...a.repairLogs],
    };
  });
  return { valid: true, assets: updated };
}

export function applyTicketReplyAndStatus(
  tickets: ItHelpdeskTicket[],
  ticketId: string,
  options: {
    replyText?: string;
    isInternalNote?: boolean;
    nextStatus?: ItTicketStatus;
    assignToAgent?: { id: string; name: string };
    actorName?: string;
  }
): { valid: boolean; error?: string; tickets: ItHelpdeskTicket[] } {
  const cleanReply = (options.replyText || '').trim();
  if (
    options.replyText !== undefined &&
    !options.nextStatus &&
    !options.assignToAgent &&
    cleanReply.length < 2
  ) {
    return { valid: false, error: 'Enter a reply or internal note before sending.', tickets };
  }

  const timeStr = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const updated = tickets.map((t) => {
    if (t.id !== ticketId) return t;
    const nextMessages = cleanReply
      ? [
          ...t.messages,
          {
            id: `TMSG-${Date.now().toString().slice(-4)}`,
            senderName: options.actorName || 'Vikram Deshpande (IT Admin)',
            senderRole: 'it_admin',
            text: cleanReply,
            timestamp: `Today · ${timeStr}`,
            isInternalNote: Boolean(options.isInternalNote),
          },
        ]
      : t.messages;

    return {
      ...t,
      status: options.nextStatus || t.status,
      assignedToId: options.assignToAgent ? options.assignToAgent.id : t.assignedToId,
      assignedToName: options.assignToAgent
        ? options.assignToAgent.name
        : t.assignedToName,
      messages: nextMessages,
    };
  });

  return { valid: true, tickets: updated };
}

export function validateNewUserProvisioning(input: {
  fullName: string;
  email: string;
  employeeId: string;
  department: string;
}): { valid: boolean; error?: string } {
  if (input.fullName.trim().length < 2) {
    return { valid: false, error: 'Enter the user full name (min 2 characters).' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    return { valid: false, error: 'Enter a valid official work email address.' };
  }
  if (input.employeeId.trim().length < 3) {
    return { valid: false, error: 'Enter Employee ID (e.g. EMP-2104).' };
  }
  if (input.department.trim().length < 2) {
    return { valid: false, error: 'Specify department name.' };
  }
  return { valid: true };
}

export function confirmExitAssetReturn(
  clearances: ItOffboardingClearanceItem[],
  assets: ItAssetItem[],
  clearanceId: string,
  assetId: string
): { clearances: ItOffboardingClearanceItem[]; assets: ItAssetItem[] } {
  const nextClearances = clearances.map((c) => {
    if (c.id !== clearanceId) return c;
    const alreadyReturned = c.returnedAssetIds.includes(assetId);
    return {
      ...c,
      returnedAssetIds: alreadyReturned
        ? c.returnedAssetIds
        : [...c.returnedAssetIds, assetId],
    };
  });
  const nextAssets = returnAssetToPool(assets, assetId, 'Good');
  return { clearances: nextClearances, assets: nextAssets };
}

export function signOffOffboardingClearance(
  clearances: ItOffboardingClearanceItem[],
  clearanceId: string,
  signedOffBy: string
): { valid: boolean; error?: string; clearances: ItOffboardingClearanceItem[] } {
  const target = clearances.find((c) => c.id === clearanceId);
  if (!target) {
    return { valid: false, error: 'Clearance record not found.', clearances };
  }
  const missingAssets = target.assignedAssetIds.filter(
    (id) => !target.returnedAssetIds.includes(id)
  );
  if (missingAssets.length > 0) {
    return {
      valid: false,
      error: `Verify return of all ${missingAssets.length} assigned device(s) before IT sign-off.`,
      clearances,
    };
  }
  if (!target.ssoRevoked || !target.emailArchived || !target.badgeDeactivated) {
    return {
      valid: false,
      error: 'Revoke SSO, archive corporate email, and deactivate physical badge before sign-off.',
      clearances,
    };
  }
  const todayIso = new Date().toISOString().slice(0, 10);
  const next = clearances.map((c) =>
    c.id === clearanceId
      ? {
          ...c,
          clearanceStatus: 'Cleared' as const,
          signedOffBy,
          signedOffAt: todayIso,
        }
      : c
  );
  return { valid: true, clearances: next };
}

/**
 * Generates a deterministic 9x9 visual QR pattern matrix from an asset tag payload
 * so every asset renders a distinct, reproducible QR sticker without external URLs.
 */
export function buildDeterministicQrMatrix(payload: string): boolean[][] {
  const size = 9;
  const grid: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );
  let hash = 2166136261;
  for (let i = 0; i < payload.length; i++) {
    hash ^= payload.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  // Finder corners (3x3 corners)
  const corners = [
    [0, 0],
    [0, size - 3],
    [size - 3, 0],
  ];
  for (const [r0, c0] of corners) {
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        grid[r0 + r][c0 + c] = !(r === 1 && c === 1);
      }
    }
  }
  // Deterministic data cells
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inFinder =
        (r < 3 && c < 3) ||
        (r < 3 && c >= size - 3) ||
        (r >= size - 3 && c < 3);
      if (inFinder) continue;
      hash ^= r * 31 + c * 17;
      hash = Math.imul(hash, 16777619);
      grid[r][c] = (Math.abs(hash) % 10) < 5;
    }
  }
  return grid;
}

export function createInitialItAdminPortalState(overrides?: {
  itAdminId?: string;
  fullName?: string;
  email?: string;
}): ItAdminPortalState {
  const itAdminId = overrides?.itAdminId || 'IT-302';
  const fullName = overrides?.fullName || 'Vikram Deshpande';
  const email = overrides?.email || 'itadmin@ofc360.com';
  const initials =
    fullName
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'VD';

  return {
    profile: {
      itAdminId,
      fullName,
      email,
      phone: '+91 98451 80214',
      designation: 'Principal IT & Security Administrator',
      department: 'IT Operations & InfoSec',
      location: 'Bengaluru · Global HQ NOC',
      avatarInitials: initials,
    },
    assets: [
      {
        id: 'AST-101',
        assetTag: 'OFC-MBP-0842',
        category: 'Laptop',
        brandModel: 'Apple MacBook Pro 14" M3 Pro',
        serialNumber: 'C02YM29KMD6R',
        purchaseDate: '2025-02-14',
        warrantyExpiry: '2028-02-13',
        condition: 'Mint',
        status: 'Assigned',
        assignedToEmployeeId: 'EMP-2048',
        assignedToName: 'Rohan Kulkarni',
        assignedDepartment: 'Core Engineering',
        location: 'Bengaluru HQ · Floor 3',
        qrPayload: 'OFC360:ASSET:OFC-MBP-0842',
        repairLogs: [],
      },
      {
        id: 'AST-102',
        assetTag: 'OFC-MBP-0911',
        category: 'Laptop',
        brandModel: 'Apple MacBook Pro 16" M3 Max',
        serialNumber: 'C02ZN81LMD9Q',
        purchaseDate: '2025-04-10',
        warrantyExpiry: '2028-04-09',
        condition: 'Mint',
        status: 'Assigned',
        assignedToEmployeeId: 'EMP-2051',
        assignedToName: 'Kavya Menon',
        assignedDepartment: 'Core Engineering',
        location: 'Remote · Kochi',
        qrPayload: 'OFC360:ASSET:OFC-MBP-0911',
        repairLogs: [],
      },
      {
        id: 'AST-103',
        assetTag: 'OFC-DEL-0318',
        category: 'Monitor',
        brandModel: 'Dell UltraSharp 27" 4K USB-C',
        serialNumber: 'CN-0X9R2P-74261',
        purchaseDate: '2024-07-22',
        warrantyExpiry: '2026-12-15',
        condition: 'Good',
        status: 'Available',
        location: 'HQ IT Cage · Rack B2',
        qrPayload: 'OFC360:ASSET:OFC-DEL-0318',
        repairLogs: [],
      },
      {
        id: 'AST-104',
        assetTag: 'OFC-MBA-0402',
        category: 'Laptop',
        brandModel: 'Apple MacBook Air 13" M3',
        serialNumber: 'C02XL44WMD1T',
        purchaseDate: '2024-11-05',
        warrantyExpiry: '2027-11-04',
        condition: 'Faulty',
        status: 'In Repair',
        assignedToEmployeeId: 'EMP-2057',
        assignedToName: 'Devika Nair',
        assignedDepartment: 'QA Automation',
        location: 'iCare Authorized Service Center',
        qrPayload: 'OFC360:ASSET:OFC-MBA-0402',
        repairLogs: [
          {
            id: 'REP-201',
            vendor: 'iCare Enterprise Bengaluru',
            issueSummary: 'USB-C Thunderbolt port intermittent charging failure',
            repairStatus: 'With Vendor',
            costInr: 4800,
            loggedAt: '2026-11-10',
          },
        ],
      },
      {
        id: 'AST-105',
        assetTag: 'OFC-PHN-0112',
        category: 'Smartphone',
        brandModel: 'Google Pixel 9 Pro (QA Test Unit)',
        serialNumber: '358142091182041',
        purchaseDate: '2025-09-01',
        warrantyExpiry: '2027-08-31',
        condition: 'Good',
        status: 'Assigned',
        assignedToEmployeeId: 'EMP-2072',
        assignedToName: 'Pranav Shetty',
        assignedDepartment: 'Mobile Apps',
        location: 'Bengaluru HQ · Floor 3',
        qrPayload: 'OFC360:ASSET:OFC-PHN-0112',
        repairLogs: [],
      },
      {
        id: 'AST-106',
        assetTag: 'OFC-BIO-0004',
        category: 'Biometric Terminal',
        brandModel: 'ZKTeco SpeedFace V5L Turnstile',
        serialNumber: 'ZKT-SF5L-88912',
        purchaseDate: '2024-03-18',
        warrantyExpiry: '2026-12-20',
        condition: 'Good',
        status: 'Assigned',
        location: 'HQ Main Lobby Gate 2',
        qrPayload: 'OFC360:ASSET:OFC-BIO-0004',
        repairLogs: [],
      },
      {
        id: 'AST-107',
        assetTag: 'OFC-HID-2048',
        category: 'Access Card',
        brandModel: 'HID iCLASS SE RFID Smart Badge',
        serialNumber: 'HID-99812048',
        purchaseDate: '2025-01-20',
        warrantyExpiry: '2029-01-19',
        condition: 'Mint',
        status: 'Assigned',
        assignedToEmployeeId: 'EMP-2048',
        assignedToName: 'Rohan Kulkarni',
        assignedDepartment: 'Core Engineering',
        location: 'Bengaluru HQ',
        qrPayload: 'OFC360:ASSET:OFC-HID-2048',
        repairLogs: [],
      },
      {
        id: 'AST-108',
        assetTag: 'OFC-SWL-2026',
        category: 'Software License',
        brandModel: 'JetBrains All Products Pack (25 Seats)',
        serialNumber: 'JB-ENT-2026-8841',
        purchaseDate: '2025-12-01',
        warrantyExpiry: '2026-12-01',
        condition: 'Mint',
        status: 'Available',
        location: 'Cloud License Vault',
        qrPayload: 'OFC360:ASSET:OFC-SWL-2026',
        repairLogs: [],
      },
      {
        id: 'AST-109',
        assetTag: 'OFC-TP-0190',
        category: 'Laptop',
        brandModel: 'Lenovo ThinkPad X1 Carbon Gen 12',
        serialNumber: 'PF4K8821',
        purchaseDate: '2025-08-12',
        warrantyExpiry: '2028-08-11',
        condition: 'Mint',
        status: 'Available',
        location: 'HQ IT Cage · Shelf A1',
        qrPayload: 'OFC360:ASSET:OFC-TP-0190',
        repairLogs: [],
      },
      {
        id: 'AST-110',
        assetTag: 'OFC-MBP-0615',
        category: 'Laptop',
        brandModel: 'Apple MacBook Pro 14" M2',
        serialNumber: 'C02TM119MD2L',
        purchaseDate: '2023-05-10',
        warrantyExpiry: '2026-05-09',
        condition: 'Good',
        status: 'Assigned',
        assignedToEmployeeId: 'EMP-1988',
        assignedToName: 'Sanjay Kulkarni',
        assignedDepartment: 'Revenue Operations',
        location: 'Mumbai BKC',
        qrPayload: 'OFC360:ASSET:OFC-MBP-0615',
        repairLogs: [],
      },
      {
        id: 'AST-111',
        assetTag: 'OFC-HID-1988',
        category: 'Access Card',
        brandModel: 'HID iCLASS SE RFID Smart Badge',
        serialNumber: 'HID-99811988',
        purchaseDate: '2023-05-10',
        warrantyExpiry: '2027-05-09',
        condition: 'Good',
        status: 'Assigned',
        assignedToEmployeeId: 'EMP-1988',
        assignedToName: 'Sanjay Kulkarni',
        assignedDepartment: 'Revenue Operations',
        location: 'Mumbai BKC',
        qrPayload: 'OFC360:ASSET:OFC-HID-1988',
        repairLogs: [],
      },
    ],
    tickets: [
      {
        id: 'ITK-701',
        ticketNumber: 'IT-2026-701',
        subject: 'Production VPN certificate expired on MacBook Pro',
        description:
          'Unable to connect to blr-gw01 WireGuard tunnel since 8:45 AM; TLS handshake times out.',
        category: 'VPN & Network',
        priority: 'Critical',
        status: 'Open',
        employeeId: 'EMP-2051',
        employeeName: 'Kavya Menon',
        employeeEmail: 'kavya.menon@ofc360.com',
        department: 'Core Engineering',
        relatedAssetTag: 'OFC-MBP-0911',
        slaCountdownHours: 1.5,
        slaTargetLabel: '1h 30m left',
        createdAt: '25m ago',
        messages: [
          {
            id: 'M-701-1',
            senderName: 'Kavya Menon',
            senderRole: 'employee',
            text: 'WireGuard client shows Handshake Failed after macOS 15.2 patch.',
            timestamp: '09:15 AM',
            isInternalNote: false,
          },
        ],
      },
      {
        id: 'ITK-702',
        ticketNumber: 'IT-2026-702',
        subject: 'Biometric Turnstile #2 offline / not syncing punches',
        description:
          'Employees scanning at Lobby Gate 2 are getting timeout errors during morning shift check-in.',
        category: 'Biometric Sync',
        priority: 'Critical',
        status: 'In Progress',
        employeeId: 'EMP-2054',
        employeeName: 'Arjun Rao',
        employeeEmail: 'arjun.rao@ofc360.com',
        department: 'Cloud Infrastructure',
        relatedAssetTag: 'OFC-BIO-0004',
        assignedToId: itAdminId,
        assignedToName: fullName,
        slaCountdownHours: 2.0,
        slaTargetLabel: '2h 00m left',
        createdAt: '50m ago',
        messages: [
          {
            id: 'M-702-1',
            senderName: 'Arjun Rao',
            senderRole: 'employee',
            text: 'Gate 2 turnstile screen says Server Unreachable.',
            timestamp: '08:50 AM',
            isInternalNote: false,
          },
          {
            id: 'M-702-2',
            senderName: fullName,
            senderRole: 'it_admin',
            text: 'Switch PoE port 14 bounced; checking ZKTeco webhook agent.',
            timestamp: '09:05 AM',
            isInternalNote: true,
          },
        ],
      },
      {
        id: 'ITK-703',
        ticketNumber: 'IT-2026-703',
        subject: 'USB-C charging port failure — need loaner laptop',
        description:
          'MacBook Air left port stopped charging; submitted to vendor repair and requesting loaner ThinkPad.',
        category: 'Hardware',
        priority: 'High',
        status: 'Open',
        employeeId: 'EMP-2057',
        employeeName: 'Devika Nair',
        employeeEmail: 'devika.nair@ofc360.com',
        department: 'QA Automation',
        relatedAssetTag: 'OFC-MBA-0402',
        slaCountdownHours: 4.0,
        slaTargetLabel: '4h 00m left',
        createdAt: '2h ago',
        messages: [
          {
            id: 'M-703-1',
            senderName: 'Devika Nair',
            senderRole: 'employee',
            text: 'Battery at 12%, need loaner unit for QA regression today.',
            timestamp: '07:45 AM',
            isInternalNote: false,
          },
        ],
      },
      {
        id: 'ITK-704',
        ticketNumber: 'IT-2026-704',
        subject: 'Provision Okta SSO + Figma Enterprise seat',
        description:
          'Need Figma organization edit license enabled for Q4 design system sprint.',
        category: 'Software Access',
        priority: 'Medium',
        status: 'Waiting on User',
        employeeId: 'EMP-2060',
        employeeName: 'Meera Iyer',
        employeeEmail: 'meera.iyer@ofc360.com',
        department: 'Product Design',
        assignedToId: itAdminId,
        assignedToName: fullName,
        slaCountdownHours: 14.0,
        slaTargetLabel: '14h left',
        createdAt: 'Yesterday',
        messages: [
          {
            id: 'M-704-1',
            senderName: fullName,
            senderRole: 'it_admin',
            text: 'Seat assigned in Okta. Please accept the workspace email invite to activate.',
            timestamp: 'Yesterday · 04:20 PM',
            isInternalNote: false,
          },
        ],
      },
      {
        id: 'ITK-705',
        ticketNumber: 'IT-2026-705',
        subject: 'Shared Mailbox access for payroll-ops@ofc360.com',
        description: 'Delegate mailbox read access verified with HR Manager approval.',
        category: 'Email & SSO',
        priority: 'Low',
        status: 'Resolved',
        employeeId: 'EMP-2048',
        employeeName: 'Rohan Kulkarni',
        employeeEmail: 'rohan.kulkarni@ofc360.com',
        department: 'Core Engineering',
        assignedToId: itAdminId,
        assignedToName: fullName,
        slaCountdownHours: 0,
        slaTargetLabel: 'Met SLA',
        createdAt: '2d ago',
        messages: [],
      },
    ],
    users: [
      {
        id: 'USR-01',
        employeeId: 'EMP-2048',
        fullName: 'Rohan Kulkarni',
        email: 'rohan.kulkarni@ofc360.com',
        department: 'Core Engineering',
        role: 'employee',
        accountStatus: 'Active',
        mfaEnabled: true,
        biometricEnrolled: true,
        toolsProvisioned: ['Google Workspace', 'Okta SSO', 'GitHub Enterprise', 'Slack'],
        activeSessionsCount: 2,
        lastActiveAt: '4m ago',
      },
      {
        id: 'USR-02',
        employeeId: 'MGR-104',
        fullName: 'Ananya Verma',
        email: 'ananya.verma@ofc360.com',
        department: 'Core Engineering',
        role: 'manager',
        accountStatus: 'Active',
        mfaEnabled: true,
        biometricEnrolled: true,
        toolsProvisioned: ['Google Workspace', 'Okta SSO', 'GitHub Enterprise', 'Jira'],
        activeSessionsCount: 3,
        lastActiveAt: '11m ago',
      },
      {
        id: 'USR-03',
        employeeId: 'HR-101',
        fullName: 'Aarav Sharma',
        email: 'aarav.sharma@ofc360.com',
        department: 'People Operations',
        role: 'hr_admin',
        accountStatus: 'Active',
        mfaEnabled: true,
        biometricEnrolled: true,
        toolsProvisioned: ['Google Workspace', 'Okta SSO', 'OFC360 Payroll Admin'],
        activeSessionsCount: 1,
        lastActiveAt: '19m ago',
      },
      {
        id: 'USR-04',
        employeeId: itAdminId,
        fullName,
        email,
        department: 'IT Operations & InfoSec',
        role: 'it_admin',
        accountStatus: 'Active',
        mfaEnabled: true,
        biometricEnrolled: true,
        toolsProvisioned: ['Okta Super Admin', 'Jamf MDM', 'ZKTeco Console', 'AWS IAM'],
        activeSessionsCount: 2,
        lastActiveAt: 'Active now',
      },
      {
        id: 'USR-05',
        employeeId: 'EMP-2057',
        fullName: 'Devika Nair',
        email: 'devika.nair@ofc360.com',
        department: 'QA Automation',
        role: 'employee',
        accountStatus: 'Active',
        mfaEnabled: false,
        biometricEnrolled: true,
        toolsProvisioned: ['Google Workspace', 'Okta SSO', 'BrowserStack'],
        activeSessionsCount: 1,
        lastActiveAt: '35m ago',
      },
      {
        id: 'USR-06',
        employeeId: 'EXC-009',
        fullName: 'Ritu Malhotra',
        email: 'ritu.malhotra@ofc360.com',
        department: 'Executive Leadership',
        role: 'executive',
        accountStatus: 'Active',
        mfaEnabled: true,
        biometricEnrolled: true,
        toolsProvisioned: ['Google Workspace', 'Okta SSO', 'Board Portal'],
        activeSessionsCount: 2,
        lastActiveAt: '1h ago',
      },
    ],
    newJoiners: [
      {
        id: 'NJR-401',
        employeeId: 'EMP-2101',
        fullName: 'Aditi Subramanian',
        department: 'Core Engineering',
        designation: 'Senior Distributed Systems Engineer',
        joiningDate: '2026-11-16',
        officialEmail: 'aditi.subramanian@ofc360.com',
        requestedHardware: 'MacBook Pro 14" + HID Smart Badge',
        emailCreated: true,
        ssoProvisioned: false,
        biometricSynced: false,
        hardwareIssued: false,
        status: 'Pending Setup',
      },
      {
        id: 'NJR-402',
        employeeId: 'EMP-2102',
        fullName: 'Ishaan Kulkarni',
        department: 'Product Design',
        designation: 'Product Designer',
        joiningDate: '2026-11-18',
        officialEmail: 'ishaan.k@ofc360.com',
        requestedHardware: 'MacBook Pro 14" + Dell 27" Monitor',
        emailCreated: false,
        ssoProvisioned: false,
        biometricSynced: false,
        hardwareIssued: false,
        status: 'Pending Setup',
      },
    ],
    offboardingClearances: [
      {
        id: 'OFF-901',
        employeeId: 'EMP-1988',
        fullName: 'Sanjay Kulkarni',
        department: 'Revenue Operations',
        lastWorkingDay: '2026-11-15',
        assignedAssetIds: ['AST-110', 'AST-111'],
        assignedAssetLabels: [
          'MacBook Pro 14" M2 (OFC-MBP-0615)',
          'HID Smart Badge (OFC-HID-1988)',
        ],
        returnedAssetIds: [],
        ssoRevoked: false,
        emailArchived: false,
        badgeDeactivated: false,
        clearanceStatus: 'Pending IT Clearance',
      },
    ],
    securityPolicy: {
      enforceMfaAllUsers: true,
      enforceMfaAdminsOnly: false,
      minPasswordLength: 12,
      passwordRotationDays: 90,
      ipAllowlistEnabled: true,
      allowedIpCidrs: '103.21.58.0/24, 49.207.14.0/24',
      sessionTimeoutMinutes: 60,
    },
    auditLogs: [
      {
        id: 'AUD-9001',
        category: 'Security',
        actorName: fullName,
        action: 'Enforced Okta TOTP MFA Policy',
        target: 'Org-Wide Identity Policy',
        timestamp: 'Today · 09:05 AM',
        severity: 'Info',
      },
      {
        id: 'AUD-9002',
        category: 'Asset',
        actorName: fullName,
        action: 'Logged Vendor Hardware Repair',
        target: 'OFC-MBA-0402 (Devika Nair)',
        timestamp: 'Yesterday · 05:40 PM',
        severity: 'Warning',
      },
      {
        id: 'AUD-9003',
        category: 'Access & RBAC',
        actorName: fullName,
        action: 'Granted VPN Gateway Certificate',
        target: 'EMP-2054 (Arjun Rao)',
        timestamp: 'Nov 10 · 02:15 PM',
        severity: 'Info',
      },
    ],
    integrations: [
      {
        id: 'INT-01',
        name: 'Okta SAML 2.0 & SCIM',
        category: 'Identity / SSO',
        status: 'Connected',
        endpointOrTenant: 'ofc360-prod.okta.com',
        lastSyncedAt: '4 mins ago',
      },
      {
        id: 'INT-02',
        name: 'Google Workspace Admin',
        category: 'Identity / SSO',
        status: 'Connected',
        endpointOrTenant: 'ofc360.com',
        lastSyncedAt: '12 mins ago',
      },
      {
        id: 'INT-03',
        name: 'ZKTeco Biometric Terminals',
        category: 'Hardware / Biometric',
        status: 'Sync Warning',
        endpointOrTenant: 'wss://biometric-gw.ofc360.internal',
        lastSyncedAt: '48 mins ago',
      },
      {
        id: 'INT-04',
        name: 'Jamf Pro Endpoint MDM',
        category: 'Endpoint MDM',
        status: 'Connected',
        endpointOrTenant: 'mdm.ofc360.com',
        lastSyncedAt: '18 mins ago',
      },
    ],
    announcements: getDefaultAnnouncementsForEmployee(),
    selfService: {
      todayStatus: 'Checked In',
      checkInTime: '08:55 AM',
      checkInIso: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      checkOutTime: null,
      workMode: 'Office',
      locationLabel: 'Bengaluru HQ · NOC Floor 2',
      leaveBalances: [
        {
          key: 'earned',
          label: 'Earned Leave',
          code: 'EL',
          total: 18,
          used: 3,
          remaining: 15,
          accrualNote: '+1.5 days / month',
        },
        {
          key: 'casual',
          label: 'Casual Leave',
          code: 'CL',
          total: 8,
          used: 1,
          remaining: 7,
          accrualNote: 'Annual credit',
        },
        {
          key: 'sick',
          label: 'Sick Leave',
          code: 'SL',
          total: 8,
          used: 1,
          remaining: 7,
          accrualNote: 'Medical allowance',
        },
      ],
      personalLeaveRequests: [
        {
          id: 'ITLEV-09',
          leaveType: 'Casual Leave',
          fromDate: '2026-12-04',
          toDate: '2026-12-04',
          days: 1,
          reason: 'Personal errand in Pune.',
          status: 'Approved',
        },
      ],
      payslips: [
        {
          id: 'ITPAY-2026-10',
          monthLabel: 'October 2026',
          payPeriod: '01 Oct 2026 – 31 Oct 2026',
          payDate: 'Oct 30, 2026',
          paymentStatus: 'Credited',
          ctcAnnual: 2400000,
          earnings: [
            { label: 'Basic Salary', amount: 98000 },
            { label: 'HRA', amount: 39200 },
            { label: 'On-Call & Security Allowance', amount: 42800 },
          ],
          deductions: [
            { label: 'EPF Contribution', amount: 11760 },
            { label: 'Income Tax (TDS)', amount: 22400 },
            { label: 'Professional Tax', amount: 200 },
          ],
          reimbursements: 2500,
          taxRegime: 'New Regime',
          tdsDeducted: 22400,
          bankAccountMasked: 'ICICI •••• 4419',
        },
      ],
    },
    notifications: [
      {
        id: 'INOT-01',
        title: 'Critical SLA: VPN Certificate & Turnstile #2',
        message: '2 critical IT tickets have less than 2 hours remaining on SLA.',
        timestamp: '12m ago',
        category: 'Helpdesk',
        read: false,
      },
      {
        id: 'INOT-02',
        title: 'Offboarding IT Clearance Due (Nov 15)',
        message: 'Sanjay Kulkarni (EMP-1988) has 2 devices awaiting IT return.',
        timestamp: '45m ago',
        category: 'Clearance',
        read: false,
      },
      {
        id: 'INOT-03',
        title: '2 Licenses/Warranties Expiring Dec 2026',
        message: 'JetBrains 25-Seat Pack & ZKTeco Terminal warranty expire next month.',
        timestamp: '3h ago',
        category: 'Assets',
        read: true,
      },
    ],
  };
}

export function loadItAdminPortalState(overrides?: {
  itAdminId?: string;
  fullName?: string;
  email?: string;
}): ItAdminPortalState {
  const itAdminId = overrides?.itAdminId || 'IT-302';
  const fallback = createInitialItAdminPortalState(overrides);
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(getItAdminPortalStorageKey(itAdminId));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<ItAdminPortalState>;
    return {
      ...fallback,
      ...parsed,
      profile: { ...fallback.profile, ...(parsed.profile || {}) },
      assets: Array.isArray(parsed.assets) ? parsed.assets : fallback.assets,
      tickets: Array.isArray(parsed.tickets) ? parsed.tickets : fallback.tickets,
      users: Array.isArray(parsed.users) ? parsed.users : fallback.users,
      newJoiners: Array.isArray(parsed.newJoiners)
        ? parsed.newJoiners
        : fallback.newJoiners,
      offboardingClearances: Array.isArray(parsed.offboardingClearances)
        ? parsed.offboardingClearances
        : fallback.offboardingClearances,
      securityPolicy: {
        ...fallback.securityPolicy,
        ...(parsed.securityPolicy || {}),
      },
      auditLogs: Array.isArray(parsed.auditLogs)
        ? parsed.auditLogs
        : fallback.auditLogs,
      integrations: Array.isArray(parsed.integrations)
        ? parsed.integrations
        : fallback.integrations,
      announcements: Array.isArray(parsed.announcements)
        ? parsed.announcements
        : fallback.announcements,
      selfService: {
        ...fallback.selfService,
        ...(parsed.selfService || {}),
      },
      notifications: Array.isArray(parsed.notifications)
        ? parsed.notifications
        : fallback.notifications,
    };
  } catch {
    return fallback;
  }
}

export function saveItAdminPortalState(state: ItAdminPortalState): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(
      getItAdminPortalStorageKey(state.profile.itAdminId),
      JSON.stringify(state)
    );
  } catch {
    // Ignore storage quota errors
  }
}
