# OFC360 Enterprise Payroll Module — Frontend REST API Contract

**Base URL**: Configured via `NEXT_PUBLIC_API_BASE_URL` (imported from `@/lib/auth-api` as `API_BASE_URL`).  
**Authentication**: `Authorization: Bearer <access_token>` header attached automatically from `authClient.getAccessToken()`.  
**Calculations Policy**: All payroll calculations, tax projections, statutory deductions, EMI schedules, arrears, and F&F settlements are computed exclusively by the backend. The frontend only displays returned values, validates user inputs, formats currency (`Intl.NumberFormat`), and triggers API actions.

---

## Standard Envelopes & Error Codes

### Paginated Response (`PaginatedResponse<T>`)
```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "pageSize": 20,
  "totalPages": 0
}
```

### Standard Query Parameters (`PayrollQueryParams`)
- `page?: number` (1-indexed)
- `pageSize?: number` (default 20)
- `search?: string`
- `sortBy?: string`
- `sortOrder?: 'asc' | 'desc'`
- `department?: string`
- `location?: string`
- `status?: string`
- `cycleId?: string`
- `financialYear?: string`

### HTTP Error Codes Handled by Frontend
- `400 Bad Request`: Field-level validation errors (`{ message, code, fieldErrors }`)
- `401 Unauthorized`: Missing or expired JWT token
- `403 Forbidden`: Role/permission denied (`PayrollPermissionDenied` state rendered)
- `404 Not Found`: Resource or cycle not found
- `409 Conflict`: Concurrent payroll run lock or attendance already locked
- `422 Unprocessable Entity`: Pre-run validation or formula syntax failure
- `500 / 503 Server Error`: Rendered via `PayrollErrorState` with retry action

---

## Module 1: Payroll Dashboard (`/api/v1/payroll/dashboard`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/dashboard/summary` | `?cycleId=&financialYear=` | `PayrollDashboardResponse` | `payroll.dashboard.view` | Required from backend |

---

## Module 2: Pay Calendar & Automated Payroll Run (`/api/v1/payroll/runs`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/calendars` | `?financialYear=` | `PayCalendarCycle[]` | `payroll.run.view` | Required from backend |
| `GET` | `/api/v1/payroll/runs/current` | `?cycleId=` | `PayrollRunDetail` | `payroll.run.view` | Required from backend |
| `GET` | `/api/v1/payroll/runs/:runId/progress` | — | `PayrollRunProgressResponse` | `payroll.run.view` | Required from backend |
| `GET` | `/api/v1/payroll/runs/:runId/validation` | — | `PreRunValidationReport` | `payroll.run.view` | Required from backend |
| `POST` | `/api/v1/payroll/runs/:runId/execute` | `{ runType, stepCode? }` | `PayrollRunDetail` | `payroll.run.execute` | Required from backend |
| `POST` | `/api/v1/payroll/runs/:runId/pause` | `{ reason }` | `PayrollRunDetail` | `payroll.run.execute` | Required from backend |
| `POST` | `/api/v1/payroll/runs/:runId/resume` | — | `PayrollRunDetail` | `payroll.run.execute` | Required from backend |
| `POST` | `/api/v1/payroll/runs/:runId/retry-step` | `{ stage }` | `PayrollRunDetail` | `payroll.run.execute` | Required from backend |
| `POST` | `/api/v1/payroll/runs/:runId/rollback` | `{ reason, targetStage }` | `PayrollRunDetail` | `payroll.run.rollback` | Required from backend |
| `GET` | `/api/v1/payroll/runs/:runId/employees` | `PayrollQueryParams` | `PaginatedResponse<PayrollRunEmployeeSummary>` | `payroll.run.view` | Required from backend |
| `GET` | `/api/v1/payroll/runs/:runId/employees/:employeeId` | — | `PayrollEmployeeDrilldown` | `payroll.run.view` | Required from backend |
| `POST` | `/api/v1/payroll/runs/:runId/employees/:employeeId/hold` | `{ action: 'hold' \| 'release', reason }` | `PayrollRunEmployeeSummary` | `payroll.run.hold` | Required from backend |
| `POST` | `/api/v1/payroll/runs/off-cycle` | `CreateOffCycleRunPayload` | `PayrollRunDetail` | `payroll.run.execute` | Required from backend |
| `GET` | `/api/v1/payroll/runs/:runId/variance` | `?compareWithRunId=` | `PayrollRunVarianceComparison` | `payroll.run.view` | Required from backend |

