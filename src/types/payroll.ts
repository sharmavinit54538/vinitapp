/**
 * Strict TypeScript Interfaces for OFC360 Enterprise Payroll Module (19 Modules)
 * All financial values are returned by the backend REST API.
 */

export type PayrollRole =
  | 'super_admin'
  | 'hr_admin'
  | 'payroll_manager'
  | 'finance_approver'
  | 'manager'
  | 'employee';

export type PayrollPermission =
  | 'payroll.dashboard.view'
  | 'payroll.run.view'
  | 'payroll.run.execute'
  | 'payroll.run.rollback'
  | 'payroll.run.hold'
  | 'payroll.structure.view'
  | 'payroll.structure.manage'
  | 'payroll.compensation.view'
  | 'payroll.compensation.manage'
  | 'payroll.sensitive.reveal'
  | 'payroll.attendance.view'
  | 'payroll.attendance.override'
  | 'payroll.attendance.lock'
  | 'payroll.variables.view'
  | 'payroll.variables.manage'
  | 'payroll.loans.view'
  | 'payroll.loans.manage'
  | 'payroll.statutory.view'
  | 'payroll.statutory.manage'
  | 'payroll.tax.view'
  | 'payroll.tax.verify'
  | 'payroll.approvals.view'
  | 'payroll.approvals.act'
  | 'payroll.payslips.view'
  | 'payroll.payslips.manage'
  | 'payroll.disbursement.view'
  | 'payroll.disbursement.manage'
  | 'payroll.fnf.view'
  | 'payroll.fnf.manage'
  | 'payroll.arrears.view'
  | 'payroll.arrears.manage'
  | 'payroll.reports.view'
  | 'payroll.reports.export'
  | 'payroll.settings.view'
  | 'payroll.settings.manage'
  | 'payroll.audit.view'
  | 'payroll.notifications.view'
  | 'payroll.ess.self';

export type PayrollModuleId =
  | 'dashboard'
  | 'pay-calendar'
  | 'salary-structures'
  | 'compensation'
  | 'attendance-lop'
  | 'variable-inputs'
  | 'loans-advances'
  | 'statutory'
  | 'tax-declarations'
  | 'approvals'
  | 'payslips'
  | 'bank-disbursement'
  | 'fnf-settlement'
  | 'arrears'
  | 'reports'
  | 'settings'
  | 'audit-logs'
  | 'notifications'
  | 'my-pay';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PayrollQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  department?: string;
  location?: string;
  status?: string;
  cycleId?: string;
  financialYear?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface PayrollApiErrorPayload {
  message: string;
  statusCode: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;
}

// ============================================================================
// 1. Payroll Dashboard
// ============================================================================
export interface PayrollDashboardKpiMetrics {
  currentCycleId: string;
  currentCycleLabel: string;
  cycleStatus: 'Draft' | 'In Progress' | 'Pending Approval' | 'Disbursed' | 'Closed';
  payDate: string;
  cutoffDate: string;
  currencyCode: string;
  grossPay: number;
  netPay: number;
  totalDeductions: number;
  employerContributions: number;
  totalPayrollCost: number;
  processedHeadcount: number;
  pendingHoldCount: number;
  variancePercentVsLastMonth: number;
}

export interface PayrollTrendPoint {
  cycleLabel: string;
  grossPay: number;
  netPay: number;
  statutoryDeductions: number;
  employerCost: number;
  headcount: number;
}

export interface DepartmentCostShare {
  department: string;
  costCenterCode: string;
  headcount: number;
  grossAmount: number;
  netAmount: number;
  sharePercentage: number;
}

export interface StatutoryDueAlert {
  id: string;
  statutoryType: 'PF' | 'ESI' | 'PT' | 'LWF' | 'TDS';
  title: string;
  dueDate: string;
  amountDue: number;
  status: 'Upcoming' | 'Due Soon' | 'Overdue' | 'Filed';
}

