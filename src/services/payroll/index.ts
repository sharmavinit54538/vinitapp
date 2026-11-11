import {
  payrollHttpClient,
  PayrollRequestOptions,
  PayrollApiError,
  PayrollHttpClient,
  buildQueryString,
  formatPayrollCurrency,
  formatPayrollDate,
  maskSensitiveField,
} from './client';
import {
  PaginatedResponse,
  PayrollQueryParams,
  PayrollDashboardResponse,
  PayCalendarCycle,
  PayrollRunDetail,
  PayrollRunProgressResponse,
  PreRunValidationReport,
  PayrollRunEmployeeSummary,
  PayrollEmployeeDrilldown,
  CreateOffCycleRunPayload,
  PayrollRunVarianceComparison,
  PayrollRunStageCode,
  SalaryComponentItem,
  UpsertSalaryComponentPayload,
  FormulaValidationResponse,
  SalaryStructureTemplate,
  UpsertSalaryStructurePayload,
  CtcPreviewRequestPayload,
  CtcBreakupPreviewResponse,
  EmployeeCompensationRecord,
  SalaryRevisionHistoryItem,
  AssignCompensationPayload,
  BulkUploadValidationPreview,
  AttendanceLopRecord,
  LopOverridePayload,
  VariableInputRecord,
  CreateVariableInputPayload,
  ReimbursementClaimRecord,
  LoanTypeConfig,
  UpsertLoanTypePayload,
  LoanAccountRecord,
  LoanEmiScheduleItem,
  CreateLoanRequestPayload,
  StatutoryComplianceOverview,
  CompanyStatutoryRegistrationPayload,
  Form16EmployeeStatus,
  TaxDeclarationRecord,
  TaxWindowConfigPayload,
  PayrollApprovalRequest,
  PayslipRecord,
  PayslipDetailedView,
  PayslipTemplateConfig,
  DisbursementEmployeeRecord,
  BankReconciliationSummary,
  FnfSettlementRecord,
  InitiateFnfPayload,
  ArrearAdjustmentRecord,
  CreateCorrectionEntryPayload,
  PayrollReportCatalogItem,
  PayrollReportCode,
  PayrollReportDataResponse,
  SavedReportPreset,
  CreateReportPresetPayload,
  PayrollSettingsConfiguration,
  PayrollAuditLogEntry,
  PayrollNotificationItem,
  PayrollNotificationPreferences,
  EssMyPayOverview,
  SubmitEssTaxDeclarationPayload,
  EssBankChangeRequest,
} from '../../types/payroll';

export {
  payrollHttpClient,
  PayrollApiError,
  PayrollHttpClient,
  buildQueryString,
  formatPayrollCurrency,
  formatPayrollDate,
  maskSensitiveField,
};

// 1. Dashboard Service
export const payrollDashboardService = {
  getSummary(
    params?: { cycleId?: string; financialYear?: string },
    options?: PayrollRequestOptions
  ): Promise<PayrollDashboardResponse> {
    return payrollHttpClient.get<PayrollDashboardResponse>(
      '/api/v1/payroll/dashboard/summary',
      { ...options, params }
    );
  },
};

