'use client';

import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { Provider, useDispatch, useSelector } from 'react-redux';
import {
  makeHrStore,
  AppStore,
  RootState,
  setBottomTab,
  setHomeTab,
  setActiveRole,
  setDarkMode,
  setAnnouncementSheetOpen,
  setAddEmployeeSheetOpen,
  setNotificationsOpen,
  showToast,
  clearToast,
} from '@/lib/store';
import { useGetHrDashboardQuery } from '@/lib/store/hr-api';
import {
  BottomNavTab,
  HomeInternalTab,
  canManageHrAdminActions,
  createInitialHrDashboardState,
} from '@/lib/hr-dashboard-logic';
import { Ofc360Role } from '@/lib/auth-schemas';
import { authClient } from '@/lib/auth-api';
import { OverviewTab } from './overview-tab';
import {
  ShiftsModuleTab,
  RostersModuleTab,
  HolidaysModuleTab,
} from './shifts-rosters-holidays-tabs';
import {
  WorkforceScreen,
  AttendanceScreen,
  ApprovalsScreen,
  MoreModulesScreen,
  ProfileScreen,
} from './workforce-attendance-approvals-views';
import {
  AnnouncementBottomSheet,
  AddEmployeeBottomSheet,
  NotificationsSheet,
} from './announcement-and-notifications-sheets';
import { Ofc360LogoMark } from '@/components/auth/shared';
import {
  Home,
  Users,
  CalendarCheck,
  CheckSquare,
  LayoutGrid,
  User,
  Heart,
  CheckCircle2,
  ShieldAlert,
  Sun,
  Moon,
  LogOut,
  ArrowLeft,
  LifeBuoy,
  BarChart3,
} from 'lucide-react';

interface HrMobileDashboardContentProps {
  initialRole?: Ofc360Role;
}

