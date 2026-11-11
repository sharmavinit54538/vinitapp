export type VisitorRole =
  | 'super_admin'
  | 'admin_facilities'
  | 'security_reception'
  | 'security_supervisor'
  | 'host_employee'
  | 'approver'
  | 'auditor'
  | 'visitor';

export type VisitorModuleId =
  | 'dashboard'
  | 'pre-registration'
  | 'walk-in'
  | 'kiosk'
  | 'passes'
  | 'reception-desk'
  | 'host-approvals'
  | 'visitor-types'
  | 'watchlist'
  | 'documents-nda'
  | 'vehicles-parking'
  | 'contractors-deliveries'
  | 'area-access'
  | 'material-gate-pass'
  | 'health-safety'
  | 'evacuation'
  | 'communications'
  | 'approvals'
  | 'reports'
  | 'settings'
  | 'audit-logs'
  | 'notifications'
  | 'host-portal'
  | 'visitor-portal';

export interface VisitorPaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedVisitorResponse<T> {
  items: T[];
  meta: VisitorPaginationMeta;
}

export type VisitorTypeCategory =
  | 'Guest'
  | 'InterviewCandidate'
  | 'Vendor'
  | 'Contractor'
  | 'Delivery'
  | 'Auditor'
  | 'VIP'
  | 'Government';

// 1. Visitor Dashboard (Live Status)
export interface VisitorDashboardKpis {
  expectedToday: number;
  currentlyInside: number;
  checkedInToday: number;
  checkedOutToday: number;
  pendingApprovals: number;
  overstays: number;
  noShows: number;
  blacklistedAttempts: number;
  avgVisitDurationMinutes: number;
}

export interface WhoIsInsideEntry {
  id: string;
  visitorName: string;
  visitorType: VisitorTypeCategory;
  hostName: string;
  locationBuilding: string;
  zoneName: string;
  checkedInAt: string;
  expectedOutAt: string;
  isOverstay: boolean;
}

export interface VisitorAlertEntry {
  id: string;
  alertType: 'Overstay' | 'WatchlistHit' | 'UnapprovedArrival' | 'EvacuationActive';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  module: VisitorModuleId;
  createdAt: string;
}

export interface VisitorDashboardResponse {
  kpis: VisitorDashboardKpis;
  whoIsInside: WhoIsInsideEntry[];
  locationOccupancy: {
    locationName: string;
    currentCount: number;
    maxCapacity: number;
  }[];
  upcomingArrivals: {
    id: string;
    visitorName: string;
    hostName: string;
    scheduledTime: string;
    visitorType: VisitorTypeCategory;
  }[];
  alerts: VisitorAlertEntry[];
}

// 2. Pre-Registration / Invitations
export interface VisitorInvitationRecord {
  id: string;
  inviteCode: string;
  visitorName: string;
  maskedEmail: string;
  maskedPhone: string;
  visitorType: VisitorTypeCategory;
  purpose: string;
  hostName: string;
  locationBuilding: string;
  windowStart: string;
  windowEnd: string;
  recurringPattern?: 'OneTime' | 'Daily' | 'Weekly' | 'LongTermContractor';
  ndaRequired: boolean;
  status: 'Sent' | 'Viewed' | 'Registered' | 'Arrived' | 'Expired' | 'Cancelled';
}

export interface CreateVisitorInvitationPayload {
  visitorName: string;
  email: string;
  phone: string;
  company: string;
  visitorType: VisitorTypeCategory;
  purpose: string;
  locationBuilding: string;
  allowedAreas: string[];
  windowStart: string;
  windowEnd: string;
  recurringPattern: 'OneTime' | 'Daily' | 'Weekly' | 'LongTermContractor';
  vehicleNumber?: string;
  ndaRequired: boolean;
}

