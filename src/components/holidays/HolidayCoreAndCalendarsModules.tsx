'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  Plus,
  Download,
  RefreshCw,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Search,
  Upload,
  Layers,
  MapPin,
  Sliders,
  ShieldAlert,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import {
  HolidayRole,
  HolidayModuleId,
  HolidayDashboardResponse,
  HolidayCalendarViewResponse,
  HolidayCalendarTemplateRecord,
  HolidayMasterRecord,
  HolidayCalendarAssignmentRecord,
  OptionalHolidayPolicyRecord,
  WeeklyOffRuleRecord,
  SpecialHolidayOverrideRecord,
  HolidayCategoryType,
} from '../../types/holidays';
import {
  holidayDashboardApi,
  holidayCalendarViewsApi,
  holidayTemplatesApi,
  holidayMasterApi,
  holidayAssignmentApi,
  holidayOptionalPolicyApi,
  holidayWeeklyOffApi,
  holidaySpecialOverridesApi,
} from '../../services/holidays';
import {
  HolidayApiError,
  formatHolidayDateOnly,
  getWeekdayLabelFromDateOnly,
} from '../../services/holidays/client';
import { useHolidayPermission } from '../../hooks/useHolidayPermission';
import {
  HolidaySkeletonBlock,
  HolidayPermissionDeniedState,
  HolidayErrorState,
  HolidayEmptyState,
  HolidayModal,
} from './HolidayPrimitives';

export interface HolidayModuleProps {
  activeRole: HolidayRole;
  onNavigateModule?: (moduleId: HolidayModuleId) => void;
}

const HOLIDAY_TYPE_BADGE_STYLES: Record<HolidayCategoryType, string> = {
  National:
    'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-900',
  Regional:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-900',
  Company:
    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900',
  Optional:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900',
  Restricted:
    'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-900',
  Special:
    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900',
  WeeklyOff:
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  WorkingDayOverride:
    'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-900',
};

