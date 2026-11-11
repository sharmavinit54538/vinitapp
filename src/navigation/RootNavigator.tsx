import React, { useState, useMemo, useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
import {
  Home,
  Users,
  CalendarCheck,
  CheckCircle2,
  User,
  LayoutGrid,
  Plus,
  Heart,
  Bell,
  CalendarDays,
  UserPlus,
  Megaphone,
  LogOut,
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
  createInitialHrDashboardState,
  canManageHrAdminActions,
} from '@/lib/hr-dashboard-logic';
import { getPalette, FONT_SANS, FONT_MONO } from '../theme/colors';
import { HomeScreen } from '../screens/HomeScreen';
import { WorkforceScreen } from '../screens/WorkforceScreen';
import { AttendanceScreen } from '../screens/AttendanceScreen';
import { ApprovalsScreen } from '../screens/ApprovalsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MoreModulesScreen } from '../screens/MoreModulesScreen';
import { AddEmployeeModal, AnnouncementModal } from '../components/NativeModals';

const BOTTOM_TABS: {
  id: BottomNavTab;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
}[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'workforce', label: 'Workforce', Icon: Users },
  { id: 'attendance', label: 'Attendance', Icon: CalendarCheck },
  { id: 'approvals', label: 'Approvals', Icon: CheckCircle2 },
  { id: 'profile', label: 'Profile', Icon: User },
  { id: 'more', label: 'More', Icon: LayoutGrid },
];

