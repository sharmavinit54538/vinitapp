'use client';

import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Download,
  Edit3,
  Eye,
  FileCode2,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  FolderPlus,
  History,
  Lock,
  Plus,
  Printer,
  Shield,
  Sliders,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  ConfidentialityLevel,
  DocumentAuditLogEntry,
  DocumentCategoryCode,
  DocumentCategoryConfig,
  DocumentReportType,
  DocumentSecuritySettings,
  DocumentTemplateRecord,
  EmployeeDigitalProfileSummary,
  EmployeeDocumentRecord,
  GeneratedDocumentHistoryItem,
  SupportedFileExtension,
} from '../../types/employeeDocuments';
import {
  interpolateTemplateContent,
  REFERENCE_TODAY_ISO,
} from '../../services/employee-documents/documentsEngine';

// ============================================================================
// TAB 5: HR DOCUMENT TEMPLATES, LIVE GENERATOR & CATEGORY MANAGEMENT
// ============================================================================

interface TemplatesAndGeneratorTabProps {
  templates: DocumentTemplateRecord[];
  categories: DocumentCategoryConfig[];
  profiles: EmployeeDigitalProfileSummary[];
  generatedHistory: GeneratedDocumentHistoryItem[];
  onGenerateDocument: (item: Omit<GeneratedDocumentHistoryItem, 'id' | 'generatedAt'>) => void;
  onToggleTemplateActive: (templateId: string) => void;
  onCreateCategory: (cat: DocumentCategoryConfig) => void;
  onDeleteCategory: (code: string) => void;
  onNotify: (msg: string) => void;
}

