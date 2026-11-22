import React, { useRef } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CalendarClock, CheckSquare, TrendingUp, UserCheck, Users } from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { KpiTile, NativeCard, SectionHeader, StatusPill } from '@/components/ui/NativeCard';
import { DashboardSkeleton } from '@/components/ui/SkeletonCard';
import { NotificationsSheet } from '@/components/native/NotificationsSheet';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import { triggerHaptic } from '@/services/nativeModules';

export default function ManagerHomeScreen() {
  const router = useRouter();
  const { data, isLoading, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchManagerDashboard
  );
  const notifSheetRef = useRef<BottomSheetModal>(null);

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader
        roleBadge="MANAGER"
        onOpenQuickActions={() => router.push('/(manager)/(tabs)/approvals')}
        onOpenNotifications={() => notifSheetRef.current?.present()}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {isLoading || !data ? (
          <DashboardSkeleton />
        ) : (
          <>
            <View className="flex-row flex-wrap gap-3">
              <KpiTile
                label="Team Size"
                value={String(data.kpis.teamSize)}
                subtext="Direct reports"
                linkText="View team"
                icon={<Users size={16} color="#4F46E5" />}
                onPress={() => router.push('/(manager)/(tabs)/my-team')}
              />
              <KpiTile
                label="Team Attendance"
                value={`${data.kpis.teamAttendancePct}%`}
                subtext={`${data.kpis.presentCount} Present · ${data.kpis.onLeaveCount} Leave`}
                linkText="Live logs"
                accent="emerald"
                icon={<UserCheck size={16} color="#10B981" />}
                onPress={() => router.push('/(manager)/(tabs)/my-team')}
              />
              <KpiTile
                label="Pending Approvals"
                value={String(data.kpis.pendingApprovals)}
                subtext="Leaves, expenses & swaps"
                linkText="Review queue"
                accent="amber"
                icon={<CheckSquare size={16} color="#D97706" />}
                onPress={() => router.push('/(manager)/(tabs)/approvals')}
              />
              <KpiTile
                label="Open Requisitions"
                value={String(data.kpis.openRequisitions)}
                subtext="Hiring scorecards active"
                linkText="View hiring"
                accent="sky"
                icon={<TrendingUp size={16} color="#0284C7" />}
                onPress={() => router.push('/(manager)/(tabs)/performance')}
              />
            </View>

            <NativeCard>
              <SectionHeader title="Quick Manager Actions" />
              <View className="flex-row flex-wrap gap-2.5">
                <Pressable
                  onPress={() => {
                    void triggerHaptic('light');
                    router.push('/(manager)/(tabs)/approvals');
                  }}
                  className="flex-1 min-w-[46%] bg-slate-50 border border-slate-200 rounded-xl p-3.5 gap-1.5"
                >
                  <CheckSquare size={18} color="#4F46E5" />
                  <Text className="text-xs font-bold text-slate-900">Review Approvals</Text>
                  <Text className="text-[11px] text-slate-500">Leaves, expenses & swaps</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    void triggerHaptic('light');
                    router.push('/(manager)/(tabs)/my-team');
                  }}
                  className="flex-1 min-w-[46%] bg-slate-50 border border-slate-200 rounded-xl p-3.5 gap-1.5"
                >
                  <CalendarClock size={18} color="#10B981" />
                  <Text className="text-xs font-bold text-slate-900">Roster Scheduler</Text>
                  <Text className="text-[11px] text-slate-500">Plan weekly shifts</Text>
                </Pressable>
              </View>
            </NativeCard>

            <NativeCard>
              <SectionHeader
                title="Today's Team Pulse"
                actionLabel="Full Team"
                onAction={() => router.push('/(manager)/(tabs)/my-team')}
              />
              {data.directReports.map((rep, idx) => (
                <View
                  key={rep.id}
                  className={`py-2.5 flex-row items-center justify-between ${
                    idx > 0 ? 'border-t border-slate-100' : ''
                  }`}
                >
                  <View>
                    <Text className="text-xs font-bold text-slate-900">{rep.fullName}</Text>
                    <Text className="text-[11px] text-slate-500">
                      {rep.roleTitle} · {rep.punchTime}
                    </Text>
                  </View>
                  <StatusPill
                    label={rep.todayStatus}
                    tone={
                      rep.todayStatus === 'Present'
                        ? 'emerald'
                        : rep.todayStatus === 'WFH'
                          ? 'sky'
                          : 'amber'
                    }
                  />
                </View>
              ))}
            </NativeCard>
          </>
        )}
      </ScrollView>

      <NotificationsSheet sheetRef={notifSheetRef} />
    </View>
  );
}
