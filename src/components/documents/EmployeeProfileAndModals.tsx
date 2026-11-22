'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Eye,
  FileCheck,
  FileText,
  FolderOpen,
  History,
  Lock,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  Upload,
  User,
  X,
  XCircle,
} from 'lucide-react';
import {
  ConfidentialityLevel,
  DocumentCategoryCode,
  DocumentCategoryConfig,
  DocumentSecuritySettings,
  EmployeeDigitalProfileSummary,
  EmployeeDocumentRecord,
} from '../../types/employeeDocuments';
import {
  formatBytes,
  REFERENCE_TODAY_ISO,
  simulateAiDocumentIntelligence,
  validateUploadFile,
} from '../../services/employee-documents/documentsEngine';
import { getStatusBadgeStyle } from './OverviewAndAllDocumentsTabs';

// ============================================================================
// 1. EMPLOYEE DIGITAL DOCUMENT PROFILE DRAWER / MODAL
// ============================================================================

interface EmployeeDigitalProfileDrawerProps {
  profile: EmployeeDigitalProfileSummary | null;
  documents: EmployeeDocumentRecord[];
  categories: DocumentCategoryConfig[];
  maskSensitiveIds: boolean;
  onClose: () => void;
  onOpenUploadForCategory: (
    employeeId: string,
    categoryCode: DocumentCategoryCode,
    defaultDocType?: string
  ) => void;
  onPreviewDocument: (doc: EmployeeDocumentRecord) => void;
  onVerifyDocument: (docId: string) => void;
  onRejectDocument: (doc: EmployeeDocumentRecord) => void;
  onReplaceDocument: (doc: EmployeeDocumentRecord) => void;
  onArchiveDocument: (docId: string) => void;
}

