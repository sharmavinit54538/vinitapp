export type AssetRole =
  | 'super_admin'
  | 'asset_admin'
  | 'it_admin'
  | 'facilities_admin'
  | 'finance'
  | 'procurement'
  | 'hr_admin'
  | 'reporting_manager'
  | 'auditor'
  | 'employee';

export type AssetModuleId =
  | 'dashboard'
  | 'register'
  | 'categories'
  | 'procurement'
  | 'vendors'
  | 'allocation'
  | 'requests'
  | 'lifecycle-integration'
  | 'maintenance'
  | 'warranty'
  | 'licenses'
  | 'depreciation'
  | 'transfers'
  | 'physical-audit'
  | 'loss-disposal'
  | 'consumables'
  | 'locations'
  | 'qr-barcode'
  | 'approvals'
  | 'reports'
  | 'settings'
  | 'audit-logs'
  | 'notifications'
  | 'manager-portal'
  | 'employee-portal';

export interface AssetPaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedAssetResponse<T> {
  items: T[];
  meta: AssetPaginationMeta;
}

export type AssetLifecycleStatus =
  | 'Available'
  | 'Allocated'
  | 'InMaintenance'
  | 'InTransit'
  | 'Lost'
  | 'Damaged'
  | 'Disposed';

export type AssetCondition = 'New' | 'Good' | 'Fair' | 'Damaged';

// 1. Asset Dashboard
export interface AssetDashboardKpis {
  totalAssets: number;
  allocatedAssets: number;
  availableAssets: number;
  underMaintenance: number;
  lostOrDamaged: number;
  pendingRequests: number;
  warrantyExpiringSoon: number;
  overdueReturns: number;
  totalAssetValue: number;
  currentBookValue: number;
}

export interface AssetChartSeriesPoint {
  label: string;
  value: number;
}

export interface AssetSlaAndExpiryAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  module: AssetModuleId;
  expiryOrDueDate: string;
}

export interface AssetDashboardResponse {
  kpis: AssetDashboardKpis;
  categoryDistribution: AssetChartSeriesPoint[];
  departmentAllocation: AssetChartSeriesPoint[];
  assetAgeBuckets: AssetChartSeriesPoint[];
  maintenanceCostTrend: AssetChartSeriesPoint[];
  utilizationRateTrend: AssetChartSeriesPoint[];
  depreciationTrend: AssetChartSeriesPoint[];
  alerts: AssetSlaAndExpiryAlert[];
}

// 2. Asset Register (Inventory)
export interface AssetRegisterRecord {
  id: string;
  assetTag: string;
  name: string;
  category: string;
  make: string;
  model: string;
  maskedSerialNumber: string;
  maskedImei?: string;
  purchaseDate: string;
  vendorName: string;
  maskedPurchaseCost: string;
  bookValueFormatted: string;
  warrantyEndDate: string;
  location: string;
  assignedToName?: string;
  assignedDepartment?: string;
  condition: AssetCondition;
  status: AssetLifecycleStatus;
}

export interface CreateAssetPayload {
  name: string;
  category: string;
  make: string;
  model: string;
  serialNumber: string;
  imei?: string;
  purchaseDate: string;
  vendorName: string;
  purchaseCost: number;
  warrantyEndDate: string;
  location: string;
  condition: AssetCondition;
}

export interface Asset360ProfileResponse {
  asset: AssetRegisterRecord;
  qrPayload: string;
  linkedAccessories: string[];
  allocationHistory: {
    id: string;
    holderName: string;
    allocatedOn: string;
    returnedOn?: string;
  }[];
  maintenanceHistory: {
    id: string;
    summary: string;
    date: string;
    costFormatted: string;
  }[];
}

// 3. Asset Categories, Types & Custom Fields
export interface AssetCategoryRecord {
  id: string;
  code: string;
  name: string;
  parentCategory?: string;
  tagPrefix: string;
  depreciationMethod: 'SLM' | 'WDV' | 'Custom';
  usefulLifeMonths: number;
  eligibleGrades: string[];
  customFields: string[];
  activeAssetsCount: number;
}