// 2. Pay Calendar & Automated Payroll Run Service
export const payCalendarRunService = {
  getCalendars(
    financialYear?: string,
    options?: PayrollRequestOptions
  ): Promise<PayCalendarCycle[]> {
    return payrollHttpClient.get<PayCalendarCycle[]>(
      '/api/v1/payroll/calendars',
      { ...options, params: { financialYear } }
    );
  },

  getCurrentRun(
    cycleId?: string,
    options?: PayrollRequestOptions
  ): Promise<PayrollRunDetail> {
    return payrollHttpClient.get<PayrollRunDetail>(
      '/api/v1/payroll/runs/current',
      { ...options, params: { cycleId } }
    );
  },

  getRunProgress(
    runId: string,
    options?: PayrollRequestOptions
  ): Promise<PayrollRunProgressResponse> {
    return payrollHttpClient.get<PayrollRunProgressResponse>(
      `/api/v1/payroll/runs/${encodeURIComponent(runId)}/progress`,
      options
    );
  },

  getPreRunValidation(
    runId: string,
    options?: PayrollRequestOptions
  ): Promise<PreRunValidationReport> {
    return payrollHttpClient.get<PreRunValidationReport>(
      `/api/v1/payroll/runs/${encodeURIComponent(runId)}/validation`,
      options
    );
  },

  executeRun(
    runId: string,
    payload: { runType: 'Regular' | 'Off-Cycle' | 'Supplementary'; stepCode?: PayrollRunStageCode }
  ): Promise<PayrollRunDetail> {
    return payrollHttpClient.post<PayrollRunDetail>(
      `/api/v1/payroll/runs/${encodeURIComponent(runId)}/execute`,
      payload
    );
  },

  pauseRun(runId: string, reason: string): Promise<PayrollRunDetail> {
    return payrollHttpClient.post<PayrollRunDetail>(
      `/api/v1/payroll/runs/${encodeURIComponent(runId)}/pause`,
      { reason }
    );
  },

  resumeRun(runId: string): Promise<PayrollRunDetail> {
    return payrollHttpClient.post<PayrollRunDetail>(
      `/api/v1/payroll/runs/${encodeURIComponent(runId)}/resume`,
      {}
    );
  },

  retryFailedStep(runId: string, stage: PayrollRunStageCode): Promise<PayrollRunDetail> {
    return payrollHttpClient.post<PayrollRunDetail>(
      `/api/v1/payroll/runs/${encodeURIComponent(runId)}/retry-step`,
      { stage }
    );
  },

  rollbackRun(
    runId: string,
    payload: { reason: string; targetStage: PayrollRunStageCode }
  ): Promise<PayrollRunDetail> {
    return payrollHttpClient.post<PayrollRunDetail>(
      `/api/v1/payroll/runs/${encodeURIComponent(runId)}/rollback`,
      payload
    );
  },

  getRunEmployees(
    runId: string,
    params?: PayrollQueryParams,
    options?: PayrollRequestOptions
  ): Promise<PaginatedResponse<PayrollRunEmployeeSummary>> {
    return payrollHttpClient.get<PaginatedResponse<PayrollRunEmployeeSummary>>(
      `/api/v1/payroll/runs/${encodeURIComponent(runId)}/employees`,
      { ...options, params }
    );
  },

  getEmployeeDrilldown(
    runId: string,
    employeeId: string,
    options?: PayrollRequestOptions
  ): Promise<PayrollEmployeeDrilldown> {
    return payrollHttpClient.get<PayrollEmployeeDrilldown>(
      `/api/v1/payroll/runs/${encodeURIComponent(runId)}/employees/${encodeURIComponent(employeeId)}`,
      options
    );
  },

  toggleSalaryHold(
    runId: string,
    employeeId: string,
    payload: { action: 'hold' | 'release'; reason: string }
  ): Promise<PayrollRunEmployeeSummary> {
    return payrollHttpClient.post<PayrollRunEmployeeSummary>(
      `/api/v1/payroll/runs/${encodeURIComponent(runId)}/employees/${encodeURIComponent(employeeId)}/hold`,
      payload
    );
  },

  createOffCycleRun(payload: CreateOffCycleRunPayload): Promise<PayrollRunDetail> {
    return payrollHttpClient.post<PayrollRunDetail>(
      '/api/v1/payroll/runs/off-cycle',
      payload
    );
  },

  getVarianceComparison(
    runId: string,
    compareWithRunId?: string,
    options?: PayrollRequestOptions
  ): Promise<PayrollRunVarianceComparison> {
    return payrollHttpClient.get<PayrollRunVarianceComparison>(
      `/api/v1/payroll/runs/${encodeURIComponent(runId)}/variance`,
      { ...options, params: { compareWithRunId } }
    );
  },
};

