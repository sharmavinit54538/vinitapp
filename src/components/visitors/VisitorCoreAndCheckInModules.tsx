'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Plus,
  RefreshCw,
  Upload,
  QrCode,
  Tablet,
  UserCheck,
  BellRing,
  Sliders,
  Lock,
  Printer,
  ShieldCheck,
  Search,
} from 'lucide-react';
import {
  VisitorRole,
  VisitorModuleId,
  VisitorDashboardResponse,
  VisitorInvitationRecord,
  WalkInRegistrationRecord,
  KioskDeviceRecord,
  VisitorPassRecord,
  ReceptionDeskEntryRecord,
  HostApprovalRequestRecord,
  VisitorTypeMasterRecord,
  VisitorTypeCategory,
} from '../../types/visitors';
import {
  visitorDashboardApi,
  visitorInvitationsApi,
  visitorWalkInApi,
  visitorKioskApi,
  visitorPassesApi,
  visitorReceptionDeskApi,
  visitorHostApprovalsApi,
  visitorTypesMasterApi,
} from '../../services/visitors';
import {
  VisitorApiError,
  formatVisitorDateTime,
} from '../../services/visitors/client';
import { useVisitorPermission } from '../../hooks/useVisitorPermission';
import {
  VisitorSkeletonBlock,
  VisitorPermissionDeniedState,
  VisitorErrorState,
  VisitorEmptyState,
  VisitorModal,
} from './VisitorPrimitives';

export interface VisitorModuleProps {
  activeRole: VisitorRole;
  onNavigateModule?: (moduleId: VisitorModuleId) => void;
}

