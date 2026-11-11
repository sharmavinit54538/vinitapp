import {
  visitorHttpClient,
  buildVisitorQueryString,
  VisitorRequestOptions,
} from './client';
import {
  PaginatedVisitorResponse,
  VisitorDashboardResponse,
  VisitorInvitationRecord,
  CreateVisitorInvitationPayload,
  WalkInRegistrationRecord,
  CreateWalkInRegistrationPayload,
  KioskDeviceRecord,
  VisitorPassRecord,
  ReceptionDeskEntryRecord,
  HostApprovalRequestRecord,
  VisitorTypeMasterRecord,
  CreateVisitorTypeMasterPayload,
  WatchlistRecord,
  CreateWatchlistPayload,
  VisitorDocumentNdaRecord,
  VehicleParkingRecord,
  CreateVehicleParkingPayload,
  ContractorDeliveryRecord,
  CreateContractorDeliveryPayload,
  AreaAccessZoneRecord,
  MaterialGatePassRecord,
  CreateMaterialGatePassPayload,
  HealthSafetyDeclarationRecord,
  CreateHealthSafetyDeclarationPayload,
  EmergencyEvacuationStatusResponse,
  VisitorCommunicationTemplateRecord,
  VisitorApprovalWorkflowItem,
  VisitorReportRunResponse,
  VisitorSettingsResponse,
  VisitorAutomationRuleRecord,
  VisitorAuditLogRecord,
  VisitorNotificationRecord,
  HostEmployeePortalWorkspaceResponse,
  PublicVisitorPortalResponse,
} from '../../types/visitors';

// 1. Visitor Dashboard (Live Status) API
export const visitorDashboardApi = {
  getLiveSummary: (
    filters?: {
      dateRange?: string;
      location?: string;
      visitorType?: string;
      hostId?: string;
      department?: string;
    },
    options?: VisitorRequestOptions
  ) =>
    visitorHttpClient.request<VisitorDashboardResponse>(
      'GET',
      `/dashboard/live${buildVisitorQueryString(filters)}`,
      undefined,
      options
    ),
};

// 2. Pre-Registration / Invitations API
export const visitorInvitationsApi = {
  listInvitations: (
    params?: {
      status?: string;
      location?: string;
      page?: number;
      pageSize?: number;
    },
    options?: VisitorRequestOptions
  ) =>
    visitorHttpClient.request<PaginatedVisitorResponse<VisitorInvitationRecord>>(
      'GET',
      `/invitations${buildVisitorQueryString(params)}`,
      undefined,
      options
    ),
  createInvitation: (payload: CreateVisitorInvitationPayload) =>
    visitorHttpClient.request<VisitorInvitationRecord>(
      'POST',
      '/invitations',
      payload
    ),
  bulkImportCsv: (formData: FormData) =>
    visitorHttpClient.request<{
      validCount: number;
      errorCount: number;
      previewBatchId: string;
    }>('POST', '/invitations/bulk-import', formData),
  performInviteAction: (
    id: string,
    payload: {
      action: 'resend' | 'cancel' | 'reschedule';
      reason?: string;
      newWindowStart?: string;
      newWindowEnd?: string;
    }
  ) =>
    visitorHttpClient.request<VisitorInvitationRecord>(
      'POST',
      `/invitations/${encodeURIComponent(id)}/action`,
      payload
    ),
};

// 3. Walk-in Registration API
export const visitorWalkInApi = {
  listWalkIns: (
    params?: { location?: string; search?: string },
    options?: VisitorRequestOptions
  ) =>
    visitorHttpClient.request<
      PaginatedVisitorResponse<WalkInRegistrationRecord>
    >(
      'GET',
      `/walk-ins${buildVisitorQueryString(params)}`,
      undefined,
      options
    ),
  registerWalkIn: (payload: CreateWalkInRegistrationPayload) =>
    visitorHttpClient.request<WalkInRegistrationRecord>(
      'POST',
      '/walk-ins',
      payload
    ),
};

// 4. Self Check-in Kiosk Mode API
export const visitorKioskApi = {
  listDevices: (options?: VisitorRequestOptions) =>
    visitorHttpClient.request<PaginatedVisitorResponse<KioskDeviceRecord>>(
      'GET',
      '/kiosk/devices',
      undefined,
      options
    ),
  submitKioskAction: (payload: {
    kioskCode: string;
    actionType: 'qr_scan' | 'otp_verify' | 'walkin_submit' | 'badge_print';
    tokenOrOtp: string;
  }) =>
    visitorHttpClient.request<{
      verified: boolean;
      visitorName?: string;
      badgePassCode?: string;
      statusMessage: string;
    }>('POST', '/kiosk/session-action', payload),
};

