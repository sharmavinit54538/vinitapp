import React, { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { Download } from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, PrimaryButton, SectionHeader } from '@/components/ui/NativeCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import { downloadAndShareSlip, triggerHaptic } from '@/services/nativeModules';

export default function ExecutiveFinanceScreen() {
  const { data, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchExecutiveDashboard
  );
  const [exportMsg, setExportMsg] = useState<string | null>(null);

  const handleExportPack = async (title: string) => {
    await triggerHaptic('medium');
    const csv = [
      'Department,Headcount,AttendancePct,AttritionPct,MonthlyPayrollCr',
      ...(data?.departments.map(
        (d) => `${d.department},${d.headcount},${d.attendancePct},${d.attritionPct},${d.monthlyPayrollCr}`
      ) || []),
    ].join('\n');
    const filename = `${title.replace(/[^a-z0-9]/gi, '_')}.csv`;
    await downloadAndShareSlip({ filename, content: csv });
    await triggerHaptic('success');
    setExportMsg(`Exported ${filename}`);
  };

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader roleBadge="FINANCE" />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {exportMsg ? (
          <View className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
            <Text className="text-xs font-bold text-emerald-800">{exportMsg}</Text>
          </View>
        ) : null}

        <NativeCard>
          <SectionHeader title="Department Monthly Payroll Burn" />
          {data?.departments.map((d, idx) => (
            <View
              key={d.id}
              className={`py-2.5 flex-row items-center justify-between ${
                idx > 0 ? 'border-t border-slate-100' : ''
              }`}
            >
              <Text className="text-xs font-bold text-slate-900">{d.department}</Text>
              <Text className="text-xs font-extrabold text-indigo-600">
                ₹{d.monthlyPayrollCr.toFixed(2)} Cr
              </Text>
            </View>
          ))}
        </NativeCard>

        <NativeCard>
          <SectionHeader title="Board & MIS Packs" />
          <View className="gap-3">
            {data?.boardReports.map((rep) => (
              <View
                key={rep.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 gap-2.5"
              >
                <View>
                  <Text className="text-sm font-bold text-slate-900">{rep.title}</Text>
                  <Text className="text-xs text-slate-500">
                    {rep.period} · {rep.format}
                  </Text>
                </View>
                <PrimaryButton
                  title="Export & Share CSV"
                  icon={<Download size={15} color="#FFFFFF" />}
                  onPress={() => void handleExportPack(rep.title)}
                />
              </View>
            ))}
          </View>
        </NativeCard>
      </ScrollView>
    </View>
  );
}
