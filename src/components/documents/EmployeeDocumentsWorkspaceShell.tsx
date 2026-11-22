'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Eye,
  EyeOff,
  FilePlus2,
  FileSpreadsheet,
  FolderKanban,
  Grid,
  LayoutDashboard,
  RotateCcw,
  Search,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import {
  ConfidentialityLevel,
  DocumentAuditAction,
  DocumentAuditLogEntry,
  DocumentCategoryCode,
  DocumentCategoryConfig,
  DocumentMainTabId,
  DocumentRequestRecord,
  DocumentRequestStatus,
  DocumentSecuritySettings,
  DocumentTemplateRecord,
  DocumentVerificationStatus,
  EmployeeDocumentRecord,
  GeneratedDocumentHistoryItem,
} from '../../types/employeeDocuments';
import {
  buildEmployeeDigitalProfiles,
  computeDocumentKpis,
  DocumentFilterCriteria,
  INITIAL_AUDIT_LOGS,
  INITIAL_CATEGORY_CONFIGS,
  INITIAL_DOCUMENT_REQUESTS,
  INITIAL_DOCUMENTS,
  INITIAL_GENERATED_HISTORY,
  INITIAL_HR_TEMPLATES,
  INITIAL_SECURITY_SETTINGS,
  REFERENCE_TODAY_ISO,
} from '../../services/employee-documents/documentsEngine';
import {
  AllDocumentsTableTab,
  OverviewDashboardTab,
} from './OverviewAndAllDocumentsTabs';
import {
  DocumentActionModal,
  DocumentUploadCenterModal,
  EmployeeDigitalProfileDrawer,
} from './EmployeeProfileAndModals';
import {
  RequestsAndExpiryTab,
  VerificationAndApprovalsTab,
} from './VerificationAndRequestsExpiryTabs';
import {
  ReportsAndSettingsTab,
  TemplatesAndDocumentGeneratorTab,
} from './TemplatesGeneratorAndReportsSettingsTabs';

const STORAGE_KEY = 'ofc360_employee_documents_v1';

export interface DocumentNavModuleItem {
  id: DocumentMainTabId;
  number: number;
  label: string;
  shortLabel: string;
  subtitle: string;
  cardGroup: 1 | 2;
  Icon: React.ComponentType<{ className?: string }>;
  iconBgClass: string;
  iconColorClass: string;
}

export const DOCUMENT_MODULES_REGISTRY: DocumentNavModuleItem[] = [
  {
    id: 'overview',
    number: 1,
    label: '1. Overview',
    shortLabel: 'Overview',
    subtitle: 'Document dashboard, KPIs & compliance analytics',
    cardGroup: 1,
    Icon: LayoutDashboard,
    iconBgClass: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColorClass: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'all-documents',
    number: 2,
    label: '2. All Documents',
    shortLabel: 'All Docs',
    subtitle: 'Centralized employee document vault & A–H folders',
    cardGroup: 1,
    Icon: FolderKanban,
    iconBgClass: 'bg-blue-50 dark:bg-blue-950/60',
    iconColorClass: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'verification',
    number: 3,
    label: '3. Verification & Approvals',
    shortLabel: 'Verify',
    subtitle: 'AI OCR verification studio & 5-point checklist',
    cardGroup: 1,
    Icon: ShieldCheck,
    iconBgClass: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColorClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'requests-expiry',
    number: 4,
    label: '4. Requests & Expiry',
    shortLabel: 'Requests',
    subtitle: 'Missing document requests & 7/15/30/60d expiry',
    cardGroup: 2,
    Icon: CalendarClock,
    iconBgClass: 'bg-amber-50 dark:bg-amber-950/60',
    iconColorClass: 'text-amber-500 dark:text-amber-400',
  },
  {
    id: 'templates-generator',
    number: 5,
    label: '5. Templates & Document Generator',
    shortLabel: 'Templates',
    subtitle: '11 HR letter templates & live PDF generator',
    cardGroup: 2,
    Icon: FilePlus2,
    iconBgClass: 'bg-violet-50 dark:bg-violet-950/60',
    iconColorClass: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'reports-settings',
    number: 6,
    label: '6. Reports & Settings',
    shortLabel: 'Reports',
    subtitle: '8 compliance reports, audit trail & RBAC security',
    cardGroup: 2,
    Icon: FileSpreadsheet,
    iconBgClass: 'bg-sky-50 dark:bg-sky-950/60',
    iconColorClass: 'text-sky-600 dark:text-sky-400',
  },
];