---

## Module 3: Salary Structure & Components (`/api/v1/payroll/structures`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/components` | `PayrollQueryParams` | `PaginatedResponse<SalaryComponentItem>` | `payroll.structure.view` | Required from backend |
| `POST` | `/api/v1/payroll/components` | `UpsertSalaryComponentPayload` | `SalaryComponentItem` | `payroll.structure.manage` | Required from backend |
| `PUT` | `/api/v1/payroll/components/:id` | `UpsertSalaryComponentPayload` | `SalaryComponentItem` | `payroll.structure.manage` | Required from backend |
| `DELETE` | `/api/v1/payroll/components/:id` | — | `{ deleted: boolean }` | `payroll.structure.manage` | Required from backend |
| `POST` | `/api/v1/payroll/components/validate-formula` | `{ expression, componentType }` | `FormulaValidationResponse` | `payroll.structure.manage` | Required from backend |
| `GET` | `/api/v1/payroll/structures` | `PayrollQueryParams` | `PaginatedResponse<SalaryStructureTemplate>` | `payroll.structure.view` | Required from backend |
| `POST` | `/api/v1/payroll/structures` | `UpsertSalaryStructurePayload` | `SalaryStructureTemplate` | `payroll.structure.manage` | Required from backend |
| `PUT` | `/api/v1/payroll/structures/:id` | `UpsertSalaryStructurePayload` | `SalaryStructureTemplate` | `payroll.structure.manage` | Required from backend |
| `POST` | `/api/v1/payroll/structures/preview-ctc` | `CtcPreviewRequestPayload` | `CtcBreakupPreviewResponse` | `payroll.structure.view` | Required from backend |

---

## Module 4: Employee Compensation (`/api/v1/payroll/compensation`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/compensation` | `PayrollQueryParams` | `PaginatedResponse<EmployeeCompensationRecord>` | `payroll.compensation.view` | Required from backend |
| `GET` | `/api/v1/payroll/compensation/:employeeId/history` | — | `SalaryRevisionHistoryItem[]` | `payroll.compensation.view` | Required from backend |
| `POST` | `/api/v1/payroll/compensation/assign` | `AssignCompensationPayload` | `EmployeeCompensationRecord` | `payroll.compensation.manage` | Required from backend |
| `POST` | `/api/v1/payroll/compensation/bulk-validate` | `FormData (file)` | `BulkUploadValidationPreview` | `payroll.compensation.manage` | Required from backend |
| `POST` | `/api/v1/payroll/compensation/bulk-commit` | `{ batchId }` | `{ importedCount: number }` | `payroll.compensation.manage` | Required from backend |
| `POST` | `/api/v1/payroll/compensation/:employeeId/reveal-sensitive` | `{ field }` | `{ unmaskedValue: string }` | `payroll.sensitive.reveal` | Required from backend |

---

## Module 5: Attendance, Leave & LOP Integration (`/api/v1/payroll/attendance-lop`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/attendance-lop` | `PayrollQueryParams` | `PaginatedResponse<AttendanceLopRecord>` | `payroll.attendance.view` | Required from backend |
| `POST` | `/api/v1/payroll/attendance-lop/:employeeId/override` | `LopOverridePayload` | `AttendanceLopRecord` | `payroll.attendance.override` | Required from backend |
| `POST` | `/api/v1/payroll/attendance-lop/lock-status` | `{ cycleId, locked, reason }` | `{ cycleId: string, locked: boolean, updatedAt: string }` | `payroll.attendance.lock` | Required from backend |

---

