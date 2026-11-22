import React, { useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  Calendar,
  CheckCircle2,
  CreditCard,
  Megaphone,
  ScanFace,
  UserPlus,
  Users,
} from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { KpiTile, NativeCard, SectionHeader, StatusPill } from '@/components/ui/NativeCard';
import { DashboardSkeleton } from '@/components/ui/SkeletonCard';
import { FaceCheckInSheet } from '@/components/native/FaceCheckInSheet';
import { NotificationsSheet } from '@/components/native/NotificationsSheet';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import { sendLocalPushNotification, triggerHaptic } from '@/services/nativeModules';

export default function HrAdminHomeScreen() {
  const router = useRouter();
  const { data, isLoading, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchHrAdminDashboard
  );
  const faceSheetRef = useRef<BottomSheetModal>(null);
  const notifSheetRef = useRef<BottomSheetModal>(null);
  const [punchStatus, setPunchStatus] = useState<'Checked In' | 'Not Checked In'>('Checked In');
  const [toast, setToast] = useState<string | null>(null);

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader
        roleBadge="HR ADMIN"
        onOpenQuickActions={() => router.push('/(hr-admin)/(tabs)/people')}
        onOpenNotifications={() => notifSheetRef.current?.present()}
      />

      {toast ? (
        <View className="mx-4 mt-3 px-4 py-3 rounded-xl bg-slate-900 flex-row items-center gap-2">
          <CheckCircle2 size={16} color="#10B981" />
          <Text className="text-xs font-semibold text-white flex-1">{toast}</Text>
        </View>
      ) : null}

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
                label="Active Workforce"
                value={String(data.kpis.activeWorkforce)}
                subtext="Across 7 departments"
                linkText="View directory"
                icon={<Users size={16} color="#4F46E5" />}
                onPress={() => router.push('/(hr-admin)/(tabs)/people')}
              />
              <KpiTile
                label="Attendance Rate"
                value={`${data.kpis.attendanceRatePct}%`}
                subtext="Today live geofence"
                linkText="Punch monitor"
                accent="emerald"
                icon={<CheckCircle2 size={16} color="#10B981" />}
                onPress={() => router.push('/(hr-admin)/(tabs)/attendance')}
              />
              <KpiTile
                label="Pending Approvals"
                value={String(data.kpis.pendingApprovals)}
                subtext="Leaves, expenses & exits"
                linkText="Review queue"
                accent="amber"
                icon={<CheckCircle2 size={16} color="#D97706" />}
                onPress={() => router.push('/(hr-admin)/(tabs)/approvals')}
              />
              <KpiTile
                label="2026 Holidays"
                value={String(data.kpis.holidays2026)}
                subtext="National & optional"
                linkText="Open calendar"
                accent="sky"
                icon={<Calendar size={16} color="#0284C7" />}
                onPress={() => router.push('/(hr-admin)/(tabs)/more')}
              />
            </View>

            <NativeCard>
              <SectionHeader title="Quick HR Actions" />
              <View className="flex-row flex-wrap gap-2.5">
                <Pressable
                  onPress={() => {
                    void triggerHaptic('light');
                    router.push('/(hr-admin)/(tabs)/people');
                  }}
                  className="flex-1 min-w-[46%] bg-slate-50 border border-slate-200 rounded-xl p-3.5 gap-1.5"
                >
                  <UserPlus size={18} color="#4F46E5" />
                  <Text className="text-xs font-bold text-slate-900">Add Employee</Text>
                  <Text className="text-[11px] text-slate-500">Create profile & KYC</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    void triggerHaptic('light');
                    router.push('/(hr-admin)/(tabs)/more');
                  }}
                  className="flex-1 min-w-[46%] bg-slate-50 border border-slate-200 rounded-xl p-3.5 gap-1.5"
                >
                  <Megaphone size={18} color="#D97706" />
                  <Text className="text-xs font-bold text-slate-900">Broadcast Notice</Text>
                  <Text className="text-[11px] text-slate-500">Push company alert</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    void triggerHaptic('light');
                    faceSheetRef.current?.present();
                  }}
                  className="flex-1 min-w-[46%] bg-slate-50 border border-slate-200 rounded-xl p-3.5 gap-1.5"
                >
                  <ScanFace size={18} color="#10B981" />
                  <Text className="text-xs font-bold text-slate-900">Face Check-In</Text>
                  <Text className="text-[11px] text-slate-500">Camera & GPS punch</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    void triggerHaptic('success');
                    void sendLocalPushNotification(
                      'Payroll Batch Triggered',
                      'November 2026 payroll cycle submitted for Executive sign-off.'
                    );
                    setToast('Payroll batch queued for Executive sign-off.');
                  }}
                  className="flex-1 min-w-[46%] bg-slate-50 border border-slate-200 rounded-xl p-3.5 gap-1.5"
                >
                  <CreditCard size={18} color="#0284C7" />
                  <Text className="text-xs font-bold text-slate-900">Run Payroll</Text>
                  <Text className="text-[11px] text-slate-500">Trigger monthly cycle</Text>
                </Pressable>
              </View>
            </NativeCard>

            <NativeCard>
              <SectionHeader
                title="Pending HR Approvals"
                actionLabel="Open Queue"
                onAction={() => router.push('/(hr-admin)/(tabs)/approvals')}
              />
              {data.approvals.map((item, idx) => (
                <View
                  key={item.id}
                  className={`py-3 flex-row items-center justify-between gap-3 ${
                    idx > 0 ? 'border-t border-slate-100' : ''
                  }`}
                >
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-slate-900">{item.employeeName}</Text>
                    <Text className="text-[11px] text-slate-500">{item.summary}</Text>
                  </View>
                  <StatusPill label={item.category} tone="amber" />
                </View>
              ))}
            </NativeCard>
          </>
        )}
      </ScrollView>

      <FaceCheckInSheet
        sheetRef={faceSheetRef}
        currentStatus={punchStatus}
        onSuccessPunch={(next, time, geo) => {
          setPunchStatus(next);
          setToast(`${next} at ${time} (${geo})`);
        }}
      />
      <NotificationsSheet sheetRef={notifSheetRef} />
    </View>
  );
}
