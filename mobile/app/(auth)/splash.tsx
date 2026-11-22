import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { getRoleHomeRoute, useAuth } from '@/context/AuthContext';

export default function NativeSplashScreen() {
  const router = useRouter();
  const { session, isHydrating } = useAuth();
  const scale = useRef(new Animated.Value(0.88)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  useEffect(() => {
    if (isHydrating) return;
    const timer = setTimeout(() => {
      if (session) {
        router.replace(getRoleHomeRoute(session.user.role));
      } else {
        router.replace('/(auth)/login');
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [isHydrating, router, session]);

  return (
    <View className="flex-1 bg-indigo-600 items-center justify-center px-8">
      <Animated.View
        style={{ transform: [{ scale }], opacity }}
        className="items-center gap-3"
      >
        <View className="w-20 h-20 rounded-3xl bg-white/15 border border-white/25 items-center justify-center">
          <ShieldCheck size={40} color="#FFFFFF" />
        </View>
        <Text className="text-4xl font-extrabold text-white tracking-tight">OFC360</Text>
        <Text className="text-xs font-semibold text-indigo-100 uppercase tracking-widest">
          Enterprise HRMS Native Mobile
        </Text>
      </Animated.View>
    </View>
  );
}
