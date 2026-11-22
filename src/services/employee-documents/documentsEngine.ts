import {
  ConfidentialityLevel,
  DocumentAuditLogEntry,
  DocumentCategoryCode,
  DocumentCategoryConfig,
  DocumentDashboardKpis,
  DocumentExpiryBucket,
  DocumentRequestRecord,
  DocumentSecuritySettings,
  DocumentTemplateRecord,
  DocumentVerificationStatus,
  EmployeeDigitalProfileSummary,
  EmployeeDocumentRecord,
  GeneratedDocumentHistoryItem,
  SupportedFileExtension,
} from '../../types/employeeDocuments';

export const REFERENCE_TODAY_ISO = '2026-11-11';

export const INITIAL_CATEGORY_CONFIGS: DocumentCategoryConfig[] = [
  {
    code: 'IDENTITY',
    name: 'A. Identity Documents',
    description: 'Government-issued statutory identity and citizenship credentials.',
    mandatoryTypes: ['Aadhaar Card', 'PAN Card'],
    optionalTypes: ['Passport', 'Voter ID', 'Driving Licence'],
    retentionYears: 10,
    defaultConfidentiality: 'Strictly Restricted (PII)',
    active: true,
  },
  {
    code: 'ADDRESS',
    name: 'B. Address Documents',
    description: 'Verified permanent and current residential proof records.',
    mandatoryTypes: ['Permanent Address Proof', 'Current Address Proof'],
    optionalTypes: ['Utility Bill'],
    retentionYears: 7,
    defaultConfidentiality: 'Confidential',
    active: true,
  },
  {
    code: 'EDUCATION',
    name: 'C. Education Documents',
    description: 'Academic transcripts, university degrees, and technical certifications.',
    mandatoryTypes: ['10th Marksheet', '12th Marksheet', 'Graduation Certificate'],
    optionalTypes: [
      'Post Graduation Certificate',
      'Diploma',
      'Professional Certifications',
    ],
    retentionYears: 8,
    defaultConfidentiality: 'Standard HR',
    active: true,
  },
  {
    code: 'PREVIOUS_EMPLOYMENT',
    name: 'D. Previous Employment',
    description: 'Prior employer relieving letters, experience certificates, and payslips.',
    mandatoryTypes: ['Experience Letter', 'Relieving Letter'],
    optionalTypes: ['Previous Company Payslips', 'Employment Agreement'],
    retentionYears: 8,
    defaultConfidentiality: 'Confidential',
    active: true,
  },
  {
    code: 'JOINING',
    name: 'E. Joining Documents',
    description: 'Signed onboarding agreements, offer letters, NDAs, and declarations.',
    mandatoryTypes: [
      'Offer Letter',
      'Appointment Letter',
      'Joining Form',
      'Employee Declaration',
      'NDA',
    ],
    optionalTypes: [],
    retentionYears: 10,
    defaultConfidentiality: 'Confidential',
    active: true,
  },
  {
    code: 'PAYROLL',
    name: 'F. Payroll Documents',
    description: 'Bank account verification, tax declarations, and EPFO/UAN filings.',
    mandatoryTypes: ['Bank Proof', 'Cancelled Cheque', 'Tax Declaration'],
    optionalTypes: ['PF/UAN Related Documents'],
    retentionYears: 8,
    defaultConfidentiality: 'Strictly Restricted (PII)',
    active: true,
  },
  {
    code: 'PERFORMANCE',
    name: 'G. Performance Documents',
    description: 'Annual appraisal letters, promotions, increments, and PIP records.',
    mandatoryTypes: [],
    optionalTypes: [
      'Appraisal Letter',
      'Promotion Letter',
      'Increment Letter',
      'Performance Improvement Letter',
    ],
    retentionYears: 7,
    defaultConfidentiality: 'Confidential',
    active: true,
  },
  {
    code: 'EXIT',
    name: 'H. Exit Documents',
    description: 'Offboarding clearance, resignation, FnF settlement, and relieving records.',
    mandatoryTypes: [],
    optionalTypes: [
      'Resignation Letter',
      'Exit Clearance',
      'Full & Final Settlement',
      'Relieving Letter',
      'Experience Certificate',
    ],
    retentionYears: 10,
    defaultConfidentiality: 'Confidential',
    active: true,
  },
];

export const CORE_MANDATORY_CHECKLIST: {
  type: string;
  categoryCode: DocumentCategoryCode;
}[] = [
  { type: 'Aadhaar Card', categoryCode: 'IDENTITY' },
  { type: 'PAN Card', categoryCode: 'IDENTITY' },
  { type: 'Permanent Address Proof', categoryCode: 'ADDRESS' },
  { type: 'Graduation Certificate', categoryCode: 'EDUCATION' },
  { type: 'Offer Letter', categoryCode: 'JOINING' },
  { type: 'NDA', categoryCode: 'JOINING' },
  { type: 'Cancelled Cheque', categoryCode: 'PAYROLL' },
];

export const SEED_EMPLOYEES: Omit<
  EmployeeDigitalProfileSummary,
  | 'totalDocuments'
  | 'verifiedDocuments'
  | 'pendingDocuments'
  | 'rejectedDocuments'
  | 'missingMandatoryDocuments'
  | 'completionPercentage'
>[] = [
  {
    employeeId: 'EMP-1001',
    employeeName: 'Aarav Sharma',
    avatarInitials: 'AS',
    department: 'Engineering',
    designation: 'Principal Product Engineer',
    joiningDate: '2023-04-10',
    employmentStatus: 'Active',
    email: 'aarav.sharma@ofc360.com',
    location: 'Bengaluru HQ',
    reportingManager: 'Vikramaditya Rao',
    annualCtcFormatted: '₹32,00,000',
  },
  {
    employeeId: 'EMP-1002',
    employeeName: 'Elena Rostova',
    avatarInitials: 'ER',
    department: 'Engineering',
    designation: 'Staff Cloud Architect',
    joiningDate: '2024-01-15',
    employmentStatus: 'Active',
    email: 'elena.rostova@ofc360.com',
    location: 'Bengaluru HQ',
    reportingManager: 'Vikramaditya Rao',
    annualCtcFormatted: '₹28,50,000',
  },
  {
    employeeId: 'EMP-1003',
    employeeName: 'Vikramaditya Nair',
    avatarInitials: 'VN',
    department: 'Product & Design',
    designation: 'Lead Product Designer',
    joiningDate: '2024-06-01',
    employmentStatus: 'Active',
    email: 'vikram.nair@ofc360.com',
    location: 'Mumbai West',
    reportingManager: 'Siddharth Mehta',
    annualCtcFormatted: '₹24,00,000',
  },
  {
    employeeId: 'EMP-1004',
    employeeName: 'Priya Krishnan',
    avatarInitials: 'PK',
    department: 'People Operations',
    designation: 'HR Compliance Specialist',
    joiningDate: '2025-02-12',
    employmentStatus: 'Active',
    email: 'priya.krishnan@ofc360.com',
    location: 'Bengaluru HQ',
    reportingManager: 'Ananya Verma',
    annualCtcFormatted: '₹16,50,000',
  },
  {
    employeeId: 'EMP-1005',
    employeeName: 'Marcus Vance',
    avatarInitials: 'MV',
    department: 'Sales & GTM',
    designation: 'Enterprise Account Director',
    joiningDate: '2025-08-19',
    employmentStatus: 'Probation',
    email: 'marcus.vance@ofc360.com',
    location: 'Delhi NCR',
    reportingManager: 'Rohan Mehta',
    annualCtcFormatted: '₹22,00,000',
  },
  {
    employeeId: 'EMP-1006',
    employeeName: 'Sora Takahashi',
    avatarInitials: 'ST',
    department: 'Product & Design',
    designation: 'Senior UX Researcher',
    joiningDate: '2024-09-05',
    employmentStatus: 'Active',
    email: 'sora.takahashi@ofc360.com',
    location: 'Hyderabad Hub',
    reportingManager: 'Siddharth Mehta',
    annualCtcFormatted: '₹19,80,000',
  },
  {
    employeeId: 'EMP-1007',
    employeeName: 'Rohan Kulkarni',
    avatarInitials: 'RK',
    department: 'Finance & Legal',
    designation: 'Senior Payroll Controller',
    joiningDate: '2023-11-20',
    employmentStatus: 'Notice Period',
    email: 'rohan.kulkarni@ofc360.com',
    location: 'Mumbai West',
    reportingManager: 'Meera Krishnan',
    annualCtcFormatted: '₹21,00,000',
  },
];