export interface CreateAssetCategoryPayload {
  name: string;
  parentCategory?: string;
  tagPrefix: string;
  depreciationMethod: 'SLM' | 'WDV' | 'Custom';
  usefulLifeMonths: number;
  eligibleGrades: string[];
  customFields: string[];
}

// 4. Procurement (Requests, PO, GRN)
export interface ProcurementOrderRecord {
  id: string;
  prNumber: string;
  poNumber?: string;
  grnNumber?: string;
  category: string;
  itemSpecification: string;
  quantity: number;
  vendorName: string;
  totalAmountFormatted: string;
  budgetCheckStatus: 'WithinBudget' | 'RequiresException';
  stage: 'PR' | 'Quotation' | 'PO' | 'GRN' | 'InvoiceMatched';
  autoCreatedAssetsCount: number;
}

export interface CreatePurchaseRequisitionPayload {
  category: string;
  itemSpecification: string;
  quantity: number;
  vendorName: string;
  estimatedUnitCost: number;
  costCenter: string;
}

// 5. Vendors & Contracts
export interface AssetVendorRecord {
  id: string;
  vendorCode: string;
  name: string;
  contactEmail: string;
  categoriesSupplied: string[];
  activeContractsCount: number;
  slaCompliancePct: number;
  amcExpiryDate: string;
  scorecardRating: number;
  status: 'Active' | 'ExpiringSoon' | 'Suspended';
}

export interface CreateAssetVendorPayload {
  name: string;
  contactEmail: string;
  categoriesSupplied: string[];
  amcExpiryDate: string;
}

// 6. Asset Allocation & Return
export interface AssetAllocationRecord {
  id: string;
  assetTag: string;
  assetName: string;
  assigneeEmployeeCode: string;
  assigneeName: string;
  department: string;
  allocatedDate: string;
  expectedReturnDate?: string;
  accessoriesBundled: string[];
  handoverStatus: 'PendingESign' | 'SignedAcknowledged';
  status: 'Active' | 'OverdueReturn' | 'Returned';
  recoveryDeductionAmount?: number;
}

export interface CreateAssetAllocationPayload {
  assetTag: string;
  assigneeEmployeeCode: string;
  expectedReturnDate?: string;
  accessoriesBundled: string[];
  conditionOnIssue: AssetCondition;
  requireESignOtp: boolean;
}

// 7. Asset Requests (Employee Self-Service)
export interface EmployeeAssetRequestRecord {
  id: string;
  requestCode: string;
  employeeName: string;
  requestType: 'New' | 'Replacement' | 'Upgrade' | 'Accessory';
  categoryName: string;
  justification: string;
  eligibilityStatus: 'Eligible' | 'ExceptionApprovalRequired';
  approvalStage: 'ManagerReview' | 'ITReview' | 'Fulfilled' | 'Rejected';
  autoAllocationStatus: 'AutoAllocatedFromStock' | 'QueuedForProcurement' | 'Pending';
  slaHoursRemaining: number;
}

export interface CreateEmployeeAssetRequestPayload {
  requestType: 'New' | 'Replacement' | 'Upgrade' | 'Accessory';
  categoryName: string;
  justification: string;
  urgency: 'Normal' | 'High';
}

// 8. Onboarding & Offboarding Integration
export interface LifecycleAssetHandoffRecord {
  id: string;
  employeeCode: string;
  employeeName: string;
  flowType: 'Onboarding' | 'Offboarding';
  eventDate: string;
  assetsList: string[];
  pendingItemsCount: number;
  recoveryAmountFormatted?: string;
  noDuesCertificateIssued: boolean;
  fnfSyncStatus: 'Synced' | 'PendingClearance';
}

// 9. Maintenance & Repairs
export interface AssetMaintenanceTicketRecord {
  id: string;
  ticketCode: string;
  assetTag: string;
  assetName: string;
  maintenanceType: 'Preventive' | 'Breakdown';
  issueSummary: string;
  vendorName: string;
  downtimeHours: number;
  repairCostFormatted: string;
  warrantyClaimed: boolean;
  decision: 'Pending' | 'Repair' | 'Replace';
  status: 'Open' | 'InProgress' | 'Completed';
}