// 3. Walk-in Registration
export interface WalkInRegistrationRecord {
  id: string;
  registrationCode: string;
  visitorName: string;
  maskedPhone: string;
  company: string;
  visitorType: VisitorTypeCategory;
  purpose: string;
  hostName: string;
  ocrConfidencePct: number;
  returningVisitorMatched: boolean;
  hostApprovalStatus: 'PendingHost' | 'Approved' | 'EscalatedToDelegate' | 'Declined';
  createdAt: string;
}

export interface CreateWalkInRegistrationPayload {
  visitorName: string;
  phone: string;
  email: string;
  company: string;
  visitorType: VisitorTypeCategory;
  purpose: string;
  hostEmployeeCode: string;
  idDocumentType: string;
  idDocumentNumber: string;
  consentAccepted: boolean;
}

// 4. Self Check-in Kiosk Mode
export interface KioskDeviceRecord {
  id: string;
  kioskCode: string;
  locationLobby: string;
  status: 'Online' | 'Offline' | 'LockedDown';
  idleTimeoutSeconds: number;
  printerStatus: 'Ready' | 'PaperLow' | 'Offline';
  lastHeartbeatAt: string;
}

// 5. Visitor QR / Pass Management
export interface VisitorPassRecord {
  id: string;
  passCode: string;
  visitorName: string;
  visitorType: VisitorTypeCategory;
  badgeColorHex: string;
  allowedAreas: string[];
  validFrom: string;
  validUntil: string;
  status: 'Active' | 'Expired' | 'Revoked' | 'LostReported';
}

// 6. Check-in & Check-out (Reception Desk)
export interface ReceptionDeskEntryRecord {
  id: string;
  passCode: string;
  visitorName: string;
  maskedPhone: string;
  visitorType: VisitorTypeCategory;
  hostName: string;
  checkInAt?: string;
  checkOutAt?: string;
  expectedOutAt: string;
  isOverstay: boolean;
  badgeReturned: boolean;
  status: 'Expected' | 'CheckedIn' | 'CheckedOut' | 'ForcedOut';
}

// 7. Host Notification & Approval
export interface HostApprovalRequestRecord {
  id: string;
  requestCode: string;
  visitorName: string;
  company: string;
  purpose: string;
  hostName: string;
  channelNotified: 'Email' | 'InApp' | 'WhatsApp' | 'SMS';
  timeoutMinutesRemaining: number;
  escalatedToDelegate: boolean;
  status: 'AwaitingHost' | 'Accepted' | 'Declined' | 'Rescheduled';
}

// 8. Visitor Types & Purpose Master
export interface VisitorTypeMasterRecord {
  id: string;
  code: string;
  category: VisitorTypeCategory;
  defaultPurpose: string;
  requireIdScan: boolean;
  requireNdaSign: boolean;
  requirePhoto: boolean;
  requireEscort: boolean;
  requireHostApproval: boolean;
  maxDurationHours: number;
  badgeColor: string;
  effectiveFrom: string;
}

export interface CreateVisitorTypeMasterPayload {
  code: string;
  category: VisitorTypeCategory;
  defaultPurpose: string;
  requireIdScan: boolean;
  requireNdaSign: boolean;
  requirePhoto: boolean;
  requireEscort: boolean;
  requireHostApproval: boolean;
  maxDurationHours: number;
  badgeColor: string;
  effectiveFrom: string;
}

// 9. Watchlist, Blacklist & Screening
export interface WatchlistRecord {
  id: string;
  personFullName: string;
  maskedIdentifier: string;
  severityType: 'Blacklisted' | 'SecurityWatch' | 'RestrictedVendor';
  reason: string;
  scopeLocation: string;
  validUntil: string;
  hitCount: number;
  status: 'Active' | 'OverriddenWithApproval' | 'Expired';
}

export interface CreateWatchlistPayload {
  personFullName: string;
  idOrPhoneIdentifier: string;
  severityType: 'Blacklisted' | 'SecurityWatch' | 'RestrictedVendor';
  reason: string;
  scopeLocation: string;
  validUntil: string;
}