// 3. Salary Structure & Components Service
export const salaryStructureService = {
  getComponents(
    params?: PayrollQueryParams,
    options?: PayrollRequestOptions
  ): Promise<PaginatedResponse<SalaryComponentItem>> {
    return payrollHttpClient.get<PaginatedResponse<SalaryComponentItem>>(
      '/api/v1/payroll/components',
      { ...options, params }
    );
  },

  createComponent(payload: UpsertSalaryComponentPayload): Promise<SalaryComponentItem> {
    return payrollHttpClient.post<SalaryComponentItem>(
      '/api/v1/payroll/components',
      payload
    );
  },

  updateComponent(
    id: string,
    payload: UpsertSalaryComponentPayload
  ): Promise<SalaryComponentItem> {
    return payrollHttpClient.put<SalaryComponentItem>(
      `/api/v1/payroll/components/${encodeURIComponent(id)}`,
      payload
    );
  },

  deleteComponent(id: string): Promise<{ deleted: boolean }> {
    return payrollHttpClient.delete<{ deleted: boolean }>(
      `/api/v1/payroll/components/${encodeURIComponent(id)}`
    );
  },

  validateFormula(payload: {
    expression: string;
    componentType: string;
  }): Promise<FormulaValidationResponse> {
    return payrollHttpClient.post<FormulaValidationResponse>(
      '/api/v1/payroll/components/validate-formula',
      payload
    );
  },

  getStructures(
    params?: PayrollQueryParams,
    options?: PayrollRequestOptions
  ): Promise<PaginatedResponse<SalaryStructureTemplate>> {
    return payrollHttpClient.get<PaginatedResponse<SalaryStructureTemplate>>(
      '/api/v1/payroll/structures',
      { ...options, params }
    );
  },

  createStructure(payload: UpsertSalaryStructurePayload): Promise<SalaryStructureTemplate> {
    return payrollHttpClient.post<SalaryStructureTemplate>(
      '/api/v1/payroll/structures',
      payload
    );
  },

  updateStructure(
    id: string,
    payload: UpsertSalaryStructurePayload
  ): Promise<SalaryStructureTemplate> {
    return payrollHttpClient.put<SalaryStructureTemplate>(
      `/api/v1/payroll/structures/${encodeURIComponent(id)}`,
      payload
    );
  },

  previewCtcBreakup(payload: CtcPreviewRequestPayload): Promise<CtcBreakupPreviewResponse> {
    return payrollHttpClient.post<CtcBreakupPreviewResponse>(
      '/api/v1/payroll/structures/preview-ctc',
      payload
    );
  },
};

// 4. Employee Compensation Service
export const compensationService = {
  getCompensations(
    params?: PayrollQueryParams,
    options?: PayrollRequestOptions
  ): Promise<PaginatedResponse<EmployeeCompensationRecord>> {
    return payrollHttpClient.get<PaginatedResponse<EmployeeCompensationRecord>>(
      '/api/v1/payroll/compensation',
      { ...options, params }
    );
  },

  getRevisionHistory(
    employeeId: string,
    options?: PayrollRequestOptions
  ): Promise<SalaryRevisionHistoryItem[]> {
    return payrollHttpClient.get<SalaryRevisionHistoryItem[]>(
      `/api/v1/payroll/compensation/${encodeURIComponent(employeeId)}/history`,
      options
    );
  },

  assignOrReviseCompensation(
    payload: AssignCompensationPayload
  ): Promise<EmployeeCompensationRecord> {
    return payrollHttpClient.post<EmployeeCompensationRecord>(
      '/api/v1/payroll/compensation/assign',
      payload
    );
  },

  validateBulkUpload(file: File): Promise<BulkUploadValidationPreview> {
    const formData = new FormData();
    formData.append('file', file);
    return payrollHttpClient.uploadFile<BulkUploadValidationPreview>(
      '/api/v1/payroll/compensation/bulk-validate',
      formData
    );
  },

  commitBulkUpload(batchId: string): Promise<{ importedCount: number }> {
    return payrollHttpClient.post<{ importedCount: number }>(
      '/api/v1/payroll/compensation/bulk-commit',
      { batchId }
    );
  },

  revealSensitiveField(
    employeeId: string,
    field: 'pan' | 'uan' | 'esi' | 'bankAccount'
  ): Promise<{ unmaskedValue: string }> {
    return payrollHttpClient.post<{ unmaskedValue: string }>(
      `/api/v1/payroll/compensation/${encodeURIComponent(employeeId)}/reveal-sensitive`,
      { field }
    );
  },
};

