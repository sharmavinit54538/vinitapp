'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Laptop,
  Wallet,
  Calendar,
  GraduationCap,
  HeartHandshake,
  Gift,
  Award,
  MessageSquareHeart,
  CheckCircle2,
  Download,
  RefreshCw,
} from 'lucide-react';
import {
  OnboardingRole,
  ProvisioningRequestRecord,
  PayrollStatutoryHandoffRecord,
  InductionSessionRecord,
  JoinerTrainingAssignmentRecord,
  BuddyAssignmentRecord,
  DayOneExperienceRecord,
  ProbationCaseRecord,
  OnboardingSurveyWorkspaceResponse,
} from '../../types/onboarding';
import {
  onboardingItAssetsApi,
  onboardingPayrollHandoffApi,
  onboardingInductionApi,
  onboardingTrainingApi,
  onboardingBuddyApi,
  onboardingDayOneApi,
  onboardingProbationApi,
  onboardingSurveysApi,
} from '../../services/onboarding';
import { useOnboardingPermission } from '../../hooks/useOnboardingPermission';
import {
  OnboardingSkeletonBlock,
  OnboardingPermissionDeniedState,
  OnboardingErrorState,
  OnboardingEmptyState,
  OnboardingModal,
} from './OnboardingPrimitives';

export interface OnboardingExperienceModuleProps {
  role: OnboardingRole;
  notify: (msg: string) => void;
}

// 9. IT, Asset & Access Provisioning
export function ItAssetProvisioningModule({
  role,
  notify,
}: OnboardingExperienceModuleProps) {
  const perm = useOnboardingPermission('it-assets', role);
  const [items, setItems] = useState<ProvisioningRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [fulfillOpen, setFulfillOpen] = useState(false);
  const [activeId, setActiveId] = useState('');
  const [joinerId, setJoinerId] = useState('');
  const [category, setCategory] = useState<
    | 'Laptop'
    | 'Mobile'
    | 'IdCard'
    | 'AccessCard'
    | 'CorporateEmail'
    | 'VpnSso'
    | 'WorkstationSeating'
  >('Laptop');
  const [specification, setSpecification] = useState('');
  const [serialNumber, setSerialNumber] = useState('');

  const loadRequests = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingItAssetsApi.listRequests({
        category: categoryFilter || undefined,
      });
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load IT & asset provisioning queue'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadRequests();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadRequests]);

  if (!perm.canView) {
    return (
      <OnboardingPermissionDeniedState
        moduleName="IT, Asset & Access Provisioning"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            IT, Asset & Access Provisioning
          </h3>
          <p className="text-xs text-slate-500">
            Laptop, Mobile, ID Card, Access Card, Corporate Email, VPN/SSO &
            Seating
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300"
          >
            <option value="">All Categories</option>
            <option value="Laptop">Laptop</option>
            <option value="Mobile">Mobile</option>
            <option value="IdCard">ID Card</option>
            <option value="AccessCard">Access Card</option>
            <option value="CorporateEmail">Corporate Email</option>
            <option value="VpnSso">VPN / SSO</option>
            <option value="WorkstationSeating">Workstation Seating</option>
          </select>
          {perm.canCreate && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              + Request Asset
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={4} />
      ) : error ? (
        <div className="space-y-3">
          <OnboardingErrorState message={error} onRetry={loadRequests} />
          {perm.canCreate && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Raise a new IT or Facilities provisioning request
              </span>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                + Request Asset
              </button>
            </div>
          )}
        </div>
      ) : items.length === 0 ? (
        <OnboardingEmptyState
          icon={Laptop}
          title="No Provisioning Requests"
          description="No IT hardware, email account, VPN/SSO, or seating requests found."
          actionLabel={perm.canCreate ? 'Request Asset' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {r.joinerName}
                  </span>
                  <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                    {r.category}
                  </span>
                  <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    {r.itsmTicketCode}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Spec: {r.specification} · Queue: {r.assigneeGroup} · Status:{' '}
                  {r.status}
                  {r.serialNumberOrAccount
                    ? ` · Serial/Acct: ${r.serialNumberOrAccount}`
                    : ''}
                </p>
              </div>
              {perm.canEdit && r.status !== 'HandedOver' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(r.id);
                    setFulfillOpen(true);
                  }}
                  className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-500"
                >
                  Confirm Handover
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <OnboardingModal
        open={createOpen}
        title="Raise IT / Asset Provisioning Request"
        onClose={() => setCreateOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await onboardingItAssetsApi.createRequest({
                joinerId,
                category,
                specification,
              });
              notify('IT/Asset provisioning request submitted');
              setCreateOpen(false);
              void loadRequests();
            } catch (err) {
              notify(
                err instanceof Error
                  ? err.message
                  : 'Provisioning request failed'
              );
            }
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Joiner ID
            </label>
            <input
              required
              value={joinerId}
              onChange={(e) => setJoinerId(e.target.value)}
              placeholder="e.g. JNR-1042"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Asset / Access Category
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value as
                    | 'Laptop'
                    | 'Mobile'
                    | 'IdCard'
                    | 'AccessCard'
                    | 'CorporateEmail'
                    | 'VpnSso'
                    | 'WorkstationSeating'
                )
              }
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            >
              <option value="Laptop">Laptop</option>
              <option value="Mobile">Mobile</option>
              <option value="IdCard">ID Card</option>
              <option value="AccessCard">Access Card</option>
              <option value="CorporateEmail">Corporate Email</option>
              <option value="VpnSso">VPN / SSO</option>
              <option value="WorkstationSeating">Workstation Seating</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Specification / Notes
            </label>
            <input
              required
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
              placeholder="e.g. MacBook Pro 16 M3 / Floor 4 Bay 12"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Create Ticket
            </button>
          </div>
        </form>
      </OnboardingModal>

      <OnboardingModal
        open={fulfillOpen}
        title="Confirm Asset / Access Handover"
        onClose={() => setFulfillOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await onboardingItAssetsApi.fulfillRequest(activeId, {
                serialNumberOrAccount: serialNumber,
                handoverConfirmed: true,
              });
              notify('Provisioning fulfilled and handover recorded');
              setFulfillOpen(false);
              void loadRequests();
            } catch (err) {
              notify(
                err instanceof Error ? err.message : 'Handover update failed'
              );
            }
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Serial Number / Account Identifier
            </label>
            <input
              required
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="e.g. SN-C02X9481 or user@company.com"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setFulfillOpen(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Confirm Handover
            </button>
          </div>
        </form>
      </OnboardingModal>
    </div>
  );
}

