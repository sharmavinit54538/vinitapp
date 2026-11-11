'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  BookOpen,
  Check,
  ExternalLink,
  Laptop,
  Mail,
  MessageSquare,
  Phone,
  Send,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  employeeAssetsRequestsApi,
  employeeCompanyFeedApi,
  employeeLearningApi,
  employeePerformanceApi,
  employeeTasksApi,
  employeeTeamOrgApi,
  formatEmployeeDateOnly,
} from '../../services/employee-dashboard';
import {
  ConfirmActionDialog,
  useWidgetResource,
  WidgetCard,
} from './EmployeeDashboardPrimitives';

// ============================================================================
// 7. MY TASKS & PENDING ACTIONS WIDGET
// ============================================================================
export function MyTasksPendingActionsWidget({ isDark }: { isDark: boolean }) {
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [completingId, setCompletingId] = useState<string | null>(null);

  const {
    data,
    loading,
    error,
    permissionDenied,
    notApplicable,
    asOf,
    refresh,
  } = useWidgetResource(
    (signal) =>
      employeeTasksApi.getTasks(categoryFilter || undefined, { signal }),
    [categoryFilter]
  );

  const handleCompleteInline = async (taskId: string) => {
    if (completingId) return;
    setCompletingId(taskId);
    try {
      await employeeTasksApi.completeTask(taskId);
      toast.success('Task marked complete');
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Unable to mark task complete'
      );
    } finally {
      setCompletingId(null);
    }
  };

  return (
    <WidgetCard
      id="tasks"
      title="My Tasks & Pending Actions"
      subtitle="Unified queue for policy acknowledgements, onboarding, goals, training & documents"
      asOf={asOf}
      loading={loading}
      error={error}
      permissionDenied={permissionDenied}
      notApplicable={notApplicable}
      isEmpty={!data || data.items.length === 0}
      emptyTitle="All caught up!"
      emptyMessage="You have no pending action items or overdue tasks right now."
      onRefresh={refresh}
      isDark={isDark}
      headerAction={
        <select
          aria-label="Filter tasks by category"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-transparent px-2 text-xs dark:border-slate-700"
        >
          <option value="" className="text-slate-900">
            All Categories
          </option>
          {[
            'policy',
            'document',
            'onboarding',
            'goal',
            'training',
            'survey',
            'feedback',
            'asset',
            'profile',
          ].map((cat) => (
            <option key={cat} value={cat} className="text-slate-900">
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
      }
    >
      {data && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="font-mono font-semibold text-slate-800 tabular-nums dark:text-slate-200">
              {data.totalOpenCount} Open
            </span>
            <span>·</span>
            <span className="font-mono font-semibold text-rose-600 tabular-nums">
              {data.overdueCount} Overdue
            </span>
          </div>

          <div className="divide-y divide-slate-200/70 rounded-xl border border-slate-200/80 dark:divide-slate-800 dark:border-slate-800">
            {data.items.map((task) => (
              <div
                key={task.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3.5 text-xs"
              >
                <div>
                  <p className="font-semibold">{task.title}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {task.sourceModule} · Due{' '}
                    <span className="font-mono tabular-nums">
                      {formatEmployeeDateOnly(task.dueDateOnly)}
                    </span>{' '}
                    · Priority: {task.priority}
                    {task.isOverdue ? ' · Overdue' : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={task.deepLinkPath}
                    className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Open
                  </Link>
                  {task.canCompleteInline && !task.completed && (
                    <button
                      type="button"
                      disabled={completingId === task.id}
                      onClick={() => handleCompleteInline(task.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Check className="h-3 w-3" />
                      {completingId === task.id ? 'Saving...' : 'Complete'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetCard>
  );
}

// ============================================================================
// 8. MY PERFORMANCE WIDGET
// ============================================================================
export function MyPerformanceWidget({ isDark }: { isDark: boolean }) {
  const {
    data,
    loading,
    error,
    permissionDenied,
    notApplicable,
    asOf,
    refresh,
  } = useWidgetResource((signal) =>
    employeePerformanceApi.getPerformance({ signal })
  );

  const [updatingGoalId, setUpdatingGoalId] = useState<string | null>(null);
  const [draftPct, setDraftPct] = useState<Record<string, number>>({});

  const handleSaveGoalProgress = async (goalId: string, currentPct: number) => {
    const nextPct = draftPct[goalId] ?? currentPct;
    setUpdatingGoalId(goalId);
    try {
      await employeePerformanceApi.updateGoalProgress(goalId, nextPct);
      toast.success('Goal progress updated');
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update goal progress'
      );
    } finally {
      setUpdatingGoalId(null);
    }
  };

  return (
    <WidgetCard
      id="performance"
      title="My Performance & OKRs"
      subtitle="Active goals, review cycle stage, 1:1 check-ins, and peer recognition"
      asOf={asOf}
      loading={loading}
      error={error}
      permissionDenied={permissionDenied}
      notApplicable={notApplicable}
      isEmpty={!data}
      emptyTitle="No active performance cycle"
      emptyMessage="Your OKRs and appraisal cycle details will appear here once published."
      onRefresh={refresh}
      isDark={isDark}
    >
      {data && (
        <div className="space-y-4 text-xs">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800">
              <p className="text-slate-500">Current Review Cycle</p>
              <p className="mt-1 font-bold">{data.reviewCycle.cycleName}</p>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Stage: {data.reviewCycle.currentStage} · Self-Review:{' '}
                {data.reviewCycle.selfReviewStatus} · Due{' '}
                <span className="font-mono">
                  {formatEmployeeDateOnly(data.reviewCycle.deadlineDateOnly)}
                </span>
              </p>
            </div>

            {data.upcomingOneOnOne && (
              <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800">
                <p className="text-slate-500">Upcoming 1:1 Check-In</p>
                <p className="mt-1 font-bold">
                  With {data.upcomingOneOnOne.managerName}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {data.upcomingOneOnOne.scheduledDisplay} ·{' '}
                  {data.upcomingOneOnOne.agendaSummary}
                </p>
              </div>
            )}
          </div>

          {/* OKRs */}
          <div className="space-y-2.5">
            <h3 className="font-bold">My Goals &amp; OKRs</h3>
            {data.goals.map((goal) => {
              const pct = draftPct[goal.id] ?? goal.progressPct;
              return (
                <div
                  key={goal.id}
                  className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{goal.title}</p>
                      <p className="text-[11px] text-slate-500">
                        Target: {goal.metricTarget} · Status: {goal.status} ·
                        Due {formatEmployeeDateOnly(goal.dueDateOnly)}
                      </p>
                    </div>
                    <span className="font-mono text-sm font-bold text-indigo-600 tabular-nums dark:text-indigo-400">
                      {pct}%
                    </span>
                  </div>

                  {goal.canUpdateProgressInline && (
                    <div className="mt-2.5 flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        aria-label={`Progress for ${goal.title}`}
                        value={pct}
                        onChange={(e) =>
                          setDraftPct((prev) => ({
                            ...prev,
                            [goal.id]: Number(e.target.value),
                          }))
                        }
                        className="flex-1"
                      />
                      <button
                        type="button"
                        disabled={updatingGoalId === goal.id}
                        onClick={() =>
                          handleSaveGoalProgress(goal.id, goal.progressPct)
                        }
                        className="rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {updatingGoalId === goal.id ? 'Saving...' : 'Update'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {data.recognitions.length > 0 && (
            <div className="border-t border-slate-200/70 pt-3 dark:border-slate-800">
              <p className="font-semibold">Recent Recognition &amp; Badges</p>
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {data.recognitions.map((rec) => (
                  <div
                    key={rec.id}
                    className="rounded-xl border border-slate-200/70 p-2.5 dark:border-slate-800"
                  >
                    <p className="font-semibold">{rec.badgeTitle}</p>
                    <p className="text-[11px] text-slate-500">
                      By {rec.awardedBy} · {rec.citation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  );
}

// ============================================================================
// 9. MY ASSETS & UNIFIED REQUESTS TRACKER WIDGET
// ============================================================================
export function MyAssetsAndRequestsWidget({ isDark }: { isDark: boolean }) {
  const [requestTypeFilter, setRequestTypeFilter] = useState<string>('');
  const [acknowledgingId, setAcknowledgingId] = useState<string | null>(null);
  const [returnAssetTarget, setReturnAssetTarget] = useState<string | null>(
    null
  );
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const {
    data,
    loading,
    error,
    permissionDenied,
    notApplicable,
    asOf,
    refresh,
  } = useWidgetResource(
    (signal) =>
      employeeAssetsRequestsApi.getAssetsAndRequests(
        { requestType: requestTypeFilter || undefined },
        { signal }
      ),
    [requestTypeFilter]
  );

  const handleAcknowledgeAsset = async (assetId: string) => {
    setAcknowledgingId(assetId);
    try {
      await employeeAssetsRequestsApi.acknowledgeAsset(assetId);
      toast.success('Asset custody acknowledged');
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to acknowledge asset'
      );
    } finally {
      setAcknowledgingId(null);
    }
  };

  const handleConfirmAssetReturn = async (reason: string) => {
    if (!returnAssetTarget) return;
    setSubmittingReturn(true);
    try {
      await employeeAssetsRequestsApi.requestAssetReturn(
        returnAssetTarget,
        reason
      );
      toast.success('Asset return request submitted');
      setReturnAssetTarget(null);
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to request asset return'
      );
    } finally {
      setSubmittingReturn(false);
    }
  };

  return (
    <WidgetCard
      id="assets-requests"
      title="My Assets & Unified Requests Tracker"
      subtitle="Assigned IT/hardware custody and cross-module request SLA tracker"
      asOf={asOf}
      loading={loading}
      error={error}
      permissionDenied={permissionDenied}
      notApplicable={notApplicable}
      isEmpty={
        !data ||
        (data.assignedAssets.length === 0 && data.requests.length === 0)
      }
      emptyTitle="No assigned assets or open requests"
      emptyMessage="You have no allocated assets or active service requests."
      onRefresh={refresh}
      isDark={isDark}
      headerAction={
        <select
          aria-label="Filter unified requests by type"
          value={requestTypeFilter}
          onChange={(e) => setRequestTypeFilter(e.target.value)}
          className="h-8 rounded-lg border border-slate-200 bg-transparent px-2 text-xs dark:border-slate-700"
        >
          <option value="" className="text-slate-900">
            All Request Types
          </option>
          {[
            'Leave',
            'Regularization',
            'Asset',
            'Expense',
            'Travel',
            'Ticket',
            'Profile Change',
          ].map((t) => (
            <option key={t} value={t} className="text-slate-900">
              {t}
            </option>
          ))}
        </select>
      }
    >
      {data && (
        <div className="space-y-4 text-xs">
          {/* Assigned Assets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">
                Assigned Assets ({data.assignedAssets.length})
              </h3>
              <Link
                href={data.requestNewAssetRoute || '/assets'}
                className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                + Request New / Replacement
              </Link>
            </div>
            {data.assignedAssets.map((asset) => (
              <div
                key={asset.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 p-3 dark:border-slate-800"
              >
                <div>
                  <p className="font-semibold">
                    {asset.assetName} ·{' '}
                    <span className="font-mono">{asset.assetTag}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {asset.category} · Assigned{' '}
                    {formatEmployeeDateOnly(asset.assignedDateOnly)} ·{' '}
                    {asset.acknowledgementStatus}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {asset.acknowledgementStatus ===
                    'Pending Acknowledgement' && (
                    <button
                      type="button"
                      disabled={acknowledgingId === asset.id}
                      onClick={() => handleAcknowledgeAsset(asset.id)}
                      className="rounded-lg bg-indigo-600 px-2.5 py-1 font-semibold text-white hover:bg-indigo-700"
                    >
                      {acknowledgingId === asset.id
                        ? 'Saving...'
                        : 'Acknowledge'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setReturnAssetTarget(asset.id)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold hover:bg-slate-50 dark:border-slate-700"
                  >
                    Return Asset
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Unified Requests Tracker */}
          <div className="space-y-2">
            <h3 className="font-bold">
              Unified Requests Tracker ({data.requests.length})
            </h3>
            <div className="divide-y divide-slate-200/70 rounded-xl border border-slate-200/80 dark:divide-slate-800 dark:border-slate-800">
              {data.requests.map((req) => (
                <div
                  key={req.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3"
                >
                  <div>
                    <p className="font-semibold">
                      {req.requestType}: {req.title}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Status: {req.status} · Approver: {req.approverOrAssignee}{' '}
                      · SLA/Age: {req.slaAgeLabel}
                    </p>
                  </div>
                  <Link
                    href={req.deepLinkPath}
                    className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    Track →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ConfirmActionDialog
        open={Boolean(returnAssetTarget)}
        title="Initiate Asset Return"
        description="Submit an IT asset return / replacement request for pickup or desk drop-off."
        confirmLabel="Submit Return Request"
        requireReason
        reasonLabel="Return / Replacement Reason"
        isSubmitting={submittingReturn}
        onClose={() => setReturnAssetTarget(null)}
        onConfirm={handleConfirmAssetReturn}
      />
    </WidgetCard>
  );
}

// ============================================================================
// 10. LEARNING WIDGET
// ============================================================================
export function MyLearningWidget({ isDark }: { isDark: boolean }) {
  const {
    data,
    loading,
    error,
    permissionDenied,
    notApplicable,
    asOf,
    refresh,
  } = useWidgetResource((signal) =>
    employeeLearningApi.getLearning({ signal })
  );

  const handleDownloadCertificate = async (
    courseId: string,
    courseTitle: string
  ) => {
    try {
      await employeeLearningApi.downloadCertificatePdf(courseId, courseTitle);
      toast.success(`Downloaded certificate for ${courseTitle}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Unable to download certificate'
      );
    }
  };

  const handleLaunchSso = async (courseId?: string) => {
    try {
      const res = await employeeLearningApi.launchLmsSso(courseId);
      toast.success(`SSO session ready for ${res.ssoLaunchUrl}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'LMS SSO launch failed');
    }
  };

  return (
    <WidgetCard
      id="learning"
      title="My Learning & Compliance Courses"
      subtitle="Assigned courses, completion progress, certificates, and LMS SSO"
      asOf={asOf}
      loading={loading}
      error={error}
      permissionDenied={permissionDenied}
      notApplicable={notApplicable}
      isEmpty={!data || data.courses.length === 0}
      emptyTitle="No courses assigned"
      emptyMessage="You have no pending or assigned LMS training courses."
      onRefresh={refresh}
      isDark={isDark}
      headerAction={
        <button
          type="button"
          onClick={() => handleLaunchSso()}
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open LMS (SSO)
        </button>
      }
    >
      {data && (
        <div className="space-y-3 text-xs">
          {data.courses.map((course) => (
            <div
              key={course.id}
              className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">{course.title}</p>
                  <p className="text-[11px] text-slate-500">
                    {course.category} · Due{' '}
                    <span className="font-mono">
                      {formatEmployeeDateOnly(course.dueDateOnly)}
                    </span>
                    {course.isOverdue ? ' · Overdue' : ''}
                  </p>
                </div>
                <span className="font-mono font-bold text-indigo-600 tabular-nums dark:text-indigo-400">
                  {course.progressPct}%
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{ width: `${course.progressPct}%` }}
                />
              </div>
              <div className="mt-2.5 flex items-center justify-end gap-2">
                {course.certificateAvailable && (
                  <button
                    type="button"
                    onClick={() =>
                      handleDownloadCertificate(course.id, course.title)
                    }
                    className="rounded-lg border border-slate-200 px-2.5 py-1 font-semibold hover:bg-slate-50 dark:border-slate-700"
                  >
                    Certificate PDF
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleLaunchSso(course.id)}
                  className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Continue Learning →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </WidgetCard>
  );
}

// ============================================================================
// 11. COMPANY FEED WIDGET (ANNOUNCEMENTS, HOLIDAYS, CELEBRATIONS, EVENTS)
// ============================================================================
export function CompanyFeedWidget({ isDark }: { isDark: boolean }) {
  const {
    data,
    loading,
    error,
    permissionDenied,
    notApplicable,
    asOf,
    refresh,
  } = useWidgetResource((signal) =>
    employeeCompanyFeedApi.getFeed({ signal })
  );

  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState<
    string | null
  >(null);

  const handleAcknowledge = async (id: string) => {
    try {
      await employeeCompanyFeedApi.acknowledgeAnnouncement(id);
      toast.success('Announcement acknowledged');
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not acknowledge announcement'
      );
    }
  };

  const handleSendWish = async (id: string) => {
    try {
      await employeeCompanyFeedApi.sendCelebrationWish(
        id,
        'Congratulations!'
      );
      toast.success('Warm wishes sent!');
      await refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send wish');
    }
  };

  const handleBookOptionalHoliday = async (holidayId: string) => {
    try {
      const res = await employeeCompanyFeedApi.bookOptionalHoliday(holidayId);
      toast.success(`Optional holiday booked (${res.status})`);
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Unable to book optional holiday'
      );
    }
  };

  return (
    <WidgetCard
      id="company-feed"
      title="Company Feed, Holidays & Celebrations"
      subtitle="Pinned announcements, next holiday countdown, birthdays, anniversaries & events"
      asOf={asOf}
      loading={loading}
      error={error}
      permissionDenied={permissionDenied}
      notApplicable={notApplicable}
      isEmpty={!data}
      emptyTitle="Company feed is quiet"
      emptyMessage="No active announcements, celebrations, or upcoming events returned."
      onRefresh={refresh}
      isDark={isDark}
    >
      {data && (
        <div className="space-y-4 text-xs">
          {/* Next Holiday Countdown */}
          {data.nextHolidayCountdown && (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-200/80 bg-indigo-50/60 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
              <div>
                <p className="font-bold">
                  Next Holiday: {data.nextHolidayCountdown.name}
                </p>
                <p className="font-mono text-[11px] text-slate-600 tabular-nums dark:text-slate-400">
                  {formatEmployeeDateOnly(data.nextHolidayCountdown.dateOnly)} ·
                  In {data.nextHolidayCountdown.daysRemaining} day(s)
                </p>
              </div>
              {data.nextHolidayCountdown.isOptional &&
                !data.nextHolidayCountdown.bookedByMe && (
                  <button
                    type="button"
                    onClick={() =>
                      handleBookOptionalHoliday(
                        data.nextHolidayCountdown!.holidayId
                      )
                    }
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white hover:bg-indigo-700"
                  >
                    Book Optional Holiday
                  </button>
                )}
            </div>
          )}

          {/* Announcements */}
          <div className="space-y-2">
            <h3 className="font-bold">Announcements</h3>
            {data.announcements.map((ann) => (
              <div
                key={ann.id}
                className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {ann.urgentOrPinned ? '[Pinned] ' : ''}
                      {ann.title}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {ann.authorName} ·{' '}
                      {formatEmployeeDateOnly(ann.publishedDateOnly)}
                      {ann.requiresAcknowledgement
                        ? ' · Acknowledgement Required'
                        : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedAnnouncementId((cur) =>
                          cur === ann.id ? null : ann.id
                        )
                      }
                      className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {expandedAnnouncementId === ann.id
                        ? 'Hide Detail'
                        : 'Read Detail'}
                    </button>
                    {ann.requiresAcknowledgement && !ann.acknowledged && (
                      <button
                        type="button"
                        onClick={() => handleAcknowledge(ann.id)}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-1.5 text-slate-600 dark:text-slate-300">
                  {expandedAnnouncementId === ann.id
                    ? ann.bodyText
                    : ann.summary}
                </p>
              </div>
            ))}
          </div>

          {/* Celebrations */}
          {data.celebrations.length > 0 && (
            <div className="space-y-2 border-t border-slate-200/70 pt-3 dark:border-slate-800">
              <h3 className="font-bold">
                Birthdays, Work Anniversaries &amp; New Joiners
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {data.celebrations.map((cel) => (
                  <div
                    key={cel.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/70 p-2.5 dark:border-slate-800"
                  >
                    <div>
                      <p className="font-semibold">{cel.employeeName}</p>
                      <p className="text-[11px] text-slate-500">
                        {cel.type} · {cel.department} · {cel.detailLabel}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={cel.wishedByMe}
                      onClick={() => handleSendWish(cel.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 font-semibold hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700"
                    >
                      <Send className="h-3 w-3" />
                      {cel.wishedByMe
                        ? `Wished (${cel.wishesCount})`
                        : `Send Wish (${cel.wishesCount})`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  );
}

// ============================================================================
// 12. MY TEAM & ORG WIDGET
// ============================================================================
export function MyTeamOrgWidget({ isDark }: { isDark: boolean }) {
  const {
    data,
    loading,
    error,
    permissionDenied,
    notApplicable,
    asOf,
    refresh,
  } = useWidgetResource((signal) =>
    employeeTeamOrgApi.getTeamOrg({ signal })
  );

  return (
    <WidgetCard
      id="team-org"
      title="My Team & Organization"
      subtitle="Reporting manager, peer presence, local times, and directory links"
      asOf={asOf}
      loading={loading}
      error={error}
      permissionDenied={permissionDenied}
      notApplicable={notApplicable}
      isEmpty={!data}
      emptyTitle="Team roster not available"
      emptyMessage="Your reporting line and peer directory have not been returned."
      onRefresh={refresh}
      isDark={isDark}
    >
      {data && (
        <div className="space-y-4 text-xs">
          <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800">
            <p className="text-[11px] text-slate-500">Reporting Manager</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-bold">{data.manager.fullName}</p>
                <p className="text-[11px] text-slate-500">
                  {data.manager.designation} · {data.manager.presenceStatus} ·
                  Local time {data.manager.localTimeDisplay}
                </p>
              </div>
              {data.manager.email && (
                <a
                  href={`mailto:${data.manager.email}`}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 font-semibold hover:bg-slate-50 dark:border-slate-700"
                >
                  <Mail className="h-3 w-3" />
                  Email
                </a>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold">Team Peers ({data.peers.length})</h3>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {data.peers.map((peer) => (
                <div
                  key={peer.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-200/80 p-3 dark:border-slate-800"
                >
                  <div>
                    <p className="font-semibold">{peer.fullName}</p>
                    <p className="text-[11px] text-slate-500">
                      {peer.designation} · {peer.presenceStatus} ·{' '}
                      <span className="font-mono tabular-nums">
                        {peer.localTimeDisplay}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {peer.email && (
                      <a
                        href={`mailto:${peer.email}`}
                        aria-label={`Email ${peer.fullName}`}
                        className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 dark:border-slate-700"
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                    )}
                    {peer.callDeepLink && (
                      <a
                        href={peer.callDeepLink}
                        aria-label={`Call ${peer.fullName}`}
                        className="rounded-lg border border-slate-200 p-1.5 hover:bg-slate-50 dark:border-slate-700"
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <Link
              href={data.orgChartRoute || '/'}
              className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View Org Chart →
            </Link>
            <Link
              href={data.directoryRoute || '/admin/workforce'}
              className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Who&apos;s-Who Directory →
            </Link>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}