// 5. Visitor QR / Pass Management API
export const visitorPassesApi = {
  listPasses: (
    params?: { status?: string; visitorType?: string },
    options?: VisitorRequestOptions
  ) =>
    visitorHttpClient.request<PaginatedVisitorResponse<VisitorPassRecord>>(
      'GET',
      `/passes${buildVisitorQueryString(params)}`,
      undefined,
      options
    ),
  verifyScanAtGate: (payload: { passCode: string; gateCode: string }) =>
    visitorHttpClient.request<{
      scanResult: 'Valid' | 'Invalid' | 'Expired' | 'Blacklisted';
      visitorName: string;
      allowedAreas: string[];
    }>('POST', '/passes/verify-scan', payload),
  performPassAction: (
    id: string,
    payload: { action: 'reprint' | 'revoke' | 'report_lost'; reason?: string }
  ) =>
    visitorHttpClient.request<VisitorPassRecord>(
      'POST',
      `/passes/${encodeURIComponent(id)}/action`,
      payload
    ),
};

// 6. Check-in & Check-out (Reception Desk) API
export const visitorReceptionDeskApi = {
  listEntries: (
    params?: { status?: string; search?: string },
    options?: VisitorRequestOptions
  ) =>
    visitorHttpClient.request<
      PaginatedVisitorResponse<ReceptionDeskEntryRecord>
    >(
      'GET',
      `/desk/entries${buildVisitorQueryString(params)}`,
      undefined,
      options
    ),
  performCheckAction: (
    id: string,
    payload: {
      action: 'check_in' | 'check_out' | 'force_check_out' | 'extend_visit';
      reason?: string;
      badgeReturned?: boolean;
      temperatureNote?: string;
    }
  ) =>
    visitorHttpClient.request<ReceptionDeskEntryRecord>(
      'POST',
      `/desk/entries/${encodeURIComponent(id)}/check-action`,
      payload
    ),
};

// 7. Host Notification & Approval API
export const visitorHostApprovalsApi = {
  listHostApprovals: (
    params?: { status?: string },
    options?: VisitorRequestOptions
  ) =>
    visitorHttpClient.request<
      PaginatedVisitorResponse<HostApprovalRequestRecord>
    >(
      'GET',
      `/host-approvals${buildVisitorQueryString(params)}`,
      undefined,
      options
    ),
  respondToArrival: (
    id: string,
    payload: {
      decision: 'Accepted' | 'Declined' | 'Rescheduled';
      note: string;
    }
  ) =>
    visitorHttpClient.request<HostApprovalRequestRecord>(
      'POST',
      `/host-approvals/${encodeURIComponent(id)}/respond`,
      payload
    ),
};

// 8. Visitor Types & Purpose Master API
export const visitorTypesMasterApi = {
  listTypes: (options?: VisitorRequestOptions) =>
    visitorHttpClient.request<
      PaginatedVisitorResponse<VisitorTypeMasterRecord>
    >('GET', '/types-master', undefined, options),
  createType: (payload: CreateVisitorTypeMasterPayload) =>
    visitorHttpClient.request<VisitorTypeMasterRecord>(
      'POST',
      '/types-master',
      payload
    ),
};

// 9. Watchlist, Blacklist & Screening API
export const visitorWatchlistApi = {
  listWatchlist: (
    params?: { scope?: string; status?: string },
    options?: VisitorRequestOptions
  ) =>
    visitorHttpClient.request<PaginatedVisitorResponse<WatchlistRecord>>(
      'GET',
      `/watchlist${buildVisitorQueryString(params)}`,
      undefined,
      options
    ),
  addWatchlistEntry: (payload: CreateWatchlistPayload) =>
    visitorHttpClient.request<WatchlistRecord>('POST', '/watchlist', payload),
  overrideWatchlistHit: (
    id: string,
    payload: { reason: string; approvedByRole: string }
  ) =>
    visitorHttpClient.request<WatchlistRecord>(
      'POST',
      `/watchlist/${encodeURIComponent(id)}/override`,
      payload
    ),
};

// 10. Document, ID Capture & NDA / E-Sign API
export const visitorDocumentsNdaApi = {
  listDocumentsNda: (options?: VisitorRequestOptions) =>
    visitorHttpClient.request<
      PaginatedVisitorResponse<VisitorDocumentNdaRecord>
    >('GET', '/documents-nda', undefined, options),
  revealMaskedPii: (id: string, auditReason: string) =>
    visitorHttpClient.request<{
      unmaskedIdNumber: string;
      unmaskedPhone: string;
    }>('POST', `/documents-nda/${encodeURIComponent(id)}/reveal-pii`, {
      auditReason,
    }),
  signNda: (payload: {
    visitorPassCode: string;
    policyVersion: string;
    signatureHash: string;
  }) =>
    visitorHttpClient.request<VisitorDocumentNdaRecord>(
      'POST',
      '/documents-nda/sign-nda',
      payload
    ),
};

