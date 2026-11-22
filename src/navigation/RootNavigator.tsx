'use client';

import React, { useMemo, useState } from 'react';
import {
  Home,
  Users,
  CalendarCheck,
  CheckCircle2,
  LayoutGrid,
  Bell,
  X,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { authClient } from '@/lib/auth-api';
import {
  RootState,
  AppDispatch,
  setBottomTab,
  setHomeTab,
  setActiveSubModule,
  setAddEmployeeSheetOpen,
  setAnnouncementSheetOpen,
  setNotificationsOpen,
  showToast,
  clearToast,
} from '@/lib/store';
import {
  useGetHrDashboardQuery,
  useMarkNotificationsReadMutation,
} from '@/lib/store/hr-api';
import {
  BottomNavTab,
  MoreModuleId,
  canManageHrAdminActions,
  getMoreModulesCatalog,
} from '@/lib/hr-dashboard-logic';
import {
  LinkedInHeader,
  LinkedInBottomNav,
  LinkedInNavItem,
  LinkedInSearchModal,
  LinkedInMessagesModal,
  LinkedInEmptyState,
  SearchableEntry,
} from '../components/linkedin/LinkedInPrimitives';
import { HomeScreen } from '../screens/HomeScreen';
import { WorkforceScreen } from '../screens/WorkforceScreen';
import { AttendanceScreen } from '../screens/AttendanceScreen';
import { ApprovalsScreen } from '../screens/ApprovalsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MoreModulesScreen } from '../screens/MoreModulesScreen';
import { AddEmployeeModal, AnnouncementModal } from '../components/NativeModals';
import {
  OfflineIndicator,
  PullToRefreshContainer,
} from '../components/mobile/PWAInstallAndStatus';

type PrimaryFiveTab = 'home' | 'workforce' | 'attendance' | 'approvals' | 'more';

export function RootNavigator() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const ui = useSelector((state: RootState) => state.hrMobileUi);

  const {
    data: fetchedData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetHrDashboardQuery();
  const [markNotificationsRead] = useMarkNotificationsReadMutation();

  const canManage = canManageHrAdminActions(ui.activeRole);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'more') {
        dispatch(setBottomTab('more'));
        dispatch(setActiveSubModule(null));
      } else if (tabParam === 'people' || tabParam === 'workforce') {
        dispatch(setBottomTab('workforce'));
      } else if (tabParam === 'attendance') {
        dispatch(setBottomTab('attendance'));
      } else if (tabParam === 'approvals') {
        dispatch(setBottomTab('approvals'));
      } else if (tabParam === 'profile') {
        dispatch(setBottomTab('profile'));
      }
    }
  }, [dispatch]);

  const pendingApprovalsCount = fetchedData
    ? fetchedData.approvals.filter((a) => a.status === 'Pending').length
    : 0;
  const unreadNotifCount = fetchedData
    ? fetchedData.notifications.filter((n) => !n.read).length
    : 0;
  const announcementsCount = fetchedData ? fetchedData.announcements.length : 0;

  const triggerToast = (text: string) => {
    dispatch(showToast({ text, type: 'success' }));
    setTimeout(() => {
      dispatch(clearToast());
    }, 3200);
  };

  const handleLogout = () => {
    authClient.clearSession();
    void authClient.logout();
    router.push('/login');
  };

  const handleSelectBottomTab = (tab: BottomNavTab) => {
    dispatch(setActiveSubModule(null));
    dispatch(setBottomTab(tab));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    }
  };

  const handleOpenPayrollModule = () => {
    dispatch(setBottomTab('more'));
    dispatch(setActiveSubModule('payroll'));
  };

  const navItems: LinkedInNavItem<PrimaryFiveTab>[] = useMemo(
    () => [
      { id: 'home', label: 'Home', Icon: Home },
      { id: 'workforce', label: 'People', Icon: Users },
      { id: 'attendance', label: 'Attendance', Icon: CalendarCheck },
      {
        id: 'approvals',
        label: 'Approvals',
        Icon: CheckCircle2,
        badgeCount: pendingApprovalsCount,
      },
      { id: 'more', label: 'More', Icon: LayoutGrid },
    ],
    [pendingApprovalsCount]
  );

  const searchEntries: SearchableEntry[] = useMemo(() => {
    const entries: SearchableEntry[] = [];

    if (fetchedData) {
      const modules = getMoreModulesCatalog(fetchedData);
      modules.forEach((m) => {
        entries.push({
          id: `mod-${m.id}`,
          title: m.title,
          subtitle: m.subtitle,
          group: 'Module',
          onSelect: () => {
            if (m.id === 'my_profile') {
              handleSelectBottomTab('profile');
            } else if (m.id === 'shifts_rosters') {
              dispatch(setBottomTab('home'));
              dispatch(setHomeTab('shifts'));
            } else if (m.id === 'announcements') {
              if (canManage) dispatch(setAnnouncementSheetOpen(true));
              else setIsMessagesOpen(true);
            } else {
              dispatch(setBottomTab('more'));
              dispatch(setActiveSubModule(m.id as MoreModuleId));
            }
          },
        });
      });

      fetchedData.workforce.forEach((emp) => {
        entries.push({
          id: `emp-${emp.id}`,
          title: emp.name,
          subtitle: `${emp.designation} · ${emp.department}`,
          group: 'People',
          onSelect: () => handleSelectBottomTab('workforce'),
        });
      });

      fetchedData.approvals
        .filter((a) => a.status === 'Pending')
        .forEach((appr) => {
          entries.push({
            id: `appr-${appr.id}`,
            title: `${appr.employeeName} — ${appr.category}`,
            subtitle: `${appr.requestType} · ${appr.durationOrAmount}`,
            group: 'Approval',
            onSelect: () => handleSelectBottomTab('approvals'),
          });
        });
    }

    return entries;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchedData, canManage]);

  const messageItems = useMemo(
    () =>
      (fetchedData?.announcements || []).map((a) => ({
        id: a.id,
        title: a.title,
        body: a.description,
        meta: `${a.category} · ${a.department} · ${a.publishedDate}`,
      })),
    [fetchedData]
  );

  const activeFiveTab: PrimaryFiveTab =
    ui.activeBottomTab === 'profile' ? 'more' : ui.activeBottomTab;

  const isFlushMobileView =
    ui.activeBottomTab === 'home' || ui.activeBottomTab === 'more';

  return (
    <div className="min-h-dvh w-full bg-[#F3F2EF] text-[#171717] flex flex-col">
      {/* Sticky LinkedIn-Inspired Top Header (Mobile & Desktop) */}
      <LinkedInHeader
        userName={fetchedData?.adminProfile.name || 'HR Admin'}
        unreadNotifications={unreadNotifCount}
        unreadMessages={announcementsCount}
        navItems={navItems}
        activeNavId={ui.activeBottomTab === 'profile' ? undefined : activeFiveTab}
        onSelectNav={(id) => handleSelectBottomTab(id)}
        onOpenProfile={() => handleSelectBottomTab('profile')}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenNotifications={() => dispatch(setNotificationsOpen(true))}
        onOpenMessages={() => setIsMessagesOpen(true)}
      />

      <OfflineIndicator />

      {/* Clean Functional Toast Notification */}
      {ui.toastMessage ? (
        <div
          role="status"
          className="fixed bottom-[70px] lg:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-lg bg-[#171717] px-4 py-2.5 text-xs font-medium text-white max-w-[92vw]"
        >
          <CheckCircle2 className="h-4 w-4 text-[#22C55E] shrink-0" strokeWidth={2} />
          <span className="truncate">{ui.toastMessage.text}</span>
        </div>
      ) : null}

      {/* Main Responsive Workspace */}
      <main
        className={`flex-1 w-full mx-auto max-w-[1040px] pb-[74px] lg:pb-8 ${
          isFlushMobileView ? 'px-0 md:px-6 md:py-5' : 'px-0 md:px-6 md:py-5'
        }`}
      >
        <PullToRefreshContainer onRefresh={() => refetch()}>
        {ui.activeBottomTab === 'home' ? (
          <HomeScreen
            data={fetchedData}
            isLoading={isLoading || (!fetchedData && isFetching)}
            isError={isError}
            onRetry={() => void refetch()}
            activeHomeTab={ui.activeHomeTab}
            onSelectHomeTab={(t) => dispatch(setHomeTab(t))}
            onNavigateTab={handleSelectBottomTab}
            onOpenAddEmployee={() => dispatch(setAddEmployeeSheetOpen(true))}
            onOpenAnnouncement={() => dispatch(setAnnouncementSheetOpen(true))}
            onOpenPayroll={handleOpenPayrollModule}
            isDark={ui.isDarkMode}
            canManage={canManage}
            onSuccessToast={triggerToast}
          />
        ) : null}

        {ui.activeBottomTab === 'workforce' && fetchedData ? (
          <div className="w-full">
            <WorkforceScreen
              workforce={fetchedData.workforce}
              departments={fetchedData.departments}
              isDark={ui.isDarkMode}
              canManage={canManage}
              onOpenAddEmployee={() => dispatch(setAddEmployeeSheetOpen(true))}
              onSuccessToast={triggerToast}
            />
          </div>
        ) : null}

        {ui.activeBottomTab === 'attendance' && fetchedData ? (
          <div className="w-full">
            <AttendanceScreen
              data={fetchedData}
              isDark={ui.isDarkMode}
              onSuccessToast={triggerToast}
            />
          </div>
        ) : null}

        {ui.activeBottomTab === 'approvals' ? (
          <div className="w-full">
            <ApprovalsScreen
              approvals={fetchedData?.approvals || []}
              isLoading={isLoading || (!fetchedData && isFetching)}
              isError={isError}
              onRetry={() => void refetch()}
              isDark={ui.isDarkMode}
              canManage={canManage}
              onSuccessToast={triggerToast}
            />
          </div>
        ) : null}

        {ui.activeBottomTab === 'profile' && fetchedData ? (
          <div className="w-full">
            <ProfileScreen
              data={fetchedData}
              isDark={ui.isDarkMode}
              onSuccessToast={triggerToast}
              onLogout={handleLogout}
            />
          </div>
        ) : null}

        {ui.activeBottomTab === 'more' && fetchedData ? (
          <div className="w-full">
            <MoreModulesScreen
              data={fetchedData}
              activeSubModule={ui.activeSubModule}
              onSelectSubModule={(id) => dispatch(setActiveSubModule(id))}
              onNavigateBottomTab={handleSelectBottomTab}
              onSelectHomeTab={(t) => dispatch(setHomeTab(t))}
              onOpenAnnouncement={() => dispatch(setAnnouncementSheetOpen(true))}
              isDark={ui.isDarkMode}
              canManage={canManage}
              onSuccessToast={triggerToast}
            />
          </div>
        ) : null}
        </PullToRefreshContainer>
      </main>

      {/* Fixed 5-Item Mobile Bottom Navigation Bar */}
      <LinkedInBottomNav
        items={navItems}
        activeId={activeFiveTab}
        onSelect={(id) => handleSelectBottomTab(id)}
      />

      {/* Functional Global Search Modal */}
      <LinkedInSearchModal
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        entries={searchEntries}
      />

      {/* Functional Messages & Notices Modal */}
      <LinkedInMessagesModal
        open={isMessagesOpen}
        onClose={() => setIsMessagesOpen(false)}
        items={messageItems}
        canCompose={canManage}
        onCompose={() => dispatch(setAnnouncementSheetOpen(true))}
      />

      {/* Notifications Sheet Modal */}
      {ui.isNotificationsOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Notifications"
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/45 md:p-4"
          onClick={() => dispatch(setNotificationsOpen(false))}
        >
          <div
            className="w-full max-w-[540px] bg-white rounded-t-lg md:rounded-lg border border-[#E5E7EB] overflow-hidden max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#E5E7EB] px-4 h-14">
              <h2 className="text-base font-semibold text-[#171717]">
                Notifications
              </h2>
              <div className="flex items-center gap-2">
                {unreadNotifCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => void markNotificationsRead({})}
                    className="h-8 rounded-md px-2.5 text-xs font-semibold text-[#0A66C2] hover:bg-[#F3F2EF] cursor-pointer"
                  >
                    Mark all read
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => dispatch(setNotificationsOpen(false))}
                  aria-label="Close notifications"
                  className="flex h-9 w-9 items-center justify-center rounded-md text-[#404040] hover:bg-[#F3F2EF] cursor-pointer"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto divide-y divide-[#E5E7EB]">
              {!fetchedData || fetchedData.notifications.length === 0 ? (
                <LinkedInEmptyState
                  title="You're all caught up"
                  subtitle="No unread notifications."
                  variant="success"
                />
              ) : (
                fetchedData.notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3.5 ${
                      n.read ? 'bg-white' : 'bg-[#EBF4FD]/40'
                    }`}
                  >
                    <Bell
                      className="h-4 w-4 text-[#404040] mt-0.5 shrink-0"
                      strokeWidth={1.85}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#171717]">
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-xs text-[#666666] leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* Shared Modals */}
      <AddEmployeeModal
        visible={ui.isAddEmployeeSheetOpen}
        isDark={ui.isDarkMode}
        onClose={() => dispatch(setAddEmployeeSheetOpen(false))}
        onSuccessToast={triggerToast}
      />

      <AnnouncementModal
        visible={ui.isAnnouncementSheetOpen}
        isDark={ui.isDarkMode}
        onClose={() => dispatch(setAnnouncementSheetOpen(false))}
        onSuccessToast={triggerToast}
      />
    </div>
  );
}
