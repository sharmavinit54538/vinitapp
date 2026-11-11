'use client';

import React, { useState } from 'react';
import {
  Gauge,
  CalendarDays,
  Layers,
  CalendarPlus,
  MapPin,
  Sparkles,
  Sliders,
  ShieldAlert,
  ArrowLeftRight,
  Building2,
  Clock,
  Link2,
  CalendarCheck,
  CheckSquare,
  Megaphone,
  CalendarCog,
  BarChart3,
  Settings,
  ShieldCheck,
  Bell,
  Users,
  UserCheck,
  ChevronRight,
  ArrowLeft,
  Grid,
} from 'lucide-react';
import { HolidayModuleId, HolidayRole } from '../../types/holidays';
import {
  HOLIDAY_ROLE_LABELS,
  canHolidayRoleAccessModule,
} from '../../hooks/useHolidayPermission';
import {
  HolidayDashboardModule,
  HolidayCalendarViewsModule,
  HolidayCalendarTemplatesModule,
  HolidayMasterModule,
  CalendarAssignmentModule,
  OptionalRestrictedHolidaysModule,
  WeeklyOffRulesModule,
  SpecialHolidaysOverridesModule,
} from './HolidayCoreAndCalendarsModules';
import {
  HolidaySwapCompOffModule,
  ShiftSiteHolidaysModule,
  HolidayWorkHandlingModule,
  LeavePayrollIntegrationModule,
  OptionalHolidayBookingModule,
  HolidayApprovalsWorkflowModule,
  HolidayCommunicationsModule,
} from './HolidayOperationsAndIntegrationsModules';
import {
  YearRolloverPublishingModule,
  HolidayReportsAnalyticsModule,
  HolidaySettingsAutomationModule,
  HolidayAuditLogsModule,
  HolidayNotificationsModule,
  HolidayManagerPortalModule,
  EmployeeHolidayPortalModule,
} from './HolidayGovernanceAndPortalsModules';

