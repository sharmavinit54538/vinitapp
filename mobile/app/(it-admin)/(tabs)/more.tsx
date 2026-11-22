import React from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, PrimaryButton, SectionHeader, StatusPill } from '@/components/ui/NativeCard';
import { useAuth } from '@/context/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import { triggerHaptic } from '@/services/nativeModules';

export default function ItAdminMoreScreen() {
  const router = useRouter();
  const { signOut } = useAuth();
  const { data, setData, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchItAdminDashboard
  );

  const handleClearExit = (id: string) => {
    if (!data) return;
    void triggerHaptic('success');
    setData({
      ...data,
      clearances: data.clearances.map((c) =>
        c.id === id ? { ...c, ssoRevoked: true, status: 'Cleared' } : c
      ),
    });
  };

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader roleBadge="MORE" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <NativeCard>
          <SectionHeader title="Offboarding IT Clearances" />
          {data?.clearances.map((clr) => (
            <View key={clr.id} className="gap-2.5 py-2">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-sm font-bold text-slate-900">{clr.employeeName}</Text>
                  <Text className="text-xs text-slate-500">
                    LWD {clr.lastWorkingDay} · {clr.assetsToRecover} assets to recover
                  </Text>
                </View>
                <StatusPill
                  label={clr.status}
                  tone={clr.status === 'Cleared' ? 'emerald' : 'amber'}
                />
              </View>
              {clr.status === 'Pending' ? (
                <PrimaryButton
                  title="Revoke SSO & Mark Cleared"
                  tone="emerald"
                  onPress={() => handleClearExit(clr.id)}
                />
              ) : null}
            </View>
          ))}
        </NativeCard>

        <PrimaryButton
          title="Sign Out"
          tone="rose"
          onPress={async () => {
            await signOut();
            router.replace('/(auth)/login');
          }}
        />
      </ScrollView>
    </View>
  );
}
