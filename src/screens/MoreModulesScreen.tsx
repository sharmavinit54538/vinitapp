import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'next/navigation';
import { getPalette, FONT_SANS, FONT_MONO } from '../theme/colors';
import {
  HrDashboardDataState,
  MoreModuleId,
  MORE_MODULE_CATEGORIES,
  getMoreModulesCatalog,
  BottomNavTab,
  HomeInternalTab,
} from '@/lib/hr-dashboard-logic';
import { ShiftsAndRostersScreen } from './ShiftsAndRostersScreen';
import { PayrollWorkspaceShell } from '../components/payroll/PayrollWorkspaceShell';
import { RecruitmentWorkspaceShell } from '../components/recruitment/RecruitmentWorkspaceShell';
import { OnboardingWorkspaceShell } from '../components/onboarding/OnboardingWorkspaceShell';
import { AssetWorkspaceShell } from '../components/assets/AssetWorkspaceShell';
import { HolidayWorkspaceShell } from '../components/holidays/HolidayWorkspaceShell';
import { VisitorWorkspaceShell } from '../components/visitors/VisitorWorkspaceShell';
import { AttendanceAnalyticsWorkspaceShell } from '../components/attendance-analytics/AttendanceAnalyticsWorkspaceShell';

interface MoreModulesScreenProps {
  data: HrDashboardDataState;
  activeSubModule: MoreModuleId | null;
  onSelectSubModule: (id: MoreModuleId | null) => void;
  onNavigateBottomTab: (tab: BottomNavTab) => void;
  onSelectHomeTab: (tab: HomeInternalTab) => void;
  onOpenAnnouncement: () => void;
  isDark: boolean;
  canManage: boolean;
  onSuccessToast: (msg: string) => void;
}

const DIRECT_MODULE_ROUTES: Partial<Record<MoreModuleId, string>> = {
  payroll: '/payroll',
  payroll_analytics: '/payroll-analytics',
  recruitment: '/recruitment',
  onboarding: '/onboarding',
  holidays: '/holidays',
  asset_management: '/assets',
  visitor_management: '/visitors',
  attendance_analytics: '/attendance-analytics',
  workforce_analytics: '/admin/workforce',
  help_support: '/helpdesk',
};

