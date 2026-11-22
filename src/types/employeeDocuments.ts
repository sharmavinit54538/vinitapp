export type DocumentMainTabId =
  | 'overview'
  | 'all-documents'
  | 'verification'
  | 'requests-expiry'
  | 'templates-generator'
  | 'reports-settings';

export type DocumentCategoryCode =
  | 'IDENTITY'
  | 'ADDRESS'
  | 'EDUCATION'
  | 'PREVIOUS_EMPLOYMENT'
  | 'JOINING'
  | 'PAYROLL'
  | 'PERFORMANCE'
  | 'EXIT';

export type DocumentVerificationStatus =
  | 'Pending'
  | 'Under Review'
  | 'Verified'
  | 'Rejected'
  | 'Resubmission Required'
  | 'Expired';

export type DocumentExpiryBucket =
  | 'No Expiry'
  | 'Valid'
  | 'Expiring in 60 Days'
  | 'Expiring in 30 Days'
  | 'Expiring in 15 Days'
  | 'Expiring in 7 Days'
  | 'Expired';

export type ConfidentialityLevel =
  | 'Public Internal'
  | 'Standard HR'
  | 'Confidential'
  | 'Strictly Restricted (PII)';

export type SupportedFileExtension = 'PDF' | 'JPG' | 'JPEG' | 'PNG' | 'DOC' | 'DOCX';

export interface DocumentVersionEntry {
  versionNumber: string;
  uploadedAt: string;
  uploadedBy: string;
  fileName: string;
  fileSizeFormatted: string;
  changeNotes: string;
  statusAtVersion: DocumentVerificationStatus;
}

export interface DocumentAiIntelligence {
  classifiedType: string;
  confidenceScorePct: number;
  ocrTextPreview: string;
  extractedFields: {
    label: string;
    value: string;
    matchedWithProfile: boolean;
  }[];
  missingFields: string[];
  duplicateWarning: boolean;
  duplicateRefId?: string;
  qualityAssessment: 'High Clarity (300+ DPI)' | 'Acceptable' | 'Low Resolution / Blurry';
  dataMismatchDetected: boolean;
  mismatchDetails?: string;
  completionSuggestions: string[];
}

export interface EmployeeDocumentRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  avatarInitials: string;
  department: string;
  designation: string;
  joiningDate: string;
  employmentStatus: 'Active' | 'Probation' | 'Notice Period';
  documentName: string;
  categoryCode: DocumentCategoryCode;
  categoryLabel: string;
  documentType: string;
  fileExtension: SupportedFileExtension;
  fileSizeBytes: number;
  fileSizeFormatted: string;
  uploadDate: string;
  issueDate: string;
  expiryDate: string | null;
  verificationStatus: DocumentVerificationStatus;
  uploadedBy: string;
  confidentiality: ConfidentialityLevel;
  maskedIdentifier?: string;
  unmaskedIdentifier?: string;
  description: string;
  tags: string[];
  mandatory: boolean;
  archived: boolean;
  reviewerName?: string;
  reviewedAt?: string;
  reviewerRemarks?: string;
  internalNotes?: string;
  checklistState: {
    legibilityVerified: boolean;
    nameMatchesProfile: boolean;
    idNumberValidated: boolean;
    validityDateChecked: boolean;
    authenticityStampChecked: boolean;
  };
  versions: DocumentVersionEntry[];
  aiIntelligence: DocumentAiIntelligence;
}

export interface EmployeeDigitalProfileSummary {
  employeeId: string;
  employeeName: string;
  avatarInitials: string;
  department: string;
  designation: string;
  joiningDate: string;
  employmentStatus: 'Active' | 'Probation' | 'Notice Period';
  email: string;
  location: string;
  reportingManager: string;
  annualCtcFormatted: string;
  totalDocuments: number;
  verifiedDocuments: number;
  pendingDocuments: number;
  rejectedDocuments: number;
  missingMandatoryDocuments: string[];
  completionPercentage: number;
}

