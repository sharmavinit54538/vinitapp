# Visitor Management REST API Contract (`docs/visitors-api-contract.md`)

Base Path: `${API_BASE_URL}/api/v1/visitors`  
Authentication: `Authorization: Bearer <access_token>` (sourced from `authClient.getAccessToken()` in `lib/auth-api.ts`; public visitor portal endpoints accept a short-lived `X-Visitor-Portal-Token` header).

All endpoints listed below are **required from backend** (or linked to existing Employee Directory, Recruitment, Asset Management, and Meeting Room endpoints). The frontend strictly consumes these endpoints through `src/services/visitors/*` with **zero mock/fake/hardcoded data**.

## Standard Response Envelope & Error Format
- Paginated responses return `PaginatedVisitorResponse<T>`:
  `{ items: T[], meta: { page, pageSize, totalItems, totalPages } }`
- Error responses return HTTP `400 | 401 | 403 | 404 | 409 | 422 | 500`:
  `{ error: { code: string, message: string, details?: Record<string, unknown> } }`

## Role-Based Access Control (RBAC) Roles
- `super_admin` (Super Admin)
- `admin_facilities` (Admin / Facilities)
- `security_reception` (Security / Reception)
- `security_supervisor` (Security Supervisor)
- `host_employee` (Host / Employee)
- `approver` (Approver)
- `auditor` (Auditor)
- `visitor` (Visitor — Public Portal only)

---

## 1. Visitor Dashboard (Live Status)
- **GET** `/dashboard/live`
  - Query: `dateRange?`, `location?`, `visitorType?`, `hostId?`, `department?`
  - Response: `VisitorDashboardResponse` (KPIs: expectedToday, currentlyInside, checkedInToday, checkedOutToday, pendingApprovals, overstays, noShows, blacklistedAttempts, avgVisitDurationMinutes; whoIsInside, locationOccupancy, upcomingArrivals, hourlyFootfall, visitorTypeDistribution, hostWiseVisits, alerts)
  - Permissions: `super_admin`, `admin_facilities`, `security_reception`, `security_supervisor`, `host_employee`, `approver`, `auditor`

## 2. Pre-Registration / Invitations
- **GET** `/invitations`
  - Query: `status?`, `location?`, `page?`, `pageSize?`
  - Response: `PaginatedVisitorResponse<VisitorInvitationRecord>`
- **POST** `/invitations`
  - Body: `CreateVisitorInvitationPayload`
  - Response: `VisitorInvitationRecord`
- **POST** `/invitations/bulk-import`
  - Body: `FormData` (`file`: CSV/XLSX)
  - Response: `{ validCount: number, errorCount: number, previewBatchId: string }`
- **POST** `/invitations/:id/action`
  - Body: `{ action: 'resend' | 'cancel' | 'reschedule', reason?: string, newWindowStart?: string, newWindowEnd?: string }`
  - Response: `VisitorInvitationRecord`

## 3. Visitor Registration (Walk-in)
- **GET** `/walk-ins`
  - Query: `location?`, `search?`
  - Response: `PaginatedVisitorResponse<WalkInRegistrationRecord>`
- **POST** `/walk-ins`
  - Body: `CreateWalkInRegistrationPayload`
  - Response: `WalkInRegistrationRecord`

## 4. Self Check-in Kiosk Mode
- **GET** `/kiosk/devices`
  - Response: `PaginatedVisitorResponse<KioskDeviceRecord>`
- **POST** `/kiosk/session-action`
  - Body: `{ kioskCode: string, actionType: 'qr_scan' | 'otp_verify' | 'walkin_submit' | 'badge_print', tokenOrOtp: string }`
  - Response: `{ verified: boolean, visitorName?: string, badgePassCode?: string, statusMessage: string }`

## 5. Visitor QR / Pass Management
- **GET** `/passes`
  - Query: `status?`, `visitorType?`
  - Response: `PaginatedVisitorResponse<VisitorPassRecord>`