export interface CreateMaintenanceTicketPayload {
  assetTag: string;
  maintenanceType: 'Preventive' | 'Breakdown';
  issueSummary: string;
  vendorName: string;
  issueReplacementAsset: boolean;
}

// 10. Warranty, AMC & Insurance
export interface AssetWarrantyRecord {
  id: string;
  assetTag: string;
  assetName: string;
  coverageType: 'Warranty' | 'AMC' | 'Insurance';
  providerName: string;
  policyOrContractNumber: string;
  startDate: string;
  expiryDate: string;
  daysRemaining: number;
  alertBucket: 'Active' | '60DayAlert' | '30DayAlert' | '7DayAlert' | 'Expired';
}

// 11. Software Licenses
export interface SoftwareLicenseRecord {
  id: string;
  softwareName: string;
  vendorName: string;
  licenseType: 'PerSeatSaaS' | 'Perpetual' | 'EnterpriseVolume';
  seatsPurchased: number;
  seatsAssigned: number;
  unusedSeats: number;
  annualCostFormatted: string;
  renewalDate: string;
  ssoIntegrationStatus: 'Connected' | 'Manual';
  complianceStatus: 'Compliant' | 'OverUtilized' | 'RenewalDue';
}

export interface CreateSoftwareLicensePayload {
  softwareName: string;
  vendorName: string;
  licenseType: 'PerSeatSaaS' | 'Perpetual' | 'EnterpriseVolume';
  seatsPurchased: number;
  annualCost: number;
  renewalDate: string;
}

// 12. Depreciation & Financials
export interface AssetDepreciationRecord {
  id: string;
  assetTag: string;
  assetName: string;
  method: 'SLM' | 'WDV' | 'Custom';
  capitalizationDate: string;
  originalCostFormatted: string;
  accumulatedDepreciationFormatted: string;
  netBookValueFormatted: string;
  lastMonthEndRunPeriod: string;
  erpGlSyncStatus: 'Posted' | 'PendingBatch';
}

// 13. Asset Transfer
export interface AssetTransferRecord {
  id: string;
  transferCode: string;
  assetTag: string;
  assetName: string;
  transferType: 'EmployeeToEmployee' | 'LocationToLocation' | 'Department' | 'LegalEntity';
  fromTarget: string;
  toTarget: string;
  senderAcknowledged: boolean;
  receiverAcknowledged: boolean;
  status: 'PendingApproval' | 'InTransit' | 'Completed';
}

export interface CreateAssetTransferPayload {
  assetTag: string;
  transferType: 'EmployeeToEmployee' | 'LocationToLocation' | 'Department' | 'LegalEntity';
  fromTarget: string;
  toTarget: string;
  reason: string;
}

// 14. Audit & Physical Verification
export interface PhysicalAuditCampaignRecord {
  id: string;
  campaignCode: string;
  campaignName: string;
  location: string;
  category: string;
  auditorName: string;
  totalAssetsInScope: number;
  verifiedCount: number;
  missingCount: number;
  mismatchCount: number;
  status: 'Active' | 'Reconciling' | 'Closed';
}

// 15. Lost, Damaged & Disposal
export interface AssetLossDisposalRecord {
  id: string;
  assetTag: string;
  assetName: string;
  recordType: 'Lost' | 'Damaged' | 'ScrapDisposal' | 'Buyback' | 'Donation';
  reportedBy: string;
  incidentOrDisposalDate: string;
  policeFirOrWipeCertRef: string;
  writeOffOrDisposalValueFormatted: string;
  dataWipeVerified: boolean;
  status: 'UnderInvestigation' | 'PendingWriteOffApproval' | 'ClosedDisposed';
}

