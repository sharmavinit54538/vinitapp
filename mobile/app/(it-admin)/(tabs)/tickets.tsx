import React from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, PrimaryButton, StatusPill } from '@/components/ui/NativeCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import { triggerHaptic } from '@/services/nativeModules';

export default function ItAdminTicketsScreen() {
  const { data, setData, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchItAdminDashboard
  );

  const handleResolve = (id: string) => {
    if (!data) return;
    void triggerHaptic('success');
    setData({
      ...data,
      tickets: data.tickets.map((t) => (t.id === id ? { ...t, status: 'Resolved' } : t)),
    });
  };

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader roleBadge="SLA QUEUE" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {data?.tickets.map((ticket) => (
          <NativeCard key={ticket.id}>
            <View className="flex-row items-start justify-between gap-2 mb-3">
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-900">{ticket.subject}</Text>
                <Text className="text-xs text-slate-500 mt-0.5">
                  {ticket.id} · {ticket.requester} · SLA {ticket.slaRemaining}
                </Text>
              </View>
              <StatusPill
                label={ticket.status}
                tone={
                  ticket.status === 'Resolved'
                    ? 'emerald'
                    : ticket.priority === 'Critical'
                      ? 'rose'
                      : 'amber'
                }
              />
            </View>
            {ticket.status !== 'Resolved' ? (
              <PrimaryButton
                title="Mark SLA Resolved"
                tone="emerald"
                onPress={() => handleResolve(ticket.id)}
              />
            ) : null}
          </NativeCard>
        ))}
      </ScrollView>
    </View>
  );
}