// ============================================================================
// 1. VISITOR DASHBOARD (LIVE STATUS) MODULE
// ============================================================================
export function VisitorDashboardModule({
  activeRole,
  onNavigateModule,
}: VisitorModuleProps) {
  const perm = useVisitorPermission('dashboard', activeRole);
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [visitorTypeFilter, setVisitorTypeFilter] = useState<string>('');
  const [data, setData] = useState<VisitorDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);

  const loadDashboard = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorDashboardApi.getLiveSummary({
        location: locationFilter || undefined,
        visitorType: visitorTypeFilter || undefined,
      });
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load live visitor dashboard')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, locationFilter, visitorTypeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDashboard();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDashboard]);

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="1. Visitor Dashboard (Live Status)"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. Live Visitor Command Center & Occupancy Monitor
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time Who Is Inside, expected arrivals, overstays, watchlist alerts & zone occupancy
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Location / Building filter"
            aria-label="Filter dashboard by location"
            className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <select
            value={visitorTypeFilter}
            onChange={(e) => setVisitorTypeFilter(e.target.value)}
            aria-label="Filter dashboard by visitor type"
            className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="">All Visitor Types</option>
            <option value="Guest">Guest</option>
            <option value="InterviewCandidate">Interview Candidate</option>
            <option value="Vendor">Vendor</option>
            <option value="Contractor">Contractor</option>
            <option value="Delivery">Delivery</option>
            <option value="Auditor">Auditor</option>
            <option value="VIP">VIP</option>
          </select>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="h-9 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Live</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => onNavigateModule?.('pre-registration')}
          className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/60 text-left"
        >
          <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
            Invite Visitor
          </p>
          <p className="text-[11px] text-slate-500">2. Pre-Registration</p>
        </button>
        <button
          type="button"
          onClick={() => onNavigateModule?.('walk-in')}
          className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/60 text-left"
        >
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
            Walk-in Check-In
          </p>
          <p className="text-[11px] text-slate-500">3. Walk-in Desk</p>
        </button>
        <button
          type="button"
          onClick={() => onNavigateModule?.('kiosk')}
          className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60 text-left"
        >
          <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
            Launch Kiosk Mode
          </p>
          <p className="text-[11px] text-slate-500">4. Self Check-in Kiosk</p>
        </button>
        <button
          type="button"
          onClick={() => onNavigateModule?.('evacuation')}
          className="p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/60 text-left"
        >
          <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
            Emergency Roll-Call
          </p>
          <p className="text-[11px] text-slate-500">16. Evacuation Console</p>
        </button>
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={9} />
      ) : error ? (
        <VisitorErrorState
          error={error}
          onRetry={() => void loadDashboard()}
          actionLabel="Open Reception Desk"
          onAction={() => onNavigateModule?.('reception-desk')}
        />
      ) : !data ? (
        <VisitorEmptyState
          icon={Users}
          title="No Live Visitor Telemetry Returned"
          description="Connect to the Visitor Management REST API to view real-time check-ins, overstays, and building occupancy."
          actionLabel="Create Pre-Registration Invite"
          onAction={() => onNavigateModule?.('pre-registration')}
        />
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Expected Today', val: data.kpis.expectedToday },
              { label: 'Currently Inside', val: data.kpis.currentlyInside },
              { label: 'Checked-In Today', val: data.kpis.checkedInToday },
              { label: 'Checked-Out', val: data.kpis.checkedOutToday },
              { label: 'Pending Approvals', val: data.kpis.pendingApprovals },
              { label: 'Overstays', val: data.kpis.overstays },
              { label: 'No-Shows', val: data.kpis.noShows },
              {
                label: 'Blacklisted Attempts',
                val: data.kpis.blacklistedAttempts,
              },
              {
                label: 'Avg Duration (m)',
                val: data.kpis.avgVisitDurationMinutes,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
              >
                <p className="text-[11px] text-slate-500">{item.label}</p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {item.val}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 2. PRE-REGISTRATION / INVITATIONS MODULE
// ============================================================================
export function PreRegistrationInvitationsModule({
  activeRole,
}: VisitorModuleProps) {
  const perm = useVisitorPermission('pre-registration', activeRole);
  const [invitations, setInvitations] = useState<VisitorInvitationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [bulkOpen, setBulkOpen] = useState<boolean>(false);
  const [visitorName, setVisitorName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [visitorType, setVisitorType] = useState<VisitorTypeCategory>('Guest');
  const [purpose, setPurpose] = useState<string>('');
  const [locationBuilding, setLocationBuilding] = useState<string>('');
  const [windowStart, setWindowStart] = useState<string>('');
  const [windowEnd, setWindowEnd] = useState<string>('');
  const [recurringPattern, setRecurringPattern] = useState<
    'OneTime' | 'Daily' | 'Weekly' | 'LongTermContractor'
  >('OneTime');
  const [ndaRequired, setNdaRequired] = useState<boolean>(true);
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadInvitations = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorInvitationsApi.listInvitations();
      setInvitations(res.items);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load invitations')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadInvitations();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadInvitations]);

  const handleCreateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Sending invitation & generating QR pass...');
    try {
      await visitorInvitationsApi.createInvitation({
        visitorName,
        email,
        phone,
        company,
        visitorType,
        purpose,
        locationBuilding,
        allowedAreas: ['LOBBY'],
        windowStart,
        windowEnd,
        recurringPattern,
        ndaRequired,
      });
      setModalOpen(false);
      setSubmitStatus('');
      await loadInvitations();
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Invite failed');
    }
  };

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="2. Pre-Registration / Invitations"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            2. Pre-Registration & Host Invitations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Single & bulk CSV/XLSX invites, recurring contractor passes, NDA requirement & QR pass dispatch
          </p>
        </div>
        {perm.canCreate ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBulkOpen(true)}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Bulk CSV Invite</span>
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Visitor Invite</span>
            </button>
          </div>
        ) : null}
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState
          error={error}
          onRetry={() => void loadInvitations()}
          actionLabel={perm.canCreate ? 'New Visitor Invite' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : invitations.length === 0 ? (
        <VisitorEmptyState
          icon={QrCode}
          title="No Pre-Registered Visitor Invitations"
          description="Send a visitor invitation with an automatic QR pass, calendar invite, and building directions."
          actionLabel={perm.canCreate ? 'New Visitor Invite' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {invitations.map((inv) => (
            <div
              key={inv.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {inv.visitorName} ({inv.visitorType}) — {inv.inviteCode}
                </p>
                <p className="text-xs text-slate-500">
                  {inv.maskedEmail} • {inv.maskedPhone} • Host: {inv.hostName} •{' '}
                  {formatVisitorDateTime(inv.windowStart)} • {inv.status}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    void visitorInvitationsApi
                      .performInviteAction(inv.id, { action: 'resend' })
                      .then(() => loadInvitations())
                  }
                  className="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  Resend Pass
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <VisitorModal
        open={modalOpen}
        title="Create Pre-Registration Invitation"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleCreateInvite} className="space-y-3">
          <input
            required
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            placeholder="Visitor Full Name"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Visitor Email"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Organization / Company"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <select
              value={visitorType}
              onChange={(e) =>
                setVisitorType(e.target.value as VisitorTypeCategory)
              }
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="Guest">Business Guest</option>
              <option value="InterviewCandidate">Interview Candidate</option>
              <option value="Vendor">Vendor</option>
              <option value="Contractor">Contractor</option>
              <option value="Delivery">Delivery</option>
              <option value="Auditor">Auditor</option>
              <option value="VIP">VIP</option>
              <option value="Government">Government Official</option>
            </select>
          </div>
          <input
            required
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            placeholder="Visit Purpose"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <input
            required
            value={locationBuilding}
            onChange={(e) => setLocationBuilding(e.target.value)}
            placeholder="Site / Building / Floor"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              type="datetime-local"
              value={windowStart}
              onChange={(e) => setWindowStart(e.target.value)}
              aria-label="Visit start date time"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <input
              required
              type="datetime-local"
              value={windowEnd}
              onChange={(e) => setWindowEnd(e.target.value)}
              aria-label="Visit end date time"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          <select
            value={recurringPattern}
            onChange={(e) =>
              setRecurringPattern(
                e.target.value as
                  | 'OneTime'
                  | 'Daily'
                  | 'Weekly'
                  | 'LongTermContractor'
              )
            }
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="OneTime">Single Visit</option>
            <option value="Daily">Daily Recurring</option>
            <option value="Weekly">Weekly Recurring</option>
            <option value="LongTermContractor">Long-Term Contractor Pass</option>
          </select>
          <label className="inline-flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={ndaRequired}
              onChange={(e) => setNdaRequired(e.target.checked)}
            />
            <span>Require NDA E-Signature prior to Badge Issue</span>
          </label>
          {submitStatus ? (
            <p className="text-xs text-rose-600">{submitStatus}</p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Send Invitation & Digital Pass
          </button>
        </form>
      </VisitorModal>

      <VisitorModal
        open={bulkOpen}
        title="Bulk Pre-Registration Invite (CSV / XLSX)"
        onClose={() => setBulkOpen(false)}
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-500">
            Upload a CSV/XLSX file with VisitorName, Email, Phone, Company,
            VisitorType, WindowStart, WindowEnd.
          </p>
          <input
            type="file"
            accept=".csv,.xlsx"
            aria-label="Upload bulk visitor invite CSV"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const fd = new FormData();
              fd.append('file', file);
              try {
                await visitorInvitationsApi.bulkImportCsv(fd);
                setBulkOpen(false);
                await loadInvitations();
              } catch (err) {
                setSubmitStatus(
                  err instanceof Error ? err.message : 'Bulk upload failed'
                );
              }
            }}
          />
        </div>
      </VisitorModal>
    </div>
  );
}

// ============================================================================
// 3. WALK-IN REGISTRATION MODULE
// ============================================================================
export function WalkInRegistrationModule({ activeRole }: VisitorModuleProps) {
  const perm = useVisitorPermission('walk-in', activeRole);
  const [records, setRecords] = useState<WalkInRegistrationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [visitorName, setVisitorName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [company, setCompany] = useState<string>('');
  const [visitorType, setVisitorType] = useState<VisitorTypeCategory>('Guest');
  const [purpose, setPurpose] = useState<string>('');
  const [hostEmployeeCode, setHostEmployeeCode] = useState<string>('');
  const [idDocumentType, setIdDocumentType] = useState<string>('GovID');
  const [idDocumentNumber, setIdDocumentNumber] = useState<string>('');
  const [consentAccepted, setConsentAccepted] = useState<boolean>(true);
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadWalkIns = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorWalkInApi.listWalkIns();
      setRecords(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load walk-in registrations')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadWalkIns();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadWalkIns]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Screening watchlist & notifying host...');
    try {
      await visitorWalkInApi.registerWalkIn({
        visitorName,
        phone,
        email,
        company,
        visitorType,
        purpose,
        hostEmployeeCode,
        idDocumentType,
        idDocumentNumber,
        consentAccepted,
      });
      setModalOpen(false);
      setSubmitStatus('');
      await loadWalkIns();
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Walk-in failed');
    }
  };

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="3. Visitor Registration (Walk-in)"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            3. Walk-in Visitor Registration & ID OCR
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Camera photo & ID capture with OCR confidence, returning visitor recognition & live host approval
          </p>
        </div>
        {perm.canCreate ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Walk-in Visitor</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState
          error={error}
          onRetry={() => void loadWalkIns()}
          actionLabel={perm.canCreate ? 'Register Walk-in Visitor' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : records.length === 0 ? (
        <VisitorEmptyState
          icon={UserCheck}
          title="No Walk-in Registrations Logged"
          description="Register walk-in guests at the reception desk with ID scan, photo capture, and instant host notification."
          actionLabel={perm.canCreate ? 'Register Walk-in Visitor' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {records.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {r.visitorName} ({r.company}) • {r.visitorType}
                </p>
                <p className="text-xs text-slate-500">
                  Phone: {r.maskedPhone} • Host: {r.hostName} • OCR Confidence:{' '}
                  {r.ocrConfidencePct}% • {r.hostApprovalStatus}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <VisitorModal
        open={modalOpen}
        title="Register Walk-in Visitor"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleRegister} className="space-y-3">
          <input
            required
            value={visitorName}
            onChange={(e) => setVisitorName(e.target.value)}
            placeholder="Visitor Full Name"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company / Organization"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <input
              required
              value={hostEmployeeCode}
              onChange={(e) => setHostEmployeeCode(e.target.value)}
              placeholder="Host Employee Code"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <select
              value={visitorType}
              onChange={(e) =>
                setVisitorType(e.target.value as VisitorTypeCategory)
              }
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="Guest">Guest</option>
              <option value="InterviewCandidate">Interview Candidate</option>
              <option value="Vendor">Vendor</option>
              <option value="Contractor">Contractor</option>
              <option value="Delivery">Delivery</option>
            </select>
            <input
              required
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Visit Purpose"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              value={idDocumentType}
              onChange={(e) => setIdDocumentType(e.target.value)}
              placeholder="ID Document Type"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <input
              required
              value={idDocumentNumber}
              onChange={(e) => setIdDocumentNumber(e.target.value)}
              placeholder="ID Number (Masked in Storage)"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          <label className="inline-flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(e) => setConsentAccepted(e.target.checked)}
            />
            <span>Visitor accepted DPDP / Privacy & Security Consent</span>
          </label>
          {submitStatus ? (
            <p className="text-xs text-rose-600">{submitStatus}</p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Submit Walk-in & Notify Host
          </button>
        </form>
      </VisitorModal>
    </div>
  );
}

// ============================================================================
// 4. SELF CHECK-IN KIOSK MODE MODULE
// ============================================================================
export function SelfCheckInKioskModule({ activeRole }: VisitorModuleProps) {
  const perm = useVisitorPermission('kiosk', activeRole);
  const [devices, setDevices] = useState<KioskDeviceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);
  const [lockedDown, setLockedDown] = useState<boolean>(false);
  const [tokenOrOtp, setTokenOrOtp] = useState<string>('');
  const [kioskCode, setKioskCode] = useState<string>('LOBBY-KIOSK-01');
  const [kioskResult, setKioskResult] = useState<string>('');

  const loadDevices = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorKioskApi.listDevices();
      setDevices(res.items);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load kiosk devices')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDevices();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDevices]);

  const handleKioskAction = async (
    actionType: 'qr_scan' | 'otp_verify' | 'walkin_submit' | 'badge_print'
  ) => {
    setKioskResult('Verifying kiosk check-in...');
    try {
      const res = await visitorKioskApi.submitKioskAction({
        kioskCode,
        actionType,
        tokenOrOtp,
      });
      setKioskResult(res.statusMessage);
    } catch (err) {
      setKioskResult(
        err instanceof Error ? err.message : 'Kiosk verification failed'
      );
    }
  };

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="4. Self Check-in Kiosk Mode"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-300">
              Touch-Friendly Lobby Terminal • Idle Auto-Reset Enabled
            </span>
            <h2 className="text-lg font-extrabold mt-0.5">
              4. Self Check-in Kiosk Terminal ({kioskCode})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setLockedDown((prev) => !prev)}
            className="h-9 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{lockedDown ? 'Unlock Kiosk (Admin PIN)' : 'Lockdown Mode'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={kioskCode}
            onChange={(e) => setKioskCode(e.target.value)}
            placeholder="Kiosk Terminal Code"
            aria-label="Kiosk Terminal Code"
            className="h-11 px-3.5 rounded-2xl bg-white/10 border border-white/20 text-white text-xs"
          />
          <input
            value={tokenOrOtp}
            onChange={(e) => setTokenOrOtp(e.target.value)}
            placeholder="Scan QR Pass Code or Enter 6-Digit OTP"
            aria-label="Scan QR Pass Code or Enter 6-Digit OTP"
            className="h-11 px-3.5 rounded-2xl bg-white/10 border border-white/20 text-white text-xs sm:col-span-2"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            type="button"
            onClick={() => void handleKioskAction('qr_scan')}
            className="h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold"
          >
            Scan QR Pass
          </button>
          <button
            type="button"
            onClick={() => void handleKioskAction('otp_verify')}
            className="h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold"
          >
            Verify Phone OTP
          </button>
          <button
            type="button"
            onClick={() => void handleKioskAction('walkin_submit')}
            className="h-12 rounded-2xl bg-white/15 hover:bg-white/25 text-xs font-bold"
          >
            Walk-In Self Check-In
          </button>
          <button
            type="button"
            onClick={() => void handleKioskAction('badge_print')}
            className="h-12 rounded-2xl bg-amber-600 hover:bg-amber-500 text-xs font-bold inline-flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print Visitor Badge</span>
          </button>
        </div>
        {kioskResult ? (
          <p className="text-xs text-indigo-200 font-semibold">{kioskResult}</p>
        ) : null}
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={3} />
      ) : error ? (
        <VisitorErrorState error={error} onRetry={() => void loadDevices()} />
      ) : devices.length === 0 ? (
        <VisitorEmptyState
          icon={Tablet}
          title="No Registered Kiosk Terminals Returned"
          description="Register lobby tablets or self-service badge kiosks to monitor heartbeat and printer paper status."
          actionLabel="Refresh Kiosk Status"
          onAction={() => void loadDevices()}
        />
      ) : null}
    </div>
  );
}

// ============================================================================
// 5. VISITOR QR / PASS MANAGEMENT MODULE
// ============================================================================
export function VisitorQrPassManagementModule({
  activeRole,
}: VisitorModuleProps) {
  const perm = useVisitorPermission('passes', activeRole);
  const [passes, setPasses] = useState<VisitorPassRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);
  const [scanCode, setScanCode] = useState<string>('');
  const [gateCode, setGateCode] = useState<string>('MAIN-GATE-01');
  const [scanFeedback, setScanFeedback] = useState<string>('');

  const loadPasses = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorPassesApi.listPasses();
      setPasses(res.items);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load visitor passes')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadPasses();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadPasses]);

  const handleGateVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setScanFeedback('Verifying QR pass at gate...');
    try {
      const res = await visitorPassesApi.verifyScanAtGate({
        passCode: scanCode,
        gateCode,
      });
      setScanFeedback(
        `${res.scanResult}: ${res.visitorName} (Allowed: ${res.allowedAreas.join(', ')})`
      );
    } catch (err) {
      setScanFeedback(err instanceof Error ? err.message : 'Scan failed');
    }
  };

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="5. Visitor QR / Pass Management"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            5. Digital QR / Barcode Pass & Gate Verification
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verify QR passes at turnstiles, print/reprint badges, revoke access & report lost badges
          </p>
        </div>
        <form
          onSubmit={handleGateVerify}
          className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
        >
          <input
            required
            value={scanCode}
            onChange={(e) => setScanCode(e.target.value)}
            placeholder="Scan or Enter Pass Code"
            className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <input
            required
            value={gateCode}
            onChange={(e) => setGateCode(e.target.value)}
            placeholder="Gate / Turnstile ID"
            className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <button
            type="submit"
            className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Verify Pass at Gate
          </button>
        </form>
        {scanFeedback ? (
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
            {scanFeedback}
          </p>
        ) : null}
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState error={error} onRetry={() => void loadPasses()} />
      ) : passes.length === 0 ? (
        <VisitorEmptyState
          icon={QrCode}
          title="No Active Visitor Passes Found"
          description="Issued QR/barcode passes appear here with validity windows, allowed zones, and revoke/reprint controls."
          actionLabel="Refresh Passes"
          onAction={() => void loadPasses()}
        />
      ) : (
        <div className="space-y-2.5">
          {passes.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {p.visitorName} ({p.passCode}) — {p.visitorType}
                </p>
                <p className="text-xs text-slate-500">
                  Zones: {p.allowedAreas.join(', ')} • {p.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 6. CHECK-IN & CHECK-OUT (RECEPTION DESK) MODULE
// ============================================================================
export function ReceptionCheckInDeskModule({ activeRole }: VisitorModuleProps) {
  const perm = useVisitorPermission('reception-desk', activeRole);
  const [entries, setEntries] = useState<ReceptionDeskEntryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);

  const loadDeskEntries = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorReceptionDeskApi.listEntries({
        search: searchQuery || undefined,
      });
      setEntries(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load reception desk entries')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDeskEntries();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDeskEntries]);

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="6. Check-in & Check-out (Reception Desk)"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            6. Reception Check-in & Check-out Console
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Expected arrivals, one-click check-in/out, forced check-out with reason, badge return & overstay extension
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, phone, pass..."
              aria-label="Search reception desk entries"
              className="h-9 pl-8 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          <button
            type="button"
            onClick={() => void loadDeskEntries()}
            className="h-9 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Refresh Desk
          </button>
        </div>
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState
          error={error}
          onRetry={() => void loadDeskEntries()}
        />
      ) : entries.length === 0 ? (
        <VisitorEmptyState
          icon={UserCheck}
          title="No Expected or Active Visitors at Desk"
          description="Visitors scheduled for today or currently checked in appear here for one-click reception handling."
          actionLabel="Refresh Reception Desk"
          onAction={() => void loadDeskEntries()}
        />
      ) : (
        <div className="space-y-2.5">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {entry.visitorName} ({entry.passCode}) — Host: {entry.hostName}
                </p>
                <p className="text-xs text-slate-500">
                  Phone: {entry.maskedPhone} • Status: {entry.status}
                </p>
              </div>
              {perm.canEdit ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void visitorReceptionDeskApi
                        .performCheckAction(entry.id, { action: 'check_in' })
                        .then(() => loadDeskEntries())
                    }
                    className="h-8 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                  >
                    Check In
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      void visitorReceptionDeskApi
                        .performCheckAction(entry.id, {
                          action: 'check_out',
                          badgeReturned: true,
                        })
                        .then(() => loadDeskEntries())
                    }
                    className="h-8 px-3 rounded-xl bg-slate-800 text-white text-xs font-bold"
                  >
                    Check Out
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 7. HOST NOTIFICATION & APPROVAL MODULE
// ============================================================================
export function HostNotificationApprovalModule({
  activeRole,
}: VisitorModuleProps) {
  const perm = useVisitorPermission('host-approvals', activeRole);
  const [requests, setRequests] = useState<HostApprovalRequestRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);

  const loadRequests = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorHostApprovalsApi.listHostApprovals();
      setRequests(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load host approval requests')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadRequests();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadRequests]);

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="7. Host Notification & Approval"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            7. Host Arrival Notification & Approval Queue
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Instant host alerts via Email/WhatsApp/SMS/In-App with accept/decline/reschedule & delegate escalation
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadRequests()}
          className="h-9 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Refresh Queue
        </button>
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState error={error} onRetry={() => void loadRequests()} />
      ) : requests.length === 0 ? (
        <VisitorEmptyState
          icon={BellRing}
          title="No Pending Host Arrival Approvals"
          description="Walk-in or unscheduled arrivals awaiting host confirmation appear here with live SLA countdowns."
          actionLabel="Refresh Queue"
          onAction={() => void loadRequests()}
        />
      ) : (
        <div className="space-y-2.5">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {req.visitorName} ({req.company}) → Host: {req.hostName}
                </p>
                <p className="text-xs text-slate-500">
                  Channel: {req.channelNotified} • Timeout:{' '}
                  {req.timeoutMinutesRemaining}m • {req.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 8. VISITOR TYPES & PURPOSE MASTER MODULE
// ============================================================================
export function VisitorTypesPurposeMasterModule({
  activeRole,
}: VisitorModuleProps) {
  const perm = useVisitorPermission('visitor-types', activeRole);
  const [types, setTypes] = useState<VisitorTypeMasterRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');
  const [category, setCategory] = useState<VisitorTypeCategory>('Guest');
  const [defaultPurpose, setDefaultPurpose] = useState<string>('');
  const [maxDurationHours, setMaxDurationHours] = useState<string>('8');
  const [badgeColor, setBadgeColor] = useState<string>('#4F46E5');
  const [effectiveFrom, setEffectiveFrom] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadTypes = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorTypesMasterApi.listTypes();
      setTypes(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load visitor types master')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadTypes();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTypes]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Saving visitor type master...');
    try {
      await visitorTypesMasterApi.createType({
        code,
        category,
        defaultPurpose,
        requireIdScan: true,
        requireNdaSign: true,
        requirePhoto: true,
        requireEscort: false,
        requireHostApproval: true,
        maxDurationHours: Number(maxDurationHours),
        badgeColor,
        effectiveFrom,
      });
      setModalOpen(false);
      setSubmitStatus('');
      await loadTypes();
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Save failed');
    }
  };

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="8. Visitor Types & Purpose Master"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            8. Visitor Types & Purpose Master
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure ID scan, NDA, photo, escort, max duration & badge color rules per visitor category
          </p>
        </div>
        {perm.canCreate ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Visitor Type Rule</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState
          error={error}
          onRetry={() => void loadTypes()}
          actionLabel={perm.canCreate ? 'Add Visitor Type Rule' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : types.length === 0 ? (
        <VisitorEmptyState
          icon={Sliders}
          title="No Visitor Type Rules Configured"
          description="Define security and compliance rules for Guests, Candidates, Vendors, Contractors, Deliveries, and VIPs."
          actionLabel={perm.canCreate ? 'Add Visitor Type Rule' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {types.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {t.category} ({t.code}) — Max {t.maxDurationHours}h
                </p>
                <p className="text-xs text-slate-500">
                  Purpose: {t.defaultPurpose} • Effective: {t.effectiveFrom}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <VisitorModal
        open={modalOpen}
        title="Configure Visitor Type & Security Rule"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Rule Code"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as VisitorTypeCategory)
              }
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="Guest">Guest</option>
              <option value="InterviewCandidate">Interview Candidate</option>
              <option value="Vendor">Vendor</option>
              <option value="Contractor">Contractor</option>
              <option value="Delivery">Delivery</option>
              <option value="Auditor">Auditor</option>
              <option value="VIP">VIP</option>
              <option value="Government">Government</option>
            </select>
          </div>
          <input
            required
            value={defaultPurpose}
            onChange={(e) => setDefaultPurpose(e.target.value)}
            placeholder="Default Purpose Description"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              required
              type="number"
              value={maxDurationHours}
              onChange={(e) => setMaxDurationHours(e.target.value)}
              placeholder="Max Hours"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <input
              required
              value={badgeColor}
              onChange={(e) => setBadgeColor(e.target.value)}
              placeholder="Badge Hex"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <input
              required
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              aria-label="Effective from date"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          {submitStatus ? (
            <p className="text-xs text-rose-600">{submitStatus}</p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Save Visitor Type Rule
          </button>
        </form>
      </VisitorModal>
    </div>
  );
}