function HrMobileDashboardContent({
  initialRole = 'hr_admin',
}: HrMobileDashboardContentProps) {
  const dispatch = useDispatch();
  const {
    activeBottomTab,
    activeHomeTab,
    activeRole,
    isDarkMode,
    isAnnouncementSheetOpen,
    isAddEmployeeSheetOpen,
    isNotificationsOpen,
    toastMessage,
  } = useSelector((state: RootState) => state.hrMobileUi);

  const {
    data: remoteData,
  } = useGetHrDashboardQuery();

  const [isLiked, setIsLiked] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);

  // Deterministic initial state so KPIs never flash zeros while RTK Query hydrates
  const [fallbackState] = useState(() => createInitialHrDashboardState());
  const dashboardData = remoteData || fallbackState;

  useEffect(() => {
    if (initialRole) {
      dispatch(setActiveRole(initialRole));
    }
  }, [initialRole, dispatch]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDarkMode);
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      dispatch(clearToast());
    }, 3500);
    return () => clearTimeout(timer);
  }, [toastMessage, dispatch]);

  const canEdit = canManageHrAdminActions(activeRole);
  const unreadNotifCount = dashboardData.notifications.filter(
    (n) => !n.read
  ).length;
  const likeCount = unreadNotifCount + (isLiked ? 1 : 0);
  const pendingApprovalCount = dashboardData.kpis.approvals.totalPending;

  const triggerToast = (text: string) => {
    dispatch(showToast({ text, type: 'success' }));
  };

  const handleNavigateBottom = (tab: BottomNavTab) => {
    dispatch(setBottomTab(tab));
    setIsAvatarMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateHomeInternal = (tab: HomeInternalTab) => {
    dispatch(setBottomTab('home'));
    dispatch(setHomeTab(tab));
    setIsAvatarMenuOpen(false);
  };

  return (
    <div
      data-testid="ofc360-hr-mobile-app"
      className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col pb-20 transition-colors"
    >
      {/* 1. COMPACT NATIVE TOP APP BAR (Sticky h-14 = 56px, respects <=15% sticky budget) */}
      <header className="sticky top-0 z-30 h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Identity with Official OFC360 Logo */}
        <button
          type="button"
          onClick={() => handleNavigateHomeInternal('overview')}
          aria-label="OFC360 Home"
          className="flex items-center gap-2 text-left cursor-pointer shrink-0"
        >
          <Ofc360LogoMark size="sm" />
        </button>

        {/* Zone 2: Desktop Quick Module Links */}
        <nav
          aria-label="Primary Mobile Modules"
          className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-600 dark:text-slate-300"
        >
          <button
            type="button"
            onClick={() => handleNavigateHomeInternal('overview')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer ${
              activeBottomTab === 'home' && activeHomeTab === 'overview'
                ? 'text-indigo-600 dark:text-indigo-400'
                : ''
            }`}
          >
            Overview
          </button>
          <button
            type="button"
            onClick={() => handleNavigateHomeInternal('shifts')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer ${
              activeBottomTab === 'home' && activeHomeTab === 'shifts'
                ? 'text-indigo-600 dark:text-indigo-400'
                : ''
            }`}
          >
            Shifts
          </button>
          <button
            type="button"
            onClick={() => handleNavigateHomeInternal('rosters')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer ${
              activeBottomTab === 'home' && activeHomeTab === 'rosters'
                ? 'text-indigo-600 dark:text-indigo-400'
                : ''
            }`}
          >
            Rosters
          </button>
          <button
            type="button"
            onClick={() => handleNavigateHomeInternal('holidays')}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap cursor-pointer ${
              activeBottomTab === 'home' && activeHomeTab === 'holidays'
                ? 'text-indigo-600 dark:text-indigo-400'
                : ''
            }`}
          >
            Holidays
          </button>
          <Link
            href="/payroll-analytics"
            data-testid="header-payroll-analytics-link"
            className="hover:text-emerald-700 dark:hover:text-emerald-300 text-emerald-600 dark:text-emerald-400 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 font-bold"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Payroll Analytics
          </Link>
          <Link
            href="/helpdesk"
            data-testid="header-helpdesk-link"
            className="hover:text-indigo-700 dark:hover:text-indigo-300 text-indigo-600 dark:text-indigo-400 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 font-bold"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            Help Desk
          </Link>
        </nav>

        {/* Zone 3: Heart Like Icon with Top Number Badge & Profile Avatar */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsLiked((prev) => !prev)}
            aria-label={`Likes (${likeCount})`}
            aria-pressed={isLiked}
            data-testid="mobile-notifications-trigger"
            className="relative min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Heart
              className={`w-5 h-5 transition-transform ${
                isLiked
                  ? 'fill-rose-500 text-rose-500 scale-110'
                  : 'text-slate-700 dark:text-slate-200'
              }`}
            />
            <span
              data-testid="unread-notifications-badge"
              className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-indigo-600 text-white font-mono text-[10px] font-bold flex items-center justify-center leading-none shadow-2xs"
            >
              {likeCount}
            </span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAvatarMenuOpen((prev) => !prev)}
              aria-label="Open HR Admin Profile Menu"
              aria-expanded={isAvatarMenuOpen}
              data-testid="header-profile-avatar"
              className="w-9 h-9 rounded-full bg-slate-900 dark:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center hover:ring-2 hover:ring-slate-300 dark:hover:ring-slate-600 transition-all cursor-pointer shadow-xs"
            >
              AS
            </button>

            {isAvatarMenuOpen && (
              <div
                data-testid="header-avatar-menu"
                className="absolute right-0 mt-2 w-60 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2 z-50 space-y-1"
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {dashboardData.adminProfile.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {dashboardData.adminProfile.designation}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavigateBottom('profile')}
                  data-testid="avatar-menu-my-profile"
                  className="w-full min-h-[38px] px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-left cursor-pointer"
                >
                  <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  My Profile &amp; Company
                </button>

                <button
                  type="button"
                  onClick={() => handleNavigateBottom('more')}
                  data-testid="avatar-menu-more-modules"
                  className="w-full min-h-[38px] px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-left cursor-pointer"
                >
                  <LayoutGrid className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                  More Modules
                </button>

                <Link
                  href="/payroll-analytics"
                  data-testid="avatar-menu-payroll-analytics"
                  onClick={() => setIsAvatarMenuOpen(false)}
                  className="w-full min-h-[38px] px-3 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2.5 text-left cursor-pointer"
                >
                  <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Payroll Analytics
                </Link>

                <Link
                  href="/helpdesk"
                  data-testid="avatar-menu-helpdesk"
                  onClick={() => setIsAvatarMenuOpen(false)}
                  className="w-full min-h-[38px] px-3 rounded-xl text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2.5 text-left cursor-pointer"
                >
                  <LifeBuoy className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Enterprise Help Desk
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    dispatch(setDarkMode(!isDarkMode));
                    setIsAvatarMenuOpen(false);
                  }}
                  data-testid="avatar-menu-theme-toggle"
                  className="w-full min-h-[38px] px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-left cursor-pointer"
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="w-4 h-4 text-amber-400" />
                      Switch to Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4 text-indigo-600" />
                      Switch to Dark Mode
                    </>
                  )}
                </button>

                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={async () => {
                      setIsAvatarMenuOpen(false);
                      await authClient.logout();
                      triggerToast('Session signed out.');
                    }}
                    data-testid="avatar-menu-logout"
                    className="w-full min-h-[38px] px-3 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          role="status"
          data-testid="mobile-toast-banner"
          className="fixed top-16 right-4 left-4 sm:left-auto sm:w-96 z-50 rounded-2xl border border-emerald-200 dark:border-emerald-900/70 bg-emerald-50/95 dark:bg-emerald-950/90 backdrop-blur-md px-4 py-3 text-xs font-semibold text-emerald-950 dark:text-emerald-200 shadow-lg flex items-center justify-between gap-2"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{toastMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => dispatch(clearToast())}
            className="text-[11px] underline opacity-75 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* MAIN SCROLLABLE WORKSPACE CONTAINER */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-6 space-y-5">
        {/* RBAC Read-Only Notice if switched to non-admin role */}
        {!canEdit && (
          <div
            role="status"
            data-testid="rbac-readonly-banner"
            className="rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/80 dark:bg-amber-950/40 px-4 py-3 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Viewing as role <strong className="font-mono">{activeRole}</strong>{' '}
                — HR Admin write actions (Approve, Payroll Run, Shift Edit) are
                restricted.
              </span>
            </div>
            <button
              type="button"
              onClick={() => dispatch(setActiveRole('hr_admin'))}
              className="px-2.5 py-1 rounded-lg bg-amber-600 text-white font-semibold whitespace-nowrap shrink-0 cursor-pointer"
            >
              Restore hr_admin
            </button>
          </div>
        )}

        {/* HOME TAB */}
        {activeBottomTab === 'home' && (
          <>
            {activeHomeTab === 'overview' && (
              <OverviewTab
                data={dashboardData}
                canEdit={canEdit}
                onNavigateBottomTab={handleNavigateBottom}
                onNavigateHomeTab={(t) => dispatch(setHomeTab(t))}
                onOpenAddEmployee={() => dispatch(setAddEmployeeSheetOpen(true))}
                onOpenAnnouncement={() =>
                  dispatch(setAnnouncementSheetOpen(true))
                }
                onSuccessToast={triggerToast}
              />
            )}

            {activeHomeTab !== 'overview' && (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => dispatch(setHomeTab('overview'))}
                  className="min-h-[38px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard Overview
                </button>

                {activeHomeTab === 'shifts' && (
                  <ShiftsModuleTab
                    shifts={dashboardData.shifts}
                    workforce={dashboardData.workforce}
                    canEdit={canEdit}
                    onSuccessToast={triggerToast}
                  />
                )}

                {activeHomeTab === 'rosters' && (
                  <RostersModuleTab
                    rosters={dashboardData.rosters}
                    canEdit={canEdit}
                    onSuccessToast={triggerToast}
                  />
                )}

                {activeHomeTab === 'holidays' && (
                  <HolidaysModuleTab
                    holidays={dashboardData.holidays}
                    canEdit={canEdit}
                    onSuccessToast={triggerToast}
                  />
                )}
              </div>
            )}
          </>
        )}

        {/* WORKFORCE BOTTOM TAB */}
        {activeBottomTab === 'workforce' && (
          <WorkforceScreen
            data={dashboardData}
            canEdit={canEdit}
            onOpenAddEmployee={() => dispatch(setAddEmployeeSheetOpen(true))}
          />
        )}

        {/* ATTENDANCE BOTTOM TAB */}
        {activeBottomTab === 'attendance' && (
          <AttendanceScreen
            data={dashboardData}
            onNavigateHomeTab={(t) => dispatch(setHomeTab(t))}
            onNavigateBottomTab={handleNavigateBottom}
          />
        )}

        {/* APPROVALS BOTTOM TAB */}
        {activeBottomTab === 'approvals' && (
          <ApprovalsScreen
            data={dashboardData}
            canEdit={canEdit}
            onSuccessToast={triggerToast}
          />
        )}

        {/* MORE MODULES SCREEN */}
        {activeBottomTab === 'more' && (
          <MoreModulesScreen
            data={dashboardData}
            canEdit={canEdit}
            activeRole={activeRole}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => dispatch(setDarkMode(!isDarkMode))}
            onOpenAnnouncement={() => dispatch(setAnnouncementSheetOpen(true))}
            onNavigateBottomTab={handleNavigateBottom}
            onNavigateHomeTab={(t) => dispatch(setHomeTab(t))}
            onSuccessToast={triggerToast}
          />
        )}

        {/* PROFILE SCREEN (Accessible from top-right Avatar Menu and inside More) */}
        {activeBottomTab === 'profile' && (
          <ProfileScreen
            data={dashboardData}
            activeRole={activeRole}
            onRoleChange={(r) => dispatch(setActiveRole(r))}
            onSuccessToast={triggerToast}
          />
        )}
      </main>

      {/* NATIVE MOBILE BOTTOM SHEETS */}
      <AnnouncementBottomSheet
        open={isAnnouncementSheetOpen}
        onClose={() => dispatch(setAnnouncementSheetOpen(false))}
        onSuccessToast={triggerToast}
        canEdit={canEdit}
      />

      <AddEmployeeBottomSheet
        open={isAddEmployeeSheetOpen}
        onClose={() => dispatch(setAddEmployeeSheetOpen(false))}
        onSuccessToast={triggerToast}
        canEdit={canEdit}
      />

      <NotificationsSheet
        open={isNotificationsOpen}
        onClose={() => dispatch(setNotificationsOpen(false))}
        notifications={dashboardData.notifications}
        onNavigateTab={handleNavigateBottom}
        onSuccessToast={triggerToast}
      />

      {/* 3. FIXED NATIVE BOTTOM NAVIGATION BAR (Exactly 5 Tabs: Home, Workforce, Attendance, Approvals, More) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        data-testid="mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2"
      >
        <div className="max-w-lg mx-auto h-full grid grid-cols-5 items-center">
          <button
            type="button"
            onClick={() => handleNavigateBottom('home')}
            data-testid="bottom-nav-home"
            className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
              activeBottomTab === 'home'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Home</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigateBottom('workforce')}
            data-testid="bottom-nav-workforce"
            className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
              activeBottomTab === 'workforce'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Workforce</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigateBottom('attendance')}
            data-testid="bottom-nav-attendance"
            className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
              activeBottomTab === 'attendance'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CalendarCheck className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Attendance</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigateBottom('approvals')}
            data-testid="bottom-nav-approvals"
            className={`relative h-full flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
              activeBottomTab === 'approvals'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <div className="relative">
              <CheckSquare className="w-5 h-5" />
              {pendingApprovalCount > 0 && (
                <span
                  data-testid="bottom-nav-approvals-badge"
                  className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-white text-[10px] font-mono font-bold flex items-center justify-center tabular-nums"
                >
                  {pendingApprovalCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight">Approvals</span>
          </button>

          <button
            type="button"
            onClick={() => handleNavigateBottom('more')}
            data-testid="bottom-nav-more"
            className={`h-full flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
              activeBottomTab === 'more'
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}


export function HrMobileAppShell({
  initialRole = 'hr_admin',
}: {
  initialRole?: Ofc360Role;
}) {
  const [store] = useState(() => makeHrStore());

  return (
    <Provider store={store}>
      <HrMobileDashboardContent initialRole={initialRole} />
    </Provider>
  );
}
