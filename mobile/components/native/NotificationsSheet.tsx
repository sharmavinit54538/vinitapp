import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Bell, Send } from 'lucide-react-native';
import { NativeBottomSheet } from '@/components/ui/NativeBottomSheet';
import { PrimaryButton, StatusPill } from '@/components/ui/NativeCard';
import { useAuth } from '@/context/AuthContext';
import { sendLocalPushNotification, triggerHaptic } from '@/services/nativeModules';

export function NotificationsSheet({
  sheetRef,
}: {
  sheetRef: React.RefObject<BottomSheetModal | null>;
}) {
  const { notifications, unreadCount, markAllNotificationsRead } = useAuth();

  return (
    <NativeBottomSheet
      sheetRef={sheetRef}
      title={`Push Notifications (${notifications.length})`}
      subtitle={`${unreadCount} unread mobile alerts via expo-notifications`}
      snapPoints={['65%']}
    >
      <View className="gap-3">
        {unreadCount > 0 ? (
          <Pressable
            onPress={() => {
              void triggerHaptic('light');
              markAllNotificationsRead();
            }}
            className="self-end"
          >
            <Text className="text-xs font-bold text-indigo-600">Mark all read</Text>
          </Pressable>
        ) : null}

        {notifications.map((item) => (
          <View
            key={item.id}
            className={`rounded-2xl border p-3.5 gap-1 ${
              item.read ? 'bg-slate-50 border-slate-200' : 'bg-indigo-50/70 border-indigo-200'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2 flex-1">
                <Bell size={14} color={item.read ? '#64748B' : '#4F46E5'} />
                <Text className="text-xs font-bold text-slate-900 flex-1">{item.title}</Text>
              </View>
              <StatusPill label={item.category} tone={item.read ? 'slate' : 'indigo'} />
            </View>
            <Text className="text-xs text-slate-600">{item.body}</Text>
            <Text className="text-[10px] text-slate-400 mt-0.5">{item.timestamp}</Text>
          </View>
        ))}

        <PrimaryButton
          title="Send Test Native Push Alert"
          tone="slate"
          icon={<Send size={15} color="#FFFFFF" />}
          onPress={() => {
            void sendLocalPushNotification(
              'OFC360 Live Alert',
              'Native push notification channel is active and verified.'
            );
          }}
        />
      </View>
    </NativeBottomSheet>
  );
}