// 5. Attendance, Leave & LOP Integration Service
export const attendanceLopService = {
  getRecords(
    params?: PayrollQueryParams,
    options?: PayrollRequestOptions
  ): Promise<PaginatedResponse<AttendanceLopRecord>> {
    return payrollHttpClient.get<PaginatedResponse<AttendanceLopRecord>>(
      '/api/v1/payroll/attendance-lop',
      { ...options, params }
    );
  },

  overrideLop(
    employeeId: string,
    payload: LopOverridePayload
  ): Promise<AttendanceLopRecord> {
    return payrollHttpClient.post<AttendanceLopRecord>(
      `/api/v1/payroll/attendance-lop/${encodeURIComponent(employeeId)}/override`,
      payload
    );
  },

  setAttendanceLock(payload: {
    cycleId: string;
    locked: boolean;
    reason: string;
  }): Promise<{ cycleId: string; locked: boolean; updatedAt: string }> {
    return payrollHttpClient.post<{ cycleId: string; locked: boolean; updatedAt: string }>(
      '/api/v1/payroll/attendance-lop/lock-status',
      payload
    );
  },
};

// 6. Variable Inputs & Reimbursements Service
export const variableInputsService = {
  getVariableInputs(
    params?: PayrollQueryParams,
    options?: PayrollRequestOptions
  ): Promise<PaginatedResponse<VariableInputRecord>> {
    return payrollHttpClient.get<PaginatedResponse<VariableInputRecord>>(
      '/api/v1/payroll/variable-inputs',
      { ...options, params }
    );
  },

  createVariableInput(
    payload: CreateVariableInputPayload
  ): Promise<VariableInputRecord> {
    return payrollHttpClient.post<VariableInputRecord>(
      '/api/v1/payroll/variable-inputs',
      payload
    );
  },

  saveBulkGrid(payload: {
    cycleId: string;
    entries: CreateVariableInputPayload[];
  }): Promise<{ savedCount: number }> {
    return payrollHttpClient.post<{ savedCount: number }>(
      '/api/v1/payroll/variable-inputs/bulk-grid',
      payload
    );
  },

  validateVariableUpload(
    file: File,
    cycleId: string
  ): Promise<BulkUploadValidationPreview> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cycleId', cycleId);
    return payrollHttpClient.uploadFile<BulkUploadValidationPreview>(
      '/api/v1/payroll/variable-inputs/upload-validate',
      formData
    );
  },

  getReimbursements(
    params?: PayrollQueryParams,
    options?: PayrollRequestOptions
  ): Promise<PaginatedResponse<ReimbursementClaimRecord>> {
    return payrollHttpClient.get<PaginatedResponse<ReimbursementClaimRecord>>(
      '/api/v1/payroll/reimbursements',
      { ...options, params }
    );
  },

  decideReimbursement(
    claimId: string,
    payload: { status: 'Approved' | 'Rejected'; approvedAmount: number; remarks: string }
  ): Promise<ReimbursementClaimRecord> {
    return payrollHttpClient.post<ReimbursementClaimRecord>(
      `/api/v1/payroll/reimbursements/${encodeURIComponent(claimId)}/decision`,
      payload
    );
  },
};

// 7. Loans & Advances Service
export const loansAdvancesService = {
  getLoanTypes(options?: PayrollRequestOptions): Promise<LoanTypeConfig[]> {
    return payrollHttpClient.get<LoanTypeConfig[]>(
      '/api/v1/payroll/loans/types',
      options
    );
  },

  createLoanType(payload: UpsertLoanTypePayload): Promise<LoanTypeConfig> {
    return payrollHttpClient.post<LoanTypeConfig>(
      '/api/v1/payroll/loans/types',
      payload
    );
  },

  getLoans(
    params?: PayrollQueryParams,
    options?: PayrollRequestOptions
  ): Promise<PaginatedResponse<LoanAccountRecord>> {
    return payrollHttpClient.get<PaginatedResponse<LoanAccountRecord>>(
      '/api/v1/payroll/loans',
      { ...options, params }
    );
  },

  getEmiSchedule(
    loanId: string,
    options?: PayrollRequestOptions
  ): Promise<LoanEmiScheduleItem[]> {
    return payrollHttpClient.get<LoanEmiScheduleItem[]>(
      `/api/v1/payroll/loans/${encodeURIComponent(loanId)}/schedule`,
      options
    );
  },

  createLoanRequest(payload: CreateLoanRequestPayload): Promise<LoanAccountRecord> {
    return payrollHttpClient.post<LoanAccountRecord>(
      '/api/v1/payroll/loans',
      payload
    );
  },

  precloseLoan(
    loanId: string,
    payload: { settlementMode: string; referenceNo: string; remarks: string }
  ): Promise<LoanAccountRecord> {
    return payrollHttpClient.post<LoanAccountRecord>(
      `/api/v1/payroll/loans/${encodeURIComponent(loanId)}/preclose`,
      payload
    );
  },
};