export type DocumentRequestStatus =
  | 'Draft'
  | 'Sent'
  | 'Pending'
  | 'Submitted'
  | 'Overdue'
  | 'Completed'
  | 'Cancelled';

export interface DocumentRequestRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  requiredDocumentType: string;
  categoryCode: DocumentCategoryCode;
  dueDate: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  instructions: string;
  status: DocumentRequestStatus;
  createdAt: string;
  requestedBy: string;
  remindersSentCount: number;
  lastReminderAt?: string;
}

export type HrTemplateKey =
  | 'OFFER_LETTER'
  | 'APPOINTMENT_LETTER'
  | 'EMPLOYMENT_AGREEMENT'
  | 'NDA'
  | 'SALARY_CERTIFICATE'
  | 'EXPERIENCE_CERTIFICATE'
  | 'RELIEVING_LETTER'
  | 'PROMOTION_LETTER'
  | 'INCREMENT_LETTER'
  | 'WARNING_LETTER'
  | 'CONFIRMATION_LETTER';

export interface DocumentTemplateRecord {
  id: string;
  key: HrTemplateKey | string;
  name: string;
  categoryCode: DocumentCategoryCode;
  description: string;
  mandatoryForJoining: boolean;
  active: boolean;
  version: string;
  lastUpdated: string;
  placeholders: string[];
  bodyContent: string;
}

export interface GeneratedDocumentHistoryItem {
  id: string;
  templateId: string;
  templateName: string;
  employeeId: string;
  employeeName: string;
  department: string;
  generatedAt: string;
  generatedBy: string;
  referenceNumber: string;
  renderedContent: string;
}

export interface DocumentCategoryConfig {
  code: DocumentCategoryCode | string;
  name: string;
  description: string;
  mandatoryTypes: string[];
  optionalTypes: string[];
  retentionYears: number;
  defaultConfidentiality: ConfidentialityLevel;
  active: boolean;
}

export type DocumentAuditAction =
  | 'Document Uploaded'
  | 'Document Viewed'
  | 'Document Downloaded'
  | 'Document Updated'
  | 'Document Replaced'
  | 'Document Verified'
  | 'Document Rejected'
  | 'Document Archived'
  | 'Document Generated'
  | 'Document Requested';

export interface DocumentAuditLogEntry {
  id: string;
  action: DocumentAuditAction;
  employeeId: string;
  employeeName: string;
  documentId: string;
  documentName: string;
  performedBy: string;
  timestamp: string;
  previousVersion: string;
  currentVersion: string;
  remarks: string;
}

export type DocumentReportType =
  | 'TOTAL_DOCUMENTS'
  | 'EMPLOYEE_COMPLETION'
  | 'MISSING_DOCUMENTS'
  | 'PENDING_VERIFICATION'
  | 'EXPIRED_DOCUMENTS'
  | 'DEPARTMENT_COMPLIANCE'
  | 'UPLOAD_ACTIVITY'
  | 'REJECTION_ANALYSIS';

export interface DocumentSecuritySettings {
  maxFileSizeMb: number;
  allowedFormats: SupportedFileExtension[];
  requireReasonOnRejection: boolean;
  autoMaskSensitiveIdentifiers: boolean;
  watermarkPreviews: boolean;
  expiryReminderDays: number[];
  retentionYearsDefault: number;
  autoArchiveOnExitDays: number;
  rolePermissions: {
    role: string;
    canViewAll: boolean;
    canUpload: boolean;
    canVerifyApprove: boolean;
    canDelete: boolean;
    canUnmaskPii: boolean;
    canGenerateLetters: boolean;
  }[];
}

export interface DocumentDashboardKpis {
  totalDocuments: number;
  verifiedDocuments: number;
  pendingVerification: number;
  rejectedDocuments: number;
  missingDocumentsCount: number;
  expiringSoonCount: number;
  expiredDocumentsCount: number;
  completionRatePct: number;
}
