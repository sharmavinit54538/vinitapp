import React, { useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CalendarPlus } from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, PrimaryButton, SectionHeader, StatusPill } from '@/components/ui/NativeCard';
import { NativeBottomSheet } from '@/components/ui/NativeBottomSheet';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import { sendLocalPushNotification, triggerHaptic } from '@/services/nativeModules';

export default function EmployeeLeavesScreen() {
  const { data, setData, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchEmployeeDashboard
  );
  const leaveSheetRef = useRef<BottomSheetModal>(null);
  const [leaveType, setLeaveType] = useState<'Casual Leave' | 'Sick Leave' | 'Privilege Leave'>(
    'Casual Leave'
  );
  const [dateRange, setDateRange] = useState('28 Nov – 29 Nov');
  const [reason, setReason] = useState('');

  const handleSubmitLeave = async () => {
    if (!data || !dateRange.trim()) return;
    await triggerHaptic('success');
    setData({
      ...data,
      leaveRequests: [
        {
          id: `LV-${Date.now()}`,
          leaveType,
          dateRange: dateRange.trim(),
          days: 2,
          status: 'Pending',
        },
        ...data.leaveRequests,
      ],
    });
    await sendLocalPushNotification(
      'Leave Request Submitted',
      `${leaveType} (${dateRange.trim()}) sent to your manager.`
    );
    setReason('');
    leaveSheetRef.current?.dismiss();
  };

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader roleBadge="LEAVES" onOpenQuickActions={() => leaveSheetRef.current?.present()} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <PrimaryButton
          title="Apply for Leave"
          icon={<CalendarPlus size={16} color="#FFFFFF" />}
          onPress={() => leaveSheetRef.current?.present()}
        />

        <View className="flex-row gap-2.5">
          {data?.leaveBalances.map((b) => (
            <NativeCard key={b.code} className="flex-1 items-center">
              <Text className="text-[11px] font-bold text-slate-500">{b.code}</Text>
              <Text className="text-2xl font-extrabold text-indigo-600 mt-1">{b.remaining}</Text>
              <Text className="text-[10px] text-slate-400">of {b.total} left</Text>
            </NativeCard>
          ))}
        </View>

        <NativeCard>
          <SectionHeader title="Leave Applications" />
          {data?.leaveRequests.map((req, idx) => (
            <View
              key={req.id}
              className={`py-3 flex-row items-center justify-between ${
                idx > 0 ? 'border-t border-slate-100' : ''
              }`}
            >
              <View>
                <Text className="text-xs font-bold text-slate-900">{req.leaveType}</Text>
                <Text className="text-[11px] text-slate-500">
                  {req.dateRange} · {req.days} day(s)
                </Text>
              </View>
              <StatusPill
                label={req.status}
                tone={req.status === 'Approved' ? 'emerald' : 'amber'}
              />
            </View>
          ))}
        </NativeCard>
      </ScrollView>

      <NativeBottomSheet
        sheetRef={leaveSheetRef}
        title="Apply for Leave"
        subtitle="Submit time-off request to your reporting manager"
      >
        <View className="gap-3">
          <View className="flex-row gap-2">
            {(['Casual Leave', 'Sick Leave', 'Privilege Leave'] as const).map((t) => (
              <Pressable
                key={t}
                onPress={() => {
                  void triggerHaptic('light');
                  setLeaveType(t);
                }}
                className={`flex-1 py-2.5 px-2 rounded-xl border items-center ${
                  leaveType === t
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <Text
                  className={`text-[11px] font-bold ${
                    leaveType === t ? 'text-white' : 'text-slate-700'
                  }`}
                >
                  {t.replace(' Leave', '')}
                </Text>
              </Pressable>
            ))}
          </View>

          <TextInput
            value={dateRange}
            onChangeText={setDateRange}
            placeholder="Date range (e.g. 28 Nov – 29 Nov)"
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900"
          />
          <TextInput
            value={reason}
            onChangeText={setReason}
            multiline
            placeholder="Reason for leave..."
            className="h-20 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900"
          />
          <PrimaryButton title="Submit Leave Request" onPress={() => void handleSubmitLeave()} />
        </View>
      </NativeBottomSheet>
    </View>
  );
}