export interface CreateLossDisposalPayload {
  assetTag: string;
  recordType: 'Lost' | 'Damaged' | 'ScrapDisposal' | 'Buyback' | 'Donation';
  reason: string;
  policeFirOrWipeCertRef: string;
  disposalOrRecoveryValue: number;
}

// 16. Consumables & Stock
export interface ConsumableStockRecord {
  id: string;
  skuCode: string;
  itemName: string;
  category: string;
  location: string;
  availableQty: number;
  reorderLevel: number;
  lowStockFlag: boolean;
  autoReorderStatus: 'Idle' | 'AutoPRTriggered';
}

// 17. Locations & Cost Centers
export interface AssetLocationCostCenterRecord {
  id: string;
  entityName: string;
  siteName: string;
  buildingFloorRoom: string;
  costCenterCode: string;
  seatingCapacity: number;
  allocatedAssetsCount: number;
}

export interface CreateAssetLocationPayload {
  entityName: string;
  siteName: string;
  buildingFloorRoom: string;
  costCenterCode: string;
  seatingCapacity: number;
}

// 18. QR / Barcode / RFID Management
export interface AssetLabelBatchRecord {
  id: string;
  batchCode: string;
  templateName: string;
  symbology: 'QR' | 'Code128Barcode' | 'RFID_EPC';
  category: string;
  labelsCount: number;
  rfidReaderStatus: 'Online' | 'Standby';
  generatedAt: string;
}

// 19. Approvals Workflow
export interface AssetApprovalItem {
  id: string;
  approvalCategory:
    | 'ProcurementPO'
    | 'AllocationException'
    | 'AssetTransfer'
    | 'WriteOff'
    | 'Disposal'
    | 'Replacement'
    | 'LicensePurchase';
  referenceCode: string;
  requestedBy: string;
  summary: string;
  levelLabel: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Delegated';
  submittedAt: string;
}

// 20. Reports & Analytics
export interface AssetReportRunResponse {
  reportKey: string;
  generatedAt: string;
  columns: string[];
  rows: Record<string, string | number>[];
}

// 21. Settings & Automation Rules
export interface AssetAutomationRuleRecord {
  id: string;
  code: string;
  name: string;
  description: string;
  enabled: boolean;
  lastRunAt?: string;
  lastRunStatus?: 'Success' | 'Warning' | 'Idle';
}

export interface AssetIntegrationStatusRecord {
  key:
    | 'ITSM'
    | 'SSO_Identity'
    | 'MDM'
    | 'ERP_Accounting'
    | 'Email'
    | 'WhatsApp_SMS'
    | 'Payroll'
    | 'Barcode_RFID';
  label: string;
  connected: boolean;
  lastSyncAt: string;
}

export interface AssetSettingsResponse {
  assetTagFormat: string;
  defaultReturnSlaDays: number;
  retentionMonths: number;
  automationRules: AssetAutomationRuleRecord[];
  integrations: AssetIntegrationStatusRecord[];
}

// 22. Audit Logs
export interface AssetAuditLogRecord {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: AssetRole;
  action: string;
  entityType: string;
  beforeSummary: string;
  afterSummary: string;
  ipAddress: string;
}

// 23. Notifications
export interface AssetNotificationRecord {
  id: string;
  eventType:
    | 'AssetAllocated'
    | 'ReturnDue'
    | 'WarrantyExpiring'
    | 'RequestApproved'
    | 'AuditAssigned'
    | 'LowStock';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

// 24. Manager Portal
export interface AssetManagerPortalWorkspaceResponse {
  teamAssets: AssetAllocationRecord[];
  pendingTeamRequests: EmployeeAssetRequestRecord[];
  reporteesExitClearance: LifecycleAssetHandoffRecord[];
}

// 25. Employee Portal (My Assets)
export interface EmployeeAssetPortalWorkspaceResponse {
  myHardwareAssets: AssetAllocationRecord[];
  mySoftwareLicenses: {
    id: string;
    softwareName: string;
    seatStatus: string;
  }[];
  pendingSelfAuditTags: string[];
  noDuesStatus: 'Clear' | 'AssetsHeld' | 'PendingReturn';
}
