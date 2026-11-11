import {
  assetHttpClient,
  buildAssetQueryString,
  AssetRequestOptions,
} from './client';
import {
  PaginatedAssetResponse,
  AssetDashboardResponse,
  AssetRegisterRecord,
  CreateAssetPayload,
  Asset360ProfileResponse,
  AssetCategoryRecord,
  CreateAssetCategoryPayload,
  ProcurementOrderRecord,
  CreatePurchaseRequisitionPayload,
  AssetVendorRecord,
  CreateAssetVendorPayload,
  AssetAllocationRecord,
  CreateAssetAllocationPayload,
  EmployeeAssetRequestRecord,
  CreateEmployeeAssetRequestPayload,
  LifecycleAssetHandoffRecord,
  AssetMaintenanceTicketRecord,
  CreateMaintenanceTicketPayload,
  AssetWarrantyRecord,
  SoftwareLicenseRecord,
  CreateSoftwareLicensePayload,
  AssetDepreciationRecord,
  AssetTransferRecord,
  CreateAssetTransferPayload,
  PhysicalAuditCampaignRecord,
  AssetLossDisposalRecord,
  CreateLossDisposalPayload,
  ConsumableStockRecord,
  AssetLocationCostCenterRecord,
  CreateAssetLocationPayload,
  AssetLabelBatchRecord,
  AssetApprovalItem,
  AssetReportRunResponse,
  AssetSettingsResponse,
  AssetAutomationRuleRecord,
  AssetAuditLogRecord,
  AssetNotificationRecord,
  AssetManagerPortalWorkspaceResponse,
  EmployeeAssetPortalWorkspaceResponse,
} from '../../types/assets';

