'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  Download,
  HelpCircle,
  MessageSquare,
  Plane,
  Plus,
  RotateCcw,
  Search,
  WifiOff,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  EmployeeWidgetId,
  RaiseHelpdeskTicketPayload,
  WidgetLayoutItem,
} from '../../types/employeeDashboard';
import {
  employeeDashboardLayoutApi,
  employeeHelpdeskApi,
  employeeManagerExtrasApi,
  employeeNotificationsSearchApi,
  employeeProbationExitApi,
  employeeTravelApi,
  formatEmployeeDateOnly,
} from '../../services/employee-dashboard';
import {
  ConfirmActionDialog,
  useWidgetResource,
  WidgetCard,
} from './EmployeeDashboardPrimitives';

// ============================================================================
// 13. TRAVEL WIDGET (CONDITIONAL)
// ============================================================================
export function MyTravelWidget({ isDark }: { isDark: boolean }) {
  const {
    data,
    loading,
    error,
    permissionDenied,
    notApplicable,
    asOf,
    refresh,
  } = useWidgetResource((signal) => employeeTravelApi.getTravel({ signal }));

  if (data && !data.applicable) {
    return null;
  }

  const handleDownloadTicket = async (tripId: string) => {
    try {
      await employeeTravelApi.downloadTripTicketsPdf(tripId);
      toast.success('Travel itinerary & tickets downloaded');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Unable to download travel tickets'
      );
    }
  };

  return (
    <WidgetCard
      id="travel"
      title="My Business Travel & Expense Settlement"
      subtitle="Upcoming itinerary, tickets, travel advances, and passport/visa alerts"
      asOf={asOf}
      loading={loading}
      error={error}
      permissionDenied={permissionDenied}
      notApplicable={notApplicable}
      isEmpty={!data || !data.upcomingTrip}
      emptyTitle="No upcoming business trips"
      emptyMessage="You have no active travel itineraries scheduled."
      onRefresh={refresh}
      isDark={isDark}
    >
      {data && data.upcomingTrip && (
        <div className="space-y-3 text-xs">
          <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-bold">
                  {data.upcomingTrip.destination} · {data.upcomingTrip.purpose}
                </p>
                <p className="font-mono text-[11px] text-slate-500 tabular-nums">
                  {formatEmployeeDateOnly(data.upcomingTrip.departureDateOnly)}{' '}
                  – {formatEmployeeDateOnly(data.upcomingTrip.returnDateOnly)}
                </p>
              </div>
              {data.upcomingTrip.ticketAvailable && (
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadTicket(data.upcomingTrip!.tripId)
                  }
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white hover:bg-indigo-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  Tickets PDF
                </button>
              )}
            </div>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              {data.upcomingTrip.itinerarySummary}
            </p>
            <p className="mt-1.5 text-[11px] text-slate-500">
              Advance: {data.upcomingTrip.advanceStatus}{' '}
              {data.upcomingTrip.advanceAmountFormatted
                ? `(${data.upcomingTrip.advanceAmountFormatted})`
                : ''}{' '}
              · Pending Expense Claims: {data.pendingExpenseClaimsCount} ·
              Settlement: {data.settlementStatusLabel}
            </p>
          </div>

          {data.visaOrPassportAlert && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
              <p className="font-semibold">
                {data.visaOrPassportAlert.documentType} Expiry Alert
              </p>
              <p className="mt-0.5 font-mono text-[11px] tabular-nums">
                Expires{' '}
                {formatEmployeeDateOnly(
                  data.visaOrPassportAlert.expiryDateOnly
                )}{' '}
                ({data.visaOrPassportAlert.daysRemaining} days remaining)
              </p>
            </div>
          )}
        </div>
      )}
    </WidgetCard>
  );
}

// ============================================================================
// 14. HELPDESK WIDGET
// ============================================================================
export interface MyHelpdeskWidgetProps {
  isDark: boolean;
  externalOpenRaiseTicket?: boolean;
  onCloseExternalRaiseTicket?: () => void;
}