export interface PayrollExceptionAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  category: 'Negative Net Pay' | 'Missing Bank Account' | 'Unverified PAN' | 'Attendance Mismatch' | 'High Variance';
  employeeId: string;
  employeeName: string;
  message: string;
  detectedAt: string;
}

export interface PayrollDashboardResponse {
  kpis: PayrollDashboardKpiMetrics;
  monthlyTrend: PayrollTrendPoint[];
  departmentCostBreakdown: DepartmentCostShare[];
  statutoryDues: StatutoryDueAlert[];
  exceptions: PayrollExceptionAlert[];
  pendingApprovalsCount: number;
}

// ============================================================================
// 2. Pay Calendar & Automated Payroll Run (Core Engine UI)
// ============================================================================
export type PayrollRunStageCode =
  | 'attendance_lock'
  | 'input_collection'
  | 'pre_run_validation'
  | 'calculation'
  | 'exceptions_review'
  | 'approval'
  | 'statutory_computation'
  | 'payslip_generation'
  | 'bank_file_generation'
  | 'disbursement'
  | 'posting_close';

export interface PayrollRunStageStep {
  code: PayrollRunStageCode;
  order: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'paused';
  completedAt?: string;
  actorName?: string;
  errorMessage?: string;
}

export interface PayCalendarCycle {
  id: string;
  name: string;
  financialYear: string;
  periodStart: string;
  periodEnd: string;
  cutoffDate: string;
  payDate: string;
  runType: 'Regular' | 'Off-Cycle' | 'Supplementary';
  status: 'Upcoming' | 'Open' | 'Processing' | 'Approved' | 'Disbursed' | 'Closed';
  isAttendanceLocked: boolean;
}

export interface PreRunValidationCheckItem {
  id: string;
  checkType:
    | 'unmapped_salary_structure'
    | 'missing_bank_account'
    | 'missing_pan_or_uan'
    | 'negative_net_pay'
    | 'unapproved_leave_or_lop'
    | 'new_joiner_proration'
    | 'exit_fnf_pending';
  label: string;
  status: 'passed' | 'warning' | 'failed';
  affectedEmployeesCount: number;
  details: string;
}

export interface PreRunValidationReport {
  runId: string;
  checkedAt: string;
  canProceedToCalculation: boolean;
  checks: PreRunValidationCheckItem[];
}

export interface PayrollRunDetail {
  id: string;
  cycleId: string;
  cycleName: string;
  runType: 'Regular' | 'Off-Cycle' | 'Supplementary';
  currentStage: PayrollRunStageCode;
  overallStatus: 'Idle' | 'Running' | 'Paused' | 'Failed' | 'Awaiting Approval' | 'Completed' | 'Rolled Back';
  progressPercentage: number;
  eligibleEmployees: number;
  processedEmployees: number;
  heldEmployees: number;
  grossTotal: number;
  deductionsTotal: number;
  netPayableTotal: number;
  currencyCode: string;
  startedAt?: string;
  completedAt?: string;
  initiatedBy?: string;
  stages: PayrollRunStageStep[];
}

export interface PayrollRunProgressResponse {
  runId: string;
  currentStage: PayrollRunStageCode;
  overallStatus: PayrollRunDetail['overallStatus'];
  progressPercentage: number;
  processedEmployees: number;
  eligibleEmployees: number;
  activeMessage: string;
  updatedAt: string;
}

export interface PayrollRunEmployeeSummary {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  location: string;
  payableDays: number;
  lopDays: number;
  grossEarnings: number;
  totalDeductions: number;
  statutoryDeductions: number;
  netPay: number;
  variancePercentage: number;
  paymentStatus: 'Ready' | 'On Hold' | 'Exception' | 'Paid';
  holdReason?: string;
}

export interface PayrollComponentAmountLine {
  componentCode: string;
  componentName: string;
  category: 'Earning' | 'Deduction' | 'Employer Contribution' | 'Statutory' | 'Reimbursement';
  amount: number;
  ytdAmount: number;
  formulaUsed?: string;
}

