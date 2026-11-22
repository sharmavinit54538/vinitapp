import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Lock, Mail, ShieldCheck } from 'lucide-react-native';
import { z } from 'zod';
import { getRoleHomeRoute, useAuth } from '@/context/AuthContext';
import { PrimaryButton } from '@/components/ui/NativeCard';
import { triggerHaptic } from '@/services/nativeModules';

const loginSchema = z.object({
  email: z.string().email('Enter a valid work email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const ROLE_PRESETS: { label: string; email: string }[] = [
  { label: 'HR Admin', email: 'hr@ofc360.com' },
  { label: 'Employee', email: 'employee@ofc360.com' },
  { label: 'Manager', email: 'manager@ofc360.com' },
  { label: 'IT Admin', email: 'it-admin@ofc360.com' },
  { label: 'Executive', email: 'executive@ofc360.com' },
];

export default function NativeLoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('employee@ofc360.com');
  const [password, setPassword] = useState('OFC360@2026');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const parsed = loginSchema.safeParse({ email: email.trim(), password });
    if (!parsed.success) {
      await triggerHaptic('error');
      setErrorMsg(parsed.error.issues[0]?.message || 'Check your credentials.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);
    try {
      const session = await signIn(parsed.data.email, parsed.data.password);
      router.replace(getRoleHomeRoute(session.user.role));
    } catch (err) {
      await triggerHaptic('error');
      setErrorMsg(err instanceof Error ? err.message : 'Sign-in failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm gap-5">
            <View className="items-center gap-2">
              <View className="w-14 h-14 rounded-2xl bg-indigo-600 items-center justify-center">
                <ShieldCheck size={28} color="#FFFFFF" />
              </View>
              <Text className="text-2xl font-extrabold text-slate-900">Sign in to OFC360</Text>
              <Text className="text-xs text-slate-500 text-center">
                Tokens encrypted on device via Expo SecureStore
              </Text>
            </View>

            {errorMsg ? (
              <View className="bg-rose-50 border border-rose-200 rounded-xl p-3">
                <Text className="text-xs font-semibold text-rose-700">{errorMsg}</Text>
              </View>
            ) : null}

            <View className="gap-3">
              <View>
                <Text className="text-xs font-bold text-slate-700 mb-1.5">Work Email</Text>
                <View className="flex-row items-center h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 gap-2">
                  <Mail size={16} color="#64748B" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    placeholder="name@ofc360.com"
                    className="flex-1 text-sm font-medium text-slate-900"
                  />
                </View>
              </View>

              <View>
                <Text className="text-xs font-bold text-slate-700 mb-1.5">Password</Text>
                <View className="flex-row items-center h-12 rounded-xl border border-slate-200 bg-slate-50 px-3 gap-2">
                  <Lock size={16} color="#64748B" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholder="••••••••"
                    className="flex-1 text-sm font-medium text-slate-900"
                  />
                </View>
              </View>
            </View>

            <PrimaryButton
              title={isLoading ? 'Signing In...' : 'Sign In'}
              disabled={isLoading}
              onPress={() => void handleLogin()}
            />

            <View className="pt-3 border-t border-slate-100 gap-2">
              <Text className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Quick Role Demo Switcher
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {ROLE_PRESETS.map((preset) => {
                  const selected = email.toLowerCase() === preset.email;
                  return (
                    <Pressable
                      key={preset.label}
                      onPress={() => {
                        void triggerHaptic('light');
                        setEmail(preset.email);
                        setPassword('OFC360@2026');
                      }}
                      className={`px-3 py-2 rounded-xl border ${
                        selected
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-bold ${
                          selected ? 'text-white' : 'text-slate-700'
                        }`}
                      >
                        {preset.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
