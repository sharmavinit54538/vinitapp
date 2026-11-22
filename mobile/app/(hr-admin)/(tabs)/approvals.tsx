import React from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, StatusPill } from '@/components/ui/NativeCard';
import { DashboardSkeleton } from '@/components/ui/SkeletonCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import { triggerHaptic } from '@/services/nativeModules';

export default function HrAdminApprovalsScreen() {
  const { data, setData, isLoading, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchHrAdminDashboard
  );

  const handleAction = (id: string, nextStatus: 'Approved' | 'Rejected') => {
    if (!data) return;
    void triggerHaptic(nextStatus === 'Approved' ? 'success' : 'warning');
    setData({
      ...data,
      approvals: data.approvals.map((a) => (a.id === id ? { ...a, status: nextStatus } : a)),
    });
  };

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader roleBadge="APPROVALS" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {isLoading || !data ? (
          <DashboardSkeleton />
        ) : (
          data.approvals.map((item) => (
            <NativeCard key={item.id}>
              <View className="flex-row items-start justify-between gap-2 mb-3">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900">{item.employeeName}</Text>
                  <Text className="text-xs text-slate-600 mt-0.5">{item.summary}</Text>
                  <Text className="text-[11px] text-slate-400 mt-1">
                    {item.category} · {item.submittedAt}
                  </Text>
                </View>
                <StatusPill
                  label={item.status}
                  tone={
                    item.status === 'Approved'
                      ? 'emerald'
                      : item.status === 'Rejected'
                        ? 'rose'
                        : 'amber'
                  }
                />
              </View>

              {item.status === 'Pending' ? (
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => handleAction(item.id, 'Approved')}
                    className="flex-1 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex-row items-center justify-center gap-1.5"
                  >
                    <Check size={15} color="#059669" />
                    <Text className="text-xs font-bold text-emerald-700">Approve</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleAction(item.id, 'Rejected')}
                    className="flex-1 h-10 rounded-xl bg-rose-50 border border-rose-200 flex-row items-center justify-center gap-1.5"
                  >
                    <X size={15} color="#E11D48" />
                    <Text className="text-xs font-bold text-rose-700">Reject</Text>
                  </Pressable>
                </View>
              ) : null}
            </NativeCard>
          ))
        )}
      </ScrollView>
    </View>
  );
}