// 8. Statutory Compliance Service
export const statutoryComplianceService = {
  getOverview(
    params?: { cycleId?: string; financialYear?: string },
    options?: PayrollRequestOptions
  ): Promise<StatutoryComplianceOverview> {
    return payrollHttpClient.get<StatutoryComplianceOverview>(
      '/api/v1/payroll/statutory/summary',
      { ...options, params }
    );
  },

  updateRegistrations(
    payload: CompanyStatutoryRegistrationPayload
  ): Promise<CompanyStatutoryRegistrationPayload> {
    return payrollHttpClient.put<CompanyStatutoryRegistrationPayload>(
      '/api/v1/payroll/statutory/registrations',
      payload
    );
  },

  downloadFilingChallan(filingId: string): Promise<Blob> {
    return payrollHttpClient.downloadBlob(
      `/api/v1/payroll/statutory/filings/${encodeURIComponent(filingId)}/download`,
      'GET'
    );
  },

  getForm16Statuses(
    params?: PayrollQueryParams,
    options?: PayrollRequestOptions
  ): Promise<PaginatedResponse<Form16EmployeeStatus>> {
    return payrollHttpClient.get<PaginatedResponse<Form16EmployeeStatus>>(
      '/api/v1/payroll/statutory/form16',
      { ...options, params }
    );
  },

  bulkDownloadForm16(payload: {
    financialYear: string;
    part: 'Part A' | 'Part B' | 'Combined';
  }): Promise<Blob> {
    return payrollHttpClient.downloadBlob(
      '/api/v1/payroll/statutory/form16/bulk-download',
      'POST',
      payload
    );
  },
};

// 9. Tax Declarations & Investment Proofs Service
export const taxDeclarationsService = {
  getDeclarations(
    params?: PayrollQueryParams,
    options?: PayrollRequestOptions
  ): Promise<PaginatedResponse<TaxDeclarationRecord>> {
    return payrollHttpClient.get<PaginatedResponse<TaxDeclarationRecord>>(
      '/api/v1/payroll/tax-declarations',
      { ...options, params }
    );
  },

  verifyProofItem(
    declarationId: string,
    payload: {
      itemId: string;
      status: 'Verified' | 'Rejected';
      verifiedAmount: number;
      remarks: string;
    }
  ): Promise<TaxDeclarationRecord> {
    return payrollHttpClient.post<TaxDeclarationRecord>(
      `/api/v1/payroll/tax-declarations/${encodeURIComponent(declarationId)}/verify`,
      payload
    );
  },

  configureTaxWindow(payload: TaxWindowConfigPayload): Promise<TaxWindowConfigPayload> {
    return payrollHttpClient.post<TaxWindowConfigPayload>(
      '/api/v1/payroll/tax-declarations/window',
      payload
    );
  },
};

// 10. Approvals Workflow Service
export const payrollApprovalsService = {
  getApprovals(
    params?: PayrollQueryParams,
    options?: PayrollRequestOptions
  ): Promise<PaginatedResponse<PayrollApprovalRequest>> {
    return payrollHttpClient.get<PaginatedResponse<PayrollApprovalRequest>>(
      '/api/v1/payroll/approvals',
      { ...options, params }
    );
  },

  decideApproval(
    id: string,
    payload: { decision: 'Approved' | 'Rejected'; comments: string }
  ): Promise<PayrollApprovalRequest> {
    return payrollHttpClient.post<PayrollApprovalRequest>(
      `/api/v1/payroll/approvals/${encodeURIComponent(id)}/decide`,
      payload
    );
  },

  bulkDecide(payload: {
    ids: string[];
    decision: 'Approved' | 'Rejected';
    comments: string;
  }): Promise<{ processedCount: number }> {
    return payrollHttpClient.post<{ processedCount: number }>(
      '/api/v1/payroll/approvals/bulk-decide',
      payload
    );
  },

  delegateApprovals(payload: {
    delegateToUserId: string;
    validFrom: string;
    validUntil: string;
    reason: string;
  }): Promise<{ delegationId: string }> {
    return payrollHttpClient.post<{ delegationId: string }>(
      '/api/v1/payroll/approvals/delegate',
      payload
    );
  },
};

