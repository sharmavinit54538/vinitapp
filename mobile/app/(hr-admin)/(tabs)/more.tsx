import React, { useRef, useState } from 'react';
import { RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Calendar, Megaphone } from 'lucide-react-native';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, PrimaryButton, SectionHeader, StatusPill } from '@/components/ui/NativeCard';
import { NativeBottomSheet } from '@/components/ui/NativeBottomSheet';
import { useAuth } from '@/context/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { hrmsService } from '@/services/hrmsService';
import { sendLocalPushNotification, triggerHaptic } from '@/services/nativeModules';

export default function HrAdminMoreScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const { data, setData, isRefreshing, onRefresh } = useDashboardData(
    hrmsService.fetchHrAdminDashboard
  );
  const broadcastSheetRef = useRef<BottomSheetModal>(null);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeBody, setNoticeBody] = useState('');

  const handleBroadcast = async () => {
    if (!noticeTitle.trim() || !noticeBody.trim() || !data) return;
    await triggerHaptic('success');
    setData({
      ...data,
      announcements: [
        {
          id: `ANN-${Date.now()}`,
          title: noticeTitle.trim(),
          body: noticeBody.trim(),
          publishedAt: 'Just now',
        },
        ...data.announcements,
      ],
    });
    await sendLocalPushNotification(noticeTitle.trim(), noticeBody.trim());
    setNoticeTitle('');
    setNoticeBody('');
    broadcastSheetRef.current?.dismiss();
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
            {session?.user.designation} · {session?.user.employeeCode}
          </Text>
          <View className="mt-3">
            <PrimaryButton
              title="Broadcast Notice via Push"
              icon={<Megaphone size={16} color="#FFFFFF" />}
              onPress={() => broadcastSheetRef.current?.present()}
            />
          </View>
        </NativeCard>

        <NativeCard>
          <SectionHeader title="2026 Holiday Calendar" />
          {data?.holidays.map((h, idx) => (
            <View
              key={h.id}
              className={`py-2.5 flex-row items-center justify-between ${
                idx > 0 ? 'border-t border-slate-100' : ''
              }`}
            >
              <View className="flex-row items-center gap-2.5">
                <Calendar size={15} color="#4F46E5" />
                <View>
                  <Text className="text-xs font-bold text-slate-900">{h.name}</Text>
                  <Text className="text-[11px] text-slate-500">
                    {h.date} · {h.day}
                  </Text>
                </View>
              </View>
              <StatusPill label={h.type} tone="sky" />
            </View>
          ))}
        </NativeCard>

        <PrimaryButton
          title="Sign Out of OFC360"
          tone="rose"
          onPress={async () => {
            await signOut();
            router.replace('/(auth)/login');
          }}
        />
      </ScrollView>

      <NativeBottomSheet
        sheetRef={broadcastSheetRef}
        title="Broadcast Company Notice"
        subtitle="Triggers instant native push alert to OFC360 devices"
      >
        <View className="gap-3">
          <TextInput
            value={noticeTitle}
            onChangeText={setNoticeTitle}
            placeholder="Headline (e.g. Town Hall at 4 PM)"
            className="h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900"
          />
          <TextInput
            value={noticeBody}
            onChangeText={setNoticeBody}
            multiline
            placeholder="Announcement message..."
            className="h-24 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900"
          />
          <PrimaryButton title="Publish & Push Alert" onPress={() => void handleBroadcast()} />
        </View>
      </NativeBottomSheet>
    </View>
  );
}