export interface PayrollEmployeeDrilldown {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  payDays: number;
  lopDays: number;
  arrearsAmount: number;
  loanEmiDeducted: number;
  tdsDeducted: number;
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
  priorMonthNetPay: number;
  varianceAmount: number;
  lines: PayrollComponentAmountLine[];
}

export interface CreateOffCycleRunPayload {
  name: string;
  payDate: string;
  runType: 'Off-Cycle' | 'Supplementary';
  reason: string;
  employeeIds: string[];
}

export interface PayrollRunVarianceComparison {
  currentRunId: string;
  previousRunId: string;
  currentCycleName: string;
  previousCycleName: string;
  headcountDelta: number;
  grossPayDelta: number;
  netPayDelta: number;
  deductionsDelta: number;
  componentVariances: {
    componentName: string;
    currentTotal: number;
    previousTotal: number;
    deltaAmount: number;
    deltaPercent: number;
  }[];
}

// ============================================================================
// 3. Salary Structure & Components
// ============================================================================
export type SalaryComponentCategory =
  | 'Fixed Earning'
  | 'Variable Earning'
  | 'Allowance'
  | 'Reimbursement'
  | 'Pre-Tax Deduction'
  | 'Post-Tax Deduction'
  | 'Employer Contribution'
  | 'Statutory';

export type CalculationBasisType =
  | 'Flat Amount'
  | 'Percentage of Basic'
  | 'Percentage of Gross'
  | 'Percentage of CTC'
  | 'Custom Formula'
  | 'Slab Based';

export interface SalaryComponentItem {
  id: string;
  code: string;
  name: string;
  category: SalaryComponentCategory;
  calculationType: CalculationBasisType;
  valueOrFormula: string;
  taxability: 'Fully Taxable' | 'Partially Exempt' | 'Tax Exempt';
  maxExemptionLimit?: number;
  prorateOnLop: boolean;
  considerForPf: boolean;
  considerForEsi: boolean;
  considerForPt: boolean;
  showInPayslip: boolean;
  isActive: boolean;
}

export interface UpsertSalaryComponentPayload {
  code: string;
  name: string;
  category: SalaryComponentCategory;
  calculationType: CalculationBasisType;
  valueOrFormula: string;
  taxability: SalaryComponentItem['taxability'];
  maxExemptionLimit?: number;
  prorateOnLop: boolean;
  considerForPf: boolean;
  considerForEsi: boolean;
  considerForPt: boolean;
  showInPayslip: boolean;
  isActive: boolean;
}

export interface FormulaValidationResponse {
  isValid: boolean;
  parsedTokens: string[];
  referencedComponents: string[];
  errorMessage?: string;
}

export interface SalaryStructureTemplate {
  id: string;
  name: string;
  code: string;
  gradeOrBand: string;
  description: string;
  minAnnualCtc: number;
  maxAnnualCtc: number;
  assignedEmployeeCount: number;
  isActive: boolean;
  components: {
    componentId: string;
    componentCode: string;
    componentName: string;
    category: SalaryComponentCategory;
    formulaOrValue: string;
  }[];
}

export interface UpsertSalaryStructurePayload {
  name: string;
  code: string;
  gradeOrBand: string;
  description: string;
  minAnnualCtc: number;
  maxAnnualCtc: number;
  isActive: boolean;
  componentIds: string[];
}

export interface CtcPreviewRequestPayload {
  structureId: string;
  annualCtc: number;
  taxRegime: 'New Regime' | 'Old Regime';
  stateCode: string;
}

export interface CtcBreakupPreviewResponse {
  structureId: string;
  annualCtc: number;
  monthlyGross: number;
  monthlyNetTakeHome: number;
  monthlyEmployeeDeductions: number;
  monthlyEmployerContributions: number;
  breakdown: {
    componentCode: string;
    componentName: string;
    category: SalaryComponentCategory;
    monthlyAmount: number;
    annualAmount: number;
  }[];
}