// 10. Document, ID Capture & NDA / E-Sign
export interface VisitorDocumentNdaRecord {
  id: string;
  visitorPassCode: string;
  visitorName: string;
  idType: string;
  maskedIdNumber: string;
  maskedPhone: string;
  ndaPolicyVersion: string;
  ndaSignedStatus: 'Signed' | 'PendingSignature' | 'Waived';
  retentionPurgeDate: string;
}

// 11. Vehicle & Parking Management
export interface VehicleParkingRecord {
  id: string;
  vehiclePlateNumber: string;
  vehicleType: 'Car' | 'TwoWheeler' | 'DeliveryVan' | 'HeavyTruck';
  driverName: string;
  allocatedSlotCode: string;
  anprVerified: boolean;
  entryAt: string;
  exitAt?: string;
  parkingStatus: 'ParkedInside' | 'OverstayInParking' | 'Exited';
}

export interface CreateVehicleParkingPayload {
  vehiclePlateNumber: string;
  vehicleType: 'Car' | 'TwoWheeler' | 'DeliveryVan' | 'HeavyTruck';
  driverName: string;
  allocatedSlotCode: string;
  visitorPassCode: string;
}

// 12. Contractor / Vendor / Delivery Management
export interface ContractorDeliveryRecord {
  id: string;
  recordCategory: 'ContractorWorkPermit' | 'VendorVisit' | 'CourierDelivery';
  vendorOrCourierCompany: string;
  contactOrWorkerName: string;
  workPermitOrAwbCode: string;
  insuranceAndSafetyValid: boolean;
  recipientEmployeeName: string;
  handoverStatus: 'AtGate' | 'SafetyVerified' | 'HandedOver' | 'Completed';
}

export interface CreateContractorDeliveryPayload {
  recordCategory: 'ContractorWorkPermit' | 'VendorVisit' | 'CourierDelivery';
  vendorOrCourierCompany: string;
  contactOrWorkerName: string;
  workPermitOrAwbCode: string;
  insuranceAndSafetyValid: boolean;
  recipientEmployeeName: string;
}

// 13. Meeting Room & Area Access Control
export interface AreaAccessZoneRecord {
  id: string;
  zoneCode: string;
  zoneName: string;
  securityLevel: 'LobbyPublic' | 'OfficeFloor' | 'RAndDLab' | 'ServerRoomRestricted';
  linkedMeetingRoom?: string;
  escortRequired: boolean;
  liveOccupancyCount: number;
  turnstileStatus: 'Connected' | 'ManualOverride';
}

// 14. Asset / Material Gate Pass
export interface MaterialGatePassRecord {
  id: string;
  gatePassCode: string;
  movementDirection: 'Inward' | 'Outward';
  returnableType: 'Returnable' | 'NonReturnable';
  itemDescription: string;
  serialNumber: string;
  carriedByVisitorName: string;
  expectedReturnDate?: string;
  status: 'PendingApproval' | 'GateVerified' | 'Returned' | 'OverdueReturn';
}

export interface CreateMaterialGatePassPayload {
  movementDirection: 'Inward' | 'Outward';
  returnableType: 'Returnable' | 'NonReturnable';
  itemDescription: string;
  serialNumber: string;
  carriedByVisitorName: string;
  expectedReturnDate?: string;
}

// 15. Health, Safety & Compliance Declarations
export interface HealthSafetyDeclarationRecord {
  id: string;
  visitorPassCode: string;
  visitorName: string;
  safetyInductionVideoCompleted: boolean;
  ppeChecklistVerified: boolean;
  temperatureNote: string;
  complianceStatus: 'ClearedForEntry' | 'InductionPending' | 'RestrictedEntry';
  submittedAt: string;
}

export interface CreateHealthSafetyDeclarationPayload {
  visitorPassCode: string;
  visitorName: string;
  safetyInductionVideoCompleted: boolean;
  ppeChecklistVerified: boolean;
  temperatureNote: string;
}

