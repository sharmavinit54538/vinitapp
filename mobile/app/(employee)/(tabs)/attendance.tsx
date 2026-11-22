import React, { useRef } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { MapPin, ScanFace } from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, PrimaryButton, SectionHeader, StatusPill } from '@/components/ui/NativeCard';
import { FaceCheckInSheet } from '@/components/native/FaceCheckInSheet';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';

export default function EmployeeAttendanceScreen() {
  const { data, setData, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchEmployeeDashboard
  );
  const faceSheetRef = useRef<BottomSheetModal>(null);

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader roleBadge="ATTENDANCE" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {data ? (
          <>
            <NativeCard>
              <View className="flex-row items-center justify-between mb-3">
                <View className="flex-1">
                  <Text className="text-xs font-semibold text-slate-500">{data.shiftLabel}</Text>
                  <Text className="text-xl font-extrabold text-slate-900 mt-0.5">
                    {data.todayStatus}
                  </Text>
                  <View className="flex-row items-center gap-1 mt-1">
                    <MapPin size={13} color="#4F46E5" />
                    <Text className="text-xs text-slate-600">{data.geofenceName}</Text>
                  </View>
                </View>
                <StatusPill
                  label={data.todayStatus}
                  tone={data.todayStatus === 'Checked In' ? 'emerald' : 'amber'}
                />
              </View>

              <PrimaryButton
                title={
                  data.todayStatus === 'Checked In'
                    ? 'Face + GPS Punch Out'
                    : 'Face + GPS Punch In'
                }
                tone={data.todayStatus === 'Checked In' ? 'rose' : 'indigo'}
                icon={<ScanFace size={17} color="#FFFFFF" />}
                onPress={() => faceSheetRef.current?.present()}
              />
            </NativeCard>

            <NativeCard>
              <SectionHeader title="Recent Punch Logs" />
              {data.punchLogs.map((log, idx) => (
                <View
                  key={log.id}
                  className={`py-3 flex-row items-center justify-between ${
                    idx > 0 ? 'border-t border-slate-100' : ''
                  }`}
                >
                  <View>
                    <Text className="text-xs font-bold text-slate-900">
                      {log.date} · {log.mode}
                    </Text>
                    <Text className="text-[11px] text-slate-500">
                      In {log.checkIn} · Out {log.checkOut} · {log.workHours}
                    </Text>
                  </View>
                  <StatusPill
                    label={log.geofenceVerified ? 'GPS OK' : 'Remote'}
                    tone="emerald"
                  />
                </View>
              ))}
            </NativeCard>
          </>
        ) : null}
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
              punchLogs: [
                {
                  id: `P-${Date.now()}`,
                  date: 'Just now',
                  checkIn: next === 'Checked In' ? time : data.punchInTime,
                  checkOut: next === 'Not Checked In' ? time : 'Active',
                  mode: 'Face + GPS',
                  geofenceVerified: true,
                  workHours: 'Live',
                },
                ...data.punchLogs,
              ],
            })
          }
        />
      ) : null}
    </View>
  );
}