## Module 6: Variable Inputs (`/api/v1/payroll/variable-inputs`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/variable-inputs` | `PayrollQueryParams & { category? }` | `PaginatedResponse<VariableInputRecord>` | `payroll.variables.view` | Required from backend |
| `POST` | `/api/v1/payroll/variable-inputs` | `CreateVariableInputPayload` | `VariableInputRecord` | `payroll.variables.manage` | Required from backend |
| `POST` | `/api/v1/payroll/variable-inputs/bulk-grid` | `{ cycleId, entries: CreateVariableInputPayload[] }` | `{ savedCount: number }` | `payroll.variables.manage` | Required from backend |
| `POST` | `/api/v1/payroll/variable-inputs/upload-validate` | `FormData (file, cycleId)` | `BulkUploadValidationPreview` | `payroll.variables.manage` | Required from backend |
| `GET` | `/api/v1/payroll/reimbursements` | `PayrollQueryParams` | `PaginatedResponse<ReimbursementClaimRecord>` | `payroll.variables.view` | Required from backend |
| `POST` | `/api/v1/payroll/reimbursements/:claimId/decision` | `{ status, approvedAmount, remarks }` | `ReimbursementClaimRecord` | `payroll.variables.manage` | Required from backend |

---

## Module 7: Loans & Advances (`/api/v1/payroll/loans`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/loans/types` | — | `LoanTypeConfig[]` | `payroll.loans.view` | Required from backend |
| `POST` | `/api/v1/payroll/loans/types` | `UpsertLoanTypePayload` | `LoanTypeConfig` | `payroll.loans.manage` | Required from backend |
| `GET` | `/api/v1/payroll/loans` | `PayrollQueryParams` | `PaginatedResponse<LoanAccountRecord>` | `payroll.loans.view` | Required from backend |
| `GET` | `/api/v1/payroll/loans/:loanId/schedule` | — | `LoanEmiScheduleItem[]` | `payroll.loans.view` | Required from backend |
| `POST` | `/api/v1/payroll/loans` | `CreateLoanRequestPayload` | `LoanAccountRecord` | `payroll.loans.view` | Required from backend |
| `POST` | `/api/v1/payroll/loans/:loanId/preclose` | `{ settlementMode, referenceNo, remarks }` | `LoanAccountRecord` | `payroll.loans.manage` | Required from backend |

---

## Module 8: Statutory Compliance (`/api/v1/payroll/statutory`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/statutory/summary` | `?cycleId=&financialYear=` | `StatutoryComplianceOverview` | `payroll.statutory.view` | Required from backend |
| `PUT` | `/api/v1/payroll/statutory/registrations` | `CompanyStatutoryRegistrationPayload` | `CompanyStatutoryRegistrationPayload` | `payroll.statutory.manage` | Required from backend |
| `GET` | `/api/v1/payroll/statutory/filings/:filingId/download` | — | `Blob (ECR / Challan / Form 24Q)` | `payroll.statutory.view` | Required from backend |
| `GET` | `/api/v1/payroll/statutory/form16` | `PayrollQueryParams` | `PaginatedResponse<Form16EmployeeStatus>` | `payroll.statutory.view` | Required from backend |
| `POST` | `/api/v1/payroll/statutory/form16/bulk-download` | `{ financialYear, part }` | `Blob (ZIP)` | `payroll.statutory.manage` | Required from backend |

---

## Module 9: Tax Declarations & Investment Proofs (`/api/v1/payroll/tax-declarations`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/tax-declarations` | `PayrollQueryParams` | `PaginatedResponse<TaxDeclarationRecord>` | `payroll.tax.view` | Required from backend |
| `POST` | `/api/v1/payroll/tax-declarations/:id/verify` | `{ itemId, status, verifiedAmount, remarks }` | `TaxDeclarationRecord` | `payroll.tax.verify` | Required from backend |
| `POST` | `/api/v1/payroll/tax-declarations/window` | `TaxWindowConfigPayload` | `TaxWindowConfigPayload` | `payroll.tax.verify` | Required from backend |

---