export function MoreModulesScreen({
  data,
  activeSubModule,
  onSelectSubModule,
  onNavigateBottomTab,
  onSelectHomeTab,
  onOpenAnnouncement,
  isDark,
  canManage,
  onSuccessToast,
}: MoreModulesScreenProps) {
  const router = useRouter();
  const palette = getPalette(isDark);
  const catalog = getMoreModulesCatalog(data);

  const handleDirectModuleOpen = (id: MoreModuleId) => {
    if (id === 'my_profile') {
      onNavigateBottomTab('profile');
      return;
    }
    if (id === 'shifts_rosters') {
      onNavigateBottomTab('home');
      onSelectHomeTab('shifts');
      return;
    }
    if (id === 'announcements') {
      onOpenAnnouncement();
      return;
    }
    const targetRoute = DIRECT_MODULE_ROUTES[id];
    if (targetRoute) {
      router.push(targetRoute);
      return;
    }
    onSelectSubModule(id);
  };

  if (activeSubModule) {
    const modMeta = catalog.find((m) => m.id === activeSubModule);
    return (
      <View style={styles.stack}>
        <View
          style={[
            styles.backBar,
            { backgroundColor: palette.surface, borderColor: palette.border },
          ]}
        >
          <Pressable
            onPress={() => onSelectSubModule(null)}
            style={[styles.backBtn, { backgroundColor: palette.inputBg, borderColor: palette.border }]}
          >
            <Text style={[styles.backBtnText, { color: palette.primary }]}>
              ← Back to All Modules
            </Text>
          </Pressable>
          <Text style={[styles.subTitle, { color: palette.textPrimary }]}>
            {modMeta?.title || 'Enterprise Module'}
          </Text>
        </View>

        {activeSubModule === 'holidays' ? (
          <HolidayWorkspaceShell
            embedded
            startInDirectory={false}
            initialModule="dashboard"
          />
        ) : activeSubModule === 'shifts_rosters' ? (
          <ShiftsAndRostersScreen
            mode="shifts"
            shifts={data.shifts}
            rosters={data.rosters}
            isDark={isDark}
            canManage={canManage}
            onSuccessToast={onSuccessToast}
          />
        ) : activeSubModule === 'payroll' ? (
          <PayrollWorkspaceShell embedded startInDirectory={false} initialModule="dashboard" />
        ) : activeSubModule === 'payroll_analytics' ? (
          <PayrollWorkspaceShell embedded startInDirectory={false} initialModule="reports" />
        ) : activeSubModule === 'exit_management' ? (
          <PayrollWorkspaceShell embedded startInDirectory={false} initialModule="fnf-settlement" />
        ) : activeSubModule === 'compliance_center' ? (
          <PayrollWorkspaceShell embedded startInDirectory={false} initialModule="statutory" />
        ) : activeSubModule === 'recruitment' ? (
          <RecruitmentWorkspaceShell embedded startInDirectory={false} initialModule="dashboard" />
        ) : activeSubModule === 'onboarding' ? (
          <OnboardingWorkspaceShell embedded startInDirectory={false} initialModule="dashboard" />
        ) : activeSubModule === 'asset_management' ? (
          <AssetWorkspaceShell embedded startInDirectory={false} initialModule="dashboard" />
        ) : activeSubModule === 'visitor_management' ? (
          <VisitorWorkspaceShell embedded startInDirectory={false} initialModule="dashboard" />
        ) : activeSubModule === 'attendance_analytics' ? (
          <AttendanceAnalyticsWorkspaceShell embedded startInDirectory={false} initialModule="overview" />
        ) : (
          <View
            style={[
              styles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.catHeader, { color: palette.textMuted }]}>
              {modMeta?.category}
            </Text>
            <Text style={[styles.modDetailTitle, { color: palette.textPrimary }]}>
              {modMeta?.title}
            </Text>
            <Pressable
              onPress={() => {
                if (activeSubModule === 'announcements') {
                  onOpenAnnouncement();
                } else {
                  onSuccessToast(`${modMeta?.title} synchronized`);
                }
              }}
              style={[styles.primaryBtn, { backgroundColor: palette.primary, marginTop: 16 }]}
            >
              <Text style={styles.primaryBtnText}>
                {activeSubModule === 'announcements'
                  ? '+ Broadcast New Notice'
                  : `Open ${modMeta?.title}`}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      {MORE_MODULE_CATEGORIES.map((category) => {
        const items = catalog.filter((m) => m.category === category);
        if (items.length === 0) return null;
        return (
          <View
            key={category}
            style={[
              styles.card,
              { backgroundColor: palette.surface, borderColor: palette.border },
            ]}
          >
            <Text style={[styles.catHeader, { color: palette.textMuted }]}>
              {category}
            </Text>
            <View style={styles.modList}>
              {items.map((item, idx) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleDirectModuleOpen(item.id)}
                  style={[
                    styles.modRow,
                    idx > 0
                      ? { borderTopWidth: 1, borderTopColor: palette.borderSubtle }
                      : null,
                  ]}
                >
                  <View style={styles.modRowInfo}>
                    <Text style={[styles.modTitle, { color: palette.textPrimary }]}>
                      {item.title}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 16,
  },
  backBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 24, // rounded-3xl
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  backBtn: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
  },
  subTitle: {
    fontFamily: FONT_SANS,
    fontSize: 15,
    fontWeight: '700',
  },
  card: {
    borderRadius: 24, // rounded-3xl
    borderWidth: 1,
    padding: 20, // p-5
  },
  catHeader: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  modList: {
    gap: 2,
  },
  modRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 12,
  },
  modRowInfo: {
    flex: 1,
  },
  modTitle: {
    fontFamily: FONT_SANS,
    fontSize: 14,
    fontWeight: '700',
  },
  badgeInline: {
    fontFamily: FONT_MONO,
    fontVariant: ['tabular-nums'],
    fontSize: 12,
    fontWeight: '600',
  },
  modSub: {
    fontFamily: FONT_SANS,
    fontSize: 12,
    marginTop: 2,
  },
  modDetailTitle: {
    fontFamily: FONT_SANS,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
    marginTop: 4,
  },
  modDetailSub: {
    fontFamily: FONT_SANS,
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
  },
  primaryBtn: {
    height: 48, // h-12
    borderRadius: 16, // rounded-2xl
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: FONT_SANS,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