- **POST** `/passes/verify-scan`
  - Body: `{ passCode: string, gateCode: string }`
  - Response: `{ scanResult: 'Valid' | 'Invalid' | 'Expired' | 'Blacklisted', visitorName: string, allowedAreas: string[] }`
- **POST** `/passes/:id/action`
  - Body: `{ action: 'reprint' | 'revoke' | 'report_lost', reason?: string }`
  - Response: `VisitorPassRecord`

## 6. Check-in & Check-out (Reception Desk)
- **GET** `/desk/entries`
  - Query: `status?`, `search?`
  - Response: `PaginatedVisitorResponse<ReceptionDeskEntryRecord>`
- **POST** `/desk/entries/:id/check-action`
  - Body: `{ action: 'check_in' | 'check_out' | 'force_check_out' | 'extend_visit', reason?: string, badgeReturned?: boolean, temperatureNote?: string }`
  - Response: `ReceptionDeskEntryRecord`

## 7. Host Notification & Approval
- **GET** `/host-approvals`
  - Query: `status?`
  - Response: `PaginatedVisitorResponse<HostApprovalRequestRecord>`
- **POST** `/host-approvals/:id/respond`
  - Body: `{ decision: 'Accepted' | 'Declined' | 'Rescheduled', note: string }`
  - Response: `HostApprovalRequestRecord`

## 8. Visitor Types & Purpose Master
- **GET** `/types-master`
  - Response: `PaginatedVisitorResponse<VisitorTypeMasterRecord>`
- **POST** `/types-master`
  - Body: `CreateVisitorTypeMasterPayload`
  - Response: `VisitorTypeMasterRecord`

## 9. Watchlist, Blacklist & Screening
- **GET** `/watchlist`
  - Query: `scope?`, `status?`
  - Response: `PaginatedVisitorResponse<WatchlistRecord>`
- **POST** `/watchlist`
  - Body: `CreateWatchlistPayload`
  - Response: `WatchlistRecord`
- **POST** `/watchlist/:id/override`
  - Body: `{ reason: string, approvedByRole: string }`
  - Response: `WatchlistRecord`

## 10. Document, ID Capture & NDA / E-Sign
- **GET** `/documents-nda`
  - Response: `PaginatedVisitorResponse<VisitorDocumentNdaRecord>`
- **POST** `/documents-nda/:id/reveal-pii`
  - Body: `{ auditReason: string }`
  - Response: `{ unmaskedIdNumber: string, unmaskedPhone: string }`
- **POST** `/documents-nda/sign-nda`
  - Body: `{ visitorPassCode: string, policyVersion: string, signatureHash: string }`
  - Response: `VisitorDocumentNdaRecord`

## 11. Vehicle & Parking Management
- **GET** `/vehicles-parking`
  - Response: `PaginatedVisitorResponse<VehicleParkingRecord>`
- **POST** `/vehicles-parking`
  - Body: `CreateVehicleParkingPayload`
  - Response: `VehicleParkingRecord`

## 12. Contractor / Vendor / Delivery Management
- **GET** `/contractors-deliveries`
  - Query: `category?`
  - Response: `PaginatedVisitorResponse<ContractorDeliveryRecord>`
- **POST** `/contractors-deliveries`
  - Body: `CreateContractorDeliveryPayload`
  - Response: `ContractorDeliveryRecord`

## 13. Meeting Room & Area Access Control
- **GET** `/area-access`
  - Response: `PaginatedVisitorResponse<AreaAccessZoneRecord>`
- **POST** `/area-access/assign`
  - Body: `{ passCode: string, zoneCode: string, escortEmployeeCode?: string, meetingRoomCode?: string }`
  - Response: `AreaAccessZoneRecord`

## 14. Asset / Material Gate Pass
- **GET** `/material-gate-passes`
  - Response: `PaginatedVisitorResponse<MaterialGatePassRecord>`