// 11. Vehicle & Parking Management API
export const visitorVehiclesParkingApi = {
  listVehicles: (options?: VisitorRequestOptions) =>
    visitorHttpClient.request<PaginatedVisitorResponse<VehicleParkingRecord>>(
      'GET',
      '/vehicles-parking',
      undefined,
      options
    ),
  registerVehicle: (payload: CreateVehicleParkingPayload) =>
    visitorHttpClient.request<VehicleParkingRecord>(
      'POST',
      '/vehicles-parking',
      payload
    ),
};

// 12. Contractor / Vendor / Delivery Management API
export const visitorContractorsDeliveriesApi = {
  listRecords: (
    params?: { category?: string },
    options?: VisitorRequestOptions
  ) =>
    visitorHttpClient.request<
      PaginatedVisitorResponse<ContractorDeliveryRecord>
    >(
      'GET',
      `/contractors-deliveries${buildVisitorQueryString(params)}`,
      undefined,
      options
    ),
  createRecord: (payload: CreateContractorDeliveryPayload) =>
    visitorHttpClient.request<ContractorDeliveryRecord>(
      'POST',
      '/contractors-deliveries',
      payload
    ),
};

// 13. Meeting Room & Area Access Control API
export const visitorAreaAccessApi = {
  listZones: (options?: VisitorRequestOptions) =>
    visitorHttpClient.request<PaginatedVisitorResponse<AreaAccessZoneRecord>>(
      'GET',
      '/area-access',
      undefined,
      options
    ),
  assignZoneAccess: (payload: {
    passCode: string;
    zoneCode: string;
    escortEmployeeCode?: string;
    meetingRoomCode?: string;
  }) =>
    visitorHttpClient.request<AreaAccessZoneRecord>(
      'POST',
      '/area-access/assign',
      payload
    ),
};

// 14. Asset / Material Gate Pass API
export const visitorMaterialGatePassApi = {
  listGatePasses: (options?: VisitorRequestOptions) =>
    visitorHttpClient.request<PaginatedVisitorResponse<MaterialGatePassRecord>>(
      'GET',
      '/material-gate-passes',
      undefined,
      options
    ),
  createGatePass: (payload: CreateMaterialGatePassPayload) =>
    visitorHttpClient.request<MaterialGatePassRecord>(
      'POST',
      '/material-gate-passes',
      payload
    ),
};

// 15. Health, Safety & Compliance Declarations API
export const visitorHealthSafetyApi = {
  listDeclarations: (options?: VisitorRequestOptions) =>
    visitorHttpClient.request<
      PaginatedVisitorResponse<HealthSafetyDeclarationRecord>
    >('GET', '/health-safety', undefined, options),
  submitDeclaration: (payload: CreateHealthSafetyDeclarationPayload) =>
    visitorHttpClient.request<HealthSafetyDeclarationRecord>(
      'POST',
      '/health-safety',
      payload
    ),
};

// 16. Emergency & Evacuation (Live Roll-Call) API
export const visitorEvacuationApi = {
  getRollCall: (options?: VisitorRequestOptions) =>
    visitorHttpClient.request<EmergencyEvacuationStatusResponse>(
      'GET',
      '/evacuation/roll-call',
      undefined,
      options
    ),
  triggerMode: (payload: {
    mode: 'Emergency' | 'Drill' | 'StandDown';
    assemblyPoint: string;
    confirmationNote: string;
  }) =>
    visitorHttpClient.request<EmergencyEvacuationStatusResponse>(
      'POST',
      '/evacuation/trigger',
      payload
    ),
  markSafe: (payload: { personId: string; assemblyPoint: string }) =>
    visitorHttpClient.request<{ markedSafe: boolean }>(
      'POST',
      '/evacuation/mark-safe',
      payload
    ),
};

// 17. Visitor Communication & Notifications API
export const visitorCommunicationsApi = {
  listTemplates: (options?: VisitorRequestOptions) =>
    visitorHttpClient.request<
      PaginatedVisitorResponse<VisitorCommunicationTemplateRecord>
    >('GET', '/communications', undefined, options),
  dispatchMessage: (payload: {
    templateCode: string;
    channel: 'Email' | 'SMS' | 'WhatsApp' | 'InApp';
    targetAudience: string;
  }) =>
    visitorHttpClient.request<{ queuedCount: number }>(
      'POST',
      '/communications/dispatch',
      payload
    ),
};

