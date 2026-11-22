import React from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Star } from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, SectionHeader, StatusPill } from '@/components/ui/NativeCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import { triggerHaptic } from '@/services/nativeModules';

export default function ManagerPerformanceScreen() {
  const { data, setData, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchManagerDashboard
  );

  const bumpRating = (id: string) => {
    if (!data) return;
    void triggerHaptic('light');
    setData({
      ...data,
      goals: data.goals.map((g) =>
        g.id === id
          ? { ...g, rating: g.rating >= 5 ? 3.5 : Number((g.rating + 0.1).toFixed(1)) }
          : g
      ),
    });
  };

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader roleBadge="PERFORMANCE" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <NativeCard>
          <SectionHeader title="Team KPI Ratings (Tap Score to Calibrate)" />
          {data?.goals.map((g, idx) => (
            <View
              key={g.id}
              className={`py-3 flex-row items-center justify-between gap-3 ${
                idx > 0 ? 'border-t border-slate-100' : ''
              }`}
            >
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-900">{g.employeeName}</Text>
                <Text className="text-[11px] text-slate-500 mt-0.5">{g.goalTitle}</Text>
                <Text className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                  {g.progressPct}% achieved
                </Text>
              </View>
              <Pressable
                onPress={() => bumpRating(g.id)}
                className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 flex-row items-center gap-1"
              >
                <Star size={13} color="#D97706" />
                <Text className="text-xs font-extrabold text-amber-700">{g.rating}</Text>
              </Pressable>
            </View>
          ))}
        </NativeCard>

        <NativeCard>
          <SectionHeader title="Hiring Interview Scorecards" />
          {data?.scorecards.map((sc, idx) => (
            <View
              key={sc.id}
              className={`py-3 flex-row items-center justify-between gap-3 ${
                idx > 0 ? 'border-t border-slate-100' : ''
              }`}
            >
              <View className="flex-1">
                <Text className="text-xs font-bold text-slate-900">{sc.candidateName}</Text>
                <Text className="text-[11px] text-slate-500">
                  {sc.roleTitle} · {sc.stage}
                </Text>
              </View>
              <StatusPill
                label={`${sc.score}/5 · ${sc.recommendation}`}
                tone={sc.recommendation === 'Strong Hire' ? 'emerald' : 'indigo'}
              />
            </View>
          ))}
        </NativeCard>
      </ScrollView>
    </View>
  );
}
