import React, { useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, StatusPill } from '@/components/ui/NativeCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import { triggerHaptic } from '@/services/nativeModules';

export default function ManagerApprovalsScreen() {
  const { data, setData, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchManagerDashboard
  );
  const [filter, setFilter] = useState<'All' | 'Leave' | 'Expense' | 'Shift Swap'>('All');

  const items = useMemo(() => {
    if (!data) return [];
    if (filter === 'All') return data.approvals;
    return data.approvals.filter((a) => a.type === filter);
  }, [data, filter]);

  const handleDecision = (id: string, next: 'Approved' | 'Declined') => {
    if (!data) return;
    void triggerHaptic(next === 'Approved' ? 'success' : 'warning');
    setData({
      ...data,
      approvals: data.approvals.map((a) => (a.id === id ? { ...a, status: next } : a)),
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
        <View className="flex-row flex-wrap gap-2">
          {(['All', 'Leave', 'Expense', 'Shift Swap'] as const).map((t) => (
            <Pressable
              key={t}
              onPress={() => {
                void triggerHaptic('light');
                setFilter(t);
              }}
              className={`px-3 py-2 rounded-xl border ${
                filter === t ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  filter === t ? 'text-white' : 'text-slate-600'
                }`}
              >
                {t}
              </Text>
            </Pressable>
          ))}
        </View>

        {items.map((item) => (
          <NativeCard key={item.id}>
            <View className="flex-row items-start justify-between gap-2 mb-3">
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-900">{item.employeeName}</Text>
                <Text className="text-xs text-slate-600 mt-0.5">{item.detail}</Text>
                <Text className="text-[11px] font-semibold text-indigo-600 mt-1">
                  {item.type} · {item.amountOrDays}
                </Text>
              </View>
              <StatusPill
                label={item.status}
                tone={
                  item.status === 'Approved'
                    ? 'emerald'
                    : item.status === 'Declined'
                      ? 'rose'
                      : 'amber'
                }
              />
            </View>

            {item.status === 'Pending' ? (
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => handleDecision(item.id, 'Approved')}
                  className="flex-1 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex-row items-center justify-center gap-1.5"
                >
                  <Check size={15} color="#059669" />
                  <Text className="text-xs font-bold text-emerald-700">Approve</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleDecision(item.id, 'Declined')}
                  className="flex-1 h-10 rounded-xl bg-rose-50 border border-rose-200 flex-row items-center justify-center gap-1.5"
                >
                  <X size={15} color="#E11D48" />
                  <Text className="text-xs font-bold text-rose-700">Decline</Text>
                </Pressable>
              </View>
            ) : null}
          </NativeCard>
        ))}
      </ScrollView>
    </View>
  );
}