export const INITIAL_DOCUMENTS: EmployeeDocumentRecord[] = [
  {
    id: 'DOC-2026-001',
    employeeId: 'EMP-1001',
    employeeName: 'Aarav Sharma',
    avatarInitials: 'AS',
    department: 'Engineering',
    designation: 'Principal Product Engineer',
    joiningDate: '2023-04-10',
    employmentStatus: 'Active',
    documentName: 'Aarav_Sharma_Aadhaar_eKYC.pdf',
    categoryCode: 'IDENTITY',
    categoryLabel: 'A. Identity Documents',
    documentType: 'Aadhaar Card',
    fileExtension: 'PDF',
    fileSizeBytes: 842100,
    fileSizeFormatted: '822 KB',
    uploadDate: '2026-10-02',
    issueDate: '2019-05-14',
    expiryDate: null,
    verificationStatus: 'Verified',
    uploadedBy: 'Aarav Sharma (Self-Service)',
    confidentiality: 'Strictly Restricted (PII)',
    maskedIdentifier: 'XXXX-XXXX-4829',
    unmaskedIdentifier: '6291-8402-4829',
    description: 'UIDAI digitally signed Aadhaar e-KYC XML/PDF extract.',
    tags: ['KYC', 'UIDAI', 'Mandatory'],
    mandatory: true,
    archived: false,
    reviewerName: 'Priya Krishnan (HR Ops)',
    reviewedAt: '2026-10-03 11:20 AM',
    reviewerRemarks: 'Verified against UIDAI QR signature and employee master name.',
    checklistState: {
      legibilityVerified: true,
      nameMatchesProfile: true,
      idNumberValidated: true,
      validityDateChecked: true,
      authenticityStampChecked: true,
    },
    versions: [
      {
        versionNumber: 'v1.0',
        uploadedAt: '2026-10-02 09:45 AM',
        uploadedBy: 'Aarav Sharma',
        fileName: 'Aarav_Sharma_Aadhaar_eKYC.pdf',
        fileSizeFormatted: '822 KB',
        changeNotes: 'Initial onboarding upload',
        statusAtVersion: 'Verified',
      },
    ],
    aiIntelligence: {
      classifiedType: 'Aadhaar Card (Government ID)',
      confidenceScorePct: 99.2,
      ocrTextPreview:
        'UNIQUE IDENTIFICATION AUTHORITY OF INDIA · Name: AARAV SHARMA · DOB: 14/08/1993 · Aadhaar: XXXX-XXXX-4829 · Address: Bellandur, Bengaluru 560103',
      extractedFields: [
        { label: 'Full Name', value: 'Aarav Sharma', matchedWithProfile: true },
        { label: 'Aadhaar Number (Last 4)', value: '4829', matchedWithProfile: true },
        { label: 'Pin Code', value: '560103', matchedWithProfile: true },
      ],
      missingFields: [],
      duplicateWarning: false,
      qualityAssessment: 'High Clarity (300+ DPI)',
      dataMismatchDetected: false,
      completionSuggestions: ['Identity proof complete for statutory PF seeding.'],
    },
  },
  {
    id: 'DOC-2026-002',
    employeeId: 'EMP-1001',
    employeeName: 'Aarav Sharma',
    avatarInitials: 'AS',
    department: 'Engineering',
    designation: 'Principal Product Engineer',
    joiningDate: '2023-04-10',
    employmentStatus: 'Active',
    documentName: 'Aarav_Sharma_PAN_IncomeTax.pdf',
    categoryCode: 'IDENTITY',
    categoryLabel: 'A. Identity Documents',
    documentType: 'PAN Card',
    fileExtension: 'PDF',
    fileSizeBytes: 512000,
    fileSizeFormatted: '500 KB',
    uploadDate: '2026-10-02',
    issueDate: '2016-07-20',
    expiryDate: null,
    verificationStatus: 'Verified',
    uploadedBy: 'Aarav Sharma (Self-Service)',
    confidentiality: 'Strictly Restricted (PII)',
    maskedIdentifier: 'ABCPS••••K',
    unmaskedIdentifier: 'ABCPS4912K',
    description: 'Income Tax Department Permanent Account Number card.',
    tags: ['Tax', 'TDS', 'Mandatory'],
    mandatory: true,
    archived: false,
    reviewerName: 'Priya Krishnan (HR Ops)',
    reviewedAt: '2026-10-03 11:25 AM',
    reviewerRemarks: 'NSDL PAN active status confirmed.',
    checklistState: {
      legibilityVerified: true,
      nameMatchesProfile: true,
      idNumberValidated: true,
      validityDateChecked: true,
      authenticityStampChecked: true,
    },
    versions: [
      {
        versionNumber: 'v1.0',
        uploadedAt: '2026-10-02 09:50 AM',
        uploadedBy: 'Aarav Sharma',
        fileName: 'Aarav_Sharma_PAN_IncomeTax.pdf',
        fileSizeFormatted: '500 KB',
        changeNotes: 'Initial PAN upload',
        statusAtVersion: 'Verified',
      },
    ],
    aiIntelligence: {
      classifiedType: 'PAN Card (Tax ID)',
      confidenceScorePct: 98.7,
      ocrTextPreview:
        'INCOME TAX DEPARTMENT · GOVT. OF INDIA · Permanent Account Number: ABCPS4912K · Name: AARAV SHARMA',
      extractedFields: [
        { label: 'Full Name', value: 'Aarav Sharma', matchedWithProfile: true },
        { label: 'PAN Number', value: 'ABCPS4912K', matchedWithProfile: true },
      ],
      missingFields: [],
      duplicateWarning: false,
      qualityAssessment: 'High Clarity (300+ DPI)',
      dataMismatchDetected: false,
      completionSuggestions: ['Linked to Form-16 statutory profile.'],
    },
  },
  {
    id: 'DOC-2026-003',
    employeeId: 'EMP-1001',
    employeeName: 'Aarav Sharma',
    avatarInitials: 'AS',
    department: 'Engineering',
    designation: 'Principal Product Engineer',
    joiningDate: '2023-04-10',
    employmentStatus: 'Active',
    documentName: 'Aarav_Sharma_Passport_BioPage.pdf',
    categoryCode: 'IDENTITY',
    categoryLabel: 'A. Identity Documents',
    documentType: 'Passport',
    fileExtension: 'PDF',
    fileSizeBytes: 1240000,
    fileSizeFormatted: '1.18 MB',
    uploadDate: '2026-10-10',
    issueDate: '2016-11-17',
    expiryDate: '2026-11-16', // Expiring in 5 days! (7-day bucket)
    verificationStatus: 'Verified',
    uploadedBy: 'Aarav Sharma (Self-Service)',
    confidentiality: 'Strictly Restricted (PII)',
    maskedIdentifier: 'P84••••12',
    unmaskedIdentifier: 'P84920112',
    description: 'Republic of India Passport bio page for APAC business travel.',
    tags: ['Passport', 'Travel', 'Expiring'],
    mandatory: false,
    archived: false,
    reviewerName: 'Priya Krishnan (HR Ops)',
    reviewedAt: '2026-10-11 02:10 PM',
    reviewerRemarks: 'Passport valid but expiring in November 2026.',
    checklistState: {
      legibilityVerified: true,
      nameMatchesProfile: true,
      idNumberValidated: true,
      validityDateChecked: true,
      authenticityStampChecked: true,
    },
    versions: [
      {
        versionNumber: 'v1.0',
        uploadedAt: '2026-10-10 04:15 PM',
        uploadedBy: 'Aarav Sharma',
        fileName: 'Aarav_Sharma_Passport_BioPage.pdf',
        fileSizeFormatted: '1.18 MB',
        changeNotes: 'Uploaded for business visa processing',
        statusAtVersion: 'Verified',
      },
    ],
    aiIntelligence: {
      classifiedType: 'Passport',
      confidenceScorePct: 97.5,
      ocrTextPreview:
        'REPUBLIC OF INDIA · PASSPORT NO: P84920112 · SURNAME: SHARMA · GIVEN NAMES: AARAV · DATE OF EXPIRY: 16/11/2026',
      extractedFields: [
        { label: 'Holder Name', value: 'Aarav Sharma', matchedWithProfile: true },
        { label: 'Passport No', value: 'P84920112', matchedWithProfile: true },
        { label: 'Date of Expiry', value: '2026-11-16', matchedWithProfile: true },
      ],
      missingFields: [],
      duplicateWarning: false,
      qualityAssessment: 'High Clarity (300+ DPI)',
      dataMismatchDetected: false,
      completionSuggestions: [
        'Passport expires within 7 days. Trigger renewal reminder to employee.',
      ],
    },
  },
  {
    id: 'DOC-2026-004',
    employeeId: 'EMP-1002',
    employeeName: 'Elena Rostova',
    avatarInitials: 'ER',
    department: 'Engineering',
    designation: 'Staff Cloud Architect',
    joiningDate: '2024-01-15',
    employmentStatus: 'Active',
    documentName: 'Elena_Rostova_AWS_Solutions_Architect_Pro.pdf',
    categoryCode: 'EDUCATION',
    categoryLabel: 'C. Education Documents',
    documentType: 'Professional Certifications',
    fileExtension: 'PDF',
    fileSizeBytes: 690000,
    fileSizeFormatted: '674 KB',
    uploadDate: '2026-11-09',
    issueDate: '2023-11-23',
    expiryDate: '2026-11-23', // Expiring in 12 days! (15-day bucket)
    verificationStatus: 'Pending',
    uploadedBy: 'Elena Rostova (Self-Service)',
    confidentiality: 'Standard HR',
    maskedIdentifier: 'AWS-SAP-••••91',
    unmaskedIdentifier: 'AWS-SAP-882191',
    description: 'AWS Certified Solutions Architect Professional credential.',
    tags: ['Certification', 'Cloud', 'Skill Matrix'],
    mandatory: false,
    archived: false,
    checklistState: {
      legibilityVerified: true,
      nameMatchesProfile: true,
      idNumberValidated: false,
      validityDateChecked: true,
      authenticityStampChecked: false,
    },
    versions: [
      {
        versionNumber: 'v1.0',
        uploadedAt: '2026-11-09 03:12 PM',
        uploadedBy: 'Elena Rostova',
        fileName: 'Elena_Rostova_AWS_Solutions_Architect_Pro.pdf',
        fileSizeFormatted: '674 KB',
        changeNotes: 'Submitted for Q4 technical competency audit',
        statusAtVersion: 'Pending',
      },
    ],
    aiIntelligence: {
      classifiedType: 'Professional Certification',
      confidenceScorePct: 95.8,
      ocrTextPreview:
        'Amazon Web Services Training and Certification · ELENA ROSTOVA · AWS Certified Solutions Architect - Professional · Validation Number: AWS-SAP-882191 · Expires: Nov 23, 2026',
      extractedFields: [
        { label: 'Candidate Name', value: 'Elena Rostova', matchedWithProfile: true },
        { label: 'Validation ID', value: 'AWS-SAP-882191', matchedWithProfile: true },
        { label: 'Expiration Date', value: '2026-11-23', matchedWithProfile: true },
      ],
      missingFields: [],
      duplicateWarning: false,
      qualityAssessment: 'High Clarity (300+ DPI)',
      dataMismatchDetected: false,
      completionSuggestions: [
        'Verify credential validation code before approving skill allowance.',
      ],
    },
  },
  {
    id: 'DOC-2026-005',
    employeeId: 'EMP-1003',
    employeeName: 'Vikramaditya Nair',
    avatarInitials: 'VN',
    department: 'Product & Design',
    designation: 'Lead Product Designer',
    joiningDate: '2024-06-01',
    employmentStatus: 'Active',
    documentName: 'Vikram_Nair_Cancelled_Cheque_HDFC.jpg',
    categoryCode: 'PAYROLL',
    categoryLabel: 'F. Payroll Documents',
    documentType: 'Cancelled Cheque',
    fileExtension: 'JPG',
    fileSizeBytes: 1450000,
    fileSizeFormatted: '1.38 MB',
    uploadDate: '2026-11-10',
    issueDate: '2026-11-01',
    expiryDate: null,
    verificationStatus: 'Under Review',
    uploadedBy: 'Vikramaditya Nair (Self-Service)',
    confidentiality: 'Strictly Restricted (PII)',
    maskedIdentifier: 'HDFC000•••• / A/C ••••8821',
    unmaskedIdentifier: 'HDFC0001042 / A/C 501004928821',
    description: 'Updated salary account cancelled cheque leaf for November payroll.',
    tags: ['Payroll', 'Bank Change', 'Priority'],
    mandatory: true,
    archived: false,
    checklistState: {
      legibilityVerified: true,
      nameMatchesProfile: false,
      idNumberValidated: true,
      validityDateChecked: true,
      authenticityStampChecked: false,
    },
    versions: [
      {
        versionNumber: 'v2.0',
        uploadedAt: '2026-11-10 05:40 PM',
        uploadedBy: 'Vikramaditya Nair',
        fileName: 'Vikram_Nair_Cancelled_Cheque_HDFC.jpg',
        fileSizeFormatted: '1.38 MB',
        changeNotes: 'Replaced Axis Bank account with HDFC salary account',
        statusAtVersion: 'Under Review',
      },
      {
        versionNumber: 'v1.0',
        uploadedAt: '2024-06-01 10:00 AM',
        uploadedBy: 'Vikramaditya Nair',
        fileName: 'Vikram_Nair_Axis_Cheque.pdf',
        fileSizeFormatted: '410 KB',
        changeNotes: 'Initial onboarding bank proof',
        statusAtVersion: 'Verified',
      },
    ],
    aiIntelligence: {
      classifiedType: 'Cancelled Cheque (Bank Proof)',
      confidenceScorePct: 87.4,
      ocrTextPreview:
        'HDFC BANK LTD · IFSC: HDFC0001042 · A/C NO: 501004928821 · PAYEE NAME PRINTED: V. NAIR · CANCELLED',
      extractedFields: [
        { label: 'Printed Account Holder', value: 'V. Nair (Abbreviated)', matchedWithProfile: false },
        { label: 'IFSC Code', value: 'HDFC0001042', matchedWithProfile: true },
        { label: 'Account Number', value: '501004928821', matchedWithProfile: true },
      ],
      missingFields: [],
      duplicateWarning: false,
      qualityAssessment: 'Acceptable',
      dataMismatchDetected: true,
      mismatchDetails:
        'Printed cheque name reads "V. NAIR" while HR Master profile is "Vikramaditya Nair". Secondary bank statement header recommended.',
      completionSuggestions: [
        'Cross-verify abbreviated initials against penny-drop bank response.',
      ],
    },
  },
  {
    id: 'DOC-2026-006',
    employeeId: 'EMP-1005',
    employeeName: 'Marcus Vance',
    avatarInitials: 'MV',
    department: 'Sales & GTM',
    designation: 'Enterprise Account Director',
    joiningDate: '2025-08-19',
    employmentStatus: 'Probation',
    documentName: 'Marcus_Vance_Prior_Relieving_Letter_Scan.png',
    categoryCode: 'PREVIOUS_EMPLOYMENT',
    categoryLabel: 'D. Previous Employment',
    documentType: 'Relieving Letter',
    fileExtension: 'PNG',
    fileSizeBytes: 2150000,
    fileSizeFormatted: '2.05 MB',
    uploadDate: '2026-11-08',
    issueDate: '2025-08-10',
    expiryDate: null,
    verificationStatus: 'Rejected',
    uploadedBy: 'Marcus Vance (Self-Service)',
    confidentiality: 'Confidential',
    description: 'Relieving letter from previous employer for BGV closure.',
    tags: ['BGV', 'Prior Employment', 'Resubmit'],
    mandatory: true,
    archived: false,
    reviewerName: 'Priya Krishnan (HR Ops)',
    reviewedAt: '2026-11-09 04:05 PM',
    reviewerRemarks:
      'Bottom signature block and company seal are cropped out in the mobile camera scan. Please upload a full A4 PDF scan.',
    checklistState: {
      legibilityVerified: false,
      nameMatchesProfile: true,
      idNumberValidated: true,
      validityDateChecked: true,
      authenticityStampChecked: false,
    },
    versions: [
      {
        versionNumber: 'v1.0',
        uploadedAt: '2026-11-08 06:20 PM',
        uploadedBy: 'Marcus Vance',
        fileName: 'Marcus_Vance_Prior_Relieving_Letter_Scan.png',
        fileSizeFormatted: '2.05 MB',
        changeNotes: 'Initial mobile photo upload',
        statusAtVersion: 'Rejected',
      },
    ],
    aiIntelligence: {
      classifiedType: 'Relieving Letter',
      confidenceScorePct: 72.1,
      ocrTextPreview:
        'TO WHOMSOEVER IT MAY CONCERN · This is to certify that Mr. Marcus Vance was employed as Regional Sales Lead from May 2022 to August 2025... [BOTTOM MARGIN CROPPED]',
      extractedFields: [
        { label: 'Employee Name', value: 'Marcus Vance', matchedWithProfile: true },
        { label: 'Last Working Date', value: '2025-08-10', matchedWithProfile: true },
      ],
      missingFields: ['Authorized Signatory Stamp', 'HR Contact Email'],
      duplicateWarning: false,
      qualityAssessment: 'Low Resolution / Blurry',
      dataMismatchDetected: false,
      completionSuggestions: [
        'Request clean PDF scan showing authorized signatory seal and company letterhead.',
      ],
    },
  },
  {
    id: 'DOC-2026-007',
    employeeId: 'EMP-1004',
    employeeName: 'Priya Krishnan',
    avatarInitials: 'PK',
    department: 'People Operations',
    designation: 'HR Compliance Specialist',
    joiningDate: '2025-02-12',
    employmentStatus: 'Active',
    documentName: 'Priya_Krishnan_Driving_Licence_KA01.pdf',
    categoryCode: 'IDENTITY',
    categoryLabel: 'A. Identity Documents',
    documentType: 'Driving Licence',
    fileExtension: 'PDF',
    fileSizeBytes: 480000,
    fileSizeFormatted: '468 KB',
    uploadDate: '2025-02-14',
    issueDate: '2016-10-01',
    expiryDate: '2026-10-15', // Already Expired!
    verificationStatus: 'Expired',
    uploadedBy: 'Priya Krishnan (Self-Service)',
    confidentiality: 'Confidential',
    maskedIdentifier: 'KA01-2016••••90',
    unmaskedIdentifier: 'KA01-20160048290',
    description: 'Karnataka Transport Department Driving Licence.',
    tags: ['Identity', 'Expired'],
    mandatory: false,
    archived: false,
    reviewerName: 'Aarav Sharma (HR Admin)',
    reviewedAt: '2025-02-15 10:00 AM',
    reviewerRemarks: 'Validity elapsed on Oct 15, 2026.',
    checklistState: {
      legibilityVerified: true,
      nameMatchesProfile: true,
      idNumberValidated: true,
      validityDateChecked: false,
      authenticityStampChecked: true,
    },
    versions: [
      {
        versionNumber: 'v1.0',
        uploadedAt: '2025-02-14 11:00 AM',
        uploadedBy: 'Priya Krishnan',
        fileName: 'Priya_Krishnan_Driving_Licence_KA01.pdf',
        fileSizeFormatted: '468 KB',
        changeNotes: 'Initial upload',
        statusAtVersion: 'Expired',
      },
    ],
    aiIntelligence: {
      classifiedType: 'Driving Licence',
      confidenceScorePct: 96.4,
      ocrTextPreview:
        'INDIAN UNION DRIVING LICENCE · KARNATAKA STATE · DL NO: KA01-20160048290 · NAME: PRIYA KRISHNAN · VALID TILL: 15-10-2026',
      extractedFields: [
        { label: 'Name', value: 'Priya Krishnan', matchedWithProfile: true },
        { label: 'Licence No', value: 'KA01-20160048290', matchedWithProfile: true },
        { label: 'Valid Till', value: '2026-10-15 (Expired)', matchedWithProfile: true },
      ],
      missingFields: [],
      duplicateWarning: false,
      qualityAssessment: 'High Clarity (300+ DPI)',
      dataMismatchDetected: false,
      completionSuggestions: ['Document has expired. Send renewal upload request.'],
    },
  },
  {
    id: 'DOC-2026-008',
    employeeId: 'EMP-1006',
    employeeName: 'Sora Takahashi',
    avatarInitials: 'ST',
    department: 'Product & Design',
    designation: 'Senior UX Researcher',
    joiningDate: '2024-09-05',
    employmentStatus: 'Active',
    documentName: 'Sora_Takahashi_Rental_Lease_Hyd_2026.pdf',
    categoryCode: 'ADDRESS',
    categoryLabel: 'B. Address Documents',
    documentType: 'Current Address Proof',
    fileExtension: 'PDF',
    fileSizeBytes: 980000,
    fileSizeFormatted: '957 KB',
    uploadDate: '2026-01-10',
    issueDate: '2026-01-05',
    expiryDate: '2026-12-05', // Expiring in 24 days! (30-day bucket)
    verificationStatus: 'Verified',
    uploadedBy: 'Sora Takahashi (Self-Service)',
    confidentiality: 'Confidential',
    description: '11-month registered residential rental agreement for HRA exemption.',
    tags: ['HRA', 'Address', 'Lease'],
    mandatory: true,
    archived: false,
    reviewerName: 'Priya Krishnan (HR Ops)',
    reviewedAt: '2026-01-12 03:00 PM',
    reviewerRemarks: 'Verified landlord PAN and stamp duty.',
    checklistState: {
      legibilityVerified: true,
      nameMatchesProfile: true,
      idNumberValidated: true,
      validityDateChecked: true,
      authenticityStampChecked: true,
    },
    versions: [
      {
        versionNumber: 'v1.0',
        uploadedAt: '2026-01-10 01:30 PM',
        uploadedBy: 'Sora Takahashi',
        fileName: 'Sora_Takahashi_Rental_Lease_Hyd_2026.pdf',
        fileSizeFormatted: '957 KB',
        changeNotes: 'FY 2026-27 HRA proof',
        statusAtVersion: 'Verified',
      },
    ],
    aiIntelligence: {
      classifiedType: 'Current Address Proof (Lease Agreement)',
      confidenceScorePct: 94.6,
      ocrTextPreview:
        'RENTAL LEASE AGREEMENT · Lessee: SORA TAKAHASHI · Property: Gachibowli, Hyderabad 500032 · Term: 05 Jan 2026 to 05 Dec 2026',
      extractedFields: [
        { label: 'Tenant Name', value: 'Sora Takahashi', matchedWithProfile: true },
        { label: 'Lease End Date', value: '2026-12-05', matchedWithProfile: true },
      ],
      missingFields: [],
      duplicateWarning: false,
      qualityAssessment: 'High Clarity (300+ DPI)',
      dataMismatchDetected: false,
      completionSuggestions: ['Lease expires within 30 days. Notify for HRA continuity.'],
    },
  },
  {
    id: 'DOC-2026-009',
    employeeId: 'EMP-1007',
    employeeName: 'Rohan Kulkarni',
    avatarInitials: 'RK',
    department: 'Finance & Legal',
    designation: 'Senior Payroll Controller',
    joiningDate: '2023-11-20',
    employmentStatus: 'Notice Period',
    documentName: 'Rohan_Kulkarni_Exit_Clearance_Checklist.pdf',
    categoryCode: 'EXIT',
    categoryLabel: 'H. Exit Documents',
    documentType: 'Exit Clearance',
    fileExtension: 'PDF',
    fileSizeBytes: 615000,
    fileSizeFormatted: '600 KB',
    uploadDate: '2026-11-10',
    issueDate: '2026-11-10',
    expiryDate: '2026-12-28', // Expiring in 47 days! (60-day bucket)
    verificationStatus: 'Pending',
    uploadedBy: 'Priya Krishnan (HR Ops)',
    confidentiality: 'Confidential',
    description: 'IT, Finance, and Knowledge Transfer clearance sign-off sheet.',
    tags: ['Offboarding', 'Clearance', 'FnF'],
    mandatory: false,
    archived: false,
    checklistState: {
      legibilityVerified: true,
      nameMatchesProfile: true,
      idNumberValidated: true,
      validityDateChecked: true,
      authenticityStampChecked: false,
    },
    versions: [
      {
        versionNumber: 'v1.0',
        uploadedAt: '2026-11-10 04:00 PM',
        uploadedBy: 'Priya Krishnan',
        fileName: 'Rohan_Kulkarni_Exit_Clearance_Checklist.pdf',
        fileSizeFormatted: '600 KB',
        changeNotes: 'Initiated upon notice period commencement',
        statusAtVersion: 'Pending',
      },
    ],
    aiIntelligence: {
      classifiedType: 'Exit Clearance Form',
      confidenceScorePct: 96.1,
      ocrTextPreview:
        'OFC360 TECHNOLOGIES · EXIT CLEARANCE CERTIFICATE · Employee: Rohan Kulkarni (EMP-1007) · IT Handover: Pending MacBook Return · KT Sign-Off: Completed',
      extractedFields: [
        { label: 'Employee Name', value: 'Rohan Kulkarni', matchedWithProfile: true },
        { label: 'Employee Code', value: 'EMP-1007', matchedWithProfile: true },
      ],
      missingFields: ['IT Asset Custodian Signature'],
      duplicateWarning: false,
      qualityAssessment: 'High Clarity (300+ DPI)',
      dataMismatchDetected: false,
      completionSuggestions: [
        'Awaiting final IT hardware handover signature before FnF release.',
      ],
    },
  },
  {
    id: 'DOC-2026-010',
    employeeId: 'EMP-1001',
    employeeName: 'Aarav Sharma',
    avatarInitials: 'AS',
    department: 'Engineering',
    designation: 'Principal Product Engineer',
    joiningDate: '2023-04-10',
    employmentStatus: 'Active',
    documentName: 'Aarav_Sharma_Signed_Offer_Letter.pdf',
    categoryCode: 'JOINING',
    categoryLabel: 'E. Joining Documents',
    documentType: 'Offer Letter',
    fileExtension: 'PDF',
    fileSizeBytes: 740000,
    fileSizeFormatted: '722 KB',
    uploadDate: '2023-04-02',
    issueDate: '2023-04-01',
    expiryDate: null,
    verificationStatus: 'Verified',
    uploadedBy: 'HR Onboarding Desk',
    confidentiality: 'Confidential',
    description: 'Counter-signed executive employment offer letter.',
    tags: ['Joining', 'Offer', 'Verified'],
    mandatory: true,
    archived: false,
    reviewerName: 'Ananya Verma',
    reviewedAt: '2023-04-03 10:15 AM',
    reviewerRemarks: 'All pages signed and dated.',
    checklistState: {
      legibilityVerified: true,
      nameMatchesProfile: true,
      idNumberValidated: true,
      validityDateChecked: true,
      authenticityStampChecked: true,
    },
    versions: [
      {
        versionNumber: 'v1.0',
        uploadedAt: '2023-04-02 06:00 PM',
        uploadedBy: 'Aarav Sharma',
        fileName: 'Aarav_Sharma_Signed_Offer_Letter.pdf',
        fileSizeFormatted: '722 KB',
        changeNotes: 'Initial counter-signed upload',
        statusAtVersion: 'Verified',
      },
    ],
    aiIntelligence: {
      classifiedType: 'Offer Letter',
      confidenceScorePct: 99.4,
      ocrTextPreview:
        'OFC360 TECHNOLOGIES PVT. LTD. · OFFER OF EMPLOYMENT · Dear Aarav Sharma, We are pleased to offer you the position of Principal Product Engineer...',
      extractedFields: [
        { label: 'Candidate Name', value: 'Aarav Sharma', matchedWithProfile: true },
        { label: 'Role', value: 'Principal Product Engineer', matchedWithProfile: true },
      ],
      missingFields: [],
      duplicateWarning: false,
      qualityAssessment: 'High Clarity (300+ DPI)',
      dataMismatchDetected: false,
      completionSuggestions: [],
    },
  },
  {
    id: 'DOC-2026-011',
    employeeId: 'EMP-1001',
    employeeName: 'Aarav Sharma',
    avatarInitials: 'AS',
    department: 'Engineering',
    designation: 'Principal Product Engineer',
    joiningDate: '2023-04-10',
    employmentStatus: 'Active',
    documentName: 'Aarav_Sharma_Mutual_NDA_2023.pdf',
    categoryCode: 'JOINING',
    categoryLabel: 'E. Joining Documents',
    documentType: 'NDA',
    fileExtension: 'PDF',
    fileSizeBytes: 530000,
    fileSizeFormatted: '518 KB',
    uploadDate: '2023-04-10',
    issueDate: '2023-04-10',
    expiryDate: null,
    verificationStatus: 'Verified',
    uploadedBy: 'Aarav Sharma (Self-Service)',
    confidentiality: 'Confidential',
    description: 'Confidentiality, IP Assignment, and Non-Disclosure Agreement.',
    tags: ['Legal', 'NDA', 'IP'],
    mandatory: true,
    archived: false,
    reviewerName: 'Ananya Verma',
    reviewedAt: '2023-04-10 04:00 PM',
    reviewerRemarks: 'IP & NDA clauses acknowledged.',
    checklistState: {
      legibilityVerified: true,
      nameMatchesProfile: true,
      idNumberValidated: true,
      validityDateChecked: true,
      authenticityStampChecked: true,
    },
    versions: [
      {
        versionNumber: 'v1.0',
        uploadedAt: '2023-04-10 11:30 AM',
        uploadedBy: 'Aarav Sharma',
        fileName: 'Aarav_Sharma_Mutual_NDA_2023.pdf',
        fileSizeFormatted: '518 KB',
        changeNotes: 'Day-1 policy signing',
        statusAtVersion: 'Verified',
      },
    ],
    aiIntelligence: {
      classifiedType: 'Non-Disclosure Agreement (NDA)',
      confidenceScorePct: 98.9,
      ocrTextPreview:
        'EMPLOYEE NON-DISCLOSURE AND INVENTION ASSIGNMENT AGREEMENT · Executed on April 10, 2023 by Aarav Sharma (EMP-1001)...',
      extractedFields: [
        { label: 'Employee Name', value: 'Aarav Sharma', matchedWithProfile: true },
        { label: 'Effective Date', value: '2023-04-10', matchedWithProfile: true },
      ],
      missingFields: [],
      duplicateWarning: false,
      qualityAssessment: 'High Clarity (300+ DPI)',
      dataMismatchDetected: false,
      completionSuggestions: [],
    },
  },
  {
    id: 'DOC-2026-012',
    employeeId: 'EMP-1002',
    employeeName: 'Elena Rostova',
    avatarInitials: 'ER',
    department: 'Engineering',
    designation: 'Staff Cloud Architect',
    joiningDate: '2024-01-15',
    employmentStatus: 'Active',
    documentName: 'Elena_Rostova_BTech_Degree_IITB.pdf',
    categoryCode: 'EDUCATION',
    categoryLabel: 'C. Education Documents',
    documentType: 'Graduation Certificate',
    fileExtension: 'PDF',
    fileSizeBytes: 1120000,
    fileSizeFormatted: '1.07 MB',
    uploadDate: '2024-01-12',
    issueDate: '2018-06-30',
    expiryDate: null,
    verificationStatus: 'Verified',
    uploadedBy: 'Elena Rostova (Self-Service)',
    confidentiality: 'Standard HR',
    description: 'B.Tech Computer Science convocation degree certificate.',
    tags: ['Education', 'BGV Cleared'],
    mandatory: true,
    archived: false,
    reviewerName: 'Priya Krishnan (HR Ops)',
    reviewedAt: '2024-01-14 02:30 PM',
    reviewerRemarks: 'University registrar verification cleared.',
    checklistState: {
      legibilityVerified: true,
      nameMatchesProfile: true,
      idNumberValidated: true,
      validityDateChecked: true,
      authenticityStampChecked: true,
    },
    versions: [
      {
        versionNumber: 'v1.0',
        uploadedAt: '2024-01-12 05:00 PM',
        uploadedBy: 'Elena Rostova',
        fileName: 'Elena_Rostova_BTech_Degree_IITB.pdf',
        fileSizeFormatted: '1.07 MB',
        changeNotes: 'Pre-boarding degree upload',
        statusAtVersion: 'Verified',
      },
    ],
    aiIntelligence: {
      classifiedType: 'Graduation Certificate',
      confidenceScorePct: 99.1,
      ocrTextPreview:
        'INDIAN INSTITUTE OF TECHNOLOGY · Bachelor of Technology in Computer Science & Engineering · Awarded to ELENA ROSTOVA',
      extractedFields: [
        { label: 'Graduate Name', value: 'Elena Rostova', matchedWithProfile: true },
        { label: 'Degree', value: 'B.Tech Computer Science', matchedWithProfile: true },
      ],
      missingFields: [],
      duplicateWarning: false,
      qualityAssessment: 'High Clarity (300+ DPI)',
      dataMismatchDetected: false,
      completionSuggestions: [],
    },
  },
];