## Module 10: Approvals Workflow (`/api/v1/payroll/approvals`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/approvals` | `PayrollQueryParams & { entityType? }` | `PaginatedResponse<PayrollApprovalRequest>` | `payroll.approvals.view` | Required from backend |
| `POST` | `/api/v1/payroll/approvals/:id/decide` | `{ decision, comments }` | `PayrollApprovalRequest` | `payroll.approvals.act` | Required from backend |
| `POST` | `/api/v1/payroll/approvals/bulk-decide` | `{ ids, decision, comments }` | `{ processedCount: number }` | `payroll.approvals.act` | Required from backend |
| `POST` | `/api/v1/payroll/approvals/delegate` | `{ delegateToUserId, validFrom, validUntil, reason }` | `{ delegationId: string }` | `payroll.approvals.act` | Required from backend |

---

## Module 11: Payslips (`/api/v1/payroll/payslips`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/payslips` | `PayrollQueryParams` | `PaginatedResponse<PayslipRecord>` | `payroll.payslips.view` | Required from backend |
| `GET` | `/api/v1/payroll/payslips/:id` | — | `PayslipDetailedView` | `payroll.payslips.view` | Required from backend |
| `GET` | `/api/v1/payroll/payslips/:id/pdf` | `?passwordProtected=true` | `Blob (application/pdf)` | `payroll.payslips.view` | Required from backend |
| `POST` | `/api/v1/payroll/payslips/bulk-generate` | `{ cycleId }` | `{ jobId: string, count: number }` | `payroll.payslips.manage` | Required from backend |
| `POST` | `/api/v1/payroll/payslips/publish` | `{ cycleId, publish: boolean, channels: ('email'\|'whatsapp')[] }` | `{ updatedCount: number }` | `payroll.payslips.manage` | Required from backend |
| `GET` | `/api/v1/payroll/payslips/templates` | — | `PayslipTemplateConfig[]` | `payroll.payslips.manage` | Required from backend |
| `POST` | `/api/v1/payroll/payslips/templates/preview` | `{ templateId }` | `{ previewHtml: string }` | `payroll.payslips.manage` | Required from backend |

---

## Module 12: Bank Advice & Disbursement (`/api/v1/payroll/disbursements`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/disbursements` | `PayrollQueryParams` | `PaginatedResponse<DisbursementEmployeeRecord>` | `payroll.disbursement.view` | Required from backend |
| `POST` | `/api/v1/payroll/disbursements/generate-bank-file` | `{ cycleId, bankFormat, paymentMode }` | `Blob` | `payroll.disbursement.manage` | Required from backend |
| `POST` | `/api/v1/payroll/disbursements/upload-response` | `FormData (file, cycleId)` | `BankReconciliationSummary` | `payroll.disbursement.manage` | Required from backend |
| `POST` | `/api/v1/payroll/disbursements/:id/retry` | `{ paymentMode }` | `DisbursementEmployeeRecord` | `payroll.disbursement.manage` | Required from backend |

---

## Module 13: Full & Final Settlement (`/api/v1/payroll/fnf`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/fnf` | `PayrollQueryParams` | `PaginatedResponse<FnfSettlementRecord>` | `payroll.fnf.view` | Required from backend |
| `POST` | `/api/v1/payroll/fnf/initiate` | `InitiateFnfPayload` | `FnfSettlementRecord` | `payroll.fnf.manage` | Required from backend |
| `POST` | `/api/v1/payroll/fnf/:id/approve` | `{ comments }` | `FnfSettlementRecord` | `payroll.fnf.manage` | Required from backend |
| `GET` | `/api/v1/payroll/fnf/:id/statement-pdf` | — | `Blob (application/pdf)` | `payroll.fnf.view` | Required from backend |

---

