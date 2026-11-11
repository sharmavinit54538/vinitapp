'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  Calendar,
  AlertCircle,
  CheckSquare,
  FileCheck,
  TrendingUp,
  RefreshCw,
  GitBranch,
  Plus,
  Upload,
  Eye,
  FileSpreadsheet,
  ArrowRightLeft,
  FileSignature,
  Download,
} from 'lucide-react';
import {
  OnboardingModuleId,
  OnboardingRole,
  OnboardingDashboardResponse,
  JoinerRecord,
  Joiner360ProfileResponse,
  OnboardingWorkflowTemplate,
  OnboardingTaskRecord,
  JoinerDocumentRecord,
  JoiningFormSubmissionRecord,
  OfferToJoiningHandoffRecord,
  PolicyAssignmentRecord,
} from '../../types/onboarding';
import {
  onboardingDashboardApi,
  onboardingJoinersApi,
  onboardingWorkflowsApi,
  onboardingTasksApi,
  onboardingDocumentsApi,
  onboardingJoiningFormsApi,
  onboardingOfferHandoffApi,
  onboardingPoliciesApi,
} from '../../services/onboarding';
import { useOnboardingPermission } from '../../hooks/useOnboardingPermission';
import {
  OnboardingSkeletonBlock,
  OnboardingErrorState,
  OnboardingEmptyState,
  OnboardingPermissionDeniedState,
  OnboardingModal,
} from './OnboardingPrimitives';

