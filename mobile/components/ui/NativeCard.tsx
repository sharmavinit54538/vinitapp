import React from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { triggerHaptic } from '@/services/nativeModules';

export function NativeCard({
  children,
  className = '',
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}) {
  return (
    <View
      className={`bg-white rounded-2xl border border-slate-200 p-4 shadow-sm ${className}`}
      style={style}
    >
      {children}
    </View>
  );
}

export function KpiTile({
  label,
  value,
  subtext,
  linkText,
  accent = 'indigo',
  icon,
  onPress,
}: {
  label: string;
  value: string;
  subtext: string;
  linkText?: string;
  accent?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky';
  icon?: React.ReactNode;
  onPress?: () => void;
}) {
  const valueColors: Record<NonNullable<typeof accent>, string> = {
    indigo: 'text-slate-900',
    emerald: 'text-emerald-600',
    amber: 'text-amber-600',
    rose: 'text-rose-600',
    sky: 'text-sky-600',
  };

  return (
    <Pressable
      onPress={() => {
        if (onPress) {
          void triggerHaptic('light');
          onPress();
        }
      }}
      className="flex-1 min-w-[47%] bg-white rounded-2xl border border-slate-200 p-4 active:opacity-80"
    >
      <View className="flex-row items-center justify-between mb-1.5">
        <Text className="text-xs font-semibold text-slate-500 flex-1" numberOfLines={1}>
          {label}
        </Text>
        {icon}
      </View>
      <Text className={`text-2xl font-extrabold tracking-tight ${valueColors[accent]}`}>
        {value}
      </Text>
      <Text className="text-[11px] font-medium text-slate-500 mt-0.5" numberOfLines={1}>
        {subtext}
      </Text>
      {linkText ? (
        <View className="flex-row items-center mt-2">
          <Text className="text-xs font-semibold text-indigo-600 mr-0.5">{linkText}</Text>
          <ChevronRight size={13} color="#4F46E5" />
        </View>
      ) : null}
    </Pressable>
  );
}

export function StatusPill({
  label,
  tone = 'indigo',
}: {
  label: string;
  tone?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'sky' | 'slate';
}) {
  const toneClasses: Record<NonNullable<typeof tone>, { bg: string; text: string }> = {
    emerald: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700' },
    amber: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
    rose: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
    indigo: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700' },
    sky: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700' },
    slate: { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-700' },
  };
  const cls = toneClasses[tone];
  return (
    <View className={`px-2.5 py-1 rounded-lg border self-start ${cls.bg}`}>
      <Text className={`text-[11px] font-bold ${cls.text}`}>{label}</Text>
    </View>
  );
}

export function PrimaryButton({
  title,
  onPress,
  tone = 'indigo',
  icon,
  disabled,
}: {
  title: string;
  onPress: () => void;
  tone?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'slate';
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  const bgMap: Record<NonNullable<typeof tone>, string> = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
    rose: 'bg-rose-600',
    slate: 'bg-slate-900',
  };

  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        void triggerHaptic('medium');
        onPress();
      }}
      className={`min-h-[46px] rounded-xl px-4 flex-row items-center justify-center gap-2 ${
        disabled ? 'bg-slate-300' : bgMap[tone]
      } active:opacity-85`}
    >
      {icon}
      <Text className="text-sm font-bold text-white">{title}</Text>
    </Pressable>
  );
}

export function SectionHeader({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between mb-3">
      <Text className="text-base font-bold text-slate-900 tracking-tight">{title}</Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction}>
          <Text className="text-xs font-semibold text-indigo-600">{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
