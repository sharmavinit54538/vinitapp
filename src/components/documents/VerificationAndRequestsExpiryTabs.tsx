'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BellRing,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  FileSearch,
  FileWarning,
  Plus,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  XCircle,
} from 'lucide-react';
import {
  DocumentCategoryCode,
  DocumentCategoryConfig,
  DocumentRequestRecord,
  DocumentRequestStatus,
  DocumentVerificationStatus,
  EmployeeDigitalProfileSummary,
  EmployeeDocumentRecord,
} from '../../types/employeeDocuments';
import {
  classifyExpiryBucket,
  getExpiryDaysRemaining,
  REFERENCE_TODAY_ISO,
  validateVerificationDecision,
} from '../../services/employee-documents/documentsEngine';
import { getStatusBadgeStyle } from './OverviewAndAllDocumentsTabs';

// ============================================================================
// TAB 3: VERIFICATION & APPROVALS WORKFLOW + AI DOCUMENT INTELLIGENCE UI
// ============================================================================

interface VerificationAndApprovalsTabProps {
  documents: EmployeeDocumentRecord[];
  selectedDocId: string | null;
  onSelectDocId: (id: string) => void;
  maskSensitiveIds: boolean;
  onToggleChecklist: (
    docId: string,
    key: keyof EmployeeDocumentRecord['checklistState']
  ) => void;
  onApplyVerificationDecision: (
    docId: string,
    status: DocumentVerificationStatus,
    remarks: string,
    internalNotes: string
  ) => void;
  onOpenEmployeeProfile: (employeeId: string) => void;
}

