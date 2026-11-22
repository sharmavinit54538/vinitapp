import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  const opacity = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.9,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.45,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={{ opacity }}
      className="bg-white rounded-2xl border border-slate-200 p-4 gap-3"
    >
      <View className="h-4 w-2/5 bg-slate-200 rounded-md" />
      {Array.from({ length: lines }).map((_, idx) => (
        <View
          key={idx}
          className={`h-3 bg-slate-100 rounded-md ${idx === lines - 1 ? 'w-3/5' : 'w-full'}`}
        />
      ))}
    </Animated.View>
  );
}

export function DashboardSkeleton() {
  return (
    <View className="p-4 gap-3">
      <View className="flex-row gap-3">
        <View className="flex-1">
          <SkeletonCard lines={2} />
        </View>
        <View className="flex-1">
          <SkeletonCard lines={2} />
        </View>
      </View>
      <SkeletonCard lines={3} />
      <SkeletonCard lines={4} />
    </View>
  );
}
