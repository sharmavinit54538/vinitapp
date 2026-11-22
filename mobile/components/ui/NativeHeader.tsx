import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, LogOut, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { triggerHaptic } from '@/services/nativeModules';

export function NativeHeader({
  roleBadge,
  onOpenQuickActions,
  onOpenNotifications,
}: {
  roleBadge: string;
  onOpenQuickActions?: () => void;
  onOpenNotifications?: () => void;
}) {
  const router = useRouter();
  const { unreadCount, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView edges={['top']} className="bg-white border-b border-slate-200">
      <View className="h-14 px-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2.5">
          <Text className="text-xl font-extrabold text-slate-900 tracking-tight">OFC360</Text>
          <View className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-200">
            <Text className="text-[11px] font-bold text-indigo-700">{roleBadge}</Text>
          </View>
        </View>

        <View className="flex-row items-center gap-1">
          {onOpenQuickActions ? (
            <Pressable
              onPress={() => {
                void triggerHaptic('light');
                onOpenQuickActions();
              }}
              className="w-10 h-10 rounded-xl items-center justify-center active:bg-slate-100"
            >
              <Plus size={20} color="#0F172A" />
            </Pressable>
          ) : null}

          {onOpenNotifications ? (
            <Pressable
              onPress={() => {
                void triggerHaptic('light');
                onOpenNotifications();
              }}
              className="w-10 h-10 rounded-xl items-center justify-center active:bg-slate-100"
            >
              <View>
                <Bell size={19} color="#0F172A" />
                {unreadCount > 0 ? (
                  <View className="w-2 h-2 rounded-full bg-rose-500 absolute -top-0.5 -right-0.5" />
                ) : null}
              </View>
            </Pressable>
          ) : null}

          <Pressable
            onPress={handleLogout}
            className="w-10 h-10 rounded-xl items-center justify-center active:bg-rose-50"
          >
            <LogOut size={18} color="#E11D48" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