export const INITIAL_DOCUMENT_REQUESTS: DocumentRequestRecord[] = [
  {
    id: 'REQ-DOC-501',
    employeeId: 'EMP-1005',
    employeeName: 'Marcus Vance',
    department: 'Sales & GTM',
    requiredDocumentType: 'Relieving Letter',
    categoryCode: 'PREVIOUS_EMPLOYMENT',
    dueDate: '2026-11-15',
    priority: 'Urgent',
    instructions:
      'Previous scan was rejected due to cropped signature block. Please upload full-page PDF relieving letter.',
    status: 'Overdue',
    createdAt: '2026-11-09',
    requestedBy: 'Priya Krishnan (HR Ops)',
    remindersSentCount: 2,
    lastReminderAt: '2026-11-10 06:00 PM',
  },
  {
    id: 'REQ-DOC-502',
    employeeId: 'EMP-1003',
    employeeName: 'Vikramaditya Nair',
    department: 'Product & Design',
    requiredDocumentType: 'Permanent Address Proof',
    categoryCode: 'ADDRESS',
    dueDate: '2026-11-18',
    priority: 'High',
    instructions: 'Required to complete statutory KYC audit for FY 2026-27.',
    status: 'Pending',
    createdAt: '2026-11-08',
    requestedBy: 'Priya Krishnan (HR Ops)',
    remindersSentCount: 1,
    lastReminderAt: '2026-11-10 10:00 AM',
  },
  {
    id: 'REQ-DOC-503',
    employeeId: 'EMP-1004',
    employeeName: 'Priya Krishnan',
    department: 'People Operations',
    requiredDocumentType: 'Driving Licence',
    categoryCode: 'IDENTITY',
    dueDate: '2026-11-22',
    priority: 'Medium',
    instructions: 'Existing Driving Licence expired on Oct 15, 2026. Upload renewed copy.',
    status: 'Sent',
    createdAt: '2026-11-10',
    requestedBy: 'Aarav Sharma (HR Admin)',
    remindersSentCount: 0,
  },
  {
    id: 'REQ-DOC-504',
    employeeId: 'EMP-1006',
    employeeName: 'Sora Takahashi',
    department: 'Product & Design',
    requiredDocumentType: 'Tax Declaration',
    categoryCode: 'PAYROLL',
    dueDate: '2026-11-25',
    priority: 'Medium',
    instructions: 'Submit Section 80C & HRA investment proof declaration for Q3.',
    status: 'Submitted',
    createdAt: '2026-11-04',
    requestedBy: 'Rohan Kulkarni (Payroll)',
    remindersSentCount: 1,
    lastReminderAt: '2026-11-07 09:30 AM',
  },
];

