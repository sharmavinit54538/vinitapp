import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { NativeHeader } from '@/components/ui/NativeHeader';
import { NativeCard, PrimaryButton } from '@/components/ui/NativeCard';
import { useAuth } from '@/context/AuthContext';

export default function ManagerMoreScreen() {
  const router = useRouter();
  const { session, signOut } = useAuth();

  return (
    <View className="flex-1 bg-slate-50">
      <NativeHeader roleBadge="MORE" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <NativeCard>
          <Text className="text-base font-bold text-slate-900">{session?.user.fullName}</Text>
          <Text className="text-xs text-slate-500 mt-0.5">
            {session?.user.designation} · {session?.user.department}
          </Text>
          <Text className="text-xs text-slate-400 mt-1">{session?.user.email}</Text>
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
    </View>
  );
}