// ============================================================================
// 4. Employee Compensation
// ============================================================================
export interface EmployeeCompensationRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  grade: string;
  structureId: string;
  structureName: string;
  annualCtc: number;
  monthlyGross: number;
  monthlyNetEstimate: number;
  effectiveFrom: string;
  taxRegime: 'New Regime' | 'Old Regime';
  panMasked: string;
  uanMasked: string;
  esiNumberMasked: string;
  bankAccountMasked: string;
  bankIfsc: string;
  paymentMode: 'NEFT' | 'RTGS' | 'IMPS' | 'Cheque';
  status: 'Active' | 'Pending Approval' | 'Hold';
}

export interface SalaryRevisionHistoryItem {
  revisionId: string;
  effectiveFrom: string;
  previousCtc: number;
  revisedCtc: number;
  hikePercentage: number;
  structureName: string;
  reason: string;
  arrearsApplicable: boolean;
  approvedBy: string;
  approvedAt: string;
}

export interface AssignCompensationPayload {
  employeeId: string;
  structureId: string;
  annualCtc: number;
  effectiveFrom: string;
  reason: string;
  computeRetroArrears: boolean;
  paymentMode: 'NEFT' | 'RTGS' | 'IMPS' | 'Cheque';
}

export interface BulkUploadValidationPreview {
  batchId: string;
  fileName: string;
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  errors: {
    rowNumber: number;
    employeeCode: string;
    field: string;
    message: string;
  }[];
}

// ============================================================================
// 5. Attendance, Leave & LOP Integration
// ============================================================================
export interface AttendanceLopRecord {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  cycleId: string;
  totalCalendarDays: number;
  workingDays: number;
  presentDays: number;
  paidLeaveDays: number;
  weeklyOffAndHolidays: number;
  systemLopDays: number;
  overriddenLopDays: number | null;
  finalPayableDays: number;
  lopReversalDays: number;
  overtimeHours: number;
  shiftAllowanceDays: number;
  latePenaltyDays: number;
  isLocked: boolean;
  overrideReason?: string;
}

export interface LopOverridePayload {
  cycleId: string;
  overriddenLopDays: number;
  lopReversalDays: number;
  reason: string;
}

// ============================================================================
// 6. Variable Inputs: Earnings, Deductions, Reimbursements, Bonuses, Overtime
// ============================================================================
export type VariableInputCategory =
  | 'Bonus'
  | 'Incentive'
  | 'Overtime'
  | 'One-Time Earning'
  | 'One-Time Deduction'
  | 'Penalty'
  | 'Shift Allowance';

export interface VariableInputRecord {
  id: string;
  cycleId: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  category: VariableInputCategory;
  componentCode: string;
  componentName: string;
  amount: number;
  remarks: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  createdBy: string;
  createdAt: string;
}

export interface CreateVariableInputPayload {
  cycleId: string;
  employeeId: string;
  category: VariableInputCategory;
  componentCode: string;
  amount: number;
  remarks: string;
}

export interface ReimbursementClaimRecord {
  id: string;
  claimNumber: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  category: 'Medical' | 'Fuel & Conveyance' | 'Telecom & Broadband' | 'Books & Periodicals' | 'LTA' | 'Meal Coupons';
  billDate: string;
  claimedAmount: number;
  approvedAmount: number;
  taxExemptAmount: number;
  attachmentUrl?: string;
  status: 'Submitted' | 'Approved' | 'Rejected' | 'Paid in Payroll';
  submittedAt: string;
  remarks?: string;
}

// ============================================================================
// 7. Loans & Advances
// ============================================================================
export interface LoanTypeConfig {
  id: string;
  code: string;
  name: string;
  category: 'Salary Advance' | 'Personal Loan' | 'Emergency Loan' | 'Festival Advance' | 'Asset Loan';
  interestCalculationMethod: 'Zero Interest' | 'Flat Rate' | 'Reducing Balance';
  annualInterestRatePercent: number;
  maxLimitAmount: number;
  maxTenureMonths: number;
  isActive: boolean;
}