const CARD_GROUPS: { id: 1 | 2; title: string }[] = [
  { id: 1, title: 'Vault & Verification' },
  { id: 2, title: 'Requests, Templates & Governance' },
];

interface EmployeeDocumentsWorkspaceShellProps {
  initialModule?: DocumentMainTabId;
  startInDirectory?: boolean;
  embedded?: boolean;
  onBack?: () => void;
}

export function EmployeeDocumentsWorkspaceShell({
  initialModule = 'overview',
  startInDirectory = false,
  embedded = false,
  onBack,
}: EmployeeDocumentsWorkspaceShellProps) {
  const [activeTab, setActiveTab] = useState<DocumentMainTabId>(initialModule);
  const [viewMode, setViewMode] = useState<'directory' | 'module'>(
    startInDirectory ? 'directory' : 'module'
  );
  const [searchQuery, setSearchQuery] = useState('');

  const [documents, setDocuments] = useState<EmployeeDocumentRecord[]>(() => {
    if (typeof window === 'undefined') return INITIAL_DOCUMENTS;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.documents) && parsed.documents.length > 0) {
          return parsed.documents;
        }
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_DOCUMENTS;
  });
  const [categories, setCategories] = useState<DocumentCategoryConfig[]>(
    INITIAL_CATEGORY_CONFIGS
  );
  const [requests, setRequests] = useState<DocumentRequestRecord[]>(() => {
    if (typeof window === 'undefined') return INITIAL_DOCUMENT_REQUESTS;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.requests)) {
          return parsed.requests;
        }
      }
    } catch {
      // ignore storage errors
    }
    return INITIAL_DOCUMENT_REQUESTS;
  });
  const [templates, setTemplates] = useState<DocumentTemplateRecord[]>(
    INITIAL_HR_TEMPLATES
  );
  const [generatedHistory, setGeneratedHistory] = useState<
    GeneratedDocumentHistoryItem[]
  >(INITIAL_GENERATED_HISTORY);
  const [auditLogs, setAuditLogs] =
    useState<DocumentAuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  const [securitySettings, setSecuritySettings] = useState<DocumentSecuritySettings>(
    INITIAL_SECURITY_SETTINGS
  );

  // Filter state for All Documents tab
  const [filterCriteria, setFilterCriteria] = useState<DocumentFilterCriteria>({
    globalSearch: '',
    employeeQuery: '',
    department: 'All',
    categoryCode: 'All',
    verificationStatus: 'All',
    expiryFilter: 'ALL',
    dateFrom: '',
    dateTo: '',
    sortBy: 'uploadDate',
    sortOrder: 'desc',
  });

  // Verification studio selected document
  const [verificationDocId, setVerificationDocId] = useState<string | null>(
    'DOC-2026-004'
  );

  // Modals & Drawers state
  const [activeProfileEmpId, setActiveProfileEmpId] = useState<string | null>(null);
  const [uploadModalState, setUploadModalState] = useState<{
    open: boolean;
    mode: 'single' | 'bulk';
    defaultEmpId?: string;
    defaultCat?: DocumentCategoryCode;
    defaultDocType?: string;
  }>({ open: false, mode: 'single' });

  const [docActionModal, setDocActionModal] = useState<{
    doc: EmployeeDocumentRecord | null;
    type: 'preview' | 'edit' | 'replace' | 'history' | 'reject' | null;
  }>({ doc: null, type: null });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Persist to localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ documents, requests })
      );
    } catch {
      // ignore storage errors
    }
  }, [documents, requests]);

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3400);
  };

  const handleOpenModule = (id: DocumentMainTabId) => {
    setActiveTab(id);
    setViewMode('module');
  };

  const appendAudit = (
    action: DocumentAuditAction,
    doc: Pick<
      EmployeeDocumentRecord,
      'id' | 'employeeId' | 'employeeName' | 'documentName'
    >,
    remarks: string,
    prevVer = 'v1.0',
    currVer = 'v1.0'
  ) => {
    const entry: DocumentAuditLogEntry = {
      id: `AUD-DOC-${Math.floor(1000 + Math.random() * 8999)}`,
      action,
      employeeId: doc.employeeId,
      employeeName: doc.employeeName,
      documentId: doc.id,
      documentName: doc.documentName,
      performedBy: 'HR Compliance Admin',
      timestamp: `${REFERENCE_TODAY_ISO} 03:45 PM`,
      previousVersion: prevVer,
      currentVersion: currVer,
      remarks,
    };
    setAuditLogs((prev) => [entry, ...prev]);
  };

  const profiles = useMemo(
    () => buildEmployeeDigitalProfiles(documents),
    [documents]
  );

  const kpis = useMemo(
    () => computeDocumentKpis(documents, profiles, REFERENCE_TODAY_ISO),
    [documents, profiles]
  );

  const activeProfile = useMemo(
    () => profiles.find((p) => p.employeeId === activeProfileEmpId) || null,
    [profiles, activeProfileEmpId]
  );

  // Navigation helper from KPI cards -> All Documents filtered
  const handleNavigateFiltered = (preset: Partial<DocumentFilterCriteria>) => {
    setFilterCriteria({
      globalSearch: '',
      employeeQuery: '',
      department: 'All',
      categoryCode: 'All',
      verificationStatus: 'All',
      expiryFilter: 'ALL',
      dateFrom: '',
      dateTo: '',
      sortBy: 'uploadDate',
      sortOrder: 'desc',
      ...preset,
    });
    setActiveTab('all-documents');
    setViewMode('module');
  };

  // Document verification handlers
  const handleQuickVerify = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId) return d;
        appendAudit(
          'Document Verified',
          d,
          'Approved and verified by HR Compliance.',
          d.versions[0]?.versionNumber || 'v1.0',
          d.versions[0]?.versionNumber || 'v1.0'
        );
        return {
          ...d,
          verificationStatus: 'Verified',
          reviewerName: 'HR Compliance Admin',
          reviewedAt: `${REFERENCE_TODAY_ISO} 03:45 PM`,
          reviewerRemarks: 'Verified against statutory KYC checklist.',
        };
      })
    );
    notify('Document marked as Verified and logged in audit trail.');
  };

  const handleConfirmReject = (docId: string, reason: string) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId) return d;
        appendAudit('Document Rejected', d, `Rejected: ${reason}`);
        return {
          ...d,
          verificationStatus: 'Rejected',
          reviewerName: 'HR Compliance Admin',
          reviewedAt: `${REFERENCE_TODAY_ISO} 03:45 PM`,
          reviewerRemarks: reason,
        };
      })
    );
    notify('Document rejected with mandatory reason recorded.');
  };

  const handleApplyStudioDecision = (
    docId: string,
    status: DocumentVerificationStatus,
    remarks: string,
    internalNotes: string
  ) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId) return d;
        appendAudit(
          status === 'Verified' ? 'Document Verified' : 'Document Rejected',
          d,
          remarks
        );
        return {
          ...d,
          verificationStatus: status,
          reviewerName: 'HR Compliance Admin',
          reviewedAt: `${REFERENCE_TODAY_ISO} 03:48 PM`,
          reviewerRemarks: remarks,
          internalNotes,
        };
      })
    );
    notify(`Verification decision "${status}" recorded for ${docId}.`);
  };

  const handleToggleChecklist = (
    docId: string,
    key: keyof EmployeeDocumentRecord['checklistState']
  ) => {
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              checklistState: {
                ...d.checklistState,
                [key]: !d.checklistState[key],
              },
            }
          : d
      )
    );
  };

  const handleSaveEdit = (
    docId: string,
    updates: {
      documentName: string;
      documentType: string;
      expiryDate: string | null;
      confidentiality: ConfidentialityLevel;
      description: string;
    }
  ) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId) return d;
        appendAudit('Document Updated', d, 'Updated metadata details.');
        return { ...d, ...updates };
      })
    );
    notify('Document metadata updated.');
  };

  const handleConfirmReplace = (
    docId: string,
    newFileName: string,
    changeNotes: string
  ) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId) return d;
        const prevVer = d.versions[0]?.versionNumber || 'v1.0';
        const nextVer = `v${d.versions.length + 1}.0`;
        appendAudit('Document Replaced', d, changeNotes, prevVer, nextVer);
        return {
          ...d,
          documentName: newFileName,
          uploadDate: REFERENCE_TODAY_ISO,
          verificationStatus: 'Pending',
          versions: [
            {
              versionNumber: nextVer,
              uploadedAt: `${REFERENCE_TODAY_ISO} 04:00 PM`,
              uploadedBy: 'HR Compliance Admin',
              fileName: newFileName,
              fileSizeFormatted: d.fileSizeFormatted,
              changeNotes,
              statusAtVersion: 'Pending',
            },
            ...d.versions,
          ],
        };
      })
    );
    notify('New document version uploaded and version history updated.');
  };

  const handleDeleteOrArchive = (docId: string) => {
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== docId) return d;
        appendAudit('Document Archived', d, 'Archived from active vault.');
        return { ...d, archived: true };
      })
    );
    notify('Document archived from active vault.');
  };

  const handleResetDemoState = () => {
    setDocuments(INITIAL_DOCUMENTS);
    setRequests(INITIAL_DOCUMENT_REQUESTS);
    setCategories(INITIAL_CATEGORY_CONFIGS);
    setTemplates(INITIAL_HR_TEMPLATES);
    setGeneratedHistory(INITIAL_GENERATED_HISTORY);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSecuritySettings(INITIAL_SECURITY_SETTINGS);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    notify('Employee Documents demo dataset restored to factory state.');
  };

  const getBadgeForModule = (id: DocumentMainTabId): number | undefined => {
    if (id === 'all-documents') return kpis.totalDocuments;
    if (id === 'verification') return kpis.pendingVerification;
    if (id === 'requests-expiry')
      return requests.filter((r) => r.status !== 'Completed').length;
    if (id === 'templates-generator') return templates.length;
    return undefined;
  };

  const activeMeta =
    DOCUMENT_MODULES_REGISTRY.find((m) => m.id === activeTab) ||
    DOCUMENT_MODULES_REGISTRY[0];

  const queryTrimmed = searchQuery.toLowerCase().trim();
  const filteredModules = DOCUMENT_MODULES_REGISTRY.filter((m) => {
    return (
      !queryTrimmed ||
      m.label.toLowerCase().includes(queryTrimmed) ||
      m.shortLabel.toLowerCase().includes(queryTrimmed) ||
      m.subtitle.toLowerCase().includes(queryTrimmed)
    );
  });

  // Render the 6 Employee Documents modules in Payroll smartphone-app directory style
  const renderDirectoryCards = () => {
    if (filteredModules.length === 0) {
      return (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-xs">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No modules found matching &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      );
    }

    return (
      <div
        className="w-full bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800/80"
        data-testid="documents-modules-directory"
      >
        {filteredModules.map((item) => {
          const badgeCount = getBadgeForModule(item.id);
          return (
            <button
              key={item.id}
              type="button"
              data-testid={`doc-tab-${item.id}`}
              onClick={() => handleOpenModule(item.id)}
              className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 transition hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 cursor-pointer"
            >
              {/* Title & Subtitle */}
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-zinc-950 dark:text-white leading-snug truncate">
                  {item.label}
                </div>
                <div className="text-[12px] font-normal text-zinc-500 dark:text-zinc-400 leading-snug truncate mt-0.5">
                  {item.subtitle}
                </div>
              </div>

              {badgeCount !== undefined && (
                <span className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums shrink-0">
                  {badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={
        embedded
          ? '@container w-full p-0 m-0 text-slate-900 dark:text-white font-sans'
          : '@container min-h-screen bg-slate-100 dark:bg-slate-950 flex justify-center text-slate-900 dark:text-white font-sans antialiased'
      }
    >
      <div
        className={
          embedded
            ? 'w-full p-0 m-0'
            : 'w-full max-w-[440px] min-h-screen bg-slate-50 dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 flex flex-col shadow-sm'
        }
      >
        {/* Toast Notification */}
        {toastMessage ? (
          <div
            role="status"
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-slate-900 text-white px-4 py-2.5 text-xs font-semibold shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        ) : null}

        {/* 1. STICKY MOBILE TOP APP BAR (Standalone /documents route) */}
        {!embedded && (
          <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {onBack ? (
                <button
                  type="button"
                  onClick={onBack}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  href="/?tab=more"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                  aria-label="Back to All Modules"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              )}
              <span className="text-[17px] font-extrabold tracking-tight text-slate-900 dark:text-white">
                OFC360
              </span>
            </div>
          </header>
        )}

        {/* 2. MAIN CONTENT AREA */}
        <main
          className={
            viewMode === 'directory'
              ? 'w-full p-0 m-0'
              : embedded
                ? 'space-y-3.5 p-4'
                : 'flex-1 p-4 space-y-4 overflow-x-hidden bg-neutral-50 dark:bg-zinc-950'
          }
        >
          {viewMode === 'directory' ? (
            renderDirectoryCards()
          ) : (
            <section className="w-full min-w-0 space-y-3.5">
              {/* Sub-module Back Bar to return to Document Modules list */}
              <div className="rounded-xl px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-start gap-2.5">
                <button
                  type="button"
                  onClick={() => setViewMode('directory')}
                  className="h-9 px-3 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer hover:bg-zinc-200/70 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Document Modules</span>
                </button>
              </div>

              {/* Compact Vault Utility Bar (PII Masking, Digital Vault Drawer, Reset) */}
              <div className="rounded-2xl px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSecuritySettings((prev) => ({
                        ...prev,
                        autoMaskSensitiveIdentifiers: !prev.autoMaskSensitiveIdentifiers,
                      }))
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
                    title="Toggle Aadhaar, PAN, Passport, and Bank A/C Masking"
                  >
                    {securitySettings.autoMaskSensitiveIdentifiers ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                        PII Masked
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5 text-emerald-600" />
                        PII Unmasked
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveProfileEmpId(profiles[0]?.employeeId || 'EMP-1001')
                    }
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                  >
                    <Users className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    Employee Digital Vault
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleResetDemoState}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  title="Reset Local Demo Data"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </button>
              </div>

              {activeTab === 'overview' && (
                <OverviewDashboardTab
                  kpis={kpis}
                  documents={documents}
                  profiles={profiles}
                  categories={categories}
                  onNavigateFiltered={handleNavigateFiltered}
                  onSwitchTab={(t) => handleOpenModule(t)}
                  onOpenUploadModal={(mode, defaultEmpId) =>
                    setUploadModalState({ open: true, mode, defaultEmpId })
                  }
                  onOpenRequestModal={() => handleOpenModule('requests-expiry')}
                  onOpenEmployeeProfile={(empId) => setActiveProfileEmpId(empId)}
                  onSelectDocForVerification={(docId) => {
                    setVerificationDocId(docId);
                    handleOpenModule('verification');
                  }}
                  onPreviewDocument={(doc) =>
                    setDocActionModal({ doc, type: 'preview' })
                  }
                />
              )}

              {activeTab === 'all-documents' && (
                <AllDocumentsTableTab
                  documents={documents}
                  categories={categories}
                  filterCriteria={filterCriteria}
                  onChangeFilterCriteria={setFilterCriteria}
                  maskSensitiveIds={securitySettings.autoMaskSensitiveIdentifiers}
                  onPreviewDocument={(doc) =>
                    setDocActionModal({ doc, type: 'preview' })
                  }
                  onOpenEmployeeProfile={(empId) => setActiveProfileEmpId(empId)}
                  onVerifyDocumentQuick={handleQuickVerify}
                  onRejectDocumentModal={(doc) =>
                    setDocActionModal({ doc, type: 'reject' })
                  }
                  onEditDocumentModal={(doc) =>
                    setDocActionModal({ doc, type: 'edit' })
                  }
                  onReplaceDocumentModal={(doc) =>
                    setDocActionModal({ doc, type: 'replace' })
                  }
                  onViewVersionHistoryModal={(doc) =>
                    setDocActionModal({ doc, type: 'history' })
                  }
                  onDeleteOrArchiveDocument={handleDeleteOrArchive}
                  onBulkVerify={(ids) => {
                    setDocuments((prev) =>
                      prev.map((d) =>
                        ids.includes(d.id)
                          ? {
                              ...d,
                              verificationStatus: 'Verified',
                              reviewerName: 'HR Bulk Verification',
                              reviewedAt: `${REFERENCE_TODAY_ISO} 04:10 PM`,
                            }
                          : d
                      )
                    );
                    notify(`Bulk verified ${ids.length} documents.`);
                  }}
                  onBulkAssignCategory={(ids, catCode) => {
                    const catObj = categories.find((c) => c.code === catCode);
                    setDocuments((prev) =>
                      prev.map((d) =>
                        ids.includes(d.id)
                          ? {
                              ...d,
                              categoryCode: catCode,
                              categoryLabel: catObj?.name || catCode,
                            }
                          : d
                      )
                    );
                    notify(
                      `Reassigned ${ids.length} documents to ${
                        catObj?.name || catCode
                      }.`
                    );
                  }}
                  onOpenUploadModal={(mode, defaultEmpId) =>
                    setUploadModalState({ open: true, mode, defaultEmpId })
                  }
                  onNotify={notify}
                />
              )}

              {activeTab === 'verification' && (
                <VerificationAndApprovalsTab
                  documents={documents}
                  selectedDocId={verificationDocId}
                  onSelectDocId={setVerificationDocId}
                  maskSensitiveIds={securitySettings.autoMaskSensitiveIdentifiers}
                  onToggleChecklist={handleToggleChecklist}
                  onApplyVerificationDecision={handleApplyStudioDecision}
                  onOpenEmployeeProfile={(empId) => setActiveProfileEmpId(empId)}
                />
              )}

              {activeTab === 'requests-expiry' && (
                <RequestsAndExpiryTab
                  requests={requests}
                  documents={documents}
                  profiles={profiles}
                  categories={categories}
                  expiryReminderDays={securitySettings.expiryReminderDays}
                  onCreateRequest={(newReq) => {
                    const created: DocumentRequestRecord = {
                      ...newReq,
                      id: `REQ-DOC-${Math.floor(600 + Math.random() * 399)}`,
                      createdAt: REFERENCE_TODAY_ISO,
                      remindersSentCount: 0,
                    };
                    setRequests((prev) => [created, ...prev]);
                    notify(
                      `Dispatched document request for "${newReq.requiredDocumentType}" to ${newReq.employeeName}.`
                    );
                  }}
                  onUpdateRequestStatus={(reqId, status: DocumentRequestStatus) => {
                    setRequests((prev) =>
                      prev.map((r) => (r.id === reqId ? { ...r, status } : r))
                    );
                    notify(`Updated request ${reqId} status to ${status}.`);
                  }}
                  onSendReminder={(reqId) => {
                    setRequests((prev) =>
                      prev.map((r) =>
                        r.id === reqId
                          ? {
                              ...r,
                              remindersSentCount: r.remindersSentCount + 1,
                              lastReminderAt: `${REFERENCE_TODAY_ISO} 04:15 PM`,
                            }
                          : r
                      )
                    );
                    notify(`Simulated email & in-app reminder dispatched for ${reqId}.`);
                  }}
                  onUpdateExpiryReminders={(days) => {
                    setSecuritySettings((prev) => ({
                      ...prev,
                      expiryReminderDays: days,
                    }));
                    notify(
                      `Updated expiry reminder cadence: ${days.join(', ')} days prior.`
                    );
                  }}
                  onOpenEmployeeProfile={(empId) => setActiveProfileEmpId(empId)}
                />
              )}

              {activeTab === 'templates-generator' && (
                <TemplatesAndDocumentGeneratorTab
                  templates={templates}
                  categories={categories}
                  profiles={profiles}
                  generatedHistory={generatedHistory}
                  onGenerateDocument={(item) => {
                    const record: GeneratedDocumentHistoryItem = {
                      ...item,
                      id: `GEN-2026-${Math.floor(100 + Math.random() * 899)}`,
                      generatedAt: `${REFERENCE_TODAY_ISO} 04:20 PM`,
                    };
                    setGeneratedHistory((prev) => [record, ...prev]);
                    appendAudit(
                      'Document Generated',
                      {
                        id: record.id,
                        employeeId: item.employeeId,
                        employeeName: item.employeeName,
                        documentName: `${item.templateName} (${item.referenceNumber})`,
                      },
                      `Generated ${item.templateName} via HR Document Generator.`
                    );
                    notify(
                      `Generated ${item.templateName} (${item.referenceNumber}) for ${item.employeeName}.`
                    );
                  }}
                  onToggleTemplateActive={(tplId) => {
                    setTemplates((prev) =>
                      prev.map((t) =>
                        t.id === tplId ? { ...t, active: !t.active } : t
                      )
                    );
                  }}
                  onCreateCategory={(cat) => {
                    setCategories((prev) => [...prev, cat]);
                    notify(`Created custom document category "${cat.name}".`);
                  }}
                  onDeleteCategory={(code) => {
                    setCategories((prev) => prev.filter((c) => c.code !== code));
                    notify(`Removed custom category ${code}.`);
                  }}
                  onNotify={notify}
                />
              )}

              {activeTab === 'reports-settings' && (
                <ReportsAndSettingsTab
                  documents={documents}
                  profiles={profiles}
                  auditLogs={auditLogs}
                  securitySettings={securitySettings}
                  onUpdateSecuritySettings={(next) => {
                    setSecuritySettings(next);
                    notify('Updated Document Security & Governance settings.');
                  }}
                  onNotify={notify}
                />
              )}
            </section>
          )}
        </main>

        {/* 3. STICKY MOBILE BOTTOM NAVIGATION BAR (Standalone /documents route) */}
        {!embedded && (
          <nav className="sticky bottom-0 z-30 flex h-16 items-center justify-around border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-2 backdrop-blur-md">
            {[
              {
                id: 'menu',
                label: 'All Menu',
                Icon: Grid,
                isActive: viewMode === 'directory',
                onTap: () => setViewMode('directory'),
              },
              {
                id: 'overview',
                label: 'Overview',
                Icon: LayoutDashboard,
                isActive: viewMode === 'module' && activeTab === 'overview',
                onTap: () => handleOpenModule('overview'),
              },
              {
                id: 'all-documents',
                label: 'All Docs',
                Icon: FolderKanban,
                isActive: viewMode === 'module' && activeTab === 'all-documents',
                onTap: () => handleOpenModule('all-documents'),
              },
              {
                id: 'verification',
                label: 'Verify',
                Icon: ShieldCheck,
                isActive: viewMode === 'module' && activeTab === 'verification',
                onTap: () => handleOpenModule('verification'),
              },
              {
                id: 'templates-generator',
                label: 'Templates',
                Icon: FilePlus2,
                isActive: viewMode === 'module' && activeTab === 'templates-generator',
                onTap: () => handleOpenModule('templates-generator'),
              },
            ].map((tab) => {
              const TabIcon = tab.Icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={tab.onTap}
                  className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[10px] font-bold transition-colors cursor-pointer ${
                    tab.isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  <TabIcon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* EMPLOYEE DIGITAL DOCUMENT PROFILE DRAWER */}
        <EmployeeDigitalProfileDrawer
          profile={activeProfile}
          documents={documents}
          categories={categories}
          maskSensitiveIds={securitySettings.autoMaskSensitiveIdentifiers}
          onClose={() => setActiveProfileEmpId(null)}
          onOpenUploadForCategory={(empId, catCode, defaultDocType) =>
            setUploadModalState({
              open: true,
              mode: 'single',
              defaultEmpId: empId,
              defaultCat: catCode,
              defaultDocType,
            })
          }
          onPreviewDocument={(doc) => setDocActionModal({ doc, type: 'preview' })}
          onVerifyDocument={handleQuickVerify}
          onRejectDocument={(doc) => setDocActionModal({ doc, type: 'reject' })}
          onReplaceDocument={(doc) => setDocActionModal({ doc, type: 'replace' })}
          onArchiveDocument={handleDeleteOrArchive}
        />

        {/* DOCUMENT UPLOAD CENTER MODAL */}
        <DocumentUploadCenterModal
          isOpen={uploadModalState.open}
          mode={uploadModalState.mode}
          profiles={profiles}
          categories={categories}
          securitySettings={securitySettings}
          defaultEmployeeId={uploadModalState.defaultEmpId}
          defaultCategoryCode={uploadModalState.defaultCat}
          defaultDocumentType={uploadModalState.defaultDocType}
          onClose={() => setUploadModalState((prev) => ({ ...prev, open: false }))}
          onUploadComplete={(newDocs) => {
            setDocuments((prev) => [...newDocs, ...prev]);
            for (const d of newDocs) {
              appendAudit('Document Uploaded', d, 'Uploaded via Document Upload Center.');
            }
            notify(
              `Successfully uploaded ${newDocs.length} document${
                newDocs.length === 1 ? '' : 's'
              } to the Digital Vault.`
            );
          }}
        />

        {/* PREVIEW / EDIT / REPLACE / HISTORY / REJECT MODAL */}
        <DocumentActionModal
          key={`${docActionModal.doc?.id || 'none'}-${docActionModal.type || 'none'}`}
          doc={docActionModal.doc}
          modalType={docActionModal.type}
          maskSensitiveIds={securitySettings.autoMaskSensitiveIdentifiers}
          onClose={() => setDocActionModal({ doc: null, type: null })}
          onSaveEdit={handleSaveEdit}
          onConfirmReplace={handleConfirmReplace}
          onConfirmReject={handleConfirmReject}
          onVerifyDocument={handleQuickVerify}
        />
      </div>
    </div>
  );
}