- **POST** `/material-gate-passes`
  - Body: `CreateMaterialGatePassPayload`
  - Response: `MaterialGatePassRecord`

## 15. Health, Safety & Compliance Declarations
- **GET** `/health-safety`
  - Response: `PaginatedVisitorResponse<HealthSafetyDeclarationRecord>`
- **POST** `/health-safety`
  - Body: `CreateHealthSafetyDeclarationPayload`
  - Response: `HealthSafetyDeclarationRecord`

## 16. Emergency & Evacuation (Live Roll-Call)
- **GET** `/evacuation/roll-call`
  - Response: `EmergencyEvacuationStatusResponse`
- **POST** `/evacuation/trigger`
  - Body: `{ mode: 'Emergency' | 'Drill' | 'StandDown', assemblyPoint: string, confirmationNote: string }`
  - Response: `EmergencyEvacuationStatusResponse`
- **POST** `/evacuation/mark-safe`
  - Body: `{ personId: string, assemblyPoint: string }`
  - Response: `{ markedSafe: boolean }`

## 17. Visitor Communication & Notifications
- **GET** `/communications`
  - Response: `PaginatedVisitorResponse<VisitorCommunicationTemplateRecord>`
- **POST** `/communications/dispatch`
  - Body: `{ templateCode: string, channel: 'Email' | 'SMS' | 'WhatsApp' | 'InApp', targetAudience: string }`
  - Response: `{ queuedCount: number }`

## 18. Approvals Workflow
- **GET** `/approvals`
  - Query: `category?`, `status?`
  - Response: `PaginatedVisitorResponse<VisitorApprovalWorkflowItem>`
- **POST** `/approvals/decide`
  - Body: `{ approvalIds: string[], decision: 'Approved' | 'Rejected' | 'Delegated', comments: string }`
  - Response: `{ processedCount: number }`

## 19. Reports & Analytics (15-Report Catalog)
- **GET** `/reports/:reportKey/run`
  - Query: `location?`, `fromDate?`, `toDate?`
  - Response: `VisitorReportRunResponse`
- **GET** `/reports/:reportKey/export`
  - Query: `format=csv|xlsx|pdf`
  - Response: Binary Blob download

## 20. Settings & Automation Rules (14 Automation Rules + 8 Integrations)
- **GET** `/settings`
  - Response: `VisitorSettingsResponse`
- **PUT** `/settings/automation-rules/:ruleId`
  - Body: `{ enabled: boolean }`
  - Response: `VisitorAutomationRuleRecord`

## 21. Audit Logs
- **GET** `/audit-logs`
  - Query: `actor?`, `action?`, `page?`, `pageSize?`
  - Response: `PaginatedVisitorResponse<VisitorAuditLogRecord>`
- **GET** `/audit-logs/export`
  - Query: `format=csv`
  - Response: Binary CSV Blob

## 22. Notifications
- **GET** `/notifications`
  - Query: `unreadOnly?`
  - Response: `PaginatedVisitorResponse<VisitorNotificationRecord>`
- **POST** `/notifications/mark-read`
  - Body: `{ notificationIds: string[] }`
  - Response: `{ markedCount: number }`

## 23. Host / Employee Portal
- **GET** `/host-portal/workspace`
  - Response: `HostEmployeePortalWorkspaceResponse`

## 24. Visitor Portal (Public Pre-Registration & Pass)
- **GET** `/public-portal/pass`
  - Headers: `X-Visitor-Portal-Token: <short_lived_token>`
  - Response: `PublicVisitorPortalResponse`
- **POST** `/public-portal/complete-prereg`
  - Headers: `X-Visitor-Portal-Token: <short_lived_token>`
  - Body: `{ token: string, ndaAccepted: boolean, healthCleared: boolean, feedbackRating?: number }`
  - Response: `PublicVisitorPortalResponse`