export const INITIAL_HR_TEMPLATES: DocumentTemplateRecord[] = [
  {
    id: 'TPL-HR-01',
    key: 'OFFER_LETTER',
    name: 'Offer Letter',
    categoryCode: 'JOINING',
    description: 'Standard executive & engineering employment offer with CTC annexure.',
    mandatoryForJoining: true,
    active: true,
    version: 'v3.2',
    lastUpdated: '2026-10-15',
    placeholders: [
      '{{EMPLOYEE_NAME}}',
      '{{EMPLOYEE_ID}}',
      '{{DESIGNATION}}',
      '{{DEPARTMENT}}',
      '{{JOINING_DATE}}',
      '{{ANNUAL_CTC}}',
      '{{LOCATION}}',
      '{{REPORTING_MANAGER}}',
      '{{ISSUE_DATE}}',
      '{{REFERENCE_NO}}',
    ],
    bodyContent: `OFC360 TECHNOLOGIES PVT. LTD.
Ref: {{REFERENCE_NO}} | Date: {{ISSUE_DATE}}

PRIVATE & CONFIDENTIAL

To,
{{EMPLOYEE_NAME}}
Employee ID: {{EMPLOYEE_ID}}
Location: {{LOCATION}}

Subject: Offer of Employment – {{DESIGNATION}} ({{DEPARTMENT}})

Dear {{EMPLOYEE_NAME}},

We are delighted to extend this formal Offer of Employment for the position of {{DESIGNATION}} in the {{DEPARTMENT}} practice at OFC360 Technologies Pvt. Ltd., effective from your scheduled joining date of {{JOINING_DATE}}.

1. COMPENSATION & TOTAL REWARDS
Your Total Fixed Annual Cost to Company (CTC) will be {{ANNUAL_CTC}} per annum, subject to applicable statutory deductions (EPF, Professional Tax, and Income Tax TDS).

2. REPORTING & BASE LOCATION
You will be based at our {{LOCATION}} campus and will report directly to {{REPORTING_MANAGER}}.

3. PRE-JOINING DOCUMENT VERIFICATION
This offer is contingent upon satisfactory verification of your identity, academic credentials, and prior employment records in the OFC360 Digital Document Vault.

Warm regards,
For OFC360 Technologies Pvt. Ltd.

Ananya Verma
VP – People Operations & Culture`,
  },
  {
    id: 'TPL-HR-02',
    key: 'APPOINTMENT_LETTER',
    name: 'Appointment Letter',
    categoryCode: 'JOINING',
    description: 'Formal Day-1 appointment contract detailing probation, notice period & benefits.',
    mandatoryForJoining: true,
    active: true,
    version: 'v2.8',
    lastUpdated: '2026-09-20',
    placeholders: [
      '{{EMPLOYEE_NAME}}',
      '{{EMPLOYEE_ID}}',
      '{{DESIGNATION}}',
      '{{DEPARTMENT}}',
      '{{JOINING_DATE}}',
      '{{ANNUAL_CTC}}',
      '{{LOCATION}}',
      '{{REPORTING_MANAGER}}',
      '{{ISSUE_DATE}}',
      '{{REFERENCE_NO}}',
    ],
    bodyContent: `OFC360 TECHNOLOGIES PVT. LTD.
Ref: {{REFERENCE_NO}} | Date: {{ISSUE_DATE}}

LETTER OF APPOINTMENT

Dear {{EMPLOYEE_NAME}} ({{EMPLOYEE_ID}}),

Further to your acceptance of our Offer Letter, we are pleased to confirm your appointment as {{DESIGNATION}} in the {{DEPARTMENT}} department at {{LOCATION}} effective {{JOINING_DATE}}.

1. PROBATION & CONFIRMATION
You will serve an initial probation period of six (6) months from {{JOINING_DATE}}, during which your performance and cultural alignment will be reviewed with {{REPORTING_MANAGER}}.

2. REMUNERATION
Your gross annual remuneration is {{ANNUAL_CTC}} per annum as detailed in Annexure-A.

3. NOTICE PERIOD
Either party may terminate this employment by providing sixty (60) days written notice after confirmation.

Sincerely,
For OFC360 Technologies Pvt. Ltd.

Authorized Signatory – Human Resources`,
  },
  {
    id: 'TPL-HR-03',
    key: 'EMPLOYMENT_AGREEMENT',
    name: 'Employment Agreement',
    categoryCode: 'JOINING',
    description: 'Comprehensive full-time employment covenant, code of conduct, and IP terms.',
    mandatoryForJoining: true,
    active: true,
    version: 'v4.0',
    lastUpdated: '2026-10-01',
    placeholders: [
      '{{EMPLOYEE_NAME}}',
      '{{EMPLOYEE_ID}}',
      '{{DESIGNATION}}',
      '{{DEPARTMENT}}',
      '{{JOINING_DATE}}',
      '{{ANNUAL_CTC}}',
      '{{LOCATION}}',
      '{{ISSUE_DATE}}',
      '{{REFERENCE_NO}}',
    ],
    bodyContent: `EMPLOYMENT AGREEMENT ({{REFERENCE_NO}})

This Employment Agreement is executed on {{ISSUE_DATE}} between OFC360 Technologies Pvt. Ltd. ("Company") and {{EMPLOYEE_NAME}} (Employee Code: {{EMPLOYEE_ID}}).

WHEREAS the Company desires to employ the Employee in the capacity of {{DESIGNATION}} ({{DEPARTMENT}}) at {{LOCATION}} commencing {{JOINING_DATE}} at an annual compensation of {{ANNUAL_CTC}}.

1. DUTIES & EXCLUSIVITY: The Employee shall devote full working time and professional attention to the Company's engineering and business objectives.
2. DATA PROTECTION: The Employee agrees to abide by ISO 27001, SOC2, and DPDP Act security controls.

Signed & Acknowledged (Simulation Preview):
Employer: OFC360 Technologies Pvt. Ltd. | Employee: {{EMPLOYEE_NAME}}`,
  },
  {
    id: 'TPL-HR-04',
    key: 'NDA',
    name: 'NDA',
    categoryCode: 'JOINING',
    description: 'Employee Non-Disclosure, Trade Secret & Intellectual Property Assignment Agreement.',
    mandatoryForJoining: true,
    active: true,
    version: 'v3.1',
    lastUpdated: '2026-08-12',
    placeholders: [
      '{{EMPLOYEE_NAME}}',
      '{{EMPLOYEE_ID}}',
      '{{DESIGNATION}}',
      '{{DEPARTMENT}}',
      '{{LOCATION}}',
      '{{ISSUE_DATE}}',
      '{{REFERENCE_NO}}',
    ],
    bodyContent: `EMPLOYEE NON-DISCLOSURE & IP ASSIGNMENT AGREEMENT
Ref: {{REFERENCE_NO}} | Date: {{ISSUE_DATE}}

This Agreement is entered into by {{EMPLOYEE_NAME}} ({{EMPLOYEE_ID}}), serving as {{DESIGNATION}} in {{DEPARTMENT}} ({{LOCATION}}).

1. CONFIDENTIAL INFORMATION: All source code, architecture blueprints, customer contracts, and HR data accessed by {{EMPLOYEE_NAME}} remain the exclusive property of OFC360 Technologies Pvt. Ltd.
2. SURVIVAL: Confidentiality obligations remain binding during employment and for thirty-six (36) months post-separation.

Employee Name: {{EMPLOYEE_NAME}} | Date: {{ISSUE_DATE}}`,
  },
  {
    id: 'TPL-HR-05',
    key: 'SALARY_CERTIFICATE',
    name: 'Salary Certificate',
    categoryCode: 'PAYROLL',
    description: 'Official bank/visa/embassy salary & bonafide employment verification letter.',
    mandatoryForJoining: false,
    active: true,
    version: 'v1.9',
    lastUpdated: '2026-10-20',
    placeholders: [
      '{{EMPLOYEE_NAME}}',
      '{{EMPLOYEE_ID}}',
      '{{DESIGNATION}}',
      '{{DEPARTMENT}}',
      '{{JOINING_DATE}}',
      '{{ANNUAL_CTC}}',
      '{{LOCATION}}',
      '{{ISSUE_DATE}}',
      '{{REFERENCE_NO}}',
    ],
    bodyContent: `OFC360 TECHNOLOGIES PVT. LTD.
Ref: {{REFERENCE_NO}} | Date: {{ISSUE_DATE}}

TO WHOMSOEVER IT MAY CONCERN
SALARY & BONAFIDE EMPLOYMENT CERTIFICATE

This is to certify that {{EMPLOYEE_NAME}} (Employee ID: {{EMPLOYEE_ID}}) is a permanent full-time employee of OFC360 Technologies Pvt. Ltd. since {{JOINING_DATE}}, currently designated as {{DESIGNATION}} in the {{DEPARTMENT}} department at {{LOCATION}}.

Their current gross annual Cost to Company (CTC) is {{ANNUAL_CTC}}.

This certificate is issued upon the request of the employee for official banking / visa / residential verification purposes.

For OFC360 Technologies Pvt. Ltd.
Payroll & Compliance Desk`,
  },
  {
    id: 'TPL-HR-06',
    key: 'EXPERIENCE_CERTIFICATE',
    name: 'Experience Certificate',
    categoryCode: 'EXIT',
    description: 'Tenure and role conduct certification issued upon full & final clearance.',
    mandatoryForJoining: false,
    active: true,
    version: 'v2.0',
    lastUpdated: '2026-07-19',
    placeholders: [
      '{{EMPLOYEE_NAME}}',
      '{{EMPLOYEE_ID}}',
      '{{DESIGNATION}}',
      '{{DEPARTMENT}}',
      '{{JOINING_DATE}}',
      '{{ISSUE_DATE}}',
      '{{REFERENCE_NO}}',
    ],
    bodyContent: `OFC360 TECHNOLOGIES PVT. LTD.
Ref: {{REFERENCE_NO}} | Date: {{ISSUE_DATE}}

EXPERIENCE CERTIFICATE

This is to certify that {{EMPLOYEE_NAME}} (Employee ID: {{EMPLOYEE_ID}}) was employed with OFC360 Technologies Pvt. Ltd. from {{JOINING_DATE}} to {{ISSUE_DATE}} in the {{DEPARTMENT}} division. At the time of separation, {{EMPLOYEE_NAME}} held the designation of {{DESIGNATION}}.

During their tenure, we found {{EMPLOYEE_NAME}} to be diligent, ethical, and technically accomplished. We wish them continued success in all future endeavors.

For OFC360 Technologies Pvt. Ltd.
Head of People Operations`,
  },
  {
    id: 'TPL-HR-07',
    key: 'RELIEVING_LETTER',
    name: 'Relieving Letter',
    categoryCode: 'EXIT',
    description: 'Formal separation & no-dues relieving confirmation letter.',
    mandatoryForJoining: false,
    active: true,
    version: 'v2.2',
    lastUpdated: '2026-09-02',
    placeholders: [
      '{{EMPLOYEE_NAME}}',
      '{{EMPLOYEE_ID}}',
      '{{DESIGNATION}}',
      '{{DEPARTMENT}}',
      '{{JOINING_DATE}}',
      '{{ISSUE_DATE}}',
      '{{REFERENCE_NO}}',
    ],
    bodyContent: `OFC360 TECHNOLOGIES PVT. LTD.
Ref: {{REFERENCE_NO}} | Date: {{ISSUE_DATE}}

FORMAL RELIEVING ORDER

Dear {{EMPLOYEE_NAME}} ({{EMPLOYEE_ID}}),

With reference to your resignation, we hereby confirm that you have been formally relieved of your duties as {{DESIGNATION}} ({{DEPARTMENT}}) effective close of business on {{ISSUE_DATE}}.

All IT assets, identity badges, and knowledge transfer deliverables have been cleared. Your Full & Final settlement will be credited per company policy.

Sincerely,
For OFC360 Technologies Pvt. Ltd.`,
  },
  {
    id: 'TPL-HR-08',
    key: 'PROMOTION_LETTER',
    name: 'Promotion Letter',
    categoryCode: 'PERFORMANCE',
    description: 'Career progression & grade elevation letter with revised role charter.',
    mandatoryForJoining: false,
    active: true,
    version: 'v1.5',
    lastUpdated: '2026-10-05',
    placeholders: [
      '{{EMPLOYEE_NAME}}',
      '{{EMPLOYEE_ID}}',
      '{{DESIGNATION}}',
      '{{DEPARTMENT}}',
      '{{ANNUAL_CTC}}',
      '{{REPORTING_MANAGER}}',
      '{{ISSUE_DATE}}',
      '{{REFERENCE_NO}}',
    ],
    bodyContent: `OFC360 TECHNOLOGIES PVT. LTD.
Ref: {{REFERENCE_NO}} | Date: {{ISSUE_DATE}}

CONGRATULATIONS ON YOUR PROMOTION

Dear {{EMPLOYEE_NAME}} ({{EMPLOYEE_ID}}),

In recognition of your exceptional impact and leadership in the {{DEPARTMENT}} team, the Executive Review Board is proud to promote you to {{DESIGNATION}}, reporting to {{REPORTING_MANAGER}}.

Your revised annual compensation package stands at {{ANNUAL_CTC}} effective this cycle. Thank you for raising the bar across OFC360.

Warm regards,
Chief People Officer – OFC360`,
  },
  {
    id: 'TPL-HR-09',
    key: 'INCREMENT_LETTER',
    name: 'Increment Letter',
    categoryCode: 'PERFORMANCE',
    description: 'Annual merit appraisal and compensation revision letter.',
    mandatoryForJoining: false,
    active: true,
    version: 'v2.4',
    lastUpdated: '2026-10-10',
    placeholders: [
      '{{EMPLOYEE_NAME}}',
      '{{EMPLOYEE_ID}}',
      '{{DESIGNATION}}',
      '{{DEPARTMENT}}',
      '{{ANNUAL_CTC}}',
      '{{ISSUE_DATE}}',
      '{{REFERENCE_NO}}',
    ],
    bodyContent: `OFC360 TECHNOLOGIES PVT. LTD.
Ref: {{REFERENCE_NO}} | Date: {{ISSUE_DATE}}

COMPENSATION REVISION & MERIT INCREMENT LETTER

Dear {{EMPLOYEE_NAME}} ({{EMPLOYEE_ID}}),

Following the completion of the FY 2026–27 Performance Calibration cycle for {{DEPARTMENT}}, we are pleased to revise your Total Annual Cost to Company (CTC) to {{ANNUAL_CTC}} in your role as {{DESIGNATION}}.

All other terms of your employment remain unchanged.

For OFC360 Technologies Pvt. Ltd.
Total Rewards & People Operations`,
  },
  {
    id: 'TPL-HR-10',
    key: 'WARNING_LETTER',
    name: 'Warning Letter',
    categoryCode: 'PERFORMANCE',
    description: 'Formal disciplinary or policy compliance advisory memo.',
    mandatoryForJoining: false,
    active: true,
    version: 'v1.2',
    lastUpdated: '2026-06-15',
    placeholders: [
      '{{EMPLOYEE_NAME}}',
      '{{EMPLOYEE_ID}}',
      '{{DESIGNATION}}',
      '{{DEPARTMENT}}',
      '{{REPORTING_MANAGER}}',
      '{{ISSUE_DATE}}',
      '{{REFERENCE_NO}}',
    ],
    bodyContent: `OFC360 TECHNOLOGIES PVT. LTD.
Ref: {{REFERENCE_NO}} | Date: {{ISSUE_DATE}}

CONFIDENTIAL: FORMAL COMPLIANCE ADVISORY

To: {{EMPLOYEE_NAME}} ({{EMPLOYEE_ID}}) – {{DESIGNATION}}, {{DEPARTMENT}}
Copy: {{REPORTING_MANAGER}}

This memorandum serves as a formal compliance advisory regarding adherence to workplace policies and SLA expectations discussed during your review session on {{ISSUE_DATE}}.

You are advised to align with the corrective action milestones over the next thirty (30) days.

Employee Relations & Governance – OFC360`,
  },
  {
    id: 'TPL-HR-11',
    key: 'CONFIRMATION_LETTER',
    name: 'Confirmation Letter',
    categoryCode: 'PERFORMANCE',
    description: 'Probation completion and permanent employment confirmation letter.',
    mandatoryForJoining: false,
    active: true,
    version: 'v1.8',
    lastUpdated: '2026-09-18',
    placeholders: [
      '{{EMPLOYEE_NAME}}',
      '{{EMPLOYEE_ID}}',
      '{{DESIGNATION}}',
      '{{DEPARTMENT}}',
      '{{JOINING_DATE}}',
      '{{REPORTING_MANAGER}}',
      '{{ISSUE_DATE}}',
      '{{REFERENCE_NO}}',
    ],
    bodyContent: `OFC360 TECHNOLOGIES PVT. LTD.
Ref: {{REFERENCE_NO}} | Date: {{ISSUE_DATE}}

PROBATION CONFIRMATION LETTER

Dear {{EMPLOYEE_NAME}} ({{EMPLOYEE_ID}}),

Consequent to the positive evaluation of your probation performance since {{JOINING_DATE}} by {{REPORTING_MANAGER}}, we are pleased to confirm your services in the permanent cadre of the Company as {{DESIGNATION}} ({{DEPARTMENT}}) effective {{ISSUE_DATE}}.

We look forward to your continued growth at OFC360.

For OFC360 Technologies Pvt. Ltd.
VP – People Operations`,
  },
];