// 11. Payslips Service
export const payslipsService = {
  getPayslips(
    params?: PayrollQueryParams,
    options?: PayrollRequestOptions
  ): Promise<PaginatedResponse<PayslipRecord>> {
    return payrollHttpClient.get<PaginatedResponse<PayslipRecord>>(
      '/api/v1/payroll/payslips',
      { ...options, params }
    );
  },

  getPayslipDetail(
    id: string,
    options?: PayrollRequestOptions
  ): Promise<PayslipDetailedView> {
    return payrollHttpClient.get<PayslipDetailedView>(
      `/api/v1/payroll/payslips/${encodeURIComponent(id)}`,
      options
    );
  },

  downloadPayslipPdf(id: string, passwordProtected = false): Promise<Blob> {
    return payrollHttpClient.downloadBlob(
      `/api/v1/payroll/payslips/${encodeURIComponent(id)}/pdf`,
      'GET',
      undefined,
      { params: { passwordProtected } }
    );
  },

  bulkGeneratePayslips(cycleId: string): Promise<{ jobId: string; count: number }> {
    return payrollHttpClient.post<{ jobId: string; count: number }>(
      '/api/v1/payroll/payslips/bulk-generate',
      { cycleId }
    );
  },

  publishPayslips(payload: {
    cycleId: string;
    publish: boolean;
    channels: ('email' | 'whatsapp')[];
  }): Promise<{ updatedCount: number }> {
    return payrollHttpClient.post<{ updatedCount: number }>(
      '/api/v1/payroll/payslips/publish',
      payload
    );
  },

  getTemplates(options?: PayrollRequestOptions): Promise<PayslipTemplateConfig[]> {
    return payrollHttpClient.get<PayslipTemplateConfig[]>(
      '/api/v1/payroll/payslips/templates',
      options
    );
  },

  previewTemplate(templateId: string): Promise<{ previewHtml: string }> {
    return payrollHttpClient.post<{ previewHtml: string }>(
      '/api/v1/payroll/payslips/templates/preview',
      { templateId }
    );
  },
};

// 12. Bank Advice & Disbursement Service
export const bankDisbursementService = {
  getDisbursements(
    params?: PayrollQueryParams,
    options?: PayrollRequestOptions
  ): Promise<PaginatedResponse<DisbursementEmployeeRecord>> {
    return payrollHttpClient.get<PaginatedResponse<DisbursementEmployeeRecord>>(
      '/api/v1/payroll/disbursements',
      { ...options, params }
    );
  },

  generateBankAdviceFile(payload: {
    cycleId: string;
    bankFormat: 'HDFC Corporate' | 'ICICI CIB' | 'SBI CMP' | 'Axis Corporate' | 'Generic NEFT CSV';
    paymentMode: 'NEFT' | 'RTGS' | 'IMPS';
  }): Promise<Blob> {
    return payrollHttpClient.downloadBlob(
      '/api/v1/payroll/disbursements/generate-bank-file',
      'POST',
      payload
    );
  },

  uploadBankResponseFile(
    file: File,
    cycleId: string
  ): Promise<BankReconciliationSummary> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('cycleId', cycleId);
    return payrollHttpClient.uploadFile<BankReconciliationSummary>(
      '/api/v1/payroll/disbursements/upload-response',
      formData
    );
  },

  retryFailedPayment(
    id: string,
    paymentMode: 'NEFT' | 'RTGS' | 'IMPS'
  ): Promise<DisbursementEmployeeRecord> {
    return payrollHttpClient.post<DisbursementEmployeeRecord>(
      `/api/v1/payroll/disbursements/${encodeURIComponent(id)}/retry`,
      { paymentMode }
    );
  },
};