// 16. Emergency & Evacuation (Live Roll-Call)
export interface EvacuationRollCallPerson {
  id: string;
  fullName: string;
  personCategory: 'Visitor' | 'Contractor' | 'EmployeeHost';
  lastKnownZone: string;
  assemblyPoint: string;
  status: 'SafeAtAssembly' | 'MissingUnaccounted';
}

export interface EmergencyEvacuationStatusResponse {
  activeMode: 'Normal' | 'EmergencyActive' | 'DrillActive';
  startedAt?: string;
  totalInsideCount: number;
  safeCount: number;
  missingCount: number;
  rollCallList: EvacuationRollCallPerson[];
}

// 17. Visitor Communication & Notifications
export interface VisitorCommunicationTemplateRecord {
  id: string;
  templateCode: string;
  title: string;
  channel: 'Email' | 'SMS' | 'WhatsApp' | 'InApp';
  deliveryRatePct: number;
  avgFeedbackRating: number;
}

// 18. Approvals Workflow
export interface VisitorApprovalWorkflowItem {
  id: string;
  approvalCategory:
    | 'VisitorVisit'
    | 'RestrictedAreaAccess'
    | 'BlacklistOverride'
    | 'MaterialGatePass'
    | 'ContractorOnboarding'
    | 'LongTermPass'
    | 'AfterHoursVisit';
  referenceCode: string;
  requestedBy: string;
  summary: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Delegated';
  submittedAt: string;
}

// 19. Reports & Analytics
export interface VisitorReportRunResponse {
  reportKey: string;
  generatedAt: string;
  columns: string[];
  rows: Record<string, string | number>[];
}

// 20. Settings & Automation Rules
export interface VisitorAutomationRuleRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  enabled: boolean;
  lastRunAt?: string;
  lastRunStatus?: 'Success' | 'Warning' | 'Idle';
}

export interface VisitorIntegrationStatusRecord {
  key:
    | 'EmailSMTP'
    | 'SMSWhatsApp'
    | 'CalendarInvite'
    | 'AccessTurnstiles'
    | 'BadgePrinter'
    | 'ANPRCamera'
    | 'HRMSDirectory'
    | 'GuestWiFiITSM';
  label: string;
  connected: boolean;
  lastSyncAt: string;
}

export interface VisitorSettingsResponse {
  maxVisitDurationHours: number;
  piiRetentionDays: number;
  dpdpGdprMaskingEnabled: boolean;
  kioskIdleResetSeconds: number;
  automationRules: VisitorAutomationRuleRecord[];
  integrations: VisitorIntegrationStatusRecord[];
}

// 21. Audit Logs
export interface VisitorAuditLogRecord {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: VisitorRole;
  action: string;
  entityType: string;
  beforeSummary: string;
  afterSummary: string;
  ipOrKioskId: string;
}

// 22. Notifications
export interface VisitorNotificationRecord {
  id: string;
  eventType:
    | 'VisitorArrived'
    | 'ApprovalPending'
    | 'OverstayDetected'
    | 'WatchlistHit'
    | 'PassExpiring'
    | 'EmergencyAlert';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// 23. Host / Employee Portal
export interface HostEmployeePortalWorkspaceResponse {
  myVisitorsToday: ReceptionDeskEntryRecord[];
  myActiveInvitations: VisitorInvitationRecord[];
  pendingArrivalApprovals: HostApprovalRequestRecord[];
}

// 24. Visitor Portal (Public Pre-Registration & Pass)
export interface PublicVisitorPortalResponse {
  passCode: string;
  visitorName: string;
  hostName: string;
  locationDirections: string;
  parkingSlotInfo: string;
  ndaSigned: boolean;
  healthCleared: boolean;
  status: 'PreRegIncomplete' | 'PassIssuedReady' | 'CheckedOut';
}