export function TemplatesAndDocumentGeneratorTab({
  templates,
  categories,
  profiles,
  generatedHistory,
  onGenerateDocument,
  onToggleTemplateActive,
  onCreateCategory,
  onDeleteCategory,
  onNotify,
}: TemplatesAndGeneratorTabProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    templates[0]?.id || 'TPL-HR-01'
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    profiles[0]?.employeeId || 'EMP-1001'
  );
  const [refNumber, setRefNumber] = useState('OFC/HR/2026/LTR-908');
  const [customBodyOverride, setCustomBodyOverride] = useState<string | null>(null);

  // Category CRUD form state
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatMandatory, setNewCatMandatory] = useState('Background Verification Report');

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) || templates[0],
    [templates, selectedTemplateId]
  );

  const selectedEmployee = useMemo(
    () => profiles.find((p) => p.employeeId === selectedEmployeeId) || profiles[0],
    [profiles, selectedEmployeeId]
  );

  const interpolatedPreview = useMemo(() => {
    if (!selectedTemplate || !selectedEmployee) return '';
    const baseText =
      customBodyOverride !== null ? customBodyOverride : selectedTemplate.bodyContent;
    return interpolateTemplateContent(
      baseText,
      selectedEmployee,
      refNumber,
      REFERENCE_TODAY_ISO
    );
  }, [selectedTemplate, selectedEmployee, refNumber, customBodyOverride]);

  const handleGenerateAndLog = () => {
    if (!selectedTemplate || !selectedEmployee) return;
    onGenerateDocument({
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      employeeId: selectedEmployee.employeeId,
      employeeName: selectedEmployee.employeeName,
      department: selectedEmployee.department,
      generatedBy: 'HR Admin (Document Generator)',
      referenceNumber: refNumber,
      renderedContent: interpolatedPreview,
    });
    setRefNumber(`OFC/HR/2026/LTR-${Math.floor(100 + Math.random() * 899)}`);
  };

  const handleDownloadSampleLetter = () => {
    const blob = new Blob([interpolatedPreview], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEmployee.employeeId}_${selectedTemplate.name.replace(
      /\s+/g,
      '_'
    )}_Simulated.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify(
      `Downloaded simulated ${selectedTemplate.name} for ${selectedEmployee.employeeName}.`
    );
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatCode.trim() || !newCatName.trim()) return;
    onCreateCategory({
      code: newCatCode.trim().toUpperCase().replace(/\s+/g, '_'),
      name: newCatName.trim(),
      description: 'Custom HR document classification folder.',
      mandatoryTypes: newCatMandatory
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      optionalTypes: ['Supporting Annexure'],
      retentionYears: 7,
      defaultConfidentiality: 'Confidential',
      active: true,
    });
    setNewCatCode('');
    setNewCatName('');
  };

  return (
    <div className="space-y-6">
      {/* LIVE HR DOCUMENT GENERATOR WORKBENCH */}
      <div className="grid grid-cols-1 @lg:grid-cols-12 gap-5">
        {/* Left: 11 HR Templates Selector + Employee Picker (5 cols) */}
        <div className="@lg:col-span-5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              HR Document Generator (11 Enterprise Templates)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a template and employee to interpolate dynamic placeholders and preview letter.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                1. Select Employee Profile
              </label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white"
              >
                {profiles.map((p) => (
                  <option key={p.employeeId} value={p.employeeId}>
                    {p.employeeName} ({p.employeeId}) — {p.designation}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                2. Document Reference Number
              </label>
              <input
                type="text"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                3. Choose HR Letter Template ({templates.length} Available)
              </label>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {templates.map((tpl) => {
                  const isSelected = tpl.id === selectedTemplateId;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setSelectedTemplateId(tpl.id);
                        setCustomBodyOverride(null);
                      }}
                      className={`cursor-pointer rounded-xl border p-2.5 transition-all flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/50'
                          : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {tpl.name}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {tpl.version}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {tpl.description}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleTemplateActive(tpl.id);
                        }}
                        className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${
                          tpl.active
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                        }`}
                      >
                        {tpl.active ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Editable Content Override */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  4. Customize Template Body & Placeholders
                </label>
                {customBodyOverride !== null && (
                  <button
                    type="button"
                    onClick={() => setCustomBodyOverride(null)}
                    className="text-[11px] text-indigo-600 hover:underline"
                  >
                    Reset to Default
                  </button>
                )}
              </div>
              <textarea
                rows={5}
                value={
                  customBodyOverride !== null
                    ? customBodyOverride
                    : selectedTemplate?.bodyContent || ''
                }
                onChange={(e) => setCustomBodyOverride(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs font-mono text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Right: Live Formatted Document Preview & Issuance Actions (7 cols) */}
        <div className="@lg:col-span-7 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Live Document Preview — {selectedTemplate?.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Recipient: {selectedEmployee?.employeeName} ({selectedEmployee?.employeeId}) ·{' '}
                  {selectedEmployee?.location}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSampleLetter}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download Sample
                </button>
                <button
                  type="button"
                  onClick={handleGenerateAndLog}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  <FilePlus2 className="h-3.5 w-3.5" />
                  Generate PDF (Simulated)
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 dark:border-amber-800/70 bg-amber-50/70 dark:bg-amber-950/30 px-3 py-2 text-[11px] text-amber-800 dark:text-amber-300">
              Simulated Issuance Notice: This preview renders frontend placeholder interpolation. Actual cryptographic e-Stamping and DSC digital signatures require backend PKI integration.
            </div>

            {/* Letterhead Preview Canvas */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-950 p-6 font-serif text-xs leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap min-h-[380px] shadow-inner">
              {interpolatedPreview}
            </div>
          </div>

          {/* Generated Document History */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
              Generated Document History ({generatedHistory.length})
            </h4>
            <div className="space-y-2 max-h-44 overflow-y-auto">
              {generatedHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 px-3 py-2 text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {item.templateName}
                    </span>{' '}
                    <span className="text-slate-500">
                      for {item.employeeName} ({item.employeeId})
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                      Ref: {item.referenceNumber} · {item.generatedAt}
                    </div>
                  </div>
                  <span className="rounded bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                    Issued (Simulated)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENT CATEGORIES & MANDATORY RULES MANAGEMENT (CRUD) */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Document Categories & Mandatory Rules Configuration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Create custom document categories, configure mandatory onboarding rules, and manage retention policies.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleAddCategory}
          className="grid grid-cols-1 @sm:grid-cols-4 gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3.5"
        >
          <input
            type="text"
            value={newCatCode}
            onChange={(e) => setNewCatCode(e.target.value)}
            placeholder="Category Code (e.g., VISA_IMMIGRATION)"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs"
          />
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Category Display Name (e.g., I. Visa & Mobility)"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs"
          />
          <input
            type="text"
            value={newCatMandatory}
            onChange={(e) => setNewCatMandatory(e.target.value)}
            placeholder="Mandatory Doc Types (comma separated)"
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs"
          />
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            + Add Custom Category
          </button>
        </form>

        <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.code}
              className="rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {cat.name}
                  </span>
                  {categories.length > 8 && (
                    <button
                      type="button"
                      onClick={() => onDeleteCategory(cat.code)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-slate-500">{cat.description}</p>
                <div className="mt-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <strong>Mandatory:</strong>{' '}
                  {cat.mandatoryTypes.length > 0 ? cat.mandatoryTypes.join(', ') : 'None'}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>Retention: {cat.retentionYears} yrs</span>
                <span>{cat.defaultConfidentiality}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB 6: REPORTS & COMPLIANCE ANALYTICS + AUDIT LOG + SECURITY SETTINGS
// ============================================================================

interface ReportsAndSettingsTabProps {
  documents: EmployeeDocumentRecord[];
  profiles: EmployeeDigitalProfileSummary[];
  auditLogs: DocumentAuditLogEntry[];
  securitySettings: DocumentSecuritySettings;
  onUpdateSecuritySettings: (next: DocumentSecuritySettings) => void;
  onNotify: (msg: string) => void;
}

const REPORT_DEFINITIONS: {
  id: DocumentReportType;
  title: string;
  description: string;
}[] = [
  {
    id: 'TOTAL_DOCUMENTS',
    title: 'Total Document Inventory Report',
    description: 'Complete master register of all employee documents across A–H folders.',
  },
  {
    id: 'EMPLOYEE_COMPLETION',
    title: 'Employee Document Completion Report',
    description: 'Employee-by-employee mandatory checklist completion % and verified counts.',
  },
  {
    id: 'MISSING_DOCUMENTS',
    title: 'Missing Mandatory Document Report',
    description: 'Audit exception report of employees missing statutory KYC or Joining proofs.',
  },
  {
    id: 'PENDING_VERIFICATION',
    title: 'Pending Verification SLA Queue Report',
    description: 'All documents currently awaiting HR verification or under review.',
  },
  {
    id: 'EXPIRED_DOCUMENTS',
    title: 'Expired & Expiring Document Report',
    description: 'Passports, licences, certifications, and leases expiring within 60 days.',
  },
  {
    id: 'DEPARTMENT_COMPLIANCE',
    title: 'Department Compliance Benchmark Report',
    description: 'Aggregated statutory compliance rate across Engineering, Product, HR, Sales, Finance.',
  },
  {
    id: 'UPLOAD_ACTIVITY',
    title: 'Document Upload Activity Report',
    description: 'Chronological ingestion log by uploader, file size, and category.',
  },
  {
    id: 'REJECTION_ANALYSIS',
    title: 'Document Rejection & Resubmission Report',
    description: 'Root-cause breakdown of rejected scans and quality mismatches.',
  },
];

export function ReportsAndSettingsTab({
  documents,
  profiles,
  auditLogs,
  securitySettings,
  onUpdateSecuritySettings,
  onNotify,
}: ReportsAndSettingsTabProps) {
  const [selectedReport, setSelectedReport] =
    useState<DocumentReportType>('TOTAL_DOCUMENTS');
  const [reportDeptFilter, setReportDeptFilter] = useState('All');

  const departments = useMemo(
    () => ['All', ...Array.from(new Set(profiles.map((p) => p.department)))],
    [profiles]
  );

  const handleExportReportCsv = () => {
    const def = REPORT_DEFINITIONS.find((r) => r.id === selectedReport);
    onNotify(`Exported "${def?.title}" (${reportDeptFilter} Dept) to CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* 1. 8 COMPLIANCE & ANALYTICS REPORTS */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Enterprise Document Compliance & Audit Reports (8 Standard Reports)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select a compliance report, filter by department, and export structured CSV datasets.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={reportDeptFilter}
              onChange={(e) => setReportDeptFilter(e.target.value)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            >
              {departments.map((d) => (
                <option key={d} value={d}>
                  Department: {d}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleExportReportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              <Download className="h-3.5 w-3.5" />
              Export Report CSV
            </button>
          </div>
        </div>

        {/* 8 Report Cards Selector */}
        <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4 gap-2.5">
          {REPORT_DEFINITIONS.map((rep) => {
            const active = selectedReport === rep.id;
            return (
              <button
                key={rep.id}
                type="button"
                onClick={() => setSelectedReport(rep.id)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  active
                    ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/50'
                    : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {rep.title}
                </div>
                <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                  {rep.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Dynamic Report Preview Table */}
        <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
            Live Preview:{' '}
            {REPORT_DEFINITIONS.find((r) => r.id === selectedReport)?.title}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase text-slate-400">
                  <th className="py-2.5 px-4">Employee</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Total Uploaded</th>
                  <th className="py-2.5 px-4">Verified</th>
                  <th className="py-2.5 px-4">Missing Mandatory</th>
                  <th className="py-2.5 px-4">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {profiles
                  .filter(
                    (p) => reportDeptFilter === 'All' || p.department === reportDeptFilter
                  )
                  .map((p) => (
                    <tr key={p.employeeId}>
                      <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">
                        {p.employeeName} ({p.employeeId})
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                        {p.department}
                      </td>
                      <td className="py-2.5 px-4 tabular-nums">{p.totalDocuments}</td>
                      <td className="py-2.5 px-4 text-emerald-600 font-semibold tabular-nums">
                        {p.verifiedDocuments}
                      </td>
                      <td className="py-2.5 px-4 text-amber-600 tabular-nums">
                        {p.missingMandatoryDocuments.length} (
                        {p.missingMandatoryDocuments.slice(0, 2).join(', ') || 'None'})
                      </td>
                      <td className="py-2.5 px-4 font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {p.completionPercentage}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. VERSION HISTORY & IMMUTABLE AUDIT LOG TIMELINE + 3. SECURITY SETTINGS */}
      <div className="grid grid-cols-1 @lg:grid-cols-12 gap-5">
        {/* Audit Log Timeline (6 cols) */}
        <div className="@lg:col-span-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Immutable Document Audit Log & Version History
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            Tracks every upload, view, download, replacement, verification, rejection, and archival event.
          </p>
          <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {log.action}
                  </span>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {log.timestamp}
                  </span>
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  {log.documentName} · Employee: <strong>{log.employeeName}</strong> (
                  {log.employeeId})
                </div>
                <div className="text-[11px] text-slate-500">
                  By {log.performedBy} · Version: {log.previousVersion} →{' '}
                  <strong>{log.currentVersion}</strong> · {log.remarks}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security, Governance & Role-Based Access Settings (6 cols) */}
        <div className="@lg:col-span-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Document Security, Governance & Access Control
            </h3>
          </div>

          <div className="grid grid-cols-1 @sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 p-3 cursor-pointer">
              <span>Auto-Mask Sensitive IDs (Aadhaar/PAN)</span>
              <input
                type="checkbox"
                checked={securitySettings.autoMaskSensitiveIdentifiers}
                onChange={(e) =>
                  onUpdateSecuritySettings({
                    ...securitySettings,
                    autoMaskSensitiveIdentifiers: e.target.checked,
                  })
                }
                className="rounded border-slate-300 text-indigo-600"
              />
            </label>

            <label className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 p-3 cursor-pointer">
              <span>Mandatory Reason on Rejection</span>
              <input
                type="checkbox"
                checked={securitySettings.requireReasonOnRejection}
                onChange={(e) =>
                  onUpdateSecuritySettings({
                    ...securitySettings,
                    requireReasonOnRejection: e.target.checked,
                  })
                }
                className="rounded border-slate-300 text-indigo-600"
              />
            </label>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
              <div className="text-slate-500 mb-1">Max Upload File Size (MB)</div>
              <input
                type="number"
                min={1}
                max={50}
                value={securitySettings.maxFileSizeMb}
                onChange={(e) =>
                  onUpdateSecuritySettings({
                    ...securitySettings,
                    maxFileSizeMb: Number(e.target.value) || 10,
                  })
                }
                className="w-full rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 font-semibold tabular-nums"
              />
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3">
              <div className="text-slate-500 mb-1">Default Retention Policy (Years)</div>
              <input
                type="number"
                min={1}
                max={25}
                value={securitySettings.retentionYearsDefault}
                onChange={(e) =>
                  onUpdateSecuritySettings({
                    ...securitySettings,
                    retentionYearsDefault: Number(e.target.value) || 8,
                  })
                }
                className="w-full rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 font-semibold tabular-nums"
              />
            </div>
          </div>

          {/* Role-Based Access Matrix */}
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white mb-2">
              Role-Based Access Control (RBAC) Matrix
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                    <th className="py-1.5 pr-2">Role</th>
                    <th className="py-1.5 px-2">View All</th>
                    <th className="py-1.5 px-2">Upload</th>
                    <th className="py-1.5 px-2">Verify</th>
                    <th className="py-1.5 px-2">Unmask PII</th>
                    <th className="py-1.5 px-2">Letters</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {securitySettings.rolePermissions.map((rp) => (
                    <tr key={rp.role}>
                      <td className="py-2 pr-2 font-semibold text-slate-800 dark:text-slate-200">
                        {rp.role}
                      </td>
                      <td className="py-2 px-2">{rp.canViewAll ? '✓' : '—'}</td>
                      <td className="py-2 px-2">{rp.canUpload ? '✓' : '—'}</td>
                      <td className="py-2 px-2">{rp.canVerifyApprove ? '✓' : '—'}</td>
                      <td className="py-2 px-2">{rp.canUnmaskPii ? '✓' : '—'}</td>
                      <td className="py-2 px-2">{rp.canGenerateLetters ? '✓' : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
