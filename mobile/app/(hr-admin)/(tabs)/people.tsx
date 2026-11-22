import React, { useMemo, useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Search, UserPlus } from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, PrimaryButton, StatusPill } from '@/components/ui/NativeCard';
import { NativeBottomSheet } from '@/components/ui/NativeBottomSheet';
import { DashboardSkeleton } from '@/components/ui/SkeletonCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import { triggerHaptic } from '@/services/nativeModules';

export default function HrAdminPeopleScreen() {
  const { data, setData, isLoading, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchHrAdminDashboard
  );
  const addSheetRef = useRef<BottomSheetModal>(null);
  const [search, setSearch] = useState('');
  const [newName, setNewName] = useState('');
  const [newDept, setNewDept] = useState('Engineering');
  const [newRole, setNewRole] = useState('Software Engineer');

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    if (!q) return data.workforce;
    return data.workforce.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q) ||
        m.employeeCode.toLowerCase().includes(q)
    );
  }, [data, search]);

  const handleAddEmployee = () => {
    if (!newName.trim() || !data) return;
    void triggerHaptic('success');
    setData({
      ...data,
      kpis: { ...data.kpis, activeWorkforce: data.kpis.activeWorkforce + 1 },
      workforce: [
        {
          id: `W-${Date.now()}`,
          employeeCode: `OFC-${Math.floor(2300 + Math.random() * 600)}`,
          fullName: newName.trim(),
          department: newDept.trim() || 'Engineering',
          designation: newRole.trim() || 'Associate',
          location: 'Bengaluru HQ',
          status: 'Onboarding',
          attendanceRatePct: 100,
        },
        ...data.workforce,
      ],
    });
    setNewName('');
    addSheetRef.current?.dismiss();
  };

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader
        roleBadge="PEOPLE"
        onOpenQuickActions={() => addSheetRef.current?.present()}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <View className="flex-row items-center h-12 bg-white rounded-xl border border-slate-200 px-3 gap-2">
          <Search size={16} color="#64748B" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search employee name, code, or dept..."
            className="flex-1 text-sm text-slate-900"
          />
        </View>

        <PrimaryButton
          title="Add New Employee"
          icon={<UserPlus size={16} color="#FFFFFF" />}
          onPress={() => addSheetRef.current?.present()}
        />

        {isLoading || !data ? (
          <DashboardSkeleton />
        ) : (
          filtered.map((member) => (
            <NativeCard key={member.id}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-900">{member.fullName}</Text>
                  <Text className="text-xs text-slate-500">
                    {member.employeeCode} · {member.designation}
                  </Text>
                  <Text className="text-[11px] text-slate-400 mt-1">
                    {member.department} · {member.location} · {member.attendanceRatePct}% att
                  </Text>
                </View>
                <StatusPill
                  label={member.status}
                  tone={
                    member.status === 'Active'
                      ? 'emerald'
                      : member.status === 'Onboarding'
                        ? 'indigo'
                        : 'amber'
                  }
                />
              </View>
            </NativeCard>
          ))
        )}
      </ScrollView>

      <NativeBottomSheet
        sheetRef={addSheetRef}
        title="Add New Employee"
        subtitle="Onboard directly into OFC360 workforce directory"
      >
        <View className="gap-3">
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="Full Name (e.g. Aarav Patel)"
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900"
          />
          <TextInput
            value={newDept}
            onChangeText={setNewDept}
            placeholder="Department"
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900"
          />
          <TextInput
            value={newRole}
            onChangeText={setNewRole}
            placeholder="Designation"
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900"
          />
          <PrimaryButton title="Create Employee Record" onPress={handleAddEmployee} />
        </View>
      </NativeBottomSheet>
    </View>
  );
}
