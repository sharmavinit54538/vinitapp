import React from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, StatusPill } from '@/components/ui/NativeCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';

export default function ExecutiveWorkforceScreen() {
  const { data, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchExecutiveDashboard
  );

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader roleBadge="WORKFORCE" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {data?.departments.map((dept) => (
          <NativeCard key={dept.id}>
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-bold text-slate-900">{dept.department}</Text>
              <StatusPill
                label={dept.healthStatus}
                tone={
                  dept.healthStatus === 'Healthy'
                    ? 'emerald'
                    : dept.healthStatus === 'Watch'
                      ? 'amber'
                      : 'rose'
                }
              />
            </View>
            <View className="flex-row justify-between pt-2 border-t border-slate-100">
              <Text className="text-xs text-slate-600">{dept.headcount} Headcount</Text>
              <Text className="text-xs text-slate-600">{dept.attendancePct}% Attendance</Text>
              <Text className="text-xs text-slate-600">{dept.attritionPct}% Attrition</Text>
            </View>
          </NativeCard>
        ))}
      </ScrollView>
    </View>
  );
}