export const INITIAL_GENERATED_HISTORY: GeneratedDocumentHistoryItem[] = [
  {
    id: 'GEN-2026-901',
    templateId: 'TPL-HR-05',
    templateName: 'Salary Certificate',
    employeeId: 'EMP-1001',
    employeeName: 'Aarav Sharma',
    department: 'Engineering',
    generatedAt: '2026-11-06 02:15 PM',
    generatedBy: 'Priya Krishnan (HR Ops)',
    referenceNumber: 'OFC/HR/2026/SAL-884',
    renderedContent:
      'OFC360 TECHNOLOGIES PVT. LTD. · Ref: OFC/HR/2026/SAL-884 · Certified that Aarav Sharma (EMP-1001) is employed as Principal Product Engineer...',
  },
  {
    id: 'GEN-2026-902',
    templateId: 'TPL-HR-11',
    templateName: 'Confirmation Letter',
    employeeId: 'EMP-1004',
    employeeName: 'Priya Krishnan',
    department: 'People Operations',
    generatedAt: '2026-10-28 11:00 AM',
    generatedBy: 'Ananya Verma (VP HR)',
    referenceNumber: 'OFC/HR/2026/CNF-419',
    renderedContent:
      'OFC360 TECHNOLOGIES PVT. LTD. · Ref: OFC/HR/2026/CNF-419 · Probation Confirmation for Priya Krishnan (EMP-1004)...',
  },
];