export interface UpsertLoanTypePayload {
  code: string;
  name: string;
  category: LoanTypeConfig['category'];
  interestCalculationMethod: LoanTypeConfig['interestCalculationMethod'];
  annualInterestRatePercent: number;
  maxLimitAmount: number;
  maxTenureMonths: number;
  isActive: boolean;
}

export interface LoanAccountRecord {
  id: string;
  loanNumber: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  loanTypeId: string;
  loanTypeName: string;
  principalAmount: number;
  interestRatePercent: number;
  totalPayableAmount: number;
  monthlyEmiAmount: number;
  tenureMonths: number;
  paidEmisCount: number;
  remainingBalance: number;
  disbursedDate?: string;
  deductionStartCycle: string;
  status: 'Pending Approval' | 'Active' | 'Paused' | 'Pre-Closed' | 'Completed' | 'Rejected';
}

export interface LoanEmiScheduleItem {
  installmentNumber: number;
  cycleName: string;
  dueDate: string;
  openingBalance: number;
  principalComponent: number;
  interestComponent: number;
  totalEmi: number;
  closingBalance: number;
  deductionStatus: 'Deducted' | 'Scheduled' | 'Skipped' | 'Pre-Closed';
}

export interface CreateLoanRequestPayload {
  employeeId: string;
  loanTypeId: string;
  principalAmount: number;
  tenureMonths: number;
  deductionStartCycle: string;
  reason: string;
}

// ============================================================================
// 8. Statutory Compliance
// ============================================================================
export interface CompanyStatutoryRegistrationPayload {
  epfoEstablishmentId: string;
  epfoSignatoryName: string;
  pfEmployerRatePercent: number;
  pfEmployeeRatePercent: number;
  pfWageCeiling: number;
  esicCode: string;
  esiEmployerRatePercent: number;
  esiEmployeeRatePercent: number;
  esiWageCeiling: number;
  tanNumber: string;
  panNumber: string;
  deductorCategory: string;
  ptRegisteredStates: string[];
  lwfApplicableStates: string[];
}

export interface StatutoryFilingRecord {
  id: string;
  statutoryType: 'PF' | 'ESI' | 'PT' | 'LWF' | 'TDS';
  cycleName: string;
  stateOrJurisdiction: string;
  coveredEmployees: number;
  employeeContribution: number;
  employerContribution: number;
  totalRemittance: number;
  dueDate: string;
  challanOrAckNo?: string;
  returnFormat: 'ECR Text' | 'ESIC Challan' | 'PT Return' | 'LWF Statement' | 'Form 24Q';
  status: 'Generated' | 'Pending Payment' | 'Filed' | 'Overdue';
}

export interface Form16EmployeeStatus {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  panMasked: string;
  financialYear: string;
  totalTaxableIncome: number;
  totalTdsDeducted: number;
  partAStatus: 'Available' | 'Pending TRACES';
  partBStatus: 'Generated' | 'Pending';
  issuedAt?: string;
}

export interface StatutoryComplianceOverview {
  registrations: CompanyStatutoryRegistrationPayload;
  filings: StatutoryFilingRecord[];
  stateWisePtSlabs: {
    stateName: string;
    slabRange: string;
    monthlyPtAmount: number;
    enrolledHeadcount: number;
  }[];
}

// ============================================================================
// 9. Tax Declarations & Investment Proofs
// ============================================================================
export interface TaxDeclarationSectionItem {
  id: string;
  sectionCode: '80C' | '80CCD(1B)' | '80D' | 'HRA' | 'LTA' | 'Section 24 Home Loan' | 'Previous Employer Income';
  particulars: string;
  declaredAmount: number;
  verifiedAmount: number;
  maxLimitAmount: number;
  proofFileName?: string;
  proofStatus: 'Not Uploaded' | 'Pending Verification' | 'Verified' | 'Rejected';
  verifierRemarks?: string;
}