export function MyHelpdeskWidget({
  isDark,
  externalOpenRaiseTicket = false,
  onCloseExternalRaiseTicket,
}: MyHelpdeskWidgetProps) {
  const [faqQuery, setFaqQuery] = useState('');
  const [ticketModalOpen, setTicketModalOpen] = useState(false);
  const [category, setCategory] = useState('IT Support');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] =
    useState<RaiseHelpdeskTicketPayload['priority']>('Medium');
  const [submittingTicket, setSubmittingTicket] = useState(false);

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
      employeeHelpdeskApi.getHelpdesk(faqQuery.trim() || undefined, { signal }),
    [faqQuery]
  );

  const isTicketModalOpen =
    ticketModalOpen || Boolean(externalOpenRaiseTicket);

  const handleRaiseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingTicket || !subject.trim() || !description.trim()) return;
    setSubmittingTicket(true);
    try {
      const res = await employeeHelpdeskApi.raiseTicket({
        category,
        subject: subject.trim(),
        description: description.trim(),
        priority,
      });
      toast.success(`Helpdesk ticket ${res.ticketId} created`);
      setTicketModalOpen(false);
      onCloseExternalRaiseTicket?.();
      setSubject('');
      setDescription('');
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Unable to raise helpdesk ticket'
      );
    } finally {
      setSubmittingTicket(false);
    }
  };

  return (
    <WidgetCard
      id="helpdesk"
      title="HR & IT Helpdesk"
      subtitle="Open support tickets, FAQ knowledge base search, and OFC Connect Chat"
      asOf={asOf}
      loading={loading}
      error={error}
      permissionDenied={permissionDenied}
      notApplicable={notApplicable}
      isEmpty={!data}
      emptyTitle="No open helpdesk tickets"
      emptyMessage="Need assistance? Raise an HR, IT, or Payroll support ticket."
      emptyCtaLabel="Raise Support Ticket"
      onEmptyCta={() => setTicketModalOpen(true)}
      onRefresh={refresh}
      isDark={isDark}
      headerAction={
        <button
          type="button"
          onClick={() => setTicketModalOpen(true)}
          data-testid="open-raise-ticket-btn"
          className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Raise Ticket
        </button>
      }
    >
      {data && (
        <div className="space-y-4 text-xs">
          {/* Open Tickets */}
          <div className="space-y-2">
            <h3 className="font-bold">
              Open Tickets ({data.openTickets.length})
            </h3>
            {data.openTickets.map((t) => (
              <div
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 p-3 dark:border-slate-800"
              >
                <div>
                  <p className="font-semibold">
                    <span className="font-mono">{t.id}</span> · {t.subject}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {t.category} · Status: {t.status} · Updated{' '}
                    {t.lastUpdatedLabel}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-slate-500">
                  SLA: {t.slaTargetLabel}
                </span>
              </div>
            ))}
          </div>

          {/* FAQ Search */}
          <div className="space-y-2 border-t border-slate-200/70 pt-3 dark:border-slate-800">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="helpdesk-faq-search" className="font-bold">
                Knowledge Base &amp; FAQs
              </label>
              <Link
                href={data.connectChatBotRoute || '/'}
                className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                OFC Connect Chat
              </Link>
            </div>
            <input
              id="helpdesk-faq-search"
              type="search"
              value={faqQuery}
              onChange={(e) => setFaqQuery(e.target.value)}
              placeholder="Search HR & IT policy FAQs..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
            {data.faqs.map((faq) => (
              <div
                key={faq.id}
                className="rounded-xl border border-slate-200/70 p-2.5 dark:border-slate-800"
              >
                <p className="font-semibold">{faq.question}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {faq.answerSnippet}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raise Ticket Modal */}
      {isTicketModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Raise Helpdesk Ticket"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl">
            <h3 className="text-sm font-bold">Raise Support Ticket</h3>
            <form onSubmit={handleRaiseTicket} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  >
                    <option value="IT Support">IT Support</option>
                    <option value="Payroll & Tax">Payroll &amp; Tax</option>
                    <option value="HR Operations">HR Operations</option>
                    <option value="Facilities">Facilities</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(
                        e.target.value as RaiseHelpdeskTicketPayload['priority']
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTicketModalOpen(false);
                    onCloseExternalRaiseTicket?.();
                  }}
                  className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  {submittingTicket ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WidgetCard>
  );
}

// ============================================================================
// 15. PROBATION / EXIT WIDGET (CONDITIONAL)
// ============================================================================
export function MyProbationExitWidget({ isDark }: { isDark: boolean }) {
  const {
    data,
    loading,
    error,
    permissionDenied,
    notApplicable,
    asOf,
    refresh,
  } = useWidgetResource((signal) =>
    employeeProbationExitApi.getLifecycleStatus({ signal })
  );

  const [withdrawConfirmOpen, setWithdrawConfirmOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  if (data && (!data.applicable || data.mode === 'none')) {
    return null;
  }

  const handleConfirmWithdrawResignation = async (reason: string) => {
    setWithdrawing(true);
    try {
      const res = await employeeProbationExitApi.withdrawResignation(reason);
      toast.success(res.message || 'Resignation withdrawal submitted');
      setWithdrawConfirmOpen(false);
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Unable to withdraw resignation'
      );
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <WidgetCard
      id="probation-exit"
      title={
        data?.mode === 'notice-period'
          ? 'Notice Period, KT & Exit Clearance'
          : 'Probation Milestones & Confirmation Tracker'
      }
      subtitle="Lifecycle milestones, check-in evaluations, and confirmation/clearance status"
      asOf={asOf}
      loading={loading}
      error={error}
      permissionDenied={permissionDenied}
      notApplicable={notApplicable}
      isEmpty={!data}
      emptyTitle="No lifecycle workflow active"
      emptyMessage="No active probation or exit workflow returned."
      onRefresh={refresh}
      isDark={isDark}
    >
      {data?.mode === 'probation' && data.probation && (
        <div className="space-y-3 text-xs">
          <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800">
            <p className="font-semibold">
              Evaluation Status: {data.probation.evaluationStatus}
            </p>
            <p className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
              Started: {formatEmployeeDateOnly(data.probation.startDateOnly)} ·
              Target Confirmation:{' '}
              {formatEmployeeDateOnly(
                data.probation.confirmationTargetDateOnly
              )}
            </p>
          </div>
          <div className="space-y-2">
            {data.probation.milestones.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-slate-200/70 p-3 dark:border-slate-800"
              >
                <div>
                  <p className="font-semibold">{m.title}</p>
                  <p className="font-mono text-[11px] text-slate-500 tabular-nums">
                    Check-In: {formatEmployeeDateOnly(m.checkInDateOnly)}
                  </p>
                </div>
                <span className="font-semibold">{m.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data?.mode === 'notice-period' && data.noticePeriod && (
        <div className="space-y-3 text-xs">
          <div className="rounded-xl border border-slate-200/80 p-3.5 dark:border-slate-800">
            <p className="font-bold">
              Last Working Day:{' '}
              <span className="font-mono">
                {formatEmployeeDateOnly(data.noticePeriod.lastWorkingDateOnly)}
              </span>{' '}
              ({data.noticePeriod.daysRemaining}d remaining)
            </p>
            <p className="mt-1 text-slate-500">
              KT Status: {data.noticePeriod.ktStatus} · Clearance:{' '}
              {data.noticePeriod.clearanceProgressPct}% · F&amp;F:{' '}
              {data.noticePeriod.fnfSettlementStatus}
            </p>
          </div>
          {data.noticePeriod.canWithdrawResignation && (
            <button
              type="button"
              onClick={() => setWithdrawConfirmOpen(true)}
              className="rounded-xl border border-rose-200 px-3.5 py-2 font-semibold text-rose-600 hover:bg-rose-50"
            >
              Withdraw Resignation
            </button>
          )}
        </div>
      )}

      <ConfirmActionDialog
        open={withdrawConfirmOpen}
        title="Withdraw Resignation"
        description="Submit a formal request to withdraw your resignation and cancel notice period workflows."
        confirmLabel="Confirm Withdrawal"
        requireReason
        reasonLabel="Withdrawal Reason"
        isSubmitting={withdrawing}
        onClose={() => setWithdrawConfirmOpen(false)}
        onConfirm={handleConfirmWithdrawResignation}
      />
    </WidgetCard>
  );
}

// ============================================================================
// 16. MANAGER EXTRAS WIDGET (CONDITIONAL — MANAGER PERMISSION ONLY)
// ============================================================================
export function ManagerExtrasWidget({
  isDark,
  isManagerPermitted,
}: {
  isDark: boolean;
  isManagerPermitted: boolean;
}) {
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
      isManagerPermitted
        ? employeeManagerExtrasApi.getManagerExtras({ signal })
        : Promise.resolve(null),
    [isManagerPermitted]
  );

  const [decidingId, setDecidingId] = useState<string | null>(null);

  if (!isManagerPermitted || (data && !data.permitted)) {
    return null;
  }

  const handleDecision = async (
    id: string,
    decision: 'Approved' | 'Rejected'
  ) => {
    setDecidingId(id);
    try {
      await employeeManagerExtrasApi.decideApprovalInline(id, decision);
      toast.success(`Request ${decision.toLowerCase()}`);
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Unable to process approval'
      );
    } finally {
      setDecidingId(null);
    }
  };

  return (
    <WidgetCard
      id="manager-extras"
      title="My Team & Pending Approvals (Manager View)"
      subtitle="Team attendance snapshot, inline approvals inbox, and open requisitions"
      asOf={asOf}
      loading={loading}
      error={error}
      permissionDenied={permissionDenied}
      notApplicable={notApplicable}
      isEmpty={!data}
      emptyTitle="No pending team approvals"
      emptyMessage="Your team approvals queue is clear."
      onRefresh={refresh}
      isDark={isDark}
    >
      {data && (
        <div className="space-y-4 text-xs">
          {/* Team Snapshot */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
            {[
              { label: 'Present Today', value: data.teamSnapshot.presentToday },
              { label: 'WFH Today', value: data.teamSnapshot.wfhToday },
              { label: 'On Leave', value: data.teamSnapshot.onLeaveToday },
              { label: 'Absent', value: data.teamSnapshot.absentToday },
              { label: 'On Business Trip', value: data.teamSnapshot.teamOnTripCount },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200/80 p-2.5 dark:border-slate-800"
              >
                <p className="text-[11px] text-slate-500">{item.label}</p>
                <p className="mt-0.5 font-mono text-base font-bold tabular-nums">
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Pending Approvals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold">
                Pending Team Approvals ({data.totalPendingApprovals})
              </h3>
              <Link
                href={data.approvalsInboxRoute || '/'}
                className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Open Unified Approvals Inbox →
              </Link>
            </div>
            {data.actionableApprovals.map((app) => (
              <div
                key={app.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200/80 p-3 dark:border-slate-800"
              >
                <div>
                  <p className="font-semibold">
                    {app.type} · {app.employeeName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {app.summary} · {app.submittedLabel}
                  </p>
                </div>
                {app.canInlineDecide && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={decidingId === app.id}
                      onClick={() => handleDecision(app.id, 'Approved')}
                      className="rounded-lg bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={decidingId === app.id}
                      onClick={() => handleDecision(app.id, 'Rejected')}
                      className="rounded-lg border border-rose-200 px-2.5 py-1 font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </WidgetCard>
  );
}

// ============================================================================
// 17. WIDGET LAYOUT & PERSONALIZATION DIALOG
// ============================================================================
export interface WidgetPersonalizationDialogProps {
  open: boolean;
  widgets: WidgetLayoutItem[];
  onClose: () => void;
  onLayoutUpdated: (updated: WidgetLayoutItem[]) => void;
}

export function WidgetPersonalizationDialog({
  open,
  widgets,
  onClose,
  onLayoutUpdated,
}: WidgetPersonalizationDialogProps) {
  const [draftOverride, setDraftOverride] = useState<WidgetLayoutItem[] | null>(
    null
  );
  const [saving, setSaving] = useState(false);

  const draft = draftOverride ?? widgets;

  if (!open) return null;

  const moveItem = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= draft.length) return;
    const copy = [...draft];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIdx, 0, moved);
    setDraftOverride(copy.map((w, i) => ({ ...w, order: i + 1 })));
  };

  const toggleVisible = (widgetId: EmployeeWidgetId) => {
    setDraftOverride(
      draft.map((w) =>
        w.widgetId === widgetId && !w.mandatory
          ? { ...w, visible: !w.visible }
          : w
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await employeeDashboardLayoutApi.saveLayout({
        widgets: draft.map((w, i) => ({
          widgetId: w.widgetId,
          visible: w.visible,
          order: i + 1,
        })),
      });
      onLayoutUpdated(res.widgets);
      setDraftOverride(null);
      toast.success('Dashboard widget layout saved to server');
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Unable to save layout preferences'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      const res = await employeeDashboardLayoutApi.resetLayout();
      onLayoutUpdated(res.widgets);
      setDraftOverride(null);
      toast.success('Dashboard layout reset to role defaults');
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Unable to reset layout'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Customize Dashboard Widgets"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold">
              Personalize Employee Dashboard Layout
            </h3>
            <p className="text-xs text-slate-500">
              Show, hide, or reorder widgets (saved per-user on the server)
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close layout dialog"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 max-h-80 space-y-2 overflow-y-auto pr-1">
          {draft.map((w, idx) => (
            <div
              key={w.widgetId}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-2.5 text-xs"
            >
              <label className="flex items-center gap-2.5 font-semibold">
                <input
                  type="checkbox"
                  checked={w.visible}
                  disabled={w.mandatory}
                  onChange={() => toggleVisible(w.widgetId)}
                />
                <span>
                  {idx + 1}. {w.title}
                </span>
              </label>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => moveItem(idx, -1)}
                  aria-label={`Move ${w.title} up`}
                  className="rounded-lg border border-slate-200 p-1 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === draft.length - 1}
                  onClick={() => moveItem(idx, 1)}
                  aria-label={`Move ${w.title} down`}
                  className="rounded-lg border border-slate-200 p-1 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={saving}
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset to Default
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              {saving ? 'Saving...' : 'Save Layout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 18. NOTIFICATIONS & GLOBAL SEARCH MODALS
// ============================================================================
export function NotificationsDrawerModal({
  open,
  onClose,
  onUnreadCountChange,
}: {
  open: boolean;
  onClose: () => void;
  onUnreadCountChange: (count: number) => void;
}) {
  const { data, loading, error, refresh } = useWidgetResource(
    (signal) =>
      open
        ? employeeNotificationsSearchApi.getNotifications({ signal })
        : Promise.resolve(null),
    [open]
  );

  React.useEffect(() => {
    if (data && typeof data.unreadCount === 'number') {
      onUnreadCountChange(data.unreadCount);
    }
  }, [data, onUnreadCountChange]);

  if (!open) return null;

  const handleMarkRead = async (notificationId?: string, markAll?: boolean) => {
    try {
      const res = await employeeNotificationsSearchApi.markRead({
        notificationId,
        markAll,
      });
      onUnreadCountChange(res.unreadCount);
      await refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Could not update notifications'
      );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notifications Center"
      className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 p-4 backdrop-blur-xs"
    >
      <div className="flex h-full max-h-[85vh] w-full max-w-md flex-col rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold">Notifications Center</h3>
            <p className="text-xs text-slate-500">
              Leave decisions, payslips, tasks due &amp; asset alerts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMarkRead(undefined, true)}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Mark all read
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notifications"
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex-1 space-y-2 overflow-y-auto text-xs">
          {loading ? (
            <p className="py-6 text-center text-slate-500">
              Loading notifications...
            </p>
          ) : error ? (
            <p className="py-6 text-center text-rose-600">{error}</p>
          ) : !data || data.items.length === 0 ? (
            <p className="py-8 text-center text-slate-500">
              No notifications right now.
            </p>
          ) : (
            data.items.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl border p-3 ${
                  n.read
                    ? 'border-slate-200 bg-white'
                    : 'border-indigo-200 bg-indigo-50/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold">
                    {n.category}: {n.title}
                  </p>
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id, false)}
                      className="text-[11px] font-semibold text-indigo-600 hover:underline"
                    >
                      Mark read
                    </button>
                  )}
                </div>
                <p className="mt-1 text-slate-600">{n.message}</p>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{n.createdAtLabel}</span>
                  <Link
                    href={n.deepLinkPath}
                    onClick={onClose}
                    className="font-semibold text-indigo-600 hover:underline"
                  >
                    Open →
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export function GlobalSearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const { data, loading, error } = useWidgetResource(
    (signal) =>
      open
        ? employeeNotificationsSearchApi.globalSearch(query, { signal })
        : Promise.resolve(null),
    [open, query]
  );

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Workspace Search"
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 p-4 pt-16 backdrop-blur-xs"
    >
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-xl">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search colleagues, HR policies, help articles, or pages..."
            className="flex-1 text-xs focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close global search"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 max-h-72 space-y-2 overflow-y-auto text-xs">
          {loading ? (
            <p className="py-4 text-center text-slate-500">Searching API...</p>
          ) : error ? (
            <p className="py-4 text-center text-rose-600">{error}</p>
          ) : !data || data.results.length === 0 ? (
            <p className="py-6 text-center text-slate-500">
              No matching colleagues, policies, or help articles found.
            </p>
          ) : (
            data.results.map((item) => (
              <Link
                key={item.id}
                href={item.deepLinkPath}
                onClick={onClose}
                className="block rounded-xl border border-slate-200 p-3 hover:bg-slate-50"
              >
                <p className="font-semibold">
                  {item.category} · {item.title}
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {item.subtitle}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 19. REAL-TIME & OFFLINE BANNER
// ============================================================================
export function RealtimeOfflineStatusBanner({
  isOffline,
  lastPulseIso,
  onManualPulse,
}: {
  isOffline: boolean;
  lastPulseIso: string | null;
  onManualPulse: () => void;
}) {
  if (!isOffline) return null;

  return (
    <div
      role="alert"
      data-testid="offline-banner"
      className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-950"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="h-4 w-4 text-amber-700" />
        <span className="font-semibold">
          You are currently offline. Punch actions and form submissions are
          disabled until connection is restored (no fake offline mutations).
        </span>
      </div>
      <button
        type="button"
        onClick={onManualPulse}
        className="rounded-lg bg-amber-800 px-3 py-1 font-semibold text-white hover:bg-amber-900"
      >
        Retry Connection {lastPulseIso ? `(Last sync ${lastPulseIso})` : ''}
      </button>
    </div>
  );
}
