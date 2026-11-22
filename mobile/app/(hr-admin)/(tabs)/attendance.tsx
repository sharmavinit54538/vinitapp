import React, { useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { MapPin, ScanFace } from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, PrimaryButton, SectionHeader, StatusPill } from '@/components/ui/NativeCard';
import { FaceCheckInSheet } from '@/components/native/FaceCheckInSheet';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';

export default function HrAdminAttendanceScreen() {
  const { data, isRefreshing, onRefresh } = useDashboardData(hrmsService.fetchHrAdminDashboard);
  const faceSheetRef = useRef<BottomSheetModal>(null);
  const [status, setStatus] = useState<'Checked In' | 'Not Checked In'>('Checked In');
  const [lastPunch, setLastPunch] = useState('09:12 AM · Bengaluru HQ');

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader roleBadge="ATTENDANCE" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <NativeCard>
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-xs font-semibold text-slate-500">Live Biometric Status</Text>
              <Text className="text-lg font-extrabold text-slate-900">{status}</Text>
              <Text className="text-xs text-slate-500 mt-0.5">{lastPunch}</Text>
            </View>
            <StatusPill label={status} tone={status === 'Checked In' ? 'emerald' : 'amber'} />
          </View>
          <PrimaryButton
            title="Launch Face + GPS Check-In"
            icon={<ScanFace size={17} color="#FFFFFF" />}
            onPress={() => faceSheetRef.current?.present()}
          />
        </NativeCard>

        <NativeCard>
          <SectionHeader title="Today's Workforce Punch Summary" />
          <View className="flex-row items-center gap-2 mb-3 bg-indigo-50 rounded-xl p-3">
            <MapPin size={16} color="#4F46E5" />
            <Text className="text-xs font-semibold text-indigo-800 flex-1">
              {data ? `${data.kpis.attendanceRatePct}% of ${data.kpis.activeWorkforce} active staff checked in` : 'Syncing live geofences...'}
            </Text>
          </View>
          {data?.workforce.map((m, idx) => (
            <View
              key={m.id}
              className={`py-2.5 flex-row items-center justify-between ${
                idx > 0 ? 'border-t border-slate-100' : ''
              }`}
            >
              <View>
                <Text className="text-xs font-bold text-slate-900">{m.fullName}</Text>
                <Text className="text-[11px] text-slate-500">{m.location}</Text>
              </View>
              <StatusPill
                label={m.status === 'On Leave' ? 'On Leave' : 'Verified'}
                tone={m.status === 'On Leave' ? 'amber' : 'emerald'}
              />
            </View>
          ))}
        </NativeCard>
      </ScrollView>

      <FaceCheckInSheet
        sheetRef={faceSheetRef}
        currentStatus={status}
        onSuccessPunch={(next, time, geo) => {
          setStatus(next);
          setLastPunch(`${time} · ${geo}`);
        }}
      />
    </View>
  );
}