export interface TaxDeclarationRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  financialYear: string;
  selectedRegime: 'New Regime' | 'Old Regime';
  isRegimeLocked: boolean;
  totalDeclaredInvestments: number;
  totalVerifiedInvestments: number;
  projectedAnnualTaxOldRegime: number;
  projectedAnnualTaxNewRegime: number;
  monthlyTdsDeduction: number;
  overallStatus: 'Draft' | 'Submitted' | 'Partially Verified' | 'Verified';
  items: TaxDeclarationSectionItem[];
}

export interface TaxWindowConfigPayload {
  financialYear: string;
  declarationWindowOpen: boolean;
  declarationDeadline: string;
  proofSubmissionWindowOpen: boolean;
  proofSubmissionDeadline: string;
  allowRegimeSwitch: boolean;
}

// ============================================================================
// 10. Approvals Workflow
// ============================================================================
export type PayrollApprovalEntityType =
  | 'Payroll Run'
  | 'Salary Revision'
  | 'Loan Request'
  | 'Reimbursement Claim'
  | 'Off-Cycle Payout'
  | 'F&F Settlement'
  | 'Salary Hold Release';

export interface PayrollApprovalStepTimeline {
  level: number;
  roleLabel: string;
  approverName: string;
  status: 'Approved' | 'Rejected' | 'Pending' | 'Escalated';
  actedAt?: string;
  comments?: string;
}

export interface PayrollApprovalRequest {
  id: string;
  referenceCode: string;
  entityType: PayrollApprovalEntityType;
  subjectTitle: string;
  requestedBy: string;
  requestedAt: string;
  department: string;
  financialImpactAmount: number;
  currencyCode: string;
  currentLevel: number;
  totalLevels: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Escalated';
  slaDueAt: string;
  timeline: PayrollApprovalStepTimeline[];
}

// ============================================================================
// 11. Payslips
// ============================================================================
export interface PayslipRecord {
  id: string;
  cycleId: string;
  cycleName: string;
  payDate: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  payableDays: number;
  grossEarnings: number;
  totalDeductions: number;
  netPay: number;
  currencyCode: string;
  isPublished: boolean;
  emailDeliveryStatus: 'Sent' | 'Pending' | 'Failed';
  whatsappDeliveryStatus: 'Sent' | 'Pending' | 'Not Opted';
}

export interface PayslipDetailedView extends PayslipRecord {
  netPayInWords: string;
  bankAccountMasked: string;
  panMasked: string;
  uanMasked: string;
  taxRegime: 'New Regime' | 'Old Regime';
  earnings: PayrollComponentAmountLine[];
  deductions: PayrollComponentAmountLine[];
  employerContributions: PayrollComponentAmountLine[];
  ytdSummary: {
    grossYtd: number;
    deductionsYtd: number;
    tdsYtd: number;
    pfYtd: number;
    netYtd: number;
  };
}

export interface PayslipTemplateConfig {
  id: string;
  name: string;
  layoutStyle: 'Executive Compact' | 'Comprehensive Statutory' | 'Modern Minimal';
  showEmployerContribution: boolean;
  showYtdColumns: boolean;
  showTaxProjectionSummary: boolean;
  passwordProtectionRule: 'None' | 'PAN_UPPERCASE' | 'DOB_DDMMYYYY';
  isDefault: boolean;
}

// ============================================================================
// 12. Bank Advice & Disbursement
// ============================================================================
export interface DisbursementEmployeeRecord {
  id: string;
  cycleId: string;
  cycleName: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  paymentMode: 'NEFT' | 'RTGS' | 'IMPS' | 'Bank Advice';
  netPayAmount: number;
  utrReferenceNumber?: string;
  disbursementStatus: 'Ready' | 'Advice Generated' | 'Processing at Bank' | 'Credited' | 'Failed';
  failureReason?: string;
  processedAt?: string;
}

export interface BankReconciliationSummary {
  cycleId: string;
  batchReference: string;
  totalRecords: number;
  creditedCount: number;
  failedCount: number;
  pendingCount: number;
  totalDisbursedAmount: number;
}

