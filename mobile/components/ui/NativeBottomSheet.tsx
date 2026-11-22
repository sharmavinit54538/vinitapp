import React, { useCallback } from 'react';
import { Text, View } from 'react-native';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';

interface NativeBottomSheetProps {
  sheetRef: React.RefObject<BottomSheetModal | null>;
  title: string;
  subtitle?: string;
  snapPoints?: (string | number)[];
  children: React.ReactNode;
}

export function NativeBottomSheet({
  sheetRef,
  title,
  subtitle,
  snapPoints = ['62%', '88%'],
  children,
}: NativeBottomSheetProps) {
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.45}
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: '#FFFFFF', borderRadius: 24 }}
      handleIndicatorStyle={{ backgroundColor: '#CBD5E1', width: 42, height: 5 }}
    >
      <BottomSheetScrollView contentContainerStyle={{ padding: 20, paddingBottom: 36 }}>
        <View className="mb-4">
          <Text className="text-lg font-extrabold text-slate-900">{title}</Text>
          {subtitle ? (
            <Text className="text-xs text-slate-500 mt-0.5">{subtitle}</Text>
          ) : null}
        </View>
        {children}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}