// 13. Full & Final Settlement Service
export const fnfSettlementService = {
  getSettlements(
    params?: PayrollQueryParams,
    options?: PayrollRequestOptions
  ): Promise<PaginatedResponse<FnfSettlementRecord>> {
    return payrollHttpClient.get<PaginatedResponse<FnfSettlementRecord>>(
      '/api/v1/payroll/fnf',
      { ...options, params }
    );
  },

  initiateSettlement(payload: InitiateFnfPayload): Promise<FnfSettlementRecord> {
    return payrollHttpClient.post<FnfSettlementRecord>(
      '/api/v1/payroll/fnf/initiate',
      payload
    );
  },

  approveSettlement(id: string, comments: string): Promise<FnfSettlementRecord> {
    return payrollHttpClient.post<FnfSettlementRecord>(
      `/api/v1/payroll/fnf/${encodeURIComponent(id)}/approve`,
      { comments }
    );
  },

  downloadStatementPdf(id: string): Promise<Blob> {
    return payrollHttpClient.downloadBlob(
      `/api/v1/payroll/fnf/${encodeURIComponent(id)}/statement-pdf`,
      'GET'
    );
  },
};

// 14. Arrears, Revisions & Corrections Service
export const arrearsService = {
  getArrears(
    params?: PayrollQueryParams,
    options?: PayrollRequestOptions
  ): Promise<PaginatedResponse<ArrearAdjustmentRecord>> {
    return payrollHttpClient.get<PaginatedResponse<ArrearAdjustmentRecord>>(
      '/api/v1/payroll/arrears',
      { ...options, params }
    );
  },

  createCorrectionEntry(
    payload: CreateCorrectionEntryPayload
  ): Promise<ArrearAdjustmentRecord> {
    return payrollHttpClient.post<ArrearAdjustmentRecord>(
      '/api/v1/payroll/arrears/correction',
      payload
    );
  },

  includeInCycle(
    id: string,
    targetCycleId: string
  ): Promise<ArrearAdjustmentRecord> {
    return payrollHttpClient.post<ArrearAdjustmentRecord>(
      `/api/v1/payroll/arrears/${encodeURIComponent(id)}/include`,
      { targetCycleId }
    );
  },
};

// 15. Reports & Analytics Service
export const payrollReportsService = {
  getCatalog(options?: PayrollRequestOptions): Promise<PayrollReportCatalogItem[]> {
    return payrollHttpClient.get<PayrollReportCatalogItem[]>(
      '/api/v1/payroll/reports/catalog',
      options
    );
  },

  getReportData(
    reportCode: PayrollReportCode,
    params?: PayrollQueryParams,
    options?: PayrollRequestOptions
  ): Promise<PayrollReportDataResponse> {
    return payrollHttpClient.get<PayrollReportDataResponse>(
      `/api/v1/payroll/reports/${encodeURIComponent(reportCode)}/data`,
      { ...options, params }
    );
  },

  exportReport(
    reportCode: PayrollReportCode,
    format: 'csv' | 'xlsx' | 'pdf',
    cycleId?: string
  ): Promise<Blob> {
    return payrollHttpClient.downloadBlob(
      `/api/v1/payroll/reports/${encodeURIComponent(reportCode)}/export`,
      'GET',
      undefined,
      { params: { format, cycleId } }
    );
  },

  getSavedPresets(options?: PayrollRequestOptions): Promise<SavedReportPreset[]> {
    return payrollHttpClient.get<SavedReportPreset[]>(
      '/api/v1/payroll/reports/presets',
      options
    );
  },

  savePreset(payload: CreateReportPresetPayload): Promise<SavedReportPreset> {
    return payrollHttpClient.post<SavedReportPreset>(
      '/api/v1/payroll/reports/presets',
      payload
    );
  },
};

// 16. Payroll Settings & Automation Rules Service
export const payrollSettingsService = {
  getSettings(options?: PayrollRequestOptions): Promise<PayrollSettingsConfiguration> {
    return payrollHttpClient.get<PayrollSettingsConfiguration>(
      '/api/v1/payroll/settings',
      options
    );
  },

  updateSettings(
    payload: PayrollSettingsConfiguration
  ): Promise<PayrollSettingsConfiguration> {
    return payrollHttpClient.put<PayrollSettingsConfiguration>(
      '/api/v1/payroll/settings',
      payload
    );
  },
};

