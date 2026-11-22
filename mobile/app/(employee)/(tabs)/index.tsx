import React, { useRef } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import {
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  FileText,
  IdCard,
  ScanFace,
} from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { KpiTile, NativeCard, SectionHeader, StatusPill } from '@/components/ui/NativeCard';
import { DashboardSkeleton } from '@/components/ui/SkeletonCard';
import { FaceCheckInSheet } from '@/components/native/FaceCheckInSheet';
import { NotificationsSheet } from '@/components/native/NotificationsSheet';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import { triggerHaptic } from '@/services/nativeModules';

export default function EmployeeHomeScreen() {
  const router = useRouter();
  const { data, setData, isLoading, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchEmployeeDashboard
  );
  const faceSheetRef = useRef<BottomSheetModal>(null);
  const notifSheetRef = useRef<BottomSheetModal>(null);

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader
        roleBadge="EMPLOYEE"
        onOpenQuickActions={() => faceSheetRef.current?.present()}
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
                label="Today's Status"
                value={data.todayStatus === 'Checked In' ? 'In' : 'Out'}
                subtext={`${data.punchInTime} · ${data.geofenceName}`}
                linkText="View logs"
                accent={data.todayStatus === 'Checked In' ? 'emerald' : 'amber'}
                icon={<Clock size={16} color="#10B981" />}
                onPress={() => router.push('/(employee)/(tabs)/attendance')}
              />
              <KpiTile
                label="Attendance %"
                value={`${data.attendanceRatePct}%`}
                subtext={`${data.presentDays} present days`}
                linkText="History"
                accent="indigo"
                icon={<CheckCircle2 size={16} color="#4F46E5" />}
                onPress={() => router.push('/(employee)/(tabs)/attendance')}
              />
              <KpiTile
                label="Leave Balance"
                value={String(data.totalLeaveRemaining)}
                subtext="CL + SL + PL available"
                linkText="Apply leave"
                accent="amber"
                icon={<CalendarPlus size={16} color="#D97706" />}
                onPress={() => router.push('/(employee)/(tabs)/leaves')}
              />
              <KpiTile
                label="2026 Holidays"
                value={String(data.holidays2026)}
                subtext="Company & national"
                linkText="Calendar"
                accent="sky"
                icon={<Calendar size={16} color="#0284C7" />}
                onPress={() => router.push('/(employee)/(tabs)/more')}
              />
            </View>

            <NativeCard>
              <SectionHeader title="Quick Employee Actions" />
              <View className="flex-row flex-wrap gap-2.5">
                <Pressable
                  onPress={() => {
                    void triggerHaptic('light');
                    faceSheetRef.current?.present();
                  }}
                  className="flex-1 min-w-[46%] bg-slate-50 border border-slate-200 rounded-xl p-3.5 gap-1.5"
                >
                  <ScanFace size={18} color="#4F46E5" />
                  <Text className="text-xs font-bold text-slate-900">Face Check-In</Text>
                  <Text className="text-[11px] text-slate-500">Camera & GPS geofence</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    void triggerHaptic('light');
                    router.push('/(employee)/(tabs)/leaves');
                  }}
                  className="flex-1 min-w-[46%] bg-slate-50 border border-slate-200 rounded-xl p-3.5 gap-1.5"
                >
                  <CalendarPlus size={18} color="#D97706" />
                  <Text className="text-xs font-bold text-slate-900">Apply Leave</Text>
                  <Text className="text-[11px] text-slate-500">Request time off</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    void triggerHaptic('light');
                    router.push('/(employee)/(tabs)/payroll-docs');
                  }}
                  className="flex-1 min-w-[46%] bg-slate-50 border border-slate-200 rounded-xl p-3.5 gap-1.5"
                >
                  <FileText size={18} color="#10B981" />
                  <Text className="text-xs font-bold text-slate-900">Payslips</Text>
                  <Text className="text-[11px] text-slate-500">Download & share PDF</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    void triggerHaptic('light');
                    router.push('/(employee)/(tabs)/payroll-docs');
                  }}
                  className="flex-1 min-w-[46%] bg-slate-50 border border-slate-200 rounded-xl p-3.5 gap-1.5"
                >
                  <IdCard size={18} color="#0284C7" />
                  <Text className="text-xs font-bold text-slate-900">Digital ID & KYC</Text>
                  <Text className="text-[11px] text-slate-500">Upload & view badge</Text>
                </Pressable>
              </View>
            </NativeCard>

            <NativeCard>
              <SectionHeader
                title="My Recent Leave Requests"
                actionLabel="Manage"
                onAction={() => router.push('/(employee)/(tabs)/leaves')}
              />
              {data.leaveRequests.map((lv, idx) => (
                <View
                  key={lv.id}
                  className={`py-2.5 flex-row items-center justify-between ${
                    idx > 0 ? 'border-t border-slate-100' : ''
                  }`}
                >
                  <View>
                    <Text className="text-xs font-bold text-slate-900">{lv.leaveType}</Text>
                    <Text className="text-[11px] text-slate-500">
                      {lv.dateRange} ({lv.days}d)
                    </Text>
                  </View>
                  <StatusPill
                    label={lv.status}
                    tone={lv.status === 'Approved' ? 'emerald' : 'amber'}
                  />
                </View>
              ))}
            </NativeCard>
          </>
        )}
      </ScrollView>

      {data ? (
        <FaceCheckInSheet
          sheetRef={faceSheetRef}
          currentStatus={data.todayStatus}
          onSuccessPunch={(next, time, geo) =>
            setData({
              ...data,
              todayStatus: next,
              punchInTime: time,
              geofenceName: geo,
            })
          }
        />
      ) : null}
      <NotificationsSheet sheetRef={notifSheetRef} />
    </View>
  );
}
