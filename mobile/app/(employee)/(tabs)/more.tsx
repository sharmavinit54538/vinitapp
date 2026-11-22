import React, { useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Laptop, LifeBuoy } from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, PrimaryButton, SectionHeader, StatusPill } from '@/components/ui/NativeCard';
import { NativeBottomSheet } from '@/components/ui/NativeBottomSheet';
import { useAuth } from '@/context/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import { triggerHaptic } from '@/services/nativeModules';

export default function EmployeeMoreScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const { data, setData, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchEmployeeDashboard
  );
  const ticketSheetRef = useRef<BottomSheetModal>(null);
  const [subject, setSubject] = useState('');

  const handleRaiseTicket = () => {
    if (!subject.trim() || !data) return;
    void triggerHaptic('success');
    setData({
      ...data,
      tickets: [
        {
          id: `HD-${Math.floor(500 + Math.random() * 400)}`,
          subject: subject.trim(),
          category: 'IT Support',
          status: 'Open',
        },
        ...data.tickets,
      ],
    });
    setSubject('');
    ticketSheetRef.current?.dismiss();
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
          <Text className="text-base font-bold text-slate-900">{session?.user.fullName}</Text>
          <Text className="text-xs text-slate-500 mt-0.5">
            {session?.user.designation} · {session?.user.location}
          </Text>
        </NativeCard>

        <NativeCard>
          <SectionHeader title="Assigned Company Assets" />
          {data?.assignedAssets.map((a, idx) => (
            <View
              key={a.id}
              className={`py-2.5 flex-row items-center justify-between ${
                idx > 0 ? 'border-t border-slate-100' : ''
              }`}
            >
              <View className="flex-row items-center gap-2.5">
                <Laptop size={16} color="#4F46E5" />
                <View>
                  <Text className="text-xs font-bold text-slate-900">{a.name}</Text>
                  <Text className="text-[11px] text-slate-500">{a.assetTag}</Text>
                </View>
              </View>
              <StatusPill label={a.status} tone="emerald" />
            </View>
          ))}
        </NativeCard>

        <NativeCard>
          <SectionHeader
            title="Helpdesk Tickets"
            actionLabel="Raise Ticket"
            onAction={() => ticketSheetRef.current?.present()}
          />
          {data?.tickets.map((t, idx) => (
            <View
              key={t.id}
              className={`py-2.5 flex-row items-center justify-between ${
                idx > 0 ? 'border-t border-slate-100' : ''
              }`}
            >
              <View className="flex-row items-center gap-2.5 flex-1">
                <LifeBuoy size={16} color="#D97706" />
                <View className="flex-1">
                  <Text className="text-xs font-bold text-slate-900">{t.subject}</Text>
                  <Text className="text-[11px] text-slate-500">
                    {t.id} · {t.category}
                  </Text>
                </View>
              </View>
              <StatusPill label={t.status} tone="amber" />
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

      <NativeBottomSheet sheetRef={ticketSheetRef} title="Raise Helpdesk Ticket">
        <View className="gap-3">
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="Describe your IT or HR issue..."
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900"
          />
          <PrimaryButton title="Submit Ticket" onPress={handleRaiseTicket} />
        </View>
      </NativeBottomSheet>
    </View>
  );
}