// 10. Payroll & Statutory Setup Handoff
export function PayrollStatutoryHandoffModule({
  role,
  notify,
}: OnboardingExperienceModuleProps) {
  const perm = useOnboardingPermission('payroll-handoff', role);
  const [items, setItems] = useState<PayrollStatutoryHandoffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readyOnly, setReadyOnly] = useState(false);

  const loadHandoffs = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingPayrollHandoffApi.listHandoffs({
        readyOnly: readyOnly || undefined,
      });
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load payroll & statutory setup handoffs'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, readyOnly]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadHandoffs();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadHandoffs]);

  if (!perm.canView) {
    return (
      <OnboardingPermissionDeniedState
        moduleName="Payroll & Statutory Setup Handoff"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Payroll & Statutory Setup Handoff
          </h3>
          <p className="text-xs text-slate-500">
            Salary structure, Bank, PF/UAN, ESI, Tax Regime & Ready-for-First-Payroll gate
          </p>
        </div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={readyOnly}
            onChange={(e) => setReadyOnly(e.target.checked)}
            className="rounded border-slate-300"
          />
          Ready for First Payroll Only
        </label>
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={4} />
      ) : error ? (
        <OnboardingErrorState message={error} onRetry={loadHandoffs} />
      ) : items.length === 0 ? (
        <OnboardingEmptyState
          icon={Wallet}
          title="No Payroll Handoff Records"
          description="No joiners are currently queued for first-payroll statutory synchronization."
          actionLabel="Refresh Queue"
          onAction={loadHandoffs}
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((h) => (
            <div
              key={h.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {h.joinerName}
                  </span>
                  <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    {h.employeeCode}
                  </span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                      h.readyForFirstPayroll
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                    }`}
                  >
                    {h.readyForFirstPayroll
                      ? 'Ready for 1st Payroll'
                      : 'Blocked'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Bank: {h.bankVerified ? 'Verified' : 'Pending'} · PF/UAN:{' '}
                  {h.pfUanLinked ? 'Linked' : 'Pending'} · Tax Regime:{' '}
                  {h.taxRegimeDeclared ? 'Declared' : 'Pending'}
                </p>
              </div>
              {perm.canEdit && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await onboardingPayrollHandoffApi.syncToPayroll(h.id);
                      notify(`Synced ${h.joinerName} to Payroll Module`);
                      void loadHandoffs();
                    } catch (err) {
                      notify(
                        err instanceof Error
                          ? err.message
                          : 'Payroll sync failed'
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-500"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Sync to Payroll
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 11. Orientation & Induction Scheduling
export function OrientationInductionModule({
  role,
  notify,
}: OnboardingExperienceModuleProps) {
  const perm = useOnboardingPermission('induction', role);
  const [sessions, setSessions] = useState<InductionSessionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');
  const [mode, setMode] = useState<'Virtual' | 'InPerson'>('Virtual');
  const [speakers, setSpeakers] = useState('');

  const loadSessions = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingInductionApi.listSessions();
      setSessions(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load orientation & induction sessions'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadSessions();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadSessions]);

  if (!perm.canView) {
    return (
      <OnboardingPermissionDeniedState
        moduleName="Orientation & Induction Scheduling"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Orientation & Induction Scheduling
          </h3>
          <p className="text-xs text-slate-500">
            Batch induction cohorts, virtual/in-person speaker slots & attendance
          </p>
        </div>
        {perm.canCreate && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            + Schedule Session
          </button>
        )}
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={4} />
      ) : error ? (
        <div className="space-y-3">
          <OnboardingErrorState message={error} onRetry={loadSessions} />
          {perm.canCreate && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Schedule a new orientation batch session
              </span>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                + Schedule Session
              </button>
            </div>
          )}
        </div>
      ) : sessions.length === 0 ? (
        <OnboardingEmptyState
          icon={Calendar}
          title="No Induction Sessions Scheduled"
          description="Schedule HR, IT Security, and Leadership orientation sessions for incoming cohorts."
          actionLabel={perm.canCreate ? 'Schedule Session' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {s.title}
                  </span>
                  <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                    {s.mode}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {s.sessionDate} ({s.startTime} - {s.endTime}) · Speakers:{' '}
                  {s.speakerNames.join(', ')} · Attended: {s.attendedCount}/
                  {s.enrolledJoinersCount}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <OnboardingModal
        open={createOpen}
        title="Schedule Induction Session"
        onClose={() => setCreateOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await onboardingInductionApi.createSession({
                title,
                sessionDate,
                startTime,
                endTime,
                mode,
                speakerNames: speakers
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              });
              notify('Induction session scheduled');
              setCreateOpen(false);
              void loadSessions();
            } catch (err) {
              notify(
                err instanceof Error
                  ? err.message
                  : 'Failed to schedule induction session'
              );
            }
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Session Title
            </label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Global Culture & InfoSec Orientation"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mode
              </label>
              <select
                value={mode}
                onChange={(e) =>
                  setMode(e.target.value as 'Virtual' | 'InPerson')
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
              >
                <option value="Virtual">Virtual</option>
                <option value="InPerson">In-Person</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Start Time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                End Time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Speakers (comma-separated)
            </label>
            <input
              required
              value={speakers}
              onChange={(e) => setSpeakers(e.target.value)}
              placeholder="e.g. VP People, CISO"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Schedule
            </button>
          </div>
        </form>
      </OnboardingModal>
    </div>
  );
}

// 12. Training & Learning Assignment
export function TrainingLearningModule({
  role,
  notify,
}: OnboardingExperienceModuleProps) {
  const perm = useOnboardingPermission('training', role);
  const [items, setItems] = useState<JoinerTrainingAssignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [joinerId, setJoinerId] = useState('');
  const [courseCode, setCourseCode] = useState('POSH-101');
  const [dueDate, setDueDate] = useState('');

  const loadTraining = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingTrainingApi.listAssignments();
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load mandatory compliance & LMS courses'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadTraining();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTraining]);

  if (!perm.canView) {
    return (
      <OnboardingPermissionDeniedState
        moduleName="Training & Learning Assignment"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Training & Learning Assignment (LMS Handshake)
          </h3>
          <p className="text-xs text-slate-500">
            Mandatory compliance courses (POSH, InfoSec, Ethics) & role-based learning paths
          </p>
        </div>
        {perm.canCreate && (
          <button
            type="button"
            onClick={() => setAssignOpen(true)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            + Assign Course
          </button>
        )}
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={4} />
      ) : error ? (
        <div className="space-y-3">
          <OnboardingErrorState message={error} onRetry={loadTraining} />
          {perm.canCreate && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Assign mandatory LMS compliance training to a joiner
              </span>
              <button
                type="button"
                onClick={() => setAssignOpen(true)}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                + Assign Course
              </button>
            </div>
          )}
        </div>
      ) : items.length === 0 ? (
        <OnboardingEmptyState
          icon={GraduationCap}
          title="No Learning Courses Assigned"
          description="Assign mandatory compliance or role-based learning modules to joiners."
          actionLabel={perm.canCreate ? 'Assign Course' : undefined}
          onAction={perm.canCreate ? () => setAssignOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {c.courseTitle}
                  </span>
                  <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    {c.courseCode}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Joiner: {c.joinerName} · Progress: {c.progressPct}% · Due:{' '}
                  {c.dueDate} · LMS: {c.lmsSyncStatus}
                </p>
              </div>
              <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                {c.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <OnboardingModal
        open={assignOpen}
        title="Assign Mandatory LMS Course"
        onClose={() => setAssignOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await onboardingTrainingApi.assignCourse({
                joinerId,
                courseCode,
                dueDate,
              });
              notify('Training course assigned via LMS');
              setAssignOpen(false);
              void loadTraining();
            } catch (err) {
              notify(
                err instanceof Error ? err.message : 'Course assignment failed'
              );
            }
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Joiner ID
            </label>
            <input
              required
              value={joinerId}
              onChange={(e) => setJoinerId(e.target.value)}
              placeholder="e.g. JNR-1042"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Course Code
            </label>
            <select
              value={courseCode}
              onChange={(e) => setCourseCode(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            >
              <option value="POSH-101">POSH-101 (POSH Mandatory)</option>
              <option value="SEC-201">SEC-201 (Cybersecurity & GDPR)</option>
              <option value="ETH-105">ETH-105 (Code of Business Ethics)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Completion Due Date
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAssignOpen(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Assign Course
            </button>
          </div>
        </form>
      </OnboardingModal>
    </div>
  );
}

// 13. Buddy / Mentor Assignment
export function BuddyMentorModule({
  role,
  notify,
}: OnboardingExperienceModuleProps) {
  const perm = useOnboardingPermission('buddy', role);
  const [items, setItems] = useState<BuddyAssignmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [joinerId, setJoinerId] = useState('');
  const [buddyEmployeeCode, setBuddyEmployeeCode] = useState('');
  const [cadenceDays, setCadenceDays] = useState(7);

  const loadBuddies = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingBuddyApi.listAssignments();
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load buddy & mentor assignments'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadBuddies();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadBuddies]);

  if (!perm.canView) {
    return (
      <OnboardingPermissionDeniedState
        moduleName="Buddy / Mentor Assignment"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Buddy / Mentor Assignment
          </h3>
          <p className="text-xs text-slate-500">
            Peer buddy matching, check-in cadence & onboarding guidance
          </p>
        </div>
        {perm.canCreate && (
          <button
            type="button"
            onClick={() => setAssignOpen(true)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            + Assign Buddy
          </button>
        )}
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={4} />
      ) : error ? (
        <div className="space-y-3">
          <OnboardingErrorState message={error} onRetry={loadBuddies} />
          {perm.canCreate && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Assign a peer buddy or mentor to an incoming joiner
              </span>
              <button
                type="button"
                onClick={() => setAssignOpen(true)}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                + Assign Buddy
              </button>
            </div>
          )}
        </div>
      ) : items.length === 0 ? (
        <OnboardingEmptyState
          icon={HeartHandshake}
          title="No Buddy Assignments"
          description="Match new joiners with experienced peer buddies to accelerate cultural integration."
          actionLabel={perm.canCreate ? 'Assign Buddy' : undefined}
          onAction={perm.canCreate ? () => setAssignOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {b.joinerName} ↔ Buddy: {b.buddyName} ({b.buddyEmployeeCode})
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {b.department} · {b.matchExplanation} · Next Check-in:{' '}
                  {b.nextCheckInDate}
                </p>
              </div>
              <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                {b.checkInsCompleted} Check-ins Done
              </span>
            </div>
          ))}
        </div>
      )}

      <OnboardingModal
        open={assignOpen}
        title="Assign Peer Buddy / Mentor"
        onClose={() => setAssignOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await onboardingBuddyApi.assignBuddy({
                joinerId,
                buddyEmployeeCode,
                checkInCadenceDays: cadenceDays,
              });
              notify('Buddy assigned to joiner');
              setAssignOpen(false);
              void loadBuddies();
            } catch (err) {
              notify(
                err instanceof Error ? err.message : 'Buddy assignment failed'
              );
            }
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Joiner ID
            </label>
            <input
              required
              value={joinerId}
              onChange={(e) => setJoinerId(e.target.value)}
              placeholder="e.g. JNR-1042"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Buddy Employee Code
            </label>
            <input
              required
              value={buddyEmployeeCode}
              onChange={(e) => setBuddyEmployeeCode(e.target.value)}
              placeholder="e.g. EMP-2088"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Check-in Cadence (Days)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={cadenceDays}
              onChange={(e) => setCadenceDays(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAssignOpen(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Assign Buddy
            </button>
          </div>
        </form>
      </OnboardingModal>
    </div>
  );
}

// 14. Day-1 Experience & Welcome Kit
export function DayOneWelcomeKitModule({
  role,
  notify,
}: OnboardingExperienceModuleProps) {
  const perm = useOnboardingPermission('day-one', role);
  const [items, setItems] = useState<DayOneExperienceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDayOne = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingDayOneApi.listKits();
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load Day-1 experience & welcome kits'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDayOne();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDayOne]);

  if (!perm.canView) {
    return (
      <OnboardingPermissionDeniedState
        moduleName="Day-1 Experience & Welcome Kit"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Day-1 Experience & Welcome Kit
        </h3>
        <p className="text-xs text-slate-500">
          Swag kit dispatch status, digital ID card readiness & Day-1 attendance confirmation
        </p>
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={4} />
      ) : error ? (
        <OnboardingErrorState message={error} onRetry={loadDayOne} />
      ) : items.length === 0 ? (
        <OnboardingEmptyState
          icon={Gift}
          title="No Day-1 Kits Queued"
          description="No Day-1 welcome kits or joining confirmations are pending right now."
          actionLabel="Refresh"
          onAction={loadDayOne}
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((k) => (
            <div
              key={k.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {k.joinerName} · Joining: {k.joiningDate}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Swag Kit: {k.swagKitStatus} · ID Card:{' '}
                  {k.idCardReady ? 'Ready' : 'Pending'} · Day-1 Attendance:{' '}
                  {k.dayOneAttendanceConfirmed ? 'Confirmed' : 'Awaiting'}
                </p>
              </div>
              {perm.canEdit && !k.dayOneAttendanceConfirmed && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await onboardingDayOneApi.confirmDayOne(k.id, {
                        kitDispatched: true,
                        dayOneAttended: true,
                      });
                      notify(`Day-1 joining confirmed for ${k.joinerName}`);
                      void loadDayOne();
                    } catch (err) {
                      notify(
                        err instanceof Error
                          ? err.message
                          : 'Confirmation failed'
                      );
                    }
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-500"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" /> Confirm Day-1
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 15. Probation Tracking & Confirmation
export function ProbationTrackingModule({
  role,
  notify,
}: OnboardingExperienceModuleProps) {
  const perm = useOnboardingPermission('probation', role);
  const [cases, setCases] = useState<ProbationCaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [evalOpen, setEvalOpen] = useState(false);
  const [activeId, setActiveId] = useState('');
  const [milestoneDay, setMilestoneDay] = useState<30 | 60 | 90>(90);
  const [rating, setRating] = useState(4);
  const [decision, setDecision] = useState<'Confirm' | 'Extend' | 'Terminate'>(
    'Confirm'
  );
  const [comments, setComments] = useState('');

  const loadCases = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingProbationApi.listCases();
      setCases(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load probation tracking cases'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCases();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadCases]);

  if (!perm.canView) {
    return (
      <OnboardingPermissionDeniedState
        moduleName="Probation Tracking & Confirmation"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Probation Tracking & Confirmation (30 / 60 / 90 Day Reviews)
        </h3>
        <p className="text-xs text-slate-500">
          Milestone check-ins, Confirmation / Extension / Termination workflow & Confirmation Letters
        </p>
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={4} />
      ) : error ? (
        <OnboardingErrorState message={error} onRetry={loadCases} />
      ) : cases.length === 0 ? (
        <OnboardingEmptyState
          icon={Award}
          title="No Active Probation Cases"
          description="Employees in their probation window and upcoming confirmation reviews will appear here."
          actionLabel="Refresh"
          onAction={loadCases}
        />
      ) : (
        <div className="space-y-2.5">
          {cases.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {c.employeeName} ({c.employeeCode})
                  </span>
                  <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                    {c.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {c.department} · Manager: {c.reportingManager} · Probation
                  Ends: {c.probationEndDate}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {perm.canApprove && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveId(c.id);
                      setEvalOpen(true);
                    }}
                    className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-500"
                  >
                    Evaluate
                  </button>
                )}
                {c.status === 'Confirmed' && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await onboardingProbationApi.downloadConfirmationLetterPdf(
                          c.id
                        );
                        notify('Downloaded confirmation letter PDF');
                      } catch (err) {
                        notify(
                          err instanceof Error
                            ? err.message
                            : 'Letter download failed'
                        );
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                  >
                    <Download className="h-3 w-3" /> Letter PDF
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <OnboardingModal
        open={evalOpen}
        title="Probation Milestone Review & Confirmation"
        onClose={() => setEvalOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await onboardingProbationApi.evaluateProbation(activeId, {
                milestoneDay,
                ratingOutOf5: rating,
                decision,
                comments,
              });
              notify('Probation evaluation recorded');
              setEvalOpen(false);
              void loadCases();
            } catch (err) {
              notify(
                err instanceof Error
                  ? err.message
                  : 'Probation evaluation failed'
              );
            }
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Milestone Day
              </label>
              <select
                value={milestoneDay}
                onChange={(e) =>
                  setMilestoneDay(Number(e.target.value) as 30 | 60 | 90)
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
              >
                <option value={30}>Day 30 Check-in</option>
                <option value={60}>Day 60 Check-in</option>
                <option value={90}>Day 90 Final Review</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rating (1-5)
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Decision
            </label>
            <select
              value={decision}
              onChange={(e) =>
                setDecision(
                  e.target.value as 'Confirm' | 'Extend' | 'Terminate'
                )
              }
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            >
              <option value="Confirm">Confirm Employment</option>
              <option value="Extend">Extend Probation</option>
              <option value="Terminate">Terminate Probation</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Review Comments
            </label>
            <textarea
              required
              rows={2}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEvalOpen(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Submit Evaluation
            </button>
          </div>
        </form>
      </OnboardingModal>
    </div>
  );
}

// 16. Feedback & Pulse Surveys (30-60-90 Day)
export function FeedbackPulseSurveysModule({
  role,
  notify,
}: OnboardingExperienceModuleProps) {
  const perm = useOnboardingPermission('surveys', role);
  const [workspace, setWorkspace] =
    useState<OnboardingSurveyWorkspaceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [milestone, setMilestone] = useState<'Day1' | 'Week1' | 'Day30' | 'Day90'>('Day30');
  const [eNpsScore, setENpsScore] = useState(9);
  const [feedbackText, setFeedbackText] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  const loadSurveys = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await onboardingSurveysApi.getWorkspace();
      setWorkspace(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load onboarding pulse surveys & eNPS analytics'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadSurveys();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadSurveys]);

  if (!perm.canView) {
    return (
      <OnboardingPermissionDeniedState
        moduleName="Feedback & Pulse Surveys"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Feedback & Pulse Surveys (Day-1 / Week-1 / Day-30 / Day-90 eNPS)
          </h3>
          <p className="text-xs text-slate-500">
            New hire sentiment, eNPS score & backend-extracted feedback themes
          </p>
        </div>
        {perm.canCreate && (
          <button
            type="button"
            onClick={() => setSubmitOpen(true)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            + Submit Pulse Survey
          </button>
        )}
      </div>

      {loading ? (
        <OnboardingSkeletonBlock rows={4} />
      ) : error ? (
        <div className="space-y-3">
          <OnboardingErrorState message={error} onRetry={loadSurveys} />
          {perm.canCreate && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Submit your onboarding milestone pulse feedback
              </span>
              <button
                type="button"
                onClick={() => setSubmitOpen(true)}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                + Submit Pulse Survey
              </button>
            </div>
          )}
        </div>
      ) : !workspace || workspace.responses.length === 0 ? (
        <OnboardingEmptyState
          icon={MessageSquareHeart}
          title="No Pulse Survey Responses"
          description="Day-1, Week-1, Day-30, and Day-90 onboarding pulse survey responses will appear here."
          actionLabel={perm.canCreate ? 'Submit Pulse Survey' : undefined}
          onAction={perm.canCreate ? () => setSubmitOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
              <p className="text-[11px] font-medium text-slate-500">
                Overall Onboarding eNPS
              </p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                +{workspace.overallEnpsScore}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
              <p className="text-[11px] font-medium text-slate-500">
                Survey Response Rate
              </p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {workspace.responseRatePct}%
              </p>
            </div>
          </div>
          {workspace.responses.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {r.joinerNameOrAnon} · {r.milestone}
                </span>
                <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                  eNPS: {r.eNpsScore}/10
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                {r.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      <OnboardingModal
        open={submitOpen}
        title="Submit Onboarding Pulse Survey"
        onClose={() => setSubmitOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await onboardingSurveysApi.submitSurvey({
                milestone,
                eNpsScore,
                feedbackText,
                anonymous,
              });
              notify('Pulse survey feedback recorded');
              setSubmitOpen(false);
              void loadSurveys();
            } catch (err) {
              notify(
                err instanceof Error ? err.message : 'Survey submission failed'
              );
            }
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Milestone
              </label>
              <select
                value={milestone}
                onChange={(e) =>
                  setMilestone(
                    e.target.value as 'Day1' | 'Week1' | 'Day30' | 'Day90'
                  )
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
              >
                <option value="Day1">Day 1</option>
                <option value="Week1">Week 1</option>
                <option value="Day30">Day 30</option>
                <option value="Day90">Day 90</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                eNPS Score (0-10)
              </label>
              <input
                type="number"
                min={0}
                max={10}
                value={eNpsScore}
                onChange={(e) => setENpsScore(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Your Onboarding Feedback
            </label>
            <textarea
              required
              rows={3}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="How was your pre-boarding, IT setup, and team welcome?"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="rounded border-slate-300"
            />
            Submit anonymously
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSubmitOpen(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Submit Feedback
            </button>
          </div>
        </form>
      </OnboardingModal>
    </div>
  );
}