export const INITIAL_AUDIT_LOGS: DocumentAuditLogEntry[] = [
  {
    id: 'AUD-DOC-1001',
    action: 'Document Uploaded',
    employeeId: 'EMP-1003',
    employeeName: 'Vikramaditya Nair',
    documentId: 'DOC-2026-005',
    documentName: 'Vikram_Nair_Cancelled_Cheque_HDFC.jpg',
    performedBy: 'Vikramaditya Nair',
    timestamp: '2026-11-10 05:40 PM',
    previousVersion: 'v1.0',
    currentVersion: 'v2.0',
    remarks: 'Uploaded updated HDFC salary account cancelled cheque.',
  },
  {
    id: 'AUD-DOC-1002',
    action: 'Document Rejected',
    employeeId: 'EMP-1005',
    employeeName: 'Marcus Vance',
    documentId: 'DOC-2026-006',
    documentName: 'Marcus_Vance_Prior_Relieving_Letter_Scan.png',
    performedBy: 'Priya Krishnan (HR Ops)',
    timestamp: '2026-11-09 04:05 PM',
    previousVersion: 'v1.0',
    currentVersion: 'v1.0',
    remarks: 'Rejected due to cropped signature block on mobile scan.',
  },
  {
    id: 'AUD-DOC-1003',
    action: 'Document Uploaded',
    employeeId: 'EMP-1002',
    employeeName: 'Elena Rostova',
    documentId: 'DOC-2026-004',
    documentName: 'Elena_Rostova_AWS_Solutions_Architect_Pro.pdf',
    performedBy: 'Elena Rostova',
    timestamp: '2026-11-09 03:12 PM',
    previousVersion: '—',
    currentVersion: 'v1.0',
    remarks: 'Uploaded AWS Solutions Architect Pro certification.',
  },
  {
    id: 'AUD-DOC-1004',
    action: 'Document Generated',
    employeeId: 'EMP-1001',
    employeeName: 'Aarav Sharma',
    documentId: 'GEN-2026-901',
    documentName: 'Salary Certificate (OFC/HR/2026/SAL-884)',
    performedBy: 'Priya Krishnan (HR Ops)',
    timestamp: '2026-11-06 02:15 PM',
    previousVersion: '—',
    currentVersion: 'v1.0',
    remarks: 'Generated sample salary verification letter for visa application.',
  },
  {
    id: 'AUD-DOC-1005',
    action: 'Document Verified',
    employeeId: 'EMP-1001',
    employeeName: 'Aarav Sharma',
    documentId: 'DOC-2026-001',
    documentName: 'Aarav_Sharma_Aadhaar_eKYC.pdf',
    performedBy: 'Priya Krishnan (HR Ops)',
    timestamp: '2026-10-03 11:20 AM',
    previousVersion: 'v1.0',
    currentVersion: 'v1.0',
    remarks: 'Verified Aadhaar e-KYC signature and demographic match.',
  },
];