export interface HolidayModuleMeta {
  id: HolidayModuleId;
  number: number;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

export const HOLIDAY_MODULES_REGISTRY: HolidayModuleMeta[] = [
  {
    id: 'dashboard',
    number: 1,
    label: '1. Holiday Dashboard',
    subtitle: 'KPIs, next holiday countdown & conflict alerts',
    icon: Gauge,
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'calendar-views',
    number: 2,
    label: '2. Holiday Calendar Views',
    subtitle: 'Year, Month, List, side-by-side compare & ICS feed',
    icon: CalendarDays,
    iconBg: 'bg-blue-50 dark:bg-blue-950/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'templates',
    number: 3,
    label: '3. Holiday Calendar Templates',
    subtitle: 'Location/state/entity templates, clone & publish',
    icon: Layers,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'master',
    number: 4,
    label: '4. Holiday Master',
    subtitle: 'Add holidays, half-day, lunar flags & CSV import',
    icon: CalendarPlus,
    iconBg: 'bg-amber-50 dark:bg-amber-950/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'assignment',
    number: 5,
    label: '5. Calendar Assignment',
    subtitle: 'Assign by entity, location, department or employee',
    icon: MapPin,
    iconBg: 'bg-violet-50 dark:bg-violet-950/60',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'optional-policy',
    number: 6,
    label: '6. Optional / Restricted Holidays',
    subtitle: 'Annual quota, prior notice window & team capacity',
    icon: Sparkles,
    iconBg: 'bg-pink-50 dark:bg-pink-950/60',
    iconColor: 'text-pink-600 dark:text-pink-400',
  },
  {
    id: 'weekly-off',
    number: 7,
    label: '7. Weekly Off & Working Saturday Rules',
    subtitle: '2nd/4th Saturday off, rotational & overlap handling',
    icon: Sliders,
    iconBg: 'bg-cyan-50 dark:bg-cyan-950/60',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'special-overrides',
    number: 8,
    label: '8. Special Holidays & Working Day Overrides',
    subtitle: 'Emergency holidays, working Saturday & rollback',
    icon: ShieldAlert,
    iconBg: 'bg-rose-50 dark:bg-rose-950/60',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'swap-compoff',
    number: 9,
    label: '9. Holiday Swap & Comp-Off Rules',
    subtitle: 'Exchange holidays & compensatory off ledger',
    icon: ArrowLeftRight,
    iconBg: 'bg-orange-50 dark:bg-orange-950/60',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'shift-site',
    number: 10,
    label: '10. Shift-wise & Site-wise Holidays',
    subtitle: '24x7 shifts, plants, retail & client calendars',
    icon: Building2,
    iconBg: 'bg-teal-50 dark:bg-teal-950/60',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    id: 'holiday-work',
    number: 11,
    label: '11. Holiday Work Handling',
    subtitle: 'Attendance punches on holidays & OT multipliers',
    icon: Clock,
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'leave-payroll-sync',
    number: 12,
    label: '12. Leave & Payroll Integration',
    subtitle: 'Sandwich leave policy, recalculation & payable days',
    icon: Link2,
    iconBg: 'bg-blue-50 dark:bg-blue-950/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'optional-booking',
    number: 13,
    label: '13. Optional Holiday Booking',
    subtitle: 'Employee optional holiday booking & team capacity',
    icon: CalendarCheck,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'approvals',
    number: 14,
    label: '14. Approvals Workflow',
    subtitle: 'Approve calendar publish, overrides & comp-offs',
    icon: CheckSquare,
    iconBg: 'bg-amber-50 dark:bg-amber-950/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'communications',
    number: 15,
    label: '15. Communication & Announcements',
    subtitle: 'Annual holiday circulars & emergency alerts',
    icon: Megaphone,
    iconBg: 'bg-purple-50 dark:bg-purple-950/60',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'year-rollover',
    number: 16,
    label: '16. Year Rollover & Publishing',
    subtitle: 'Year-end clone wizard, quota carry-forward & lock',
    icon: CalendarCog,
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'reports',
    number: 17,
    label: '17. Reports & Analytics',
    subtitle: '10 statutory gazette, optional & payroll reports',
    icon: BarChart3,
    iconBg: 'bg-sky-50 dark:bg-sky-950/60',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'settings',
    number: 18,
    label: '18. Settings & Automation Rules',
    subtitle: '11 automation triggers & 6 system integrations',
    icon: Settings,
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-700 dark:text-slate-300',
  },
  {
    id: 'audit-logs',
    number: 19,
    label: '19. Audit Logs',
    subtitle: 'Immutable calendar & policy mutation history',
    icon: ShieldCheck,
    iconBg: 'bg-violet-50 dark:bg-violet-950/60',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'notifications',
    number: 20,
    label: '20. Notifications',
    subtitle: 'Calendar publish, booking & quota expiry alerts',
    icon: Bell,
    iconBg: 'bg-amber-50 dark:bg-amber-950/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'manager-portal',
    number: 21,
    label: '21. Manager Portal',
    subtitle: 'Team holiday schedule, bookings & comp-off',
    icon: Users,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'employee-portal',
    number: 22,
    label: '22. Employee Portal (My Holidays)',
    subtitle: 'Assigned calendar, optional quota & ICS subscribe',
    icon: UserCheck,
    iconBg: 'bg-blue-50 dark:bg-blue-950/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
];

const DIRECTORY_GROUPS: HolidayModuleMeta[][] = [
  HOLIDAY_MODULES_REGISTRY.slice(0, 6),
  HOLIDAY_MODULES_REGISTRY.slice(6, 12),
  HOLIDAY_MODULES_REGISTRY.slice(12, 17),
  HOLIDAY_MODULES_REGISTRY.slice(17, 22),
];

export interface HolidayWorkspaceShellProps {
  initialModule?: HolidayModuleId;
  embedded?: boolean;
  startInDirectory?: boolean;
}

export function HolidayWorkspaceShell({
  initialModule = 'dashboard',
  embedded = false,
  startInDirectory = false,
}: HolidayWorkspaceShellProps) {
  const [activeModule, setActiveModule] =
    useState<HolidayModuleId>(initialModule);
  const [showDirectory, setShowDirectory] =
    useState<boolean>(startInDirectory);
  const [activeRole, setActiveRole] = useState<HolidayRole>('super_admin');

  const currentMeta =
    HOLIDAY_MODULES_REGISTRY.find((m) => m.id === activeModule) ||
    HOLIDAY_MODULES_REGISTRY[0];

  const handleSelectModule = (moduleId: HolidayModuleId) => {
    setActiveModule(moduleId);
    setShowDirectory(false);
  };

  const renderActiveModule = () => {
    const props = {
      activeRole,
      onNavigateModule: handleSelectModule,
    };

    switch (activeModule) {
      case 'dashboard':
        return <HolidayDashboardModule {...props} />;
      case 'calendar-views':
        return <HolidayCalendarViewsModule {...props} />;
      case 'templates':
        return <HolidayCalendarTemplatesModule {...props} />;
      case 'master':
        return <HolidayMasterModule {...props} />;
      case 'assignment':
        return <CalendarAssignmentModule {...props} />;
      case 'optional-policy':
        return <OptionalRestrictedHolidaysModule {...props} />;
      case 'weekly-off':
        return <WeeklyOffRulesModule {...props} />;
      case 'special-overrides':
        return <SpecialHolidaysOverridesModule {...props} />;
      case 'swap-compoff':
        return <HolidaySwapCompOffModule {...props} />;
      case 'shift-site':
        return <ShiftSiteHolidaysModule {...props} />;
      case 'holiday-work':
        return <HolidayWorkHandlingModule {...props} />;
      case 'leave-payroll-sync':
        return <LeavePayrollIntegrationModule {...props} />;
      case 'optional-booking':
        return <OptionalHolidayBookingModule {...props} />;
      case 'approvals':
        return <HolidayApprovalsWorkflowModule {...props} />;
      case 'communications':
        return <HolidayCommunicationsModule {...props} />;
      case 'year-rollover':
        return <YearRolloverPublishingModule {...props} />;
      case 'reports':
        return <HolidayReportsAnalyticsModule {...props} />;
      case 'settings':
        return <HolidaySettingsAutomationModule {...props} />;
      case 'audit-logs':
        return <HolidayAuditLogsModule {...props} />;
      case 'notifications':
        return <HolidayNotificationsModule {...props} />;
      case 'manager-portal':
        return <HolidayManagerPortalModule {...props} />;
      case 'employee-portal':
        return <EmployeeHolidayPortalModule {...props} />;
      default:
        return <HolidayDashboardModule {...props} />;
    }
  };

  return (
    <div
      className={
        embedded
          ? 'space-y-4 pb-8'
          : 'max-w-5xl mx-auto px-3 sm:px-5 py-4 space-y-4 pb-20'
      }
    >
      {/* Top Header & RBAC Role Switcher */}
      <div className="rounded-3xl p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {!showDirectory ? (
            <button
              type="button"
              onClick={() => setShowDirectory(true)}
              aria-label="Back to 22 Holiday Modules Directory"
              className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : null}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                Holiday Management • 22 Modules
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {showDirectory
                ? 'Enterprise Holiday & Calendar Management Suite'
                : currentMeta.label}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDirectory((prev) => !prev)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5"
          >
            <Grid className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{showDirectory ? 'Open Active Module' : 'All 22 Modules'}</span>
          </button>

          <select
            aria-label="Switch Holiday RBAC Role"
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as HolidayRole)}
            className="h-9 px-3 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300"
          >
            {(Object.keys(HOLIDAY_ROLE_LABELS) as HolidayRole[]).map((role) => (
              <option key={role} value={role}>
                Role: {HOLIDAY_ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 22-Module Vertical Grouped Directory (6 + 6 + 5 + 5 = 22) */}
      {showDirectory ? (
        <div className="space-y-3.5">
          {DIRECTORY_GROUPS.map((group, groupIdx) => (
            <div
              key={groupIdx}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden"
            >
              {group.map((mod) => {
                const IconComp = mod.icon;
                const hasAccess = canHolidayRoleAccessModule(
                  activeRole,
                  mod.id
                );
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => handleSelectModule(mod.id)}
                    className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl ${mod.iconBg} ${mod.iconColor} flex items-center justify-center shrink-0`}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {mod.label}
                          </p>
                          {!hasAccess ? (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300">
                              Restricted
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {mod.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-indigo-50/80 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        renderActiveModule()
      )}
    </div>
  );
}
