'use client';

import React, { useMemo, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  ArrowLeft,
  BarChart3,
  Bell,
  CalendarClock,
  ChevronRight,
  Clock,
  Cpu,
  FileSearch,
  Filter,
  Gauge,
  LayoutGrid,
  MapPin,
  Radio,
  Settings,
  ShieldAlert,
  Sparkles,
  Target,
  Timer,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import {
  AttendanceAnalyticsModuleId,
  AttendanceAnalyticsRole,
  AttendanceSharedFilterParams,
} from '../../types/attendanceAnalytics';
import { evaluateAttendanceAnalyticsPermission } from '../../hooks/useAttendanceAnalyticsPermission';
import {
  AbsenteeismLeaveCorrelationModule,
  AttendanceOverviewDashboardModule,
  DailyAttendanceLiveStatusModule,
  LocationGeoFenceRemoteModule,
  OvertimeHolidayWorkModule,
  PunctualityLateEarlyModule,
  ShiftRosterAnalyticsModule,
  WorkingHoursProductivityModule,
} from './AttendanceCoreAndProductivityModules';
import {
  AnomalyFraudComplianceModule,
  AttendancePayrollImpactModule,
  BenchmarkingTargetsModule,
  BiometricDeviceSourceModule,
  DrillDownRecordExplorerModule,
  EmployeeTeamAttendanceProfilesModule,
  RegularizationExceptionAnalyticsModule,
  TrendsPatternsForecastingModule,
} from './AttendanceExceptionsAndIntelligenceModules';
import {
  AttendanceAuditLogsModule,
  AttendanceNotificationsModule,
  AttendanceSettingsAutomationModule,
  EmployeeMyAttendanceViewModule,
  InsightsAlertsNarrativesModule,
  ManagerAttendanceViewModule,
  SavedViewsScheduledReportsModule,
} from './AttendanceGovernanceAndViewsModules';

export interface AttendanceModuleMeta {
  id: AttendanceAnalyticsModuleId;
  number: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

export const ATTENDANCE_ANALYTICS_MODULES_REGISTRY: AttendanceModuleMeta[] = [
  {
    id: 'overview',
    number: 1,
    title: '1. Attendance Overview Dashboard',
    subtitle: '12 executive KPIs, deltas & trend charts',
    icon: Gauge,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    id: 'daily-live',
    number: 2,
    title: '2. Daily Attendance & Live Status',
    subtitle: 'Real-time punch stream, absent & late lists',
    icon: Radio,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'punctuality',
    number: 3,
    title: '3. Punctuality: Late Arrival & Early Exit',
    subtitle: 'Grace usage, delay distribution & LOP impact',
    icon: Clock,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    id: 'absenteeism-leave',
    number: 4,
    title: '4. Absenteeism & Leave Correlation',
    subtitle: 'Bradford factor, Mon/Fri bridge & holiday spikes',
    icon: CalendarClock,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  {
    id: 'working-hours',
    number: 5,
    title: '5. Working Hours & Productivity',
    subtitle: 'Net vs gross hours, breaks & shortfall tracking',
    icon: Timer,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    id: 'overtime-holiday',
    number: 6,
    title: '6. Overtime & Holiday Work Analytics',
    subtitle: 'Approved OT, statutory caps, comp-off & payroll sync',
    icon: Activity,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    id: 'shift-roster',
    number: 7,
    title: '7. Shift & Roster Analytics',
    subtitle: 'Shift adherence, cross-midnight & fatigue flags',
    icon: Users,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    id: 'location-remote',
    number: 8,
    title: '8. Location, Geo-fence & Remote Work',
    subtitle: 'Office vs WFH ratio, geo-fence & hybrid policy',
    icon: MapPin,
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    id: 'regularizations',
    number: 9,
    title: '9. Regularization & Exception Analytics',
    subtitle: 'Missing punches, manager TAT & SLA bottlenecks',
    icon: AlertOctagon,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
  {
    id: 'devices-sources',
    number: 10,
    title: '10. Biometric / Device & Source Analytics',
    subtitle: 'Terminal health, spoof/liveness & audited resync',
    icon: Cpu,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    id: 'anomalies',
    number: 11,
    title: '11. Anomaly, Fraud & Compliance Detection',
    subtitle: 'Buddy punch indicators, impossible travel & review',
    icon: ShieldAlert,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
  },
  {
    id: 'payroll-impact',
    number: 12,
    title: '12. Attendance-to-Payroll Impact',
    subtitle: 'LOP & payable days reconciliation with Pay Run',
    icon: Wallet,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'profiles',
    number: 13,
    title: '13. Employee & Team Attendance Profiles',
    subtitle: '360° attendance score, punch timeline & OT summary',
    icon: UserCheck,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    id: 'trends-forecasting',
    number: 14,
    title: '14. Trends, Patterns & Forecasting',
    subtitle: 'WoW/YoY deltas & 30-day staffing / OT forecasts',
    icon: TrendingUp,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    id: 'benchmarks-targets',
    number: 15,
    title: '15. Benchmarking & Targets',
    subtitle: 'Department & location KPI targets with RAG status',
    icon: Target,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    id: 'drill-down',
    number: 16,
    title: '16. Drill-down & Record Explorer',
    subtitle: 'Server-paginated punch explorer & CSV/XLSX export',
    icon: FileSearch,
    iconBg: 'bg-sky-50',
    iconColor: 'text-sky-600',
  },
  {
    id: 'insights-alerts',
    number: 17,
    title: '17. Insights, Alerts & Narratives',
    subtitle: 'Auto narratives, custom alert builder & NL query',
    icon: Sparkles,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    id: 'saved-schedules',
    number: 18,
    title: '18. Saved Views, Scheduled Reports & Exports',
    subtitle: 'Automated daily/weekly/monthly PDF & XLSX digests',
    icon: BarChart3,
    iconBg: 'bg-teal-50',
    iconColor: 'text-teal-600',
  },
  {
    id: 'settings',
    number: 19,
    title: '19. Settings & Automation Rules',
    subtitle: 'Grace thresholds, N<5 privacy guard & 9 automations',
    icon: Settings,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-700',
  },
  {
    id: 'audit-logs',
    number: 20,
    title: '20. Audit Logs',
    subtitle: 'Immutable log of queries, exports & anomaly reviews',
    icon: ShieldAlert,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
  },
  {
    id: 'notifications',
    number: 21,
    title: '21. Notifications',
    subtitle: 'Real-time anomaly, offline terminal & SLA alerts',
    icon: Bell,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    id: 'manager-view',
    number: 22,
    title: '22. Manager View',
    subtitle: 'Direct reports live attendance, OT & team nudges',
    icon: Users,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'employee-view',
    number: 23,
    title: '23. Employee View (My Attendance Insights)',
    subtitle: 'Personal punctuality, working hours & comp-off',
    icon: UserCheck,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
];

const ROLE_OPTIONS: { value: AttendanceAnalyticsRole; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'hr_admin', label: 'HR Admin' },
  { value: 'attendance_admin', label: 'Attendance / Time Office Admin' },
  { value: 'regional_hr', label: 'Location / Regional HR' },
  { value: 'department_head', label: 'Department / BU Head' },
  { value: 'reporting_manager', label: 'Reporting Manager' },
  { value: 'payroll', label: 'Payroll Team' },
  { value: 'auditor', label: 'Compliance / Auditor (Read-Only)' },
  { value: 'employee', label: 'Employee (My Attendance Insights)' },
];

export function AttendanceAnalyticsWorkspaceShell({
  initialModule = 'overview',
  startInDirectory = false,
  embedded = false,
}: {
  initialModule?: AttendanceAnalyticsModuleId;
  startInDirectory?: boolean;
  embedded?: boolean;
}) {
  const [role, setRole] = useState<AttendanceAnalyticsRole>('hr_admin');
  const [activeModule, setActiveModule] =
    useState<AttendanceAnalyticsModuleId>(initialModule);
  const [showDirectory, setShowDirectory] = useState<boolean>(startInDirectory);

  const [filters, setFilters] = useState<AttendanceSharedFilterParams>({
    dateRange: 'Last30Days',
    entity: '',
    department: '',
    location: '',
    shift: '',
    employmentType: '',
  });

  const activeMeta = useMemo(
    () =>
      ATTENDANCE_ANALYTICS_MODULES_REGISTRY.find(
        (m) => m.id === activeModule
      ) || ATTENDANCE_ANALYTICS_MODULES_REGISTRY[0],
    [activeModule]
  );

  const groupedCards = useMemo(
    () => [
      {
        groupTitle: 'Core Attendance, Punctuality & Hours (1–6)',
        items: ATTENDANCE_ANALYTICS_MODULES_REGISTRY.slice(0, 6),
      },
      {
        groupTitle: 'Shifts, Locations, Devices &Payroll Impact (7–12)',
        items: ATTENDANCE_ANALYTICS_MODULES_REGISTRY.slice(6, 12),
      },
      {
        groupTitle: 'Profiles, Forecasting, Targets & Narratives (13–18)',
        items: ATTENDANCE_ANALYTICS_MODULES_REGISTRY.slice(12, 18),
      },
      {
        groupTitle: 'Governance, Audit & Role Portals (19–23)',
        items: ATTENDANCE_ANALYTICS_MODULES_REGISTRY.slice(18, 23),
      },
    ],
    []
  );

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'overview':
        return (
          <AttendanceOverviewDashboardModule role={role} filters={filters} />
        );
      case 'daily-live':
        return (
          <DailyAttendanceLiveStatusModule role={role} filters={filters} />
        );
      case 'punctuality':
        return <PunctualityLateEarlyModule role={role} filters={filters} />;
      case 'absenteeism-leave':
        return (
          <AbsenteeismLeaveCorrelationModule role={role} filters={filters} />
        );
      case 'working-hours':
        return (
          <WorkingHoursProductivityModule role={role} filters={filters} />
        );
      case 'overtime-holiday':
        return <OvertimeHolidayWorkModule role={role} filters={filters} />;
      case 'shift-roster':
        return <ShiftRosterAnalyticsModule role={role} filters={filters} />;
      case 'location-remote':
        return <LocationGeoFenceRemoteModule role={role} filters={filters} />;
      case 'regularizations':
        return (
          <RegularizationExceptionAnalyticsModule
            role={role}
            filters={filters}
          />
        );
      case 'devices-sources':
        return <BiometricDeviceSourceModule role={role} filters={filters} />;
      case 'anomalies':
        return <AnomalyFraudComplianceModule role={role} filters={filters} />;
      case 'payroll-impact':
        return <AttendancePayrollImpactModule role={role} filters={filters} />;
      case 'profiles':
        return (
          <EmployeeTeamAttendanceProfilesModule role={role} filters={filters} />
        );
      case 'trends-forecasting':
        return (
          <TrendsPatternsForecastingModule role={role} filters={filters} />
        );
      case 'benchmarks-targets':
        return <BenchmarkingTargetsModule role={role} filters={filters} />;
      case 'drill-down':
        return <DrillDownRecordExplorerModule role={role} filters={filters} />;
      case 'insights-alerts':
        return <InsightsAlertsNarrativesModule role={role} filters={filters} />;
      case 'saved-schedules':
        return (
          <SavedViewsScheduledReportsModule role={role} filters={filters} />
        );
      case 'settings':
        return (
          <AttendanceSettingsAutomationModule role={role} filters={filters} />
        );
      case 'audit-logs':
        return <AttendanceAuditLogsModule role={role} filters={filters} />;
      case 'notifications':
        return <AttendanceNotificationsModule role={role} filters={filters} />;
      case 'manager-view':
        return <ManagerAttendanceViewModule role={role} filters={filters} />;
      case 'employee-view':
        return <EmployeeMyAttendanceViewModule role={role} filters={filters} />;
      default:
        return (
          <AttendanceOverviewDashboardModule role={role} filters={filters} />
        );
    }
  };

  return (
    <div className={embedded ? 'space-y-4' : 'min-h-screen bg-slate-50 p-4 sm:p-6'}>
      <div className="mx-auto max-w-7xl space-y-4">
        {/* Top Header & RBAC Switcher */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white uppercase">
                23-Module Suite
              </span>
              <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                Attendance Analytics & Workforce Intelligence
              </h1>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Punctuality, Absenteeism, Overtime, Shifts, Geo-Fence, Biometric
              Terminals, Anomaly Detection & Payroll Impact
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor="attendance-rbac-select"
              className="text-xs font-semibold text-slate-600"
            >
              RBAC Role:
            </label>
            <select
              id="attendance-rbac-select"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as AttendanceAnalyticsRole)
              }
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800"
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowDirectory((prev) => !prev)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <LayoutGrid className="h-3.5 w-3.5 text-indigo-600" />
              {showDirectory ? 'Open Active Module' : 'All 23 Modules Directory'}
            </button>
          </div>
        </div>

        {/* Shared Global Filter Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700">
              <Filter className="h-3.5 w-3.5 text-indigo-600" />
              Global Filters:
            </span>
            <select
              aria-label="Date Range Preset"
              value={filters.dateRange || 'Last30Days'}
              onChange={(e) =>
                setFilters((f) => ({ ...f, dateRange: e.target.value }))
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs"
            >
              <option value="Today">Today (Live)</option>
              <option value="Yesterday">Yesterday</option>
              <option value="ThisWeek">This Week</option>
              <option value="Last7Days">Last 7 Days</option>
              <option value="ThisMonth">This Month</option>
              <option value="Last30Days">Last 30 Days</option>
              <option value="Quarter">Quarter</option>
              <option value="YTD">Year to Date (YTD)</option>
            </select>

            <input
              type="text"
              value={filters.department || ''}
              onChange={(e) =>
                setFilters((f) => ({ ...f, department: e.target.value }))
              }
              placeholder="Department filter..."
              className="w-36 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
            />
            <input
              type="text"
              value={filters.location || ''}
              onChange={(e) =>
                setFilters((f) => ({ ...f, location: e.target.value }))
              }
              placeholder="Location / Branch..."
              className="w-36 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
            />
            <input
              type="text"
              value={filters.shift || ''}
              onChange={(e) =>
                setFilters((f) => ({ ...f, shift: e.target.value }))
              }
              placeholder="Shift code..."
              className="w-28 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs"
            />
            <button
              type="button"
              onClick={() =>
                setFilters({
                  dateRange: 'Last30Days',
                  entity: '',
                  department: '',
                  location: '',
                  shift: '',
                  employmentType: '',
                })
              }
              className="rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {showDirectory ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {groupedCards.map((group) => (
              <div
                key={group.groupTitle}
                className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs"
              >
                <p className="px-2 pb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  {group.groupTitle}
                </p>
                <div className="divide-y divide-slate-100">
                  {group.items.map((mod) => {
                    const IconComponent = mod.icon;
                    const perm = evaluateAttendanceAnalyticsPermission(
                      role,
                      mod.id
                    );
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => {
                          setActiveModule(mod.id);
                          setShowDirectory(false);
                        }}
                        className="flex w-full items-center justify-between gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-slate-50"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${mod.iconBg} ${mod.iconColor}`}
                          >
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                {mod.title}
                              </span>
                              {!perm.canView && (
                                <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                                  Restricted
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500">
                              {mod.subtitle}
                            </p>
                          </div>
                        </div>
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                          <ChevronRight className="h-3.5 w-3.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Horizontal Pill Navigation */}
            <div className="flex items-center gap-1.5 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xs">
              <button
                type="button"
                onClick={() => setShowDirectory(true)}
                className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                23 Modules
              </button>
              {ATTENDANCE_ANALYTICS_MODULES_REGISTRY.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveModule(m.id)}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeModule === m.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {m.title}
                </button>
              ))}
            </div>

            {/* Active Module Banner */}
            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-xs">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {activeMeta.title}
                </h2>
                <p className="text-xs text-slate-500">{activeMeta.subtitle}</p>
              </div>
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[11px] font-semibold text-slate-600">
                /api/v1/attendance-analytics/{activeMeta.id}
              </span>
            </div>

            {renderActiveModule()}
          </div>
        )}
      </div>
    </div>
  );
}
