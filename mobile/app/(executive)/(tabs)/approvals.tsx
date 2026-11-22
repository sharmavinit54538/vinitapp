import React, { useRef, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Check, PauseCircle } from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, PrimaryButton, StatusPill } from '@/components/ui/NativeCard';
import { NativeBottomSheet } from '@/components/ui/NativeBottomSheet';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import { ExecutiveApprovalItem } from '@/types/hrms';
import { triggerHaptic } from '@/services/nativeModules';

export default function ExecutiveApprovalsScreen() {
  const { data, setData, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchExecutiveDashboard
  );
  const holdSheetRef = useRef<BottomSheetModal>(null);
  const [holdTarget, setHoldTarget] = useState<ExecutiveApprovalItem | null>(null);
  const [holdNote, setHoldNote] = useState('');

  const handleApprove = (id: string) => {
    if (!data) return;
    void triggerHaptic('success');
    setData({
      ...data,
      approvals: data.approvals.map((a) => (a.id === id ? { ...a, status: 'Approved' } : a)),
    });
  };

  const handleConfirmHold = () => {
    if (!data || !holdTarget || holdNote.trim().length < 4) return;
    void triggerHaptic('warning');
    setData({
      ...data,
      approvals: data.approvals.map((a) =>
        a.id === holdTarget.id ? { ...a, status: 'On Hold', holdNote: holdNote.trim() } : a
      ),
    });
    setHoldNote('');
    setHoldTarget(null);
    holdSheetRef.current?.dismiss();
  };

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader roleBadge="SIGN-OFFS" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {data?.approvals.map((item) => (
          <NativeCard key={item.id}>
            <View className="flex-row items-start justify-between gap-2 mb-3">
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-900">{item.title}</Text>
                <Text className="text-xs text-slate-500 mt-0.5">
                  {item.referenceCode} · {item.category} · {item.amountLabel}
                </Text>
                {item.holdNote ? (
                  <Text className="text-[11px] font-semibold text-amber-700 mt-1">
                    Hold Note: {item.holdNote}
                  </Text>
                ) : null}
              </View>
              <StatusPill
                label={item.status}
                tone={
                  item.status === 'Approved'
                    ? 'emerald'
                    : item.status === 'On Hold'
                      ? 'amber'
                      : 'rose'
                }
              />
            </View>

            {item.status === 'Pending' ? (
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => handleApprove(item.id)}
                  className="flex-1 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex-row items-center justify-center gap-1.5"
                >
                  <Check size={15} color="#059669" />
                  <Text className="text-xs font-bold text-emerald-700">Sign Off</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setHoldTarget(item);
                    holdSheetRef.current?.present();
                  }}
                  className="flex-1 h-10 rounded-xl bg-amber-50 border border-amber-200 flex-row items-center justify-center gap-1.5"
                >
                  <PauseCircle size={15} color="#D97706" />
                  <Text className="text-xs font-bold text-amber-700">Hold</Text>
                </Pressable>
              </View>
            ) : null}
          </NativeCard>
        ))}
      </ScrollView>

      <NativeBottomSheet
        sheetRef={holdSheetRef}
        title="Executive Hold Rationale"
        subtitle={holdTarget ? `${holdTarget.referenceCode} · ${holdTarget.amountLabel}` : undefined}
      >
        <View className="gap-3">
          <TextInput
            value={holdNote}
            onChangeText={setHoldNote}
            multiline
            placeholder="Enter reason for placing batch/offer on hold..."
            className="h-24 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900"
          />
          <PrimaryButton
            title="Confirm Hold Status"
            tone="amber"
            onPress={handleConfirmHold}
          />
        </View>
      </NativeBottomSheet>
    </View>
  );
}
