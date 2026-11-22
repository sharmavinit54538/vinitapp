import React, { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, SectionHeader, StatusPill } from '@/components/ui/NativeCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import { triggerHaptic } from '@/services/nativeModules';

export default function ManagerTeamScreen() {
  const { data, setData, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchManagerDashboard
  );
  const [segment, setSegment] = useState<'directory' | 'roster'>('directory');

  const cycleShift = (rosterId: string) => {
    if (!data) return;
    void triggerHaptic('light');
    const options = ['09:30 AM · Core', '11:00 AM · US Overlap', '10:00 AM · Release'];
    setData({
      ...data,
      roster: data.roster.map((r) => {
        if (r.id !== rosterId) return r;
        const idx = options.indexOf(r.shift);
        return { ...r, shift: options[(idx + 1) % options.length] };
      }),
    });
  };

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader roleBadge="MY TEAM" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <View className="flex-row bg-slate-200/70 rounded-xl p-1 gap-1">
          {(['directory', 'roster'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => {
                void triggerHaptic('light');
                setSegment(tab);
              }}
              className={`flex-1 h-9 rounded-lg items-center justify-center ${
                segment === tab ? 'bg-white' : ''
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  segment === tab ? 'text-slate-900' : 'text-slate-500'
                }`}
              >
                {tab === 'directory' ? 'Direct Reports' : 'Roster Scheduler'}
              </Text>
            </Pressable>
          ))}
        </View>

        {segment === 'directory' ? (
          <NativeCard>
            <SectionHeader title="Direct Reports Live Attendance" />
            {data?.directReports.map((rep, idx) => (
              <View
                key={rep.id}
                className={`py-3 flex-row items-center justify-between ${
                  idx > 0 ? 'border-t border-slate-100' : ''
                }`}
              >
                <View>
                  <Text className="text-sm font-bold text-slate-900">{rep.fullName}</Text>
                  <Text className="text-xs text-slate-500">
                    {rep.roleTitle} · Shift {rep.shiftCode}
                  </Text>
                </View>
                <StatusPill
                  label={rep.todayStatus}
                  tone={rep.todayStatus === 'Present' ? 'emerald' : 'sky'}
                />
              </View>
            ))}
          </NativeCard>
        ) : (
          <NativeCard>
            <SectionHeader title="Weekly Roster Scheduler (Tap to Cycle Shift)" />
            {data?.roster.map((row, idx) => (
              <Pressable
                key={row.id}
                onPress={() => cycleShift(row.id)}
                className={`py-3 flex-row items-center justify-between ${
                  idx > 0 ? 'border-t border-slate-100' : ''
                }`}
              >
                <View>
                  <Text className="text-sm font-bold text-slate-900">{row.employeeName}</Text>
                  <Text className="text-xs text-slate-500">{row.day}</Text>
                </View>
                <StatusPill label={row.shift} tone="indigo" />
              </Pressable>
            ))}
          </NativeCard>
        )}
      </ScrollView>
    </View>
  );
}