// 18. Approvals Workflow API
export const visitorApprovalsApi = {
  listApprovals: (
    params?: { category?: string; status?: string },
    options?: VisitorRequestOptions
  ) =>
    visitorHttpClient.request<
      PaginatedVisitorResponse<VisitorApprovalWorkflowItem>
    >(
      'GET',
      `/approvals${buildVisitorQueryString(params)}`,
      undefined,
      options
    ),
  decideApprovals: (payload: {
    approvalIds: string[];
    decision: 'Approved' | 'Rejected' | 'Delegated';
    comments: string;
  }) =>
    visitorHttpClient.request<{ processedCount: number }>(
      'POST',
      '/approvals/decide',
      payload
    ),
};

// 19. Reports & Analytics API
export const visitorReportsApi = {
  runReport: (
    reportKey: string,
    params?: { location?: string; fromDate?: string; toDate?: string },
    options?: VisitorRequestOptions
  ) =>
    visitorHttpClient.request<VisitorReportRunResponse>(
      'GET',
      `/reports/${encodeURIComponent(reportKey)}/run${buildVisitorQueryString(params)}`,
      undefined,
      options
    ),
  exportReport: (reportKey: string, format: 'csv' | 'xlsx' | 'pdf') =>
    visitorHttpClient.downloadBlob(
      `/reports/${encodeURIComponent(reportKey)}/export?format=${format}`,
      `visitor-report-${reportKey}.${format}`
    ),
};

// 20. Settings & Automation Rules API
export const visitorSettingsApi = {
  getSettings: (options?: VisitorRequestOptions) =>
    visitorHttpClient.request<VisitorSettingsResponse>(
      'GET',
      '/settings',
      undefined,
      options
    ),
  toggleAutomationRule: (ruleId: string, enabled: boolean) =>
    visitorHttpClient.request<VisitorAutomationRuleRecord>(
      'PUT',
      `/settings/automation-rules/${encodeURIComponent(ruleId)}`,
      { enabled }
    ),
};

// 21. Audit Logs API
export const visitorAuditLogsApi = {
  listAuditLogs: (
    params?: { actor?: string; action?: string; page?: number; pageSize?: number },
    options?: VisitorRequestOptions
  ) =>
    visitorHttpClient.request<PaginatedVisitorResponse<VisitorAuditLogRecord>>(
      'GET',
      `/audit-logs${buildVisitorQueryString(params)}`,
      undefined,
      options
    ),
  exportAuditCsv: () =>
    visitorHttpClient.downloadBlob(
      '/audit-logs/export?format=csv',
      'visitor-audit-logs.csv'
    ),
};

// 22. Notifications API
export const visitorNotificationsApi = {
  listNotifications: (
    params?: { unreadOnly?: boolean },
    options?: VisitorRequestOptions
  ) =>
    visitorHttpClient.request<
      PaginatedVisitorResponse<VisitorNotificationRecord>
    >(
      'GET',
      `/notifications${buildVisitorQueryString(params)}`,
      undefined,
      options
    ),
  markRead: (notificationIds: string[]) =>
    visitorHttpClient.request<{ markedCount: number }>(
      'POST',
      '/notifications/mark-read',
      { notificationIds }
    ),
};

// 23. Host / Employee Portal API
export const visitorHostPortalApi = {
  getWorkspace: (options?: VisitorRequestOptions) =>
    visitorHttpClient.request<HostEmployeePortalWorkspaceResponse>(
      'GET',
      '/host-portal/workspace',
      undefined,
      options
    ),
};

// 24. Visitor Portal (Public Pre-Registration & Pass) API
export const visitorPublicPortalApi = {
  getPublicPass: (shortLivedToken: string, options?: VisitorRequestOptions) =>
    visitorHttpClient.request<PublicVisitorPortalResponse>(
      'GET',
      '/public-portal/pass',
      undefined,
      {
        ...options,
        headers: {
          ...(options?.headers || {}),
          'X-Visitor-Portal-Token': shortLivedToken,
        },
      }
    ),
  completePreReg: (payload: {
    token: string;
    ndaAccepted: boolean;
    healthCleared: boolean;
    feedbackRating?: number;
  }) =>
    visitorHttpClient.request<PublicVisitorPortalResponse>(
      'POST',
      '/public-portal/complete-prereg',
      payload,
      {
        headers: {
          'X-Visitor-Portal-Token': payload.token,
        },
      }
    ),
};
