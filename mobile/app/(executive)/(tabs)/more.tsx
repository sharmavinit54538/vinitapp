import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, PrimaryButton, SectionHeader, StatusPill } from '@/components/ui/NativeCard';
import { useAuth } from '@/context/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';

export default function ExecutiveMoreScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const { data } = useDashboardData(hrmsService.fetchExecutiveDashboard);

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader roleBadge="MORE" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <NativeCard>
          <Text className="text-base font-bold text-slate-900">{session?.user.fullName}</Text>
          <Text className="text-xs text-slate-500 mt-0.5">
            {session?.user.designation} · {session?.user.location}
          </Text>
        </NativeCard>

        <NativeCard>
          <SectionHeader title="AI Strategic Briefs" />
          {data?.aiInsights.map((ins, idx) => (
            <View
              key={ins.id}
              className={`py-2.5 flex-row items-center justify-between gap-2 ${
                idx > 0 ? 'border-t border-slate-100' : ''
              }`}
            >
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-900">{ins.title}</Text>
                <Text className="text-[11px] text-slate-500">{ins.summary}</Text>
              </View>
              <StatusPill label={ins.metric} tone="indigo" />
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
