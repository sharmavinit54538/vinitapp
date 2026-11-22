'use client';

import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Columns,
  Download,
  Edit3,
  Eye,
  FileCheck2,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  FileWarning,
  Filter,
  FolderKanban,
  History,
  Layers,
  MoreHorizontal,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserCheck,
  Users,
  XCircle,
} from 'lucide-react';
import {
  DocumentCategoryCode,
  DocumentCategoryConfig,
  DocumentDashboardKpis,
  DocumentVerificationStatus,
  EmployeeDigitalProfileSummary,
  EmployeeDocumentRecord,
} from '../../types/employeeDocuments';
import {
  classifyExpiryBucket,
  DocumentFilterCriteria,
  filterAndSortDocuments,
  getExpiryDaysRemaining,
  REFERENCE_TODAY_ISO,
} from '../../services/employee-documents/documentsEngine';

export function getStatusBadgeStyle(status: DocumentVerificationStatus): string {
  switch (status) {
    case 'Verified':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
    case 'Pending':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
    case 'Under Review':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
    case 'Rejected':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
    case 'Resubmission Required':
      return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-800';
    case 'Expired':
      return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
}

interface OverviewDashboardProps {
  kpis: DocumentDashboardKpis;
  documents: EmployeeDocumentRecord[];
  profiles: EmployeeDigitalProfileSummary[];
  categories: DocumentCategoryConfig[];
  onNavigateFiltered: (preset: Partial<DocumentFilterCriteria>) => void;
  onSwitchTab: (
    tab:
      | 'overview'
      | 'all-documents'
      | 'verification'
      | 'requests-expiry'
      | 'templates-generator'
      | 'reports-settings'
  ) => void;
  onOpenUploadModal: (mode: 'single' | 'bulk', defaultEmployeeId?: string) => void;
  onOpenRequestModal: (defaultEmployeeId?: string, defaultDocType?: string) => void;
  onOpenEmployeeProfile: (employeeId: string) => void;
  onSelectDocForVerification: (docId: string) => void;
  onPreviewDocument: (doc: EmployeeDocumentRecord) => void;
}

export function OverviewDashboardTab({
  kpis,
  documents,
  profiles,
  categories,
  onNavigateFiltered,
  onSwitchTab,
  onOpenUploadModal,
  onOpenRequestModal,
  onOpenEmployeeProfile,
  onSelectDocForVerification,
  onPreviewDocument,
}: OverviewDashboardProps) {
  const activeDocs = useMemo(() => documents.filter((d) => !d.archived), [documents]);

  // 1. Upload trends (6 months)
  const uploadTrendData = useMemo(
    () => [
      { month: 'Jun', uploaded: 14, verified: 12 },
      { month: 'Jul', uploaded: 19, verified: 17 },
      { month: 'Aug', uploaded: 23, verified: 20 },
      { month: 'Sep', uploaded: 18, verified: 16 },
      { month: 'Oct', uploaded: 27, verified: 24 },
      { month: 'Nov', uploaded: activeDocs.length + 16, verified: kpis.verifiedDocuments + 14 },
    ],
    [activeDocs.length, kpis.verifiedDocuments]
  );

  // 2. Department-wise compliance
  const departmentCompliance = useMemo(() => {
    const deptMap = new Map<
      string,
      { totalEmp: number; sumCompletion: number; verifiedDocs: number; totalDocs: number }
    >();
    for (const p of profiles) {
      const curr = deptMap.get(p.department) || {
        totalEmp: 0,
        sumCompletion: 0,
        verifiedDocs: 0,
        totalDocs: 0,
      };
      curr.totalEmp += 1;
      curr.sumCompletion += p.completionPercentage;
      curr.verifiedDocs += p.verifiedDocuments;
      curr.totalDocs += p.totalDocuments;
      deptMap.set(p.department, curr);
    }
    return Array.from(deptMap.entries()).map(([department, stats]) => ({
      department,
      employees: stats.totalEmp,
      avgCompliance: Math.round(stats.sumCompletion / Math.max(1, stats.totalEmp)),
      verifiedDocs: stats.verifiedDocs,
      totalDocs: stats.totalDocs,
    }));
  }, [profiles]);

  // 3. Category distribution
  const categoryDistribution = useMemo(() => {
    return categories.map((cat) => {
      const count = activeDocs.filter((d) => d.categoryCode === cat.code).length;
      return {
        code: cat.code,
        name: cat.name,
        count,
        pct: Math.round((count / Math.max(1, activeDocs.length)) * 100),
      };
    });
  }, [categories, activeDocs]);

  // 4. Expiry forecast buckets
  const expiryForecast = useMemo(() => {
    let expired = 0;
    let d7 = 0;
    let d15 = 0;
    let d30 = 0;
    let d60 = 0;
    for (const doc of activeDocs) {
      const b = classifyExpiryBucket(doc.expiryDate, REFERENCE_TODAY_ISO);
      if (b === 'Expired' || doc.verificationStatus === 'Expired') expired++;
      else if (b === 'Expiring in 7 Days') d7++;
      else if (b === 'Expiring in 15 Days') d15++;
      else if (b === 'Expiring in 30 Days') d30++;
      else if (b === 'Expiring in 60 Days') d60++;
    }
    return [
      { label: 'Already Expired', count: expired, tone: 'bg-rose-500', filter: 'EXPIRED' as const },
      { label: 'Next 7 Days', count: d7, tone: 'bg-orange-500', filter: '7_DAYS' as const },
      { label: '8–15 Days', count: d15, tone: 'bg-amber-500', filter: '15_DAYS' as const },
      { label: '16–30 Days', count: d30, tone: 'bg-blue-500', filter: '30_DAYS' as const },
      { label: '31–60 Days', count: d60, tone: 'bg-indigo-500', filter: '60_DAYS' as const },
    ];
  }, [activeDocs]);

  const recentUploads = useMemo(
    () =>
      [...activeDocs]
        .sort((a, b) => b.uploadDate.localeCompare(a.uploadDate))
        .slice(0, 5),
    [activeDocs]
  );

  const pendingApprovals = useMemo(
    () =>
      activeDocs.filter(
        (d) => d.verificationStatus === 'Pending' || d.verificationStatus === 'Under Review'
      ),
    [activeDocs]
  );

  const rejectedDocs = useMemo(
    () =>
      activeDocs.filter(
        (d) =>
          d.verificationStatus === 'Rejected' ||
          d.verificationStatus === 'Resubmission Required'
      ),
    [activeDocs]
  );

  const expiringDocs = useMemo(
    () =>
      activeDocs.filter((d) => {
        const days = getExpiryDaysRemaining(d.expiryDate, REFERENCE_TODAY_ISO);
        return (days !== null && days <= 60) || d.verificationStatus === 'Expired';
      }),
    [activeDocs]
  );

  const kpiCards = [
    {
      id: 'kpi-total',
      label: 'Total Documents',
      value: kpis.totalDocuments,
      sub: 'Across 8 statutory categories',
      tone: 'text-slate-900 dark:text-white',
      badge: 'Click to view all',
      onClick: () =>
        onNavigateFiltered({
          verificationStatus: 'All',
          expiryFilter: 'ALL',
          categoryCode: 'All',
        }),
    },
    {
      id: 'kpi-verified',
      label: 'Verified Documents',
      value: kpis.verifiedDocuments,
      sub: `${Math.round((kpis.verifiedDocuments / Math.max(1, kpis.totalDocuments)) * 100)}% audit cleared`,
      tone: 'text-emerald-600 dark:text-emerald-400',
      badge: 'Verified Filter',
      onClick: () =>
        onNavigateFiltered({
          verificationStatus: 'Verified',
          expiryFilter: 'ALL',
        }),
    },
    {
      id: 'kpi-pending',
      label: 'Pending Verification',
      value: kpis.pendingVerification,
      sub: 'Awaiting HR review queue',
      tone: 'text-amber-600 dark:text-amber-400',
      badge: 'Review Queue',
      onClick: () =>
        onNavigateFiltered({
          verificationStatus: 'PendingQueue',
          expiryFilter: 'ALL',
        }),
    },
    {
      id: 'kpi-rejected',
      label: 'Rejected Documents',
      value: kpis.rejectedDocuments,
      sub: 'Requires employee resubmission',
      tone: 'text-rose-600 dark:text-rose-400',
      badge: 'Rejected Filter',
      onClick: () =>
        onNavigateFiltered({
          verificationStatus: 'Rejected',
          expiryFilter: 'ALL',
        }),
    },
    {
      id: 'kpi-missing',
      label: 'Missing Documents',
      value: kpis.missingDocumentsCount,
      sub: 'Mandatory KYC / Joining gaps',
      tone: 'text-orange-600 dark:text-orange-400',
      badge: 'Track Missing',
      onClick: () => onSwitchTab('requests-expiry'),
    },
    {
      id: 'kpi-expiring',
      label: 'Expiring Soon',
      value: kpis.expiringSoonCount,
      sub: 'Within 7 / 15 / 30 / 60 days',
      tone: 'text-blue-600 dark:text-blue-400',
      badge: 'Expiring Filter',
      onClick: () =>
        onNavigateFiltered({
          verificationStatus: 'All',
          expiryFilter: 'EXPIRING_SOON',
        }),
    },
    {
      id: 'kpi-expired',
      label: 'Expired Documents',
      value: kpis.expiredDocumentsCount,
      sub: 'Validity elapsed · Action needed',
      tone: 'text-rose-700 dark:text-rose-400',
      badge: 'Expired Filter',
      onClick: () =>
        onNavigateFiltered({
          verificationStatus: 'All',
          expiryFilter: 'EXPIRED',
        }),
    },
    {
      id: 'kpi-completion',
      label: 'Document Completion Rate',
      value: `${kpis.completionRatePct}%`,
      sub: 'Workforce mandatory checklist',
      tone: 'text-indigo-600 dark:text-indigo-400',
      badge: 'Compliance View',
      onClick: () => onSwitchTab('reports-settings'),
    },
  ];

  return (
    <div className="space-y-6">
      {/* QUICK ACTIONS BAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs">
        <div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            Document Command & Quick Actions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any KPI card below to drill directly into the corresponding filtered repository view.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenUploadModal('single')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Document
          </button>
          <button
            type="button"
            onClick={() => onOpenUploadModal('bulk')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Layers className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            Bulk Upload
          </button>
          <button
            type="button"
            onClick={() => onOpenRequestModal()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Send className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            Request Document
          </button>
          <button
            type="button"
            onClick={() => onSwitchTab('verification')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Verify Documents ({kpis.pendingVerification})
          </button>
          <button
            type="button"
            onClick={() => onSwitchTab('templates-generator')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FilePlus2 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            Generate Document
          </button>
          <button
            type="button"
            onClick={() => onSwitchTab('reports-settings')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
            View Reports
          </button>
        </div>
      </div>

      {/* 8 CLICKABLE KPI CARDS */}
      <div className="grid grid-cols-2 @lg:grid-cols-4 gap-3 @sm:gap-4">
        {kpiCards.map((card) => (
          <button
            key={card.id}
            type="button"
            data-testid={card.id}
            onClick={card.onClick}
            className="group text-left rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 @sm:p-4 shadow-xs hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-sm transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-1.5">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {card.label}
              </span>
              <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:group-hover:bg-indigo-950/60 dark:group-hover:text-indigo-300 transition-colors">
                {card.badge} →
              </span>
            </div>
            <div className={`mt-2 text-xl @sm:text-2xl font-bold tabular-nums ${card.tone}`}>
              {card.value}
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{card.sub}</p>
          </button>
        ))}
      </div>

      {/* 6 INTERACTIVE ANALYTICS CHARTS (2 ROWS OF 3) */}
      <div className="grid grid-cols-1 @lg:grid-cols-3 gap-5">
        {/* Chart 1: Document Upload Trends */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Document Upload Trends
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly uploads vs verified volume (6-month trajectory)
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
              FY 2026-27
            </span>
          </div>
          <div className="grid grid-cols-6 gap-2 items-end h-36 pt-4 px-1 border-b border-slate-100 dark:border-slate-800">
            {uploadTrendData.map((d) => {
              const maxVal = 35;
              const upH = Math.min(100, Math.round((d.uploaded / maxVal) * 100));
              const verH = Math.min(100, Math.round((d.verified / maxVal) * 100));
              return (
                <div key={d.month} className="flex flex-col items-center gap-1.5 h-full justify-end">
                  <div className="flex items-end gap-1 w-full justify-center h-24">
                    <div
                      style={{ height: `${upH}%` }}
                      title={`${d.month} Uploaded: ${d.uploaded}`}
                      className="w-2.5 rounded-t bg-indigo-500 dark:bg-indigo-400 transition-all"
                    />
                    <div
                      style={{ height: `${verH}%` }}
                      title={`${d.month} Verified: ${d.verified}`}
                      className="w-2.5 rounded-t bg-emerald-500 dark:bg-emerald-400 transition-all"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-xs bg-indigo-500" /> Uploaded
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-xs bg-emerald-500" /> Verified
              </span>
            </div>
            <span className="font-medium text-slate-700 dark:text-slate-300 tabular-nums">
              Peak: Nov ({uploadTrendData[5].uploaded} docs)
            </span>
          </div>
        </div>

        {/* Chart 2: Verification Status Distribution */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Verification Status Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any status bar to filter repository records
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {kpis.totalDocuments} Active
            </span>
          </div>
          <div className="space-y-3">
            {[
              {
                status: 'Verified' as const,
                count: activeDocs.filter((d) => d.verificationStatus === 'Verified').length,
                barColor: 'bg-emerald-500',
              },
              {
                status: 'Pending' as const,
                count: activeDocs.filter((d) => d.verificationStatus === 'Pending').length,
                barColor: 'bg-amber-500',
              },
              {
                status: 'Under Review' as const,
                count: activeDocs.filter((d) => d.verificationStatus === 'Under Review').length,
                barColor: 'bg-blue-500',
              },
              {
                status: 'Rejected' as const,
                count: activeDocs.filter((d) => d.verificationStatus === 'Rejected').length,
                barColor: 'bg-rose-500',
              },
              {
                status: 'Expired' as const,
                count: activeDocs.filter((d) => d.verificationStatus === 'Expired').length,
                barColor: 'bg-slate-500',
              },
            ].map((row) => {
              const pct = Math.round((row.count / Math.max(1, kpis.totalDocuments)) * 100);
              return (
                <button
                  key={row.status}
                  type="button"
                  onClick={() => onNavigateFiltered({ verificationStatus: row.status })}
                  className="w-full text-left group"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600">
                      {row.status}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                      {row.count} docs ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${row.barColor}`}
                      style={{ width: `${Math.max(pct, row.count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Department-wise Document Compliance */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Department-wise Compliance
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mandatory statutory dossier completion by business unit
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {departmentCompliance.map((dept) => (
              <button
                key={dept.department}
                type="button"
                onClick={() => onNavigateFiltered({ department: dept.department })}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600">
                    {dept.department}{' '}
                    <span className="text-slate-400">({dept.employees} emp)</span>
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {dept.avgCompliance}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      dept.avgCompliance >= 75
                        ? 'bg-emerald-500'
                        : dept.avgCompliance >= 45
                        ? 'bg-indigo-500'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.max(12, dept.avgCompliance)}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chart 4: Employee Document Completion Leaderboard */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Employee Document Completion
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any employee to open Digital Document Vault
              </p>
            </div>
          </div>
          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
            {profiles.map((emp) => (
              <button
                key={emp.employeeId}
                type="button"
                onClick={() => onOpenEmployeeProfile(emp.employeeId)}
                className="w-full flex items-center justify-between gap-3 rounded-lg border border-slate-100 dark:border-slate-800/80 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-xs font-bold text-indigo-600 dark:text-indigo-300">
                    {emp.avatarInitials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {emp.employeeName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {emp.employeeId} · {emp.department}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-16 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        emp.completionPercentage >= 70
                          ? 'bg-emerald-500'
                          : emp.completionPercentage >= 40
                          ? 'bg-indigo-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.max(10, emp.completionPercentage)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 tabular-nums w-9 text-right">
                    {emp.completionPercentage}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chart 5: Document Category Distribution */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Document Category Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Breakdown across A–H statutory folders
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {categoryDistribution.map((cat) => (
              <button
                key={cat.code}
                type="button"
                onClick={() => onNavigateFiltered({ categoryCode: cat.code })}
                className="flex items-center justify-between rounded-lg border border-slate-100 dark:border-slate-800 p-2.5 text-left hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {cat.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                    {cat.pct}% of vault
                  </div>
                </div>
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Chart 6: Monthly Expiry Forecast */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Monthly Expiry Forecast
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Proactive validity horizon (7 / 15 / 30 / 60 days)
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {expiryForecast.map((bucket) => (
              <button
                key={bucket.label}
                type="button"
                onClick={() => onNavigateFiltered({ expiryFilter: bucket.filter })}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700 dark:text-slate-200 group-hover:text-indigo-600">
                    {bucket.label}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                    {bucket.count} document{bucket.count === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bucket.tone}`}
                    style={{ width: `${Math.min(100, bucket.count * 25 + (bucket.count > 0 ? 15 : 0))}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6 OPERATIONAL DASHBOARD SECTIONS */}
      <div className="grid grid-cols-1 @lg:grid-cols-2 gap-5">
        {/* Section 1: Pending HR Approvals */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Pending HR Approvals ({pendingApprovals.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Documents in Pending or Under Review status requiring verification
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSwitchTab('verification')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Open Verification Studio →
            </button>
          </div>
          <div className="space-y-2.5">
            {pendingApprovals.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 dark:border-slate-800 p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {doc.documentName}
                    </span>
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeStyle(
                        doc.verificationStatus
                      )}`}
                    >
                      {doc.verificationStatus}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {doc.employeeName} ({doc.employeeId}) · {doc.documentType} · Uploaded{' '}
                    <span className="tabular-nums">{doc.uploadDate}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectDocForVerification(doc.id)}
                  className="shrink-0 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100"
                >
                  Verify Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Recent Document Uploads */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Recent Document Uploads
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest files ingested into the OFC360 Digital Vault
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSwitchTab('all-documents')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All ({kpis.totalDocuments}) →
            </button>
          </div>
          <div className="space-y-2.5">
            {recentUploads.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 dark:border-slate-800 p-2.5"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {doc.documentName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {doc.employeeName} · {doc.categoryLabel} ·{' '}
                    <span className="tabular-nums">{doc.uploadDate}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onPreviewDocument(doc)}
                  className="shrink-0 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Preview
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Recently Rejected Documents */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Recently Rejected Documents ({rejectedDocs.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit exceptions requiring clean employee re-upload
              </p>
            </div>
          </div>
          <div className="space-y-2.5">
            {rejectedDocs.map((doc) => (
              <div
                key={doc.id}
                className="rounded-lg border border-rose-200/70 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white">
                    {doc.employeeName} ({doc.employeeId}) — {doc.documentType}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenRequestModal(doc.employeeId, doc.documentType)}
                    className="rounded-md bg-rose-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-rose-700"
                  >
                    Trigger Re-Request
                  </button>
                </div>
                <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
                  Reason: {doc.reviewerRemarks || 'Quality / signature validation failed.'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: Upcoming Document Expiry */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Upcoming Document Expiry & Alerts
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Passports, licences, certifications, and rental leases
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSwitchTab('requests-expiry')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Expiry Tracker →
            </button>
          </div>
          <div className="space-y-2.5">
            {expiringDocs.map((doc) => {
              const days = getExpiryDaysRemaining(doc.expiryDate, REFERENCE_TODAY_ISO);
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 dark:border-slate-800 p-2.5"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {doc.employeeName} · {doc.documentType}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                      Expiry Date: {doc.expiryDate} (
                      {days !== null && days < 0
                        ? `Expired ${Math.abs(days)}d ago`
                        : `In ${days} days`}
                      )
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenRequestModal(doc.employeeId, doc.documentType)}
                    className="shrink-0 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:bg-amber-100"
                  >
                    Request Renewal
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 5: Employees with Missing Mandatory Documents */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Employees with Missing Mandatory Documents
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Statutory KYC, Address, Education, Joining, and Payroll gaps across active employees
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab('requests-expiry')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Manage Requests →
          </button>
        </div>
        <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-3">
          {profiles
            .filter((p) => p.missingMandatoryDocuments.length > 0)
            .map((emp) => (
              <div
                key={emp.employeeId}
                className="rounded-lg border border-slate-200/80 dark:border-slate-800 p-3 flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onOpenEmployeeProfile(emp.employeeId)}
                      className="text-xs font-semibold text-slate-900 dark:text-white hover:text-indigo-600"
                    >
                      {emp.employeeName} ({emp.employeeId})
                    </button>
                    <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                      {emp.missingMandatoryDocuments.length} Missing
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    {emp.department} · {emp.designation}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {emp.missingMandatoryDocuments.slice(0, 4).map((m) => (
                      <span
                        key={m}
                        className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                      >
                        {m}
                      </span>
                    ))}
                    {emp.missingMandatoryDocuments.length > 4 && (
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                        +{emp.missingMandatoryDocuments.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => onOpenEmployeeProfile(emp.employeeId)}
                    className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600"
                  >
                    Open Vault Profile
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onOpenRequestModal(emp.employeeId, emp.missingMandatoryDocuments[0])
                    }
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Request Missing
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TAB 2: ALL DOCUMENTS (CENTRALIZED EMPLOYEE DOCUMENT REPOSITORY TABLE)
// ============================================================================

interface AllDocumentsTableProps {
  documents: EmployeeDocumentRecord[];
  categories: DocumentCategoryConfig[];
  filterCriteria: DocumentFilterCriteria;
  onChangeFilterCriteria: (next: DocumentFilterCriteria) => void;
  maskSensitiveIds: boolean;
  onPreviewDocument: (doc: EmployeeDocumentRecord) => void;
  onOpenEmployeeProfile: (employeeId: string) => void;
  onVerifyDocumentQuick: (docId: string) => void;
  onRejectDocumentModal: (doc: EmployeeDocumentRecord) => void;
  onEditDocumentModal: (doc: EmployeeDocumentRecord) => void;
  onReplaceDocumentModal: (doc: EmployeeDocumentRecord) => void;
  onViewVersionHistoryModal: (doc: EmployeeDocumentRecord) => void;
  onDeleteOrArchiveDocument: (docId: string) => void;
  onBulkVerify: (docIds: string[]) => void;
  onBulkAssignCategory: (docIds: string[], categoryCode: DocumentCategoryCode) => void;
  onOpenUploadModal: (mode: 'single' | 'bulk', defaultEmployeeId?: string) => void;
  onNotify: (message: string) => void;
}

export function AllDocumentsTableTab({
  documents,
  categories,
  filterCriteria,
  onChangeFilterCriteria,
  maskSensitiveIds,
  onPreviewDocument,
  onOpenEmployeeProfile,
  onVerifyDocumentQuick,
  onRejectDocumentModal,
  onEditDocumentModal,
  onReplaceDocumentModal,
  onViewVersionHistoryModal,
  onDeleteOrArchiveDocument,
  onBulkVerify,
  onBulkAssignCategory,
  onOpenUploadModal,
  onNotify,
}: AllDocumentsTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    employeeId: true,
    employeeName: true,
    avatar: true,
    department: true,
    designation: true,
    documentName: true,
    category: true,
    documentType: true,
    uploadDate: true,
    expiryDate: true,
    status: true,
    uploadedBy: true,
  });

  const filteredDocs = useMemo(
    () => filterAndSortDocuments(documents, filterCriteria, REFERENCE_TODAY_ISO),
    [documents, filterCriteria]
  );

  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedDocs = useMemo(
    () => filteredDocs.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredDocs, currentPage]
  );

  const departments = useMemo(
    () => ['All', ...Array.from(new Set(documents.map((d) => d.department)))],
    [documents]
  );

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedDocs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedDocs.map((d) => d.id));
    }
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExportCsv = () => {
    const headers = [
      'Document ID',
      'Employee ID',
      'Employee Name',
      'Department',
      'Designation',
      'Document Name',
      'Category',
      'Document Type',
      'Upload Date',
      'Expiry Date',
      'Verification Status',
      'Uploaded By',
    ];
    const rows = filteredDocs.map((d) => [
      d.id,
      d.employeeId,
      `"${d.employeeName}"`,
      `"${d.department}"`,
      `"${d.designation}"`,
      `"${d.documentName}"`,
      `"${d.categoryLabel}"`,
      `"${d.documentType}"`,
      d.uploadDate,
      d.expiryDate || 'No Expiry',
      d.verificationStatus,
      `"${d.uploadedBy}"`,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OFC360_Employee_Documents_${REFERENCE_TODAY_ISO}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify(`Exported ${filteredDocs.length} document records to CSV.`);
  };

  const handleSimulateDownload = (doc: EmployeeDocumentRecord) => {
    const content = `OFC360 DIGITAL DOCUMENT VAULT — SIMULATED DOWNLOAD ARCHIVE
Document ID: ${doc.id}
Document Name: ${doc.documentName}
Employee: ${doc.employeeName} (${doc.employeeId})
Department: ${doc.department} | Designation: ${doc.designation}
Category: ${doc.categoryLabel} | Type: ${doc.documentType}
Verification Status: ${doc.verificationStatus}
Upload Date: ${doc.uploadDate} | Expiry Date: ${doc.expiryDate || 'N/A'}
OCR Preview: ${doc.aiIntelligence.ocrTextPreview}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.documentName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify(`Downloaded simulated package for "${doc.documentName}".`);
  };

  return (
    <div className="space-y-4">
      {/* SEARCH & MULTI-DIMENSIONAL FILTER BAR */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={filterCriteria.globalSearch || ''}
                onChange={(e) => {
                  setPage(1);
                  onChangeFilterCriteria({ ...filterCriteria, globalSearch: e.target.value });
                }}
                placeholder="Search document name, type, tag, ID..."
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <input
              type="text"
              value={filterCriteria.employeeQuery || ''}
              onChange={(e) => {
                setPage(1);
                onChangeFilterCriteria({ ...filterCriteria, employeeQuery: e.target.value });
              }}
              placeholder="Filter by Employee Name / ID..."
              className="w-48 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Column visibility toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowColumnMenu((prev) => !prev)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50"
              >
                <Columns className="h-3.5 w-3.5" />
                Columns
              </button>
              {showColumnMenu && (
                <div className="absolute right-0 z-30 mt-1.5 w-52 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 shadow-lg space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase px-1">
                    Toggle Columns
                  </div>
                  {(Object.keys(visibleColumns) as (keyof typeof visibleColumns)[]).map((col) => (
                    <label
                      key={col}
                      className="flex items-center gap-2 px-1.5 py-1 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={visibleColumns[col]}
                        onChange={() =>
                          setVisibleColumns((prev) => ({ ...prev, [col]: !prev[col] }))
                        }
                        className="rounded border-slate-300"
                      />
                      <span className="capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </button>

            <button
              type="button"
              onClick={() => onOpenUploadModal('single')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Document
            </button>
          </div>
        </div>

        {/* Filter dropdowns row */}
        <div className="grid grid-cols-2 @sm:grid-cols-3 @lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <select
            aria-label="Filter by Department"
            value={filterCriteria.department || 'All'}
            onChange={(e) => {
              setPage(1);
              onChangeFilterCriteria({ ...filterCriteria, department: e.target.value });
            }}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200"
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                Dept: {d}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Category"
            value={filterCriteria.categoryCode || 'All'}
            onChange={(e) => {
              setPage(1);
              onChangeFilterCriteria({ ...filterCriteria, categoryCode: e.target.value });
            }}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="All">Category: All (A–H)</option>
            {categories.map((cat) => (
              <option key={cat.code} value={cat.code}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by Verification Status"
            value={filterCriteria.verificationStatus || 'All'}
            onChange={(e) => {
              setPage(1);
              onChangeFilterCriteria({
                ...filterCriteria,
                verificationStatus: e.target.value,
              });
            }}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="All">Status: All</option>
            <option value="PendingQueue">Pending + Under Review</option>
            <option value="Verified">Verified</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Rejected">Rejected</option>
            <option value="Resubmission Required">Resubmission Required</option>
            <option value="Expired">Expired</option>
          </select>

          <select
            aria-label="Filter by Expiry Status"
            value={filterCriteria.expiryFilter || 'ALL'}
            onChange={(e) => {
              setPage(1);
              onChangeFilterCriteria({
                ...filterCriteria,
                expiryFilter: e.target.value as DocumentFilterCriteria['expiryFilter'],
              });
            }}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">Expiry: All Documents</option>
            <option value="EXPIRING_SOON">Expiring Soon (≤ 60 Days)</option>
            <option value="7_DAYS">Expiring in 7 Days</option>
            <option value="15_DAYS">Expiring in 8–15 Days</option>
            <option value="30_DAYS">Expiring in 16–30 Days</option>
            <option value="60_DAYS">Expiring in 31–60 Days</option>
            <option value="EXPIRED">Expired Only</option>
          </select>

          <input
            type="date"
            aria-label="Upload Date From"
            value={filterCriteria.dateFrom || ''}
            onChange={(e) =>
              onChangeFilterCriteria({ ...filterCriteria, dateFrom: e.target.value })
            }
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200"
          />

          <div className="flex items-center gap-1.5">
            <select
              aria-label="Sort By"
              value={filterCriteria.sortBy || 'uploadDate'}
              onChange={(e) =>
                onChangeFilterCriteria({
                  ...filterCriteria,
                  sortBy: e.target.value as DocumentFilterCriteria['sortBy'],
                })
              }
              className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 text-xs text-slate-700 dark:text-slate-200"
            >
              <option value="uploadDate">Sort: Upload Date</option>
              <option value="employeeName">Sort: Employee</option>
              <option value="documentName">Sort: Document</option>
              <option value="expiryDate">Sort: Expiry Date</option>
              <option value="status">Sort: Status</option>
            </select>
            <button
              type="button"
              onClick={() =>
                onChangeFilterCriteria({
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
                })
              }
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              title="Reset Filters"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* BULK ACTIONS TOOLBAR */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/50 px-4 py-2.5">
          <div className="text-xs font-semibold text-indigo-900 dark:text-indigo-200 tabular-nums">
            {selectedIds.length} document{selectedIds.length === 1 ? '' : 's'} selected
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onBulkVerify(selectedIds);
                setSelectedIds([]);
              }}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Bulk Verify Selected
            </button>
            <select
              aria-label="Bulk Assign Category"
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  onBulkAssignCategory(
                    selectedIds,
                    e.target.value as DocumentCategoryCode
                  );
                  setSelectedIds([]);
                }
              }}
              className="rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200"
            >
              <option value="" disabled>
                Bulk Assign Category...
              </option>
              {categories.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                onNotify(
                  `Simulated bulk ZIP archive prepared for ${selectedIds.length} documents.`
                );
                setSelectedIds([]);
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
            >
              <Download className="h-3.5 w-3.5" />
              Bulk Download ZIP (Simulated)
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* CENTRALIZED 13-COLUMN REPOSITORY TABLE */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-2.5 pl-3 pr-1.5 w-7">
                  <input
                    type="checkbox"
                    aria-label="Select All Documents"
                    checked={
                      paginatedDocs.length > 0 &&
                      selectedIds.length === paginatedDocs.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-slate-300"
                  />
                </th>
                {visibleColumns.employeeId && <th className="py-2.5 px-1.5">ID</th>}
                {visibleColumns.avatar && <th className="py-2.5 px-1"></th>}
                {visibleColumns.employeeName && <th className="py-2.5 px-2">Employee</th>}
                {visibleColumns.department && <th className="py-2.5 px-2">Dept</th>}
                {visibleColumns.designation && <th className="py-2.5 px-2">Role</th>}
                {visibleColumns.documentName && <th className="py-2.5 px-2">Document</th>}
                {visibleColumns.category && <th className="py-2.5 px-2">Category</th>}
                {visibleColumns.documentType && <th className="py-2.5 px-2">Type</th>}
                {visibleColumns.uploadDate && <th className="py-2.5 px-2">Uploaded</th>}
                {visibleColumns.expiryDate && <th className="py-2.5 px-2">Expiry</th>}
                {visibleColumns.status && <th className="py-2.5 px-2">Status</th>}
                {visibleColumns.uploadedBy && <th className="py-2.5 px-2">By</th>}
                <th className="py-2.5 pl-2 pr-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {paginatedDocs.length === 0 ? (
                <tr>
                  <td colSpan={14} className="py-12 text-center text-slate-500">
                    No employee documents match the active filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedDocs.map((doc) => {
                  const expiryDays = getExpiryDaysRemaining(
                    doc.expiryDate,
                    REFERENCE_TODAY_ISO
                  );
                  const identifierText = maskSensitiveIds
                    ? doc.maskedIdentifier
                    : doc.unmaskedIdentifier || doc.maskedIdentifier;

                  return (
                    <tr
                      key={doc.id}
                      className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-2.5 pl-3 pr-1">
                        <input
                          type="checkbox"
                          aria-label={`Select ${doc.documentName}`}
                          checked={selectedIds.includes(doc.id)}
                          onChange={() => toggleRow(doc.id)}
                          className="rounded border-slate-300"
                        />
                      </td>
                      {visibleColumns.employeeId && (
                        <td className="py-2.5 px-1.5 font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onOpenEmployeeProfile(doc.employeeId)}
                            className="hover:underline"
                          >
                            {doc.employeeId}
                          </button>
                        </td>
                      )}
                      {visibleColumns.avatar && (
                        <td className="py-2.5 px-1">
                          <button
                            type="button"
                            onClick={() => onOpenEmployeeProfile(doc.employeeId)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-[10px] font-bold text-indigo-600 dark:text-indigo-300"
                            title={`Open ${doc.employeeName}'s Digital Document Profile`}
                          >
                            {doc.avatarInitials}
                          </button>
                        </td>
                      )}
                      {visibleColumns.employeeName && (
                        <td className="py-2.5 px-2 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onOpenEmployeeProfile(doc.employeeId)}
                            className="hover:text-indigo-600 text-left"
                          >
                            {doc.employeeName}
                          </button>
                        </td>
                      )}
                      {visibleColumns.department && (
                        <td className="py-2.5 px-2 text-[11px] text-slate-600 dark:text-slate-300 max-w-[100px] truncate">
                          {doc.department}
                        </td>
                      )}
                      {visibleColumns.designation && (
                        <td className="py-2.5 px-2 text-[11px] text-slate-500 dark:text-slate-400 max-w-[110px] truncate">
                          {doc.designation}
                        </td>
                      )}
                      {visibleColumns.documentName && (
                        <td className="py-2.5 px-2 max-w-[165px]">
                          <button
                            type="button"
                            onClick={() => onPreviewDocument(doc)}
                            className="font-semibold text-slate-900 dark:text-white hover:text-indigo-600 text-left block truncate max-w-[160px]"
                          >
                            {doc.documentName}
                          </button>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 truncate max-w-[160px]">
                            <span>
                              {doc.fileExtension} · {doc.fileSizeFormatted}
                            </span>
                            {identifierText && (
                              <span className="font-mono text-slate-500 dark:text-slate-400 truncate">
                                {identifierText}
                              </span>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleColumns.category && (
                        <td className="py-2.5 px-2 text-[11px] text-slate-600 dark:text-slate-300 max-w-[105px] truncate">
                          {doc.categoryLabel}
                        </td>
                      )}
                      {visibleColumns.documentType && (
                        <td className="py-2.5 px-2 text-[11px] font-medium text-slate-800 dark:text-slate-200 max-w-[115px] truncate">
                          {doc.documentType}
                        </td>
                      )}
                      {visibleColumns.uploadDate && (
                        <td className="py-2.5 px-2 text-[11px] text-slate-600 dark:text-slate-400 tabular-nums whitespace-nowrap">
                          {doc.uploadDate}
                        </td>
                      )}
                      {visibleColumns.expiryDate && (
                        <td className="py-2.5 px-2 text-[11px] tabular-nums whitespace-nowrap">
                          {doc.expiryDate ? (
                            <div>
                              <span
                                className={`font-medium ${
                                  expiryDays !== null && expiryDays < 0
                                    ? 'text-rose-600 dark:text-rose-400 font-semibold'
                                    : expiryDays !== null && expiryDays <= 30
                                    ? 'text-amber-600 dark:text-amber-400 font-semibold'
                                    : 'text-slate-700 dark:text-slate-300'
                                }`}
                              >
                                {doc.expiryDate}
                              </span>
                              {expiryDays !== null && (
                                <span className="block text-[10px] text-slate-400">
                                  {expiryDays < 0
                                    ? `Expired ${Math.abs(expiryDays)}d ago`
                                    : `${expiryDays}d left`}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400">No Expiry</span>
                          )}
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="py-2.5 px-2 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeStyle(
                              doc.verificationStatus
                            )}`}
                          >
                            {doc.verificationStatus}
                          </span>
                        </td>
                      )}
                      {visibleColumns.uploadedBy && (
                        <td className="py-2.5 px-2 text-[11px] text-slate-500 dark:text-slate-400 max-w-[95px] truncate">
                          {doc.uploadedBy}
                        </td>
                      )}
                      <td className="py-2.5 pl-1 pr-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-0.5">
                          <button
                            type="button"
                            onClick={() => onPreviewDocument(doc)}
                            title="View / Preview Document"
                            className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSimulateDownload(doc)}
                            title="Download Document"
                            className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          {doc.verificationStatus !== 'Verified' && (
                            <button
                              type="button"
                              onClick={() => onVerifyDocumentQuick(doc.id)}
                              title="Verify Document"
                              className="rounded p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => onRejectDocumentModal(doc)}
                            title="Reject Document"
                            className="rounded p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onReplaceDocumentModal(doc)}
                            title="Replace Document Version"
                            className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditDocumentModal(doc)}
                            title="Edit Details"
                            className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onViewVersionHistoryModal(doc)}
                            title="View Version History"
                            className="rounded p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-purple-600"
                          >
                            <History className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteOrArchiveDocument(doc.id)}
                            title="Archive / Delete Document"
                            className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="tabular-nums">
            Showing{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {filteredDocs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {Math.min(currentPage * pageSize, filteredDocs.length)}
            </span>{' '}
            of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {filteredDocs.length}
            </span>{' '}
            documents
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 font-medium disabled:opacity-40"
            >
              Previous
            </button>
            <span className="px-2 font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 font-medium disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