export function RootNavigator() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const ui = useSelector((state: RootState) => state.hrMobileUi);
  const palette = getPalette(ui.isDarkMode);

  const { data: fetchedData } = useGetHrDashboardQuery();
  const [markNotificationsRead] = useMarkNotificationsReadMutation();

  const fallbackData = useMemo(() => createInitialHrDashboardState(), []);
  const dashboardData = fetchedData || fallbackData;
  const canManage = canManageHrAdminActions(ui.activeRole);

  const [isQuickSheetOpen, setIsQuickSheetOpen] = useState(false);

  const pendingApprovalsCount = dashboardData.approvals.filter(
    (a) => a.status === 'Pending'
  ).length;
  const unreadNotifCount = dashboardData.notifications.filter((n) => !n.read).length;

  const triggerToast = (text: string) => {
    dispatch(showToast({ text, type: 'success' }));
    setTimeout(() => {
      dispatch(clearToast());
    }, 3200);
  };

  useEffect(() => {
    router.prefetch('/login');
  }, [router]);

  const handleLogout = () => {
    authClient.clearSession();
    void authClient.logout();
    router.push('/login');
  };

  const handleSelectBottomTab = (tab: BottomNavTab) => {
    if (tab !== 'more') {
      dispatch(setActiveSubModule(null));
    }
    dispatch(setBottomTab(tab));
  };

  return (
    <SafeAreaView style={[styles.safeRoot, { backgroundColor: palette.background }]}>
      <StatusBar barStyle={ui.isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Centered Mobile Phone Viewport Container (max-w-[440px] mx-auto min-h-screen) */}
      <View
        style={[
          styles.phoneShell,
          { backgroundColor: palette.background, borderColor: palette.border },
        ]}
      >
        {/* Sticky Frosted Top Bar (h-14 = 56px) */}
        <View
          style={[
            styles.headerBar,
            { backgroundColor: palette.headerBg, borderBottomColor: palette.border },
          ]}
        >
          <View style={styles.headerLeft}>
            <Text style={[styles.brandTitle, { color: palette.textPrimary }]}>
              OFC360
            </Text>
          </View>

          <View style={styles.headerRight}>
            {canManage ? (
              <Pressable
                accessibilityLabel="Quick HR Actions"
                onPress={() => setIsQuickSheetOpen(true)}
                style={styles.plainIconBtn}
              >
                <Plus size={24} color={palette.textPrimary} strokeWidth={2.2} />
              </Pressable>
            ) : null}

            <Pressable
              accessibilityLabel="Notifications"
              onPress={() => dispatch(setNotificationsOpen(true))}
              style={styles.plainIconBtn}
            >
              <Heart size={21} color={palette.textPrimary} strokeWidth={2.2} />
              {unreadNotifCount > 0 ? (
                <View style={[styles.notifDot, { backgroundColor: palette.rose }]} />
              ) : null}
            </Pressable>

            <Pressable
              accessibilityLabel="Logout"
              onPress={handleLogout}
              style={[
                styles.logoutHeaderBtn,
                {
                  borderColor: palette.rose,
                  backgroundColor: ui.isDarkMode ? 'rgba(244,63,94,0.14)' : '#FFF1F2',
                },
              ]}
            >
              <LogOut size={15} color={palette.rose} strokeWidth={2.2} />
              <Text style={[styles.logoutHeaderText, { color: palette.rose }]}>
                Logout
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Native Toast Notification Banner */}
        {ui.toastMessage ? (
          <View style={[styles.toastBanner, { backgroundColor: palette.secondaryCta }]}>
            <CheckCircle2 size={16} color={palette.emerald} strokeWidth={2.4} />
            <Text style={styles.toastText}>{ui.toastMessage.text}</Text>
          </View>
        ) : null}

        {/* Active Mobile Screen Content */}
        <ScrollView
          style={styles.screenScroll}
          contentContainerStyle={styles.screenScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {ui.activeBottomTab === 'home' ? (
            <HomeScreen
              data={dashboardData}
              activeHomeTab={ui.activeHomeTab}
              onSelectHomeTab={(t) => dispatch(setHomeTab(t))}
              onNavigateTab={handleSelectBottomTab}
              onOpenAddEmployee={() => dispatch(setAddEmployeeSheetOpen(true))}
              onOpenAnnouncement={() => dispatch(setAnnouncementSheetOpen(true))}
              isDark={ui.isDarkMode}
              canManage={canManage}
              onSuccessToast={triggerToast}
            />
          ) : null}

          {ui.activeBottomTab === 'workforce' ? (
            <WorkforceScreen
              workforce={dashboardData.workforce}
              departments={dashboardData.departments}
              isDark={ui.isDarkMode}
              canManage={canManage}
              onOpenAddEmployee={() => dispatch(setAddEmployeeSheetOpen(true))}
              onSuccessToast={triggerToast}
            />
          ) : null}

          {ui.activeBottomTab === 'attendance' ? (
            <AttendanceScreen
              data={dashboardData}
              isDark={ui.isDarkMode}
              onSuccessToast={triggerToast}
            />
          ) : null}

          {ui.activeBottomTab === 'approvals' ? (
            <ApprovalsScreen
              approvals={dashboardData.approvals}
              isDark={ui.isDarkMode}
              canManage={canManage}
              onSuccessToast={triggerToast}
            />
          ) : null}

          {ui.activeBottomTab === 'profile' ? (
            <ProfileScreen
              data={dashboardData}
              isDark={ui.isDarkMode}
              onSuccessToast={triggerToast}
              onLogout={handleLogout}
            />
          ) : null}

          {ui.activeBottomTab === 'more' ? (
            <MoreModulesScreen
              data={dashboardData}
              activeSubModule={ui.activeSubModule}
              onSelectSubModule={(id) => dispatch(setActiveSubModule(id))}
              onNavigateBottomTab={handleSelectBottomTab}
              onSelectHomeTab={(t) => dispatch(setHomeTab(t))}
              onOpenAnnouncement={() => dispatch(setAnnouncementSheetOpen(true))}
              isDark={ui.isDarkMode}
              canManage={canManage}
              onSuccessToast={triggerToast}
            />
          ) : null}
        </ScrollView>

        {/* Sticky Bottom Navigation Bar (h-16 = 64px, 10px labels, active indigo-600) */}
        <View
          style={[
            styles.bottomTabBar,
            { backgroundColor: palette.tabBarBg, borderTopColor: palette.border },
          ]}
        >
          {BOTTOM_TABS.map((tab) => {
            const active = ui.activeBottomTab === tab.id;
            const showBadge = tab.id === 'approvals' && pendingApprovalsCount > 0;
            const TabIcon = tab.Icon;
            return (
              <Pressable
                key={tab.id}
                accessibilityLabel={tab.label}
                onPress={() => handleSelectBottomTab(tab.id)}
                style={styles.tabItem}
              >
                <View style={styles.tabIconWrap}>
                  <TabIcon
                    size={22}
                    color={active ? palette.primary : palette.textMuted}
                    strokeWidth={active ? 2.4 : 1.9}
                  />
                  {showBadge ? (
                    <View style={[styles.tabBadge, { backgroundColor: palette.primary }]}>
                      <Text style={styles.tabBadgeText}>{pendingApprovalsCount}</Text>
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Quick Action Bottom Sheet Modal */}
      <Modal
        visible={isQuickSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsQuickSheetOpen(false)}
      >
        <Pressable
          onPress={() => setIsQuickSheetOpen(false)}
          style={[styles.sheetBackdrop, { backgroundColor: palette.overlay }]}
        >
          <View
            style={[
              styles.quickSheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={styles.dragHandleWrap}>
              <View style={[styles.dragHandle, { backgroundColor: palette.handleBar }]} />
            </View>
            <Text style={[styles.sheetTitle, { color: palette.textPrimary }]}>
              Quick HR Actions
            </Text>
            <Text style={[styles.sheetSub, { color: palette.textMuted }]}>
              Select an administrative workflow to launch
            </Text>

            <View style={styles.sheetList}>
              <Pressable
                onPress={() => {
                  setIsQuickSheetOpen(false);
                  dispatch(setAddEmployeeSheetOpen(true));
                }}
                style={[
                  styles.quickItem,
                  { backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <UserPlus size={18} color={palette.primary} strokeWidth={2.2} />
                <Text style={[styles.quickItemTitle, { color: palette.textPrimary }]}>
                  Add Workforce Employee
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsQuickSheetOpen(false);
                  dispatch(setAnnouncementSheetOpen(true));
                }}
                style={[
                  styles.quickItem,
                  { backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <Megaphone size={18} color={palette.violet} strokeWidth={2.2} />
                <Text style={[styles.quickItemTitle, { color: palette.textPrimary }]}>
                  Broadcast Enterprise Announcement
                </Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  setIsQuickSheetOpen(false);
                  dispatch(setHomeTab('holidays'));
                  handleSelectBottomTab('home');
                }}
                style={[
                  styles.quickItem,
                  { backgroundColor: palette.inputBg, borderColor: palette.border },
                ]}
              >
                <CalendarDays size={18} color={palette.emerald} strokeWidth={2.2} />
                <Text style={[styles.quickItemTitle, { color: palette.textPrimary }]}>
                  Open 2026 Holiday Calendar
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* Notifications Bottom Sheet Modal */}
      <Modal
        visible={ui.isNotificationsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => {
          dispatch(setNotificationsOpen(false));
        }}
      >
        <Pressable
          onPress={() => dispatch(setNotificationsOpen(false))}
          style={[styles.sheetBackdrop, { backgroundColor: palette.overlay }]}
        >
          <View
            style={[
              styles.quickSheet,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <View style={styles.dragHandleWrap}>
              <View style={[styles.dragHandle, { backgroundColor: palette.handleBar }]} />
            </View>
            <View style={styles.notifHeaderRow}>
              <Text style={[styles.sheetTitle, { color: palette.textPrimary }]}>
                Notifications ({dashboardData.notifications.length})
              </Text>
              {unreadNotifCount > 0 ? (
                <Pressable onPress={() => markNotificationsRead({})}>
                  <Text style={[styles.markReadText, { color: palette.primary }]}>
                    Mark all read
                  </Text>
                </Pressable>
              ) : null}
            </View>
            {dashboardData.notifications.length === 0 ? (
              <Text style={[styles.emptyNotif, { color: palette.textMuted }]}>
                No new mobile alerts. You are all caught up.
              </Text>
            ) : (
              <View style={styles.sheetList}>
                {dashboardData.notifications.map((n) => (
                  <View
                    key={n.id}
                    style={[
                      styles.quickItem,
                      { backgroundColor: palette.inputBg, borderColor: palette.border },
                    ]}
                  >
                    <Bell size={16} color={palette.primary} />
                    <View style={styles.notifTextCol}>
                      <Text style={[styles.quickItemTitle, { color: palette.textPrimary }]}>
                        {n.title}
                      </Text>
                      <Text style={[styles.notifSub, { color: palette.textMuted }]}>
                        {n.message}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Shared Native Modals */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeRoot: {
    flex: 1,
    height: 844,
    maxHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneShell: {
    flex: 1,
    height: '100%',
    width: '100%',
    maxWidth: 440,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: 'hidden',
  },
  headerBar: {
    height: 56, // h-14
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandTitle: {
    fontFamily: FONT_SANS,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  plainIconBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  logoutHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    marginLeft: 4,
  },
  logoutHeaderText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '700',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  toastText: {
    fontFamily: FONT_SANS,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  screenScroll: {
    flex: 1,
  },
  screenScrollContent: {
    padding: 16,
    paddingBottom: 28,
  },
  bottomTabBar: {
    height: 64, // h-16
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrap: {
    width: 36,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  tabBadgeText: {
    fontFamily: FONT_MONO,
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  tabLabel: {
    fontFamily: FONT_SANS,
    fontSize: 10,
    marginTop: 3,
    letterSpacing: -0.1,
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  quickSheet: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 10,
  },
  dragHandleWrap: {
    alignItems: 'center',
    paddingBottom: 14,
  },
  dragHandle: {
    width: 40, // w-10
    height: 6, // h-1.5
    borderRadius: 3,
  },
  sheetTitle: {
    fontFamily: FONT_SANS,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sheetSub: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    marginTop: 2,
    marginBottom: 14,
  },
  sheetList: {
    gap: 10,
  },
  quickItem: {
    minHeight: 48, // h-12 touch target
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16, // rounded-2xl
    borderWidth: 1,
  },
  quickItemTitle: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '600',
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  notifTextCol: {
    flex: 1,
  },
  notifSub: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginTop: 2,
  },
  markReadText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyNotif: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    paddingVertical: 20,
    textAlign: 'center',
  },
});