// ============================================================================
// 1. HOLIDAY DASHBOARD MODULE
// ============================================================================
export function HolidayDashboardModule({
  activeRole,
  onNavigateModule,
}: HolidayModuleProps) {
  const perm = useHolidayPermission('dashboard', activeRole);
  const [yearFilter, setYearFilter] = useState<string>('');
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>('');
  const [data, setData] = useState<HolidayDashboardResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);

  const loadSummary = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayDashboardApi.getSummary({
        year: yearFilter ? Number(yearFilter) : undefined,
        location: locationFilter || undefined,
        entity: entityFilter || undefined,
      });
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  }, [perm.canView, yearFilter, locationFilter, entityFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadSummary();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadSummary]);

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="1. Holiday Dashboard"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            1. Holiday Command Center & Analytics
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Live KPIs, upcoming holiday countdown, optional quota utilization & conflict monitor
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            placeholder="Year filter"
            aria-label="Filter dashboard by year"
            className="h-9 w-28 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Location filter"
            aria-label="Filter dashboard by location"
            className="h-9 w-32 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <input
            type="text"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            placeholder="Entity filter"
            aria-label="Filter dashboard by entity"
          />
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => onNavigateModule?.('templates')}
          className="p-3 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-900/60 text-left hover:bg-indigo-100/70 transition-colors"
        >
          <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
            Create Calendar
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            3. Calendar Templates
          </p>
        </button>
        <button
          type="button"
          onClick={() => onNavigateModule?.('master')}
          className="p-3 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/60 text-left hover:bg-emerald-100/70 transition-colors"
        >
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
            Add / Import Holiday
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            4. Holiday Master
          </p>
        </button>
        <button
          type="button"
          onClick={() => onNavigateModule?.('special-overrides')}
          className="p-3 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/60 text-left hover:bg-rose-100/70 transition-colors"
        >
          <p className="text-xs font-bold text-rose-700 dark:text-rose-300">
            Declare Special Holiday
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            8. Ad-hoc & Overrides
          </p>
        </button>
        <button
          type="button"
          onClick={() => onNavigateModule?.('year-rollover')}
          className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-900/60 text-left hover:bg-amber-100/70 transition-colors"
        >
          <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
            Publish Next Year
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            16. Year Rollover
          </p>
        </button>
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={8} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void loadSummary()}
          actionLabel="Open Calendar Templates"
          onAction={() => onNavigateModule?.('templates')}
        />
      ) : !data ? (
        <HolidayEmptyState
          icon={Calendar}
          title="No Holiday Analytics Returned"
          description="Publish your organization's holiday calendar templates to populate live KPIs and utilization metrics."
          actionLabel="Configure Calendar Templates"
          onAction={() => onNavigateModule?.('templates')}
        />
      ) : (
        <div className="space-y-4">
          {data.nextHolidayCountdown ? (
            <div className="rounded-3xl p-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold opacity-85">
                  Next Holiday Countdown
                </span>
                <h3 className="text-base font-extrabold mt-0.5">
                  {data.nextHolidayCountdown.holidayName}
                </h3>
                <p className="text-xs opacity-90">
                  {formatHolidayDateOnly(data.nextHolidayCountdown.dateOnly)} •{' '}
                  {data.nextHolidayCountdown.type}
                </p>
              </div>
              <div className="px-3.5 py-2 rounded-2xl bg-white/15 backdrop-blur-xs text-center">
                <p className="text-xl font-extrabold">
                  {data.nextHolidayCountdown.daysAway}
                </p>
                <p className="text-[10px] uppercase">Days Away</p>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              {
                label: 'Total Holidays',
                val: data.kpis.totalHolidaysThisYear,
              },
              {
                label: 'Upcoming (30d)',
                val: data.kpis.upcomingNext30Days,
              },
              {
                label: 'Active Calendars',
                val: data.kpis.activeCalendars,
              },
              {
                label: 'Optional Booked',
                val: data.kpis.optionalHolidaysBooked,
              },
              {
                label: 'Pending Approvals',
                val: data.kpis.pendingApprovals,
              },
              {
                label: 'Unassigned Employees',
                val: data.kpis.employeesWithoutCalendar,
              },
              {
                label: 'Conflicts Detected',
                val: data.kpis.conflictsDetected,
              },
              {
                label: 'Long Weekends',
                val: data.kpis.longWeekendCount,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl p-3.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800"
              >
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {item.val}
                </p>
              </div>
            ))}
          </div>

          {data.alerts.length > 0 ? (
            <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Calendar & Sync Alerts
              </h3>
              {data.alerts.map((al) => (
                <div
                  key={al.id}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 flex items-center justify-between gap-2 text-xs"
                >
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {al.title}
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigateModule?.(al.module)}
                    className="text-indigo-600 dark:text-indigo-400 font-bold"
                  >
                    Inspect
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 2. HOLIDAY CALENDAR VIEWS MODULE (Year / Month / List + Compare + Export)
// ============================================================================
export function HolidayCalendarViewsModule({ activeRole }: HolidayModuleProps) {
  const perm = useHolidayPermission('calendar-views', activeRole);
  const [viewMode, setViewMode] = useState<'Year' | 'Month' | 'List'>('Year');
  const [calendarId, setCalendarId] = useState<string>('');
  const [compareCalendarId, setCompareCalendarId] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [data, setData] = useState<HolidayCalendarViewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);
  const [exportStatus, setExportStatus] = useState<string>('');

  const loadCalendarEvents = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayCalendarViewsApi.getCalendarEvents({
        viewMode,
        calendarId: calendarId || undefined,
        compareCalendarId: compareCalendarId || undefined,
        type: typeFilter || undefined,
        search: searchQuery || undefined,
      });
      setData(res);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load calendar view')
      );
    } finally {
      setLoading(false);
    }
  }, [
    perm.canView,
    viewMode,
    calendarId,
    compareCalendarId,
    typeFilter,
    searchQuery,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCalendarEvents();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadCalendarEvents]);

  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf' | 'ics') => {
    setExportStatus(`Exporting ${format.toUpperCase()}...`);
    try {
      await holidayCalendarViewsApi.exportCalendar(
        format,
        undefined,
        calendarId || undefined
      );
      setExportStatus(`Downloaded ${format.toUpperCase()}`);
    } catch (err) {
      setExportStatus(
        err instanceof Error ? err.message : `Export ${format} failed`
      );
    }
  };

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="2. Holiday Calendar Views"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              2. Holiday Calendar Views (Year / Month / List & Compare)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Color-coded holiday types, long-weekend highlights, side-by-side multi-location comparison & ICS feed
            </p>
          </div>
          <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800">
            {(['Year', 'Month', 'List'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === mode
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {mode} View
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
          <input
            type="text"
            value={calendarId}
            onChange={(e) => setCalendarId(e.target.value)}
            placeholder="Primary Calendar Code"
            aria-label="Primary Calendar Code"
            className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <input
            type="text"
            value={compareCalendarId}
            onChange={(e) => setCompareCalendarId(e.target.value)}
            placeholder="Compare Calendar Code (Side-by-Side)"
            aria-label="Compare Calendar Code"
            className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            aria-label="Filter by holiday type"
            className="h-9 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="">All Holiday Types</option>
            <option value="National">National / Gazette</option>
            <option value="Regional">State / Regional</option>
            <option value="Company">Company</option>
            <option value="Optional">Optional / Floating</option>
            <option value="Restricted">Restricted</option>
            <option value="Special">Special / Ad-hoc</option>
            <option value="WeeklyOff">Weekly Off</option>
            <option value="WorkingDayOverride">Working Day Override</option>
          </select>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search holiday title..."
              aria-label="Search holiday title"
              className="h-9 w-full pl-8 pr-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
        </div>

        {/* Color-coded legend + Export buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {(
              Object.keys(HOLIDAY_TYPE_BADGE_STYLES) as HolidayCategoryType[]
            ).map((cat) => (
              <span
                key={cat}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${HOLIDAY_TYPE_BADGE_STYLES[cat]}`}
              >
                {cat}
              </span>
            ))}
          </div>
          {perm.canExport ? (
            <div className="flex flex-wrap items-center gap-1.5">
              {(['ics', 'csv', 'xlsx', 'pdf'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => void handleExport(fmt)}
                  className="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[11px] font-semibold inline-flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>{fmt.toUpperCase()}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        {exportStatus ? (
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            {exportStatus}
          </p>
        ) : null}
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={6} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void loadCalendarEvents()}
        />
      ) : !data || data.events.length === 0 ? (
        <HolidayEmptyState
          icon={Calendar}
          title="No Holidays Found for Selected View"
          description="No published holiday events match the selected calendar or filter criteria."
          actionLabel="Reload Calendar Events"
          onAction={() => void loadCalendarEvents()}
        />
      ) : (
        <div className="space-y-3">
          {data.events.map((ev) => (
            <div
              key={ev.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {ev.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                      HOLIDAY_TYPE_BADGE_STYLES[ev.type]
                    }`}
                  >
                    {ev.type}
                  </span>
                  {ev.isLongWeekendPart ? (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-800">
                      Long Weekend
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatHolidayDateOnly(ev.dateOnly)} ({ev.weekdayLabel}) •{' '}
                  {ev.calendarCode}
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
// 3. HOLIDAY CALENDAR TEMPLATES MODULE
// ============================================================================
export function HolidayCalendarTemplatesModule({
  activeRole,
}: HolidayModuleProps) {
  const perm = useHolidayPermission('templates', activeRole);
  const [templates, setTemplates] = useState<HolidayCalendarTemplateRecord[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [cloneModalId, setCloneModalId] = useState<string | null>(null);
  const [targetCloneYear, setTargetCloneYear] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [yearType, setYearType] = useState<'CalendarYear' | 'FinancialYear'>(
    'CalendarYear'
  );
  const [entity, setEntity] = useState<string>('');
  const [countryStateLocation, setCountryStateLocation] = useState<string>('');
  const [effectiveFrom, setEffectiveFrom] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadTemplates = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayTemplatesApi.listTemplates();
      setTemplates(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load calendar templates')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadTemplates();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTemplates]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Saving template...');
    try {
      await holidayTemplatesApi.createTemplate({
        name,
        code,
        year: Number(year),
        yearType,
        entity,
        countryStateLocation,
        effectiveFrom,
      });
      setModalOpen(false);
      setSubmitStatus('');
      await loadTemplates();
    } catch (err) {
      setSubmitStatus(
        err instanceof Error ? err.message : 'Failed to create template'
      );
    }
  };

  const handleClone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cloneModalId) return;
    setSubmitStatus('Cloning calendar...');
    try {
      await holidayTemplatesApi.cloneTemplate(
        cloneModalId,
        Number(targetCloneYear)
      );
      setCloneModalId(null);
      setSubmitStatus('');
      await loadTemplates();
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Clone failed');
    }
  };

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="3. Holiday Calendar Templates"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            3. Holiday Calendar Templates
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Location/State/Entity calendars, Calendar vs Financial Year, versioning, clone & publish preview
          </p>
        </div>
        {perm.canCreate ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Calendar Template</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={4} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void loadTemplates()}
          actionLabel={perm.canCreate ? 'New Calendar Template' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : templates.length === 0 ? (
        <HolidayEmptyState
          icon={Layers}
          title="No Holiday Calendar Templates Configured"
          description="Create region, state, or entity-specific holiday calendars or clone from a previous year."
          actionLabel={perm.canCreate ? 'New Calendar Template' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {templates.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {tpl.name} ({tpl.code})
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-50 text-indigo-700">
                    v{tpl.version} • {tpl.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {tpl.year} ({tpl.yearType}) • {tpl.entity} •{' '}
                  {tpl.countryStateLocation} • {tpl.totalHolidaysCount} holidays
                  • {tpl.assignedEmployeesCount} employees
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCloneModalId(tpl.id)}
                  className="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Clone Year</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <HolidayModal
        open={modalOpen}
        title="Create Holiday Calendar Template"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Calendar Name"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Calendar Code"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <input
              required
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Year (YYYY)"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          <select
            value={yearType}
            onChange={(e) =>
              setYearType(e.target.value as 'CalendarYear' | 'FinancialYear')
            }
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="CalendarYear">Calendar Year (Jan – Dec)</option>
            <option value="FinancialYear">Financial Year (Apr – Mar)</option>
          </select>
          <input
            required
            value={entity}
            onChange={(e) => setEntity(e.target.value)}
            placeholder="Legal Entity"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <input
            required
            value={countryStateLocation}
            onChange={(e) => setCountryStateLocation(e.target.value)}
            placeholder="Country / State / Location Scope"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <input
            required
            type="date"
            value={effectiveFrom}
            onChange={(e) => setEffectiveFrom(e.target.value)}
            aria-label="Effective from date"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          {submitStatus ? (
            <p className="text-xs text-rose-600 dark:text-rose-400">
              {submitStatus}
            </p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Save Calendar Template
          </button>
        </form>
      </HolidayModal>

      <HolidayModal
        open={Boolean(cloneModalId)}
        title="Clone Calendar Template to Target Year"
        onClose={() => setCloneModalId(null)}
      >
        <form onSubmit={handleClone} className="space-y-3">
          <input
            required
            type="number"
            value={targetCloneYear}
            onChange={(e) => setTargetCloneYear(e.target.value)}
            placeholder="Target Year (YYYY)"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Execute Calendar Clone
          </button>
        </form>
      </HolidayModal>
    </div>
  );
}

// ============================================================================
// 4. HOLIDAY MASTER MODULE (CRUD, Auto Weekday, Half-Day, Bulk Import, Conflicts)
// ============================================================================
export function HolidayMasterModule({ activeRole }: HolidayModuleProps) {
  const perm = useHolidayPermission('master', activeRole);
  const [holidays, setHolidays] = useState<HolidayMasterRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [importOpen, setImportOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [dateOnly, setDateOnly] = useState<string>('');
  const [type, setType] = useState<HolidayCategoryType>('National');
  const [halfDaySession, setHalfDaySession] = useState<
    'FullDay' | 'FirstHalf' | 'SecondHalf'
  >('FullDay');
  const [calendarsCsv, setCalendarsCsv] = useState<string>('');
  const [recurringType, setRecurringType] = useState<
    'FixedDate' | 'LunarMovable'
  >('FixedDate');
  const [paid, setPaid] = useState<boolean>(true);
  const [includeInLeaveCount, setIncludeInLeaveCount] =
    useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadHolidays = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayMasterApi.listHolidays();
      setHolidays(res.items);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load holiday master')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadHolidays();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadHolidays]);

  const computedWeekday = getWeekdayLabelFromDateOnly(dateOnly);

  const handleCreateHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Saving holiday...');
    try {
      await holidayMasterApi.createHoliday({
        name,
        dateOnly,
        type,
        halfDaySession,
        applicableCalendars: calendarsCsv
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        paid,
        includeInLeaveCount,
        recurringType,
        description,
      });
      setCreateOpen(false);
      setSubmitStatus('');
      await loadHolidays();
    } catch (err) {
      setSubmitStatus(
        err instanceof Error ? err.message : 'Failed to create holiday'
      );
    }
  };

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="4. Holiday Master"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            4. Holiday Master & Bulk CSV/XLSX Import
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Timezone-safe date-only records, auto weekday calculation, half-day session & conflict detection
          </p>
        </div>
        {perm.canCreate ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setImportOpen(true)}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Bulk Import CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Holiday</span>
            </button>
          </div>
        ) : null}
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={5} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void loadHolidays()}
          actionLabel={perm.canCreate ? 'Add Holiday' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : holidays.length === 0 ? (
        <HolidayEmptyState
          icon={Calendar}
          title="No Holiday Master Records Found"
          description="Add gazetted, regional, company, or optional holidays via the Holiday Master form or Bulk CSV import."
          actionLabel={perm.canCreate ? 'Add Holiday' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {holidays.map((h) => (
            <div
              key={h.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {h.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                      HOLIDAY_TYPE_BADGE_STYLES[h.type]
                    }`}
                  >
                    {h.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800">
                    {h.halfDaySession}
                  </span>
                  {h.conflictStatus !== 'Clear' ? (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-rose-100 text-rose-700 inline-flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {h.conflictStatus}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {formatHolidayDateOnly(h.dateOnly)} ({h.weekdayLabel}) •{' '}
                  {h.recurringType} • Paid: {h.paid ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <HolidayModal
        open={createOpen}
        title="Add Holiday to Master"
        onClose={() => setCreateOpen(false)}
      >
        <form onSubmit={handleCreateHoliday} className="space-y-3">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Holiday Name"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              type="date"
              value={dateOnly}
              onChange={(e) => setDateOnly(e.target.value)}
              aria-label="Holiday Date"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <div className="h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 flex items-center text-xs font-semibold text-slate-600 dark:text-slate-300">
              Weekday: {computedWeekday}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <select
              value={type}
              onChange={(e) => setType(e.target.value as HolidayCategoryType)}
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="National">National / Gazette</option>
              <option value="Regional">State / Regional</option>
              <option value="Company">Company</option>
              <option value="Optional">Optional / Floating</option>
              <option value="Restricted">Restricted</option>
              <option value="Special">Special / Ad-hoc</option>
            </select>
            <select
              value={halfDaySession}
              onChange={(e) =>
                setHalfDaySession(
                  e.target.value as 'FullDay' | 'FirstHalf' | 'SecondHalf'
                )
              }
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="FullDay">Full Day Holiday</option>
              <option value="FirstHalf">First Half Only</option>
              <option value="SecondHalf">Second Half Only</option>
            </select>
          </div>
          <select
            value={recurringType}
            onChange={(e) =>
              setRecurringType(
                e.target.value as 'FixedDate' | 'LunarMovable'
              )
            }
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="FixedDate">Fixed Date Every Year</option>
            <option value="LunarMovable">
              Movable / Lunar (Requires Yearly Date Confirmation)
            </option>
          </select>
          <input
            required
            value={calendarsCsv}
            onChange={(e) => setCalendarsCsv(e.target.value)}
            placeholder="Applicable Calendar Codes (comma-separated)"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <div className="flex items-center gap-4 text-xs">
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={paid}
                onChange={(e) => setPaid(e.target.checked)}
              />
              <span>Paid Holiday</span>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={includeInLeaveCount}
                onChange={(e) => setIncludeInLeaveCount(e.target.checked)}
              />
              <span>Include in Sandwich Leave Count</span>
            </label>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Observance notes / policy circular reference"
            rows={2}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          {submitStatus ? (
            <p className="text-xs text-rose-600">{submitStatus}</p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Save Holiday Master Record
          </button>
        </form>
      </HolidayModal>

      <HolidayModal
        open={importOpen}
        title="Bulk Import Holidays (CSV / XLSX)"
        onClose={() => setImportOpen(false)}
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-500">
            Upload a CSV/XLSX file with columns: Name, DateOnly (YYYY-MM-DD),
            Type, HalfDaySession, ApplicableCalendars. Duplicate dates and
            weekly-off overlaps are validated automatically by the API.
          </p>
          <input
            type="file"
            accept=".csv,.xlsx"
            aria-label="Upload holiday CSV or XLSX"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const fd = new FormData();
              fd.append('file', file);
              try {
                await holidayMasterApi.bulkImportCsv(fd);
                setImportOpen(false);
                await loadHolidays();
              } catch (err) {
                setSubmitStatus(
                  err instanceof Error ? err.message : 'CSV import failed'
                );
              }
            }}
            className="w-full text-xs"
          />
          {submitStatus ? (
            <p className="text-xs text-rose-600">{submitStatus}</p>
          ) : null}
        </div>
      </HolidayModal>
    </div>
  );
}

// ============================================================================
// 5. CALENDAR ASSIGNMENT MODULE (Priority Resolution & Transfer Reassignment)
// ============================================================================
export function CalendarAssignmentModule({ activeRole }: HolidayModuleProps) {
  const perm = useHolidayPermission('assignment', activeRole);
  const [assignments, setAssignments] = useState<
    HolidayCalendarAssignmentRecord[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [calendarCode, setCalendarCode] = useState<string>('');
  const [scopeType, setScopeType] = useState<
    'Entity' | 'Location' | 'Department' | 'Grade' | 'Employee'
  >('Location');
  const [scopeValue, setScopeValue] = useState<string>('');
  const [priorityRank, setPriorityRank] = useState<string>('1');
  const [effectiveFrom, setEffectiveFrom] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadAssignments = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayAssignmentApi.listAssignments();
      setAssignments(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load calendar assignments')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadAssignments();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAssignments]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Assigning calendar...');
    try {
      await holidayAssignmentApi.assignCalendar({
        calendarCode,
        scopeType,
        scopeValue,
        priorityRank: Number(priorityRank),
        effectiveFrom,
      });
      setModalOpen(false);
      setSubmitStatus('');
      await loadAssignments();
    } catch (err) {
      setSubmitStatus(
        err instanceof Error ? err.message : 'Assignment failed'
      );
    }
  };

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="5. Calendar Assignment"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            5. Calendar Assignment & Priority Resolution
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Hierarchy: Employee Override &gt; Shift/Site &gt; Location &gt; Department &gt; Entity Default
          </p>
        </div>
        {perm.canCreate ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Assign Calendar Rule</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={4} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void loadAssignments()}
          actionLabel={perm.canCreate ? 'Assign Calendar Rule' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : assignments.length === 0 ? (
        <HolidayEmptyState
          icon={MapPin}
          title="No Calendar Assignment Rules Found"
          description="Map holiday calendars to entities, locations, departments, grades, or individual employees."
          actionLabel={perm.canCreate ? 'Assign Calendar Rule' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {assignments.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.calendarName} ({item.calendarCode}) → {item.scopeType}:{' '}
                  {item.scopeValue}
                </p>
                <p className="text-xs text-slate-500">
                  Priority #{item.priorityRank} • Effective{' '}
                  {formatHolidayDateOnly(item.effectiveFrom)} •{' '}
                  {item.resolvedEmployeeCount} employees
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <HolidayModal
        open={modalOpen}
        title="Assign Holiday Calendar"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleAssign} className="space-y-3">
          <input
            required
            value={calendarCode}
            onChange={(e) => setCalendarCode(e.target.value)}
            placeholder="Calendar Code"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <select
              value={scopeType}
              onChange={(e) =>
                setScopeType(
                  e.target.value as
                    | 'Entity'
                    | 'Location'
                    | 'Department'
                    | 'Grade'
                    | 'Employee'
                )
              }
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="Entity">Entity Default</option>
              <option value="Location">Location / Branch</option>
              <option value="Department">Department</option>
              <option value="Grade">Grade / Band</option>
              <option value="Employee">Individual Employee Override</option>
            </select>
            <input
              required
              value={scopeValue}
              onChange={(e) => setScopeValue(e.target.value)}
              placeholder="Scope Value (Code/ID)"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              type="number"
              value={priorityRank}
              onChange={(e) => setPriorityRank(e.target.value)}
              placeholder="Priority Rank (1 = Highest)"
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
            Save Assignment Rule
          </button>
        </form>
      </HolidayModal>
    </div>
  );
}

// ============================================================================
// 6. OPTIONAL / RESTRICTED HOLIDAYS POLICY MODULE
// ============================================================================
export function OptionalRestrictedHolidaysModule({
  activeRole,
}: HolidayModuleProps) {
  const perm = useHolidayPermission('optional-policy', activeRole);
  const [pools, setPools] = useState<OptionalHolidayPolicyRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [calendarCode, setCalendarCode] = useState<string>('');
  const [yearlyQuotaPerEmployee, setYearlyQuotaPerEmployee] =
    useState<string>('2');
  const [bookingWindowDaysPrior, setBookingWindowDaysPrior] =
    useState<string>('7');
  const [maxDailyTeamCapacityPct, setMaxDailyTeamCapacityPct] =
    useState<string>('30');
  const [requireManagerApproval, setRequireManagerApproval] =
    useState<boolean>(true);
  const [lapseRule, setLapseRule] = useState<
    'LapseAtYearEnd' | 'CarryForwardNextQ1'
  >('LapseAtYearEnd');
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadPools = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayOptionalPolicyApi.listPools();
      setPools(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load optional holiday policies')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadPools();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadPools]);

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Saving optional policy...');
    try {
      await holidayOptionalPolicyApi.savePoolPolicy({
        calendarCode,
        yearlyQuotaPerEmployee: Number(yearlyQuotaPerEmployee),
        bookingWindowDaysPrior: Number(bookingWindowDaysPrior),
        maxDailyTeamCapacityPct: Number(maxDailyTeamCapacityPct),
        requireManagerApproval,
        lapseRule,
      });
      setModalOpen(false);
      setSubmitStatus('');
      await loadPools();
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Save failed');
    }
  };

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="6. Optional / Restricted Holidays Policy"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            6. Optional / Restricted Holidays Policy
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure annual optional quota (e.g. 2 out of 10), prior notice window, team capacity limits & lapse rules
          </p>
        </div>
        {perm.canCreate ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Configure Optional Pool</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={4} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void loadPools()}
          actionLabel={perm.canCreate ? 'Configure Optional Pool' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : pools.length === 0 ? (
        <HolidayEmptyState
          icon={Sparkles}
          title="No Optional Holiday Policies Configured"
          description="Set up optional/restricted holiday quotas, prior booking notice days, and team capacity thresholds."
          actionLabel={perm.canCreate ? 'Configure Optional Pool' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {pools.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {p.calendarCode} ({p.year}) — Quota: {p.yearlyQuotaPerEmployee}{' '}
                  / Pool of {p.optionalPoolSize}
                </p>
                <p className="text-xs text-slate-500">
                  Prior Notice: {p.bookingWindowDaysPrior}d • Team Capacity Cap:{' '}
                  {p.maxDailyTeamCapacityPct}% • {p.lapseRule}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <HolidayModal
        open={modalOpen}
        title="Configure Optional / Restricted Holiday Pool"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleSavePolicy} className="space-y-3">
          <input
            required
            value={calendarCode}
            onChange={(e) => setCalendarCode(e.target.value)}
            placeholder="Calendar Code"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <div className="grid grid-cols-3 gap-2">
            <input
              required
              type="number"
              value={yearlyQuotaPerEmployee}
              onChange={(e) => setYearlyQuotaPerEmployee(e.target.value)}
              placeholder="Quota / Year"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <input
              required
              type="number"
              value={bookingWindowDaysPrior}
              onChange={(e) => setBookingWindowDaysPrior(e.target.value)}
              placeholder="Days Prior"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <input
              required
              type="number"
              value={maxDailyTeamCapacityPct}
              onChange={(e) => setMaxDailyTeamCapacityPct(e.target.value)}
              placeholder="Max Team %"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          <select
            value={lapseRule}
            onChange={(e) =>
              setLapseRule(
                e.target.value as 'LapseAtYearEnd' | 'CarryForwardNextQ1'
              )
            }
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="LapseAtYearEnd">
              Unused Quota Lapses at Year End
            </option>
            <option value="CarryForwardNextQ1">
              Carry Forward Unused Quota to Next Q1
            </option>
          </select>
          <label className="inline-flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={requireManagerApproval}
              onChange={(e) => setRequireManagerApproval(e.target.checked)}
            />
            <span>Require Reporting Manager Approval</span>
          </label>
          {submitStatus ? (
            <p className="text-xs text-rose-600">{submitStatus}</p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Save Optional Holiday Policy
          </button>
        </form>
      </HolidayModal>
    </div>
  );
}

// ============================================================================
// 7. WEEKLY OFF & WORKING SATURDAY RULES MODULE
// ============================================================================
export function WeeklyOffRulesModule({ activeRole }: HolidayModuleProps) {
  const perm = useHolidayPermission('weekly-off', activeRole);
  const [rules, setRules] = useState<WeeklyOffRuleRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [patternType, setPatternType] = useState<
    WeeklyOffRuleRecord['patternType']
  >('SecondFourthSaturdayOff');
  const [holidayOverlapHandling, setHolidayOverlapHandling] = useState<
    WeeklyOffRuleRecord['holidayOverlapHandling']
  >('AutoCreditCompOff');
  const [applicableLocationOrShift, setApplicableLocationOrShift] =
    useState<string>('');
  const [effectiveFrom, setEffectiveFrom] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadRules = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidayWeeklyOffApi.listRules();
      setRules(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load weekly off rules')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadRules();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadRules]);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Saving weekly off rule...');
    try {
      await holidayWeeklyOffApi.createRule({
        name,
        patternType,
        holidayOverlapHandling,
        applicableLocationOrShift,
        effectiveFrom,
      });
      setModalOpen(false);
      setSubmitStatus('');
      await loadRules();
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Save failed');
    }
  };

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="7. Weekly Off & Working Saturday Rules"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            7. Weekly Off & Working Saturday Rules
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            2nd & 4th Saturday off, alternate Saturdays, rotational shifts & holiday-on-weekly-off overlap policy
          </p>
        </div>
        {perm.canCreate ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Weekly Off Pattern</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={4} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void loadRules()}
          actionLabel={perm.canCreate ? 'New Weekly Off Pattern' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : rules.length === 0 ? (
        <HolidayEmptyState
          icon={Sliders}
          title="No Weekly Off Rules Defined"
          description="Configure fixed Sat/Sun, 2nd & 4th Saturday off, or rotational weekly-off patterns and overlap handling."
          actionLabel={perm.canCreate ? 'New Weekly Off Pattern' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {rules.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {r.name} ({r.patternType})
                </p>
                <p className="text-xs text-slate-500">
                  Overlap Rule: {r.holidayOverlapHandling} • Scope:{' '}
                  {r.applicableLocationOrShift}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <HolidayModal
        open={modalOpen}
        title="Create Weekly Off & Working Saturday Rule"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleCreateRule} className="space-y-3">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rule Name"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <select
            value={patternType}
            onChange={(e) =>
              setPatternType(
                e.target.value as WeeklyOffRuleRecord['patternType']
              )
            }
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="FixedSatSun">Fixed Saturday & Sunday Off</option>
            <option value="SundayOnly">Sunday Only Off (6-Day Week)</option>
            <option value="SecondFourthSaturdayOff">
              2nd & 4th Saturday Off + All Sundays
            </option>
            <option value="FirstThirdFifthWorking">
              1st, 3rd & 5th Saturday Working
            </option>
            <option value="AlternateSaturday">Alternate Saturdays Off</option>
            <option value="RotationalShift">
              Rotational Shift Roster Weekly Off
            </option>
          </select>
          <select
            value={holidayOverlapHandling}
            onChange={(e) =>
              setHolidayOverlapHandling(
                e.target.value as WeeklyOffRuleRecord['holidayOverlapHandling']
              )
            }
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="NoExtraDay">
              Holiday on Weekly Off: No Extra Day
            </option>
            <option value="AutoCreditCompOff">
              Holiday on Weekly Off: Auto-Credit Comp-Off
            </option>
            <option value="MoveToNextWorkingDay">
              Holiday on Weekly Off: Shift to Next Working Day (Substitute)
            </option>
          </select>
          <input
            required
            value={applicableLocationOrShift}
            onChange={(e) => setApplicableLocationOrShift(e.target.value)}
            placeholder="Applicable Location / Shift Code"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <input
            required
            type="date"
            value={effectiveFrom}
            onChange={(e) => setEffectiveFrom(e.target.value)}
            aria-label="Effective from date"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          {submitStatus ? (
            <p className="text-xs text-rose-600">{submitStatus}</p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Save Weekly Off Rule
          </button>
        </form>
      </HolidayModal>
    </div>
  );
}

// ============================================================================
// 8. SPECIAL / AD-HOC HOLIDAYS & WORKING DAY OVERRIDES MODULE
// ============================================================================
export function SpecialHolidaysOverridesModule({
  activeRole,
}: HolidayModuleProps) {
  const perm = useHolidayPermission('special-overrides', activeRole);
  const [overrides, setOverrides] = useState<SpecialHolidayOverrideRecord[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<HolidayApiError | Error | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [dateOnly, setDateOnly] = useState<string>('');
  const [overrideType, setOverrideType] = useState<
    'AdHocHoliday' | 'WorkingDayOverride'
  >('AdHocHoliday');
  const [reasonCategory, setReasonCategory] = useState<
    SpecialHolidayOverrideRecord['reasonCategory']
  >('GovernmentMandate');
  const [scopeTarget, setScopeTarget] = useState<string>('');
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadOverrides = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await holidaySpecialOverridesApi.listOverrides();
      setOverrides(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load special overrides')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadOverrides();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadOverrides]);

  const handleDeclare = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Declaring override & syncing Attendance/Leave/Payroll...');
    try {
      await holidaySpecialOverridesApi.declareOverride({
        title,
        dateOnly,
        overrideType,
        reasonCategory,
        scopeTarget,
        autoSyncAttendanceLeavePayroll: autoSync,
      });
      setModalOpen(false);
      setSubmitStatus('');
      await loadOverrides();
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Declaration failed');
    }
  };

  if (!perm.canView) {
    return (
      <HolidayPermissionDeniedState
        moduleName="8. Special / Ad-hoc Holidays & Working Day Overrides"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            8. Special / Ad-hoc Holidays & Working Day Overrides
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Emergency holidays (weather, bandh, election), working Saturday overrides & automatic Attendance/Leave/Payroll sync
          </p>
        </div>
        {perm.canCreate ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Declare Special Override</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <HolidaySkeletonBlock rows={4} />
      ) : error ? (
        <HolidayErrorState
          error={error}
          onRetry={() => void loadOverrides()}
          actionLabel={perm.canCreate ? 'Declare Special Override' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : overrides.length === 0 ? (
        <HolidayEmptyState
          icon={ShieldAlert}
          title="No Special Holidays or Working Day Overrides"
          description="Declare emergency holidays or convert a weekend/holiday into a working day with instant Attendance & Leave recalculation."
          actionLabel={perm.canCreate ? 'Declare Special Override' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {overrides.map((ov) => (
            <div
              key={ov.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {ov.title} — {formatHolidayDateOnly(ov.dateOnly)}
                </p>
                <p className="text-xs text-slate-500">
                  {ov.overrideType} • {ov.reasonCategory} • Scope:{' '}
                  {ov.scopeTarget} • Sync: {ov.attendanceLeavePayrollSyncStatus}
                </p>
              </div>
              {perm.canEdit && ov.status === 'Active' ? (
                <button
                  type="button"
                  onClick={() =>
                    void holidaySpecialOverridesApi
                      .rollbackOverride(ov.id, 'Audit rollback')
                      .then(() => loadOverrides())
                  }
                  className="h-8 px-2.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Rollback</span>
                </button>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <HolidayModal
        open={modalOpen}
        title="Declare Ad-hoc Holiday or Working Day Override"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleDeclare} className="space-y-3">
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Declaration Title"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              type="date"
              value={dateOnly}
              onChange={(e) => setDateOnly(e.target.value)}
              aria-label="Override Date"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <select
              value={overrideType}
              onChange={(e) =>
                setOverrideType(
                  e.target.value as 'AdHocHoliday' | 'WorkingDayOverride'
                )
              }
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="AdHocHoliday">Declare Special Holiday</option>
              <option value="WorkingDayOverride">
                Convert Holiday/Weekend to Working Day
              </option>
            </select>
          </div>
          <select
            value={reasonCategory}
            onChange={(e) =>
              setReasonCategory(
                e.target.value as SpecialHolidayOverrideRecord['reasonCategory']
              )
            }
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="GovernmentMandate">
              Government Mandate / Election Polling
            </option>
            <option value="WeatherEmergency">
              Severe Weather / Disaster Alert
            </option>
            <option value="BandhCivicOrder">Civic Order / Bandh</option>
            <option value="CompanyMilestone">Company Special Milestone</option>
          </select>
          <input
            required
            value={scopeTarget}
            onChange={(e) => setScopeTarget(e.target.value)}
            placeholder="Target Location / Branch / Shift Scope"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <label className="inline-flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={autoSync}
              onChange={(e) => setAutoSync(e.target.checked)}
            />
            <span>
              Auto-sync Attendance Roster, Recalculate Leaves & Update Payroll
            </span>
          </label>
          {submitStatus ? (
            <p className="text-xs text-rose-600">{submitStatus}</p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
          >
            Confirm & Broadcast Declaration
          </button>
        </form>
      </HolidayModal>
    </div>
  );
}