// ============================================================================
// 13. Full & Final Settlement (F&F)
// ============================================================================
export interface FnfSettlementRecord {
  id: string;
  settlementNumber: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  resignationDate: string;
  lastWorkingDay: string;
  tenureYears: number;
  unpaidSalaryDays: number;
  unpaidSalaryAmount: number;
  leaveEncashmentDays: number;
  leaveEncashmentAmount: number;
  gratuityAmount: number;
  proratedBonusAmount: number;
  noticePeriodShortfallDays: number;
  noticeRecoveryAmount: number;
  loanRecoveryAmount: number;
  assetDamageRecoveryAmount: number;
  tdsOnSettlement: number;
  netPayableOrRecoverable: number;
  clearanceStatus: 'IT & Asset Pending' | 'Finance Review' | 'Approved' | 'Settled';
}

export interface InitiateFnfPayload {
  employeeId: string;
  lastWorkingDay: string;
  leaveEncashmentDays: number;
  noticePeriodShortfallDays: number;
  assetDamageRecoveryAmount: number;
  remarks: string;
}

// ============================================================================
// 14. Arrears, Revisions & Corrections
// ============================================================================
export interface ArrearAdjustmentRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  department: string;
  adjustmentType: 'Retro Salary Revision' | 'LOP Reversal Arrear' | 'Attendance Correction' | 'Manual Recovery';
  effectiveFromDate: string;
  targetPayCycleId: string;
  targetPayCycleName: string;
  monthsCovered: number;
  grossArrearAmount: number;
  statutoryImpactAmount: number;
  netAdjustmentAmount: number;
  reason: string;
  status: 'Calculated' | 'Included in Run' | 'Paid' | 'Reversed';
  createdBy: string;
  createdAt: string;
}

export interface CreateCorrectionEntryPayload {
  employeeId: string;
  adjustmentType: ArrearAdjustmentRecord['adjustmentType'];
  effectiveFromDate: string;
  targetPayCycleId: string;
  grossArrearAmount: number;
  reason: string;
}

// ============================================================================
// 15. Reports & Analytics
// ============================================================================
export type PayrollReportCode =
  | 'salary_register'
  | 'payroll_summary'
  | 'department_cost_center'
  | 'statutory_compliance'
  | 'bank_transfer_statement'
  | 'variance_analysis'
  | 'lop_attendance_impact'
  | 'overtime_register'
  | 'loan_recovery_ledger'
  | 'reimbursement_register'
  | 'tax_deduction_tds'
  | 'ctc_master_sheet'
  | 'headcount_payroll_cost'
  | 'attrition_fnf_cost'
  | 'year_end_reconciliation';

export interface PayrollReportCatalogItem {
  code: PayrollReportCode;
  title: string;
  category: 'Core Payroll' | 'Statutory & Tax' | 'Cost & Variance' | 'Deductions & Reimbursements';
  description: string;
  availableColumns: { key: string; label: string }[];
  supportedFormats: ('csv' | 'xlsx' | 'pdf')[];
}