## Module 14: Arrears, Revisions & Corrections (`/api/v1/payroll/arrears`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/arrears` | `PayrollQueryParams` | `PaginatedResponse<ArrearAdjustmentRecord>` | `payroll.arrears.view` | Required from backend |
| `POST` | `/api/v1/payroll/arrears/correction` | `CreateCorrectionEntryPayload` | `ArrearAdjustmentRecord` | `payroll.arrears.manage` | Required from backend |
| `POST` | `/api/v1/payroll/arrears/:id/include` | `{ targetCycleId }` | `ArrearAdjustmentRecord` | `payroll.arrears.manage` | Required from backend |

---

## Module 15: Reports & Analytics (`/api/v1/payroll/reports`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/reports/catalog` | — | `PayrollReportCatalogItem[]` | `payroll.reports.view` | Required from backend |
| `GET` | `/api/v1/payroll/reports/:reportCode/data` | `PayrollQueryParams & { columns? }` | `PayrollReportDataResponse` | `payroll.reports.view` | Required from backend |
| `GET` | `/api/v1/payroll/reports/:reportCode/export` | `?format=csv\|xlsx\|pdf&cycleId=` | `Blob` | `payroll.reports.export` | Required from backend |
| `GET` | `/api/v1/payroll/reports/presets` | — | `SavedReportPreset[]` | `payroll.reports.view` | Required from backend |
| `POST` | `/api/v1/payroll/reports/presets` | `CreateReportPresetPayload` | `SavedReportPreset` | `payroll.reports.view` | Required from backend |

---

## Module 16: Payroll Settings & Automation Rules (`/api/v1/payroll/settings`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/settings` | — | `PayrollSettingsConfiguration` | `payroll.settings.view` | Required from backend |
| `PUT` | `/api/v1/payroll/settings` | `PayrollSettingsConfiguration` | `PayrollSettingsConfiguration` | `payroll.settings.manage` | Required from backend |

---

## Module 17: Audit Logs (`/api/v1/payroll/audit-logs`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/audit-logs` | `PayrollQueryParams & { actor?, actionType?, fromDate?, toDate? }` | `PaginatedResponse<PayrollAuditLogEntry>` | `payroll.audit.view` | Required from backend |
| `GET` | `/api/v1/payroll/audit-logs/export` | `?format=csv\|pdf` | `Blob` | `payroll.audit.view` | Required from backend |

---

## Module 18: Notifications (`/api/v1/payroll/notifications`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/notifications` | `PayrollQueryParams` | `PaginatedResponse<PayrollNotificationItem>` | `payroll.notifications.view` | Required from backend |
| `POST` | `/api/v1/payroll/notifications/:id/read` | — | `PayrollNotificationItem` | `payroll.notifications.view` | Required from backend |
| `POST` | `/api/v1/payroll/notifications/read-all` | — | `{ updatedCount: number }` | `payroll.notifications.view` | Required from backend |
| `PUT` | `/api/v1/payroll/notifications/preferences` | `PayrollNotificationPreferences` | `PayrollNotificationPreferences` | `payroll.notifications.view` | Required from backend |

---

## Module 19: Employee Self-Service — My Pay (`/api/v1/payroll/ess`)

| Method | Path | Query / Body | Response Type | Permission | Status |
|---|---|---|---|---|---|
| `GET` | `/api/v1/payroll/ess/summary` | `?financialYear=` | `EssMyPayOverview` | `payroll.ess.self` | Required from backend |
| `POST` | `/api/v1/payroll/ess/tax-declaration` | `SubmitEssTaxDeclarationPayload` | `TaxDeclarationRecord` | `payroll.ess.self` | Required from backend |
| `POST` | `/api/v1/payroll/ess/tax-proof-upload` | `FormData (file, section, declaredAmount)` | `{ proofId: string, fileUrl: string }` | `payroll.ess.self` | Required from backend |
| `POST` | `/api/v1/payroll/ess/reimbursement-claim` | `FormData (billFile, category, claimAmount, billDate, description)` | `ReimbursementClaimRecord` | `payroll.ess.self` | Required from backend |
| `POST` | `/api/v1/payroll/ess/bank-change-request` | `FormData (proofFile, bankName, accountNumber, ifscCode, reason)` | `EssBankChangeRequest` | `payroll.ess.self` | Required from backend |