// 17. Audit Logs Service
export const payrollAuditLogsService = {
  getLogs(
    params?: PayrollQueryParams,
    options?: PayrollRequestOptions
  ): Promise<PaginatedResponse<PayrollAuditLogEntry>> {
    return payrollHttpClient.get<PaginatedResponse<PayrollAuditLogEntry>>(
      '/api/v1/payroll/audit-logs',
      { ...options, params }
    );
  },

  exportLogs(format: 'csv' | 'pdf', params?: PayrollQueryParams): Promise<Blob> {
    return payrollHttpClient.downloadBlob(
      '/api/v1/payroll/audit-logs/export',
      'GET',
      undefined,
      { params: { ...params, format } }
    );
  },
};

// 18. Payroll Notifications Service
export const payrollNotificationsService = {
  getNotifications(
    params?: PayrollQueryParams,
    options?: PayrollRequestOptions
  ): Promise<PaginatedResponse<PayrollNotificationItem>> {
    return payrollHttpClient.get<PaginatedResponse<PayrollNotificationItem>>(
      '/api/v1/payroll/notifications',
      { ...options, params }
    );
  },

  markAsRead(id: string): Promise<PayrollNotificationItem> {
    return payrollHttpClient.post<PayrollNotificationItem>(
      `/api/v1/payroll/notifications/${encodeURIComponent(id)}/read`,
      {}
    );
  },

  markAllRead(): Promise<{ updatedCount: number }> {
    return payrollHttpClient.post<{ updatedCount: number }>(
      '/api/v1/payroll/notifications/read-all',
      {}
    );
  },

  updatePreferences(
    payload: PayrollNotificationPreferences
  ): Promise<PayrollNotificationPreferences> {
    return payrollHttpClient.put<PayrollNotificationPreferences>(
      '/api/v1/payroll/notifications/preferences',
      payload
    );
  },
};

// 19. Employee Self-Service (ESS) — My Pay Service
export const essMyPayService = {
  getOverview(
    financialYear?: string,
    options?: PayrollRequestOptions
  ): Promise<EssMyPayOverview> {
    return payrollHttpClient.get<EssMyPayOverview>(
      '/api/v1/payroll/ess/summary',
      { ...options, params: { financialYear } }
    );
  },

  submitTaxDeclaration(
    payload: SubmitEssTaxDeclarationPayload
  ): Promise<TaxDeclarationRecord> {
    return payrollHttpClient.post<TaxDeclarationRecord>(
      '/api/v1/payroll/ess/tax-declaration',
      payload
    );
  },

  uploadTaxProof(
    file: File,
    section: string,
    declaredAmount: number
  ): Promise<{ proofId: string; fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('section', section);
    formData.append('declaredAmount', String(declaredAmount));
    return payrollHttpClient.uploadFile<{ proofId: string; fileUrl: string }>(
      '/api/v1/payroll/ess/tax-proof-upload',
      formData
    );
  },

  submitReimbursementClaim(payload: {
    billFile?: File | null;
    category: ReimbursementClaimRecord['category'];
    claimAmount: number;
    billDate: string;
    description: string;
  }): Promise<ReimbursementClaimRecord> {
    const formData = new FormData();
    if (payload.billFile) {
      formData.append('billFile', payload.billFile);
    }
    formData.append('category', payload.category);
    formData.append('claimAmount', String(payload.claimAmount));
    formData.append('billDate', payload.billDate);
    formData.append('description', payload.description);
    return payrollHttpClient.uploadFile<ReimbursementClaimRecord>(
      '/api/v1/payroll/ess/reimbursement-claim',
      formData
    );
  },

  submitBankChangeRequest(payload: {
    proofFile?: File | null;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    reason: string;
  }): Promise<EssBankChangeRequest> {
    const formData = new FormData();
    if (payload.proofFile) {
      formData.append('proofFile', payload.proofFile);
    }
    formData.append('bankName', payload.bankName);
    formData.append('accountNumber', payload.accountNumber);
    formData.append('ifscCode', payload.ifscCode);
    formData.append('reason', payload.reason);
    return payrollHttpClient.uploadFile<EssBankChangeRequest>(
      '/api/v1/payroll/ess/bank-change-request',
      formData
    );
  },
};
