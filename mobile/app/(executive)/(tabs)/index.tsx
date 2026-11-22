import React, { useRef } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Activity, IndianRupee, Sparkles, TrendingDown, Users } from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { KpiTile, NativeCard, SectionHeader, StatusPill } from '@/components/ui/NativeCard';
import { DashboardSkeleton } from '@/components/ui/SkeletonCard';
import { NotificationsSheet } from '@/components/native/NotificationsSheet';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import { ExecutiveLens } from '@/types/hrms';
import { triggerHaptic } from '@/services/nativeModules';

const LENSES: { id: ExecutiveLens; label: string }[] = [
  { id: 'all', label: 'All / CEO' },
  { id: 'cfo', label: 'CFO' },
  { id: 'coo', label: 'COO' },
  { id: 'cto', label: 'CTO' },
];

export default function ExecutiveHomeScreen() {
  const router = useRouter();
  const { data, setData, isLoading, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchExecutiveDashboard
  );
  const notifSheetRef = useRef<BottomSheetModal>(null);

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader
        roleBadge={(data?.activeLens || 'CEO').toUpperCase()}
        onOpenQuickActions={() => router.push('/(executive)/(tabs)/approvals')}
        onOpenNotifications={() => notifSheetRef.current?.present()}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {isLoading || !data ? (
          <DashboardSkeleton />
        ) : (
          <>
            <View className="flex-row gap-2">
              {LENSES.map((lens) => {
                const active = data.activeLens === lens.id;
                return (
                  <Pressable
                    key={lens.id}
                    onPress={() => {
                      void triggerHaptic('light');
                      setData({ ...data, activeLens: lens.id });
                    }}
                    className={`px-3.5 py-2 rounded-xl border ${
                      active ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        active ? 'text-white' : 'text-slate-600'
                      }`}
                    >
                      {lens.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View className="flex-row flex-wrap gap-3">
              <KpiTile
                label="Total Workforce"
                value={String(data.kpis.totalWorkforce)}
                subtext={`+${data.kpis.momGrowthPct}% MoM`}
                linkText="View org"
                icon={<Users size={16} color="#4F46E5" />}
                onPress={() => router.push('/(executive)/(tabs)/workforce')}
              />
              <KpiTile
                label="Payroll Burn"
                value={`₹${data.kpis.monthlyPayrollCr.toFixed(2)} Cr`}
                subtext={`+${data.kpis.budgetVariancePct}% vs budget`}
                linkText="Finance"
                accent="emerald"
                icon={<IndianRupee size={16} color="#10B981" />}
                onPress={() => router.push('/(executive)/(tabs)/finance')}
              />
              <KpiTile
                label="Org Attendance"
                value={`${data.kpis.orgAttendancePct}%`}
                subtext="Enterprise live rate"
                linkText="Breakdown"
                accent="sky"
                icon={<Activity size={16} color="#0284C7" />}
                onPress={() => router.push('/(executive)/(tabs)/workforce')}
              />
              <KpiTile
                label="Attrition"
                value={`${data.kpis.annualizedAttritionPct.toFixed(1)}%`}
                subtext="Annualized rate"
                linkText="AI Insights"
                accent="amber"
                icon={<TrendingDown size={16} color="#D97706" />}
                onPress={() => router.push('/(executive)/(tabs)/more')}
              />
            </View>

            <NativeCard>
              <SectionHeader
                title="AI Executive Insights"
                actionLabel="Deep Dive"
                onAction={() => router.push('/(executive)/(tabs)/more')}
              />
              {data.aiInsights.map((ins, idx) => (
                <View
                  key={ins.id}
                  className={`py-2.5 flex-row items-center justify-between gap-2 ${
                    idx > 0 ? 'border-t border-slate-100' : ''
                  }`}
                >
                  <View className="flex-1">
                    <View className="flex-row items-center gap-1.5">
                      <Sparkles size={13} color="#4F46E5" />
                      <Text className="text-xs font-bold text-slate-900">{ins.title}</Text>
                    </View>
                    <Text className="text-[11px] text-slate-500 mt-0.5">{ins.summary}</Text>
                  </View>
                  <StatusPill label={ins.metric} tone="indigo" />
                </View>
              ))}
            </NativeCard>
          </>
        )}
      </ScrollView>

      <NotificationsSheet sheetRef={notifSheetRef} />
    </View>
  );
}