export const INITIAL_SECURITY_SETTINGS: DocumentSecuritySettings = {
  maxFileSizeMb: 10,
  allowedFormats: ['PDF', 'JPG', 'JPEG', 'PNG', 'DOC', 'DOCX'],
  requireReasonOnRejection: true,
  autoMaskSensitiveIdentifiers: true,
  watermarkPreviews: true,
  expiryReminderDays: [60, 30, 15, 7],
  retentionYearsDefault: 8,
  autoArchiveOnExitDays: 90,
  rolePermissions: [
    {
      role: 'HR Admin / Super Admin',
      canViewAll: true,
      canUpload: true,
      canVerifyApprove: true,
      canDelete: true,
      canUnmaskPii: true,
      canGenerateLetters: true,
    },
    {
      role: 'HR Operations Executive',
      canViewAll: true,
      canUpload: true,
      canVerifyApprove: true,
      canDelete: false,
      canUnmaskPii: false,
      canGenerateLetters: true,
    },
    {
      role: 'Reporting Manager',
      canViewAll: false,
      canUpload: false,
      canVerifyApprove: false,
      canDelete: false,
      canUnmaskPii: false,
      canGenerateLetters: false,
    },
    {
      role: 'Employee (Self-Service)',
      canViewAll: false,
      canUpload: true,
      canVerifyApprove: false,
      canDelete: false,
      canUnmaskPii: false,
      canGenerateLetters: false,
    },
  ],
};

// ============================================================================
// PURE BUSINESS LOGIC FUNCTIONS (TESTABLE VIA NODE:TEST)
// ============================================================================

export function getExpiryDaysRemaining(
  expiryDate: string | null,
  referenceDateIso: string = REFERENCE_TODAY_ISO
): number | null {
  if (!expiryDate) return null;
  const expMs = new Date(`${expiryDate}T00:00:00Z`).getTime();
  const refMs = new Date(`${referenceDateIso}T00:00:00Z`).getTime();
  if (Number.isNaN(expMs) || Number.isNaN(refMs)) return null;
  return Math.round((expMs - refMs) / (1000 * 60 * 60 * 24));
}

export function classifyExpiryBucket(
  expiryDate: string | null,
  referenceDateIso: string = REFERENCE_TODAY_ISO
): DocumentExpiryBucket {
  const days = getExpiryDaysRemaining(expiryDate, referenceDateIso);
  if (days === null) return 'No Expiry';
  if (days < 0) return 'Expired';
  if (days <= 7) return 'Expiring in 7 Days';
  if (days <= 15) return 'Expiring in 15 Days';
  if (days <= 30) return 'Expiring in 30 Days';
  if (days <= 60) return 'Expiring in 60 Days';
  return 'Valid';
}

export function buildEmployeeDigitalProfiles(
  documents: EmployeeDocumentRecord[]
): EmployeeDigitalProfileSummary[] {
  const activeDocs = documents.filter((d) => !d.archived);

  return SEED_EMPLOYEES.map((emp) => {
    const empDocs = activeDocs.filter((d) => d.employeeId === emp.employeeId);
    const verifiedDocuments = empDocs.filter(
      (d) => d.verificationStatus === 'Verified'
    ).length;
    const pendingDocuments = empDocs.filter(
      (d) =>
        d.verificationStatus === 'Pending' ||
        d.verificationStatus === 'Under Review'
    ).length;
    const rejectedDocuments = empDocs.filter(
      (d) =>
        d.verificationStatus === 'Rejected' ||
        d.verificationStatus === 'Resubmission Required'
    ).length;

    const uploadedTypes = new Set(
      empDocs
        .filter(
          (d) =>
            d.verificationStatus !== 'Rejected' &&
            d.verificationStatus !== 'Expired'
        )
        .map((d) => d.documentType.toLowerCase())
    );

    const missingMandatoryDocuments = CORE_MANDATORY_CHECKLIST.filter(
      (item) => !uploadedTypes.has(item.type.toLowerCase())
    ).map((item) => item.type);

    const fulfilledCount =
      CORE_MANDATORY_CHECKLIST.length - missingMandatoryDocuments.length;
    const completionPercentage = Math.round(
      (fulfilledCount / CORE_MANDATORY_CHECKLIST.length) * 100
    );

    return {
      ...emp,
      totalDocuments: empDocs.length,
      verifiedDocuments,
      pendingDocuments,
      rejectedDocuments,
      missingMandatoryDocuments,
      completionPercentage,
    };
  });
}

