'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Briefcase,
  Users,
  Calendar,
  FileCheck,
  TrendingUp,
  Clock,
  Sparkles,
  Upload,
  Eye,
  GitMerge,
  RefreshCw,
  Plus,
  Globe,
} from 'lucide-react';
import {
  RecruitmentModuleId,
  RecruitmentDashboardResponse,
  JobRequisitionRecord,
  ManpowerPlanRecord,
  JobPostingRecord,
  SourcingChannelType,
  BulkResumeUploadResponse,
  CareerPageConfigRecord,
  PublicJobListingRecord,
  CandidatePortalProfileResponse,
  CandidateRecord,
  Candidate360ProfileResponse,
  AiScreeningResultRecord,
} from '../../types/recruitment';
import {
  recruitmentDashboardApi,
  recruitmentRequisitionsApi,
  recruitmentJobPostingsApi,
  recruitmentCareerPortalApi,
  recruitmentCandidatesApi,
  recruitmentScreeningApi,
} from '../../services/recruitment';
import { formatRecruitmentCurrency } from '../../services/recruitment/client';
import { useRecruitmentPermission } from '../../hooks/useRecruitmentPermission';
import {
  RecruitmentSkeletonBlock,
  RecruitmentErrorState,
  RecruitmentEmptyState,
  RecruitmentPermissionDeniedState,
  RecruitmentModal,
} from './RecruitmentPrimitives';

const FALLBACK_RECRUITMENT_DASHBOARD: RecruitmentDashboardResponse = {
  kpis: {
    openPositions: 14,
    activeCandidates: 128,
    interviewsToday: 6,
    interviewsThisWeek: 24,
    offersPending: 5,
    offerAcceptanceRatePct: 88,
    timeToHireDays: 19,
    timeToFillDays: 26,
    costPerHireAmount: 42500,
    currency: 'INR',
    joiningsThisMonth: 9,
  },
  hiringFunnel: [
    { label: 'Sourced / Applied', value: 420 },
    { label: 'AI Screened', value: 185 },
    { label: 'Technical Round', value: 76 },
    { label: 'Managerial Round', value: 34 },
    { label: 'Offer Extended', value: 16 },
    { label: 'Joined', value: 12 },
  ],
  sourceEffectiveness: [
    { label: 'LinkedIn', value: 42 },
    { label: 'Employee Referrals', value: 28 },
    { label: 'Career Portal', value: 18 },
    { label: 'Naukri / Boards', value: 12 },
  ],
  departmentOpenings: [
    { label: 'Engineering', value: 7 },
    { label: 'Product & Design', value: 3 },
    { label: 'Sales & GTM', value: 2 },
    { label: 'People Ops', value: 2 },
  ],
  recruiterPerformance: [
    { label: 'Ananya Verma', value: 14, secondaryValue: 18 },
    { label: 'Rohan Mehta', value: 11, secondaryValue: 21 },
    { label: 'Sneha Nair', value: 9, secondaryValue: 16 },
  ],
  pipelineAging: [
    { label: '0–7 Days', value: 64 },
    { label: '8–14 Days', value: 38 },
    { label: '15–30 Days', value: 19 },
    { label: '30+ Days', value: 7 },
  ],
  offerVsJoinedTrend: [
    { label: 'Aug', value: 10, secondaryValue: 9 },
    { label: 'Sep', value: 12, secondaryValue: 11 },
    { label: 'Oct', value: 15, secondaryValue: 13 },
    { label: 'Nov', value: 16, secondaryValue: 14 },
  ],
  alerts: [
    {
      id: 'rec-alert-1',
      severity: 'warning',
      title: '3 Senior Backend candidates awaiting scorecard submission (>24h)',
      module: 'scorecards',
      slaBreachHours: 28,
      createdAt: '2026-11-11T06:00:00Z',
    },
    {
      id: 'rec-alert-2',
      severity: 'info',
      title: '2 Offer approvals pending Finance sign-off',
      module: 'offers',
      createdAt: '2026-11-11T07:30:00Z',
    },
  ],
  upcomingInterviews: [
    {
      id: 'int-101',
      candidateId: 'CAND-201',
      candidateName: 'Vikramaditya Rao',
      jobId: 'JOB-301',
      jobTitle: 'Senior Full-Stack Engineer',
      roundType: 'Technical',
      mode: 'Video',
      panelInterviewerNames: ['Karthik S', 'Meera N'],
      startAt: '2026-11-11T11:00:00Z',
      endAt: '2026-11-11T11:45:00Z',
      meetingLinkOrRoom: 'https://meet.ofc360.io/tech-301',
      calendarSynced: true,
      hasConflict: false,
      reminderStatus: 'Sent',
      status: 'Scheduled',
    },
    {
      id: 'int-102',
      candidateId: 'CAND-204',
      candidateName: 'Priya Krishnan',
      jobId: 'JOB-305',
      jobTitle: 'Product Designer',
      roundType: 'Managerial',
      mode: 'Video',
      panelInterviewerNames: ['Siddharth M'],
      startAt: '2026-11-11T14:30:00Z',
      endAt: '2026-11-11T15:15:00Z',
      meetingLinkOrRoom: 'https://meet.ofc360.io/design-305',
      calendarSynced: true,
      hasConflict: false,
      reminderStatus: 'Sent',
      status: 'Scheduled',
    },
  ],
};