export function VerificationAndApprovalsTab({
  documents,
  selectedDocId,
  onSelectDocId,
  maskSensitiveIds,
  onToggleChecklist,
  onApplyVerificationDecision,
  onOpenEmployeeProfile,
}: VerificationAndApprovalsTabProps) {
  const [statusFilter, setStatusFilter] = useState<string>(' ALL_QUEUE');
  const [draftRemarksByDoc, setDraftRemarksByDoc] = useState<Record<string, string>>({});
  const [draftNotesByDoc, setDraftNotesByDoc] = useState<Record<string, string>>({});
  const [decisionError, setDecisionError] = useState<string | null>(null);

  const activeDocs = useMemo(() => documents.filter((d) => !d.archived), [documents]);

  const filteredQueue = useMemo(() => {
    if (statusFilter === ' ALL_QUEUE') return activeDocs;
    if (statusFilter === 'PENDING_REVIEW') {
      return activeDocs.filter(
        (d) =>
          d.verificationStatus === 'Pending' || d.verificationStatus === 'Under Review'
      );
    }
    return activeDocs.filter((d) => d.verificationStatus === statusFilter);
  }, [activeDocs, statusFilter]);

  const currentDoc = useMemo(() => {
    const found = filteredQueue.find((d) => d.id === selectedDocId);
    return found || filteredQueue[0] || activeDocs[0] || null;
  }, [filteredQueue, selectedDocId, activeDocs]);

  const remarks = currentDoc
    ? draftRemarksByDoc[currentDoc.id] ?? (currentDoc.reviewerRemarks || '')
    : '';
  const internalNotes = currentDoc
    ? draftNotesByDoc[currentDoc.id] ?? (currentDoc.internalNotes || '')
    : '';

  const setRemarks = (val: string) => {
    if (!currentDoc) return;
    setDraftRemarksByDoc((prev) => ({ ...prev, [currentDoc.id]: val }));
  };

  const setInternalNotes = (val: string) => {
    if (!currentDoc) return;
    setDraftNotesByDoc((prev) => ({ ...prev, [currentDoc.id]: val }));
  };

  const handleDecision = (decision: DocumentVerificationStatus) => {
    if (!currentDoc) return;
    const validation = validateVerificationDecision(decision, remarks, true);
    if (!validation.valid) {
      setDecisionError(validation.error || 'Reason is required.');
      return;
    }
    setDecisionError(null);
    onApplyVerificationDecision(
      currentDoc.id,
      decision,
      remarks.trim() || `Marked as ${decision} by HR Verification Desk.`,
      internalNotes.trim()
    );
  };

  return (
    <div className="space-y-5">
      {/* STATUS FILTER BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            HR Document Verification & AI Compliance Studio
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Inspect OCR extraction, verify 5-point statutory checklist, and record approval or rejection decisions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: ' ALL_QUEUE', label: `All (${activeDocs.length})` },
            {
              id: 'PENDING_REVIEW',
              label: `Action Needed (${
                activeDocs.filter(
                  (d) =>
                    d.verificationStatus === 'Pending' ||
                    d.verificationStatus === 'Under Review'
                ).length
              })`,
            },
            { id: 'Pending', label: 'Pending' },
            { id: 'Under Review', label: 'Under Review' },
            { id: 'Verified', label: 'Verified' },
            { id: 'Rejected', label: 'Rejected' },
            { id: 'Resubmission Required', label: 'Resubmission Required' },
            { id: 'Expired', label: 'Expired' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SPLIT-PANE STUDIO */}
      <div className="grid grid-cols-1 @lg:grid-cols-12 gap-5">
        {/* LEFT QUEUE LIST (4 COLS) */}
        <div className="@lg:col-span-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xs space-y-2 max-h-[780px] overflow-y-auto">
          <div className="px-2 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Verification Queue ({filteredQueue.length})
          </div>
          {filteredQueue.map((doc) => {
            const isSelected = currentDoc?.id === doc.id;
            return (
              <button
                key={doc.id}
                type="button"
                onClick={() => onSelectDocId(doc.id)}
                className={`w-full text-left rounded-xl border p-3 transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                    : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {doc.documentType}
                  </span>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${getStatusBadgeStyle(
                      doc.verificationStatus
                    )}`}
                  >
                    {doc.verificationStatus}
                  </span>
                </div>
                <div className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                  {doc.employeeName} ({doc.employeeId})
                </div>
                <div className="mt-0.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[160px]">{doc.documentName}</span>
                  <span className="tabular-nums">
                    AI: {doc.aiIntelligence.confidenceScorePct}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT VERIFICATION WORKBENCH (8 COLS) */}
        <div className="@lg:col-span-8 space-y-4">
          {!currentDoc ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center text-xs text-slate-500">
              Select a document from the queue to inspect and verify.
            </div>
          ) : (
            <>
              {/* DOCUMENT & EMPLOYEE HEADER */}
              <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {currentDoc.documentName}
                      </h3>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-xs font-semibold ${getStatusBadgeStyle(
                          currentDoc.verificationStatus
                        )}`}
                      >
                        {currentDoc.verificationStatus}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Employee:{' '}
                      <button
                        type="button"
                        onClick={() => onOpenEmployeeProfile(currentDoc.employeeId)}
                        className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        {currentDoc.employeeName} ({currentDoc.employeeId})
                      </button>{' '}
                      · {currentDoc.department} · {currentDoc.designation}
                    </p>
                  </div>
                  <div className="text-right text-xs text-slate-500 tabular-nums">
                    <div>Uploaded: {currentDoc.uploadDate}</div>
                    <div>
                      Expiry: {currentDoc.expiryDate || 'Permanent / No Expiry'}
                    </div>
                  </div>
                </div>

                {/* DOCUMENT PREVIEW CANVAS */}
                <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-[11px] text-slate-400">
                    <span>
                      DOCUMENT PREVIEW · {currentDoc.fileExtension} ({currentDoc.fileSizeFormatted})
                    </span>
                    <span>Confidentiality: {currentDoc.confidentiality}</span>
                  </div>
                  <p className="leading-relaxed text-slate-300">
                    {currentDoc.aiIntelligence.ocrTextPreview}
                  </p>
                  {currentDoc.maskedIdentifier && (
                    <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Detected Statutory Number:</span>
                      <span className="font-bold text-emerald-400">
                        {maskSensitiveIds
                          ? currentDoc.maskedIdentifier
                          : currentDoc.unmaskedIdentifier || currentDoc.maskedIdentifier}
                      </span>
                    </div>
                  )}
                </div>

                {/* AI DOCUMENT INTELLIGENCE PANEL */}
                <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        AI Document Intelligence & OCR Analysis (Simulated Frontend Assistant)
                      </h4>
                    </div>
                    <span className="rounded-md bg-indigo-600 px-2 py-0.5 text-[11px] font-bold text-white tabular-nums">
                      Confidence: {currentDoc.aiIntelligence.confidenceScorePct}%
                    </span>
                  </div>

                  <div className="rounded-lg border border-amber-200 dark:border-amber-800/70 bg-amber-50/80 dark:bg-amber-950/40 px-3 py-1.5 text-[11px] text-amber-800 dark:text-amber-300">
                    Advisory Note: AI OCR & field classification are simulated on the frontend. Human HR verification is mandatory before final statutory approval.
                  </div>

                  <div className="grid grid-cols-1 @sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="rounded-lg bg-white dark:bg-slate-900 p-2.5 border border-slate-200/70 dark:border-slate-800">
                      <div className="text-[11px] text-slate-400">AI Classification</div>
                      <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                        {currentDoc.aiIntelligence.classifiedType}
                      </div>
                    </div>
                    <div className="rounded-lg bg-white dark:bg-slate-900 p-2.5 border border-slate-200/70 dark:border-slate-800">
                      <div className="text-[11px] text-slate-400">Quality Assessment</div>
                      <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                        {currentDoc.aiIntelligence.qualityAssessment}
                      </div>
                    </div>
                    <div className="rounded-lg bg-white dark:bg-slate-900 p-2.5 border border-slate-200/70 dark:border-slate-800">
                      <div className="text-[11px] text-slate-400">Duplicate Check</div>
                      <div
                        className={`font-semibold mt-0.5 ${
                          currentDoc.aiIntelligence.duplicateWarning
                            ? 'text-rose-600'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {currentDoc.aiIntelligence.duplicateWarning
                          ? `Potential Duplicate (${currentDoc.aiIntelligence.duplicateRefId})`
                          : 'Unique File Hash'}
                      </div>
                    </div>
                  </div>

                  {/* Extracted Fields Table */}
                  <div className="grid grid-cols-1 @sm:grid-cols-3 gap-2">
                    {currentDoc.aiIntelligence.extractedFields.map((field) => (
                      <div
                        key={field.label}
                        className="rounded-lg bg-white dark:bg-slate-900 px-3 py-2 border border-slate-200/70 dark:border-slate-800 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="text-[10px] text-slate-400">{field.label}</div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {field.value}
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            field.matchedWithProfile
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {field.matchedWithProfile ? 'Match ✓' : 'Mismatch !'}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Missing Fields or Data Mismatch Warnings */}
                  {currentDoc.aiIntelligence.dataMismatchDetected && (
                    <div className="rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-950/50 dark:border-rose-800 p-2.5 text-xs text-rose-700 dark:text-rose-300">
                      <strong>Data Mismatch Alert:</strong>{' '}
                      {currentDoc.aiIntelligence.mismatchDetails}
                    </div>
                  )}

                  {currentDoc.aiIntelligence.missingFields.length > 0 && (
                    <div className="rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-950/50 dark:border-orange-800 p-2.5 text-xs text-orange-800 dark:text-orange-300">
                      <strong>Missing Fields Detected:</strong>{' '}
                      {currentDoc.aiIntelligence.missingFields.join(', ')}
                    </div>
                  )}
                </div>

                {/* 5-POINT HR VERIFICATION CHECKLIST */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                    5-Point Statutory Verification Checklist
                  </h4>
                  <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-3 gap-2">
                    {(
                      [
                        {
                          key: 'legibilityVerified',
                          label: '1. Scan Legibility & DPI Clear',
                        },
                        {
                          key: 'nameMatchesProfile',
                          label: '2. Name Matches HR Master',
                        },
                        {
                          key: 'idNumberValidated',
                          label: '3. ID / Account Number Validated',
                        },
                        {
                          key: 'validityDateChecked',
                          label: '4. Issue & Expiry Dates Valid',
                        },
                        {
                          key: 'authenticityStampChecked',
                          label: '5. Seal / Signature Verified',
                        },
                      ] as const
                    ).map((item) => (
                      <label
                        key={item.key}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 p-2.5 text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
                      >
                        <input
                          type="checkbox"
                          checked={currentDoc.checklistState[item.key]}
                          onChange={() => onToggleChecklist(currentDoc.id, item.key)}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* REVIEWER REMARKS & INTERNAL NOTES */}
                <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Reviewer Remarks (Shared with Employee · Mandatory on Rejection)
                    </label>
                    <textarea
                      rows={2}
                      value={remarks}
                      onChange={(e) => {
                        setRemarks(e.target.value);
                        setDecisionError(null);
                      }}
                      placeholder="Enter verification sign-off note or rejection reason..."
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Internal HR Audit Notes (HR Only)
                    </label>
                    <textarea
                      rows={2}
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Add private background verification reference notes..."
                      className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                {decisionError && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
                    {decisionError}
                  </div>
                )}

                {/* VERIFICATION ACTIONS */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-[11px] text-slate-500">
                    {currentDoc.reviewerName ? (
                      <span>
                        Last reviewed by <strong>{currentDoc.reviewerName}</strong> on{' '}
                        {currentDoc.reviewedAt}
                      </span>
                    ) : (
                      <span>Not yet reviewed by HR Compliance</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDecision('Verified')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Approve Document
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision('Resubmission Required')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-700"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Request Resubmission
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecision('Rejected')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reject Document
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB 4: DOCUMENT REQUESTS & EXPIRY / MISSING DOCUMENT TRACKER
// ============================================================================

interface RequestsAndExpiryTabProps {
  requests: DocumentRequestRecord[];
  documents: EmployeeDocumentRecord[];
  profiles: EmployeeDigitalProfileSummary[];
  categories: DocumentCategoryConfig[];
  expiryReminderDays: number[];
  onCreateRequest: (newReq: Omit<DocumentRequestRecord, 'id' | 'createdAt' | 'remindersSentCount'>) => void;
  onUpdateRequestStatus: (reqId: string, status: DocumentRequestStatus) => void;
  onSendReminder: (reqId: string) => void;
  onUpdateExpiryReminders: (days: number[]) => void;
  onOpenEmployeeProfile: (employeeId: string) => void;
}

export function RequestsAndExpiryTab({
  requests,
  documents,
  profiles,
  categories,
  expiryReminderDays,
  onCreateRequest,
  onUpdateRequestStatus,
  onSendReminder,
  onUpdateExpiryReminders,
  onOpenEmployeeProfile,
}: RequestsAndExpiryTabProps) {
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('ALL');
  const [expiryHorizonFilter, setExpiryHorizonFilter] = useState<
    'ALL' | 'EXPIRED' | '7_DAYS' | '15_DAYS' | '30_DAYS' | '60_DAYS'
  >('ALL');

  // New request form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [reqEmpId, setReqEmpId] = useState(profiles[0]?.employeeId || 'EMP-1005');
  const [reqCategory, setReqCategory] = useState<DocumentCategoryCode>('IDENTITY');
  const [reqDocType, setReqDocType] = useState('Passport');
  const [reqDueDate, setReqDueDate] = useState('2026-11-25');
  const [reqPriority, setReqPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('High');
  const [reqInstructions, setReqInstructions] = useState(
    'Please upload a high-resolution PDF copy for annual statutory compliance verification.'
  );

  const filteredRequests = useMemo(() => {
    if (requestStatusFilter === 'ALL') return requests;
    return requests.filter((r) => r.status === requestStatusFilter);
  }, [requests, requestStatusFilter]);

  const expiringOrExpiredDocs = useMemo(() => {
    return documents
      .filter((d) => !d.archived && (d.expiryDate !== null || d.verificationStatus === 'Expired'))
      .filter((doc) => {
        const days = getExpiryDaysRemaining(doc.expiryDate, REFERENCE_TODAY_ISO);
        const isExpired = (days !== null && days < 0) || doc.verificationStatus === 'Expired';
        if (expiryHorizonFilter === 'EXPIRED') return isExpired;
        if (expiryHorizonFilter === '7_DAYS') return days !== null && days >= 0 && days <= 7;
        if (expiryHorizonFilter === '15_DAYS') return days !== null && days >= 0 && days <= 15;
        if (expiryHorizonFilter === '30_DAYS') return days !== null && days >= 0 && days <= 30;
        if (expiryHorizonFilter === '60_DAYS') return days !== null && days >= 0 && days <= 60;
        return true;
      });
  }, [documents, expiryHorizonFilter]);

  const handleSubmitNewRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = profiles.find((p) => p.employeeId === reqEmpId) || profiles[0];
    onCreateRequest({
      employeeId: emp.employeeId,
      employeeName: emp.employeeName,
      department: emp.department,
      requiredDocumentType: reqDocType,
      categoryCode: reqCategory,
      dueDate: reqDueDate,
      priority: reqPriority,
      instructions: reqInstructions,
      status: 'Sent',
      requestedBy: 'HR Compliance Desk',
    });
    setShowRequestForm(false);
  };

  const toggleAlertDay = (day: number) => {
    if (expiryReminderDays.includes(day)) {
      onUpdateExpiryReminders(expiryReminderDays.filter((d) => d !== day));
    } else {
      onUpdateExpiryReminders([...expiryReminderDays, day].sort((a, b) => b - a));
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION 1: DOCUMENT REQUEST MANAGEMENT */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Document Request Management & Follow-Up Tracker
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Request missing or renewed documents from employees and track submission SLAs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowRequestForm((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            {showRequestForm ? 'Close Request Form' : 'Create Document Request'}
          </button>
        </div>

        {/* CREATE DOCUMENT REQUEST FORM */}
        {showRequestForm && (
          <form
            onSubmit={handleSubmitNewRequest}
            className="rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/40 dark:bg-indigo-950/20 p-4 space-y-3"
          >
            <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
              New Employee Document Request
            </div>
            <div className="grid grid-cols-1 @sm:grid-cols-3 @lg:grid-cols-5 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Employee
                </label>
                <select
                  value={reqEmpId}
                  onChange={(e) => setReqEmpId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs"
                >
                  {profiles.map((p) => (
                    <option key={p.employeeId} value={p.employeeId}>
                      {p.employeeName} ({p.department})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={reqCategory}
                  onChange={(e) => setReqCategory(e.target.value as DocumentCategoryCode)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs"
                >
                  {categories.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Required Document
                </label>
                <input
                  type="text"
                  value={reqDocType}
                  onChange={(e) => setReqDocType(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={reqDueDate}
                  onChange={(e) => setReqDueDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={reqPriority}
                  onChange={(e) =>
                    setReqPriority(e.target.value as 'Low' | 'Medium' | 'High' | 'Urgent')
                  }
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                type="text"
                value={reqInstructions}
                onChange={(e) => setReqInstructions(e.target.value)}
                placeholder="Instructions for employee..."
                className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs"
              />
              <button
                type="submit"
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Dispatch Request
              </button>
            </div>
          </form>
        )}

        {/* STATUS FILTER PILLS */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(['ALL', 'Draft', 'Sent', 'Pending', 'Submitted', 'Overdue', 'Completed', 'Cancelled'] as const).map(
            (st) => (
              <button
                key={st}
                type="button"
                onClick={() => setRequestStatusFilter(st)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                  requestStatusFilter === st
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {st}
              </button>
            )
          )}
        </div>

        {/* REQUEST TRACKING TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase text-slate-400">
                <th className="py-2.5 px-3">Req ID</th>
                <th className="py-2.5 px-3">Employee</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Required Document</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Reminders</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {req.id}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                    <button
                      type="button"
                      onClick={() => onOpenEmployeeProfile(req.employeeId)}
                      className="hover:underline"
                    >
                      {req.employeeName} ({req.employeeId})
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                    {req.department}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                    {req.requiredDocumentType}
                  </td>
                  <td className="py-2.5 px-3 tabular-nums text-slate-600 dark:text-slate-400">
                    {req.dueDate}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        req.priority === 'Urgent'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : req.priority === 'High'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {req.priority}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {req.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 tabular-nums text-slate-500">
                    {req.remindersSentCount} sent
                  </td>
                  <td className="py-2.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onSendReminder(req.id)}
                      className="rounded border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100"
                    >
                      Send Reminder
                    </button>
                    {req.status !== 'Completed' && (
                      <button
                        type="button"
                        onClick={() => onUpdateRequestStatus(req.id, 'Completed')}
                        className="rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                      >
                        Mark Completed
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: EXPIRY & MISSING DOCUMENT TRACKER + CUSTOM ALERT SETTINGS */}
      <div className="grid grid-cols-1 @lg:grid-cols-3 gap-5">
        <div className="@lg:col-span-2 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Expiry Horizon & Validity Tracker
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monitor Expired, 7-Day, 15-Day, 30-Day, and 60-Day document renewals
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {(
                [
                  { id: 'ALL', label: 'All Tracked' },
                  { id: 'EXPIRED', label: 'Expired' },
                  { id: '7_DAYS', label: '≤ 7 Days' },
                  { id: '15_DAYS', label: '≤ 15 Days' },
                  { id: '30_DAYS', label: '≤ 30 Days' },
                  { id: '60_DAYS', label: '≤ 60 Days' },
                ] as const
              ).map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setExpiryHorizonFilter(b.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold ${
                    expiryHorizonFilter === b.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {expiringOrExpiredDocs.map((doc) => {
              const days = getExpiryDaysRemaining(doc.expiryDate, REFERENCE_TODAY_ISO);
              const bucket = classifyExpiryBucket(doc.expiryDate, REFERENCE_TODAY_ISO);
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 dark:border-slate-800 p-3.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {doc.employeeName} ({doc.employeeId})
                      </span>
                      <span className="text-xs text-slate-500">· {doc.department}</span>
                      <span className="rounded bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                        {bucket}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-600 dark:text-slate-300 truncate">
                      {doc.documentType} ({doc.documentName}) · Expiry:{' '}
                      <span className="font-semibold tabular-nums">{doc.expiryDate}</span> (
                      {days !== null && days < 0
                        ? `Expired ${Math.abs(days)} days ago`
                        : `${days} days left`}
                      )
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onCreateRequest({
                        employeeId: doc.employeeId,
                        employeeName: doc.employeeName,
                        department: doc.department,
                        requiredDocumentType: `${doc.documentType} (Renewal)`,
                        categoryCode: doc.categoryCode,
                        dueDate: '2026-11-25',
                        priority: 'High',
                        instructions: `Renewal required for ${doc.documentName} (Expiry: ${doc.expiryDate}).`,
                        status: 'Sent',
                        requestedBy: 'Expiry Tracker Automation',
                      })
                    }
                    className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    Trigger Renewal Request
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* CUSTOM EXPIRY ALERT SETTINGS & MISSING MANDATORY SUMMARY */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Custom Expiry Alert Cadence
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure automated reminder milestones prior to document expiration date.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[60, 30, 15, 7].map((day) => {
                const active = expiryReminderDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleAlertDay(day)}
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold text-left flex items-center justify-between ${
                      active
                        ? 'border-indigo-500 bg-indigo-50/70 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-500'
                    }`}
                  >
                    <span className="tabular-nums">{day} Days Prior</span>
                    <span>{active ? 'ON' : 'OFF'}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Missing Mandatory Checklist Summary
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {profiles.map((p) => (
                <div
                  key={p.employeeId}
                  className="rounded-lg border border-slate-100 dark:border-slate-800 p-2.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {p.employeeName}
                    </span>
                    <span className="text-[11px] font-bold text-amber-600 tabular-nums">
                      {p.missingMandatoryDocuments.length} missing
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500 truncate">
                    {p.missingMandatoryDocuments.join(', ') || 'All mandatory documents complete'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