export function computeDocumentKpis(
  documents: EmployeeDocumentRecord[],
  profiles: EmployeeDigitalProfileSummary[],
  referenceDateIso: string = REFERENCE_TODAY_ISO
): DocumentDashboardKpis {
  const activeDocs = documents.filter((d) => !d.archived);
  const totalDocuments = activeDocs.length;
  const verifiedDocuments = activeDocs.filter(
    (d) => d.verificationStatus === 'Verified'
  ).length;
  const pendingVerification = activeDocs.filter(
    (d) =>
      d.verificationStatus === 'Pending' ||
      d.verificationStatus === 'Under Review'
  ).length;
  const rejectedDocuments = activeDocs.filter(
    (d) =>
      d.verificationStatus === 'Rejected' ||
      d.verificationStatus === 'Resubmission Required'
  ).length;

  let expiringSoonCount = 0;
  let expiredDocumentsCount = 0;

  for (const doc of activeDocs) {
    const bucket = classifyExpiryBucket(doc.expiryDate, referenceDateIso);
    if (bucket === 'Expired' || doc.verificationStatus === 'Expired') {
      expiredDocumentsCount += 1;
    } else if (
      bucket === 'Expiring in 7 Days' ||
      bucket === 'Expiring in 15 Days' ||
      bucket === 'Expiring in 30 Days' ||
      bucket === 'Expiring in 60 Days'
    ) {
      expiringSoonCount += 1;
    }
  }

  const missingDocumentsCount = profiles.reduce(
    (acc, p) => acc + p.missingMandatoryDocuments.length,
    0
  );

  const completionRatePct =
    profiles.length > 0
      ? Math.round(
          profiles.reduce((acc, p) => acc + p.completionPercentage, 0) /
            profiles.length
        )
      : 100;

  return {
    totalDocuments,
    verifiedDocuments,
    pendingVerification,
    rejectedDocuments,
    missingDocumentsCount,
    expiringSoonCount,
    expiredDocumentsCount,
    completionRatePct,
  };
}

export interface DocumentFilterCriteria {
  globalSearch?: string;
  employeeQuery?: string;
  department?: string;
  categoryCode?: string;
  verificationStatus?: string;
  expiryFilter?:
    | 'ALL'
    | 'EXPIRING_SOON'
    | 'EXPIRED'
    | '7_DAYS'
    | '15_DAYS'
    | '30_DAYS'
    | '60_DAYS';
  dateFrom?: string;
  dateTo?: string;
  includeArchived?: boolean;
  sortBy?: 'uploadDate' | 'employeeName' | 'documentName' | 'expiryDate' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export function filterAndSortDocuments(
  documents: EmployeeDocumentRecord[],
  criteria: DocumentFilterCriteria,
  referenceDateIso: string = REFERENCE_TODAY_ISO
): EmployeeDocumentRecord[] {
  const q = (criteria.globalSearch || '').trim().toLowerCase();
  const empQ = (criteria.employeeQuery || '').trim().toLowerCase();
  const dept = criteria.department || 'All';
  const cat = criteria.categoryCode || 'All';
  const status = criteria.verificationStatus || 'All';
  const expiryFilter = criteria.expiryFilter || 'ALL';

  const filtered = documents.filter((doc) => {
    if (!criteria.includeArchived && doc.archived) return false;

    if (q) {
      const hay = `${doc.id} ${doc.employeeId} ${doc.employeeName} ${doc.documentName} ${doc.documentType} ${doc.categoryLabel} ${doc.department} ${doc.tags.join(' ')}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }

    if (empQ) {
      const empHay = `${doc.employeeId} ${doc.employeeName}`.toLowerCase();
      if (!empHay.includes(empQ)) return false;
    }

    if (dept !== 'All' && doc.department !== dept) return false;
    if (cat !== 'All' && doc.categoryCode !== cat) return false;

    if (status !== 'All') {
      if (status === 'PendingQueue') {
        if (
          doc.verificationStatus !== 'Pending' &&
          doc.verificationStatus !== 'Under Review'
        ) {
          return false;
        }
      } else if (doc.verificationStatus !== status) {
        return false;
      }
    }

    if (expiryFilter !== 'ALL') {
      const days = getExpiryDaysRemaining(doc.expiryDate, referenceDateIso);
      const isExpired =
        (days !== null && days < 0) || doc.verificationStatus === 'Expired';
      if (expiryFilter === 'EXPIRED' && !isExpired) return false;
      if (
        expiryFilter === 'EXPIRING_SOON' &&
        (days === null || days < 0 || days > 60)
      ) {
        return false;
      }
      if (expiryFilter === '7_DAYS' && (days === null || days < 0 || days > 7)) {
        return false;
      }
      if (
        expiryFilter === '15_DAYS' &&
        (days === null || days <= 7 || days > 15)
      ) {
        return false;
      }
      if (
        expiryFilter === '30_DAYS' &&
        (days === null || days <= 15 || days > 30)
      ) {
        return false;
      }
      if (
        expiryFilter === '60_DAYS' &&
        (days === null || days <= 30 || days > 60)
      ) {
        return false;
      }
    }

    if (criteria.dateFrom && doc.uploadDate < criteria.dateFrom) return false;
    if (criteria.dateTo && doc.uploadDate > criteria.dateTo) return false;

    return true;
  });

  const sortBy = criteria.sortBy || 'uploadDate';
  const dir = criteria.sortOrder === 'asc' ? 1 : -1;

  return [...filtered].sort((a, b) => {
    if (sortBy === 'employeeName') {
      return a.employeeName.localeCompare(b.employeeName) * dir;
    }
    if (sortBy === 'documentName') {
      return a.documentName.localeCompare(b.documentName) * dir;
    }
    if (sortBy === 'expiryDate') {
      const aExp = a.expiryDate || '9999-12-31';
      const bExp = b.expiryDate || '9999-12-31';
      return aExp.localeCompare(bExp) * dir;
    }
    if (sortBy === 'status') {
      return a.verificationStatus.localeCompare(b.verificationStatus) * dir;
    }
    return a.uploadDate.localeCompare(b.uploadDate) * dir;
  });
}

export function validateUploadFile(
  fileName: string,
  fileSizeBytes: number,
  settings: Pick<DocumentSecuritySettings, 'allowedFormats' | 'maxFileSizeMb'>
): { valid: boolean; ext?: SupportedFileExtension; error?: string } {
  const parts = fileName.trim().split('.');
  if (parts.length < 2) {
    return {
      valid: false,
      error: 'File must have a valid extension (PDF, JPG, JPEG, PNG, DOC, DOCX).',
    };
  }
  const rawExt = parts[parts.length - 1].toUpperCase() as SupportedFileExtension;
  if (!settings.allowedFormats.includes(rawExt)) {
    return {
      valid: false,
      error: `Unsupported file format (.${rawExt}). Allowed: ${settings.allowedFormats.join(', ')}.`,
    };
  }
  const maxBytes = settings.maxFileSizeMb * 1024 * 1024;
  if (fileSizeBytes <= 0) {
    return { valid: false, error: 'Selected file is empty (0 bytes).' };
  }
  if (fileSizeBytes > maxBytes) {
    return {
      valid: false,
      error: `File exceeds maximum allowed size of ${settings.maxFileSizeMb} MB.`,
    };
  }
  return { valid: true, ext: rawExt };
}

export function validateVerificationDecision(
  decision: DocumentVerificationStatus,
  remarks: string,
  requireReasonOnRejection = true
): { valid: boolean; error?: string } {
  if (
    (decision === 'Rejected' || decision === 'Resubmission Required') &&
    requireReasonOnRejection &&
    remarks.trim().length < 5
  ) {
    return {
      valid: false,
      error:
        'A clear rejection / resubmission reason (at least 5 characters) is mandatory.',
    };
  }
  return { valid: true };
}

export function interpolateTemplateContent(
  templateBody: string,
  employee: {
    employeeName: string;
    employeeId: string;
    designation: string;
    department: string;
    joiningDate: string;
    annualCtcFormatted: string;
    location: string;
    reportingManager: string;
  },
  referenceNumber: string,
  issueDate: string = REFERENCE_TODAY_ISO
): string {
  const replacements: Record<string, string> = {
    '{{EMPLOYEE_NAME}}': employee.employeeName,
    '{{EMPLOYEE_ID}}': employee.employeeId,
    '{{DESIGNATION}}': employee.designation,
    '{{DEPARTMENT}}': employee.department,
    '{{JOINING_DATE}}': employee.joiningDate,
    '{{ANNUAL_CTC}}': employee.annualCtcFormatted,
    '{{LOCATION}}': employee.location,
    '{{REPORTING_MANAGER}}': employee.reportingManager,
    '{{ISSUE_DATE}}': issueDate,
    '{{COMPANY_NAME}}': 'OFC360 Technologies Pvt. Ltd.',
    '{{REFERENCE_NO}}': referenceNumber,
  };

  let output = templateBody;
  for (const [token, value] of Object.entries(replacements)) {
    output = output.split(token).join(value);
  }
  return output;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}

export function simulateAiDocumentIntelligence(
  fileName: string,
  categoryCode: DocumentCategoryCode,
  documentType: string,
  employeeName: string
): EmployeeDocumentRecord['aiIntelligence'] {
  const isDuplicateHint = fileName.toLowerCase().includes('copy') || fileName.toLowerCase().includes('dup');
  return {
    classifiedType: `${documentType} (${categoryCode})`,
    confidenceScorePct: isDuplicateHint ? 84.5 : 97.8,
    ocrTextPreview: `SIMULATED OCR EXTRACT · Document: ${documentType.toUpperCase()} · Holder: ${employeeName.toUpperCase()} · File: ${fileName} · Integrity Check: Passed`,
    extractedFields: [
      { label: 'Holder Name', value: employeeName, matchedWithProfile: true },
      { label: 'Classified Type', value: documentType, matchedWithProfile: true },
      { label: 'Document Category', value: categoryCode, matchedWithProfile: true },
    ],
    missingFields: [],
    duplicateWarning: isDuplicateHint,
    duplicateRefId: isDuplicateHint ? 'DOC-2026-001' : undefined,
    qualityAssessment: 'High Clarity (300+ DPI)',
    dataMismatchDetected: false,
    completionSuggestions: [
      'Simulated AI extraction complete. Human HR verification required before final sign-off.',
    ],
  };
}