// 1. Asset Dashboard API
export const assetDashboardApi = {
  getSummary: (
    filters?: {
      from?: string;
      to?: string;
      categoryId?: string;
      department?: string;
      location?: string;
      legalEntity?: string;
      vendorId?: string;
    },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<AssetDashboardResponse>(
      'GET',
      `/dashboard/summary${buildAssetQueryString(filters)}`,
      undefined,
      options
    ),
};

// 2. Asset Register (Inventory) API
export const assetRegisterApi = {
  listAssets: (
    params?: {
      page?: number;
      pageSize?: number;
      search?: string;
      category?: string;
      status?: string;
      location?: string;
      condition?: string;
    },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<PaginatedAssetResponse<AssetRegisterRecord>>(
      'GET',
      `/register${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  getAsset360: (id: string, options?: AssetRequestOptions) =>
    assetHttpClient.request<Asset360ProfileResponse>(
      'GET',
      `/register/${encodeURIComponent(id)}`,
      undefined,
      options
    ),
  createAsset: (payload: CreateAssetPayload) =>
    assetHttpClient.request<AssetRegisterRecord>('POST', '/register', payload),
  bulkImportCsv: (formData: FormData) =>
    assetHttpClient.request<{
      validRowsCount: number;
      errorRowsCount: number;
      previewId: string;
    }>('POST', '/register/bulk-import', formData),
  revealSensitive: (id: string) =>
    assetHttpClient.request<{
      assetId: string;
      unmaskedSerialOrImei: string;
      unmaskedCost: number;
    }>('POST', `/register/${encodeURIComponent(id)}/reveal-sensitive`, {}),
  exportRegister: (format: 'csv' | 'xlsx' | 'pdf', category?: string) =>
    assetHttpClient.downloadBlob(
      `/register/export${buildAssetQueryString({ format, category })}`,
      `asset-register.${format}`
    ),
};

// 3. Asset Categories, Types & Custom Fields API
export const assetCategoriesApi = {
  listCategories: (
    params?: { search?: string; depreciationMethod?: string },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<PaginatedAssetResponse<AssetCategoryRecord>>(
      'GET',
      `/categories${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  createCategory: (payload: CreateAssetCategoryPayload) =>
    assetHttpClient.request<AssetCategoryRecord>(
      'POST',
      '/categories',
      payload
    ),
};

// 4. Procurement (Requests, PO, GRN) API
export const assetProcurementApi = {
  listOrders: (
    params?: { stage?: string; vendorId?: string },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<PaginatedAssetResponse<ProcurementOrderRecord>>(
      'GET',
      `/procurement/orders${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  createRequisition: (payload: CreatePurchaseRequisitionPayload) =>
    assetHttpClient.request<ProcurementOrderRecord>(
      'POST',
      '/procurement/requisitions',
      payload
    ),
  recordGrn: (
    id: string,
    payload: {
      receivedQty: number;
      invoiceNumber: string;
      autoCreateAssets: boolean;
    }
  ) =>
    assetHttpClient.request<ProcurementOrderRecord>(
      'POST',
      `/procurement/orders/${encodeURIComponent(id)}/record-grn`,
      payload
    ),
};

// 5. Vendors & Contracts API
export const assetVendorsApi = {
  listVendors: (
    params?: { search?: string; contractStatus?: string },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<PaginatedAssetResponse<AssetVendorRecord>>(
      'GET',
      `/vendors${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  createVendor: (payload: CreateAssetVendorPayload) =>
    assetHttpClient.request<AssetVendorRecord>('POST', '/vendors', payload),
};

// 6. Asset Allocation & Return API
export const assetAllocationApi = {
  listAllocations: (
    params?: { status?: string; department?: string },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<PaginatedAssetResponse<AssetAllocationRecord>>(
      'GET',
      `/allocations${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  allocateAsset: (payload: CreateAssetAllocationPayload) =>
    assetHttpClient.request<AssetAllocationRecord>(
      'POST',
      '/allocations/assign',
      payload
    ),
  returnAsset: (
    id: string,
    payload: {
      conditionOnReturn: 'Good' | 'Damaged' | 'MissingParts';
      damageChargeAmount: number;
      syncRecoveryToPayroll: boolean;
      remarks: string;
    }
  ) =>
    assetHttpClient.request<AssetAllocationRecord>(
      'POST',
      `/allocations/${encodeURIComponent(id)}/return`,
      payload
    ),
};

// 7. Asset Requests (Employee Self-Service) API
export const assetRequestsApi = {
  listRequests: (
    params?: { requestType?: string; status?: string },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<PaginatedAssetResponse<EmployeeAssetRequestRecord>>(
      'GET',
      `/requests${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  submitRequest: (payload: CreateEmployeeAssetRequestPayload) =>
    assetHttpClient.request<EmployeeAssetRequestRecord>(
      'POST',
      '/requests',
      payload
    ),
};

// 8. Onboarding & Offboarding Integration API
export const assetLifecycleIntegrationApi = {
  listHandoffs: (
    params?: { flowType?: string; clearanceStatus?: string },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<PaginatedAssetResponse<LifecycleAssetHandoffRecord>>(
      'GET',
      `/lifecycle-handoffs${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  issueNoDuesCertificate: (id: string) =>
    assetHttpClient.request<LifecycleAssetHandoffRecord>(
      'POST',
      `/lifecycle-handoffs/${encodeURIComponent(id)}/issue-nodues`,
      {}
    ),
  downloadNoDuesPdf: (id: string) =>
    assetHttpClient.downloadBlob(
      `/lifecycle-handoffs/${encodeURIComponent(id)}/nodues-pdf`,
      `asset-no-dues-${id}.pdf`
    ),
};

// 9. Maintenance & Repairs API
export const assetMaintenanceApi = {
  listTickets: (
    params?: { status?: string; maintenanceType?: string },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<
      PaginatedAssetResponse<AssetMaintenanceTicketRecord>
    >(
      'GET',
      `/maintenance/tickets${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  createTicket: (payload: CreateMaintenanceTicketPayload) =>
    assetHttpClient.request<AssetMaintenanceTicketRecord>(
      'POST',
      '/maintenance/tickets',
      payload
    ),
  decideRepairOrReplace: (
    id: string,
    payload: {
      decision: 'Repair' | 'Replace';
      estimatedCost: number;
      claimWarranty: boolean;
    }
  ) =>
    assetHttpClient.request<AssetMaintenanceTicketRecord>(
      'POST',
      `/maintenance/tickets/${encodeURIComponent(id)}/decision`,
      payload
    ),
};

// 10. Warranty, AMC & Insurance API
export const assetWarrantyApi = {
  listWarranties: (
    params?: { coverageType?: string; expiringWithinDays?: number },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<PaginatedAssetResponse<AssetWarrantyRecord>>(
      'GET',
      `/warranties${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  renewCoverage: (
    id: string,
    payload: {
      renewedTillDate: string;
      renewalCost: number;
      policyOrContractRef: string;
    }
  ) =>
    assetHttpClient.request<AssetWarrantyRecord>(
      'POST',
      `/warranties/${encodeURIComponent(id)}/renew`,
      payload
    ),
};

// 11. Software Licenses API
export const assetSoftwareLicensesApi = {
  listLicenses: (
    params?: { complianceStatus?: string; search?: string },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<PaginatedAssetResponse<SoftwareLicenseRecord>>(
      'GET',
      `/software-licenses${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  createLicense: (payload: CreateSoftwareLicensePayload) =>
    assetHttpClient.request<SoftwareLicenseRecord>(
      'POST',
      '/software-licenses',
      payload
    ),
  assignOrRevokeSeat: (
    id: string,
    payload: { action: 'assign' | 'revoke'; employeeCode: string }
  ) =>
    assetHttpClient.request<SoftwareLicenseRecord>(
      'POST',
      `/software-licenses/${encodeURIComponent(id)}/seat-action`,
      payload
    ),
};

// 12. Depreciation & Financials API
export const assetDepreciationApi = {
  listSchedules: (
    params?: { method?: string; period?: string },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<PaginatedAssetResponse<AssetDepreciationRecord>>(
      'GET',
      `/depreciation/schedules${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  runMonthEndDepreciation: (payload: {
    periodMonth: string;
    postToErpGl: boolean;
  }) =>
    assetHttpClient.request<{
      processedAssetsCount: number;
      journalBatchCode: string;
    }>('POST', '/depreciation/run-month-end', payload),
  exportJournalCsv: (periodMonth: string) =>
    assetHttpClient.downloadBlob(
      `/depreciation/export-journal${buildAssetQueryString({
        periodMonth,
        format: 'csv',
      })}`,
      `asset-depreciation-journal-${periodMonth || 'latest'}.csv`
    ),
};

// 13. Asset Transfer API
export const assetTransferApi = {
  listTransfers: (
    params?: { status?: string },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<PaginatedAssetResponse<AssetTransferRecord>>(
      'GET',
      `/transfers${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  createTransfer: (payload: CreateAssetTransferPayload) =>
    assetHttpClient.request<AssetTransferRecord>('POST', '/transfers', payload),
  acknowledgeTransfer: (id: string) =>
    assetHttpClient.request<AssetTransferRecord>(
      'POST',
      `/transfers/${encodeURIComponent(id)}/acknowledge`,
      {}
    ),
};

// 14. Audit & Physical Verification API
export const assetPhysicalAuditApi = {
  listCampaigns: (
    params?: { status?: string; location?: string },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<
      PaginatedAssetResponse<PhysicalAuditCampaignRecord>
    >(
      'GET',
      `/physical-audits${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  createCampaign: (payload: {
    campaignName: string;
    location: string;
    category: string;
    auditorEmployeeCode: string;
  }) =>
    assetHttpClient.request<PhysicalAuditCampaignRecord>(
      'POST',
      '/physical-audits',
      payload
    ),
  submitScanVerification: (
    id: string,
    payload: {
      scannedTagOrQr: string;
      scanMode: 'CameraQR' | 'BarcodeScanner' | 'ManualFallback';
      observedStatus: 'Verified' | 'Missing' | 'LocationMismatch';
    }
  ) =>
    assetHttpClient.request<{
      assetTag: string;
      reconciliationResult: string;
    }>(
      'POST',
      `/physical-audits/${encodeURIComponent(id)}/scan-verify`,
      payload
    ),
};

// 15. Lost, Damaged & Disposal API
export const assetLossDisposalApi = {
  listRecords: (
    params?: { recordType?: string },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<PaginatedAssetResponse<AssetLossDisposalRecord>>(
      'GET',
      `/loss-disposal${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  reportLossOrDisposal: (payload: CreateLossDisposalPayload) =>
    assetHttpClient.request<AssetLossDisposalRecord>(
      'POST',
      '/loss-disposal',
      payload
    ),
  downloadDataWipeCertificate: (id: string) =>
    assetHttpClient.downloadBlob(
      `/loss-disposal/${encodeURIComponent(id)}/data-wipe-certificate`,
      `data-wipe-certificate-${id}.pdf`
    ),
};

// 16. Consumables & Stock API
export const assetConsumablesApi = {
  listConsumables: (
    params?: { lowStockOnly?: boolean; location?: string },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<PaginatedAssetResponse<ConsumableStockRecord>>(
      'GET',
      `/consumables${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  adjustStock: (
    id: string,
    payload: {
      transactionType: 'Issue' | 'Receive';
      quantity: number;
      employeeOrVendorRef: string;
    }
  ) =>
    assetHttpClient.request<ConsumableStockRecord>(
      'POST',
      `/consumables/${encodeURIComponent(id)}/adjust`,
      payload
    ),
};

// 17. Locations & Cost Centers API
export const assetLocationsApi = {
  listLocations: (
    params?: { entity?: string; site?: string },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<
      PaginatedAssetResponse<AssetLocationCostCenterRecord>
    >(
      'GET',
      `/locations${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  createLocation: (payload: CreateAssetLocationPayload) =>
    assetHttpClient.request<AssetLocationCostCenterRecord>(
      'POST',
      '/locations',
      payload
    ),
};

// 18. QR / Barcode / RFID Management API
export const assetQrBarcodeApi = {
  listBatches: (
    params?: { symbology?: string },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<PaginatedAssetResponse<AssetLabelBatchRecord>>(
      'GET',
      `/labels/batches${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  generateBatch: (payload: {
    templateName: string;
    symbology: 'QR' | 'Code128Barcode' | 'RFID_EPC';
    category: string;
    count: number;
  }) =>
    assetHttpClient.request<AssetLabelBatchRecord>(
      'POST',
      '/labels/generate-batch',
      payload
    ),
  scanLookup: (payload: {
    code: string;
    action: 'View' | 'Allocate' | 'Return' | 'Verify';
  }) =>
    assetHttpClient.request<{
      assetTag: string;
      assetName: string;
      currentHolder: string;
      status: string;
    }>('POST', '/labels/scan-lookup', payload),
};

// 19. Approvals Workflow API
export const assetApprovalsApi = {
  listApprovals: (
    params?: { approvalCategory?: string; status?: string },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<PaginatedAssetResponse<AssetApprovalItem>>(
      'GET',
      `/approvals${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  decideApprovals: (payload: {
    approvalIds: string[];
    decision: 'Approved' | 'Rejected' | 'Delegated';
    comments: string;
  }) =>
    assetHttpClient.request<{ processedCount: number }>(
      'POST',
      '/approvals/decide',
      payload
    ),
};

// 20. Reports & Analytics API
export const assetReportsApi = {
  runReport: (
    reportKey: string,
    params?: { from?: string; to?: string; category?: string },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<AssetReportRunResponse>(
      'GET',
      `/reports/${encodeURIComponent(reportKey)}/run${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  exportReport: (reportKey: string, format: 'csv' | 'xlsx' | 'pdf') =>
    assetHttpClient.downloadBlob(
      `/reports/${encodeURIComponent(reportKey)}/export?format=${format}`,
      `asset-report-${reportKey}.${format}`
    ),
};

// 21. Settings & Automation Rules API
export const assetSettingsApi = {
  getSettings: (options?: AssetRequestOptions) =>
    assetHttpClient.request<AssetSettingsResponse>(
      'GET',
      '/settings',
      undefined,
      options
    ),
  toggleAutomationRule: (ruleId: string, enabled: boolean) =>
    assetHttpClient.request<AssetAutomationRuleRecord>(
      'PUT',
      `/settings/automation-rules/${encodeURIComponent(ruleId)}`,
      { enabled }
    ),
};

// 22. Audit Logs API
export const assetAuditLogsApi = {
  listAuditLogs: (
    params?: { actor?: string; action?: string; page?: number; pageSize?: number },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<PaginatedAssetResponse<AssetAuditLogRecord>>(
      'GET',
      `/audit-logs${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  exportAuditLogsCsv: () =>
    assetHttpClient.downloadBlob(
      '/audit-logs/export?format=csv',
      'asset-audit-logs.csv'
    ),
};

// 23. Notifications API
export const assetNotificationsApi = {
  listNotifications: (
    params?: { unreadOnly?: boolean },
    options?: AssetRequestOptions
  ) =>
    assetHttpClient.request<PaginatedAssetResponse<AssetNotificationRecord>>(
      'GET',
      `/notifications${buildAssetQueryString(params)}`,
      undefined,
      options
    ),
  markRead: (notificationIds: string[]) =>
    assetHttpClient.request<{ markedCount: number }>(
      'POST',
      '/notifications/mark-read',
      { notificationIds }
    ),
};

// 24. Manager Portal API
export const assetManagerPortalApi = {
  getWorkspace: (options?: AssetRequestOptions) =>
    assetHttpClient.request<AssetManagerPortalWorkspaceResponse>(
      'GET',
      '/manager-portal/workspace',
      undefined,
      options
    ),
};

// 25. Employee Portal (My Assets) API
export const assetEmployeePortalApi = {
  getWorkspace: (options?: AssetRequestOptions) =>
    assetHttpClient.request<EmployeeAssetPortalWorkspaceResponse>(
      'GET',
      '/employee-portal/me',
      undefined,
      options
    ),
  acknowledgeAsset: (payload: {
    assetTag: string;
    otpOrSignature: string;
    selfAuditVerified: boolean;
  }) =>
    assetHttpClient.request<{ acknowledged: boolean }>(
      'POST',
      '/employee-portal/acknowledge-asset',
      payload
    ),
};
