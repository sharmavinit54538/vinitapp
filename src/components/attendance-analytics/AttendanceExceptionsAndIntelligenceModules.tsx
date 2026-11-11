'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AlertOctagon,
  Download,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Target,
  TrendingUp,
  UserCheck,
  Wifi,
} from 'lucide-react';
import {
  AttendanceAnalyticsRole,
  AttendanceAnomalyRecord,
  AttendanceDrillDownRecord,
  AttendancePayrollImpactResponse,
  AttendanceSharedFilterParams,
  BenchmarkTargetRecord,
  DeviceSourceAnalyticsResponse,
  EmployeeAttendanceProfileResponse,
  PaginatedAttendanceResponse,
  RegularizationExceptionAnalyticsResponse,
  TrendsForecastingResponse,
} from '../../types/attendanceAnalytics';
import {
  attendanceAnomaliesApi,
  attendanceBenchmarksTargetsApi,
  attendanceDevicesSourcesApi,
  attendanceDrillDownApi,
  attendancePayrollImpactApi,
  attendanceProfilesApi,
  attendanceRegularizationsApi,
  attendanceTrendsForecastingApi,
  formatAttendanceDateOnly,
} from '../../services/attendance-analytics';
import { useAttendanceAnalyticsPermission } from '../../hooks/useAttendanceAnalyticsPermission';
import {
  AccessibleChartTableFallback,
  AttendanceEmptyState,
  AttendanceErrorState,
  AttendanceMetricFreshnessBadge,
  AttendanceModal,
  AttendancePermissionDeniedState,
  AttendanceSkeletonBlock,
} from './AttendanceAnalyticsPrimitives';

interface SharedModuleProps {
  role: AttendanceAnalyticsRole;
  filters: AttendanceSharedFilterParams;
}

