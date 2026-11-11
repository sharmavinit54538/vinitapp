'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'sonner';
import {
  Briefcase,
  Calendar,
  FileText,
  Home,
  Laptop,
  LogOut,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { authClient } from '../../../lib/auth-api';
import {
  EmployeeDashboardRole,
  EmployeeWidgetId,
  WidgetLayoutItem,
} from '../../types/employeeDashboard';
import {
  employeeDashboardLayoutApi,
  employeeProfileSummaryApi,
  employeeRealtimePulseApi,
} from '../../services/employee-dashboard';
import { usePermission } from '../../hooks/useEmployeeDashboardPermission';
import { useWidgetResource } from './EmployeeDashboardPrimitives';
import {
  EmployeeHeaderProfileWidget,
  MyAttendanceSummaryWidget,
  MyLeaveWidget,
  MyPaySnapshotWidget,
  QuickActionsWidget,
  TodayPunchStatusWidget,
} from './WidgetsGroupA';
import {
  CompanyFeedWidget,
  MyAssetsAndRequestsWidget,
  MyLearningWidget,
  MyPerformanceWidget,
  MyTasksPendingActionsWidget,
  MyTeamOrgWidget,
} from './WidgetsGroupB';
import {
  GlobalSearchModal,
  ManagerExtrasWidget,
  MyHelpdeskWidget,
  MyProbationExitWidget,
  MyTravelWidget,
  NotificationsDrawerModal,
  RealtimeOfflineStatusBanner,
  WidgetPersonalizationDialog,
} from './WidgetsGroupC';

const MOBILE_PRIORITY_ORDER: EmployeeWidgetId[] = [
  'today',
  'quick-actions',
  'tasks',
  'leave',
  'pay',
  'attendance-summary',
  'performance',
  'assets-requests',
  'learning',
  'company-feed',
  'team-org',
  'travel',
  'helpdesk',
  'probation-exit',
  'manager-extras',
];

export function EmployeeDashboardHub({
  initialRole = 'employee',
}: {
  initialRole?: EmployeeDashboardRole;
}) {
  const router = useRouter();
  const [role, setRole] = useState<EmployeeDashboardRole>(initialRole);
  const [isDark, setIsDark] = useState(false);
  const [isOffline, setIsOffline] = useState<boolean>(() =>
    typeof window !== 'undefined' ? !window.navigator.onLine : false
  );
  const [urlSearch] = useState<string>(() =>
    typeof window !== 'undefined' ? window.location.search : ''
  );

  // Modal & Drawer Triggers
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [personalizeOpen, setPersonalizeOpen] = useState(false);
  const [openLeaveApplyFromQuickAction, setOpenLeaveApplyFromQuickAction] =
    useState(false);
  const [openRegularizeFromQuickAction, setOpenRegularizeFromQuickAction] =
    useState(false);
  const [openRaiseTicketFromQuickAction, setOpenRaiseTicketFromQuickAction] =
    useState(false);

  // 1. Profile Summary from API
  const {
    data: profile,
    loading: profileLoading,
    error: profileError,
    refresh: refreshProfile,
  } = useWidgetResource((signal) =>
    employeeProfileSummaryApi.getSummary({ signal })
  );

  // 17. Widget Layout Config from API
  const { data: layoutConfig, setData: setLayoutConfig } = useWidgetResource(
    (signal) => employeeDashboardLayoutApi.getLayout({ signal })
  );

  const [unreadNotificationsCountOverride, setUnreadNotificationsCount] =
    useState<number | null>(null);
  const [lastPulseIso, setLastPulseIso] = useState<string | null>(null);

  const unreadNotificationsCount =
    unreadNotificationsCountOverride ?? profile?.unreadNotificationsCount ?? 0;

  // Online/offline listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Connection restored — syncing live dashboard state');
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 19. Real-time pulse polling with visibility pause, focus refresh & exponential backoff
  const runPulseCheck = useCallback(async () => {
    if (typeof document !== 'undefined' && document.hidden) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    const pulse = await employeeRealtimePulseApi.getPulse(
      lastPulseIso || undefined
    );
    setLastPulseIso(pulse.asOf);
    setUnreadNotificationsCount(pulse.unreadNotificationsCount);
  }, [lastPulseIso]);

  useEffect(() => {
    let cancelled = false;
    let consecutiveFailures = 0;
    let timerId: ReturnType<typeof setTimeout> | null = null;

    const scheduleNext = () => {
      if (cancelled) return;
      const delayMs = Math.min(120000, 30000 * Math.pow(2, consecutiveFailures));
      timerId = setTimeout(async () => {
        try {
          await runPulseCheck();
          consecutiveFailures = 0;
        } catch {
          consecutiveFailures += 1;
        } finally {
          scheduleNext();
        }
      }, delayMs);
    };

    scheduleNext();

    const handleFocus = () => {
      void runPulseCheck().catch(() => {
        // Backoff handled by polling loop
      });
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      cancelled = true;
      if (timerId) clearTimeout(timerId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [runPulseCheck]);

  const permissionEval = usePermission(
    role,
    profile?.permissions || [],
    urlSearch
  );

  const handleTriggerQuickAction = (
    moduleKey: string,
    targetRouteOrModal: string
  ) => {
    if (moduleKey === 'leave') {
      setOpenLeaveApplyFromQuickAction(true);
      return;
    }
    if (moduleKey === 'attendance' || moduleKey === 'wfh') {
      setOpenRegularizeFromQuickAction(true);
      return;
    }
    if (moduleKey === 'helpdesk') {
      setOpenRaiseTicketFromQuickAction(true);
      return;
    }
    if (targetRouteOrModal.startsWith('/')) {
      router.push(targetRouteOrModal);
    } else {
      const el = document.getElementById(`widget-${targetRouteOrModal}`);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    authClient.clearSession();
    void authClient.logout();
    router.push('/login');
  };

  // Determine ordered & visible widgets from API layout config (fallback to mobile-first order)
  const orderedWidgets: EmployeeWidgetId[] = layoutConfig?.widgets?.length
    ? [...layoutConfig.widgets]
        .filter((w) => w.visible)
        .sort((a, b) => a.order - b.order)
        .map((w) => w.widgetId)
    : MOBILE_PRIORITY_ORDER;

  const renderWidgetById = (widgetId: EmployeeWidgetId) => {
    if (
      !permissionEval.canViewWidget(
        widgetId,
        profile?.applicableConditionalWidgets
      )
    ) {
      return null;
    }

    switch (widgetId) {
      case 'today':
        return (
          <TodayPunchStatusWidget
            key="today"
            isDark={isDark}
            isOffline={isOffline}
            externalOpenRegularize={openRegularizeFromQuickAction}
            onCloseExternalRegularize={() =>
              setOpenRegularizeFromQuickAction(false)
            }
          />
        );
      case 'quick-actions':
        return (
          <QuickActionsWidget
            key="quick-actions"
            isDark={isDark}
            onTriggerQuickAction={handleTriggerQuickAction}
          />
        );
      case 'tasks':
        return <MyTasksPendingActionsWidget key="tasks" isDark={isDark} />;
      case 'leave':
        return (
          <MyLeaveWidget
            key="leave"
            isDark={isDark}
            externalOpenApply={openLeaveApplyFromQuickAction}
            onCloseExternalApply={() => setOpenLeaveApplyFromQuickAction(false)}
          />
        );
      case 'pay':
        return <MyPaySnapshotWidget key="pay" isDark={isDark} />;
      case 'attendance-summary':
        return (
          <MyAttendanceSummaryWidget
            key="attendance-summary"
            isDark={isDark}
          />
        );
      case 'performance':
        return <MyPerformanceWidget key="performance" isDark={isDark} />;
      case 'assets-requests':
        return (
          <MyAssetsAndRequestsWidget key="assets-requests" isDark={isDark} />
        );
      case 'learning':
        return <MyLearningWidget key="learning" isDark={isDark} />;
      case 'company-feed':
        return <CompanyFeedWidget key="company-feed" isDark={isDark} />;
      case 'team-org':
        return <MyTeamOrgWidget key="team-org" isDark={isDark} />;
      case 'travel':
        return <MyTravelWidget key="travel" isDark={isDark} />;
      case 'helpdesk':
        return (
          <MyHelpdeskWidget
            key="helpdesk"
            isDark={isDark}
            externalOpenRaiseTicket={openRaiseTicketFromQuickAction}
            onCloseExternalRaiseTicket={() =>
              setOpenRaiseTicketFromQuickAction(false)
            }
          />
        );
      case 'probation-exit':
        return <MyProbationExitWidget key="probation-exit" isDark={isDark} />;
      case 'manager-extras':
        return (
          <ManagerExtrasWidget
            key="manager-extras"
            isDark={isDark}
            isManagerPermitted={permissionEval.isManager}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={
        isDark
          ? 'dark min-h-screen bg-slate-950 text-slate-100'
          : 'min-h-screen bg-slate-50 text-slate-900'
      }
    >
      <Toaster position="top-right" richColors />

      <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
        {/* Sidebar Navigation (240px desktop) */}
        <aside
          aria-label="Employee Dashboard Navigation"
          className={`w-full shrink-0 border-b p-4 lg:min-h-screen lg:w-60 lg:border-r lg:border-b-0 ${
            isDark
              ? 'border-slate-800 bg-slate-900'
              : 'border-slate-200 bg-white'
          }`}
        >
          <div className="mb-4 flex items-center justify-between lg:block">
            <span className="text-sm font-bold tracking-tight">
              OFC360 Portal
            </span>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Personal Employee Workspace
            </p>
          </div>

          <nav className="flex flex-wrap gap-1.5 lg:flex-col">
            <a
              href="#widget-today"
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
            >
              <Home className="h-3.5 w-3.5" />
              My Home Dashboard
            </a>
            <a
              href="#widget-attendance-summary"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Calendar className="h-3.5 w-3.5" />
              My Attendance &amp; Leave
            </a>
            <a
              href="#widget-pay"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <FileText className="h-3.5 w-3.5" />
              My Pay &amp; Tax
            </a>
            <a
              href="#widget-assets-requests"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Laptop className="h-3.5 w-3.5" />
              My Assets &amp; Requests
            </a>
            <Link
              href="/attendance-analytics"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Briefcase className="h-3.5 w-3.5" />
              Attendance Analytics
            </Link>
          </nav>

          {/* Role Scope Toggle (Employee vs Reporting Manager) */}
          <div className="mt-6 rounded-xl border border-slate-200/80 p-3 text-xs dark:border-slate-800">
            <label
              htmlFor="employee-dashboard-role-select"
              className="block font-semibold"
            >
              Active Permission Context
            </label>
            <select
              id="employee-dashboard-role-select"
              data-testid="employee-role-selector"
              value={role}
              onChange={(e) =>
                setRole(e.target.value as EmployeeDashboardRole)
              }
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-transparent px-2.5 py-1.5 text-xs font-medium dark:border-slate-700"
            >
              <option value="employee" className="text-slate-900">
                Employee (Self Only)
              </option>
              <option value="reporting_manager" className="text-slate-900">
                Reporting Manager (+ Team Extras)
              </option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => void handleLogout()}
            data-testid="sidebar-logout-btn"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout / Sign Out</span>
          </button>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 space-y-5 p-4 sm:p-6">
          {/* Rule 9: Guard against URL employeeId parameter */}
          {permissionEval.sanitizedUrlHasForbiddenEmployeeId && (
            <div
              role="alert"
              data-testid="forbidden-employee-id-alert"
              className="flex items-center gap-2.5 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs text-rose-900"
            >
              <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600" />
              <span>
                Security Policy: The personal Employee Dashboard never accepts
                an employeeId parameter from the URL. Displaying strictly your
                authenticated session data.
              </span>
            </div>
          )}

          {/* 19. Offline Banner */}
          <RealtimeOfflineStatusBanner
            isOffline={isOffline}
            lastPulseIso={lastPulseIso}
            onManualPulse={() => void runPulseCheck()}
          />

          {/* 1. Header & Profile Summary */}
          <EmployeeHeaderProfileWidget
            profile={profile}
            loading={profileLoading}
            error={profileError}
            onRetry={() => void refreshProfile()}
            unreadCount={unreadNotificationsCount}
            onOpenSearch={() => setSearchOpen(true)}
            onOpenNotifications={() => setNotificationsOpen(true)}
            onOpenPersonalize={() => setPersonalizeOpen(true)}
            onLogout={() => void handleLogout()}
            isDark={isDark}
            onToggleDark={() => setIsDark((d) => !d)}
          />

          {/* Ordered Employee Widgets */}
          <div className="space-y-5">
            {orderedWidgets.map((wId) => renderWidgetById(wId))}
          </div>
        </main>
      </div>

      {/* 17. Layout Personalization Modal */}
      <WidgetPersonalizationDialog
        open={personalizeOpen}
        widgets={
          layoutConfig?.widgets ||
          MOBILE_PRIORITY_ORDER.map((id, index) => ({
            widgetId: id,
            title: id
              .split('-')
              .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
              .join(' '),
            visible: true,
            order: index + 1,
            mobilePriorityOrder: index + 1,
            mandatory: id === 'today',
          }))
        }
        onClose={() => setPersonalizeOpen(false)}
        onLayoutUpdated={(updated: WidgetLayoutItem[]) =>
          setLayoutConfig((prev) =>
            prev
              ? { ...prev, widgets: updated }
              : {
                  asOf: new Date().toISOString(),
                  roleDefaultApplied: role,
                  widgets: updated,
                }
          )
        }
      />

      {/* 18. Notifications & Global Search Modals */}
      <NotificationsDrawerModal
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onUnreadCountChange={setUnreadNotificationsCount}
      />

      <GlobalSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}