export interface PayrollReportDataResponse {
  reportCode: PayrollReportCode;
  reportTitle: string;
  generatedAt: string;
  columns: { key: string; label: string; isNumeric?: boolean }[];
  rows: Record<string, string | number>[];
  totalsRow?: Record<string, string | number>;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface SavedReportPreset {
  id: string;
  name: string;
  reportCode: PayrollReportCode;
  selectedColumns: string[];
  filters: Record<string, string>;
  createdAt: string;
}

export interface CreateReportPresetPayload {
  name: string;
  reportCode: PayrollReportCode;
  selectedColumns: string[];
  filters: Record<string, string>;
}

// ============================================================================
// 16. Payroll Settings & Automation Rules
// ============================================================================
export interface PayrollSettingsConfiguration {
  payCycleFrequency: 'Monthly' | 'Bi-Weekly' | 'Weekly';
  payPeriodStartDay: number;
  attendanceCutoffDay: number;
  payoutDayOfMonth: number;
  payDaysCalculationBasis: 'Actual Calendar Days' | 'Working Days Only' | 'Fixed 30 Days' | 'Fixed 26 Days';
  roundingRule: 'Nearest Rupee' | 'Round Up' | 'Round Down' | 'Exact Two Decimals';
  defaultCurrencyCode: string;
  activeFinancialYear: string;
  defaultTaxRegime: 'New Regime' | 'Old Regime';
  automationRules: {
    autoRunEnabled: boolean;
    cronScheduleExpression: string;
    autoLockAttendanceOnCutoff: boolean;
    autoComputeStatutoryChallans: boolean;
    autoGenerateBankAdviceOnApproval: boolean;
    autoPublishPayslipsOnDisbursement: boolean;
    varianceAlertThresholdPercent: number;
    negativeNetPayAutoHold: boolean;
    notificationChannels: ('in_app' | 'email' | 'whatsapp' | 'slack')[];
  };
}

// ============================================================================
// 17. Audit Logs
// ============================================================================
export interface PayrollAuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: PayrollRole;
  ipAddress: string;
  moduleName: string;
  actionType:
    | 'PAYROLL_RUN_EXECUTED'
    | 'PAYROLL_ROLLBACK'
    | 'SALARY_REVISION'
    | 'LOP_OVERRIDE'
    | 'SENSITIVE_FIELD_REVEALED'
    | 'STATUTORY_CONFIG_UPDATED'
    | 'BANK_FILE_DOWNLOADED'
    | 'FNF_APPROVED';
  entityReference: string;
  summary: string;
  beforeSnapshot?: Record<string, unknown>;
  afterSnapshot?: Record<string, unknown>;
}

// ============================================================================
// 18. Notifications
// ============================================================================
export interface PayrollNotificationItem {
  id: string;
  title: string;
  message: string;
  category: 'Run Status' | 'Approval Required' | 'Statutory Deadline' | 'Disbursement Alert' | 'Tax Window';
  severity: 'info' | 'success' | 'warning' | 'critical';
  createdAt: string;
  isRead: boolean;
  targetModule?: PayrollModuleId;
}

export interface PayrollNotificationPreferences {
  emailOnRunCompletion: boolean;
  emailOnApprovalPending: boolean;
  emailOnStatutoryFilingDue: boolean;
  whatsappPayslipAlert: boolean;
  inAppExceptionAlerts: boolean;
}

// ============================================================================
// 19. Employee Self-Service (ESS) — My Pay
// ============================================================================
export interface EssBankChangeRequest {
  id: string;
  bankName: string;
  accountNumberMasked: string;
  ifscCode: string;
  status: 'Pending Verification' | 'Approved' | 'Rejected';
  submittedAt: string;
}

export interface EssMyPayOverview {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  designation: string;
  department: string;
  annualCtc: number;
  latestNetPay: number;
  latestPayCycleName: string;
  activeTaxRegime: 'New Regime' | 'Old Regime';
  ytdGrossEarnings: number;
  ytdTotalDeductions: number;
  ytdTaxDeducted: number;
  ytdNetTakeHome: number;
  projectedAnnualTaxLiability: number;
  remainingTaxToBeDeducted: number;
  recentPayslips: PayslipRecord[];
  ctcStructureLines: {
    componentName: string;
    category: SalaryComponentCategory;
    monthlyAmount: number;
    annualAmount: number;
  }[];
  activeLoans: LoanAccountRecord[];
  reimbursementClaims: ReimbursementClaimRecord[];
  form16Records: Form16EmployeeStatus[];
  bankChangeRequests: EssBankChangeRequest[];
}

export interface SubmitEssTaxDeclarationPayload {
  financialYear: string;
  selectedRegime: 'New Regime' | 'Old Regime';
  declarations: {
    sectionCode: TaxDeclarationSectionItem['sectionCode'];
    particulars: string;
    declaredAmount: number;
  }[];
}
