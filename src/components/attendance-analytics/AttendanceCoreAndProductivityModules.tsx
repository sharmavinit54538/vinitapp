'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  Clock,
  MapPin,
  Moon,
  RefreshCw,
  Timer,
  Users,
} from 'lucide-react';
import {
  AbsenteeismLeaveCorrelationResponse,
  AttendanceAnalyticsRole,
  AttendanceOverviewResponse,
  AttendanceSharedFilterParams,
  DailyLiveStatusResponse,
  KpiCardWithDelta,
  LocationRemoteAnalyticsResponse,
  OvertimeHolidayAnalyticsResponse,
  PunctualityAnalyticsResponse,
  ShiftRosterAnalyticsResponse,
  WorkingHoursProductivityResponse,
} from '../../types/attendanceAnalytics';
import {
  attendanceAbsenteeismLeaveApi,
  attendanceDailyLiveApi,
  attendanceLocationRemoteApi,
  attendanceOverviewApi,
  attendanceOvertimeHolidayApi,
  attendancePunctualityApi,
  attendanceShiftRosterApi,
  attendanceWorkingHoursApi,
  formatShiftWindowWithMidnightCheck,
  maskGeoLocationCoord,
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
// 1. Attendance Overview Dashboard
// ============================================================================
export function AttendanceOverviewDashboardModule({
  role,
  filters,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'overview');
  const [data, setData] = useState<AttendanceOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceOverviewApi.getOverview(filters);
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch overview metrics'
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
        moduleTitle="1. Attendance Overview Dashboard"
        scopeDescription={perm.scopeDescription}
      />
    );
  }

  if (loading) return <AttendanceSkeletonBlock rows={5} />;

  if (error) {
    return (
      <AttendanceErrorState
        title="Unable to load Attendance Overview KPIs"
        message={error}
        onRetry={() => void loadData()}
      />
    );
  }

  if (!data) {
    return (
      <AttendanceEmptyState
        title="No Attendance Overview Data"
        description="No attendance records matched the selected global filter scope."
        ctaLabel="Reload Overview"
        onCta={() => void loadData()}
      />
    );
  }

  const kpiList: KpiCardWithDelta[] = [
    data.kpis.presentPct,
    data.kpis.absentPct,
    data.kpis.onLeavePct,
    data.kpis.latePct,
    data.kpis.earlyExitPct,
    data.kpis.wfhRemotePct,
    data.kpis.avgWorkingHours,
    data.kpis.overtimeHours,
    data.kpis.regularizationRequests,
    data.kpis.missingPunches,
    data.kpis.deviceOfflineCount,
    data.kpis.anomaliesFlagged,
  ];

  return (
    <div className="space-y-4">
      <AttendanceMetricFreshnessBadge metadata={data.metadata} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpiList.map((kpi) => (
          <div
            key={kpi.key}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
          >
            <p className="text-[11px] font-semibold text-slate-500 uppercase">
              {kpi.label}
            </p>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-bold text-slate-900">
                {kpi.valueFormatted}
              </span>
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                  kpi.deltaDirection === 'up'
                    ? 'text-emerald-600'
                    : kpi.deltaDirection === 'down'
                    ? 'text-rose-600'
                    : 'text-slate-500'
                }`}
              >
                {kpi.deltaDirection === 'up' && (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                )}
                {kpi.deltaDirection === 'down' && (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                {kpi.deltaFormatted}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AccessibleChartTableFallback
          title="Daily Attendance Trend"
          points={data.dailyAttendanceTrend}
          unit="%"
        />
        <AccessibleChartTableFallback
          title="Department-wise Attendance"
          points={data.departmentWiseAttendance}
          unit="%"
        />
        <AccessibleChartTableFallback
          title="Late Arrival Trend"
          points={data.lateArrivalTrend}
        />
        <AccessibleChartTableFallback
          title="Overtime Hours Trend"
          points={data.overtimeTrend}
          unit=" hrs"
        />
      </div>
    </div>
  );
}

// ============================================================================
// 2. Daily Attendance & Live Status
// ============================================================================
export function DailyAttendanceLiveStatusModule({
  role,
  filters,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'daily-live');
  const [data, setData] = useState<DailyLiveStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceDailyLiveApi.getLiveStatus(filters);
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch daily live attendance status'
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
        moduleTitle="2. Daily Attendance & Live Status"
        scopeDescription={perm.scopeDescription}
      />
    );
  }

  if (loading) return <AttendanceSkeletonBlock rows={5} />;

  if (error) {
    return (
      <AttendanceErrorState
        title="Unable to load Live Attendance Status"
        message={error}
        onRetry={() => void loadData()}
      />
    );
  }

  if (!data) {
    return (
      <AttendanceEmptyState
        title="No Live Punch Stream Active"
        description="No live attendance counts returned for today's shift window."
        ctaLabel="Refresh Live Feed"
        onCta={() => void loadData()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <AttendanceMetricFreshnessBadge metadata={data.metadata} />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {[
          { label: 'Present', val: data.counts.present },
          { label: 'Absent', val: data.counts.absent },
          { label: 'Late', val: data.counts.late },
          { label: 'On Leave', val: data.counts.onLeave },
          { label: 'Not Yet Punched', val: data.counts.notYetPunched },
          { label: 'On Break', val: data.counts.onBreak },
          { label: 'Remote / WFH', val: data.counts.remote },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-200 bg-white p-3.5 text-center shadow-xs"
          >
            <p className="text-[11px] font-semibold text-slate-500">
              {item.label}
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">{item.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <h4 className="text-xs font-bold text-slate-900">
            Who Is Absent Today (With Leave / Regularization Context)
          </h4>
          {data.whoIsAbsent.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">
              No absent employees reported for this filter scope.
            </p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                    <th className="py-2">Employee</th>
                    <th className="py-2">Department</th>
                    <th className="py-2">Leave / Reg Context</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.whoIsAbsent.map((emp) => (
                    <tr key={emp.id}>
                      <td className="py-2 font-medium text-slate-900">
                        {emp.employeeName} ({emp.employeeCode})
                      </td>
                      <td className="py-2 text-slate-600">{emp.department}</td>
                      <td className="py-2 font-semibold text-amber-700">
                        {emp.leaveOrRegStatus}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <AccessibleChartTableFallback
          title="Hourly Punch-In Curve"
          points={data.hourlyPunchInCurve}
        />
      </div>
    </div>
  );
}

// ============================================================================
// 3. Punctuality: Late Arrival & Early Exit
// ============================================================================
export function PunctualityLateEarlyModule({
  role,
  filters,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'punctuality');
  const [data, setData] = useState<PunctualityAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendancePunctualityApi.getAnalytics(filters);
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load punctuality analytics'
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
        moduleTitle="3. Punctuality: Late Arrival & Early Exit"
        scopeDescription={perm.scopeDescription}
      />
    );
  }

  if (loading) return <AttendanceSkeletonBlock rows={4} />;
  if (error) {
    return (
      <AttendanceErrorState
        title="Unable to load Punctuality Analytics"
        message={error}
        onRetry={() => void loadData()}
      />
    );
  }
  if (!data) {
    return (
      <AttendanceEmptyState
        title="No Punctuality Records"
        description="No late arrival or early exit records found for the selected filter."
        ctaLabel="Refresh Punctuality"
        onCta={() => void loadData()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <AttendanceMetricFreshnessBadge metadata={data.metadata} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Late Arrivals</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.lateArrivalCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Early Exits</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.earlyExitCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Grace Usage</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.gracePeriodUsageCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Avg Delay (Min)</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.avgDelayMinutes}m
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Policy LOP Impact</p>
          <p className="mt-1 text-lg font-bold text-rose-600">
            {data.policyLopDeductionInstances}
          </p>
        </div>
      </div>

      <AccessibleChartTableFallback
        title="Shift-wise Punctuality Adherence"
        points={data.shiftWisePunctuality}
        unit="%"
      />
    </div>
  );
}

// ============================================================================
// 4. Absenteeism & Leave Correlation
// ============================================================================
export function AbsenteeismLeaveCorrelationModule({
  role,
  filters,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'absenteeism-leave');
  const [data, setData] =
    useState<AbsenteeismLeaveCorrelationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceAbsenteeismLeaveApi.getAnalytics(filters);
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch absenteeism & Bradford correlation'
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
        moduleTitle="4. Absenteeism & Leave Correlation"
        scopeDescription={perm.scopeDescription}
      />
    );
  }

  if (loading) return <AttendanceSkeletonBlock rows={4} />;
  if (error) {
    return (
      <AttendanceErrorState
        title="Unable to load Absenteeism & Leave Correlation"
        message={error}
        onRetry={() => void loadData()}
      />
    );
  }
  if (!data) {
    return (
      <AttendanceEmptyState
        title="No Absenteeism Correlation Records"
        description="No planned or unplanned absence records returned from the API."
        ctaLabel="Reload Correlation"
        onCta={() => void loadData()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <AttendanceMetricFreshnessBadge metadata={data.metadata} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Planned Absence</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.plannedAbsencePct}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Unplanned Absence</p>
          <p className="mt-1 text-lg font-bold text-rose-600">
            {data.unplannedAbsencePct}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Avg Bradford Factor</p>
          <p className="mt-1 text-lg font-bold text-indigo-700">
            {data.avgBradfordFactor}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Mon/Fri Bridge</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.mondayFridayBridgeCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Pre/Post Holiday Spike</p>
          <p className="mt-1 text-lg font-bold text-amber-600">
            {data.prePostHolidaySpikePct}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Unauthorized</p>
          <p className="mt-1 text-lg font-bold text-rose-700">
            {data.unauthorizedAbsenceCount}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. Working Hours & Productivity
// ============================================================================
export function WorkingHoursProductivityModule({
  role,
  filters,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'working-hours');
  const [data, setData] = useState<WorkingHoursProductivityResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceWorkingHoursApi.getAnalytics(filters);
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch working hours analytics'
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
        moduleTitle="5. Working Hours & Productivity"
        scopeDescription={perm.scopeDescription}
      />
    );
  }

  if (loading) return <AttendanceSkeletonBlock rows={4} />;
  if (error) {
    return (
      <AttendanceErrorState
        title="Unable to load Working Hours & Productivity"
        message={error}
        onRetry={() => void loadData()}
      />
    );
  }
  if (!data) {
    return (
      <AttendanceEmptyState
        title="No Working Hours Data"
        description="No shift duration or break utilization records found."
        ctaLabel="Refresh Working Hours"
        onCta={() => void loadData()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <AttendanceMetricFreshnessBadge metadata={data.metadata} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Avg Daily Hours</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.avgDailyWorkingHours}h / {data.expectedStandardHours}h
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Total Shortfall Hours</p>
          <p className="mt-1 text-lg font-bold text-rose-600">
            {data.totalShortfallHours}h
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Full / Half / Short Days</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.fullDayCount} / {data.halfDayCount} / {data.shortHoursCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Weekly Hours Compliance</p>
          <p className="mt-1 text-lg font-bold text-emerald-600">
            {data.weeklyHoursCompliancePct}%
          </p>
        </div>
      </div>

      <AccessibleChartTableFallback
        title="Working Hours Distribution"
        points={data.hoursDistribution}
      />
    </div>
  );
}

// ============================================================================
// 6. Overtime & Holiday Work Analytics
// ============================================================================
export function OvertimeHolidayWorkModule({
  role,
  filters,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'overtime-holiday');
  const [data, setData] = useState<OvertimeHolidayAnalyticsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [cycleMonth, setCycleMonth] = useState('2026-11');
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceOvertimeHolidayApi.getAnalytics(filters);
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load overtime & holiday work analytics'
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

  const handleSyncPayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSyncStatus('Syncing approved overtime & holiday work to Payroll...');
    try {
      const res =
        await attendanceOvertimeHolidayApi.syncToPayrollInputs(cycleMonth);
      setSyncStatus(`Synced ${res.syncedCount} records to Payroll inputs.`);
    } catch (err) {
      setSyncStatus(
        err instanceof Error ? err.message : 'Payroll OT sync failed'
      );
    }
  };

  if (!perm.canView) {
    return (
      <AttendancePermissionDeniedState
        role={role}
        moduleTitle="6. Overtime & Holiday Work Analytics"
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
          title="Unable to load Overtime & Holiday Work Analytics"
          message={error}
          onRetry={() => void loadData()}
          actionLabel={
            perm.canManage ? 'Sync OT to Payroll Inputs' : undefined
          }
          onAction={
            perm.canManage ? () => setSyncModalOpen(true) : undefined
          }
        />
      ) : !data ? (
        <AttendanceEmptyState
          title="No Overtime or Holiday Work Records"
          description="No overtime or comp-off records returned for this cycle."
          ctaLabel={
            perm.canManage ? 'Sync OT to Payroll Inputs' : 'Refresh OT'
          }
          onCta={() =>
            perm.canManage ? setSyncModalOpen(true) : void loadData()
          }
        />
      ) : (
        <>
          <AttendanceMetricFreshnessBadge metadata={data.metadata} />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">Approved OT</p>
              <p className="mt-1 text-lg font-bold text-emerald-700">
                {data.approvedOvertimeHours}h
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">Unapproved OT</p>
              <p className="mt-1 text-lg font-bold text-amber-600">
                {data.unapprovedOvertimeHours}h
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">Statutory Cap Breaches</p>
              <p className="mt-1 text-lg font-bold text-rose-600">
                {data.statutoryCapBreaches}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">Holiday Work</p>
              <p className="mt-1 text-lg font-bold text-slate-900">
                {data.holidayWorkHours}h
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">Comp-Off Earned/Used</p>
              <p className="mt-1 text-lg font-bold text-indigo-700">
                {data.compOffEarnedDays}d / {data.compOffAvailedDays}d
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3.5">
              <p className="text-[11px] text-slate-500">Payroll Sync</p>
              <p className="mt-1 text-sm font-bold text-slate-900">
                {data.payrollSyncStatus}
              </p>
            </div>
          </div>
          <AccessibleChartTableFallback
            title="Department Overtime Distribution"
            points={data.departmentOvertime}
            unit=" hrs"
          />
        </>
      )}

      <AttendanceModal
        open={syncModalOpen}
        title="Sync Approved Overtime & Holiday Work to Payroll"
        onClose={() => setSyncModalOpen(false)}
      >
        <form onSubmit={handleSyncPayroll} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Payroll Cycle Month (YYYY-MM)
            </label>
            <input
              type="month"
              value={cycleMonth}
              onChange={(e) => setCycleMonth(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
            />
          </div>
          {syncStatus && (
            <p className="rounded-lg bg-slate-100 p-2 text-xs text-slate-700">
              {syncStatus}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setSyncModalOpen(false)}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              Close
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Trigger Payroll OT Sync
            </button>
          </div>
        </form>
      </AttendanceModal>
    </div>
  );
}

// ============================================================================
// 7. Shift & Roster Analytics
// ============================================================================
export function ShiftRosterAnalyticsModule({
  role,
  filters,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'shift-roster');
  const [data, setData] = useState<ShiftRosterAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceShiftRosterApi.getAnalytics(filters);
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load shift & roster analytics'
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
        moduleTitle="7. Shift & Roster Analytics"
        scopeDescription={perm.scopeDescription}
      />
    );
  }

  if (loading) return <AttendanceSkeletonBlock rows={4} />;
  if (error) {
    return (
      <AttendanceErrorState
        title="Unable to load Shift & Roster Analytics"
        message={error}
        onRetry={() => void loadData()}
      />
    );
  }
  if (!data) {
    return (
      <AttendanceEmptyState
        title="No Shift Roster Records"
        description="No shift adherence or coverage records returned from the API."
        ctaLabel="Reload Shift Roster"
        onCta={() => void loadData()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <AttendanceMetricFreshnessBadge metadata={data.metadata} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">On-Time Shift Start</p>
          <p className="mt-1 text-lg font-bold text-emerald-700">
            {data.onTimeShiftStartPct}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Roster Coverage Gaps</p>
          <p className="mt-1 text-lg font-bold text-rose-600">
            {data.rosterCoverageGaps}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Shift Swaps</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.shiftSwapCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">
            Night Shifts (Cross Midnight)
          </p>
          <p className="mt-1 text-lg font-bold text-indigo-700">
            {data.nightShiftCrossMidnightCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Fatigue Alerts (&gt;6d)</p>
          <p className="mt-1 text-lg font-bold text-amber-600">
            {data.consecutiveDaysFatigueAlerts}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <h4 className="text-xs font-bold text-slate-900">
          Shift Adherence & Cross-Midnight Window Table
        </h4>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                <th className="py-2">Shift</th>
                <th className="py-2">Window</th>
                <th className="py-2">Planned vs Actual</th>
                <th className="py-2 text-right">Adherence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.shiftAdherenceRows.map((row) => {
                const parts = row.windowLabel.split('-').map((s) => s.trim());
                const formatted =
                  parts.length === 2
                    ? formatShiftWindowWithMidnightCheck(parts[0], parts[1])
                    : {
                        label: row.windowLabel,
                        crossesMidnight: row.crossesMidnight,
                      };
                return (
                  <tr key={row.id}>
                    <td className="py-2 font-semibold text-slate-900">
                      {row.shiftName} ({row.shiftCode})
                    </td>
                    <td className="py-2 font-mono text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        {formatted.crossesMidnight && (
                          <Moon className="h-3.5 w-3.5 text-indigo-600" />
                        )}
                        {formatted.label}
                      </span>
                    </td>
                    <td className="py-2 text-slate-700">
                      {row.actualHeadcount} / {row.plannedHeadcount}
                    </td>
                    <td className="py-2 text-right font-bold text-slate-900">
                      {row.adherencePct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 8. Location, Geo-fence & Remote Work Analytics
// ============================================================================
export function LocationGeoFenceRemoteModule({
  role,
  filters,
}: SharedModuleProps) {
  const perm = useAttendanceAnalyticsPermission(role, 'location-remote');
  const [data, setData] = useState<LocationRemoteAnalyticsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await attendanceLocationRemoteApi.getAnalytics(filters);
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load location & geo-fence analytics'
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
        moduleTitle="8. Location, Geo-fence & Remote Work Analytics"
        scopeDescription={perm.scopeDescription}
      />
    );
  }

  if (loading) return <AttendanceSkeletonBlock rows={4} />;
  if (error) {
    return (
      <AttendanceErrorState
        title="Unable to load Location & Geo-fence Analytics"
        message={error}
        onRetry={() => void loadData()}
      />
    );
  }
  if (!data) {
    return (
      <AttendanceEmptyState
        title="No Location or Geo-fence Data"
        description="No office occupancy or remote check-in metrics returned."
        ctaLabel="Reload Locations"
        onCta={() => void loadData()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <AttendanceMetricFreshnessBadge metadata={data.metadata} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Office Check-In Ratio</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.officeRatioPct}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">WFH / Remote Ratio</p>
          <p className="mt-1 text-lg font-bold text-indigo-700">
            {data.wfhRemoteRatioPct}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">On-Duty / Field Travel</p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {data.onDutyTravelPct}%
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Geo-Fence Violations</p>
          <p className="mt-1 text-lg font-bold text-rose-600">
            {data.geoFenceViolationCount}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5">
          <p className="text-[11px] text-slate-500">Hybrid Policy Compliance</p>
          <p className="mt-1 text-lg font-bold text-emerald-700">
            {data.hybridPolicyCompliancePct}%
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <h4 className="text-xs font-bold text-slate-900">
          Site Occupancy & Privacy-Masked Geo Coordinates
        </h4>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase">
                <th className="py-2">Location / Branch</th>
                <th className="py-2">Checked-In</th>
                <th className="py-2">Geo-Fence Breaches</th>
                <th className="py-2">Coordinates (Privacy Guarded)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.siteOccupancy.map((site) => (
                <tr key={site.id}>
                  <td className="py-2 font-semibold text-slate-900">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                      {site.locationName}
                    </span>
                  </td>
                  <td className="py-2 text-slate-700">{site.checkedInCount}</td>
                  <td className="py-2 font-semibold text-rose-600">
                    {site.geoFenceBreaches}
                  </td>
                  <td className="py-2 font-mono text-slate-600">
                    {perm.canViewRawGeoCoords
                      ? site.maskedCoordSummary
                      : maskGeoLocationCoord(site.maskedCoordSummary)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