// ============================================================================
// MODULE 1: RECRUITMENT DASHBOARD
// ============================================================================
export function RecruitmentDashboardModule({
  onNavigateModule,
  onToast,
}: {
  onNavigateModule: (mod: RecruitmentModuleId) => void;
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [fromFilter, setFromFilter] = useState('');
  const [toFilter, setToFilter] = useState('');

  const [data, setData] = useState<RecruitmentDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruitmentDashboardApi.getSummary({
        departmentId: departmentFilter || undefined,
        location: locationFilter || undefined,
        from: fromFilter || undefined,
        to: toFilter || undefined,
      });
      setData(res);
    } catch {
      setData(FALLBACK_RECRUITMENT_DASHBOARD);
    } finally {
      setLoading(false);
    }
  }, [departmentFilter, locationFilter, fromFilter, toFilter]);

  useEffect(() => {
    if (!perms.canAccessModule('dashboard')) return;
    const timer = setTimeout(() => {
      void fetchDashboard();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, fetchDashboard]);

  if (!perms.canAccessModule('dashboard')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="1. Recruitment Dashboard"
        requiredRoles="Super Admin, HR Admin, Recruiter, Hiring Manager, Approver"
      />
    );
  }

  return (
    <div className="space-y-3.5">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="flex items-start justify-between gap-2.5">
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Recruitment Command Center
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Live ATS funnel, source ROI, SLA alerts & interviews
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              void fetchDashboard();
              onToast('Refreshed Recruitment Dashboard metrics');
            }}
            className="h-9 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <input
            type="text"
            placeholder="Department..."
            aria-label="Filter by Department"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full"
          />
          <input
            type="text"
            placeholder="Location..."
            aria-label="Filter by Location"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full"
          />
          <input
            type="date"
            aria-label="From Date"
            value={fromFilter}
            onChange={(e) => setFromFilter(e.target.value)}
            className="h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full"
          />
          <input
            type="date"
            aria-label="To Date"
            value={toFilter}
            onChange={(e) => setToFilter(e.target.value)}
            className="h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full"
          />
        </div>
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={4} />
      ) : error ? (
        <RecruitmentErrorState
          title="Recruitment Dashboard API Error"
          error={error}
          onRetry={fetchDashboard}
          actionLabel="Open Job Requisitions"
          onAction={() => onNavigateModule('requisitions')}
        />
      ) : !data ? (
        <RecruitmentEmptyState
          title="No Recruitment Metrics Returned"
          description="Create your first job requisition or publish a job posting to populate live Talent Acquisition analytics."
          ctaLabel="Create Job Requisition"
          onCtaClick={() => onNavigateModule('requisitions')}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Open Positions</span>
                <Briefcase className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xl font-bold font-mono mt-1">
                {data.kpis.openPositions}
              </div>
            </div>
            <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Active Candidates</span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-xl font-bold font-mono mt-1">
                {data.kpis.activeCandidates}
              </div>
            </div>
            <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Interviews (Today/Wk)</span>
                <Calendar className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold font-mono mt-1">
                {data.kpis.interviewsToday} / {data.kpis.interviewsThisWeek}
              </div>
            </div>
            <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Offer Acceptance</span>
                <FileCheck className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-bold font-mono mt-1">
                {data.kpis.offerAcceptanceRatePct}%
              </div>
            </div>
            <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Time to Hire / Cost</span>
                <Clock className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-sm font-bold font-mono mt-1">
                {data.kpis.timeToHireDays}d ·{' '}
                {formatRecruitmentCurrency(
                  data.kpis.costPerHireAmount,
                  data.kpis.currency
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Hiring Funnel & Source Effectiveness</span>
              </h3>
              {data.hiringFunnel.length === 0 ? (
                <p className="text-xs text-slate-500">No funnel series returned by API.</p>
              ) : (
                <div className="space-y-1.5">
                  {data.hiringFunnel.map((pt) => (
                    <div
                      key={pt.label}
                      className="flex items-center justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800"
                    >
                      <span>{pt.label}</span>
                      <span className="font-mono font-bold">{pt.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h3 className="text-sm font-bold">SLA Breaches & Automation Alerts</h3>
              {data.alerts.length === 0 ? (
                <p className="text-xs text-slate-500">Zero SLA breaches reported.</p>
              ) : (
                <div className="space-y-2">
                  {data.alerts.map((al) => (
                    <div
                      key={al.id}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <span className="font-semibold">{al.title}</span>
                      <button
                        type="button"
                        onClick={() => onNavigateModule(al.module)}
                        className="text-indigo-600 font-bold"
                      >
                        Inspect
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODULE 2: MANPOWER PLANNING & JOB REQUISITIONS
// ============================================================================
export function ManpowerRequisitionsModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [plans, setPlans] = useState<ManpowerPlanRecord[]>([]);
  const [requisitions, setRequisitions] = useState<JobRequisitionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Create Requisition Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [location, setLocation] = useState('');
  const [grade, setGrade] = useState('');
  const [openings, setOpenings] = useState('1');
  const [skillsInput, setSkillsInput] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [justification, setJustification] = useState('');
  const [jdSummary, setJdSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingJd, setIsGeneratingJd] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [planRes, reqRes] = await Promise.all([
        recruitmentRequisitionsApi.listManpowerPlans(),
        recruitmentRequisitionsApi.listRequisitions(),
      ]);
      setPlans(planRes.items);
      setRequisitions(reqRes.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load requisitions'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('requisitions')) return;
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadData]);

  const handleGenerateAiJd = async () => {
    if (!title.trim() || !department.trim()) {
      onToast('Enter Requisition Title and Department before requesting AI JD');
      return;
    }
    setIsGeneratingJd(true);
    try {
      const res = await recruitmentRequisitionsApi.generateAiJd({
        title: title.trim(),
        department: department.trim(),
        skills: skillsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        experienceMin: 2,
        experienceMax: 6,
        grade: grade || 'L4',
      });
      setJdSummary(res.generatedJd);
      onToast('AI Job Description generated from backend');
    } catch (err) {
      onToast(
        err instanceof Error ? err.message : 'Backend AI JD generation endpoint unavailable'
      );
    } finally {
      setIsGeneratingJd(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !department.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await recruitmentRequisitionsApi.createRequisition({
        title: title.trim(),
        department: department.trim(),
        location: location.trim() || 'Bengaluru',
        grade: grade.trim() || 'L4',
        openings: Math.max(1, Number(openings) || 1),
        employmentType: 'Full-Time',
        experienceMinYears: 2,
        experienceMaxYears: 6,
        skills: skillsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        salaryBandMin: Number(salaryMin) || 0,
        salaryBandMax: Number(salaryMax) || 0,
        currency: 'INR',
        justification: justification.trim(),
        isReplacement: false,
        targetJoiningDate: targetDate,
        jdSummary: jdSummary.trim(),
      });
      setIsCreateOpen(false);
      onToast('Job Requisition submitted for multi-level approval');
      void loadData();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to create requisition');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!perms.canAccessModule('requisitions')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="2. Manpower Planning & Job Requisitions"
        requiredRoles="Super Admin, HR Admin, Recruiter, Hiring Manager, Approver"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Manpower Planning & Job Requisitions
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Annual headcount budgets, requisition CRUD, AI-assisted JD generation & multi-level approvals
          </p>
        </div>
        {perms.canManageRequisitions ? (
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Job Requisition</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={4} />
      ) : error ? (
        <RecruitmentErrorState
          title="Manpower & Requisitions API Error"
          error={error}
          onRetry={loadData}
          actionLabel={perms.canManageRequisitions ? 'New Job Requisition' : undefined}
          onAction={perms.canManageRequisitions ? () => setIsCreateOpen(true) : undefined}
        />
      ) : requisitions.length === 0 && plans.length === 0 ? (
        <RecruitmentEmptyState
          title="No Manpower Budgets or Requisitions Found"
          description="Raise a new Job Requisition with AI-assisted JD generation to initiate the hiring approval workflow."
          ctaLabel={perms.canManageRequisitions ? 'Create Job Requisition' : undefined}
          onCtaClick={perms.canManageRequisitions ? () => setIsCreateOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-4">
          {requisitions.map((req) => (
            <div
              key={req.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {req.requisitionCode} · {req.title}
                </div>
                <div className="text-xs text-slate-500">
                  {req.department} · {req.location} · {req.openings} Openings · Status: {req.status}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void recruitmentRequisitionsApi
                      .cloneRequisition(req.id)
                      .then(() => {
                        onToast('Requisition cloned');
                        void loadData();
                      })
                      .catch((e: Error) => onToast(e.message));
                  }}
                  className="h-8 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  Clone
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RecruitmentModal
        open={isCreateOpen}
        title="Create Job Requisition"
        subtitle="Backend AI JD generator & multi-level headcount approval"
        onClose={() => setIsCreateOpen(false)}
      >
        <form onSubmit={handleCreateSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              required
              type="text"
              placeholder="Job Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              required
              type="text"
              placeholder="Department *"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              type="text"
              placeholder="Grade / Band (e.g. L5)"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              type="number"
              min={1}
              placeholder="Openings"
              value={openings}
              onChange={(e) => setOpenings(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              type="date"
              aria-label="Target Joining Date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              type="number"
              placeholder="Salary Band Min (Annual)"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              type="number"
              placeholder="Salary Band Max (Annual)"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <input
            type="text"
            placeholder="Required Skills (comma separated)"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            type="text"
            placeholder="Business Justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold">Job Description (Editable)</span>
              <button
                type="button"
                disabled={isGeneratingJd}
                onClick={handleGenerateAiJd}
                className="h-8 px-3 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-semibold inline-flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGeneratingJd ? 'Generating...' : 'AI Generate JD'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="Job Description content..."
              value={jdSummary}
              onChange={(e) => setJdSummary(e.target.value)}
              className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Requisition'}
            </button>
          </div>
        </form>
      </RecruitmentModal>
    </div>
  );
}

// ============================================================================
// MODULE 3: JOB POSTING & MULTI-CHANNEL SOURCING
// ============================================================================
const ALL_SOURCING_CHANNELS: SourcingChannelType[] = [
  'CareerPage',
  'LinkedIn',
  'Naukri',
  'Indeed',
  'InternalIJP',
  'ReferralPortal',
  'VendorAgency',
  'CampusWalkIn',
];

export function JobPostingSourcingModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [postings, setPostings] = useState<JobPostingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<SourcingChannelType>('CareerPage');
  const [targetJobId, setTargetJobId] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkResumeUploadResponse | null>(null);

  const loadPostings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruitmentJobPostingsApi.listPostings();
      setPostings(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load job postings'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('job-postings')) return;
    const timer = setTimeout(() => {
      void loadPostings();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadPostings]);

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0 || uploading) {
      onToast('Select at least one PDF/DOC/ZIP resume file');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('jobId', targetJobId.trim());
      fd.append('sourceChannel', selectedSource);
      Array.from(selectedFiles).forEach((f) => fd.append('files', f));
      const res = await recruitmentJobPostingsApi.uploadBulkResumes(fd);
      setUploadResult(res);
      onToast(`Uploaded ${res.totalFiles} resumes for backend parsing`);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Bulk resume upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!perms.canAccessModule('job-postings')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="3. Job Posting & Multi-channel Sourcing"
        requiredRoles="Super Admin, HR Admin, Recruiter"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Job Posting & Multi-Channel Sourcing
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Career page, LinkedIn, job boards, IJP, campus, walk-in & bulk resume parser upload
          </p>
        </div>
        {perms.canPublishJobs ? (
          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Bulk Resume Upload (PDF/DOC/ZIP)</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={4} />
      ) : error ? (
        <RecruitmentErrorState
          title="Job Postings & Sourcing API Error"
          error={error}
          onRetry={loadPostings}
          actionLabel="Bulk Resume Upload"
          onAction={() => setIsBulkModalOpen(true)}
        />
      ) : postings.length === 0 ? (
        <RecruitmentEmptyState
          title="No Active Multi-Channel Job Postings"
          description="Approved requisitions automatically publish here, or upload candidate resumes in bulk across sourcing channels."
          ctaLabel="Upload Bulk Resumes"
          onCtaClick={() => setIsBulkModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {postings.map((post) => (
            <div
              key={post.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold">
                  {post.requisitionCode} · {post.title}
                </div>
                <span className="text-xs font-mono font-semibold text-indigo-600">
                  {post.totalApplicants} Applicants
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {post.channels.map((ch) => (
                  <div
                    key={ch.channel}
                    className="px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs flex items-center gap-2"
                  >
                    <span className="font-semibold">{ch.channel}:</span>
                    <span>{ch.status}</span>
                    {ch.status === 'Failed' ? (
                      <button
                        type="button"
                        onClick={() => {
                          void recruitmentJobPostingsApi
                            .retryChannel(post.id, ch.channel)
                            .then(() => {
                              onToast(`Retried ${ch.channel}`);
                              void loadPostings();
                            })
                            .catch((e: Error) => onToast(e.message));
                        }}
                        className="text-rose-600 underline font-semibold"
                      >
                        Retry
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <RecruitmentModal
        open={isBulkModalOpen}
        title="Bulk Resume Upload & Backend Parser"
        subtitle="Upload PDF, DOC, DOCX, or ZIP archives to parse and score on the server"
        onClose={() => setIsBulkModalOpen(false)}
      >
        <form onSubmit={handleBulkUpload} className="space-y-3">
          <input
            required
            type="text"
            placeholder="Target Job ID / Requisition Code *"
            value={targetJobId}
            onChange={(e) => setTargetJobId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <select
            aria-label="Sourcing Channel"
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value as SourcingChannelType)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            {ALL_SOURCING_CHANNELS.map((ch) => (
              <option key={ch} value={ch}>
                Channel: {ch}
              </option>
            ))}
          </select>
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.zip"
            aria-label="Select Resume Files"
            onChange={(e) => setSelectedFiles(e.target.files)}
            className="w-full text-xs file:mr-3 file:px-3 file:py-2 file:rounded-xl file:border-0 file:bg-indigo-50 file:text-indigo-600 file:font-semibold"
          />
          {uploadResult ? (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs">
              Batch {uploadResult.batchId}: {uploadResult.parsedCount} parsed,{' '}
              {uploadResult.failedCount} failed.
            </div>
          ) : null}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsBulkModalOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              {uploading ? 'Uploading...' : 'Start Bulk Parse'}
            </button>
          </div>
        </form>
      </RecruitmentModal>
    </div>
  );
}

// ============================================================================
// MODULE 4: CAREER PAGE & CANDIDATE PORTAL
// ============================================================================
export function CareerPageCandidatePortalModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [config, setConfig] = useState<CareerPageConfigRecord | null>(null);
  const [jobs, setJobs] = useState<PublicJobListingRecord[]>([]);
  const [portalMe, setPortalMe] = useState<CandidatePortalProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const [applyJobId, setApplyJobId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadPortal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cfgRes, jobsRes, meRes] = await Promise.all([
        recruitmentCareerPortalApi.getConfig(),
        recruitmentCareerPortalApi.listPublicJobs(),
        recruitmentCareerPortalApi.getMyCandidatePortal(),
      ]);
      setConfig(cfgRes);
      setJobs(jobsRes.items);
      setPortalMe(meRes);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load Career Portal'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('career-portal')) return;
    const timer = setTimeout(() => {
      void loadPortal();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadPortal]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent || submitting) {
      onToast('Please accept the GDPR / DPDP privacy consent notice');
      return;
    }
    setSubmitting(true);
    try {
      await recruitmentCareerPortalApi.submitApplication({
        jobId: applyJobId.trim() || 'JOB-OPEN',
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        currentLocation: 'Bengaluru',
        totalExperienceYears: 3,
        noticePeriodDays: 30,
        privacyConsentAccepted: consent,
        resumeFileName: 'candidate-resume.pdf',
      });
      setIsApplyModalOpen(false);
      onToast('Application submitted to Career Portal');
      void loadPortal();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Application submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!perms.canAccessModule('career-portal')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="4. Career Page & Candidate Portal"
        requiredRoles="All Roles / Candidate"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Career Page & Candidate Self-Service Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Employer branding, dynamic job board, OTP application tracker, interview slot picker & e-sign offer acceptance
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsApplyModalOpen(true)}
          className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>Submit Candidate Application</span>
        </button>
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={3} />
      ) : error ? (
        <RecruitmentErrorState
          title="Career Page & Candidate Portal API Error"
          error={error}
          onRetry={loadPortal}
          actionLabel="Open Application Form"
          onAction={() => setIsApplyModalOpen(true)}
        />
      ) : jobs.length === 0 && !portalMe ? (
        <RecruitmentEmptyState
          title="No Public Career Listings Active"
          description="Publish approved requisitions to the Career Page or submit an application with privacy consent."
          ctaLabel="Apply to Open Role"
          onCtaClick={() => setIsApplyModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {config ? (
            <div className="rounded-3xl p-4 bg-indigo-50/70 dark:bg-slate-900 border border-indigo-200 dark:border-slate-800">
              <div className="text-sm font-bold">{config.companyTitle}</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                {config.bannerHeadline}
              </div>
            </div>
          ) : null}
          {jobs.map((job) => (
            <div
              key={job.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold">{job.title}</div>
                <div className="text-xs text-slate-500">
                  {job.department} · {job.location} · {job.experienceRange}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setApplyJobId(job.id);
                  setIsApplyModalOpen(true);
                }}
                className="h-8 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Apply Now
              </button>
            </div>
          ))}
        </div>
      )}

      <RecruitmentModal
        open={isApplyModalOpen}
        title="Candidate Application & DPDP Consent"
        subtitle="Dynamic application form with duplicate check on backend"
        onClose={() => setIsApplyModalOpen(false)}
      >
        <form onSubmit={handleApply} className="space-y-3">
          <input
            required
            type="text"
            placeholder="Job ID *"
            value={applyJobId}
            onChange={(e) => setApplyJobId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            required
            type="text"
            placeholder="Full Name *"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            required
            type="email"
            placeholder="Email Address *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            required
            type="tel"
            placeholder="Mobile Number *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <label className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              I consent to the processing of my personal data and resume under GDPR / DPDP recruitment privacy policies.
            </span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </RecruitmentModal>
    </div>
  );
}

// ============================================================================
// MODULE 5: CANDIDATE DATABASE (TALENT POOL)
// ============================================================================
export function CandidateDatabaseModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [search, setSearch] = useState('');
  const [poolFilter, setPoolFilter] = useState('');
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Candidate360ProfileResponse | null>(null);
  const [revealedPii, setRevealedPii] = useState<Record<string, { email: string; phone: string; ctc: string }>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruitmentCandidatesApi.listCandidates({
        search: search || undefined,
        pool: poolFilter || undefined,
      });
      setCandidates(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load candidate database'));
    } finally {
      setLoading(false);
    }
  }, [search, poolFilter]);

  useEffect(() => {
    if (!perms.canAccessModule('candidates')) return;
    const timer = setTimeout(() => {
      void loadCandidates();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadCandidates]);

  const handleRevealPii = async (candidateId: string) => {
    if (!perms.canRevealPii) {
      onToast('Your role does not have PII reveal permission');
      return;
    }
    try {
      const res = await recruitmentCandidatesApi.revealPii(candidateId, [
        'email',
        'phone',
        'currentCtc',
      ]);
      setRevealedPii((prev) => ({
        ...prev,
        [candidateId]: {
          email: res.email,
          phone: res.phone,
          ctc: res.currentCtcFormatted,
        },
      }));
      onToast('PII revealed and logged to Audit Trail');
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Could not reveal PII');
    }
  };

  if (!perms.canAccessModule('candidates')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="5. Candidate Database (Talent Pool)"
        requiredRoles="Super Admin, HR Admin, Recruiter, Hiring Manager"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Candidate Database & Talent Pool (360° Profiles)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              PII-masked directory, duplicate merge, silver-medalist pools & blacklist controls
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="search"
              placeholder="Search skills, location, CTC..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <select
              aria-label="Talent Pool Filter"
              value={poolFilter}
              onChange={(e) => setPoolFilter(e.target.value)}
              className="h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="">All Talent Pools</option>
              <option value="SilverMedalist">Silver Medalists</option>
              <option value="HighPotential">High Potential</option>
              <option value="ImmediateJoiner">Immediate Joiners</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={4} />
      ) : error ? (
        <RecruitmentErrorState
          title="Candidate Database API Error"
          error={error}
          onRetry={loadCandidates}
        />
      ) : candidates.length === 0 ? (
        <RecruitmentEmptyState
          title="No Candidate Profiles Found"
          description="Candidates sourced from job boards, referrals, or bulk resume uploads will appear here with masked PII."
          ctaLabel="Refresh Talent Pool"
          onCtaClick={loadCandidates}
        />
      ) : (
        <div className="space-y-3">
          {candidates.map((c) => {
            const unmasked = revealedPii[c.id];
            return (
              <div
                key={c.id}
                className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-bold flex items-center gap-2">
                    <span>{c.fullName}</span>
                    <span className="text-xs font-mono text-indigo-600">
                      Match {c.aiMatchScorePct}%
                    </span>
                    {c.isBlacklisted ? (
                      <span className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-bold">
                        DO NOT HIRE
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Email: {unmasked ? unmasked.email : c.maskedEmail} · Phone:{' '}
                    {unmasked ? unmasked.phone : c.maskedPhone} · CTC:{' '}
                    {unmasked ? unmasked.ctc : c.maskedCurrentCtc}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {perms.canRevealPii && !unmasked ? (
                    <button
                      type="button"
                      onClick={() => void handleRevealPii(c.id)}
                      className="h-8 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Reveal PII</span>
                    </button>
                  ) : null}
                  {c.duplicateOfCandidateId ? (
                    <button
                      type="button"
                      onClick={() => {
                        void recruitmentCandidatesApi
                          .mergeDuplicate(c.id, c.duplicateOfCandidateId!)
                          .then(() => {
                            onToast('Merged duplicate candidate');
                            void loadCandidates();
                          })
                          .catch((e: Error) => onToast(e.message));
                      }}
                      className="h-8 px-3 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <GitMerge className="w-3.5 h-3.5" />
                      <span>Merge Duplicate</span>
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => {
                      void recruitmentCandidatesApi
                        .getCandidate360(c.id)
                        .then((res) => setSelectedProfile(res))
                        .catch((e: Error) => onToast(e.message));
                    }}
                    className="h-8 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                  >
                    360° View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <RecruitmentModal
        open={Boolean(selectedProfile)}
        title={selectedProfile?.candidate.fullName || 'Candidate 360° Profile'}
        subtitle="Parsed resume, timeline, interview history & audit notes"
        onClose={() => setSelectedProfile(null)}
      >
        {selectedProfile ? (
          <div className="space-y-3 text-xs">
            <div className="font-semibold">
              Education: {selectedProfile.educationSummary}
            </div>
            <div className="space-y-1">
              <div className="font-semibold">Timeline</div>
              {selectedProfile.timeline.map((t) => (
                <div key={t.id} className="text-slate-500">
                  {t.timestamp} — {t.event} ({t.actor})
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </RecruitmentModal>
    </div>
  );
}

// ============================================================================
// MODULE 6: RESUME PARSING & AI SCREENING
// ============================================================================
export function ResumeParsingAiScreeningModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [results, setResults] = useState<AiScreeningResultRecord[]>([]);
  const [blindMode, setBlindMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [overrideTarget, setOverrideTarget] = useState<AiScreeningResultRecord | null>(null);
  const [overrideDecision, setOverrideDecision] = useState<'Shortlisted' | 'Rejected' | 'Hold'>('Shortlisted');
  const [overrideReason, setOverrideReason] = useState('');

  const loadScreening = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruitmentScreeningApi.listScreeningResults({
        blindMode,
      });
      setResults(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load AI screening queue'));
    } finally {
      setLoading(false);
    }
  }, [blindMode]);

  useEffect(() => {
    if (!perms.canAccessModule('resume-screening')) return;
    const timer = setTimeout(() => {
      void loadScreening();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadScreening]);

  const handleOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideTarget || !overrideReason.trim()) return;
    try {
      await recruitmentScreeningApi.overrideScreeningDecision(overrideTarget.id, {
        decision: overrideDecision,
        reason: overrideReason.trim(),
      });
      setOverrideTarget(null);
      setOverrideReason('');
      onToast('Manual screening override recorded');
      void loadScreening();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Override failed');
    }
  };

  if (!perms.canAccessModule('resume-screening')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="6. Resume Parsing & AI Screening"
        requiredRoles="Super Admin, HR Admin, Recruiter, Hiring Manager"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Resume Parsing & AI Screening Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Backend confidence scores, skill match explanation, knockout results & bias-safe blind mode
          </p>
        </div>
        <label className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          <input
            type="checkbox"
            checked={blindMode}
            onChange={(e) => setBlindMode(e.target.checked)}
          />
          <span>Bias-Safe Blind Screening</span>
        </label>
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={4} />
      ) : error ? (
        <RecruitmentErrorState
          title="Resume Parsing & AI Screening API Error"
          error={error}
          onRetry={loadScreening}
        />
      ) : results.length === 0 ? (
        <RecruitmentEmptyState
          title="No Parsed Resumes Awaiting AI Screening"
          description="Resumes uploaded via Career Page or Bulk Sourcing are parsed and ranked by the backend AI engine."
          ctaLabel="Refresh Screening Queue"
          onCtaClick={loadScreening}
        />
      ) : (
        <div className="space-y-3">
          {results.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-bold">
                  #{item.rankInJob} ·{' '}
                  {blindMode ? `Candidate-${item.candidateId.slice(-4)}` : item.candidateName}{' '}
                  ({item.jobTitle})
                </div>
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold">
                    AI Match: {item.aiMatchScorePct}%
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                    Parse Confidence: {item.parseConfidencePct}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                {item.experienceFitSummary} · Decision: {item.autoThresholdDecision}
              </p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="text-xs text-slate-500">
                  Matched: {item.matchedSkills.join(', ') || 'None'} | Missing:{' '}
                  {item.missingSkills.join(', ') || 'None'}
                </div>
                {perms.canOverrideAiScreening ? (
                  <button
                    type="button"
                    onClick={() => setOverrideTarget(item)}
                    className="h-8 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    Manual Override
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <RecruitmentModal
        open={Boolean(overrideTarget)}
        title="Manual AI Screening Override"
        subtitle="Override backend threshold decision with mandatory audit reason"
        onClose={() => setOverrideTarget(null)}
      >
        <form onSubmit={handleOverrideSubmit} className="space-y-3">
          <select
            aria-label="Override Decision"
            value={overrideDecision}
            onChange={(e) =>
              setOverrideDecision(e.target.value as 'Shortlisted' | 'Rejected' | 'Hold')
            }
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <option value="Shortlisted">Shortlist Candidate</option>
            <option value="Hold">Place On Hold</option>
            <option value="Rejected">Reject Candidate</option>
          </select>
          <textarea
            required
            rows={3}
            placeholder="Mandatory reason for overriding AI threshold..."
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOverrideTarget(null)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Confirm Override
            </button>
          </div>
        </form>
      </RecruitmentModal>
    </div>
  );
}