// ============================================================================
// MODULE 1: ONBOARDING DASHBOARD
// ============================================================================
export function OnboardingDashboardModule({
  onNavigateModule,
  onToast,
}: {
  onNavigateModule: (mod: OnboardingModuleId) => void;
  onToast: (msg: string) => void;
}) {
  const perms = useOnboardingPermission();
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');

  const [data, setData] = useState<OnboardingDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingDashboardApi.getSummary({
        departmentId: departmentFilter || undefined,
        location: locationFilter || undefined,
        from: fromFilter || undefined,
        to: toFilter || undefined,
      });
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load onboarding summary'));
    } finally {
      setLoading(false);
    }
  }, [departmentFilter, locationFilter, fromFilter, toFilter]);

  useEffect(() => {
    if (!perms.canAccessModule('dashboard')) return;
    const timer = setTimeout(() => {
      void loadSummary();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadSummary]);

  if (!perms.canAccessModule('dashboard')) {
    return (
      <OnboardingPermissionDeniedState
        moduleTitle="1. Onboarding Dashboard"
        requiredRoles="Super Admin, HR Admin, HR Executive, Reporting Manager"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Onboarding & Probation Command Center
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pre-boarding velocity, Day-1 readiness, document verification rate, no-show risk & probation milestones
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void loadSummary();
              onToast('Refreshed Onboarding Dashboard');
            }}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Metrics</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <input
            type="text"
            placeholder="Department filter..."
            aria-label="Filter by Department"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            type="text"
            placeholder="Location filter..."
            aria-label="Filter by Location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            type="date"
            aria-label="From Date"
            value={fromFilter}
            onChange={(e) => setFromFilter(e.target.value)}
            className="h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            type="date"
            aria-label="To Date"
            value={toFilter}
            onChange={(e) => setToFilter(e.target.value)}
            className="h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
        </div>
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={4} />
      ) : error ? (
        <OnboardingErrorState
          title="Onboarding Dashboard API Error"
          error={error}
          onRetry={loadSummary}
          actionLabel="Open Joiner Management"
          onAction={() => onNavigateModule('joiners')}
        />
      ) : !data ? (
        <OnboardingEmptyState
          title="No Onboarding Metrics Returned"
          description="Accepted offers handed off from Recruitment will automatically populate pre-boarding and Day-1 KPIs."
          ctaLabel="View Pre-boarding Joiners"
          onCtaClick={() => onNavigateModule('joiners')}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Upcoming / Today</span>
                <UserPlus className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xl font-bold font-mono mt-1">
                {data.kpis.upcomingJoiners} / {data.kpis.joiningToday}
              </div>
            </div>
            <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Pre-board / Active</span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-xl font-bold font-mono mt-1">
                {data.kpis.inPreBoarding} / {data.kpis.inOnboarding}
              </div>
            </div>
            <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Overdue Tasks</span>
                <CheckSquare className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-bold font-mono mt-1">
                {data.kpis.overdueTasks}
              </div>
            </div>
            <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Docs Pending / Risk</span>
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-xl font-bold font-mono mt-1">
                {data.kpis.documentsPending} / {data.kpis.noShowRiskCount}
              </div>
            </div>
            <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Avg Completion</span>
                <FileCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold font-mono mt-1">
                {data.kpis.avgOnboardingCompletionPct}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Joiner Pipeline by Stage</span>
              </h3>
              {data.pipelineByStage.map((pt) => (
                <div
                  key={pt.label}
                  className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800"
                >
                  <span>{pt.label}</span>
                  <span className="font-mono font-bold">{pt.value}</span>
                </div>
              ))}
            </div>

            <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h3 className="text-sm font-bold">SLA Breaches & Automation Alerts</h3>
              {data.alerts.map((al) => (
                <div
                  key={al.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold">{al.title}</span>
                  <button
                    type="button"
                    onClick={() => onNavigateModule(al.module)}
                    className="text-indigo-600 font-bold"
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODULE 2: JOINER MANAGEMENT (PRE-BOARDING LIST & KANBAN)
// ============================================================================
export function JoinerManagementModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useOnboardingPermission();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [joiners, setJoiners] = useState<JoinerRecord[]>([]);
  const [selectedJoiner, setSelectedJoiner] = useState<Joiner360ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [postponeOpen, setPostponeOpen] = useState(false);
  const [targetJoinerId, setTargetJoinerId] = useState('');
  const [newJoiningDate, setNewJoiningDate] = useState('');
  const [postponeReason, setPostponeReason] = useState('');

  const loadJoiners = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingJoinersApi.listJoiners({
        search: search || undefined,
        stage: stageFilter || undefined,
      });
      setJoiners(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load joiners'));
    } finally {
      setLoading(false);
    }
  }, [search, stageFilter]);

  useEffect(() => {
    if (!perms.canAccessModule('joiners')) return;
    const timer = setTimeout(() => {
      void loadJoiners();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadJoiners]);

  const handlePostpone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onboardingJoinersApi.changeJoiningDate(targetJoinerId.trim(), {
        requestedJoiningDate: newJoiningDate,
        reason: postponeReason.trim(),
      });
      setPostponeOpen(false);
      onToast('Joining date change submitted for approval');
      void loadJoiners();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Date change failed');
    }
  };

  if (!perms.canAccessModule('joiners')) {
    return (
      <OnboardingPermissionDeniedState
        moduleTitle="2. Joiner Management"
        requiredRoles="Super Admin, HR Admin, HR Executive, Reporting Manager"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Joiner Management (Pre-boarding to Probation Kanban & List)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Offer Accepted → Pre-boarding → Joining Day → Onboarding → Probation → Confirmed
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                void onboardingJoinersApi
                  .exportJoinersCsv(stageFilter || undefined)
                  .catch((e: Error) => onToast(e.message));
              }}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setPostponeOpen(true)}
              className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Change Joining Date
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            type="search"
            placeholder="Search joiner name, department, manager..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <select
            aria-label="Filter by Lifecycle Stage"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <option value="">All Lifecycle Stages</option>
            <option value="OfferAccepted">Offer Accepted</option>
            <option value="PreBoarding">Pre-boarding</option>
            <option value="JoiningDay">Joining Day</option>
            <option value="Onboarding">Onboarding</option>
            <option value="Probation">Probation</option>
            <option value="Confirmed">Confirmed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={4} />
      ) : error ? (
        <OnboardingErrorState
          title="Joiner Management API Error"
          error={error}
          onRetry={loadJoiners}
          actionLabel="Change Joining Date"
          onAction={() => setPostponeOpen(true)}
        />
      ) : joiners.length === 0 ? (
        <OnboardingEmptyState
          title="No Active Joiners Found"
          description="Joiners auto-populate from accepted Recruitment offers and progress through pre-boarding to probation confirmation."
          ctaLabel="Change Joining Date / Action"
          onCtaClick={() => setPostponeOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {joiners.map((j) => (
            <div
              key={j.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="text-sm font-bold">
                  {j.joinerCode} · {j.fullName} ({j.designation})
                </div>
                <div className="text-xs text-slate-500">
                  {j.department} · Joining: {j.joiningDate} · Stage: {j.stage} · Progress:{' '}
                  {j.completionPct}%
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  void onboardingJoinersApi
                    .getJoiner360(j.id)
                    .then((res) => setSelectedJoiner(res))
                    .catch((e: Error) => onToast(e.message));
                }}
                className="h-8 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Joiner 360°
              </button>
            </div>
          ))}
        </div>
      )}

      <OnboardingModal
        open={postponeOpen}
        title="Postpone / Change Joining Date"
        subtitle="Routes joining date revision for manager & HR approval"
        onClose={() => setPostponeOpen(false)}
      >
        <form onSubmit={handlePostpone} className="space-y-3">
          <input
            required
            type="text"
            placeholder="Joiner ID *"
            value={targetJoinerId}
            onChange={(e) => setTargetJoinerId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            required
            type="date"
            aria-label="New Joining Date"
            value={newJoiningDate}
            onChange={(e) => setNewJoiningDate(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <textarea
            required
            rows={3}
            placeholder="Reason for joining date change *"
            value={postponeReason}
            onChange={(e) => setPostponeReason(e.target.value)}
            className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPostponeOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Submit Revision
            </button>
          </div>
        </form>
      </OnboardingModal>

      <OnboardingModal
        open={Boolean(selectedJoiner)}
        title={selectedJoiner?.joiner.fullName || 'Joiner 360° Profile'}
        subtitle="Personal info, tasks, documents, assets & probation status"
        onClose={() => setSelectedJoiner(null)}
      >
        {selectedJoiner ? (
          <div className="space-y-2 text-xs">
            <div>
              Documents Completed: {selectedJoiner.documentsCompletedCount} · Tasks Completed:{' '}
              {selectedJoiner.tasksCompletedCount}
            </div>
            <div>Probation: {selectedJoiner.probationStatus}</div>
          </div>
        ) : null}
      </OnboardingModal>
    </div>
  );
}

// ============================================================================
// MODULE 3: ONBOARDING WORKFLOWS & TEMPLATES
// ============================================================================
export function OnboardingWorkflowsModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useOnboardingPermission();
  const [templates, setTemplates] = useState<OnboardingWorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [grade, setGrade] = useState('L4');
  const [relativeRule, setRelativeRule] = useState('T-7');
  const [taskTitle, setTaskTitle] = useState('');

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingWorkflowsApi.listTemplates();
      setTemplates(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load workflow templates'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('workflows')) return;
    const timer = setTimeout(() => {
      void loadTemplates();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadTemplates]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onboardingWorkflowsApi.createTemplate({
        name: name.trim(),
        department: department.trim(),
        grade: grade.trim(),
        location: 'Bengaluru',
        employmentType: 'Full-Time',
        effectiveFrom: '2026-04-01',
        autoAssignOnOfferAccept: true,
        tasks: [
          {
            taskTitle: taskTitle.trim(),
            ownerRole: 'hr_executive',
            relativeDueDays: relativeRule.trim(),
            mandatory: true,
          },
        ],
      });
      setCreateOpen(false);
      onToast('Onboarding Workflow Template created');
      void loadTemplates();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to create template');
    }
  };

  if (!perms.canAccessModule('workflows')) {
    return (
      <OnboardingPermissionDeniedState
        moduleTitle="3. Onboarding Workflows & Templates"
        requiredRoles="Super Admin, HR Admin, HR Executive"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Visual Onboarding Workflows & Relative Due-Date Templates
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Department/grade/location templates with T-7, T+0, T+3 relative rules & auto-assignment on offer acceptance
          </p>
        </div>
        {perms.canManageTemplates ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>New Workflow Template</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={3} />
      ) : error ? (
        <OnboardingErrorState
          title="Workflow Templates API Error"
          error={error}
          onRetry={loadTemplates}
          actionLabel={perms.canManageTemplates ? 'New Workflow Template' : undefined}
          onAction={perms.canManageTemplates ? () => setCreateOpen(true) : undefined}
        />
      ) : templates.length === 0 ? (
        <OnboardingEmptyState
          title="No Onboarding Workflow Templates Configured"
          description="Build reusable onboarding workflows with relative due dates (e.g., T-7 IT provisioning, T+0 Day-1 orientation)."
          ctaLabel={perms.canManageTemplates ? 'Create Workflow Template' : undefined}
          onCtaClick={perms.canManageTemplates ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold">
                  {tpl.code} · {tpl.name} (v{tpl.version})
                </div>
                <div className="text-xs text-slate-500">
                  {tpl.department} · {tpl.employmentType} · {tpl.tasks.length} Tasks
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600">
                {tpl.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      )}

      <OnboardingModal
        open={createOpen}
        title="Create Onboarding Workflow Template"
        subtitle="Define relative joining date task rules (e.g. T-7, T+3)"
        onClose={() => setCreateOpen(false)}
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            required
            type="text"
            placeholder="Template Name *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              type="text"
              placeholder="Department *"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              required
              type="text"
              placeholder="Grade (e.g. L4) *"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            <input
              required
              type="text"
              placeholder="Rule (e.g. T-7)"
              value={relativeRule}
              onChange={(e) => setRelativeRule(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              required
              type="text"
              placeholder="Initial Task Title *"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="col-span-2 h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Save Template
            </button>
          </div>
        </form>
      </OnboardingModal>
    </div>
  );
}

// ============================================================================
// MODULE 4: TASK MANAGEMENT & ASSIGNMENT
// ============================================================================
export function TaskManagementModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useOnboardingPermission();
  const [ownerFilter, setOwnerFilter] = useState('');
  const [tasks, setTasks] = useState<OnboardingTaskRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [joinerId, setJoinerId] = useState('');
  const [title, setTitle] = useState('');
  const [ownerRole, setOwnerRole] = useState<OnboardingRole>('it_admin');
  const [dueDate, setDueDate] = useState('');

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingTasksApi.listTasks({
        ownerRole: ownerFilter || undefined,
      });
      setTasks(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load onboarding tasks'));
    } finally {
      setLoading(false);
    }
  }, [ownerFilter]);

  useEffect(() => {
    if (!perms.canAccessModule('tasks')) return;
    const timer = setTimeout(() => {
      void loadTasks();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadTasks]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onboardingTasksApi.createTask({
        joinerId: joinerId.trim(),
        title: title.trim(),
        ownerRole,
        dueDate,
        priority: 'High',
      });
      setCreateOpen(false);
      onToast('Onboarding task assigned');
      void loadTasks();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  if (!perms.canAccessModule('tasks')) {
    return (
      <OnboardingPermissionDeniedState
        moduleTitle="4. Task Management & Assignment"
        requiredRoles="All Authenticated Roles"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Multi-Owner Onboarding Task Inbox & Escalations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Tasks across HR, Manager, IT, Facilities, Finance, Buddy & New Joiner with SLA escalations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            aria-label="Filter by Task Owner"
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <option value="">All Stakeholder Owners</option>
            <option value="hr_executive">HR Executive</option>
            <option value="reporting_manager">Reporting Manager</option>
            <option value="it_admin">IT Admin</option>
            <option value="admin_facilities">Admin / Facilities</option>
            <option value="finance_payroll">Finance / Payroll</option>
            <option value="buddy_mentor">Buddy / Mentor</option>
            <option value="new_joiner">New Joiner</option>
          </select>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Assign Task</span>
          </button>
        </div>
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={3} />
      ) : error ? (
        <OnboardingErrorState
          title="Task Management API Error"
          error={error}
          onRetry={loadTasks}
          actionLabel="Assign Task"
          onAction={() => setCreateOpen(true)}
        />
      ) : tasks.length === 0 ? (
        <OnboardingEmptyState
          title="No Pending Onboarding Tasks"
          description="Assign tasks to HR, IT, Facilities, Payroll, Buddy, or Joiner and track overdue escalations."
          ctaLabel="Create Onboarding Task"
          onCtaClick={() => setCreateOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold">
                  {t.title} · Joiner: {t.joinerName}
                </div>
                <div className="text-xs text-slate-500">
                  Owner: {t.ownerRole} · Due: {t.dueDate} ({t.relativeRule})
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  void onboardingTasksApi
                    .bulkTaskAction({ taskIds: [t.id], action: 'complete' })
                    .then(() => {
                      onToast('Task marked completed');
                      void loadTasks();
                    })
                    .catch((e: Error) => onToast(e.message));
                }}
                className="h-8 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Complete
              </button>
            </div>
          ))}
        </div>
      )}

      <OnboardingModal
        open={createOpen}
        title="Assign Stakeholder Onboarding Task"
        subtitle="Route task to HR, IT, Manager, Facilities, Finance, or Buddy"
        onClose={() => setCreateOpen(false)}
      >
        <form onSubmit={handleCreateTask} className="space-y-3">
          <input
            required
            type="text"
            placeholder="Joiner ID *"
            value={joinerId}
            onChange={(e) => setJoinerId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            required
            type="text"
            placeholder="Task Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <select
            aria-label="Task Owner Role"
            value={ownerRole}
            onChange={(e) => setOwnerRole(e.target.value as OnboardingRole)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <option value="it_admin">IT Admin</option>
            <option value="admin_facilities">Admin / Facilities</option>
            <option value="finance_payroll">Finance / Payroll</option>
            <option value="reporting_manager">Reporting Manager</option>
            <option value="buddy_mentor">Buddy / Mentor</option>
            <option value="hr_executive">HR Executive</option>
          </select>
          <input
            required
            type="date"
            aria-label="Due Date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Assign Task
            </button>
          </div>
        </form>
      </OnboardingModal>
    </div>
  );
}

// ============================================================================
// MODULE 5: DOCUMENT COLLECTION & VERIFICATION
// ============================================================================
export function DocumentCollectionModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useOnboardingPermission();
  const [docs, setDocs] = useState<JoinerDocumentRecord[]>([]);
  const [revealedIds, setRevealedIds] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const [joinerId, setJoinerId] = useState('');
  const [docType, setDocType] = useState('PAN');
  const [file, setFile] = useState<File | null>(null);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingDocumentsApi.listDocuments();
      setDocs(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load joiner documents'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('documents')) return;
    const timer = setTimeout(() => {
      void loadDocs();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadDocs]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      onToast('Select a document file to upload');
      return;
    }
    try {
      const fd = new FormData();
      fd.append('joinerId', joinerId.trim());
      fd.append('documentType', docType);
      fd.append('file', file);
      await onboardingDocumentsApi.uploadDocument(fd);
      setUploadOpen(false);
      onToast('Document uploaded for backend OCR & HR verification');
      void loadDocs();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Document upload failed');
    }
  };

  if (!perms.canAccessModule('documents')) {
    return (
      <OnboardingPermissionDeniedState
        moduleTitle="5. Document Collection & Verification"
        requiredRoles="Super Admin, HR Admin, HR Executive, Finance/Payroll, New Joiner"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            KYC Document Collection, OCR Confidence & HR Verification
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Aadhaar, PAN, Passport, Education, Relieving Letter & Bank Cheque with default PII masking
          </p>
        </div>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload KYC Document</span>
        </button>
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={3} />
      ) : error ? (
        <OnboardingErrorState
          title="Document Verification API Error"
          error={error}
          onRetry={loadDocs}
          actionLabel="Upload KYC Document"
          onAction={() => setUploadOpen(true)}
        />
      ) : docs.length === 0 ? (
        <OnboardingEmptyState
          title="No Joiner Documents Uploaded"
          description="Upload Aadhaar, PAN, Passport, Education, or Bank documents for OCR extraction and HR verification."
          ctaLabel="Upload Document"
          onCtaClick={() => setUploadOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {docs.map((d) => (
            <div
              key={d.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="text-sm font-bold">
                  {d.joinerName} · {d.documentType}
                </div>
                <div className="text-xs text-slate-500">
                  ID: {revealedIds[d.id] || d.maskedDocumentNumber} · OCR Confidence:{' '}
                  {d.ocrConfidencePct}% · Status: {d.status}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {perms.canRevealSensitiveId && !revealedIds[d.id] ? (
                  <button
                    type="button"
                    onClick={() => {
                      void onboardingDocumentsApi
                        .revealSensitiveNumber(d.id)
                        .then((res) => {
                          setRevealedIds((prev) => ({
                            ...prev,
                            [d.id]: res.unmaskedNumber,
                          }));
                          onToast('Sensitive ID revealed and audit-logged');
                        })
                        .catch((e: Error) => onToast(e.message));
                    }}
                    className="h-8 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Reveal ID</span>
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <OnboardingModal
        open={uploadOpen}
        title="Upload Joiner KYC Document"
        subtitle="Validated for type/size and processed by backend OCR"
        onClose={() => setUploadOpen(false)}
      >
        <form onSubmit={handleUpload} className="space-y-3">
          <input
            required
            type="text"
            placeholder="Joiner ID *"
            value={joinerId}
            onChange={(e) => setJoinerId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <select
            aria-label="Document Type"
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <option value="Aadhaar">Aadhaar Card</option>
            <option value="PAN">PAN Card</option>
            <option value="Passport">Passport</option>
            <option value="EducationDegree">Education Certificate</option>
            <option value="RelievingLetter">Relieving / Experience Letter</option>
            <option value="BankCancelledCheque">Cancelled Cheque / Bank Proof</option>
          </select>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            aria-label="Choose Document File"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full text-xs"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setUploadOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Upload & Parse
            </button>
          </div>
        </form>
      </OnboardingModal>
    </div>
  );
}

// ============================================================================
// MODULE 6: EMPLOYEE DATA COLLECTION (JOINING FORMS)
// ============================================================================
export function EmployeeDataCollectionModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useOnboardingPermission();
  const [forms, setForms] = useState<JoiningFormSubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const [joinerId, setJoinerId] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [nomineeName, setNomineeName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [pan, setPan] = useState('');
  const [uan, setUan] = useState('');

  const loadForms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingJoiningFormsApi.listSubmissions();
      setForms(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load joining forms'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('joining-forms')) return;
    const timer = setTimeout(() => {
      void loadForms();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadForms]);

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onboardingJoiningFormsApi.saveJoiningForm(joinerId.trim(), {
        bloodGroup,
        emergencyContactName: emergencyName.trim(),
        emergencyContactPhone: emergencyPhone.trim(),
        nomineeName: nomineeName.trim(),
        nomineeRelationship: 'Spouse / Parent',
        bankAccountNumber: bankAccount.trim(),
        ifscCode: ifsc.trim(),
        panNumber: pan.trim(),
        uanNumber: uan.trim(),
      });
      setFormOpen(false);
      onToast('Joining Form saved and submitted for HR review');
      void loadForms();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to save joining form');
    }
  };

  if (!perms.canAccessModule('joining-forms')) {
    return (
      <OnboardingPermissionDeniedState
        moduleTitle="6. Employee Data Collection (Joining Forms)"
        requiredRoles="Super Admin, HR Admin, HR Executive, New Joiner"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Digital Joining Forms (Personal, Nominee, Bank & Statutory Data)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Draft auto-save, statutory PAN/UAN/ESI collection, HR correction requests & post-approval lock
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Complete Joining Form</span>
        </button>
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={3} />
      ) : error ? (
        <OnboardingErrorState
          title="Employee Data Collection API Error"
          error={error}
          onRetry={loadForms}
          actionLabel="Complete Joining Form"
          onAction={() => setFormOpen(true)}
        />
      ) : forms.length === 0 ? (
        <OnboardingEmptyState
          title="No Joining Forms Submitted Yet"
          description="Collect personal, family nominee, emergency contact, bank, and statutory (PAN/UAN/ESI) details digitally."
          ctaLabel="Fill Joining Form"
          onCtaClick={() => setFormOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {forms.map((f) => (
            <div
              key={f.joinerId}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold">
                  {f.joinerName} · Completion: {f.completionPct}%
                </div>
                <div className="text-xs text-slate-500">
                  PAN: {f.maskedPan} · UAN: {f.maskedUan} · Status: {f.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <OnboardingModal
        open={formOpen}
        title="Digital Joining Form"
        subtitle="Personal, emergency, nominee, bank & statutory declarations"
        onClose={() => setFormOpen(false)}
      >
        <form onSubmit={handleSaveForm} className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <input
              required
              type="text"
              placeholder="Joiner ID *"
              value={joinerId}
              onChange={(e) => setJoinerId(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              type="text"
              placeholder="Blood Group"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              required
              type="text"
              placeholder="Emergency Contact Name *"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              required
              type="tel"
              placeholder="Emergency Phone *"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              required
              type="text"
              placeholder="PF / Gratuity Nominee Name *"
              value={nomineeName}
              onChange={(e) => setNomineeName(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              required
              type="text"
              placeholder="Bank Account Number *"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              required
              type="text"
              placeholder="Bank IFSC Code *"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              required
              type="text"
              placeholder="PAN Number *"
              value={pan}
              onChange={(e) => setPan(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <input
            type="text"
            placeholder="PF UAN Number (if existing)"
            value={uan}
            onChange={(e) => setUan(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Submit Joining Form
            </button>
          </div>
        </form>
      </OnboardingModal>
    </div>
  );
}

// ============================================================================
// MODULE 7: OFFER-TO-JOINING HANDOFF (FROM RECRUITMENT)
// ============================================================================
export function OfferToJoiningHandoffModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useOnboardingPermission();
  const [handoffs, setHandoffs] = useState<OfferToJoiningHandoffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadHandoffs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingOfferHandoffApi.listHandoffs();
      setHandoffs(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load offer handoffs'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('offer-handoff')) return;
    const timer = setTimeout(() => {
      void loadHandoffs();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadHandoffs]);

  if (!perms.canAccessModule('offer-handoff')) {
    return (
      <OnboardingPermissionDeniedState
        moduleTitle="7. Offer-to-Joining Handoff"
        requiredRoles="Super Admin, HR Admin, HR Executive"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Offer-to-Joining Handoff (Linked from Recruitment ATS)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Accepted offer sync, compensation & designation view, BGV clearance status & Employee ID generation
          </p>
        </div>
        <button
          type="button"
          onClick={loadHandoffs}
          className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          <span>Sync Accepted Offers</span>
        </button>
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={3} />
      ) : error ? (
        <OnboardingErrorState
          title="Offer-to-Joining Handoff API Error"
          error={error}
          onRetry={loadHandoffs}
        />
      ) : handoffs.length === 0 ? (
        <OnboardingEmptyState
          title="No Accepted Offer Handoffs Pending"
          description="When candidates e-sign their offer in Recruitment, their record is handed off here for Employee ID generation."
          ctaLabel="Sync from Recruitment"
          onCtaClick={loadHandoffs}
        />
      ) : (
        <div className="space-y-3">
          {handoffs.map((h) => (
            <div
              key={h.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold">
                  {h.offerCode} · {h.candidateName} ({h.designation})
                </div>
                <div className="text-xs text-slate-500">
                  CTC: {h.annualCtcFormatted} · BGV: {h.bgvStatus} · Emp ID:{' '}
                  {h.generatedEmployeeCode || h.employeeCodeStatus}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  void onboardingOfferHandoffApi
                    .generateEmployeeId(h.id)
                    .then(() => {
                      onToast('Employee ID generated');
                      void loadHandoffs();
                    })
                    .catch((e: Error) => onToast(e.message));
                }}
                className="h-8 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Generate Emp ID
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODULE 8: POLICY ACKNOWLEDGEMENT & E-SIGN
// ============================================================================
export function PolicyAcknowledgementModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useOnboardingPermission();
  const [assignments, setAssignments] = useState<PolicyAssignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [joinerId, setJoinerId] = useState('');
  const [packCode, setPackCode] = useState('CORP-STD-PACK-2026');

  const loadPolicies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingPoliciesApi.listAssignments();
      setAssignments(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load policy assignments'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('policies')) return;
    const timer = setTimeout(() => {
      void loadPolicies();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadPolicies]);

  const handleAssignPack = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onboardingPoliciesApi.assignPolicyPack({
        joinerId: joinerId.trim(),
        policyPackCode: packCode,
      });
      setAssignOpen(false);
      onToast('Policy pack assigned for e-signature');
      void loadPolicies();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Policy assignment failed');
    }
  };

  if (!perms.canAccessModule('policies')) {
    return (
      <OnboardingPermissionDeniedState
        moduleTitle="8. Policy Acknowledgement & E-Sign"
        requiredRoles="Super Admin, HR Admin, HR Executive, New Joiner"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Corporate Policy Acknowledgement & Digital E-Signature
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Code of Conduct, NDA, IT Security, POSH, Employee Handbook & Appointment Letter e-Sign
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAssignOpen(true)}
          className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <FileSignature className="w-3.5 h-3.5" />
          <span>Assign Policy Pack</span>
        </button>
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={3} />
      ) : error ? (
        <OnboardingErrorState
          title="Policy Acknowledgement API Error"
          error={error}
          onRetry={loadPolicies}
          actionLabel="Assign Policy Pack"
          onAction={() => setAssignOpen(true)}
        />
      ) : assignments.length === 0 ? (
        <OnboardingEmptyState
          title="No Policy Packs Assigned"
          description="Assign mandatory NDA, POSH, Code of Conduct, and IT Security policy packs for joiner e-signature."
          ctaLabel="Assign Policy Pack"
          onCtaClick={() => setAssignOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((p) => (
            <div
              key={p.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold">
                  {p.joinerName} · {p.policyPackName} (v{p.version})
                </div>
                <div className="text-xs text-slate-500">
                  Policies: {p.policiesIncluded.join(', ')} · Status: {p.eSignStatus}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  void onboardingPoliciesApi
                    .downloadSignedPdf(p.id)
                    .catch((e: Error) => onToast(e.message));
                }}
                className="h-8 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Signed PDF
              </button>
            </div>
          ))}
        </div>
      )}

      <OnboardingModal
        open={assignOpen}
        title="Assign Corporate Policy Pack"
        subtitle="Require digital e-signature prior to Day-1 activation"
        onClose={() => setAssignOpen(false)}
      >
        <form onSubmit={handleAssignPack} className="space-y-3">
          <input
            required
            type="text"
            placeholder="Joiner ID *"
            value={joinerId}
            onChange={(e) => setJoinerId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <select
            aria-label="Policy Pack"
            value={packCode}
            onChange={(e) => setPackCode(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <option value="CORP-STD-PACK-2026">
              Standard Corporate Pack (NDA + Code of Conduct + POSH + IT Policy)
            </option>
            <option value="ENG-SEC-PACK-2026">
              Engineering & IP Security Pack
            </option>
          </select>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAssignOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Send for E-Sign
            </button>
          </div>
        </form>
      </OnboardingModal>
    </div>
  );
}