// ============================================================================
// 9. Regularization & Exception Analytics
// ============================================================================
export function RegularizationExceptionAnalyticsModule({
  role,
  filters,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'regularizations');
  const [data, setData] =
    useState<RegularizationExceptionAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceRegularizationsApi.getAnalytics(filters);
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load regularization & exception analytics'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  if (!perm.canView) {
    return (
      <AttendancePermissionDeniedState
        role={role}
        moduleTitle="9. Regularization & Exception Analytics"
        scopeDescription={perm.scopeDescription}
      />
    );
  }
  if (loading) return <AttendanceSkeletonBlock rows={4} />;
  if (error) {
    return (
      <AttendanceErrorState
        title="Unable to load Regularization & Exception Analytics"
        message={error}
        onRetry={() => void loadData()}
      />
    );
  }
  if (!data) {
    return (
      <AttendanceEmptyState
        title="No Regularization Requests Found"
        description="No missing punch or regularization turnaround records returned."
        ctaLabel="Reload Regularizations"
        onCta={() => void loadData()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <AttendanceMetricFreshnessBadge metadata={data.metadata} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Total Requests</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.totalRequests}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Avg Turnaround (TAT)</p>
          <p className="mt-1 text-lg font-bold text-indigo-700">
            {data.avgTurnaroundHours}h
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Rejection Rate</p>
          <p className="mt-1 text-lg font-bold text-rose-600">
            {data.rejectionRatePct}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Missing Punches</p>
          <p className="mt-1 text-lg font-bold text-amber-600">
            {data.missingPunchCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Manual vs Auto Ratio</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.manualEntryRatioPct}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">SLA Breaches</p>
          <p className="mt-1 text-lg font-bold text-rose-700">
            {data.slaBreachesCount}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 10. Biometric / Device & Source Analytics
// ============================================================================
export function BiometricDeviceSourceModule({
  role,
  filters,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'devices-sources');
  const [data, setData] = useState<DeviceSourceAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resyncModalOpen, setResyncModalOpen] = useState(false);
  const [deviceIdInput, setDeviceIdInput] = useState('');
  const [resyncFeedback, setResyncFeedback] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceDevicesSourcesApi.getAnalytics(filters);
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load biometric device & punch source telemetry'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleResyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceIdInput.trim()) return;
    setResyncFeedback('Requesting audited device resync...');
    try {
      const res = await attendanceDevicesSourcesApi.triggerDeviceResync(
        deviceIdInput.trim()
      );
      setResyncFeedback(`Device resync status: ${res.status}`);
    } catch (err) {
      setResyncFeedback(
        err instanceof Error ? err.message : 'Device resync request failed'
      );
    }
  };

  if (!perm.canView) {
    return (
      <AttendancePermissionDeniedState
        role={role}
        moduleTitle="10. Biometric / Device & Source Analytics"
        scopeDescription={perm.scopeDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <AttendanceSkeletonBlock rows={4} />
      ) : error ? (
        <AttendanceErrorState
          title="Unable to load Biometric Device & Source Telemetry"
          message={error}
          onRetry={() => void loadData()}
          actionLabel={perm.canManage ? 'Trigger Device Resync' : undefined}
          onAction={perm.canManage ? () => setResyncModalOpen(true) : undefined}
        />
      ) : !data ? (
        <AttendanceEmptyState
          title="No Biometric or Mobile Source Telemetry"
          description="No registered attendance terminals or mobile geo sources returned."
          ctaLabel={
            perm.canManage ? 'Trigger Device Resync' : 'Refresh Devices'
          }
          onCta={() =>
            perm.canManage ? setResyncModalOpen(true) : void loadData()
          }
        />
      ) : (
        <>
          <AttendanceMetricFreshnessBadge metadata={data.metadata} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">Online Terminals</p>
              <p className="mt-1 text-lg font-bold text-emerald-600">
                {data.onlineDevicesCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">Offline Terminals</p>
              <p className="mt-1 text-lg font-bold text-rose-600">
                {data.offlineDevicesCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">
                Spoof / Liveness Alerts
              </p>
              <p className="mt-1 text-lg font-bold text-amber-600">
                {data.spoofLivenessFailuresCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">
                Duplicate / Failed Punches
              </p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {data.duplicateFailedPunchesCount}
              </p>
            </div>
          </div>

          <AccessibleChartTableFallback
            title="Punch Source Mix (Biometric / Face AI / RFID / Mobile / Web)"
            points={data.sourceMix}
            unit="%"
          />
        </>
      )}

      <AttendanceModal
        open={resyncModalOpen}
        title="Trigger Audited Biometric Terminal Resync"
        onClose={() => setResyncModalOpen(false)}
      >
        <form onSubmit={handleResyncSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Terminal / Device Code
            </label>
            <input
              type="text"
              value={deviceIdInput}
              onChange={(e) => setDeviceIdInput(e.target.value)}
              placeholder="Enter terminal ID from registry"
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
          {resyncFeedback && (
            <p className="rounded-lg bg-slate-100 p-2 text-xs text-slate-700">
              {resyncFeedback}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setResyncModalOpen(false)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              <Wifi className="h-3.5 w-3.5" />
              Request Device Resync
            </button>
          </div>
        </form>
      </AttendanceModal>
    </div>
  );
}

// ============================================================================
// 11. Anomaly, Fraud & Compliance Detection
// ============================================================================
export function AnomalyFraudComplianceModule({
  role,
  filters,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'anomalies');
  const [data, setData] =
    useState<PaginatedAttendanceResponse<AttendanceAnomalyRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [anomalyId, setAnomalyId] = useState('');
  const [decision, setDecision] = useState<
    'Confirmed' | 'Dismissed' | 'Escalated'
  >('Confirmed');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatusMsg, setReviewStatusMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceAnomaliesApi.list(filters);
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load anomaly & compliance flags'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!anomalyId.trim() || !reviewNotes.trim()) return;
    setReviewStatusMsg('Submitting anomaly review decision...');
    try {
      await attendanceAnomaliesApi.reviewAnomaly(anomalyId.trim(), {
        decision,
        reviewNotes: reviewNotes.trim(),
      });
      setReviewStatusMsg('Anomaly review recorded in audit log.');
      void loadData();
    } catch (err) {
      setReviewStatusMsg(
        err instanceof Error ? err.message : 'Anomaly review submission failed'
      );
    }
  };

  if (!perm.canView) {
    return (
      <AttendancePermissionDeniedState
        role={role}
        moduleTitle="11. Anomaly, Fraud & Compliance Detection"
        scopeDescription={perm.scopeDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 px-4 py-2.5 text-xs text-indigo-900">
        <span className="font-bold">Decision-Support Notice:</span> Anomaly
        flags (Buddy-Punching Indicators, Impossible Travel, Identical Punch
        Times, Statutory Breach) are analytical indicators only and never
        auto-penalize employees without human HR/Admin confirmation.
      </div>

      {loading ? (
        <AttendanceSkeletonBlock rows={4} />
      ) : error ? (
        <AttendanceErrorState
          title="Unable to load Anomaly & Compliance Detection"
          message={error}
          onRetry={() => void loadData()}
          actionLabel={
            perm.canReviewAnomalies ? 'Review Flagged Anomaly' : undefined
          }
          onAction={
            perm.canReviewAnomalies
              ? () => setReviewModalOpen(true)
              : undefined
          }
        />
      ) : !data || data.items.length === 0 ? (
        <AttendanceEmptyState
          title="Zero Unresolved Anomalies Flagged"
          description="No buddy-punching, impossible travel, or statutory working-hour breaches detected."
          ctaLabel={
            perm.canReviewAnomalies ? 'Log Anomaly Review' : 'Refresh Anomalies'
          }
          onCta={() =>
            perm.canReviewAnomalies ? setReviewModalOpen(true) : void loadData()
          }
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <h4 className="text-xs font-bold text-slate-900">
              Flagged Anomalies ({data.meta.totalItems})
            </h4>
            {perm.canReviewAnomalies && (
              <button
                type="button"
                onClick={() => setReviewModalOpen(true)}
                className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Review Anomaly
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <th className="py-2">Code</th>
                  <th className="py-2">Employee</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Severity</th>
                  <th className="py-2">Evidence</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 font-mono font-semibold text-slate-900">
                      {item.anomalyCode}
                    </td>
                    <td className="py-2 text-slate-800">
                      {item.employeeName} ({item.employeeCode})
                    </td>
                    <td className="py-2 text-slate-700">
                      {item.anomalyCategory}
                    </td>
                    <td className="py-2 font-bold text-rose-600">
                      {item.severity}
                    </td>
                    <td className="py-2 text-slate-600">
                      {item.evidenceSummary}
                    </td>
                    <td className="py-2 font-semibold text-indigo-700">
                      {item.reviewStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AttendanceModal
        open={reviewModalOpen}
        title="Confirm / Dismiss / Escalate Attendance Anomaly"
        onClose={() => setReviewModalOpen(false)}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Anomaly ID / Code
            </label>
            <input
              type="text"
              value={anomalyId}
              onChange={(e) => setAnomalyId(e.target.value)}
              placeholder="Enter anomaly ID"
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Review Decision
            </label>
            <select
              value={decision}
              onChange={(e) =>
                setDecision(
                  e.target.value as 'Confirmed' | 'Dismissed' | 'Escalated'
                )
              }
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            >
              <option value="Confirmed">Confirmed — True Compliance Hit</option>
              <option value="Dismissed">Dismissed — False Positive</option>
              <option value="Escalated">
                Escalated — Forward to Regional HR / Audit
              </option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Mandatory Audit Review Notes
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
              required
              placeholder="Document investigation findings..."
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
          {reviewStatusMsg && (
            <p className="rounded-lg bg-slate-100 p-2 text-xs text-slate-700">
              {reviewStatusMsg}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReviewModalOpen(false)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Submit Decision
            </button>
          </div>
        </form>
      </AttendanceModal>
    </div>
  );
}

// ============================================================================
// 12. Attendance-to-Payroll Impact (LOP & Pay Days)
// ============================================================================
export function AttendancePayrollImpactModule({
  role,
  filters,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'payroll-impact');
  const [data, setData] = useState<AttendancePayrollImpactResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reconcileOpen, setReconcileOpen] = useState(false);
  const [cycleMonth, setCycleMonth] = useState('2026-11');
  const [reconcileMsg, setReconcileMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendancePayrollImpactApi.getImpact({
        ...filters,
        cycleMonth,
      });
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load Attendance-to-Payroll LOP & Payable Days impact'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, filters, cycleMonth]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleReconcile = async (e: React.FormEvent) => {
    e.preventDefault();
    setReconcileMsg('Running Attendance vs Payroll Pay Run reconciliation...');
    try {
      const res =
        await attendancePayrollImpactApi.reconcileWithPayroll(cycleMonth);
      setReconcileMsg(
        `Reconciled ${res.reconciledCount} employee payable-day records.`
      );
    } catch (err) {
      setReconcileMsg(
        err instanceof Error ? err.message : 'Payroll reconciliation failed'
      );
    }
  };

  if (!perm.canView) {
    return (
      <AttendancePermissionDeniedState
        role={role}
        moduleTitle="12. Attendance-to-Payroll Impact (LOP & Pay Days)"
        scopeDescription={perm.scopeDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <AttendanceSkeletonBlock rows={4} />
      ) : error ? (
        <AttendanceErrorState
          title="Unable to load Attendance-to-Payroll Impact"
          message={error}
          onRetry={() => void loadData()}
          actionLabel={
            perm.canManage ? 'Reconcile LOP & Payable Days' : undefined
          }
          onAction={perm.canManage ? () => setReconcileOpen(true) : undefined}
        />
      ) : !data ? (
        <AttendanceEmptyState
          title="No Payroll Impact Summary for Selected Cycle"
          description="No LOP or payable day calculations returned for this pay cycle."
          ctaLabel={
            perm.canManage ? 'Reconcile LOP & Payable Days' : 'Reload Impact'
          }
          onCta={() =>
            perm.canManage ? setReconcileOpen(true) : void loadData()
          }
        />
      ) : (
        <>
          <AttendanceMetricFreshnessBadge metadata={data.metadata} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">Attendance Lock</p>
              <p className="mt-1 text-sm font-bold text-indigo-700">
                {data.attendanceLockStatus}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">Total LOP Days</p>
              <p className="mt-1 text-lg font-bold text-rose-600">
                {data.totalLopDays}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">Blocking Exceptions</p>
              <p className="mt-1 text-lg font-bold text-amber-600">
                {data.blockingExceptionsCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">Reconciled Employees</p>
              <p className="mt-1 text-lg font-bold text-emerald-700">
                {data.reconciledEmployeesCount}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">Pay Run Variances</p>
              <p className="mt-1 text-lg font-bold text-rose-700">
                {data.varianceCount}
              </p>
            </div>
          </div>
        </>
      )}

      <AttendanceModal
        open={reconcileOpen}
        title="Reconcile Attendance Payable Days with Payroll Pay Run"
        onClose={() => setReconcileOpen(false)}
      >
        <form onSubmit={handleReconcile} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Payroll Cycle Month
            </label>
            <input
              type="month"
              value={cycleMonth}
              onChange={(e) => setCycleMonth(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
          {reconcileMsg && (
            <p className="rounded-lg bg-slate-100 p-2 text-xs text-slate-700">
              {reconcileMsg}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReconcileOpen(false)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              Close
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Execute Reconciliation
            </button>
          </div>
        </form>
      </AttendanceModal>
    </div>
  );
}

// ============================================================================
// 13. Employee & Team Attendance Profiles
// ============================================================================
export function EmployeeTeamAttendanceProfilesModule({
  role,
  filters,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'profiles');
  const [employeeCode, setEmployeeCode] = useState('');
  const [submittedCode, setSubmittedCode] = useState('');
  const [data, setData] = useState<EmployeeAttendanceProfileResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(
    async (codeToFetch: string) => {
      if (!perm.canView || !codeToFetch.trim()) return;
      setLoading(true);
      setError(null);
      try {
        const res = await attendanceProfilesApi.getEmployeeProfile(
          codeToFetch.trim(),
          filters
        );
        setData(res);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load employee attendance profile'
        );
      } finally {
        setLoading(false);
      }
    },
    [perm.canView, filters]
  );

  useEffect(() => {
    if (!submittedCode) return;
    const timer = setTimeout(() => {
      void loadProfile(submittedCode);
    }, 0);
    return () => clearTimeout(timer);
  }, [submittedCode, loadProfile]);

  if (!perm.canView) {
    return (
      <AttendancePermissionDeniedState
        role={role}
        moduleTitle="13. Employee & Team Attendance Profiles"
        scopeDescription={perm.scopeDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmittedCode(employeeCode.trim());
        }}
        className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={employeeCode}
            onChange={(e) => setEmployeeCode(e.target.value)}
            placeholder="Enter Employee Code to inspect 360° Attendance Profile..."
            className="w-full rounded-xl border border-slate-200 py-2 pr-3 pl-9 text-xs"
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          Lookup Profile
        </button>
      </form>

      {loading ? (
        <AttendanceSkeletonBlock rows={4} />
      ) : error ? (
        <AttendanceErrorState
          title="Unable to load Employee Attendance Profile"
          message={error}
          onRetry={() => void loadProfile(submittedCode)}
        />
      ) : !data ? (
        <AttendanceEmptyState
          title="Search an Employee Code Above"
          description="Enter an employee code to fetch their attendance score, punch timeline, late marks, and overtime summary from the API."
        />
      ) : (
        <div className="space-y-4">
          <AttendanceMetricFreshnessBadge metadata={data.metadata} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">Attendance Score</p>
              <p className="mt-1 text-lg font-bold text-indigo-700">
                {data.attendanceScore}/100
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">Present Days</p>
              <p className="mt-1 text-lg font-bold text-emerald-700">
                {data.presentDays}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">Late Marks</p>
              <p className="mt-1 text-lg font-bold text-amber-600">
                {data.lateMarks}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">Leave Days</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {data.leaveDays}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">Overtime Hours</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {data.overtimeHours}h
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900">
              Recent Punch Timeline — {data.employeeName} ({data.employeeCode})
            </h4>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                    <th className="py-2">Date</th>
                    <th className="py-2">Shift</th>
                    <th className="py-2">In / Out</th>
                    <th className="py-2">Hours</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentPunches.map((p, i) => (
                    <tr key={`${p.dateOnly}-${i}`}>
                      <td className="py-2 font-medium text-slate-900">
                        {formatAttendanceDateOnly(p.dateOnly)}
                      </td>
                      <td className="py-2 text-slate-600">{p.shiftCode}</td>
                      <td className="py-2 font-mono text-slate-700">
                        {p.inTime} – {p.outTime}
                      </td>
                      <td className="py-2 text-slate-700">{p.workingHours}h</td>
                      <td className="py-2 font-semibold text-indigo-700">
                        {p.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 14. Trends, Patterns & Forecasting
// ============================================================================
export function TrendsPatternsForecastingModule({
  role,
  filters,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'trends-forecasting');
  const [data, setData] = useState<TrendsForecastingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceTrendsForecastingApi.getForecasts(filters);
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load attendance trends & 30-day forecasts'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  if (!perm.canView) {
    return (
      <AttendancePermissionDeniedState
        role={role}
        moduleTitle="14. Trends, Patterns & Forecasting"
        scopeDescription={perm.scopeDescription}
      />
    );
  }
  if (loading) return <AttendanceSkeletonBlock rows={4} />;
  if (error) {
    return (
      <AttendanceErrorState
        title="Unable to load Attendance Trends & Forecasting"
        message={error}
        onRetry={() => void loadData()}
      />
    );
  }
  if (!data) {
    return (
      <AttendanceEmptyState
        title="No Forecasting Series Returned"
        description="Backend forecasting engine returned no data for this filter scope."
        ctaLabel="Reload Forecast"
        onCta={() => void loadData()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <AttendanceMetricFreshnessBadge metadata={data.metadata} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Week-over-Week Delta</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.weekOverWeekDeltaPct}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Year-over-Year Delta</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.yearOverYearDeltaPct}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">
            Predicted Absenteeism (30d)
          </p>
          <p className="mt-1 text-lg font-bold text-amber-600">
            {data.predictedAbsenteeismNext30dPct}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Predicted Overtime (30d)</p>
          <p className="mt-1 text-lg font-bold text-indigo-700">
            {data.predictedOvertimeHoursNext30d}h
          </p>
        </div>
      </div>

      <AccessibleChartTableFallback
        title="30-Day Shift Staffing Requirement Forecast"
        points={data.staffingRequirementForecast}
      />
    </div>
  );
}

// ============================================================================
// 15. Benchmarking & Targets
// ============================================================================
export function BenchmarkingTargetsModule({
  role,
  filters,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'benchmarks-targets');
  const [data, setData] =
    useState<PaginatedAttendanceResponse<BenchmarkTargetRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [metricKey, setMetricKey] = useState<
    | 'PunctualityRate'
    | 'AbsenteeismRate'
    | 'OvertimeCapHours'
    | 'HybridOfficeDays'
  >('PunctualityRate');
  const [scopeDept, setScopeDept] = useState('');
  const [targetVal, setTargetVal] = useState('95');
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceBenchmarksTargetsApi.list(filters);
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load benchmarking & target KPIs'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleCreateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scopeDept.trim()) return;
    setSaveMsg('Saving attendance target...');
    try {
      await attendanceBenchmarksTargetsApi.createTarget({
        metricKey,
        scopeDepartmentOrLocation: scopeDept.trim(),
        targetValue: Number(targetVal),
      });
      setSaveMsg('Target saved.');
      void loadData();
    } catch (err) {
      setSaveMsg(err instanceof Error ? err.message : 'Failed to save target');
    }
  };

  if (!perm.canView) {
    return (
      <AttendancePermissionDeniedState
        role={role}
        moduleTitle="15. Benchmarking & Targets"
        scopeDescription={perm.scopeDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <AttendanceSkeletonBlock rows={4} />
      ) : error ? (
        <AttendanceErrorState
          title="Unable to load Benchmarking & Targets"
          message={error}
          onRetry={() => void loadData()}
          actionLabel={perm.canManage ? 'Configure KPI Target' : undefined}
          onAction={perm.canManage ? () => setModalOpen(true) : undefined}
        />
      ) : !data || data.items.length === 0 ? (
        <AttendanceEmptyState
          title="No Attendance Targets Configured"
          description="Define punctuality, absenteeism, overtime cap, and hybrid office-day targets to track RAG status."
          ctaLabel={
            perm.canManage ? 'Configure KPI Target' : 'Reload Benchmarks'
          }
          onCta={() => (perm.canManage ? setModalOpen(true) : void loadData())}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between pb-3">
            <h4 className="text-xs font-bold text-slate-900">
              Internal Benchmarks & Target RAG Status
            </h4>
            {perm.canManage && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Target
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <th className="py-2">Metric</th>
                  <th className="py-2">Department / Location</th>
                  <th className="py-2">Target</th>
                  <th className="py-2">Actual</th>
                  <th className="py-2">RAG Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 font-semibold text-slate-900">
                      {item.metricKey}
                    </td>
                    <td className="py-2 text-slate-600">
                      {item.scopeDepartmentOrLocation}
                    </td>
                    <td className="py-2 font-mono text-slate-700">
                      {item.targetValue}
                    </td>
                    <td className="py-2 font-mono font-bold text-slate-900">
                      {item.actualValue}
                    </td>
                    <td className="py-2 font-bold">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] ${
                          item.ragStatus === 'Green'
                            ? 'bg-emerald-50 text-emerald-700'
                            : item.ragStatus === 'Amber'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {item.ragStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AttendanceModal
        open={modalOpen}
        title="Configure Attendance Benchmark Target"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleCreateTarget} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              KPI Metric
            </label>
            <select
              value={metricKey}
              onChange={(e) =>
                setMetricKey(
                  e.target.value as
                    | 'PunctualityRate'
                    | 'AbsenteeismRate'
                    | 'OvertimeCapHours'
                    | 'HybridOfficeDays'
                )
              }
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            >
              <option value="PunctualityRate">Punctuality Rate (%)</option>
              <option value="AbsenteeismRate">Absenteeism Rate (%)</option>
              <option value="OvertimeCapHours">Overtime Cap (Hours)</option>
              <option value="HybridOfficeDays">
                Hybrid Office Days / Week
              </option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Department or Location Scope
            </label>
            <input
              type="text"
              value={scopeDept}
              onChange={(e) => setScopeDept(e.target.value)}
              placeholder="e.g. Engineering / Bengaluru"
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Target Value
            </label>
            <input
              type="number"
              step="0.1"
              value={targetVal}
              onChange={(e) => setTargetVal(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
          {saveMsg && (
            <p className="rounded-lg bg-slate-100 p-2 text-xs text-slate-700">
              {saveMsg}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              Close
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Save Target
            </button>
          </div>
        </form>
      </AttendanceModal>
    </div>
  );
}

// ============================================================================
// 16. Drill-down & Record Explorer
// ============================================================================
export function DrillDownRecordExplorerModule({
  role,
  filters,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'drill-down');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [data, setData] =
    useState<PaginatedAttendanceResponse<AttendanceDrillDownRecord> | null>(
      null
    );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceDrillDownApi.listRecords({
        ...filters,
        page,
        pageSize: 25,
        search,
      });
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load drill-down attendance records'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, filters, page, search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadData]);

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf') => {
    setExportError(null);
    try {
      await attendanceDrillDownApi.exportRecords(format, filters);
    } catch (err) {
      setExportError(
        err instanceof Error ? err.message : `Export (${format}) failed`
      );
    }
  };

  if (!perm.canView) {
    return (
      <AttendancePermissionDeniedState
        role={role}
        moduleTitle="16. Drill-down & Record Explorer"
        scopeDescription={perm.scopeDescription}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <span className="font-bold text-slate-900">Drill-down Trail:</span>
          <span>Organization</span>
          <span>/</span>
          <span>{filters.department || 'All Departments'}</span>
          <span>/</span>
          <span>{filters.location || 'All Locations'}</span>
          <span>/</span>
          <span className="font-semibold text-indigo-700">
            Server-Paginated Punch Logs
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by employee or shift..."
            className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs"
          />
          {perm.canExport && (
            <>
              <button
                type="button"
                onClick={() => void handleExport('csv')}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <Download className="h-3.5 w-3.5" />
                CSV
              </button>
              <button
                type="button"
                onClick={() => void handleExport('xlsx')}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                XLSX
              </button>
            </>
          )}
        </div>
      </div>

      {exportError && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {exportError}
        </p>
      )}

      {loading ? (
        <AttendanceSkeletonBlock rows={5} />
      ) : error ? (
        <AttendanceErrorState
          title="Unable to load Drill-down Attendance Records"
          message={error}
          onRetry={() => void loadData()}
        />
      ) : !data || data.items.length === 0 ? (
        <AttendanceEmptyState
          title="No Underlying Punch Records Found"
          description="No individual attendance records matched your drill-down filter."
          ctaLabel="Reset Search & Reload"
          onCta={() => {
            setSearch('');
            setPage(1);
            void loadData();
          }}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                  <th className="py-2">Date</th>
                  <th className="py-2">Employee</th>
                  <th className="py-2">Shift</th>
                  <th className="py-2">Punch In / Out</th>
                  <th className="py-2">Hours</th>
                  <th className="py-2">Source</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((rec) => (
                  <tr key={rec.id}>
                    <td className="py-2 font-medium text-slate-900">
                      {formatAttendanceDateOnly(rec.dateOnly)}
                    </td>
                    <td className="py-2 text-slate-800">
                      {rec.employeeName} ({rec.employeeCode})
                    </td>
                    <td className="py-2 text-slate-600">{rec.shiftCode}</td>
                    <td className="py-2 font-mono text-slate-700">
                      {rec.punchIn} – {rec.punchOut}
                    </td>
                    <td className="py-2 text-slate-700">{rec.workingHours}h</td>
                    <td className="py-2 text-slate-600">{rec.source}</td>
                    <td className="py-2 font-semibold text-indigo-700">
                      {rec.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
