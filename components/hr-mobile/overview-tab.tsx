'use client';

import React, { useState } from 'react';
import {
  HrDashboardDataState,
  ApprovalCategory,
  ApprovalItem,
  BottomNavTab,
  HomeInternalTab,
  calculateAttendancePercentages,
  filterApprovals,
} from '@/lib/hr-dashboard-logic';
import {
  useDecideApprovalMutation,
  useTriggerPayrollRunMutation,
} from '@/lib/store/hr-api';
import {
  Users,
  UserCheck,
  Clock,
  Briefcase,
  Wallet,
  UserPlus,
  Megaphone,
  Play,
  CheckCircle2,
  CalendarPlus,
  Check,
  X,
  ChevronRight,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';

interface OverviewTabProps {
  data: HrDashboardDataState;
  canEdit: boolean;
  onNavigateBottomTab: (tab: BottomNavTab) => void;
  onNavigateHomeTab: (tab: HomeInternalTab) => void;
  onOpenAddEmployee: () => void;
  onOpenAnnouncement: () => void;
  onSuccessToast: (msg: string) => void;
}

export function OverviewTab({
  data,
  canEdit,
  onNavigateBottomTab,
  onNavigateHomeTab,
  onOpenAddEmployee,
  onOpenAnnouncement,
  onSuccessToast,
}: OverviewTabProps) {
  const [approvalCategory, setApprovalCategory] = useState<
    ApprovalCategory | 'All'
  >('All');
  const [confirmingDecision, setConfirmingDecision] = useState<{
    item: ApprovalItem;
    decision: 'Approved' | 'Rejected';
  } | null>(null);
  const [viewingApprovalDetail, setViewingApprovalDetail] =
    useState<ApprovalItem | null>(null);

  const [analyticsRange, setAnalyticsRange] = useState<
    '7D' | '30D' | '6M' | '12M'
  >('6M');
  const [activeChartMetric, setActiveChartMetric] = useState<
    'workforce' | 'attendance' | 'payroll' | 'recruitment'
  >('workforce');
  const [selectedPointIndex, setSelectedPointIndex] = useState<number>(5);

  const [decideApproval, { isLoading: isDeciding }] =
    useDecideApprovalMutation();
  const [triggerPayroll, { isLoading: isRunningPayroll }] =
    useTriggerPayrollRunMutation();

  const attendanceMetrics = calculateAttendancePercentages(data.kpis.attendance);
  const filteredPendingApprovals = filterApprovals(
    data.approvals,
    approvalCategory,
    'Pending'
  );

  const handleConfirmApproval = async () => {
    if (!confirmingDecision || !canEdit) return;
    try {
      const res = await decideApproval({
        id: confirmingDecision.item.id,
        status: confirmingDecision.decision,
      }).unwrap();
      onSuccessToast(res.message);
      setConfirmingDecision(null);
    } catch {
      onSuccessToast('Action could not be completed.');
    }
  };

  const handleQuickRunPayroll = async () => {
    if (!canEdit) return;
    try {
      const res = await triggerPayroll().unwrap();
      onSuccessToast(res.message);
    } catch {
      onSuccessToast('Unable to trigger payroll run.');
    }
  };

  const series = data.analytics[analyticsRange] || data.analytics['6M'];
  const activePoint =
    series[Math.min(selectedPointIndex, series.length - 1)] || series[0];

  // SVG Donut math (radius = 38, circumference = 238.76)
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const presentDash = (attendanceMetrics.presentPct / 100) * circumference;
  const lateDash = (attendanceMetrics.latePct / 100) * circumference;
  const leaveDash = (attendanceMetrics.onLeavePct / 100) * circumference;

  return (
    <div className="space-y-6" data-testid="hr-overview-tab">
      {/* A. 5 TAPPABLE KPI CARDS (Horizontal Swipeable Carousel on Mobile, Structured Grid on Desktop) */}
      <section aria-label="Key Performance Indicators">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Workforce &amp; Operations Pulse
          </h2>
          <span className="text-xs font-mono text-slate-400 dark:text-slate-500 tabular-nums">
            Tap card to open module
          </span>
        </div>

        <div className="flex lg:grid lg:grid-cols-5 gap-3 overflow-x-auto no-scrollbar pb-1 snap-x snap-mandatory">
          {/* KPI 1: Total Active Workforce */}
          <button
            type="button"
            onClick={() => onNavigateBottomTab('workforce')}
            data-testid="kpi-card-workforce"
            className="min-w-[235px] lg:min-w-0 snap-start text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-indigo-500/60 transition-all flex flex-col justify-between gap-3 cursor-pointer shrink-0"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Active Workforce
              </span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {data.kpis.workforce.totalActive}
                </span>
                <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums inline-flex items-center">
                  +{data.kpis.workforce.growthPercentage}%
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                {data.kpis.workforce.monthlyComparisonText}
              </p>
            </div>
          </button>

          {/* KPI 2: Today's Attendance Rate */}
          <button
            type="button"
            onClick={() => onNavigateBottomTab('attendance')}
            data-testid="kpi-card-attendance"
            className="min-w-[235px] lg:min-w-0 snap-start text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-indigo-500/60 transition-all flex flex-col justify-between gap-3 cursor-pointer shrink-0"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Today&apos;s Attendance
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {data.kpis.attendance.ratePercentage}%
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tabular-nums">
                  {data.kpis.attendance.present} Present
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums truncate">
                {data.kpis.attendance.late} Late · {data.kpis.attendance.onLeave} Leave ·{' '}
                {data.kpis.attendance.absent} Absent
              </p>
            </div>
          </button>

          {/* KPI 3: Pending Approvals Queue */}
          <button
            type="button"
            onClick={() => onNavigateBottomTab('approvals')}
            data-testid="kpi-card-approvals"
            className="min-w-[235px] lg:min-w-0 snap-start text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-indigo-500/60 transition-all flex flex-col justify-between gap-3 cursor-pointer shrink-0"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Pending Approvals
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span
                  data-testid="kpi-pending-approvals-value"
                  className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white"
                >
                  {data.kpis.approvals.totalPending}
                </span>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  Action required
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums truncate">
                {data.kpis.approvals.leaveRequests} Leave ·{' '}
                {data.kpis.approvals.attendanceRegularizations} Att ·{' '}
                {data.kpis.approvals.expenseClaims} Exp
              </p>
            </div>
          </button>

          {/* KPI 4: Open Requisitions / Active Hiring */}
          <button
            type="button"
            onClick={() => onNavigateBottomTab('more')}
            data-testid="kpi-card-recruitment"
            className="min-w-[235px] lg:min-w-0 snap-start text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-indigo-500/60 transition-all flex flex-col justify-between gap-3 cursor-pointer shrink-0"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Active Hiring
              </span>
              <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {data.kpis.recruitment.openPositions}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  Openings
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums truncate">
                {data.kpis.recruitment.candidatesInPipeline} Pipeline ·{' '}
                {data.kpis.recruitment.activeRequisitionsCount} Roles
              </p>
            </div>
          </button>

          {/* KPI 5: Payroll Status */}
          <button
            type="button"
            onClick={() => onNavigateBottomTab('more')}
            data-testid="kpi-card-payroll"
            className="min-w-[235px] lg:min-w-0 snap-start text-left rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-indigo-500/60 transition-all flex flex-col justify-between gap-3 cursor-pointer shrink-0"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Payroll Status
              </span>
              <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-white truncate">
                  {data.kpis.payroll.netPayableFormatted}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                {data.kpis.payroll.status} · Payout {data.kpis.payroll.nextPayoutDate}
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* B. HORIZONTAL SCROLLABLE QUICK ACTIONS */}
      <section aria-label="Quick Actions">
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Quick Actions
          </h2>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
          <button
            type="button"
            onClick={onOpenAddEmployee}
            data-testid="quick-action-add-employee"
            className="min-h-[46px] px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 text-xs font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-2 shrink-0 shadow-2xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Add Employee</span>
          </button>

          <button
            type="button"
            onClick={onOpenAnnouncement}
            data-testid="quick-action-post-announcement"
            className="min-h-[46px] px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 text-xs font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-2 shrink-0 shadow-2xs transition-all cursor-pointer"
          >
            <Megaphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Post Announcement</span>
          </button>

          <button
            type="button"
            disabled={isRunningPayroll || !canEdit}
            onClick={handleQuickRunPayroll}
            data-testid="quick-action-run-payroll"
            className="min-h-[46px] px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 text-xs font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-2 shrink-0 shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Play className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{isRunningPayroll ? 'Running...' : 'Run Payroll'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateBottomTab('approvals')}
            data-testid="quick-action-approve-leaves"
            className="min-h-[46px] px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 text-xs font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-2 shrink-0 shadow-2xs transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Approve Leaves</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateHomeTab('shifts')}
            data-testid="quick-action-create-shift"
            className="min-h-[46px] px-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 text-xs font-semibold text-slate-800 dark:text-slate-100 inline-flex items-center gap-2 shrink-0 shadow-2xs transition-all cursor-pointer"
          >
            <CalendarPlus className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span>Create Shift</span>
          </button>
        </div>
      </section>

      {/* MAIN TWO-COLUMN MOBILE-FIRST GRID (Stacks on Phone, 12-Col on Tablet/Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): C. Pending Approvals + F. Recent Announcements + G. Upcoming Joiners & Exits */}
        <div className="lg:col-span-7 space-y-6">
          {/* C. PENDING APPROVALS */}
          <section
            aria-label="Pending Approvals"
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Pending Approvals Queue
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Leave requests, attendance regularizations, and expense claims
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateBottomTab('approvals')}
                className="min-h-[38px] px-3 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 inline-flex items-center gap-1 cursor-pointer"
              >
                View All ({data.kpis.approvals.totalPending})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Category Segmented Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {(
                [
                  'All',
                  'Leave Requests',
                  'Attendance Regularizations',
                  'Expense Claims',
                ] as const
              ).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setApprovalCategory(cat)}
                  className={`min-h-[36px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    approvalCategory === cat
                      ? 'bg-slate-900 text-white dark:bg-indigo-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Approval Items List */}
            {filteredPendingApprovals.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
                All pending approvals in this category have been processed.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPendingApprovals.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    data-testid={`approval-row-${item.id}`}
                    className="py-3.5 first:pt-1 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {item.avatarInitials}
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                            {item.employeeId}
                          </span>
                          <span>·</span>
                          <span>{item.department}</span>
                          <span>·</span>
                          <span>{item.category}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {item.employeeName}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-mono tabular-nums">
                          {item.requestType} · {item.durationOrAmount} ·{' '}
                          {item.requestDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setViewingApprovalDetail(item)}
                        className="min-h-[38px] px-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        Details
                      </button>
                      {canEdit && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmingDecision({
                                item,
                                decision: 'Approved',
                              })
                            }
                            aria-label={`Approve ${item.employeeName}`}
                            data-testid={`approve-btn-${item.id}`}
                            className="min-h-[38px] px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmingDecision({
                                item,
                                decision: 'Rejected',
                              })
                            }
                            aria-label={`Reject ${item.employeeName}`}
                            data-testid={`reject-btn-${item.id}`}
                            className="min-h-[38px] px-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* F. RECENT ANNOUNCEMENTS */}
          <section
            aria-label="Recent Announcements"
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Recent Company Announcements
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Organization-wide broadcasts and policy notices
                </p>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={onOpenAnnouncement}
                  data-testid="overview-create-announcement-btn"
                  className="min-h-[38px] px-3.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Megaphone className="w-3.5 h-3.5" />
                  Create Announcement
                </button>
              )}
            </div>

            {data.announcements.length === 0 ? (
              <div className="py-8 px-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-1.5">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No active announcements</p>
                <p className="text-[11px] text-slate-400">All company broadcasts and notices will be displayed here.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.announcements.map((ann) => (
                  <div
                    key={ann.id}
                    data-testid={`announcement-item-${ann.id}`}
                    className="py-3.5 first:pt-1 last:pb-0 space-y-1"
                  >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-semibold ${
                          ann.priority === 'Urgent'
                            ? 'text-rose-600 dark:text-rose-400'
                            : ann.priority === 'High'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-indigo-600 dark:text-indigo-400'
                        }`}
                      >
                        {ann.priority} Priority
                      </span>
                      <span>·</span>
                      <span>{ann.department}</span>
                      <span>·</span>
                      <span>{ann.category}</span>
                    </div>
                    <span className="font-mono tabular-nums">
                      {ann.publishedDate}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {ann.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {ann.description}
                  </p>
                </div>
              ))}
            </div>
            )}
          </section>

          {/* G. UPCOMING JOINERS & EXITS */}
          <section
            aria-label="Upcoming Joiners and Exits"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {/* Upcoming Joiners */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Upcoming Joiners ({data.joiners.length})
                </h3>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  Onboarding
                </span>
              </div>

              {data.joiners.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No upcoming joiners scheduled.</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.joiners.map((joiner) => (
                    <div key={joiner.id} className="py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {joiner.name}
                        </span>
                        <span className="font-mono text-indigo-600 dark:text-indigo-400 tabular-nums">
                          {joiner.joiningDate}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {joiner.designation} · {joiner.department}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Status: {joiner.onboardingStatus}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Exits */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Upcoming Exits ({data.exits.length})
                </h3>
                <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                  Offboarding
                </span>
              </div>

              {data.exits.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">No upcoming exits scheduled.</p>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {data.exits.map((exit) => (
                    <div key={exit.id} className="py-2.5 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {exit.name}
                        </span>
                        <span className="font-mono text-rose-600 dark:text-rose-400 tabular-nums">
                          LWD {exit.lastWorkingDay}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {exit.designation} · {exit.department}
                      </p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Exit Status: {exit.exitStatus}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column (5 cols): D. Attendance Snapshot + E. Department Snapshot + Section 10: Mobile Analytics */}
        <div className="lg:col-span-5 space-y-6">
          {/* D. ATTENDANCE SNAPSHOT (Compact Donut Chart + Percentage Indicators) */}
          <section
            aria-label="Attendance Snapshot"
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Attendance Snapshot
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time check-in telemetry across all shifts
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateBottomTab('attendance')}
                className="min-h-[38px] px-3 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 inline-flex items-center gap-1 cursor-pointer"
              >
                View All
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-5">
              {/* Compact SVG Donut Chart */}
              <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full -rotate-90"
                  aria-label="Attendance Donut Chart"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-100 dark:text-slate-800"
                  />
                  {/* Present segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="10"
                    strokeDasharray={`${presentDash} ${circumference}`}
                    strokeLinecap="round"
                  />
                  {/* Late segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#F59E0B"
                    strokeWidth="10"
                    strokeDasharray={`${lateDash} ${circumference}`}
                    strokeDashoffset={-presentDash}
                  />
                  {/* On Leave segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#6366F1"
                    strokeWidth="10"
                    strokeDasharray={`${leaveDash} ${circumference}`}
                    strokeDashoffset={-(presentDash + lateDash)}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                    {attendanceMetrics.effectivePresentPct}%
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Active
                  </span>
                </div>
              </div>

              {/* 4 Attendance Breakdown Rows */}
              <div className="grid grid-cols-2 gap-2.5 flex-1 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block">
                    Present
                  </span>
                  <span className="text-sm font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                    {data.kpis.attendance.present} ({attendanceMetrics.presentPct}%)
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block">
                    Late In
                  </span>
                  <span className="text-sm font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                    {data.kpis.attendance.late} ({attendanceMetrics.latePct}%)
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block">
                    On Leave
                  </span>
                  <span className="text-sm font-bold font-mono tabular-nums text-indigo-600 dark:text-indigo-400">
                    {data.kpis.attendance.onLeave} ({attendanceMetrics.onLeavePct}%)
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400 block">
                    Absent
                  </span>
                  <span className="text-sm font-bold font-mono tabular-nums text-rose-600 dark:text-rose-400">
                    {data.kpis.attendance.absent} ({attendanceMetrics.absentPct}%)
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* E. DEPARTMENT SNAPSHOT */}
          <section
            aria-label="Department Snapshot"
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Department Snapshot
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Headcount &amp; daily attendance across 6 units
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {data.departments.map((dept) => (
                <div
                  key={dept.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {dept.department}
                    </span>
                    <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 tabular-nums">
                      {dept.attendancePercentage}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full"
                      style={{ width: `${dept.attendancePercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    <span>Total: {dept.totalEmployees}</span>
                    <span>
                      Present: {dept.presentCount} · Leave: {dept.onLeaveCount} ·
                      Absent: {dept.absentCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 10: INTERACTIVE MOBILE ANALYTICS */}
          <section
            aria-label="Mobile Analytics"
            data-testid="mobile-analytics-section"
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Workforce &amp; Payroll Analytics
                </h3>
              </div>

              {/* Date Range Selector */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                {(['7D', '30D', '6M', '12M'] as const).map((rng) => (
                  <button
                    key={rng}
                    type="button"
                    onClick={() => {
                      setAnalyticsRange(rng);
                      setSelectedPointIndex(0);
                    }}
                    className={`min-h-[30px] px-2.5 rounded-lg text-[11px] font-mono font-semibold transition-colors cursor-pointer ${
                      analyticsRange === rng
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {rng}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Metric Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(
                [
                  { id: 'workforce', label: 'Workforce Growth' },
                  { id: 'attendance', label: 'Attendance Trends' },
                  { id: 'payroll', label: 'Payroll Cost' },
                  { id: 'recruitment', label: 'Hiring Velocity' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveChartMetric(tab.id)}
                  className={`min-h-[34px] px-3 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    activeChartMetric === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Interactive Touch Tooltip Banner */}
            {activePoint && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono tabular-nums">
                <span className="font-bold text-slate-900 dark:text-white">
                  Period: {activePoint.label}
                </span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  {activeChartMetric === 'workforce' &&
                    `${activePoint.headcount} Staff (+${activePoint.hires} hires)`}
                  {activeChartMetric === 'attendance' &&
                    `${activePoint.attendanceRate}% Attendance`}
                  {activeChartMetric === 'payroll' &&
                    `$${activePoint.payrollCostK}K Disbursed`}
                  {activeChartMetric === 'recruitment' &&
                    `${activePoint.hires} Joined · ${activePoint.attrition} Exits`}
                </span>
              </div>
            )}

            {/* Interactive Bar Chart Visualization */}
            <div className="grid grid-cols-6 gap-2 items-end h-36 pt-4 px-1">
              {series.map((pt, idx) => {
                const rawVal =
                  activeChartMetric === 'workforce'
                    ? pt.headcount
                    : activeChartMetric === 'attendance'
                    ? pt.attendanceRate
                    : activeChartMetric === 'payroll'
                    ? pt.payrollCostK
                    : pt.hires;
                const maxVal = Math.max(
                  ...series.map((s) =>
                    activeChartMetric === 'workforce'
                      ? s.headcount
                      : activeChartMetric === 'attendance'
                      ? s.attendanceRate
                      : activeChartMetric === 'payroll'
                      ? s.payrollCostK
                      : s.hires
                  ),
                  1
                );
                const heightPct = Math.max(
                  22,
                  Math.round((rawVal / maxVal) * 100)
                );
                const isSelected = idx === selectedPointIndex;

                return (
                  <button
                    key={pt.label}
                    type="button"
                    onClick={() => setSelectedPointIndex(idx)}
                    className="h-full flex flex-col items-center justify-end gap-1.5 group cursor-pointer"
                  >
                    <span className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {rawVal}
                    </span>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-t-xl h-24 flex items-end overflow-hidden">
                      <div
                        className={`w-full rounded-t-xl transition-all ${
                          isSelected
                            ? 'bg-indigo-600 dark:bg-indigo-500'
                            : 'bg-indigo-300 dark:bg-indigo-900/70 group-hover:bg-indigo-400'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono font-medium text-slate-600 dark:text-slate-400">
                      {pt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Confirmation Dialog for Approval / Rejection */}
      {confirmingDecision && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          data-testid="approval-confirm-dialog"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Confirm {confirmingDecision.decision}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to mark{' '}
              <span className="font-semibold text-slate-900 dark:text-white">
                {confirmingDecision.item.employeeName}&apos;s
              </span>{' '}
              {confirmingDecision.item.requestType} (
              {confirmingDecision.item.durationOrAmount}) as{' '}
              <span className="font-semibold">
                {confirmingDecision.decision}
              </span>
              ?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmingDecision(null)}
                className="min-h-[42px] px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeciding}
                onClick={handleConfirmApproval}
                data-testid="confirm-approval-submit"
                className={`min-h-[42px] px-4 rounded-xl text-white text-xs font-semibold cursor-pointer ${
                  confirmingDecision.decision === 'Approved'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {isDeciding
                  ? 'Updating...'
                  : `Confirm ${confirmingDecision.decision}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Approval Details Modal */}
      {viewingApprovalDetail && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-xs p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                {viewingApprovalDetail.id} · {viewingApprovalDetail.category}
              </span>
              <button
                type="button"
                onClick={() => setViewingApprovalDetail(null)}
                aria-label="Close approval details"
                className="min-w-[38px] min-h-[38px] rounded-xl flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {viewingApprovalDetail.employeeName} (
                {viewingApprovalDetail.employeeId})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {viewingApprovalDetail.department} ·{' '}
                {viewingApprovalDetail.requestType}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
              <p className="font-mono text-slate-700 dark:text-slate-200">
                Date / Window: {viewingApprovalDetail.requestDate} (
                {viewingApprovalDetail.durationOrAmount})
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                Reason: {viewingApprovalDetail.reason}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
