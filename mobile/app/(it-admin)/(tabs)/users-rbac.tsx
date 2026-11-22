import React, { useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { UserPlus } from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, PrimaryButton, StatusPill } from '@/components/ui/NativeCard';
import { NativeBottomSheet } from '@/components/ui/NativeBottomSheet';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import { triggerHaptic } from '@/services/nativeModules';

export default function ItAdminUsersRbacScreen() {
  const { data, setData, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchItAdminDashboard
  );
  const sheetRef = useRef<BottomSheetModal>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleProvision = () => {
    if (!name.trim() || !email.trim() || !data) return;
    void triggerHaptic('success');
    setData({
      ...data,
      users: [
        {
          id: `U-${Date.now()}`,
          fullName: name.trim(),
          email: email.trim().toLowerCase(),
          role: 'employee',
          mfaEnabled: true,
          status: 'Active',
        },
        ...data.users,
      ],
    });
    setName('');
    setEmail('');
    sheetRef.current?.dismiss();
  };

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader roleBadge="RBAC" onOpenQuickActions={() => sheetRef.current?.present()} />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <PrimaryButton
          title="Provision SSO & 2FA Account"
          icon={<UserPlus size={16} color="#FFFFFF" />}
          onPress={() => sheetRef.current?.present()}
        />

        {data?.users.map((u) => (
          <NativeCard key={u.id}>
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-sm font-bold text-slate-900">{u.fullName}</Text>
                <Text className="text-xs text-slate-500">{u.email}</Text>
                <Text className="text-[11px] text-slate-400 mt-1">
                  Role: {u.role} · MFA {u.mfaEnabled ? 'Enforced' : 'Pending'}
                </Text>
              </View>
              <StatusPill
                label={u.status}
                tone={u.status === 'Active' ? 'emerald' : 'amber'}
              />
            </View>
          </NativeCard>
        ))}
      </ScrollView>

      <NativeBottomSheet sheetRef={sheetRef} title="Provision Employee Access">
        <View className="gap-3">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Full Name"
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900"
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            placeholder="work.email@ofc360.com"
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900"
          />
          <PrimaryButton title="Create Account & Enforce 2FA" onPress={handleProvision} />
        </View>
      </NativeBottomSheet>
    </View>
  );
}