export function EmployeeDigitalProfileDrawer({
  profile,
  documents,
  categories,
  maskSensitiveIds,
  onClose,
  onOpenUploadForCategory,
  onPreviewDocument,
  onVerifyDocument,
  onRejectDocument,
  onReplaceDocument,
  onArchiveDocument,
}: EmployeeDigitalProfileDrawerProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    IDENTITY: true,
    ADDRESS: true,
    EDUCATION: true,
    PREVIOUS_EMPLOYMENT: true,
    JOINING: true,
    PAYROLL: true,
    PERFORMANCE: false,
    EXIT: false,
  });

  if (!profile) return null;

  const empDocs = documents.filter(
    (d) => d.employeeId === profile.employeeId && !d.archived
  );

  const toggleCat = (code: string) => {
    setExpandedCategories((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
      <div className="relative flex h-full w-full max-w-3xl flex-col bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800">
        {/* DRAWER HEADER */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 p-5 bg-slate-50/70 dark:bg-slate-900">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-base font-bold text-white shadow-xs">
              {profile.avatarInitials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {profile.employeeName}
                </h2>
                <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-300">
                  {profile.employeeId}
                </span>
                <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  {profile.employmentStatus}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {profile.designation} · {profile.department} · Joined{' '}
                <span className="tabular-nums">{profile.joiningDate}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* COMPLETION METRICS STRIP */}
        <div className="grid grid-cols-2 @sm:grid-cols-5 gap-3 border-b border-slate-200 dark:border-slate-800 px-5 py-3.5 bg-white dark:bg-slate-900">
          <div className="col-span-2 @sm:col-span-1">
            <div className="text-[11px] text-slate-500">Completion</div>
            <div className="text-base font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {profile.completionPercentage}%
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{ width: `${profile.completionPercentage}%` }}
              />
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Total Files</div>
            <div className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
              {profile.totalDocuments}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Verified</div>
            <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {profile.verifiedDocuments}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Pending</div>
            <div className="text-base font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {profile.pendingDocuments}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500">Missing Mandatory</div>
            <div className="text-base font-bold text-rose-600 dark:text-rose-400 tabular-nums">
              {profile.missingMandatoryDocuments.length}
            </div>
          </div>
        </div>

        {/* 8 EXPANDABLE STATUTORY CATEGORIES (A through H) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {categories.map((cat) => {
            const catDocs = empDocs.filter((d) => d.categoryCode === cat.code);
            const isExpanded = !!expandedCategories[cat.code];
            const allExpectedTypes = [...cat.mandatoryTypes, ...cat.optionalTypes];

            return (
              <div
                key={cat.code}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-slate-50/70 dark:bg-slate-800/40">
                  <button
                    type="button"
                    onClick={() => toggleCat(cat.code)}
                    className="flex items-center gap-2.5 text-left flex-1"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    )}
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {cat.name}
                      </span>
                      <span className="ml-2 rounded-md bg-slate-200/70 dark:bg-slate-700 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                        {catDocs.length} uploaded
                      </span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenUploadForCategory(
                        profile.employeeId,
                        cat.code as DocumentCategoryCode,
                        allExpectedTypes[0]
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100"
                  >
                    <Upload className="h-3 w-3" />
                    Upload to Folder
                  </button>
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-3">
                    {/* Expected document chips */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] text-slate-400 mr-1">
                        Supported Types:
                      </span>
                      {cat.mandatoryTypes.map((t) => {
                        const present = catDocs.some(
                          (d) => d.documentType.toLowerCase() === t.toLowerCase()
                        );
                        return (
                          <span
                            key={t}
                            className={`rounded px-2 py-0.5 text-[10px] font-medium border ${
                              present
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                            }`}
                          >
                            {t} (Mandatory {present ? '✓' : '• Missing'})
                          </span>
                        );
                      })}
                      {cat.optionalTypes.map((t) => (
                        <span
                          key={t}
                          className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] text-slate-600 dark:text-slate-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {catDocs.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 p-4 text-center text-xs text-slate-400">
                        No documents uploaded in {cat.name} yet.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {catDocs.map((doc) => (
                          <div
                            key={doc.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 dark:border-slate-800 p-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                  {doc.documentType}
                                </span>
                                <span
                                  className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${getStatusBadgeStyle(
                                    doc.verificationStatus
                                  )}`}
                                >
                                  {doc.verificationStatus}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {doc.versions[0]?.versionNumber || 'v1.0'}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {doc.documentName} ({doc.fileSizeFormatted}) · Uploaded{' '}
                                <span className="tabular-nums">{doc.uploadDate}</span>
                                {doc.maskedIdentifier && (
                                  <span className="ml-2 font-mono text-slate-600 dark:text-slate-300">
                                    ID:{' '}
                                    {maskSensitiveIds
                                      ? doc.maskedIdentifier
                                      : doc.unmaskedIdentifier || doc.maskedIdentifier}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Per-category document actions: Upload, Preview, Download, Replace, Verify, Reject, Archive */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onPreviewDocument(doc)}
                                className="rounded border border-slate-200 dark:border-slate-700 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                              >
                                Preview
                              </button>
                              <button
                                type="button"
                                onClick={() => onReplaceDocument(doc)}
                                className="rounded border border-slate-200 dark:border-slate-700 px-2 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                              >
                                Replace
                              </button>
                              {doc.verificationStatus !== 'Verified' && (
                                <button
                                  type="button"
                                  onClick={() => onVerifyDocument(doc.id)}
                                  className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                                >
                                  Verify
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onRejectDocument(doc)}
                                className="rounded border border-rose-200 dark:border-rose-800 px-2 py-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50"
                              >
                                Reject
                              </button>
                              <button
                                type="button"
                                onClick={() => onArchiveDocument(doc.id)}
                                className="rounded p-1 text-slate-400 hover:text-rose-600"
                                title="Archive Document"
                              >
                                <Archive className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. DOCUMENT UPLOAD CENTER MODAL (SINGLE & BULK UPLOAD WITH FRONTEND VALIDATION)
// ============================================================================

interface DocumentUploadCenterModalProps {
  isOpen: boolean;
  mode: 'single' | 'bulk';
  profiles: EmployeeDigitalProfileSummary[];
  categories: DocumentCategoryConfig[];
  securitySettings: DocumentSecuritySettings;
  defaultEmployeeId?: string;
  defaultCategoryCode?: DocumentCategoryCode;
  defaultDocumentType?: string;
  onClose: () => void;
  onUploadComplete: (newDocs: EmployeeDocumentRecord[]) => void;
}

export function DocumentUploadCenterModal({
  isOpen,
  mode,
  profiles,
  categories,
  securitySettings,
  defaultEmployeeId,
  defaultCategoryCode,
  defaultDocumentType,
  onClose,
  onUploadComplete,
}: DocumentUploadCenterModalProps) {
  const [selectedEmpId, setSelectedEmpId] = useState(
    defaultEmployeeId || profiles[0]?.employeeId || 'EMP-1001'
  );
  const [categoryCode, setCategoryCode] = useState<DocumentCategoryCode>(
    defaultCategoryCode || 'IDENTITY'
  );
  const [documentType, setDocumentType] = useState(
    defaultDocumentType || 'Aadhaar Card'
  );
  const [issueDate, setIssueDate] = useState('2026-11-01');
  const [expiryDate, setExpiryDate] = useState('');
  const [confidentiality, setConfidentiality] = useState<ConfidentialityLevel>(
    'Confidential'
  );
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('KYC, Onboarding');
  const [stagedFiles, setStagedFiles] = useState<
    { name: string; sizeBytes: number; valid: boolean; error?: string; ext?: string }[]
  >([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [validationBanner, setValidationBanner] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeCat =
    categories.find((c) => c.code === categoryCode) || categories[0];
  const availableTypes = [
    ...activeCat.mandatoryTypes,
    ...activeCat.optionalTypes,
    'Custom HR Record',
  ];

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setValidationBanner(null);
    const evaluated = Array.from(fileList).map((f) => {
      const check = validateUploadFile(f.name, f.size, securitySettings);
      return {
        name: f.name,
        sizeBytes: f.size,
        valid: check.valid,
        error: check.error,
        ext: check.ext,
      };
    });
    setStagedFiles((prev) => (mode === 'bulk' ? [...prev, ...evaluated] : evaluated.slice(0, 1)));
  };

  const handleStageSimulatedFile = (sampleName: string, sampleSizeBytes: number) => {
    setValidationBanner(null);
    const check = validateUploadFile(sampleName, sampleSizeBytes, securitySettings);
    const item = {
      name: sampleName,
      sizeBytes: sampleSizeBytes,
      valid: check.valid,
      error: check.error,
      ext: check.ext,
    };
    setStagedFiles((prev) => (mode === 'bulk' ? [...prev, item] : [item]));
  };

  const handleExecuteUpload = () => {
    const validFiles = stagedFiles.filter((f) => f.valid);
    if (validFiles.length === 0) {
      setValidationBanner(
        'Please attach at least one valid file (PDF, JPG, JPEG, PNG, DOC, DOCX within size limit) before uploading.'
      );
      return;
    }

    setUploadProgress(25);
    setTimeout(() => setUploadProgress(70), 150);
    setTimeout(() => {
      setUploadProgress(100);
      const emp =
        profiles.find((p) => p.employeeId === selectedEmpId) || profiles[0];
      const createdDocs: EmployeeDocumentRecord[] = validFiles.map((file, idx) => {
        const ai = simulateAiDocumentIntelligence(
          file.name,
          categoryCode,
          documentType,
          emp.employeeName
        );
        return {
          id: `DOC-2026-${Math.floor(100 + Math.random() * 899)}-${idx}`,
          employeeId: emp.employeeId,
          employeeName: emp.employeeName,
          avatarInitials: emp.avatarInitials,
          department: emp.department,
          designation: emp.designation,
          joiningDate: emp.joiningDate,
          employmentStatus: emp.employmentStatus,
          documentName: file.name,
          categoryCode,
          categoryLabel: activeCat.name,
          documentType,
          fileExtension: (file.ext as EmployeeDocumentRecord['fileExtension']) || 'PDF',
          fileSizeBytes: file.sizeBytes,
          fileSizeFormatted: formatBytes(file.sizeBytes),
          uploadDate: REFERENCE_TODAY_ISO,
          issueDate: issueDate || REFERENCE_TODAY_ISO,
          expiryDate: expiryDate ? expiryDate : null,
          verificationStatus: 'Pending',
          uploadedBy: 'HR Admin (Upload Center)',
          confidentiality,
          maskedIdentifier: 'XXXX-••••-9012',
          unmaskedIdentifier: '9481-2201-9012',
          description:
            description.trim() ||
            `Uploaded via OFC360 Document Upload Center (${mode} mode).`,
          tags: tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          mandatory: activeCat.mandatoryTypes.includes(documentType),
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
              uploadedAt: `${REFERENCE_TODAY_ISO} 02:30 PM`,
              uploadedBy: 'HR Admin',
              fileName: file.name,
              fileSizeFormatted: formatBytes(file.sizeBytes),
              changeNotes: 'Initial upload via Document Upload Center',
              statusAtVersion: 'Pending',
            },
          ],
          aiIntelligence: ai,
        };
      });

      onUploadComplete(createdDocs);
      setUploadProgress(null);
      setStagedFiles([]);
      onClose();
    }, 320);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {mode === 'bulk' ? 'Bulk Document Upload Center' : 'Upload Employee Document'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Supported formats: {securitySettings.allowedFormats.join(', ')} · Max size:{' '}
              {securitySettings.maxFileSizeMb} MB per file (Frontend-Simulated Storage)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFilesSelected(e.dataTransfer.files);
            }}
            className="rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/40 dark:bg-indigo-950/20 p-5 text-center"
          >
            <Upload className="mx-auto h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            <p className="mt-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
              Drag & drop document files here, or browse from your computer
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Automatic frontend format, extension, and size validation with simulated AI OCR scan
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <label className="cursor-pointer rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">
                Browse Local Files
                <input
                  type="file"
                  multiple={mode === 'bulk'}
                  onChange={(e) => handleFilesSelected(e.target.files)}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  handleStageSimulatedFile(
                    `${selectedEmpId}_${documentType.replace(/\s+/g, '_')}_VerifiedScan.pdf`,
                    780 * 1024
                  )
                }
                className="rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50"
              >
                + Attach Sample Valid PDF (780 KB)
              </button>
              <button
                type="button"
                onClick={() =>
                  handleStageSimulatedFile('Unsupported_Archive_Payload.exe', 1200 * 1024)
                }
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100"
              >
                Test Invalid File (.exe)
              </button>
            </div>
          </div>

          {/* Staged Files List */}
          {stagedFiles.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Staged Files ({stagedFiles.length})
              </div>
              {stagedFiles.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                    file.valid
                      ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30'
                      : 'border-rose-200 bg-rose-50/60 dark:border-rose-800 dark:bg-rose-950/30'
                  }`}
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {file.name}
                    </span>{' '}
                    <span className="text-slate-500">({formatBytes(file.sizeBytes)})</span>
                    {!file.valid && (
                      <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
                        {file.error}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setStagedFiles((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {validationBanner && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">
              {validationBanner}
            </div>
          )}

          {uploadProgress !== null && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold text-indigo-600">
                <span>Simulating encrypted vault ingestion & OCR classification...</span>
                <span className="tabular-nums">{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Metadata Form Grid */}
          <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employee *
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                {profiles.map((p) => (
                  <option key={p.employeeId} value={p.employeeId}>
                    {p.employeeName} ({p.employeeId}) — {p.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document Category (A–H) *
              </label>
              <select
                value={categoryCode}
                onChange={(e) => {
                  const nextCode = e.target.value as DocumentCategoryCode;
                  setCategoryCode(nextCode);
                  const nextCat = categories.find((c) => c.code === nextCode);
                  if (nextCat) {
                    const firstType =
                      nextCat.mandatoryTypes[0] ||
                      nextCat.optionalTypes[0] ||
                      'Custom HR Record';
                    setDocumentType(firstType);
                  }
                }}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document Type *
              </label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                {availableTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confidentiality Level
              </label>
              <select
                value={confidentiality}
                onChange={(e) =>
                  setConfidentiality(e.target.value as ConfidentialityLevel)
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                <option value="Public Internal">Public Internal</option>
                <option value="Standard HR">Standard HR</option>
                <option value="Confidential">Confidential</option>
                <option value="Strictly Restricted (PII)">
                  Strictly Restricted (PII)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Issue Date
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expiry Date (Optional)
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Document Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add verification context or onboarding reference notes..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50/60 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExecuteUpload}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Complete Upload to Vault
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. DOCUMENT PREVIEW, EDIT DETAILS, REPLACE & VERSION HISTORY MODAL
// ============================================================================

interface DocumentActionModalProps {
  doc: EmployeeDocumentRecord | null;
  modalType: 'preview' | 'edit' | 'replace' | 'history' | 'reject' | null;
  maskSensitiveIds: boolean;
  onClose: () => void;
  onSaveEdit: (
    docId: string,
    updates: {
      documentName: string;
      documentType: string;
      expiryDate: string | null;
      confidentiality: ConfidentialityLevel;
      description: string;
    }
  ) => void;
  onConfirmReplace: (docId: string, newFileName: string, changeNotes: string) => void;
  onConfirmReject: (docId: string, reason: string) => void;
  onVerifyDocument: (docId: string) => void;
}

export function DocumentActionModal({
  doc,
  modalType,
  maskSensitiveIds,
  onClose,
  onSaveEdit,
  onConfirmReplace,
  onConfirmReject,
  onVerifyDocument,
}: DocumentActionModalProps) {
  const [editName, setEditName] = useState(doc?.documentName || '');
  const [editType, setEditType] = useState(doc?.documentType || '');
  const [editExpiry, setEditExpiry] = useState(doc?.expiryDate || '');
  const [editConf, setEditConf] = useState<ConfidentialityLevel>(
    doc?.confidentiality || 'Confidential'
  );
  const [editDesc, setEditDesc] = useState(doc?.description || '');

  const [replaceFileName, setReplaceFileName] = useState(
    doc ? `Updated_v${doc.versions.length + 1}_${doc.documentName}` : ''
  );
  const [replaceNotes, setReplaceNotes] = useState(
    'Uploaded higher-resolution scan with full signature block'
  );

  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  if (!doc || !modalType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {modalType === 'preview' && 'Secure Document Preview & OCR Extract'}
              {modalType === 'edit' && 'Edit Document Metadata'}
              {modalType === 'replace' && 'Replace Document & Increment Version'}
              {modalType === 'history' && 'Document Version History & Audit Trail'}
              {modalType === 'reject' && 'Reject Document (Mandatory Reason)'}
            </h3>
            <p className="text-xs text-slate-500">
              {doc.employeeName} ({doc.employeeId}) · {doc.documentName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {modalType === 'preview' && (
            <>
              <div className="relative rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-950 text-slate-100 p-5 font-mono text-xs overflow-hidden">
                <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center opacity-10 -rotate-12 text-2xl font-black tracking-widest text-white">
                  OFC360 CONFIDENTIAL PREVIEW · {doc.employeeId}
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                  <span className="text-indigo-400 font-semibold">
                    {doc.fileExtension} RENDERED PREVIEW ({doc.fileSizeFormatted})
                  </span>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px]">
                    {doc.confidentiality}
                  </span>
                </div>
                <p className="leading-relaxed text-slate-300">
                  {doc.aiIntelligence.ocrTextPreview}
                </p>
                {doc.maskedIdentifier && (
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Extracted Statutory Identifier:</span>
                    <span className="font-bold text-emerald-400">
                      {maskSensitiveIds
                        ? doc.maskedIdentifier
                        : doc.unmaskedIdentifier || doc.maskedIdentifier}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 @sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-3">
                  <div className="text-slate-400">Category</div>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {doc.categoryLabel}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-3">
                  <div className="text-slate-400">Verification Status</div>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {doc.verificationStatus}
                  </div>
                </div>
                <div className="rounded-lg border border-slate-100 dark:border-slate-800 p-3">
                  <div className="text-slate-400">AI Confidence</div>
                  <div className="font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5 tabular-nums">
                    {doc.aiIntelligence.confidenceScorePct}% ({doc.aiIntelligence.qualityAssessment})
                  </div>
                </div>
              </div>
            </>
          )}

          {modalType === 'edit' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document File Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Document Type
                  </label>
                  <input
                    type="text"
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={editExpiry}
                    onChange={(e) => setEditExpiry(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>
            </div>
          )}

          {modalType === 'replace' && (
            <div className="space-y-3">
              <div className="rounded-lg border border-blue-200 bg-blue-50/60 dark:border-blue-900 dark:bg-blue-950/30 p-3 text-xs text-blue-800 dark:text-blue-300">
                Replacing this document preserves all previous versions ({doc.versions.length}{' '}
                existing) in the immutable audit log and increments the active version to{' '}
                <span className="font-bold">v{doc.versions.length + 1}.0</span>.
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Replacement File Name
                </label>
                <input
                  type="text"
                  value={replaceFileName}
                  onChange={(e) => setReplaceFileName(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Version Change Notes
                </label>
                <textarea
                  rows={2}
                  value={replaceNotes}
                  onChange={(e) => setReplaceNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
                />
              </div>
            </div>
          )}

          {modalType === 'history' && (
            <div className="space-y-3">
              {doc.versions.map((ver, idx) => (
                <div
                  key={`${ver.versionNumber}-${idx}`}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 text-xs font-bold text-indigo-600 dark:text-indigo-300">
                        {ver.versionNumber}
                      </span>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white">
                        {ver.fileName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({ver.fileSizeFormatted})
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      {ver.changeNotes}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400 tabular-nums">
                      Uploaded by {ver.uploadedBy} on {ver.uploadedAt}
                    </p>
                  </div>
                  <span
                    className={`rounded border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeStyle(
                      ver.statusAtVersion
                    )}`}
                  >
                    {ver.statusAtVersion}
                  </span>
                </div>
              ))}
            </div>
          )}

          {modalType === 'reject' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Provide a specific rejection reason. The employee will be notified to re-upload a compliant scan.
              </p>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => {
                  setRejectReason(e.target.value);
                  setRejectError(null);
                }}
                placeholder="e.g., Signature block is cropped out or document resolution is blurry..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
              />
              {rejectError && (
                <p className="text-xs font-semibold text-rose-600">{rejectError}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50/60 dark:bg-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            Close
          </button>
          {modalType === 'preview' && doc.verificationStatus !== 'Verified' && (
            <button
              type="button"
              onClick={() => {
                onVerifyDocument(doc.id);
                onClose();
              }}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              Verify & Approve Document
            </button>
          )}
          {modalType === 'edit' && (
            <button
              type="button"
              onClick={() => {
                onSaveEdit(doc.id, {
                  documentName: editName,
                  documentType: editType,
                  expiryDate: editExpiry ? editExpiry : null,
                  confidentiality: editConf,
                  description: editDesc,
                });
                onClose();
              }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Save Changes
            </button>
          )}
          {modalType === 'replace' && (
            <button
              type="button"
              onClick={() => {
                onConfirmReplace(doc.id, replaceFileName, replaceNotes);
                onClose();
              }}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Upload New Version
            </button>
          )}
          {modalType === 'reject' && (
            <button
              type="button"
              onClick={() => {
                if (rejectReason.trim().length < 5) {
                  setRejectError('Mandatory rejection reason must be at least 5 characters.');
                  return;
                }
                onConfirmReject(doc.id, rejectReason.trim());
                onClose();
              }}
              className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
            >
              Confirm Rejection
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
